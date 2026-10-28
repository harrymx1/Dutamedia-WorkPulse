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
   * POST /api/v1/notifications/:id/mark-read (SAD §10.10)
   */
  async markAsRead(id: string): Promise<ApiResponse<NotificationItem>> {
    return apiClient.post<NotificationItem>(`/notifications/${id}/mark-read`);
  },

  /**
   * POST /api/v1/notifications/mark-all-read (SAD §10.10)
   */
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.post<{ count: number }>('/notifications/mark-all-read');
  },
};
