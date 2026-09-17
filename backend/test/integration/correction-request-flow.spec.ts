/**
 * EPIC-22-T2: Integration Test — Skenario A (SAD §17.7)
 * Correction Request full lifecycle: Minor/Material/Rejected/Auto-apply
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CorrectionClassification,
  CorrectionStatus,
  DailyStatus,
  PolicyCategory,
  Role,
} from '@prisma/client';
import { CorrectionRequestService } from '../../src/modules/correction-request/services/correction-request.service.js';
import type { CurrentUserPayload } from '../../src/modules/auth/decorators/current-user.decorator.js';
import {
  ConflictException,
  ForbiddenException,
} from '../../src/modules/shared/exceptions/api.exception.js';

function createUser(userId: string, role: Role, overrides = {}): CurrentUserPayload {
  return {
    userId, role,
    email: `${userId}@dutamedia.com`,
    function: 'Engineering',
    directManagerId: null,
    sessionId: `sess-${userId}`,
    mustResetPassword: false,
    ...overrides,
  };
}

describe('EPIC-22-T2: Skenario A — Correction Request Lifecycle (SAD §17.7)', () => {
  let service: CorrectionRequestService;
  let prismaMock: any;
  let auditMock: any;
  let policyMock: any;
  let scopeFilterMock: any;
  let notificationMock: any;

  const employee = createUser('emp-alice', Role.Employee, { directManagerId: 'spv-bob' });
  const supervisor = createUser('spv-bob', Role.Supervisor_TL);

  const lockedCommitment = {
    id: 'comm-scenario-a',
    dailyRecordId: 'rec-scenario-a',
    text: 'Deploy fitur login ke staging',
    referenceLink: null,
    initialRisk: DailyStatus.GREEN,
    knownBlockerNote: null,
    supportNeeded: null,
    outcome: null,
    outcomeReason: null,
    continuation: null,
    continuationReason: null,
    isMorningLocked: true,
    isEodLocked: false,
    dailyRecord: { id: 'rec-scenario-a', employeeUserId: 'emp-alice' },
  };

  beforeEach(() => {
    prismaMock = {
      commitment: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
      dailyAccountabilityRecord: { update: vi.fn() },
      correctionRequest: {
        findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(),
        create: vi.fn(), update: vi.fn(), count: vi.fn(),
      },
      organizationalAssignment: { findFirst: vi.fn() },
      $queryRaw: vi.fn(),
      $transaction: vi.fn(async (cb) => typeof cb === 'function' ? cb(prismaMock) : Promise.all(cb)),
    };
    auditMock = { record: vi.fn().mockResolvedValue({ id: 'audit-1' }) };
    policyMock = {
      getActivePolicySnapshot: vi.fn().mockResolvedValue({
        [PolicyCategory.MinorMaterialThreshold]: { wordsChangedThreshold: 10 },
        [PolicyCategory.ObjectionWindowDuration]: { durationHours: 24 },
      }),
    };
    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['emp-alice']),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };
    notificationMock = { dispatch: vi.fn().mockResolvedValue([]) };
    service = new CorrectionRequestService(prismaMock, auditMock, policyMock, scopeFilterMock, notificationMock);
  });

  it('A-1 [MINOR PATH]: referenceLink change → Applied dalam transaksi, AuditLog(CORRECTION_APPLIED), notif #11 (SAD §17.7)', async () => {
    prismaMock.commitment.findUnique.mockResolvedValue(lockedCommitment);
    prismaMock.correctionRequest.findFirst.mockResolvedValue(null);
    prismaMock.correctionRequest.create.mockResolvedValue({
      id: 'cr-minor', classification: CorrectionClassification.Minor,
      status: CorrectionStatus.Applied,
      targetCommitment: lockedCommitment,
      requestedBy: { id: 'emp-alice', fullName: 'Alice', email: 'emp-alice@dutamedia.com' },
    });
    prismaMock.commitment.update.mockResolvedValue({ ...lockedCommitment, referenceLink: 'https://jira/DM-999' });

    const result = await service.createCorrectionRequest(employee, {
      targetCommitmentId: 'comm-scenario-a',
      requestedChange: { referenceLink: 'https://jira/DM-999' },
      reason: 'Perbaikan link tiket',
    });

    expect(result.status).toBe(CorrectionStatus.Applied);
    expect(result.classification).toBe(CorrectionClassification.Minor);
    expect(prismaMock.commitment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'comm-scenario-a' } }),
    );
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CORRECTION_APPLIED', actorUserId: 'emp-alice' }), prismaMock,
    );
    expect(notificationMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ triggerType: 'CORRECTION_APPLIED', recipientUserId: 'emp-alice' }),
    );
  });

  it('A-2 [MATERIAL PATH]: initialRisk change → Pending, objectionWindowEnd, notif #9 ke reviewer (SAD §17.7)', async () => {
    prismaMock.commitment.findUnique.mockResolvedValue(lockedCommitment);
    prismaMock.correctionRequest.findFirst.mockResolvedValue(null);
    prismaMock.organizationalAssignment.findFirst.mockResolvedValue({ directManagerId: 'spv-bob' });
    prismaMock.correctionRequest.create.mockResolvedValue({
      id: 'cr-material', classification: CorrectionClassification.Material,
      status: CorrectionStatus.Pending,
      objectionWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
      targetCommitment: lockedCommitment,
      requestedBy: { id: 'emp-alice', fullName: 'Alice', email: 'emp-alice@dutamedia.com' },
    });

    const result = await service.createCorrectionRequest(employee, {
      targetCommitmentId: 'comm-scenario-a',
      requestedChange: { initialRisk: DailyStatus.RED, knownBlockerNote: 'Server production down' },
      reason: 'Insiden server kritis',
    });

    expect(result.status).toBe(CorrectionStatus.Pending);
    expect(result.classification).toBe(CorrectionClassification.Material);
    expect(prismaMock.commitment.update).not.toHaveBeenCalled();
    expect(notificationMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ triggerType: 'CORRECTION_MATERIAL_REQUESTED', recipientUserId: 'spv-bob' }),
    );
  });

  it('A-3 [OBJECT PATH]: Reviewer menolak → Rejected, AuditLog(CORRECTION_REJECTED), notif ke employee (SAD §17.7)', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{
      id: 'cr-material', status: CorrectionStatus.Pending,
      requested_by_user_id: 'emp-alice',
      objection_window_end: new Date(Date.now() + 24 * 3600 * 1000),
    }]);
    prismaMock.correctionRequest.update.mockResolvedValue({
      id: 'cr-material', status: CorrectionStatus.Rejected,
      reviewedByUserId: 'spv-bob', objectionReason: 'Tidak valid',
    });

    const result = await service.objectCorrection(supervisor, 'cr-material', { objectionReason: 'Tidak valid' });

    expect(result.status).toBe(CorrectionStatus.Rejected);
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CORRECTION_REJECTED', actorUserId: 'spv-bob' }), prismaMock,
    );
    expect(notificationMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ triggerType: 'CORRECTION_REJECTED', recipientUserId: 'emp-alice' }),
    );
  });

  it('A-4 [AUTO-APPLY]: evaluateExpiredObjectionWindows() → Applied, AuditLog(CORRECTION_AUTO_APPLIED) oleh SYSTEM (SAD §17.7)', async () => {
    prismaMock.correctionRequest.findMany.mockResolvedValue([{ id: 'cr-expired' }]);
    prismaMock.$queryRaw.mockResolvedValue([{
      id: 'cr-expired', status: CorrectionStatus.Pending,
      target_commitment_id: 'comm-scenario-a',
      requested_change: { referenceLink: 'https://auto' },
      requested_by_user_id: 'emp-alice',
    }]);
    prismaMock.commitment.findUnique.mockResolvedValue({ id: 'comm-scenario-a', text: 'Old', dailyRecordId: 'rec-scenario-a' });
    prismaMock.commitment.update.mockResolvedValue({ id: 'comm-scenario-a', referenceLink: 'https://auto' });

    const result = await service.evaluateExpiredObjectionWindows();

    expect(result.processedCount).toBe(1);
    expect(prismaMock.correctionRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: CorrectionStatus.Applied }) }),
    );
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CORRECTION_AUTO_APPLIED' }), prismaMock,
    );
  });

  it('A-5 [DENY #8]: Reviewer object setelah auto-apply → 409 CONFLICT (SAD §19.4 #8)', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{
      id: 'cr-applied', status: CorrectionStatus.Applied,
      requested_by_user_id: 'emp-alice',
      objection_window_end: new Date(Date.now() + 24 * 3600 * 1000),
    }]);

    await expect(
      service.objectCorrection(supervisor, 'cr-applied', { objectionReason: 'Terlambat' }),
    ).rejects.toThrow(ConflictException);
  });

  it('A-6 [DENY #1]: Employee object pada pengajuannya sendiri → 403 FORBIDDEN (SAD §19.4 #1)', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{
      id: 'cr-self', status: CorrectionStatus.Pending,
      requested_by_user_id: 'emp-alice',
      objection_window_end: new Date(Date.now() + 24 * 3600 * 1000),
    }]);

    await expect(
      service.objectCorrection(employee, 'cr-self', { objectionReason: 'Diri sendiri' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
