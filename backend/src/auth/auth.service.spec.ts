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
        count: vi.fn().mockResolvedValue(0),
      },
      temporaryReviewerAssignment: {
        count: vi.fn().mockResolvedValue(0),
      },
      projectAuthorityMapping: {
        count: vi.fn().mockResolvedValue(0),
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
      expect(result.user.isCategoryOwner).toBe(false);
    });

    it('sets isCategoryOwner=true and ownedBlockerCategories when user holds BlockerCategoryOwner mandates (DEC-017)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'staff-reza',
        email: 'network.infra@dutamedia.com',
        fullName: 'Reza Mahendra',
        status: 'ACTIVE',
        passwordHash: '$argon2id$valid',
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        role: 'EMPLOYEE',
        jobTitle: 'Network & Infrastructure Engineer',
        function: 'OperationsInfrastructure',
      });
      mockPrisma.blockerCategoryOwner = {
        findMany: vi.fn().mockResolvedValue([
          { blockerType: 'INFRA' },
          { blockerType: 'NETWORK' },
        ]),
      };
      mockPrisma.session.create.mockResolvedValue({
        id: 'sess-cat-owner',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await authService.login({
        email: 'network.infra@dutamedia.com',
        password: 'Password123!',
      });

      expect(result.user.isCategoryOwner).toBe(true);
      expect(result.user.ownedBlockerCategories).toEqual(['INFRA', 'NETWORK']);
    });

    it('returns assignmentEffectiveDate, activeExemption from boundedExemption, and reminderSchedule from active policy', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-exempt',
        email: 'exempt@dutamedia.com',
        fullName: 'Dewi Lestari',
        status: 'ACTIVE',
        passwordHash: '$argon2id$valid',
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        role: 'EMPLOYEE',
        jobTitle: 'QA Engineer',
        function: 'Quality',
        effectiveDate: new Date('2026-03-10T00:00:00.000Z'),
      });
      mockPrisma.boundedExemption = {
        findFirst: vi.fn().mockResolvedValue({
          exemptionCategory: 'Dinas Luar Kota',
          startDate: new Date('2026-11-20T00:00:00.000Z'),
          endDate: new Date('2026-11-25T00:00:00.000Z'),
        }),
      };
      mockPrisma.policy = {
        findFirst: vi.fn().mockResolvedValue({
          configurationValues: {
            morningOnTimeCutoff: '08:30',
            eodOnTimeCutoff: '17:30',
          },
        }),
      };
      mockPrisma.session.create.mockResolvedValue({
        id: 'sess-exempt',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await authService.login({
        email: 'exempt@dutamedia.com',
        password: 'Password123!',
      });

      expect(result.user.assignmentEffectiveDate).toBe('2026-03-10');
      expect(result.user.activeExemption).toEqual({
        type: 'BOUNDED',
        category: 'Dinas Luar Kota',
        startDate: '2026-11-20',
        endDate: '2026-11-25',
      });
      expect(result.user.reminderSchedule).toEqual({
        leadMinutes: 60,
        morningReminderTime: '07:30',
        eodReminderTime: '16:30',
        morningOnTimeCutoff: '08:30',
        eodOnTimeCutoff: '17:30',
      });
    });

    it('returns activeExemption with type PERMANENT when boundedExemption has null endDate (DEC-022)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-perm',
        email: 'perm@dutamedia.com',
        fullName: 'Penasihat Teknis',
        status: 'ACTIVE',
        passwordHash: '$argon2id$valid',
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        role: 'EMPLOYEE',
        jobTitle: 'Technical Advisor',
        function: 'RnD',
        effectiveDate: new Date('2026-03-10T00:00:00.000Z'),
      });
      mockPrisma.boundedExemption = {
        findFirst: vi.fn().mockResolvedValue({
          exemptionCategory: 'Pengecualian Permanen',
          startDate: new Date('2026-11-25T00:00:00.000Z'),
          endDate: null,
        }),
      };
      mockPrisma.session.create.mockResolvedValue({
        id: 'sess-perm',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await authService.login({
        email: 'perm@dutamedia.com',
        password: 'Password123!',
      });

      expect(result.user.activeExemption).toEqual({
        type: 'PERMANENT',
        category: 'Pengecualian Permanen',
        startDate: '2026-11-25',
        endDate: null,
      });
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

    it('should reject password without combination of letters and digits', async () => {
      await expect(
        authService.activate({ token: 'valid_token', password: 'onlyletters' }),
      ).rejects.toThrowError(AppException);

      await expect(
        authService.activate({ token: 'valid_token', password: '12345678' }),
      ).rejects.toThrowError(AppException);
    });
  });

  describe('getInvitationPreview (Kartu Pratinjau Akun Undangan)', () => {
    it('returns valid account details for active PENDING token', async () => {
      mockPrisma.userInvitation.findUnique.mockResolvedValue({
        id: 'inv-active',
        userId: 'usr-fajar',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 72 * 3600 * 1000),
        user: {
          id: 'usr-fajar',
          fullName: 'Fajar Ramadhan',
          email: 'calon.karyawan@dutamedia.com',
          status: 'INVITED',
        },
      });
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        function: 'Engineering',
        jobTitle: 'Junior Developer',
      });

      const preview = await authService.getInvitationPreview('wp_seed_invite_token_72h_demo_secret');

      expect(preview.valid).toBe(true);
      expect(preview.status).toBe('PENDING');
      expect(preview.account).toEqual({
        fullName: 'Fajar Ramadhan',
        email: 'calon.karyawan@dutamedia.com',
        department: 'Engineering',
        jobTitle: 'Junior Developer',
      });
    });

    it('returns valid=false and EXPIRED or USED status cleanly without throwing', async () => {
      mockPrisma.userInvitation.findUnique.mockResolvedValueOnce({
        id: 'inv-exp',
        userId: 'usr-1',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 5000),
        user: { id: 'usr-1', fullName: 'Test', email: 'test@dutamedia.com', status: 'INVITED' },
      });

      const expResult = await authService.getInvitationPreview('expired_tok');
      expect(expResult.valid).toBe(false);
      expect(expResult.status).toBe('EXPIRED');

      mockPrisma.userInvitation.findUnique.mockResolvedValueOnce(null);
      const missingResult = await authService.getInvitationPreview('unknown_tok');
      expect(missingResult.valid).toBe(false);
      expect(missingResult.status).toBe('NOT_FOUND');
    });
  });

  describe('changePassword (Audit #24 - Validasi Sandi & Cabut Sesi Perangkat Lain)', () => {
    it('rejects short password, missing letters/digits, identical new password, and wrong current password', async () => {
      await expect(
        authService.changePassword('usr-1', {
          currentPassword: 'Password123!',
          newPassword: 'abc12',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });

      await expect(
        authService.changePassword('usr-1', {
          currentPassword: 'Password123!',
          newPassword: 'semuahurufsaja',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });

      await expect(
        authService.changePassword('usr-1', {
          currentPassword: 'Password123!',
          newPassword: 'Password123!',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        passwordHash: '$argon2id$valid',
      });
      mockPasswordHasher.verify.mockResolvedValue(false);

      await expect(
        authService.changePassword('usr-1', {
          currentPassword: 'WrongPassword1!',
          newPassword: 'NewPassword99!',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    });

    it('revokes all other active sessions when revokeOtherSessions is true and keeps them when false', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        passwordHash: '$argon2id$valid',
      });
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockPrisma.session.updateMany.mockResolvedValue({ count: 2 });

      const revokedRes = await authService.changePassword(
        'usr-1',
        {
          currentPassword: 'Password123!',
          newPassword: 'PasswordBaru123!',
          revokeOtherSessions: true,
        },
        'sess-current',
      );

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'usr-1',
          revokedAt: null,
          id: { not: 'sess-current' },
        },
        data: { revokedAt: expect.any(Date) },
      });
      expect(revokedRes.revokedOtherSessionsCount).toBe(2);
      expect(revokedRes.message).toContain('perangkat/peramban lain');

      mockPrisma.session.updateMany.mockClear();

      const keptRes = await authService.changePassword(
        'usr-1',
        {
          currentPassword: 'Password123!',
          newPassword: 'PasswordBaru456!',
          revokeOtherSessions: false,
        },
        'sess-current',
      );

      expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
      expect(keptRes.revokedOtherSessionsCount).toBe(0);
    });
  });
});

