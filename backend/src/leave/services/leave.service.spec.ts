import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveService } from './leave.service';
import { LeaveController, LEAVE_REGISTRY_ADMIN_ROLES } from '../controllers/leave.controller';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CanonicalRole, LeaveStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('LeaveService (DEC-018 Pencatatan Cuti Resmi Ter-ACC)', () => {
  let service: LeaveService;
  let mockPrisma: any;
  let mockClock: any;
  let mockScopeResolver: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'usr-1', fullName: 'Budi Dev' }),
      },
      leaveRequest: {
        create: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue({ employmentStatus: 'PERMANENT' }),
      },
      complianceEvent: {
        deleteMany: vi.fn(),
      },
      notification: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T10:00:00.000Z')),
    };

    mockScopeResolver = {
      canAccessUser: vi.fn().mockResolvedValue(true),
      enforceUserScope: vi.fn().mockResolvedValue(undefined),
    };

    service = new LeaveService(mockPrisma, mockClock, mockScopeResolver);
  });

  describe('recordApprovedLeave', () => {
    it('rejects when end date is earlier than start date', async () => {
      await expect(
        service.recordApprovedLeave('hrga-1', {
          userId: 'usr-1',
          startDate: '2026-10-30',
          endDate: '2026-10-28',
          leaveType: 'ANNUAL',
          reason: 'Liburan keluarga',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('rejects weekend-only date ranges (0 working days) with 400 VALIDATION_FAILED', async () => {
      await expect(
        service.recordApprovedLeave('hrga-1', {
          userId: 'usr-1',
          startDate: '2026-11-28', // Sabtu
          endDate: '2026-11-29', // Minggu
          leaveType: 'ANNUAL',
          reason: 'Catatan akhir pekan tidak valid',
        }),
      ).rejects.toThrowError(/0 hari kerja/);
    });

    it('rejects overlapping APPROVED leave with 409 RESOURCE_CONFLICT', async () => {
      mockPrisma.leaveRequest.findFirst.mockResolvedValue({ id: 'lv-existing' });
      await expect(
        service.recordApprovedLeave('hrga-1', {
          userId: 'usr-1',
          startDate: '2026-10-29',
          endDate: '2026-10-30',
          leaveType: 'ANNUAL',
          reason: 'Cuti keluarga disetujui atasan',
        }),
      ).rejects.toThrowError(/bertumpuk/);
    });

    it('rejects Intern recorded with ANNUAL leave type', async () => {
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'INTERN',
      });
      await expect(
        service.recordApprovedLeave('hrga-1', {
          userId: 'usr-intern',
          startDate: '2026-10-29',
          endDate: '2026-10-30',
          leaveType: 'ANNUAL',
          reason: 'Cuti tahunan magang tidak valid',
        }),
      ).rejects.toThrowError(/Intern tidak memiliki hak cuti/);
    });

    it('creates APPROVED leave directly, cleans compliance events, and notifies target user', async () => {
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lv-rec-1',
        userId: 'usr-1',
        status: LeaveStatus.APPROVED,
        user: { id: 'usr-1', fullName: 'Budi Dev', email: 'budi@dutamedia.com' },
        reviewedBy: { id: 'hrga-1', fullName: 'Dewi HRGA', email: 'hrga@dutamedia.com' },
      });

      const res = await service.recordApprovedLeave('hrga-1', {
        userId: 'usr-1',
        startDate: '2026-10-29',
        endDate: '2026-10-30',
        leaveType: 'ANNUAL',
        reason: 'Cuti tahunan disetujui pimpinan',
      });

      expect(res.id).toBe('lv-rec-1');
      expect(mockPrisma.leaveRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'usr-1',
            status: LeaveStatus.APPROVED,
            reviewedByUserId: 'hrga-1',
          }),
        }),
      );
      expect(mockPrisma.complianceEvent.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'usr-1',
            triggerType: 'LEAVE_RECORDED',
            actionUrl: '/daily/history',
          }),
        }),
      );
    });
  });

  describe('updateApprovedLeave', () => {
    it('updates approved leave and notifies target employee', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-1',
        startDate: new Date('2026-10-29'),
        endDate: new Date('2026-10-29'),
        leaveType: 'ANNUAL',
        reason: 'Cuti awal',
      });
      mockPrisma.leaveRequest.update.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-1',
        status: LeaveStatus.APPROVED,
        user: { id: 'usr-1', fullName: 'Budi Dev', email: 'budi@dutamedia.com' },
        reviewedBy: { id: 'hrga-1', fullName: 'Dewi HRGA', email: 'hrga@dutamedia.com' },
      });

      const res = await service.updateApprovedLeave('hrga-1', 'lv-1', {
        startDate: '2026-10-29',
        endDate: '2026-10-30',
        reason: 'Perpanjangan cuti disetujui',
      });

      expect(res.id).toBe('lv-1');
      expect(mockPrisma.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lv-1' },
          data: expect.objectContaining({
            reason: 'Perpanjangan cuti disetujui',
            status: LeaveStatus.APPROVED,
            reviewedByUserId: 'hrga-1',
          }),
        }),
      );
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'usr-1',
            triggerType: 'LEAVE_UPDATED',
            actionUrl: '/daily/history',
          }),
        }),
      );
    });
  });

  describe('deleteApprovedLeave', () => {
    it('deletes approved leave and notifies employee that normal schedule resumes', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-del-1',
        userId: 'usr-1',
        startDate: new Date('2026-10-29'),
        endDate: new Date('2026-10-29'),
        leaveType: 'SICK',
        user: { id: 'usr-1', fullName: 'Budi Dev' },
      });
      mockPrisma.user.findUnique.mockResolvedValue({ fullName: 'Dewi HRGA' });
      mockPrisma.leaveRequest.delete.mockResolvedValue({ id: 'lv-del-1' });

      const res = await service.deleteApprovedLeave('hrga-1', 'lv-del-1');

      expect(res).toEqual({ deleted: true, id: 'lv-del-1' });
      expect(mockPrisma.leaveRequest.delete).toHaveBeenCalledWith({
        where: { id: 'lv-del-1' },
      });
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'usr-1',
            triggerType: 'LEAVE_DELETED',
            actionUrl: '/daily/history',
          }),
        }),
      );
    });
  });

  describe('getMyLeaveRequests & getAllApprovedLeaves', () => {
    it('queries only APPROVED records for read-only employee history', async () => {
      await service.getMyLeaveRequests('usr-1');
      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'usr-1', status: LeaveStatus.APPROVED },
        }),
      );
    });

    it('queries all APPROVED records for HRGA/Admin registry', async () => {
      await service.getAllApprovedLeaves();
      expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: LeaveStatus.APPROVED },
        }),
      );
    });
  });

  describe('RBAC Controller Metadata (DEC-018)', () => {
    it('restricts registry endpoints to SYSTEM_ADMIN, HRGA, and CEO_MANAGEMENT', () => {
      expect(LEAVE_REGISTRY_ADMIN_ROLES).toEqual([
        CanonicalRole.SYSTEM_ADMIN,
        CanonicalRole.HRGA,
        CanonicalRole.CEO_MANAGEMENT,
      ]);

      const proto = LeaveController.prototype;
      for (const method of ['getAllApprovedLeaves', 'recordApprovedLeave', 'updateApprovedLeave', 'deleteApprovedLeave']) {
        const handler = (proto as any)[method];
        const guards = Reflect.getMetadata('__guards__', handler);
        const roles = Reflect.getMetadata(ROLES_KEY, handler);
        expect(guards).toContain(RolesGuard);
        expect(roles).toEqual(LEAVE_REGISTRY_ADMIN_ROLES);
      }
    });
  });
});
