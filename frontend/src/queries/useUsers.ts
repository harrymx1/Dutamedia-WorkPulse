import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { identityApi } from '../api/identity.api.js';
import { authApi } from '../api/auth.api.js';
import type {
  QueryUsersParams,
  CreateUserPayload,
  UpdateUserStatusPayload,
  CreateOrgAssignmentPayload,
  CreateProjectAuthorityPayload,
  UpdateProjectAuthorityPayload,
  CreateTempReviewerPayload,
  QueryTempReviewersParams,
} from '../types/identity.js';

export const USER_KEYS = {
  all: ['users'] as const,
  list: (params?: MaybeRefOrGetter<QueryUsersParams | undefined>) =>
    [...USER_KEYS.all, 'list', params ? toValue(params) : undefined] as const,
  detail: (id: MaybeRefOrGetter<string>) =>
    [...USER_KEYS.all, 'detail', toValue(id)] as const,
  assignments: (userId: MaybeRefOrGetter<string>) =>
    [...USER_KEYS.all, 'assignments', toValue(userId)] as const,
  tempReviewers: (params?: MaybeRefOrGetter<QueryTempReviewersParams | undefined>) =>
    [...USER_KEYS.all, 'tempReviewers', params ? toValue(params) : undefined] as const,
};

/**
 * Hook query daftar pengguna dengan filter dan pagination (SAD §10.2).
 */
export function useUsersQuery(params?: MaybeRefOrGetter<QueryUsersParams | undefined>) {
  return useQuery({
    queryKey: computed(() => USER_KEYS.list(params)),
    queryFn: async () => {
      const res = await identityApi.getUsers(params ? toValue(params) : undefined);
      return res.data;
    },
  });
}

/**
 * Hook query detail pengguna tunggal.
 */
export function useUserDetailQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => USER_KEYS.detail(id)),
    queryFn: async () => {
      const userId = toValue(id);
      if (!userId) return null;
      const res = await identityApi.getUserById(userId);
      return res.data;
    },
    enabled: computed(() => !!toValue(id)),
  });
}

/**
 * Hook query riwayat penugasan organisasi (Organizational Assignments) per user.
 */
export function useUserAssignmentsQuery(userId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => USER_KEYS.assignments(userId)),
    queryFn: async () => {
      const id = toValue(userId);
      if (!id) return [];
      const res = await identityApi.getOrganizationalAssignments(id);
      return res.data;
    },
    enabled: computed(() => !!toValue(userId)),
  });
}

/**
 * Hook query daftar penugasan Reviewer Sementara (ADR-002, melengkapi SAD §10.2).
 */
export function useTempReviewersQuery(
  params?: MaybeRefOrGetter<QueryTempReviewersParams | undefined>,
) {
  return useQuery({
    queryKey: computed(() => USER_KEYS.tempReviewers(params)),
    queryFn: async () => {
      const p = params ? toValue(params) : undefined;
      const res = await identityApi.getTemporaryReviewerAssignments(p);
      return res.data;
    },
  });
}

/**
 * Hook mutasi pembuatan user baru (SAD §10.2, FR-22, FR-50).
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const res = await identityApi.createUser(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi pembaruan status aktif/non-aktif user (SAD §10.2, FR-22).
 */
export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserStatusPayload;
    }) => {
      const res = await identityApi.updateUserStatus(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penugasan organisasi baru (SAD §10.2, BR-10).
 */
export function useCreateOrgAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrgAssignmentPayload) => {
      const res = await identityApi.createOrganizationalAssignment(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penugasan Project Authority (SAD §10.2).
 */
export function useCreateProjectAuthorityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProjectAuthorityPayload) => {
      const res = await identityApi.createProjectAuthorityMapping(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi pengakhiran Project Authority (SAD §10.2).
 */
export function useUpdateProjectAuthorityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProjectAuthorityPayload;
    }) => {
      const res = await identityApi.updateProjectAuthorityMapping(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi penugasan Temporary Reviewer (SAD §10.2, BR-11).
 */
export function useCreateTempReviewerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTempReviewerPayload) => {
      const res = await identityApi.createTemporaryReviewerAssignment(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook mutasi reset password oleh SystemAdmin (SAD §10.1, FR-50).
 */
export function useAdminResetPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await authApi.adminResetPassword(userId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

