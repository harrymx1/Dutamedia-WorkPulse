import { describe, it, expect, beforeEach, vi } from 'vitest';
import argon2 from 'argon2';
import { UserStatus } from '@prisma/client';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import {
  ForbiddenException,
  NotFoundException,
  UnauthenticatedException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('AuthService (SAD §8.1-8.6, §10.1 - EPIC-03)', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockIdentityService: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      session: {
        create: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('jwt.test.token'),
    };

    mockIdentityService = {
      resolveActiveContext: vi.fn().mockResolvedValue({
        role: 'Employee',
        function: 'Technology',
        directManagerId: 'manager-1',
        assignmentId: 'assign-1',
      }),
      resolveProjectAuthorities: vi.fn().mockResolvedValue(['Project-A']),
      resolveTemporaryReviewers: vi.fn().mockResolvedValue([
        { scope: 'Function:Technology' },
      ]),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    service = new AuthService(
      mockPrisma,
      mockJwtService,
      mockIdentityService,
      mockAuditService,
    );
  });

  describe('login (EPIC-03-T1 - SAD §8.4, §10.1)', () => {
    it('harus berhasil login dan mengembalikan token JWT, CSRF, serta data pengguna', async () => {
      const password = 'CorrectPassword123!';
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'budi@dutamedia.com',
        fullName: 'Budi Santoso',
        passwordHash,
        status: UserStatus.Active,
        mustResetPassword: false,
      });

      mockPrisma.session.create.mockResolvedValue({
        id: 'session-uuid-1',
        userId: 'user-uuid-1',
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      });

      const result = await service.login(
        { email: 'BUDI@dutamedia.com ', password },
        '127.0.0.1',
        'VitestAgent/1.0',
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'budi@dutamedia.com' },
      });
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-1',
          userAgent: 'VitestAgent/1.0',
          expiresAt: expect.any(Date),
        },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-uuid-1',
        jti: 'session-uuid-1',
      });
      expect(result.accessToken).toBe('jwt.test.token');
      expect(result.csrfToken).toHaveLength(32); // 16 bytes hex
      expect(result.mustResetPassword).toBe(false);
      expect(result.user).toEqual({
        id: 'user-uuid-1',
        fullName: 'Budi Santoso',
        email: 'budi@dutamedia.com',
        role: 'Employee',
        function: 'Technology',
      });
    });

    it('harus melempar UnauthenticatedException jika email tidak ditemukan', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@dutamedia.com',
          password: 'AnyPassword123!',
        }),
      ).rejects.toThrow(UnauthenticatedException);
    });

    it('harus melempar UnauthenticatedException jika password salah', async () => {
      const passwordHash = await argon2.hash('ActualPassword123!', {
        type: argon2.argon2id,
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'budi@dutamedia.com',
        passwordHash,
        status: UserStatus.Active,
      });

      await expect(
        service.login({
          email: 'budi@dutamedia.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthenticatedException);
    });

    it('harus melempar ForbiddenException jika status pengguna nonaktif (SAD §8.4)', async () => {
      const password = 'Password123!';
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'budi@dutamedia.com',
        passwordHash,
        status: UserStatus.Inactive,
      });

      await expect(
        service.login({
          email: 'budi@dutamedia.com',
          password,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout (EPIC-03-T2 - SAD §8.4, §10.1)', () => {
    it('harus mencabut sesi dengan mengupdate revokedAt pada sesi aktif', async () => {
      await service.logout('session-uuid-1');

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'session-uuid-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('tidak melakukan operasi jika sessionId kosong', async () => {
      await service.logout('');
      expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword (EPIC-03-T4 - SAD §8.2, §10.1)', () => {
    it('harus mengupdate password hash, membuka lock mustResetPassword, dan mencatat audit trail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        mustResetPassword: true,
      });

      const result = await service.resetPassword('user-uuid-1', {
        newPassword: 'BrandNewSecurePassword123!',
      });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          passwordHash: expect.any(String),
          mustResetPassword: false,
        },
      });
      expect(mockAuditService.record).toHaveBeenCalledWith(
        {
          actorUserId: 'user-uuid-1',
          action: 'USER_PASSWORD_RESET',
          relatedEntityType: 'User',
          relatedEntityId: 'user-uuid-1',
          valueBefore: { mustResetPassword: true },
          valueAfter: { mustResetPassword: false },
        },
        mockPrisma,
      );
    });

    it('harus melempar NotFoundException jika pengguna tidak ditemukan', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword('unknown-user', {
          newPassword: 'BrandNewSecurePassword123!',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminResetPassword (EPIC-03-T4 - SAD §8.2, §10.1, §15.3)', () => {
    it('harus menghasilkan temporary password 12 karakter hex, set mustResetPassword=true, revoke semua sesi aktif, dan catat audit trail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'target-user-1',
        email: 'employee@dutamedia.com',
      });

      const result = await service.adminResetPassword(
        'target-user-1',
        'admin-uuid-1',
      );

      expect(result.temporaryPassword).toHaveLength(12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'target-user-1' },
        data: {
          passwordHash: expect.any(String),
          mustResetPassword: true,
        },
      });
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'target-user-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
      expect(mockAuditService.record).toHaveBeenCalledWith(
        {
          actorUserId: 'admin-uuid-1',
          action: 'ADMIN_PASSWORD_RESET',
          relatedEntityType: 'User',
          relatedEntityId: 'target-user-1',
          valueAfter: {
            mustResetPassword: true,
          },
        },
        mockPrisma,
      );
    });

    it('harus melempar NotFoundException jika target user tidak ditemukan', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.adminResetPassword('non-existent-user', 'admin-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMe (EPIC-03-T5 - SAD §10.1)', () => {
    it('harus mengembalikan profil lengkap pengguna beserta konteks aktif dan permissions summary', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        fullName: 'Siti Aminah',
        email: 'siti@dutamedia.com',
        mustResetPassword: false,
      });

      const me = await service.getMe('user-uuid-1');

      expect(me).toEqual({
        userId: 'user-uuid-1',
        fullName: 'Siti Aminah',
        email: 'siti@dutamedia.com',
        role: 'Employee',
        function: 'Technology',
        directManagerId: 'manager-1',
        mustResetPassword: false,
        permissionsSummary: {
          projectAuthorities: ['Project-A'],
          temporaryReviewerScopes: ['Function:Technology'],
        },
      });
    });

    it('harus melempar NotFoundException jika pengguna tidak ada di database', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('unknown-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
