import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulerService } from './scheduler.service.js';
import { SystemNotificationTrigger } from '../../notification/constants/notification-trigger.constants.js';

describe('SchedulerService (SAD §11.1 - §11.6, EPIC-15)', () => {
  let service: SchedulerService;
  let prismaMock: any;
  let dailyAccountabilityMock: any;
  let complianceMock: any;
  let correctionRequestMock: any;
  let blockerMock: any;
  let notificationMock: any;
  let databaseBackupMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'user-1', status: 'Active' },
          { id: 'user-2', status: 'Active' },
        ]),
      },
      dailyAccountabilityRecord: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'rec-1', employeeUserId: 'user-1' },
        ]),
      },
      correctionRequest: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'cr-1',
            targetCommitment: {
              dailyRecord: {
                employeeUserId: 'user-1',
              },
            },
          },
        ]),
      },
      exception: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'exc-1', employeeUserId: 'user-1' },
        ]),
      },
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue({ directManagerId: 'mgr-1' }),
      },
    };

    dailyAccountabilityMock = {
      evaluateCutoffLock: vi.fn().mockResolvedValue({ lockedCount: 2 }),
    };

    complianceMock = {
      evaluateNoSubmission: vi.fn().mockResolvedValue({ evaluatedCount: 5 }),
      evaluatePatternFlag: vi.fn().mockResolvedValue({ newPatternFlags: 1 }),
    };

    correctionRequestMock = {
      evaluateExpiredObjectionWindows: vi.fn().mockResolvedValue({ processedCount: 1 }),
    };

    blockerMock = {
      evaluateAutoEscalation: vi.fn().mockResolvedValue({ escalatedCount: 1 }),
    };

    notificationMock = {
      dispatchTrigger: vi.fn().mockResolvedValue([]),
    };

    databaseBackupMock = {
      executeBackup: vi.fn().mockResolvedValue({ success: true, storagePath: 'backups/mock' }),
    };

    service = new SchedulerService(
      prismaMock,
      dailyAccountabilityMock,
      complianceMock,
      correctionRequestMock,
      blockerMock,
      notificationMock,
      databaseBackupMock,
    );
  });

  describe('runFrequentCycle (SAD §11.3, EPIC-15-T1)', () => {
    it('harus mengeksekusi 7 langkah sesuai urutan wajib (Sequencing SAD §11.3)', async () => {
      const callOrder: string[] = [];

      dailyAccountabilityMock.evaluateCutoffLock.mockImplementation(async () => {
        callOrder.push('1_cutoffLock');
        return { lockedCount: 1 };
      });

      vi.spyOn(service, 'sendCutoffReminders').mockImplementation(async () => {
        callOrder.push('2_cutoffReminders');
        return 1;
      });

      complianceMock.evaluateNoSubmission.mockImplementation(async () => {
        callOrder.push('3_noSubmission');
        return { evaluatedCount: 1 };
      });

      correctionRequestMock.evaluateExpiredObjectionWindows.mockImplementation(async () => {
        callOrder.push('4_expiredObjections');
        return { processedCount: 1 };
      });

      vi.spyOn(service, 'sendObjectionWindowReminders').mockImplementation(async () => {
        callOrder.push('5_objectionReminders');
        return 1;
      });

      blockerMock.evaluateAutoEscalation.mockImplementation(async () => {
        callOrder.push('6_autoEscalation');
        return { escalatedCount: 1 };
      });

      vi.spyOn(service, 'sendLeavePendingReminders').mockImplementation(async () => {
        callOrder.push('7_leaveReminders');
        return 1;
      });

      const now = new Date('2026-09-17T09:30:00Z');
      const result = await service.runFrequentCycle(now);

      expect(callOrder).toEqual([
        '1_cutoffLock',
        '2_cutoffReminders',
        '3_noSubmission',
        '4_expiredObjections',
        '5_objectionReminders',
        '6_autoEscalation',
        '7_leaveReminders',
      ]);

      expect(result.steps.cutoffLock.success).toBe(true);
      expect(result.steps.noSubmission.success).toBe(true);
      expect(result.steps.expiredObjections.success).toBe(true);
      expect(result.steps.autoEscalation.success).toBe(true);
    });

    it('harus mengisolasi kegagalan per-item sehingga error di satu langkah tidak menghentikan langkah lainnya (SAD §11.5, EPIC-15-T5)', async () => {
      dailyAccountabilityMock.evaluateCutoffLock.mockRejectedValue(
        new Error('Database lock contention error'),
      );

      const now = new Date('2026-09-17T09:30:00Z');
      const result = await service.runFrequentCycle(now);

      // Langkah 1 gagal
      expect(result.steps.cutoffLock.success).toBe(false);
      expect(result.steps.cutoffLock.error).toContain('Database lock contention error');

      // Namun langkah 2 s/d 7 tetap tereksekusi dengan sukses
      expect(result.steps.cutoffReminders.success).toBe(true);
      expect(result.steps.noSubmission.success).toBe(true);
      expect(result.steps.expiredObjections.success).toBe(true);
      expect(result.steps.autoEscalation.success).toBe(true);
      expect(result.steps.leaveReminders.success).toBe(true);
    });
  });

  describe('runDailyPatternFlag (SAD §11.4 Job #8, EPIC-15-T2)', () => {
    it('harus memanggil complianceService.evaluatePatternFlag pada pukul 03:00', async () => {
      const now = new Date('2026-09-17T03:00:00Z');
      await service.runDailyPatternFlag(now);

      expect(complianceMock.evaluatePatternFlag).toHaveBeenCalledWith(now);
    });
  });

  describe('runDailyDatabaseBackup (SAD §4.5, §11.4 Job #9, EPIC-15-T3)', () => {
    it('harus memanggil databaseBackupService.executeBackup pada pukul 02:00', async () => {
      const now = new Date('2026-09-17T02:00:00Z');
      await service.runDailyDatabaseBackup(now);

      expect(databaseBackupMock.executeBackup).toHaveBeenCalledWith(now);
    });
  });

  describe('runWeeklySummaryNotification (SAD §11.2 Job #10, §12.5, EPIC-15-T4)', () => {
    it('harus mengirim notifikasi Weekly Summary ke seluruh user aktif pada Senin 08:00', async () => {
      await service.runWeeklySummaryNotification();

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { status: 'Active' },
        select: { id: true },
      });

      expect(notificationMock.dispatchTrigger).toHaveBeenCalledTimes(2);
      expect(notificationMock.dispatchTrigger).toHaveBeenCalledWith(
        SystemNotificationTrigger.WEEKLY_SUMMARY_AVAILABLE,
        'user-1',
        expect.objectContaining({
          linkPath: '/reports/weekly-team-summary',
        }),
      );
    });
  });

  describe('Reminders dispatching (Job #1, #4, #7)', () => {
    it('sendCutoffReminders harus mendispatch MORNING_EOD_CUTOFF_REMINDER ke user yang belum submit', async () => {
      const count = await service.sendCutoffReminders(new Date());

      expect(count).toBe(1);
      expect(notificationMock.dispatchTrigger).toHaveBeenCalledWith(
        SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
        'user-1',
        expect.objectContaining({
          title: expect.stringContaining('Pengingat Cutoff'),
        }),
        'DailyAccountabilityRecord',
        'rec-1',
      );
    });

    it('sendObjectionWindowReminders harus mendispatch ke direct manager saat window mendekati akhir', async () => {
      const count = await service.sendObjectionWindowReminders(new Date());

      expect(count).toBe(1);
      expect(notificationMock.dispatchTrigger).toHaveBeenCalledWith(
        SystemNotificationTrigger.CORRECTION_REQUEST_OBJECTION_WINDOW_CLOSING,
        'mgr-1',
        expect.objectContaining({
          title: expect.stringContaining('Objection Window'),
        }),
        'CorrectionRequest',
        'cr-1',
      );
    });

    it('sendLeavePendingReminders harus mendispatch LEAVE_REQUEST_SUBMITTED jika cuti pending > 24 jam', async () => {
      const count = await service.sendLeavePendingReminders(new Date());

      expect(count).toBe(1);
      expect(notificationMock.dispatchTrigger).toHaveBeenCalledWith(
        SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED,
        'mgr-1',
        expect.objectContaining({
          title: expect.stringContaining('Permohonan Cuti Masih Pending'),
        }),
        'Exception',
        'exc-1',
      );
    });
  });
});
