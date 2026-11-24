import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export const CANONICAL_LEAVE_TYPES = [
  'ANNUAL',
  'SICK',
  'PERMIT',
  'SPECIAL_LEAVE',
  'MATERNITY',
  'UNPAID',
] as const;

export const INTERN_ALLOWED_LEAVE_TYPES = ['PERMIT', 'SICK'] as const;

export type CanonicalLeaveType = (typeof CANONICAL_LEAVE_TYPES)[number];

export class RecordApprovedLeaveDto {
  @IsUUID('4', { message: 'ID karyawan tidak valid' })
  @IsNotEmpty({ message: 'Karyawan wajib dipilih' })
  userId!: string;

  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate!: string;

  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate!: string;

  @IsString({ message: 'Jenis cuti wajib diisi' })
  @IsNotEmpty({ message: 'Jenis cuti tidak boleh kosong' })
  @IsIn(CANONICAL_LEAVE_TYPES, {
    message:
      'Jenis cuti tidak valid. Pilihan yang diizinkan: ANNUAL, SICK, PERMIT, SPECIAL_LEAVE, MATERNITY, UNPAID.',
  })
  leaveType!: string;

  @IsString({ message: 'Keterangan cuti wajib diisi' })
  @MinLength(5, { message: 'Keterangan cuti minimal 5 karakter' })
  reason!: string;
}

export class UpdateApprovedLeaveDto {
  @IsOptional()
  @IsUUID('4', { message: 'ID karyawan tidak valid' })
  userId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  @IsString({ message: 'Jenis cuti wajib diisi' })
  @IsIn(CANONICAL_LEAVE_TYPES, {
    message:
      'Jenis cuti tidak valid. Pilihan yang diizinkan: ANNUAL, SICK, PERMIT, SPECIAL_LEAVE, MATERNITY, UNPAID.',
  })
  leaveType?: string;

  @IsOptional()
  @IsString({ message: 'Keterangan cuti wajib diisi' })
  @MinLength(5, { message: 'Keterangan cuti minimal 5 karakter' })
  reason?: string;
}

// Kompatibilitas tipe jika masih diimpor modul lain
export class CreateLeaveRequestDto {
  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate!: string;

  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate!: string;

  @IsString({ message: 'Jenis cuti wajib diisi' })
  @IsNotEmpty({ message: 'Jenis cuti tidak boleh kosong' })
  @IsIn(CANONICAL_LEAVE_TYPES, {
    message:
      'Jenis cuti tidak valid. Pilihan yang diizinkan: ANNUAL, SICK, PERMIT, SPECIAL_LEAVE, MATERNITY, UNPAID.',
  })
  leaveType!: string;

  @IsString({ message: 'Alasan cuti wajib diisi' })
  @MinLength(5, { message: 'Alasan cuti minimal 5 karakter' })
  reason!: string;
}

export class ReviewLeaveRequestDto {
  @IsEnum(['APPROVE', 'REJECT'], { message: 'Keputusan review harus APPROVE atau REJECT' })
  decision!: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

