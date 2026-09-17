import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type {
  ExceptionSummaryResult,
  DailyExceptionReport,
  WeeklyTeamSummaryReport,
  MonthlyTrendReport,
  IndividualEvidenceReport,
  BlockerRootCauseReport,
  ExportReportPayload,
  ExportReportResponse,
} from '../types/management.js';

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export const reportingApi = {
  /**
   * GET /api/v1/reports/exception-summary (SAD §13.2, EPIC-16-T1)
   */
  async getExceptionSummary(
    scope: 'Team' | 'Function' | 'Company' = 'Team',
    date?: string,
  ): Promise<ApiResponse<ExceptionSummaryResult>> {
    const qs = buildQueryString({ scope, date });
    return apiClient.get<ExceptionSummaryResult>(`/reports/exception-summary${qs}`);
  },

  /**
   * GET /api/v1/reports/daily-exception (SAD §13.1, EPIC-16-T2)
   */
  async getDailyException(params: {
    date?: string;
    scope?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<DailyExceptionReport>> {
    const qs = buildQueryString(params);
    return apiClient.get<DailyExceptionReport>(`/reports/daily-exception${qs}`);
  },

  /**
   * GET /api/v1/reports/weekly-team-summary (SAD §13.1, EPIC-16-T2)
   */
  async getWeeklyTeamSummary(params: {
    weekStartDate?: string;
    teamId?: string;
    function?: string;
  } = {}): Promise<ApiResponse<WeeklyTeamSummaryReport>> {
    const qs = buildQueryString(params);
    return apiClient.get<WeeklyTeamSummaryReport>(`/reports/weekly-team-summary${qs}`);
  },

  /**
   * GET /api/v1/reports/monthly-trend (SAD §13.1, EPIC-16-T2)
   */
  async getMonthlyTrend(params: {
    year: number;
    month: number;
    function?: string;
  }): Promise<ApiResponse<MonthlyTrendReport>> {
    const qs = buildQueryString(params);
    return apiClient.get<MonthlyTrendReport>(`/reports/monthly-trend${qs}`);
  },

  /**
   * GET /api/v1/reports/individual-evidence (SAD §13.1, EPIC-16-T2)
   */
  async getIndividualEvidence(params: {
    userId: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<IndividualEvidenceReport>> {
    const qs = buildQueryString(params);
    return apiClient.get<IndividualEvidenceReport>(`/reports/individual-evidence${qs}`);
  },

  /**
   * GET /api/v1/reports/blocker-root-cause (SAD §13.1, EPIC-16-T2)
   */
  async getBlockerRootCause(params: {
    startDate: string;
    endDate: string;
    function?: string;
  }): Promise<ApiResponse<BlockerRootCauseReport>> {
    const qs = buildQueryString(params);
    return apiClient.get<BlockerRootCauseReport>(`/reports/blocker-root-cause${qs}`);
  },

  /**
   * POST /api/v1/reports/export (SAD §13.5, EPIC-16-T3)
   */
  async exportReport(payload: ExportReportPayload): Promise<ApiResponse<ExportReportResponse>> {
    return apiClient.post<ExportReportResponse>('/reports/export', payload);
  },
};
