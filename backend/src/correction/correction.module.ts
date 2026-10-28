import { Module } from '@nestjs/common';
import { CorrectionController } from './controllers/correction.controller';
import { CorrectionService } from './services/correction.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [AuthModule, PolicyModule],
  controllers: [CorrectionController],
  providers: [CorrectionService, ClockService],
  exports: [CorrectionService],
})
export class CorrectionModule {}
