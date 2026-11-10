import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  AuthorityContext,
  BlockerStatus,
  CanonicalFunction,
  CanonicalRole,
  NotificationChannel,
  PolicyCategory,
} from '@prisma/client';
import { RaiseBlockerDto, ResolveBlockerDto } from '../dto/raise-blocker.dto';
import { BlockerSlaConfig, CANONICAL_POLICY_FALLBACKS } from '../../policy/policy.constants';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

// Kategori kendala yang membutuhkan keahlian divisi tertentu (bukan sekadar atasan langsung)
const BLOCKER_TYPE_DIVISION_ROUTING: Record<string, { function: CanonicalFunction; label: string }> = {
  INFRA: { function: CanonicalFunction.OperationsInfrastructure, label: 'Operations & Infrastructure' },
  FINANCE: { function: CanonicalFunction.Finance, label: 'Finance' },
  LEGAL: { function: CanonicalFunction.HRGA, label: 'HRGA & Legal' },
};

@Injectable()
export class BlockerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Mengajukan kendala baru (Instant Blocker atau via Form, Prototipe 05).
   */
  async raiseBlocker(userId: string, dto: RaiseBlockerDto) {
    if (
      dto.ownerNeededType === AuthorityContext.PROJECT_AUTHORITY &&
      (!dto.projectCodeReference || dto.projectCodeReference.trim().length === 0)
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Kendala dengan konteks Kewenangan Proyek WAJIB menyertakan kode proyek referensi (DEC-002, Prototipe 05).',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Resolusi assignedOwnerId jika tidak ditentukan secara eksplisit
    let targetOwnerId = dto.assignedOwnerId;
    if (!targetOwnerId) {
      const suggestion = await this.resolveSuggestedOwner(userId, {
        type: dto.type,
        ownerNeededType: dto.ownerNeededType,
        projectCode: dto.projectCodeReference,
      });
      targetOwnerId = suggestion.owner?.id;
    }

    if (!targetOwnerId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tidak dapat menentukan penanggung jawab eskalasi secara otomatis. Silakan pilih penanggung jawab khusus.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const assignedOwner = await this.prisma.user.findUnique({
      where: { id: targetOwnerId },
    });

    if (!assignedOwner) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna yang ditunjuk sebagai pemilik eskalasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Target respons SLA ditentukan oleh tingkat keparahan (satu sumber kebijakan)
    const slaMinutesMap = await this.getSlaMinutesMap();
    const slaMinutes = slaMinutesMap[dto.severity as keyof typeof slaMinutesMap];
    const slaLabel = slaMinutes % 60 === 0 ? `${slaMinutes / 60} jam` : `${slaMinutes} menit`;

    const raisedAt = this.clockService.now();
    const targetResolutionAt = new Date(raisedAt.getTime() + slaMinutes * 60 * 1000);
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.blockerTicket.create({
        data: {
          raisedByUserId: userId,
          linkedCommitmentId: dto.linkedCommitmentId || null,
          type: dto.type,
          severity: dto.severity,
          impact: dto.impact,
          description: dto.description.trim(),
          ownerNeededType: dto.ownerNeededType,
          assignedOwnerId: targetOwnerId,
          projectCodeReference: dto.projectCodeReference ? dto.projectCodeReference.trim() : null,
          status: BlockerStatus.OPEN,
          raisedAt,
          targetResolutionAt,
        },
        include: {
          raisedBy: { select: { id: true, fullName: true, email: true } },
          assignedOwner: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Kirim notifikasi in-app ke pemilik yang ditunjuk
      await tx.notification.create({
        data: {
          recipientUserId: targetOwnerId,
          triggerType: 'BLOCKER_RAISED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Kendala Baru Dialokasikan: ${dto.severity} Impact ${dto.impact}`,
          message: `Kendala "${dto.description.slice(0, 100)}" telah dialokasikan kepada Anda dengan target respon ${slaLabel}.`,
          actionUrl: '/blockers',
          relatedEntityType: 'blocker_tickets',
          relatedEntityId: ticket.id,
        },
      });

      return ticket;
    });
  }

  /**
   * Peta target respons SLA (menit) per tingkat keparahan dari kebijakan aktif.
   */
  async getSlaMinutesMap(): Promise<Record<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', number>> {
    const fallback = (CANONICAL_POLICY_FALLBACKS[PolicyCategory.BLOCKER_SLA] as BlockerSlaConfig).severityMinutes!;
    try {
      const policy = await this.policyService.getActivePolicy(PolicyCategory.BLOCKER_SLA);
      const configured = (policy?.configurationValues as Partial<BlockerSlaConfig> | undefined)?.severityMinutes;
      return { ...fallback, ...(configured || {}) };
    } catch {
      return fallback;
    }
  }

  /**
   * Menentukan penanggung jawab yang paling tepat ketika pelapor tidak menunjuk siapa pun.
   * - Kewenangan Proyek: Pimpinan Proyek, lalu Pengarah Proyek.
   * - Kewenangan Struktural: berdasarkan kategori kendala. Kendala yang butuh keahlian divisi lain
   *   (INFRA, FINANCE, LEGAL) diarahkan ke pimpinan divisi terkait; selain itu ke Atasan Langsung.
   */
  async resolveSuggestedOwner(
    userId: string,
    input: { type?: string; ownerNeededType?: AuthorityContext; projectCode?: string | null },
  ): Promise<{
    owner: { id: string; fullName: string; jobTitle: string | null } | null;
    reason: 'PROJECT_LEAD' | 'DIVISION_HEAD' | 'DIRECT_MANAGER' | 'NONE';
    divisionLabel?: string;
  }> {
    const pick = async (id?: string | null) => {
      if (!id) return null;
      const u = await this.prisma.user.findFirst({
        where: { id, status: 'ACTIVE' },
        select: {
          id: true,
          fullName: true,
          orgAssignments: { where: { endDate: null }, orderBy: { createdAt: 'desc' }, take: 1, select: { jobTitle: true } },
        },
      });
      return u ? { id: u.id, fullName: u.fullName, jobTitle: u.orgAssignments?.[0]?.jobTitle || null } : null;
    };

    if (input.ownerNeededType === AuthorityContext.PROJECT_AUTHORITY && input.projectCode?.trim()) {
      const mapping = await this.prisma.projectAuthorityMapping.findFirst({
        where: { projectCode: input.projectCode.trim() },
      });
      const owner = (await pick(mapping?.projectManagerId)) || (await pick(mapping?.escalationReviewerId));
      if (owner) return { owner, reason: 'PROJECT_LEAD' };
    }

    if (input.ownerNeededType !== AuthorityContext.PROJECT_AUTHORITY) {
      const target = BLOCKER_TYPE_DIVISION_ROUTING[input.type || ''];
      if (target) {
        const candidates = await this.prisma.organizationalAssignment.findMany({
          where: {
            function: target.function,
            endDate: null,
            userId: { not: userId },
            role: { not: 'SYSTEM_ADMIN' },
            user: { status: 'ACTIVE' },
          },
          select: { userId: true, role: true },
        });
        const rank = ['HEAD', 'HRGA', 'SUPERVISOR'];
        candidates.sort((a, b) => {
          const ra = rank.indexOf(a.role);
          const rb = rank.indexOf(b.role);
          return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
        });
        const owner = await pick(candidates[0]?.userId);
        if (owner) return { owner, reason: 'DIVISION_HEAD', divisionLabel: target.label };
      }
    }

    const orgAssign = await this.prisma.organizationalAssignment.findFirst({
      where: { userId, endDate: null },
      orderBy: { createdAt: 'desc' },
    });
    const manager = await pick(orgAssign?.directManagerId);
    return manager ? { owner: manager, reason: 'DIRECT_MANAGER' } : { owner: null, reason: 'NONE' };
  }
  /**
   * Memberikan konfirmasi resmi (Acknowledgement) terhadap tiket kendala.
   */
  async acknowledgeBlocker(actorUserId: string, blockerId: string) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    return this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.ACKNOWLEDGED,
        acknowledgedAt: this.clockService.now(),
      },
    });
  }

  /**
   * Menyelesaikan tiket kendala dengan catatan mitigasi/resolusi wajib.
   */
  async resolveBlocker(actorUserId: string, blockerId: string, dto: ResolveBlockerDto) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.verifyBlockerActionAuthority(actorUserId, ticket);

    return this.prisma.blockerTicket.update({
      where: { id: blockerId },
      data: {
        status: BlockerStatus.RESOLVED,
        resolvedAt: this.clockService.now(),
        resolutionNote: dto.resolutionNote.trim(),
      },
    });
  }

  /**
   * Memastikan hanya pemilik eskalasi (assignedOwnerId), pelapor (raisedByUserId),
   * pejabat manajerial (SUPERVISOR/HEAD/PROJECT_MANAGER/HRGA/CEO/ADMIN), atau Project Lead aktif
   * yang dapat melakukan Acknowledge / Resolve terhadap tiket kendala.
   */
  private async verifyBlockerActionAuthority(actorUserId: string, ticket: any): Promise<void> {
    if (
      ticket.assignedOwnerId === actorUserId ||
      ticket.raisedByUserId === actorUserId
    ) {
      return;
    }

    if (!this.prisma.organizationalAssignment?.findFirst) {
      return;
    }

    const today = toJakartaDateOnly(this.clockService.now());
    const actorAssignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId: actorUserId,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const managerialRoles: string[] = [
      CanonicalRole.SYSTEM_ADMIN,
      CanonicalRole.CEO_MANAGEMENT,
      CanonicalRole.HRGA,
      CanonicalRole.HEAD,
      CanonicalRole.SUPERVISOR,
      CanonicalRole.PROJECT_MANAGER,
    ];

    if (actorAssignment?.role && managerialRoles.includes(actorAssignment.role)) {
      return;
    }

    if (this.prisma.projectAuthorityMapping?.count) {
      const leadCount = await this.prisma.projectAuthorityMapping.count({
        where: {
          OR: [
            { projectManagerId: actorUserId },
            { escalationReviewerId: actorUserId },
          ],
          effectiveDate: { lte: today },
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: today } }] }],
        },
      });
      if (leadCount > 0) {
        return;
      }
    }

    throw new AppException({
      code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
      message:
        'Anda tidak memiliki wewenang untuk menindaklanjuti atau menyelesaikan tiket kendala ini.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }

  /**
   * Mengambil antrean tiket kendala.
   */
  async getBlockerQueue(filters?: {
    status?: BlockerStatus;
    assignedOwnerId?: string;
    raisedByUserId?: string;
  }) {
    return this.prisma.blockerTicket.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedOwnerId && { assignedOwnerId: filters.assignedOwnerId }),
        ...(filters?.raisedByUserId && { raisedByUserId: filters.raisedByUserId }),
      },
      include: {
        raisedBy: { select: { id: true, fullName: true, email: true } },
        assignedOwner: { select: { id: true, fullName: true, email: true } },
        linkedCommitment: true,
        supportContributions: {
          include: { supporter: { select: { id: true, fullName: true, email: true } } },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { raisedAt: 'desc' },
      ],
    });
  }

  /**
   * Menambahkan kontribusi bantuan (Support Contribution) lintas fungsi (Prototipe 09).
   */
  async addSupportContribution(
    supporterUserId: string,
    blockerId: string,
    actionTaken: string,
    resultNote: string,
  ) {
    const ticket = await this.prisma.blockerTicket.findUnique({
      where: { id: blockerId },
    });

    if (!ticket) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tiket kendala tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.prisma.supportContribution.create({
      data: {
        blockerId,
        supporterUserId,
        actionTaken: actionTaken.trim(),
        resultNote: resultNote.trim(),
      },
      include: {
        supporter: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Mengambil metrik aging eskalasi kendala (Prototipe 14).
   */
  async getEscalationAgingMetrics() {
    const now = this.clockService.now();
    const openBlockers = await this.prisma.blockerTicket.findMany({
      where: {
        status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] },
      },
      include: {
        raisedBy: { select: { id: true, fullName: true } },
        assignedOwner: { select: { id: true, fullName: true } },
      },
      orderBy: { raisedAt: 'asc' },
    });

    const items = openBlockers.map((b) => {
      const elapsedHours = Math.max(
        0,
        Math.round((now.getTime() - b.raisedAt.getTime()) / (1000 * 3600)),
      );
      const isBreached = b.targetResolutionAt ? now > b.targetResolutionAt : false;
      const hoursRemaining = b.targetResolutionAt
        ? Math.round((b.targetResolutionAt.getTime() - now.getTime()) / (1000 * 3600))
        : null;

      return {
        id: b.id,
        description: b.description,
        type: b.type,
        severity: b.severity,
        impact: b.impact,
        status: b.status,
        raisedAt: b.raisedAt,
        targetResolutionAt: b.targetResolutionAt,
        elapsedHours,
        hoursRemaining,
        isBreached,
        raisedBy: b.raisedBy,
        assignedOwner: b.assignedOwner,
        projectCodeReference: b.projectCodeReference,
      };
    });

    const totalOpen = items.length;
    const breachedCount = items.filter((i) => i.isBreached).length;
    const criticalCount = items.filter((i) => i.severity === 'CRITICAL').length;
    const highCount = items.filter((i) => i.severity === 'HIGH').length;

    return {
      evaluatedAt: now.toISOString(),
      summary: {
        totalOpen,
        breachedCount,
        criticalCount,
        highCount,
        slaComplianceRate: totalOpen > 0 ? Math.round(((totalOpen - breachedCount) / totalOpen) * 100) : 100,
      },
      blockers: items,
    };
  }
}
