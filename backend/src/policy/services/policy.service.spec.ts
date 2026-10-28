import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyService } from './policy.service';
import { PolicyCategory } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

describe('PolicyService (WP-EP04-TK001..TK005)', () => {
  let service: PolicyService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      policy: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      policyOwnerAssignment: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T09:00:00.000Z')),
      todayString: vi.fn(() => '2026-10-28'),
    };

    service = new PolicyService(mockPrisma, mockClock);
  });

  describe('getActivePolicy', () => {
    it('returns canonical fallback when no policy is recorded in database (DEC-011)', async () => {
      mockPrisma.policy.findFirst.mockResolvedValue(null);

      const result = await service.getActivePolicy(PolicyCategory.CHECKIN_TIMING);

      expect(result.isFallback).toBe(true);
      expect(result.isIllustrative).toBe(true);
      expect(result.category).toBe(PolicyCategory.CHECKIN_TIMING);
      expect(result.configurationValues.morningLockCutoff).toBe('09:30');
      expect(result.configurationValues.eodLockCutoff).toBe('21:00');
    });

    it('returns database policy when an active record exists', async () => {
      const mockRecord = {
        id: 'pol-123',
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:45' },
        isIllustrative: false,
        effectiveDate: new Date('2026-10-01'),
        endDate: null,
        createdAt: new Date('2026-10-01'),
        createdBy: { id: 'usr-1', fullName: 'Direktur', email: 'director@test.com' },
      };
      mockPrisma.policy.findFirst.mockResolvedValue(mockRecord);

      const result = await service.getActivePolicy(PolicyCategory.CHECKIN_TIMING);

      expect(result.isFallback).toBe(false);
      expect(result.isIllustrative).toBe(false);
      expect(result.configurationValues.morningLockCutoff).toBe('09:45');
    });
  });

  describe('createPolicyVersion (DEC-008 Anti-Backdating)', () => {
    it('throws BUSINESS_RULE_BACKDATING_FORBIDDEN when effectiveDate is in the past', async () => {
      const dto = {
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:30' },
        effectiveDate: '2026-10-20', // past date compared to 2026-10-28
        changeJustification: 'Alasan perubahan kebijakan operasional kantor',
      };

      await expect(
        service.createPolicyVersion('usr-1', dto),
      ).rejects.toThrowError(AppException);

      try {
        await service.createPolicyVersion('usr-1', dto);
      } catch (err: any) {
        expect(err.code).toBe(ErrorCode.BUSINESS_RULE_BACKDATING_FORBIDDEN);
        expect(err.getStatus()).toBe(422);
      }
    });

    it('successfully creates new version and logs audit trail when effectiveDate >= today', async () => {
      const dto = {
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:45' },
        effectiveDate: '2026-10-29',
        changeJustification: 'Penyesuaian jam masuk kerja selama sprint rilis Q4',
      };

      const mockOldPolicy = {
        id: 'old-pol-1',
        category: PolicyCategory.CHECKIN_TIMING,
        configurationValues: { morningLockCutoff: '09:30' },
        effectiveDate: new Date('2026-09-01'),
        endDate: null,
      };

      mockPrisma.policy.findFirst.mockResolvedValue(mockOldPolicy);
      mockPrisma.policy.create.mockResolvedValue({
        id: 'new-pol-2',
        ...dto,
        effectiveDate: new Date('2026-10-29'),
        createdBy: { id: 'usr-1', fullName: 'Direktur', email: 'dir@test.com' },
      });

      const result = await service.createPolicyVersion('usr-1', dto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Vitest',
      });

      // Verifikasi penutupan kebijakan lama
      expect(mockPrisma.policy.update).toHaveBeenCalledWith({
        where: { id: 'old-pol-1' },
        data: { endDate: new Date('2026-10-28') },
      });

      // Verifikasi pencatatan jejak audit
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionCode: 'POLICY_VERSION_CREATED',
            relatedEntityType: 'policies',
            actorUserId: 'usr-1',
          }),
        }),
      );

      expect(result.id).toBe('new-pol-2');
    });
  });
});
