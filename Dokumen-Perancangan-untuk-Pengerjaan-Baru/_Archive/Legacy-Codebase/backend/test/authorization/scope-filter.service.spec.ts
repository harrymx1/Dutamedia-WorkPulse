import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { ForbiddenException } from '../../src/modules/shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../../src/modules/auth/decorators/current-user.decorator.js';

describe('ScopeFilterService (SAD §8.11 - EPIC-05-T4)', () => {
  let service: ScopeFilterService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      organizationalAssignment: {
        findMany: vi.fn(),
      },
    };
    service = new ScopeFilterService(mockPrisma);
  });

  const createUser = (role: Role, functionName: string = 'Technology'): CurrentUserPayload => ({
    userId: 'user-1',
    email: 'user@dutamedia.com',
    role,
    function: functionName,
    directManagerId: null,
    sessionId: 'session-1',
    mustResetPassword: false,
  });

  describe('getAccessibleUserIds', () => {
    it('harus membatasi Employee hanya pada userId miliknya sendiri (SAD §8.11)', async () => {
      const user = createUser(Role.Employee);
      const result = await service.getAccessibleUserIds(user);
      expect(result).toEqual(['user-1']);
    });

    it('harus mengembalikan userId diri sendiri dan seluruh subordinat langsung untuk Supervisor_TL', async () => {
      const user = createUser(Role.Supervisor_TL);
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'subordinate-1' },
        { userId: 'subordinate-2' },
      ]);

      const result = await service.getAccessibleUserIds(user);
      expect(result).toEqual(['user-1', 'subordinate-1', 'subordinate-2']);
      expect(mockPrisma.organizationalAssignment.findMany).toHaveBeenCalledWith({
        where: {
          directManagerId: 'user-1',
          effectiveDate: { lte: expect.any(Date) },
          OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
        },
        select: { userId: true },
      });
    });

    it('harus mengembalikan seluruh user dalam fungsi yang sama untuk peran Head', async () => {
      const user = createUser(Role.Head, 'Engineering');
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'user-1' },
        { userId: 'eng-1' },
        { userId: 'eng-2' },
      ]);

      const result = await service.getAccessibleUserIds(user);
      expect(result).toEqual(['user-1', 'eng-1', 'eng-2']);
      expect(mockPrisma.organizationalAssignment.findMany).toHaveBeenCalledWith({
        where: {
          function: 'Engineering',
          effectiveDate: { lte: expect.any(Date) },
          OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
        },
        select: { userId: true },
      });
    });

    it('harus mengembalikan null (company-wide / tanpa filter) untuk HRGA dan CEO_Management (PRD §7)', async () => {
      const hrga = createUser(Role.HRGA);
      const ceo = createUser(Role.CEO_Management);

      expect(await service.getAccessibleUserIds(hrga)).toBeNull();
      expect(await service.getAccessibleUserIds(ceo)).toBeNull();
    });

    it('harus melempar ForbiddenException jika SystemAdmin mengakses data operasional (SAD §8.11)', async () => {
      const admin = createUser(Role.SystemAdmin);

      await expect(service.getAccessibleUserIds(admin)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('buildScopeFilter', () => {
    it('harus menghasilkan filter { fieldName: userId } jika hanya 1 user yang diizinkan', async () => {
      const user = createUser(Role.Employee);
      const filter = await service.buildScopeFilter(user, 'employeeUserId');

      expect(filter).toEqual({ employeeUserId: 'user-1' });
    });

    it('harus menghasilkan filter { fieldName: { in: [...] } } untuk Supervisor dengan banyak subordinat', async () => {
      const user = createUser(Role.Supervisor_TL);
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'sub-1' },
        { userId: 'sub-2' },
      ]);

      const filter = await service.buildScopeFilter(user, 'employeeUserId');
      expect(filter).toEqual({
        employeeUserId: {
          in: ['user-1', 'sub-1', 'sub-2'],
        },
      });
    });

    it('harus menghasilkan filter kosong {} untuk HRGA / CEO (company-wide)', async () => {
      const hrga = createUser(Role.HRGA);
      const filter = await service.buildScopeFilter(hrga, 'employeeUserId');

      expect(filter).toEqual({});
    });
  });

  describe('isUserInScope', () => {
    it('harus mengembalikan true jika targetUserId adalah user itu sendiri', async () => {
      const user = createUser(Role.Employee);
      expect(await service.isUserInScope(user, 'user-1')).toBe(true);
    });

    it('harus mengembalikan true untuk HRGA terhadap user mana pun', async () => {
      const hrga = createUser(Role.HRGA);
      expect(await service.isUserInScope(hrga, 'any-user-id')).toBe(true);
    });

    it('harus mengembalikan true jika targetUserId adalah subordinat dari Supervisor', async () => {
      const supervisor = createUser(Role.Supervisor_TL);
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'sub-1' },
      ]);

      expect(await service.isUserInScope(supervisor, 'sub-1')).toBe(true);
    });

    it('harus mengembalikan false jika targetUserId bukan subordinat Supervisor', async () => {
      const supervisor = createUser(Role.Supervisor_TL);
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'sub-1' },
      ]);

      expect(await service.isUserInScope(supervisor, 'other-sub')).toBe(false);
    });
  });
});
