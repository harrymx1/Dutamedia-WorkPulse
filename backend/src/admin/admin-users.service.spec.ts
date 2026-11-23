import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminUsersService } from './admin-users.service';
import { CanonicalFunction, CanonicalRole, EmploymentStatus, UserStatus } from '@prisma/client';

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
      auditLog: {
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

  describe('listUsers (Audit #25 Summary, Expiry & Filters)', () => {
    const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const sampleUsers = [
      {
        id: 'u-1',
        fullName: 'Dewi Anjani',
        email: 'dewi@dutamedia.com',
        status: UserStatus.ACTIVE,
        createdAt: new Date('2026-10-01T00:00:00Z'),
        invitation: [{ id: 'inv-1', status: 'USED', expiresAt: pastDate, createdAt: pastDate }],
        orgAssignments: [
          {
            role: CanonicalRole.HEAD,
            function: CanonicalFunction.OperationsInfrastructure,
            jobTitle: 'Head of Ops',
            employmentStatus: EmploymentStatus.PERMANENT,
            effectiveDate: new Date('2026-01-01'),
            endDate: null,
            directManager: { id: 'ceo-1', fullName: 'Hendra Wijaya' },
          },
        ],
      },
      {
        id: 'u-2',
        fullName: 'Karyawan Undangan Baru',
        email: 'baru@dutamedia.com',
        status: UserStatus.INVITED,
        createdAt: new Date('2026-11-22T00:00:00Z'),
        invitation: [{ id: 'inv-2', status: 'PENDING', expiresAt: futureDate, createdAt: new Date() }],
        orgAssignments: [
          {
            role: CanonicalRole.EMPLOYEE,
            function: CanonicalFunction.Engineering,
            jobTitle: 'Backend Engineer',
            employmentStatus: EmploymentStatus.INTERN,
            effectiveDate: new Date('2026-11-22'),
            endDate: new Date('2027-02-22'),
            directManager: null,
          },
        ],
      },
      {
        id: 'u-3',
        fullName: 'Undangan Kedaluwarsa',
        email: 'expired@dutamedia.com',
        status: UserStatus.INVITED,
        createdAt: new Date('2026-11-01T00:00:00Z'),
        invitation: [{ id: 'inv-3', status: 'PENDING', expiresAt: pastDate, createdAt: pastDate }],
        orgAssignments: [
          {
            role: CanonicalRole.EMPLOYEE,
            function: CanonicalFunction.RnD,
            jobTitle: 'R&D Engineer',
            employmentStatus: EmploymentStatus.CONTRACT,
            effectiveDate: new Date('2026-11-01'),
            endDate: null,
            directManager: null,
          },
        ],
      },
      {
        id: 'u-4',
        fullName: 'Akun Nonaktif',
        email: 'nonaktif@dutamedia.com',
        status: UserStatus.INACTIVE,
        createdAt: new Date('2026-09-01T00:00:00Z'),
        invitation: [],
        orgAssignments: [
          {
            role: CanonicalRole.SUPERVISOR,
            function: CanonicalFunction.Finance,
            jobTitle: 'Finance Lead',
            employmentStatus: EmploymentStatus.PERMANENT,
            effectiveDate: new Date('2026-09-01'),
            endDate: null,
            directManager: null,
          },
        ],
      },
    ];

    it('computes EXPIRED status for past-due PENDING invitation and returns summary counts', async () => {
      mockPrisma.user.findMany.mockResolvedValue(sampleUsers);

      const res = await service.listUsers({});

      expect(res.summary).toEqual({
        total: 4,
        active: 1,
        invited: 2,
        invitedPending: 1,
        invitedExpired: 1,
        invitedRevoked: 0,
        inactive: 1,
        needsAttention: 2,
      });

      const expiredRow = res.data.find((u) => u.id === 'u-3');
      expect(expiredRow?.invitation?.status).toBe('EXPIRED');
      const headRow = res.data.find((u) => u.id === 'u-1');
      expect(headRow?.directManagerName).toBe('Hendra Wijaya');
    });

    it('filters accurately by role, function, employmentStatus, and NEEDS_ATTENTION', async () => {
      mockPrisma.user.findMany.mockResolvedValue(sampleUsers);

      const attentionRes = await service.listUsers({ status: 'NEEDS_ATTENTION' });
      expect(attentionRes.data.map((u) => u.id)).toEqual(['u-3', 'u-4']);
      expect(attentionRes.summary.total).toBe(4);

      const roleFuncRes = await service.listUsers({
        role: CanonicalRole.HEAD,
        function: CanonicalFunction.OperationsInfrastructure,
      });
      expect(roleFuncRes.data.map((u) => u.id)).toEqual(['u-1']);

      const empRes = await service.listUsers({ employmentStatus: EmploymentStatus.INTERN });
      expect(empRes.data.map((u) => u.id)).toEqual(['u-2']);
    });
  });

  describe('resendInvitation (WP-EP02-TK004)', () => {
    it('must revoke old pending tokens, issue fresh 72h token (DEC-005), and log audit trail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-1',
        fullName: 'Calon Staf',
        email: 'calon@dutamedia.com',
        status: UserStatus.INVITED,
      });

      const res = await service.resendInvitation('usr-1', 'admin-id', 'Tautan lama kedaluwarsa');

      expect(res.token).toBe('raw_token_72h');
      expect(res.expiresAt).toBeDefined();
      expect(res.user).toEqual({
        id: 'usr-1',
        fullName: 'Calon Staf',
        email: 'calon@dutamedia.com',
      });

      // Memastikan token lama dicabut dengan alasan yang diberikan
      expect(mockPrisma.userInvitation.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr-1', status: 'PENDING' },
        data: expect.objectContaining({
          status: 'REVOKED',
          revocationReason: 'Tautan lama kedaluwarsa',
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

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorUserId: 'admin-id',
          actionCode: 'USER_INVITATION_RESENT',
          relatedEntityId: 'usr-1',
        }),
      });
    });
  });

  describe('updateUserStatus (WP-EP02-TK004: Safety Guards & Session Revocation)', () => {
    it('when status is set to INACTIVE, must immediately revoke all active user sessions and record reason', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-target',
        status: UserStatus.ACTIVE,
      });

      await service.updateUserStatus(
        'usr-target',
        { status: UserStatus.INACTIVE, reason: 'Habis masa kontrak' },
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

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorUserId: 'admin-id',
          actionCode: 'USER_DEACTIVATED',
          relatedEntityId: 'usr-target',
          valueAfter: { status: UserStatus.INACTIVE, reason: 'Habis masa kontrak' },
        }),
      });
    });

    it('rejects self-deactivation when target user is the acting admin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        status: UserStatus.ACTIVE,
      });

      await expect(
        service.updateUserStatus('admin-id', { status: UserStatus.INACTIVE }, 'admin-id'),
      ).rejects.toThrow('Anda tidak dapat menonaktifkan akun Anda sendiri');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects directly activating an INVITED account that has not set a password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr-invited',
        status: UserStatus.INVITED,
      });

      await expect(
        service.updateUserStatus('usr-invited', { status: UserStatus.ACTIVE }, 'admin-id'),
      ).rejects.toThrow('belum menyelesaikan aktivasi kata sandi');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});

