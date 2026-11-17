import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { enrichLegacyBlockerNotification } from '../../daily/services/blocker.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil daftar notifikasi untuk pengguna (Prototipe 07) sekaligus memperkaya
   * notifikasi blocker lama yang masih terpotong atau belum terstruktur dari data tiket asli.
   */
  async getUserNotifications(userId: string, unreadOnly?: boolean) {
    const [rawNotifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          recipientUserId: userId,
          ...(unreadOnly && { readAt: null }),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: {
          recipientUserId: userId,
          readAt: null,
        },
      }),
    ]);

    const notifications = await this.enrichBlockerNotifications(rawNotifications);

    return {
      notifications,
      unreadCount,
    };
  }

  private async enrichBlockerNotifications(notifications: any[]): Promise<any[]> {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return notifications;
    }
    if (!(this.prisma as any).blockerTicket?.findMany) {
      return notifications;
    }

    const needsBlockerUpgrade = (n: any): boolean =>
      Boolean(
        n?.relatedEntityId &&
          (n.triggerType?.startsWith('BLOCKER_') || n.relatedEntityType === 'blocker_tickets') &&
          (!n.message?.includes('\n') ||
            n.message?.split('\n')[0]?.includes('"') ||
            n.message?.includes('Tindak Lanjut Anda:') ||
            n.message?.includes('Kategori & Keparahan:') ||
            !n.message?.includes('Pelapor:') ||
            n.title?.startsWith('Bantuan Ditolak Pelapor:') ||
            n.title?.startsWith('Bantuan Belum Mengatasi Kendala:') ||
            n.title?.startsWith('Bantuan Diterima (Belum Selesai):') ||
            n.title?.startsWith('Tiket Dikembalikan Pelapor:') ||
            n.message?.includes('Bantuan Ditolak Pelapor') ||
            n.message?.includes('Aksi Bantuan yang Ditolak:') ||
            n.message?.includes('menolak kontribusi bantuan') ||
            n.message?.includes('Alasan Pengembalian:') ||
            n.message?.includes('solusi atau arahan mitigasi belum memadai') ||
            n.message?.includes('Sedang Ditangani (')),
      );

    const legacyBlockerNotifs = notifications.filter(needsBlockerUpgrade);

    if (legacyBlockerNotifs.length === 0) {
      return notifications;
    }

    const blockerIds = Array.from(
      new Set(legacyBlockerNotifs.map((n) => n.relatedEntityId as string)),
    );

    const tickets = await this.prisma.blockerTicket.findMany({
      where: { id: { in: blockerIds } },
      include: {
        raisedBy: { select: { id: true, fullName: true } },
        assignedOwner: { select: { id: true, fullName: true } },
        supportContributions: {
          select: { actionTaken: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    const ticketById = new Map(tickets.map((t: any) => [t.id, t]));

    return Promise.all(
      notifications.map(async (notif) => {
        if (!needsBlockerUpgrade(notif)) {
          return notif;
        }
        const ticket = ticketById.get(notif.relatedEntityId);
        if (!ticket) {
          return notif;
        }
        const upgraded = enrichLegacyBlockerNotification(notif, ticket);
        if (!upgraded) {
          return notif;
        }
        if ((this.prisma as any).notification?.update && notif.id) {
          try {
            await this.prisma.notification.update({
              where: { id: notif.id },
              data: {
                title: upgraded.title,
                message: upgraded.message,
              },
            });
          } catch {
            // Abaikan error update persisten agar respon daftar notifikasi tetap aman
          }
        }
        return {
          ...notif,
          title: upgraded.title,
          message: upgraded.message,
        };
      }),
    );
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
  async testChannelDelivery(
    channel: NotificationChannel,
    testRecipient: string,
    eventType?: string,
  ) {
    return {
      success: true,
      channel,
      recipient: testRecipient,
      eventType: eventType || 'TEST_SIMULATION',
      message: `Simulasi pengiriman notifikasi berhasil dikirim ke saluran ${channel} (${testRecipient}).`,
      deliveredAt: this.clockService.now().toISOString(),
      latencyMs: 142,
    };
  }
}

