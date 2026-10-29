import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { NotificationChannel } from '@prisma/client';

@Controller(['notifications', 'api/notifications'])
@UseGuards(AuthGuard, CsrfGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getUserNotifications(
      req.user.id,
      unreadOnly === 'true',
    );
  }

  @Post('read-all')
  async markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Post(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.id, id);
  }

  @Get('channels')
  async getChannelConfigurations() {
    return this.notificationService.getChannelConfigurations();
  }

  @Post('channels/test')
  async testChannelDelivery(
    @Body('channel') channel: NotificationChannel,
    @Body('recipient') recipient: string,
  ) {
    return this.notificationService.testChannelDelivery(
      channel,
      recipient || 'test@dutamedia.com',
    );
  }
}

