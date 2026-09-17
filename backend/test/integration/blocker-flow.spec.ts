/**
 * EPIC-22-T2: Integration Test — Skenario B (SAD §17.7)
 * Blocker full lifecycle: Create→Acknowledge→Resolve→Close + AutoEscalation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BlockerSeverity,
  BlockerStatus,
  NotificationChannel,
  OwnerNeededType,
  PolicyCategory,
  Role,
} from '@prisma/client';
import { BlockerService } from '../../src/modules/blocker/services/blocker.service.js';
import {
  ConflictException,
  ForbiddenException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('EPIC-22-T2: Skenario B — Blocker Lifecycle (SAD §17.7)', () => {
  let service: BlockerService;
  let prismaMock: any;
  let auditMock: any;
  let policyMock: any;
  let scopeFilterMock: any;
  let notificationMock: any;
  let blockerOwnerResolverMock: any;

  const reporterId = 'emp-reporter';
  const ownerId = 'mgr-owner';
  const headId = 'head-escalation';

  beforeEach(() => {
    prismaMock = {
      blocker: {
        create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn(),
      },
      supportContribution: { create: vi.fn() },
      auditLog: { findFirst: vi.fn() },
      $transaction: vi.fn(async (cb) => typeof cb === 'function' ? cb(prismaMock) : Promise.all(cb)),
    };
    auditMock = { record: vi.fn().mockResolvedValue({ id: 'audit-1' }) };
    policyMock = {
      getActivePolicySnapshot: vi.fn().mockResolvedValue({
        [PolicyCategory.EscalationThreshold]: { unacknowledgedThresholdHours: 2 },
      }),
    };
    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue([reporterId, ownerId]),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };
    notificationMock = { dispatch: vi.fn().mockResolvedValue([]) };
    blockerOwnerResolverMock = {
      resolveOwnerNeeded: vi.fn().mockResolvedValue({
        ownerNeededUserId: ownerId,
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        relatedScopeReference: null,
      }),
      resolveNextEscalationLevel: vi.fn().mockResolvedValue({
        targetUserId: headId,
        escalationLevel: 'NextLevelManager',
      }),
    };
    service = new BlockerService(
      prismaMock, auditMock, policyMock, scopeFilterMock, notificationMock, blockerOwnerResolverMock,
    );
  });

  it('B-1 [RAISE CRITICAL]: Create Critical Blocker → Open, notif Critical ke owner (SAD §17.7 langkah 1, §12.1 #4)', async () => {
    prismaMock.blocker.create.mockResolvedValue({
      id: 'blocker-b1',
      type: 'Database primary node down',
      severity: BlockerSeverity.Critical,
      status: BlockerStatus.Open,
      raisedByUserId: reporterId,
      ownerNeededUserId: ownerId,
      raisedBy: { fullName: 'Reporter' },
      ownerNeeded: { fullName: 'Owner' },
    });

    const result = await service.createBlocker(reporterId, {
      type: 'Database primary node down',
      severity: BlockerSeverity.Critical,
      impact: 'Seluruh layanan tidak bisa tulis ke database',
      ownerNeededType: OwnerNeededType.OrganizationalAuthority,
    });

    expect(result.id).toBe('blocker-b1');
    expect(result.status).toBe(BlockerStatus.Open);
    expect(notificationMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerType: 'BLOCKER_CRITICAL_RAISED',
        recipientUserId: ownerId,
        channels: expect.arrayContaining([NotificationChannel.Email]),
      }),
      expect.anything(),
    );
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BLOCKER_RAISED', actorUserId: reporterId }),
      expect.anything(),
    );
  });

  it('B-2 [ACKNOWLEDGE]: Owner acknowledge → Acknowledged, AuditLog(BLOCKER_ACKNOWLEDGED) (SAD §17.7 langkah 2)', async () => {
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Open, ownerNeededUserId: ownerId,
    });
    prismaMock.blocker.update.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Acknowledged,
      ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });

    const result = await service.acknowledge(ownerId, 'blocker-b1');

    expect(result.status).toBe(BlockerStatus.Acknowledged);
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BLOCKER_ACKNOWLEDGED' }), expect.anything(),
    );
  });

  it('B-3 [RESOLVE]: Owner resolve → Resolved, resolutionNote tersimpan, AuditLog(BLOCKER_RESOLVED) (SAD §17.7 langkah 3)', async () => {
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Acknowledged, ownerNeededUserId: ownerId,
    });
    prismaMock.blocker.update.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Resolved,
      resolutionNote: 'Failover ke replica berhasil', resolvedAt: new Date(),
      ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });

    const result = await service.resolve(ownerId, 'blocker-b1', {
      resolutionNote: 'Failover ke replica berhasil',
    });

    expect(result.status).toBe(BlockerStatus.Resolved);
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BLOCKER_RESOLVED' }), expect.anything(),
    );
  });

  it('B-4 [CLOSE]: Pelapor close → Closed, AuditLog(BLOCKER_CLOSED) (SAD §17.7 langkah 4)', async () => {
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Resolved,
      ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });
    prismaMock.blocker.update.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Closed,
      ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });

    const result = await service.close(reporterId, 'blocker-b1');

    expect(result.status).toBe(BlockerStatus.Closed);
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BLOCKER_CLOSED' }), expect.anything(),
    );
  });

  it('B-5 [AUTO-ESCALATE]: evaluateAutoEscalation → AuditLog(BLOCKER_AUTO_ESCALATED), notif ke level berikutnya (SAD §17.7 langkah 5, §9.9 #2)', async () => {
    const now = new Date();
    prismaMock.blocker.findMany.mockResolvedValue([{
      id: 'blocker-escalate', type: 'Cache server down', severity: BlockerSeverity.Critical,
      status: BlockerStatus.Open, acknowledgedAt: null, raisedByUserId: reporterId,
      ownerNeededUserId: ownerId, ownerNeededType: OwnerNeededType.OrganizationalAuthority,
      raisedBy: { fullName: 'Reporter' }, ownerNeeded: { fullName: 'Owner' },
    }]);
    prismaMock.auditLog.findFirst.mockResolvedValue(null); // Belum pernah dieskalasi
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-escalate', acknowledgedAt: null, status: BlockerStatus.Open,
    });

    const result = await service.evaluateAutoEscalation(now);

    expect(result.escalatedCount).toBe(1);
    expect(auditMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BLOCKER_AUTO_ESCALATED', actorUserId: 'SYSTEM' }),
      expect.anything(),
    );
    expect(notificationMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerType: 'BLOCKER_UNACKNOWLEDGED_THRESHOLD',
        recipientUserId: headId,
      }),
      expect.anything(),
    );
  });

  it('B-6 [DENY #7]: Owner mencoba resolve pada Blocker berstatus Closed → 409 CONFLICT (SAD §19.4 #7)', async () => {
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Closed, ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });

    await expect(
      service.resolve(ownerId, 'blocker-b1', { resolutionNote: 'Terlambat' }),
    ).rejects.toThrow(ConflictException);
  });

  it('B-7 [DENY]: Non-owner mencoba acknowledge → 403 FORBIDDEN (SAD §9.4)', async () => {
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Open,
      ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });

    await expect(service.acknowledge('intruder-user', 'blocker-b1')).rejects.toThrow(ForbiddenException);
  });

  it('B-8 [DENY]: Non-reporter mencoba close → 403 FORBIDDEN (SAD §9.4)', async () => {
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: 'blocker-b1', status: BlockerStatus.Resolved,
      ownerNeededUserId: ownerId, raisedByUserId: reporterId,
    });

    await expect(service.close(ownerId, 'blocker-b1')).rejects.toThrow(ForbiddenException);
  });
});
