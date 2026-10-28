import { Module } from '@nestjs/common';
import { CoachingController } from './controllers/coaching.controller';
import { CoachingService } from './services/coaching.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CoachingController],
  providers: [CoachingService, ClockService],
  exports: [CoachingService],
})
export class CoachingModule {}

