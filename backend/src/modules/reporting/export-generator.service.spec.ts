import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportGeneratorService, type ExportPayload } from './services/export-generator.service.js';
import { Role } from '@prisma/client';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

describe('ExportGeneratorService', () => {
  let service: ExportGeneratorService;
  let mockS3StorageService: any;
  let mockAuditService: any;

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

    service = new ExportGeneratorService(mockS3StorageService, mockAuditService);
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

  describe('generateAndUploadExport', () => {
    it('harus mengunggah PDF ke Object Storage dan mengembalikan signed URL 15 menit', async () => {
      const result = await service.generateAndUploadExport(
        mockUser,
        'daily-exception',
        'pdf',
        samplePayload,
      );

      expect(result.format).toBe('pdf');
      expect(result.expiresIn).toBe(900); // 15 menit (SAD §13.5, §14.4)
      expect(result.downloadUrl).toBe('https://storage.dutamedia.com/signed-export-url');
      expect(result.storagePath).toContain('exports/daily-exception/');
      expect(mockS3StorageService.uploadBuffer).toHaveBeenCalledWith(
        expect.stringContaining('exports/daily-exception/'),
        expect.any(Buffer),
        'application/pdf',
      );
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REPORT_EXPORTED',
          relatedEntityType: 'Report',
          relatedEntityId: 'daily-exception',
        }),
      );
    });

    it('harus mengunggah XLSX ke Object Storage dan mencatat audit trail', async () => {
      const result = await service.generateAndUploadExport(
        mockUser,
        'weekly-team-summary',
        'xlsx',
        samplePayload,
      );

      expect(result.format).toBe('xlsx');
      expect(result.expiresIn).toBe(900);
      expect(mockS3StorageService.uploadBuffer).toHaveBeenCalledWith(
        expect.stringContaining('exports/weekly-team-summary/'),
        expect.any(Buffer),
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(mockAuditService.record).toHaveBeenCalled();
    });
  });
});
