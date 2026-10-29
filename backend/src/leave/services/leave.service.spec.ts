import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveService } from './leave.service';
import { LeaveStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';

describe('LeaveService (WP-EP10 / Leave Management & DEC-007 Reconciliation)', () => {
  let service: LeaveService;
  let mockPrisma: any;
  let mockClock: any;

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

    service = new LeaveService(mockPrisma, mockClock);
  });

  describe('createLeaveRequest', () => {
    it('rejects leave request when end date is earlier than start date', async () => {
      await expect(
        service.createLeaveRequest('usr-1', {
          startDate: '2026-10-30',
          endDate: '2026-10-28',
          leaveType: 'Cuti Tahunan',
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
        leaveType: 'Cuti Tahunan',
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
  });
});

