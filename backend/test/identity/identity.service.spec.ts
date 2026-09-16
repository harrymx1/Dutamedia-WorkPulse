import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role, UserStatus } from '@prisma/client';
import { IdentityService } from '../../src/modules/identity/identity.service.js';
import {
  BusinessRuleViolationException,
  ConflictException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('IdentityService (SAD §5.3, §5.11.a, §10.2 - EPIC-04)', () => {
  let service: IdentityService;
  let mockPrisma: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      projectAuthorityMapping: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      temporaryReviewerAssignment: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      session: {
        updateMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => {
        return cb(mockPrisma);
      }),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue({ id: 'audit-log-id' }),
    };

    service = new IdentityService(mockPrisma, mockAuditService);
  });

  describe('createUser (EPIC-04-T1)', () => {
    it('harus membuat user baru dengan hashing Argon2id dan assignment awal dalam 1 transaksi', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const mockCreatedUser = {
        id: 'user-uuid-1',
        fullName: 'Budi Santoso',
        email: 'budi@dutamedia.com',
        status: UserStatus.Active,
        mustResetPassword: true,
      };

      const mockCreatedAssignment = {
        id: 'org-uuid-1',
        userId: 'user-uuid-1',
        role: Role.Employee,
        function: 'Engineering',
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
      };

      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.organizationalAssignment.create.mockResolvedValue(
        mockCreatedAssignment,
      );

      const result = await service.createUser(
        {
          fullName: 'Budi Santoso',
          email: 'budi@dutamedia.com',
          initialRole: Role.Employee,
          function: 'Engineering',
          effectiveDate: '2026-09-01',
        },
        'admin-uuid-1',
      );

      expect(result.user).toEqual(mockCreatedUser);
      expect(result.assignment).toEqual(mockCreatedAssignment);
      expect(result.temporaryPassword).toBeDefined();
      expect(result.temporaryPassword.length).toBe(12);

      // Verifikasi user.create dipanggil dengan passwordHash Argon2id
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('budi@dutamedia.com');
      expect(createCall.data.passwordHash.startsWith('$argon2id$')).toBe(true);
      expect(createCall.data.mustResetPassword).toBe(true);

      // Verifikasi audit log dicatat
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_CREATED',
          relatedEntityType: 'User',
          relatedEntityId: 'user-uuid-1',
        }),
        expect.anything(),
      );
    });

    it('harus menolak pembuatan user jika email sudah terdaftar (ConflictException)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.createUser({
          fullName: 'Duplikat',
          email: 'duplicate@dutamedia.com',
          initialRole: Role.Employee,
          function: 'Finance',
          effectiveDate: '2026-09-01',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUserStatus & Session Revocation (EPIC-04-T1 & EPIC-04-T6)', () => {
    it('harus mencabut seluruh session aktif saat user dinonaktifkan (Inactive)', async () => {
      const activeUser = {
        id: 'user-uuid-1',
        status: UserStatus.Active,
      };

      mockPrisma.user.findUnique.mockResolvedValue(activeUser);
      mockPrisma.user.update.mockResolvedValue({
        ...activeUser,
        status: UserStatus.Inactive,
      });

      const result = await service.updateUserStatus(
        'user-uuid-1',
        { status: UserStatus.Inactive },
        'admin-uuid-1',
      );

      expect(result.status).toBe(UserStatus.Inactive);
      // EPIC-04-T6: Verifikasi session aktif di-revoke
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-uuid-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });

      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_DEACTIVATED',
          relatedEntityId: 'user-uuid-1',
        }),
        expect.anything(),
      );
    });
  });

  describe('createOrganizationalAssignment & Effective-Dating (EPIC-04-T2, BR-10)', () => {
    it('harus menutup assignment aktif sebelumnya dengan endDate = effectiveDate - 1 hari', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });

      const oldAssignment = {
        id: 'old-org-id',
        userId: 'user-uuid-1',
        role: Role.Employee,
        function: 'Engineering',
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      };

      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(
        oldAssignment,
      );

      const newAssignment = {
        id: 'new-org-id',
        userId: 'user-uuid-1',
        role: Role.Supervisor_TL,
        function: 'Engineering',
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
      };

      mockPrisma.organizationalAssignment.create.mockResolvedValue(
        newAssignment,
      );

      const result = await service.createOrganizationalAssignment(
        {
          userId: 'user-uuid-1',
          role: Role.Supervisor_TL,
          function: 'Engineering',
          effectiveDate: '2026-09-01',
        },
        'admin-uuid-1',
      );

      expect(result).toEqual(newAssignment);

      // Verifikasi assignment lama ditutup dengan endDate sehari sebelum 2026-09-01 (yaitu 2026-08-31)
      expect(mockPrisma.organizationalAssignment.update).toHaveBeenCalledWith({
        where: { id: 'old-org-id' },
        data: {
          endDate: new Date('2026-08-31'),
        },
      });

      // Verifikasi AuditLog dicatat
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ORGANIZATIONAL_ASSIGNMENT_CREATED',
          relatedEntityId: 'new-org-id',
        }),
        expect.anything(),
      );
    });
  });

  describe('ProjectAuthorityMapping (EPIC-04-T3)', () => {
    it('harus mendukung pembuatan mapping otoritas proyek baru', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });

      const mockMapping = {
        id: 'proj-auth-1',
        userId: 'user-uuid-1',
        scopeReference: 'Project Alpha',
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
      };

      mockPrisma.projectAuthorityMapping.create.mockResolvedValue(mockMapping);

      const result = await service.createProjectAuthorityMapping(
        {
          userId: 'user-uuid-1',
          scopeReference: 'Project Alpha',
          effectiveDate: '2026-09-01',
        },
        'admin-uuid-1',
      );

      expect(result).toEqual(mockMapping);
    });

    it('harus mengakhiri mapping otoritas proyek dengan mengupdate endDate (bukan delete)', async () => {
      const existing = {
        id: 'proj-auth-1',
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      };

      mockPrisma.projectAuthorityMapping.findUnique.mockResolvedValue(existing);
      mockPrisma.projectAuthorityMapping.update.mockResolvedValue({
        ...existing,
        endDate: new Date('2026-09-15'),
      });

      const result = await service.updateProjectAuthorityMapping(
        'proj-auth-1',
        { endDate: '2026-09-15' },
        'admin-uuid-1',
      );

      expect(result.endDate).toEqual(new Date('2026-09-15'));
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PROJECT_AUTHORITY_MAPPING_ENDED',
          relatedEntityId: 'proj-auth-1',
        }),
        expect.anything(),
      );
    });
  });

  describe('TemporaryReviewerAssignment (EPIC-04-T4, BR-11)', () => {
    it('harus menolak penugasan jika expiryDate <= effectiveDate (BR-11)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'reviewer-1' });

      await expect(
        service.createTemporaryReviewerAssignment({
          reviewerUserId: 'reviewer-1',
          scope: 'Team Engineering',
          reason: 'Cuti melahirkan Supervisor',
          effectiveDate: '2026-09-10',
          expiryDate: '2026-09-05', // Lebih awal dari effectiveDate
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus berhasil membuat penugasan jika expiryDate > effectiveDate', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'reviewer-1' });

      const mockAssignment = {
        id: 'temp-1',
        reviewerUserId: 'reviewer-1',
        scope: 'Team Engineering',
        reason: 'Backfill Supervisor',
        effectiveDate: new Date('2026-09-01'),
        expiryDate: new Date('2026-09-30'),
      };

      mockPrisma.temporaryReviewerAssignment.create.mockResolvedValue(
        mockAssignment,
      );

      const result = await service.createTemporaryReviewerAssignment(
        {
          reviewerUserId: 'reviewer-1',
          scope: 'Team Engineering',
          reason: 'Backfill Supervisor',
          effectiveDate: '2026-09-01',
          expiryDate: '2026-09-30',
        },
        'admin-uuid-1',
      );

      expect(result).toEqual(mockAssignment);
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TEMPORARY_REVIEWER_ASSIGNMENT_CREATED',
          relatedEntityId: 'temp-1',
        }),
        expect.anything(),
      );
    });
  });

  describe('Context Resolution Service (EPIC-04-T5)', () => {
    it('harus mengembalikan role dan function aktif pada tanggal yang diminta (resolveActiveContext)', async () => {
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        id: 'assignment-1',
        role: Role.Employee,
        function: 'Design',
        directManagerId: 'manager-1',
      });

      const context = await service.resolveActiveContext(
        'user-1',
        new Date('2026-09-15'),
      );

      expect(context).toEqual({
        assignmentId: 'assignment-1',
        role: Role.Employee,
        function: 'Design',
        directManagerId: 'manager-1',
      });
    });

    it('harus mengembalikan null jika tidak ada assignment aktif pada tanggal tersebut', async () => {
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);

      const context = await service.resolveActiveContext(
        'user-1',
        new Date('2025-01-01'),
      );

      expect(context).toBeNull();
    });

    it('harus mengembalikan daftar scope project aktif pada tanggal tertentu (resolveProjectAuthorities)', async () => {
      mockPrisma.projectAuthorityMapping.findMany.mockResolvedValue([
        { scopeReference: 'Project Alpha' },
        { scopeReference: 'Project Beta' },
      ]);

      const scopes = await service.resolveProjectAuthorities(
        'user-1',
        new Date('2026-09-15'),
      );

      expect(scopes).toEqual(['Project Alpha', 'Project Beta']);
    });
  });
});
