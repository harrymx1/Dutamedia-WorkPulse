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

  describe('Temuan 2 & 3 — Additional Work Pasca Cut-Off Pagi (Opsi A), Edit & Hapus Terkontrol', () => {
    beforeEach(() => {
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.auditLog = { create: vi.fn().mockResolvedValue({ id: 'aud-1' }) };
      mockPrisma.notification = { create: vi.fn().mockResolvedValue({ id: 'notif-1' }) };
      mockPrisma.additionalWork.findUnique = vi.fn();
      mockPrisma.additionalWork.delete = vi.fn();
    });

    it('menolak submitTodayAdditionalWork sebelum batas Cut-Off pagi (<= 09:30 WIB) bila Morning Commitment belum diisi', async () => {
      // 01:45 UTC = 08:45 WIB (sebelum 09:30 WIB)
      mockClock.now.mockReturnValue(new Date('2026-10-28T01:45:00.000Z'));
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);

      await expect(
        service.submitTodayAdditionalWork('usr-1', {
          taskText: 'Mengerjakan tugas tambahan sebelum cutoff pagi',
          reason: 'OPERATIONAL_INCIDENT' as any,
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });
    });

    it('mengizinkan submitTodayAdditionalWork pasca Cut-Off pagi (> 09:30 WIB) dengan status pagi jujur NO_SUBMISSION dan alasan MORNING_CUTOFF_MISSED', async () => {
      // 03:30 UTC = 10:30 WIB (melewati 09:30 WIB, sebelum 21:00 WIB)
      mockClock.now.mockReturnValue(new Date('2026-10-28T03:30:00.000Z'));
      mockPrisma.dailyAccountabilityRecord.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'rec-auto-nosub',
          userId: 'usr-1',
          workDate: new Date('2026-10-28'),
          morningSubmittedAt: null,
          eodSubmittedAt: null,
          eodCutoffLockedAt: null,
          orgContextSnapshot: {},
        });
      mockPrisma.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'rec-auto-nosub',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        morningSubmittedAt: null,
        morningTiming: 'NO_SUBMISSION',
        initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
        orgContextSnapshot: {},
      });
      mockPrisma.additionalWork.create.mockResolvedValue({
        id: 'aw-late-1',
        dailyRecordId: 'rec-auto-nosub',
        taskText: 'Menangani revisi laporan karena pagi rapat mendadak',
        reason: 'MORNING_CUTOFF_MISSED',
        assignedByUserId: null,
        assignedByUser: null,
      });

      const res = await service.submitTodayAdditionalWork('usr-1', {
        taskText: 'Menangani revisi laporan karena pagi rapat mendadak',
        reason: 'MORNING_CUTOFF_MISSED' as any,
      });

      expect(res?.id).toBe('aw-late-1');
      expect(mockPrisma.dailyAccountabilityRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            morningSubmittedAt: null,
            morningTiming: 'NO_SUBMISSION',
            initialDailyStatus: DailyRiskStatus.NOT_APPLICABLE_NO_COMMITMENT,
          }),
        }),
      );
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'ADDITIONAL_WORK_CREATED',
            relatedEntityId: 'aw-late-1',
          }),
        }),
      );
    });

    it('menolak alasan MORNING_CUTOFF_MISSED bila Morning Commitment hari ini sudah diisi', async () => {
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-has-morning',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        morningSubmittedAt: new Date('2026-10-28T01:20:00.000Z'),
        eodSubmittedAt: null,
        eodCutoffLockedAt: null,
        orgContextSnapshot: {},
      });

      await expect(
        service.submitAdditionalWork('usr-1', 'rec-has-morning', {
          taskText: 'Tugas yang salah pilih alasan pagi terlewat',
          reason: 'MORNING_CUTOFF_MISSED' as any,
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });
    });

    it('mengizinkan submitEodOutcome pasca Cut-Off pagi (> 09:30 WIB) saat record harian belum dibuat agar konsisten dengan Opsi A', async () => {
      mockClock.now.mockReturnValue(new Date('2026-10-28T09:30:00.000Z')); // 16:30 WIB
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);
      mockPrisma.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'rec-eod-nosub',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        morningSubmittedAt: null,
        eodSubmittedAt: null,
        orgContextSnapshot: {},
        commitments: [],
        additionalWorks: [],
      });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-eod-nosub',
        morningTiming: 'NO_SUBMISSION',
        finalDailyStatus: DailyRiskStatus.GREEN,
        commitments: [],
        additionalWorks: [],
      });

      const res = await service.submitEodOutcome('usr-1', {
        workDate: '2026-10-28',
        commitmentOutcomes: [],
        finalDailyStatus: DailyRiskStatus.GREEN,
      });

      expect(res.finalDailyStatus).toBe(DailyRiskStatus.GREEN);
      expect(mockPrisma.dailyAccountabilityRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            morningTiming: 'NO_SUBMISSION',
          }),
        }),
      );
    });

    it('memperbarui pekerjaan tambahan sebelum EOD ditutup, mencatat audit before/after, dan mengirim notifikasi ke atasan penugas (NEWLY_ASSIGNED)', async () => {
      mockClock.now.mockReturnValue(new Date('2026-10-28T06:00:00.000Z')); // 13:00 WIB
      mockPrisma.user = {
        findUnique: vi.fn().mockResolvedValue({ id: 'mgr-1', status: 'ACTIVE' }),
      };
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'PERMANENT',
        endDate: null,
      });
      mockPrisma.additionalWork.findUnique.mockResolvedValue({
        id: 'aw-1',
        dailyRecordId: 'rec-today',
        taskText: 'Tugas awal dari atasan',
        reason: 'NEWLY_ASSIGNED',
        assignedByUserId: 'mgr-1',
        dailyRecord: {
          id: 'rec-today',
          userId: 'usr-1',
          workDate: new Date('2026-10-28'),
          morningSubmittedAt: new Date('2026-10-28T01:30:00.000Z'),
          eodSubmittedAt: null,
          eodCutoffLockedAt: null,
          orgContextSnapshot: { additionalWorkMeta: { 'aw-1': { projectCode: 'WP-CORE' } } },
          user: { id: 'usr-1', fullName: 'Aditya Nugroho' },
        },
        assignedByUser: { id: 'mgr-1', fullName: 'Bambang Pratama' },
      });
      mockPrisma.additionalWork.update.mockResolvedValue({
        id: 'aw-1',
        dailyRecordId: 'rec-today',
        taskText: 'Tugas diperbarui dari atasan (modul login)',
        reason: 'NEWLY_ASSIGNED',
        assignedByUserId: 'mgr-1',
        assignedByUser: { id: 'mgr-1', fullName: 'Bambang Pratama', email: 'lead.tech@dutamedia.com' },
      });

      const updated = await service.updateAdditionalWork('usr-1', 'aw-1', {
        taskText: 'Tugas diperbarui dari atasan (modul login)',
        reason: 'NEWLY_ASSIGNED' as any,
        assignedByUserId: 'mgr-1',
        projectCode: 'PRJ-CORE',
      });

      expect(updated.taskText).toBe('Tugas diperbarui dari atasan (modul login)');
      expect(updated.projectCode).toBe('PRJ-CORE');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'ADDITIONAL_WORK_UPDATED',
            relatedEntityId: 'aw-1',
            valueBefore: expect.objectContaining({ taskText: 'Tugas awal dari atasan', projectCode: 'WP-CORE' }),
            valueAfter: expect.objectContaining({ taskText: 'Tugas diperbarui dari atasan (modul login)', projectCode: 'PRJ-CORE' }),
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'mgr-1',
            triggerType: 'ADDITIONAL_WORK_UPDATED',
          }),
        }),
      );
    });

    it('menolak penghapusan jika alasan < 5 karakter dan menolak update/hapus setelah EOD dikirim', async () => {
      await expect(service.deleteAdditionalWork('usr-1', 'aw-1', 'ok')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });

      mockPrisma.additionalWork.findUnique.mockResolvedValue({
        id: 'aw-1',
        dailyRecordId: 'rec-today',
        taskText: 'Tugas terkunci',
        reason: 'OPERATIONAL_INCIDENT',
        assignedByUserId: null,
        dailyRecord: {
          id: 'rec-today',
          userId: 'usr-1',
          workDate: new Date('2026-10-28'),
          eodSubmittedAt: new Date('2026-10-28T10:15:00.000Z'),
        },
      });

      await expect(
        service.deleteAdditionalWork('usr-1', 'aw-1', 'Salah ketik ganda'),
      ).rejects.toMatchObject({
        code: ErrorCode.BUSINESS_RULE_ALREADY_SUBMITTED,
      });
    });

    it('menghapus pekerjaan tambahan sebelum EOD dengan alasan wajib, mencatat audit, dan mengirim notifikasi ke atasan penugas', async () => {
      mockClock.now.mockReturnValue(new Date('2026-10-28T06:00:00.000Z')); // 13:00 WIB
      mockPrisma.additionalWork.findUnique.mockResolvedValue({
        id: 'aw-del-1',
        dailyRecordId: 'rec-today',
        taskText: 'Penugasan rapat mendadak klien X',
        reason: 'NEWLY_ASSIGNED',
        assignedByUserId: 'mgr-1',
        dailyRecord: {
          id: 'rec-today',
          userId: 'usr-1',
          workDate: new Date('2026-10-28'),
          eodSubmittedAt: null,
          eodCutoffLockedAt: null,
          orgContextSnapshot: { additionalWorkMeta: { 'aw-del-1': { projectCode: 'PRJ-PORTAL' } } },
          user: { id: 'usr-1', fullName: 'Aditya Nugroho' },
        },
        assignedByUser: { id: 'mgr-1', fullName: 'Bambang Pratama' },
      });
      mockPrisma.additionalWork.delete.mockResolvedValue({ id: 'aw-del-1' });

      const res = await service.deleteAdditionalWork('usr-1', 'aw-del-1', 'Jadwal rapat ditunda atasan ke pekan depan');

      expect(res).toEqual({ deleted: true, id: 'aw-del-1' });
      expect(mockPrisma.additionalWork.delete).toHaveBeenCalledWith({ where: { id: 'aw-del-1' } });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'ADDITIONAL_WORK_DELETED',
            relatedEntityId: 'aw-del-1',
            valueAfter: expect.objectContaining({
              deleted: true,
              deleteReason: 'Jadwal rapat ditunda atasan ke pekan depan',
            }),
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'mgr-1',
            triggerType: 'ADDITIONAL_WORK_DELETED',
          }),
        }),
      );
    });
  });

  describe('Audit #4 — EOD Outcome (Risiko AMBER/RED, Pekerjaan Tambahan, & Blocker Aktif)', () => {
    it('menolak submitEodOutcome dengan status AMBER atau RED tanpa dailyRiskExplanation min. 10 karakter', async () => {
      mockClock.now.mockReturnValue(new Date('2026-10-28T10:00:00.000Z')); // 17:00 WIB
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
        orgContextSnapshot: {},
      });

      await expect(
        service.submitEodOutcome('usr-1', {
          workDate: '2026-10-28',
          commitmentOutcomes: [],
          finalDailyStatus: DailyRiskStatus.AMBER,
          dailyRiskExplanation: 'Pendek',
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });
    });

    it('menyimpan dailyRiskExplanation ke orgContextSnapshot saat status AMBER/RED valid & membersihkannya saat GREEN', async () => {
      mockClock.now.mockReturnValue(new Date('2026-10-28T10:00:00.000Z')); // 17:00 WIB
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
        orgContextSnapshot: { role: 'EMPLOYEE' },
      });
      mockPrisma.dailyAccountabilityRecord.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-today',
        finalDailyStatus: DailyRiskStatus.RED,
        commitments: [],
        additionalWorks: [],
      });

      await service.submitEodOutcome('usr-1', {
        workDate: '2026-10-28',
        commitmentOutcomes: [],
        finalDailyStatus: DailyRiskStatus.RED,
        dailyRiskExplanation: 'Gateway pembayaran klien masih gangguan hingga jam 17:00 WIB',
      });

      expect(mockPrisma.dailyAccountabilityRecord.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            finalDailyStatus: DailyRiskStatus.RED,
            orgContextSnapshot: expect.objectContaining({
              role: 'EMPLOYEE',
              dailyRiskExplanation:
                'Gateway pembayaran klien masih gangguan hingga jam 17:00 WIB',
            }),
          }),
        }),
      );
    });

    it('memvalidasi CANCELLED/CONTINUE pada additionalWorkOutcomes dan membersihkan continuation usang saat COMPLETED', async () => {
      mockClock.now.mockReturnValue(new Date('2026-10-28T10:00:00.000Z')); // 17:00 WIB
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue({
        id: 'rec-today',
        userId: 'usr-1',
        workDate: new Date('2026-10-28'),
        eodSubmittedAt: null,
        orgContextSnapshot: {},
      });
      mockPrisma.additionalWork.update.mockResolvedValue({});
      mockPrisma.commitment.update.mockResolvedValue({});
      mockPrisma.dailyAccountabilityRecord.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-today',
        finalDailyStatus: DailyRiskStatus.GREEN,
        commitments: [],
        additionalWorks: [],
      });

      // Menolak additionalWork CANCELLED tanpa outcomeReason
      await expect(
        service.submitEodOutcome('usr-1', {
          workDate: '2026-10-28',
          commitmentOutcomes: [],
          additionalWorkOutcomes: [
            {
              additionalWorkId: 'aw-1',
              outcome: CommitmentOutcome.CANCELLED,
            },
          ],
          finalDailyStatus: DailyRiskStatus.GREEN,
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });

      // Normalisasi continuation & continuationReason menjadi null saat outcome COMPLETED
      await service.submitEodOutcome('usr-1', {
        workDate: '2026-10-28',
        commitmentOutcomes: [
          {
            commitmentId: 'c-1',
            outcome: CommitmentOutcome.COMPLETED,
            continuation: ContinuationStatus.CONTINUE,
            continuationReason: '',
          },
        ],
        additionalWorkOutcomes: [
          {
            additionalWorkId: 'aw-1',
            outcome: CommitmentOutcome.COMPLETED,
            continuation: ContinuationStatus.CONTINUE,
            continuationReason: '',
          },
        ],
        finalDailyStatus: DailyRiskStatus.GREEN,
      });

      expect(mockPrisma.commitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c-1' },
          data: expect.objectContaining({
            outcome: CommitmentOutcome.COMPLETED,
            continuation: null,
            continuationReason: null,
            isEodLocked: true,
          }),
        }),
      );
      expect(mockPrisma.additionalWork.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'aw-1' },
          data: expect.objectContaining({
            outcome: CommitmentOutcome.COMPLETED,
            continuation: null,
            continuationReason: null,
            isEodLocked: true,
          }),
        }),
      );
    });

    it('getTodayState mengembalikan myActiveBlockers khusus pelapor yang aktif untuk Status Suggestion', async () => {
      mockPrisma.blockerTicket = {
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'blk-other',
              description: 'Blocker orang lain',
              severity: 'CRITICAL',
              projectCodeReference: 'PRJ-CORE',
              status: 'OPEN',
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'blk-mine',
              description: 'Server API down',
              severity: 'HIGH',
              type: 'INFRA',
              status: 'IN_PROGRESS',
            },
          ]),
      };

      const res = await service.getTodayState('usr-1');

      expect(res.myActiveBlockers).toHaveLength(1);
      expect(res.myActiveBlockers[0]).toMatchObject({
        id: 'blk-mine',
        severity: 'HIGH',
        type: 'INFRA',
        status: 'IN_PROGRESS',
      });
    });
  });

  describe('getWeeklyHistory', () => {
    it('uses Asia/Jakarta todayString for default 7-day range during early-morning WIB (00:00-06:59 WIB)', async () => {
      // 18:30 UTC on 2026-11-21 equals 01:30 WIB on 2026-11-22
      mockClock.now.mockReturnValue(new Date('2026-11-21T18:30:00.000Z'));
      mockClock.todayString.mockReturnValue('2026-11-22');

      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
        {
          id: 'rec-wib-1',
          workDate: new Date('2026-11-22T00:00:00.000Z'),
          morningTiming: 'ON_TIME',
          eodTiming: 'ON_TIME',
          initialDailyStatus: 'GREEN',
          finalDailyStatus: 'AMBER',
          commitments: [],
          additionalWorks: [],
        },
      ]);

      const res = await service.getWeeklyHistory('usr-1');

      expect(mockClock.todayString).toHaveBeenCalledWith('Asia/Jakarta');
      expect(mockPrisma.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'usr-1',
            workDate: {
              gte: new Date('2026-11-16T00:00:00.000Z'),
              lte: new Date('2026-11-22T00:00:00.000Z'),
            },
          },
        }),
      );
      expect(res.dateRange).toEqual({
        startDate: '2026-11-16',
        endDate: '2026-11-22',
      });
      expect(res.kpi).toEqual({
        totalDays: 1,
        onTimeSubmissions: 1,
        onTimeRate: 100,
        greenDays: 0,
        amberDays: 1,
        redDays: 0,
      });
    });

    it('uses explicit startDate and endDate when provided', async () => {
      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      const res = await service.getWeeklyHistory('usr-1', '2026-11-01', '2026-11-10');

      expect(mockPrisma.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'usr-1',
            workDate: {
              gte: new Date('2026-11-01'),
              lte: new Date('2026-11-10'),
            },
          },
        }),
      );
      expect(res.dateRange).toEqual({
        startDate: '2026-11-01',
        endDate: '2026-11-10',
      });
    });

    it('returns recordedLeaves and recordedExemptions for read-only employee history (DEC-018)', async () => {
      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);
      mockPrisma.leaveRequest = {
        findMany: vi.fn().mockResolvedValue([
          { id: 'lv-1', leaveType: 'ANNUAL', status: 'APPROVED', reason: 'Cuti keluarga' },
        ]),
      };
      mockPrisma.boundedExemption = {
        findMany: vi.fn().mockResolvedValue([
          { id: 'ex-1', exemptionCategory: 'Dinas Luar', reason: 'Kunjungan klien' },
        ]),
      };

      const res = await service.getWeeklyHistory('usr-1', '2026-11-01', '2026-11-10');
      expect((res as any).recordedLeaves).toHaveLength(1);
      expect((res as any).recordedExemptions).toHaveLength(1);
    });
  });

  describe('DEC-018 BoundedExemption Auto-Exemption & DEC-020/021 RED/AMBER Blocker Rules', () => {
    it('returns activeExemption on getTodayState when bounded exemption is active today', async () => {
      mockPrisma.boundedExemption = {
        findFirst: vi.fn().mockResolvedValue({
          id: 'ex-today',
          exemptionCategory: 'Dinas Luar',
          officialReferenceNumber: 'ST/HRGA/2026/XI/104',
          startDate: new Date('2026-10-28T00:00:00.000Z'),
          endDate: new Date('2026-10-29T00:00:00.000Z'),
          reason: 'Kunjungan implementasi klien luar kota',
        }),
      };
      mockPrisma.dailyAccountabilityRecord.findUnique.mockResolvedValue(null);

      const res = await service.getTodayState('usr-1');
      expect((res as any).activeExemption).toEqual({
        id: 'ex-today',
        exemptionCategory: 'Dinas Luar',
        officialReferenceNumber: 'ST/HRGA/2026/XI/104',
        startDate: '2026-10-28',
        endDate: '2026-10-29',
        isPermanent: false,
        reason: 'Kunjungan implementasi klien luar kota',
      });
    });

    it('blocks submitMorningCheckin automatically when user has an active boundedExemption', async () => {
      mockPrisma.boundedExemption = {
        findFirst: vi.fn().mockResolvedValue({
          id: 'ex-today',
          exemptionCategory: 'Dinas Luar',
          endDate: new Date('2026-10-29T00:00:00.000Z'),
        }),
      };

      await expect(
        service.submitMorningCheckin('usr-1', {
          workDate: '2026-10-28',
          commitments: [{ taskText: 'Coba kirim komitmen', initialRisk: CommitmentRisk.GREEN }],
        }),
      ).rejects.toThrowError(/dispensasi resmi/);
    });

    it('blocks submitMorningCheckin automatically when user has permanent exemption with null endDate (DEC-022)', async () => {
      mockPrisma.boundedExemption = {
        findFirst: vi.fn().mockResolvedValue({
          id: 'ex-perm',
          exemptionCategory: 'Pengecualian Permanen',
          endDate: null,
        }),
      };

      await expect(
        service.submitMorningCheckin('usr-1', {
          workDate: '2026-10-28',
          commitments: [{ taskText: 'Coba kirim komitmen', initialRisk: CommitmentRisk.GREEN }],
        }),
      ).rejects.toThrowError(/pengecualian permanen/);
    });

    it('rejects RED commitment without linkedBlockerId (DEC-020)', async () => {
      await expect(
        service.submitMorningCheckin('usr-1', {
          workDate: '2026-10-28',
          commitments: [
            {
              taskText: 'Rilis modul pembayaran ke staging',
              initialRisk: CommitmentRisk.RED,
              knownBlockerNote: 'Server staging error tanpa tiket blocker',
            },
          ],
        }),
      ).rejects.toThrowError(/RED wajib mengaitkan tiket Blocker aktif/);
    });

    it('rejects RED commitment when linked blocker is already RESOLVED/inactive (DEC-020)', async () => {
      mockPrisma.blockerTicket = {
        findUnique: vi.fn().mockResolvedValue({
          id: 'blk-closed',
          description: 'Sudah selesai',
          status: 'RESOLVED',
        }),
      };

      await expect(
        service.submitMorningCheckin('usr-1', {
          workDate: '2026-10-28',
          commitments: [
            {
              taskText: 'Rilis modul pembayaran ke staging',
              initialRisk: CommitmentRisk.RED,
              linkedBlockerId: 'blk-closed',
              knownBlockerNote: 'Blocker lama',
            },
          ],
        }),
      ).rejects.toThrowError(/tidak ditemukan atau sudah tidak aktif/);
    });

    it('accepts RED commitment when linked to an active blocker ticket (DEC-020)', async () => {
      mockPrisma.blockerTicket = {
        findUnique: vi.fn().mockResolvedValue({
          id: 'blk-open-1',
          description: 'Database staging connection timeout',
          status: 'OPEN',
        }),
      };
      mockPrisma.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'rec-red-1',
        initialDailyStatus: DailyRiskStatus.RED,
        morningSubmittedAt: new Date('2026-10-28T01:30:00.000Z'),
      });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-red-1',
        initialDailyStatus: DailyRiskStatus.RED,
        commitments: [],
        additionalWorks: [],
      });

      const res = await service.submitMorningCheckin('usr-1', {
        workDate: '2026-10-28',
        commitments: [
          {
            taskText: 'Selesaikan integrasi database staging',
            initialRisk: CommitmentRisk.RED,
            linkedBlockerId: 'blk-open-1',
          },
        ],
      });

      expect(res.initialDailyStatus).toBe(DailyRiskStatus.RED);
      expect(mockPrisma.commitment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            initialRisk: CommitmentRisk.RED,
            knownBlockerNote: expect.stringContaining('Database staging connection timeout'),
          }),
        }),
      );
    });

    it('permits AMBER commitment without linkedBlockerId when knownBlockerNote is provided (DEC-021)', async () => {
      mockPrisma.dailyAccountabilityRecord.create.mockResolvedValue({
        id: 'rec-amber-1',
        initialDailyStatus: DailyRiskStatus.AMBER,
        morningSubmittedAt: new Date('2026-10-28T01:30:00.000Z'),
      });
      mockPrisma.dailyAccountabilityRecord.findUniqueOrThrow.mockResolvedValue({
        id: 'rec-amber-1',
        initialDailyStatus: DailyRiskStatus.AMBER,
        commitments: [],
        additionalWorks: [],
      });

      const res = await service.submitMorningCheckin('usr-1', {
        workDate: '2026-10-28',
        commitments: [
          {
            taskText: 'Lanjutkan refactoring modul analitik hari ke-2',
            initialRisk: CommitmentRisk.AMBER,
            knownBlockerNote: 'Ruang lingkup kompleks dan ada rapat sinkronisasi siang nanti',
          },
        ],
      });

      expect(res.initialDailyStatus).toBe(DailyRiskStatus.AMBER);
    });
  });
});
