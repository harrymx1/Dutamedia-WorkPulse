import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { PolicyService } from '../../policy/services/policy.service';
import { WorkdayService } from './workday.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  CommitmentOutcome,
  CommitmentRisk,
  ContinuationStatus,
  DailyRiskStatus,
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

    // Ambil komitmen carry-over yang tersedia dari previousWorkday (FR-11, DEC-013)
    let availableCarryOvers: any[] = [];
    if (!record || record.commitments.length === 0) {
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
        availableCarryOvers = prevRecord.commitments
          .filter((c) => c.continuation === ContinuationStatus.CONTINUE)
          .map((c) => {
            const nextCount = c.carryOverDaysCount + 1;
            return {
              originCommitmentId: c.id,
              taskText: c.taskText,
              referenceLink: c.referenceLink,
              carryOverDaysCount: nextCount,
              suggestedRisk: nextCount >= 3 ? CommitmentRisk.AMBER : c.initialRisk,
              isAmberWarningAdvised: nextCount >= 3, // DEC-003: Saran AMBER jika 3+ hari berlanjut
            };
          });
      }
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
      record,
      availableCarryOvers,
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
        message: `Pengisian komitmen pagi tidak boleh menggunakan tanggal masa lampau (${inputWorkDate} < ${todayStr}) sesuai DEC-008.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const workDate = new Date(inputWorkDate);

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
        message: `Batas waktu pengisian Morning Commitment telah terlewati (${timingConfig.morningLockCutoff || '09:30'} WIB) dan formulir terkunci (DEC-002). Silakan ajukan permohonan koreksi jika diperlukan.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    // Validasi jumlah komitmen (0 hingga 3) - DEC-004
    if (!dto.commitments || dto.commitments.length > 3) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Jumlah komitmen harian harus berada di antara 0 hingga 3 tugas (DEC-004).',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Kasus 0 Komitmen (DEC-004)
    if (dto.commitments.length === 0) {
      if (!dto.zeroCommitmentReason || dto.zeroCommitmentReason.trim().length < 10) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Pengisian 0 komitmen WAJIB menyertakan alasan sah minimal 10 karakter (DEC-004).',
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
      const hasAmber = dto.commitments.some((c) => c.initialRisk === CommitmentRisk.AMBER);
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

    for (let i = 0; i < dto.commitments.length; i++) {
      const item = dto.commitments[i];

      // Validasi catatan kendala untuk AMBER / RED
      if (
        (item.initialRisk === CommitmentRisk.AMBER || item.initialRisk === CommitmentRisk.RED) &&
        (!item.knownBlockerNote || item.knownBlockerNote.trim().length === 0)
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

      resolvedCommitments.push({
        sequenceNo: i + 1,
        taskText: item.taskText.trim(),
        referenceLink: item.referenceLink ? item.referenceLink.trim() : null,
        initialRisk: item.initialRisk,
        knownBlockerNote: item.knownBlockerNote ? item.knownBlockerNote.trim() : null,
        supportNeeded: item.supportNeeded ? item.supportNeeded.trim() : null,
        isCarryOver,
        carryOverDaysCount,
        originCommitmentId,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // Upsert daily record
      const record = await tx.dailyAccountabilityRecord.upsert({
        where: {
          userId_workDate: {
            userId,
            workDate,
          },
        },
        create: {
          userId,
          workDate,
          orgContextSnapshot,
          policySnapshot: timingConfig,
          morningSubmittedAt: this.clockService.now(),
          morningTiming,
          initialDailyStatus,
          zeroCommitmentReason: dto.zeroCommitmentReason ? dto.zeroCommitmentReason.trim() : null,
        },
        update: {
          morningSubmittedAt: this.clockService.now(),
          morningTiming,
          initialDailyStatus,
          zeroCommitmentReason: dto.zeroCommitmentReason ? dto.zeroCommitmentReason.trim() : null,
        },
      });

      // Hapus komitmen lama jika ada pengiriman ulang sebelum cutoff
      await tx.commitment.deleteMany({
        where: { dailyRecordId: record.id },
      });

      // Masukkan komitmen yang telah divalidasi
      for (const c of resolvedCommitments) {
        await tx.commitment.create({
          data: {
            dailyRecordId: record.id,
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

      return tx.dailyAccountabilityRecord.findUnique({
        where: { id: record.id },
        include: {
          commitments: {
            orderBy: { sequenceNo: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Menambahkan tugas tambahan di siang hari (Additional Work, Prototipe 03).
   */
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

    if (record.eodCutoffLockedAt) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
        message: 'Tidak dapat menambahkan pekerjaan tambahan karena hari kerja telah terkunci (Locked pasca-EOD).',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (dto.reason === 'NEWLY_ASSIGNED' && !dto.assignedByUserId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Pekerjaan dengan alasan Penugasan Baru (NEWLY_ASSIGNED) wajib menyertakan atasan yang menugaskan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return this.prisma.additionalWork.create({
      data: {
        dailyRecordId: record.id,
        taskText: dto.taskText.trim(),
        reason: dto.reason,
        assignedByUserId: dto.assignedByUserId || null,
      },
      include: {
        assignedByUser: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Mengirimkan evaluasi hasil akhir hari (EOD Outcome, Prototipe 04).
   * Menegakkan DEC-002, DEC-003 (Larangan keras lock status GREEN!).
   */
  async submitEodOutcome(userId: string, dto: SubmitEodOutcomeDto) {
    const todayStr = this.clockService.todayString('Asia/Jakarta');
    const inputWorkDate = dto.workDate.split('T')[0];

    const workDate = new Date(inputWorkDate);

    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
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

    if (!record) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Catatan akuntabilitas untuk tanggal tersebut tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Ambil kebijakan waktu
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

    // Penegakan DEC-002: EOD Cut-off Lock pasca 21:00
    if (currentTimeStr > (timingConfig.eodLockCutoff || '21:00')) {
      throw new AppException({
        code: ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED,
        message: `Batas waktu pengisian EOD Outcome telah terlewati (${timingConfig.eodLockCutoff || '21:00'} WIB) dan formulir terkunci (DEC-002).`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const eodTiming =
      currentTimeStr <= (timingConfig.eodOnTimeCutoff || '17:00')
        ? TimingStatus.ON_TIME
        : TimingStatus.LATE;

    return this.prisma.$transaction(async (tx) => {
      // Update hasil komitmen
      for (const item of dto.commitmentOutcomes) {
        if (item.outcome === CommitmentOutcome.CANCELLED && !item.outcomeReason) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message: 'Komitmen yang dibatalkan (CANCELLED) wajib menyertakan alasan pembatalan.',
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }

        if (item.continuation === ContinuationStatus.CONTINUE && !item.continuationReason) {
          throw new AppException({
            code: ErrorCode.VALIDATION_FAILED,
            message: 'Komitmen yang dilanjutkan (CONTINUE) wajib menyertakan alasan kelanjutan.',
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }

        await tx.commitment.update({
          where: { id: item.commitmentId },
          data: {
            outcome: item.outcome,
            outcomeReason: item.outcomeReason ? item.outcomeReason.trim() : null,
            continuation: item.continuation || null,
            continuationReason: item.continuationReason ? item.continuationReason.trim() : null,
            isEodLocked: true,
          },
        });
      }

      // Update pekerjaan tambahan jika ada
      if (dto.additionalWorkOutcomes) {
        for (const item of dto.additionalWorkOutcomes) {
          await tx.additionalWork.update({
            where: { id: item.additionalWorkId },
            data: {
              outcome: item.outcome,
              outcomeReason: item.outcomeReason ? item.outcomeReason.trim() : null,
              continuation: item.continuation || null,
              continuationReason: item.continuationReason ? item.continuationReason.trim() : null,
              isEodLocked: true,
            },
          });
        }
      }

      // Update record EOD
      // DEC-003: Hak opsi GREEN tetap sah dan dilarang dikunci
      const updatedRecord = await tx.dailyAccountabilityRecord.update({
        where: { id: record.id },
        data: {
          eodSubmittedAt: this.clockService.now(),
          eodTiming,
          finalDailyStatus: dto.finalDailyStatus,
        },
        include: {
          commitments: true,
          additionalWorks: true,
        },
      });

      return updatedRecord;
    });
  }

  /**
   * Mengambil riwayat log mingguan karyawan (Prototipe 06).
   */
  async getWeeklyHistory(userId: string, startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default: 7 hari terakhir
      end = this.clockService.now();
      start = new Date(end);
      start.setDate(start.getDate() - 6);
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
    };
  }
}

