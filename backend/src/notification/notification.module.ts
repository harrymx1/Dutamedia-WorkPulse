import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService, ClockService],
  exports: [NotificationService],
})
export class NotificationModule {}
