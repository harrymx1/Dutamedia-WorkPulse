import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportGeneratorService, type ExportPayload } from './services/export-generator.service.js';
import { PolicyCategory, Role } from '@prisma/client';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

describe('ExportGeneratorService (ADR-009 Dynamic Export TTL)', () => {
  let service: ExportGeneratorService;
  let mockS3StorageService: any;
  let mockAuditService: any;
  let mockPolicyService: any;

  const mockUser: CurrentUserPayload = {
    userId: 'user-head-1',
    email: 'head@dutamedia.com',
    role: Role.Head,
    function: 'Engineering',
    directManagerId: null,
    sessionId: 'session-1',
    mustResetPassword: false,
  };

  const samplePayload: ExportPayload = {
    reportType: 'daily-exception',
    title: 'Laporan Pengecualian Harian',
    subtitle: 'Tanggal: 2026-09-17',
    generatedAt: new Date(),
    generatedBy: 'Budi Santoso',
    tables: [
      {
        title: 'Ringkasan Metrik',
        data: {
          headers: ['Metrik', 'Jumlah'],
          rows: [
            ['Total Pegawai', 10],
            ['Submit Tepat Waktu', 8],
            ['No Submission', 2],
          ],
        },
      },
    ],
  };

  beforeEach(() => {
    mockS3StorageService = {
      uploadBuffer: vi.fn().mockResolvedValue({ success: true, key: 'mock-key' }),
      createPresignedGetUrl: vi.fn().mockResolvedValue('https://storage.dutamedia.com/signed-export-url'),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    mockPolicyService = {
      getActivePolicySnapshot: vi.fn().mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: 15,
        },
      }),
    };

    service = new ExportGeneratorService(
      mockS3StorageService,
      mockAuditService,
      mockPolicyService,
    );
  });

  describe('buildPdfBuffer', () => {
    it('harus menghasilkan binary PDF 1.4 yang valid dengan header dan struktur yang benar', () => {
      const buffer = service.buildPdfBuffer(samplePayload);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      const pdfString = buffer.toString('binary');
      expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
      expect(pdfString.includes('%%EOF')).toBe(true);
      expect(pdfString.includes('WorkPulse')).toBe(true);
    });
  });

  describe('buildXlsxBuffer', () => {
    it('harus menghasilkan binary OpenXML ZIP (.xlsx) yang valid', () => {
      const buffer = service.buildXlsxBuffer(samplePayload);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Signature ZIP local file header adalah 0x04034b50 (PK\x03\x04)
      expect(buffer[0]).toBe(0x50); // P
      expect(buffer[1]).toBe(0x4b); // K
      expect(buffer[2]).toBe(0x03);
      expect(buffer[3]).toBe(0x04);
    });
  });

  describe('generateAndUploadExport (ADR-009 Contract)', () => {
    it('harus menggunakan default policy 15 menit (900 detik) jika policy mengembalikan 15', async () => {
      const result = await service.generateAndUploadExport(
        mockUser,
        'daily-exception',
        'pdf',
        samplePayload,
      );

      expect(result.format).toBe('pdf');
      expect(result.expiresIn).toBe(900); // 15 * 60 = 900 detik
      expect(mockPolicyService.getActivePolicySnapshot).toHaveBeenCalledWith(
        [PolicyCategory.RetentionPeriod],
        expect.any(Date),
      );
      expect(mockS3StorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        expect.stringContaining('exports/daily-exception/'),
        900,
      );
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REPORT_EXPORTED',
          relatedEntityId: 'daily-exception',
          valueAfter: expect.objectContaining({
            expiresIn: 900,
          }),
        }),
      );
    });

    it('harus mengikuti policy aktif dinamis 30 menit (1800 detik)', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: 30,
        },
      });

      const result = await service.generateAndUploadExport(
        mockUser,
        'weekly-team-summary',
        'xlsx',
        samplePayload,
      );

      expect(result.format).toBe('xlsx');
      expect(result.expiresIn).toBe(1800); // 30 * 60 = 1800 detik
      expect(mockS3StorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        expect.stringContaining('exports/weekly-team-summary/'),
        1800,
      );
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          valueAfter: expect.objectContaining({
            expiresIn: 1800,
          }),
        }),
      );
    });

    it('harus mendukung batas bawah (lower bound) 1 menit (60 detik)', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: 1,
        },
      });

      const result = await service.generateAndUploadExport(
        mockUser,
        'daily-exception',
        'pdf',
        samplePayload,
      );

      expect(result.expiresIn).toBe(60); // 1 * 60 = 60 detik
      expect(mockS3StorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        expect.any(String),
        60,
      );
    });

    it('harus mendukung batas atas keamanan produk (security ceiling) 60 menit (3600 detik)', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: 60,
        },
      });

      const result = await service.generateAndUploadExport(
        mockUser,
        'daily-exception',
        'pdf',
        samplePayload,
      );

      expect(result.expiresIn).toBe(3600); // 60 * 60 = 3600 detik
      expect(mockS3StorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        expect.any(String),
        3600,
      );
    });

    it('Defense-in-depth: harus membatasi (clamp) nilai di atas 60 menit menjadi 60 menit (3600 detik)', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: 120, // Di atas security ceiling
        },
      });

      const result = await service.generateAndUploadExport(
        mockUser,
        'daily-exception',
        'pdf',
        samplePayload,
      );

      expect(result.expiresIn).toBe(3600); // Dibatasi maksimum 60 menit
      expect(mockS3StorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        expect.any(String),
        3600,
      );
    });

    it('Defense-in-depth: harus membatasi (clamp) nilai di bawah 1 menit menjadi 1 menit (60 detik)', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: 0,
        },
      });

      const result = await service.generateAndUploadExport(
        mockUser,
        'daily-exception',
        'pdf',
        samplePayload,
      );

      expect(result.expiresIn).toBe(60); // Dibatasi minimum 1 menit
      expect(mockS3StorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        expect.any(String),
        60,
      );
    });

    it('harus membatalkan ekspor dan mempropagasi error jika PolicyService melempar error saat resolusi policy', async () => {
      mockPolicyService.getActivePolicySnapshot.mockRejectedValue(
        new Error('PolicyService resolution failed'),
      );

      await expect(
        service.generateAndUploadExport(
          mockUser,
          'daily-exception',
          'pdf',
          samplePayload,
        ),
      ).rejects.toThrow('PolicyService resolution failed');

      expect(mockS3StorageService.uploadBuffer).not.toHaveBeenCalled();
      expect(mockS3StorageService.createPresignedGetUrl).not.toHaveBeenCalled();
      expect(mockAuditService.record).not.toHaveBeenCalled();
    });

    it('harus membatalkan ekspor dan melempar error jika snapshot RetentionPeriod tidak memiliki field exportRetentionMinutes', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          // exportRetentionMinutes tidak ada / undefined
        },
      });

      await expect(
        service.generateAndUploadExport(
          mockUser,
          'daily-exception',
          'pdf',
          samplePayload,
        ),
      ).rejects.toThrow(
        'Gagal mengurai kebijakan retensi ekspor aktif: RetentionPeriod.exportRetentionMinutes tidak valid atau tidak ditemukan',
      );

      expect(mockS3StorageService.uploadBuffer).not.toHaveBeenCalled();
      expect(mockS3StorageService.createPresignedGetUrl).not.toHaveBeenCalled();
      expect(mockAuditService.record).not.toHaveBeenCalled();
    });

    it('harus membatalkan ekspor dan melempar error jika exportRetentionMinutes bukan tipe number yang valid (null/NaN)', async () => {
      mockPolicyService.getActivePolicySnapshot.mockResolvedValue({
        [PolicyCategory.RetentionPeriod]: {
          backupRetentionDays: 14,
          exportRetentionMinutes: null,
        },
      });

      await expect(
        service.generateAndUploadExport(
          mockUser,
          'daily-exception',
          'pdf',
          samplePayload,
        ),
      ).rejects.toThrow(
        'Gagal mengurai kebijakan retensi ekspor aktif: RetentionPeriod.exportRetentionMinutes tidak valid atau tidak ditemukan',
      );

      expect(mockS3StorageService.uploadBuffer).not.toHaveBeenCalled();
      expect(mockS3StorageService.createPresignedGetUrl).not.toHaveBeenCalled();
      expect(mockAuditService.record).not.toHaveBeenCalled();
    });
  });
});
