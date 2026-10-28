import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { BrevoEmailService } from './services/brevo-email.service.js';
import { BrowserPushService } from './services/browser-push.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, BrevoEmailService, BrowserPushService],
  exports: [NotificationService, BrevoEmailService, BrowserPushService],
})
export class NotificationModule {}
