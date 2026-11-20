import { HttpStatus } from '@nestjs/common';
import { EmploymentStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

/**
 * Mengambil status kepegawaian aktif pengguna pada tanggal target (default hari ini WIB).
 * Jika mock/basis data belum memiliki record penugasan, mengembalikan PERMANENT secara aman.
 */
export async function resolveActiveEmploymentStatus(
  prisma: any,
  userId: string,
  targetDate: Date = new Date(),
): Promise<{ employmentStatus: EmploymentStatus; endDate: Date | null } | null> {
  if (!prisma?.organizationalAssignment?.findFirst || !userId) {
    return null;
  }

  const today = toJakartaDateOnly(targetDate);
  const activeOrg = await prisma.organizationalAssignment.findFirst({
    where: {
      userId,
      effectiveDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    orderBy: { effectiveDate: 'desc' },
    select: {
      employmentStatus: true,
      endDate: true,
    },
  });

  if (!activeOrg) {
    return null;
  }

  return {
    employmentStatus: activeOrg.employmentStatus || EmploymentStatus.PERMANENT,
    endDate: activeOrg.endDate || null,
  };
}

/**
 * Penegakan Aturan Paket #1 (Poin 5):
 * Akun berstatus Intern TIDAK BOLEH ditunjuk sebagai pemegang wewenang
 * (Atasan Langsung, Atasan Penugas, PIC Blocker, Pimpinan Proyek, Reviewer Sementara, Pemilik Kebijakan).
 */
export async function assertUserIsNotIntern(
  prisma: any,
  userId: string | null | undefined,
  authorityLabel: string,
  targetDate: Date = new Date(),
): Promise<void> {
  if (!userId) return;
  const statusInfo = await resolveActiveEmploymentStatus(prisma, userId, targetDate);
  if (statusInfo?.employmentStatus === EmploymentStatus.INTERN) {
    throw new AppException({
      code: ErrorCode.VALIDATION_FAILED,
      message: `Karyawan berstatus Intern tidak dapat ditetapkan sebagai ${authorityLabel}.`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

export function formatEmploymentStatusLabel(status?: string | null): string {
  switch (status) {
    case 'INTERN':
      return 'Intern';
    case 'CONTRACT':
      return 'Kontrak';
    case 'PERMANENT':
    default:
      return 'Karyawan Tetap';
  }
}
