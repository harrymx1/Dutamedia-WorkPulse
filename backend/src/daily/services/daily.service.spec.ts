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
        count: vi.fn().mockResolvedValue(0),
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

  describe('submitAdditionalWork (Paket #2 — Kunci Pasca-EOD & Skenario Lembur)', () => {
    it('throws 422 BUSINESS_RULE_ALREADY_SUBMITTED when EOD has already been submitted', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: new Date('2026-10-28T10:05:00.000Z'),
        eodCutoffLockedAt: null,
      });

      const dto: any = {
        taskText: 'Perbaikan mendadak setelah EOD',
        reason: 'OPERATIONAL_INCIDENT',
      };

      await expect(service.submitAdditionalWork('usr-1', 'rec-today', dto)).rejects.toThrowError(AppException);
      try {
        await service.submitAdditionalWork('usr-1', 'rec-today', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED);
        expect(err.getStatus()).toBe(422);
        expect(err.message).toContain('Evaluasi Sore (EOD) hari ini sudah dikirim dan ditutup');
      }
    });

    it('throws 422 BUSINESS_RULE_CUTOFF_LOCKED when current WIB time passes eodLockCutoff (21:00)', async () => {
      // 14:15 UTC = 21:15 WIB (melewati batas kunci 21:00 WIB)
      mockClock.now.mockReturnValue(new Date('2026-10-28T14:15:00.000Z'));
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
        eodCutoffLockedAt: null,
      });

      const dto: any = {
        taskText: 'Tugas lembur lewat jam 21:00 WIB',
        reason: 'OPERATIONAL_INCIDENT',
      };

      await expect(service.submitAdditionalWork('usr-1', 'rec-today', dto)).rejects.toThrowError(AppException);
      try {
        await service.submitAdditionalWork('usr-1', 'rec-today', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED);
        expect(err.getStatus()).toBe(422);
        expect(err.message).toContain('21:00 WIB');
      }
    });

    it('throws 422 BUSINESS_RULE_CUTOFF_LOCKED when eodCutoffLockedAt is set', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
        eodCutoffLockedAt: new Date('2026-10-28T14:00:00.000Z'),
      });

      const dto: any = {
        taskText: 'Tugas saat eodCutoffLockedAt aktif',
        reason: 'OPERATIONAL_INCIDENT',
      };

      try {
        await service.submitAdditionalWork('usr-1', 'rec-today', dto);
        expect.unreachable('Should have thrown AppException');
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_CUTOFF_LOCKED);
        expect(err.getStatus()).toBe(422);
      }
    });

    it('allows submitting additional work during flexible overtime window (19:30 WIB) before EOD is submitted', async () => {
      // 12:30 UTC = 19:30 WIB (lembur fleksibel sebelum 21:00 WIB dan belum kirim EOD)
      mockClock.now.mockReturnValue(new Date('2026-10-28T12:30:00.000Z'));
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
        eodCutoffLockedAt: null,
        orgContextSnapshot: {},
      });
      mockPrisma.additionalWork.create.mockResolvedValue({
        id: 'aw-overtime-1',
        dailyRecordId: 'rec-today',
        taskText: 'Menangani hotfix modul invoice lembur',
        reason: 'OPERATIONAL_INCIDENT',
        assignedByUser: null,
      });

      const result = await service.submitAdditionalWork('usr-1', 'rec-today', {
        taskText: 'Menangani hotfix modul invoice lembur',
        reason: 'OPERATIONAL_INCIDENT' as any,
      });

      expect(result?.id).toBe('aw-overtime-1');
      expect(mockPrisma.additionalWork.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTodayState (Tomorrow Priority & Carry-Over H-1 -> H)', () => {
    it('returns tomorrowPriority and availableCarryOvers from previousWorkday when today record is null', async () => {
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.projectAuthorityMapping = { findMany: vi.fn().mockResolvedValue([]) };
      mockPrisma.blockerTicket = { findMany: vi.fn().mockResolvedValue([]) };

      mockPrisma.dailyAccountabilityRecord.findUnique
        .mockResolvedValueOnce(null) // today record
        .mockResolvedValueOnce({
          id: 'rec-prev',
          orgContextSnapshot: {
            tomorrowPriority: 'Validasi spesifikasi modul billing bersama QA',
            commitmentMeta: {
              1: { projectCode: 'PRJ-PORTAL', linkedBlockerId: null },
            },
          },
          commitments: [
            {
              id: 'c-prev-1',
              sequenceNo: 1,
              taskText: 'Finalisasi alur invoice otomatis',
              referenceLink: 'https://github.com/dutamedia/workpulse/issues/214',
              initialRisk: CommitmentRisk.GREEN,
              carryOverDaysCount: 1,
              continuation: ContinuationStatus.CONTINUE,
              continuationReason: 'Menunggu konfirmasi tabel pajak',
            },
          ],
        });

      const result = await service.getTodayState('usr-1');

      expect(result.tomorrowPriority).toBe('Validasi spesifikasi modul billing bersama QA');
      expect(result.availableCarryOvers).toHaveLength(1);
      expect(result.availableCarryOvers[0]).toMatchObject({
        originCommitmentId: 'c-prev-1',
        carryOverDaysCount: 2,
        suggestedRisk: CommitmentRisk.AMBER,
        isAmberWarningAdvised: true,
        projectCode: 'PRJ-PORTAL',
        continuationReason: 'Menunggu konfirmasi tabel pajak',
      });
    });

    it('keeps returning tomorrowPriority from previousWorkday even after today morning commitments are submitted', async () => {
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.projectAuthorityMapping = { findMany: vi.fn().mockResolvedValue([]) };
      mockPrisma.blockerTicket = { findMany: vi.fn().mockResolvedValue([]) };

      mockPrisma.dailyAccountabilityRecord.findUnique
        .mockResolvedValueOnce({
          id: 'rec-today-submitted',
          morningSubmittedAt: new Date('2026-10-28T01:45:00.000Z'),
          orgContextSnapshot: { commitmentMeta: {} },
          commitments: [
            {
              id: 'c-today-1',
              sequenceNo: 1,
              taskText: 'Melanjutkan review desain API',
              initialRisk: CommitmentRisk.GREEN,
              blockers: [],
            },
          ],
          additionalWorks: [],
        })
        .mockResolvedValueOnce({
          id: 'rec-prev',
          orgContextSnapshot: {
            tomorrowPriority: 'Tetap selesaikan prioritas kemarin pagi ini',
          },
          commitments: [
            {
              id: 'c-prev-1',
              sequenceNo: 1,
              continuation: ContinuationStatus.CONTINUE,
            },
          ],
        });

      const result = await service.getTodayState('usr-1');

      expect(result.tomorrowPriority).toBe('Tetap selesaikan prioritas kemarin pagi ini');
      expect(result.availableCarryOvers).toEqual([]);
    });
  });
});
