import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import {
  managerNotesApi,
  type QueryManagerNotesParams,
} from '../api/manager-notes.api.js';
import type { CreateManagerNotePayload } from '../types/management.js';

export const MANAGER_NOTE_KEYS = {
  all: ['manager-notes'] as const,
  list: (params?: MaybeRefOrGetter<QueryManagerNotesParams | undefined>) =>
    [...MANAGER_NOTE_KEYS.all, 'list', params ? toValue(params) : undefined] as const,
};

/**
 * Hook query daftar catatan manajerial.
 */
export function useManagerNotesQuery(
  params?: MaybeRefOrGetter<QueryManagerNotesParams | undefined>,
) {
  return useQuery({
    queryKey: computed(() => MANAGER_NOTE_KEYS.list(params)),
    queryFn: async () => {
      const res = await managerNotesApi.getManagerNotes(params ? toValue(params) : {});
      return res.data;
    },
  });
}

/**
 * Hook mutasi pembuatan catatan manajerial baru (Coaching, Recognition, Corrective).
 */
export function useCreateManagerNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateManagerNotePayload) => {
      const res = await managerNotesApi.createManagerNote(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_NOTE_KEYS.all });
    },
  });
}
