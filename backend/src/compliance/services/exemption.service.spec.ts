import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExemptionService } from './exemption.service';
import { AppException } from '../../common/exceptions/app.exception';

describe('ExemptionService (WP-EP08 / Exemption Management - Prototipe 12)', () => {
  let service: ExemptionService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      boundedExemption: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T10:00:00.000Z')),
    };

    service = new ExemptionService(mockPrisma, mockClock);
  });

  it('rejects bounded exemption when end date is before start date', async () => {
    await expect(
      service.createBoundedExemption('hrga-1', {
        userId: 'usr-1',
        startDate: '2026-10-30',
        endDate: '2026-10-28', // Invalid range
        exemptionCategory: 'Dinas Luar',
        reason: 'Kunjungan klien Surabaya',
      }),
    ).rejects.toThrowError(AppException);
  });

  it('creates valid bounded exemption for employee', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-1', fullName: 'Budi Staf' });
    mockPrisma.boundedExemption.create.mockResolvedValue({
      id: 'ex-1',
      userId: 'usr-1',
      startDate: new Date('2026-10-29'),
      endDate: new Date('2026-10-31'),
      exemptionCategory: 'Pelatihan Sertifikasi',
      reason: 'Training AWS Solution Architect',
      createdByUserId: 'hrga-1',
    });

    const res = await service.createBoundedExemption('hrga-1', {
      userId: 'usr-1',
      startDate: '2026-10-29',
      endDate: '2026-10-31',
      exemptionCategory: 'Pelatihan Sertifikasi',
      reason: 'Training AWS Solution Architect',
    });

    expect(res.id).toBe('ex-1');
    expect(mockPrisma.boundedExemption.create).toHaveBeenCalled();
  });
});

