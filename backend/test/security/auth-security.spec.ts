import { describe, it, expect, vi } from 'vitest';
import { AuthController } from '../../src/auth/auth.controller';
import { CsrfGuard } from '../../src/auth/guards/csrf.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { AppException } from '../../src/common/exceptions/app.exception';
import { ErrorCode } from '../../src/common/constants/error-codes';
import { THROTTLER_TTL, THROTTLER_LIMIT } from '@nestjs/throttler/dist/throttler.constants';

describe('Auth Security Verification Suite (WP-EP02-TK006 / SAD IV.3 & VII)', () => {
  describe('Cookie Security Flags (HttpOnly & SameSite=Strict)', () => {
    it('access_token must have HttpOnly=true, SameSite=Strict, Path=/ to prevent XSS theft', async () => {
      const mockAuthService = {
        login: vi.fn().mockResolvedValue({
          accessToken: 'jwt_secure_access_token',
          csrfToken: 'csrf_hex_token',
          user: { id: 'usr-1', email: 'test@dutamedia.com', role: 'EMPLOYEE' },
          session: { id: 'sess-1', expiresAt: new Date() },
        }),
      } as any;

      const controller = new AuthController(mockAuthService);

      const capturedCookies: Record<string, { val: string; opts: any }> = {};
      const mockRes = {
        cookie: (name: string, val: string, opts: any) => {
          capturedCookies[name] = { val, opts };
        },
      } as any;

      const mockReq = {
        headers: {},
        socket: {},
      } as any;

      await controller.login(
        { email: 'test@dutamedia.com', password: 'Password123!' },
        mockReq,
        mockRes,
      );

      // Verifikasi cookie access_token
      const accessCookie = capturedCookies['access_token'];
      expect(accessCookie).toBeDefined();
      expect(accessCookie.val).toBe('jwt_secure_access_token');
      expect(accessCookie.opts.httpOnly).toBe(true);
      expect(accessCookie.opts.sameSite).toBe('strict');
      expect(accessCookie.opts.path).toBe('/');

      // Verifikasi cookie csrf_token
      const csrfCookie = capturedCookies['csrf_token'];
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie.val).toBe('csrf_hex_token');
      expect(csrfCookie.opts.httpOnly).toBe(false); // Wajib readable oleh JS client
      expect(csrfCookie.opts.sameSite).toBe('strict');
      expect(csrfCookie.opts.path).toBe('/');
    });
  });

  describe('CSRF Double-Submit Enforcement', () => {
    const reflector = new Reflector();
    const csrfGuard = new CsrfGuard(reflector);

    const createMockContext = (
      method: string,
      cookies: Record<string, string>,
      headers: Record<string, string>,
    ): ExecutionContext =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({
            method,
            cookies,
            headers,
          }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext);

    it('must reject mutating POST request when X-CSRF-Token is omitted', () => {
      const ctx = createMockContext(
        'POST',
        { csrf_token: 'secret_csrf_cookie' },
        {}, // No header
      );

      expect(() => csrfGuard.canActivate(ctx)).toThrowError(AppException);
      try {
        csrfGuard.canActivate(ctx);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.AUTH_CSRF_INVALID);
        expect(err.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('must reject mutating POST request when tokens mismatch', () => {
      const ctx = createMockContext(
        'POST',
        { csrf_token: 'cookie_token_123' },
        { 'x-csrf-token': 'attacker_forged_token_456' },
      );

      expect(() => csrfGuard.canActivate(ctx)).toThrowError(AppException);
    });

    it('must accept mutating request when cookie and header match identically', () => {
      const ctx = createMockContext(
        'POST',
        { csrf_token: 'valid_match_token_789' },
        { 'x-csrf-token': 'valid_match_token_789' },
      );

      expect(csrfGuard.canActivate(ctx)).toBe(true);
    });
  });

  describe('Brute-Force Rate Limiting Configuration', () => {
    it('login handler must declare 5 requests/minute throttle limit', () => {
      // Periksa metadata throttle pada handler login (NestJS Throttler v6)
      const limit = Reflect.getMetadata(
        'THROTTLER:LIMITdefault',
        AuthController.prototype.login,
      );
      const ttl = Reflect.getMetadata(
        'THROTTLER:TTLdefault',
        AuthController.prototype.login,
      );

      expect(limit).toBe(5);
      expect(ttl).toBe(60000);
    });
  });
});
