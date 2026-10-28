import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { exceptionsApi, type QueryExceptionsParams } from '../api/exceptions.api.js';
import type {
  CreateLeavePayload,
  CreateHolidayPayload,
  CreateExemptionPayload,
  RejectLeavePayload,
} from '../types/management.js';

export const EXCEPTIONS_KEYS = {
  all: ['exceptions'] as const,
  list: (params?: MaybeRefOrGetter<QueryExceptionsParams | undefined>) =>
    [...EXCEPTIONS_KEYS.all, 'list', params ? toValue(params) : undefined] as const,
  detail: (id: MaybeRefOrGetter<string>) =>
    [...EXCEPTIONS_KEYS.all, 'detail', toValue(id)] as const,
};

/**
 * Hook query daftar exception (Leave, Holiday, Exemption).
 */
export function useExceptionsQuery(params?: MaybeRefOrGetter<QueryExceptionsParams | undefined>) {
  return useQuery({
    queryKey: computed(() => EXCEPTIONS_KEYS.list(params)),
    queryFn: async () => {
      const res = await exceptionsApi.getExceptions(params ? toValue(params) : {});
      return res.data;
    },
  });
}

/**
 * Hook mutasi persetujuan cuti.
 */
export function useApproveLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await exceptionsApi.approveLeave(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penolakan cuti.
 */
export function useRejectLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectLeavePayload }) => {
      const res = await exceptionsApi.rejectLeave(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi pengajuan cuti baru oleh employee.
 */
export function useCreateLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeavePayload) => {
      const res = await exceptionsApi.createLeave(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penambahan libur perusahaan/nasional (HRGA/Admin).
 */
export function useCreateHolidayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHolidayPayload) => {
      const res = await exceptionsApi.createHoliday(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penambahan pengecualian individual karyawan (HRGA/Admin).
 */
export function useCreateExemptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExemptionPayload) => {
      const res = await exceptionsApi.createExemption(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXCEPTIONS_KEYS.all });
    },
  });
}
