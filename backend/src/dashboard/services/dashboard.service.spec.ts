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
      projectAuthorityMapping: {
        findMany: vi.fn(),
      },
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T00:00:00.000Z')),
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
    mockPrisma.projectAuthorityMapping.findMany.mockResolvedValue([
      { id: '1', projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing', involvedFunction: 'Delivery', projectManager: { fullName: 'Dimas Prakoso' } },
      { id: '2', projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync', involvedFunction: 'Engineering', projectManager: { fullName: 'Bambang Pratama' } },
      { id: '3', projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android', involvedFunction: 'Delivery', projectManager: { fullName: 'Dimas Prakoso' } },
    ]);
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);
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

  it('marks isProjectLead true only for direct projectManagerId and not for escalationReviewerId', async () => {
    mockPrisma.user.count.mockResolvedValue(5);
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([]);
    mockPrisma.projectAuthorityMapping = {
      findMany: vi.fn().mockResolvedValue([
        {
          projectCode: 'WP-CORE',
          projectName: 'WorkPulse Core Engine',
          projectManagerId: 'user-sup-01',
          escalationReviewerId: 'user-head-eng',
          involvedFunction: 'Engineering',
        },
      ]),
    };

    const headPulse = await service.getPulseMetrics({
      userId: 'user-head-eng',
      userRole: 'HEAD',
      userFunction: 'Engineering',
      scope: 'function',
    });
    expect(headPulse.isProjectLead).toBe(false);
    expect(headPulse.ledProjects).toHaveLength(0);

    const leadPulse = await service.getPulseMetrics({
      userId: 'user-sup-01',
      userRole: 'SUPERVISOR',
      userFunction: 'Engineering',
      scope: 'team',
    });
    expect(leadPulse.isProjectLead).toBe(true);
    expect(leadPulse.ledProjects).toHaveLength(1);
    expect(leadPulse.ledProjects[0].projectCode).toBe('WP-CORE');
  });

  it('populates active open blockers into attentionItems and deduplicates with linked commitments (IMP-068)', async () => {
    mockPrisma.user.count.mockResolvedValue(5);
    mockPrisma.organizationalAssignment = {
      findMany: vi.fn().mockResolvedValue([
        {
          userId: 'user-dev-01',
          function: 'Engineering',
          jobTitle: 'Frontend Developer',
          user: { fullName: 'Aditya Nugroho' },
        },
      ]),
    };
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
      {
        id: 'rec-1',
        userId: 'user-dev-01',
        isMorningSubmitted: true,
        commitments: [
          {
            id: 'comm-1',
            sequenceNo: 1,
            taskText: 'Menyelesaikan UI navigasi',
            initialRisk: CommitmentRisk.GREEN,
          },
          {
            id: 'comm-2',
            sequenceNo: 2,
            taskText: 'Investigasi memory leak',
            initialRisk: CommitmentRisk.AMBER,
            knownBlockerNote: 'OOM pipeline runner',
          },
        ],
      },
    ]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([
      {
        id: 'blocker-1',
        raisedByUserId: 'user-dev-01',
        linkedCommitmentId: 'comm-2',
        projectCodeReference: 'WP-CORE',
        severity: BlockerSeverity.CRITICAL,
        status: BlockerStatus.OPEN,
        description: 'CI runner mengalami OOM saat bundle',
        raisedBy: { id: 'user-dev-01', fullName: 'Aditya Nugroho' },
      },
    ]);

    const pulse = await service.getPulseMetrics();
    expect(pulse.attentionItems).toBeDefined();
    // Harus ada 1 item dari tiket blocker, dan komitmen comm-2 tidak diduplikasi
    expect(pulse.attentionItems).toHaveLength(1);
    expect(pulse.attentionItems[0].id).toBe('blocker-blocker-1');
    expect(pulse.attentionItems[0].userName).toBe('Aditya Nugroho');
    expect(pulse.attentionItems[0].level).toBe('RED');
    expect(pulse.attentionItems[0].badgeLabel).toBe('Blocker Kritis (P0)');
    expect(pulse.attentionItems[0].projectCode).toBe('WP-CORE');
    expect(pulse.attentionItems[0].actionUrl).toBe('/blockers');
  });

  it('correctly intersects division and project filters preventing cross-division leakage (IMP-068)', async () => {
    mockPrisma.user.count.mockResolvedValue(10);
    mockPrisma.organizationalAssignment = {
      findMany: vi.fn().mockResolvedValue([
        {
          userId: 'user-eng-1',
          function: 'Engineering',
          jobTitle: 'Frontend Developer',
          user: { fullName: 'Aditya Nugroho' },
        },
        {
          userId: 'user-deliv-1',
          function: 'Delivery',
          jobTitle: 'Project Manager',
          user: { fullName: 'Dimas Prakoso' },
        },
      ]),
    };
    mockPrisma.projectAuthorityMapping = {
      findMany: vi.fn().mockResolvedValue([
        {
          projectCode: 'PRJ-PORTAL',
          projectName: 'Customer Portal',
          involvedFunction: 'Delivery',
          projectManagerId: 'user-deliv-1',
        },
      ]),
    };
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([]);

    // Skenario Harry: Divisi Business Development + Proyek PRJ-PORTAL (yang fungsinya Delivery)
    // Seharusnya totalEmployees = 0 karena tidak ada personil Business Development di PRJ-PORTAL!
    const filteredPulse = await service.getPulseMetrics({
      scope: 'management',
      filterFunction: 'BusinessDevelopment',
      projectCode: 'PRJ-PORTAL',
    });

    expect(filteredPulse.totalEmployees).toBe(0);
    expect(filteredPulse.checkedInCount).toBe(0);
    expect(filteredPulse.noSubmissionCount).toBe(0);
    expect(filteredPulse.participationRate).toBe(0);

    // Skenario Divisi Delivery + Proyek PRJ-PORTAL
    // Seharusnya totalEmployees = 1 (Dimas Prakoso)
    const deliveryPulse = await service.getPulseMetrics({
      scope: 'management',
      filterFunction: 'Delivery',
      projectCode: 'PRJ-PORTAL',
    });

    expect(deliveryPulse.totalEmployees).toBe(1);
  });
});
