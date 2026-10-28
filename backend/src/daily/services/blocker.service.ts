import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  AuthorityContext,
  BlockerStatus,
  NotificationChannel,
  PolicyCategory,
} from '@prisma/client';
import { RaiseBlockerDto, ResolveBlockerDto } from '../dto/raise-blocker.dto';

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

    const assignedOwner = await this.prisma.user.findUnique({
      where: { id: dto.assignedOwnerId },
    });

    if (!assignedOwner) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna yang ditunjuk sebagai pemilik eskalasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Ambil kebijakan SLA aktif
    const slaPolicy = await this.policyService.getActivePolicy(PolicyCategory.BLOCKER_SLA);
    const slaConfig = slaPolicy.configurationValues;
    const l1Hours = slaConfig.level1Hours || 4;

    const raisedAt = this.clockService.now();
    const targetResolutionAt = new Date(raisedAt.getTime() + l1Hours * 3600 * 1000);

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
          assignedOwnerId: dto.assignedOwnerId,
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
          recipientUserId: dto.assignedOwnerId,
          triggerType: 'BLOCKER_RAISED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Kendala Baru Dialokasikan: ${dto.severity} Impact ${dto.impact}`,
          message: `Kendala "${dto.description.slice(0, 100)}" telah dialokasikan kepada Anda dengan target respon ${l1Hours} jam kerja.`,
          actionUrl: '/blockers',
          relatedEntityType: 'blocker_tickets',
          relatedEntityId: ticket.id,
        },
      });

      return ticket;
    });
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
