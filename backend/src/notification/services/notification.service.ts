import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil daftar notifikasi untuk pengguna (Prototipe 07).
   */
  async getUserNotifications(userId: string, unreadOnly?: boolean) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        recipientUserId: userId,
        ...(unreadOnly && { readAt: null }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: {
        recipientUserId: userId,
        readAt: null,
      },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Menandai satu notifikasi sebagai telah dibaca (read).
   */
  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Notifikasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (notif.recipientUserId !== userId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Tidak berwenang mengubah notifikasi pengguna lain.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const now = this.clockService.now();
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        readAt: now,
        status: NotificationStatus.READ,
      },
    });
  }

  /**
   * Menandai seluruh notifikasi pengguna sebagai telah dibaca.
   */
  async markAllAsRead(userId: string) {
    const now = this.clockService.now();
    return this.prisma.notification.updateMany({
      where: {
        recipientUserId: userId,
        readAt: null,
      },
      data: {
        readAt: now,
        status: NotificationStatus.READ,
      },
    });
  }

  /**
   * Mengambil konfigurasi matriks kanal notifikasi (Prototipe 19).
   */
  async getChannelConfigurations() {
    return {
      channels: [
        {
          id: 'IN_APP_CENTER',
          name: 'In-App Notification Center',
          status: 'ACTIVE',
          description: 'Notifikasi internal terpadu di dalam dashboard WorkPulse.',
          isConfigured: true,
        },
        {
          id: 'BROWSER_PUSH',
          name: 'Browser Web Push (VAPID)',
          status: 'ACTIVE',
          description: 'Notifikasi desktop langsung saat peramban web aktif.',
          isConfigured: true,
        },
        {
          id: 'EMAIL_BREVO',
          name: 'Transactional Email (Brevo SMTP)',
          status: 'ACTIVE',
          description: 'Pengiriman email resmi untuk peringatan cut-off, eskalasi darurat, dan ringkasan audit.',
          isConfigured: true,
        },
      ],
      triggerMatrix: [
        { trigger: 'BLOCKER_RAISED', inApp: true, browserPush: true, email: true },
        { trigger: 'BLOCKER_ESCALATED_L2', inApp: true, browserPush: true, email: true },
        { trigger: 'MANAGER_NOTE_SHARED', inApp: true, browserPush: false, email: false },
        { trigger: 'LEAVE_REQUESTED', inApp: true, browserPush: false, email: true },
        { trigger: 'CORRECTION_REQUESTED', inApp: true, browserPush: true, email: false },
      ],
    };
  }

  /**
   * Simulasi pengujian pengiriman kanal notifikasi (Prototipe 19).
   */
  async testChannelDelivery(channel: NotificationChannel, testRecipient: string) {
    return {
      success: true,
      channel,
      recipient: testRecipient,
      deliveredAt: this.clockService.now().toISOString(),
      latencyMs: 142,
    };
  }
}

