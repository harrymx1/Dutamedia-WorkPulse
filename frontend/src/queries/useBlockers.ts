import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { blockersApi } from '../api/blockers.api.js';
import type { CreateBlockerPayload } from '../types/daily-records.js';
import { DAILY_RECORDS_KEYS } from './useDailyRecords.js';

export const BLOCKER_KEYS = {
  all: ['blockers'] as const,
  owners: () => [...BLOCKER_KEYS.all, 'owners'] as const,
};

/**
 * Hook mutasi pembuatan Instant Blocker (SAD §10.5, UI/UX Spec §4.5).
 */
export function useCreateBlockerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBlockerPayload) => {
      const res = await blockersApi.createBlocker(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_KEYS.today() });
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}

/**
 * Hook query opsi target pemilik wewenang blocker (Organizational & Project Authority).
 */
export function useBlockerOwnersQuery() {
  return useQuery({
    queryKey: BLOCKER_KEYS.owners(),
    queryFn: async () => {
      const res = await blockersApi.getPotentialOwners();
      return res.data.users;
    },
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}
