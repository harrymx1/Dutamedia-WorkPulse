import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BrevoEmailService } from '../../src/modules/notification/services/brevo-email.service.js';

describe('BrevoEmailService (SAD §12.3, EPIC-13-T4)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('harus beroperasi dalam mode simulasi saat BREVO_API_KEY tidak dikonfigurasi', async () => {
    delete process.env.BREVO_API_KEY;
    const service = new BrevoEmailService();

    const result = await service.sendEmail({
      toEmail: 'budi@dutamedia.com',
      toName: 'Budi Santoso',
      subject: 'Uji Coba Notifikasi',
      htmlContent: '<p>Halo Budi</p>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^mock-brevo-/);
  });

  it('harus memanggil API Brevo saat BREVO_API_KEY dikonfigurasi dan mengembalikan success jika HTTP 201', async () => {
    process.env.BREVO_API_KEY = 'real-brevo-api-key';
    const service = new BrevoEmailService();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ messageId: '<brevo-message-uuid-1>' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.sendEmail({
      toEmail: 'ani@dutamedia.com',
      toName: 'Ani Wijaya',
      subject: 'Blocker RED Baru',
      htmlContent: '<p>Ada blocker</p>',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'api-key': 'real-brevo-api-key',
        }),
      }),
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('<brevo-message-uuid-1>');
  });

  it('harus menangani respon error HTTP dari Brevo API tanpa crash (SAD §12.2)', async () => {
    process.env.BREVO_API_KEY = 'real-brevo-api-key';
    const service = new BrevoEmailService();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid recipient address',
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await service.sendEmail({
      toEmail: 'invalid-email',
      subject: 'Tes Error',
      htmlContent: '<p>Tes</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Brevo API HTTP 400');
  });

  it('harus menangani kegagalan koneksi/network exception dari fetch secara anggun (SAD §12.2)', async () => {
    process.env.BREVO_API_KEY = 'real-brevo-api-key';
    const service = new BrevoEmailService();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Connection timed out')),
    );

    const result = await service.sendEmail({
      toEmail: 'budi@dutamedia.com',
      subject: 'Tes Network Error',
      htmlContent: '<p>Tes</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection timed out');
  });

  describe('Production Fail-Fast Validation (S1-T2)', () => {
    it('harus throw Error saat NODE_ENV=production dan BREVO_API_KEY tidak dikonfigurasi', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.BREVO_API_KEY;

      expect(() => new BrevoEmailService()).toThrow(
        /BREVO_API_KEY wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus throw Error saat NODE_ENV=production dan BREVO_API_KEY berupa string kosong', () => {
      process.env.NODE_ENV = 'production';
      process.env.BREVO_API_KEY = '';

      expect(() => new BrevoEmailService()).toThrow(
        /BREVO_API_KEY wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus throw Error saat NODE_ENV=production dan BREVO_API_KEY hanya berisi whitespace', () => {
      process.env.NODE_ENV = 'production';
      process.env.BREVO_API_KEY = '   ';

      expect(() => new BrevoEmailService()).toThrow(
        /BREVO_API_KEY wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus throw Error saat NODE_ENV=production dan BREVO_API_KEY bernilai mock-brevo-key', () => {
      process.env.NODE_ENV = 'production';
      process.env.BREVO_API_KEY = 'mock-brevo-key';

      expect(() => new BrevoEmailService()).toThrow(
        /BREVO_API_KEY wajib dikonfigurasi dan tidak boleh bernilai mock pada environment production/,
      );
    });

    it('harus berhasil diinisialisasi saat NODE_ENV=production dan BREVO_API_KEY valid non-mock', () => {
      process.env.NODE_ENV = 'production';
      process.env.BREVO_API_KEY = 'valid-production-api-key-test-only';

      expect(() => new BrevoEmailService()).not.toThrow();
    });
  });
});
