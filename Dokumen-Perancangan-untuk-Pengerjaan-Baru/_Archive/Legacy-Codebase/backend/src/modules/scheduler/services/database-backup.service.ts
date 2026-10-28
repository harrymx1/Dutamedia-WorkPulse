import { Injectable, Logger } from '@nestjs/common';
import * as zlib from 'node:zlib';
import { NotificationChannel, NotificationStatus, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { S3StorageService } from '../../file-storage/services/s3-storage.service.js';

export interface BackupResult {
  success: boolean;
  storagePath?: string;
  sizeBytes?: number;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  statementsExecuted: number;
  error?: string;
}

export const TOPOLOGICAL_TABLES: Array<{ tableName: string; modelName: string }> = [
  { tableName: 'users', modelName: 'user' },
  { tableName: 'policies', modelName: 'policy' },
  { tableName: 'policy_owner_assignments', modelName: 'policyOwnerAssignment' },
  { tableName: 'organizational_assignments', modelName: 'organizationalAssignment' },
  { tableName: 'project_authority_mappings', modelName: 'projectAuthorityMapping' },
  { tableName: 'temporary_reviewer_assignments', modelName: 'temporaryReviewerAssignment' },
  { tableName: 'sessions', modelName: 'session' },
  { tableName: 'exceptions', modelName: 'exception' },
  { tableName: 'daily_accountability_records', modelName: 'dailyAccountabilityRecord' },
  { tableName: 'commitments', modelName: 'commitment' },
  { tableName: 'additional_works', modelName: 'additionalWork' },
  { tableName: 'blockers', modelName: 'blocker' },
  { tableName: 'support_contributions', modelName: 'supportContribution' },
  { tableName: 'correction_requests', modelName: 'correctionRequest' },
  { tableName: 'manager_notes', modelName: 'managerNote' },
  { tableName: 'compliance_events', modelName: 'complianceEvent' },
  { tableName: 'notifications', modelName: 'notification' },
  { tableName: 'audit_logs', modelName: 'auditLog' },
];

/**
 * Format a JavaScript value into an escaped PostgreSQL SQL literal.
 */
export function formatSqlValue(val: unknown): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'`;
  }
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val);
    const escaped = jsonStr.replace(/'/g, "''");
    return `'${escaped}'::jsonb`;
  }
  if (typeof val === 'string') {
    const escaped = val.replace(/'/g, "''");
    return `'${escaped}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Parse an SQL script into discrete statements, ignoring comments and semicolons inside quotes.
 */
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];

    if (char === "'") {
      if (inString && sql[i + 1] === "'") {
        current += "''";
        i += 2;
        continue;
      }
      inString = !inString;
      current += char;
      i++;
      continue;
    }

    // Skip single-line comments (-- ...)
    if (!inString && char === '-' && sql[i + 1] === '-') {
      const nextNewline = sql.indexOf('\n', i);
      if (nextNewline === -1) {
        break;
      }
      i = nextNewline + 1;
      continue;
    }

    if (char === ';' && !inString) {
      const trimmed = current.trim();
      if (trimmed) {
        statements.push(trimmed);
      }
      current = '';
      i++;
      continue;
    }

    current += char;
    i++;
  }

  const trimmed = current.trim();
  if (trimmed) {
    statements.push(trimmed);
  }

  return statements;
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
      // 1. Ekstraksi snapshot data terpenting sistem secara komprehensif
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
   * Menghasilkan dump SQL utuh dan terstruktur dari database WorkPulse
   * sesuai SAD §4.5, §21.6, dan NFR-10 (Audit trail survivability).
   * Seluruh tabel diekspor dalam urutan topologis relasi foreign key.
   */
  async generateSqlDump(targetDate: Date): Promise<string> {
    const timestamp = targetDate.toISOString();
    const dumpLines: string[] = [];

    dumpLines.push('-- =============================================================================');
    dumpLines.push(`-- WorkPulse Database Snapshot Dump (SAD §4.5, §11.4, §21.6)`);
    dumpLines.push(`-- Timestamp: ${timestamp}`);
    dumpLines.push('-- =============================================================================\n');

    // Ringkasan metadata row count sebelum dump data
    dumpLines.push('-- METADATA SNAPSHOT:');
    const tableCounts: Record<string, number> = {};

    for (const item of TOPOLOGICAL_TABLES) {
      const modelDelegate = (this.prisma as any)[item.modelName];
      if (modelDelegate && typeof modelDelegate.count === 'function') {
        const count = await modelDelegate.count();
        tableCounts[item.tableName] = count;
        dumpLines.push(`-- ${item.tableName}: ${count}`);
      }
    }

    dumpLines.push('\nBEGIN;\n');

    // Iterasi seluruh tabel dalam urutan topologis
    const BATCH_SIZE = 100;

    for (const item of TOPOLOGICAL_TABLES) {
      const modelDelegate = (this.prisma as any)[item.modelName];
      if (!modelDelegate || typeof modelDelegate.findMany !== 'function') {
        continue;
      }

      const rows = await modelDelegate.findMany();
      if (!rows || rows.length === 0) {
        dumpLines.push(`-- Table "${item.tableName}" is empty (0 rows)\n`);
        continue;
      }

      dumpLines.push(`-- -----------------------------------------------------------------------------`);
      dumpLines.push(`-- Data for Table: "${item.tableName}" (${rows.length} rows)`);
      dumpLines.push(`-- -----------------------------------------------------------------------------`);

      const columnNames = Object.keys(rows[0]);
      const quotedColumns = columnNames.map((col) => `"${col}"`).join(', ');

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE);
        const valueTuples = chunk.map((row: any) => {
          const formattedVals = columnNames.map((col) => formatSqlValue(row[col]));
          return `(${formattedVals.join(', ')})`;
        });

        const insertStatement = `INSERT INTO "${item.tableName}" (${quotedColumns}) VALUES\n${valueTuples.join(',\n')};`;
        dumpLines.push(insertStatement);
      }

      dumpLines.push('');
    }

    dumpLines.push('COMMIT;\n');
    return dumpLines.join('\n');
  }

  /**
   * Mengeksekusi restore data dari SQL dump terprogram (SAD §21.6, EPIC-23-T5).
   * Menjalankan seluruh statement SQL di dalam transaksi terisolasi.
   */
  async restoreFromSqlDump(sqlContent: string): Promise<RestoreResult> {
    const rawStatements = splitSqlStatements(sqlContent);

    // Filter statement kontrol transaksi bawaan dump karena dihandle oleh prisma.$transaction
    const executableStatements = rawStatements.filter((stmt) => {
      const upper = stmt.toUpperCase();
      return (
        upper !== 'BEGIN' &&
        upper !== 'BEGIN TRANSACTION' &&
        upper !== 'COMMIT' &&
        upper !== 'ROLLBACK'
      );
    });

    this.logger.log(`Memulai restore database dari SQL dump (${executableStatements.length} statement)...`);

    try {
      await this.prisma.$transaction(
        async (tx) => {
          for (const stmt of executableStatements) {
            await tx.$executeRawUnsafe(stmt);
          }
        },
        {
          timeout: 60000, // 60 detik timeout untuk operasi restore bulk data
        },
      );

      this.logger.log(`Restore database selesai. Berhasil mengeksekusi ${executableStatements.length} statement.`);
      return {
        success: true,
        statementsExecuted: executableStatements.length,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error during restore';
      this.logger.error(`Gagal mengeksekusi restore database: ${errorMsg}`);
      return {
        success: false,
        statementsExecuted: 0,
        error: errorMsg,
      };
    }
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
          status: UserStatus.Active,
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

