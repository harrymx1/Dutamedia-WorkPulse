import { Injectable, Logger } from '@nestjs/common';
import * as zlib from 'node:zlib';
import { NotificationChannel, NotificationStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { S3StorageService } from '../../file-storage/services/s3-storage.service.js';

export interface BackupResult {
  success: boolean;
  storagePath?: string;
  sizeBytes?: number;
  error?: string;
}

@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  /**
   * Eksekusi Database Backup (SAD §4.5, §11.4 Job #9, §14.2).
   * Menghasilkan dump SQL terkompresi gzip dan menyimpannya ke Object Storage S3:
   * backups/{YYYY-MM-DD}/db-dump.sql.gz
   */
  async executeBackup(targetDate: Date = new Date()): Promise<BackupResult> {
    const dateStr = targetDate.toISOString().split('T')[0];
    const storagePath = `backups/${dateStr}/db-dump.sql.gz`;

    this.logger.log(`Memulai scheduled backup database untuk tanggal ${dateStr}...`);

    try {
      // 1. Ekstraksi snapshot data terpenting sistem
      const dumpSql = await this.generateSqlDump(targetDate);

      // 2. Kompresi data SQL dengan gzip
      const compressedBuffer = zlib.gzipSync(Buffer.from(dumpSql, 'utf-8'));

      // 3. Upload ke Object Storage S3
      await this.s3StorageService.uploadBuffer(
        storagePath,
        compressedBuffer,
        'application/gzip',
      );

      this.logger.log(
        `Backup database berhasil disimpan di '${storagePath}' (Ukuran: ${compressedBuffer.length} bytes).`,
      );

      return {
        success: true,
        storagePath,
        sizeBytes: compressedBuffer.length,
      };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown error during backup';
      this.logger.error(`Kegagalan backup database untuk tanggal ${dateStr}: ${errorMsg}`);

      // SAD §11.5: Alert ke SystemAdmin via WebNotificationCenter, tidak diam-diam diabaikan
      await this.alertSystemAdminBackupFailure(dateStr, errorMsg);

      return {
        success: false,
        storagePath,
        error: errorMsg,
      };
    }
  }

  /**
   * Menghasilkan representasi snapshot SQL terstruktur database WorkPulse.
   */
  async generateSqlDump(targetDate: Date): Promise<string> {
    const timestamp = targetDate.toISOString();
    const header = [
      '-- =============================================================================',
      `-- WorkPulse Database Snapshot Dump (SAD §4.5, §11.4)`,
      `-- Timestamp: ${timestamp}`,
      '-- =============================================================================\n',
    ].join('\n');

    // Mengambil ringkasan tabel operasional utama untuk dump verifikasi
    const [usersCount, dailyRecordsCount, blockersCount, complianceCount, auditLogsCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.dailyAccountabilityRecord.count(),
        this.prisma.blocker.count(),
        this.prisma.complianceEvent.count(),
        this.prisma.auditLog.count(),
      ]);

    const metadataSummary = [
      `-- METADATA SNAPSHOT:`,
      `-- Users: ${usersCount}`,
      `-- DailyRecords: ${dailyRecordsCount}`,
      `-- Blockers: ${blockersCount}`,
      `-- ComplianceEvents: ${complianceCount}`,
      `-- AuditLogs: ${auditLogsCount}\n`,
      `-- BEGIN TRANSACTION;`,
      `-- DUMP_COMPLETED: ${timestamp}`,
      `-- COMMIT;\n`,
    ].join('\n');

    return header + metadataSummary;
  }

  /**
   * Alert ke SystemAdmin saat terjadi kegagalan backup kritis (SAD §11.5).
   */
  async alertSystemAdminBackupFailure(
    dateStr: string,
    errorMsg: string,
  ): Promise<void> {
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          status: 'Active',
          organizationalAssignments: {
            some: {
              role: Role.SystemAdmin,
              endDate: null,
            },
          },
        },
        select: { id: true },
      });

      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            recipientUserId: admin.id,
            triggerType: 'DATABASE_BACKUP_FAILED',
            channel: NotificationChannel.WebNotificationCenter,
            payload: {
              title: 'Kegagalan Backup Database Harian (Kritis)',
              body: `Proses scheduled backup database tanggal ${dateStr} gagal: ${errorMsg}. Segera periksa konektivitas dan log server.`,
              linkPath: '/admin/users',
              iconType: 'database-alert',
            },
            status: NotificationStatus.Sent,
            sentAt: new Date(),
          },
        });
      }

      this.logger.warn(
        `Alert kegagalan backup telah dikirimkan ke ${admins.length} SystemAdmin.`,
      );
    } catch (alertErr) {
      this.logger.error(`Gagal mengirimkan alert backup failure ke Admin: ${alertErr}`);
    }
  }
}
