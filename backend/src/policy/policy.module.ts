import { Module } from '@nestjs/common';
import { PolicyController } from './controllers/policy.controller';
import { PolicyService } from './services/policy.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PolicyController],
  providers: [PolicyService, ClockService],
  exports: [PolicyService],
})
export class PolicyModule {}
