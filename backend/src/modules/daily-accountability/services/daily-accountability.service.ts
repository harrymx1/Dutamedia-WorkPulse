import { Injectable, Logger } from '@nestjs/common';
import {
  AdditionalWorkReason,
  CommitmentOutcome,
  Continuation,
  DailyStatus,
  PolicyCategory,
  Prisma,
  SubmissionTiming,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { PolicyService } from '../../policy/policy.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';
import type { MorningCheckinDto } from '../dto/morning-checkin.dto.js';
import type { EodCheckinDto } from '../dto/eod-checkin.dto.js';
import type { ConfirmOverrideDto } from '../dto/confirm-override.dto.js';
import type { PatchCommitmentDto } from '../dto/patch-commitment.dto.js';
import type { CreateAdditionalWorkDto } from '../dto/create-additional-work.dto.js';
import type { PatchAdditionalWorkDto } from '../dto/patch-additional-work.dto.js';
import type { QueryDailyRecordsDto } from '../dto/query-daily-records.dto.js';
import { StatusSuggestionService } from './status-suggestion.service.js';

export function computeWorstOfStatus(statuses: DailyStatus[]): DailyStatus {
  if (statuses.includes(DailyStatus.RED)) {
    return DailyStatus.RED;
  }
  if (statuses.includes(DailyStatus.AMBER)) {
    return DailyStatus.AMBER;
  }
  return DailyStatus.GREEN;
}

export function normalizeDate(dateInput: Date | string): Date {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class DailyAccountabilityService {
  private readonly logger = new Logger(DailyAccountabilityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly policyService: PolicyService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly statusSuggestionService: StatusSuggestionService,
  ) {}

  /**
   * Evaluasi ketepatan waktu submission (SAD §9.2).
   * OnTime: submittedAt <= onTimeDeadline
   * Late: onTimeDeadline < submittedAt <= cutOff
   */
  private evaluateTiming(
    now: Date,
    deadlineStr: string = '09:00',
    graceMinutes: number = 30,
  ): { timing: SubmissionTiming; isPastCutoff: boolean } {
    const [dHours, dMinutes] = deadlineStr.split(':').map(Number);
    const deadline = new Date(now);
    deadline.setHours(dHours, dMinutes, 0, 0);

    const cutoff = new Date(deadline.getTime() + graceMinutes * 60 * 1000);

    if (now <= deadline) {
      return { timing: SubmissionTiming.OnTime, isPastCutoff: false };
    }
    if (now <= cutoff) {
      return { timing: SubmissionTiming.Late, isPastCutoff: false };
    }
    return { timing: SubmissionTiming.Late, isPastCutoff: true };
  }

  /**
   * Menghitung daftar aksi yang valid untuk state saat ini (SAD §7.12).
   */
  computeAvailableActions(
    record: any,
    userId: string,
  ): string[] {
    const actions: string[] = [];
    if (!record) {
      actions.push('morning_checkin');
      return actions;
    }

    if (record.employeeUserId !== userId) {
      return actions;
    }

    if (!record.morningSubmittedAt) {
      actions.push('morning_checkin');
      return actions;
    }

    // Morning checkin sudah dilakukan
    const hasUnsavedMorningLock = record.commitments?.some(
      (c: any) => !c.isMorningLocked,
    );
    if (hasUnsavedMorningLock && !record.cutoffLockedAt) {
      actions.push('edit_commitment');
    }

    // Per ADR-001, AdditionalWork selalu dapat ditambah kapan saja
    actions.push('add_additional_work');

    // EOD check-in
    if (!record.eodSubmittedAt) {
      actions.push('eod_checkin');
    } else {
      const hasUnsavedEodLock = record.commitments?.some(
        (c: any) => !c.isEodLocked,
      );
      if (hasUnsavedEodLock) {
        actions.push('edit_eod');
      }
    }

    return actions;
  }

  /**
   * EPIC-07-T1: Submit Morning Check-in (SAD §9.3, §10.3).
   * Validasi BR-01, FR-04, hitung initialStatus (worst-of).
   */
  async submitMorningCheckin(userId: string, dto: MorningCheckinDto) {
    const now = new Date();
    const today = normalizeDate(now);

    // 1. Ambil snapshot konteks organisasi aktif (FR-02, FR-24)
    const orgAssignment = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId,
        effectiveDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!orgAssignment) {
      throw new ForbiddenException(
        'Konteks penugasan organisasi aktif tidak ditemukan untuk user ini',
      );
    }

    const orgContextSnapshot = {
      role: orgAssignment.role,
      function: orgAssignment.function,
      directManagerId: orgAssignment.directManagerId,
    };

    // 2. Ambil snapshot kebijakan aktif (FR-33)
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [
        PolicyCategory.Cutoff,
        PolicyCategory.GracePeriod,
        PolicyCategory.WorkdayCalendar,
        PolicyCategory.ParticipationRule,
      ],
      now,
    );

    // 3. Validasi batasan komitmen (BR-01, ParticipationRule)
    const commitments = dto.commitments;
    if (commitments.length < 1 || commitments.length > 3) {
      throw new BusinessRuleViolationException(
        'Jumlah komitmen harian harus antara 1 sampai 3 komitmen (BR-01)',
      );
    }

    const sequenceNos = commitments.map((c) => c.sequenceNo);
    const uniqueSequenceNos = new Set(sequenceNos);
    if (uniqueSequenceNos.size !== commitments.length) {
      throw new BusinessRuleViolationException(
        'sequenceNo untuk setiap komitmen harus unik (1-3)',
      );
    }

    // 4. Validasi kondisional FR-04: knownBlockerNote wajib jika initialRisk in {AMBER, RED}
    for (const c of commitments) {
      if (
        (c.initialRisk === DailyStatus.AMBER ||
          c.initialRisk === DailyStatus.RED) &&
        (!c.knownBlockerNote || c.knownBlockerNote.trim().length === 0)
      ) {
        throw new BusinessRuleViolationException(
          'knownBlockerNote wajib diisi jika initialRisk adalah AMBER atau RED',
          [
            {
              field: `commitments[${c.sequenceNo}].knownBlockerNote`,
              reason: 'REQUIRED_WHEN_CONDITIONAL',
            },
          ],
        );
      }
    }

    // 5. Cek apakah record hari ini sudah ada
    const existingRecord = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        employeeUserId_workDate: {
          employeeUserId: userId,
          workDate: today,
        },
      },
      include: { commitments: true },
    });

    if (existingRecord?.morningSubmittedAt) {
      throw new ConflictException(
        'Morning Check-in sudah pernah diserahkan untuk hari ini',
      );
    }

    // 6. Evaluasi timing Morning Check-in (SAD §9.2)
    const cutoffConfig = policySnapshot[PolicyCategory.Cutoff] || {};
    const graceConfig = policySnapshot[PolicyCategory.GracePeriod] || {};
    const deadlineStr = cutoffConfig.morningOnTimeDeadline || '09:00';
    const graceMinutes = graceConfig.morningGraceMinutes || 30;

    const { timing: morningTiming, isPastCutoff } = this.evaluateTiming(
      now,
      deadlineStr,
      graceMinutes,
    );

    if (isPastCutoff) {
      throw new BusinessRuleViolationException(
        'Batas waktu penyerahan Morning Check-in (Cut-off) telah berakhir',
      );
    }

    // 7. Hitung initialStatus (worst-of, SAD §9.3)
    const initialStatus = computeWorstOfStatus(
      commitments.map((c) => c.initialRisk),
    );

    // 8. Simpan ke database dalam Prisma Transaction + Catat AuditLog
    return this.prisma.$transaction(async (tx) => {
      let record;
      if (existingRecord) {
        record = await tx.dailyAccountabilityRecord.update({
          where: { id: existingRecord.id },
          data: {
            orgContextSnapshot,
            policySnapshot,
            morningSubmittedAt: now,
            morningTiming,
            initialStatus,
          },
        });
      } else {
        record = await tx.dailyAccountabilityRecord.create({
          data: {
            employeeUserId: userId,
            workDate: today,
            orgContextSnapshot,
            policySnapshot,
            morningSubmittedAt: now,
            morningTiming,
            initialStatus,
          },
        });
      }

      // Hapus komitmen draft sebelumnya jika ada, lalu masukkan komitmen resmi
      await tx.commitment.deleteMany({
        where: { dailyRecordId: record.id },
      });

      const createdCommitments = [];
      for (const c of commitments) {
        const commitment = await tx.commitment.create({
          data: {
            dailyRecordId: record.id,
            sequenceNo: c.sequenceNo,
            text: c.text,
            referenceLink: c.referenceLink ?? null,
            initialRisk: c.initialRisk,
            knownBlockerNote: c.knownBlockerNote ?? null,
            supportNeeded: c.supportNeeded ?? null,
          },
        });
        createdCommitments.push(commitment);
      }

      // Audit Log (SAD §15.2)
      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'DAILY_RECORD_MORNING_SUBMITTED',
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: record.id,
          valueAfter: {
            initialStatus,
            morningTiming,
            commitmentsCount: createdCommitments.length,
          },
        },
        tx,
      );

      this.logger.log(
        `Morning Check-in berhasil diserahkan oleh user ${userId} untuk tanggal ${today.toISOString().split('T')[0]} (Status: ${initialStatus}, Timing: ${morningTiming})`,
      );

      return {
        ...record,
        commitments: createdCommitments,
        availableActions: this.computeAvailableActions(
          { ...record, commitments: createdCommitments },
          userId,
        ),
      };
    });
  }

  /**
   * EPIC-07-T2: Ambil record hari ini dengan availableActions & carry-over draft (SAD §7.12, §10.3, FR-11).
   */
  async getTodayRecord(userId: string) {
    const now = new Date();
    const today = normalizeDate(now);

    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: {
        employeeUserId_workDate: {
          employeeUserId: userId,
          workDate: today,
        },
      },
      include: {
        commitments: { orderBy: { sequenceNo: 'asc' } },
        additionalWorks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!record) {
      // Periksa carry-over draft dari hari kerja sebelumnya (FR-11)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const previousRecord =
        await this.prisma.dailyAccountabilityRecord.findFirst({
          where: {
            employeeUserId: userId,
            workDate: { lt: today },
          },
          orderBy: { workDate: 'desc' },
          include: {
            commitments: true,
            additionalWorks: true,
          },
        });

      const carryOverDraft: any[] = [];
      if (previousRecord) {
        const carryCommitments = previousRecord.commitments.filter(
          (c) => c.continuation === Continuation.Continue,
        );
        const carryAdditional = previousRecord.additionalWorks.filter(
          (a) => a.continuation === Continuation.Continue,
        );

        for (const c of carryCommitments) {
          carryOverDraft.push({
            sourceType: 'Commitment',
            text: c.text,
            referenceLink: c.referenceLink,
            continuationReason: c.continuationReason,
          });
        }
        for (const a of carryAdditional) {
          carryOverDraft.push({
            sourceType: 'AdditionalWork',
            text: a.text,
            continuationReason: a.continuationReason,
          });
        }
      }

      return {
        record: null,
        carryOverDraft,
        availableActions: ['morning_checkin'],
      };
    }

    return {
      record: {
        ...record,
        additionalWorks: record.additionalWorks.map((aw) => ({
          ...aw,
          availableActions: ['edit'], // ADR-001: AdditionalWork selalu dapat diedit
        })),
      },
      availableActions: this.computeAvailableActions(record, userId),
    };
  }

  /**
   * Validasi aturan bisnis outcome dan continuation (SAD §9.5, FR-09).
   */
  private validateOutcomes(
    commitments: any[],
    additionalWorks: any[] = [],
  ) {
    for (const c of commitments) {
      if (
        c.outcome === CommitmentOutcome.Cancelled &&
        (!c.outcomeReason || c.outcomeReason.trim().length === 0)
      ) {
        throw new BusinessRuleViolationException(
          `outcomeReason wajib diisi untuk komitmen yang dibatalkan (Cancelled)`,
          [{ field: 'outcomeReason', reason: 'REQUIRED_WHEN_CANCELLED' }],
        );
      }
      if (
        c.continuation === Continuation.Continue &&
        c.outcome !== CommitmentOutcome.Completed &&
        (!c.continuationReason || c.continuationReason.trim().length === 0)
      ) {
        throw new BusinessRuleViolationException(
          `continuationReason wajib diisi jika Continuation = Continue dan Outcome ≠ Completed (FR-09)`,
          [{ field: 'continuationReason', reason: 'REQUIRED_WHEN_CONTINUE_NOT_COMPLETED' }],
        );
      }
    }

    for (const a of additionalWorks) {
      if (
        a.outcome === CommitmentOutcome.Cancelled &&
        (!a.outcomeReason || a.outcomeReason.trim().length === 0)
      ) {
        throw new BusinessRuleViolationException(
          `outcomeReason wajib diisi untuk pekerjaan tambahan yang dibatalkan (Cancelled)`,
          [{ field: 'outcomeReason', reason: 'REQUIRED_WHEN_CANCELLED' }],
        );
      }
      if (
        a.continuation === Continuation.Continue &&
        a.outcome !== CommitmentOutcome.Completed &&
        (!a.continuationReason || a.continuationReason.trim().length === 0)
      ) {
        throw new BusinessRuleViolationException(
          `continuationReason wajib diisi jika Continuation = Continue dan Outcome ≠ Completed (FR-09)`,
          [{ field: 'continuationReason', reason: 'REQUIRED_WHEN_CONTINUE_NOT_COMPLETED' }],
        );
      }
    }
  }

  /**
   * EPIC-07-T3: Submit EOD Check-in (SAD §9.5, §10.3).
   * Validasi outcome/continuation, interaksi Status Suggestion Engine.
   */
  async submitEodCheckin(
    userId: string,
    recordId: string,
    dto: EodCheckinDto,
  ) {
    const now = new Date();

    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: { id: recordId },
      include: { commitments: true, additionalWorks: true },
    });

    if (!record || record.employeeUserId !== userId) {
      throw new NotFoundException(
        'Data Daily Accountability Record tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    if (!record.morningSubmittedAt) {
      throw new BusinessRuleViolationException(
        'Morning Check-in wajib diselesaikan sebelum melakukan EOD Check-in',
      );
    }

    // Cek apakah komitmen sudah terkunci EOD
    if (record.commitments.every((c) => c.isEodLocked)) {
      throw new BusinessRuleViolationException(
        'EOD Check-in untuk hari ini sudah terkunci (isEodLocked)',
      );
    }

    // 1. Validasi Outcome & Continuation (SAD §9.5, FR-09)
    this.validateOutcomes(
      dto.commitmentOutcomes,
      dto.additionalWorkOutcomes ?? [],
    );

    // 2. Evaluasi Timing EOD (SAD §9.2)
    const policySnapshot = (record.policySnapshot as Record<string, any>) || {};
    const cutoffConfig = policySnapshot[PolicyCategory.Cutoff] || {};
    const graceConfig = policySnapshot[PolicyCategory.GracePeriod] || {};
    const deadlineStr = cutoffConfig.eodOnTimeDeadline || '18:00';
    const graceMinutes = graceConfig.eodGraceMinutes || 30;

    const { timing: eodTiming } = this.evaluateTiming(
      now,
      deadlineStr,
      graceMinutes,
    );

    // 3. Evaluasi Status Suggestion Engine (SAD §9.3, PRD §3.3 FR-13/FR-14)
    const allOutcomes = [
      ...dto.commitmentOutcomes.map((c) => ({ outcome: c.outcome })),
      ...(dto.additionalWorkOutcomes ?? []).map((a) => ({ outcome: a.outcome })),
    ];
    const suggestion = await this.statusSuggestionService.evaluateSuggestedStatus(
      userId,
      allOutcomes,
      now,
    );

    // Jika finalStatus yang dipilih user BERBEDA dari saran sistem, minta konfirmasi (SAD §9.3)
    if (dto.finalStatus !== suggestion.suggestedStatus) {
      return {
        requiresOverrideConfirmation: true,
        suggestedStatus: suggestion.suggestedStatus,
        requestedStatus: dto.finalStatus,
        reasons: suggestion.reasons,
        message:
          'Status yang Anda pilih berbeda dengan evaluasi sistem. Anda dapat menggunakan status saran atau tetap dengan pilihan Anda disertai alasan penolakan (Validation Prompt Modal).',
      };
    }

    // 4. Jika cocok, simpan langsung ke database dalam transaksi + AuditLog
    return this.prisma.$transaction(async (tx) => {
      // Update commitments
      for (const co of dto.commitmentOutcomes) {
        await tx.commitment.update({
          where: { id: co.commitmentId },
          data: {
            outcome: co.outcome,
            outcomeReason: co.outcomeReason ?? null,
            continuation: co.continuation,
            continuationReason: co.continuationReason ?? null,
          },
        });
      }

      // Update additionalWorks jika ada
      if (dto.additionalWorkOutcomes) {
        for (const ao of dto.additionalWorkOutcomes) {
          await tx.additionalWork.update({
            where: { id: ao.additionalWorkId },
            data: {
              outcome: ao.outcome,
              outcomeReason: ao.outcomeReason ?? null,
              continuation: ao.continuation,
              continuationReason: ao.continuationReason ?? null,
            },
          });
        }
      }

      // Update record
      const updatedRecord = await tx.dailyAccountabilityRecord.update({
        where: { id: recordId },
        data: {
          finalStatus: dto.finalStatus,
          eodSubmittedAt: now,
          eodTiming,
        },
        include: { commitments: true, additionalWorks: true },
      });

      // Audit Log
      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'DAILY_RECORD_EOD_SUBMITTED',
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: record.id,
          valueAfter: {
            finalStatus: dto.finalStatus,
            eodTiming,
          },
        },
        tx,
      );

      return {
        ...updatedRecord,
        availableActions: this.computeAvailableActions(updatedRecord, userId),
      };
    });
  }

  /**
   * EPIC-07-T4: Konfirmasi Override Saran Status (SAD §9.3, §10.3).
   * Menyimpan finalStatus pilihan user beserta overrideReason wajib ke AuditLog.
   */
  async confirmOverride(
    userId: string,
    recordId: string,
    dto: ConfirmOverrideDto,
  ) {
    const now = new Date();

    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: { id: recordId },
      include: { commitments: true, additionalWorks: true },
    });

    if (!record || record.employeeUserId !== userId) {
      throw new NotFoundException(
        'Data Daily Accountability Record tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    if (!dto.overrideReason || dto.overrideReason.trim().length < 5) {
      throw new BusinessRuleViolationException(
        'Alasan penolakan saran status (overrideReason) wajib diisi minimal 5 karakter',
        [{ field: 'overrideReason', reason: 'MIN_LENGTH_VIOLATION' }],
      );
    }

    if (dto.commitmentOutcomes) {
      this.validateOutcomes(
        dto.commitmentOutcomes,
        dto.additionalWorkOutcomes ?? [],
      );
    }

    const policySnapshot = (record.policySnapshot as Record<string, any>) || {};
    const cutoffConfig = policySnapshot[PolicyCategory.Cutoff] || {};
    const graceConfig = policySnapshot[PolicyCategory.GracePeriod] || {};
    const deadlineStr = cutoffConfig.eodOnTimeDeadline || '18:00';
    const graceMinutes = graceConfig.eodGraceMinutes || 30;

    const { timing: eodTiming } = this.evaluateTiming(
      now,
      deadlineStr,
      graceMinutes,
    );

    return this.prisma.$transaction(async (tx) => {
      if (dto.commitmentOutcomes) {
        for (const co of dto.commitmentOutcomes) {
          await tx.commitment.update({
            where: { id: co.commitmentId },
            data: {
              outcome: co.outcome,
              outcomeReason: co.outcomeReason ?? null,
              continuation: co.continuation,
              continuationReason: co.continuationReason ?? null,
            },
          });
        }
      }

      if (dto.additionalWorkOutcomes) {
        for (const ao of dto.additionalWorkOutcomes) {
          await tx.additionalWork.update({
            where: { id: ao.additionalWorkId },
            data: {
              outcome: ao.outcome,
              outcomeReason: ao.outcomeReason ?? null,
              continuation: ao.continuation,
              continuationReason: ao.continuationReason ?? null,
            },
          });
        }
      }

      const updatedRecord = await tx.dailyAccountabilityRecord.update({
        where: { id: recordId },
        data: {
          finalStatus: dto.finalStatus,
          eodSubmittedAt: now,
          eodTiming,
        },
        include: { commitments: true, additionalWorks: true },
      });

      // Simpan overrideReason ke AuditLog.valueAfter (SAD §9.3)
      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'DAILY_RECORD_STATUS_OVERRIDDEN',
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: record.id,
          valueBefore: { finalStatus: record.finalStatus },
          valueAfter: {
            finalStatus: dto.finalStatus,
            overrideReason: dto.overrideReason,
            eodTiming,
          },
        },
        tx,
      );

      return {
        ...updatedRecord,
        availableActions: this.computeAvailableActions(updatedRecord, userId),
      };
    });
  }

  /**
   * EPIC-07-T5: Patch Commitment (SAD §9.8, §10.3).
   * Validasi lock terpisah: Morning vs EOD fields.
   */
  async patchCommitment(
    userId: string,
    commitmentId: string,
    dto: PatchCommitmentDto,
  ) {
    const commitment = await this.prisma.commitment.findUnique({
      where: { id: commitmentId },
      include: { dailyRecord: true },
    });

    if (!commitment || commitment.dailyRecord.employeeUserId !== userId) {
      throw new NotFoundException(
        'Komitmen tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    // 1. Validasi Lock Kelompok Field Morning (SAD §9.8)
    const hasMorningFields =
      dto.text !== undefined ||
      dto.referenceLink !== undefined ||
      dto.initialRisk !== undefined ||
      dto.knownBlockerNote !== undefined ||
      dto.supportNeeded !== undefined;

    if (hasMorningFields && commitment.isMorningLocked) {
      throw new BusinessRuleViolationException(
        'Morning Commitment sudah terkunci (isMorningLocked). Perubahan pada teks atau risiko awal harus melalui Correction Request (SAD §9.8, PRD FR-05)',
      );
    }

    // Validasi FR-04: jika initialRisk AMBER/RED, knownBlockerNote wajib
    const targetInitialRisk = dto.initialRisk ?? commitment.initialRisk;
    const targetBlockerNote =
      dto.knownBlockerNote !== undefined
        ? dto.knownBlockerNote
        : commitment.knownBlockerNote;

    if (
      (targetInitialRisk === DailyStatus.AMBER ||
        targetInitialRisk === DailyStatus.RED) &&
      (!targetBlockerNote || targetBlockerNote.trim().length === 0)
    ) {
      throw new BusinessRuleViolationException(
        'knownBlockerNote wajib diisi jika initialRisk adalah AMBER atau RED (FR-04)',
      );
    }

    // 2. Validasi Lock Kelompok Field EOD (SAD §9.8)
    const hasEodFields =
      dto.outcome !== undefined ||
      dto.outcomeReason !== undefined ||
      dto.continuation !== undefined ||
      dto.continuationReason !== undefined;

    if (hasEodFields && commitment.isEodLocked) {
      throw new BusinessRuleViolationException(
        'EOD Commitment sudah terkunci (isEodLocked). Perubahan tidak dapat dilakukan langsung',
      );
    }

    // Validasi FR-09
    const targetOutcome = dto.outcome ?? commitment.outcome;
    const targetOutcomeReason =
      dto.outcomeReason !== undefined
        ? dto.outcomeReason
        : commitment.outcomeReason;
    const targetContinuation = dto.continuation ?? commitment.continuation;
    const targetContinuationReason =
      dto.continuationReason !== undefined
        ? dto.continuationReason
        : commitment.continuationReason;

    if (
      targetOutcome === CommitmentOutcome.Cancelled &&
      (!targetOutcomeReason || targetOutcomeReason.trim().length === 0)
    ) {
      throw new BusinessRuleViolationException(
        'outcomeReason wajib diisi jika outcome Cancelled',
      );
    }

    if (
      targetContinuation === Continuation.Continue &&
      targetOutcome !== CommitmentOutcome.Completed &&
      (!targetContinuationReason || targetContinuationReason.trim().length === 0)
    ) {
      throw new BusinessRuleViolationException(
        'continuationReason wajib diisi jika Continuation = Continue dan Outcome ≠ Completed (FR-09)',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.commitment.update({
        where: { id: commitmentId },
        data: {
          text: dto.text !== undefined ? dto.text : undefined,
          referenceLink:
            dto.referenceLink !== undefined ? dto.referenceLink : undefined,
          initialRisk:
            dto.initialRisk !== undefined ? dto.initialRisk : undefined,
          knownBlockerNote:
            dto.knownBlockerNote !== undefined ? dto.knownBlockerNote : undefined,
          supportNeeded:
            dto.supportNeeded !== undefined ? dto.supportNeeded : undefined,
          outcome: dto.outcome !== undefined ? dto.outcome : undefined,
          outcomeReason:
            dto.outcomeReason !== undefined ? dto.outcomeReason : undefined,
          continuation:
            dto.continuation !== undefined ? dto.continuation : undefined,
          continuationReason:
            dto.continuationReason !== undefined
              ? dto.continuationReason
              : undefined,
        },
      });

      // Jika initialRisk diubah sebelum cutoff, hitung ulang initialStatus record
      if (dto.initialRisk && dto.initialRisk !== commitment.initialRisk) {
        const allCommitments = await tx.commitment.findMany({
          where: { dailyRecordId: commitment.dailyRecordId },
        });
        const recalculatedInitialStatus = computeWorstOfStatus(
          allCommitments.map((c) => c.initialRisk),
        );
        await tx.dailyAccountabilityRecord.update({
          where: { id: commitment.dailyRecordId },
          data: { initialStatus: recalculatedInitialStatus },
        });
      }

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'COMMITMENT_UPDATED',
          relatedEntityType: 'Commitment',
          relatedEntityId: commitment.id,
          valueBefore: commitment,
          valueAfter: updated,
        },
        tx,
      );

      return updated;
    });
  }

  /**
   * EPIC-07-T6: Create Additional Work (SAD §10.3, PRD FR-06).
   * Mengikuti ADR-001: Tidak memvalidasi isLocked pemblokir write.
   */
  async createAdditionalWork(userId: string, dto: CreateAdditionalWorkDto) {
    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: { id: dto.dailyRecordId },
    });

    if (!record || record.employeeUserId !== userId) {
      throw new NotFoundException(
        'Daily Accountability Record tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    if (
      dto.reason === AdditionalWorkReason.NewlyAssigned &&
      !dto.assignedByUserId
    ) {
      throw new BusinessRuleViolationException(
        'assignedByUserId wajib diisi jika reason adalah NewlyAssigned (FR-06)',
        [{ field: 'assignedByUserId', reason: 'REQUIRED_WHEN_NEWLY_ASSIGNED' }],
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.additionalWork.create({
        data: {
          dailyRecordId: dto.dailyRecordId,
          text: dto.text,
          reason: dto.reason,
          assignedByUserId: dto.assignedByUserId ?? null,
        },
      });

      // AuditLog wajib tercatat per ADR-001
      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'ADDITIONAL_WORK_CREATED',
          relatedEntityType: 'AdditionalWork',
          relatedEntityId: created.id,
          valueAfter: created,
        },
        tx,
      );

      return created;
    });
  }

  /**
   * EPIC-07-T6: Patch Additional Work (SAD §10.3).
   * Mengikuti ADR-001: Tidak memvalidasi isLocked, dapat diedit kapan saja.
   */
  async patchAdditionalWork(
    userId: string,
    id: string,
    dto: PatchAdditionalWorkDto,
  ) {
    const additionalWork = await this.prisma.additionalWork.findUnique({
      where: { id },
      include: { dailyRecord: true },
    });

    if (
      !additionalWork ||
      additionalWork.dailyRecord.employeeUserId !== userId
    ) {
      throw new NotFoundException(
        'Pekerjaan tambahan tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    // Validasi FR-09 jika outcome di-update
    const targetOutcome = dto.outcome ?? additionalWork.outcome;
    const targetOutcomeReason =
      dto.outcomeReason !== undefined
        ? dto.outcomeReason
        : additionalWork.outcomeReason;
    const targetContinuation = dto.continuation ?? additionalWork.continuation;
    const targetContinuationReason =
      dto.continuationReason !== undefined
        ? dto.continuationReason
        : additionalWork.continuationReason;

    if (
      targetOutcome === CommitmentOutcome.Cancelled &&
      (!targetOutcomeReason || targetOutcomeReason.trim().length === 0)
    ) {
      throw new BusinessRuleViolationException(
        'outcomeReason wajib diisi jika outcome Cancelled',
      );
    }

    if (
      targetContinuation === Continuation.Continue &&
      targetOutcome !== CommitmentOutcome.Completed &&
      (!targetContinuationReason || targetContinuationReason.trim().length === 0)
    ) {
      throw new BusinessRuleViolationException(
        'continuationReason wajib diisi jika Continuation = Continue dan Outcome ≠ Completed (FR-09)',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.additionalWork.update({
        where: { id },
        data: {
          text: dto.text !== undefined ? dto.text : undefined,
          reason: dto.reason !== undefined ? dto.reason : undefined,
          assignedByUserId:
            dto.assignedByUserId !== undefined
              ? dto.assignedByUserId
              : undefined,
          outcome: dto.outcome !== undefined ? dto.outcome : undefined,
          outcomeReason:
            dto.outcomeReason !== undefined ? dto.outcomeReason : undefined,
          continuation:
            dto.continuation !== undefined ? dto.continuation : undefined,
          continuationReason:
            dto.continuationReason !== undefined
              ? dto.continuationReason
              : undefined,
        },
      });

      // AuditLog wajib tercatat per ADR-001
      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'ADDITIONAL_WORK_UPDATED',
          relatedEntityType: 'AdditionalWork',
          relatedEntityId: additionalWork.id,
          valueBefore: additionalWork,
          valueAfter: updated,
        },
        tx,
      );

      return updated;
    });
  }

  /**
   * EPIC-07-T7: List Daily Records — Scope Filtered (SAD §8.11, §10.3).
   */
  async findAll(user: CurrentUserPayload, query: QueryDailyRecordsDto) {
    const asOfDate = new Date();
    const scopeFilter = await this.scopeFilterService.buildScopeFilter(
      user,
      'employeeUserId',
      asOfDate,
    );

    const where: Prisma.DailyAccountabilityRecordWhereInput = {
      ...scopeFilter,
    };

    if (query.employeeUserId) {
      // Pastikan target employeeUserId dalam scope
      const inScope = await this.scopeFilterService.isUserInScope(
        user,
        query.employeeUserId,
        asOfDate,
      );
      if (!inScope) {
        throw new NotFoundException(
          'User tidak ditemukan dalam cakupan akses Anda',
        );
      }
      where.employeeUserId = query.employeeUserId;
    }

    if (query.startDate || query.endDate) {
      where.workDate = {};
      if (query.startDate) {
        where.workDate.gte = normalizeDate(query.startDate);
      }
      if (query.endDate) {
        where.workDate.lte = normalizeDate(query.endDate);
      }
    }

    if (query.initialStatus) {
      where.initialStatus = query.initialStatus;
    }

    if (query.finalStatus) {
      where.finalStatus = query.finalStatus;
    }

    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const [totalItems, records] = await Promise.all([
      this.prisma.dailyAccountabilityRecord.count({ where }),
      this.prisma.dailyAccountabilityRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { workDate: 'desc' },
        include: {
          employee: {
            select: { id: true, fullName: true, email: true },
          },
          commitments: true,
          additionalWorks: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: records.map((rec) => ({
        ...rec,
        availableActions: this.computeAvailableActions(rec, user.userId),
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
   * EPIC-07-T7: Detail Daily Record — Scope Filtered (SAD §8.11, §10.3).
   * Merespons 404 jika di luar scope visibility (SAD §7.7).
   */
  async findById(user: CurrentUserPayload, id: string) {
    const record = await this.prisma.dailyAccountabilityRecord.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, fullName: true, email: true },
        },
        commitments: { orderBy: { sequenceNo: 'asc' } },
        additionalWorks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!record) {
      throw new NotFoundException(
        'Data Daily Accountability Record tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    const inScope = await this.scopeFilterService.isUserInScope(
      user,
      record.employeeUserId,
    );
    if (!inScope) {
      throw new NotFoundException(
        'Data Daily Accountability Record tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    return {
      ...record,
      additionalWorks: record.additionalWorks.map((aw) => ({
        ...aw,
        availableActions: ['edit'], // ADR-001
      })),
      availableActions: this.computeAvailableActions(record, user.userId),
    };
  }

  /**
   * EPIC-07-T8: Evaluasi Cutoff & Lock (SAD §9.2, §9.8).
   * Service method yang dipanggil oleh SchedulerModule (EPIC-15).
   */
  async evaluateCutoffLock(targetDate: Date = new Date()) {
    const today = normalizeDate(targetDate);
    const now = new Date();

    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [PolicyCategory.Cutoff, PolicyCategory.GracePeriod],
      now,
    );

    const cutoffConfig = policySnapshot[PolicyCategory.Cutoff] || {};
    const graceConfig = policySnapshot[PolicyCategory.GracePeriod] || {};

    const morningDeadline = cutoffConfig.morningOnTimeDeadline || '09:00';
    const morningGrace = graceConfig.morningGraceMinutes || 30;
    const eodDeadline = cutoffConfig.eodOnTimeDeadline || '18:00';
    const eodGrace = graceConfig.eodGraceMinutes || 30;

    const { isPastCutoff: morningPassed } = this.evaluateTiming(
      now,
      morningDeadline,
      morningGrace,
    );
    const { isPastCutoff: eodPassed } = this.evaluateTiming(
      now,
      eodDeadline,
      eodGrace,
    );

    let morningLockedCount = 0;
    let eodLockedCount = 0;
    let morningNoSubmissionCount = 0;
    let eodNoSubmissionCount = 0;

    // 1. Morning Cutoff Lock
    if (morningPassed) {
      const recordsToLock =
        await this.prisma.dailyAccountabilityRecord.findMany({
          where: {
            workDate: today,
            cutoffLockedAt: null,
          },
          select: { id: true, morningSubmittedAt: true },
        });

      for (const rec of recordsToLock) {
        await this.prisma.$transaction([
          this.prisma.commitment.updateMany({
            where: { dailyRecordId: rec.id, isMorningLocked: false },
            data: { isMorningLocked: true },
          }),
          this.prisma.dailyAccountabilityRecord.update({
            where: { id: rec.id },
            data: {
              cutoffLockedAt: now,
              morningTiming:
                rec.morningSubmittedAt === null
                  ? SubmissionTiming.NoSubmission
                  : undefined,
            },
          }),
        ]);
        morningLockedCount++;
        if (rec.morningSubmittedAt === null) {
          morningNoSubmissionCount++;
        }
      }
    }

    // 2. EOD Cutoff Lock
    if (eodPassed) {
      const recordsToLock =
        await this.prisma.dailyAccountabilityRecord.findMany({
          where: {
            workDate: today,
            commitments: { some: { isEodLocked: false } },
          },
          select: { id: true, eodSubmittedAt: true },
        });

      for (const rec of recordsToLock) {
        await this.prisma.$transaction([
          this.prisma.commitment.updateMany({
            where: { dailyRecordId: rec.id, isEodLocked: false },
            data: { isEodLocked: true },
          }),
          // ADR-001: isLocked pada AdditionalWork tetap diset untuk konsistensi skema
          this.prisma.additionalWork.updateMany({
            where: { dailyRecordId: rec.id, isLocked: false },
            data: { isLocked: true },
          }),
          this.prisma.dailyAccountabilityRecord.update({
            where: { id: rec.id },
            data: {
              eodTiming:
                rec.eodSubmittedAt === null
                  ? SubmissionTiming.NoSubmission
                  : undefined,
            },
          }),
        ]);
        eodLockedCount++;
        if (rec.eodSubmittedAt === null) {
          eodNoSubmissionCount++;
        }
      }
    }

    return {
      date: today.toISOString().split('T')[0],
      morningPassed,
      eodPassed,
      morningLockedCount,
      eodLockedCount,
      morningNoSubmissionCount,
      eodNoSubmissionCount,
    };
  }
}
