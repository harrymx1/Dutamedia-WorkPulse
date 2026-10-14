import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role, UserStatus } from '@prisma/client';
import { IdentityService } from '../../src/modules/identity/identity.service.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('IdentityService (SAD §5.3, §5.11.a, §10.2 - EPIC-04)', () => {
  let service: IdentityService;
  let mockPrisma: any;
  let mockAuditService: any;
  let mockNotificationService: any;

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

    mockNotificationService = {
      dispatch: vi.fn().mockResolvedValue([]),
    };

    service = new IdentityService(mockPrisma, mockAuditService, mockNotificationService);
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

    describe('directManagerId branch (S2-TEST-GAP-8, FR-22)', () => {
      const targetUserId = '11111111-1111-4111-8111-111111111111';
      const managerId = '22222222-2222-4222-8222-222222222222';

      const arrangeUsers = (users: Record<string, any>) => {
        mockPrisma.user.findUnique.mockImplementation(async (args: any) => {
          return users[args.where.id] ?? null;
        });
      };

      it('directManagerId valid => assignment dibuat dengan directManagerId tersimpan & tercatat di audit log', async () => {
        arrangeUsers({
          [targetUserId]: { id: targetUserId },
          [managerId]: { id: managerId },
        });
        mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);
        const created = {
          id: 'new-org-id',
          userId: targetUserId,
          role: Role.Employee,
          function: 'Engineering',
          directManagerId: managerId,
          effectiveDate: new Date('2026-09-01'),
          endDate: null,
        };
        mockPrisma.organizationalAssignment.create.mockResolvedValue(created);

        const result = await service.createOrganizationalAssignment(
          {
            userId: targetUserId,
            role: Role.Employee,
            function: 'Engineering',
            directManagerId: managerId,
            effectiveDate: '2026-09-01',
          },
          'admin-uuid-1',
        );

        expect(result).toEqual(created);
        // Target user dan manager sama-sama divalidasi lewat lookup
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: targetUserId },
        });
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: managerId },
        });
        // Payload persistence
        expect(mockPrisma.organizationalAssignment.create).toHaveBeenCalledWith({
          data: {
            userId: targetUserId,
            role: Role.Employee,
            function: 'Engineering',
            directManagerId: managerId,
            effectiveDate: new Date('2026-09-01'),
            endDate: null,
            createdByUserId: 'admin-uuid-1',
          },
        });
        // Audit log
        expect(mockAuditService.record).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'ORGANIZATIONAL_ASSIGNMENT_CREATED',
            relatedEntityId: 'new-org-id',
            valueAfter: expect.objectContaining({
              directManagerId: managerId,
            }),
          }),
          expect.anything(),
        );
      });

      it('directManagerId tidak ditemukan => NotFoundException dan assignment TIDAK dibuat', async () => {
        arrangeUsers({ [targetUserId]: { id: targetUserId } });

        const promise = service.createOrganizationalAssignment(
          {
            userId: targetUserId,
            role: Role.Employee,
            function: 'Engineering',
            directManagerId: managerId,
            effectiveDate: '2026-09-01',
          },
          'admin-uuid-1',
        );

        await expect(promise).rejects.toBeInstanceOf(NotFoundException);
        await expect(promise).rejects.toThrow(
          'Direct manager yang dipilih tidak ditemukan',
        );

        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
        expect(mockPrisma.organizationalAssignment.create).not.toHaveBeenCalled();
        expect(mockPrisma.organizationalAssignment.update).not.toHaveBeenCalled();
        expect(mockAuditService.record).not.toHaveBeenCalled();
      });

      it('target userId tidak ditemukan => NotFoundException, validasi manager tidak dilanjutkan, assignment TIDAK dibuat', async () => {
        arrangeUsers({ [managerId]: { id: managerId } });

        const promise = service.createOrganizationalAssignment(
          {
            userId: targetUserId,
            role: Role.Employee,
            function: 'Engineering',
            directManagerId: managerId,
            effectiveDate: '2026-09-01',
          },
          'admin-uuid-1',
        );

        await expect(promise).rejects.toBeInstanceOf(NotFoundException);
        await expect(promise).rejects.toThrow(
          `Pengguna dengan ID '${targetUserId}' tidak ditemukan`,
        );

        // Hanya lookup target user; lookup manager tidak pernah dilakukan
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: targetUserId },
        });
        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
        expect(mockPrisma.organizationalAssignment.create).not.toHaveBeenCalled();
      });

      it('tanpa directManagerId (undefined) => assignment tetap berhasil, directManagerId dipersist null, tanpa lookup manager', async () => {
        arrangeUsers({ [targetUserId]: { id: targetUserId } });
        mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);
        mockPrisma.organizationalAssignment.create.mockResolvedValue({
          id: 'new-org-id-2',
          directManagerId: null,
          role: Role.Employee,
          function: 'Engineering',
        });

        await service.createOrganizationalAssignment(
          {
            userId: targetUserId,
            role: Role.Employee,
            function: 'Engineering',
            directManagerId: undefined,
            effectiveDate: '2026-09-01',
          },
          'admin-uuid-1',
        );

        // Hanya satu lookup (target user); tidak ada lookup manager
        expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(
          mockPrisma.organizationalAssignment.create.mock.calls[0][0].data,
        ).toEqual(expect.objectContaining({ directManagerId: null }));
        expect(mockAuditService.record).toHaveBeenCalledWith(
          expect.objectContaining({
            valueAfter: expect.objectContaining({ directManagerId: null }),
          }),
          expect.anything(),
        );
      });
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

    describe('getTemporaryReviewerAssignments (ADR-002, SAD §10.2, §8.11)', () => {
      it('SystemAdmin melihat seluruh data delegasi organisasi tanpa pembatasan scope creator/reviewer', async () => {
        mockPrisma.temporaryReviewerAssignment.findMany.mockResolvedValue([
          { id: 'tra-1', scope: 'Engineering' },
          { id: 'tra-2', scope: 'Marketing' },
        ]);

        const result = await service.getTemporaryReviewerAssignments(
          'admin-uuid-1',
          Role.SystemAdmin,
        );

        expect(result).toHaveLength(2);
        expect(mockPrisma.temporaryReviewerAssignment.findMany).toHaveBeenCalledWith({
          where: {},
          orderBy: { effectiveDate: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });
      });

      it('Head HANYA melihat data delegasi dalam scope-nya (createdByUserId atau reviewerUserId miliknya)', async () => {
        mockPrisma.temporaryReviewerAssignment.findMany.mockResolvedValue([
          { id: 'tra-head-1', scope: 'Engineering', createdByUserId: 'head-uuid-1' },
        ]);

        const result = await service.getTemporaryReviewerAssignments(
          'head-uuid-1',
          Role.Head,
        );

        expect(result).toHaveLength(1);
        expect(mockPrisma.temporaryReviewerAssignment.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { createdByUserId: 'head-uuid-1' },
              { reviewerUserId: 'head-uuid-1' },
            ],
          },
          orderBy: { effectiveDate: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });
      });

      it('Head dengan filter activeOnly dan scope tetap mengombinasikan filter scope wewenang Head', async () => {
        mockPrisma.temporaryReviewerAssignment.findMany.mockResolvedValue([]);

        await service.getTemporaryReviewerAssignments(
          'head-uuid-1',
          Role.Head,
          'Engineering',
          true,
        );

        expect(mockPrisma.temporaryReviewerAssignment.findMany).toHaveBeenCalledWith({
          where: {
            effectiveDate: { lte: expect.any(Date) },
            expiryDate: { gte: expect.any(Date) },
            scope: { contains: 'Engineering', mode: 'insensitive' },
            OR: [
              { createdByUserId: 'head-uuid-1' },
              { reviewerUserId: 'head-uuid-1' },
            ],
          },
          orderBy: { effectiveDate: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });
      });
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

  describe('getOrganizationalAssignments (SAD §10.2, E6/E7-1 Remediation)', () => {
    const targetUserId = 'target-user-uuid-1';
    const mockAssignments = [
      {
        id: 'org-1',
        userId: targetUserId,
        role: Role.Employee,
        function: 'Engineering',
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      },
    ];

    beforeEach(() => {
      mockPrisma.user.findUnique.mockImplementation(async (args: any) => {
        if (args.where.id === targetUserId) {
          return {
            id: targetUserId,
            fullName: 'Target User',
            email: 'target@dutamedia.com',
            organizationalAssignments: [],
          };
        }
        return null;
      });
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue(mockAssignments);
    });

    it('Case A: SystemAdmin berwenang melihat riwayat assignment user lain (ALLOW)', async () => {
      const caller = { userId: 'admin-uuid', role: Role.SystemAdmin } as any;

      const result = await service.getOrganizationalAssignments(targetUserId, caller);
      expect(result).toEqual(mockAssignments);
      expect(mockPrisma.organizationalAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: targetUserId } }),
      );
    });

    it('Case B: HRGA berwenang melihat riwayat assignment user lain (ALLOW)', async () => {
      const caller = { userId: 'hrga-uuid', role: Role.HRGA } as any;

      const result = await service.getOrganizationalAssignments(targetUserId, caller);
      expect(result).toEqual(mockAssignments);
    });

    it('Case C: Pemilik akun (Employee) berwenang melihat riwayat assignment miliknya sendiri (ALLOW)', async () => {
      const caller = { userId: targetUserId, role: Role.Employee } as any;

      const result = await service.getOrganizationalAssignments(targetUserId, caller);
      expect(result).toEqual(mockAssignments);
    });

    it('Case D: Employee lain yang bukan pemilik ditolak dengan ForbiddenException (DENY)', async () => {
      const caller = { userId: 'other-employee-uuid', role: Role.Employee } as any;

      await expect(
        service.getOrganizationalAssignments(targetUserId, caller),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Case E: Role lain (Supervisor_TL, Head, CEO_Management) yang bukan pemilik ditolak (DENY)', async () => {
      const supervisorCaller = { userId: 'spv-uuid', role: Role.Supervisor_TL } as any;
      const headCaller = { userId: 'head-uuid', role: Role.Head } as any;
      const ceoCaller = { userId: 'ceo-uuid', role: Role.CEO_Management } as any;

      await expect(
        service.getOrganizationalAssignments(targetUserId, supervisorCaller),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.getOrganizationalAssignments(targetUserId, headCaller),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.getOrganizationalAssignments(targetUserId, ceoCaller),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Case F: Pemanggilan tanpa konteks caller ditolak dengan ForbiddenException', async () => {
      await expect(
        service.getOrganizationalAssignments(targetUserId, undefined),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Target user tidak ditemukan pada caller yang berwenang melempar NotFoundException', async () => {
      const caller = { userId: 'admin-uuid', role: Role.SystemAdmin } as any;

      await expect(
        service.getOrganizationalAssignments('non-existent-user-uuid', caller),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('S2-T4 Remediation: S2-T4-JOB-01 & S2-T4-NOTIF-02', () => {
    it('findActiveUserIds: harus mengembalikan array ID dari seluruh user berstatus Active', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-active-1' },
        { id: 'user-active-2' },
      ]);

      const ids = await service.findActiveUserIds();
      expect(ids).toEqual(['user-active-1', 'user-active-2']);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { status: UserStatus.Active },
        select: { id: true },
      });
    });

    it('createOrganizationalAssignment: harus mendispatch trigger POLICY_ASSIGNMENT_CHANGED ke user terkait', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'target-u1' });
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.create.mockResolvedValue({
        id: 'new-org-id',
        userId: 'target-u1',
        role: Role.Employee,
        function: 'Engineering',
        directManagerId: null,
        effectiveDate: new Date('2026-10-01'),
        endDate: null,
      });

      await service.createOrganizationalAssignment({
        userId: 'target-u1',
        role: Role.Employee,
        function: 'Engineering',
        effectiveDate: '2026-10-01',
      });

      expect(mockNotificationService.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'POLICY_ASSIGNMENT_CHANGED',
          recipientUserId: 'target-u1',
          relatedEntityType: 'OrganizationalAssignment',
          relatedEntityId: 'new-org-id',
          payload: expect.objectContaining({
            title: expect.stringContaining('Perubahan Penugasan Organisasi'),
          }),
        }),
      );
    });
  });
});
