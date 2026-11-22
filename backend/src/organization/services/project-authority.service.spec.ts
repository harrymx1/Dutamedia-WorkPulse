import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectAuthorityService } from './project-authority.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { CanonicalFunction } from '@prisma/client';

describe('ProjectAuthorityService (Prototipe 15 - Project Authority)', () => {
  let service: ProjectAuthorityService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      projectAuthorityMapping: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (cb) => cb(mockPrisma)),
    };

    service = new ProjectAuthorityService(mockPrisma);
  });

  it('rejects project authority assignment when projectManagerId equals escalationReviewerId', async () => {
    await expect(
      service.createProjectAuthority(
        {
          projectCode: 'PRJ-TEST',
          projectName: 'Proyek Uji',
          projectManagerId: 'usr-same',
          escalationReviewerId: 'usr-same',
          involvedFunction: CanonicalFunction.Engineering,
          effectiveDate: '2026-11-22',
          assignmentReason: 'Penetapan proyek baru',
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      message: 'Project Manager dan Escalation Reviewer tidak boleh dijabat oleh orang yang sama.',
    });

    try {
      await service.createProjectAuthority(
        {
          projectCode: 'PRJ-TEST',
          projectName: 'Proyek Uji',
          projectManagerId: 'usr-same',
          escalationReviewerId: 'usr-same',
          involvedFunction: CanonicalFunction.Engineering,
          effectiveDate: '2026-11-22',
          assignmentReason: 'Penetapan proyek baru',
        },
        'admin-1',
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AppException);
    }
    expect(mockPrisma.projectAuthorityMapping.create).not.toHaveBeenCalled();
  });

  it('combines search and activeOnly filters inside where.AND without overwriting OR conditions', async () => {
    mockPrisma.projectAuthorityMapping.count.mockResolvedValue(1);
    mockPrisma.projectAuthorityMapping.findMany.mockResolvedValue([]);

    await service.listProjectAuthorities({
      search: 'portal',
      activeOnly: true,
      limit: 100,
    });

    expect(mockPrisma.projectAuthorityMapping.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              OR: [
                { projectCode: { contains: 'portal', mode: 'insensitive' } },
                { projectName: { contains: 'portal', mode: 'insensitive' } },
              ],
            },
            expect.objectContaining({
              effectiveDate: { lte: expect.any(Date) },
              OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
            }),
          ],
        },
      }),
    );
  });
});
