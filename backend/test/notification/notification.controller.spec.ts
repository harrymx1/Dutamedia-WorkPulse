import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationStatus } from '@prisma/client';
import { NotificationController } from '../../src/modules/notification/notification.controller.js';

describe('NotificationController (SAD §10.10 - EPIC-13)', () => {
  let controller: NotificationController;
  let mockNotificationService: any;

  beforeEach(() => {
    mockNotificationService = {
      getNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    };
    controller = new NotificationController(mockNotificationService);
  });

  describe('getNotifications (GET /api/v1/notifications)', () => {
    it('harus memanggil notificationService.getNotifications dengan userId dan query', async () => {
      const mockResult = {
        data: [{ id: 'notif-1', status: NotificationStatus.Sent }],
        meta: {
          unreadCount: 1,
          pagination: {
            page: 1,
            pageSize: 20,
            totalItems: 1,
            totalPages: 1,
          },
        },
      };

      mockNotificationService.getNotifications.mockResolvedValue(mockResult);

      const query = { unreadOnly: true, page: 1, pageSize: 20 };
      const result = await controller.getNotifications('user-1', query);

      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(
        'user-1',
        query,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('markRead (POST /api/v1/notifications/:id/mark-read)', () => {
    it('harus memanggil notificationService.markAsRead dengan id dan userId', async () => {
      const mockUpdated = {
        id: 'notif-1',
        status: NotificationStatus.Read,
        readAt: new Date(),
      };

      mockNotificationService.markAsRead.mockResolvedValue(mockUpdated);

      const result = await controller.markRead('notif-1', 'user-1');

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(
        'notif-1',
        'user-1',
      );
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('markAllRead (POST /api/v1/notifications/mark-all-read)', () => {
    it('harus memanggil notificationService.markAllAsRead dengan userId', async () => {
      const mockResult = { updatedCount: 3 };
      mockNotificationService.markAllAsRead.mockResolvedValue(mockResult);

      const result = await controller.markAllRead('user-1');

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockResult);
    });
  });
});
