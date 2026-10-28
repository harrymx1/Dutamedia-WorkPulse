import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as zlib from 'node:zlib';
import {
  DatabaseBackupService,
  formatSqlValue,
  splitSqlStatements,
  TOPOLOGICAL_TABLES,
} from './database-backup.service.js';

describe('DatabaseBackupService (SAD §4.5, §11.4 Job #9, §11.5, §14.2, §21.6, EPIC-23-T5)', () => {
  let service: DatabaseBackupService;
  let prismaMock: any;
  let s3StorageMock: any;

  beforeEach(() => {
    prismaMock = {
      $transaction: vi.fn(async (cb: any) => {
        const txMock = {
          $executeRawUnsafe: vi.fn().mockResolvedValue(1),
        };
        return cb(txMock);
      }),
      notification: {
        create: vi.fn().mockResolvedValue({ id: 'alert-notif-1' }),
      },
    };

    // Mock count and findMany for all topological tables
    for (const item of TOPOLOGICAL_TABLES) {
      prismaMock[item.modelName] = {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'mock-id' }),
      };
    }

    // Set up specific data for sample tables
    prismaMock.user.count.mockResolvedValue(2);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 'user-uuid-1',
        fullName: 'Admin User',
        email: 'admin@dutamedia.com',
        status: 'Active',
        mustResetPassword: false,
        createdAt: new Date('2026-09-17T00:00:00.000Z'),
        updatedAt: new Date('2026-09-17T00:00:00.000Z'),
      },
      {
        id: 'user-uuid-2',
        fullName: "O'Connor Employee",
        email: 'oconnor@dutamedia.com',
        status: 'Active',
        mustResetPassword: true,
        createdAt: new Date('2026-09-17T00:00:00.000Z'),
        updatedAt: new Date('2026-09-17T00:00:00.000Z'),
      },
    ]);

    prismaMock.dailyAccountabilityRecord.count.mockResolvedValue(1);
    prismaMock.dailyAccountabilityRecord.findMany.mockResolvedValue([
      {
        id: 'dar-uuid-1',
        employeeUserId: 'user-uuid-2',
        workDate: new Date('2026-09-17T00:00:00.000Z'),
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { cutoff: '09:00' },
        morningTiming: 'OnTime',
        createdAt: new Date('2026-09-17T01:00:00.000Z'),
        updatedAt: new Date('2026-09-17T01:00:00.000Z'),
      },
    ]);

    prismaMock.blocker.count.mockResolvedValue(1);
    prismaMock.blocker.findMany.mockResolvedValue([
      {
        id: 'blocker-uuid-1',
        raisedByUserId: 'user-uuid-2',
        type: 'Dependency',
        severity: 'High',
        impact: 'Needs DB access; waiting for IT team',
        ownerNeededType: 'OrganizationalAuthority',
        ownerNeededUserId: 'user-uuid-1',
        status: 'Open',
        createdAt: new Date('2026-09-17T02:00:00.000Z'),
        updatedAt: new Date('2026-09-17T02:00:00.000Z'),
      },
    ]);

    prismaMock.auditLog.count.mockResolvedValue(1);
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        id: 'audit-uuid-1',
        actorUserId: 'user-uuid-1',
        action: 'USER_CREATED',
        relatedEntityType: 'User',
        relatedEntityId: 'user-uuid-2',
        valueBefore: null,
        valueAfter: { email: 'oconnor@dutamedia.com' },
        timestamp: new Date('2026-09-17T00:00:00.000Z'),
      },
    ]);

    s3StorageMock = {
      uploadBuffer: vi.fn().mockResolvedValue({ success: true, key: 'mock-key' }),
    };

    service = new DatabaseBackupService(prismaMock, s3StorageMock);
  });

  describe('formatSqlValue', () => {
    it('harus memformat null dan undefined menjadi NULL', () => {
      expect(formatSqlValue(null)).toBe('NULL');
      expect(formatSqlValue(undefined)).toBe('NULL');
    });

    it('harus memformat boolean menjadi TRUE / FALSE', () => {
      expect(formatSqlValue(true)).toBe('TRUE');
      expect(formatSqlValue(false)).toBe('FALSE');
    });

    it('harus memformat number menjadi representasi numerik', () => {
      expect(formatSqlValue(42)).toBe('42');
      expect(formatSqlValue(3.14)).toBe('3.14');
    });

    it('harus memformat Date menjadi ISO string ber-quote', () => {
      const d = new Date('2026-09-17T12:30:00.000Z');
      expect(formatSqlValue(d)).toBe("'2026-09-17T12:30:00.000Z'");
    });

    it('harus meng-escape string dan tanda petik tunggal dengan benar', () => {
      expect(formatSqlValue("Normal string")).toBe("'Normal string'");
      expect(formatSqlValue("O'Reilly & Co.")).toBe("'O''Reilly & Co.'");
    });

    it('harus memformat JSON/Object menjadi JSONB string yang ter-escape', () => {
      const obj = { title: "It's working", count: 5 };
      expect(formatSqlValue(obj)).toBe("'{\"title\":\"It''s working\",\"count\":5}'::jsonb");
    });
  });

  describe('splitSqlStatements', () => {
    it('harus memisahkan statement SQL berdasarkan titik koma di luar string literal', () => {
      const sql = `
        -- Comment line
        INSERT INTO "users" ("id", "name") VALUES ('u1', 'Name; with semicolon');
        INSERT INTO "users" ("id", "name") VALUES ('u2', 'O''Reilly; second name');
      `;
      const stmts = splitSqlStatements(sql);
      expect(stmts.length).toBe(2);
      expect(stmts[0]).toContain("INSERT INTO \"users\" (\"id\", \"name\") VALUES ('u1', 'Name; with semicolon')");
      expect(stmts[1]).toContain("INSERT INTO \"users\" (\"id\", \"name\") VALUES ('u2', 'O''Reilly; second name')");
    });
  });

  describe('generateSqlDump & executeBackup', () => {
    it('harus menghasilkan SQL dump terstruktur yang memuat INSERT statement nyata untuk tabel berpenghuni', async () => {
      const targetDate = new Date('2026-09-17T02:00:00Z');
      const dumpSql = await service.generateSqlDump(targetDate);

      expect(dumpSql).toContain('-- WorkPulse Database Snapshot Dump');
      expect(dumpSql).toContain('-- users: 2');
      expect(dumpSql).toContain('-- daily_accountability_records: 1');
      expect(dumpSql).toContain('-- blockers: 1');
      expect(dumpSql).toContain('-- audit_logs: 1');
      expect(dumpSql).toContain('BEGIN;');

      // Memverifikasi keberadaan INSERT statement nyata bukan hanya count
      expect(dumpSql).toContain('INSERT INTO "users" ("id", "fullName", "email", "status", "mustResetPassword", "createdAt", "updatedAt") VALUES');
      expect(dumpSql).toContain("'user-uuid-1', 'Admin User', 'admin@dutamedia.com'");
      expect(dumpSql).toContain("'user-uuid-2', 'O''Connor Employee', 'oconnor@dutamedia.com'");

      expect(dumpSql).toContain('INSERT INTO "daily_accountability_records"');
      expect(dumpSql).toContain("'{\"department\":\"Engineering\"}'::jsonb");

      expect(dumpSql).toContain('INSERT INTO "blockers"');
      expect(dumpSql).toContain('INSERT INTO "audit_logs"');

      expect(dumpSql).toContain('COMMIT;');
    });

    it('harus berhasil mengeksekusi backup database, mengompresi dengan gzip, dan menyimpan ke S3 (SAD §14.2)', async () => {
      const targetDate = new Date('2026-09-17T02:00:00Z');
      const result = await service.executeBackup(targetDate);

      expect(result.success).toBe(true);
      expect(result.storagePath).toBe('backups/2026-09-17/db-dump.sql.gz');
      expect(result.sizeBytes).toBeGreaterThan(0);

      expect(s3StorageMock.uploadBuffer).toHaveBeenCalledWith(
        'backups/2026-09-17/db-dump.sql.gz',
        expect.any(Buffer),
        'application/gzip',
      );

      // Verifikasi dekompresi buffer gzip
      const uploadedBuffer = s3StorageMock.uploadBuffer.mock.calls[0][1];
      const decompressed = zlib.gunzipSync(uploadedBuffer).toString('utf-8');
      expect(decompressed).toContain('WorkPulse Database Snapshot Dump');
      expect(decompressed).toContain('INSERT INTO "users"');
      expect(decompressed).toContain('COMMIT;');
    });

    it('harus mengirimkan alert WebNotificationCenter ke SystemAdmin jika upload backup gagal (SAD §11.5)', async () => {
      s3StorageMock.uploadBuffer.mockRejectedValue(new Error('S3 Storage unreachable'));

      const targetDate = new Date('2026-09-17T02:00:00Z');
      const result = await service.executeBackup(targetDate);

      expect(result.success).toBe(false);
      expect(result.error).toContain('S3 Storage unreachable');

      expect(prismaMock.notification.create).toHaveBeenCalled();
    });
  });

  describe('restoreFromSqlDump', () => {
    it('harus mengeksekusi statement SQL di dalam transaksi terisolasi', async () => {
      const sqlDump = `
        BEGIN;
        INSERT INTO "users" ("id", "fullName") VALUES ('u1', 'Alice');
        INSERT INTO "users" ("id", "fullName") VALUES ('u2', 'Bob');
        COMMIT;
      `;

      const result = await service.restoreFromSqlDump(sqlDump);

      expect(result.success).toBe(true);
      expect(result.statementsExecuted).toBe(2);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('harus mengembalikan failure dan pesan error jika eksekusi SQL gagal', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Syntax error in SQL dump'));

      const sqlDump = `INSERT INTO "invalid_table" VALUES (1);`;
      const result = await service.restoreFromSqlDump(sqlDump);

      expect(result.success).toBe(false);
      expect(result.statementsExecuted).toBe(0);
      expect(result.error).toContain('Syntax error in SQL dump');
    });
  });
});

