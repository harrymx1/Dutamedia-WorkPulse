import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportsService } from './reports.service';

describe('ReportsService (WP-EP13 - Laporan Eksekutif & Analitik Organisasi)', () => {
  let service: ReportsService;
  let prismaMock: any;

  beforeEach(() => {
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

  it('aggregates executive summary metrics and departmental breakdown', async () => {
    const report = await service.getExecutiveReport('today');

    expect(report.period).toBe('today');
    expect(report.summary.totalEmployees).toBe(32);
    expect(report.summary.participationRate).toBeGreaterThan(90);
    expect(report.departmentBreakdown.length).toBe(4);
    expect(report.departmentBreakdown[0].department).toBe('Engineering & Tech');
  });

  it('generates CSV export data with proper headers and rows', async () => {
    const exportResult = await service.exportAuditData('month');

    expect(exportResult.filename).toContain('workpulse-report-month-');
    expect(exportResult.contentType).toBe('text/csv');
    expect(exportResult.data).toContain('Departemen,Jumlah Personil');
    expect(exportResult.data).toContain('"Engineering & Tech"');
  });
});

