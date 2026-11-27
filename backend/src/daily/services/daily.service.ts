import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { WorkdayService } from './workday.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { assertUserIsNotIntern } from '../../organization/utils/employment-status.util';
import {
  AdditionalWorkReason,
  CommitmentOutcome,
  CommitmentRisk,
  ContinuationStatus,
  DailyRiskStatus,
  LeaveStatus,
  NotificationChannel,
  NotificationStatus,
  PolicyCategory,
  TimingStatus,
} from '@prisma/client';
import { SubmitMorningCheckinDto } from '../dto/submit-morning-checkin.dto';
import { SubmitAdditionalWorkDto } from '../dto/submit-additional-work.dto';
import { SubmitEodOutcomeDto } from '../dto/submit-eod-outcome.dto';

@Injectable()
export class DailyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly policyService: PolicyService,
    private readonly workdayService: WorkdayService,
  ) {}

  /**
   * Mengambil status komitmen harian user (hari ini), status cutoff jam kerja,
   * dan daftar tugas carry-over yang tersedia dari hari kerja sebelumnya.
   */
  async getTodayState(userId: string, targetDate?: Date) {
    const todayStr = targetDate
      ? targetDate.toISOString().split('T')[0]
      : this.clockService.todayString('Asia/Jakarta');

    const todayDate = new Date(todayStr);

    // Ambil kebijakan waktu checkin aktif
    const timingPolicy = await this.policyService.getActivePolicy(
      PolicyCategory.CHECKIN_TIMING,
      todayDate,
    );
    const timingConfig = timingPolicy.configurationValues;

    // Evaluasi jam saat ini
    const currentTimeStr = this.clockService
      .now()
      .toLocaleTimeString('en-GB', {
        timeZone: timingConfig.timezone || 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    const morningLockCutoff = timingConfig.morningLockCutoff || '09:30';
    const eodLockCutoff = timingConfig.eodLockCutoff || '21:00';
    const morningOnTimeCutoff = timingConfig.morningOnTimeCutoff || '09:00';
    const eodOnTimeCutoff = timingConfig.eodOnTimeCutoff || '17:00';

    const isMorningLocked = currentTimeStr > morningLockCutoff;
    const isEodLocked = currentTimeStr > eodLockCutoff;

    // Ambil permohonan cuti resmi & dispensasi aktif hari ini (DEC-007, DEC-008, DEC-018)
    const { activeLeave, activeExemption } = await this.getActiveLeaveAndExemption(
      userId,
      todayDate,
    );

    // Ambil record hari ini jika sudah pernah dibuat
    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: todayDate,
        },
      },
      include: {
        commitments: {
          orderBy: { sequenceNo: 'asc' },
          include: {
            originCommitment: true,
            blockers: true,
          },
        },
        additionalWorks: {
          orderBy: { createdAt: 'asc' },
          include: { assignedByUser: { select: { id: true, fullName: true } } },
        },
      },
    });

    // Ambil prioritas esok hari (H-1) & komitmen carry-over dari previousWorkday (FR-11, DEC-013)
    let availableCarryOvers: any[] = [];
    let tomorrowPriority: string | null = null;
    const prevWorkdayStr = await this.workdayService.getPreviousWorkday(userId, todayDate);
    const prevRecord = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate: new Date(prevWorkdayStr),
        },
      },
      include: {
        commitments: true,
      },
    });

    if (prevRecord) {
      tomorrowPriority = (prevRecord.orgContextSnapshot as any)?.tomorrowPriority || null;
      if (!record || record.commitments.length === 0) {
        const prevMeta = (prevRecord.orgContextSnapshot as any)?.commitmentMeta || {};
        availableCarryOvers = (prevRecord.commitments || [])
          .filter((c) => c.continuation === ContinuationStatus.CONTINUE)
          .map((c) => {
            const nextCount = c.carryOverDaysCount + 1;
            const cMeta = prevMeta[String(c.sequenceNo)] || {};
            return {
              originCommitmentId: c.id,
              taskText: c.taskText,
              referenceLink: c.referenceLink,
              projectCode: cMeta.projectCode || null,
              linkedBlockerId: cMeta.linkedBlockerId || null,
              carryOverDaysCount: nextCount,
              suggestedRisk: nextCount >= 2 ? CommitmentRisk.AMBER : c.initialRisk,
              isAmberWarningAdvised: nextCount >= 2, // DEC-003: Saran AMBER jika carry-over berlanjut
              continuationReason: c.continuationReason || null,
            };
          });
      }
    }

    // Ambil daftar proyek aktif dari ProjectAuthorityMapping (+ fallback daftar proyek standar)
    const defaultProjects = [
      { projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing' },
      { projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync' },
      { projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android' },
    ];
    let dbProjects: Array<{ projectCode: string; projectName: string }> = [];
    if ((this.prisma as any).projectAuthorityMapping?.findMany) {
      const mappings = await (this.prisma as any).projectAuthorityMapping.findMany({
        where: {
          effectiveDate: { lte: todayDate },
          OR: [{ endDate: null }, { endDate: { gte: todayDate } }],
        },
        select: { projectCode: true, projectName: true },
      });
      dbProjects = mappings || [];
    }
    const projectMap = new Map<string, string>();
    for (const p of [...dbProjects, ...defaultProjects]) {
      if (p.projectCode && !projectMap.has(p.projectCode)) {
        projectMap.set(p.projectCode, p.projectName);
      }
    }
    const availableProjects = Array.from(projectMap.entries()).map(([projectCode, projectName]) => ({
      projectCode,
      projectName,
    }));

    // Ambil daftar blocker aktif (OPEN / ACKNOWLEDGED / IN_PROGRESS)
    let activeBlockers: Array<{
      id: string;
      code: string;
      description: string;
      severity: string;
      projectCodeReference: string | null;
      status: string;
    }> = [];
    let myActiveBlockers: Array<{
      id: string;
      code: string;
      description: string;
      severity: string;
      type: string;
      status: string;
    }> = [];
    if ((this.prisma as any).blockerTicket?.findMany) {
      const [openBlockers, userBlockers] = await Promise.all([
        (this.prisma as any).blockerTicket.findMany({
          where: {
            status: { in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] },
          },
          orderBy: { raisedAt: 'desc' },
          take: 30,
        }),
        (this.prisma as any).blockerTicket.findMany({
          where: {
            raisedByUserId: userId,
            status: { in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] },
          },
          orderBy: { raisedAt: 'desc' },
          select: {
            id: true,
            description: true,
            severity: true,
            type: true,
            status: true,
          },
        }),
      ]);
      activeBlockers = (openBlockers || []).map((b: any) => ({
        id: b.id,
        code: `#BLK-${String(b.id).slice(0, 6).toUpperCase()}`,
        description: b.description,
        severity: b.severity,
        projectCodeReference: b.projectCodeReference || null,
        status: b.status,
      }));
      myActiveBlockers = (userBlockers || []).map((b: any) => ({
        id: b.id,
        code: `#BLK-${String(b.id).slice(0, 6).toUpperCase()}`,
        description: b.description,
        severity: b.severity,
        type: b.type,
        status: b.status,
      }));
    }

    // Perkaya record dengan metadata projectCode & linkedBlockerId dari orgContextSnapshot
    let enrichedRecord: any = record;
    if (record) {
      const snap = (record.orgContextSnapshot as any) || {};
      const commitmentMeta = snap.commitmentMeta || {};
      const additionalWorkMeta = snap.additionalWorkMeta || {};

      enrichedRecord = {
        ...record,
        commitments: (record.commitments || []).map((c: any) => {
          const meta = commitmentMeta[String(c.sequenceNo)] || {};
          return {
            ...c,
            projectCode: meta.projectCode || null,
            linkedBlockerId: meta.linkedBlockerId || c.blockers?.[0]?.id || null,
          };
        }),
        additionalWorks: (record.additionalWorks || []).map((aw: any) => {
          const meta = additionalWorkMeta[String(aw.id)] || {};
          return {
            ...aw,
            projectCode: meta.projectCode || null,
            linkedBlockerId: meta.linkedBlockerId || null,
            referenceLink: meta.referenceLink || null,
          };
        }),
      };
    }

    return {
      workDate: todayStr,
      currentTime: currentTimeStr,
      cutoffTimings: {
        morningOnTimeCutoff,
        morningLockCutoff,
        eodOnTimeCutoff,
        eodLockCutoff,
        isMorningLocked,
        isEodLocked,
      },
      activeLeave: activeLeave
        ? {
            id: activeLeave.id,
            leaveType: activeLeave.leaveType,
            startDate: activeLeave.startDate.toISOString().split('T')[0],
            endDate: activeLeave.endDate.toISOString().split('T')[0],
            reason: activeLeave.reason,
          }
        : null,
      activeExemption: activeExemption
        ? {
            id: activeExemption.id,
            exemptionCategory: activeExemption.exemptionCategory,
            officialReferenceNumber: activeExemption.officialReferenceNumber || null,
            startDate: activeExemption.startDate.toISOString().split('T')[0],
            endDate: activeExemption.endDate
              ? activeExemption.endDate.toISOString().split('T')[0]
              : null,
            isPermanent: !activeExemption.endDate,
            reason: activeExemption.reason,
          }
        : null,
      record: enrichedRecord,
      availableCarryOvers,
      availableProjects,
      activeBlockers,
      myActiveBlockers,
      tomorrowPriority,
    };
  }

  /**
   * Mengirimkan Morning Commitment (0–3 komitmen) dengan penegakan DEC-002, DEC-004, DEC-008, DEC-013.
   */
  async submitMorningCheckin(userId: string, dto: SubmitMorningCheckinDto) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputWorkDate = dto.workDate.split('T')[0];

    // Penegakan DEC-008: Dilarang Backdating
    if (inputWorkDate < todayStr) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN,
        message: `Pengisian komitmen pagi tidak boleh menggunakan tanggal masa lampau (${inputWorkDate} < ${todayStr}).`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const workDate = new Date(inputWorkDate);

    // Penegakan DEC-008 & DEC-018: Pembebasan otomatis pengisian komitmen saat cuti resmi atau dispensasi aktif
    await this.assertNotOnLeaveOrExemption(userId, workDate, 'komitmen harian');

    // Ambil kebijakan waktu checkin
    const timingPolicy = await this.policyService.getActivePolicy(
      PolicyCategory.CHECKIN_TIMING,
      workDate,
    );
    const timingConfig = timingPolicy.configurationValues;

    const currentTimeStr = this.clockService
      .now()
      .toLocaleTimeString('en-GB', {
        timeZone: timingConfig.timezone || 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    // Penegakan DEC-002: Penguncian cut-off
    if (currentTimeStr > (timingConfig.morningLockCutoff || '09:30')) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
        message: `Batas waktu pengisian Morning Commitment telah terlewati (${timingConfig.morningLockCutoff || '09:30'} WIB) dan formulir terkunci. Silakan ajukan permohonan koreksi jika diperlukan.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    // Validasi jumlah komitmen (0 hingga 3)
    if (!dto.commitments || dto.commitments.length > 3) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Jumlah komitmen harian harus berada di antara 0 hingga 3 tugas.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Kasus 0 Komitmen
    if (dto.commitments.length === 0) {
      if (!dto.zeroCommitmentReason || dto.zeroCommitmentReason.trim().length < 10) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Pengisian 0 komitmen WAJIB menyertakan alasan sah minimal 10 karakter.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // Evaluasi status timing (On-Time vs Late)
    const morningTiming =
      currentTimeStr <= (timingConfig.morningOnTimeCutoff || '09:00')
        ? TimingStatus.ON_TIME
        : TimingStatus.LATE;

    // Evaluasi initial daily status
    let initialDailyStatus: DailyRiskStatus = DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT;
    if (dto.commitments.length > 0) {
      const hasRed = dto.commitments.some((c) => c.initialRisk === CommitmentRisk.RED);
      const hasAmber = dto.commitments.some(
        (c) => c.initialRisk === CommitmentRisk.AMBER || !!c.linkedBlockerId,
      );
      if (hasRed) {
        initialDailyStatus = DailyRiskStatus.RED;
      } else if (hasAmber) {
        initialDailyStatus = DailyRiskStatus.AMBER;
      } else {
        initialDailyStatus = DailyRiskStatus.GREEN;
      }
    }

    // Ambil snapshot konteks organisasi user saat ini
    const activeOrg = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId,
        effectiveDate: { lte: workDate },
        OR: [{ endDate: null }, { endDate: { gte: workDate } }],
      },
    });

    const orgContextSnapshot = {
      role: activeOrg?.role || 'EMPLOYEE',
      function: activeOrg?.function || 'ENGINEERING',
      jobTitle: activeOrg?.jobTitle || 'Anggota Tim',
      directManagerId: activeOrg?.directManagerId || null,
    };

    // Validasi & resolusi copy-forward komitmen (DEC-013)
    const prevWorkdayStr = await this.workdayService.getPreviousWorkday(userId, workDate);
    const resolvedCommitments: any[] = [];
    const commitmentMeta: Record<string, { projectCode?: string | null; linkedBlockerId?: string | null }> = {};

    for (let i = 0; i < dto.commitments.length; i++) {
      const item = dto.commitments[i];
      let resolvedKnownBlockerNote = item.knownBlockerNote
        ? item.knownBlockerNote.trim()
        : null;
      const linkedBlockerId =
        item.linkedBlockerId && item.linkedBlockerId.trim()
          ? item.linkedBlockerId.trim()
          : null;

      // Penegakan DEC-020: Risiko RED wajib menautkan tiket Blocker aktif yang masih berjalan
      if (item.initialRisk === CommitmentRisk.RED) {
        if (!linkedBlockerId) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message: `Komitmen #${i + 1} dengan tingkat risiko RED wajib mengaitkan tiket Blocker aktif. Buat tiket Blocker terlebih dahulu lalu kaitkan sebagai penyebab.`,
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }

        if ((this.prisma as any).blockerTicket?.findUnique) {
          const blocker = await (this.prisma as any).blockerTicket.findUnique({
            where: { id: linkedBlockerId },
            select: { id: true, description: true, status: true },
          });
          const activeStatuses = ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'];
          if (!blocker || !activeStatuses.includes(String(blocker.status))) {
            throw new AppException({
              code: ErrorCode.VALIDATION_FAILED,
              message: `Tiket Blocker yang dikaitkan pada Komitmen #${i + 1} tidak ditemukan atau sudah tidak aktif. Pilih tiket Blocker yang masih berjalan.`,
              statusCode: HttpStatus.BAD_REQUEST,
            });
          }
          if (!resolvedKnownBlockerNote) {
            const blkCode = `#BLK-${String(blocker.id).slice(0, 6).toUpperCase()}`;
            resolvedKnownBlockerNote = `Terkait kendala aktif ${blkCode}: ${blocker.description}`;
          }
        }
      }

      // Penegakan DEC-021: Risiko AMBER/RED wajib menyertakan uraian potensi kendala
      if (
        (item.initialRisk === CommitmentRisk.AMBER ||
          item.initialRisk === CommitmentRisk.RED) &&
        (!resolvedKnownBlockerNote || resolvedKnownBlockerNote.length === 0)
      ) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: `Komitmen #${i + 1} dengan risiko ${item.initialRisk} wajib menyertakan catatan potensi kendala (known blocker note).`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      let isCarryOver = false;
      let carryOverDaysCount = 0;
      let originCommitmentId: string | null = null;

      if (item.originCommitmentId) {
        const parentCommitment = await this.prisma.commitment.findUnique({
          where: { id: item.originCommitmentId },
          include: { dailyRecord: true },
        });

        if (
          !parentCommitment ||
          parentCommitment.dailyRecord.userId !== userId ||
          parentCommitment.dailyRecord.workDate.toISOString().split('T')[0] !== prevWorkdayStr
        ) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message: `Komitmen #${i + 1} merujuk ke tugas carry-over yang tidak valid atau bukan berasal dari hari kerja sebelumnya (${prevWorkdayStr}).`,
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }

        isCarryOver = true;
        originCommitmentId = parentCommitment.id;
        carryOverDaysCount = parentCommitment.carryOverDaysCount + 1;
      }

      const seqNo = i + 1;
      const projectCode = item.projectCode && item.projectCode.trim() ? item.projectCode.trim() : null;
      if (projectCode || linkedBlockerId) {
        commitmentMeta[String(seqNo)] = { projectCode, linkedBlockerId };
      }

      resolvedCommitments.push({
        sequenceNo: seqNo,
        taskText: item.taskText.trim(),
        referenceLink: item.referenceLink ? item.referenceLink.trim() : null,
        initialRisk: item.initialRisk,
        knownBlockerNote: resolvedKnownBlockerNote,
        supportNeeded: item.supportNeeded ? item.supportNeeded.trim() : null,
        isCarryOver,
        carryOverDaysCount,
        originCommitmentId,
        projectCode,
        linkedBlockerId,
      });
    }

    if (Object.keys(commitmentMeta).length > 0) {
      (orgContextSnapshot as any).commitmentMeta = commitmentMeta;
    }

    // 1. Periksa keberadaan record di luar transaksi terlebih dahulu
    const existing = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate,
        },
      },
    });

    if (existing && existing.morningSubmittedAt != null) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
        message: 'Morning Commitment hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi.',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    let savedRecord: any;

    // Jika record sudah ada dengan morningSubmittedAt == null (misal dari pre-seeding atau cuti)
    if (existing) {
      savedRecord = await this.executeMorningUpdate(
        existing.id,
        timingConfig,
        orgContextSnapshot,
        morningTiming,
        initialDailyStatus,
        dto.zeroCommitmentReason,
        resolvedCommitments,
      );
    } else {
      // 2. Jika record belum ada: jalankan transaksi pembuatan baru dengan proteksi P2002 bersih di luar tx
      try {
        savedRecord = await this.prisma.$transaction(async (tx) => {
          const created = await tx.dailyAccountabilityRecord.create({
            data: {
              userId,
              workDate,
              orgContextSnapshot,
              policySnapshot: timingConfig,
              morningSubmittedAt: this.clockService.now(),
              morningTiming,
              initialDailyStatus,
              zeroCommitmentReason: dto.zeroCommitmentReason ? dto.zeroCommitmentReason.trim() : null,
            },
          });

          for (const c of resolvedCommitments) {
            await tx.commitment.create({
              data: {
                dailyRecordId: created.id,
                sequenceNo: c.sequenceNo,
                taskText: c.taskText,
                referenceLink: c.referenceLink,
                initialRisk: c.initialRisk,
                knownBlockerNote: c.knownBlockerNote,
                supportNeeded: c.supportNeeded,
                isCarryOver: c.isCarryOver,
                carryOverDaysCount: c.carryOverDaysCount,
                originCommitmentId: c.originCommitmentId,
              },
            });
          }

          return tx.dailyAccountabilityRecord.findUniqueOrThrow({
            where: { id: created.id },
            include: {
              commitments: {
                orderBy: { sequenceNo: 'asc' },
              },
              additionalWorks: true,
            },
          });
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          // Transaksi gagal telah di-rollback penuh oleh Prisma.
          // Query di bawah dijalankan di luar transaksi pada koneksi bersih:
          const conflicting = await this.prisma.dailyAccountabilityRecord.findUnique({
            where: {
              userId_workDate: {
                userId,
                workDate,
              },
            },
          });

          if (conflicting && conflicting.morningSubmittedAt != null) {
            throw new AppException({
              code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
              message: 'Morning Commitment hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi.',
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            });
          }

          if (conflicting && conflicting.morningSubmittedAt == null) {
            savedRecord = await this.executeMorningUpdate(
              conflicting.id,
              timingConfig,
              orgContextSnapshot,
              morningTiming,
              initialDailyStatus,
              dto.zeroCommitmentReason,
              resolvedCommitments,
            );
          } else {
            throw new AppException({
              code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
              message: 'Morning Commitment hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi.',
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            });
          }
        } else {
          throw err;
        }
      }
    }

    if (resolvedCommitments.length === 0 && dto.zeroCommitmentReason?.trim()) {
      await this.notifyZeroCommitmentToManager({
        actorUserId: userId,
        directManagerId: orgContextSnapshot.directManagerId,
        jobTitle: orgContextSnapshot.jobTitle,
        workDate,
        workDateStr: dto.workDate,
        reason: dto.zeroCommitmentReason.trim(),
        recordId: savedRecord.id,
      });
    }

    return savedRecord;
  }

  /**
   * Helper internal: Memperbarui record harian yang telah ada dengan atomic guard
   */
  private async executeMorningUpdate(
    recordId: string,
    timingConfig: any,
    orgContextSnapshot: any,
    morningTiming: TimingStatus,
    initialDailyStatus: DailyRiskStatus,
    zeroCommitmentReason: string | undefined,
    resolvedCommitments: Array<{
      sequenceNo: number;
      taskText: string;
      referenceLink: string | null;
      initialRisk: CommitmentRisk;
      knownBlockerNote: string | null;
      supportNeeded: string | null;
      isCarryOver: boolean;
      carryOverDaysCount: number;
      originCommitmentId?: string;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.dailyAccountabilityRecord.updateMany({
        where: {
          id: recordId,
          morningSubmittedAt: null, // ATOMIC GUARD: Hanya update jika belum pernah disubmit
        },
        data: {
          morningSubmittedAt: this.clockService.now(),
          morningTiming,
          initialDailyStatus,
          zeroCommitmentReason: zeroCommitmentReason ? zeroCommitmentReason.trim() : null,
          policySnapshot: timingConfig,
          orgContextSnapshot,
        },
      });

      if (updateResult.count === 0) {
        throw new AppException({
          code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
          message: 'Morning Commitment hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi.',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      for (const c of resolvedCommitments) {
        await tx.commitment.create({
          data: {
            dailyRecordId: recordId,
            sequenceNo: c.sequenceNo,
            taskText: c.taskText,
            referenceLink: c.referenceLink,
            initialRisk: c.initialRisk,
            knownBlockerNote: c.knownBlockerNote,
            supportNeeded: c.supportNeeded,
            isCarryOver: c.isCarryOver,
            carryOverDaysCount: c.carryOverDaysCount,
            originCommitmentId: c.originCommitmentId,
          },
        });
      }

      return tx.dailyAccountabilityRecord.findUniqueOrThrow({
        where: { id: recordId },
        include: {
          commitments: {
            orderBy: { sequenceNo: 'asc' },
          },
          additionalWorks: true,
        },
      });
    });
  }

  private formatWibTime(timingPolicyConfig?: any): {
    currentTimeStr: string;
    morningLockCutoff: string;
    eodLockCutoff: string;
  } {
    const config = timingPolicyConfig || {};
    const currentTimeStr = this.clockService.now().toLocaleTimeString('en-GB', {
      timeZone: config.timezone || 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return {
      currentTimeStr,
      morningLockCutoff: config.morningLockCutoff || '09:30',
      eodLockCutoff: config.eodLockCutoff || '21:00',
    };
  }

  private async getActiveLeaveAndExemption(userId: string, targetDate: Date) {
    let activeLeave: any = null;
    if ((this.prisma as any).leaveRequest?.findFirst) {
      activeLeave = await this.prisma.leaveRequest.findFirst({
        where: {
          userId,
          status: LeaveStatus.APPROVED,
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
        select: {
          id: true,
          leaveType: true,
          startDate: true,
          endDate: true,
          reason: true,
        },
      });
    }

    let activeExemption: any = null;
    if ((this.prisma as any).boundedExemption?.findFirst) {
      activeExemption = await (this.prisma as any).boundedExemption.findFirst({
        where: {
          userId,
          startDate: { lte: targetDate },
          OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
        },
        select: {
          id: true,
          exemptionCategory: true,
          officialReferenceNumber: true,
          startDate: true,
          endDate: true,
          reason: true,
        },
      });
    }

    return { activeLeave, activeExemption };
  }

  private async assertNotOnLeaveOrExemption(
    userId: string,
    targetDate: Date,
    activityLabel: string,
  ) {
    const { activeLeave, activeExemption } = await this.getActiveLeaveAndExemption(
      userId,
      targetDate,
    );
    if (activeLeave) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
        message: `Anda sedang dalam masa cuti resmi tercatat. Pengisian ${activityLabel} dinonaktifkan otomatis tanpa perlu memilih 0 komitmen.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
    if (activeExemption) {
      const label = !activeExemption.endDate
        ? `pengecualian permanen (${activeExemption.exemptionCategory})`
        : `masa dispensasi resmi (${activeExemption.exemptionCategory})`;
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
        message: `Anda mendapat ${label}. Pengisian ${activityLabel} dinonaktifkan otomatis tanpa perlu memilih 0 komitmen.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
  }

  private async buildActiveOrgSnapshot(userId: string, workDate: Date) {
    const activeOrg = this.prisma.organizationalAssignment?.findFirst
      ? await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId,
            effectiveDate: { lte: workDate },
            OR: [{ endDate: null }, { endDate: { gte: workDate } }],
          },
        })
      : null;

    return {
      role: activeOrg?.role || 'EMPLOYEE',
      function: activeOrg?.function || 'ENGINEERING',
      jobTitle: activeOrg?.jobTitle || 'Anggota Tim',
      directManagerId: activeOrg?.directManagerId || null,
    };
  }

  private async ensureTodayRecordPostMorningCutoff(
    userId: string,
    workDate: Date,
    timingConfig: any,
    includeRelations = false,
  ) {
    const orgContextSnapshot = await this.buildActiveOrgSnapshot(userId, workDate);
    const includeObj = includeRelations
      ? { commitments: true, additionalWorks: true }
      : undefined;

    try {
      return await this.prisma.dailyAccountabilityRecord.create({
        data: {
          userId,
          workDate,
          orgContextSnapshot,
          policySnapshot: timingConfig,
          morningSubmittedAt: null,
          morningTiming: TimingStatus.NO_SUBMISSION,
          initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
          morningCutoffLockedAt: this.clockService.now(),
        },
        ...(includeObj ? { include: includeObj } : {}),
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const existing = await this.prisma.dailyAccountabilityRecord.findUnique({
          where: { userId_workDate: { userId, workDate } },
          ...(includeObj ? { include: includeObj } : {}),
        });
        if (existing) return existing;
      }
      throw err;
    }
  }

  private async assertAdditionalWorkWindowOpen(record: {
    workDate?: Date | string | null;
    eodSubmittedAt?: Date | null;
    eodCutoffLockedAt?: Date | null;
  }) {
    if (record.eodSubmittedAt) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
        message:
          'Evaluasi Sore (EOD) hari ini sudah dikirim dan ditutup sehingga pekerjaan tambahan baru tidak dapat ditambahkan. Jika ada pekerjaan lembur mendadak setelah Evaluasi Sore (EOD) ditutup, silakan catat pada hari kerja berikutnya.',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (record.eodCutoffLockedAt) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
        message:
          'Batas waktu EOD hari ini telah berakhir dan formulir terkunci sehingga pekerjaan tambahan tidak dapat ditambah, diubah, atau dihapus.',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const recordDateStr = record.workDate
      ? new Date(record.workDate).toISOString().split('T')[0]
      : todayStr;
    const timingPolicy = await this.policyService.getActivePolicy(
      PolicyCategory.CHECKIN_TIMING,
      new Date(recordDateStr),
    );
    const timingConfig = timingPolicy.configurationValues;
    const { currentTimeStr, eodLockCutoff } = this.formatWibTime(timingConfig);

    if (recordDateStr < todayStr || (recordDateStr === todayStr && currentTimeStr > eodLockCutoff)) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
        message: `Batas waktu EOD hari ini telah berakhir (${eodLockCutoff} WIB) dan formulir terkunci sehingga pekerjaan tambahan tidak dapat ditambah, diubah, atau dihapus.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
  }

  private async writeAdditionalWorkAuditLog(
    actorUserId: string,
    actionCode: string,
    workId: string,
    valueBefore: any,
    valueAfter: any,
  ) {
    if (!(this.prisma as any).auditLog?.create) return;
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          actorUserId,
          actionCode,
          relatedEntityType: 'additional_works',
          relatedEntityId: workId,
          valueBefore: valueBefore ?? undefined,
          valueAfter: valueAfter ?? undefined,
        },
      });
    } catch {
      // Abaikan jika tabel audit sedang tidak tersedia pada mock uji
    }
  }

  private async notifyAssigningManager(params: {
    recipientUserId?: string | null;
    actorUserId: string;
    triggerType: 'ADDITIONAL_WORK_UPDATED' | 'ADDITIONAL_WORK_DELETED';
    title: string;
    message: string;
    workId: string;
  }) {
    if (!params.recipientUserId || params.recipientUserId === params.actorUserId) return;
    if (!(this.prisma as any).notification?.create) return;
    const safeTitle =
      params.title.length <= 200 ? params.title : `${params.title.slice(0, 197)}...`;
    try {
      await (this.prisma as any).notification.create({
        data: {
          recipientUserId: params.recipientUserId,
          triggerType: params.triggerType,
          channel: NotificationChannel.IN_APP_CENTER,
          title: safeTitle,
          message: params.message,
          actionUrl: '/dashboard',
          relatedEntityType: 'additional_works',
          relatedEntityId: params.workId,
          status: NotificationStatus.SENT,
        },
      });
    } catch {
      // Abaikan jika pembuatan notifikasi gagal agar operasi utama tetap aman
    }
  }

  private async notifyZeroCommitmentToManager(params: {
    actorUserId: string;
    directManagerId?: string | null;
    jobTitle: string;
    workDate: Date;
    workDateStr: string;
    reason: string;
    recordId: string;
  }) {
    if (!params.directManagerId || params.directManagerId === params.actorUserId) return;
    if (!(this.prisma as any).notification?.create) return;

    let actorName = 'Anggota Tim';
    if ((this.prisma as any).user?.findUnique) {
      try {
        const actor = await (this.prisma as any).user.findUnique({
          where: { id: params.actorUserId },
          select: { fullName: true },
        });
        if (actor?.fullName) {
          actorName = actor.fullName;
        }
      } catch {
        // Gunakan nama bawaan jika lookup gagal
      }
    }

    const recipientIds = new Set<string>([params.directManagerId]);
    if ((this.prisma as any).temporaryReviewer?.findMany) {
      try {
        const activeDelegations = await (this.prisma as any).temporaryReviewer.findMany({
          where: {
            originalManagerId: params.directManagerId,
            status: 'ACTIVE',
            startDate: { lte: params.workDate },
            endDate: { gte: params.workDate },
          },
          select: { reviewerUserId: true },
        });
        for (const del of activeDelegations || []) {
          if (del?.reviewerUserId && del.reviewerUserId !== params.actorUserId) {
            recipientIds.add(del.reviewerUserId);
          }
        }
      } catch {
        // Abaikan jika lookup delegasi gagal
      }
    }

    const rawTitle = `0 Komitmen Dilaporkan: ${actorName}`;
    const safeTitle = rawTitle.length <= 200 ? rawTitle : `${rawTitle.slice(0, 197)}...`;
    const message = `${actorName} (${params.jobTitle}) melaporkan 0 Komitmen (Bebas Komitmen) untuk tanggal ${params.workDateStr} dengan alasan: "${params.reason}"`;

    for (const recipientUserId of recipientIds) {
      try {
        await (this.prisma as any).notification.create({
          data: {
            recipientUserId,
            triggerType: 'ZERO_COMMITMENT_SUBMITTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: safeTitle,
            message,
            actionUrl: '/dashboard',
            relatedEntityType: 'daily_accountability_records',
            relatedEntityId: params.recordId,
            status: NotificationStatus.SENT,
            sentAt: this.clockService.now(),
          },
        });
      } catch {
        // Abaikan jika pembuatan notifikasi gagal agar operasi utama tetap aman
      }
    }
  }

  async submitTodayAdditionalWork(userId: string, dto: SubmitAdditionalWorkDto) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const workDate = new Date(todayStr);

    await this.assertNotOnLeaveOrExemption(userId, workDate, 'pekerjaan tambahan');

    const timingPolicy = await this.policyService.getActivePolicy(
      PolicyCategory.CHECKIN_TIMING,
      workDate,
    );
    const timingConfig = timingPolicy.configurationValues;
    const { currentTimeStr, morningLockCutoff, eodLockCutoff } = this.formatWibTime(timingConfig);

    let record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        userId_workDate: { userId, workDate },
      },
    });

    if (!record) {
      if (currentTimeStr <= morningLockCutoff) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Silakan kirimkan Morning Commitment terlebih dahulu sebelum menambahkan pekerjaan tambahan.',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      if (currentTimeStr > eodLockCutoff) {
        throw new AppException({
          code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
          message: `Batas waktu EOD hari ini telah berakhir (${eodLockCutoff} WIB) dan formulir terkunci sehingga pekerjaan tambahan tidak dapat ditambahkan.`,
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      record = await this.ensureTodayRecordPostMorningCutoff(userId, workDate, timingConfig);
    }

    return this.submitAdditionalWork(userId, record.id, dto);
  }

  async submitAdditionalWork(userId: string, recordId: string, dto: SubmitAdditionalWorkDto) {
    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: { id: recordId },
    });

    if (!record || record.userId !== userId) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Catatan akuntabilitas harian tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (record.workDate) {
      await this.assertNotOnLeaveOrExemption(
        userId,
        new Date(record.workDate),
        'pekerjaan tambahan',
      );
    }

    await this.assertAdditionalWorkWindowOpen(record);

    if (
      dto.reason === AdditionalWorkReason.MORNING_CUTOFF_MISSED &&
      record.morningSubmittedAt != null
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Alasan "Komitmen Pagi Terlewat" hanya dapat dipilih apabila pengisian Komitmen Pagi hari ini memang terlewat batas waktu.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const existingCount = await this.prisma.additionalWork.count({
      where: { dailyRecordId: record.id },
    });

    if (existingCount >= 5) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Maksimum 5 tugas tambahan per hari kerja telah terpenuhi.',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (dto.reason === AdditionalWorkReason.NEWLY_ASSIGNED && !dto.assignedByUserId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Pekerjaan dengan alasan Penugasan Baru (NEWLY_ASSIGNED) wajib menyertakan atasan yang menugaskan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.assignedByUserId) {
      await assertUserIsNotIntern(this.prisma, dto.assignedByUserId, 'atasan penugas');
    }

    const createdAw = await this.prisma.additionalWork.create({
      data: {
        dailyRecordId: record.id,
        taskText: dto.taskText.trim(),
        reason: dto.reason,
        assignedByUserId:
          dto.reason === AdditionalWorkReason.NEWLY_ASSIGNED ? dto.assignedByUserId || null : null,
      },
      include: {
        assignedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    const projectCode = dto.projectCode && dto.projectCode.trim() ? dto.projectCode.trim() : null;
    const linkedBlockerId = dto.linkedBlockerId && dto.linkedBlockerId.trim() ? dto.linkedBlockerId.trim() : null;
    const referenceLink = dto.referenceLink && dto.referenceLink.trim() ? dto.referenceLink.trim() : null;

    if ((projectCode || linkedBlockerId || referenceLink) && createdAw?.id && this.prisma.dailyAccountabilityRecord.update) {
      const currentSnap = (record.orgContextSnapshot as any) || {};
      const additionalWorkMeta = {
        ...(currentSnap.additionalWorkMeta || {}),
        [String(createdAw.id)]: { projectCode, linkedBlockerId, referenceLink },
      };
      await this.prisma.dailyAccountabilityRecord.update({
        where: { id: record.id },
        data: {
          orgContextSnapshot: {
            ...currentSnap,
            additionalWorkMeta,
          },
        },
      });
    }

    if (createdAw?.id) {
      await this.writeAdditionalWorkAuditLog(
        userId,
        'ADDITIONAL_WORK_CREATED',
        createdAw.id,
        null,
        {
          dailyRecordId: record.id,
          taskText: createdAw.taskText,
          reason: createdAw.reason,
          assignedByUserId: createdAw.assignedByUserId || null,
          projectCode,
          linkedBlockerId,
          referenceLink,
        },
      );
    }

    if (!createdAw) return createdAw;
    return {
      ...createdAw,
      projectCode,
      linkedBlockerId,
      referenceLink,
    };
  }

  async updateAdditionalWork(userId: string, workId: string, dto: SubmitAdditionalWorkDto) {
    const existing = await (this.prisma.additionalWork as any).findUnique({
      where: { id: workId },
      include: {
        dailyRecord: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
        assignedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing || existing.dailyRecord?.userId !== userId) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pekerjaan tambahan tidak ditemukan atau bukan milik Anda.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.assertAdditionalWorkWindowOpen(existing.dailyRecord);

    if (
      dto.reason === AdditionalWorkReason.MORNING_CUTOFF_MISSED &&
      existing.dailyRecord.morningSubmittedAt != null
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Alasan "Komitmen Pagi Terlewat" hanya dapat dipilih apabila pengisian Komitmen Pagi hari ini memang terlewat batas waktu.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.reason === AdditionalWorkReason.NEWLY_ASSIGNED && !dto.assignedByUserId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Pekerjaan dengan alasan Penugasan Baru (NEWLY_ASSIGNED) wajib menyertakan atasan yang menugaskan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.assignedByUserId) {
      await assertUserIsNotIntern(this.prisma, dto.assignedByUserId, 'atasan penugas');
    }

    const currentSnap = (existing.dailyRecord.orgContextSnapshot as any) || {};
    const prevMeta = currentSnap.additionalWorkMeta?.[String(workId)] || {};
    const valueBefore = {
      taskText: existing.taskText,
      reason: existing.reason,
      assignedByUserId: existing.assignedByUserId || null,
      projectCode: prevMeta.projectCode || null,
      linkedBlockerId: prevMeta.linkedBlockerId || null,
      referenceLink: prevMeta.referenceLink || null,
    };

    const nextAssignedByUserId =
      dto.reason === AdditionalWorkReason.NEWLY_ASSIGNED ? dto.assignedByUserId || null : null;

    const updatedAw = await this.prisma.additionalWork.update({
      where: { id: workId },
      data: {
        taskText: dto.taskText.trim(),
        reason: dto.reason,
        assignedByUserId: nextAssignedByUserId,
      },
      include: {
        assignedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    const projectCode = dto.projectCode && dto.projectCode.trim() ? dto.projectCode.trim() : null;
    const linkedBlockerId = dto.linkedBlockerId && dto.linkedBlockerId.trim() ? dto.linkedBlockerId.trim() : null;
    const referenceLink = dto.referenceLink && dto.referenceLink.trim() ? dto.referenceLink.trim() : null;

    if (this.prisma.dailyAccountabilityRecord.update) {
      const nextMetaMap = { ...(currentSnap.additionalWorkMeta || {}) };
      if (projectCode || linkedBlockerId || referenceLink) {
        nextMetaMap[String(workId)] = { projectCode, linkedBlockerId, referenceLink };
      } else {
        delete nextMetaMap[String(workId)];
      }
      await this.prisma.dailyAccountabilityRecord.update({
        where: { id: existing.dailyRecordId },
        data: {
          orgContextSnapshot: {
            ...currentSnap,
            additionalWorkMeta: nextMetaMap,
          },
        },
      });
    }

    const valueAfter = {
      taskText: updatedAw.taskText,
      reason: updatedAw.reason,
      assignedByUserId: updatedAw.assignedByUserId || null,
      projectCode,
      linkedBlockerId,
      referenceLink,
    };

    await this.writeAdditionalWorkAuditLog(
      userId,
      'ADDITIONAL_WORK_UPDATED',
      workId,
      valueBefore,
      valueAfter,
    );

    const prevManagerId =
      existing.reason === AdditionalWorkReason.NEWLY_ASSIGNED ? existing.assignedByUserId : null;
    const nextManagerId = nextAssignedByUserId;
    const notifyTargets = Array.from(
      new Set([prevManagerId, nextManagerId].filter((id): id is string => Boolean(id))),
    );
    const actorName = existing.dailyRecord?.user?.fullName || 'Anggota Tim';

    for (const targetManagerId of notifyTargets) {
      const isReassignedAway = prevManagerId === targetManagerId && nextManagerId !== targetManagerId;
      const message = isReassignedAway
        ? `${actorName} mengubah rincian atau kategori penugasan tambahan yang sebelumnya merujuk kepada Anda.\nTugas Sebelumnya: "${existing.taskText}"\nTugas Terbaru: "${updatedAw.taskText}"`
        : `${actorName} memperbarui pekerjaan tambahan dari Anda.\nTugas Sebelumnya: "${existing.taskText}"\nTugas Terbaru: "${updatedAw.taskText}"`;

      await this.notifyAssigningManager({
        recipientUserId: targetManagerId,
        actorUserId: userId,
        triggerType: 'ADDITIONAL_WORK_UPDATED',
        title: 'Pekerjaan Tambahan dari Anda Diubah',
        message,
        workId,
      });
    }

    return {
      ...updatedAw,
      projectCode,
      linkedBlockerId,
      referenceLink,
    };
  }

  async deleteAdditionalWork(userId: string, workId: string, deleteReason: string) {
    const cleanReason = (deleteReason || '').trim();
    if (cleanReason.length < 5) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Alasan penghapusan pekerjaan tambahan wajib diisi minimal 5 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const existing = await (this.prisma.additionalWork as any).findUnique({
      where: { id: workId },
      include: {
        dailyRecord: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
        assignedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing || existing.dailyRecord?.userId !== userId) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pekerjaan tambahan tidak ditemukan atau bukan milik Anda.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.assertAdditionalWorkWindowOpen(existing.dailyRecord);

    const currentSnap = (existing.dailyRecord.orgContextSnapshot as any) || {};
    const prevMeta = currentSnap.additionalWorkMeta?.[String(workId)] || {};
    const valueBefore = {
      dailyRecordId: existing.dailyRecordId,
      taskText: existing.taskText,
      reason: existing.reason,
      assignedByUserId: existing.assignedByUserId || null,
      projectCode: prevMeta.projectCode || null,
      linkedBlockerId: prevMeta.linkedBlockerId || null,
      referenceLink: prevMeta.referenceLink || null,
    };

    await (this.prisma.additionalWork as any).delete({
      where: { id: workId },
    });

    if (
      currentSnap.additionalWorkMeta?.[String(workId)] &&
      this.prisma.dailyAccountabilityRecord.update
    ) {
      const nextMetaMap = { ...(currentSnap.additionalWorkMeta || {}) };
      delete nextMetaMap[String(workId)];
      await this.prisma.dailyAccountabilityRecord.update({
        where: { id: existing.dailyRecordId },
        data: {
          orgContextSnapshot: {
            ...currentSnap,
            additionalWorkMeta: nextMetaMap,
          },
        },
      });
    }

    await this.writeAdditionalWorkAuditLog(
      userId,
      'ADDITIONAL_WORK_DELETED',
      workId,
      valueBefore,
      {
        deleted: true,
        deleteReason: cleanReason,
      },
    );

    if (
      existing.reason === AdditionalWorkReason.NEWLY_ASSIGNED &&
      existing.assignedByUserId
    ) {
      const actorName = existing.dailyRecord?.user?.fullName || 'Anggota Tim';
      await this.notifyAssigningManager({
        recipientUserId: existing.assignedByUserId,
        actorUserId: userId,
        triggerType: 'ADDITIONAL_WORK_DELETED',
        title: 'Pekerjaan Tambahan dari Anda Dihapus',
        message: `${actorName} menghapus pekerjaan tambahan yang Anda tugaskan: "${existing.taskText}".\nAlasan Penghapusan: "${cleanReason}"`,
        workId,
      });
    }

    return {
      deleted: true,
      id: workId,
    };
  }

  private prepareEodOutcomeData(
    item: {
      outcome: CommitmentOutcome;
      outcomeReason?: string;
      continuation?: ContinuationStatus;
      continuationReason?: string;
    },
    itemLabel: string,
  ) {
    if (
      item.outcome === CommitmentOutcome.CANCELLED &&
      (!item.outcomeReason || !item.outcomeReason.trim())
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: `${itemLabel} yang dibatalkan (CANCELLED) wajib menyertakan alasan pembatalan.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const allowsContinuation =
      item.outcome === CommitmentOutcome.PARTIALLY_COMPLETED ||
      item.outcome === CommitmentOutcome.NOT_COMPLETED;

    if (
      allowsContinuation &&
      item.continuation === ContinuationStatus.DO_NOT_CONTINUE &&
      (!item.continuationReason || !item.continuationReason.trim())
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: `${itemLabel} yang tidak dilanjutkan (DO_NOT_CONTINUE) wajib menyertakan alasan tidak dilanjutkan.`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      outcome: item.outcome,
      outcomeReason: item.outcomeReason?.trim() ? item.outcomeReason.trim() : null,
      continuation: allowsContinuation ? item.continuation || null : null,
      continuationReason:
        allowsContinuation && item.continuationReason?.trim()
          ? item.continuationReason.trim()
          : null,
      isEodLocked: true,
    };
  }

  /**
   * Mengirimkan evaluasi hasil akhir hari (EOD Outcome, Prototipe 04).
   * Menegakkan DEC-002, DEC-003 (Larangan keras lock status GREEN!), FR-08..10.
   */
  async submitEodOutcome(userId: string, dto: SubmitEodOutcomeDto) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputWorkDate = dto.workDate.split('T')[0];

    const workDate = new Date(inputWorkDate);

    // Penegakan DEC-008 & DEC-018: Pembebasan pelaporan EOD saat cuti resmi atau dispensasi aktif
    await this.assertNotOnLeaveOrExemption(userId, workDate, 'evaluasi sore (EOD)');

    const existingRecord = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        userId_workDate: {
          userId,
          workDate,
        },
      },
      include: {
        commitments: true,
        additionalWorks: true,
      },
    });

    // Ambil kebijakan waktu sebelum evaluasi EOD (mendukung Opsi A bila pagi terlewat pasca Cut-Off)
    const timingPolicy = await this.policyService.getActivePolicy(
      PolicyCategory.CHECKIN_TIMING,
      workDate,
    );
    const timingConfig = timingPolicy.configurationValues;
    const { currentTimeStr, morningLockCutoff, eodLockCutoff } = this.formatWibTime(timingConfig);

    const record =
      existingRecord ||
      (inputWorkDate === todayStr &&
      currentTimeStr > morningLockCutoff &&
      currentTimeStr <= eodLockCutoff
        ? await this.ensureTodayRecordPostMorningCutoff(userId, workDate, timingConfig, true)
        : null);

    if (!record) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Catatan akuntabilitas untuk tanggal tersebut tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Penegakan DEF-002: Tolak jika EOD Outcome sudah pernah disubmit
    if (record.eodSubmittedAt != null) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
        message: 'EOD Outcome hari ini telah diserahkan dan terkunci. Perubahan data wajib melalui alur permohonan koreksi resmi.',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    // Penegakan DEC-002: EOD Cut-off Lock pasca 21:00
    if (currentTimeStr > eodLockCutoff) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
        message: `Batas waktu pengisian EOD Outcome telah terlewati (${eodLockCutoff} WIB) dan formulir terkunci.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    // Penegakan FR-10: Penjelasan risiko harian wajib minimal 10 karakter bila status akhir AMBER atau RED
    const requiresDailyRiskExplanation =
      dto.finalDailyStatus === DailyRiskStatus.AMBER ||
      dto.finalDailyStatus === DailyRiskStatus.RED;
    const normalizedDailyRiskExplanation = dto.dailyRiskExplanation?.trim() || '';
    if (requiresDailyRiskExplanation && normalizedDailyRiskExplanation.length < 10) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Penjelasan risiko atau kendala harian wajib diisi minimal 10 karakter ketika status akhir hari AMBER atau RED.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const preparedCommitments = dto.commitmentOutcomes.map((item) => ({
      commitmentId: item.commitmentId,
      data: this.prepareEodOutcomeData(item, 'Komitmen'),
    }));
    const preparedAdditionalWorks = (dto.additionalWorkOutcomes || []).map((item) => ({
      additionalWorkId: item.additionalWorkId,
      data: this.prepareEodOutcomeData(item, 'Pekerjaan tambahan'),
    }));

    const eodTiming =
      currentTimeStr <= (timingConfig.eodOnTimeCutoff || '17:00')
        ? TimingStatus.ON_TIME
        : TimingStatus.LATE;

    return this.prisma.$transaction(async (tx) => {
      for (const item of preparedCommitments) {
        await tx.commitment.update({
          where: { id: item.commitmentId },
          data: item.data,
        });
      }

      for (const item of preparedAdditionalWorks) {
        await tx.additionalWork.update({
          where: { id: item.additionalWorkId },
          data: item.data,
        });
      }

      // Update record EOD secara atomic dengan conditional guard (eodSubmittedAt: null)
      // DEC-003: Hak opsi GREEN tetap sah dan dilarang dikunci
      const updatedOrgContext: Record<string, any> = {
        ...((record.orgContextSnapshot as any) || {}),
      };
      if (requiresDailyRiskExplanation && normalizedDailyRiskExplanation) {
        updatedOrgContext.dailyRiskExplanation = normalizedDailyRiskExplanation;
      } else {
        delete updatedOrgContext.dailyRiskExplanation;
      }
      if (dto.tomorrowPriority && dto.tomorrowPriority.trim()) {
        updatedOrgContext.tomorrowPriority = dto.tomorrowPriority.trim();
      }

      const updateResult = await tx.dailyAccountabilityRecord.updateMany({
        where: {
          id: record.id,
          eodSubmittedAt: null, // KRITERIA ATOMIC GUARD: Hanya update jika belum pernah disubmit
        },
        data: {
          eodSubmittedAt: this.clockService.now(),
          eodTiming,
          finalDailyStatus: dto.finalDailyStatus,
          orgContextSnapshot: updatedOrgContext,
        },
      });

      if (updateResult.count === 0) {
        throw new AppException({
          code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
          message: 'Evaluasi EOD Outcome hari ini telah ditutup secara resmi dan terkunci. Perubahan data wajib melalui alur permohonan koreksi EOD.',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }

      // Query data segar terbaru yang benar-benar tersimpan di database
      return tx.dailyAccountabilityRecord.findUniqueOrThrow({
        where: { id: record.id },
        include: {
          commitments: {
            orderBy: { sequenceNo: 'asc' },
          },
          additionalWorks: {
            orderBy: { createdAt: 'asc' },
            include: { assignedByUser: { select: { id: true, fullName: true } } },
          },
        },
      });
    });
  }

  /**
   * Mengambil riwayat log mingguan karyawan.
   */
  async getWeeklyHistory(userId: string, startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default: 7 hari terakhir berdasarkan tanggal hari ini di Asia/Jakarta (WIB)
      const todayStr = this.clockService.todayString('Asia/Jakarta');
      end = new Date(`${todayStr}T00:00:00.000Z`);
      start = new Date(end);
      start.setUTCDate(start.getUTCDate() - 6);
    }

    const records = await this.prisma.dailyAccountabilityRecord.findMany({
      where: {
        userId,
        workDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        commitments: {
          orderBy: { sequenceNo: 'asc' },
          include: { blockers: true },
        },
        additionalWorks: true,
      },
      orderBy: { workDate: 'desc' },
    });

    // Ringkasan KPI
    const totalDays = records.length;
    const onTimeSubmissions = records.filter(
      (r) => r.morningTiming === TimingStatus.ON_TIME,
    ).length;
    const greenDays = records.filter(
      (r) => r.finalDailyStatus === DailyRiskStatus.GREEN,
    ).length;
    const amberDays = records.filter(
      (r) => r.finalDailyStatus === DailyRiskStatus.AMBER,
    ).length;
    const redDays = records.filter(
      (r) => r.finalDailyStatus === DailyRiskStatus.RED,
    ).length;

    const [recordedLeaves, recordedExemptions] = await Promise.all([
      (this.prisma as any).leaveRequest?.findMany
        ? this.prisma.leaveRequest.findMany({
            where: {
              userId,
              status: LeaveStatus.APPROVED,
            },
            include: {
              reviewedBy: { select: { id: true, fullName: true } },
            },
            orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
            take: 25,
          })
        : Promise.resolve([]),
      (this.prisma as any).boundedExemption?.findMany
        ? (this.prisma as any).boundedExemption.findMany({
            where: { userId },
            include: {
              createdByUser: { select: { id: true, fullName: true } },
            },
            orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
            take: 25,
          })
        : Promise.resolve([]),
    ]);

    return {
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      kpi: {
        totalDays,
        onTimeSubmissions,
        onTimeRate: totalDays > 0 ? Math.round((onTimeSubmissions / totalDays) * 100) : 0,
        greenDays,
        amberDays,
        redDays,
      },
      records,
      recordedLeaves: recordedLeaves || [],
      recordedExemptions: recordedExemptions || [],
    };
  }
}

