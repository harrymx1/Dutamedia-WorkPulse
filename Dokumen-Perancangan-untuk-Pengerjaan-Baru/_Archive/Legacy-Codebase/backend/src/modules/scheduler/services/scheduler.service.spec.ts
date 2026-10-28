import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyCategory } from '@prisma/client';
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
  let exceptionMock: any;
  let policyMock: any;
  let identityMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'user-1', status: 'Active' },
          { id: 'user-2', status: 'Active' },
        ]),
      },
      exception: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      notification: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    dailyAccountabilityMock = {
      evaluateCutoffLock: vi.fn().mockResolvedValue({ lockedCount: 2 }),
      findRecordsNearingCutoff: vi.fn().mockResolvedValue([
        { id: 'rec-1', employeeUserId: 'user-1' },
      ]),
      findPendingSubmissionEmployeeIds: vi.fn().mockResolvedValue(['user-1']),
    };

    complianceMock = {
      evaluateNoSubmission: vi.fn().mockResolvedValue({ evaluatedCount: 5 }),
      evaluatePatternFlag: vi.fn().mockResolvedValue({ newPatternFlags: 1 }),
    };

    correctionRequestMock = {
      evaluateExpiredObjectionWindows: vi.fn().mockResolvedValue({ processedCount: 1 }),
      findPendingWithClosingObjectionWindow: vi.fn().mockResolvedValue([
        { id: 'cr-1', directManagerId: 'mgr-1' },
      ]),
    };

    blockerMock = {
      evaluateAutoEscalation: vi.fn().mockResolvedValue({ escalatedCount: 1 }),
    };

    notificationMock = {
      dispatchTrigger: vi.fn().mockResolvedValue([]),
      hasCutoffReminderNotification: vi.fn().mockResolvedValue(false),
    };

    databaseBackupMock = {
      executeBackup: vi.fn().mockResolvedValue({ success: true, storagePath: 'backups/mock' }),
    };

    exceptionMock = {
      findPendingLeavesOlderThan: vi.fn().mockResolvedValue([
        { id: 'exc-1', directManagerId: 'mgr-1' },
      ]),
      hasApprovedHolidayOnDate: vi.fn().mockResolvedValue(false),
    };

    identityMock = {
      findActiveUserIds: vi.fn().mockResolvedValue(['user-1', 'user-2']),
    };

    policyMock = {
      getActivePolicySnapshot: vi.fn().mockImplementation((cats: any[]) => {
        const result: any = {};
        if (cats.includes(PolicyCategory.Cutoff)) {
          result[PolicyCategory.Cutoff] = {
            morningOnTimeDeadline: '09:00',
            eodOnTimeDeadline: '18:00',
          };
        }
        if (cats.includes(PolicyCategory.WorkdayCalendar)) {
          result[PolicyCategory.WorkdayCalendar] = {
            workDays: [1, 2, 3, 4, 5],
          };
        }
        if (cats.includes(PolicyCategory.ReminderThreshold)) {
          result[PolicyCategory.ReminderThreshold] = {
            objectionWindowReminderHours: 2,
            leavePendingReminderHours: 24,
          };
        }
        return Promise.resolve(result);
      }),
    };

    service = new SchedulerService(
      prismaMock,
      dailyAccountabilityMock,
      complianceMock,
      correctionRequestMock,
      blockerMock,
      notificationMock,
      databaseBackupMock,
      exceptionMock,
      policyMock,
      identityMock,
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

      expect(identityMock.findActiveUserIds).toHaveBeenCalled();

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
    describe('sendCutoffReminders (Job #1, SAD §11.2 #1, PRD FR-28, ADR-014)', () => {
      it.each([
        { timeStr: '07:59:00.000', h: 7, m: 59, s: 0, ms: 0, expected: 0, desc: 'sebelum window dimulai (T - 61m)' },
        { timeStr: '08:00:00.000', h: 8, m: 0, s: 0, ms: 0, expected: 1, desc: 'tepat batas awal window 60m (T - 60m)' },
        { timeStr: '08:30:00.000', h: 8, m: 30, s: 0, ms: 0, expected: 1, desc: 'di dalam window aktif (T - 30m)' },
        { timeStr: '08:59:59.999', h: 8, m: 59, s: 59, ms: 999, expected: 1, desc: 'sesaat sebelum batas deadline (T - 1ms)' },
        { timeStr: '09:00:00.000', h: 9, m: 0, s: 0, ms: 0, expected: 0, desc: 'tepat di batas deadline On-Time (T)' },
        { timeStr: '09:15:00.000', h: 9, m: 15, s: 0, ms: 0, expected: 0, desc: 'setelah deadline / dalam Grace Period (T + 15m)' },
      ])(
        'Morning Cutoff Boundary: pada $timeStr ($desc) harus return $expected reminder',
        async ({ h, m, s, ms, expected }) => {
          const simTime = new Date(2026, 8, 16, h, m, s, ms); // 16 September 2026 adalah Rabu (workday 3)
          const count = await service.sendCutoffReminders(simTime);
          expect(count).toBe(expected);
        },
      );

      it.each([
        { timeStr: '16:59:00.000', h: 16, m: 59, s: 0, ms: 0, expected: 0, desc: 'sebelum window EOD dimulai (T - 61m)' },
        { timeStr: '17:00:00.000', h: 17, m: 0, s: 0, ms: 0, expected: 1, desc: 'tepat batas awal window EOD 60m (T - 60m)' },
        { timeStr: '17:30:00.000', h: 17, m: 30, s: 0, ms: 0, expected: 1, desc: 'di dalam window aktif EOD (T - 30m)' },
        { timeStr: '17:59:59.999', h: 17, m: 59, s: 59, ms: 999, expected: 1, desc: 'sesaat sebelum batas deadline EOD (T - 1ms)' },
        { timeStr: '18:00:00.000', h: 18, m: 0, s: 0, ms: 0, expected: 0, desc: 'tepat di batas deadline EOD (T)' },
        { timeStr: '18:15:00.000', h: 18, m: 15, s: 0, ms: 0, expected: 0, desc: 'setelah deadline EOD (T + 15m)' },
      ])(
        'EOD Cutoff Boundary: pada $timeStr ($desc) harus return $expected reminder',
        async ({ h, m, s, ms, expected }) => {
          const simTime = new Date(2026, 8, 16, h, m, s, ms); // 16 September 2026 adalah Rabu (workday 3)
          const count = await service.sendCutoffReminders(simTime);
          expect(count).toBe(expected);
        },
      );

      it('sendCutoffReminders harus mendispatch notifikasi dengan payload deterministic dan relatedEntityId null/undefined', async () => {
        const simTime = new Date(2026, 8, 16, 8, 30, 0);
        const count = await service.sendCutoffReminders(simTime);

        expect(count).toBe(1);
        expect(notificationMock.dispatchTrigger).toHaveBeenCalledWith(
          SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
          'user-1',
          expect.objectContaining({
            title: 'Pengingat Cutoff Morning Check-in',
            linkPath: '/my-today',
            iconType: 'clock-outline',
            metadata: {
              phase: 'MORNING',
              workDate: '2026-09-16',
            },
          }),
          undefined,
          undefined,
        );
      });

      it('sendCutoffReminders harus skip dan return 0 jika hari bukan hari kerja', async () => {
        const sunday = new Date(2026, 8, 20, 8, 30, 0); // 20 September 2026 adalah Minggu (day 0)
        const count = await service.sendCutoffReminders(sunday);
        expect(count).toBe(0);
        expect(notificationMock.dispatchTrigger).not.toHaveBeenCalled();
      });

      it('sendCutoffReminders harus skip dan return 0 jika ada approved Company Holiday', async () => {
        exceptionMock.hasApprovedHolidayOnDate.mockResolvedValueOnce(true);
        const simTime = new Date(2026, 8, 16, 8, 30, 0);
        const count = await service.sendCutoffReminders(simTime);
        expect(count).toBe(0);
        expect(notificationMock.dispatchTrigger).not.toHaveBeenCalled();
      });

      it('sendCutoffReminders harus skip jika seluruh karyawan sudah submit (kandidat kosong)', async () => {
        dailyAccountabilityMock.findPendingSubmissionEmployeeIds.mockResolvedValueOnce([]);
        const simTime = new Date(2026, 8, 16, 8, 30, 0);
        const count = await service.sendCutoffReminders(simTime);
        expect(count).toBe(0);
        expect(notificationMock.dispatchTrigger).not.toHaveBeenCalled();
      });

      it('sendCutoffReminders harus skip user yang sudah pernah menerima reminder pada workDate dan fase tersebut', async () => {
        notificationMock.hasCutoffReminderNotification.mockResolvedValueOnce(true);
        const simTime = new Date(2026, 8, 16, 8, 30, 0);
        const count = await service.sendCutoffReminders(simTime);
        expect(count).toBe(0);
        expect(notificationMock.dispatchTrigger).not.toHaveBeenCalled();
      });

      it('sendCutoffReminders harus menolak eksekusi tumpang tindih dalam satu proses (concurrency guard)', async () => {
        const simTime = new Date(2026, 8, 16, 8, 30, 0);
        let slowResolve: () => void;
        const slowPromise = new Promise<string[]>((res) => {
          slowResolve = () => res(['user-1']);
        });
        dailyAccountabilityMock.findPendingSubmissionEmployeeIds.mockReturnValueOnce(slowPromise);

        const firstCall = service.sendCutoffReminders(simTime);
        const secondCall = await service.sendCutoffReminders(simTime);
        expect(secondCall).toBe(0);

        slowResolve!();
        const firstResult = await firstCall;
        expect(firstResult).toBe(1);
      });
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
