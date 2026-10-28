import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/constants/error-codes';

describe('AuthService (EP02-TK002 & EP02-TK003)', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockPasswordHasher: any;
  let mockTokenService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      userInvitation: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      session: {
        create: vi.fn(),
        updateMany: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      }),
    };

    mockPasswordHasher = {
      hash: vi.fn().mockResolvedValue('$argon2id$v=19$mock_hash'),
      verify: vi.fn(),
    };

    mockTokenService = {
      generateRandomToken: vi.fn().mockReturnValue('random_token_mock'),
      hashToken: vi.fn().mockImplementation((t) => `hashed_${t}`),
      signAccessToken: vi.fn().mockReturnValue('mock_jwt_access_token'),
      verifyAccessToken: vi.fn(),
    };

    authService = new AuthService(
      mockPrisma,
      mockPasswordHasher,
      mockTokenService,
    );
  });

  describe('login (WP-EP02-TK002)', () => {
    it('should reject non-existent user with AUTH_UNAUTHENTICATED', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'unknown@dutamedia.com', password: 'Password123!' }),
      ).rejects.toThrowError(AppException);
    });

    it('should reject unactivated (INVITED) user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        email: 'invited@dutamedia.com',
        status: 'INVITED',
      });

      await expect(
        authService.login({ email: 'invited@dutamedia.com', password: 'Password123!' }),
      ).rejects.toThrowError(AppException);
    });

    it('should reject INACTIVE user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-2',
        email: 'inactive@dutamedia.com',
        status: 'INACTIVE',
      });

      await expect(
        authService.login({ email: 'inactive@dutamedia.com', password: 'Password123!' }),
      ).rejects.toThrowError(AppException);
    });

    it('should successfully issue session and tokens for active user with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-active',
        email: 'active@dutamedia.com',
        fullName: 'Active User',
        status: 'ACTIVE',
        passwordHash: '$argon2id$valid',
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        role: 'EMPLOYEE',
      });
      mockPrisma.session.create.mockResolvedValue({
        id: 'sess-123',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await authService.login({
        email: 'active@dutamedia.com',
        password: 'CorrectPassword123!',
      });

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.csrfToken).toBeDefined();
      expect(result.user.id).toBe('usr-active');
      expect(result.user.role).toBe('EMPLOYEE');
    });
  });

  describe('activate (WP-EP02-TK003: Token 72 Jam & Sekali Pakai)', () => {
    it('should reject unknown token', async () => {
      mockPrisma.userInvitation.findUnique.mockResolvedValue(null);

      await expect(
        authService.activate({ token: 'invalid_token', password: 'NewPassword123!' }),
      ).rejects.toThrowError(AppException);
    });

    it('should reject already USED invitation token', async () => {
      mockPrisma.userInvitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        status: 'USED',
        expiresAt: new Date(Date.now() + 1000000),
      });

      await expect(
        authService.activate({ token: 'used_token', password: 'NewPassword123!' }),
      ).rejects.toThrowError(AppException);
    });

    it('should reject expired invitation token (> 72 hours)', async () => {
      mockPrisma.userInvitation.findUnique.mockResolvedValue({
        id: 'inv-2',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000), // Sudah lewat
      });

      await expect(
        authService.activate({ token: 'expired_token', password: 'NewPassword123!' }),
      ).rejects.toThrowError(AppException);
    });

    it('should activate user and consume token on valid request', async () => {
      mockPrisma.userInvitation.findUnique.mockResolvedValue({
        id: 'inv-valid',
        userId: 'usr-invited',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 72 * 3600 * 1000),
      });

      const response = await authService.activate({
        token: 'valid_72h_token',
        password: 'NewSecurePassword123!',
      });

      expect(response.message).toContain('berhasil diaktifkan');
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('NewSecurePassword123!');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-invited' },
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
      expect(mockPrisma.userInvitation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-valid' },
          data: expect.objectContaining({ status: 'USED' }),
        }),
      );
    });
  });
});

