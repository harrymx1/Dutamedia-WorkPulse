import { Module } from '@nestjs/common';
import { ComplianceController } from './controllers/compliance.controller';
import { ComplianceService } from './services/compliance.service';
import { ExemptionService } from './services/exemption.service';
import { ClockService } from '../common/time/clock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ComplianceController],
  providers: [ComplianceService, ExemptionService, ClockService],
  exports: [ComplianceService, ExemptionService],
})
export class ComplianceModule {}
