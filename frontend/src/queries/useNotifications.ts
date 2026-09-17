import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { type Ref, unref } from 'vue';
import { notificationsApi } from '../api/notifications.api.js';
import type { QueryNotificationsParams } from '../types/notifications.js';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: QueryNotificationsParams) =>
    [...NOTIFICATION_KEYS.all, 'list', params] as const,
};

/**
 * Hook query daftar notifikasi (SAD §16.5, §17.3). Polling setiap 15 detik.
 */
export function useNotificationsQuery(
  params?: Ref<QueryNotificationsParams> | QueryNotificationsParams,
) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(unref(params)),
    queryFn: async () => {
      const p = unref(params);
      const res = await notificationsApi.getNotifications(p);
      return res.data;
    },
    staleTime: 1000 * 30,
    refetchInterval: () =>
      typeof document !== 'undefined' && document.hidden ? false : 60_000, // 60 detik polling (SAD §17.3)
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook mutasi menandai satu notifikasi telah dibaca.
 */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await notificationsApi.markAsRead(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

/**
 * Hook mutasi menandai semua notifikasi telah dibaca.
 */
export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await notificationsApi.markAllAsRead();
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}
