import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlockerService } from './blocker.service';
import {
  AuthorityContext,
  BlockerImpact,
  BlockerSeverity,
  BlockerStatus,
  BlockerType,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('BlockerService (WP-EP05 / Blocker Lifecycle & Auto-Escalation SLA)', () => {
  let service: BlockerService;
  let mockPrisma: any;
  let mockClock: any;
  let mockPolicy: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'owner-1', fullName: 'Budi Lead' }),
      },
      blockerTicket: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
      notification: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T09:00:00.000Z')),
    };

    mockPolicy = {
      getActivePolicy: vi.fn().mockResolvedValue({
        configurationValues: {
          level1Hours: 4,
          level2Hours: 8,
        },
      }),
    };

    service = new BlockerService(mockPrisma, mockClock, mockPolicy);
  });

  describe('raiseBlocker', () => {
    it('requires projectCodeReference when ownerNeededType is PROJECT_AUTHORITY (DEC-002)', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        description: 'Server database staging mengalami latency tinggi',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        assignedOwnerId: 'owner-1',
        // projectCodeReference missing
      };

      await expect(service.raiseBlocker('usr-1', dto as any)).rejects.toThrowError(AppException);
    });

    it('creates blocker ticket and notifies assigned owner with 4-hour SLA target', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.HIGH,
        impact: BlockerImpact.TASK,
        description: 'Server database staging mengalami latency tinggi',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        assignedOwnerId: 'owner-1',
        projectCodeReference: 'PRJ-PORTAL',
      };

      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.OPEN,
        ...dto,
      });

      const result = await service.raiseBlocker('usr-1', dto as any);

      expect(mockPrisma.blockerTicket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            raisedByUserId: 'usr-1',
            status: BlockerStatus.OPEN,
            assignedOwnerId: 'owner-1',
            projectCodeReference: 'PRJ-PORTAL',
          }),
        }),
      );

      // Verifikasi notifikasi dikirimkan
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'owner-1',
            triggerType: 'BLOCKER_RAISED',
          }),
        }),
      );

      expect(result.id).toBe('blk-1');
    });

    it('sends immediate parallel escalation notification to next authority when severity is CRITICAL', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.CRITICAL,
        impact: BlockerImpact.PRODUCTION,
        description: 'Database produksi tidak dapat diakses oleh seluruh layanan',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
        assignedOwnerId: 'sup-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'sup-1', fullName: 'Bambang Supervisor' });
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'sup-1',
          role: 'SUPERVISOR',
          directManagerId: 'head-1',
        }),
      };
      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-crit-1',
        status: BlockerStatus.OPEN,
        ...dto,
      });

      await service.raiseBlocker('usr-1', dto as any);

      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'head-1',
            triggerType: 'BLOCKER_CRITICAL_ESCALATION',
          }),
        }),
      );
    });

    it('routes suggested owner to next manager up the chain when direct manager is on APPROVED leave', async () => {
      mockPrisma.organizationalAssignment = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            userId: 'emp-1',
            function: 'EngineeringProduct',
            directManagerId: 'sup-on-leave',
          })
          .mockResolvedValueOnce({
            userId: 'sup-on-leave',
            function: 'EngineeringProduct',
            directManagerId: 'head-active',
          }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-1', userId: 'sup-on-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'head-active',
        fullName: 'Arif Budiman',
        orgAssignments: [{ jobTitle: 'Head of Engineering' }],
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'TECHNICAL',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('head-active');
      expect(suggestion.reason).toBe('DIRECT_MANAGER');
      expect(suggestion.routingNote).toContain('cuti resmi');
    });

    it('prioritizes active Temporary Reviewer assigned by System Admin for reporter division', async () => {
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'emp-1',
          role: 'EMPLOYEE',
          function: 'Engineering',
          directManagerId: 'head-1',
        }),
      };
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'tmp-1',
            targetFunction: 'Engineering',
            delegateUserId: 'temp-rev-1',
            createdByUserId: 'admin-1',
          },
        ]),
      };
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.user.findFirst = vi.fn().mockImplementation((args: any) => {
        if (args?.select?.orgAssignments) {
          return Promise.resolve({
            id: 'temp-rev-1',
            fullName: 'Bambang Pratama',
            orgAssignments: [{ jobTitle: 'Technical Lead 1' }],
          });
        }
        return Promise.resolve({ id: 'temp-rev-1' });
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'TECHNICAL',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('temp-rev-1');
      expect(suggestion.routingNote).toContain('Reviewer Sementara');
    });

    it('does NOT route HEAD downward to division Temporary Reviewer; routes upward to CEO instead', async () => {
      mockPrisma.organizationalAssignment = {
        findFirst: vi.fn().mockResolvedValue({
          userId: 'head-1',
          role: 'HEAD',
          function: 'Engineering',
          directManagerId: 'ceo-1',
        }),
      };
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([
          { id: 'tmp-1', targetFunction: 'Engineering', delegateUserId: 'staff-temp-1' },
        ]),
      };
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'ceo-1',
        fullName: 'Hendra Wijaya',
        orgAssignments: [{ jobTitle: 'CEO' }],
      });

      const suggestion = await service.resolveSuggestedOwner('head-1', {
        type: 'TECHNICAL',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('ceo-1');
      expect(mockPrisma.temporaryReviewerAssignment.findMany).not.toHaveBeenCalled();
    });

    it('does NOT route downward to division SUPERVISOR when INFRA division HEAD is on APPROVED leave without Temporary Reviewer; escalates upward to CEO instead (DEC-014)', async () => {
      mockPrisma.organizationalAssignment = {
        findMany: vi.fn().mockResolvedValue([
          { userId: 'ops-head-leave', role: 'HEAD', directManagerId: 'ceo-1' },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          userId: 'ops-head-leave',
          role: 'HEAD',
          function: 'OperationsInfrastructure',
          directManagerId: 'ceo-1',
        }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-ops', userId: 'ops-head-leave', status: 'APPROVED' })
          .mockResolvedValueOnce({ id: 'lv-ops', userId: 'ops-head-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'ceo-1',
        fullName: 'Hendra Wijaya',
        orgAssignments: [{ jobTitle: 'Chief Executive Officer' }],
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'INFRA',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('ceo-1');
      expect(suggestion.owner?.fullName).toBe('Hendra Wijaya');
      expect(suggestion.reason).toBe('DIVISION_HEAD');
      expect(suggestion.routingNote).toContain('atasan struktural di atasnya');
    });

    it('routes INFRA blocker to division SUPERVISOR ONLY when explicitly mandated as active Temporary Reviewer (DEC-014)', async () => {
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'tmp-ops-1',
            targetFunction: 'OperationsInfrastructure',
            delegateUserId: 'ops-sup-delegate',
            createdByUserId: 'admin-1',
          },
        ]),
      };
      mockPrisma.leaveRequest = { findFirst: vi.fn().mockResolvedValue(null) };
      mockPrisma.user.findFirst = vi.fn().mockImplementation((args: any) => {
        if (args?.select?.orgAssignments) {
          return Promise.resolve({
            id: 'ops-sup-delegate',
            fullName: 'Rian Kurniawan',
            orgAssignments: [{ jobTitle: 'Operations Supervisor' }],
          });
        }
        return Promise.resolve({ id: 'ops-sup-delegate' });
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'INFRA',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
      });

      expect(suggestion.owner?.id).toBe('ops-sup-delegate');
      expect(suggestion.owner?.fullName).toBe('Rian Kurniawan');
      expect(suggestion.reason).toBe('DIVISION_HEAD');
      expect(suggestion.routingNote).toContain('Reviewer Sementara aktif');
    });

    it('bypasses on-leave PROJECT_AUTHORITY project manager to available escalation reviewer', async () => {
      mockPrisma.projectAuthorityMapping = {
        findFirst: vi.fn().mockResolvedValue({
          projectCode: 'PRJ-PORTAL',
          projectManagerId: 'pm-on-leave',
          escalationReviewerId: 'head-delivery',
          involvedFunction: 'Delivery',
        }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-pm', userId: 'pm-on-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue({
        id: 'head-delivery',
        fullName: 'Dharma Putra',
        orgAssignments: [{ jobTitle: 'Head of Delivery' }],
      });

      const suggestion = await service.resolveSuggestedOwner('emp-1', {
        type: 'REQUIREMENT',
        ownerNeededType: AuthorityContext.PROJECT_AUTHORITY,
        projectCode: 'PRJ-PORTAL',
      });

      expect(suggestion.owner?.id).toBe('head-delivery');
      expect(suggestion.reason).toBe('PROJECT_LEAD');
      expect(suggestion.routingNote).toBeTruthy();
    });

    it('skips on-leave immediate manager during CRITICAL parallel escalation and notifies CEO directly', async () => {
      const dto = {
        type: BlockerType.TECHNICAL,
        severity: BlockerSeverity.CRITICAL,
        impact: BlockerImpact.PRODUCTION,
        description: 'Database produksi mengalami deadlock masif',
        ownerNeededType: AuthorityContext.ORGANIZATIONAL_AUTHORITY,
        assignedOwnerId: 'temp-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'temp-1', fullName: 'Bambang Pratama' });
      mockPrisma.organizationalAssignment = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            userId: 'temp-1',
            role: 'SUPERVISOR',
            function: 'Engineering',
            directManagerId: 'head-on-leave',
          })
          .mockResolvedValueOnce({
            userId: 'head-on-leave',
            role: 'HEAD',
            function: 'Engineering',
            directManagerId: 'ceo-1',
          }),
      };
      mockPrisma.leaveRequest = {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'lv-head', userId: 'head-on-leave', status: 'APPROVED' })
          .mockResolvedValueOnce(null),
      };
      mockPrisma.blockerTicket.create.mockResolvedValue({
        id: 'blk-crit-2',
        status: BlockerStatus.OPEN,
        ...dto,
      });

      await service.raiseBlocker('emp-1', dto as any);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'ceo-1',
            triggerType: 'BLOCKER_CRITICAL_ESCALATION',
          }),
        }),
      );
    });
  });

  describe('acknowledge and resolve', () => {
    it('acknowledges blocker ticket', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.OPEN });
      mockPrisma.blockerTicket.update.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.ACKNOWLEDGED });

      const res = await service.acknowledgeBlocker('owner-1', 'blk-1');
      expect(res.status).toBe(BlockerStatus.ACKNOWLEDGED);
    });

    it('resolves blocker ticket with mandatory resolution note', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-1',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Gateway 504] Timeout dari staging',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-res-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.RESOLVED });

      const res = await service.resolveBlocker('owner-1', 'blk-1', {
        resolutionNote: 'Kapasitas instance diperbesar dan indeks telah ditambahkan',
      });
      expect(res.status).toBe(BlockerStatus.RESOLVED);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-1',
            supporterUserId: 'owner-1',
            actionTaken: 'Solusi Diberikan oleh Penanggung Jawab',
            resultNote: 'Kapasitas instance diperbesar dan indeks telah ditambahkan',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_RESOLVED_AWAITING_CONFIRMATION',
            actionUrl: '/raise-blockers?tab=mine',
          }),
        }),
      );
    });

    it('rejects resolve when ticket is already CLOSED', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-closed',
        status: BlockerStatus.CLOSED,
        assignedOwnerId: 'owner-1',
      });

      await expect(
        service.resolveBlocker('owner-1', 'blk-closed', {
          resolutionNote: 'Catatan resolusi tambahan setelah ditutup',
        }),
      ).rejects.toThrow();
    });

    it('accepts risk with mandatory justification and mitigation plan', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-risk',
        status: BlockerStatus.ACKNOWLEDGED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Vendor API Terbatas] Quota API pihak ketiga habis',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-risk-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-risk',
        status: BlockerStatus.ACCEPTED_RISK,
      });

      const res = await service.acceptRiskBlocker('owner-1', 'blk-risk', {
        riskAcceptanceJustification: 'Penambahan kuota vendor membutuhkan persetujuan kuartal depan',
        riskMitigationPlan: 'Gunakan data cache harian dan batasi sinkronisasi ke jam malam',
      });

      expect(res.status).toBe(BlockerStatus.ACCEPTED_RISK);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-risk',
            supporterUserId: 'owner-1',
            actionTaken: '[PIC_ACCEPTED_RISK] Penambahan kuota vendor membutuhkan persetujuan kuartal depan',
            resultNote: 'Gunakan data cache harian dan batasi sinkronisasi ke jam malam',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'emp-1',
            triggerType: 'BLOCKER_ACCEPTED_RISK_AWAITING_CONFIRMATION',
            actionUrl: '/raise-blockers?tab=mine',
          }),
        }),
      );
    });

    it('allows only original reporter to close RESOLVED/ACCEPTED_RISK ticket permanently', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-res',
        status: BlockerStatus.RESOLVED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Gateway 504] Timeout',
      });

      await expect(service.closeBlocker('owner-1', 'blk-res')).rejects.toThrow();

      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-close-1' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-res',
        status: BlockerStatus.CLOSED,
      });

      const closed = await service.closeBlocker('emp-1', 'blk-res');
      expect(closed.status).toBe(BlockerStatus.CLOSED);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-res',
            supporterUserId: 'emp-1',
            actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'owner-1',
            triggerType: 'BLOCKER_CLOSED_BY_REPORTER',
          }),
        }),
      );
    });

    it('reopens RESOLVED ticket back to ACKNOWLEDGED and logs reopen reason', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({
        id: 'blk-reopen',
        status: BlockerStatus.RESOLVED,
        raisedByUserId: 'emp-1',
        assignedOwnerId: 'owner-1',
        description: '[Gateway 504] Timeout',
      });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({ id: 'sup-reopen' }),
      };
      mockPrisma.blockerTicket.update.mockResolvedValue({
        id: 'blk-reopen',
        status: BlockerStatus.ACKNOWLEDGED,
      });

      const reopened = await service.reopenBlocker('emp-1', 'blk-reopen', {
        reopenReason: 'Staging masih mengembalikan HTTP 504 saat load test',
      });

      expect(reopened.status).toBe(BlockerStatus.ACKNOWLEDGED);
      expect(mockPrisma.supportContribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            blockerId: 'blk-reopen',
            supporterUserId: 'emp-1',
            resultNote: 'Staging masih mengembalikan HTTP 504 saat load test',
          }),
        }),
      );
    });
  });

  describe('supportContribution and escalationAging (Prototipe 09 & 14)', () => {
    it('records peer support contribution on a blocker ticket', async () => {
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.OPEN });
      mockPrisma.supportContribution = {
        create: vi.fn().mockResolvedValue({
          id: 'sup-1',
          blockerId: 'blk-1',
          supporterUserId: 'usr-2',
          actionTaken: 'Membantu migrasi koneksi pool',
          resultNote: 'Latency turun normal < 50ms',
        }),
      };

      const res = await service.addSupportContribution(
        'usr-2',
        'blk-1',
        'Membantu migrasi koneksi pool',
        'Latency turun normal < 50ms',
      );
      expect(res.id).toBe('sup-1');
      expect(mockPrisma.supportContribution.create).toHaveBeenCalled();
    });

    it('calculates escalation aging radar metrics and breach status correctly', async () => {
      const now = new Date('2026-10-28T14:00:00.000Z');
      mockClock.now.mockReturnValue(now);

      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-breached',
          description: 'Sertifikat SSL expired',
          type: BlockerType.INFRA,
          severity: BlockerSeverity.CRITICAL,
          impact: BlockerImpact.PRODUCTION,
          status: BlockerStatus.OPEN,
          raisedAt: new Date('2026-10-28T08:00:00.000Z'),
          targetResolutionAt: new Date('2026-10-28T12:00:00.000Z'), // Passed 2 hours ago -> Breached!
          raisedBy: { id: 'u1', fullName: 'Alice' },
          assignedOwner: { id: 'u2', fullName: 'Bob Lead' },
          projectCodeReference: 'PRJ-CORE',
        },
        {
          id: 'blk-ontime',
          description: 'Menunggu review PR',
          type: BlockerType.APPROVAL,
          severity: BlockerSeverity.HIGH,
          impact: BlockerImpact.TASK,
          status: BlockerStatus.ACKNOWLEDGED,
          raisedAt: new Date('2026-10-28T12:00:00.000Z'),
          targetResolutionAt: new Date('2026-10-28T16:00:00.000Z'), // Still 2 hours left
          raisedBy: { id: 'u3', fullName: 'Charlie' },
          assignedOwner: { id: 'u2', fullName: 'Bob Lead' },
          projectCodeReference: null,
        },
      ]);

      const metrics = await service.getEscalationAgingMetrics();
      expect(metrics.summary.totalOpen).toBe(2);
      expect(metrics.summary.breachedCount).toBe(1);
      expect(metrics.summary.criticalCount).toBe(1);
      expect(metrics.summary.slaComplianceRate).toBe(50);
      expect(metrics.blockers[0].isBreached).toBe(true);
      expect(metrics.blockers[1].isBreached).toBe(false);
    });

    it('orders blocker queue by newest raisedAt descending and tags entryType on contributions', async () => {
      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-q1',
          supportContributions: [
            {
              id: 'sc-peer',
              actionTaken: 'Cek routing subnet',
              resultNote: 'Ditemukan failover terputus',
              createdAt: new Date('2026-11-13T08:00:00.000Z'),
            },
            {
              id: 'sc-reopen',
              actionTaken: 'Dikembalikan oleh Pelapor (Belum Memadai)',
              resultNote: 'Endpoint /secrets/staging masih merespons 403.',
              createdAt: new Date('2026-11-13T09:00:00.000Z'),
            },
          ],
        },
      ]);

      const queue = await service.getBlockerQueue({ raisedByUserId: 'emp-1' });

      expect(mockPrisma.blockerTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { raisedByUserId: 'emp-1' },
          orderBy: [{ raisedAt: 'desc' }, { id: 'desc' }],
        }),
      );
      expect(queue[0].supportContributions.map((s: any) => s.entryType)).toEqual([
        'PEER_SUPPORT',
        'REPORTER_REOPEN',
      ]);
    });

    it('synthesizes missing PIC resolution, accepted risk, and reporter closure entries chronologically for legacy tickets without duplicating recorded events', async () => {
      mockPrisma.blockerTicket.findMany.mockResolvedValue([
        {
          id: 'blk-legacy-closed',
          status: BlockerStatus.CLOSED,
          raisedAt: new Date('2026-11-13T09:18:00.000Z'),
          resolvedAt: new Date('2026-11-13T09:55:00.000Z'),
          closedAt: new Date('2026-11-13T09:57:00.000Z'),
          resolutionNote: 'Permission role staging-reader telah ditambahkan ke IAM policy dev.frontend.',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
          assignedOwner: { id: 'head-1', fullName: 'Arif Budiman', email: 'arif@dutamedia.com' },
          supportContributions: [
            {
              id: 'sc-reopen',
              supporter: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              actionTaken: 'Dikembalikan oleh Pelapor (Belum Memadai)',
              resultNote: 'Endpoint /secrets/staging masih merespons 403.',
              createdAt: new Date('2026-11-13T09:37:00.000Z'),
            },
          ],
        },
        {
          id: 'blk-recorded-all',
          status: BlockerStatus.CLOSED,
          raisedAt: new Date('2026-11-14T08:00:00.000Z'),
          resolvedAt: new Date('2026-11-14T09:00:00.000Z'),
          closedAt: new Date('2026-11-14T09:15:00.000Z'),
          riskAcceptanceJustification: 'Menunggu approval vendor',
          riskMitigationPlan: 'Pakai backup cache',
          raisedBy: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
          assignedOwner: { id: 'head-1', fullName: 'Arif Budiman', email: 'arif@dutamedia.com' },
          supportContributions: [
            {
              id: 'sc-risk',
              supporter: { id: 'head-1', fullName: 'Arif Budiman', email: 'arif@dutamedia.com' },
              actionTaken: '[PIC_ACCEPTED_RISK] Menunggu approval vendor',
              resultNote: 'Pakai backup cache',
              createdAt: new Date('2026-11-14T09:00:00.000Z'),
            },
            {
              id: 'sc-close',
              supporter: { id: 'emp-1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
              resultNote: 'Pelapor telah mengonfirmasi penyelesaian dan menutup tiket kendala secara permanen.',
              createdAt: new Date('2026-11-14T09:15:00.000Z'),
            },
          ],
        },
      ]);

      const queue = await service.getBlockerQueue();
      expect(queue[0].supportContributions.map((s: any) => s.entryType)).toEqual([
        'REPORTER_REOPEN',
        'PIC_RESOLUTION',
        'REPORTER_CLOSED',
      ]);
      expect(queue[0].supportContributions[1].supporter.fullName).toBe('Arif Budiman');
      expect(queue[0].supportContributions[2].supporter.fullName).toBe('Aditya Nugroho');

      expect(queue[1].supportContributions.map((s: any) => s.entryType)).toEqual([
        'PIC_ACCEPTED_RISK',
        'REPORTER_CLOSED',
      ]);
      expect(queue[1].supportContributions).toHaveLength(2);
    });
  });
});
