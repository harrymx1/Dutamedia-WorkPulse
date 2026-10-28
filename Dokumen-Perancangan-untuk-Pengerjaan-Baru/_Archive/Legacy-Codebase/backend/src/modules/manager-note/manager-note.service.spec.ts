import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ManagerNoteType,
  ManagerNoteVisibility,
  Role,
} from '@prisma/client';
import { ManagerNoteService } from './services/manager-note.service.js';
import {
  BusinessRuleViolationException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

function createMockUser(
  partial: Partial<CurrentUserPayload> & { userId: string; role: Role },
): CurrentUserPayload {
  return {
    email: `${partial.userId}@dutamedia.com`,
    function: partial.function ?? 'Engineering',
    directManagerId: null,
    sessionId: `session-${partial.userId}`,
    mustResetPassword: false,
    ...partial,
  };
}

describe('ManagerNoteService (EPIC-11)', () => {
  let service: ManagerNoteService;
  let prismaMock: any;
  let auditMock: any;
  let scopeFilterMock: any;

  beforeEach(() => {
    prismaMock = {
      managerNote: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue({ id: 'audit-uuid-1' }),
    };

    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['emp-1', 'sub-1']),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };

    service = new ManagerNoteService(prismaMock, auditMock, scopeFilterMock);
  });

  describe('createManagerNote (EPIC-11-T1)', () => {
    const supervisorUser = createMockUser({
      userId: 'supervisor-1',
      role: Role.Supervisor_TL,
      function: 'Engineering',
    });

    const hrgaUser = createMockUser({
      userId: 'hrga-1',
      role: Role.HRGA,
      function: 'HR',
    });

    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
      function: 'Engineering',
    });

    it('harus berhasil membuat ManagerNote oleh Supervisor untuk subordinat dan mencatat AuditLog (SAD §15.1, §10.7)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'sub-1',
        fullName: 'Subordinate Employee',
        status: 'Active',
      });

      const createdNote = {
        id: 'note-uuid-1',
        aboutUserId: 'sub-1',
        createdByUserId: 'supervisor-1',
        type: ManagerNoteType.Coaching,
        note: 'Perlu peningkatan komunikasi harian saat terhalang blocker.',
        visibility: ManagerNoteVisibility.PrivateToManagement,
        relatedEntityType: null,
        relatedEntityId: null,
        createdAt: new Date(),
        aboutUser: { id: 'sub-1', fullName: 'Subordinate Employee', email: 'sub@dutamedia.com' },
        createdBy: { id: 'supervisor-1', fullName: 'Supervisor One', email: 'spv@dutamedia.com' },
      };
      prismaMock.managerNote.create.mockResolvedValue(createdNote);

      const result = await service.createManagerNote(supervisorUser, {
        aboutUserId: 'sub-1',
        type: ManagerNoteType.Coaching,
        note: 'Perlu peningkatan komunikasi harian saat terhalang blocker.',
      });

      expect(result).toEqual(createdNote);
      expect(prismaMock.managerNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            aboutUserId: 'sub-1',
            createdByUserId: 'supervisor-1',
            type: ManagerNoteType.Coaching,
            visibility: ManagerNoteVisibility.PrivateToManagement,
          }),
        }),
      );

      // Verifikasi AuditLog dicatat
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'supervisor-1',
          action: 'MANAGER_NOTE_CREATED',
          relatedEntityType: 'ManagerNote',
          relatedEntityId: 'note-uuid-1',
        }),
        prismaMock,
      );
    });

    it('harus berhasil membuat ManagerNote dengan visibilitas VisibleToEmployee', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'sub-1',
        fullName: 'Subordinate Employee',
        status: 'Active',
      });

      const createdNote = {
        id: 'note-uuid-2',
        aboutUserId: 'sub-1',
        createdByUserId: 'supervisor-1',
        type: ManagerNoteType.Recognition,
        note: 'Pencapaian penyelesaian sprint sangat baik.',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
        relatedEntityType: 'DailyAccountabilityRecord',
        relatedEntityId: 'rec-uuid-1',
        createdAt: new Date(),
        aboutUser: { id: 'sub-1', fullName: 'Subordinate Employee', email: 'sub@dutamedia.com' },
        createdBy: { id: 'supervisor-1', fullName: 'Supervisor One', email: 'spv@dutamedia.com' },
      };
      prismaMock.managerNote.create.mockResolvedValue(createdNote);

      const result = await service.createManagerNote(supervisorUser, {
        aboutUserId: 'sub-1',
        type: ManagerNoteType.Recognition,
        note: 'Pencapaian penyelesaian sprint sangat baik.',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
        relatedEntityType: 'DailyAccountabilityRecord',
        relatedEntityId: 'rec-uuid-1',
      });

      expect(result.visibility).toBe(ManagerNoteVisibility.VisibleToEmployee);
    });

    it('harus berhasil dibuat oleh HRGA untuk pengguna manapun secara company-wide', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'any-user-1',
        fullName: 'Any User',
        status: 'Active',
      });

      prismaMock.managerNote.create.mockResolvedValue({
        id: 'note-uuid-3',
        aboutUserId: 'any-user-1',
        createdByUserId: 'hrga-1',
        type: ManagerNoteType.Corrective,
        note: 'Peringatan administratif.',
        visibility: ManagerNoteVisibility.PrivateToManagement,
        aboutUser: { id: 'any-user-1', fullName: 'Any User', email: 'any@dutamedia.com' },
        createdBy: { id: 'hrga-1', fullName: 'HRGA Officer', email: 'hrga@dutamedia.com' },
      });

      const result = await service.createManagerNote(hrgaUser, {
        aboutUserId: 'any-user-1',
        type: ManagerNoteType.Corrective,
        note: 'Peringatan administratif.',
      });

      expect(result.id).toBe('note-uuid-3');
      expect(scopeFilterMock.isUserInScope).not.toHaveBeenCalled();
    });

    it('harus menolak pembuatan catatan jika peran pembuat adalah Employee (ForbiddenException)', async () => {
      await expect(
        service.createManagerNote(employeeUser, {
          aboutUserId: 'sub-1',
          type: ManagerNoteType.Coaching,
          note: 'Catatan tidak berhak.',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus menolak pembuatan catatan jika pembuat mencoba membuat catatan untuk diri sendiri (BusinessRuleViolationException)', async () => {
      await expect(
        service.createManagerNote(supervisorUser, {
          aboutUserId: 'supervisor-1',
          type: ManagerNoteType.Recognition,
          note: 'Catatan diri sendiri.',
        }),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus menolak jika pengguna target tidak ditemukan di sistem (NotFoundException)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createManagerNote(supervisorUser, {
          aboutUserId: 'non-existent-user',
          type: ManagerNoteType.Coaching,
          note: 'Catatan user hilang.',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus menolak jika pengguna target berada di luar cakupan wewenang organisasi Supervisor (ForbiddenException)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'outside-user-1',
        fullName: 'Outside User',
        status: 'Active',
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(false);

      await expect(
        service.createManagerNote(supervisorUser, {
          aboutUserId: 'outside-user-1',
          type: ManagerNoteType.Coaching,
          note: 'Catatan di luar divisi.',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll (EPIC-11-T2)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
      function: 'Engineering',
    });

    const supervisorUser = createMockUser({
      userId: 'spv-1',
      role: Role.Supervisor_TL,
      function: 'Engineering',
    });

    const hrgaUser = createMockUser({
      userId: 'hrga-1',
      role: Role.HRGA,
      function: 'HR',
    });

    const adminUser = createMockUser({
      userId: 'admin-1',
      role: Role.SystemAdmin,
      function: 'IT',
    });

    it('harus menolak SystemAdmin dari mengakses daftar catatan operasional (ForbiddenException)', async () => {
      await expect(
        service.findAll(adminUser, { page: 1, limit: 20 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Employee hanya dapat melihat catatan tentang dirinya sendiri yang berstatus VisibleToEmployee (BR-14)', async () => {
      prismaMock.managerNote.count.mockResolvedValue(1);
      prismaMock.managerNote.findMany.mockResolvedValue([
        {
          id: 'note-1',
          aboutUserId: 'emp-1',
          visibility: ManagerNoteVisibility.VisibleToEmployee,
          type: ManagerNoteType.Recognition,
          note: 'Apresiasi kerja.',
        },
      ]);

      const result = await service.findAll(employeeUser, { page: 1, limit: 20 });

      expect(prismaMock.managerNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            aboutUserId: 'emp-1',
            visibility: ManagerNoteVisibility.VisibleToEmployee,
          }),
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('Employee yang memfilter visibility=PrivateToManagement harus mendapatkan hasil kosong tanpa menyentuh database', async () => {
      const result = await service.findAll(employeeUser, {
        page: 1,
        limit: 20,
        visibility: ManagerNoteVisibility.PrivateToManagement,
      });

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
      expect(prismaMock.managerNote.findMany).not.toHaveBeenCalled();
    });

    it('Employee yang memfilter aboutUserId orang lain harus mendapatkan hasil kosong', async () => {
      const result = await service.findAll(employeeUser, {
        page: 1,
        limit: 20,
        aboutUserId: 'other-user',
      });

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });

    it('Supervisor dapat melihat catatan subordinat dalam scope aktifnya', async () => {
      scopeFilterMock.getAccessibleUserIds.mockResolvedValue(['spv-1', 'sub-1', 'sub-2']);
      prismaMock.managerNote.count.mockResolvedValue(2);
      prismaMock.managerNote.findMany.mockResolvedValue([
        { id: 'note-1', aboutUserId: 'sub-1', visibility: ManagerNoteVisibility.PrivateToManagement },
        { id: 'note-2', aboutUserId: 'sub-2', visibility: ManagerNoteVisibility.VisibleToEmployee },
      ]);

      const result = await service.findAll(supervisorUser, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(prismaMock.managerNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { createdByUserId: 'spv-1' },
              { aboutUserId: { in: ['sub-1', 'sub-2'] } },
              { aboutUserId: 'spv-1', visibility: ManagerNoteVisibility.VisibleToEmployee },
            ]),
          }),
        }),
      );
    });

    it('HRGA dapat melihat catatan manajerial company-wide tanpa batasan scope', async () => {
      prismaMock.managerNote.count.mockResolvedValue(5);
      prismaMock.managerNote.findMany.mockResolvedValue([
        { id: 'note-1' },
        { id: 'note-2' },
        { id: 'note-3' },
        { id: 'note-4' },
        { id: 'note-5' },
      ]);

      const result = await service.findAll(hrgaUser, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(5);
      expect(scopeFilterMock.getAccessibleUserIds).not.toHaveBeenCalled();
    });
  });

  describe('findById (EPIC-11-T2)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
      function: 'Engineering',
    });

    const supervisorUser = createMockUser({
      userId: 'spv-1',
      role: Role.Supervisor_TL,
      function: 'Engineering',
    });

    const hrgaUser = createMockUser({
      userId: 'hrga-1',
      role: Role.HRGA,
      function: 'HR',
    });

    it('harus melempar NotFoundException jika catatan tidak ditemukan di database', async () => {
      prismaMock.managerNote.findUnique.mockResolvedValue(null);

      await expect(service.findById(employeeUser, 'non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Employee subject dapat melihat catatan miliknya jika visibility=VisibleToEmployee', async () => {
      const mockNote = {
        id: 'note-1',
        aboutUserId: 'emp-1',
        createdByUserId: 'spv-1',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
        type: ManagerNoteType.Recognition,
        note: 'Pujian kerja keras.',
      };
      prismaMock.managerNote.findUnique.mockResolvedValue(mockNote);

      const result = await service.findById(employeeUser, 'note-1');
      expect(result).toEqual(mockNote);
    });

    it('Employee subject TIDAK dapat melihat catatan jika visibility=PrivateToManagement (harus 404 NotFoundException)', async () => {
      const mockNote = {
        id: 'note-1',
        aboutUserId: 'emp-1',
        createdByUserId: 'spv-1',
        visibility: ManagerNoteVisibility.PrivateToManagement,
        type: ManagerNoteType.Corrective,
        note: 'Catatan rahasia manajemen.',
      };
      prismaMock.managerNote.findUnique.mockResolvedValue(mockNote);

      await expect(service.findById(employeeUser, 'note-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Employee lain tidak dapat melihat catatan milik user lain (harus 404 NotFoundException)', async () => {
      const otherEmployee = createMockUser({
        userId: 'emp-99',
        role: Role.Employee,
        function: 'Engineering',
      });
      const mockNote = {
        id: 'note-1',
        aboutUserId: 'emp-1',
        createdByUserId: 'spv-1',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
      };
      prismaMock.managerNote.findUnique.mockResolvedValue(mockNote);

      await expect(service.findById(otherEmployee, 'note-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Supervisor dapat melihat catatan untuk subordinat dalam scope aktifnya', async () => {
      const mockNote = {
        id: 'note-1',
        aboutUserId: 'sub-1',
        createdByUserId: 'other-spv',
        visibility: ManagerNoteVisibility.PrivateToManagement,
      };
      prismaMock.managerNote.findUnique.mockResolvedValue(mockNote);
      scopeFilterMock.isUserInScope.mockResolvedValue(true);

      const result = await service.findById(supervisorUser, 'note-1');
      expect(result).toEqual(mockNote);
    });

    it('Supervisor TIDAK dapat melihat catatan untuk pengguna di luar cakupan aksesnya (harus 404)', async () => {
      const mockNote = {
        id: 'note-1',
        aboutUserId: 'outside-user',
        createdByUserId: 'other-spv',
        visibility: ManagerNoteVisibility.PrivateToManagement,
      };
      prismaMock.managerNote.findUnique.mockResolvedValue(mockNote);
      scopeFilterMock.isUserInScope.mockResolvedValue(false);

      await expect(service.findById(supervisorUser, 'note-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('HRGA dapat melihat catatan apapun secara company-wide', async () => {
      const mockNote = {
        id: 'note-1',
        aboutUserId: 'any-user',
        createdByUserId: 'spv-1',
        visibility: ManagerNoteVisibility.PrivateToManagement,
      };
      prismaMock.managerNote.findUnique.mockResolvedValue(mockNote);

      const result = await service.findById(hrgaUser, 'note-1');
      expect(result).toEqual(mockNote);
    });
  });
});
