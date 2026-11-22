import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemporaryReviewerService } from './temporary-reviewer.service';
import { CanonicalFunction, UserStatus } from '@prisma/client';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

function isoOffsetFromTodayWib(days: number): string {
  const base = toJakartaDateOnly();
  const next = new Date(base.getTime() + days * 86400000);
  return next.toISOString().slice(0, 10);
}

describe('TemporaryReviewerService (Prototipe 17 - Pendelegasian Reviewer Sementara)', () => {
  let service: TemporaryReviewerService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      organizationalAssignment: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      temporaryReviewerAssignment: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
      notification: {
        create: vi.fn().mockResolvedValue({}),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };

    service = new TemporaryReviewerService(mockPrisma);
  });

  it('rejects SYSTEM_ADMIN, INTERN, and self-delegation (400)', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'usr-admin',
      email: 'admin@dutamedia.com',
      status: UserStatus.ACTIVE,
      orgAssignments: [{ role: 'SYSTEM_ADMIN', employmentStatus: 'PERMANENT' }],
    });

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-admin',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.Engineering,
          delegationReason: 'Menguji larangan System Admin menjadi reviewer',
          effectiveDate: isoOffsetFromTodayWib(0),
          expiryDate: isoOffsetFromTodayWib(3),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'usr-intern',
      email: 'intern@dutamedia.com',
      status: UserStatus.ACTIVE,
      orgAssignments: [{ role: 'EMPLOYEE', employmentStatus: 'INTERN' }],
    });

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-intern',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.Engineering,
          delegationReason: 'Menguji larangan Intern menjadi reviewer sementara',
          effectiveDate: isoOffsetFromTodayWib(0),
          expiryDate: isoOffsetFromTodayWib(3),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'usr-head',
      email: 'head.eng@dutamedia.com',
      status: UserStatus.ACTIVE,
      orgAssignments: [{ role: 'HEAD', employmentStatus: 'PERMANENT' }],
    });

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-head',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.Engineering,
          delegationReason: 'Mencoba menunjuk diri sendiri sebagai reviewer',
          effectiveDate: isoOffsetFromTodayWib(0),
          expiryDate: isoOffsetFromTodayWib(3),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('rejects reversed dates, backdated effectiveDate, and short reasons on create/update/revoke (400)', async () => {
    const activeLead = {
      id: 'usr-lead',
      fullName: 'Rian Kurniawan',
      email: 'lead.creative@dutamedia.com',
      status: UserStatus.ACTIVE,
      orgAssignments: [{ role: 'SUPERVISOR', employmentStatus: 'PERMANENT' }],
    };

    mockPrisma.user.findUnique.mockResolvedValue(activeLead);

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-lead',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.OperationsInfrastructure,
          delegationReason: 'Alasan cukup panjang untuk tanggal terbalik',
          effectiveDate: isoOffsetFromTodayWib(4),
          expiryDate: isoOffsetFromTodayWib(1),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-lead',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.OperationsInfrastructure,
          delegationReason: 'Alasan cukup panjang untuk tanggal mundur',
          effectiveDate: isoOffsetFromTodayWib(-2),
          expiryDate: isoOffsetFromTodayWib(3),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-lead',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.OperationsInfrastructure,
          delegationReason: '[Menggantikan Gunawan Setiawan (Head)] Cuti',
          effectiveDate: isoOffsetFromTodayWib(0),
          expiryDate: isoOffsetFromTodayWib(3),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    mockPrisma.temporaryReviewerAssignment.findUnique.mockResolvedValue({
      id: 'del-1',
      delegateUserId: 'usr-lead',
      targetFunction: CanonicalFunction.OperationsInfrastructure,
      delegationReason: '[Menggantikan Gunawan Setiawan] Cuti tahunan',
      effectiveDate: new Date(`${isoOffsetFromTodayWib(-1)}T00:00:00.000Z`),
      expiryDate: new Date(`${isoOffsetFromTodayWib(3)}T00:00:00.000Z`),
      delegateUser: activeLead,
      createdBy: { id: 'admin-1', fullName: 'Admin', email: 'admin@dutamedia.com' },
    });

    await expect(
      service.updateTemporaryReviewer(
        'del-1',
        { updateReason: 'abc', expiryDate: isoOffsetFromTodayWib(5) },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });

    await expect(
      service.revokeTemporaryReviewer('del-1', { revokeReason: 'ok' }, 'admin-1'),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
  });

  it('rejects overlapping active delegation (409) and creates valid delegation with notifications', async () => {
    const activeLead = {
      id: 'usr-lead',
      fullName: 'Rian Kurniawan',
      email: 'lead.creative@dutamedia.com',
      status: UserStatus.ACTIVE,
      orgAssignments: [{ role: 'SUPERVISOR', employmentStatus: 'PERMANENT' }],
    };

    mockPrisma.user.findUnique.mockResolvedValue(activeLead);
    mockPrisma.temporaryReviewerAssignment.findFirst.mockResolvedValueOnce({
      id: 'del-existing',
    });

    await expect(
      service.createTemporaryReviewer(
        {
          delegateUserId: 'usr-lead',
          replacedUserId: 'usr-head',
          targetFunction: CanonicalFunction.OperationsInfrastructure,
          delegationReason: 'Menggantikan Head Ops selama cuti luar kota',
          effectiveDate: isoOffsetFromTodayWib(0),
          expiryDate: isoOffsetFromTodayWib(5),
        },
        'admin-1',
      ),
    ).rejects.toMatchObject({ status: 409, code: 'RESOURCE_CONFLICT' });

    mockPrisma.temporaryReviewerAssignment.findFirst.mockResolvedValueOnce(null);
    mockPrisma.temporaryReviewerAssignment.create.mockResolvedValueOnce({
      id: 'del-new',
      delegateUserId: 'usr-lead',
      targetFunction: CanonicalFunction.OperationsInfrastructure,
      delegationReason: '[Menggantikan Gunawan Setiawan (Head)] Cuti tahunan selama 5 hari kerja',
      effectiveDate: new Date(`${isoOffsetFromTodayWib(0)}T00:00:00.000Z`),
      expiryDate: new Date(`${isoOffsetFromTodayWib(5)}T00:00:00.000Z`),
      delegateUser: activeLead,
    });

    const created = await service.createTemporaryReviewer(
      {
        delegateUserId: 'usr-lead',
        replacedUserId: 'usr-head',
        targetFunction: CanonicalFunction.OperationsInfrastructure,
        delegationReason: '[Menggantikan Gunawan Setiawan (Head)] Cuti tahunan selama 5 hari kerja',
        effectiveDate: isoOffsetFromTodayWib(0),
        expiryDate: isoOffsetFromTodayWib(5),
      },
      'admin-1',
    );

    expect(created.id).toBe('del-new');
    expect(mockPrisma.notification.create).toHaveBeenCalled();
  });
});
