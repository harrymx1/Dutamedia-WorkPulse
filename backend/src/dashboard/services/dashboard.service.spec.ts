import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardService } from './dashboard.service';
import {
  BlockerSeverity,
  BlockerStatus,
  CommitmentOutcome,
  CommitmentRisk,
} from '@prisma/client';

describe('DashboardService (WP-EP12 / Executive Pulse Dashboard & Project Risk Radar)', () => {
  let service: DashboardService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        count: vi.fn(),
      },
      dailyAccountabilityRecord: {
        findMany: vi.fn(),
      },
      blockerTicket: {
        findMany: vi.fn(),
      },
    };

    mockClock = {
      currentDate: vi.fn(() => new Date('2026-10-28T00:00:00.000Z')),
    };

    service = new DashboardService(mockPrisma, mockClock);
  });

  it('aggregates daily pulse metrics including participation rate and outcomes', async () => {
    mockPrisma.user.count.mockResolvedValue(10);
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
      {
        id: 'rec-1',
        isMorningSubmitted: true,
        isEodSubmitted: true,
        commitments: [
          { initialRisk: CommitmentRisk.GREEN, outcome: CommitmentOutcome.COMPLETED },
          { initialRisk: CommitmentRisk.AMBER, outcome: CommitmentOutcome.PARTIALLY_COMPLETED },
        ],
      },
      {
        id: 'rec-2',
        isMorningSubmitted: true,
        isEodSubmitted: false,
        commitments: [
          { initialRisk: CommitmentRisk.RED, outcome: null },
        ],
      },
    ]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([
      { id: 'b-1', severity: BlockerSeverity.CRITICAL, status: BlockerStatus.OPEN },
    ]);

    const pulse = await service.getPulseMetrics();
    expect(pulse.totalEmployees).toBe(10);
    expect(pulse.checkedInCount).toBe(2);
    expect(pulse.participationRate).toBe(20);
    expect(pulse.commitments.total).toBe(3);
    expect(pulse.commitments.greenCount).toBe(1);
    expect(pulse.commitments.amberCount).toBe(1);
    expect(pulse.commitments.redCount).toBe(1);
    expect(pulse.outcomes.completedCount).toBe(1);
    expect(pulse.outcomes.partialCount).toBe(1);
    expect(pulse.blockers.criticalCount).toBe(1);
  });

  it('maps project risk level based on linked critical and open blockers', async () => {
    mockPrisma.blockerTicket.findMany.mockResolvedValue([
      { projectCodeReference: 'PRJ-PORTAL', severity: BlockerSeverity.CRITICAL, status: BlockerStatus.OPEN },
      { projectCodeReference: 'PRJ-CORE', severity: BlockerSeverity.LOW, status: BlockerStatus.OPEN },
    ]);

    const projectRisks = await service.getProjectRiskOverview();
    expect(projectRisks).toHaveLength(3);

    const portal = projectRisks.find((p) => p.projectCode === 'PRJ-PORTAL');
    expect(portal?.riskLevel).toBe('CRITICAL');

    const core = projectRisks.find((p) => p.projectCode === 'PRJ-CORE');
    expect(core?.riskLevel).toBe('MEDIUM');

    const mobile = projectRisks.find((p) => p.projectCode === 'PRJ-MOBILE');
    expect(mobile?.riskLevel).toBe('LOW');
  });
});
