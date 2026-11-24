import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExemptionService } from './exemption.service';
import { NotificationChannel } from '@prisma/client';
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

  it('rejects exemption reason shorter than 5 characters with VALIDATION_FAILED', async () => {
    await expect(
      service.createBoundedExemption('hrga-1', {
        userId: 'usr-1',
        startDate: '2026-10-29',
        endDate: '2026-10-30',
        exemptionCategory: 'Dinas Luar',
        reason: 'ok',
      }),
    ).rejects.toThrowError(AppException);
    expect(mockPrisma.boundedExemption.create).not.toHaveBeenCalled();
  });

  it('rejects overlapping bounded exemption for the same employee with RESOURCE_CONFLICT', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-1', fullName: 'Budi Staf' });
    mockPrisma.boundedExemption.findFirst = vi.fn().mockResolvedValue({
      id: 'ex-existing',
      userId: 'usr-1',
      startDate: new Date('2026-10-28'),
      endDate: new Date('2026-10-30'),
    });

    await expect(
      service.createBoundedExemption('hrga-1', {
        userId: 'usr-1',
        startDate: '2026-10-29',
        endDate: '2026-10-31',
        exemptionCategory: 'Dinas Luar',
        reason: 'Pendampingan klien luar kota',
      }),
    ).rejects.toThrowError(AppException);
    expect(mockPrisma.boundedExemption.create).not.toHaveBeenCalled();
  });

  it('sends EXEMPTION_GRANTED notification to target employee upon creation', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-1', fullName: 'Budi Staf' });
    mockPrisma.boundedExemption.findFirst = vi.fn().mockResolvedValue(null);
    mockPrisma.boundedExemption.create.mockResolvedValue({
      id: 'ex-2',
      userId: 'usr-1',
      startDate: new Date('2026-11-22'),
      endDate: new Date('2026-11-22'),
      exemptionCategory: 'Dinas Luar',
      reason: 'Kunjungan instalasi server klien',
      createdByUser: { id: 'hrga-1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
    });
    mockPrisma.notification = {
      create: vi.fn().mockResolvedValue({ id: 'notif-ex-1' }),
    };

    const res = await service.createBoundedExemption('hrga-1', {
      userId: 'usr-1',
      startDate: '2026-11-22',
      endDate: '2026-11-22',
      exemptionCategory: 'Dinas Luar',
      reason: 'Kunjungan instalasi server klien',
    });

    expect(res.id).toBe('ex-2');
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipientUserId: 'usr-1',
          triggerType: 'EXEMPTION_GRANTED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: 'Dispensasi Resmi Didaftarkan (Dinas Luar)',
          actionUrl: '/daily/history',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: 'ex-2',
        }),
      }),
    );
  });

  it('updates existing bounded exemption and sends EXEMPTION_UPDATED notification (DEC-018)', async () => {
    mockPrisma.boundedExemption.findUnique = vi.fn().mockResolvedValue({
      id: 'ex-edit-1',
      userId: 'usr-1',
      startDate: new Date('2026-11-22'),
      endDate: new Date('2026-11-22'),
      exemptionCategory: 'Dinas Luar',
      officialReferenceNumber: 'ST/01',
      reason: 'Alasan awal',
      user: { id: 'usr-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
    });
    mockPrisma.boundedExemption.findFirst = vi.fn().mockResolvedValue(null);
    mockPrisma.boundedExemption.update = vi.fn().mockResolvedValue({
      id: 'ex-edit-1',
      userId: 'usr-1',
      startDate: new Date('2026-11-22'),
      endDate: new Date('2026-11-23'),
      exemptionCategory: 'Pelatihan Sertifikasi',
      officialReferenceNumber: 'ST/02',
      reason: 'Perubahan jadwal pelatihan resmi',
      user: { id: 'usr-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
      createdByUser: { id: 'hrga-1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
    });
    mockPrisma.user.findUnique.mockResolvedValue({ fullName: 'Dewi Lestari' });
    mockPrisma.notification = { create: vi.fn() };

    const res = await service.updateBoundedExemption('hrga-1', 'ex-edit-1', {
      endDate: '2026-11-23',
      exemptionCategory: 'Pelatihan Sertifikasi',
      officialReferenceNumber: 'ST/02',
      reason: 'Perubahan jadwal pelatihan resmi',
    });

    expect(res.exemptionCategory).toBe('Pelatihan Sertifikasi');
    expect(mockPrisma.boundedExemption.update).toHaveBeenCalled();
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipientUserId: 'usr-1',
          triggerType: 'EXEMPTION_UPDATED',
          actionUrl: '/daily/history',
        }),
      }),
    );
  });

  it('deletes bounded exemption and notifies employee (DEC-018)', async () => {
    mockPrisma.boundedExemption.findUnique = vi.fn().mockResolvedValue({
      id: 'ex-del-1',
      userId: 'usr-1',
      startDate: new Date('2026-11-22'),
      endDate: new Date('2026-11-22'),
      exemptionCategory: 'Dinas Luar',
      user: { id: 'usr-1', fullName: 'Budi Staf' },
    });
    mockPrisma.boundedExemption.delete = vi.fn().mockResolvedValue({ id: 'ex-del-1' });
    mockPrisma.user.findUnique.mockResolvedValue({ fullName: 'Dewi Lestari' });
    mockPrisma.notification = { create: vi.fn() };

    const res = await service.deleteBoundedExemption('hrga-1', 'ex-del-1');

    expect(res).toEqual({ deleted: true, id: 'ex-del-1' });
    expect(mockPrisma.boundedExemption.delete).toHaveBeenCalledWith({
      where: { id: 'ex-del-1' },
    });
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recipientUserId: 'usr-1',
          triggerType: 'EXEMPTION_DELETED',
          actionUrl: '/daily/history',
        }),
      }),
    );
  });
});

