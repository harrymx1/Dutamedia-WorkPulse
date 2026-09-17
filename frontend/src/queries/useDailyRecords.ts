import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { type Ref, unref } from 'vue';
import { dailyRecordsApi, type QueryDailyRecordsParams } from '../api/daily-records.api.js';
import type {
  MorningCheckinPayload,
  EodCheckinPayload,
  ConfirmOverridePayload,
  AdditionalWorkPayload,
  CorrectionRequestPayload,
} from '../types/daily-records.js';

export const DAILY_RECORDS_KEYS = {
  all: ['daily-records'] as const,
  today: () => [...DAILY_RECORDS_KEYS.all, 'today'] as const,
  list: (params?: QueryDailyRecordsParams) => [...DAILY_RECORDS_KEYS.all, 'list', params] as const,
};

/**
 * Hook untuk memuat DailyAccountabilityRecord hari ini (SAD §16, §17.3).
 */
export function useTodayRecordQuery() {
  return useQuery({
    queryKey: DAILY_RECORDS_KEYS.today(),
    queryFn: async () => {
      const res = await dailyRecordsApi.getTodayRecord();
      return res.data;
    },
    staleTime: 1000 * 15, // 15 detik
    refetchInterval: 1000 * 60, // polling setiap 1 menit untuk update cutoff/status
  });
}

/**
 * Hook mutasi penyerahan Morning Check-in.
 */
export function useMorningCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MorningCheckinPayload) => {
      const res = await dailyRecordsApi.submitMorningCheckin(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.today() });
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penyerahan EOD Check-in.
 */
export function useEodCheckinMutation(recordId: Ref<string | undefined> | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EodCheckinPayload) => {
      const id = unref(recordId);
      if (!id) throw new Error('Record ID belum tersedia');
      const res = await dailyRecordsApi.submitEodCheckin(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.today() });
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi konfirmasi override status EOD.
 */
export function useConfirmOverrideMutation(recordId: Ref<string | undefined> | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ConfirmOverridePayload) => {
      const id = unref(recordId);
      if (!id) throw new Error('Record ID belum tersedia');
      const res = await dailyRecordsApi.confirmOverride(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.today() });
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi pembuatan Additional Work.
 */
export function useAdditionalWorkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdditionalWorkPayload) => {
      const res = await dailyRecordsApi.createAdditionalWork(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.today() });
    },
  });
}

/**
 * Hook mutasi pengajuan koreksi komitmen (Correction Request).
 */
export function useCorrectionRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CorrectionRequestPayload) => {
      const res = await dailyRecordsApi.requestCorrection(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.today() });
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.all });
    },
  });
}

/**
 * Hook query riwayat My History dengan filter rentang tanggal.
 */
export function useDailyRecordsQuery(params?: Ref<QueryDailyRecordsParams> | QueryDailyRecordsParams) {
  return useQuery({
    queryKey: DAILY_RECORDS_KEYS.list(unref(params)),
    queryFn: async () => {
      const p = unref(params);
      const res = await dailyRecordsApi.getDailyRecords(p);
      return res.data;
    },
    staleTime: 1000 * 30,
  });
}
