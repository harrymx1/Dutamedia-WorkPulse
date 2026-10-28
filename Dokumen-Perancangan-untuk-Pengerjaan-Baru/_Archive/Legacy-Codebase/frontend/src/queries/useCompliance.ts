import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { complianceApi, type QueryComplianceEventsParams } from '../api/compliance.api.js';
import type {
  CoachPayload,
  RecordWarningPayload,
  EscalateFormalPayload,
} from '../types/management.js';

export const COMPLIANCE_KEYS = {
  all: ['compliance'] as const,
  events: (params?: MaybeRefOrGetter<QueryComplianceEventsParams | undefined>) =>
    [...COMPLIANCE_KEYS.all, 'events', params ? toValue(params) : undefined] as const,
  detail: (id: MaybeRefOrGetter<string>) =>
    [...COMPLIANCE_KEYS.all, 'detail', toValue(id)] as const,
};

/**
 * Hook query daftar Compliance Events (SAD §10.8).
 */
export function useComplianceEventsQuery(params?: MaybeRefOrGetter<QueryComplianceEventsParams | undefined>) {
  return useQuery({
    queryKey: computed(() => COMPLIANCE_KEYS.events(params)),
    queryFn: async () => {
      const res = await complianceApi.getComplianceEvents(params ? toValue(params) : {});
      return res.data;
    },
  });
}

/**
 * Hook query detail Compliance Event.
 */
export function useComplianceEventDetailQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => COMPLIANCE_KEYS.detail(id)),
    queryFn: async () => {
      const actualId = toValue(id);
      if (!actualId) return null;
      const res = await complianceApi.getComplianceEventById(actualId);
      return res.data;
    },
    enabled: computed(() => !!toValue(id)),
  });
}

/**
 * Hook mutasi pembinaan (Coaching) atas Compliance Event (SAD §9.7).
 */
export function useCoachMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CoachPayload }) => {
      const res = await complianceApi.coach(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_KEYS.all });
    },
  });
}

/**
 * Hook mutasi pencatatan surat peringatan formal (Record Warning).
 */
export function useRecordWarningMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RecordWarningPayload }) => {
      const res = await complianceApi.recordWarning(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_KEYS.all });
    },
  });
}

/**
 * Hook mutasi eskalasi proses formal (Escalate Formal).
 */
export function useEscalateFormalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: EscalateFormalPayload }) => {
      const res = await complianceApi.escalateFormal(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_KEYS.all });
    },
  });
}
