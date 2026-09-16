import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
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

  constructor(private readonly prisma: PrismaService) {}

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
      // Idempotency check: (triggerType, relatedEntityId, channel) per recipient
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

      // Insert baris Notification
      const record = await client.notification.create({
        data: {
          recipientUserId: dto.recipientUserId,
          triggerType: dto.triggerType,
          relatedEntityType: dto.relatedEntityType ?? null,
          relatedEntityId: dto.relatedEntityId ?? null,
          channel,
          payload: dto.payload as unknown as Prisma.InputJsonValue,
          status: NotificationStatus.Sent,
          sentAt: new Date(),
          readAt: null,
        },
      });

      this.logger.log(
        `Notifikasi terkirim: [${dto.triggerType}] id=${record.id} channel=${channel} recipient=${dto.recipientUserId}`,
      );

      createdNotifications.push(record);
    }

    return createdNotifications;
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
