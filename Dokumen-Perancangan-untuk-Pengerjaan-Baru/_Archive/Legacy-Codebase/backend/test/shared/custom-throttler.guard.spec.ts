import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomThrottlerGuard } from '../../src/modules/shared/guards/custom-throttler.guard.js';
import { RateLimitedException } from '../../src/modules/shared/exceptions/api.exception.js';

describe('CustomThrottlerGuard (SAD §7.8, §18.2 - Rate Limiting)', () => {
  let guard: CustomThrottlerGuard;
  let reflector: Reflector;
  let storageService: any;
  let hitCounts: Map<string, number>;

  const throttlerOptions = [
    { name: 'default', ttl: 60000, limit: 100 },
    { name: 'auth', ttl: 60000, limit: 5 },
    { name: 'upload', ttl: 60000, limit: 10 },
  ];

  beforeEach(async () => {
    hitCounts = new Map<string, number>();
    storageService = {
      increment: vi.fn(async (key: string, ttl: number, limit: number) => {
        const current = (hitCounts.get(key) ?? 0) + 1;
        hitCounts.set(key, current);
        const isBlocked = current > limit;
        return {
          totalHits: current,
          timeToExpire: ttl,
          isBlocked,
          timeToBlockExpire: ttl,
        };
      }),
    };

    reflector = new Reflector();
    guard = new CustomThrottlerGuard(throttlerOptions, storageService, reflector);
    await guard.onModuleInit();
  });

  const createMockContext = (req: any, handler = () => {}, classRef = class {}) => {
    const res = {
      header: vi.fn(),
      setHeader: vi.fn(),
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => handler,
      getClass: () => classRef,
    } as unknown as ExecutionContext;
  };

  describe('getTracker (User vs IP Resolution per SAD §7.8)', () => {
    it('menggunakan user-id jika req.user sudah terpasang oleh guard autentikasi', async () => {
      const req = { user: { userId: 'alice-uuid' } };
      const tracker = await (guard as any).getTracker(req);
      expect(tracker).toBe('user-alice-uuid');
    });

    it('mengekstrak user-id dari payload cookie access_token sebelum guard rute berjalan', async () => {
      // JWT mock dengan payload { sub: 'bob-uuid' }
      const token = 'header.' + Buffer.from(JSON.stringify({ sub: 'bob-uuid' })).toString('base64') + '.sig';
      const req = { cookies: { access_token: token } };
      const tracker = await (guard as any).getTracker(req);
      expect(tracker).toBe('user-bob-uuid');
    });

    it('mengekstrak user-id dari Bearer authorization header jika cookie tidak ada', async () => {
      const token = 'header.' + Buffer.from(JSON.stringify({ sub: 'carol-uuid' })).toString('base64') + '.sig';
      const req = { headers: { authorization: `Bearer ${token}` } };
      const tracker = await (guard as any).getTracker(req);
      expect(tracker).toBe('user-carol-uuid');
    });

    it('menggunakan ip-client jika tidak terautentikasi dan tidak ada token', async () => {
      const req = { ip: '10.0.0.5', headers: {} };
      const tracker = await (guard as any).getTracker(req);
      expect(tracker).toBe('ip-10.0.0.5');
    });
  });

  describe('Rate Limiting Scoping (Auth, Upload, and Default Quotas)', () => {
    it('membatasi endpoint auth (@ThrottleAuth) maksimal 5 percobaan/menit per IP', async () => {
      const req = { ip: '192.168.1.100', headers: {} };
      const handler = () => {};
      const classRef = class {};
      const context = createMockContext(req, handler, classRef);

      // Simulasikan dekorator @ThrottleAuth()
      vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
        if (key === 'THROTTLER:LIMITauth') return 5;
        return undefined;
      });

      const authThrottler = { name: 'auth', ttl: 60000, limit: 5 };

      // 5 request pertama diizinkan
      for (let i = 0; i < 5; i++) {
        const allowed = await (guard as any).handleRequest({
          context,
          limit: 5,
          ttl: 60000,
          throttler: authThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        });
        expect(allowed).toBe(true);
      }

      // Request ke-6 ditolak dengan RateLimitedException (HTTP 429)
      await expect(
        (guard as any).handleRequest({
          context,
          limit: 5,
          ttl: 60000,
          throttler: authThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        }),
      ).rejects.toThrow(RateLimitedException);
    });

    it('melewati throttler auth pada rute umum yang tidak didekorasi @ThrottleAuth', async () => {
      const req = { ip: '192.168.1.100', headers: {} };
      const context = createMockContext(req);

      // Tidak ada dekorator @ThrottleAuth()
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const authThrottler = { name: 'auth', ttl: 60000, limit: 5 };

      // Request tidak pernah ditolak atau dikurangi oleh throttler auth
      for (let i = 0; i < 10; i++) {
        const allowed = await (guard as any).handleRequest({
          context,
          limit: 5,
          ttl: 60000,
          throttler: authThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        });
        expect(allowed).toBe(true);
      }

      // Storage increment tidak dipanggil karena di-skip
      expect(storageService.increment).not.toHaveBeenCalled();
    });

    it('membatasi endpoint upload (@ThrottleUpload) maksimal 10 request/menit', async () => {
      const req = { user: { userId: 'uploader-1' } };
      const context = createMockContext(req);

      vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
        if (key === 'THROTTLER:LIMITupload') return 10;
        return undefined;
      });

      const uploadThrottler = { name: 'upload', ttl: 60000, limit: 10 };

      // 10 request pertama sukses
      for (let i = 0; i < 10; i++) {
        const allowed = await (guard as any).handleRequest({
          context,
          limit: 10,
          ttl: 60000,
          throttler: uploadThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        });
        expect(allowed).toBe(true);
      }

      // Request ke-11 ditolak dengan RateLimitedException
      await expect(
        (guard as any).handleRequest({
          context,
          limit: 10,
          ttl: 60000,
          throttler: uploadThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        }),
      ).rejects.toThrow(RateLimitedException);
    });

    it('menerapkan kuota default 100 request/menit untuk endpoint umum per user', async () => {
      const req = { user: { userId: 'general-user-1' } };
      const context = createMockContext(req);

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const defaultThrottler = { name: 'default', ttl: 60000, limit: 100 };

      // 100 request diizinkan
      for (let i = 0; i < 100; i++) {
        const allowed = await (guard as any).handleRequest({
          context,
          limit: 100,
          ttl: 60000,
          throttler: defaultThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        });
        expect(allowed).toBe(true);
      }

      // Request ke-101 ditolak
      await expect(
        (guard as any).handleRequest({
          context,
          limit: 100,
          ttl: 60000,
          throttler: defaultThrottler,
          blockDuration: 60000,
          getTracker: (guard as any).getTracker.bind(guard),
          generateKey: (guard as any).generateKey.bind(guard),
        }),
      ).rejects.toThrow(RateLimitedException);
    });
  });
});
