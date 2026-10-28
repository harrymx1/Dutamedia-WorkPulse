import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { profileApi } from '../api/profile.api.js';
import type { ResetPasswordPayload } from '../types/profile.js';

export const PROFILE_KEYS = {
  all: ['profile'] as const,
  me: () => [...PROFILE_KEYS.all, 'me'] as const,
  policies: () => [...PROFILE_KEYS.all, 'policies'] as const,
};

/**
 * Hook query profil lengkap pengguna dan kewenangan aktif.
 */
export function useMyProfileQuery() {
  return useQuery({
    queryKey: PROFILE_KEYS.me(),
    queryFn: async () => {
      const res = await profileApi.getMyProfile();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook query kebijakan aktif (cutoff, grace period, dsb).
 */
export function useActivePoliciesQuery() {
  return useQuery({
    queryKey: PROFILE_KEYS.policies(),
    queryFn: async () => {
      const res = await profileApi.getActivePolicies();
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook mutasi ganti password pengguna.
 */
export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const res = await profileApi.changePassword(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.me() });
    },
  });
}
