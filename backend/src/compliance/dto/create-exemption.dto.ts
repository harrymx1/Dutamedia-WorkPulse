import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateBoundedExemptionDto {
  @IsUUID('4', { message: 'ID karyawan subjek dispensasi tidak valid' })
  userId!: string;

  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'Status permanen harus berupa boolean' })
  isPermanent?: boolean;

  @IsString({ message: 'Kategori pengecualian wajib diisi' })
  @IsNotEmpty({ message: 'Kategori pengecualian tidak boleh kosong' })
  exemptionCategory!: string;

  @IsOptional()
  @IsString()
  officialReferenceNumber?: string;

  @IsString({ message: 'Alasan resmi dispensasi wajib diisi' })
  @IsNotEmpty({ message: 'Alasan dispensasi tidak boleh kosong' })
  @MinLength(5, { message: 'Alasan resmi dispensasi minimal 5 karakter' })
  reason!: string;
}

export class UpdateBoundedExemptionDto {
  @IsOptional()
  @IsUUID('4', { message: 'ID karyawan subjek dispensasi tidak valid' })
  userId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'Status permanen harus berupa boolean' })
  isPermanent?: boolean;

  @IsOptional()
  @IsString({ message: 'Kategori pengecualian wajib diisi' })
  @IsNotEmpty({ message: 'Kategori pengecualian tidak boleh kosong' })
  exemptionCategory?: string;

  @IsOptional()
  @IsString()
  officialReferenceNumber?: string;

  @IsOptional()
  @IsString({ message: 'Alasan resmi dispensasi wajib diisi' })
  @MinLength(5, { message: 'Alasan resmi dispensasi minimal 5 karakter' })
  reason?: string;
}

