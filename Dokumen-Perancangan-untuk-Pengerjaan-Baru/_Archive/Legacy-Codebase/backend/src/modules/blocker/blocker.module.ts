import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { PolicyModule } from '../policy/policy.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { BlockerController } from './controllers/blocker.controller.js';
import { BlockerService } from './services/blocker.service.js';
import { BlockerOwnerResolverService } from './services/blocker-owner-resolver.service.js';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    PolicyModule,
    AuthorizationModule,
    NotificationModule,
  ],
  controllers: [BlockerController],
  providers: [BlockerService, BlockerOwnerResolverService],
  exports: [BlockerService, BlockerOwnerResolverService],
})
export class BlockerModule {}
