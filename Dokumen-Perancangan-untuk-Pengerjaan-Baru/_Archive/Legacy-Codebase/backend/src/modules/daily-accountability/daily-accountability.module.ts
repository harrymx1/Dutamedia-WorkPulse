import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { PolicyModule } from '../policy/policy.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { DailyAccountabilityController } from './controllers/daily-accountability.controller.js';
import { CommitmentController } from './controllers/commitment.controller.js';
import { AdditionalWorkController } from './controllers/additional-work.controller.js';
import { DailyAccountabilityService } from './services/daily-accountability.service.js';
import { StatusSuggestionService } from './services/status-suggestion.service.js';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    PolicyModule,
    AuthorizationModule,
    NotificationModule,
  ],
  controllers: [
    DailyAccountabilityController,
    CommitmentController,
    AdditionalWorkController,
  ],
  providers: [
    DailyAccountabilityService,
    StatusSuggestionService,
  ],
  exports: [
    DailyAccountabilityService,
    StatusSuggestionService,
  ],
})
export class DailyAccountabilityModule {}
