import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectAuthorityService } from '../../src/modules/authorization/services/project-authority.service.js';
import { ForbiddenException } from '../../src/modules/shared/exceptions/api.exception.js';

describe('ProjectAuthorityService (SAD §8.9 - EPIC-05-T3)', () => {
  let service: ProjectAuthorityService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      projectAuthorityMapping: {
        findFirst: vi.fn(),
      },
      organizationalAssignment: {
        findFirst: vi.fn(),
      },
    };
    service = new ProjectAuthorityService(mockPrisma);
  });

  describe('resolveAuthority', () => {
    it('harus mengembalikan ProjectAuthority jika ditemukan ProjectAuthorityMapping aktif (SAD §8.9 langkah 2-3)', async () => {
      mockPrisma.projectAuthorityMapping.findFirst.mockResolvedValue({
        id: 'pam-1',
        userId: 'actor-1',
        scopeReference: 'Project-Alpha',
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      });

      const result = await service.resolveAuthority(
        'actor-1',
        'target-1',
        'Project-Alpha',
        new Date('2026-09-01'),
      );

      expect(result).toEqual({
        authorized: true,
        authorityType: 'ProjectAuthority',
      });
      expect(mockPrisma.organizationalAssignment.findFirst).not.toHaveBeenCalled();
    });

    it('harus fallback ke OrganizationalAuthority jika project mapping tidak ada namun aktor adalah direct manager target (SAD §8.9 langkah 3)', async () => {
      mockPrisma.projectAuthorityMapping.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue({
        id: 'org-1',
        userId: 'target-1',
        directManagerId: 'actor-1',
        effectiveDate: new Date('2026-01-01'),
        endDate: null,
      });

      const result = await service.resolveAuthority(
        'actor-1',
        'target-1',
        'Project-Unknown',
        new Date('2026-09-01'),
      );

      expect(result).toEqual({
        authorized: true,
        authorityType: 'OrganizationalAuthority',
      });
      expect(mockPrisma.organizationalAssignment.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'target-1',
          directManagerId: 'actor-1',
          effectiveDate: { lte: expect.any(Date) },
          OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
        },
      });
    });

    it('harus mengembalikan authorized: false jika bukan Project Authority maupun Organizational Authority', async () => {
      mockPrisma.projectAuthorityMapping.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);

      const result = await service.resolveAuthority(
        'actor-1',
        'target-1',
        'Project-Unknown',
        new Date('2026-09-01'),
      );

      expect(result.authorized).toBe(false);
      expect(result.authorityType).toBeNull();
      expect(result.reason).toBeDefined();
    });
  });

  describe('assertAuthority', () => {
    it('harus meloloskan resolusi jika berwenang', async () => {
      mockPrisma.projectAuthorityMapping.findFirst.mockResolvedValue({
        id: 'pam-1',
        userId: 'actor-1',
      });

      const result = await service.assertAuthority(
        'actor-1',
        'target-1',
        'Project-Alpha',
      );

      expect(result.authorized).toBe(true);
    });

    it('harus melempar ForbiddenException jika tidak berwenang (SAD §8.9 langkah 3)', async () => {
      mockPrisma.projectAuthorityMapping.findFirst.mockResolvedValue(null);
      mockPrisma.organizationalAssignment.findFirst.mockResolvedValue(null);

      await expect(
        service.assertAuthority('actor-1', 'target-1', 'Project-Unknown'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
