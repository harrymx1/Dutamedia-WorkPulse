import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DailyAccountabilityModule } from '../daily-accountability/daily-accountability.module.js';
import { ComplianceModule } from '../compliance/compliance.module.js';
import { CorrectionRequestModule } from '../correction-request/correction-request.module.js';
import { BlockerModule } from '../blocker/blocker.module.js';
import { NotificationModule } from '../notification/notification.module.js';
import { FileStorageModule } from '../file-storage/file-storage.module.js';
import { SchedulerService } from './services/scheduler.service.js';
import { DatabaseBackupService } from './services/database-backup.service.js';

@Module({
  imports: [
    PrismaModule,
    DailyAccountabilityModule,
    ComplianceModule,
    CorrectionRequestModule,
    BlockerModule,
    NotificationModule,
    FileStorageModule,
  ],
  providers: [SchedulerService, DatabaseBackupService],
  exports: [SchedulerService, DatabaseBackupService],
})
export class SchedulerModule {}
