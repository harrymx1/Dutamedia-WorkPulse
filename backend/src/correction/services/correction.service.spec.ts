import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CorrectionService } from './correction.service';
import {
  CommitmentOutcome,
  CommitmentRisk,
  CorrectionClassification,
  CorrectionScopeType,
  CorrectionStatus,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('CorrectionService (WP-EP09 / Correction Request State Machine - SAD 2.4)', () => {
  let service: CorrectionService;
  let mockPrisma: any;
  let mockClock: any;
  let mockPolicy: any;

  beforeEach(() => {
    mockPrisma = {
      commitment: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      correctionRequest: {
        create: vi.fn(),
        findUnique: vi.fn(),
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

    service = new CorrectionService(mockPrisma, mockClock, mockPolicy);
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
  });
});
