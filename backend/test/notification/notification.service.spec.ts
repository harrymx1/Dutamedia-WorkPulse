import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { NotificationService } from '../../src/modules/notification/notification.service.js';
import type { PrismaService } from '../../src/modules/prisma/prisma.service.js';

describe('NotificationService (SAD §5.10, §10.10, §12.2)', () => {
  let notificationService: NotificationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      notification: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    };
    notificationService = new NotificationService(
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('dispatch (SAD §12.2, EPIC-13-T1, EPIC-13-T2)', () => {
    it('harus membuat notifikasi WebNotificationCenter secara default jika channel tidak ditentukan', async () => {
      const mockCreated = {
        id: 'notif-uuid-1',
        recipientUserId: 'user-uuid-1',
        triggerType: 'AMBER_SUPPORT_NEEDED',
        relatedEntityType: 'Blocker',
        relatedEntityId: 'b-uuid-1',
        channel: NotificationChannel.WebNotificationCenter,
        payload: {
          title: 'Perhatian Blocker AMBER',
          body: 'Bantuan diperlukan',
          linkPath: '/team/blockers/b-uuid-1',
        },
        status: NotificationStatus.Sent,
        sentAt: new Date(),
        readAt: null,
        createdAt: new Date(),
      };

      mockPrisma.notification.findFirst.mockResolvedValue(null);
      mockPrisma.notification.create.mockResolvedValue(mockCreated);

      const result = await notificationService.dispatch({
        triggerType: 'AMBER_SUPPORT_NEEDED',
        recipientUserId: 'user-uuid-1',
        relatedEntityType: 'Blocker',
        relatedEntityId: 'b-uuid-1',
        payload: {
          title: 'Perhatian Blocker AMBER',
          body: 'Bantuan diperlukan',
          linkPath: '/team/blockers/b-uuid-1',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreated);
      expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith({
        where: {
          recipientUserId: 'user-uuid-1',
          triggerType: 'AMBER_SUPPORT_NEEDED',
          relatedEntityId: 'b-uuid-1',
          channel: NotificationChannel.WebNotificationCenter,
        },
      });
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recipientUserId: 'user-uuid-1',
          triggerType: 'AMBER_SUPPORT_NEEDED',
          channel: NotificationChannel.WebNotificationCenter,
          status: NotificationStatus.Sent,
        }),
      });
    });

    it('harus menjamin WebNotificationCenter selalu disertakan dan mengirim ke seluruh channel target (SAD §12.1)', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);
      mockPrisma.notification.create
        .mockResolvedValueOnce({
          id: 'notif-email',
          channel: NotificationChannel.Email,
        })
        .mockResolvedValueOnce({
          id: 'notif-web',
          channel: NotificationChannel.WebNotificationCenter,
        });

      const result = await notificationService.dispatch({
        triggerType: 'BLOCKER_CRITICAL_RAISED',
        recipientUserId: 'user-uuid-1',
        relatedEntityType: 'Blocker',
        relatedEntityId: 'b-uuid-2',
        channel: NotificationChannel.Email,
        payload: {
          title: 'Blocker Critical',
          body: 'Deployment error',
          linkPath: '/team/blockers/b-uuid-2',
        },
      });

      expect(result).toHaveLength(2);
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
    });

    it('harus mengabaikan pengiriman (skip) jika kombinasi (triggerType, relatedEntityId, channel, recipient) sudah ada (Idempotency SAD §12.2)', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'existing-notif',
        triggerType: 'AMBER_SUPPORT_NEEDED',
        relatedEntityId: 'b-uuid-1',
        channel: NotificationChannel.WebNotificationCenter,
      });

      const result = await notificationService.dispatch({
        triggerType: 'AMBER_SUPPORT_NEEDED',
        recipientUserId: 'user-uuid-1',
        relatedEntityType: 'Blocker',
        relatedEntityId: 'b-uuid-1',
        payload: {
          title: 'Duplicate Trigger',
          body: 'Should be skipped',
          linkPath: '/team/blockers/b-uuid-1',
        },
      });

      expect(result).toHaveLength(0);
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('harus mendukung eksekusi dalam transaction prisma (tx)', async () => {
      const mockTx = {
        notification: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'tx-notif' }),
        },
      };

      const result = await notificationService.dispatch(
        {
          triggerType: 'CORRECTION_APPLIED',
          recipientUserId: 'user-uuid-1',
          relatedEntityType: 'CorrectionRequest',
          relatedEntityId: 'cr-uuid-1',
          payload: {
            title: 'Koreksi Disetujui',
            body: 'Status telah diperbarui',
            linkPath: '/my-history',
          },
        },
        mockTx as any,
      );

      expect(result).toHaveLength(1);
      expect(mockTx.notification.findFirst).toHaveBeenCalled();
      expect(mockTx.notification.create).toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('getNotifications (SAD §10.10, EPIC-13-T3)', () => {
    it('harus mengembalikan daftar notifikasi terpaginasi beserta unreadCount untuk recipient', async () => {
      const mockItems = [
        {
          id: 'n1',
          recipientUserId: 'user-1',
          status: NotificationStatus.Sent,
          createdAt: new Date('2026-09-16T10:00:00Z'),
        },
        {
          id: 'n2',
          recipientUserId: 'user-1',
          status: NotificationStatus.Read,
          createdAt: new Date('2026-09-16T09:00:00Z'),
        },
      ];

      mockPrisma.notification.findMany.mockResolvedValue(mockItems);
      mockPrisma.notification.count
        .mockResolvedValueOnce(2) // totalItems
        .mockResolvedValueOnce(1); // unreadCount

      const result = await notificationService.getNotifications('user-1', {
        page: 1,
        pageSize: 20,
      });

      expect(result.data).toEqual(mockItems);
      expect(result.meta.unreadCount).toBe(1);
      expect(result.meta.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
      });
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { recipientUserId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('harus memfilter hanya yang unread jika query unreadOnly=true', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      await notificationService.getNotifications('user-1', {
        unreadOnly: true,
        page: 2,
        pageSize: 10,
      });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          recipientUserId: 'user-1',
          status: NotificationStatus.Sent,
        },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('markAsRead (SAD §10.10, EPIC-13-T3)', () => {
    it('harus menandai notifikasi sebagai Read dan mencatat readAt', async () => {
      const existing = {
        id: 'n-1',
        recipientUserId: 'user-1',
        status: NotificationStatus.Sent,
      };

      const updated = {
        id: 'n-1',
        recipientUserId: 'user-1',
        status: NotificationStatus.Read,
        readAt: new Date(),
      };

      mockPrisma.notification.findUnique.mockResolvedValue(existing);
      mockPrisma.notification.update.mockResolvedValue(updated);

      const result = await notificationService.markAsRead('n-1', 'user-1');

      expect(result.status).toBe(NotificationStatus.Read);
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: {
          status: NotificationStatus.Read,
          readAt: expect.any(Date),
        },
      });
    });

    it('harus mengembalikan objek langsung tanpa update jika sudah berstatus Read (idempotent)', async () => {
      const existing = {
        id: 'n-1',
        recipientUserId: 'user-1',
        status: NotificationStatus.Read,
        readAt: new Date('2026-09-16T08:00:00Z'),
      };

      mockPrisma.notification.findUnique.mockResolvedValue(existing);

      const result = await notificationService.markAsRead('n-1', 'user-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });

    it('harus melempar NotFoundException jika notifikasi tidak ditemukan', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        notificationService.markAsRead('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus melempar NotFoundException jika notifikasi milik user lain (isolasi scope SAD §7.7/§8.7)', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'n-1',
        recipientUserId: 'user-other',
        status: NotificationStatus.Sent,
      });

      await expect(
        notificationService.markAsRead('n-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead (SAD §10.10, EPIC-13-T3)', () => {
    it('harus menandai seluruh notifikasi Sent milik user menjadi Read dan mengembalikan updatedCount', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await notificationService.markAllAsRead('user-1');

      expect(result).toEqual({ updatedCount: 5 });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          recipientUserId: 'user-1',
          status: NotificationStatus.Sent,
        },
        data: {
          status: NotificationStatus.Read,
          readAt: expect.any(Date),
        },
      });
    });
  });
});
