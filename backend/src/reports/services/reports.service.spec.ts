import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CanonicalRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { ErrorCode } from '../../common/constants/error-codes';

describe('ReportsService (WP-EP13 - Laporan Eksekutif & Analitik Organisasi)', () => {
  let service: ReportsService;
  let prismaMock: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-23T03:00:00.000Z')); // Senin 10:00 WIB

    prismaMock = {
      user: {
        count: vi.fn().mockResolvedValue(32),
      },
      dailyAccountabilityRecord: {
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(30),
      },
      blockerTicket: {
        count: vi.fn().mockResolvedValue(2),
      },
    };

    service = new ReportsService(prismaMock);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aggregates executive summary metrics and departmental breakdown', async () => {
    const report = await service.getExecutiveReport('today');

    expect(report.period).toBe('today');
    expect(report.summary.totalEmployees).toBe(32);
    expect(report.summary.participationRate).toBeGreaterThan(90);
    expect(report.departmentBreakdown.length).toBe(4);
    expect(report.departmentBreakdown[0].department).toBe('Engineering & Tech');
  });

  it('generates CSV export data with UTF-8 BOM, headers including Status Karyawan, and rows', async () => {
    const exportResult = await service.exportAuditData('month', 'INTERN');

    expect(exportResult.filename).toContain('workpulse-report-month-intern-2026-11-23');
    expect(exportResult.contentType).toBe('text/csv; charset=utf-8');
    expect(exportResult.data.startsWith('\uFEFF')).toBe(true);
    expect(exportResult.data).toContain('Departemen,Status Karyawan,Jumlah Personil');
    expect(exportResult.data).toContain('"Engineering & Tech","Intern"');
  });

  it('locks HEAD to their own division and rejects cross-division queries with 403 AUTH_FORBIDDEN_SCOPE', async () => {
    const orgPrisma: any = {
      policy: {
        findFirst: vi.fn().mockResolvedValue({
          configurationValues: {
            morningOnTimeCutoff: '08:45',
            morningLockCutoff: '09:15',
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
          },
        }),
      },
      organizationalAssignment: {
        findMany: vi.fn().mockResolvedValue([
          { userId: 'u-head', function: 'Engineering', employmentStatus: 'PERMANENT', role: CanonicalRole.HEAD },
          { userId: 'u-dev', function: 'Engineering', employmentStatus: 'PERMANENT', role: CanonicalRole.EMPLOYEE },
          { userId: 'u-del', function: 'Delivery', employmentStatus: 'PERMANENT', role: CanonicalRole.PROJECT_MANAGER },
        ]),
      },
      companyHoliday: { findMany: vi.fn().mockResolvedValue([]) },
      dailyAccountabilityRecord: { findMany: vi.fn().mockResolvedValue([]) },
      leaveRequest: { findMany: vi.fn().mockResolvedValue([]) },
      boundedExemption: { findMany: vi.fn().mockResolvedValue([]) },
      blockerTicket: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const scopedService = new ReportsService(orgPrisma);

    const headReport = await scopedService.getExecutiveReport('today', 'ALL', {
      userId: 'u-head',
      userRole: CanonicalRole.HEAD,
    });
    expect(headReport.scope).toBe('DIVISION');
    expect(headReport.lockedFunction).toBe('Engineering');
    expect(headReport.departmentBreakdown).toHaveLength(1);
    expect(headReport.departmentBreakdown[0].department).toBe('Engineering');
    expect(headReport.policyTiming.morningOnTimeCutoff).toBe('08:45');
    expect(headReport.policyTiming.morningLockCutoff).toBe('09:15');

    await expect(
      scopedService.getExecutiveReport('today', 'ALL', {
        userId: 'u-head',
        userRole: CanonicalRole.HEAD,
        filterFunction: 'Delivery',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN_SCOPE });

    await expect(
      scopedService.exportAuditData('today', 'ALL', {
        userId: 'u-head',
        userRole: CanonicalRole.HEAD,
        filterFunction: 'Delivery',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN_SCOPE });
  });

  it('computes real multi-day compliance, excludes holidays/leave/exemptions (FR-27), computes real MTTR, and neutralizes CSV formula injection', async () => {
    const orgPrisma: any = {
      policy: { findFirst: vi.fn().mockResolvedValue(null) },
      organizationalAssignment: {
        findMany: vi.fn().mockResolvedValue([
          { userId: 'u-1', function: '=Engineering', employmentStatus: 'PERMANENT', role: CanonicalRole.EMPLOYEE },
          { userId: 'u-2', function: '=Engineering', employmentStatus: 'INTERN', role: CanonicalRole.EMPLOYEE },
        ]),
      },
      // Senin 23 Nov + pekan lalu 17-20 Nov (19 Nov hari libur) -> 4 hari kerja di pekan ini (17, 18, 20, 23 Nov)
      companyHoliday: {
        findMany: vi.fn().mockResolvedValue([{ holidayDate: new Date('2026-11-19T00:00:00.000Z') }]),
      },
      dailyAccountabilityRecord: {
        findMany: vi.fn().mockResolvedValue([
          { userId: 'u-1', workDate: new Date('2026-11-17T00:00:00.000Z'), morningSubmittedAt: new Date(), morningTiming: 'ON_TIME' },
          { userId: 'u-1', workDate: new Date('2026-11-18T00:00:00.000Z'), morningSubmittedAt: new Date(), morningTiming: 'LATE' },
          { userId: 'u-2', workDate: new Date('2026-11-17T00:00:00.000Z'), morningSubmittedAt: new Date(), morningTiming: 'ON_TIME' },
        ]),
      },
      leaveRequest: {
        // u-1 cuti sah pada 20 Nov & 23 Nov -> 2 slot dikecualikan
        findMany: vi.fn().mockResolvedValue([
          { userId: 'u-1', startDate: new Date('2026-11-20T00:00:00.000Z'), endDate: new Date('2026-11-23T00:00:00.000Z') },
        ]),
      },
      boundedExemption: {
        // u-2 dispensasi sah pada 20 Nov -> 1 slot dikecualikan; tersisa 18 & 23 Nov sebagai No Submission untuk u-2
        findMany: vi.fn().mockResolvedValue([
          { userId: 'u-2', startDate: new Date('2026-11-20T00:00:00.000Z'), endDate: new Date('2026-11-20T00:00:00.000Z') },
        ]),
      },
      blockerTicket: {
        findMany: vi
          .fn()
          .mockResolvedValueOnce([{ raisedByUserId: 'u-1' }]) // 1 open blocker
          .mockResolvedValueOnce([
            {
              raisedByUserId: 'u-1',
              raisedAt: new Date('2026-11-23T01:00:00.000Z'),
              resolvedAt: new Date('2026-11-23T03:30:00.000Z'), // 2.5 jam
            },
            {
              raisedByUserId: 'u-2',
              raisedAt: new Date('2026-11-20T02:00:00.000Z'),
              resolvedAt: new Date('2026-11-20T07:30:00.000Z'), // 5.5 jam -> avg = 4.0 jam
            },
          ]),
      },
    };

    const realService = new ReportsService(orgPrisma);
    const weekReport = await realService.getExecutiveReport('week', 'ALL', {
      userId: 'ceo-1',
      userRole: CanonicalRole.CEO_MANAGEMENT,
    });

    // 4 hari kerja * 2 orang = 8 slot; 3 dikecualikan (FR-27) => 5 slot wajib: 2 ON_TIME, 1 LATE, 2 NO_SUB
    expect(weekReport.periodRange.workingDaysCount).toBe(4);
    expect(weekReport.summary.excludedSlotsCount).toBe(3);
    expect(weekReport.summary.participationRate).toBe(60); // 3/5
    expect(weekReport.summary.onTimePercent).toBe(40); // 2/5
    expect(weekReport.summary.latePercent).toBe(20); // 1/5
    expect(weekReport.summary.noSubmissionPercent).toBe(40); // 2/5
    expect(weekReport.summary.openBlockersCount).toBe(1);
    expect(weekReport.summary.resolvedBlockersCount).toBe(2);
    expect(weekReport.summary.avgBlockerMttrHours).toBe(4);

    const csv = await realService.exportAuditData('week', 'ALL', {
      userId: 'ceo-1',
      userRole: CanonicalRole.CEO_MANAGEMENT,
    });
    expect(csv.data).toContain(`"'=Engineering"`);
    expect(csv.data).toContain(`"2026-11-17 s.d. 2026-11-23"`);
  });

  it('returns 0 MTTR (no fake 3.5 or 3.8) when blockers are open but zero are resolved', async () => {
    const orgPrisma: any = {
      policy: { findFirst: vi.fn().mockResolvedValue(null) },
      organizationalAssignment: {
        findMany: vi.fn().mockResolvedValue([
          { userId: 'u-1', function: 'Engineering', employmentStatus: 'PERMANENT', role: CanonicalRole.EMPLOYEE },
        ]),
      },
      companyHoliday: { findMany: vi.fn().mockResolvedValue([]) },
      dailyAccountabilityRecord: { findMany: vi.fn().mockResolvedValue([]) },
      leaveRequest: { findMany: vi.fn().mockResolvedValue([]) },
      boundedExemption: { findMany: vi.fn().mockResolvedValue([]) },
      blockerTicket: {
        findMany: vi
          .fn()
          .mockResolvedValueOnce([{ raisedByUserId: 'u-1' }, { raisedByUserId: 'u-1' }]) // 2 open
          .mockResolvedValueOnce([]), // 0 resolved
      },
    };

    const s = new ReportsService(orgPrisma);
    const res = await s.getExecutiveReport('today', 'ALL', { userRole: CanonicalRole.CEO_MANAGEMENT });
    expect(res.summary.openBlockersCount).toBe(2);
    expect(res.summary.resolvedBlockersCount).toBe(0);
    expect(res.summary.avgBlockerMttrHours).toBe(0);
    expect(res.departmentBreakdown[0].mttrHours).toBe(0);
  });
});

