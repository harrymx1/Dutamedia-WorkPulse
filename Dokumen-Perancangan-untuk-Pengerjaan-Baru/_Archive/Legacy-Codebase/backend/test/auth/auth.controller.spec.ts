import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from '../../src/modules/auth/auth.controller.js';

describe('AuthController (SAD §10.1 - EPIC-03)', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockResponse: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      adminResetPassword: vi.fn(),
      getMe: vi.fn(),
    };

    mockResponse = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };

    controller = new AuthController(mockAuthService);
  });

  describe('login (POST /api/v1/auth/login)', () => {
    it('harus memanggil authService.login, mengatur cookie access_token & csrf_token, dan mengembalikan data user', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'jwt.token.val',
        csrfToken: 'csrf.token.val',
        mustResetPassword: false,
        user: {
          id: 'user-1',
          fullName: 'Budi Santoso',
          email: 'budi@dutamedia.com',
          role: 'Employee',
          function: 'Technology',
        },
      });

      const mockRequest: any = {
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      };

      const result = await controller.login(
        { email: 'budi@dutamedia.com', password: 'Password123!' },
        mockRequest,
        mockResponse,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        { email: 'budi@dutamedia.com', password: 'Password123!' },
        '192.168.1.1',
        'Mozilla/5.0',
      );

      // Pastikan kedua cookie diset sesuai spesifikasi SAD §8.6
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt.token.val',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 12 * 60 * 60 * 1000,
          path: '/',
        }),
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'csrf_token',
        'csrf.token.val',
        expect.objectContaining({
          httpOnly: false,
          maxAge: 12 * 60 * 60 * 1000,
          path: '/',
        }),
      );

      expect(result).toEqual({
        mustResetPassword: false,
        user: {
          id: 'user-1',
          fullName: 'Budi Santoso',
          email: 'budi@dutamedia.com',
          role: 'Employee',
          function: 'Technology',
        },
      });
    });
  });

  describe('logout (POST /api/v1/auth/logout)', () => {
    it('harus memanggil authService.logout dan menghapus kedua cookie sesi', async () => {
      const result = await controller.logout('session-1', mockResponse);

      expect(mockAuthService.logout).toHaveBeenCalledWith('session-1');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'csrf_token',
        expect.objectContaining({
          httpOnly: false,
          path: '/',
        }),
      );
      expect(result).toBeUndefined(); // 204 No Content
    });
  });

  describe('resetPassword (POST /api/v1/auth/reset-password)', () => {
    it('harus memanggil authService.resetPassword dengan userId dari CurrentUser', async () => {
      mockAuthService.resetPassword.mockResolvedValue({ success: true });

      const result = await controller.resetPassword('user-1', {
        newPassword: 'NewSecurePassword123!',
      });

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('user-1', {
        newPassword: 'NewSecurePassword123!',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('adminResetPassword (POST /api/v1/auth/admin-reset-password/:userId)', () => {
    it('harus memanggil authService.adminResetPassword dengan targetUserId dan actorAdminId', async () => {
      mockAuthService.adminResetPassword.mockResolvedValue({
        temporaryPassword: 'abcdef012345',
      });

      const result = await controller.adminResetPassword(
        'target-user-1',
        'admin-user-1',
      );

      expect(mockAuthService.adminResetPassword).toHaveBeenCalledWith(
        'target-user-1',
        'admin-user-1',
      );
      expect(result).toEqual({ temporaryPassword: 'abcdef012345' });
    });
  });

  describe('getMe (GET /api/v1/auth/me)', () => {
    it('harus memanggil authService.getMe dengan userId dari CurrentUser', async () => {
      const profile = {
        userId: 'user-1',
        fullName: 'Budi Santoso',
        email: 'budi@dutamedia.com',
        role: 'Employee',
        function: 'Technology',
        directManagerId: 'mgr-1',
        mustResetPassword: false,
        permissionsSummary: {
          projectAuthorities: [],
          temporaryReviewerScopes: [],
        },
      };

      mockAuthService.getMe.mockResolvedValue(profile);

      const result = await controller.getMe('user-1');

      expect(mockAuthService.getMe).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(profile);
    });
  });
});
