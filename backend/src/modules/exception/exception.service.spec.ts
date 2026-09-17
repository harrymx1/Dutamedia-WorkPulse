import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ExceptionStatus,
  ExceptionType,
  NotificationChannel,
  Role,
} from '@prisma/client';
import { ExceptionService } from './services/exception.service.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';

describe('ExceptionService (EPIC-10)', () => {
  let service: ExceptionService;
  let prismaMock: any;
  let auditMock: any;
  let scopeFilterMock: any;
  let notificationMock: any;

  beforeEach(() => {
    prismaMock = {
      exception: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['emp-1', 'mgr-1']),
      isUserInScope: vi.fn().mockResolvedValue(true),
    };

    notificationMock = {
      dispatch: vi.fn().mockResolvedValue([]),
    };

    service = new ExceptionService(
      prismaMock,
      auditMock,
      scopeFilterMock,
      notificationMock,
    );
  });

  describe('computeAvailableActions (SAD §7.12, §10.6)', () => {
    it('harus mengembalikan [approve, reject] jika type Leave, status Pending, dan user adalah authorized approver', () => {
      const exception = {
        type: ExceptionType.Leave,
        status: ExceptionStatus.Pending,
        employeeUserId: 'emp-1',
      };
      const user = { userId: 'mgr-1', role: Role.Supervisor_TL } as any;

      const actions = service.computeAvailableActions(exception, user, true);
      expect(actions).toEqual(['approve', 'reject']);
    });

    it('harus mengembalikan [] jika user adalah pemohon cuti itu sendiri (tidak boleh approve cuti sendiri)', () => {
      const exception = {
        type: ExceptionType.Leave,
        status: ExceptionStatus.Pending,
        employeeUserId: 'emp-1',
      };
      const user = { userId: 'emp-1', role: Role.Employee } as any;

      const actions = service.computeAvailableActions(exception, user, true);
      expect(actions).toEqual([]);
    });

    it('harus mengembalikan [] jika status bukan Pending', () => {
      const exception = {
        type: ExceptionType.Leave,
        status: ExceptionStatus.Approved,
        employeeUserId: 'emp-1',
      };
      const user = { userId: 'mgr-1', role: Role.Supervisor_TL } as any;

      const actions = service.computeAvailableActions(exception, user, true);
      expect(actions).toEqual([]);
    });

    it('harus mengembalikan [] untuk Holiday dan Exemption', () => {
      const holiday = {
        type: ExceptionType.Holiday,
        status: ExceptionStatus.Approved,
        employeeUserId: null,
      };
      const user = { userId: 'admin-1', role: Role.SystemAdmin } as any;

      expect(service.computeAvailableActions(holiday, user, true)).toEqual([]);
    });
  });

  describe('EPIC-10-T1: createLeave (SAD §10.6, FR-47)', () => {
    const user = {
      userId: 'emp-1',
      email: 'emp@dutamedia.com',
      role: Role.Employee,
    } as any;

    it('harus berhasil mengajukan permohonan cuti dengan status Pending dan memicu notifikasi ke direct manager', async () => {
      prismaMock.exception.findFirst.mockResolvedValue(null); // Tidak ada overlap
      prismaMock.exception.create.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        employeeUserId: 'emp-1',
        dateStart: new Date('2026-10-01'),
        dateEnd: new Date('2026-10-03'),
        status: ExceptionStatus.Pending,
        reason: 'Cuti tahunan',
        employee: { id: 'emp-1', fullName: 'Budi Santoso', email: 'emp@dutamedia.com' },
      });
      prismaMock.organizationalAssignment.findFirst.mockResolvedValue({
        directManagerId: 'mgr-1',
      });

      const dto = {
        dateStart: '2026-10-01',
        dateEnd: '2026-10-03',
        reason: 'Cuti tahunan',
      };

      const result = await service.createLeave(user, dto);

      expect(result.id).toBe('exc-leave-1');
      expect(result.status).toBe(ExceptionStatus.Pending);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EXCEPTION_LEAVE_REQUESTED',
          relatedEntityType: 'Exception',
        }),
        expect.anything(),
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'LEAVE_REQUEST_SUBMITTED',
          recipientUserId: 'mgr-1',
          channels: expect.arrayContaining([
            NotificationChannel.Email,
            NotificationChannel.BrowserPush,
          ]),
        }),
        expect.anything(),
      );
    });

    it('harus menolak jika dateStart lebih besar dari dateEnd', async () => {
      const dto = {
        dateStart: '2026-10-05',
        dateEnd: '2026-10-01',
      };

      await expect(service.createLeave(user, dto)).rejects.toThrow(
        BusinessRuleViolationException,
      );
    });

    it('harus menolak jika terdapat permohonan cuti yang bertumpang tindih (overlap)', async () => {
      prismaMock.exception.findFirst.mockResolvedValue({
        id: 'existing-leave',
        status: ExceptionStatus.Pending,
      });

      const dto = {
        dateStart: '2026-10-01',
        dateEnd: '2026-10-03',
      };

      await expect(service.createLeave(user, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('EPIC-10-T1: createHoliday & createExemption (SAD §10.6, BR-18)', () => {
    const adminUser = {
      userId: 'admin-1',
      email: 'admin@dutamedia.com',
      role: Role.SystemAdmin,
    } as any;

    it('createHoliday: berhasil membuat hari libur dengan status Approved dan employeeUserId bernilai null', async () => {
      prismaMock.exception.create.mockResolvedValue({
        id: 'holiday-1',
        type: ExceptionType.Holiday,
        employeeUserId: null,
        dateStart: new Date('2026-12-25'),
        dateEnd: new Date('2026-12-25'),
        status: ExceptionStatus.Approved,
        reason: 'Hari Raya Natal',
        createdBy: { id: 'admin-1', fullName: 'System Admin', email: 'admin@dutamedia.com' },
      });

      const dto = {
        dateStart: '2026-12-25',
        dateEnd: '2026-12-25',
        reason: 'Hari Raya Natal',
      };

      const result = await service.createHoliday(adminUser, dto);

      expect(result.id).toBe('holiday-1');
      expect(result.status).toBe(ExceptionStatus.Approved);
      expect(result.employeeUserId).toBeNull();
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EXCEPTION_HOLIDAY_CREATED',
        }),
        expect.anything(),
      );
    });

    it('createExemption: berhasil membuat pengecualian individual karyawan dengan status Approved', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        fullName: 'Budi Santoso',
        email: 'emp@dutamedia.com',
      });
      prismaMock.exception.create.mockResolvedValue({
        id: 'exemption-1',
        type: ExceptionType.Exemption,
        employeeUserId: 'emp-1',
        dateStart: new Date('2026-10-10'),
        dateEnd: new Date('2026-10-12'),
        status: ExceptionStatus.Approved,
        reason: 'Dinas Luar Kota',
      });

      const dto = {
        employeeUserId: 'emp-1',
        dateStart: '2026-10-10',
        dateEnd: '2026-10-12',
        reason: 'Dinas Luar Kota',
      };

      const result = await service.createExemption(adminUser, dto);

      expect(result.id).toBe('exemption-1');
      expect(result.status).toBe(ExceptionStatus.Approved);
      expect(result.employeeUserId).toBe('emp-1');
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EXCEPTION_EXEMPTION_CREATED',
        }),
        expect.anything(),
      );
    });

    it('createExemption: melempar NotFoundException jika karyawan sasaran tidak ditemukan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const dto = {
        employeeUserId: 'non-existent',
        dateStart: '2026-10-10',
        dateEnd: '2026-10-12',
        reason: 'Dinas',
      };

      await expect(service.createExemption(adminUser, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('EPIC-10-T2: findAll & findById with Scope Filtering (SAD §8.11, §10.6)', () => {
    it('findAll: mengembalikan daftar exception dengan meta pagination dan availableActions', async () => {
      const user = {
        userId: 'mgr-1',
        role: Role.Supervisor_TL,
      } as any;

      prismaMock.exception.count.mockResolvedValue(1);
      prismaMock.exception.findMany.mockResolvedValue([
        {
          id: 'exc-1',
          type: ExceptionType.Leave,
          employeeUserId: 'emp-1',
          status: ExceptionStatus.Pending,
          dateStart: new Date('2026-10-01'),
          dateEnd: new Date('2026-10-02'),
        },
      ]);
      scopeFilterMock.isUserInScope.mockResolvedValue(true);

      const result = await service.findAll(user, { page: 1, limit: 10 });

      expect(result.meta.totalItems).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].availableActions).toContain('approve');
      expect(result.data[0].availableActions).toContain('reject');
    });

    it('findById: melempar NotFoundException jika exception tidak ditemukan', async () => {
      prismaMock.exception.findUnique.mockResolvedValue(null);

      await expect(
        service.findById({ userId: 'emp-1', role: Role.Employee } as any, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('findById: melempar NotFoundException jika exception berada di luar scope user (SAD §7.7)', async () => {
      prismaMock.exception.findUnique.mockResolvedValue({
        id: 'exc-other',
        type: ExceptionType.Leave,
        employeeUserId: 'other-emp',
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(false);

      await expect(
        service.findById({ userId: 'emp-1', role: Role.Employee } as any, 'exc-other'),
      ).rejects.toThrow(NotFoundException);
    });

    it('findById: mengizinkan semua karyawan melihat Holiday (karena public)', async () => {
      prismaMock.exception.findUnique.mockResolvedValue({
        id: 'holiday-1',
        type: ExceptionType.Holiday,
        employeeUserId: null,
      });

      const result = await service.findById(
        { userId: 'emp-1', role: Role.Employee } as any,
        'holiday-1',
      );

      expect(result.id).toBe('holiday-1');
      expect(result.type).toBe(ExceptionType.Holiday);
    });
  });

  describe('EPIC-10-T3: approveLeave & rejectLeave (SAD §10.6, FR-47)', () => {
    const manager = {
      userId: 'mgr-1',
      email: 'manager@dutamedia.com',
      role: Role.Supervisor_TL,
    } as any;

    it('approveLeave: berhasil menyetujui cuti, mencatat AuditLog, dan mengirim notifikasi', async () => {
      prismaMock.exception.findUnique.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        status: ExceptionStatus.Pending,
        employeeUserId: 'emp-1',
        dateStart: new Date('2026-10-01'),
        dateEnd: new Date('2026-10-03'),
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(true);
      prismaMock.exception.update.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        status: ExceptionStatus.Approved,
        employeeUserId: 'emp-1',
        approvedByUserId: 'mgr-1',
        dateStart: new Date('2026-10-01'),
        dateEnd: new Date('2026-10-03'),
      });

      const result = await service.approveLeave(manager, 'exc-leave-1');

      expect(result.status).toBe(ExceptionStatus.Approved);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EXCEPTION_LEAVE_APPROVED',
          actorUserId: 'mgr-1',
        }),
        expect.anything(),
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'LEAVE_REQUEST_RESOLVED',
          recipientUserId: 'emp-1',
          channels: expect.arrayContaining([
            NotificationChannel.Email,
            NotificationChannel.WebNotificationCenter,
          ]),
        }),
        expect.anything(),
      );
    });

    it('approveLeave: menolak jika pemohon mencoba menyetujui cutinya sendiri', async () => {
      prismaMock.exception.findUnique.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        status: ExceptionStatus.Pending,
        employeeUserId: 'emp-1',
      });

      await expect(
        service.approveLeave({ userId: 'emp-1', role: Role.Supervisor_TL } as any, 'exc-leave-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('approveLeave: menolak jika status cuti bukan Pending', async () => {
      prismaMock.exception.findUnique.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        status: ExceptionStatus.Approved,
        employeeUserId: 'emp-1',
      });

      await expect(service.approveLeave(manager, 'exc-leave-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('rejectLeave: berhasil menolak permohonan cuti dan mencatat rejectionReason ke AuditLog', async () => {
      prismaMock.exception.findUnique.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        status: ExceptionStatus.Pending,
        employeeUserId: 'emp-1',
        dateStart: new Date('2026-10-01'),
        dateEnd: new Date('2026-10-03'),
      });
      scopeFilterMock.isUserInScope.mockResolvedValue(true);
      prismaMock.exception.update.mockResolvedValue({
        id: 'exc-leave-1',
        type: ExceptionType.Leave,
        status: ExceptionStatus.Rejected,
        employeeUserId: 'emp-1',
        approvedByUserId: 'mgr-1',
      });

      const dto = { rejectionReason: 'Beban kerja sprint sedang tinggi' };
      const result = await service.rejectLeave(manager, 'exc-leave-1', dto);

      expect(result.status).toBe(ExceptionStatus.Rejected);
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'EXCEPTION_LEAVE_REJECTED',
          actorUserId: 'mgr-1',
          valueAfter: expect.objectContaining({
            status: ExceptionStatus.Rejected,
            rejectionReason: 'Beban kerja sprint sedang tinggi',
          }),
        }),
        expect.anything(),
      );
      expect(notificationMock.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerType: 'LEAVE_REQUEST_RESOLVED',
          recipientUserId: 'emp-1',
          payload: expect.objectContaining({
            body: expect.stringContaining('Beban kerja sprint sedang tinggi'),
          }),
        }),
        expect.anything(),
      );
    });
  });
});
