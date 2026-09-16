import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BlockerSeverity,
  BlockerStatus,
  NotificationChannel,
  OwnerNeededType,
  PolicyCategory,
  Role,
} from '@prisma/client';
import { BlockerService } from './services/blocker.service.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';

describe('BlockerService (EPIC-08)', () => {
  let service: BlockerService;
  let prismaMock: any;
  let auditMock: any;
  let policyMock: any;
  let scopeFilterMock: any;
  let notificationMock: any;
  let blockerOwnerResolverMock: any;

  beforeEach(() => {
    prismaMock = {
      blocker: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      supportContribution: {
        create: vi.fn(),
      },
      auditLog: {
        findFirst: vi.fn(),
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
        [PolicyCategory.EscalationThreshold]: {
          unacknowledgedThresholdHours: 2,
        },
      }),
    };

    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['user-1', 'manager-1']),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };

    notificationMock = {
      dispatch: vi.fn().mockResolvedValue([]),
    };

    blockerOwnerResolverMock = {
      resolveOwnerNeeded: vi.fn().mockResolvedValue({
        ownerNeededUserId: 'manager-1',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        relatedScopeReference: null,
      }),
      resolveNextEscalationLevel: vi.fn().mockResolvedValue({
        targetUserId: 'head-1',
        escalationLevel: 'NextLevelManager',
      }),
    };

    service = new BlockerService(
      prismaMock,
      auditMock,
      policyMock,
      scopeFilterMock,
      notificationMock,
      blockerOwnerResolverMock,
    );
  });

  describe('computeAvailableActions (SAD §7.12, §9.4)', () => {
    it('harus mengembalikan acknowledge untuk owner saat status Open', () => {
      const blocker = {
        status: BlockerStatus.Open,
        ownerNeededUserId: 'owner-1',
        raisedByUserId: 'reporter-1',
      };

      const ownerActions = service.computeAvailableActions(blocker, 'owner-1');
      expect(ownerActions).toContain('acknowledge');
      expect(ownerActions).toContain('support');

      const reporterActions = service.computeAvailableActions(blocker, 'reporter-1');
      expect(reporterActions).not.toContain('acknowledge');
      expect(reporterActions).toContain('support');
    });

    it('harus mengembalikan update, resolve, accept_risk untuk owner saat status Acknowledged / InProgress', () => {
      const blocker = {
        status: BlockerStatus.Acknowledged,
        ownerNeededUserId: 'owner-1',
        raisedByUserId: 'reporter-1',
      };

      const actions = service.computeAvailableActions(blocker, 'owner-1');
      expect(actions).toContain('update');
      expect(actions).toContain('resolve');
      expect(actions).toContain('accept_risk');
      expect(actions).toContain('support');
    });

    it('harus mengembalikan close untuk pelapor saat status Resolved / AcceptedRisk', () => {
      const blocker = {
        status: BlockerStatus.Resolved,
        ownerNeededUserId: 'owner-1',
        raisedByUserId: 'reporter-1',
      };

      const reporterActions = service.computeAvailableActions(blocker, 'reporter-1');
      expect(reporterActions).toContain('close');

      const ownerActions = service.computeAvailableActions(blocker, 'owner-1');
      expect(ownerActions).not.toContain('close');
    });
  });

  describe('EPIC-08-T1: createBlocker', () => {
    it('harus berhasil membuat blocker dan memicu notifikasi jika Critical (SAD §12.1 trigger #4)', async () => {
      prismaMock.blocker.create.mockResolvedValue({
        id: 'blocker-1',
        type: 'Database connection failure',
        severity: BlockerSeverity.Critical,
        status: BlockerStatus.Open,
        raisedBy: { fullName: 'Alice' },
        ownerNeeded: { fullName: 'Bob' },
      });

      const dto = {
        type: 'Database connection failure',
        severity: BlockerSeverity.Critical,
        impact: 'Seluruh sistem tidak dapat diakses',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
      };

      const result = await service.createBlocker('user-1', dto);

      expect(result.id).toBe('blocker-1');
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BLOCKER_RAISED',
          relatedEntityType: 'Blocker',
        }),
        expect.anything(),
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'BLOCKER_CRITICAL_RAISED',
          recipientUserId: 'manager-1',
          channels: expect.arrayContaining([
            NotificationChannel.WebNotificationCenter,
            NotificationChannel.Email,
          ]),
        }),
        expect.anything(),
      );
    });
  });

  describe('EPIC-08-T2: Scope Filtering & 404', () => {
    it('harus melempar NotFoundException (404) jika blocker berada di luar scope user (SAD §7.7)', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: 'blocker-other',
        raisedByUserId: 'other-user',
        ownerNeededUserId: 'other-manager',
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(false);

      await expect(
        service.findById(
          { userId: 'user-1', role: Role.Employee } as any,
          'blocker-other',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('EPIC-08-T3: Blocker Lifecycle State Machine (SAD §9.4)', () => {
    const blockerId = 'blocker-1';
    const ownerId = 'owner-1';
    const reporterId = 'reporter-1';

    it('acknowledge: harus ditolak jika bukan owner yang memanggil', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Open,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(service.acknowledge('intruder', blockerId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('acknowledge: harus ditolak jika status bukan Open', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Acknowledged,
        ownerNeededUserId: ownerId,
      });

      await expect(service.acknowledge(ownerId, blockerId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('acknowledge: berhasil mengubah status menjadi Acknowledged dan mencatat AuditLog', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Open,
        ownerNeededUserId: ownerId,
      });
      prismaMock.blocker.update.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Acknowledged,
      });

      const result = await service.acknowledge(ownerId, blockerId);

      expect(result.status).toBe(BlockerStatus.Acknowledged);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BLOCKER_ACKNOWLEDGED',
        }),
        expect.anything(),
      );
    });

    it('resolve: berhasil mengubah status menjadi Resolved dan menyimpan resolutionNote', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Acknowledged,
        ownerNeededUserId: ownerId,
      });
      prismaMock.blocker.update.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Resolved,
        resolutionNote: 'Koneksi database telah diperbaiki',
      });

      const result = await service.resolve(ownerId, blockerId, {
        resolutionNote: 'Koneksi database telah diperbaiki',
      });

      expect(result.status).toBe(BlockerStatus.Resolved);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BLOCKER_RESOLVED',
        }),
        expect.anything(),
      );
    });

    it('acceptRisk: berhasil mengubah status menjadi AcceptedRisk', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.InProgress,
        ownerNeededUserId: ownerId,
      });
      prismaMock.blocker.update.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.AcceptedRisk,
      });

      const result = await service.acceptRisk(ownerId, blockerId, {
        resolutionNote: 'Risiko diterima sementara hingga versi berikutnya rilis',
      });

      expect(result.status).toBe(BlockerStatus.AcceptedRisk);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BLOCKER_RISK_ACCEPTED',
        }),
        expect.anything(),
      );
    });

    it('close: ditolak jika bukan pelapor (raisedByUserId) yang menutup (SAD §9.4)', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Resolved,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(service.close(ownerId, blockerId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('close: berhasil menutup blocker jika dipanggil oleh pelapor', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Resolved,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });
      prismaMock.blocker.update.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Closed,
      });

      const result = await service.close(reporterId, blockerId);

      expect(result.status).toBe(BlockerStatus.Closed);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BLOCKER_CLOSED',
        }),
        expect.anything(),
      );
    });
  });

  describe('EPIC-08-T4: addSupportContribution', () => {
    it('harus menambahkan kontribusi dukungan tanpa mengubah status blocker (SAD §10.4)', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: 'blocker-1',
        status: BlockerStatus.Open,
      });
      prismaMock.supportContribution.create.mockResolvedValue({
        id: 'contrib-1',
        blockerId: 'blocker-1',
        action: 'Menyediakan endpoint mock API sementara',
        resultNote: 'Tim developer dapat melanjutkan coding UI',
      });

      const result = await service.addSupportContribution('supporter-1', 'blocker-1', {
        action: 'Menyediakan endpoint mock API sementara',
        resultNote: 'Tim developer dapat melanjutkan coding UI',
      });

      expect(result.id).toBe('contrib-1');
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'SUPPORT_CONTRIBUTION_ADDED',
        }),
        expect.anything(),
      );
    });
  });

  describe('EPIC-08-T5: evaluateAutoEscalation (Open Item A4 & SAD §9.4, §9.9 #2)', () => {
    it('harus mendeteksi blocker Critical unacknowledged melebihi threshold dan memicu eskalasi idempotent', async () => {
      const now = new Date();
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'critical-blocker-1',
          type: 'Server down',
          severity: BlockerSeverity.Critical,
          status: BlockerStatus.Open,
          acknowledgedAt: null,
          raisedBy: { fullName: 'Reporter Alice' },
          ownerNeeded: { fullName: 'Owner Bob' },
          ownerNeededType: OwnerNeededType.OrganizationalAuthority,
          ownerNeededUserId: 'manager-1',
          raisedByUserId: 'user-1',
        },
      ]);
      // Belum pernah dieskalasi sebelumnya
      prismaMock.auditLog.findFirst.mockResolvedValue(null);
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: 'critical-blocker-1',
        acknowledgedAt: null,
        status: BlockerStatus.Open,
      });

      const result = await service.evaluateAutoEscalation(now);

      expect(result.candidatesCount).toBe(1);
      expect(result.escalatedCount).toBe(1);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'BLOCKER_AUTO_ESCALATED',
          actorUserId: 'SYSTEM',
        }),
        expect.anything(),
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'BLOCKER_UNACKNOWLEDGED_THRESHOLD',
          recipientUserId: 'head-1',
        }),
        expect.anything(),
      );
    });

    it('harus melewati eskalasi jika sudah pernah di-auto-escalate (idempotency check)', async () => {
      const now = new Date();
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'critical-blocker-1',
          severity: BlockerSeverity.Critical,
          status: BlockerStatus.Open,
        },
      ]);
      // Sudah pernah dieskalasi!
      prismaMock.auditLog.findFirst.mockResolvedValue({
        id: 'audit-esc-1',
        action: 'BLOCKER_AUTO_ESCALATED',
      });

      const result = await service.evaluateAutoEscalation(now);

      expect(result.escalatedCount).toBe(0);
    });
  });
});
