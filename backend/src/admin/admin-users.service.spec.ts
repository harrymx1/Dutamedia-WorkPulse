import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminUsersService } from './admin-users.service';
import { UserStatus } from '@prisma/client';

describe('AdminUsersService (WP-EP02-TK004 / DEC-005)', () => {
  let service: AdminUsersService;
  let mockPrisma: any;
  let mockTokenService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      userInvitation: {
        create: vi.fn(),
        updateMany: vi.fn(),
        findMany: vi.fn(),
      },
      session: {
        updateMany: vi.fn(),
      },
      organizationalAssignment: {
        create: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      }),
    };

    mockTokenService = {
      generateRandomToken: vi.fn().mockReturnValue('raw_token_72h'),
      hashToken: vi.fn().mockImplementation((t) => `hashed_${t}`),
    };

    service = new AdminUsersService(mockPrisma, mockTokenService);
  });

  describe('resendInvitation (WP-EP02-TK004)', () => {
    it('must revoke old pending tokens and issue fresh 72h token (DEC-005)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        status: UserStatus.INVITED,
      });

      const res = await service.resendInvitation('usr-1', 'admin-id');

      expect(res.token).toBe('raw_token_72h');
      expect(res.expiresAt).toBeDefined();

      // Memastikan token lama dicabut dengan alasan RESENT_BY_ADMIN
      expect(mockPrisma.userInvitation.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-1', status: 'PENDING' },
        data: expect.objectContaining({
          status: 'REVOKED',
          revocationReason: 'RESENT_BY_ADMIN',
        }),
      });

      // Memastikan token baru diterbitkan
      expect(mockPrisma.userInvitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'usr-1',
          tokenHash: 'hashed_raw_token_72h',
          status: 'PENDING',
          createdByUserId: 'admin-id',
        }),
      });
    });
  });

  describe('updateUserStatus (WP-EP02-TK004: Inactivation Session Revocation)', () => {
    it('when status is set to INACTIVE, must immediately revoke all active user sessions', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-target',
        status: UserStatus.ACTIVE,
      });

      await service.updateUserStatus(
        'usr-target',
        { status: UserStatus.INACTIVE },
        'admin-id',
      );

      // Memastikan user diupdate menjadi INACTIVE
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-target' },
        data: expect.objectContaining({ status: UserStatus.INACTIVE }),
      });

      // KRITIKAL: Memastikan seluruh sesi aktif dicabut seketika
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-target', revokedAt: null },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      });
    });
  });
});

