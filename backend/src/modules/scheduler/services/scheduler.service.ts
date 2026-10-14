import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  PolicyCategory,
} from '@prisma/client';
import {
  DailyAccountabilityService,
  normalizeDate,
} from '../../daily-accountability/services/daily-accountability.service.js';
import {
  CUTOFF_REMINDER_LEAD_TIME_MINUTES,
  DEFAULT_MAX_REMINDER_BATCH,
} from '../../daily-accountability/constants/daily-accountability.constants.js';
import { ComplianceService } from '../../compliance/services/compliance.service.js';
import { CorrectionRequestService } from '../../correction-request/services/correction-request.service.js';
import { BlockerService } from '../../blocker/services/blocker.service.js';
import { NotificationService } from '../../notification/notification.service.js';
import { SystemNotificationTrigger } from '../../notification/constants/notification-trigger.constants.js';
import { DatabaseBackupService } from './database-backup.service.js';
import { ExceptionService } from '../../exception/services/exception.service.js';
import { PolicyService } from '../../policy/policy.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IdentityService } from '../../identity/identity.service.js';

export interface FrequentCycleResult {
  executedAt: Date;
  durationMs: number;
  steps: {
    cutoffLock: { success: boolean; error?: string };
    cutoffReminders: { success: boolean; error?: string };
    noSubmission: { success: boolean; error?: string };
    expiredObjections: { success: boolean; error?: string };
    objectionReminders: { success: boolean; error?: string };
    autoEscalation: { success: boolean; error?: string };
    leaveReminders: { success: boolean; error?: string };
  };
}

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isProcessingCutoffReminders = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyAccountabilityService: DailyAccountabilityService,
    private readonly complianceService: ComplianceService,
    private readonly correctionRequestService: CorrectionRequestService,
    private readonly blockerService: BlockerService,
    private readonly notificationService: NotificationService,
    private readonly databaseBackupService: DatabaseBackupService,
    private readonly exceptionService: ExceptionService,
    private readonly policyService: PolicyService,
    private readonly identityService: IdentityService,
  ) {}

  /**
   * EPIC-15-T1: Frequent Cycle (setiap 5 menit)
   * Eksekusi 7 langkah berurutan sesuai urutan wajib SAD §11.3 dengan isolasi kegagalan per langkah (SAD §11.5).
   * Berfungsi ganda sebagai keepalive Supabase Free Tier (SAD §4.5).
   */
  @Cron('*/5 * * * *')
  async runFrequentCycle(now: Date = new Date()): Promise<FrequentCycleResult> {
    const startTime = Date.now();
    this.logger.log(`[FREQUENT CYCLE] Memulai siklus 5-menit pada ${now.toISOString()}...`);

    const result: FrequentCycleResult = {
      executedAt: now,
      durationMs: 0,
      steps: {
        cutoffLock: { success: false },
        cutoffReminders: { success: false },
        noSubmission: { success: false },
        expiredObjections: { success: false },
        objectionReminders: { success: false },
        autoEscalation: { success: false },
        leaveReminders: { success: false },
      },
    };

    // Langkah 1: Evaluasi Cutoff-Lock (WAJIB PERTAMA sesuai SAD §11.3 & §9.9 #4)
    try {
      await this.dailyAccountabilityService.evaluateCutoffLock(now);
      result.steps.cutoffLock.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 1 (Cutoff-Lock) gagal: ${msg}`);
      result.steps.cutoffLock.error = msg;
    }

    // Langkah 2: Reminder Mendekati Cutoff (Job #1, SAD §11.2 #1)
    try {
      await this.sendCutoffReminders(now);
      result.steps.cutoffReminders.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 2 (Cutoff Reminders) gagal: ${msg}`);
      result.steps.cutoffReminders.error = msg;
    }

    // Langkah 3: No Submission Detection (Job #3, SAD §11.2 #3)
    try {
      await this.complianceService.evaluateNoSubmission(now, now);
      result.steps.noSubmission.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 3 (No Submission) gagal: ${msg}`);
      result.steps.noSubmission.error = msg;
    }

    // Langkah 4: Correction Request Auto-Apply (Job #5, SAD §11.2 #5)
    try {
      await this.correctionRequestService.evaluateExpiredObjectionWindows();
      result.steps.expiredObjections.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 4 (Expired Objections) gagal: ${msg}`);
      result.steps.expiredObjections.error = msg;
    }

    // Langkah 5: Objection Window Reminder (Job #4, SAD §11.2 #4)
    try {
      await this.sendObjectionWindowReminders(now);
      result.steps.objectionReminders.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 5 (Objection Reminders) gagal: ${msg}`);
      result.steps.objectionReminders.error = msg;
    }

    // Langkah 6: Blocker Auto-Escalate (Job #6, SAD §11.2 #6)
    try {
      await this.blockerService.evaluateAutoEscalation(now);
      result.steps.autoEscalation.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 6 (Blocker Auto-Escalate) gagal: ${msg}`);
      result.steps.autoEscalation.error = msg;
    }

    // Langkah 7: Leave Pending Reminder (Job #7, SAD §11.2 #7)
    try {
      await this.sendLeavePendingReminders(now);
      result.steps.leaveReminders.success = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[FREQUENT CYCLE] Langkah 7 (Leave Reminders) gagal: ${msg}`);
      result.steps.leaveReminders.error = msg;
    }

    result.durationMs = Date.now() - startTime;
    this.logger.log(`[FREQUENT CYCLE] Selesai dalam ${result.durationMs} ms.`);
    return result;
  }

  /**
   * EPIC-15-T2: Daily Aggregate (03:00) — Pattern Flag Detection (SAD §11.4 Job #8).
   */
  @Cron('0 3 * * *')
  async runDailyPatternFlag(now: Date = new Date()): Promise<void> {
    this.logger.log(`[DAILY 03:00] Memulai Pattern Flag Detection...`);
    try {
      const res = await this.complianceService.evaluatePatternFlag(now);
      this.logger.log(`[DAILY 03:00] Pattern Flag Detection selesai: ${JSON.stringify(res)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[DAILY 03:00] Pattern Flag Detection gagal: ${msg}`);
    }
  }

  /**
   * EPIC-15-T3: Daily Maintenance (02:00) — Database Backup (SAD §4.5, §11.4 Job #9).
   */
  @Cron('0 2 * * *')
  async runDailyDatabaseBackup(now: Date = new Date()): Promise<void> {
    this.logger.log(`[DAILY 02:00] Memulai Database Backup...`);
    try {
      const res = await this.databaseBackupService.executeBackup(now);
      this.logger.log(`[DAILY 02:00] Database Backup status: ${res.success ? 'BERHASIL' : 'GAGAL'}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[DAILY 02:00] Database Backup exception: ${msg}`);
    }
  }

  /**
   * EPIC-15-T4: Weekly Aggregate (Senin 08:00) — Weekly Summary Notification (SAD §11.2 Job #10, §12.5).
   */
  @Cron('0 8 * * 1')
  async runWeeklySummaryNotification(): Promise<void> {
    this.logger.log(`[WEEKLY SENIN 08:00] Mengirim notifikasi Weekly Summary tersedia...`);
    try {
      const activeUserIds = await this.identityService.findActiveUserIds();

      for (const userId of activeUserIds) {
        await this.notificationService.dispatchTrigger(
          SystemNotificationTrigger.WEEKLY_SUMMARY_AVAILABLE,
          userId,
          {
            title: 'Weekly Summary Tersedia',
            body: 'Laporan ringkasan mingguan tim Anda untuk minggu lalu telah tersedia untuk ditinjau.',
            linkPath: '/reports/weekly-team-summary',
            iconType: 'chart-box',
          },
        );
      }

      this.logger.log(`[WEEKLY SENIN 08:00] Notifikasi dikirimkan ke ${activeUserIds.length} pengguna aktif.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[WEEKLY SENIN 08:00] Gagal mengirimkan notifikasi Weekly Summary: ${msg}`);
    }
  }

  /**
   * Pengingat Mendekati Cutoff (Job #1, SAD §11.2 #1, PRD FR-28, ADR-014).
   * 1. Menentukan workDate = normalizeDate(now).
   * 2. Resolusi PolicyCategory.Cutoff dan PolicyCategory.WorkdayCalendar as-of now.
   * 3. Melewati evaluasi jika bukan hari kerja sesuai kalender kerja.
   * 4. Melewati evaluasi jika hari ini adalah Libur Perusahaan (Holiday status Approved).
   * 5. Mengevaluasi jendela pengingat simetris untuk Morning dan EOD Check-in:
   *    [OnTimeDeadline - 60m, OnTimeDeadline).
   *    Tepat 60m sebelum deadline -> aktif.
   *    Tepat di deadline atau setelahnya -> tidak aktif. GracePeriod BUKAN bagian dari reminder.
   * 6. Mendelegasikan query kandidat ke DailyAccountabilityService.findPendingSubmissionEmployeeIds(workDate, phase, limit).
   * 7. Menerapkan BEST-EFFORT DEDUPLICATION:
   *    - In-process execution guard (mencegah overlapping run pada instance yang sama).
   *    - In-run Set<string> untuk mencegah duplikasi dalam iterasi yang sama.
   *    - Pengecekan riwayat notifikasi pada workDate berjalan dengan payload.metadata.phase.
   * 8. Mendispatch notifikasi via NotificationService.dispatchTrigger dengan relatedEntityType = undefined, relatedEntityId = undefined.
   */
  async sendCutoffReminders(
    now: Date = new Date(),
    limit: number = DEFAULT_MAX_REMINDER_BATCH,
  ): Promise<number> {
    // 0. In-process single-instance concurrency guard (best-effort)
    if (this.isProcessingCutoffReminders) {
      this.logger.warn(
        `[FREQUENT CYCLE] sendCutoffReminders sebelumnya masih berjalan; invocation dilewati.`,
      );
      return 0;
    }

    this.isProcessingCutoffReminders = true;
    try {
      const workDate = normalizeDate(now);

      // 1. Ambil policy Cutoff dan WorkdayCalendar as-of now (FR-28, FR-33)
      const policySnapshot = await this.policyService.getActivePolicySnapshot(
        [PolicyCategory.Cutoff, PolicyCategory.WorkdayCalendar],
        now,
      );

      const workdayConfig =
        policySnapshot[PolicyCategory.WorkdayCalendar] || {};
      const cutoffConfig = policySnapshot[PolicyCategory.Cutoff] || {};

      const workDays: number[] = workdayConfig.workDays || [1, 2, 3, 4, 5];
      const dayOfWeek = workDate.getUTCDay();

      // Cek apakah hari ini hari kerja
      if (!workDays.includes(dayOfWeek)) {
        return 0;
      }

      // 2. Cek apakah hari ini Libur Perusahaan (Holiday status Approved) (SAD §6.3, S2-T4-JOB-01)
      const isHoliday = await this.exceptionService.hasApprovedHolidayOnDate(workDate);
      if (isHoliday) {
        return 0;
      }

      // 3. Evaluasi jendela reminder simetris [Deadline - 60m, Deadline)
      const morningDeadlineStr =
        cutoffConfig.morningOnTimeDeadline || '09:00';
      const eodDeadlineStr = cutoffConfig.eodOnTimeDeadline || '18:00';

      const isMorningWindow = this.isWithinReminderWindow(
        now,
        morningDeadlineStr,
        CUTOFF_REMINDER_LEAD_TIME_MINUTES,
      );
      const isEodWindow = this.isWithinReminderWindow(
        now,
        eodDeadlineStr,
        CUTOFF_REMINDER_LEAD_TIME_MINUTES,
      );

      if (!isMorningWindow && !isEodWindow) {
        return 0;
      }

      const activePhases: Array<'MORNING' | 'EOD'> = [];
      if (isMorningWindow) activePhases.push('MORNING');
      if (isEodWindow) activePhases.push('EOD');

      let totalDispatched = 0;
      const dispatchedThisRun = new Set<string>();

      const startOfDay = new Date(workDate);
      const endOfDay = new Date(workDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      const workDateStr = workDate.toISOString().split('T')[0];

      for (const phase of activePhases) {
        // 4. Delegasikan seleksi peserta ke DailyAccountabilityService (SAD §6.4)
        const pendingEmployeeIds =
          await this.dailyAccountabilityService.findPendingSubmissionEmployeeIds(
            workDate,
            phase,
            limit,
          );

        for (const employeeUserId of pendingEmployeeIds) {
          const deduplicationKey = `${employeeUserId}:${phase}:${workDateStr}`;
          if (dispatchedThisRun.has(deduplicationKey)) {
            continue;
          }

          // 5. Best-effort deduplication check terhadap riwayat notifikasi hari ini (SAD §6.3, S2-T4-JOB-01)
          const alreadySent =
            await this.notificationService.hasCutoffReminderNotification(
              employeeUserId,
              phase,
              startOfDay,
              endOfDay,
            );

          if (alreadySent) {
            continue;
          }

          // 6. Dispatch notifikasi (ADR-014: relatedEntityType dan relatedEntityId dibiarkan undefined/null)
          const isMorning = phase === 'MORNING';
          await this.notificationService.dispatchTrigger(
            SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
            employeeUserId,
            {
              title: isMorning
                ? 'Pengingat Cutoff Morning Check-in'
                : 'Pengingat Cutoff EOD Check-in',
              body: isMorning
                ? 'Waktu batas penyerahan Morning Check-in segera berakhir. Silakan serahkan komitmen Anda.'
                : 'Waktu batas penyerahan EOD Check-in segera berakhir. Silakan laporkan progres kerja Anda.',
              linkPath: '/my-today',
              iconType: 'clock-outline',
              metadata: {
                phase,
                workDate: workDateStr,
              },
            },
            undefined,
            undefined,
          );

          dispatchedThisRun.add(deduplicationKey);
          totalDispatched++;
        }
      }

      return totalDispatched;
    } finally {
      this.isProcessingCutoffReminders = false;
    }
  }

  /**
   * Helper internal untuk evaluasi jendela pengingat:
   * windowStart <= now < deadline
   * di mana windowStart = deadline - leadTimeMinutes
   */
  private isWithinReminderWindow(
    now: Date,
    deadlineStr: string,
    leadTimeMinutes: number = 60,
  ): boolean {
    const [dHours, dMinutes] = deadlineStr.split(':').map(Number);
    const deadline = new Date(now);
    deadline.setHours(dHours, dMinutes, 0, 0);

    const windowStart = new Date(
      deadline.getTime() - leadTimeMinutes * 60 * 1000,
    );

    return now >= windowStart && now < deadline;
  }

  /**
   * Pengingat Objection Window Menjelang Berakhir (Job #4, SAD §11.2 #4).
   * Mendelegasikan query ke CorrectionRequestService (SAD §6.4).
   */
  async sendObjectionWindowReminders(now: Date = new Date()): Promise<number> {
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [PolicyCategory.ReminderThreshold],
      now,
    );
    const reminderConfig =
      policySnapshot[PolicyCategory.ReminderThreshold] || {};
    const objectionReminderHours =
      reminderConfig.objectionWindowReminderHours ?? 2;
    const windowEnd = new Date(
      now.getTime() + objectionReminderHours * 60 * 60 * 1000,
    );

    const pendingCorrections =
      await this.correctionRequestService.findPendingWithClosingObjectionWindow(
        now,
        windowEnd,
      );

    for (const cr of pendingCorrections) {
      if (cr.directManagerId) {
        await this.notificationService.dispatchTrigger(
          SystemNotificationTrigger.CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING,
          cr.directManagerId,
          {
            title: 'Objection Window Koreksi Segera Berakhir',
            body: `Jendela keberatan untuk koreksi komitmen akan segera ditutup dalam ${objectionReminderHours} jam.`,
            linkPath: `/team/corrections/${cr.id}`,
            iconType: 'clock-alert',
          },
          'CorrectionRequest',
          cr.id,
        );
      }
    }

    return pendingCorrections.length;
  }

  /**
   * Pengingat Cuti Pending (Job #7, SAD §11.2 #7).
   * Mendelegasikan query ke ExceptionService (SAD §6.4).
   * Menggunakan ambang jam dari kebijakan aktif ReminderThreshold (ADR-004).
   */
  async sendLeavePendingReminders(now: Date = new Date()): Promise<number> {
    const policySnapshot = await this.policyService.getActivePolicySnapshot(
      [PolicyCategory.ReminderThreshold],
      now,
    );
    const reminderConfig =
      policySnapshot[PolicyCategory.ReminderThreshold] || {};
    const leaveReminderHours =
      reminderConfig.leavePendingReminderHours ?? 24;
    const threshold = new Date(
      now.getTime() - leaveReminderHours * 60 * 60 * 1000,
    );

    const pendingLeaves = await this.exceptionService.findPendingLeavesOlderThan(
      threshold,
    );

    for (const leave of pendingLeaves) {
      if (leave.directManagerId) {
        await this.notificationService.dispatchTrigger(
          SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED,
          leave.directManagerId,
          {
            title: 'Pengingat: Permohonan Cuti Masih Pending',
            body: `Terdapat permohonan cuti yang menunggu persetujuan Anda lebih dari ${leaveReminderHours} jam.`,
            linkPath: `/team/exceptions/${leave.id}`,
            iconType: 'calendar-clock',
          },
          'Exception',
          leave.id,
        );
      }
    }

    return pendingLeaves.length;
  }
}
