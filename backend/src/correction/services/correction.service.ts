import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { ScopeResolverService } from '../../organization/services/scope-resolver.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  CanonicalRole,
  CommitmentOutcome,
  CommitmentRisk,
  ContinuationStatus,
  CorrectionClassification,
  CorrectionScopeType,
  CorrectionStatus,
  DailyRiskStatus,
  NotificationChannel,
} from '@prisma/client';
import { toJakartaDateOnly } from '../../common/time/date-only.util';
import {
  CreateCorrectionRequestDto,
  ReviewCorrectionRequestDto,
} from '../dto/create-correction-request.dto';

function mapRequestedOutcome(rawOutcome?: string): CommitmentOutcome | undefined {
  if (!rawOutcome) return undefined;
  if (rawOutcome === 'DONE' || rawOutcome === 'COMPLETED') return CommitmentOutcome.COMPLETED;
  if (rawOutcome === 'IN_PROGRESS' || rawOutcome === 'PARTIALLY_COMPLETED') return CommitmentOutcome.PARTIALLY_COMPLETED;
  if (rawOutcome === 'BLOCKED' || rawOutcome === 'NOT_COMPLETED') return CommitmentOutcome.NOT_COMPLETED;
  if (rawOutcome === 'DROPPED' || rawOutcome === 'CANCELLED') return CommitmentOutcome.CANCELLED;
  return undefined;
}

function mapRequestedContinuation(rawContinuation?: string): ContinuationStatus | undefined {
  if (!rawContinuation) return undefined;
  if (rawContinuation === 'CONTINUE_TOMORROW' || rawContinuation === 'CONTINUE' || rawContinuation === 'HANDOVER') return ContinuationStatus.CONTINUE;
  if (rawContinuation === 'ARCHIVE' || rawContinuation === 'DO_NOT_CONTINUE') return ContinuationStatus.DO_NOT_CONTINUE;
  return undefined;
}

@Injectable()
export class CorrectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly policyService: PolicyService,
    private readonly scopeResolverService: ScopeResolverService,
  ) {}

  /**
   * Menerapkan perubahan koreksi pada komitmen sekaligus menyelaraskan ulang
   * initialDailyStatus catatan harian jika tingkat risiko komitmen berubah.
   */
  private async applyCommitmentUpdateAndSyncDailyStatus(
    tx: any,
    commitmentId: string,
    dailyRecordId: string | undefined,
    requestedChange: Record<string, any>,
    fallbackReason: string,
  ) {
    const mappedOutcome = mapRequestedOutcome(requestedChange.outcome);
    const mappedContinuation = mapRequestedContinuation(requestedChange.continuation);

    await tx.commitment.update({
      where: { id: commitmentId },
      data: {
        ...(requestedChange.taskText && { taskText: requestedChange.taskText.trim() }),
        ...(requestedChange.referenceLink !== undefined && {
          referenceLink: requestedChange.referenceLink?.trim() || null,
        }),
        ...(requestedChange.initialRisk && {
          initialRisk: requestedChange.initialRisk,
          ...(['AMBER', 'RED'].includes(requestedChange.initialRisk) && {
            knownBlockerNote: requestedChange.knownBlockerNote || fallbackReason,
          }),
        }),
        ...(mappedOutcome && { outcome: mappedOutcome }),
        ...(requestedChange.outcomeReason !== undefined && {
          outcomeReason: requestedChange.outcomeReason?.trim() || null,
        }),
        ...(mappedContinuation && {
          continuation: mappedContinuation,
          continuationReason:
            mappedContinuation === ContinuationStatus.CONTINUE
              ? requestedChange.continuationReason?.trim() ||
                requestedChange.outcomeReason?.trim() ||
                fallbackReason ||
                null
              : null,
        }),
      },
    });

    if (
      requestedChange.initialRisk &&
      dailyRecordId &&
      tx.commitment?.findMany &&
      tx.dailyAccountabilityRecord?.update
    ) {
      const siblingCommitments = await tx.commitment.findMany({
        where: { dailyRecordId },
        select: {
          initialRisk: true,
          blockers: { select: { id: true } },
        },
      });

      if (siblingCommitments.length > 0) {
        const hasRed = siblingCommitments.some(
          (c: any) => c.initialRisk === CommitmentRisk.RED,
        );
        const hasAmber = siblingCommitments.some(
          (c: any) =>
            c.initialRisk === CommitmentRisk.AMBER ||
            (Array.isArray(c.blockers) && c.blockers.length > 0) ||
            !!c.linkedBlockerId,
        );
        const recalculatedStatus = hasRed
          ? DailyRiskStatus.RED
          : hasAmber
            ? DailyRiskStatus.AMBER
            : DailyRiskStatus.GREEN;

        await tx.dailyAccountabilityRecord.update({
          where: { id: dailyRecordId },
          data: { initialDailyStatus: recalculatedStatus },
        });
      }
    }
  }

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

        // Update komitmen seketika & selaraskan status risiko harian jika berubah
        await this.applyCommitmentUpdateAndSyncDailyStatus(
          tx,
          dto.targetCommitmentId,
          commitment.dailyRecordId,
          dto.requestedChange,
          (dto.reason || '').trim(),
        );

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

      // Kirim notifikasi juga kepada Reviewer Sementara aktif untuk divisi pemohon (jika ada)
      if (
        assignment?.function &&
        assignment.role !== CanonicalRole.HEAD &&
        assignment.role !== CanonicalRole.CEO_MANAGEMENT &&
        tx.temporaryReviewerAssignment?.findMany
      ) {
        const todayDateOnly = toJakartaDateOnly(now);
        const activeDelegations = await tx.temporaryReviewerAssignment.findMany({
          where: {
            targetFunction: assignment.function,
            effectiveDate: { lte: todayDateOnly },
            expiryDate: { gte: todayDateOnly },
          },
          select: { delegateUserId: true },
          distinct: ['delegateUserId'],
        });

        for (const del of activeDelegations) {
          if (
            del.delegateUserId !== requesterUserId &&
            del.delegateUserId !== assignment.directManagerId
          ) {
            await tx.notification.create({
              data: {
                recipientUserId: del.delegateUserId,
                triggerType: 'CORRECTION_REQUESTED',
                channel: NotificationChannel.IN_APP_CENTER,
                title: `Permohonan Koreksi Material (${dto.scopeType}) — Delegasi Reviewer`,
                message: `Karyawan mengajukan koreksi material pada komitmen #${commitment.sequenceNo}. Jendela keberatan aktif 24 jam.`,
                actionUrl: '/corrections/review',
                relatedEntityType: 'correction_requests',
                relatedEntityId: req.id,
              },
            });
          }
        }
      }

      return req;
    });
  }

  /**
   * Mengambil antrean permohonan koreksi (Prototipe 22).
   */
  async getCorrectionRequests(
    filters?: {
      status?: CorrectionStatus;
      requesterId?: string;
      mode?: 'mine' | 'review';
    },
    reviewerUserId?: string,
  ) {
    const effectiveRequesterId =
      filters?.mode === 'mine' && reviewerUserId
        ? reviewerUserId
        : filters?.requesterId;

    const list = await this.prisma.correctionRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(effectiveRequesterId && { requestedByUserId: effectiveRequesterId }),
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

    if (!reviewerUserId) {
      return list;
    }

    if (effectiveRequesterId && effectiveRequesterId === reviewerUserId) {
      return list;
    }

    const accessible: typeof list = [];
    for (const item of list) {
      if (item.requestedByUserId === reviewerUserId) {
        continue;
      }
      const canReview = this.scopeResolverService.canReviewUser
        ? await this.scopeResolverService.canReviewUser(
            reviewerUserId,
            item.requestedByUserId,
          )
        : await this.scopeResolverService.canAccessUser(
            reviewerUserId,
            item.requestedByUserId,
          );
      if (canReview) {
        accessible.push(item);
      }
    }
    return accessible;
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

    if (reviewerUserId === req.requestedByUserId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message:
          'Pelanggaran tata kelola: Anda tidak diperkenankan meninjau atau menyetujui permohonan koreksi milik Anda sendiri.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    // Penegakan batas wewenang hierarki manajerial 3-Lapis (WP-EP03-TK006 / SAD IV.4 & DEC-010)
    if (this.scopeResolverService.enforceReviewerScope) {
      await this.scopeResolverService.enforceReviewerScope(
        reviewerUserId,
        req.requestedByUserId,
      );
    } else {
      await this.scopeResolverService.enforceUserScope(
        reviewerUserId,
        req.requestedByUserId,
      );
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

        // Terapkan perubahan pada komitmen & selaraskan status risiko harian jika berubah
        await this.applyCommitmentUpdateAndSyncDailyStatus(
          tx,
          req.targetCommitmentId,
          req.targetCommitment?.dailyRecordId,
          valReq,
          (req.reason || '').trim(),
        );

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
