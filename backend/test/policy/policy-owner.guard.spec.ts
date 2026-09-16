import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { PolicyCategory } from '@prisma/client';
import { PolicyOwnerGuard } from '../../src/modules/policy/guards/policy-owner.guard.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('PolicyOwnerGuard (SAD §8.10, BR-15 - EPIC-06-T3)', () => {
  let guard: PolicyOwnerGuard;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      policyOwnerAssignment: {
        findFirst: vi.fn(),
      },
    };
    guard = new PolicyOwnerGuard(mockPrisma);
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

  it('harus melempar UnauthenticatedException jika user tidak ada pada request', async () => {
    const context = createMockContext({ body: { category: PolicyCategory.Cutoff } });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthenticatedException,
    );
  });

  it('harus melempar ForbiddenException jika kategori kebijakan tidak valid atau tidak disertakan', async () => {
    const context = createMockContext({
      user: { userId: 'user-1' },
      body: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('harus melempar ForbiddenException jika user bukan Authorized Policy Owner untuk kategori tersebut (SAD §8.10, BR-15)', async () => {
    mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue(null);

    const context = createMockContext({
      user: { userId: 'user-1' },
      body: { category: PolicyCategory.Cutoff },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockPrisma.policyOwnerAssignment.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        policyCategory: PolicyCategory.Cutoff,
        effectiveDate: { lte: expect.any(Date) },
        OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
      },
    });
  });

  it('harus mengizinkan akses jika user memiliki PolicyOwnerAssignment aktif untuk kategori tersebut', async () => {
    mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue({
      id: 'poa-1',
      userId: 'user-1',
      policyCategory: PolicyCategory.Cutoff,
    });

    const context = createMockContext({
      user: { userId: 'user-1' },
      body: { category: PolicyCategory.Cutoff },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
