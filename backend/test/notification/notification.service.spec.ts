import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { NotificationService } from '../../src/modules/notification/notification.service.js';
import {
  NotificationPriorityTier,
  SystemNotificationTrigger,
  TRIGGER_DEFINITIONS,
} from '../../src/modules/notification/constants/notification-trigger.constants.js';

describe('NotificationService (SAD §5.10, §10.10, §12.1 - §12.6, EPIC-13)', () => {
  let notificationService: NotificationService;
  let mockPrisma: any;
  let mockBrevoEmailService: any;
  let mockBrowserPushService: any;

  beforeEach(() => {
    mockPrisma = {
      notification: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-uuid-1',
          email: 'budi@dutamedia.com',
          fullName: 'Budi Santoso',
        }),
        findMany: vi.fn().mockResolvedValue([
          { id: 'admin-uuid-1', email: 'admin@dutamedia.com' },
        ]),
      },
    };

    mockBrevoEmailService = {
      sendEmail: vi.fn().mockResolvedValue({
        success: true,
        messageId: 'mock-brevo-msg-id',
      }),
    };

    mockBrowserPushService = {
      sendPushNotification: vi.fn().mockResolvedValue({
        success: true,
        stubbed: true,
      }),
    };

    notificationService = new NotificationService(
      mockPrisma as any,
      mockBrevoEmailService as any,
      mockBrowserPushService as any,
    );
  });

  describe('dispatch (SAD §12.2, EPIC-13-T1, EPIC-13-T2, EPIC-13-T4)', () => {
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
        triggerType: SystemNotificationTrigger.RED_STATUS,
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
      expect(mockBrevoEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          toEmail: 'budi@dutamedia.com',
          subject: 'Blocker Critical',
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
    });

    it('harus mencatat status Failed pada channel Email jika Brevo gagal mengirim tanpa melempar exception (SAD §12.2)', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);
      mockBrevoEmailService.sendEmail.mockResolvedValue({
        success: false,
        error: 'Brevo API rejected invalid address',
      });

      mockPrisma.notification.create.mockResolvedValue({
        id: 'notif-failed',
        status: NotificationStatus.Failed,
      });

      await notificationService.dispatch({
        triggerType: SystemNotificationTrigger.RED_STATUS,
        recipientUserId: 'user-uuid-1',
        channel: NotificationChannel.Email,
        payload: {
          title: 'Test Failed Send',
          body: 'Testing failure handling',
          linkPath: '/test',
        },
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          channel: NotificationChannel.Email,
          status: NotificationStatus.Failed,
          sentAt: null,
        }),
      });
    });

    it('harus memanggil BrowserPushService saat channel BrowserPush diminta (SAD §12.4, EPIC-13-T6)', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);
      mockPrisma.notification.create.mockResolvedValue({
        id: 'notif-push',
        channel: NotificationChannel.BrowserPush,
      });

      await notificationService.dispatch({
        triggerType: SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
        recipientUserId: 'user-uuid-1',
        channel: NotificationChannel.BrowserPush,
        payload: {
          title: 'Pengingat Cutoff',
          body: 'Waktu tersisa 15 menit',
          linkPath: '/my-today',
        },
      });

      expect(mockBrowserPushService.sendPushNotification).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({
          title: 'Pengingat Cutoff',
        }),
      );
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
          count: vi.fn().mockResolvedValue(0),
          create: vi.fn().mockResolvedValue({ id: 'tx-notif' }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'user-uuid-1',
            email: 'budi@dutamedia.com',
          }),
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

  describe('Volume Monitoring & 3-Tier Priority System (SAD §12.3, EPIC-13-T5)', () => {
    it('harus mengizinkan pengiriman email saat volume di bawah batas ambang (< 240 email/24h)', async () => {
      mockPrisma.notification.count.mockResolvedValue(100);

      const canSend = await notificationService.checkEmailQuotaAndTier(
        SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
      );

      expect(canSend).toBe(true);
    });

    it('harus mengirim alert ke Admin via WebNotificationCenter saat volume >= 240 (80%) (SAD §12.3)', async () => {
      mockPrisma.notification.count.mockResolvedValue(245);
      mockPrisma.notification.findFirst.mockResolvedValue(null); // belum ada alert baru

      await notificationService.checkEmailQuotaAndTier(
        SystemNotificationTrigger.RED_STATUS,
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recipientUserId: 'admin-uuid-1',
          triggerType: SystemNotificationTrigger.EMAIL_QUOTA_WARNING,
          channel: NotificationChannel.WebNotificationCenter,
        }),
      });
    });

    it('harus men-drop email Tier 3 saat volume >= 270 (90%) (SAD §12.3)', async () => {
      mockPrisma.notification.count.mockResolvedValue(275);

      // Trigger 1 (Cutoff reminder) & Trigger 7 (Weekly summary) adalah Tier 3
      const canSendTier3 = await notificationService.checkEmailQuotaAndTier(
        SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER,
      );

      expect(canSendTier3).toBe(false);

      // Namun Tier 1 (RED / Critical Blocker) tetap diizinkan
      const canSendTier1 = await notificationService.checkEmailQuotaAndTier(
        SystemNotificationTrigger.RED_STATUS,
      );
      expect(canSendTier1).toBe(true);
    });

    it('harus men-drop email Tier 2 saat volume >= 300 (100%), namun Tier 1 tetap dapat diproses', async () => {
      mockPrisma.notification.count.mockResolvedValue(300);

      // Trigger 2 (AMBER+support) adalah Tier 2
      const canSendTier2 = await notificationService.checkEmailQuotaAndTier(
        SystemNotificationTrigger.AMBER_SUPPORT_NEEDED,
      );
      expect(canSendTier2).toBe(false);

      // Trigger 4 (Critical Blocker) adalah Tier 1
      const canSendTier1 = await notificationService.checkEmailQuotaAndTier(
        SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER,
      );
      expect(canSendTier1).toBe(true);
    });

    it('saat Tier 3 di-drop dari email, WebNotificationCenter tetap dibuat (SAD §12.3)', async () => {
      mockPrisma.notification.count.mockResolvedValue(280); // >= 270
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      mockPrisma.notification.create.mockResolvedValue({
        id: 'web-only-notif',
        channel: NotificationChannel.WebNotificationCenter,
      });

      const result = await notificationService.dispatch({
        triggerType: SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER, // Tier 3
        recipientUserId: 'user-uuid-1',
        channel: NotificationChannel.Email,
        payload: {
          title: 'Ingat cutoff',
          body: 'Segera serahkan',
          linkPath: '/my-today',
        },
      });

      // Email di-drop, tetapi WebNotificationCenter tetap dibuat
      expect(result).toHaveLength(1);
      expect(result[0].channel).toBe(NotificationChannel.WebNotificationCenter);
      expect(mockBrevoEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('13 Trigger Mappings (SAD §12.1, §12.6, EPIC-13-T7)', () => {
    it('harus memvalidasi seluruh 13 trigger terdaftar dengan Priority Tier yang benar', () => {
      expect(
        TRIGGER_DEFINITIONS[SystemNotificationTrigger.RED_STATUS].priorityTier,
      ).toBe(NotificationPriorityTier.TIER_1);
      expect(
        TRIGGER_DEFINITIONS[SystemNotificationTrigger.CRITICAL_INSTANT_BLOCKER]
          .priorityTier,
      ).toBe(NotificationPriorityTier.TIER_1);
      expect(
        TRIGGER_DEFINITIONS[
          SystemNotificationTrigger.BLOCKER_UNACKNOWLEDGED_ESCALATION
        ].priorityTier,
      ).toBe(NotificationPriorityTier.TIER_1);

      expect(
        TRIGGER_DEFINITIONS[SystemNotificationTrigger.AMBER_SUPPORT_NEEDED]
          .priorityTier,
      ).toBe(NotificationPriorityTier.TIER_2);
      expect(
        TRIGGER_DEFINITIONS[
          SystemNotificationTrigger.CORRECTION_REQUEST_MATERIAL_SUBMITTED
        ].priorityTier,
      ).toBe(NotificationPriorityTier.TIER_2);
      expect(
        TRIGGER_DEFINITIONS[SystemNotificationTrigger.LEAVE_REQUEST_SUBMITTED]
          .priorityTier,
      ).toBe(NotificationPriorityTier.TIER_2);

      expect(
        TRIGGER_DEFINITIONS[
          SystemNotificationTrigger.MORNING_EOD_CUTOFF_REMINDER
        ].priorityTier,
      ).toBe(NotificationPriorityTier.TIER_3);
      expect(
        TRIGGER_DEFINITIONS[
          SystemNotificationTrigger.WEEKLY_SUMMARY_AVAILABLE
        ].priorityTier,
      ).toBe(NotificationPriorityTier.TIER_3);
    });

    it('dispatchTrigger harus menormalkan linkPath menjadi path relatif (SAD §12.6)', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);
      mockPrisma.notification.create.mockResolvedValue({
        id: 'trigger-notif',
        channel: NotificationChannel.WebNotificationCenter,
      });

      await notificationService.dispatchTrigger(
        SystemNotificationTrigger.LEAVE_REQUEST_RESOLVED,
        'user-uuid-1',
        {
          title: 'Cuti Disetujui',
          body: 'Permohonan cuti Anda disetujui',
          linkPath: 'my-history/exceptions', // tanpa slash awal
        },
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          payload: expect.objectContaining({
            linkPath: '/my-history/exceptions', // dinormalisasi jadi relative path dengan '/'
          }),
        }),
      });
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
