import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyCategory, PolicyStatus, UserStatus } from '@prisma/client';
import {
  PolicyService,
  DEFAULT_POLICY_VALUES,
} from '../../src/modules/policy/policy.service.js';
import {
  BusinessRuleViolationException,
  NotFoundException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('PolicyService (SAD §5.9, §6.4, §10.9 - EPIC-06)', () => {
  let service: PolicyService;
  let mockPrisma: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockPrisma = {
      policy: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      policyOwnerAssignment: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };

    service = new PolicyService(mockPrisma, mockAuditService);
  });

  describe('getActivePolicies (EPIC-06-T1 - SAD §10.9)', () => {
    it('harus mengembalikan daftar kebijakan aktif dengan filter effective-dating', async () => {
      const mockPolicies = [
        {
          id: 'pol-1',
          category: PolicyCategory.Cutoff,
          value: { morningOnTimeDeadline: '09:00' },
          status: PolicyStatus.Active,
          effectiveDate: new Date('2026-01-01'),
          endDate: null,
        },
      ];

      mockPrisma.policy.findMany.mockResolvedValue(mockPolicies);

      const result = await service.getActivePolicies({
        category: PolicyCategory.Cutoff,
        asOfDate: '2026-09-01',
      });

      expect(result).toEqual(mockPolicies);
      expect(mockPrisma.policy.findMany).toHaveBeenCalledWith({
        where: {
          category: PolicyCategory.Cutoff,
          status: PolicyStatus.Active,
          effectiveDate: { lte: new Date('2026-09-01') },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date('2026-09-01') } },
          ],
        },
        orderBy: { category: 'asc' },
      });
    });
  });

  describe('getPolicyHistory (EPIC-06-T1 - SAD §10.9)', () => {
    it('harus mengembalikan seluruh riwayat versi untuk kategori kebijakan terurut dari terbaru', async () => {
      const mockHistory = [
        {
          id: 'pol-2',
          category: PolicyCategory.Cutoff,
          effectiveDate: new Date('2026-06-01'),
          createdBy: { id: 'admin-1', fullName: 'Admin' },
        },
        {
          id: 'pol-1',
          category: PolicyCategory.Cutoff,
          effectiveDate: new Date('2026-01-01'),
          createdBy: { id: 'admin-1', fullName: 'Admin' },
        },
      ];

      mockPrisma.policy.findMany.mockResolvedValue(mockHistory);

      const result = await service.getPolicyHistory(PolicyCategory.Cutoff);

      expect(result).toEqual(mockHistory);
      expect(mockPrisma.policy.findMany).toHaveBeenCalledWith({
        where: { category: PolicyCategory.Cutoff },
        orderBy: { effectiveDate: 'desc' },
        include: {
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

  describe('createPolicy (EPIC-06-T2 - SAD §5.9, §10.9)', () => {
    it('harus membuat versi baru dan menutup endDate versi aktif sebelumnya secara atomic', async () => {
      const existingPolicy = {
        id: 'pol-old-1',
        category: PolicyCategory.GracePeriod,
        value: { morningGraceMinutes: 15 },
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      };

      const newPolicy = {
        id: 'pol-new-1',
        category: PolicyCategory.GracePeriod,
        value: { morningGraceMinutes: 30 },
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
        status: PolicyStatus.Active,
        createdByUserId: 'owner-1',
      };

      mockPrisma.policy.findFirst.mockResolvedValue(existingPolicy);
      mockPrisma.policy.create.mockResolvedValue(newPolicy);

      const result = await service.createPolicy(
        {
          category: PolicyCategory.GracePeriod,
          value: { morningGraceMinutes: 30 },
          effectiveDate: '2026-09-01',
        },
        'owner-1',
      );

      // Verifikasi penutupan versi lama: 2026-09-01 - 1 hari = 2026-08-31
      expect(mockPrisma.policy.update).toHaveBeenCalledWith({
        where: { id: 'pol-old-1' },
        data: { endDate: new Date('2026-08-31') },
      });

      expect(mockPrisma.policy.create).toHaveBeenCalledWith({
        data: {
          category: PolicyCategory.GracePeriod,
          value: { morningGraceMinutes: 30 },
          effectiveDate: new Date('2026-09-01'),
          endDate: null,
          status: PolicyStatus.Active,
          createdByUserId: 'owner-1',
        },
      });

      // Verifikasi pencatatan audit log
      expect(mockAuditService.record).toHaveBeenCalledWith(
        {
          actorUserId: 'owner-1',
          action: 'POLICY_VERSION_CREATED',
          relatedEntityType: 'Policy',
          relatedEntityId: 'pol-new-1',
          valueBefore: {
            id: 'pol-old-1',
            value: { morningGraceMinutes: 15 },
            effectiveDate: expect.any(Date),
          },
          valueAfter: {
            id: 'pol-new-1',
            value: { morningGraceMinutes: 30 },
            effectiveDate: expect.any(Date),
          },
        },
        mockPrisma,
      );

      expect(result).toEqual(newPolicy);
    });
  });

  describe('createPolicyOwnerAssignment (EPIC-06-T3 - SAD §8.10, §10.9)', () => {
    it('harus menolak jika target user tidak ditemukan atau nonaktif', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createPolicyOwnerAssignment(
          {
            userId: 'unknown-user',
            policyCategory: PolicyCategory.Cutoff,
            effectiveDate: '2026-09-01',
          },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus menolak jika endDate <= effectiveDate', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        status: UserStatus.Active,
      });

      await expect(
        service.createPolicyOwnerAssignment(
          {
            userId: 'user-1',
            policyCategory: PolicyCategory.Cutoff,
            effectiveDate: '2026-09-01',
            endDate: '2026-08-31', // Lebih awal dari effectiveDate
          },
          'admin-1',
        ),
      ).rejects.toThrow(BusinessRuleViolationException);
    });

    it('harus membuat assignment baru dan menutup assignment lama jika ada', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        status: UserStatus.Active,
      });

      mockPrisma.policyOwnerAssignment.findFirst.mockResolvedValue({
        id: 'poa-old-1',
        userId: 'user-1',
        policyCategory: PolicyCategory.Cutoff,
      });

      const newAssignment = {
        id: 'poa-new-1',
        userId: 'user-1',
        policyCategory: PolicyCategory.Cutoff,
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
      };

      mockPrisma.policyOwnerAssignment.create.mockResolvedValue(newAssignment);

      const result = await service.createPolicyOwnerAssignment(
        {
          userId: 'user-1',
          policyCategory: PolicyCategory.Cutoff,
          effectiveDate: '2026-09-01',
        },
        'admin-1',
      );

      expect(mockPrisma.policyOwnerAssignment.update).toHaveBeenCalledWith({
        where: { id: 'poa-old-1' },
        data: { endDate: new Date('2026-08-31') },
      });

      expect(mockPrisma.policyOwnerAssignment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          policyCategory: PolicyCategory.Cutoff,
          effectiveDate: new Date('2026-09-01'),
          endDate: null,
        },
      });

      expect(mockAuditService.record).toHaveBeenCalledWith(
        {
          actorUserId: 'admin-1',
          action: 'POLICY_OWNER_ASSIGNED',
          relatedEntityType: 'PolicyOwnerAssignment',
          relatedEntityId: 'poa-new-1',
          valueAfter: {
            userId: 'user-1',
            policyCategory: PolicyCategory.Cutoff,
            effectiveDate: '2026-09-01',
            endDate: null,
          },
        },
        mockPrisma,
      );

      expect(result).toEqual(newAssignment);
    });
  });

  describe('getActivePolicySnapshot (EPIC-06-T4 - SAD §6.4)', () => {
    it('harus mengembalikan fallback nilai default jika kebijakan belum tersimpan di DB', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([]);

      const snapshot = await service.getActivePolicySnapshot([
        PolicyCategory.Cutoff,
        PolicyCategory.GracePeriod,
      ]);

      expect(snapshot[PolicyCategory.Cutoff]).toEqual(
        DEFAULT_POLICY_VALUES[PolicyCategory.Cutoff],
      );
      expect(snapshot[PolicyCategory.GracePeriod]).toEqual(
        DEFAULT_POLICY_VALUES[PolicyCategory.GracePeriod],
      );
    });

    it('harus menimpa default dengan nilai aktual dari database yang sedang aktif', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([
        {
          id: 'pol-1',
          category: PolicyCategory.Cutoff,
          value: {
            morningOnTimeDeadline: '08:30', // custom override
            eodOnTimeDeadline: '17:30',
          },
        },
      ]);

      const snapshot = await service.getActivePolicySnapshot([
        PolicyCategory.Cutoff,
        PolicyCategory.GracePeriod,
      ]);

      expect(snapshot[PolicyCategory.Cutoff]).toEqual({
        morningOnTimeDeadline: '08:30',
        eodOnTimeDeadline: '17:30',
      });
      // GracePeriod tetap menggunakan default
      expect(snapshot[PolicyCategory.GracePeriod]).toEqual(
        DEFAULT_POLICY_VALUES[PolicyCategory.GracePeriod],
      );
    });
  });
});
