import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AdditionalWorkReason,
  CommitmentOutcome,
  Continuation,
  DailyStatus,
  ExceptionStatus,
  ExceptionType,
  NotificationChannel,
  PolicyCategory,
  Role,
  SubmissionTiming,
  UserStatus,
} from '@prisma/client';
import {
  DailyAccountabilityService,
  computeWorstOfStatus,
} from './services/daily-accountability.service.js';
import { BusinessRuleViolationException, NotFoundException } from '../shared/exceptions/api.exception.js';
import { SystemNotificationTrigger } from '../notification/constants/notification-trigger.constants.js';

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
        findMany: vi.fn(),
      },
      exception: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
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

    it('harus menolak jika initialRisk AMBER tanpa supportNeeded (S2-FR-04-1, FR-04)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });

      const commitments = [
        {
          sequenceNo: 1,
          text: 'Task with amber risk',
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Waiting for upstream API',
          supportNeeded: '', // kosong!
        },
      ];

      await expect(
        service.submitMorningCheckin(userId, { commitments }),
      ).rejects.toThrow(BusinessRuleViolationException);

      try {
        await service.submitMorningCheckin(userId, { commitments });
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'commitments[1].supportNeeded',
              reason: 'REQUIRED_WHEN_CONDITIONAL',
            }),
          ]),
        );
      }
    });

    it('harus menolak jika initialRisk RED tanpa supportNeeded atau hanya whitespace (S2-FR-04-1, FR-04)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });

      const commitments = [
        {
          sequenceNo: 1,
          text: 'Task with red risk',
          initialRisk: DailyStatus.RED,
          knownBlockerNote: 'Critical blocker on production',
          supportNeeded: '   ', // whitespace only!
        },
      ];

      await expect(
        service.submitMorningCheckin(userId, { commitments }),
      ).rejects.toThrow(BusinessRuleViolationException);

      try {
        await service.submitMorningCheckin(userId, { commitments });
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'commitments[1].supportNeeded',
              reason: 'REQUIRED_WHEN_CONDITIONAL',
            }),
          ]),
        );
      }
    });

    it('harus mengizinkan initialRisk GREEN tanpa supportNeeded (FR-04 conditional)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'record-uuid-green',
        employeeUserId: userId,
        initialStatus: DailyStatus.GREEN,
      });
      prismaMock.commitment.create.mockResolvedValue({
        id: 'comm-1',
        sequenceNo: 1,
        initialRisk: DailyStatus.GREEN,
      });

      const commitments = [
        { sequenceNo: 1, text: 'Green task', initialRisk: DailyStatus.GREEN },
      ];

      const result = await service.submitMorningCheckin(userId, { commitments });
      expect(result.id).toBe('record-uuid-green');
    });

    it('harus berhasil submit dan mencatat initialStatus worst-of serta AuditLog (S2-TEST-GAP-1 orgContextSnapshot persistence)', async () => {
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
          supportNeeded: 'Need assistance from backend team',
        },
      ];

      const result = await service.submitMorningCheckin(userId, { commitments });

      expect(result.id).toBe('record-uuid-1');
      expect(prismaMock.dailyAccountabilityRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orgContextSnapshot: {
              role: Role.Employee,
              function: 'Engineering',
              directManagerId: 'manager-uuid',
            },
          }),
        }),
      );
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DAILY_RECORD_MORNING_SUBMITTED',
          relatedEntityType: 'DailyAccountabilityRecord',
        }),
        expect.anything(),
      );
    });

    it('harus meng-update record yang ada dengan orgContextSnapshot yang tepat saat morning checkin (S2-TEST-GAP-1)', async () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Operations',
        directManagerId: 'manager-ops-uuid',
      });
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'existing-draft-id',
        employeeUserId: userId,
        morningSubmittedAt: null,
      });
      prismaMock.dailyAccountabilityRecord.update.mockResolvedValue({
        id: 'existing-draft-id',
        employeeUserId: userId,
        initialStatus: DailyStatus.GREEN,
      });
      prismaMock.commitment.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.commitment.create.mockResolvedValue({
        id: 'comm-1',
        sequenceNo: 1,
        initialRisk: DailyStatus.GREEN,
      });

      const commitments = [
        { sequenceNo: 1, text: 'Task 1', initialRisk: DailyStatus.GREEN },
      ];

      await service.submitMorningCheckin(userId, { commitments });

      expect(prismaMock.dailyAccountabilityRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'existing-draft-id' },
          data: expect.objectContaining({
            orgContextSnapshot: {
              role: Role.Employee,
              function: 'Operations',
              directManagerId: 'manager-ops-uuid',
            },
          }),
        }),
      );
    });
  });

  describe('EPIC-07-T2: getTodayRecord & availableActions (ADR-017)', () => {
    it('harus mengembalikan availableActions [morning_checkin] dan carryOverDraft dengan sourceCommitmentId jika belum checkin', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.findFirst.mockResolvedValue({
        id: 'prev-record-id',
        commitments: [
          {
            id: 'c-101',
            sequenceNo: 1,
            text: 'Carry over task',
            referenceLink: 'https://jira/PROJ-1',
            continuation: Continuation.Continue,
            continuationReason: 'Ongoing work',
          },
        ],
      });

      const result = await service.getTodayRecord('user-1');

      expect(result.record).toBeNull();
      expect(result.availableActions).toContain('morning_checkin');
      expect(result.carryOverDraft).toHaveLength(1);
      expect(result.carryOverDraft![0]).toEqual({
        sourceCommitmentId: 'c-101',
        sourceType: 'Commitment',
        text: 'Carry over task',
        referenceLink: 'https://jira/PROJ-1',
        continuationReason: 'Ongoing work',
      });
    });

    it('harus mengecualikan komitmen dengan continuation DoNotContinue', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.findFirst.mockResolvedValue({
        id: 'prev-record-id',
        commitments: [
          {
            id: 'c-102',
            sequenceNo: 1,
            text: 'Finished task',
            continuation: Continuation.DoNotContinue,
          },
        ],
      });

      const result = await service.getTodayRecord('user-1');

      expect(result.record).toBeNull();
      expect(result.carryOverDraft).toHaveLength(0);
    });

    it('harus mempertahankan seluruh multiple commitments dengan continuation Continue (D2)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.findFirst.mockResolvedValue({
        id: 'prev-record-id',
        commitments: [
          {
            id: 'c-201',
            sequenceNo: 1,
            text: 'Task lanjutan #1',
            continuation: Continuation.Continue,
            continuationReason: 'Blokir vendor',
          },
          {
            id: 'c-202',
            sequenceNo: 2,
            text: 'Task lanjutan #2 (teks identik)',
            continuation: Continuation.Continue,
            continuationReason: 'Tahap 2',
          },
          {
            id: 'c-203',
            sequenceNo: 3,
            text: 'Task selesai',
            continuation: Continuation.DoNotContinue,
          },
        ],
      });

      const result = await service.getTodayRecord('user-1');

      expect(result.carryOverDraft).toHaveLength(2);
      expect(result.carryOverDraft![0].sourceCommitmentId).toBe('c-201');
      expect(result.carryOverDraft![1].sourceCommitmentId).toBe('c-202');
    });

    it('ADR-017 D4: AdditionalWork Continue TIDAK BOLEH masuk ke carryOverDraft', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.findFirst.mockResolvedValue({
        id: 'prev-record-id',
        commitments: [
          {
            id: 'c-301',
            sequenceNo: 1,
            text: 'Morning task continue',
            continuation: Continuation.Continue,
          },
        ],
        additionalWorks: [
          {
            id: 'aw-301',
            text: 'Additional work continue',
            continuation: Continuation.Continue,
          },
        ],
      });

      const result = await service.getTodayRecord('user-1');

      expect(result.carryOverDraft).toHaveLength(1);
      expect(result.carryOverDraft![0].sourceCommitmentId).toBe('c-301');
      expect(result.carryOverDraft![0].sourceType).toBe('Commitment');
    });

    it('harus mengembalikan carryOverDraft kosong jika tidak ada previous record', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.findFirst.mockResolvedValue(null);

      const result = await service.getTodayRecord('user-new');

      expect(result.record).toBeNull();
      expect(result.carryOverDraft).toEqual([]);
      expect(result.availableActions).toContain('morning_checkin');
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

    it('submitEodCheckin: harus menolak jika additionalWork outcome = Cancelled tanpa outcomeReason (S2-TEST-GAP-3, FR-08)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [{ id: 'aw1' }],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Completed,
            continuation: Continuation.DoNotContinue,
          },
        ],
        additionalWorkOutcomes: [
          {
            additionalWorkId: 'aw1',
            outcome: CommitmentOutcome.Cancelled,
            outcomeReason: '', // kosong!
            continuation: Continuation.DoNotContinue,
          },
        ],
        finalStatus: DailyStatus.GREEN,
      };

      await expect(
        service.submitEodCheckin(userId, recordId, dto),
      ).rejects.toThrow(BusinessRuleViolationException);

      try {
        await service.submitEodCheckin(userId, recordId, dto);
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'outcomeReason',
              reason: 'REQUIRED_WHEN_CANCELLED',
            }),
          ]),
        );
      }
    });

    it('submitEodCheckin: harus menolak jika additionalWork continuation = Continue dan outcome != Completed tanpa continuationReason (S2-TEST-GAP-3, FR-08)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [{ id: 'aw1' }],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Completed,
            continuation: Continuation.DoNotContinue,
          },
        ],
        additionalWorkOutcomes: [
          {
            additionalWorkId: 'aw1',
            outcome: CommitmentOutcome.NotCompleted,
            continuation: Continuation.Continue,
            continuationReason: '   ', // whitespace only!
          },
        ],
        finalStatus: DailyStatus.GREEN,
      };

      await expect(
        service.submitEodCheckin(userId, recordId, dto),
      ).rejects.toThrow(BusinessRuleViolationException);

      try {
        await service.submitEodCheckin(userId, recordId, dto);
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'continuationReason',
              reason: 'REQUIRED_WHEN_CONTINUE_NOT_COMPLETED',
            }),
          ]),
        );
      }
    });

    it('submitEodCheckin: harus berhasil memanggil tx.additionalWork.update dengan outcome & continuation yang valid (S2-TEST-GAP-3, FR-08)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        morningSubmittedAt: new Date(),
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [{ id: 'aw1' }],
      });
      statusSuggestionMock.evaluateSuggestedStatus.mockResolvedValue({
        suggestedStatus: DailyStatus.GREEN,
        reasons: [],
      });
      prismaMock.commitment.update.mockResolvedValue({ id: 'c1' });
      prismaMock.additionalWork.update.mockResolvedValue({ id: 'aw1' });
      prismaMock.dailyAccountabilityRecord.update.mockResolvedValue({
        id: recordId,
        employeeUserId: userId,
        finalStatus: DailyStatus.GREEN,
        commitments: [{ id: 'c1' }],
        additionalWorks: [{ id: 'aw1' }],
      });

      const dto = {
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Completed,
            continuation: Continuation.DoNotContinue,
          },
        ],
        additionalWorkOutcomes: [
          {
            additionalWorkId: 'aw1',
            outcome: CommitmentOutcome.Cancelled,
            outcomeReason: 'Project scope changed by client',
            continuation: Continuation.DoNotContinue,
          },
        ],
        finalStatus: DailyStatus.GREEN,
      };

      await service.submitEodCheckin(userId, recordId, dto);

      expect(prismaMock.additionalWork.update).toHaveBeenCalledWith({
        where: { id: 'aw1' },
        data: {
          outcome: CommitmentOutcome.Cancelled,
          outcomeReason: 'Project scope changed by client',
          continuation: Continuation.DoNotContinue,
          continuationReason: null,
        },
      });
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

    it('patchCommitment: harus menolak jika risiko diubah ke AMBER/RED tanpa supportNeeded (S2-FR-04-1, FR-04)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        isMorningLocked: false,
        initialRisk: DailyStatus.GREEN,
        knownBlockerNote: null,
        supportNeeded: null,
        dailyRecord: { employeeUserId: 'user-1' },
      });

      await expect(
        service.patchCommitment('user-1', 'comm-1', {
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Blocker note present',
          // supportNeeded omitted
        }),
      ).rejects.toThrow(BusinessRuleViolationException);

      try {
        await service.patchCommitment('user-1', 'comm-1', {
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Blocker note present',
        });
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'supportNeeded',
              reason: 'REQUIRED_WHEN_CONDITIONAL',
            }),
          ]),
        );
      }
    });

    it('patchCommitment: harus menolak jika supportNeeded dikosongkan pada komitmen AMBER (S2-FR-04-1, FR-04)', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        isMorningLocked: false,
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Blocker note exists',
        supportNeeded: 'Initial support note',
        dailyRecord: { employeeUserId: 'user-1' },
      });

      await expect(
        service.patchCommitment('user-1', 'comm-1', {
          supportNeeded: '   ', // whitespace only
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('patchCommitment: harus berhasil update jika initialRisk AMBER disertai blocker dan supportNeeded valid', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: 'comm-1',
        dailyRecordId: 'rec-1',
        isMorningLocked: false,
        initialRisk: DailyStatus.GREEN,
        dailyRecord: { employeeUserId: 'user-1' },
      });
      prismaMock.commitment.update.mockResolvedValue({
        id: 'comm-1',
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Blocker resolved soon',
        supportNeeded: 'Need team review',
      });
      prismaMock.commitment.findMany.mockResolvedValue([
        { initialRisk: DailyStatus.AMBER },
      ]);
      prismaMock.dailyAccountabilityRecord.update.mockResolvedValue({
        id: 'rec-1',
        initialStatus: DailyStatus.AMBER,
      });

      const result = await service.patchCommitment('user-1', 'comm-1', {
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Blocker resolved soon',
        supportNeeded: 'Need team review',
      });

      expect(result.id).toBe('comm-1');
      expect(result.supportNeeded).toBe('Need team review');
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

    it('createAdditionalWork: harus menolak jika reason = NewlyAssigned tanpa assignedByUserId (S2-TEST-GAP-2, FR-06)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'user-1',
      });

      await expect(
        service.createAdditionalWork('user-1', {
          dailyRecordId: 'rec-1',
          text: 'Tugas dadakan dari atasan',
          reason: AdditionalWorkReason.NewlyAssigned,
          // assignedByUserId tidak diisi
        }),
      ).rejects.toThrow(BusinessRuleViolationException);

      try {
        await service.createAdditionalWork('user-1', {
          dailyRecordId: 'rec-1',
          text: 'Tugas dadakan dari atasan',
          reason: AdditionalWorkReason.NewlyAssigned,
        });
      } catch (err: any) {
        expect(err).toBeInstanceOf(BusinessRuleViolationException);
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'assignedByUserId',
              reason: 'REQUIRED_WHEN_NEWLY_ASSIGNED',
            }),
          ]),
        );
      }
    });

    it('createAdditionalWork: harus berhasil membuat dan persist assignedByUserId jika reason = NewlyAssigned dan assignedByUserId valid (S2-TEST-GAP-2, FR-06)', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        employeeUserId: 'user-1',
      });
      prismaMock.additionalWork.create.mockResolvedValue({
        id: 'aw-newly-assigned-1',
        dailyRecordId: 'rec-1',
        text: 'Tugas dari manajer',
        reason: AdditionalWorkReason.NewlyAssigned,
        assignedByUserId: 'manager-uuid-1',
      });

      const result = await service.createAdditionalWork('user-1', {
        dailyRecordId: 'rec-1',
        text: 'Tugas dari manajer',
        reason: AdditionalWorkReason.NewlyAssigned,
        assignedByUserId: 'manager-uuid-1',
      });

      expect(result.id).toBe('aw-newly-assigned-1');
      expect(result.assignedByUserId).toBe('manager-uuid-1');
      expect(prismaMock.additionalWork.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reason: AdditionalWorkReason.NewlyAssigned,
            assignedByUserId: 'manager-uuid-1',
          }),
        }),
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

  describe('findPendingSubmissionEmployeeIds (SAD §11.2 #1, §6.4, PRD FR-28, ADR-014)', () => {
    it('harus mengembalikan karyawan aktif yang belum memiliki record sama sekali pada workDate', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1' },
        { userId: 'emp-2' },
      ]);
      prismaMock.exception.findMany.mockResolvedValue([]);
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      const targetDate = new Date('2026-09-18T08:30:00Z');
      const result = await service.findPendingSubmissionEmployeeIds(targetDate, 'MORNING');

      expect(result).toEqual(['emp-1', 'emp-2']);
      expect(prismaMock.organizationalAssignment.findMany).toHaveBeenCalledWith({
        where: {
          effectiveDate: { lte: expect.any(Date) },
          OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
          role: Role.Employee,
          user: { status: UserStatus.Active },
        },
        select: { userId: true },
      });
    });

    it('harus mengecualikan karyawan yang sudah menyerahkan Morning Check-in untuk fase MORNING', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1' },
        { userId: 'emp-2' },
      ]);
      prismaMock.exception.findMany.mockResolvedValue([]);
      // emp-1 sudah submit morning
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([
        { employeeUserId: 'emp-1' },
      ]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'MORNING');

      expect(result).toEqual(['emp-2']);
      expect(prismaMock.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            morningSubmittedAt: { not: null },
          }),
        }),
      );
    });

    it('harus mengecualikan karyawan yang sudah menyerahkan EOD Check-in untuk fase EOD', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1' },
        { userId: 'emp-2' },
      ]);
      prismaMock.exception.findMany.mockResolvedValue([]);
      // emp-2 sudah submit eod
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([
        { employeeUserId: 'emp-2' },
      ]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'EOD');

      expect(result).toEqual(['emp-1']);
      expect(prismaMock.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eodSubmittedAt: { not: null },
          }),
        }),
      );
    });

    it('harus mengecualikan karyawan yang memiliki Leave berstatus Approved pada workDate', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1' },
        { userId: 'emp-2' },
      ]);
      // emp-1 cuti disetujui
      prismaMock.exception.findMany.mockResolvedValue([
        { employeeUserId: 'emp-1' },
      ]);
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'MORNING');

      expect(result).toEqual(['emp-2']);
      expect(prismaMock.exception.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ExceptionStatus.Approved,
            type: { in: [ExceptionType.Leave, ExceptionType.Exemption] },
          }),
        }),
      );
    });

    it('harus mengecualikan karyawan yang memiliki Exemption berstatus Approved pada workDate', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1' },
        { userId: 'emp-2' },
      ]);
      // emp-2 pengecualian disetujui
      prismaMock.exception.findMany.mockResolvedValue([
        { employeeUserId: 'emp-2' },
      ]);
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'MORNING');

      expect(result).toEqual(['emp-1']);
    });

    it('INVARIAN AC-19: permohonan Leave/Exemption berstatus Pending TIDAK mengecualikan karyawan', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1' },
      ]);
      // Query hanya mencari status Approved, sehingga jika leave status Pending, prisma.exception.findMany mengembalikan []
      prismaMock.exception.findMany.mockResolvedValue([]);
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'MORNING');

      expect(result).toEqual(['emp-1']);
    });

    it('harus membatasi jumlah kandidat sesuai parameter limit (default 200)', async () => {
      const manyUsers = Array.from({ length: 250 }, (_, i) => ({ userId: `emp-${i + 1}` }));
      prismaMock.organizationalAssignment.findMany.mockResolvedValue(manyUsers);
      prismaMock.exception.findMany.mockResolvedValue([]);
      prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'MORNING', 200);

      expect(result).toHaveLength(200);
      expect(result[0]).toBe('emp-1');
      expect(result[199]).toBe('emp-200');
    });

    it('harus mengembalikan array kosong jika tidak ada karyawan aktif', async () => {
      prismaMock.organizationalAssignment.findMany.mockResolvedValue([]);

      const result = await service.findPendingSubmissionEmployeeIds(new Date(), 'MORNING');

      expect(result).toEqual([]);
      expect(prismaMock.exception.findMany).not.toHaveBeenCalled();
      expect(prismaMock.dailyAccountabilityRecord.findMany).not.toHaveBeenCalled();
    });
  });

  describe('S2-TEST-GAP-6: FR-26 Submission Timing States (SAD §9.2)', () => {
    // Policy fixture: Morning deadline 09:00 + grace 30m => cutoff 09:30; EOD 18:00 + 30m => 18:30
    const userId = 'user-timing-1';
    const MORNING_CUTOFF_MESSAGE =
      'Batas waktu penyerahan Morning Check-in (Cut-off) telah berakhir';

    const at = (h: number, m: number, s: number) =>
      new Date(2026, 8, 16, h, m, s, 0);

    const arrangeMorningHappyPath = () => {
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: 'manager-uuid',
      });
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'record-timing-1',
        employeeUserId: userId,
      });
      prismaMock.commitment.create.mockResolvedValue({
        id: 'comm-timing-1',
        sequenceNo: 1,
        initialRisk: DailyStatus.GREEN,
      });
    };

    const submitMorning = () =>
      service.submitMorningCheckin(userId, {
        commitments: [
          { sequenceNo: 1, text: 'Timing task', initialRisk: DailyStatus.GREEN },
        ],
      });

    describe('submitMorningCheckin — boundary', () => {
      it('now === morningOnTimeDeadline (09:00:00) => morningTiming OnTime', async () => {
        vi.setSystemTime(at(9, 0, 0));
        arrangeMorningHappyPath();

        await submitMorning();

        expect(
          prismaMock.dailyAccountabilityRecord.create.mock.calls[0][0].data,
        ).toEqual(
          expect.objectContaining({
            morningTiming: SubmissionTiming.OnTime,
            morningSubmittedAt: at(9, 0, 0),
          }),
        );
      });

      it('now === deadline + 1s (09:00:01, dalam grace) => morningTiming Late', async () => {
        vi.setSystemTime(at(9, 0, 1));
        arrangeMorningHappyPath();

        await submitMorning();

        expect(
          prismaMock.dailyAccountabilityRecord.create.mock.calls[0][0].data,
        ).toEqual(
          expect.objectContaining({
            morningTiming: SubmissionTiming.Late,
            morningSubmittedAt: at(9, 0, 1),
          }),
        );
      });

      it('now === morning cutoff (09:30:00) => morningTiming Late (inklusif)', async () => {
        vi.setSystemTime(at(9, 30, 0));
        arrangeMorningHappyPath();

        await submitMorning();

        expect(
          prismaMock.dailyAccountabilityRecord.create.mock.calls[0][0].data,
        ).toEqual(
          expect.objectContaining({
            morningTiming: SubmissionTiming.Late,
            morningSubmittedAt: at(9, 30, 0),
          }),
        );
      });

      it('now === cutoff + 1s (09:30:01) => ditolak BusinessRuleViolationException dan tidak menyimpan record', async () => {
        vi.setSystemTime(at(9, 30, 1));
        arrangeMorningHappyPath();

        const promise = submitMorning();
        await expect(promise).rejects.toBeInstanceOf(
          BusinessRuleViolationException,
        );
        await expect(promise).rejects.toThrow(MORNING_CUTOFF_MESSAGE);

        expect(prismaMock.dailyAccountabilityRecord.create).not.toHaveBeenCalled();
        expect(prismaMock.dailyAccountabilityRecord.update).not.toHaveBeenCalled();
      });
    });

    describe('submitEodCheckin — boundary', () => {
      const recordId = 'rec-eod-timing';

      const arrangeEod = () => {
        prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
          id: recordId,
          employeeUserId: userId,
          morningSubmittedAt: at(8, 30, 0),
          policySnapshot: {
            [PolicyCategory.Cutoff]: {
              morningOnTimeDeadline: '09:00',
              eodOnTimeDeadline: '18:00',
            },
            [PolicyCategory.GracePeriod]: {
              morningGraceMinutes: 30,
              eodGraceMinutes: 30,
            },
          },
          commitments: [{ id: 'c1', isEodLocked: false }],
          additionalWorks: [],
        });
        prismaMock.commitment.update.mockResolvedValue({ id: 'c1' });
        prismaMock.dailyAccountabilityRecord.update.mockResolvedValue({
          id: recordId,
        });
      };

      const submitEod = () =>
        service.submitEodCheckin(userId, recordId, {
          commitmentOutcomes: [
            {
              commitmentId: 'c1',
              outcome: CommitmentOutcome.Completed,
              continuation: Continuation.DoNotContinue,
            },
          ],
          finalStatus: DailyStatus.GREEN,
        });

      it('now === eodOnTimeDeadline (18:00:00) => eodTiming OnTime', async () => {
        vi.setSystemTime(at(18, 0, 0));
        arrangeEod();

        await submitEod();

        expect(
          prismaMock.dailyAccountabilityRecord.update.mock.calls[0][0].data,
        ).toEqual(
          expect.objectContaining({
            eodTiming: SubmissionTiming.OnTime,
            eodSubmittedAt: at(18, 0, 0),
            finalStatus: DailyStatus.GREEN,
          }),
        );
      });

      it('now === deadline + 1s (18:00:01, dalam grace) => eodTiming Late', async () => {
        vi.setSystemTime(at(18, 0, 1));
        arrangeEod();

        await submitEod();

        expect(
          prismaMock.dailyAccountabilityRecord.update.mock.calls[0][0].data,
        ).toEqual(
          expect.objectContaining({
            eodTiming: SubmissionTiming.Late,
            eodSubmittedAt: at(18, 0, 1),
          }),
        );
      });

      it('now === eod cutoff (18:30:00) => eodTiming Late (inklusif)', async () => {
        vi.setSystemTime(at(18, 30, 0));
        arrangeEod();

        await submitEod();

        expect(
          prismaMock.dailyAccountabilityRecord.update.mock.calls[0][0].data,
        ).toEqual(
          expect.objectContaining({
            eodTiming: SubmissionTiming.Late,
            eodSubmittedAt: at(18, 30, 0),
          }),
        );
      });
    });

    describe('EOD post-cutoff rejection (Human Decision FR-26)', () => {
      const recordId = 'rec-eod-post-cutoff';
      const EOD_CUTOFF_MESSAGE =
        'Batas waktu penyerahan EOD Check-in (Cut-off) telah berakhir';

      const arrangeRecord = () =>
        prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
          id: recordId,
          employeeUserId: userId,
          morningSubmittedAt: at(8, 30, 0),
          policySnapshot: {
            [PolicyCategory.Cutoff]: {
              morningOnTimeDeadline: '09:00',
              eodOnTimeDeadline: '18:00',
            },
            [PolicyCategory.GracePeriod]: {
              morningGraceMinutes: 30,
              eodGraceMinutes: 30,
            },
          },
          commitments: [{ id: 'c1', isEodLocked: false }],
          additionalWorks: [],
        });

      it('submitEodCheckin at 18:30:01 => rejected, nothing persisted', async () => {
        vi.setSystemTime(at(18, 30, 1));
        arrangeRecord();

        const promise = service.submitEodCheckin(userId, recordId, {
          commitmentOutcomes: [
            {
              commitmentId: 'c1',
              outcome: CommitmentOutcome.Completed,
              continuation: Continuation.DoNotContinue,
            },
          ],
          finalStatus: DailyStatus.GREEN,
        });

        await expect(promise).rejects.toBeInstanceOf(
          BusinessRuleViolationException,
        );
        await expect(promise).rejects.toThrow(EOD_CUTOFF_MESSAGE);
        expect(prismaMock.commitment.update).not.toHaveBeenCalled();
        expect(prismaMock.dailyAccountabilityRecord.update).not.toHaveBeenCalled();
        expect(auditMock.record).not.toHaveBeenCalled();
      });

      it('confirmOverride at 18:30:01 => rejected, nothing persisted', async () => {
        vi.setSystemTime(at(18, 30, 1));
        arrangeRecord();

        const promise = service.confirmOverride(userId, recordId, {
          finalStatus: DailyStatus.GREEN,
          overrideReason: 'Alasan override cukup panjang.',
        });

        await expect(promise).rejects.toBeInstanceOf(
          BusinessRuleViolationException,
        );
        await expect(promise).rejects.toThrow(EOD_CUTOFF_MESSAGE);
        expect(prismaMock.dailyAccountabilityRecord.update).not.toHaveBeenCalled();
        expect(auditMock.record).not.toHaveBeenCalled();
      });
    });

    describe('GracePeriod = 0 is honored (Human Decision FR-26)', () => {
      const zeroGracePolicy = {
        [PolicyCategory.Cutoff]: {
          morningOnTimeDeadline: '09:00',
          eodOnTimeDeadline: '18:00',
        },
        [PolicyCategory.GracePeriod]: {
          morningGraceMinutes: 0,
          eodGraceMinutes: 0,
        },
      };

      it('Morning 09:00:00 with grace 0 => OnTime', async () => {
        policyMock.getActivePolicySnapshot.mockResolvedValue(zeroGracePolicy);
        vi.setSystemTime(at(9, 0, 0));
        arrangeMorningHappyPath();

        await submitMorning();

        expect(
          prismaMock.dailyAccountabilityRecord.create.mock.calls[0][0].data,
        ).toEqual(expect.objectContaining({ morningTiming: SubmissionTiming.OnTime }));
      });

      it('Morning 09:00:01 with grace 0 => rejected (cutoff == deadline, not promoted to 30)', async () => {
        policyMock.getActivePolicySnapshot.mockResolvedValue(zeroGracePolicy);
        vi.setSystemTime(at(9, 0, 1));
        arrangeMorningHappyPath();

        await expect(submitMorning()).rejects.toBeInstanceOf(
          BusinessRuleViolationException,
        );
        expect(prismaMock.dailyAccountabilityRecord.create).not.toHaveBeenCalled();
      });

      it('EOD 18:00:01 with grace 0 => rejected (cutoff == deadline)', async () => {
        vi.setSystemTime(at(18, 0, 1));
        prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
          id: 'rec-eod-zero',
          employeeUserId: userId,
          morningSubmittedAt: at(8, 30, 0),
          policySnapshot: zeroGracePolicy,
          commitments: [{ id: 'c1', isEodLocked: false }],
          additionalWorks: [],
        });

        await expect(
          service.submitEodCheckin(userId, 'rec-eod-zero', {
            commitmentOutcomes: [
              {
                commitmentId: 'c1',
                outcome: CommitmentOutcome.Completed,
                continuation: Continuation.DoNotContinue,
              },
            ],
            finalStatus: DailyStatus.GREEN,
          }),
        ).rejects.toBeInstanceOf(BusinessRuleViolationException);
        expect(prismaMock.dailyAccountabilityRecord.update).not.toHaveBeenCalled();
      });

      it('evaluateCutoffLock with grace 0: 09:00:00 not passed, 09:00:01 passed', async () => {
        policyMock.getActivePolicySnapshot.mockResolvedValue(zeroGracePolicy);
        const targetDate = new Date(Date.UTC(2026, 8, 16));
        prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

        vi.setSystemTime(at(9, 0, 0));
        const before = await service.evaluateCutoffLock(targetDate);
        expect(before.morningPassed).toBe(false);

        vi.setSystemTime(at(9, 0, 1));
        const after = await service.evaluateCutoffLock(targetDate);
        expect(after.morningPassed).toBe(true);
        expect(after.eodPassed).toBe(false);

        vi.setSystemTime(at(18, 0, 1));
        const eod = await service.evaluateCutoffLock(targetDate);
        expect(eod.eodPassed).toBe(true);
      });
    });

    describe('evaluateCutoffLock — NoSubmission & lock state', () => {
      const targetDate = new Date(Date.UTC(2026, 8, 16));

      it('Morning cutoff terlewati + morningSubmittedAt null => komitmen terkunci, cutoffLockedAt terisi, morningTiming NoSubmission', async () => {
        vi.setSystemTime(at(9, 30, 1));
        prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([
          { id: 'rec-nosub', morningSubmittedAt: null },
        ]);

        const result = await service.evaluateCutoffLock(targetDate);

        expect(prismaMock.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { workDate: targetDate, cutoffLockedAt: null },
          }),
        );
        expect(prismaMock.commitment.updateMany).toHaveBeenCalledWith({
          where: { dailyRecordId: 'rec-nosub', isMorningLocked: false },
          data: { isMorningLocked: true },
        });
        expect(prismaMock.dailyAccountabilityRecord.update).toHaveBeenCalledWith({
          where: { id: 'rec-nosub' },
          data: {
            cutoffLockedAt: at(9, 30, 1),
            morningTiming: SubmissionTiming.NoSubmission,
          },
        });
        expect(result).toEqual(
          expect.objectContaining({
            morningPassed: true,
            eodPassed: false,
            morningLockedCount: 1,
            morningNoSubmissionCount: 1,
            eodLockedCount: 0,
            eodNoSubmissionCount: 0,
          }),
        );
      });

      it('Morning cutoff terlewati + morningSubmittedAt terisi => terkunci, morningTiming TIDAK ditimpa NoSubmission', async () => {
        vi.setSystemTime(at(9, 30, 1));
        prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([
          { id: 'rec-submitted', morningSubmittedAt: at(8, 45, 0) },
        ]);

        const result = await service.evaluateCutoffLock(targetDate);

        expect(prismaMock.commitment.updateMany).toHaveBeenCalledWith({
          where: { dailyRecordId: 'rec-submitted', isMorningLocked: false },
          data: { isMorningLocked: true },
        });
        const updateArg =
          prismaMock.dailyAccountabilityRecord.update.mock.calls[0][0];
        expect(updateArg.where).toEqual({ id: 'rec-submitted' });
        expect(updateArg.data.cutoffLockedAt).toEqual(at(9, 30, 1));
        // undefined => Prisma tidak mengubah kolom; nilai Late/OnTime existing tetap
        expect(updateArg.data.morningTiming).toBeUndefined();
        expect(updateArg.data.morningTiming).not.toBe(
          SubmissionTiming.NoSubmission,
        );
        expect(result.morningLockedCount).toBe(1);
        expect(result.morningNoSubmissionCount).toBe(0);
      });

      it('Morning cutoff BELUM terlewati (09:30:00) => tidak ada record yang dikunci', async () => {
        vi.setSystemTime(at(9, 30, 0));

        const result = await service.evaluateCutoffLock(targetDate);

        expect(result.morningPassed).toBe(false);
        expect(
          prismaMock.dailyAccountabilityRecord.findMany,
        ).not.toHaveBeenCalled();
        expect(prismaMock.commitment.updateMany).not.toHaveBeenCalled();
        expect(prismaMock.dailyAccountabilityRecord.update).not.toHaveBeenCalled();
      });

      it('EOD cutoff terlewati + eodSubmittedAt null => komitmen & additional work terkunci, eodTiming NoSubmission', async () => {
        vi.setSystemTime(at(18, 30, 1));
        // Morning phase juga sudah lewat; isolasi: morning findMany tidak mengembalikan record
        prismaMock.dailyAccountabilityRecord.findMany
          .mockResolvedValueOnce([]) // morning lock query
          .mockResolvedValueOnce([{ id: 'rec-eod-nosub', eodSubmittedAt: null }]); // EOD lock query

        const result = await service.evaluateCutoffLock(targetDate);

        expect(prismaMock.dailyAccountabilityRecord.findMany).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            where: {
              workDate: targetDate,
              commitments: { some: { isEodLocked: false } },
            },
          }),
        );
        expect(prismaMock.commitment.updateMany).toHaveBeenCalledWith({
          where: { dailyRecordId: 'rec-eod-nosub', isEodLocked: false },
          data: { isEodLocked: true },
        });
        expect(prismaMock.additionalWork.updateMany).toHaveBeenCalledWith({
          where: { dailyRecordId: 'rec-eod-nosub', isLocked: false },
          data: { isLocked: true },
        });
        expect(prismaMock.dailyAccountabilityRecord.update).toHaveBeenCalledWith({
          where: { id: 'rec-eod-nosub' },
          data: { eodTiming: SubmissionTiming.NoSubmission },
        });
        expect(result).toEqual(
          expect.objectContaining({
            eodPassed: true,
            eodLockedCount: 1,
            eodNoSubmissionCount: 1,
          }),
        );
      });

      it('EOD cutoff terlewati + eodSubmittedAt terisi => terkunci, eodTiming TIDAK ditimpa NoSubmission', async () => {
        vi.setSystemTime(at(18, 30, 1));
        prismaMock.dailyAccountabilityRecord.findMany
          .mockResolvedValueOnce([]) // morning lock query
          .mockResolvedValueOnce([
            { id: 'rec-eod-submitted', eodSubmittedAt: at(17, 45, 0) },
          ]); // EOD lock query

        const result = await service.evaluateCutoffLock(targetDate);

        expect(prismaMock.commitment.updateMany).toHaveBeenCalledWith({
          where: { dailyRecordId: 'rec-eod-submitted', isEodLocked: false },
          data: { isEodLocked: true },
        });
        expect(prismaMock.additionalWork.updateMany).toHaveBeenCalledWith({
          where: { dailyRecordId: 'rec-eod-submitted', isLocked: false },
          data: { isLocked: true },
        });
        const updateArg =
          prismaMock.dailyAccountabilityRecord.update.mock.calls[0][0];
        expect(updateArg.where).toEqual({ id: 'rec-eod-submitted' });
        expect(updateArg.data.eodTiming).toBeUndefined();
        expect(updateArg.data.eodTiming).not.toBe(SubmissionTiming.NoSubmission);
        expect(result.eodLockedCount).toBe(1);
        expect(result.eodNoSubmissionCount).toBe(0);
      });

      it('EOD cutoff BELUM terlewati (18:30:00) => eodPassed false dan tidak ada EOD lock', async () => {
        vi.setSystemTime(at(18, 30, 0));
        prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

        const result = await service.evaluateCutoffLock(targetDate);

        expect(result.eodPassed).toBe(false);
        expect(prismaMock.additionalWork.updateMany).not.toHaveBeenCalled();
      });
    });
  });

  describe('Notification Triggers S2-T4-NOTIF-01 (SAD §12.1, PRD FR-11)', () => {
    let notifService: DailyAccountabilityService;
    let notificationMock: { dispatch: ReturnType<typeof vi.fn> };
    const empUserId = 'user-notif-emp';
    const mgrUserId = 'user-notif-mgr';

    beforeEach(() => {
      notificationMock = {
        dispatch: vi.fn().mockResolvedValue([]),
      };

      notifService = new DailyAccountabilityService(
        prismaMock,
        auditMock,
        policyMock,
        scopeFilterMock,
        statusSuggestionMock,
        notificationMock as any,
      );

      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: mgrUserId,
      });

      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      prismaMock.dailyAccountabilityRecord.create.mockImplementation((args: any) => ({
        id: 'record-notif-1',
        employeeUserId: empUserId,
        workDate: new Date(),
        orgContextSnapshot: { directManagerId: mgrUserId },
        ...args.data,
      }));
      prismaMock.dailyAccountabilityRecord.update.mockImplementation((args: any) => ({
        id: args.where.id,
        employeeUserId: empUserId,
        ...args.data,
        commitments: [],
        additionalWorks: [],
      }));
      prismaMock.commitment.create.mockImplementation((args: any) => ({
        id: 'comm-1',
        ...args.data,
      }));
      prismaMock.commitment.deleteMany.mockResolvedValue({ count: 0 });
    });

    it('Morning Check-in: mendispatch AMBER_SUPPORT_NEEDED ke employee dan direct manager saat status AMBER', async () => {
      const commitments = [
        {
          sequenceNo: 1,
          text: 'Task with amber',
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Need review',
          supportNeeded: 'Please assist with code review',
        },
      ];

      await notifService.submitMorningCheckin(empUserId, { commitments });

      expect(notificationMock.dispatch).toHaveBeenCalledTimes(2);

      // Ke Employee
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: SystemNotificationTrigger.AMBER_SUPPORT_NEEDED,
          recipientUserId: empUserId,
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: 'record-notif-1',
          channels: expect.arrayContaining([
            NotificationChannel.Email,
            NotificationChannel.BrowserPush,
            NotificationChannel.WebNotificationCenter,
          ]),
          payload: expect.objectContaining({
            iconType: 'alert-circle',
            status: DailyStatus.AMBER,
          }),
        }),
      );

      // Ke Direct Manager / Support Owner
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: SystemNotificationTrigger.AMBER_SUPPORT_NEEDED,
          recipientUserId: mgrUserId,
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: 'record-notif-1',
          channels: expect.arrayContaining([
            NotificationChannel.Email,
            NotificationChannel.BrowserPush,
            NotificationChannel.WebNotificationCenter,
          ]),
          payload: expect.objectContaining({
            iconType: 'alert-circle',
            status: DailyStatus.AMBER,
          }),
        }),
      );
    });

    it('Morning Check-in: mendispatch RED_STATUS ke direct manager saat status RED', async () => {
      const commitments = [
        {
          sequenceNo: 1,
          text: 'Critical blocker on DB',
          initialRisk: DailyStatus.RED,
          knownBlockerNote: 'DB down',
          supportNeeded: 'DevOps help',
        },
      ];

      await notifService.submitMorningCheckin(empUserId, { commitments });

      expect(notificationMock.dispatch).toHaveBeenCalledTimes(1);
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: SystemNotificationTrigger.RED_STATUS,
          recipientUserId: mgrUserId,
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: 'record-notif-1',
          channels: expect.arrayContaining([
            NotificationChannel.Email,
            NotificationChannel.BrowserPush,
            NotificationChannel.WebNotificationCenter,
          ]),
          payload: expect.objectContaining({
            iconType: 'alert-octagon',
            status: DailyStatus.RED,
          }),
        }),
      );
    });

    it('Morning Check-in: TIDAK mendispatch notifikasi saat status GREEN', async () => {
      const commitments = [
        {
          sequenceNo: 1,
          text: 'Regular task',
          initialRisk: DailyStatus.GREEN,
        },
      ];

      await notifService.submitMorningCheckin(empUserId, { commitments });

      expect(notificationMock.dispatch).not.toHaveBeenCalled();
    });

    it('EOD Check-in: mendispatch RED_STATUS ke direct manager saat finalStatus RED', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-eod-red',
        employeeUserId: empUserId,
        morningSubmittedAt: new Date(),
        orgContextSnapshot: { directManagerId: mgrUserId },
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      statusSuggestionMock.evaluateSuggestedStatus.mockResolvedValue({
        suggestedStatus: DailyStatus.RED,
        reasons: ['Missed critical commitment'],
      });

      const dto = {
        finalStatus: DailyStatus.RED,
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.NotCompleted,
            outcomeReason: 'Failed to deploy',
            continuation: Continuation.Continue,
            continuationReason: 'Will continue tomorrow morning',
          },
        ],
      };

      await notifService.submitEodCheckin(empUserId, 'rec-eod-red', dto as any);

      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: SystemNotificationTrigger.RED_STATUS,
          recipientUserId: mgrUserId,
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: 'rec-eod-red',
          payload: expect.objectContaining({
            iconType: 'alert-octagon',
            status: DailyStatus.RED,
            phase: 'eod',
          }),
        }),
      );
    });

    it('EOD Check-in: TIDAK mendispatch notifikasi saat finalStatus GREEN', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-eod-green',
        employeeUserId: empUserId,
        morningSubmittedAt: new Date(),
        orgContextSnapshot: { directManagerId: mgrUserId },
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      statusSuggestionMock.evaluateSuggestedStatus.mockResolvedValue({
        suggestedStatus: DailyStatus.GREEN,
        reasons: ['All done'],
      });

      const dto = {
        finalStatus: DailyStatus.GREEN,
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.Completed,
            continuation: Continuation.DoNotContinue,
          },
        ],
      };

      await notifService.submitEodCheckin(empUserId, 'rec-eod-green', dto as any);

      expect(notificationMock.dispatch).not.toHaveBeenCalled();
    });

    it('confirmOverride: mendispatch RED_STATUS saat override ke RED', async () => {
      prismaMock.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-override-red',
        employeeUserId: empUserId,
        morningSubmittedAt: new Date(),
        orgContextSnapshot: { directManagerId: mgrUserId },
        commitments: [{ id: 'c1', isEodLocked: false }],
        additionalWorks: [],
      });

      const dto = {
        finalStatus: DailyStatus.RED,
        overrideReason: 'Severe external disruption causing day-long outage',
        commitmentOutcomes: [
          {
            commitmentId: 'c1',
            outcome: CommitmentOutcome.NotCompleted,
            outcomeReason: 'Failed',
            continuation: Continuation.Continue,
            continuationReason: 'Will continue tomorrow morning',
          },
        ],
      };

      await notifService.confirmOverride(empUserId, 'rec-override-red', dto as any);

      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: SystemNotificationTrigger.RED_STATUS,
          recipientUserId: mgrUserId,
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: 'rec-override-red',
          payload: expect.objectContaining({
            iconType: 'alert-octagon',
            status: DailyStatus.RED,
            phase: 'eod',
          }),
        }),
      );
    });

    it('Notification error does NOT fail or silently mutate submission', async () => {
      notificationMock.dispatch.mockRejectedValue(new Error('Brevo service offline'));

      const commitments = [
        {
          sequenceNo: 1,
          text: 'Task with amber risk',
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Need help',
          supportNeeded: 'Assistance required',
        },
      ];

      const result = await notifService.submitMorningCheckin(empUserId, { commitments });

      expect(result).toBeDefined();
      expect(result.initialStatus).toBe(DailyStatus.AMBER);
      expect(result.id).toBe('record-notif-1');
    });
  });
});

