import { ref } from 'vue';
import { apiClient } from '../api/client';

const globalUnreadCount = ref<number>(0);
let inFlightPromise: Promise<number> | null = null;

export function useUnreadNotifications() {
  async function refreshUnreadCount(): Promise<number> {
    if (inFlightPromise) return inFlightPromise;

    inFlightPromise = (async () => {
      try {
        const countRes = await apiClient<{ unreadCount?: number }>('/notifications/unread-count').catch(() => null);
        const directCount =
          typeof countRes?.data?.unreadCount === 'number'
            ? countRes.data.unreadCount
            : typeof (countRes as any)?.unreadCount === 'number'
              ? (countRes as any).unreadCount
              : null;

        if (directCount !== null) {
          globalUnreadCount.value = Math.max(0, directCount);
          return globalUnreadCount.value;
        }

        const listRes = await apiClient<any>('/notifications').catch(() => null);
        const payload: any = listRes?.data ?? listRes;
        if (typeof payload?.unreadCount === 'number') {
          globalUnreadCount.value = Math.max(0, payload.unreadCount);
          return globalUnreadCount.value;
        }
        const rows: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : [];
        const computedUnread = rows.filter((n) => {
          const isRead = typeof n?.read === 'boolean' ? n.read : Boolean(n?.readAt);
          return !isRead;
        }).length;
        globalUnreadCount.value = Math.max(0, computedUnread);
        return globalUnreadCount.value;
      } catch {
        return globalUnreadCount.value;
      } finally {
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  }

  function setUnreadCount(count: number) {
    globalUnreadCount.value = Math.max(0, Number.isFinite(count) ? count : 0);
  }

  function decrementUnreadCount(step = 1) {
    globalUnreadCount.value = Math.max(0, globalUnreadCount.value - step);
  }

  function resetUnreadCount() {
    globalUnreadCount.value = 0;
  }

  return {
    globalUnreadCount,
    refreshUnreadCount,
    setUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
  };
}
