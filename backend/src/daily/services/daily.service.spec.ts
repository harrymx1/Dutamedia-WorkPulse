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
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn(),
        update: vi.fn(),
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

      mockPrisma.dailyAccountabilityRecord.upsert.mockResolvedValue({
        id: 'rec-1',
        initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
      });
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
        commitments: [],
      });

      const result = await service.submitMorningCheckin('usr-1', dto);
      expect(result?.initialDailyStatus).toBe(DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT);
      expect(mockPrisma.dailyAccountabilityRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
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

      mockPrisma.dailyAccountabilityRecord.upsert.mockResolvedValue({ id: 'rec-today' });
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        commitments: [{ id: 'new-c1', carryOverDaysCount: 3 }],
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
  });

  describe('submitEodOutcome (DEC-003)', () => {
    it('permits employee to confirm GREEN status even with carry-overs (DEC-003 No Green Lock)', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
      });

      mockPrisma.dailyAccountabilityRecord.update.mockResolvedValue({
        id: 'rec-today',
        finalDailyStatus: DailyRiskStatus.GREEN,
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
      expect(mockPrisma.dailyAccountabilityRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            finalDailyStatus: DailyRiskStatus.GREEN,
          }),
        }),
      );
    });
  });
});
