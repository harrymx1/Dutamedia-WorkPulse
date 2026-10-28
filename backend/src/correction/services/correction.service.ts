import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  CorrectionClassification,
  CorrectionScopeType,
  CorrectionStatus,
  NotificationChannel,
} from '@prisma/client';
import {
  CreateCorrectionRequestDto,
  ReviewCorrectionRequestDto,
} from '../dto/create-correction-request.dto';

@Injectable()
export class CorrectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Mengajukan koreksi komitmen/EOD pasca-cutoff (DEC-002, Prototipe 16a, 16b).
   */
  async createCorrectionRequest(
    requesterUserId: string,
    dto: CreateCorrectionRequestDto,
  ) {
    const commitment = await this.prisma.commitment.findUnique({
      where: { id: dto.targetCommitmentId },
      include: { dailyRecord: true },
    });

    if (!commitment) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Komitmen target yang ingin dikoreksi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (commitment.dailyRecord.userId !== requesterUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Hanya pemilik komitmen yang dapat mengajukan permohonan koreksi.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    // Ambil nilai sebelum (snapshot value before)
    const valueBefore: Record<string, any> =
      dto.scopeType === CorrectionScopeType.MORNING_COMMITMENT
        ? {
            taskText: commitment.taskText,
            referenceLink: commitment.referenceLink,
            initialRisk: commitment.initialRisk,
          }
        : {
            outcome: commitment.outcome,
            outcomeReason: commitment.outcomeReason,
            continuation: commitment.continuation,
          };

    const policy = await this.policyService.getActivePolicy('CHECKIN_TIMING');
    const now = this.clockService.now();

    return this.prisma.$transaction(async (tx) => {
      // 1. Alur Perubahan Minor: Auto-applied seketika (SAD 2.4)
      if (dto.classification === CorrectionClassification.MINOR) {
        const req = await tx.correctionRequest.create({
          data: {
            targetCommitmentId: dto.targetCommitmentId,
            requestedByUserId: requesterUserId,
            scopeType: dto.scopeType,
            classification: dto.classification,
            reason: dto.reason.trim(),
            valueBefore,
            valueRequested: dto.requestedChange,
            policySnapshot: policy?.configurationValues || {},
            status: CorrectionStatus.AUTO_APPLIED,
            appliedAt: now,
            reviewedAt: now,
          },
        });

        // Update komitmen seketika
        await tx.commitment.update({
          where: { id: dto.targetCommitmentId },
          data: {
            ...(dto.requestedChange.taskText && { taskText: dto.requestedChange.taskText.trim() }),
            ...(dto.requestedChange.referenceLink !== undefined && {
              referenceLink: dto.requestedChange.referenceLink?.trim() || null,
            }),
            ...(dto.requestedChange.outcome && { outcome: dto.requestedChange.outcome }),
            ...(dto.requestedChange.outcomeReason !== undefined && {
              outcomeReason: dto.requestedChange.outcomeReason?.trim() || null,
            }),
          },
        });

        // Rekam Audit Log (DEC-008)
        await tx.auditLog.create({
          data: {
            actionCode: 'CORRECTION_AUTO_APPLIED',
            actorUserId: requesterUserId,
            relatedEntityType: 'commitments',
            relatedEntityId: dto.targetCommitmentId,
            valueBefore,
            valueAfter: dto.requestedChange,
          },
        });

        return req;
      }

      // 2. Alur Perubahan Material: Buka jendela sanggahan (Objection Window 24 jam)
      const objectionWindowEndsAt = new Date(now.getTime() + 24 * 3600 * 1000);

      const req = await tx.correctionRequest.create({
        data: {
          targetCommitmentId: dto.targetCommitmentId,
          requestedByUserId: requesterUserId,
          scopeType: dto.scopeType,
          classification: dto.classification,
          reason: dto.reason.trim(),
          valueBefore,
          valueRequested: dto.requestedChange,
          policySnapshot: policy?.configurationValues || {},
          status: CorrectionStatus.PENDING,
          objectionWindowEndsAt,
        },
      });

      // Cari atasan langsung untuk dikirimi notifikasi review
      const assignment = await tx.organizationalAssignment.findFirst({
        where: { userId: requesterUserId, endDate: null },
      });

      if (assignment?.directManagerId) {
        await tx.notification.create({
          data: {
            recipientUserId: assignment.directManagerId,
            triggerType: 'CORRECTION_REQUESTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: `Permohonan Koreksi Material (${dto.scopeType})`,
            message: `Karyawan mengajukan koreksi material pada komitmen #${commitment.sequenceNo}. Jendela keberatan aktif 24 jam.`,
            actionUrl: '/corrections/review',
            relatedEntityType: 'correction_requests',
            relatedEntityId: req.id,
          },
        });
      }

      return req;
    });
  }

  /**
   * Mengambil antrean permohonan koreksi (Prototipe 22).
   */
  async getCorrectionRequests(filters?: {
    status?: CorrectionStatus;
    requesterId?: string;
  }) {
    return this.prisma.correctionRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.requesterId && { requestedByUserId: filters.requesterId }),
      },
      include: {
        targetCommitment: {
          include: { dailyRecord: true },
        },
        requestedByUser: { select: { id: true, fullName: true, email: true } },
        reviewedByUser: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  /**
   * Meninjau permohonan koreksi material oleh Reviewer Berwenang (Prototipe 22).
   */
  async reviewCorrectionRequest(
    reviewerUserId: string,
    id: string,
    dto: ReviewCorrectionRequestDto,
  ) {
    const req = await this.prisma.correctionRequest.findUnique({
      where: { id },
      include: { targetCommitment: true },
    });

    if (!req) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Permohonan koreksi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (req.status !== CorrectionStatus.PENDING) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Permohonan koreksi ini sudah ditinjau sebelumnya.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const now = this.clockService.now();

    return this.prisma.$transaction(async (tx) => {
      if (dto.decision === 'APPROVE') {
        const valReq = req.valueRequested as Record<string, any>;

        // Terapkan perubahan pada komitmen
        await tx.commitment.update({
          where: { id: req.targetCommitmentId },
          data: {
            ...(valReq.taskText && { taskText: valReq.taskText.trim() }),
            ...(valReq.referenceLink !== undefined && {
              referenceLink: valReq.referenceLink?.trim() || null,
            }),
            ...(valReq.initialRisk && { initialRisk: valReq.initialRisk }),
            ...(valReq.outcome && { outcome: valReq.outcome }),
            ...(valReq.outcomeReason !== undefined && {
              outcomeReason: valReq.outcomeReason?.trim() || null,
            }),
          },
        });

        const updatedReq = await tx.correctionRequest.update({
          where: { id },
          data: {
            status: CorrectionStatus.APPROVED,
            reviewedByUserId: reviewerUserId,
            reviewNote: dto.reviewNote.trim(),
            reviewedAt: now,
            appliedAt: now,
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            actionCode: 'CORRECTION_APPROVED',
            actorUserId: reviewerUserId,
            relatedEntityType: 'commitments',
            relatedEntityId: req.targetCommitmentId,
            valueBefore: req.valueBefore as any,
            valueAfter: req.valueRequested as any,
          },
        });

        // Notifikasi ke pemohon
        await tx.notification.create({
          data: {
            recipientUserId: req.requestedByUserId,
            triggerType: 'CORRECTION_APPROVED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Permohonan Koreksi Disetujui',
            message: `Permohonan koreksi komitmen #${req.targetCommitment.sequenceNo} telah disetujui oleh atasan.`,
            actionUrl: '/daily/history',
            relatedEntityType: 'correction_requests',
            relatedEntityId: req.id,
          },
        });

        return updatedReq;
      } else {
        // REJECT
        const updatedReq = await tx.correctionRequest.update({
          where: { id },
          data: {
            status: CorrectionStatus.REJECTED,
            reviewedByUserId: reviewerUserId,
            reviewNote: dto.reviewNote.trim(),
            reviewedAt: now,
          },
        });

        // Notifikasi ke pemohon
        await tx.notification.create({
          data: {
            recipientUserId: req.requestedByUserId,
            triggerType: 'CORRECTION_REJECTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Permohonan Koreksi Ditolak',
            message: `Permohonan koreksi komitmen #${req.targetCommitment.sequenceNo} ditolak: "${dto.reviewNote.trim()}".`,
            actionUrl: '/daily/history',
            relatedEntityType: 'correction_requests',
            relatedEntityId: req.id,
          },
        });

        return updatedReq;
      }
    });
  }
}
