import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ComplianceEventType,
  ExceptionStatus,
  ExceptionType,
  ManagerNoteType,
  ManagerNoteVisibility,
  PolicyCategory,
  Role,
  UserStatus,
} from '@prisma/client';
import { ComplianceService } from './services/compliance.service.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

function createMockUser(
  partial: Partial<CurrentUserPayload> & { userId: string; role: Role },
): CurrentUserPayload {
  return {
    email: `${partial.userId}@dutamedia.com`,
    function: partial.function ?? 'Engineering',
    directManagerId: null,
    sessionId: `session-${partial.userId}`,
    mustResetPassword: false,
    ...partial,
  };
}

describe('ComplianceService (EPIC-12)', () => {
  let service: ComplianceService;
  let prismaMock: any;
  let auditMock: any;
  let policyMock: any;
  let scopeFilterMock: any;
  let notificationMock: any;

  beforeEach(() => {
    prismaMock = {
      complianceEvent: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      managerNote: {
        create: vi.fn(),
      },
      exception: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      dailyAccountabilityRecord: {
        findUnique: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn((input: any) => {
        if (typeof input === 'function') {
          return input(prismaMock);
        }
        return Promise.all(input);
      }),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue(undefined),
    };

    policyMock = {
      getActivePolicySnapshot: vi.fn().mockResolvedValue({
        [PolicyCategory.Cutoff]: {
          morningOnTimeDeadline: '09:00',
          eodOnTimeDeadline: '18:00',
        },
        [PolicyCategory.GracePeriod]: {
          morningGraceMinutes: 30,
          eodGraceMinutes: 30,
        },
        [PolicyCategory.WorkdayCalendar]: {
          workDays: [1, 2, 3, 4, 5],
        },
        [PolicyCategory.CoachingFollowUpPeriod]: {
          coachingWindowDays: 14,
          patternThresholdCount: 3,
        },
        [PolicyCategory.EscalationThreshold]: {
          unacknowledgedThresholdHours: 2,
        },
      }),
    };

    scopeFilterMock = {
      isUserInScope: vi.fn().mockResolvedValue(true),
    };

    notificationMock = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    service = new ComplianceService(
      prismaMock,
      auditMock,
      scopeFilterMock,
      notificationMock,
      policyMock,
    );
  });

  describe('EPIC-12-T1: evaluateNoSubmission()', () => {
    it('harus melewati evaluasi jika hari target adalah akhir pekan (bukan hari kerja)', async () => {
      // Hari Minggu: 2026-09-20
      const sunday = new Date('2026-09-20T10:00:00.000Z');
      const result = await service.evaluateNoSubmission(sunday, sunday);

      expect(result.reason).toBe('NON_WORKING_DAY');
      expect(result.evaluatedUsers).toBe(0);
      expect(result.newNoSubmissions).toBe(0);
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });

    it('harus melewati evaluasi jika tanggal adalah Holiday company-wide yang approved', async () => {
      // Hari kerja: Senin 2026-09-21
      const monday = new Date('2026-09-21T10:00:00.000Z');
      prismaMock.exception.findFirst.mockResolvedValueOnce({
        id: 'holiday-1',
        type: ExceptionType.Holiday,
        status: ExceptionStatus.Approved,
        reason: 'Hari Libur Nasional',
      });

      const result = await service.evaluateNoSubmission(monday, monday);

      expect(result.reason).toBe('COMPANY_HOLIDAY');
      expect(result.evaluatedUsers).toBe(0);
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });

    it('harus melewati evaluasi jika waktu evaluasi belum melewati batas cutoff', async () => {
      // Senin jam 08:30 pagi (sebelum cutoff 09:30)
      const workDate = new Date('2026-09-21T00:00:00.000Z');
      const now = new Date(2026, 8, 21, 8, 30, 0);

      prismaMock.exception.findFirst.mockResolvedValueOnce(null); // No holiday

      const result = await service.evaluateNoSubmission(workDate, now);

      expect(result.reason).toBe('CUTOFF_NOT_REACHED');
      expect(result.evaluatedUsers).toBe(0);
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });

    it('harus membuat ComplianceEvent(NoSubmission) saat cutoff terlewat tanpa submission valid', async () => {
      // Senin jam 10:00 pagi (cutoff pagi 09:30 terlewat)
      const workDate = new Date('2026-09-21T00:00:00.000Z');
      const now = new Date(2026, 8, 21, 10, 0, 0);

      prismaMock.exception.findFirst
        .mockResolvedValueOnce(null) // No holiday
        .mockResolvedValueOnce(null); // No user exception

      prismaMock.organizationalAssignment.findMany.mockResolvedValueOnce([
        {
          userId: 'emp-1',
          role: Role.Employee,
          user: { id: 'emp-1', status: UserStatus.Active },
        },
      ]);

      prismaMock.complianceEvent.findFirst.mockResolvedValueOnce(null); // Belum ada compliance event hari ini
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValueOnce(null); // Tidak ada record
      prismaMock.complianceEvent.create.mockResolvedValueOnce({
        id: 'event-1',
        eventType: ComplianceEventType.NoSubmission,
      });

      const result = await service.evaluateNoSubmission(workDate, now);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newNoSubmissions).toBe(1);
      expect(result.skippedExempt).toBe(0);
      expect(prismaMock.complianceEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'emp-1',
          eventType: ComplianceEventType.NoSubmission,
          followUpStatus: 'Pending',
        }),
      });
    });

    it('harus otomatis mengecualikan karyawan yang memiliki Leave berstatus Approved (AC-09, FR-48)', async () => {
      const workDate = new Date('2026-09-21T00:00:00.000Z');
      const now = new Date(2026, 8, 21, 10, 0, 0);

      prismaMock.exception.findFirst
        .mockResolvedValueOnce(null) // No company holiday
        .mockResolvedValueOnce({
          id: 'leave-1',
          type: ExceptionType.Leave,
          status: ExceptionStatus.Approved,
        }); // Approved leave

      prismaMock.organizationalAssignment.findMany.mockResolvedValueOnce([
        {
          userId: 'emp-1',
          role: Role.Employee,
          user: { id: 'emp-1', status: UserStatus.Active },
        },
      ]);

      const result = await service.evaluateNoSubmission(workDate, now);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newNoSubmissions).toBe(0);
      expect(result.skippedExempt).toBe(1);
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });

    it('TIDAK boleh mengecualikan karyawan jika permohonan Leave masih Pending (AC-19)', async () => {
      const workDate = new Date('2026-09-21T00:00:00.000Z');
      const now = new Date(2026, 8, 21, 10, 0, 0);

      prismaMock.exception.findFirst
        .mockResolvedValueOnce(null) // No company holiday
        .mockResolvedValueOnce(null); // findFirst with Approved returns null karena statusnya Pending!

      prismaMock.organizationalAssignment.findMany.mockResolvedValueOnce([
        {
          userId: 'emp-1',
          role: Role.Employee,
          user: { id: 'emp-1', status: UserStatus.Active },
        },
      ]);

      prismaMock.complianceEvent.findFirst.mockResolvedValueOnce(null);
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValueOnce(null);

      const result = await service.evaluateNoSubmission(workDate, now);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newNoSubmissions).toBe(1);
      expect(result.skippedExempt).toBe(0);
      expect(prismaMock.complianceEvent.create).toHaveBeenCalled();
    });

    it('harus idempoten: tidak menduplikasi NoSubmission jika sudah pernah dicatat pada tanggal yang sama (FR-49, BR-17)', async () => {
      const workDate = new Date('2026-09-21T00:00:00.000Z');
      const now = new Date(2026, 8, 21, 19, 0, 0); // Pasca EOD (19:00 local time)

      prismaMock.exception.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      prismaMock.organizationalAssignment.findMany.mockResolvedValueOnce([
        {
          userId: 'emp-1',
          role: Role.Employee,
          user: { id: 'emp-1', status: UserStatus.Active },
        },
      ]);

      // Sudah ada event NoSubmission dari evaluasi pagi
      prismaMock.complianceEvent.findFirst.mockResolvedValueOnce({
        id: 'event-morning',
        eventType: ComplianceEventType.NoSubmission,
        eventDate: workDate,
      });

      const result = await service.evaluateNoSubmission(workDate, now);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newNoSubmissions).toBe(0);
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('EPIC-12-T2: evaluatePatternFlag()', () => {
    it('harus menerbitkan PatternFlag baru jika jumlah NoSubmission mencapai threshold (FR-29)', async () => {
      const asOf = new Date('2026-09-21T03:00:00.000Z');

      prismaMock.user.findMany.mockResolvedValueOnce([
        { id: 'emp-1', fullName: 'Budi Santoso', email: 'budi@dutamedia.com' },
      ]);

      // Tidak ada PatternFlag aktif uncoached
      prismaMock.complianceEvent.findFirst
        .mockResolvedValueOnce(null) // uncoachedPatternFlag
        .mockResolvedValueOnce(null); // latestCoaching

      // Count NoSubmission = 3 (mencapai threshold 3)
      prismaMock.complianceEvent.count.mockResolvedValueOnce(3);

      prismaMock.complianceEvent.create.mockResolvedValueOnce({
        id: 'flag-1',
        eventType: ComplianceEventType.PatternFlag,
      });

      prismaMock.organizationalAssignment.findFirst.mockResolvedValueOnce({
        userId: 'emp-1',
        directManagerId: 'manager-1',
      });

      const result = await service.evaluatePatternFlag(asOf);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newPatternFlags).toBe(1);
      expect(prismaMock.complianceEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'emp-1',
          eventType: ComplianceEventType.PatternFlag,
          followUpStatus: 'Active',
        }),
      });

      // Verifikasi notifikasi dikirim ke direct manager
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUserId: 'manager-1',
          triggerType: 'PATTERN_FLAG_DETECTED',
        }),
      );
    });

    it('harus idempoten per episode: tidak membuat row baru jika user sudah memiliki PatternFlag aktif tanpa coaching (SAD §9.7)', async () => {
      const asOf = new Date('2026-09-21T03:00:00.000Z');

      prismaMock.user.findMany.mockResolvedValueOnce([
        { id: 'emp-1', fullName: 'Budi Santoso', email: 'budi@dutamedia.com' },
      ]);

      // Sudah ada flag aktif berstatus 'Active'
      prismaMock.complianceEvent.findFirst.mockResolvedValueOnce({
        id: 'flag-active',
        eventType: ComplianceEventType.PatternFlag,
        followUpStatus: 'Active',
      });

      const result = await service.evaluatePatternFlag(asOf);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newPatternFlags).toBe(0);
      expect(prismaMock.complianceEvent.count).not.toHaveBeenCalled();
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });

    it('hanya menghitung NoSubmission setelah tanggal coaching terakhir (episode baru)', async () => {
      const asOf = new Date('2026-09-21T03:00:00.000Z');

      prismaMock.user.findMany.mockResolvedValueOnce([
        { id: 'emp-1', fullName: 'Budi Santoso', email: 'budi@dutamedia.com' },
      ]);

      prismaMock.complianceEvent.findFirst
        .mockResolvedValueOnce(null) // No uncoached flag
        .mockResolvedValueOnce({
          id: 'coaching-1',
          eventType: ComplianceEventType.Coaching,
          eventDate: new Date('2026-09-15T00:00:00.000Z'),
        }); // Pernah dicoaching tanggal 15

      // NoSubmission setelah tanggal 15 hanya 1 (belum mencapai threshold 3)
      prismaMock.complianceEvent.count.mockResolvedValueOnce(1);

      const result = await service.evaluatePatternFlag(asOf);

      expect(result.evaluatedUsers).toBe(1);
      expect(result.newPatternFlags).toBe(0);
      expect(prismaMock.complianceEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('EPIC-12-T3: computeAvailableActions()', () => {
    it('mengembalikan ["coach"] untuk PatternFlag aktif bagi Supervisor_TL dan Head', () => {
      const event = {
        eventType: ComplianceEventType.PatternFlag,
        followUpStatus: 'Active',
      };
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });
      const head = createMockUser({ userId: 'head-1', role: Role.Head });
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });

      expect(service.computeAvailableActions(event, supervisor)).toEqual(['coach']);
      expect(service.computeAvailableActions(event, head)).toEqual(['coach']);
      expect(service.computeAvailableActions(event, hrga)).toEqual([]);
    });

    it('mengembalikan ["record_warning"] untuk Coaching bagi HRGA', () => {
      const event = {
        eventType: ComplianceEventType.Coaching,
        followUpStatus: 'Coached',
      };
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });

      expect(service.computeAvailableActions(event, hrga)).toEqual(['record_warning']);
      expect(service.computeAvailableActions(event, supervisor)).toEqual([]);
    });

    it('mengembalikan ["escalate_formal"] untuk RecordedWarning bagi HRGA', () => {
      const event = {
        eventType: ComplianceEventType.RecordedWarning,
        followUpStatus: 'Recorded',
      };
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });
      expect(service.computeAvailableActions(event, hrga)).toEqual(['escalate_formal']);
    });

    it('mengembalikan [] untuk EscalatedFormalProcess (titik akhir sistem)', () => {
      const event = {
        eventType: ComplianceEventType.EscalatedFormalProcess,
        followUpStatus: 'Escalated',
      };
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });
      expect(service.computeAvailableActions(event, hrga)).toEqual([]);
    });
  });

  describe('EPIC-12-T3: findAll() and findById()', () => {
    it('menolak akses pengguna dengan peran Employee (403 Forbidden)', async () => {
      const employee = createMockUser({ userId: 'emp-1', role: Role.Employee });

      await expect(service.findAll(employee, {})).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findById(employee, 'event-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('HRGA dapat melihat compliance event company-wide dengan pagination', async () => {
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });

      prismaMock.complianceEvent.count.mockResolvedValueOnce(1);
      prismaMock.complianceEvent.findMany.mockResolvedValueOnce([
        {
          id: 'event-1',
          eventType: ComplianceEventType.PatternFlag,
          followUpStatus: 'Active',
          user: { id: 'emp-1', fullName: 'Budi' },
        },
      ]);

      const result = await service.findAll(hrga, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].availableActions).toEqual([]); // HRGA cannot coach pattern flag
    });

    it('Supervisor hanya melihat compliance event untuk bawahan langsungnya', async () => {
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });

      prismaMock.organizationalAssignment.findMany.mockResolvedValueOnce([
        { userId: 'sub-1' },
      ]);
      prismaMock.complianceEvent.count.mockResolvedValueOnce(1);
      prismaMock.complianceEvent.findMany.mockResolvedValueOnce([
        {
          id: 'event-sub-1',
          userId: 'sub-1',
          eventType: ComplianceEventType.PatternFlag,
          followUpStatus: 'Active',
          user: { id: 'sub-1', fullName: 'Subordinate' },
        },
      ]);

      const result = await service.findAll(supervisor, {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].availableActions).toEqual(['coach']);
    });

    it('findById mengembalikan 404 jika event berada di luar scope supervisor', async () => {
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'event-out-of-scope',
        userId: 'other-emp',
      });
      scopeFilterMock.isUserInScope.mockResolvedValueOnce(false);

      await expect(
        service.findById(supervisor, 'event-out-of-scope'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('EPIC-12-T4: coach()', () => {
    it('Supervisor berhasil melakukan coaching dalam satu transaksi atomik (SAD §10.8, §15.1)', async () => {
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'flag-1',
        userId: 'emp-1',
        eventType: ComplianceEventType.PatternFlag,
        followUpStatus: 'Active',
        policySnapshot: { count: 3 },
      });

      scopeFilterMock.isUserInScope.mockResolvedValueOnce(true);

      prismaMock.managerNote.create.mockResolvedValueOnce({
        id: 'note-1',
        type: ManagerNoteType.Coaching,
        note: 'Sesi pembinaan kedisiplinan check-in harian.',
      });

      prismaMock.complianceEvent.create.mockResolvedValueOnce({
        id: 'coaching-1',
        eventType: ComplianceEventType.Coaching,
        followUpStatus: 'Coached',
      });

      prismaMock.complianceEvent.update.mockResolvedValueOnce({
        id: 'flag-1',
        followUpStatus: 'Coached',
      });

      const result = await service.coach(supervisor, 'flag-1', {
        note: 'Sesi pembinaan kedisiplinan check-in harian.',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
      });

      expect(result.complianceEvent.eventType).toBe(ComplianceEventType.Coaching);
      expect(result.managerNote.type).toBe(ManagerNoteType.Coaching);

      // Verifikasi AuditLog(action=MANAGER_NOTE_CREATED) (SAD §15.1)
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'sup-1',
          action: 'MANAGER_NOTE_CREATED',
          relatedEntityType: 'ManagerNote',
        }),
        prismaMock,
      );

      // Verifikasi dispatch notifikasi ke karyawan
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUserId: 'emp-1',
          triggerType: 'MANAGER_NOTE_CREATED',
        }),
        prismaMock,
      );
    });

    it('menolak coaching jika target event bukan PatternFlag (409 Conflict)', async () => {
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'event-1',
        userId: 'emp-1',
        eventType: ComplianceEventType.NoSubmission,
      });
      scopeFilterMock.isUserInScope.mockResolvedValueOnce(true);

      await expect(
        service.coach(supervisor, 'event-1', { note: 'Pembinaan' }),
      ).rejects.toThrow(ConflictException);
    });

    it('menolak coaching jika PatternFlag sudah berstatus Coached (409 Conflict)', async () => {
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'flag-1',
        userId: 'emp-1',
        eventType: ComplianceEventType.PatternFlag,
        followUpStatus: 'Coached',
      });
      scopeFilterMock.isUserInScope.mockResolvedValueOnce(true);

      await expect(
        service.coach(supervisor, 'flag-1', { note: 'Pembinaan ulang' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('EPIC-12-T5: recordWarning() and escalateFormal()', () => {
    it('HRGA berhasil menerbitkan Recorded Warning atas event Coaching', async () => {
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'coaching-1',
        userId: 'emp-1',
        eventType: ComplianceEventType.Coaching,
        followUpStatus: 'Coached',
      });

      prismaMock.complianceEvent.create.mockResolvedValueOnce({
        id: 'warning-1',
        eventType: ComplianceEventType.RecordedWarning,
        followUpStatus: 'Recorded',
      });

      const result = await service.recordWarning(hrga, 'coaching-1', {
        note: 'Peringatan tertulis pertama atas kelalaian check-in berulang.',
      });

      expect(result.eventType).toBe(ComplianceEventType.RecordedWarning);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'hrga-1',
          action: 'COMPLIANCE_WARNING_RECORDED',
        }),
        prismaMock,
      );
    });

    it('menolak recordWarning jika dipanggil oleh non-HRGA (403 Forbidden)', async () => {
      const supervisor = createMockUser({ userId: 'sup-1', role: Role.Supervisor_TL });

      await expect(
        service.recordWarning(supervisor, 'coaching-1', { note: 'Warning' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('HRGA berhasil mencatat Escalate Formal Process atas event RecordedWarning', async () => {
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'warning-1',
        userId: 'emp-1',
        eventType: ComplianceEventType.RecordedWarning,
        followUpStatus: 'Recorded',
      });

      prismaMock.complianceEvent.create.mockResolvedValueOnce({
        id: 'escalate-1',
        eventType: ComplianceEventType.EscalatedFormalProcess,
        followUpStatus: 'Escalated',
      });

      const result = await service.escalateFormal(hrga, 'warning-1', {
        note: 'Eskalasi proses disipliner formal ke manajemen/direksi.',
      });

      expect(result.eventType).toBe(ComplianceEventType.EscalatedFormalProcess);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'hrga-1',
          action: 'COMPLIANCE_FORMAL_ESCALATED',
        }),
        prismaMock,
      );
    });

    it('menolak escalateFormal jika event belum melalui Recorded Warning (409 Conflict)', async () => {
      const hrga = createMockUser({ userId: 'hrga-1', role: Role.HRGA });

      prismaMock.complianceEvent.findUnique.mockResolvedValueOnce({
        id: 'coaching-1',
        userId: 'emp-1',
        eventType: ComplianceEventType.Coaching,
        followUpStatus: 'Coached',
      });

      await expect(
        service.escalateFormal(hrga, 'coaching-1', { note: 'Eskalasi' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
