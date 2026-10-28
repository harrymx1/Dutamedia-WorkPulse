import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { ExceptionService } from './services/exception.service.js';
import { ExceptionController } from './controllers/exception.controller.js';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthorizationModule,
    NotificationModule,
  ],
  controllers: [ExceptionController],
  providers: [ExceptionService],
  exports: [ExceptionService],
})
export class ExceptionModule {}
