import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserStatus } from '@prisma/client';
import { DailyAccountabilityService } from '../../daily-accountability/services/daily-accountability.service.js';
import { ComplianceService } from '../../compliance/services/compliance.service.js';
import { CorrectionRequestService } from '../../correction-request/services/correction-request.service.js';
import { BlockerService } from '../../blocker/services/blocker.service.js';
import { NotificationService } from '../../notification/notification.service.js';
import { SystemNotificationTrigger } from '../../notification/constants/notification-trigger.constants.js';
import { DatabaseBackupService } from './database-backup.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyAccountabilityService: DailyAccountabilityService,
    private readonly complianceService: ComplianceService,
    private readonly correctionRequestService: CorrectionRequestService,
    private readonly blockerService: BlockerService,
    private readonly notificationService: NotificationService,
    private readonly databaseBackupService: DatabaseBackupService,
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
      const activeUsers = await this.prisma.user.findMany({
        where: { status: UserStatus.Active },
        select: { id: true },
      });

      for (const user of activeUsers) {
        await this.notificationService.dispatchTrigger(
          SystemNotificationTrigger.WEEKLY_SUMMARY_AVAILABLE,
          user.id,
          {
            title: 'Weekly Summary Tersedia',
            body: 'Laporan ringkasan mingguan tim Anda untuk minggu lalu telah tersedia untuk ditinjau.',
            linkPath: '/reports/weekly-team-summary',
            iconType: 'chart-box',
          },
        );
      }

      this.logger.log(`[WEEKLY SENIN 08:00] Notifikasi dikirimkan ke ${activeUsers.length} pengguna aktif.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[WEEKLY SENIN 08:00] Gagal mengirimkan notifikasi Weekly Summary: ${msg}`);
    }
  }

  /**
   * Pengingat Mendekati Cutoff (Job #1, SAD §11.2 #1).
   */
  async sendCutoffReminders(now: Date = new Date()): Promise<number> {
    // Cari karyawan aktif yang belum mengisi check-in hari ini
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const recordsWithoutSubmission = await this.prisma.dailyAccountabilityRecord.findMany({
      where: {
        workDate: today,
        morningSubmittedAt: null,
        cutoffLockedAt: null,
      },
      select: {
        id: true,
        employeeUserId: true,
      },
      take: 50,
    });

    for (const record of recordsWithoutSubmission) {
      await this.notificationService.dispatchTrigger(
        SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
        record.employeeUserId,
        {
          title: 'Pengingat Cutoff Morning Check-in',
          body: 'Waktu batas penyerahan Morning Check-in segera berakhir. Silakan serahkan komitmen Anda.',
          linkPath: '/my-today',
          iconType: 'clock-outline',
        },
        'DailyAccountabilityRecord',
        record.id,
      );
    }

    return recordsWithoutSubmission.length;
  }

  /**
   * Pengingat Objection Window Menjelang Berakhir (Job #4, SAD §11.2 #4).
   */
  async sendObjectionWindowReminders(now: Date = new Date()): Promise<number> {
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const pendingCorrections = await this.prisma.correctionRequest.findMany({
      where: {
        status: 'Pending',
        objectionWindowEnd: {
          gt: now,
          lte: twoHoursFromNow,
        },
      },
      include: {
        targetCommitment: {
          include: {
            dailyRecord: true,
          },
        },
      },
      take: 50,
    });

    for (const cr of pendingCorrections) {
      // Temukan manajer/reviewer terkait dari target commitment
      const employeeId = cr.targetCommitment.dailyRecord.employeeUserId;
      const assignment = await this.prisma.organizationalAssignment.findFirst({
        where: {
          userId: employeeId,
          endDate: null,
        },
        select: { directManagerId: true },
      });

      if (assignment?.directManagerId) {
        await this.notificationService.dispatchTrigger(
          SystemNotificationTrigger.CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING,
          assignment.directManagerId,
          {
            title: 'Objection Window Koreksi Segera Berakhir',
            body: 'Jendela keberatan untuk koreksi komitmen akan segera ditutup dalam 2 jam.',
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
   */
  async sendLeavePendingReminders(now: Date = new Date()): Promise<number> {
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const pendingLeaves = await this.prisma.exception.findMany({
      where: {
        type: 'Leave',
        status: 'Pending',
        createdAt: { lte: twentyFourHoursAgo },
      },
      take: 50,
    });

    for (const leave of pendingLeaves) {
      if (leave.employeeUserId) {
        const assignment = await this.prisma.organizationalAssignment.findFirst({
          where: {
            userId: leave.employeeUserId,
            endDate: null,
          },
          select: { directManagerId: true },
        });

        if (assignment?.directManagerId) {
          await this.notificationService.dispatchTrigger(
            SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED,
            assignment.directManagerId,
            {
              title: 'Pengingat: Permohonan Cuti Masih Pending',
              body: 'Terdapat permohonan cuti yang menunggu persetujuan Anda lebih dari 24 jam.',
              linkPath: `/team/exceptions/${leave.id}`,
              iconType: 'calendar-clock',
            },
            'Exception',
            leave.id,
          );
        }
      }
    }

    return pendingLeaves.length;
  }
}
