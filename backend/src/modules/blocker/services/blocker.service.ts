import { Injectable, Logger } from '@nestjs/common';
import {
  BlockerSeverity,
  BlockerStatus,
  NotificationChannel,
  PolicyCategory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { PolicyService } from '../../policy/policy.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import { NotificationService } from '../../notification/notification.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';
import type { CreateBlockerDto } from '../dto/create-blocker.dto.js';
import type { UpdateBlockerProgressDto } from '../dto/update-blocker-progress.dto.js';
import type { ResolveBlockerDto } from '../dto/resolve-blocker.dto.js';
import type { CreateSupportContributionDto } from '../dto/create-support-contribution.dto.js';
import type { QueryBlockersDto } from '../dto/query-blockers.dto.js';
import { BlockerOwnerResolverService } from './blocker-owner-resolver.service.js';

@Injectable()
export class BlockerService {
  private readonly logger = new Logger(BlockerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly policyService: PolicyService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly notificationService: NotificationService,
    private readonly blockerOwnerResolver: BlockerOwnerResolverService,
  ) {}

  /**
   * Menghitung daftar aksi yang valid untuk Blocker (SAD §7.12, §9.4, §16.7).
   */
  computeAvailableActions(blocker: any, userId: string): string[] {
    const actions: string[] = [];
    if (!blocker) return actions;

    const isOwner = blocker.ownerNeededUserId === userId;
    const isReporter = blocker.raisedByUserId === userId;

    if (blocker.status === BlockerStatus.Open) {
      if (isOwner) {
        actions.push('acknowledge');
      }
    } else if (
      blocker.status === BlockerStatus.Acknowledged ||
      blocker.status === BlockerStatus.InProgress
    ) {
      if (isOwner) {
        actions.push('update', 'resolve', 'accept_risk');
      }
    } else if (
      blocker.status === BlockerStatus.Resolved ||
      blocker.status === BlockerStatus.AcceptedRisk
    ) {
      if (isReporter) {
        actions.push('close');
      }
    }

    // Seluruh pengguna dapat menambahkan kontribusi dukungan (SAD §10.4)
    actions.push('support');

    return actions;
  }

  /**
   * EPIC-08-T1: Raise Blocker (SAD §9.4, §10.4, FR-15–FR-19).
   * Owner diresolusi otomatis via BlockerOwnerResolverService (SAD §8.9).
   */
  async createBlocker(userId: string, dto: CreateBlockerDto) {
    const now = new Date();

    // 1. Resolusi Owner Needed (SAD §8.9, FR-19)
    const resolvedOwner = await this.blockerOwnerResolver.resolveOwnerNeeded(
      userId,
      dto.ownerNeededType,
      dto.relatedScopeReference,
      now,
    );

    // 2. Simpan ke database dalam transaksi + Catat AuditLog
    return this.prisma.$transaction(async (tx) => {
      const blocker = await tx.blocker.create({
        data: {
          raisedByUserId: userId,
          linkedCommitmentId: dto.linkedCommitmentId ?? null,
          type: dto.type,
          severity: dto.severity,
          impact: dto.impact,
          ownerNeededType: resolvedOwner.ownerNeededType,
          ownerNeededUserId: resolvedOwner.ownerNeededUserId,
          relatedScopeReference: resolvedOwner.relatedScopeReference ?? null,
          expectedResolution: dto.expectedResolution
            ? new Date(dto.expectedResolution)
            : null,
          status: BlockerStatus.Open,
        },
        include: {
          raisedBy: { select: { id: true, name: true, email: true } },
          ownerNeeded: { select: { id: true, name: true, email: true } },
        },
      });

      // Audit Log (SAD §15.2)
      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'BLOCKER_RAISED',
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          valueAfter: blocker,
        },
        tx,
      );

      // 3. Notifikasi Real-time jika Critical (SAD §12.1 trigger #4)
      if (dto.severity === BlockerSeverity.Critical) {
        await this.notificationService.dispatch(
          {
            triggerType: 'BLOCKER_CRITICAL_RAISED',
            recipientUserId: resolvedOwner.ownerNeededUserId,
            payload: {
              title: `[CRITICAL] Blocker Baru Diajukan: ${blocker.type}`,
              body: `Blocker tingkat Critical dilaporkan oleh ${blocker.raisedBy.name}: ${blocker.impact}`,
              linkPath: `/blockers/${blocker.id}`,
            },
            relatedEntityType: 'Blocker',
            relatedEntityId: blocker.id,
            channels: [
              NotificationChannel.WebNotificationCenter,
              NotificationChannel.Email,
            ],
          },
          tx,
        );
      }

      this.logger.log(
        `Blocker ${blocker.id} (${blocker.type}, ${blocker.severity}) diajukan oleh ${userId} untuk owner ${resolvedOwner.ownerNeededUserId}`,
      );

      return {
        ...blocker,
        availableActions: this.computeAvailableActions(blocker, userId),
      };
    });
  }

  /**
   * EPIC-08-T2: List Blockers — Scope Filtered (SAD §8.11, §10.4).
   */
  async findAll(user: CurrentUserPayload, query: QueryBlockersDto) {
    const asOfDate = new Date();
    const accessibleUserIds =
      await this.scopeFilterService.getAccessibleUserIds(user, asOfDate);

    const where: Prisma.BlockerWhereInput = {};

    // Scope filter: user dapat melihat blocker jika raisedByUserId atau ownerNeededUserId dalam scope
    if (accessibleUserIds !== null) {
      where.OR = [
        { raisedByUserId: { in: accessibleUserIds } },
        { ownerNeededUserId: { in: accessibleUserIds } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.ownerNeededType) {
      where.ownerNeededType = query.ownerNeededType;
    }

    if (query.raisedByUserId) {
      where.raisedByUserId = query.raisedByUserId;
    }

    if (query.ownerNeededUserId) {
      where.ownerNeededUserId = query.ownerNeededUserId;
    }

    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const [totalItems, blockers] = await Promise.all([
      this.prisma.blocker.count({ where }),
      this.prisma.blocker.findMany({
        where,
        skip,
        take: limit,
        orderBy: { raisedAt: 'desc' },
        include: {
          raisedBy: { select: { id: true, name: true, email: true } },
          ownerNeeded: { select: { id: true, name: true, email: true } },
          contributions: {
            include: {
              supporter: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: blockers.map((b) => ({
        ...b,
        availableActions: this.computeAvailableActions(b, user.userId),
      })),
      meta: {
        totalItems,
        totalPages,
        page,
        limit,
      },
    };
  }

  /**
   * EPIC-08-T2: Detail Blocker — Scope Filtered (SAD §7.12, §10.4).
   * 404 jika di luar scope visibility (SAD §7.7).
   */
  async findById(user: CurrentUserPayload, id: string) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id },
      include: {
        raisedBy: { select: { id: true, name: true, email: true } },
        ownerNeeded: { select: { id: true, name: true, email: true } },
        linkedCommitment: true,
        contributions: {
          include: {
            supporter: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!blocker) {
      throw new NotFoundException(
        'Blocker tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    const isReporterInScope = await this.scopeFilterService.isUserInScope(
      user,
      blocker.raisedByUserId,
    );
    const isOwnerInScope = await this.scopeFilterService.isUserInScope(
      user,
      blocker.ownerNeededUserId,
    );

    if (!isReporterInScope && !isOwnerInScope) {
      throw new NotFoundException(
        'Blocker tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    return {
      ...blocker,
      availableActions: this.computeAvailableActions(blocker, user.userId),
    };
  }

  /**
   * EPIC-08-T3: Acknowledge Blocker (SAD §9.4, §10.4).
   * Aktor: ownerNeededUserId. Open -> Acknowledged.
   */
  async acknowledge(userId: string, blockerId: string) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id: blockerId },
    });

    if (!blocker) {
      throw new NotFoundException('Blocker tidak ditemukan');
    }

    if (blocker.ownerNeededUserId !== userId) {
      throw new ForbiddenException(
        'Hanya Owner Needed yang berwenang melakukan konfirmasi (Acknowledge) pada blocker ini',
      );
    }

    if (blocker.status !== BlockerStatus.Open) {
      throw new ConflictException(
        `Blocker tidak dapat di-acknowledge karena berada dalam status '${blocker.status}' (hanya diizinkan untuk 'Open')`,
      );
    }

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.blocker.update({
        where: { id: blockerId },
        data: {
          status: BlockerStatus.Acknowledged,
          acknowledgedAt: now,
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'BLOCKER_ACKNOWLEDGED',
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          valueBefore: { status: blocker.status },
          valueAfter: { status: updated.status, acknowledgedAt: now },
        },
        tx,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, userId),
      };
    });
  }

  /**
   * EPIC-08-T3: Update Blocker Progress (SAD §9.4, §10.4).
   * Aktor: ownerNeededUserId. Acknowledged/InProgress -> InProgress.
   */
  async updateProgress(
    userId: string,
    blockerId: string,
    dto: UpdateBlockerProgressDto,
  ) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id: blockerId },
    });

    if (!blocker) {
      throw new NotFoundException('Blocker tidak ditemukan');
    }

    if (blocker.ownerNeededUserId !== userId) {
      throw new ForbiddenException(
        'Hanya Owner Needed yang berwenang memperbarui progres blocker ini',
      );
    }

    if (
      blocker.status !== BlockerStatus.Acknowledged &&
      blocker.status !== BlockerStatus.InProgress
    ) {
      throw new ConflictException(
        `Pembaruan progres hanya dapat dilakukan pada blocker berstatus 'Acknowledged' atau 'InProgress' (status saat ini: '${blocker.status}')`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.blocker.update({
        where: { id: blockerId },
        data: {
          status: BlockerStatus.InProgress,
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'BLOCKER_PROGRESS_UPDATED',
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          valueAfter: {
            status: updated.status,
            progressNote: dto.progressNote,
          },
        },
        tx,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, userId),
      };
    });
  }

  /**
   * EPIC-08-T3: Resolve Blocker (SAD §9.4, §10.4).
   * Aktor: ownerNeededUserId. Acknowledged/InProgress -> Resolved. Wajib resolutionNote.
   */
  async resolve(userId: string, blockerId: string, dto: ResolveBlockerDto) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id: blockerId },
    });

    if (!blocker) {
      throw new NotFoundException('Blocker tidak ditemukan');
    }

    if (blocker.ownerNeededUserId !== userId) {
      throw new ForbiddenException(
        'Hanya Owner Needed yang berwenang menyelesaikan (Resolve) blocker ini',
      );
    }

    if (
      blocker.status !== BlockerStatus.Acknowledged &&
      blocker.status !== BlockerStatus.InProgress
    ) {
      throw new ConflictException(
        `Penyelesaian blocker hanya dapat dilakukan pada status 'Acknowledged' atau 'InProgress' (status saat ini: '${blocker.status}')`,
      );
    }

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.blocker.update({
        where: { id: blockerId },
        data: {
          status: BlockerStatus.Resolved,
          resolvedAt: now,
          resolutionNote: dto.resolutionNote,
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'BLOCKER_RESOLVED',
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          valueBefore: { status: blocker.status },
          valueAfter: {
            status: updated.status,
            resolvedAt: now,
            resolutionNote: dto.resolutionNote,
          },
        },
        tx,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, userId),
      };
    });
  }

  /**
   * EPIC-08-T3: Accept Risk Blocker (SAD §9.4, §10.4).
   * Aktor: ownerNeededUserId. Acknowledged/InProgress -> AcceptedRisk. Wajib resolutionNote.
   */
  async acceptRisk(userId: string, blockerId: string, dto: ResolveBlockerDto) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id: blockerId },
    });

    if (!blocker) {
      throw new NotFoundException('Blocker tidak ditemukan');
    }

    if (blocker.ownerNeededUserId !== userId) {
      throw new ForbiddenException(
        'Hanya Owner Needed yang berwenang menerima risiko (Accept Risk) pada blocker ini',
      );
    }

    if (
      blocker.status !== BlockerStatus.Acknowledged &&
      blocker.status !== BlockerStatus.InProgress
    ) {
      throw new ConflictException(
        `Penerimaan risiko hanya dapat dilakukan pada status 'Acknowledged' atau 'InProgress' (status saat ini: '${blocker.status}')`,
      );
    }

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.blocker.update({
        where: { id: blockerId },
        data: {
          status: BlockerStatus.AcceptedRisk,
          resolvedAt: now,
          resolutionNote: dto.resolutionNote,
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'BLOCKER_RISK_ACCEPTED',
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          valueBefore: { status: blocker.status },
          valueAfter: {
            status: updated.status,
            resolvedAt: now,
            resolutionNote: dto.resolutionNote,
          },
        },
        tx,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, userId),
      };
    });
  }

  /**
   * EPIC-08-T3: Close Blocker (SAD §9.4, §10.4).
   * Aktor: raisedByUserId (pelapor). Resolved/AcceptedRisk -> Closed.
   */
  async close(userId: string, blockerId: string) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id: blockerId },
    });

    if (!blocker) {
      throw new NotFoundException('Blocker tidak ditemukan');
    }

    if (blocker.raisedByUserId !== userId) {
      throw new ForbiddenException(
        'Hanya pengguna pelapor (raisedByUserId) yang berwenang menutup (Close) blocker ini',
      );
    }

    if (
      blocker.status !== BlockerStatus.Resolved &&
      blocker.status !== BlockerStatus.AcceptedRisk
    ) {
      throw new ConflictException(
        `Penutupan blocker hanya dapat dilakukan pada status 'Resolved' atau 'AcceptedRisk' (status saat ini: '${blocker.status}')`,
      );
    }

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.blocker.update({
        where: { id: blockerId },
        data: {
          status: BlockerStatus.Closed,
          closedAt: now,
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'BLOCKER_CLOSED',
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          valueBefore: { status: blocker.status },
          valueAfter: { status: updated.status, closedAt: now },
        },
        tx,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, userId),
      };
    });
  }

  /**
   * EPIC-08-T4: Add Support Contribution (SAD §10.4).
   * Terbuka untuk seluruh pengguna. Tidak mengubah status blocker.
   */
  async addSupportContribution(
    userId: string,
    blockerId: string,
    dto: CreateSupportContributionDto,
  ) {
    const blocker = await this.prisma.blocker.findUnique({
      where: { id: blockerId },
    });

    if (!blocker) {
      throw new NotFoundException('Blocker tidak ditemukan');
    }

    return this.prisma.$transaction(async (tx) => {
      const contribution = await tx.supportContribution.create({
        data: {
          blockerId,
          supporterUserId: userId,
          action: dto.action,
          resultNote: dto.resultNote,
        },
        include: {
          supporter: { select: { id: true, name: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'SUPPORT_CONTRIBUTION_ADDED',
          relatedEntityType: 'SupportContribution',
          relatedEntityId: contribution.id,
          valueAfter: contribution,
        },
        tx,
      );

      return contribution;
    });
  }

  /**
   * EPIC-08-T5: Auto-escalation Blocker Critical yang Unacknowledged (SAD §9.4, §9.9 #2, §11).
   * Service method yang dipanggil oleh SchedulerModule (EPIC-15).
   */
  async evaluateAutoEscalation(asOfDate: Date = new Date()) {
    // 1. Ambil policy threshold unacknowledged (SAD §6.4, default 2 jam)
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [PolicyCategory.EscalationThreshold],
      asOfDate,
    );
    const thresholdConfig =
      policySnapshot[PolicyCategory.EscalationThreshold] || {};
    const thresholdHours = thresholdConfig.unacknowledgedThresholdHours || 2;
    const thresholdDate = new Date(
      asOfDate.getTime() - thresholdHours * 60 * 60 * 1000,
    );

    // 2. Query blocker Open, Critical, unacknowledged melewati threshold
    const candidates = await this.prisma.blocker.findMany({
      where: {
        status: BlockerStatus.Open,
        severity: BlockerSeverity.Critical,
        acknowledgedAt: null,
        raisedAt: { lte: thresholdDate },
      },
      include: {
        raisedBy: { select: { id: true, name: true, email: true } },
        ownerNeeded: { select: { id: true, name: true, email: true } },
      },
    });

    let escalatedCount = 0;

    for (const blocker of candidates) {
      // 3. Cek idempotency: apakah blocker ini sudah pernah di-auto-escalate untuk level saat ini?
      const existingEscalation = await this.prisma.auditLog.findFirst({
        where: {
          relatedEntityType: 'Blocker',
          relatedEntityId: blocker.id,
          action: 'BLOCKER_AUTO_ESCALATED',
        },
      });

      if (existingEscalation) {
        continue; // Idempotent: sudah pernah dieskalasi
      }

      // 4. Resolusi target eskalasi level berikutnya (Open Item A4)
      const escalationTarget =
        await this.blockerOwnerResolver.resolveNextEscalationLevel(
          blocker,
          asOfDate,
        );

      // 5. Eksekusi eskalasi dalam transaksi dengan re-check (SAD §9.9 #2)
      await this.prisma.$transaction(async (tx) => {
        // Re-check: pastikan belum di-acknowledge tepat sebelum eskalasi dieksekusi
        const currentBlocker = await tx.blocker.findUnique({
          where: { id: blocker.id },
          select: { acknowledgedAt: true, status: true },
        });

        if (
          !currentBlocker ||
          currentBlocker.acknowledgedAt !== null ||
          currentBlocker.status !== BlockerStatus.Open
        ) {
          return;
        }

        // Catat AuditLog (sebagai bukti & penanda level eskalasi per SAD §9.4)
        await this.auditService.record(
          {
            actorUserId: 'SYSTEM',
            action: 'BLOCKER_AUTO_ESCALATED',
            relatedEntityType: 'Blocker',
            relatedEntityId: blocker.id,
            valueAfter: {
              targetUserId: escalationTarget.targetUserId,
              escalationLevel: escalationTarget.escalationLevel,
              thresholdHours,
              escalatedAt: asOfDate,
            },
          },
          tx,
        );

        // Dispatch Notification ke level eskalasi berikutnya (SAD §12.1 trigger #5)
        await this.notificationService.dispatch(
          {
            triggerType: 'BLOCKER_UNACKNOWLEDGED_THRESHOLD',
            recipientUserId: escalationTarget.targetUserId,
            payload: {
              title: `[AUTO-ESCALATED] Critical Blocker Belum Dikonfirmasi: ${blocker.type}`,
              body: `Blocker Critical dari ${blocker.raisedBy.name} belum di-acknowledge oleh ${blocker.ownerNeeded.name} dalam waktu ${thresholdHours} jam. Eskalasi diteruskan kepada Anda.`,
              linkPath: `/blockers/${blocker.id}`,
            },
            relatedEntityType: 'Blocker',
            relatedEntityId: blocker.id,
            channels: [
              NotificationChannel.WebNotificationCenter,
              NotificationChannel.Email,
            ],
          },
          tx,
        );
      });

      escalatedCount++;
    }

    return {
      evaluatedAt: asOfDate,
      candidatesCount: candidates.length,
      escalatedCount,
    };
  }
}
