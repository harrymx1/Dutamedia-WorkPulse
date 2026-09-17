import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { SharedModule } from './modules/shared/shared.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthorizationModule } from './modules/authorization/authorization.module.js';
import { PolicyModule } from './modules/policy/policy.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';
import { DailyAccountabilityModule } from './modules/daily-accountability/daily-accountability.module.js';
import { BlockerModule } from './modules/blocker/blocker.module.js';
import { ExceptionModule } from './modules/exception/exception.module.js';
import { ManagerNoteModule } from './modules/manager-note/manager-note.module.js';
import { CorrectionRequestModule } from './modules/correction-request/correction-request.module.js';
import { ComplianceModule } from './modules/compliance/compliance.module.js';

@Module({
  imports: [
    // Rate Limiting per kategori endpoint (SAD §7.8)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100, // 100 request/menit per user
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5, // 5 percobaan/menit per IP
      },
      {
        name: 'upload',
        ttl: 60000,
        limit: 10, // 10 request/menit per user
      },
    ]),
    PrismaModule,
    SharedModule,
    AuditModule,
    IdentityModule,
    AuthModule,
    AuthorizationModule,
    PolicyModule,
    NotificationModule,
    DailyAccountabilityModule,
    BlockerModule,
    ExceptionModule,
    ManagerNoteModule,
    CorrectionRequestModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
