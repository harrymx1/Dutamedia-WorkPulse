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
    expect(pulse.attentionItems[0].actionUrl).toBe('/blockers?ticketId=blocker-1');
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

  it('returns today genuine peer support contributions in getSupportFeed, excluding system lifecycle entries and stripping internal tags', async () => {
    mockPrisma.organizationalAssignment = {
      findMany: vi.fn().mockResolvedValue([
        { userId: 'user-aditya', function: 'Engineering', role: 'EMPLOYEE' },
        { userId: 'user-bambang', function: 'Engineering', role: 'SUPERVISOR' },
        { userId: 'user-arif', function: 'Engineering', role: 'HEAD' },
        { userId: 'user-sales', function: 'BusinessDevelopment', role: 'EMPLOYEE' },
      ]),
    };
    mockPrisma.projectAuthorityMapping = {
      findMany: vi.fn().mockResolvedValue([
        {
          projectCode: 'WP-CORE',
          projectName: 'WorkPulse Platform Core 2026',
          involvedFunction: 'Engineering',
          projectManagerId: 'user-bambang',
        },
      ]),
    };
    mockPrisma.supportContribution = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'sup-real-1',
          supporterUserId: 'user-arif',
          actionTaken: '[SUPPORT_RESOLVED_CLOSED] Menambahkan composite index pada userId dan workDate',
          resultNote:
            'Uji beban 20 request selesai 45ms\n[CATATAN_PROGRES_PELAPOR]: Sudah terverifikasi lancar',
          createdAt: new Date('2026-11-18T07:58:00.000Z'),
          supporter: { id: 'user-arif', fullName: 'Arif Budiman' },
          blocker: {
            id: 'blk-1',
            description: '[Deadlock Query WP-CORE] Query deadlock saat beban tinggi (Ekspektasi: Index)',
            raisedByUserId: 'user-aditya',
            assignedOwnerId: 'user-bambang',
            projectCodeReference: 'WP-CORE',
          },
        },
        {
          id: 'sup-sys-close',
          supporterUserId: 'user-aditya',
          actionTaken: 'Dikonfirmasi & Ditutup oleh Pelapor',
          resultNote: 'Tiket ditutup permanen.',
          createdAt: new Date('2026-11-18T08:06:00.000Z'),
          supporter: { id: 'user-aditya', fullName: 'Aditya Nugroho' },
          blocker: {
            id: 'blk-1',
            description: '[Deadlock Query WP-CORE] Query deadlock',
            raisedByUserId: 'user-aditya',
            assignedOwnerId: 'user-bambang',
            projectCodeReference: 'WP-CORE',
          },
        },
        {
          id: 'sup-sys-risk',
          supporterUserId: 'user-arif',
          actionTaken: '[PIC_ACCEPTED_RISK] Lanjut dengan workaround sementara',
          resultNote: 'Mitigasi dicatat.',
          createdAt: new Date('2026-11-18T08:00:00.000Z'),
          supporter: { id: 'user-arif', fullName: 'Arif Budiman' },
          blocker: {
            id: 'blk-2',
            description: '[API Vendor Limit] Limit harian penuh',
            raisedByUserId: 'user-aditya',
            assignedOwnerId: 'user-arif',
            projectCodeReference: null,
          },
        },
      ]),
    };

    // 1. Project Lead (Bambang — WP-CORE) melihat kontribusi Arif secara bersih
    const leadFeed = await service.getSupportFeed({
      userId: 'user-bambang',
      userRole: 'SUPERVISOR',
      userFunction: 'Engineering',
      scope: 'team',
    });
    expect(leadFeed).toHaveLength(1);
    expect(leadFeed[0]).toEqual({
      id: 'sup-real-1',
      supporterName: 'Arif Budiman',
      blockerTitle: 'Deadlock Query WP-CORE',
      actionTaken: 'Menambahkan composite index pada userId dan workDate',
      resultNote: 'Uji beban 20 request selesai 45ms',
      createdAt: '2026-11-18T07:58:00.000Z',
    });

    // 2. Head of Engineering (Arif — scope function) melihat kontribusi divisi Engineering
    const headFeed = await service.getSupportFeed({
      userId: 'user-arif',
      userRole: 'HEAD',
      userFunction: 'Engineering',
      scope: 'function',
    });
    expect(headFeed).toHaveLength(1);
    expect(headFeed[0].supporterName).toBe('Arif Budiman');

    // 3. Management filter Divisi BusinessDevelopment -> tidak melihat kontribusi Engineering
    const bdFeed = await service.getSupportFeed({
      userId: 'user-ceo',
      userRole: 'CEO_MANAGEMENT',
      scope: 'management',
      filterFunction: 'BusinessDevelopment',
    });
    expect(bdFeed).toHaveLength(0);
  });

  it('applies yesterday and week period filters to metrics and support feed and deduplicates multi-day submissions', async () => {
    mockClock.todayString = vi.fn(() => '2026-11-22');
    mockClock.currentDate.mockReturnValue(new Date('2026-11-22T00:00:00.000Z'));

    mockPrisma.user.count.mockResolvedValue(4);
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
      {
        id: 'rec-u1-day1',
        userId: 'u1',
        isMorningSubmitted: true,
        commitments: [{ initialRisk: CommitmentRisk.GREEN }],
      },
      {
        id: 'rec-u1-day2',
        userId: 'u1',
        isMorningSubmitted: true,
        commitments: [{ initialRisk: CommitmentRisk.AMBER }],
      },
    ]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([]);
    mockPrisma.supportContribution = {
      findMany: vi.fn().mockResolvedValue([]),
    };

    const yestMetrics = await service.getPulseMetrics({ period: 'yesterday' });
    expect(mockPrisma.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workDate: new Date('2026-11-21T00:00:00.000Z') },
      }),
    );
    expect(yestMetrics.period).toBe('yesterday');
    expect(yestMetrics.dateRange).toEqual({ startDate: '2026-11-21', endDate: '2026-11-21' });

    const weekMetrics = await service.getPulseMetrics({ period: 'week' });
    expect(mockPrisma.dailyAccountabilityRecord.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {
          workDate: {
            gte: new Date('2026-11-16T00:00:00.000Z'),
            lte: new Date('2026-11-22T00:00:00.000Z'),
          },
        },
      }),
    );
    expect(weekMetrics.period).toBe('week');
    expect(weekMetrics.dateRange).toEqual({ startDate: '2026-11-16', endDate: '2026-11-22' });
    // u1 submitted twice in the week -> counted once in submittedCount
    expect(weekMetrics.submittedCount).toBe(1);
    expect(weekMetrics.totalEmployees).toBe(4);
    expect(weekMetrics.noSubmissionCount).toBe(3);

    await service.getSupportFeed({ period: 'yesterday' });
    expect(mockPrisma.supportContribution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdAt: {
            gte: new Date('2026-11-21T00:00:00+07:00'),
            lte: new Date('2026-11-21T23:59:59.999+07:00'),
          },
        },
      }),
    );
  });

  it('excludes users with approved leave or active bounded exemption from noSubmissionCount and participation denominator (FR-27)', async () => {
    mockClock.todayString = vi.fn(() => '2026-11-22');
    mockClock.currentDate.mockReturnValue(new Date('2026-11-22T00:00:00.000Z'));

    mockPrisma.user.count.mockResolvedValue(5);
    mockPrisma.organizationalAssignment = {
      findMany: vi.fn().mockResolvedValue([
        { userId: 'u1', function: 'Engineering', role: 'EMPLOYEE', user: { fullName: 'U1' } },
        { userId: 'u2', function: 'Engineering', role: 'EMPLOYEE', user: { fullName: 'U2' } },
        { userId: 'u3', function: 'Engineering', role: 'EMPLOYEE', user: { fullName: 'U3' } },
        { userId: 'u4', function: 'Engineering', role: 'EMPLOYEE', user: { fullName: 'U4' } },
        { userId: 'u5', function: 'Engineering', role: 'EMPLOYEE', user: { fullName: 'U5' } },
      ]),
    };
    mockPrisma.leaveRequest = {
      findMany: vi.fn().mockResolvedValue([{ userId: 'u4' }]),
    };
    mockPrisma.boundedExemption = {
      findMany: vi.fn().mockResolvedValue([{ userId: 'u5' }]),
    };
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
      { id: 'r1', userId: 'u1', isMorningSubmitted: true, commitments: [] },
      { id: 'r2', userId: 'u2', isMorningSubmitted: true, commitments: [] },
      { id: 'r3', userId: 'u3', isMorningSubmitted: true, commitments: [] },
    ]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([]);

    const metrics = await service.getPulseMetrics({
      userId: 'head-eng',
      userRole: 'HEAD',
      userFunction: 'Engineering',
      scope: 'function',
    });

    expect(metrics.exemptedOrLeaveCount).toBe(2);
    expect(metrics.totalEmployees).toBe(3);
    expect(metrics.submittedCount).toBe(3);
    expect(metrics.noSubmissionCount).toBe(0);
    expect(metrics.completionRatePercent).toBe(100);
  });

  it('rejects cross-division getSupportFeed request from HEAD with 403 AUTH_FORBIDDEN_SCOPE', async () => {
    mockPrisma.organizationalAssignment = {
      findMany: vi.fn().mockResolvedValue([
        { userId: 'user-arif', function: 'Engineering', role: 'HEAD' },
      ]),
    };
    mockPrisma.supportContribution = {
      findMany: vi.fn().mockResolvedValue([]),
    };

    await expect(
      service.getSupportFeed({
        userId: 'user-arif',
        userRole: 'HEAD',
        userFunction: 'Engineering',
        scope: 'function',
        filterFunction: 'Finance',
      }),
    ).rejects.toThrow(/tidak memiliki akses/);
  });

  it('uses WIB workDate, includes active projects with future endDate, formats topBlockerTitle severity in Indonesian, and enforces 403 for non-lead employee', async () => {
    // 2026-11-21T18:00:00.000Z === 2026-11-22 01:00 WIB (calendar date 2026-11-22)
    mockClock.now.mockReturnValue(new Date('2026-11-21T18:00:00.000Z'));
    mockPrisma.projectAuthorityMapping.findMany.mockResolvedValue([
      {
        id: 'prj-future',
        projectCode: 'PRJ-Q4',
        projectName: 'Proyek Akhir Tahun',
        projectManagerId: 'emp-lead-1',
        involvedFunction: 'Delivery',
        projectManager: { fullName: 'Dimas Prakoso' },
      },
    ]);
    mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);
    mockPrisma.blockerTicket.findMany.mockResolvedValue([
      {
        projectCodeReference: 'PRJ-Q4',
        severity: BlockerSeverity.CRITICAL,
        status: BlockerStatus.OPEN,
        description: 'Database staging gagal terhubung',
      },
    ]);

    // Non-lead EMPLOYEE must receive 403 AUTH_FORBIDDEN_SCOPE
    await expect(
      service.getProjectRiskOverview({ userId: 'emp-regular', userRole: 'EMPLOYEE' }),
    ).rejects.toThrow(/tidak memiliki kewenangan/);

    // Active projectManagerId (even if role is EMPLOYEE) succeeds
    const result = await service.getProjectRiskOverview({
      userId: 'emp-lead-1',
      userRole: 'EMPLOYEE',
    });

    const expectedWibToday = new Date('2026-11-22T00:00:00.000Z');
    expect(mockPrisma.projectAuthorityMapping.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          effectiveDate: { lte: expectedWibToday },
          OR: [{ endDate: null }, { endDate: { gte: expectedWibToday } }],
        },
      }),
    );
    expect(mockPrisma.dailyAccountabilityRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workDate: expectedWibToday },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].topBlockerTitle).toContain('[Kritis]');
    expect(result[0].topBlockerTitle).not.toContain('[CRITICAL]');
  });
});
