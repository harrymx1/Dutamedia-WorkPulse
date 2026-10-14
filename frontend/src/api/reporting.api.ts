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
   * GET /api/v1/reports/weekly-team-summary (SAD §13.1, §13.4, EPIC-16-T2)
   * Backend contract: weekStart (ISO YYYY-MM-DD)
   */
  async getWeeklyTeamSummary(params: {
    weekStart?: string;
    weekStartDate?: string;
    teamId?: string;
    function?: string;
  } = {}): Promise<ApiResponse<WeeklyTeamSummaryReport>> {
    const { weekStartDate, ...rest } = params;
    const queryParams: Record<string, any> = { ...rest };
    if (!queryParams.weekStart && weekStartDate) {
      queryParams.weekStart = weekStartDate;
    }
    const qs = buildQueryString(queryParams);
    return apiClient.get<WeeklyTeamSummaryReport>(`/reports/weekly-team-summary${qs}`);
  },

  /**
   * GET /api/v1/reports/monthly-trend (SAD §13.1, §13.4, EPIC-16-T2)
   * Backend contract: month (format YYYY-MM)
   */
  async getMonthlyTrend(params: {
    month?: string | number;
    year?: number;
    function?: string;
  }): Promise<ApiResponse<MonthlyTrendReport>> {
    const queryParams: Record<string, any> = {};
    if (params.year && params.month && typeof params.month === 'number') {
      const mm = String(params.month).padStart(2, '0');
      queryParams.month = `${params.year}-${mm}`;
    } else if (params.month) {
      queryParams.month = String(params.month);
    }
    if (params.function) {
      queryParams.function = params.function;
    }
    const qs = buildQueryString(queryParams);
    return apiClient.get<MonthlyTrendReport>(`/reports/monthly-trend${qs}`);
  },

  /**
   * GET /api/v1/reports/individual-evidence/:userId (SAD §10.11, §13.6, PRD §9)
   */
  async getIndividualEvidence(params: {
    userId: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<IndividualEvidenceReport>> {
    const { userId, ...rest } = params;
    const qs = buildQueryString(rest);
    return apiClient.get<IndividualEvidenceReport>(
      `/reports/individual-evidence/${encodeURIComponent(userId)}${qs}`,
    );
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
   * GET /api/v1/reports/:reportType/export (SAD §10.11, §13.5, FR-42/AC-20)
   */
  async exportReport(
    payloadOrType: ExportReportPayload | string,
    extraParams?: Record<string, any>,
  ): Promise<ApiResponse<ExportReportResponse>> {
    let reportType: string;
    let queryParams: Record<string, any>;

    if (typeof payloadOrType === 'string') {
      reportType = payloadOrType;
      queryParams = { ...extraParams };
    } else {
      const { reportType: rt, ...rest } = payloadOrType;
      reportType = rt;
      queryParams = { ...rest, ...extraParams };
    }

    // Backend ExportReportQueryDto validation: format must be 'pdf' | 'xlsx' (lowercase)
    if (queryParams.format) {
      queryParams.format = String(queryParams.format).toLowerCase();
    }
    // Backend expects weekStart instead of weekStartDate
    if (queryParams.weekStartDate && !queryParams.weekStart) {
      queryParams.weekStart = queryParams.weekStartDate;
      delete queryParams.weekStartDate;
    }
    // Backend expects month as 'YYYY-MM' string instead of separate year/month numbers
    if (queryParams.year && queryParams.month && typeof queryParams.month === 'number') {
      const mm = String(queryParams.month).padStart(2, '0');
      queryParams.month = `${queryParams.year}-${mm}`;
      delete queryParams.year;
    }

    const qs = buildQueryString(queryParams);
    return apiClient.get<ExportReportResponse>(
      `/reports/${encodeURIComponent(reportType)}/export${qs}`,
    );
  },
};
