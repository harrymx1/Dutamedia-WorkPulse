import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService, ClockService],
  exports: [DashboardService],
})
export class DashboardModule {}
