import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { blockersApi, type QueryBlockersParams } from '../api/blockers.api.js';
import type { CreateBlockerPayload } from '../types/daily-records.js';
import type {
  UpdateBlockerProgressPayload,
  ResolveBlockerPayload,
  AddSupportContributionPayload,
} from '../types/management.js';
import { DAILY_RECORDS_KEYS } from './useDailyRecords.js';

export const BLOCKER_KEYS = {
  all: ['blockers'] as const,
  owners: () => [...BLOCKER_KEYS.all, 'owners'] as const,
  list: (params?: QueryBlockersParams) => [...BLOCKER_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...BLOCKER_KEYS.all, 'detail', id] as const,
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

/**
 * Hook query daftar blocker (Blocker Queue / Pulse).
 */
export function useBlockersListQuery(params?: QueryBlockersParams) {
  return useQuery({
    queryKey: BLOCKER_KEYS.list(params),
    queryFn: async () => {
      const res = await blockersApi.getBlockers(params);
      return res.data;
    },
  });
}

/**
 * Hook query detail blocker.
 */
export function useBlockerDetailQuery(id: string) {
  return useQuery({
    queryKey: BLOCKER_KEYS.detail(id),
    queryFn: async () => {
      const res = await blockersApi.getBlockerById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook mutasi acknowledge blocker (SAD §10.4).
 */
export function useAcknowledgeBlockerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await blockersApi.acknowledge(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi update progress blocker.
 */
export function useUpdateBlockerProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateBlockerProgressPayload }) => {
      const res = await blockersApi.updateProgress(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi resolve blocker dengan root cause.
 */
export function useResolveBlockerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResolveBlockerPayload }) => {
      const res = await blockersApi.resolve(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi accept risk blocker.
 */
export function useAcceptRiskBlockerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResolveBlockerPayload }) => {
      const res = await blockersApi.acceptRisk(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi close blocker oleh pelapor.
 */
export function useCloseBlockerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await blockersApi.close(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi add support contribution blocker.
 */
export function useSupportContributionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AddSupportContributionPayload }) => {
      const res = await blockersApi.addSupportContribution(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKER_KEYS.all });
    },
  });
}
