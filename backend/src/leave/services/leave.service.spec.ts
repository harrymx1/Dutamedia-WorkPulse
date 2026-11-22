import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveService } from './leave.service';
import { LeaveController, SELF_LEAVE_OPERATIONAL_ROLES } from '../controllers/leave.controller';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CanonicalRole, LeaveStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('LeaveService (WP-EP10 / Leave Management & DEC-007 Reconciliation)', () => {
  let service: LeaveService;
  let mockPrisma: any;
  let mockClock: any;
  let mockScopeResolver: any;

  beforeEach(() => {
    mockPrisma = {
      leaveRequest: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
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

  describe('createLeaveRequest', () => {
    it('rejects leave request when end date is earlier than start date', async () => {
      await expect(
        service.createLeaveRequest('usr-1', {
          startDate: '2026-10-30',
          endDate: '2026-10-28',
          leaveType: 'ANNUAL',
          reason: 'Liburan keluarga',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('creates leave request and notifies direct manager', async () => {
      mockPrisma.leaveRequest.findFirst.mockResolvedValue(null);
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-1',
        status: LeaveStatus.PENDING,
        user: { id: 'usr-1', fullName: 'Budi Dev' },
      });
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        directManagerId: 'mgr-1',
      });

      const res = await service.createLeaveRequest('usr-1', {
        startDate: '2026-10-29',
        endDate: '2026-10-30',
        leaveType: 'ANNUAL',
        reason: 'Urusan keluarga',
      });

      expect(res.id).toBe('lv-1');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'mgr-1',
            triggerType: 'LEAVE_REQUESTED',
          }),
        }),
      );
    });

    it('rejects Intern requesting ANNUAL leave with 400 VALIDATION_FAILED', async () => {
      mockPrisma.leaveRequest.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'INTERN',
        directManagerId: 'mgr-1',
      });

      await expect(
        service.createLeaveRequest('usr-intern', {
          startDate: '2026-10-29',
          endDate: '2026-10-30',
          leaveType: 'ANNUAL',
          reason: 'Liburan bersama teman',
        }),
      ).rejects.toThrowError(/Intern tidak memiliki hak cuti/);
    });

    it('allows Intern requesting PERMIT (Izin) with valid reason', async () => {
      mockPrisma.leaveRequest.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'INTERN',
        directManagerId: 'mgr-1',
      });
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lv-permit-1',
        userId: 'usr-intern',
        leaveType: 'PERMIT',
        status: LeaveStatus.PENDING,
        user: { id: 'usr-intern', fullName: 'Raka Pratama' },
      });

      const res = await service.createLeaveRequest('usr-intern', {
        startDate: '2026-10-29',
        endDate: '2026-10-29',
        leaveType: 'PERMIT',
        reason: 'Bimbingan skripsi wajib di kampus',
      });

      expect(res.id).toBe('lv-permit-1');
      expect(mockPrisma.leaveRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ leaveType: 'PERMIT' }),
        }),
      );
    });

    it('rejects Non-Intern ANNUAL leave when exceeding 12 working days quota per year', async () => {
      mockPrisma.leaveRequest.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'PERMANENT',
        directManagerId: 'mgr-1',
      });
      mockPrisma.leaveRequest.findMany.mockResolvedValue([
        {
          startDate: new Date('2026-03-02'),
          endDate: new Date('2026-03-13'), // 10 hari kerja
          status: LeaveStatus.APPROVED,
        },
        {
          startDate: new Date('2026-05-04'),
          endDate: new Date('2026-05-05'), // 2 hari kerja -> total sudah 12 hari kerja
          status: LeaveStatus.APPROVED,
        },
      ]);

      await expect(
        service.createLeaveRequest('usr-perm', {
          startDate: '2026-11-02',
          endDate: '2026-11-03',
          leaveType: 'ANNUAL',
          reason: 'Cuti tambahan melebihi kuota',
        }),
      ).rejects.toThrowError(/melebihi batas jatah Cuti Tahunan 12 hari kerja/);
    });

    it('rejects weekend-only date ranges (0 working days) with 400 VALIDATION_FAILED', async () => {
      await expect(
        service.createLeaveRequest('usr-perm', {
          startDate: '2026-11-28', // Sabtu
          endDate: '2026-11-29', // Minggu
          leaveType: 'ANNUAL',
          reason: 'Pengajuan akhir pekan yang tidak perlu cuti',
        }),
      ).rejects.toThrowError(/0 hari kerja/);
    });

    it('sends Indonesian leave type labels and single-date format to manager and temporary reviewer', async () => {
      mockPrisma.leaveRequest.findFirst.mockResolvedValue(null);
      mockPrisma.leaveRequest.findMany.mockResolvedValue([]);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'PERMANENT',
        directManagerId: 'mgr-1',
        function: 'ENGINEERING',
        role: CanonicalRole.EMPLOYEE,
      });
      mockPrisma.temporaryReviewerAssignment = {
        findMany: vi.fn().mockResolvedValue([{ delegateUserId: 'del-1' }]),
      };
      mockPrisma.leaveRequest.create.mockResolvedValue({
        id: 'lv-permit-single',
        userId: 'usr-1',
        leaveType: 'PERMIT',
        status: LeaveStatus.PENDING,
        user: { id: 'usr-1', fullName: 'Aditya Nugroho' },
      });

      await service.createLeaveRequest('usr-1', {
        startDate: '2026-10-29',
        endDate: '2026-10-29',
        leaveType: 'PERMIT',
        reason: 'Mengurus dokumen kependudukan pagi hari',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
      const mgrCall = mockPrisma.notification.create.mock.calls[0][0].data;
      const delCall = mockPrisma.notification.create.mock.calls[1][0].data;

      expect(mgrCall.title).toBe('Pengajuan Izin Karyawan Baru');
      expect(mgrCall.message).toContain('mengajukan izin');
      expect(mgrCall.message).not.toContain('PERMIT');
      expect(mgrCall.message).not.toContain('s/d');
      expect(mgrCall.message).toContain('1 hari kerja');

      expect(delCall.title).toBe('Pengajuan Izin Karyawan Baru (Delegasi Reviewer)');
      expect(delCall.message).toContain('mengajukan izin');
      expect(delCall.message).not.toContain('PERMIT');
    });
  });

  describe('getMyLeaveQuota (Paket #1)', () => {
    it('returns hasAnnualQuota false and PERMIT/SICK only for Intern', async () => {
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'INTERN',
      });

      const quota = await service.getMyLeaveQuota('usr-intern', 2026);
      expect(quota.hasAnnualQuota).toBe(false);
      expect(quota.annualQuotaDays).toBe(0);
      expect(quota.allowedLeaveTypes).toEqual(['PERMIT', 'SICK']);
    });

    it('calculates remaining annual quota from 12 working days for Permanent staff', async () => {
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        employmentStatus: 'PERMANENT',
      });
      mockPrisma.leaveRequest.findMany.mockResolvedValue([
        {
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-03'), // 3 hari kerja (Sen-Rab)
          status: LeaveStatus.APPROVED,
        },
        {
          startDate: new Date('2026-07-06'),
          endDate: new Date('2026-07-07'), // 2 hari kerja (Sen-Sel)
          status: LeaveStatus.PENDING,
        },
      ]);

      const quota = await service.getMyLeaveQuota('usr-perm', 2026);
      expect(quota.hasAnnualQuota).toBe(true);
      expect(quota.annualQuotaDays).toBe(12);
      expect(quota.usedDays).toBe(3);
      expect(quota.pendingDays).toBe(2);
      expect(quota.remainingDays).toBe(7);
      expect(quota.allowedLeaveTypes).toContain('ANNUAL');
      expect(quota.allowedLeaveTypes).toContain('PERMIT');
    });
  });

  describe('reviewLeaveRequest (DEC-007)', () => {
    it('approves leave and reconciles retroactive compliance events', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-1',
        startDate: new Date('2026-10-28'),
        endDate: new Date('2026-10-28'),
        status: LeaveStatus.PENDING,
        user: { id: 'usr-1', fullName: 'Budi Dev' },
      });

      mockPrisma.leaveRequest.update.mockResolvedValue({
        id: 'lv-1',
        status: LeaveStatus.APPROVED,
      });

      const res = await service.reviewLeaveRequest('mgr-1', 'lv-1', {
        decision: 'APPROVE',
        reviewNote: 'Disetujui',
      });

      expect(res.status).toBe(LeaveStatus.APPROVED);
      // Memastikan event kepatuhan dihapus (DEC-007)
      expect(mockPrisma.complianceEvent.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientUserId: 'usr-1',
            triggerType: 'LEAVE_APPROVED',
          }),
        }),
      );
    });

    it('enforces scope boundary and denies cross-division review with AUTH_FORBIDDEN_SCOPE', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-cross',
        userId: 'usr-cross-division',
        status: LeaveStatus.PENDING,
      });

      mockScopeResolver.enforceUserScope.mockRejectedValueOnce(
        new AppException({
          code: 'AUTH_FORBIDDEN_SCOPE',
          message: 'Akses ditolak di luar hierarki',
          statusCode: 403,
        }),
      );

      await expect(
        service.reviewLeaveRequest('mgr-tech', 'lv-cross', {
          decision: 'APPROVE',
        }),
      ).rejects.toThrowError(AppException);

      expect(mockScopeResolver.enforceUserScope).toHaveBeenCalledWith(
        'mgr-tech',
        'usr-cross-division',
      );
    });

    it('rejects self-approval of leave request with AUTH_FORBIDDEN_SCOPE', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-self',
        userId: 'mgr-tech',
        status: LeaveStatus.PENDING,
      });

      await expect(
        service.reviewLeaveRequest('mgr-tech', 'lv-self', {
          decision: 'APPROVE',
        }),
      ).rejects.toThrowError(AppException);
    });

    it('filters approval queue to only include accessible subordinates', async () => {
      mockPrisma.leaveRequest.findMany.mockResolvedValue([
        { id: 'lv-1', userId: 'usr-subordinate-eng' },
        { id: 'lv-2', userId: 'usr-creative-staff' },
      ]);

      mockScopeResolver.canAccessUser.mockImplementation(async (_caller: string, target: string) => {
        return target === 'usr-subordinate-eng';
      });

      const queue = await service.getApprovalQueue('mgr-tech');
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('lv-1');
      expect(mockScopeResolver.canAccessUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('cancelLeaveRequest (TC-LEAV-004)', () => {
    it('cancels pending leave request for the request owner', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-1',
        status: LeaveStatus.PENDING,
      });
      mockPrisma.leaveRequest.update.mockResolvedValue({
        id: 'lv-1',
        status: LeaveStatus.CANCELLED,
      });

      const res = await service.cancelLeaveRequest('usr-1', 'lv-1');
      expect(res.status).toBe(LeaveStatus.CANCELLED);
      expect(mockPrisma.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lv-1' },
          data: { status: LeaveStatus.CANCELLED },
        }),
      );
    });

    it('rejects cancellation if user is not the owner', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-other',
        status: LeaveStatus.PENDING,
      });

      await expect(
        service.cancelLeaveRequest('usr-1', 'lv-1'),
      ).rejects.toThrowError(AppException);
    });

    it('rejects cancellation if leave status is already APPROVED', async () => {
      mockPrisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'lv-1',
        userId: 'usr-1',
        status: LeaveStatus.APPROVED,
      });

      await expect(
        service.cancelLeaveRequest('usr-1', 'lv-1'),
      ).rejects.toThrowError(AppException);
    });
  });

  describe('LeaveController RBAC guards (Page 20 self-service endpoints)', () => {
    it('restricts self-service leave endpoints to operational roles and excludes SYSTEM_ADMIN', () => {
      expect(SELF_LEAVE_OPERATIONAL_ROLES).not.toContain(CanonicalRole.SYSTEM_ADMIN);
      expect(SELF_LEAVE_OPERATIONAL_ROLES).toContain(CanonicalRole.EMPLOYEE);

      const endpoints: Array<keyof LeaveController> = [
        'createLeaveRequest',
        'getMyLeaveRequests',
        'getMyLeaveQuota',
        'cancelLeaveRequest',
      ];

      for (const method of endpoints) {
        const handler = LeaveController.prototype[method];
        const roles = Reflect.getMetadata(ROLES_KEY, handler) as CanonicalRole[];
        const guards = Reflect.getMetadata('__guards__', handler) as unknown[];
        expect(guards).toContain(RolesGuard);
        expect(roles).toEqual(SELF_LEAVE_OPERATIONAL_ROLES);
      }
    });
  });
});

