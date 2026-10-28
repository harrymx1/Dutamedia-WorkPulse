import { Module } from '@nestjs/common';
import { DailyController } from './controllers/daily.controller';
import { BlockerController } from './controllers/blocker.controller';
import { DailyService } from './services/daily.service';
import { BlockerService } from './services/blocker.service';
import { WorkdayService } from './services/workday.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [AuthModule, PolicyModule],
  controllers: [DailyController, BlockerController],
  providers: [DailyService, BlockerService, WorkdayService, ClockService],
  exports: [DailyService, BlockerService, WorkdayService],
})
export class DailyModule {}
