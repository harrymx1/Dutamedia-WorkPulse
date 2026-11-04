import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyService } from './daily.service';
import {
  CommitmentOutcome,
  CommitmentRisk,
  ContinuationStatus,
  DailyRiskStatus,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

describe('DailyService (WP-EP05 / Daily Accountability Core Logic)', () => {
  let service: DailyService;
  let mockPrisma: any;
  let mockClock: any;
  let mockPolicy: any;
  let mockWorkday: any;

  beforeEach(() => {
    mockPrisma = {
      dailyAccountabilityRecord: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        upsert: vi.fn(),
      },
      commitment: {
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      additionalWork: {
        create: vi.fn(),
        update: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue({
          role: 'EMPLOYEE',
          function: 'ENGINEERING',
          jobTitle: 'Frontend Engineer',
        }),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      // 01:30 UTC = 08:30 WIB (Asia/Jakarta)
      now: vi.fn(() => new Date('2026-10-28T01:30:00.000Z')),
      todayString: vi.fn(() => '2026-10-28'),
    };

    mockPolicy = {
      getActivePolicy: vi.fn().mockResolvedValue({
        configurationValues: {
          morningOnTimeCutoff: '09:00',
          morningLockCutoff: '09:30',
          eodOnTimeCutoff: '17:00',
          eodLockCutoff: '21:00',
          timezone: 'Asia/Jakarta',
        },
      }),
    };

    mockWorkday = {
      getPreviousWorkday: vi.fn().mockResolvedValue('2026-10-27'),
      isWorkday: vi.fn().mockResolvedValue(true),
    };

    service = new DailyService(mockPrisma, mockClock, mockPolicy, mockWorkday);
  });

  describe('submitMorningCheckin', () => {
    it('throws BUSINESS_RULE_BACKDATING_FORBIDDEN when workDate is past (DEC-008)', async () => {
      const dto = {
        workDate: '2026-10-20', // past date
        commitments: [
          { taskText: 'Selesaikan tugas auth', initialRisk: CommitmentRisk.GREEN },
        ],
      };

      await expect(service.submitMorningCheckin('usr-1', dto)).rejects.toThrowError(AppException);
      try {
        await service.submitMorningCheckin('usr-1', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN);
        expect(err.getStatus()).toBe(422);
      }
    });

    it('requires justification when 0 commitments is submitted (DEC-004)', async () => {
      const dto = {
        workDate: '2026-10-28',
        commitments: [],
        zeroCommitmentReason: 'Singkat', // Kurang dari 10 karakter
      };

      await expect(service.submitMorningCheckin('usr-1', dto)).rejects.toThrowError(AppException);
    });

    it('successfully processes 0 commitments with valid reason (DEC-004)', async () => {
      const dto = {
        workDate: '2026-10-28',
        commitments: [],
        zeroCommitmentReason: 'Pelatihan internal perusahaan sepanjang hari',
      };

      mockPrisma.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'rec-1',
        initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
        morningSubmittedAt: new Date('2026-10-28T01:30:00.000Z'),
      });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-1',
        initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
        morningSubmittedAt: new Date('2026-10-28T01:30:00.000Z'),
        commitments: [],
        additionalWorks: [],
      });

      const result = await service.submitMorningCheckin('usr-1', dto);
      expect(result?.initialDailyStatus).toBe(DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT);
      expect(mockPrisma.dailyAccountabilityRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
            zeroCommitmentReason: 'Pelatihan internal perusahaan sepanjang hari',
          }),
        }),
      );
    });

    it('evaluates carry-over chain and increments carryOverDaysCount (DEC-013)', async () => {
      const dto = {
        workDate: '2026-10-28',
        commitments: [
          {
            taskText: 'Refactor scope resolver',
            initialRisk: CommitmentRisk.GREEN,
            originCommitmentId: 'parent-123',
          },
        ],
      };

      // Mock parent commitment
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'parent-123',
        carryOverDaysCount: 2,
        dailyRecord: {
          userId: 'usr-1',
          workDate: new Date('2026-10-27T00:00:00.000Z'),
        },
      });

      mockPrisma.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'rec-today',
        morningSubmittedAt: new Date('2026-10-28T01:30:00.000Z'),
      });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-today',
        commitments: [{ id: 'new-c1', carryOverDaysCount: 3 }],
        additionalWorks: [],
      });

      await service.submitMorningCheckin('usr-1', dto);

      expect(mockPrisma.commitment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isCarryOver: true,
            carryOverDaysCount: 3, // parent (2) + 1
            originCommitmentId: 'parent-123',
          }),
        }),
      );
    });

    it('throws BUSINESS_RULE_ALREADY_SUBMITTED when morning commitment is already submitted (DEF-001)', async () => {
      const p2002Error: any = new Error('Unique constraint failed');
      p2002Error.code = 'P2002';
      mockPrisma.dailyAccountabilityRecord.create.mockRejectedValue(p2002Error);
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        morningSubmittedAt: new Date('2026-10-28T08:00:00.000Z'),
      });

      const dto = {
        workDate: '2026-10-28',
        commitments: [{ taskText: 'Task 1', initialRisk: CommitmentRisk.GREEN }],
      };

      await expect(service.submitMorningCheckin('usr-1', dto)).rejects.toThrowError(AppException);
      try {
        await service.submitMorningCheckin('usr-1', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED);
        expect(err.getStatus()).toBe(422);
      }
    });

    it('succeeds when pre-existing record has null morningSubmittedAt (Two-Path conflict resolution)', async () => {
      const p2002Error: any = new Error('Unique constraint failed');
      p2002Error.code = 'P2002';
      mockPrisma.dailyAccountabilityRecord.create.mockRejectedValue(p2002Error);
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-pre-existing',
        morningSubmittedAt: null,
      });
      mockPrisma.dailyAccountabilityRecord.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-pre-existing',
        morningSubmittedAt: new Date('2026-10-28T08:30:00.000Z'),
        commitments: [{ id: 'c-1', taskText: 'Task 1' }],
        additionalWorks: [],
      });

      const dto = {
        workDate: '2026-10-28',
        commitments: [{ taskText: 'Task 1', initialRisk: CommitmentRisk.GREEN }],
      };

      const result = await service.submitMorningCheckin('usr-1', dto);
      expect(result.id).toBe('rec-pre-existing');
      expect(mockPrisma.dailyAccountabilityRecord.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'rec-pre-existing',
            morningSubmittedAt: null,
          },
        }),
      );
    });
  });

  describe('submitEodOutcome (DEC-003 & DEF-002)', () => {
    it('permits employee to confirm GREEN status even with carry-overs (DEC-003 No Green Lock)', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
      });

      mockPrisma.dailyAccountabilityRecord.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-today',
        finalDailyStatus: DailyRiskStatus.GREEN,
        eodSubmittedAt: new Date('2026-10-28T10:00:00.000Z'),
        commitments: [],
        additionalWorks: [],
      });

      const dto = {
        workDate: '2026-10-28',
        commitmentOutcomes: [
          {
            commitmentId: 'c-1',
            outcome: CommitmentOutcome.COMPLETED,
          },
          {
            commitmentId: 'c-2',
            outcome: CommitmentOutcome.PARTIALLY_COMPLETED,
            continuation: ContinuationStatus.CONTINUE,
            continuationReason: 'Perlu verifikasi pengujian tambahan besok',
          },
        ],
        finalDailyStatus: DailyRiskStatus.GREEN, // Karyawan tetap berhak memilih GREEN (DEC-003)
      };

      const result = await service.submitEodOutcome('usr-1', dto);
      expect(result.finalDailyStatus).toBe(DailyRiskStatus.GREEN);
      expect(mockPrisma.dailyAccountabilityRecord.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'rec-today',
            eodSubmittedAt: null,
          },
          data: expect.objectContaining({
            finalDailyStatus: DailyRiskStatus.GREEN,
          }),
        }),
      );
    });

    it('throws BUSINESS_RULE_ALREADY_SUBMITTED when EOD outcome is already submitted (DEF-002)', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: new Date('2026-10-28T17:30:00.000Z'),
      });

      const dto = {
        workDate: '2026-10-28',
        commitmentOutcomes: [],
        finalDailyStatus: DailyRiskStatus.GREEN,
      };

      await expect(service.submitEodOutcome('usr-1', dto)).rejects.toThrowError(AppException);
      try {
        await service.submitEodOutcome('usr-1', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED);
        expect(err.getStatus()).toBe(422);
      }
    });

    it('throws BUSINESS_RULE_ALREADY_SUBMITTED when conditional atomic update fails due to concurrency race', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
      });
      // Simulate concurrent update where another request already updated eodSubmittedAt
      mockPrisma.dailyAccountabilityRecord.updateMany.mockResolvedValue({ count: 0 });

      const dto = {
        workDate: '2026-10-28',
        commitmentOutcomes: [],
        finalDailyStatus: DailyRiskStatus.GREEN,
      };

      await expect(service.submitEodOutcome('usr-1', dto)).rejects.toThrowError(AppException);
      try {
        await service.submitEodOutcome('usr-1', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED);
        expect(err.getStatus()).toBe(422);
      }
    });
  });
});
