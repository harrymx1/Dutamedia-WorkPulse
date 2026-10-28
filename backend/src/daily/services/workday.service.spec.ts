import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkdayService } from './workday.service';

describe('WorkdayService (FR-11 & DEC-013 / Previous Workday Calculation)', () => {
  let service: WorkdayService;
  let mockPrisma: any;
  let mockClock: any;

  beforeEach(() => {
    mockPrisma = {
      companyHoliday: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
      },
      leaveRequest: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
      },
    };

    mockClock = {
      now: vi.fn(() => new Date('2026-10-28T09:00:00.000Z')), // Rabu
    };

    service = new WorkdayService(mockPrisma, mockClock);
  });

  it('returns previous day for Tuesday -> Monday', async () => {
    const tuesday = new Date('2026-10-27T08:00:00.000Z');
    const result = await service.getPreviousWorkday('usr-1', tuesday);
    expect(result).toBe('2026-10-26'); // Senin
  });

  it('skips weekend when target is Monday -> returns Friday', async () => {
    const monday = new Date('2026-10-26T08:00:00.000Z');
    const result = await service.getPreviousWorkday('usr-1', monday);
    expect(result).toBe('2026-10-23'); // Jumat (24 Sabtu, 25 Minggu dilewati)
  });

  it('skips company holiday on Friday -> returns Thursday', async () => {
    const monday = new Date('2026-10-26T08:00:00.000Z');
    mockPrisma.companyHoliday.findMany.mockResolvedValue([
      { holidayDate: new Date('2026-10-23T00:00:00.000Z'), holidayName: 'Libur Nasional' },
    ]);

    const result = await service.getPreviousWorkday('usr-1', monday);
    expect(result).toBe('2026-10-22'); // Kamis
  });

  it('skips approved leave dates for the specific user', async () => {
    const wednesday = new Date('2026-10-28T08:00:00.000Z');
    // User cuti hari Selasa 2026-10-27
    mockPrisma.leaveRequest.findMany.mockResolvedValue([
      {
        userId: 'usr-1',
        startDate: new Date('2026-10-27T00:00:00.000Z'),
        endDate: new Date('2026-10-27T00:00:00.000Z'),
        status: 'APPROVED',
      },
    ]);

    const result = await service.getPreviousWorkday('usr-1', wednesday);
    expect(result).toBe('2026-10-26'); // Senin (Selasa dilewati karena cuti)
  });
});
