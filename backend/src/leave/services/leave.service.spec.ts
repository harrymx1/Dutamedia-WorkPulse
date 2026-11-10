import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveService } from './leave.service';
import { LeaveStatus } from '@prisma/client';
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
});

