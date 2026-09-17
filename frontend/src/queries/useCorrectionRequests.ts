import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import {
  correctionRequestsApi,
  type QueryCorrectionRequestsParams,
} from '../api/correction-requests.api.js';
import type { ObjectCorrectionPayload } from '../types/management.js';

export const CORRECTION_KEYS = {
  all: ['correction-requests'] as const,
  list: (params?: MaybeRefOrGetter<QueryCorrectionRequestsParams | undefined>) =>
    [...CORRECTION_KEYS.all, 'list', params ? toValue(params) : undefined] as const,
  detail: (id: MaybeRefOrGetter<string>) =>
    [...CORRECTION_KEYS.all, 'detail', toValue(id)] as const,
};

/**
 * Hook query daftar permohonan koreksi komitmen.
 */
export function useCorrectionRequestsQuery(
  params?: MaybeRefOrGetter<QueryCorrectionRequestsParams | undefined>,
) {
  return useQuery({
    queryKey: computed(() => CORRECTION_KEYS.list(params)),
    queryFn: async () => {
      const res = await correctionRequestsApi.getCorrectionRequests(
        params ? toValue(params) : {},
      );
      return res.data;
    },
  });
}

/**
 * Hook mutasi pengajuan keberatan atas permohonan koreksi (SAD §9.6).
 */
export function useObjectCorrectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ObjectCorrectionPayload;
    }) => {
      const res = await correctionRequestsApi.objectCorrection(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORRECTION_KEYS.all });
    },
  });
}
