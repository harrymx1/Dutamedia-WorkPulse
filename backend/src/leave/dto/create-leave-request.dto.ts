import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const CANONICAL_LEAVE_TYPES = [
  'ANNUAL',
  'SICK',
  'SPECIAL_LEAVE',
  'MATERNITY',
  'UNPAID',
] as const;

export type CanonicalLeaveType = (typeof CANONICAL_LEAVE_TYPES)[number];

export class CreateLeaveRequestDto {
  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate!: string;

  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate!: string;

  @IsString({ message: 'Jenis cuti wajib diisi' })
  @IsNotEmpty({ message: 'Jenis cuti tidak boleh kosong' })
  @IsIn(CANONICAL_LEAVE_TYPES, {
    message:
      'Jenis cuti tidak valid. Pilihan yang diizinkan: ANNUAL, SICK, SPECIAL_LEAVE, MATERNITY, UNPAID.',
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

