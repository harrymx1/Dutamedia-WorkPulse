import { Injectable, Logger } from '@nestjs/common';
import {
  CommitmentOutcome,
  Continuation,
  CorrectionClassification,
  CorrectionStatus,
  DailyStatus,
  PolicyCategory,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { PolicyService } from '../../policy/policy.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import { NotificationService } from '../../notification/notification.service.js';
import { computeWorstOfStatus } from '../../daily-accountability/services/daily-accountability.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import type { CreateCorrectionRequestDto } from '../dto/create-correction-request.dto.js';
import type { ObjectCorrectionRequestDto } from '../dto/object-correction-request.dto.js';
import type { QueryCorrectionRequestsDto } from '../dto/query-correction-requests.dto.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';

const MORNING_FIELDS = [
  'text',
  'referenceLink',
  'initialRisk',
  'knownBlockerNote',
  'supportNeeded',
];

const EOD_FIELDS = [
  'outcome',
  'outcomeReason',
  'continuation',
  'continuationReason',
];

@Injectable()
export class CorrectionRequestService {
  private readonly logger = new Logger(CorrectionRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly policyService: PolicyService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * EPIC-09-T1: Pengajuan Correction Request oleh Employee (SAD §9.6, §10.5, FR-43, FR-44).
   * Menangani klasifikasi otomatis Minor (langsung Applied) atau Material (masuk Objection Window).
   */
  async createCorrectionRequest(
    user: CurrentUserPayload,
    dto: CreateCorrectionRequestDto,
  ) {
    const now = new Date();

    // 1. Validasi keberadaan target commitment dan kepemilikan oleh pengguna
    const commitment = await this.prisma.commitment.findUnique({
      where: { id: dto.targetCommitmentId },
      include: { dailyRecord: true },
    });

    if (!commitment) {
      throw new NotFoundException('Target komitmen tidak ditemukan di sistem');
    }

    if (commitment.dailyRecord.employeeUserId !== user.userId) {
      throw new ForbiddenException(
        'Anda hanya dapat mengajukan koreksi untuk komitmen milik Anda sendiri (SAD §10.5)',
      );
    }

    // 2. Validasi status kunci (Lock State Machine, SAD §9.6, §9.8)
    const changedFields = Object.keys(dto.requestedChange);
    if (changedFields.length === 0) {
      throw new BusinessRuleViolationException(
        'Perubahan yang diminta (requestedChange) tidak boleh kosong',
      );
    }

    const hasMorningChanges = changedFields.some((f) =>
      MORNING_FIELDS.includes(f),
    );
    const hasEodChanges = changedFields.some((f) => EOD_FIELDS.includes(f));

    if (hasMorningChanges && !commitment.isMorningLocked) {
      throw new ConflictException(
        'Field Morning belum terkunci, perubahan dapat dilakukan langsung tanpa pengajuan koreksi (SAD §9.6)',
      );
    }

    if (hasEodChanges && !commitment.isEodLocked) {
      throw new ConflictException(
        'Field EOD belum terkunci, perubahan dapat dilakukan saat EOD Check-in (SAD §9.6)',
      );
    }

    // 3. Cek apakah sudah ada pengajuan koreksi yang masih berstatus Pending untuk komitmen ini
    const existingPending = await this.prisma.correctionRequest.findFirst({
      where: {
        targetCommitmentId: commitment.id,
        status: CorrectionStatus.Pending,
      },
    });

    if (existingPending) {
      throw new ConflictException(
        'Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini',
      );
    }

    // 4. Bangun data hasil gabungan (merged data) dan evaluasi validasi kondisional (FR-04, FR-09, SAD §9.6)
    const mergedData = {
      text:
        dto.requestedChange.text !== undefined
          ? dto.requestedChange.text
          : commitment.text,
      referenceLink:
        dto.requestedChange.referenceLink !== undefined
          ? dto.requestedChange.referenceLink
          : commitment.referenceLink,
      initialRisk:
        dto.requestedChange.initialRisk !== undefined
          ? (dto.requestedChange.initialRisk as DailyStatus)
          : commitment.initialRisk,
      knownBlockerNote:
        dto.requestedChange.knownBlockerNote !== undefined
          ? dto.requestedChange.knownBlockerNote
          : commitment.knownBlockerNote,
      supportNeeded:
        dto.requestedChange.supportNeeded !== undefined
          ? dto.requestedChange.supportNeeded
          : commitment.supportNeeded,
      outcome:
        dto.requestedChange.outcome !== undefined
          ? (dto.requestedChange.outcome as CommitmentOutcome)
          : commitment.outcome,
      outcomeReason:
        dto.requestedChange.outcomeReason !== undefined
          ? dto.requestedChange.outcomeReason
          : commitment.outcomeReason,
      continuation:
        dto.requestedChange.continuation !== undefined
          ? (dto.requestedChange.continuation as Continuation)
          : commitment.continuation,
      continuationReason:
        dto.requestedChange.continuationReason !== undefined
          ? dto.requestedChange.continuationReason
          : commitment.continuationReason,
    };

    this.validateConditionalRules(mergedData);

    // 5. Ambil snapshot kebijakan aktif untuk MinorMaterialThreshold dan ObjectionWindowDuration
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [
        PolicyCategory.MinorMaterialThreshold,
        PolicyCategory.ObjectionWindowDuration,
      ],
      now,
    );

    // 6. Tentukan klasifikasi: Minor vs Material (SAD §9.6)
    const classification = this.determineClassification(
      commitment,
      dto.requestedChange,
      policySnapshot,
    );

    // 7. Proses berdasarkan klasifikasi
    if (classification === CorrectionClassification.Minor) {
      // JALUR MINOR (EPIC-09-T2): Langsung Applied dalam satu transaksi
      return this.applyMinorCorrection(
        user,
        commitment,
        dto,
        mergedData,
        policySnapshot,
        now,
      );
    }

    // JALUR MATERIAL (EPIC-09-T3): Status Pending, buka Objection Window
    return this.createMaterialCorrection(
      user,
      commitment,
      dto,
      policySnapshot,
      now,
    );
  }

  /**
   * EPIC-09-T2: Penerapan langsung koreksi minor beserta AuditLog (SAD §9.6).
   */
  private async applyMinorCorrection(
    user: CurrentUserPayload,
    commitment: any,
    dto: CreateCorrectionRequestDto,
    mergedData: any,
    policySnapshot: any,
    now: Date,
  ) {
    const isRiskChanged =
      dto.requestedChange.initialRisk &&
      dto.requestedChange.initialRisk !== commitment.initialRisk;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update data target commitment
      const updatedCommitment = await tx.commitment.update({
        where: { id: commitment.id },
        data: {
          text: mergedData.text,
          referenceLink: mergedData.referenceLink,
          initialRisk: mergedData.initialRisk,
          knownBlockerNote: mergedData.knownBlockerNote,
          supportNeeded: mergedData.supportNeeded,
          outcome: mergedData.outcome,
          outcomeReason: mergedData.outcomeReason,
          continuation: mergedData.continuation,
          continuationReason: mergedData.continuationReason,
        },
      });

      // 2. EPIC-09-T5: Hitung ulang initialStatus jika initialRisk berubah
      if (isRiskChanged) {
        await this.recomputeInitialStatus(
          tx,
          commitment.dailyRecordId,
          commitment.id,
          mergedData.initialRisk,
        );
      }

      // 3. Simpan CorrectionRequest dengan status Applied
      const correction = await tx.correctionRequest.create({
        data: {
          targetCommitmentId: commitment.id,
          requestedByUserId: user.userId,
          requestedChange: dto.requestedChange,
          reason: dto.reason.trim(),
          classification: CorrectionClassification.Minor,
          policySnapshot,
          status: CorrectionStatus.Applied,
          appliedAt: now,
        },
        include: {
          targetCommitment: true,
          requestedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      // 4. Catat AuditLog
      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'CORRECTION_APPLIED',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: correction.id,
          valueBefore: commitment,
          valueAfter: updatedCommitment,
        },
        tx,
      );

      return correction;
    });

    // 5. Notifikasi trigger #11 ke pengguna pengaju (WebNotificationCenter)
    try {
      await this.notificationService.dispatch({
        triggerType: 'CORRECTION_APPLIED',
        recipientUserId: user.userId,
        relatedEntityType: 'CorrectionRequest',
        relatedEntityId: result.id,
        payload: {
          title: 'Koreksi Komitmen Diterapkan',
          body: `Perubahan komitmen Anda telah diterapkan langsung sebagai koreksi minor.`,
          linkPath: `/history`,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Gagal mengirim notifikasi CORRECTION_APPLIED: ${err.message}`);
    }

    this.logger.log(
      `Koreksi Minor ${result.id} langsung diterapkan untuk komitmen ${commitment.id} oleh ${user.userId}`,
    );

    return {
      ...result,
      availableActions: [],
    };
  }

  /**
   * EPIC-09-T3: Pembuatan koreksi material dengan status Pending & Objection Window (SAD §9.6).
   */
  private async createMaterialCorrection(
    user: CurrentUserPayload,
    commitment: any,
    dto: CreateCorrectionRequestDto,
    policySnapshot: any,
    now: Date,
  ) {
    const durationHours =
      policySnapshot[PolicyCategory.ObjectionWindowDuration]?.durationHours ??
      24;
    const objectionWindowStart = now;
    const objectionWindowEnd = new Date(
      now.getTime() + durationHours * 60 * 60 * 1000,
    );

    const correction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.correctionRequest.create({
        data: {
          targetCommitmentId: commitment.id,
          requestedByUserId: user.userId,
          requestedChange: dto.requestedChange,
          reason: dto.reason.trim(),
          classification: CorrectionClassification.Material,
          policySnapshot,
          status: CorrectionStatus.Pending,
          objectionWindowStart,
          objectionWindowEnd,
        },
        include: {
          targetCommitment: true,
          requestedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'CORRECTION_REQUESTED',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: created.id,
          valueAfter: {
            id: created.id,
            targetCommitmentId: commitment.id,
            requestedChange: dto.requestedChange,
            reason: dto.reason.trim(),
            classification: CorrectionClassification.Material,
            objectionWindowStart,
            objectionWindowEnd,
          },
        },
        tx,
      );

      return created;
    });

    // Notifikasi trigger #9 ke Authorized Reviewer (SAD §12.1 trigger #9)
    try {
      const orgAssignment =
        await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: user.userId,
            effectiveDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
          orderBy: { effectiveDate: 'desc' },
        });

      const reviewerUserId = orgAssignment?.directManagerId;
      if (reviewerUserId) {
        await this.notificationService.dispatch({
          triggerType: 'CORRECTION_MATERIAL_REQUESTED',
          recipientUserId: reviewerUserId,
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: correction.id,
          payload: {
            title: 'Pengajuan Koreksi Material Memerlukan Tinjauan',
            body: `${user.email} mengajukan koreksi material pada komitmen hariannya. Objection window berakhir pada ${objectionWindowEnd.toLocaleString('id-ID')}.`,
            linkPath: `/team/correction-requests/${correction.id}`,
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(
        `Gagal mengirim notifikasi CORRECTION_MATERIAL_REQUESTED: ${err.message}`,
      );
    }

    this.logger.log(
      `Koreksi Material ${correction.id} diajukan oleh ${user.userId} (Pending sampai ${objectionWindowEnd.toISOString()})`,
    );

    return {
      ...correction,
      availableActions: [],
    };
  }

  /**
   * EPIC-09-T4: Keberatan oleh Reviewer terhadap Koreksi Material (SAD §9.6, §9.9 #1, §10.5).
   * Menggunakan SELECT FOR UPDATE untuk mencegah race condition dengan auto-apply scheduler.
   */
  async objectCorrection(
    user: CurrentUserPayload,
    id: string,
    dto: ObjectCorrectionRequestDto,
  ) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. Pessimistic lock row via raw SQL (SAD §9.9 #1)
      const lockedRows: any[] = await tx.$queryRaw`
        SELECT id, status, objection_window_end, requested_by_user_id
        FROM correction_requests
        WHERE id = ${id}::uuid
        FOR UPDATE;
      `;

      if (!lockedRows || lockedRows.length === 0) {
        throw new NotFoundException('Pengajuan koreksi tidak ditemukan');
      }

      const cr = lockedRows[0];

      // 2. Cek status harus masih Pending
      if (cr.status !== CorrectionStatus.Pending) {
        throw new ConflictException(
          'Pengajuan koreksi sudah tidak dalam status Pending (SAD §9.9 #1)',
        );
      }

      // 3. Cek objection window belum berakhir
      if (cr.objection_window_end && new Date(cr.objection_window_end) <= now) {
        throw new ConflictException(
          'Objection window telah berakhir, pengajuan koreksi telah atau sedang diterapkan secara otomatis',
        );
      }

      // 4. Pemohon tidak boleh mengajukan keberatan atas pengajuannya sendiri
      if (user.userId === cr.requested_by_user_id) {
        throw new ForbiddenException(
          'Pemohon koreksi tidak dapat mengajukan keberatan atas pengajuannya sendiri',
        );
      }

      // 5. Cek otorisasi reviewer
      const isAuthorized = await this.isAuthorizedReviewer(
        user,
        cr.requested_by_user_id,
        now,
      );

      if (!isAuthorized) {
        throw new ForbiddenException(
          'Anda tidak memiliki wewenang untuk mengajukan keberatan pada pengajuan koreksi ini',
        );
      }

      // 6. Update status menjadi Rejected
      const updated = await tx.correctionRequest.update({
        where: { id },
        data: {
          status: CorrectionStatus.Rejected,
          reviewedByUserId: user.userId,
          objectionReason: dto.objectionReason.trim(),
        },
        include: {
          targetCommitment: true,
          requestedBy: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      // 7. Catat AuditLog
      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'CORRECTION_REJECTED',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: id,
          valueAfter: {
            id,
            status: CorrectionStatus.Rejected,
            reviewedByUserId: user.userId,
            objectionReason: dto.objectionReason.trim(),
          },
        },
        tx,
      );

      // 8. Notifikasi trigger #11 ke pengguna pengaju
      try {
        await this.notificationService.dispatch({
          triggerType: 'CORRECTION_REJECTED',
          recipientUserId: cr.requested_by_user_id,
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: id,
          payload: {
            title: 'Koreksi Komitmen Ditolak',
            body: `Pengajuan koreksi Anda ditolak oleh reviewer. Alasan: ${dto.objectionReason.trim()}`,
            linkPath: `/history`,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Gagal mengirim notifikasi CORRECTION_REJECTED: ${err.message}`);
      }

      this.logger.log(
        `Koreksi ${id} ditolak oleh reviewer ${user.userId}. Alasan: ${dto.objectionReason.trim()}`,
      );

      return {
        ...updated,
        availableActions: [],
      };
    });
  }

  /**
   * EPIC-09-T6: Scheduled Job auto-apply saat objection window berakhir (SAD §9.6, §9.9 #1, §11.2 Job #5).
   * Idempotent dan dilindungi transaksi pesimis SELECT FOR UPDATE.
   */
  async evaluateExpiredObjectionWindows(): Promise<{ processedCount: number }> {
    const now = new Date();

    // 1. Ambil seluruh koreksi Pending yang objectionWindowEnd-nya telah terlewati
    const expiredList = await this.prisma.correctionRequest.findMany({
      where: {
        status: CorrectionStatus.Pending,
        objectionWindowEnd: { lte: now },
      },
      select: { id: true },
    });

    let processedCount = 0;

    for (const item of expiredList) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Kunci baris dengan SELECT FOR UPDATE
          const lockedRows: any[] = await tx.$queryRaw`
            SELECT id, status, target_commitment_id, requested_change, requested_by_user_id
            FROM correction_requests
            WHERE id = ${item.id}::uuid
            FOR UPDATE;
          `;

          if (!lockedRows || lockedRows.length === 0) return;
          const cr = lockedRows[0];

          if (cr.status !== CorrectionStatus.Pending) return;

          const commitment = await tx.commitment.findUnique({
            where: { id: cr.target_commitment_id },
          });
          if (!commitment) return;

          const requestedChange = cr.requested_change as Record<string, any>;
          const isRiskChanged =
            requestedChange.initialRisk &&
            requestedChange.initialRisk !== commitment.initialRisk;

          // Terapkan perubahan pada Commitment
          const updatedCommitment = await tx.commitment.update({
            where: { id: commitment.id },
            data: {
              ...(requestedChange.text !== undefined && { text: requestedChange.text }),
              ...(requestedChange.referenceLink !== undefined && {
                referenceLink: requestedChange.referenceLink,
              }),
              ...(requestedChange.initialRisk !== undefined && {
                initialRisk: requestedChange.initialRisk as DailyStatus,
              }),
              ...(requestedChange.knownBlockerNote !== undefined && {
                knownBlockerNote: requestedChange.knownBlockerNote,
              }),
              ...(requestedChange.supportNeeded !== undefined && {
                supportNeeded: requestedChange.supportNeeded,
              }),
              ...(requestedChange.outcome !== undefined && {
                outcome: requestedChange.outcome as CommitmentOutcome,
              }),
              ...(requestedChange.outcomeReason !== undefined && {
                outcomeReason: requestedChange.outcomeReason,
              }),
              ...(requestedChange.continuation !== undefined && {
                continuation: requestedChange.continuation as Continuation,
              }),
              ...(requestedChange.continuationReason !== undefined && {
                continuationReason: requestedChange.continuationReason,
              }),
            },
          });

          // Recompute initialStatus jika risiko berubah
          if (isRiskChanged) {
            await this.recomputeInitialStatus(
              tx,
              commitment.dailyRecordId,
              commitment.id,
              requestedChange.initialRisk,
            );
          }

          // Update status koreksi menjadi Applied
          await tx.correctionRequest.update({
            where: { id: item.id },
            data: {
              status: CorrectionStatus.Applied,
              appliedAt: now,
            },
          });

          // Catat AuditLog
          await this.auditService.record(
            {
              actorUserId: undefined, // Diterapkan oleh sistem scheduler
              action: 'CORRECTION_AUTO_APPLIED',
              relatedEntityType: 'CorrectionRequest',
              relatedEntityId: item.id,
              valueBefore: commitment,
              valueAfter: updatedCommitment,
            },
            tx,
          );

          // Notifikasi trigger #11 ke pengguna pengaju
          try {
            await this.notificationService.dispatch({
              triggerType: 'CORRECTION_APPLIED',
              recipientUserId: cr.requested_by_user_id,
              relatedEntityType: 'CorrectionRequest',
              relatedEntityId: item.id,
              payload: {
                title: 'Koreksi Komitmen Diterapkan Otomatis',
                body: `Objection window telah berakhir tanpa keberatan. Perubahan komitmen Anda telah resmi diterapkan.`,
                linkPath: `/history`,
              },
            });
          } catch (err: any) {
            this.logger.warn(`Gagal kirim notif auto-applied: ${err.message}`);
          }

          processedCount++;
          this.logger.log(
            `Koreksi ${item.id} otomatis diterapkan oleh scheduler (window berakhir)`,
          );
        });
      } catch (err: any) {
        this.logger.error(
          `Gagal memproses auto-apply untuk koreksi ${item.id}: ${err.message}`,
        );
      }
    }

    return { processedCount };
  }

  /**
   * EPIC-09-T5: Recompute initialStatus pada DailyAccountabilityRecord (SAD §9.6, §9.3).
   */
  private async recomputeInitialStatus(
    tx: Prisma.TransactionClient,
    dailyRecordId: string,
    targetCommitmentId: string,
    newRisk: DailyStatus,
  ) {
    const allCommitments = await tx.commitment.findMany({
      where: { dailyRecordId },
      select: { id: true, initialRisk: true },
    });

    const risks = allCommitments.map((c) =>
      c.id === targetCommitmentId ? newRisk : c.initialRisk,
    );

    const recomputedStatus = computeWorstOfStatus(risks);

    await tx.dailyAccountabilityRecord.update({
      where: { id: dailyRecordId },
      data: { initialStatus: recomputedStatus },
    });

    this.logger.debug(
      `initialStatus dihitung ulang menjadi ${recomputedStatus} untuk DailyRecord ${dailyRecordId}`,
    );
  }

  /**
   * Helper penentuan klasifikasi Minor vs Material (SAD §9.6).
   */
  private determineClassification(
    commitment: any,
    requestedChange: Record<string, any>,
    policySnapshot: any,
  ): CorrectionClassification {
    const thresholdConfig =
      policySnapshot[PolicyCategory.MinorMaterialThreshold] ?? {};

    // Perubahan initialRisk secara default adalah Material (memengaruhi status harian & eskalasi),
    // kecuali dikonfigurasikan sebaliknya dalam policy
    if (
      requestedChange.initialRisk &&
      requestedChange.initialRisk !== commitment.initialRisk
    ) {
      if (thresholdConfig.riskChangeAlwaysMaterial !== false) {
        return CorrectionClassification.Material;
      }
    }

    // Perubahan outcome selalu Material
    if (
      requestedChange.outcome &&
      requestedChange.outcome !== commitment.outcome
    ) {
      return CorrectionClassification.Material;
    }

    // Perubahan continuation selalu Material
    if (
      requestedChange.continuation &&
      requestedChange.continuation !== commitment.continuation
    ) {
      return CorrectionClassification.Material;
    }

    // Perubahan teks komitmen: cek ambang batas kata (wordsChangedThreshold)
    if (requestedChange.text && requestedChange.text !== commitment.text) {
      const threshold =
        policySnapshot[PolicyCategory.MinorMaterialThreshold]
          ?.wordsChangedThreshold ?? 10;
      const oldWords = commitment.text.trim().split(/\s+/);
      const newWords = requestedChange.text.trim().split(/\s+/);

      let diffCount = Math.abs(newWords.length - oldWords.length);
      const minLen = Math.min(oldWords.length, newWords.length);
      for (let i = 0; i < minLen; i++) {
        if (oldWords[i] !== newWords[i]) {
          diffCount++;
        }
      }

      if (diffCount > threshold) {
        return CorrectionClassification.Material;
      }
    }

    return CorrectionClassification.Minor;
  }

  /**
   * Helper evaluasi aturan kondisional FR-04 & FR-09 pada data gabungan.
   */
  private validateConditionalRules(mergedData: any) {
    // Validasi FR-04: AMBER/RED wajib ada knownBlockerNote
    if (
      mergedData.initialRisk === DailyStatus.AMBER ||
      mergedData.initialRisk === DailyStatus.RED
    ) {
      if (
        !mergedData.knownBlockerNote ||
        mergedData.knownBlockerNote.trim() === ''
      ) {
        throw new BusinessRuleViolationException(
          'Catatan blocker (knownBlockerNote) wajib diisi untuk komitmen berstatus AMBER atau RED (FR-04)',
          [{ field: 'knownBlockerNote', reason: 'REQUIRED_FOR_AMBER_RED' }],
        );
      }
    }

    // Validasi FR-09 / SAD §9.5: PartiallyCompleted/NotCompleted + Continue wajib ada continuationReason
    if (
      mergedData.outcome === CommitmentOutcome.PartiallyCompleted ||
      mergedData.outcome === CommitmentOutcome.NotCompleted
    ) {
      if (mergedData.continuation === Continuation.Continue) {
        if (
          !mergedData.continuationReason ||
          mergedData.continuationReason.trim() === ''
        ) {
          throw new BusinessRuleViolationException(
            'Alasan kelanjutan (continuationReason) wajib diisi jika kelanjutan adalah Continue (FR-09)',
            [{ field: 'continuationReason', reason: 'REQUIRED_FOR_CONTINUE' }],
          );
        }
      }
    }

    // Validasi SAD §9.5: Cancelled wajib ada outcomeReason
    if (mergedData.outcome === CommitmentOutcome.Cancelled) {
      if (
        !mergedData.outcomeReason ||
        mergedData.outcomeReason.trim() === ''
      ) {
        throw new BusinessRuleViolationException(
          'Alasan pembatalan (outcomeReason) wajib diisi untuk komitmen yang dibatalkan',
          [{ field: 'outcomeReason', reason: 'REQUIRED_FOR_CANCELLED' }],
        );
      }
    }
  }

  /**
   * GET /api/v1/correction-requests: List dengan Scope Filtering (SAD §8.11, §10.5).
   */
  async findAll(user: CurrentUserPayload, query: QueryCorrectionRequestsDto) {
    const asOfDate = new Date();

    if (user.role === Role.SystemAdmin) {
      throw new ForbiddenException(
        'SystemAdmin tidak memiliki kewenangan mengakses data operasional (SAD §8.11)',
      );
    }

    const where: Prisma.CorrectionRequestWhereInput = {};

    // 1. Scope filtering
    if (user.role === Role.Employee) {
      where.requestedByUserId = user.userId;
    } else if (
      user.role === Role.Supervisor_TL ||
      user.role === Role.Head ||
      user.role === Role.PM
    ) {
      const accessibleUserIds =
        await this.scopeFilterService.getAccessibleUserIds(user, asOfDate);
      if (accessibleUserIds !== null) {
        where.requestedByUserId = { in: accessibleUserIds };
      }
    } else if (
      user.role === Role.HRGA ||
      user.role === Role.CEO_Management
    ) {
      // Company-wide
    }

    // 2. Query filters
    if (query.targetCommitmentId) {
      where.targetCommitmentId = query.targetCommitmentId;
    }
    if (query.requestedByUserId) {
      where.requestedByUserId = query.requestedByUserId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.classification) {
      where.classification = query.classification;
    }

    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const [totalItems, requests] = await Promise.all([
      this.prisma.correctionRequest.count({ where }),
      this.prisma.correctionRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          targetCommitment: true,
          requestedBy: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const itemsWithActions = await Promise.all(
      requests.map(async (req) => {
        const canObject = await this.canObject(user, req, asOfDate);
        return {
          ...req,
          availableActions: canObject ? ['object'] : [],
        };
      }),
    );

    return {
      data: itemsWithActions,
      meta: {
        totalItems,
        totalPages,
        page,
        limit,
      },
    };
  }

  /**
   * GET /api/v1/correction-requests/:id: Detail Koreksi dengan availableActions (SAD §7.12, §10.5).
   */
  async findById(user: CurrentUserPayload, id: string) {
    const asOfDate = new Date();

    if (user.role === Role.SystemAdmin) {
      throw new ForbiddenException(
        'SystemAdmin tidak memiliki kewenangan mengakses data operasional (SAD §8.11)',
      );
    }

    const request = await this.prisma.correctionRequest.findUnique({
      where: { id },
      include: {
        targetCommitment: true,
        requestedBy: { select: { id: true, fullName: true, email: true } },
        reviewedBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Pengajuan koreksi tidak ditemukan');
    }

    // Scope check
    if (user.role === Role.Employee) {
      if (request.requestedByUserId !== user.userId) {
        throw new NotFoundException('Pengajuan koreksi tidak ditemukan');
      }
    } else if (
      user.role === Role.Supervisor_TL ||
      user.role === Role.Head ||
      user.role === Role.PM
    ) {
      const inScope = await this.scopeFilterService.isUserInScope(
        user,
        request.requestedByUserId,
        asOfDate,
      );
      if (!inScope && request.requestedByUserId !== user.userId) {
        throw new NotFoundException('Pengajuan koreksi tidak ditemukan');
      }
    }

    const canObject = await this.canObject(user, request, asOfDate);

    return {
      ...request,
      availableActions: canObject ? ['object'] : [],
    };
  }

  /**
   * Helper verifikasi apakah user berwenang mereview/mengajukan keberatan.
   */
  private async isAuthorizedReviewer(
    user: CurrentUserPayload,
    employeeUserId: string,
    asOfDate: Date,
  ): Promise<boolean> {
    if (user.userId === employeeUserId) {
      return false;
    }

    if (user.role === Role.HRGA || user.role === Role.CEO_Management) {
      return true;
    }

    if (user.role === Role.Supervisor_TL || user.role === Role.Head) {
      return this.scopeFilterService.isUserInScope(user, employeeUserId, asOfDate);
    }

    return false;
  }

  private async canObject(
    user: CurrentUserPayload,
    req: {
      status: CorrectionStatus;
      requestedByUserId: string;
      objectionWindowEnd: Date | null;
    },
    now: Date,
  ): Promise<boolean> {
    if (req.status !== CorrectionStatus.Pending) return false;
    if (req.requestedByUserId === user.userId) return false;
    if (req.objectionWindowEnd && req.objectionWindowEnd <= now) return false;

    return this.isAuthorizedReviewer(user, req.requestedByUserId, now);
  }
}
