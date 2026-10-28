import { describe, it, expect } from 'vitest';
import { CsrfGuard } from './csrf.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';

describe('CsrfGuard (EP02-TK002 / SAD IV.3 Double-Submit Cookie)', () => {
  const reflector = new Reflector();
  const guard = new CsrfGuard(reflector);

  const mockContext = (
    method: string,
    cookies: Record<string, string> = {},
    headers: Record<string, string> = {},
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

  it('should allow GET, HEAD, and OPTIONS requests without CSRF token', () => {
    expect(guard.canActivate(mockContext('GET'))).toBe(true);
    expect(guard.canActivate(mockContext('HEAD'))).toBe(true);
    expect(guard.canActivate(mockContext('OPTIONS'))).toBe(true);
  });

  it('should allow mutating request when cookie and header CSRF match exactly', () => {
    const ctx = mockContext(
      'POST',
      { csrf_token: 'valid_csrf_token_hex_123' },
      { 'x-csrf-token': 'valid_csrf_token_hex_123' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should reject mutating request when X-CSRF-Token header is missing', () => {
    const ctx = mockContext(
      'POST',
      { csrf_token: 'valid_csrf_token_hex_123' },
      {},
    );
    expect(() => guard.canActivate(ctx)).toThrowError(AppException);
  });

  it('should reject mutating request when tokens do not match', () => {
    const ctx = mockContext(
      'POST',
      { csrf_token: 'token_a' },
      { 'x-csrf-token': 'token_b' },
    );
    expect(() => guard.canActivate(ctx)).toThrowError(AppException);
  });
});

