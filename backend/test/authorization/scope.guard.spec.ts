import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { ScopeGuard } from '../../src/modules/authorization/guards/scope.guard.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('ScopeGuard (SAD §8.8 - EPIC-05-T2)', () => {
  let guard: ScopeGuard;
  let mockReflector: any;
  let mockScopeResolver: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };
    mockScopeResolver = {
      checkScope: vi.fn(),
    };
    guard = new ScopeGuard(mockReflector, mockScopeResolver);
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

  it('harus mengizinkan akses jika route beranotasi @Public()', async () => {
    mockReflector.getAllAndOverride.mockImplementation(
      (key: string) => key === 'isPublic',
    );

    const context = createMockContext({});
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockScopeResolver.checkScope).not.toHaveBeenCalled();
  });

  it('harus mengizinkan akses jika route tidak memerlukan validasi scope (@RequireScope tidak diset)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockContext({ user: { userId: 'user-1' } });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockScopeResolver.checkScope).not.toHaveBeenCalled();
  });

  it('harus melempar UnauthenticatedException jika user tidak ada pada request', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'requireScope') {
        return { resourceType: 'Blocker', idParam: 'id' };
      }
      return false;
    });

    const context = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar ForbiddenException jika ID resource tidak ditemukan pada request', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'requireScope') {
        return { resourceType: 'Blocker', idParam: 'id', idSource: 'param' };
      }
      return false;
    });

    const context = createMockContext({
      user: { userId: 'user-1' },
      params: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('harus melempar ForbiddenException jika scope check mengembalikan false (tidak berwenang)', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'requireScope') {
        return { resourceType: 'Blocker', idParam: 'id', idSource: 'param' };
      }
      return false;
    });

    mockScopeResolver.checkScope.mockResolvedValue(false);

    const context = createMockContext({
      user: { userId: 'user-1', role: 'Employee' },
      params: { id: 'blocker-uuid-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockScopeResolver.checkScope).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'blocker-uuid-1',
        resourceType: 'Blocker',
      }),
    );
  });

  it('harus mengizinkan akses jika scope check mengembalikan true', async () => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'requireScope') {
        return {
          resourceType: 'CorrectionRequest',
          idParam: 'crId',
          idSource: 'body',
        };
      }
      return false;
    });

    mockScopeResolver.checkScope.mockResolvedValue(true);

    const context = createMockContext({
      user: { userId: 'user-1', role: 'Supervisor_TL' },
      body: { crId: 'cr-uuid-123' },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockScopeResolver.checkScope).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'cr-uuid-123',
        resourceType: 'CorrectionRequest',
      }),
    );
  });
});
