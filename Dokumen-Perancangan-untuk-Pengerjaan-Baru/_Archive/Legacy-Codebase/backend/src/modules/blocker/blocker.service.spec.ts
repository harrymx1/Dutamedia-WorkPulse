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
import { SystemNotificationTrigger } from '../notification/constants/notification-trigger.constants.js';

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
      commitment: {
        findUnique: vi.fn(),
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
          triggerType: SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER,
          recipientUserId: 'manager-1',
          channels: expect.arrayContaining([
            NotificationChannel.WebNotificationCenter,
            NotificationChannel.Email,
          ]),
        }),
        expect.anything(),
      );
    });

    it('instant blocker: harus berhasil membuat blocker tanpa linkedCommitmentId dan tidak memeriksa commitment', async () => {
      prismaMock.blocker.create.mockResolvedValue({
        id: 'instant-blocker-1',
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.Medium,
        status: BlockerStatus.Open,
        raisedBy: { fullName: 'User 1' },
        ownerNeeded: { fullName: 'Manager 1' },
      });

      const dto = {
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.Medium,
        impact: 'WiFi kantor drop',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
      };

      const result = await service.createBlocker('user-1', dto);

      expect(result.id).toBe('instant-blocker-1');
      expect(prismaMock.commitment.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.blocker.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            raisedByUserId: 'user-1',
            linkedCommitmentId: null,
          }),
        }),
      );
    });

    it('contextual blocker (S2-FR-15-1): harus berhasil menautkan komitmen jika komitmen milik authenticated user', async () => {
      const commitmentId = 'commit-123';
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: commitmentId,
        dailyRecord: {
          employeeUserId: 'user-1',
        },
      });

      prismaMock.blocker.create.mockResolvedValue({
        id: 'contextual-blocker-1',
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.Medium,
        status: BlockerStatus.Open,
        linkedCommitmentId: commitmentId,
        raisedBy: { fullName: 'User 1' },
        ownerNeeded: { fullName: 'Manager 1' },
      });

      const dto = {
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.Medium,
        impact: 'Third party API staging down menghambat fitur auth',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        linkedCommitmentId: commitmentId,
      };

      const result = await service.createBlocker('user-1', dto);

      expect(result.id).toBe('contextual-blocker-1');
      expect(prismaMock.commitment.findUnique).toHaveBeenCalledWith({
        where: { id: commitmentId },
        select: {
          id: true,
          dailyRecord: {
            select: {
              employeeUserId: true,
            },
          },
        },
      });
      expect(prismaMock.blocker.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            raisedByUserId: 'user-1',
            linkedCommitmentId: commitmentId,
          }),
        }),
      );
    });

    it('security (S2-SEC-FR15-1): harus melempar ForbiddenException (403) jika mencoba menautkan komitmen milik pengguna lain (IDOR)', async () => {
      const victimCommitmentId = 'victim-commit-999';
      prismaMock.commitment.findUnique.mockResolvedValue({
        id: victimCommitmentId,
        dailyRecord: {
          employeeUserId: 'victim-user-id',
        },
      });

      const dto = {
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.Critical,
        impact: 'Percobaan menautkan komitmen orang lain',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        linkedCommitmentId: victimCommitmentId,
      };

      await expect(service.createBlocker('attacker-user-id', dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.blocker.create).not.toHaveBeenCalled();
    });

    it('validation (S2-FR-15-1): harus melempar NotFoundException (404) jika linkedCommitmentId tidak ditemukan', async () => {
      prismaMock.commitment.findUnique.mockResolvedValue(null);

      const dto = {
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.Medium,
        impact: 'Commitment tidak ada',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        linkedCommitmentId: 'non-existent-commit-id',
      };

      await expect(service.createBlocker('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.blocker.create).not.toHaveBeenCalled();
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

    it('findAll: harus memfilter query OR dengan accessibleUserIds dari ScopeFilterService (Pola 1)', async () => {
      scopeFilterMock.getAccessibleUserIds.mockResolvedValue(['user-1', 'user-2']);
      prismaMock.blocker.count.mockResolvedValue(1);
      prismaMock.blocker.findMany.mockResolvedValue([]);

      await service.findAll(
        { userId: 'user-1', role: Role.Supervisor_TL } as any,
        { page: 1, limit: 10 },
      );

      expect(prismaMock.blocker.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { raisedByUserId: { in: ['user-1', 'user-2'] } },
              { ownerNeededUserId: { in: ['user-1', 'user-2'] } },
            ],
          }),
        }),
      );
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

    it('updateProgress: harus ditolak (403) jika bukan owner yang memanggil', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.InProgress,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(
        service.updateProgress('intruder', blockerId, { progressNote: 'Update note' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('resolve: harus ditolak (403) jika bukan owner yang memanggil', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.InProgress,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(
        service.resolve('intruder', blockerId, { resolutionNote: 'Done' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('acceptRisk: harus ditolak (403) jika bukan owner yang memanggil', async () => {
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.InProgress,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(
        service.acceptRisk('intruder', blockerId, { resolutionNote: 'Risk accepted' }),
      ).rejects.toThrow(ForbiddenException);
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
          actorUserId: undefined,
        }),
        expect.anything(),
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType:
            SystemNotificationTrigger.BLOCKER_UNACKNOWLEDGED_ESCALATION,
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

  describe('T1 — Branch coverage tambahan lifecycle & DENY matrix (SAD §9.4, §19.4)', () => {
    const blockerId = 'blocker-deny-1';
    const ownerId = 'owner-deny';
    const reporterId = 'reporter-deny';

    it('close: ditolak dengan ConflictException jika status BUKAN Resolved/AcceptedRisk (SAD §9.4)', async () => {
      // Mencoba close blocker yang masih berstatus Open — harus gagal
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Open,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(service.close(reporterId, blockerId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('resolve: ditolak dengan ConflictException jika Blocker berstatus Closed (DENY #7, SAD §19.4)', async () => {
      // DENY Skenario #7: ownerNeededUserId mencoba resolve pada Blocker status Closed → 409
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: blockerId,
        status: BlockerStatus.Closed,
        ownerNeededUserId: ownerId,
        raisedByUserId: reporterId,
      });

      await expect(
        service.resolve(ownerId, blockerId, { resolutionNote: 'Terlambat' }),
      ).rejects.toThrow(ConflictException);
    });

    it('evaluateAutoEscalation: tidak dieskalasi jika acknowledgedAt sudah terisi (SAD §9.9 #2)', async () => {
      const now = new Date();
      prismaMock.blocker.findMany.mockResolvedValue([
        {
          id: 'blocker-already-acked',
          severity: BlockerSeverity.Critical,
          status: BlockerStatus.Open,
          acknowledgedAt: null, // Masuk kandidat saat findMany
        },
      ]);
      // Sudah tidak perlu eskalasi — belum ada AuditLog eskalasi
      prismaMock.auditLog.findFirst.mockResolvedValue(null);
      // Namun saat double-check findUnique, acknowledgedAt sudah ada (race: diack di antara findMany dan findUnique)
      prismaMock.blocker.findUnique.mockResolvedValue({
        id: 'blocker-already-acked',
        acknowledgedAt: new Date(now.getTime() - 1000), // Sudah diack
        status: BlockerStatus.Acknowledged,
      });

      const result = await service.evaluateAutoEscalation(now);

      // Meskipun masuk kandidat, tidak boleh dieskalasi karena sudah diack
      expect(result.escalatedCount).toBe(0);
    });
  });

  describe('S2-FR-15-1 & S2-SEC-FR15-1: Persistence & Read-Back Evidence', () => {
    it('membuktikan persistence nyata: contextual blocker menyimpan linkedCommitmentId dan findById berhasil membaca kembali relasi komitmen', async () => {
      // Stateful in-memory database simulation backing prisma operations
      const dbCommitments = new Map<string, any>();
      const dbBlockers = new Map<string, any>();

      // 1. Seed commitment ke dalam stateful store
      const targetCommitmentId = 'commitment-uuid-real-persist';
      dbCommitments.set(targetCommitmentId, {
        id: targetCommitmentId,
        text: 'Implementasi payment gateway & audit logging',
        dailyRecord: {
          employeeUserId: 'user-reporter-1',
        },
      });

      prismaMock.commitment.findUnique.mockImplementation(async ({ where }: any) => {
        return dbCommitments.get(where.id) || null;
      });

      // 2. Wire prismaMock.blocker.create untuk menyimpan record ke dbBlockers
      prismaMock.blocker.create.mockImplementation(async ({ data }: any) => {
        const id = 'blocker-uuid-persisted-' + Date.now();
        const record = {
          id,
          ...data,
          raisedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          raisedBy: { id: data.raisedByUserId, fullName: 'Alice Reporter', email: 'alice@example.com' },
          ownerNeeded: { id: data.ownerNeededUserId, fullName: 'Bob Owner', email: 'bob@example.com' },
          supportContributions: [],
        };
        dbBlockers.set(id, record);
        return record;
      });

      // 3. Wire prismaMock.blocker.findUnique untuk membaca record dari dbBlockers dan join relasi
      prismaMock.blocker.findUnique.mockImplementation(async ({ where, include }: any) => {
        const raw = dbBlockers.get(where.id);
        if (!raw) return null;

        const result = { ...raw };
        if (include?.linkedCommitment) {
          result.linkedCommitment = raw.linkedCommitmentId ? dbCommitments.get(raw.linkedCommitmentId) || null : null;
        }
        return result;
      });

      // 4. Eksekusi createBlocker kontekstual
      const created = await service.createBlocker('user-reporter-1', {
        type: 'Technical/Infrastructure',
        severity: BlockerSeverity.High,
        impact: 'Third party gateway staging error 500',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        linkedCommitmentId: targetCommitmentId,
        expectedResolution: 'Koordinasi dengan vendor gateway',
      });

      // Assert creation response
      expect(created.id).toBeDefined();
      expect(created.linkedCommitmentId).toBe(targetCommitmentId);

      // 5. Assert direct database store inspection (Evidence of true persistence)
      const persistedInDb = dbBlockers.get(created.id);
      expect(persistedInDb).toBeDefined();
      expect(persistedInDb.linkedCommitmentId).toBe(targetCommitmentId);
      expect(persistedInDb.raisedByUserId).toBe('user-reporter-1');

      // 6. Assert read-back via BlockerService.findById (Evidence of query include resolution)
      const fetched = await service.findById(
        { userId: 'user-reporter-1', role: Role.Employee } as any,
        created.id,
      );

      expect(fetched.id).toBe(created.id);
      expect(fetched.linkedCommitmentId).toBe(targetCommitmentId);
      expect(fetched.linkedCommitment).toBeTruthy();
      expect(fetched.linkedCommitment!.id).toBe(targetCommitmentId);
      expect(fetched.linkedCommitment!.text).toBe('Implementasi payment gateway & audit logging');
      expect(fetched.availableActions).toContain('support');
    });

    it('membuktikan persistence nyata: instant blocker tersimpan dengan linkedCommitmentId null dan findById membaca linkedCommitment null', async () => {
      const dbBlockers = new Map<string, any>();

      prismaMock.blocker.create.mockImplementation(async ({ data }: any) => {
        const id = 'instant-blocker-uuid-' + Date.now();
        const record = {
          id,
          ...data,
          raisedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          raisedBy: { id: data.raisedByUserId, fullName: 'Alice Reporter', email: 'alice@example.com' },
          ownerNeeded: { id: data.ownerNeededUserId, fullName: 'Bob Owner', email: 'bob@example.com' },
          supportContributions: [],
        };
        dbBlockers.set(id, record);
        return record;
      });

      prismaMock.blocker.findUnique.mockImplementation(async ({ where }: any) => {
        const raw = dbBlockers.get(where.id);
        if (!raw) return null;
        return {
          ...raw,
          linkedCommitment: null,
        };
      });

      const created = await service.createBlocker('user-reporter-1', {
        type: 'Operational/Incident',
        severity: BlockerSeverity.Low,
        impact: 'Koneksi printer kantor terputus',
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
      });

      expect(created.id).toBeDefined();
      expect(created.linkedCommitmentId).toBeNull();

      const persistedInDb = dbBlockers.get(created.id);
      expect(persistedInDb.linkedCommitmentId).toBeNull();

      const fetched = await service.findById(
        { userId: 'user-reporter-1', role: Role.Employee } as any,
        created.id,
      );
      expect(fetched.linkedCommitmentId).toBeNull();
      expect(fetched.linkedCommitment).toBeNull();
    });
  });
});
