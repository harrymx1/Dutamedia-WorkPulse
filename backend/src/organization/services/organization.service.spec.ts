import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationService } from './organization.service';
import { CanonicalFunction, CanonicalRole } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

describe('OrganizationService (WP-EP03-TK002 & TK003)', () => {
  let service: OrganizationService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      organizationalAssignment: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      }),
    };

    service = new OrganizationService(mockPrisma);
  });

  describe('assignUser (Effective-Dating & Constraints)', () => {
    it('should reject self-reporting when userId === directManagerId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-self' });

      await expect(
        service.assignUser(
          {
            userId: 'usr-self',
            jobTitle: 'Lead',
            role: CanonicalRole.HEAD,
            function: CanonicalFunction.Engineering,
            directManagerId: 'usr-self',
            effectiveDate: '2026-11-01',
            assignmentReason: 'Self reporting test',
          },
          'admin-id',
        ),
      ).rejects.toThrowError(AppException);
    });

    it('should close existing open assignment and create new assignment in transaction', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'usr-emp' }); // User
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'usr-mgr' }); // Manager

      // Simulasi penugasan lama yang aktif tanpa endDate
      const existingAssignment = {
        id: 'asg-old',
        userId: 'usr-emp',
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      };
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([existingAssignment]);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.create.mockResolvedValue({
        id: 'asg-new',
        userId: 'usr-emp',
        effectiveDate: new Date('2026-11-01'),
      });

      const res = await service.assignUser(
        {
          userId: 'usr-emp',
          jobTitle: 'Senior Engineer',
          role: CanonicalRole.EMPLOYEE,
          function: CanonicalFunction.Engineering,
          directManagerId: 'usr-mgr',
          effectiveDate: '2026-11-01',
          assignmentReason: 'Promotion',
        },
        'admin-id',
      );

      expect(res.id).toBe('asg-new');

      // Memastikan penugasan lama ditutup pada tanggal effectiveDate - 1 hari
      expect(mockPrisma.organizationalAssignment.update).toHaveBeenCalledWith({
        where: { id: 'asg-old' },
        data: expect.objectContaining({
          endDate: new Date('2026-10-31'),
        }),
      });

      // Memastikan baris baru dimasukkan
      expect(mockPrisma.organizationalAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'usr-emp',
            directManagerId: 'usr-mgr',
            role: CanonicalRole.EMPLOYEE,
            effectiveDate: new Date('2026-11-01'),
          }),
        }),
      );
    });

    it('should reject reporting cycle (A -> B -> A) with BUSINESS_RULE_REPORTING_CYCLE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-a' });

      // Skenario: USR-B saat ini melapor ke USR-A
      // Jika mencoba menugaskan USR-A melapor ke USR-B -> timbul siklus melingkar!
      mockPrisma.organizationalAssignment.findFirst.mockImplementation(
        async (args: any) => {
          if (args.where.userId === 'usr-b') {
            return { userId: 'usr-b', directManagerId: 'usr-a' };
          }
          return null;
        },
      );

      await expect(
        service.assignUser(
          {
            userId: 'usr-a',
            jobTitle: 'Tech Lead',
            role: CanonicalRole.SUPERVISOR,
            function: CanonicalFunction.Engineering,
            directManagerId: 'usr-b',
            effectiveDate: '2026-11-01',
            assignmentReason: 'Circular assignment',
          },
          'admin-id',
        ),
      ).rejects.toThrowError(AppException);

      try {
        await service.assignUser(
          {
            userId: 'usr-a',
            jobTitle: 'Tech Lead',
            role: CanonicalRole.SUPERVISOR,
            function: CanonicalFunction.Engineering,
            directManagerId: 'usr-b',
            effectiveDate: '2026-11-01',
            assignmentReason: 'Circular assignment',
          },
          'admin-id',
        );
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_REPORTING_CYCLE);
      }
    });
  });
});
