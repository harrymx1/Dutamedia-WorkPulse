import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';
import { BadRequestException } from '@nestjs/common';

describe('StorageService (Tahap 2.2 - Supabase Storage & Evidence Protection)', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
  });

  describe('validateEvidenceFile', () => {
    it('harus menerima berkas valid (PNG, di bawah 10MB)', () => {
      expect(() =>
        service.validateEvidenceFile({
          mimetype: 'image/png',
          size: 2 * 1024 * 1024, // 2MB
        }),
      ).not.toThrow();
    });

    it('harus menerima berkas PDF (surat cuti/dokter) di bawah 10MB', () => {
      expect(() =>
        service.validateEvidenceFile({
          mimetype: 'application/pdf',
          size: 5 * 1024 * 1024, // 5MB
        }),
      ).not.toThrow();
    });

    it('harus menolak berkas dengan format executable atau script tidak sah', () => {
      expect(() =>
        service.validateEvidenceFile({
          mimetype: 'application/x-msdownload',
          size: 1024,
        }),
      ).toThrow(BadRequestException);
    });

    it('harus menolak berkas yang melebihi batas 10MB', () => {
      expect(() =>
        service.validateEvidenceFile({
          mimetype: 'image/jpeg',
          size: 11 * 1024 * 1024, // 11MB
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('generateSignedUrlPath', () => {
    it('harus menghasilkan target path dengan TTL default 15 menit (900 detik)', () => {
      const result = service.generateSignedUrlPath('blockers/ticket-123.png');
      expect(result.bucket).toBe('workpulse-evidence');
      expect(result.expiresIn).toBe(900);
      expect(result.path).toBe('blockers/ticket-123.png');
      expect(result.targetUrl).toContain('expires=900');
    });

    it('harus membatasi TTL maksimal 60 menit (3600 detik) sesuai security ceiling ADR-009', () => {
      const result = service.generateSignedUrlPath('blockers/ticket-123.png', 7200);
      expect(result.expiresIn).toBe(3600);
    });

    it('harus membatasi TTL minimal 1 menit (60 detik)', () => {
      const result = service.generateSignedUrlPath('blockers/ticket-123.png', 10);
      expect(result.expiresIn).toBe(60);
    });
  });
});

