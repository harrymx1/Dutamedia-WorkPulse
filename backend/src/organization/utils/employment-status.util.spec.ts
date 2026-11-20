import { describe, it, expect, vi } from 'vitest';
import { EmploymentStatus } from '@prisma/client';
import {
  assertUserIsNotIntern,
  formatEmploymentStatusLabel,
  resolveActiveEmploymentStatus,
} from './employment-status.util';
import { AppException } from '../../common/exceptions/app.exception';

describe('employment-status.util (Paket #1)', () => {
  it('resolves active employment status from latest active org assignment', async () => {
    const prisma: any = {
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue({
          employmentStatus: EmploymentStatus.INTERN,
          endDate: null,
        }),
      },
    };
    const status = await resolveActiveEmploymentStatus(prisma, 'usr-intern');
    expect(status?.employmentStatus).toBe(EmploymentStatus.INTERN);
  });

  it('returns null safely when no active assignment exists', async () => {
    const prisma: any = {
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };
    const status = await resolveActiveEmploymentStatus(prisma, 'usr-unknown');
    expect(status).toBeNull();
  });

  it('rejects INTERN from holding authority roles via assertUserIsNotIntern', async () => {
    const prisma: any = {
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue({ employmentStatus: EmploymentStatus.INTERN }),
      },
    };

    await expect(
      assertUserIsNotIntern(prisma, 'usr-intern', 'atasan langsung'),
    ).rejects.toThrowError(AppException);
  });

  it('allows PERMANENT and CONTRACT employees in assertUserIsNotIntern', async () => {
    const prisma: any = {
      organizationalAssignment: {
        findFirst: vi.fn().mockResolvedValue({ employmentStatus: EmploymentStatus.CONTRACT }),
      },
    };

    await expect(
      assertUserIsNotIntern(prisma, 'usr-contract', 'Project Manager'),
    ).resolves.toBeUndefined();
  });

  it('formats employment status labels cleanly in Indonesian', () => {
    expect(formatEmploymentStatusLabel('PERMANENT')).toBe('Karyawan Tetap');
    expect(formatEmploymentStatusLabel('CONTRACT')).toBe('Kontrak');
    expect(formatEmploymentStatusLabel('INTERN')).toBe('Intern');
  });
});
