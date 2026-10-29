import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate!: string;

  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate!: string;

  @IsString({ message: 'Jenis cuti wajib diisi' })
  @IsNotEmpty({ message: 'Jenis cuti tidak boleh kosong' })
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

