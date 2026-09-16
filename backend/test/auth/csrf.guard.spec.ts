import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from '../../src/modules/auth/guards/csrf.guard.js';
import { ForbiddenException } from '../../src/modules/shared/exceptions/api.exception.js';

describe('CsrfGuard (SAD §8.5, §8.8 - EPIC-03-T6)', () => {
  let guard: CsrfGuard;
  let mockReflector: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };
    guard = new CsrfGuard(mockReflector);
  });

  const createMockContext = (req: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('harus mengizinkan method HTTP yang aman (GET, HEAD, OPTIONS) tanpa memeriksa token (SAD §8.5)', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      const context = createMockContext({
        method,
        cookies: {},
        headers: {},
      });
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('harus mengizinkan request jika route memiliki decorator @Public()', () => {
    mockReflector.getAllAndOverride.mockImplementation(
      (key: string) => key === 'isPublic',
    );

    const context = createMockContext({
      method: 'POST',
      cookies: {},
      headers: {},
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('harus mengizinkan request jika route memiliki decorator @SkipCsrf()', () => {
    mockReflector.getAllAndOverride.mockImplementation(
      (key: string) => key === 'skipCsrf',
    );

    const context = createMockContext({
      method: 'POST',
      cookies: {},
      headers: {},
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('harus melempar ForbiddenException pada state-changing method jika cookie csrf_token tidak ada', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      method: 'POST',
      cookies: {},
      headers: { 'x-csrf-token': 'any-csrf-token' },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('harus melempar ForbiddenException jika header X-CSRF-Token tidak ada', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      method: 'POST',
      cookies: { csrf_token: 'valid-csrf-token' },
      headers: {},
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('harus melempar ForbiddenException jika cookie csrf_token dan header X-CSRF-Token tidak cocok', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockContext({
      method: 'POST',
      cookies: { csrf_token: 'token-alpha' },
      headers: { 'x-csrf-token': 'token-bravo' },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('harus mengizinkan request jika cookie csrf_token dan header X-CSRF-Token bernilai identik (Double Submit Pattern)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const context = createMockContext({
        method,
        cookies: { csrf_token: 'identical-secret-csrf-token-123' },
        headers: { 'x-csrf-token': 'identical-secret-csrf-token-123' },
      });

      expect(guard.canActivate(context)).toBe(true);
    }
  });
});
