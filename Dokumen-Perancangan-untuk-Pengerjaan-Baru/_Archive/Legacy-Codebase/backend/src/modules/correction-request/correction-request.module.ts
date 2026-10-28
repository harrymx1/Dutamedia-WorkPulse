import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { PolicyModule } from '../policy/policy.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { DailyAccountabilityModule } from '../daily-accountability/daily-accountability.module.js';
import { CorrectionRequestController } from './controllers/correction-request.controller.js';
import { CorrectionRequestService } from './services/correction-request.service.js';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    PolicyModule,
    NotificationModule,
    AuthorizationModule,
    DailyAccountabilityModule,
  ],
  controllers: [CorrectionRequestController],
  providers: [CorrectionRequestService],
  exports: [CorrectionRequestService],
})
export class CorrectionRequestModule {}
