import { Module } from '@nestjs/common';
import { LeaveController } from './controllers/leave.controller';
import { LeaveService } from './services/leave.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LeaveController],
  providers: [LeaveService, ClockService],
  exports: [LeaveService],
})
export class LeaveModule {}
