import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { policiesApi } from '../api/policies.api.js';
import type { PolicyCategory, CreatePolicyPayload } from '../types/management.js';

export const POLICY_KEYS = {
  all: ['policies'] as const,
  list: (category?: MaybeRefOrGetter<PolicyCategory | undefined>) =>
    [...POLICY_KEYS.all, 'list', category ? toValue(category) : undefined] as const,
  history: (category: MaybeRefOrGetter<PolicyCategory>) =>
    [...POLICY_KEYS.all, 'history', toValue(category)] as const,
};

/**
 * Hook query daftar kebijakan aktif.
 */
export function usePoliciesQuery(category?: MaybeRefOrGetter<PolicyCategory | undefined>) {
  return useQuery({
    queryKey: computed(() => POLICY_KEYS.list(category)),
    queryFn: async () => {
      const res = await policiesApi.getPolicies(category ? toValue(category) : undefined);
      return res.data.policies;
    },
  });
}

/**
 * Hook query riwayat versi kebijakan per kategori (PolicyVersionHistory).
 */
export function usePolicyHistoryQuery(category: MaybeRefOrGetter<PolicyCategory>) {
  return useQuery({
    queryKey: computed(() => POLICY_KEYS.history(category)),
    queryFn: async () => {
      const cat = toValue(category);
      if (!cat) return [];
      const res = await policiesApi.getPolicyHistory(cat);
      return res.data.history;
    },
    enabled: computed(() => !!toValue(category)),
  });
}

/**
 * Hook mutasi pembaruan/penerbitan versi baru kebijakan.
 */
export function useCreatePolicyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePolicyPayload) => {
      const res = await policiesApi.createPolicy(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_KEYS.all });
    },
  });
}
