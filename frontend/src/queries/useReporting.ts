import { useQuery, useMutation } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { reportingApi } from '../api/reporting.api.js';
import type { ExportReportPayload } from '../types/management.js';

export const REPORTING_KEYS = {
  all: ['reports'] as const,
  exceptionSummary: (scope?: MaybeRefOrGetter<string>, date?: MaybeRefOrGetter<string | undefined>) =>
    [...REPORTING_KEYS.all, 'exception-summary', scope ? toValue(scope) : 'Team', date ? toValue(date) : undefined] as const,
  dailyException: (params?: MaybeRefOrGetter<any>) =>
    [...REPORTING_KEYS.all, 'daily-exception', params ? toValue(params) : undefined] as const,
  weeklyTeamSummary: (params?: MaybeRefOrGetter<any>) =>
    [...REPORTING_KEYS.all, 'weekly-team-summary', params ? toValue(params) : undefined] as const,
  monthlyTrend: (params?: MaybeRefOrGetter<any>) =>
    [...REPORTING_KEYS.all, 'monthly-trend', params ? toValue(params) : undefined] as const,
  individualEvidence: (params?: MaybeRefOrGetter<any>) =>
    [...REPORTING_KEYS.all, 'individual-evidence', params ? toValue(params) : undefined] as const,
  blockerRootCause: (params?: MaybeRefOrGetter<any>) =>
    [...REPORTING_KEYS.all, 'blocker-root-cause', params ? toValue(params) : undefined] as const,
};

/**
 * Hook query Exception Summary untuk ExceptionSummaryWidget & Pulse Pages (SAD §13.2).
 */
export function useExceptionSummaryQuery(
  scope: MaybeRefOrGetter<'Team' | 'Function' | 'Company'> = 'Team',
  date?: MaybeRefOrGetter<string | undefined>,
) {
  return useQuery({
    queryKey: computed(() => REPORTING_KEYS.exceptionSummary(scope, date)),
    queryFn: async () => {
      const res = await reportingApi.getExceptionSummary(toValue(scope), toValue(date));
      return res.data;
    },
    refetchInterval: 1000 * 60, // Refresh setiap 60 detik untuk dashboard
  });
}

/**
 * Hook query Daily Exception Report.
 */
export function useDailyExceptionQuery(params: MaybeRefOrGetter<{
  date?: string;
  scope?: string;
  page?: number;
  limit?: number;
}>) {
  return useQuery({
    queryKey: computed(() => REPORTING_KEYS.dailyException(params)),
    queryFn: async () => {
      const res = await reportingApi.getDailyException(toValue(params));
      return res.data;
    },
  });
}

/**
 * Hook query Weekly Team Summary Report.
 */
export function useWeeklyTeamSummaryQuery(params: MaybeRefOrGetter<{
  weekStartDate?: string;
  teamId?: string;
  function?: string;
}>) {
  return useQuery({
    queryKey: computed(() => REPORTING_KEYS.weeklyTeamSummary(params)),
    queryFn: async () => {
      const res = await reportingApi.getWeeklyTeamSummary(toValue(params));
      return res.data;
    },
  });
}

/**
 * Hook query Monthly Trend Report.
 */
export function useMonthlyTrendQuery(params: MaybeRefOrGetter<{
  year: number;
  month: number;
  function?: string;
}>) {
  return useQuery({
    queryKey: computed(() => REPORTING_KEYS.monthlyTrend(params)),
    queryFn: async () => {
      const res = await reportingApi.getMonthlyTrend(toValue(params));
      return res.data;
    },
  });
}

/**
 * Hook query Individual Review Evidence Report.
 */
export function useIndividualEvidenceQuery(params: MaybeRefOrGetter<{
  userId: string;
  startDate: string;
  endDate: string;
}>) {
  return useQuery({
    queryKey: computed(() => REPORTING_KEYS.individualEvidence(params)),
    queryFn: async () => {
      const p = toValue(params);
      if (!p.userId || !p.startDate || !p.endDate) return null;
      const res = await reportingApi.getIndividualEvidence(p);
      return res.data;
    },
    enabled: computed(() => {
      const p = toValue(params);
      return !!p.userId && !!p.startDate && !!p.endDate;
    }),
  });
}

/**
 * Hook query Blocker Root Cause Report.
 */
export function useBlockerRootCauseQuery(params: MaybeRefOrGetter<{
  startDate: string;
  endDate: string;
  function?: string;
}>) {
  return useQuery({
    queryKey: computed(() => REPORTING_KEYS.blockerRootCause(params)),
    queryFn: async () => {
      const res = await reportingApi.getBlockerRootCause(toValue(params));
      return res.data;
    },
  });
}

/**
 * Hook mutasi Export Report (PDF/XLSX).
 */
export function useExportReportMutation() {
  return useMutation({
    mutationFn: async (payload: ExportReportPayload) => {
      const res = await reportingApi.exportReport(payload);
      return res.data;
    },
  });
}
