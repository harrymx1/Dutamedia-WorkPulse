import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportingController } from './controllers/reporting.controller.js';
import { Role } from '@prisma/client';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

describe('ReportingController', () => {
  let controller: ReportingController;
  let mockReportingService: any;

  const mockUser: CurrentUserPayload = {
    userId: 'head-user-1',
    email: 'head@dutamedia.com',
    role: Role.Head,
    function: 'Engineering',
    directManagerId: null,
    sessionId: 'session-1',
    mustResetPassword: false,
  };

  beforeEach(() => {
    mockReportingService = {
      getDailyExceptionReport: vi.fn().mockResolvedValue({ date: '2026-09-17', metrics: {} }),
      getExceptionSummary: vi.fn().mockResolvedValue({ date: '2026-09-17', metrics: {} }),
      getWeeklyTeamSummary: vi.fn().mockResolvedValue({ period: {}, summary: {} }),
      getMonthlyTrend: vi.fn().mockResolvedValue({ month: '2026-09', summary: {} }),
      getIndividualEvidence: vi.fn().mockResolvedValue({ user: {}, period: {}, records: [] }),
      getBlockerRootCauseReport: vi.fn().mockResolvedValue({ period: {}, metrics: {} }),
      exportReport: vi.fn().mockResolvedValue({ downloadUrl: 'https://storage/signed', expiresIn: 900 }),
    };

    controller = new ReportingController(mockReportingService);
  });

  it('GET daily-exception harus memanggil getDailyExceptionReport', async () => {
    const query = { date: '2026-09-17' };
    const res = await controller.getDailyException(mockUser, query);
    expect(res).toBeDefined();
    expect(mockReportingService.getDailyExceptionReport).toHaveBeenCalledWith(mockUser, query);
  });

  it('GET exception-summary harus memanggil getExceptionSummary', async () => {
    const query = { date: '2026-09-17' };
    const res = await controller.getExceptionSummary(mockUser, query);
    expect(res).toBeDefined();
    expect(mockReportingService.getExceptionSummary).toHaveBeenCalledWith(mockUser, '2026-09-17');
  });

  it('GET weekly-team-summary harus memanggil getWeeklyTeamSummary', async () => {
    const query = { weekStart: '2026-09-14' };
    const res = await controller.getWeeklyTeamSummary(mockUser, query);
    expect(res).toBeDefined();
    expect(mockReportingService.getWeeklyTeamSummary).toHaveBeenCalledWith(mockUser, query);
  });

  it('GET monthly-trend harus memanggil getMonthlyTrend', async () => {
    const query = { month: '2026-09' };
    const res = await controller.getMonthlyTrend(mockUser, query);
    expect(res).toBeDefined();
    expect(mockReportingService.getMonthlyTrend).toHaveBeenCalledWith(mockUser, query);
  });

  it('GET individual-evidence/:userId harus memanggil getIndividualEvidence', async () => {
    const query = { startDate: '2026-09-01', endDate: '2026-09-30' };
    const res = await controller.getIndividualEvidence(mockUser, 'emp-123', query);
    expect(res).toBeDefined();
    expect(mockReportingService.getIndividualEvidence).toHaveBeenCalledWith(mockUser, 'emp-123', query);
  });

  it('GET blocker-root-cause harus memanggil getBlockerRootCauseReport', async () => {
    const query = { startDate: '2026-09-01', endDate: '2026-09-30' };
    const res = await controller.getBlockerRootCause(mockUser, query);
    expect(res).toBeDefined();
    expect(mockReportingService.getBlockerRootCauseReport).toHaveBeenCalledWith(mockUser, query);
  });

  it('GET :reportType/export harus memanggil exportReport', async () => {
    const query = { format: 'pdf' as const, date: '2026-09-17' };
    const res = await controller.exportReport(mockUser, 'daily-exception', query);
    expect(res).toBeDefined();
    expect(mockReportingService.exportReport).toHaveBeenCalledWith(mockUser, 'daily-exception', query);
  });
});
