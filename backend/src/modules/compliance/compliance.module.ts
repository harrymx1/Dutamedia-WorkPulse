import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { PolicyModule } from '../policy/policy.module.js';
import { ComplianceService } from './services/compliance.service.js';
import { ComplianceController } from './controllers/compliance.controller.js';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthorizationModule,
    NotificationModule,
    PolicyModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
