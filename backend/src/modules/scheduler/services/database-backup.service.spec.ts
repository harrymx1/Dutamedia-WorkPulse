import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as zlib from 'node:zlib';
import { NotificationChannel } from '@prisma/client';
import { DatabaseBackupService } from './database-backup.service.js';

describe('DatabaseBackupService (SAD §4.5, §11.4 Job #9, §11.5, §14.2, EPIC-15-T3)', () => {
  let service: DatabaseBackupService;
  let prismaMock: any;
  let s3StorageMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        count: vi.fn().mockResolvedValue(10),
        findMany: vi.fn().mockResolvedValue([
          { id: 'admin-1', email: 'admin@dutamedia.com' },
          { id: 'admin-2', email: 'admin2@dutamedia.com' },
        ]),
      },
      dailyAccountabilityRecord: {
        count: vi.fn().mockResolvedValue(50),
      },
      blocker: {
        count: vi.fn().mockResolvedValue(5),
      },
      complianceEvent: {
        count: vi.fn().mockResolvedValue(2),
      },
      auditLog: {
        count: vi.fn().mockResolvedValue(120),
      },
      notification: {
        create: vi.fn().mockResolvedValue({ id: 'alert-notif-1' }),
      },
    };

    s3StorageMock = {
      uploadBuffer: vi.fn().mockResolvedValue({ success: true, key: 'mock-key' }),
    };

    service = new DatabaseBackupService(prismaMock, s3StorageMock);
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
    expect(decompressed).toContain('-- Users: 10');
    expect(decompressed).toContain('-- DailyRecords: 50');
  });

  it('harus mengirimkan alert WebNotificationCenter ke SystemAdmin jika upload backup gagal (SAD §11.5)', async () => {
    s3StorageMock.uploadBuffer.mockRejectedValue(new Error('S3 Storage unreachable'));

    const targetDate = new Date('2026-09-17T02:00:00Z');
    const result = await service.executeBackup(targetDate);

    expect(result.success).toBe(false);
    expect(result.error).toContain('S3 Storage unreachable');

    // Memverifikasi alert dikirim ke 2 SystemAdmin aktif
    expect(prismaMock.notification.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipientUserId: 'admin-1',
        triggerType: 'DATABASE_BACKUP_FAILED',
        channel: NotificationChannel.WebNotificationCenter,
        payload: expect.objectContaining({
          title: expect.stringContaining('Kegagalan Backup Database Harian'),
        }),
      }),
    });
  });
});
