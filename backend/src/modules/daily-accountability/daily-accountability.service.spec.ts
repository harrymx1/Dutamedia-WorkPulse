import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AdditionalWorkReason,
  CommitmentOutcome,
  Continuation,
  DailyStatus,
  PolicyCategory,
  Role,
} from '@prisma/client';
import {
  DailyAccountabilityService,
  computeWorstOfStatus,
} from './services/daily-accountability.service.js';
import { BusinessRuleViolationException, NotFoundException } from '../shared/exceptions/api.exception.js';

describe('DailyAccountabilityService (EPIC-07)', () => {
  let service: DailyAccountabilityService;
  let prismaMock: any;
  let auditMock: any;
  let policyMock: any;
  let scopeFilterMock: any;
  let statusSuggestionMock: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 16, 8, 15, 0));

    prismaMock = {
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
      dailyAccountabilityRecord: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      commitment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      additionalWork: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue({ id: 'audit-id-1' }),
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
      }),
    };

    scopeFilterMock = {
      buildScopeFilter: vi.fn().mockResolvedValue({ employeeUserId: 'user-1' }),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };

    statusSuggestionMock = {
      evaluateSuggestedStatus: vi.fn().mockResolvedValue({
        suggestedStatus: DailyStatus.GREEN,
        reasons: ['Seluruh pekerjaan selesai'],
      }),
    };

    service = new DailyAccountabilityService(
      prismaMock,
      auditMock,
      policyMock,
      scopeFilterMock,
      statusSuggestionMock,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('computeWorstOfStatus (SAD §9.3)', () => {
    it('harus menghasilkan GREEN jika semua komitmen GREEN', () => {
      expect(computeWorstOfStatus([DailyStatus.GREEN, DailyStatus.GREEN])).toBe(
        DailyStatus.GREEN,
      );
    });

    it('harus menghasilkan AMBER jika ada AMBER dan tidak ada RED', () => {
      expect(
        computeWorstOfStatus([DailyStatus.GREEN, DailyStatus.AMBER, DailyStatus.GREEN]),
      ).toBe(DailyStatus.AMBER);
    });

    it('harus menghasilkan RED jika ada minimal satu RED', () => {
      expect(
        computeWorstOfStatus([DailyStatus.GREEN, DailyStatus.AMBER, DailyStatus.RED]),
      ).toBe(DailyStatus.RED);
    });
  });

  describe('EPIC-07-T1: submitMorningCheckin', () => {
    const userId = 'user-uuid-1';

    it('harus menolak jika commitments kurang dari 1 atau lebih dari 3 (BR-01)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });

      await expect(
        service.submitMorningCheckin(userId, { commitments: [] as any }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menegakkan aturan tetap produk batas 1-3 komitmen (BR-01, PDD §8)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });

      // 4 komitmen harus ditolak karena batas maksimal produk adalah 3 (BR-01)
      await expect(
        service.submitMorningCheckin(userId, {
          commitments: [
            { sequenceNo: 1, text: 'Task 1', initialRisk: DailyStatus.GREEN },
            { sequenceNo: 2, text: 'Task 2', initialRisk: DailyStatus.GREEN },
            { sequenceNo: 3, text: 'Task 3', initialRisk: DailyStatus.GREEN },
            { sequenceNo: 4, text: 'Task 4', initialRisk: DailyStatus.GREEN },
          ],
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menolak jika sequenceNo tidak unik', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });

      const commitments = [
        { sequenceNo: 1, text: 'Task 1', initialRisk: DailyStatus.GREEN },
        { sequenceNo: 1, text: 'Task 2', initialRisk: DailyStatus.GREEN },
      ];

      await expect(
        service.submitMorningCheckin(userId, { commitments }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menolak jika initialRisk AMBER/RED tanpa knownBlockerNote (FR-04, BR-03)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });

      const commitments = [
        {
          sequenceNo: 1,
          text: 'Task with risk',
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: '', // kosong!
        },
      ];

      await expect(
        service.submitMorningCheckin(userId, { commitments }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus berhasil submit dan mencatat initialStatus worst-of serta AuditLog', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'record-uuid-1',
        employeeUserId: userId,
        initialStatus: DailyStatus.AMBER,
      });
      prismaMock.commitment.create
        .mockResolvedValueOnce({
          id: 'comm-1',
          sequenceNo: 1,
          initialRisk: DailyStatus.GREEN,
        })
        .mockResolvedValueOnce({
          id: 'comm-2',
          sequenceNo: 2,
          initialRisk: DailyStatus.AMBER,
        });

      const commitments = [
        { sequenceNo: 1, text: 'Task 1', initialRisk: DailyStatus.GREEN },
        {
          sequenceNo: 2,
          text: 'Task 2',
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Waiting for API spec',
        },
      ];

      const result = await service.submitMorningCheckin(userId, { commitments });

      expect(result.id).toBe('record-uuid-1');
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DAILY_RECORD_MORNING_SUBMITTED',
          relatedEntityType: 'DailyAccountabilityRecord',
        }),
        expect.anything(),
      );
    });
  });

  describe('EPIC-07-T2: getTodayRecord & availableActions', () => {
    it('harus mengembalikan availableActions [morning_checkin] dan carryOverDraft jika belum checkin', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.findFirst.mockResolvedValue({
        id: 'prev-record-id',
        commitments: [
          {
            text: 'Carry over task',
            continuation: Continuation.Continue,
            continuationReason: 'Ongoing work',
          },
        ],
        additionalWorks: [],
      });

      const result = await service.getTodayRecord('user-1');

      expect(result.record).toBeNull();
      expect(result.availableActions).toContain('morning_checkin');
      expect(result.carryOverDraft).toHaveLength(1);
      expect(result.carryOverDraft![0].text).toBe('Carry over task');
    });

    it('harus menyertakan edit untuk AdditionalWork terlepas dari isLocked (ADR-001)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'record-today',
        employeeUserId: 'user-1',
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isMorningLocked: true, isEodLocked: false }],
        additionalWorks: [{ id: 'aw1', isLocked: true }],
      });

      const result = await service.getTodayRecord('user-1');

      expect(result.record!.additionalWorks[0].availableActions).toContain('edit');
    });
  });

  describe('EPIC-07-T3: submitEodCheckin & Status Suggestion Engine', () => {
    const userId = 'user-1';
    const recordId = 'rec-1';

    it('harus menolak jika Cancelled tanpa outcomeReason', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Cancelled,
            continuation: Continuation.DoNotContinue,
            outcomeReason: '', // kosong!
          },
        ],
        finalStatus: DailyStatus.GREEN,
      };

      await expect(
        service.submitEodCheckin(userId, recordId, dto),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menolak jika Continue + NotCompleted tanpa continuationReason (FR-09)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.NotCompleted,
            continuation: Continuation.Continue,
            continuationReason: '', // kosong!
          },
        ],
        finalStatus: DailyStatus.GREEN,
      };

      await expect(
        service.submitEodCheckin(userId, recordId, dto),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus mengembalikan requiresOverrideConfirmation jika finalStatus != suggestedStatus (SAD §9.3)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      // Suggestion Engine menyarankan RED karena ada critical blocker
      statusSuggestionMock.evaluateSuggestedStatus.mockResolvedValue({
        suggestedStatus: DailyStatus.RED,
        reasons: ['Terdapat blocker Critical aktif.'],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Completed,
            continuation: Continuation.DoNotContinue,
          },
        ],
        finalStatus: DailyStatus.GREEN, // User memilih GREEN padahal disarankan RED!
      };

      const result: any = await service.submitEodCheckin(userId, recordId, dto);

      expect(result.requiresOverrideConfirmation).toBe(true);
      expect(result.suggestedStatus).toBe(DailyStatus.RED);
      expect(result.requestedStatus).toBe(DailyStatus.GREEN);
    });

    it('harus fallback ke getActivePolicySnapshot jika Cutoff/GracePeriod belum ada di policySnapshot record saat submitEodCheckin', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        policySnapshot: {}, // KOSONG / tidak ada Cutoff & GracePeriod
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Completed,
            continuation: Continuation.DoNotContinue,
          },
        ],
        finalStatus: DailyStatus.GREEN,
      };

      await service.submitEodCheckin(userId, recordId, dto);

      expect(policyMock.getActivePolicySnapshot).toHaveBeenCalledWith(
        [PolicyCategory.Cutoff, PolicyCategory.GracePeriod],
        expect.any(Date),
      );
    });
  });

  describe('EPIC-07-T4: confirmOverride', () => {
    it('harus menolak jika overrideReason kurang dari 5 karakter', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'user-1',
        commitments: [],
        additionalWorks: [],
      });

      await expect(
        service.confirmOverride('user-1', 'rec-1', {
          finalStatus: DailyStatus.GREEN,
          overrideReason: 'ok', // < 5 chars!
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menyimpan overrideReason ke AuditLog (SAD §9.3)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'user-1',
        finalStatus: DailyStatus.AMBER,
        commitments: [],
        additionalWorks: [],
      });
      prismaMock.dailyAccountabilityRecord.update.mockResolvedValue({
        id: 'rec-1',
        finalStatus: DailyStatus.GREEN,
      });

      await service.confirmOverride('user-1', 'rec-1', {
        finalStatus: DailyStatus.GREEN,
        overrideReason: 'Critical blocker sudah dimitigasi secara offline.',
      });

      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DAILY_RECORD_STATUS_OVERRIDDEN',
          valueAfter: expect.objectContaining({
            finalStatus: DailyStatus.GREEN,
            overrideReason: 'Critical blocker sudah dimitigasi secara offline.',
          }),
        }),
        expect.anything(),
      );
    });
  });

  describe('EPIC-07-T5: patchCommitment (Dual Lock Isolation)', () => {
    it('harus menolak perubahan field Morning jika isMorningLocked = true (SAD §9.8, FR-05)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        isMorningLocked: true,
        dailyRecord: { employeeUserId: 'user-1' },
      });

      await expect(
        service.patchCommitment('user-1', 'comm-1', {
          text: 'Teks baru setelah cutoff',
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menolak perubahan field EOD jika isEodLocked = true (SAD §9.8)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        isEodLocked: true,
        dailyRecord: { employeeUserId: 'user-1' },
      });

      await expect(
        service.patchCommitment('user-1', 'comm-1', {
          outcome: CommitmentOutcome.Completed,
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });
  });

  describe('EPIC-07-T6: AdditionalWork (ADR-001 adherence)', () => {
    it('harus mengizinkan patch AdditionalWork terlepas dari isLocked dan mencatat AuditLog', async () => {
      prismaMock.additionalWork.findUnique.mockResolvedValue({
        id: 'aw-1',
        isLocked: true, // bahkan saat isLocked = true, per ADR-001 tidak diblokir!
        dailyRecord: { employeeUserId: 'user-1' },
      });
      prismaMock.additionalWork.update.mockResolvedValue({
        id: 'aw-1',
        text: 'Updated additional work text',
      });

      const result = await service.patchAdditionalWork('user-1', 'aw-1', {
        text: 'Updated additional work text',
      });

      expect(result.id).toBe('aw-1');
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ADDITIONAL_WORK_UPDATED',
          relatedEntityType: 'AdditionalWork',
        }),
        expect.anything(),
      );
    });
  });

  describe('EPIC-07-T7: Scoped Access (SAD §7.7)', () => {
    it('harus melempar NotFoundException (404) jika record di luar scope user', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-other-user',
        employeeUserId: 'other-user',
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(false); // Di luar scope!

      await expect(
        service.findById({ userId: 'user-1', role: Role.Employee } as any, 'rec-other-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('findAll: harus melempar NotFoundException (404) jika query.employeeUserId di luar scope user (Pola 2)', async () => {
      scopeFilterMock.isUserInScope.mockResolvedValue(false);

      await expect(
        service.findAll(
          { userId: 'spv-1', role: Role.Supervisor_TL } as any,
          { page: 1, limit: 10, employeeUserId: 'other-emp' },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('findAll: harus memfilter query dengan buildScopeFilter jika query.employeeUserId tidak dispesifikasikan (Pola 1)', async () => {
      scopeFilterMock.buildScopeFilter.mockResolvedValue({
        employeeUserId: { in: ['emp-1', 'emp-2'] },
      });
      prismaMock.dailyAccountabilityRecord.count.mockResolvedValue(1);
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      await service.findAll(
        { userId: 'spv-1', role: Role.Supervisor_TL } as any,
        { page: 1, limit: 10 },
      );

      expect(prismaMock.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeUserId: { in: ['emp-1', 'emp-2'] },
          }),
        }),
      );
    });

    it('submitEodCheckin: harus melempar NotFoundException (404) jika record milik pengguna lain (Pola 2)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'other-user',
        commitments: [],
        additionalWorks: [],
      });

      await expect(
        service.submitEodCheckin('attacker-user', 'rec-1', {
          finalStatus: DailyStatus.GREEN,
          commitmentOutcomes: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('confirmOverride: harus melempar NotFoundException (404) jika record milik pengguna lain (Pola 2)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'other-user',
        commitments: [],
        additionalWorks: [],
      });

      await expect(
        service.confirmOverride('attacker-user', 'rec-1', {
          finalStatus: DailyStatus.AMBER,
          overrideReason: 'Alasan override status',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('patchCommitment: harus melempar NotFoundException (404) jika komitmen milik pengguna lain (Pola 2)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        dailyRecord: { employeeUserId: 'other-user' },
      });

      await expect(
        service.patchCommitment('attacker-user', 'comm-1', {
          outcomeReason: 'Catatan komitmen',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('createAdditionalWork: harus melempar NotFoundException (404) jika dailyRecord milik pengguna lain (Pola 2)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'other-user',
      });

      await expect(
        service.createAdditionalWork('attacker-user', {
          dailyRecordId: 'rec-1',
          text: 'Pekerjaan tambahan',
          reason: AdditionalWorkReason.MissedInPlanning,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('patchAdditionalWork: harus melempar NotFoundException (404) jika additionalWork milik pengguna lain (Pola 2)', async () => {
      prismaMock.additionalWork.findUnique.mockResolvedValue({
        id: 'aw-1',
        dailyRecord: { employeeUserId: 'other-user' },
      });

      await expect(
        service.patchAdditionalWork('attacker-user', 'aw-1', {
          text: 'Update pekerjaan',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('T1 — computeWorstOfStatus — seluruh kombinasi GREEN/AMBER/RED (SAD §9.3, §19.2)', () => {
    it('worst-of: semua GREEN → GREEN', () => {
      expect(computeWorstOfStatus([DailyStatus.GREEN, DailyStatus.GREEN, DailyStatus.GREEN])).toBe(DailyStatus.GREEN);
    });

    it('worst-of: ada satu AMBER di antara GREEN → AMBER', () => {
      expect(computeWorstOfStatus([DailyStatus.GREEN, DailyStatus.AMBER, DailyStatus.GREEN])).toBe(DailyStatus.AMBER);
    });

    it('worst-of: semua AMBER → AMBER', () => {
      expect(computeWorstOfStatus([DailyStatus.AMBER, DailyStatus.AMBER])).toBe(DailyStatus.AMBER);
    });

    it('worst-of: ada satu RED di antara GREEN dan AMBER → RED', () => {
      expect(computeWorstOfStatus([DailyStatus.GREEN, DailyStatus.AMBER, DailyStatus.RED])).toBe(DailyStatus.RED);
    });

    it('worst-of: semua RED → RED', () => {
      expect(computeWorstOfStatus([DailyStatus.RED, DailyStatus.RED])).toBe(DailyStatus.RED);
    });

    it('worst-of: array kosong → GREEN (default, tidak ada risiko)', () => {
      expect(computeWorstOfStatus([])).toBe(DailyStatus.GREEN);
    });

    it('worst-of: satu item RED → RED', () => {
      expect(computeWorstOfStatus([DailyStatus.RED])).toBe(DailyStatus.RED);
    });
  });

  describe('findRecordsNearingCutoff (SAD §11.2 #1, §6.4)', () => {
    it('harus mengambil record yang belum submitted dan belum locked mendekati cutoff', async () => {
      const mockRecords = [{ id: 'rec-1', employeeUserId: 'emp-1' }];
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue(mockRecords);

      const targetDate = new Date('2026-09-18T08:30:00Z');
      const result = await service.findRecordsNearingCutoff(targetDate, 50);

      expect(result).toEqual(mockRecords);
      expect(prismaMock.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith({
        where: {
          workDate: expect.any(Date),
          morningSubmittedAt: null,
          cutoffLockedAt: null,
        },
        select: {
          id: true,
          employeeUserId: true,
        },
        take: 50,
      });
    });
  });
});

