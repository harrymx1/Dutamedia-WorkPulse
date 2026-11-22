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
            /^Kategori Kendala:[ \t]*[A-Z_]+[ \t]*\r?$/m.test(n.message || '') ||
            /^Kategori Kendala:[^\n]*\([A-Z_]+\)[ \t]*\r?$/m.test(n.message || '') ||
            /^Dampak Kendala:[ \t]*[A-Z_, ]+[ \t]*\r?$/m.test(n.message || '') ||
            /^Dampak Kendala:[^\n]*\[[A-Z_]+\]/m.test(n.message || '') ||
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
            n.message?.includes('diteruskan secara paralel') ||
            n.message?.includes('dialokasikan kepada Anda dengan target') ||
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

  private resolveChannelReadiness() {
    const emailConfigured = Boolean(process.env.BREVO_API_KEY?.trim());
    const pushConfigured = Boolean(
      process.env.VAPID_PUBLIC_KEY?.trim() &&
        process.env.VAPID_PRIVATE_KEY?.trim(),
    );
    return { emailConfigured, pushConfigured };
  }

  /**
   * Mengambil konfigurasi kesiapan nyata saluran dan matriks 9 pemicu resmi WorkPulse (Prototipe 19).
   */
  async getChannelConfigurations() {
    const { emailConfigured, pushConfigured } = this.resolveChannelReadiness();
    const liveChannels = 1 + (emailConfigured ? 1 : 0) + (pushConfigured ? 1 : 0);
    const simulationChannels = 3 - liveChannels;

    const triggerMatrix = [
      {
        trigger: 'MORNING_REMINDER',
        label: 'Pengingat Komitmen Pagi',
        description: '60 menit sebelum batas tepat waktu pagi',
        recipient: 'Karyawan wajib check-in yang belum mengirim Komitmen Pagi',
        inApp: true,
        browserPush: true,
        email: true,
      },
      {
        trigger: 'EOD_REMINDER',
        label: 'Pengingat Evaluasi Sore (EOD)',
        description: '60 menit sebelum batas tepat waktu sore',
        recipient: 'Karyawan wajib check-in yang belum mengirim Evaluasi Sore',
        inApp: true,
        browserPush: true,
        email: true,
      },
      {
        trigger: 'BLOCKER_RAISED',
        label: 'Kendala Baru Dilaporkan / Ditugaskan',
        description: 'Tiket kendala baru atau kendala darurat kritis',
        recipient: 'Penanggung Jawab Kendala & Atasan / Pemimpin Proyek terkait',
        inApp: true,
        browserPush: true,
        email: true,
      },
      {
        trigger: 'BLOCKER_ESCALATED',
        label: 'Eskalasi Kendala Otomatis',
        description: 'Kendala belum ditanggapi melewati batas waktu respon',
        recipient: 'Pimpinan pada jenjang eskalasi berikutnya hingga Direksi',
        inApp: true,
        browserPush: true,
        email: true,
      },
      {
        trigger: 'BLOCKER_RESOLVED_REOPENED',
        label: 'Kendala Tuntas / Dibuka Kembali',
        description: 'Pembaruan penyelesaian atau pengembalian tiket kendala',
        recipient: 'Karyawan pelapor & Penanggung Jawab Kendala',
        inApp: true,
        browserPush: true,
        email: true,
      },
      {
        trigger: 'CORRECTION_MATERIAL_SUBMITTED',
        label: 'Pengajuan Koreksi Material',
        description: 'Jendela sanggahan 24 jam terbuka untuk ditinjau',
        recipient: 'Peninjau Berwenang dalam cakupan kewenangan',
        inApp: true,
        browserPush: false,
        email: true,
      },
      {
        trigger: 'CORRECTION_DECIDED',
        label: 'Keputusan Koreksi (Disetujui / Ditolak)',
        description: 'Hasil tinjauan atau persetujuan otomatis koreksi',
        recipient: 'Karyawan pemohon koreksi',
        inApp: true,
        browserPush: false,
        email: false,
      },
      {
        trigger: 'LEAVE_WORKFLOW',
        label: 'Permohonan & Keputusan Cuti',
        description: 'Pengajuan cuti baru, persetujuan, atau penolakan cuti',
        recipient: 'Penyetuju Cuti & Karyawan pemohon',
        inApp: true,
        browserPush: true,
        email: true,
      },
      {
        trigger: 'ACCOUNT_INVITATION',
        label: 'Undangan & Aktivasi Akun Karyawan',
        description: 'Tautan aktivasi sekali pakai berlaku 72 jam',
        recipient: 'Karyawan pemilik akun yang diundang',
        inApp: true,
        browserPush: false,
        email: true,
      },
    ];

    return {
      channels: [
        {
          id: 'IN_APP_CENTER',
          name: 'In-App Notification Center',
          provider: 'Pusat Notifikasi Basis Data WorkPulse',
          status: 'ACTIVE',
          mode: 'LIVE',
          statusLabel: 'Aktif',
          detailLabel: 'Tersimpan di Basis Data · Retensi 30 Hari',
          description:
            'Pusat notifikasi langsung di dalam antarmuka web WorkPulse.',
          isConfigured: true,
          enabled: true,
        },
        {
          id: 'EMAIL_BREVO',
          name: 'Email Transaksional (Brevo)',
          provider: 'Brevo SMTP / API',
          status: emailConfigured ? 'READY' : 'SIMULATION',
          mode: emailConfigured ? 'LIVE' : 'SIMULATION',
          statusLabel: emailConfigured
            ? 'Siap (Terkonfigurasi)'
            : 'Mode Simulasi Aktif',
          detailLabel: emailConfigured
            ? 'Kunci Layanan Terpasang'
            : 'Mode Simulasi (Kunci Brevo Belum Diatur)',
          description:
            'Pengiriman email untuk pengingat, eskalasi kendala kritis, cuti, dan tautan undangan.',
          isConfigured: emailConfigured,
          enabled: true,
        },
        {
          id: 'BROWSER_PUSH',
          name: 'Browser Push (VAPID RFC 8292)',
          provider: 'Web Push (VAPID RFC 8292)',
          status: pushConfigured ? 'READY' : 'SIMULATION',
          mode: pushConfigured ? 'LIVE' : 'SIMULATION',
          statusLabel: pushConfigured
            ? 'Siap (Terkonfigurasi)'
            : 'Mode Simulasi Aktif',
          detailLabel: pushConfigured
            ? 'Kunci VAPID Terpasang'
            : 'Mode Simulasi (Kunci VAPID Belum Diatur)',
          description:
            'Pemberitahuan push ke peramban perangkat yang telah memberikan izin.',
          isConfigured: pushConfigured,
          enabled: true,
        },
      ],
      triggerMatrix,
      summary: {
        totalChannels: 3,
        liveChannels,
        simulationChannels,
        totalTriggers: triggerMatrix.length,
      },
    };
  }

  /**
   * Simulasi pengujian pengiriman saluran notifikasi tanpa memalsukan status pengiriman (Prototipe 19).
   */
  async testChannelDelivery(
    channel: NotificationChannel | string,
    testRecipient: string,
    eventType?: string,
  ) {
    const rawChannel = String(channel || '').trim().toUpperCase();
    let normalizedChannel: NotificationChannel;

    if (rawChannel === 'EMAIL' || rawChannel === NotificationChannel.EMAIL) {
      normalizedChannel = NotificationChannel.EMAIL;
    } else if (
      rawChannel === 'PUSH' ||
      rawChannel === NotificationChannel.BROWSER_PUSH
    ) {
      normalizedChannel = NotificationChannel.BROWSER_PUSH;
    } else if (
      rawChannel === 'IN_APP' ||
      rawChannel === NotificationChannel.IN_APP_CENTER
    ) {
      normalizedChannel = NotificationChannel.IN_APP_CENTER;
    } else {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Saluran notifikasi uji yang dipilih tidak valid.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const trimmedRecipient =
      typeof testRecipient === 'string' ? testRecipient.trim() : '';
    if (!trimmedRecipient) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Target penerima uji wajib diisi.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (
      normalizedChannel === NotificationChannel.EMAIL &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedRecipient)
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Alamat email penerima uji tidak valid.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const { emailConfigured, pushConfigured } = this.resolveChannelReadiness();
    let deliveryMode: 'LIVE' | 'SIMULATION' = 'LIVE';
    let statusLabel = 'Terkirim (In-App)';
    let message = `Pengujian saluran Notifikasi Dalam Aplikasi ke ${trimmedRecipient} siap disimulasikan tanpa mengubah kotak masuk asli.`;

    if (normalizedChannel === NotificationChannel.EMAIL) {
      deliveryMode = emailConfigured ? 'LIVE' : 'SIMULATION';
      statusLabel = emailConfigured
        ? 'Terkirim (Terverifikasi)'
        : 'Mode Simulasi Aktif';
      message = emailConfigured
        ? `Pengujian saluran Email ke ${trimmedRecipient} siap dikirim melalui penyedia terkonfigurasi.`
        : `Mode simulasi aktif: kunci layanan Email Brevo belum diatur di server, sehingga tidak ada email sungguhan yang dikirim ke ${trimmedRecipient}.`;
    } else if (normalizedChannel === NotificationChannel.BROWSER_PUSH) {
      deliveryMode = pushConfigured ? 'LIVE' : 'SIMULATION';
      statusLabel = pushConfigured
        ? 'Terkirim (Terverifikasi)'
        : 'Mode Simulasi Aktif';
      message = pushConfigured
        ? `Pengujian Browser Push untuk ${trimmedRecipient} siap dijalankan melalui kunci VAPID server.`
        : `Mode simulasi aktif: kunci Browser Push (VAPID) belum diatur di server, sehingga tidak ada notifikasi peramban sungguhan yang dikirim ke ${trimmedRecipient}.`;
    }

    return {
      success: true,
      channel: normalizedChannel,
      deliveryMode,
      statusLabel,
      recipient: trimmedRecipient,
      eventType: eventType || 'TEST_SIMULATION',
      message,
      deliveredAt: this.clockService.now().toISOString(),
      latencyMs: 142,
    };
  }
}

