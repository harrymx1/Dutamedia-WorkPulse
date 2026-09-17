import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';
import type { NotificationItem, QueryNotificationsParams } from '../types/notifications.js';

export const notificationsApi = {
  /**
   * GET /api/v1/notifications
   */
  async getNotifications(
    params?: QueryNotificationsParams,
  ): Promise<ApiResponse<{ items: NotificationItem[]; total: number; unreadCount: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.unreadOnly !== undefined) {
      searchParams.set('unreadOnly', String(params.unreadOnly));
    }
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));

    const qs = searchParams.toString();
    return apiClient.get<{ items: NotificationItem[]; total: number; unreadCount: number }>(
      `/notifications${qs ? `?${qs}` : ''}`,
    );
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<ApiResponse<NotificationItem>> {
    return apiClient.patch<NotificationItem>(`/notifications/${id}/read`, {});
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.patch<{ count: number }>('/notifications/read-all', {});
  },
};
