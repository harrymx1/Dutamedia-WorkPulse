import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CorrectionService } from './correction.service';
import {
  CommitmentOutcome,
  CommitmentRisk,
  CorrectionClassification,
  CorrectionScopeType,
  CorrectionStatus,
  DailyRiskStatus,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('CorrectionService (WP-EP09 / Correction Request State Machine - SAD 2.4)', () => {
  let service: CorrectionService;
  let mockPrisma: any;
  let mockClock: any;
  let mockPolicy: any;
  let mockScopeResolver: any;

  beforeEach(() => {
    mockPrisma = {
      commitment: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      correctionRequest: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      notification: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T10:00:00.000Z')),
    };

    mockPolicy = {
      getActivePolicy: vi.fn().mockResolvedValue({
        configurationValues: { morningLockCutoff: '09:30' },
      }),
    };

    mockScopeResolver = {
      canAccessUser: vi.fn().mockResolvedValue(true),
      enforceUserScope: vi.fn().mockResolvedValue(undefined),
    };

    service = new CorrectionService(
      mockPrisma,
      mockClock,
      mockPolicy,
      mockScopeResolver,
    );
  });

  describe('createCorrectionRequest', () => {
    it('auto-applies minor correction immediately without waiting for review (SAD 2.4)', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-1',
        sequenceNo: 1,
        taskText: 'Menyelesaikan endpoint authenikasi',
        referenceLink: null,
        initialRisk: CommitmentRisk.GREEN,
        dailyRecord: { userId: 'usr-1' },
      });

      mockPrisma.correctionRequest.create.mockResolvedValue({
        id: 'cr-1',
        status: CorrectionStatus.AUTO_APPLIED,
      });

      const res = await service.createCorrectionRequest('usr-1', {
        targetCommitmentId: 'com-1',
        scopeType: CorrectionScopeType.MORNING_COMMITMENT,
        classification: CorrectionClassification.MINOR,
        reason: 'Perbaikan typo penulisan kata autentikasi',
        requestedChange: {
          taskText: 'Menyelesaikan endpoint autentikasi',
        },
      });

      expect(res.status).toBe(CorrectionStatus.AUTO_APPLIED);
      expect(mockPrisma.commitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'com-1' },
          data: expect.objectContaining({ taskText: 'Menyelesaikan endpoint autentikasi' }),
        }),
      );
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ actionCode: 'CORRECTION_AUTO_APPLIED' }),
        }),
      );
    });

    it('creates pending material correction and opens 24h objection window', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-1',
        sequenceNo: 1,
        taskText: 'Refactoring arsitektur',
        initialRisk: CommitmentRisk.GREEN,
        dailyRecord: { userId: 'usr-1' },
      });

      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        directManagerId: 'mgr-1',
      });

      mockPrisma.correctionRequest.create.mockResolvedValue({
        id: 'cr-2',
        status: CorrectionStatus.PENDING,
      });

      const res = await service.createCorrectionRequest('usr-1', {
        targetCommitmentId: 'com-1',
        scopeType: CorrectionScopeType.MORNING_COMMITMENT,
        classification: CorrectionClassification.MATERIAL,
        reason: 'Perubahan ruang lingkup tugas karena prioritas insiden production',
        requestedChange: {
          taskText: 'Investigasi & patch insiden production auth bypass',
          initialRisk: CommitmentRisk.RED,
        },
      });

      expect(res.status).toBe(CorrectionStatus.PENDING);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'mgr-1',
            triggerType: 'CORRECTION_REQUESTED',
          }),
        }),
      );
    });
  });

  describe('reviewCorrectionRequest', () => {
    it('applies change and sets status to APPROVED upon manager approval', async () => {
      mockPrisma.correctionRequest.findUnique.mockResolvedValue({
        id: 'cr-2',
        targetCommitmentId: 'com-1',
        requestedByUserId: 'usr-1',
        status: CorrectionStatus.PENDING,
        valueBefore: { taskText: 'Tugas A' },
        valueRequested: { taskText: 'Tugas A Revisi' },
        targetCommitment: { sequenceNo: 1 },
      });

      mockPrisma.correctionRequest.update.mockResolvedValue({
        id: 'cr-2',
        status: CorrectionStatus.APPROVED,
      });

      const res = await service.reviewCorrectionRequest('mgr-1', 'cr-2', {
        decision: 'APPROVE',
        reviewNote: 'Disetujui sesuai kondisi lapangan',
      });

      expect(res.status).toBe(CorrectionStatus.APPROVED);
      expect(mockPrisma.commitment.update).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ actionCode: 'CORRECTION_APPROVED' }),
        }),
      );
    });

    it('enforces scope boundary and denies cross-division correction review', async () => {
      mockPrisma.correctionRequest.findUnique.mockResolvedValue({
        id: 'cr-cross',
        requestedByUserId: 'usr-cross-division',
        status: CorrectionStatus.PENDING,
      });

      mockScopeResolver.enforceUserScope.mockRejectedValueOnce(
        new AppException({
          code: 'AUTH_FORBIDDEN_SCOPE',
          message: 'Akses ditolak di luar hierarki',
          statusCode: 403,
        }),
      );

      await expect(
        service.reviewCorrectionRequest('mgr-tech', 'cr-cross', {
          decision: 'APPROVE',
          reviewNote: 'Catatan review pengujian wewenang',
        }),
      ).rejects.toThrowError(AppException);

      expect(mockScopeResolver.enforceUserScope).toHaveBeenCalledWith(
        'mgr-tech',
        'usr-cross-division',
      );
    });

    it('rejects self-approval of correction request with AUTH_FORBIDDEN_SCOPE', async () => {
      mockPrisma.correctionRequest.findUnique.mockResolvedValue({
        id: 'cr-self',
        requestedByUserId: 'mgr-tech',
        status: CorrectionStatus.PENDING,
      });

      await expect(
        service.reviewCorrectionRequest('mgr-tech', 'cr-self', {
          decision: 'APPROVE',
          reviewNote: 'Coba setujui koreksi sendiri',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('filters correction requests to only include accessible subordinates', async () => {
      mockPrisma.correctionRequest.findMany.mockResolvedValue([
        { id: 'cr-1', requestedByUserId: 'usr-subordinate-eng' },
        { id: 'cr-2', requestedByUserId: 'usr-creative-staff' },
      ]);

      mockScopeResolver.canAccessUser.mockImplementation(async (_caller: string, target: string) => {
        return target === 'usr-subordinate-eng';
      });

      const queue = await service.getCorrectionRequests({}, 'mgr-tech');
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('cr-1');
      expect(mockScopeResolver.canAccessUser).toHaveBeenCalledTimes(2);
    });

    it('recalculates initialDailyStatus on dailyAccountabilityRecord when material risk correction is APPROVED', async () => {
      mockPrisma.commitment.findMany = vi.fn().mockResolvedValue([
        { initialRisk: CommitmentRisk.GREEN, blockers: [] },
        { initialRisk: CommitmentRisk.RED, blockers: [] },
      ]);
      mockPrisma.dailyAccountabilityRecord = {
        update: vi.fn().mockResolvedValue({}),
      };

      mockPrisma.correctionRequest.findUnique.mockResolvedValue({
        id: 'cr-red',
        targetCommitmentId: 'com-2',
        requestedByUserId: 'usr-1',
        reason: 'Eskalasi risiko ke kritis',
        status: CorrectionStatus.PENDING,
        valueBefore: { taskText: 'Tugas B', initialRisk: CommitmentRisk.AMBER },
        valueRequested: { taskText: 'Tugas B Revisi', initialRisk: CommitmentRisk.RED },
        targetCommitment: { sequenceNo: 2, dailyRecordId: 'dr-1' },
      });

      mockPrisma.correctionRequest.update.mockResolvedValue({
        id: 'cr-red',
        status: CorrectionStatus.APPROVED,
      });

      const res = await service.reviewCorrectionRequest('mgr-1', 'cr-red', {
        decision: 'APPROVE',
        reviewNote: 'Risiko kritis disahkan oleh Head',
      });

      expect(res.status).toBe(CorrectionStatus.APPROVED);
      expect(mockPrisma.dailyAccountabilityRecord.update).toHaveBeenCalledWith({
        where: { id: 'dr-1' },
        data: { initialDailyStatus: DailyRiskStatus.RED },
      });
    });

    it('recalculates initialDailyStatus immediately on MINOR risk correction', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-1',
        dailyRecordId: 'dr-1',
        sequenceNo: 1,
        taskText: 'Tugas A',
        referenceLink: null,
        initialRisk: CommitmentRisk.GREEN,
        dailyRecord: { userId: 'usr-1' },
      });
      mockPrisma.commitment.findMany = vi.fn().mockResolvedValue([
        { initialRisk: CommitmentRisk.AMBER, blockers: [] },
      ]);
      mockPrisma.dailyAccountabilityRecord = {
        update: vi.fn().mockResolvedValue({}),
      };
      mockPrisma.correctionRequest.create.mockResolvedValue({
        id: 'cr-minor-amber',
        status: CorrectionStatus.AUTO_APPLIED,
      });

      await service.createCorrectionRequest('usr-1', {
        targetCommitmentId: 'com-1',
        scopeType: CorrectionScopeType.MORNING_COMMITMENT,
        classification: CorrectionClassification.MINOR,
        reason: 'Menyesuaikan status risiko menjadi waspada',
        requestedChange: {
          taskText: 'Tugas A',
          initialRisk: CommitmentRisk.AMBER,
        },
      });

      expect(mockPrisma.dailyAccountabilityRecord.update).toHaveBeenCalledWith({
        where: { id: 'dr-1' },
        data: { initialDailyStatus: DailyRiskStatus.AMBER },
      });
    });

    it('populates continuationReason when EOD correction sets continuation to CONTINUE', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-2',
        dailyRecordId: 'dr-1',
        sequenceNo: 2,
        taskText: 'Perbaikan pipeline CI',
        outcome: null,
        outcomeReason: null,
        continuation: null,
        dailyRecord: { userId: 'usr-1' },
      });
      mockPrisma.correctionRequest.create.mockResolvedValue({
        id: 'cr-eod-cont',
        status: CorrectionStatus.AUTO_APPLIED,
      });

      await service.createCorrectionRequest('usr-1', {
        targetCommitmentId: 'com-2',
        scopeType: CorrectionScopeType.EOD_OUTCOME,
        classification: CorrectionClassification.MINOR,
        reason: 'Mencatat kelanjutan tugas karena sertifikat TLS kedaluwarsa.',
        requestedChange: {
          outcome: 'BLOCKED',
          outcomeReason: 'Menunggu pembaruan sertifikat TLS dari tim infra.',
          continuation: 'CONTINUE_TOMORROW',
        },
      });

      expect(mockPrisma.commitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'com-2' },
          data: expect.objectContaining({
            outcome: CommitmentOutcome.NOT_COMPLETED,
            continuation: 'CONTINUE',
            continuationReason: 'Menunggu pembaruan sertifikat TLS dari tim infra.',
          }),
        }),
      );
    });

    it('rejects duplicate submission when a PENDING correction already exists for the commitment (409)', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-1',
        sequenceNo: 1,
        taskText: 'Menyelesaikan endpoint autentikasi',
        referenceLink: null,
        initialRisk: CommitmentRisk.GREEN,
        dailyRecord: { userId: 'usr-1' },
      });
      mockPrisma.correctionRequest.findFirst.mockResolvedValueOnce({
        id: 'cr-pending-1',
        status: CorrectionStatus.PENDING,
      });

      await expect(
        service.createCorrectionRequest('usr-1', {
          targetCommitmentId: 'com-1',
          scopeType: CorrectionScopeType.MORNING_COMMITMENT,
          classification: CorrectionClassification.MATERIAL,
          reason: 'Mengubah komitmen kedua kalinya saat pengajuan pertama masih menunggu.',
          requestedChange: {
            taskText: 'Mengubah ruang lingkup tugas yang berbeda',
          },
        }),
      ).rejects.toMatchObject({ status: 409, code: 'RESOURCE_CONFLICT' });
    });

    it('rejects MORNING_COMMITMENT correction when no field actually changed or taskText < 3 chars (400)', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-1',
        sequenceNo: 1,
        taskText: 'Menyelesaikan endpoint autentikasi',
        referenceLink: 'https://github.com/dutamedia/pr/1',
        initialRisk: CommitmentRisk.GREEN,
        dailyRecord: { userId: 'usr-1' },
      });

      await expect(
        service.createCorrectionRequest('usr-1', {
          targetCommitmentId: 'com-1',
          scopeType: CorrectionScopeType.MORNING_COMMITMENT,
          classification: CorrectionClassification.MINOR,
          reason: 'Kirim ulang tanpa mengubah satu pun isian komitmen.',
          requestedChange: {
            taskText: 'Menyelesaikan endpoint autentikasi',
            referenceLink: 'https://github.com/dutamedia/pr/1',
            initialRisk: CommitmentRisk.GREEN,
          },
        }),
      ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

      await expect(
        service.createCorrectionRequest('usr-1', {
          targetCommitmentId: 'com-1',
          scopeType: CorrectionScopeType.MORNING_COMMITMENT,
          classification: CorrectionClassification.MINOR,
          reason: 'Mengisi teks tugas terlalu pendek hanya dua huruf.',
          requestedChange: {
            taskText: 'OK',
          },
        }),
      ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    });

    it('routes APPROVED and REJECTED notifications to /corrections/morning or /corrections/eod', async () => {
      mockPrisma.correctionRequest.findUnique
        .mockResolvedValueOnce({
          id: 'cr-morning-approve',
          scopeType: CorrectionScopeType.MORNING_COMMITMENT,
          targetCommitmentId: 'com-1',
          requestedByUserId: 'usr-1',
          reason: 'Ubah ruang lingkup komitmen',
          status: CorrectionStatus.PENDING,
          valueBefore: { taskText: 'Tugas Lama' },
          valueRequested: { taskText: 'Tugas Baru' },
          targetCommitment: { sequenceNo: 1, dailyRecordId: 'dr-1' },
        })
        .mockResolvedValueOnce({
          id: 'cr-eod-reject',
          scopeType: CorrectionScopeType.EOD_OUTCOME,
          targetCommitmentId: 'com-2',
          requestedByUserId: 'usr-1',
          reason: 'Ubah status EOD',
          status: CorrectionStatus.PENDING,
          valueBefore: { outcome: 'NOT_COMPLETED' },
          valueRequested: { outcome: 'DONE' },
          targetCommitment: { sequenceNo: 2, dailyRecordId: 'dr-1' },
        });
      mockPrisma.correctionRequest.update
        .mockResolvedValueOnce({ id: 'cr-morning-approve', status: CorrectionStatus.APPROVED })
        .mockResolvedValueOnce({ id: 'cr-eod-reject', status: CorrectionStatus.REJECTED });

      await service.reviewCorrectionRequest('mgr-1', 'cr-morning-approve', {
        decision: 'APPROVE',
        reviewNote: 'Disetujui sesuai perubahan ruang lingkup.',
      });
      await service.reviewCorrectionRequest('mgr-1', 'cr-eod-reject', {
        decision: 'REJECT',
        reviewNote: 'Bukti penggabungan kode belum dilampirkan.',
      });

      expect(mockPrisma.notification.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'CORRECTION_APPROVED',
            actionUrl: '/corrections/morning',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            triggerType: 'CORRECTION_REJECTED',
            actionUrl: '/corrections/eod',
          }),
        }),
      );
    });

    it('rejects EOD_OUTCOME correction when EOD has not been submitted yet (422)', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-no-eod',
        dailyRecordId: 'dr-1',
        sequenceNo: 1,
        taskText: 'Tugas pagi tanpa EOD',
        outcome: null,
        outcomeReason: null,
        continuation: null,
        dailyRecord: { userId: 'usr-1', eodSubmittedAt: null },
      });

      await expect(
        service.createCorrectionRequest('usr-1', {
          targetCommitmentId: 'com-no-eod',
          scopeType: CorrectionScopeType.EOD_OUTCOME,
          classification: CorrectionClassification.MATERIAL,
          reason: 'Mencoba mengisi hasil EOD padahal belum pernah submit EOD.',
          requestedChange: {
            outcome: 'DONE',
            continuation: 'ARCHIVE',
          },
        }),
      ).rejects.toMatchObject({ status: 422, code: 'VALIDATION_FAILED' });
    });

    it('rejects EOD_OUTCOME correction when outcome is invalid or no field actually changed (400)', async () => {
      mockPrisma.commitment.findUnique.mockResolvedValue({
        id: 'com-eod',
        dailyRecordId: 'dr-1',
        sequenceNo: 1,
        taskText: 'Integrasi halaman EOD',
        outcome: CommitmentOutcome.COMPLETED,
        outcomeReason: 'Sudah selesai dan diuji.',
        continuation: 'DO_NOT_CONTINUE',
        dailyRecord: { userId: 'usr-1', eodSubmittedAt: new Date('2026-11-22T10:00:00.000Z') },
      });

      await expect(
        service.createCorrectionRequest('usr-1', {
          targetCommitmentId: 'com-eod',
          scopeType: CorrectionScopeType.EOD_OUTCOME,
          classification: CorrectionClassification.MINOR,
          reason: 'Mencoba kirim nilai outcome tidak dikenal oleh sistem.',
          requestedChange: {
            outcome: 'UNKNOWN_STATUS',
          },
        }),
      ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

      await expect(
        service.createCorrectionRequest('usr-1', {
          targetCommitmentId: 'com-eod',
          scopeType: CorrectionScopeType.EOD_OUTCOME,
          classification: CorrectionClassification.MINOR,
          reason: 'Mengirim koreksi EOD tanpa mengubah satu pun data capaian.',
          requestedChange: {
            outcome: 'DONE',
            outcomeReason: 'Sudah selesai dan diuji.',
            continuation: 'ARCHIVE',
          },
        }),
      ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    });
  });
});
