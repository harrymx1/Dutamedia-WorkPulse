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
