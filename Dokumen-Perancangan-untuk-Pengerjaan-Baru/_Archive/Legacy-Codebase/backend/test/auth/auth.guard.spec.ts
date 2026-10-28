import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { AuthGuard } from '../../src/modules/auth/guards/auth.guard.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('AuthGuard (SAD §8.4, §8.8 - EPIC-03-T3)', () => {
  let guard: AuthGuard;
  let mockReflector: any;
  let mockJwtService: any;
  let mockPrisma: any;
  let mockIdentityService: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };

    mockJwtService = {
      verifyAsync: vi.fn(),
    };

    mockPrisma = {
      session: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    mockIdentityService = {
      resolveActiveContext: vi.fn().mockResolvedValue({
        role: 'Employee',
        function: 'Technology',
        directManagerId: 'manager-1',
        assignmentId: 'assign-1',
      }),
    };

    guard = new AuthGuard(
      mockReflector,
      mockJwtService,
      mockPrisma,
      mockIdentityService,
    );
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

  it('harus mengizinkan akses jika route memiliki decorator @Public()', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext({ cookies: {} });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('harus melempar UnauthenticatedException jika token tidak ditemukan sama sekali', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({
      cookies: {},
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar UnauthenticatedException jika JWT verifyAsync gagal', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    const context = createMockContext({
      cookies: { access_token: 'invalid.jwt.token' },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar UnauthenticatedException jika payload token tidak memiliki sub atau jti', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' }); // missing jti

    const context = createMockContext({
      cookies: { access_token: 'valid.token' },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar UnauthenticatedException jika sesi tidak ditemukan di database', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue(null);

    const context = createMockContext({
      cookies: { access_token: 'valid.token' },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar UnauthenticatedException jika sesi telah dicabut (revokedAt != null)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 10000),
    });

    const context = createMockContext({
      cookies: { access_token: 'valid.token' },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar UnauthenticatedException jika sesi telah melewati masa berlaku (expired)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 10000), // in the past
    });

    const context = createMockContext({
      cookies: { access_token: 'valid.token' },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar UnauthenticatedException jika user tidak ditemukan atau nonaktif', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.Inactive,
    });

    const context = createMockContext({
      cookies: { access_token: 'valid.token' },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar ForbiddenException jika user mustResetPassword=true mengakses endpoint umum (FR-50)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.Active,
      mustResetPassword: true,
    });

    const context = createMockContext({
      cookies: { access_token: 'valid.token' },
      headers: {},
      originalUrl: '/api/v1/daily-accountability-records/today',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('harus mengizinkan user mustResetPassword=true mengakses /auth/reset-password dan /auth/logout', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      status: UserStatus.Active,
      mustResetPassword: true,
    });

    const req = {
      cookies: { access_token: 'valid.token' },
      headers: {},
      originalUrl: '/api/v1/auth/reset-password',
      user: null as any,
    };
    const context = createMockContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user-1');
  });

  it('harus berhasil memvalidasi token dari header Authorization Bearer dan menyematkan req.user', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      jti: 'session-1',
    });
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'budi@dutamedia.com',
      status: UserStatus.Active,
      mustResetPassword: false,
    });

    const req = {
      cookies: {},
      headers: {
        authorization: 'Bearer valid.jwt.from.header',
      },
      originalUrl: '/api/v1/users',
      user: null as any,
    };
    const context = createMockContext(req);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(req.user).toEqual({
      userId: 'user-1',
      email: 'budi@dutamedia.com',
      role: 'Employee',
      function: 'Technology',
      directManagerId: 'manager-1',
      assignmentId: 'assign-1',
      sessionId: 'session-1',
      mustResetPassword: false,
    });
  });
});
