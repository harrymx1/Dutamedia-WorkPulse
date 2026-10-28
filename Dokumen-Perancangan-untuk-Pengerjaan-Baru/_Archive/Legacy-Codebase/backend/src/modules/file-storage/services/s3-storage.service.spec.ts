import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { S3StorageService } from './s3-storage.service.js';

describe('S3StorageService (S1-T2 Credential Fail-Fast)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Non-Production Environment (Development / Test)', () => {
    it('harus berhasil diinisialisasi dengan fallback mock credentials saat credentials tidak diset', () => {
      delete process.env.STORAGE_ACCESS_KEY;
      delete process.env.S3_ACCESS_KEY_ID;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.STORAGE_SECRET_KEY;
      delete process.env.S3_SECRET_ACCESS_KEY;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      process.env.NODE_ENV = 'development';

      expect(() => new S3StorageService()).not.toThrow();
    });

    it('harus berhasil diinisialisasi dengan mock credentials eksplisit pada mode test', () => {
      process.env.NODE_ENV = 'test';
      process.env.STORAGE_ACCESS_KEY = 'mock-access-key';
      process.env.STORAGE_SECRET_KEY = 'mock-secret-key';

      expect(() => new S3StorageService()).not.toThrow();
    });
  });

  describe('Production Environment (NODE_ENV=production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      delete process.env.STORAGE_ACCESS_KEY;
      delete process.env.S3_ACCESS_KEY_ID;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.STORAGE_SECRET_KEY;
      delete process.env.S3_SECRET_ACCESS_KEY;
      delete process.env.AWS_SECRET_ACCESS_KEY;
    });

    it('harus throw Error saat tidak ada credential sama sekali', () => {
      expect(() => new S3StorageService()).toThrow(
        /Kredensial storage \(STORAGE_ACCESS_KEY \/ STORAGE_SECRET_KEY atau alias S3_\/AWS_\) wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus throw Error saat access key bernilai mock-access-key', () => {
      process.env.STORAGE_ACCESS_KEY = 'mock-access-key';
      process.env.STORAGE_SECRET_KEY = 'valid-production-secret-key';

      expect(() => new S3StorageService()).toThrow(
        /Kredensial storage \(STORAGE_ACCESS_KEY \/ STORAGE_SECRET_KEY atau alias S3_\/AWS_\) wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus throw Error saat secret key bernilai mock-secret-key', () => {
      process.env.STORAGE_ACCESS_KEY = 'valid-production-access-key';
      process.env.STORAGE_SECRET_KEY = 'mock-secret-key';

      expect(() => new S3StorageService()).toThrow(
        /Kredensial storage \(STORAGE_ACCESS_KEY \/ STORAGE_SECRET_KEY atau alias S3_\/AWS_\) wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus throw Error saat access key hanya berupa whitespace', () => {
      process.env.STORAGE_ACCESS_KEY = '   ';
      process.env.STORAGE_SECRET_KEY = 'valid-production-secret-key';

      expect(() => new S3StorageService()).toThrow(
        /Kredensial storage \(STORAGE_ACCESS_KEY \/ STORAGE_SECRET_KEY atau alias S3_\/AWS_\) wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus berhasil diinisialisasi saat menggunakan STORAGE_* canonical credentials valid', () => {
      process.env.STORAGE_ACCESS_KEY = 'r2-storage-access-key-prod';
      process.env.STORAGE_SECRET_KEY = 'r2-storage-secret-key-prod';

      expect(() => new S3StorageService()).not.toThrow();
    });

    it('harus berhasil diinisialisasi saat menggunakan alias S3_* valid', () => {
      process.env.S3_ACCESS_KEY_ID = 's3-access-key-prod';
      process.env.S3_SECRET_ACCESS_KEY = 's3-secret-key-prod';

      expect(() => new S3StorageService()).not.toThrow();
    });

    it('harus berhasil diinisialisasi saat menggunakan alias AWS_* valid', () => {
      process.env.AWS_ACCESS_KEY_ID = 'aws-access-key-prod';
      process.env.AWS_SECRET_ACCESS_KEY = 'aws-secret-key-prod';

      expect(() => new S3StorageService()).not.toThrow();
    });
  });

  describe('ADR-009 S3 Policy Isolation', () => {
    it('S3StorageService harus murni infrastructure-only dan bebas dari dependensi PolicyService/PolicyModule', () => {
      // Inisialisasi tidak membutuhkan parameter domain/policy (0 dependencies injected)
      const service = new S3StorageService();
      expect(service).toBeDefined();

      // createPresignedGetUrl menerima expiresInSeconds numerik murni dari caller
      expect(typeof service.createPresignedGetUrl).toBe('function');
    });
  });
});
