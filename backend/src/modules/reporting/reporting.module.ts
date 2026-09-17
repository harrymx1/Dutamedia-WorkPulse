import { Module } from '@nestjs/common';
import { ReportingController } from './controllers/reporting.controller.js';
import { ReportingService } from './services/reporting.service.js';
import { ExportGeneratorService } from './services/export-generator.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { FileStorageModule } from '../file-storage/file-storage.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthorizationModule,
    AuditModule,
    FileStorageModule,
  ],
  controllers: [ReportingController],
  providers: [ReportingService, ExportGeneratorService],
  exports: [ReportingService, ExportGeneratorService],
})
export class ReportingModule {}
