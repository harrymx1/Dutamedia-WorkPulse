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
      mockPrisma.blockerTicket.findUnique.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.ACKNOWLEDGED });
      mockPrisma.blockerTicket.update.mockResolvedValue({ id: 'blk-1', status: BlockerStatus.RESOLVED });

      const res = await service.resolveBlocker('owner-1', 'blk-1', {
        resolutionNote: 'Kapasitas instance diperbesar dan indeks telah ditambahkan',
      });
      expect(res.status).toBe(BlockerStatus.RESOLVED);
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
  });
});
