import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
  Prisma,
  Role,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BrevoEmailService } from './services/brevo-email.service.js';
import { BrowserPushService } from './services/browser-push.service.js';
import {
  NotificationPriorityTier,
  SystemNotificationTrigger,
  TRIGGER_DEFINITIONS,
  StandardNotificationPayload,
} from './constants/notification-trigger.constants.js';
import type { DispatchNotificationDto } from './dto/dispatch-notification.dto.js';
import type { QueryNotificationsDto } from './dto/query-notifications.dto.js';

export interface PaginatedNotificationsResult {
  data: Notification[];
  meta: {
    unreadCount: number;
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Batas kuota harian Brevo Free Tier (SAD §12.3)
  private readonly BREVO_DAILY_LIMIT = 300;
  private readonly BREVO_DROP_TIER3_THRESHOLD = 270; // 90% kuota
  private readonly BREVO_WARNING_THRESHOLD = 240; // 80% kuota

  constructor(
    private readonly prisma: PrismaService,
    private readonly brevoEmailService: BrevoEmailService,
    private readonly browserPushService: BrowserPushService,
  ) {}

  /**
   * Universal dispatch mechanism dengan idempotency check (SAD §5.10, §12.2).
   * Menjamin minimal satu baris WebNotificationCenter selalu tercatat (SAD §12.1).
   * Mendukung transactional execution saat dipanggil bersamaan dengan mutasi domain.
   */
  async dispatch(
    dto: DispatchNotificationDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Notification[]> {
    const client = tx ?? this.prisma;

    // Resolusi channel: pastikan WebNotificationCenter selalu disertakan (SAD §12.1)
    const rawChannels: NotificationChannel[] =
      dto.channels && dto.channels.length > 0
        ? dto.channels
        : dto.channel
          ? [dto.channel]
          : [NotificationChannel.WebNotificationCenter];

    const targetChannels = Array.from(
      new Set([...rawChannels, NotificationChannel.WebNotificationCenter]),
    );

    const createdNotifications: Notification[] = [];

    for (const channel of targetChannels) {
      // 1. Idempotency check: (triggerType, relatedEntityId, channel) per recipient (SAD §12.2)
      if (dto.relatedEntityId) {
        const existing = await client.notification.findFirst({
          where: {
            recipientUserId: dto.recipientUserId,
            triggerType: dto.triggerType,
            relatedEntityId: dto.relatedEntityId,
            channel,
          },
        });

        if (existing) {
          this.logger.debug(
            `Idempotency skip: [${dto.triggerType}] entity=${dto.relatedEntityId} channel=${channel} recipient=${dto.recipientUserId}`,
          );
          continue;
        }
      }

      // 2. Pemeriksaan kuota Brevo Email & priority tier (SAD §12.3, EPIC-13-T5)
      if (channel === NotificationChannel.Email) {
        const canSend = await this.checkEmailQuotaAndTier(
          dto.triggerType,
          client,
        );
        if (!canSend) {
          this.logger.log(
            `Channel Email untuk [${dto.triggerType}] dilewati demi prioritas kuota harian. WebNotificationCenter tetap dibuat.`,
          );
          continue;
        }
      }

      // 3. Status awal
      let status: NotificationStatus = NotificationStatus.Sent;
      let sentAt: Date | null = new Date();

      // 4. Pengiriman aktual berdasarkan channel (SAD §12.2)
      if (channel === NotificationChannel.Email) {
        const recipient = await client.user.findUnique({
          where: { id: dto.recipientUserId },
          select: { email: true, fullName: true },
        });

        if (recipient?.email) {
          const emailResult = await this.brevoEmailService.sendEmail({
            toEmail: recipient.email,
            toName: recipient.fullName,
            subject: dto.payload.title,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #1976d2; margin-top: 0;">${dto.payload.title}</h2>
                <p style="font-size: 15px;">${dto.payload.body}</p>
                <div style="margin: 25px 0;">
                  <a href="${dto.payload.linkPath}" style="background-color: #1976d2; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Lihat di WorkPulse</a>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #777;">Notifikasi otomatis dari WorkPulse — Daily Accountability & Blocker Log System (Dutamedia).</p>
              </div>
            `,
            textContent: `${dto.payload.title}\n\n${dto.payload.body}\n\nTautan: ${dto.payload.linkPath}`,
          });

          // SAD §12.2: Gagal kirim eksternal -> status=Failed, dicatat ke log, tidak retry otomatis
          if (!emailResult.success) {
            status = NotificationStatus.Failed;
            sentAt = null;
            this.logger.error(
              `Kirim email Brevo gagal untuk recipient=${dto.recipientUserId}: ${emailResult.error}`,
            );
          }
        } else {
          this.logger.warn(
            `Recipient user ${dto.recipientUserId} tidak memiliki email terdaftar`,
          );
          status = NotificationStatus.Failed;
          sentAt = null;
        }
      } else if (channel === NotificationChannel.BrowserPush) {
        // Stub Browser Push (SAD §12.4, EPIC-13-T6)
        await this.browserPushService.sendPushNotification(
          dto.recipientUserId,
          dto.payload as unknown as StandardNotificationPayload,
        );
      }

      // 5. Insert baris Notification ke database
      const record = await client.notification.create({
        data: {
          recipientUserId: dto.recipientUserId,
          triggerType: dto.triggerType,
          relatedEntityType: dto.relatedEntityType ?? null,
          relatedEntityId: dto.relatedEntityId ?? null,
          channel,
          payload: dto.payload as unknown as Prisma.InputJsonValue,
          status,
          sentAt,
          readAt: null,
        },
      });

      this.logger.log(
        `Notifikasi tercatat: [${dto.triggerType}] id=${record.id} channel=${channel} status=${status} recipient=${dto.recipientUserId}`,
      );

      createdNotifications.push(record);
    }

    return createdNotifications;
  }

  /**
   * Helper dispatch untuk seluruh 13 trigger resmi sistem (SAD §12.1, §12.6, EPIC-13-T7).
   */
  async dispatchTrigger(
    triggerType: SystemNotificationTrigger,
    recipientUserId: string,
    params: {
      title: string;
      body: string;
      linkPath: string;
      iconType?: string;
      metadata?: Record<string, unknown>;
    },
    relatedEntityType?: string,
    relatedEntityId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Notification[]> {
    const triggerDef = TRIGGER_DEFINITIONS[triggerType];
    const channels = triggerDef
      ? triggerDef.channels
      : [NotificationChannel.WebNotificationCenter];

    // linkPath wajib relative path (SAD §12.6)
    const normalizedLinkPath = params.linkPath.startsWith('/')
      ? params.linkPath
      : `/${params.linkPath}`;

    const payload: StandardNotificationPayload = {
      title: params.title,
      body: params.body,
      linkPath: normalizedLinkPath,
      iconType: params.iconType || triggerDef?.defaultIcon || 'bell-outline',
      metadata: params.metadata,
    };

    return this.dispatch(
      {
        triggerType,
        recipientUserId,
        relatedEntityType,
        relatedEntityId,
        channels,
        payload,
      },
      tx,
    );
  }

  /**
   * Volume monitoring 24 jam berjalan & sistem prioritas 3-tier (SAD §12.3, EPIC-13-T5).
   */
  async checkEmailQuotaAndTier(
    triggerType: string,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sentCount = await client.notification.count({
      where: {
        channel: NotificationChannel.Email,
        status: NotificationStatus.Sent,
        sentAt: { gte: twentyFourHoursAgo },
      },
    });

    const triggerDef =
      TRIGGER_DEFINITIONS[triggerType as SystemNotificationTrigger];
    const tier = triggerDef
      ? triggerDef.priorityTier
      : NotificationPriorityTier.TIER_2;

    // Alert ke Admin via WebNotificationCenter saat volume >= 240 (80%) (SAD §12.3)
    if (sentCount >= this.BREVO_WARNING_THRESHOLD) {
      await this.notifyAdminEmailQuotaWarning(sentCount, client);
    }

    // Tier 3 di-drop saat count >= 270 (90%)
    if (
      sentCount >= this.BREVO_DROP_TIER3_THRESHOLD &&
      tier === NotificationPriorityTier.TIER_3
    ) {
      this.logger.warn(
        `[VOLUME MONITOR] Email Tier 3 untuk trigger '${triggerType}' di-drop (${sentCount}/300 email dalam 24 jam). WebNotificationCenter tetap dibuat.`,
      );
      return false;
    }

    // Jika kuota habis (>= 300), hanya Tier 1 yang diizinkan
    if (
      sentCount >= this.BREVO_DAILY_LIMIT &&
      tier !== NotificationPriorityTier.TIER_1
    ) {
      this.logger.warn(
        `[VOLUME MONITOR] Kuota Brevo harian penuh (${sentCount}/300). Email ${tier} untuk '${triggerType}' di-drop.`,
      );
      return false;
    }

    return true;
  }

  /**
   * Mengirim notifikasi alert kuota email kepada Admin melalui WebNotificationCenter (SAD §12.3).
   */
  private async notifyAdminEmailQuotaWarning(
    currentCount: number,
    client: Prisma.TransactionClient | PrismaService,
  ): Promise<void> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentAlert = await client.notification.findFirst({
        where: {
          triggerType: SystemNotificationTrigger.EMAIL_QUOTA_WARNING,
          channel: NotificationChannel.WebNotificationCenter,
          createdAt: { gte: oneDayAgo },
        },
      });

      if (recentAlert) {
        return;
      }

      const admins = await client.user.findMany({
        where: {
          status: UserStatus.Active,
          organizationalAssignments: {
            some: {
              role: Role.SystemAdmin,
              endDate: null,
            },
          },
        },
        select: { id: true },
      });

      for (const admin of admins) {
        await client.notification.create({
          data: {
            recipientUserId: admin.id,
            triggerType: SystemNotificationTrigger.EMAIL_QUOTA_WARNING,
            channel: NotificationChannel.WebNotificationCenter,
            payload: {
              title: 'Peringatan Kuota Email Transaksional (Brevo)',
              body: `Volume email telah mencapai ${currentCount}/300 dalam 24 jam terakhir. Sistem memprioritaskan Tier 1 & Tier 2.`,
              linkPath: '/admin/users',
              iconType: 'email-alert',
            },
            status: NotificationStatus.Sent,
            sentAt: new Date(),
          },
        });
      }

      this.logger.warn(
        `Alert kuota email (${currentCount}/300) dikirimkan ke ${admins.length} administrator via WebNotificationCenter.`,
      );
    } catch (err) {
      this.logger.error(`Gagal mengirim alert kuota email: ${err}`);
    }
  }

  /**
   * Mengambil daftar notifikasi terpaginasi milik recipient (SAD §10.10, §7.5, §7.6).
   * Menghitung unreadCount untuk badge NotificationBell.
   */
  async getNotifications(
    recipientUserId: string,
    query: QueryNotificationsDto,
  ): Promise<PaginatedNotificationsResult> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.NotificationWhereInput = {
      recipientUserId,
    };

    if (query.unreadOnly) {
      where.status = NotificationStatus.Sent;
    }

    const [items, totalItems, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          recipientUserId,
          status: NotificationStatus.Sent,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      data: items,
      meta: {
        unreadCount,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      },
    };
  }

  /**
   * Menandai satu notifikasi sebagai telah dibaca (SAD §10.10).
   * Menolak akses jika notifikasi bukan milik user terkait (404 per SAD §7.7 / §8.7).
   */
  async markAsRead(id: string, recipientUserId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.recipientUserId !== recipientUserId) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    if (notification.status === NotificationStatus.Read) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        status: NotificationStatus.Read,
        readAt: new Date(),
      },
    });
  }

  /**
   * Menandai seluruh notifikasi unread milik pengguna sebagai telah dibaca (SAD §10.10).
   */
  async markAllAsRead(
    recipientUserId: string,
  ): Promise<{ updatedCount: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientUserId,
        status: NotificationStatus.Sent,
      },
      data: {
        status: NotificationStatus.Read,
        readAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }
}
