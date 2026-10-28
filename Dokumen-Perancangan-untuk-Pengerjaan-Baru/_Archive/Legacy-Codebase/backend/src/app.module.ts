import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CustomThrottlerGuard } from './modules/shared/guards/custom-throttler.guard.js';
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
import { FileStorageModule } from './modules/file-storage/file-storage.module.js';
import { SchedulerModule } from './modules/scheduler/scheduler.module.js';
import { ReportingModule } from './modules/reporting/reporting.module.js';

@Module({
  imports: [
    SharedModule,
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
    ScheduleModule.forRoot(),
    PrismaModule,
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
    FileStorageModule,
    SchedulerModule,
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
