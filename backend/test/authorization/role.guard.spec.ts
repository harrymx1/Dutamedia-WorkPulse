import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleGuard } from '../../src/modules/authorization/guards/role.guard.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('RoleGuard (SAD §8.8 - EPIC-05-T1)', () => {
  let guard: RoleGuard;
  let mockReflector: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };
    guard = new RoleGuard(mockReflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('harus mengizinkan akses jika route beranotasi @Public()', () => {
    mockReflector.getAllAndOverride.mockImplementation(
      (key: string) => key === 'isPublic',
    );

    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('harus mengizinkan akses jika route tidak membutuhkan role (@RequireRole tidak diset)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockContext({ role: Role.Employee });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('harus melempar UnauthenticatedException jika user atau role tidak ada pada context', () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'roles') return [Role.SystemAdmin];
      return false;
    });

    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(UnauthenticatedException);
  });

  it('harus melempar ForbiddenException jika role user tidak terdaftar pada @RequireRole', () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'roles') return [Role.SystemAdmin, Role.HRGA];
      return false;
    });

    const context = createMockContext({ role: Role.Employee });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('harus mengizinkan akses jika role user cocok dengan salah satu peran yang diizinkan', () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'roles') return [Role.Supervisor_TL, Role.Head];
      return false;
    });

    const context = createMockContext({ role: Role.Supervisor_TL });
    expect(guard.canActivate(context)).toBe(true);
  });
});
