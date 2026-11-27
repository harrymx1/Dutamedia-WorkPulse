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

function getCorrectionScopeLabel(scopeType?: CorrectionScopeType | string): string {
  if (scopeType === CorrectionScopeType.EOD_OUTCOME || scopeType === 'EOD_OUTCOME') {
    return 'Koreksi Evaluasi Sore';
  }
  return 'Koreksi Komitmen Pagi';
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
    sequenceNo?: number | null,
  ) {
    const mappedOutcome = mapRequestedOutcome(requestedChange.outcome);
    const mappedContinuation = mapRequestedContinuation(requestedChange.continuation);
    const isNextGreen = requestedChange.initialRisk === CommitmentRisk.GREEN;
    const isNextRisky =
      requestedChange.initialRisk === CommitmentRisk.AMBER ||
      requestedChange.initialRisk === CommitmentRisk.RED;

    await tx.commitment.update({
      where: { id: commitmentId },
      data: {
        ...(requestedChange.taskText && { taskText: requestedChange.taskText.trim() }),
        ...(requestedChange.referenceLink !== undefined && {
          referenceLink: requestedChange.referenceLink?.trim() || null,
        }),
        ...(requestedChange.initialRisk && {
          initialRisk: requestedChange.initialRisk,
        }),
        ...(isNextGreen
          ? {
              knownBlockerNote: null,
              supportNeeded: null,
            }
          : {
              ...(requestedChange.knownBlockerNote !== undefined
                ? { knownBlockerNote: requestedChange.knownBlockerNote?.trim() || null }
                : isNextRisky
                  ? { knownBlockerNote: fallbackReason || null }
                  : {}),
              ...(requestedChange.supportNeeded !== undefined && {
                supportNeeded: requestedChange.supportNeeded?.trim() || null,
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
      dailyRecordId &&
      sequenceNo &&
      tx.dailyAccountabilityRecord?.update &&
      (requestedChange.projectCode !== undefined ||
        requestedChange.linkedBlockerId !== undefined ||
        isNextGreen)
    ) {
      let currentSnap: Record<string, any> = {};
      if (tx.dailyAccountabilityRecord?.findUnique) {
        const dr = await tx.dailyAccountabilityRecord.findUnique({
          where: { id: dailyRecordId },
          select: { orgContextSnapshot: true },
        });
        if (dr?.orgContextSnapshot && typeof dr.orgContextSnapshot === 'object') {
          currentSnap = { ...dr.orgContextSnapshot };
        }
      }
      const prevMetaMap =
        currentSnap.commitmentMeta && typeof currentSnap.commitmentMeta === 'object'
          ? { ...currentSnap.commitmentMeta }
          : {};
      const slotKey = String(sequenceNo);
      const prevSlotMeta =
        prevMetaMap[slotKey] && typeof prevMetaMap[slotKey] === 'object'
          ? { ...prevMetaMap[slotKey] }
          : {};

      const nextProjectCode =
        requestedChange.projectCode !== undefined
          ? String(requestedChange.projectCode || '').trim() || null
          : (prevSlotMeta.projectCode ?? null);
      const nextLinkedBlockerId = isNextGreen
        ? null
        : requestedChange.linkedBlockerId !== undefined
          ? String(requestedChange.linkedBlockerId || '').trim() || null
          : (prevSlotMeta.linkedBlockerId ?? null);

      prevMetaMap[slotKey] = {
        projectCode: nextProjectCode,
        linkedBlockerId: nextLinkedBlockerId,
      };
      await tx.dailyAccountabilityRecord.update({
        where: { id: dailyRecordId },
        data: {
          orgContextSnapshot: {
            ...currentSnap,
            commitmentMeta: prevMetaMap,
          },
        },
      });
    }

    if (!isNextGreen && requestedChange.linkedBlockerId && tx.blockerTicket?.updateMany) {
      await tx.blockerTicket.updateMany({
        where: {
          id: String(requestedChange.linkedBlockerId).trim(),
          linkedCommitmentId: null,
        },
        data: { linkedCommitmentId: commitmentId },
      });
    }

    if (
      (requestedChange.initialRisk || requestedChange.linkedBlockerId !== undefined) &&
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
      include: {
        dailyRecord: true,
        blockers: { select: { id: true } },
      },
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

    if (this.prisma.correctionRequest?.findFirst) {
      const existingPending = await this.prisma.correctionRequest.findFirst({
        where: {
          targetCommitmentId: dto.targetCommitmentId,
          scopeType: dto.scopeType,
          status: CorrectionStatus.PENDING,
        },
      });

      if (existingPending) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message:
            'Masih ada permohonan koreksi material yang sedang menunggu tinjauan atasan untuk komitmen ini.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    let normalizedRequestedChange: Record<string, any> = dto.requestedChange || {};
    let resolvedValueBefore: Record<string, any>;

    if (dto.scopeType === CorrectionScopeType.MORNING_COMMITMENT) {
      const reqChange = dto.requestedChange || {};
      if (
        reqChange.taskText !== undefined &&
        String(reqChange.taskText).trim().length < 3
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Deskripsi komitmen baru minimal 3 karakter.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      const currentMeta =
        (commitment.dailyRecord?.orgContextSnapshot as any)?.commitmentMeta?.[
          String(commitment.sequenceNo)
        ] || {};

      const currentTask = (commitment.taskText || '').trim();
      const nextTask =
        reqChange.taskText !== undefined
          ? String(reqChange.taskText).trim()
          : currentTask;
      const currentLink = (commitment.referenceLink || '').trim() || null;
      const nextLink =
        reqChange.referenceLink !== undefined
          ? String(reqChange.referenceLink || '').trim() || null
          : currentLink;
      const currentProjectCode =
        (currentMeta.projectCode || '').trim() || null;
      const nextProjectCode =
        reqChange.projectCode !== undefined
          ? String(reqChange.projectCode || '').trim() || null
          : currentProjectCode;

      const currentRisk = commitment.initialRisk;
      const nextRisk =
        reqChange.initialRisk !== undefined
          ? reqChange.initialRisk
          : currentRisk;

      if (
        dto.classification === CorrectionClassification.MINOR &&
        nextRisk !== currentRisk
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Perubahan tingkat risiko wajib diajukan melalui Perubahan Material untuk ditinjau Atasan Berwenang.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      const currentLinkedBlockerId =
        (currentMeta.linkedBlockerId || commitment.blockers?.[0]?.id || '').trim() ||
        null;
      const rawNextBlockerId =
        reqChange.linkedBlockerId !== undefined
          ? String(reqChange.linkedBlockerId || '').trim() || null
          : currentLinkedBlockerId;
      const nextLinkedBlockerId =
        nextRisk === CommitmentRisk.GREEN ? null : rawNextBlockerId;

      const currentKnownBlockerNote =
        (commitment.knownBlockerNote || '').trim() || null;
      let nextKnownBlockerNote =
        nextRisk === CommitmentRisk.GREEN
          ? null
          : reqChange.knownBlockerNote !== undefined
            ? String(reqChange.knownBlockerNote || '').trim() || null
            : currentKnownBlockerNote;

      const currentSupportNeeded =
        (commitment.supportNeeded || '').trim() || null;
      const nextSupportNeeded =
        nextRisk === CommitmentRisk.GREEN
          ? null
          : reqChange.supportNeeded !== undefined
            ? String(reqChange.supportNeeded || '').trim() || null
            : currentSupportNeeded;

      if (nextRisk === CommitmentRisk.RED) {
        if (!nextLinkedBlockerId) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message:
              'Komitmen dengan tingkat risiko RED wajib mengaitkan tiket Blocker aktif. Buat tiket Blocker terlebih dahulu lalu kaitkan sebagai penyebab.',
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }

        if ((this.prisma as any).blockerTicket?.findUnique) {
          const blocker = await (this.prisma as any).blockerTicket.findUnique({
            where: { id: nextLinkedBlockerId },
            select: { id: true, description: true, status: true },
          });
          const activeStatuses = ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'];
          if (!blocker || !activeStatuses.includes(String(blocker.status))) {
            throw new AppException({
              code: ErrorCode.VALIDATION_FAILED,
              message:
                'Tiket Blocker yang dikaitkan tidak ditemukan atau sudah tidak aktif. Pilih tiket Blocker yang masih berjalan.',
              statusCode: HttpStatus.BAD_REQUEST,
            });
          }
          if (!nextKnownBlockerNote) {
            const blkCode = `#BLK-${String(blocker.id).slice(0, 6).toUpperCase()}`;
            nextKnownBlockerNote = `Terkait kendala aktif ${blkCode}: ${blocker.description}`;
          }
        }
      }

      if (
        (nextRisk === CommitmentRisk.AMBER || nextRisk === CommitmentRisk.RED) &&
        (!nextKnownBlockerNote || nextKnownBlockerNote.length === 0)
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: `Komitmen dengan risiko ${nextRisk} wajib menyertakan uraian potensi kendala.`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      if (
        nextTask === currentTask &&
        nextLink === currentLink &&
        nextProjectCode === currentProjectCode &&
        nextRisk === currentRisk &&
        nextLinkedBlockerId === currentLinkedBlockerId &&
        nextKnownBlockerNote === currentKnownBlockerNote &&
        nextSupportNeeded === currentSupportNeeded
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Perubahan yang diajukan masih sama dengan data komitmen saat ini. Silakan ubah minimal satu isian komitmen.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      resolvedValueBefore = {
        taskText: commitment.taskText,
        referenceLink: commitment.referenceLink,
        projectCode: currentProjectCode,
        initialRisk: commitment.initialRisk,
        linkedBlockerId: currentLinkedBlockerId,
        knownBlockerNote: currentKnownBlockerNote,
        supportNeeded: currentSupportNeeded,
      };
      normalizedRequestedChange = {
        taskText: nextTask,
        referenceLink: nextLink,
        projectCode: nextProjectCode,
        initialRisk: nextRisk,
        linkedBlockerId: nextLinkedBlockerId,
        knownBlockerNote: nextKnownBlockerNote,
        supportNeeded: nextSupportNeeded,
      };
    } else if (dto.scopeType === CorrectionScopeType.EOD_OUTCOME) {
      if (
        commitment.dailyRecord.eodSubmittedAt === null &&
        commitment.outcome == null
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Belum ada laporan evaluasi sore (EOD) yang dikirim untuk komitmen ini. Koreksi evaluasi sore tidak dapat digunakan untuk membuat laporan baru.',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      const reqChange = dto.requestedChange || {};
      if (
        reqChange.outcome !== undefined &&
        !mapRequestedOutcome(reqChange.outcome)
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Nilai hasil capaian (outcome) evaluasi sore tidak valid.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      const currentOutcome = commitment.outcome ?? null;
      const nextOutcome =
        reqChange.outcome !== undefined
          ? (mapRequestedOutcome(reqChange.outcome) ?? null)
          : currentOutcome;
      const currentReason = (commitment.outcomeReason || '').trim() || null;
      const nextReason =
        reqChange.outcomeReason !== undefined
          ? String(reqChange.outcomeReason || '').trim() || null
          : currentReason;
      const currentContinuation = commitment.continuation ?? null;
      const nextContinuation =
        reqChange.continuation !== undefined
          ? (mapRequestedContinuation(reqChange.continuation) ?? null)
          : currentContinuation;

      if (
        nextOutcome === currentOutcome &&
        nextReason === currentReason &&
        nextContinuation === currentContinuation &&
        reqChange.continuation !== 'HANDOVER'
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Perubahan yang diajukan masih sama dengan data evaluasi sore saat ini. Silakan ubah minimal satu isian evaluasi sore.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      resolvedValueBefore = {
        outcome: commitment.outcome,
        outcomeReason: commitment.outcomeReason,
        continuation: commitment.continuation,
      };
    } else {
      resolvedValueBefore = {};
    }

    const valueBefore: Record<string, any> = resolvedValueBefore;

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
            valueRequested: normalizedRequestedChange,
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
          normalizedRequestedChange,
          (dto.reason || '').trim(),
          commitment.sequenceNo,
        );

        // Rekam Audit Log (DEC-008)
        await tx.auditLog.create({
          data: {
            actionCode: 'CORRECTION_AUTO_APPLIED',
            actorUserId: requesterUserId,
            relatedEntityType: 'commitments',
            relatedEntityId: dto.targetCommitmentId,
            valueBefore,
            valueAfter: normalizedRequestedChange,
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
          valueRequested: normalizedRequestedChange,
          policySnapshot: policy?.configurationValues || {},
          status: CorrectionStatus.PENDING,
          objectionWindowEndsAt,
        },
      });

      // Cari atasan langsung untuk dikirimi notifikasi review
      const todayForOrg = toJakartaDateOnly(now);
      const assignment = await tx.organizationalAssignment.findFirst({
        where: {
          userId: requesterUserId,
          effectiveDate: { lte: todayForOrg },
          OR: [{ endDate: null }, { endDate: { gte: todayForOrg } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });

      const scopeLabel = getCorrectionScopeLabel(dto.scopeType);

      if (assignment?.directManagerId) {
        await tx.notification.create({
          data: {
            recipientUserId: assignment.directManagerId,
            triggerType: 'CORRECTION_REQUESTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: `Permohonan ${scopeLabel} Material`,
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
                title: `Permohonan ${scopeLabel} Material — Delegasi Reviewer`,
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
    const todayDateOnly = toJakartaDateOnly(this.clockService.now());

    if (
      filters?.mode === 'review' &&
      reviewerUserId &&
      this.prisma.organizationalAssignment?.findFirst
    ) {
      const callerOrg = await this.prisma.organizationalAssignment.findFirst({
        where: {
          userId: reviewerUserId,
          effectiveDate: { lte: todayDateOnly },
          OR: [{ endDate: null }, { endDate: { gte: todayDateOnly } }],
        },
        orderBy: { effectiveDate: 'desc' },
        select: { role: true },
      });

      const CORRECTION_REVIEW_ROLES: CanonicalRole[] = [
        CanonicalRole.HEAD,
        CanonicalRole.CEO_MANAGEMENT,
        CanonicalRole.HRGA,
        CanonicalRole.SYSTEM_ADMIN,
        CanonicalRole.SUPERVISOR,
      ];

      if (callerOrg && !CORRECTION_REVIEW_ROLES.includes(callerOrg.role)) {
        const activeDelegation = this.prisma.temporaryReviewerAssignment?.findFirst
          ? await this.prisma.temporaryReviewerAssignment.findFirst({
              where: {
                delegateUserId: reviewerUserId,
                effectiveDate: { lte: todayDateOnly },
                expiryDate: { gte: todayDateOnly },
              },
              select: { id: true },
            })
          : null;

        if (!activeDelegation) {
          throw new AppException({
            code: ErrorCode.AUTH_FORBIDDEN_ROLE,
            message:
              'Akses ditolak. Halaman Review Koreksi hanya dapat diakses oleh pejabat berwenang atau Reviewer Sementara aktif.',
            statusCode: HttpStatus.FORBIDDEN,
          });
        }
      }
    }

    const effectiveRequesterId =
      filters?.mode === 'mine' && reviewerUserId
        ? reviewerUserId
        : filters?.requesterId;

    const rawList = await this.prisma.correctionRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(effectiveRequesterId && { requestedByUserId: effectiveRequesterId }),
      },
      include: {
        targetCommitment: {
          include: { dailyRecord: true },
        },
        requestedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            orgAssignments: {
              where: {
                effectiveDate: { lte: todayDateOnly },
                OR: [{ endDate: null }, { endDate: { gte: todayDateOnly } }],
              },
              orderBy: { effectiveDate: 'desc' },
              take: 1,
              select: {
                role: true,
                jobTitle: true,
                function: true,
                employmentStatus: true,
              },
            },
          },
        },
        reviewedByUser: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const list = (rawList || []).map((item: any) => {
      const activeOrg = item.requestedByUser?.orgAssignments?.[0];
      if (!item.requestedByUser) return item;
      return {
        ...item,
        requestedByUser: {
          id: item.requestedByUser.id,
          fullName: item.requestedByUser.fullName,
          email: item.requestedByUser.email,
          role: activeOrg?.role || null,
          jobTitle: activeOrg?.jobTitle || null,
          function: activeOrg?.function || null,
          employmentStatus: activeOrg?.employmentStatus || null,
        },
      };
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

    const trimmedNote = dto.reviewNote?.trim() || '';
    if (trimmedNote.length < 5) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Catatan review peninjau wajib diisi minimal 5 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const now = this.clockService.now();
    const targetActionUrl =
      req.scopeType === CorrectionScopeType.EOD_OUTCOME
        ? '/corrections/eod'
        : '/corrections/morning';

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
          req.targetCommitment?.sequenceNo,
        );

        const updatedReq = await tx.correctionRequest.update({
          where: { id },
          data: {
            status: CorrectionStatus.APPROVED,
            reviewedByUserId: reviewerUserId,
            reviewNote: trimmedNote,
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
            actionUrl: targetActionUrl,
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
            reviewNote: trimmedNote,
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
            message: `Permohonan koreksi komitmen #${req.targetCommitment.sequenceNo} ditolak: "${trimmedNote}".`,
            actionUrl: targetActionUrl,
            relatedEntityType: 'correction_requests',
            relatedEntityId: req.id,
          },
        });

        return updatedReq;
      }
    });
  }
}
