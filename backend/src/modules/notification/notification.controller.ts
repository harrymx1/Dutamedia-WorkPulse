import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { QueryNotificationsDto } from './dto/query-notifications.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /api/v1/notifications (SAD §10.10)
   * Mengambil daftar notifikasi terpaginasi milik pengguna yang sedang login.
   */
  @Get()
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationService.getNotifications(userId, query);
  }

  /**
   * POST /api/v1/notifications/:id/mark-read (SAD §10.10)
   * Menandai satu notifikasi milik pengguna sebagai telah dibaca.
   */
  @Post(':id/mark-read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  /**
   * POST /api/v1/notifications/mark-all-read (SAD §10.10)
   * Menandai seluruh notifikasi unread milik pengguna sebagai telah dibaca.
   */
  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
