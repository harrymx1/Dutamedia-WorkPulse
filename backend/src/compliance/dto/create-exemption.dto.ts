import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBoundedExemptionDto {
  @IsUUID('4', { message: 'ID karyawan subjek dispensasi tidak valid' })
  userId!: string;

  @IsDateString({}, { message: 'Tanggal mulai harus berformat YYYY-MM-DD' })
  startDate!: string;

  @IsDateString({}, { message: 'Tanggal selesai harus berformat YYYY-MM-DD' })
  endDate!: string;

  @IsString({ message: 'Kategori pengecualian wajib diisi' })
  @IsNotEmpty({ message: 'Kategori pengecualian tidak boleh kosong' })
  exemptionCategory!: string;

  @IsOptional()
  @IsString()
  officialReferenceNumber?: string;

  @IsString({ message: 'Alasan resmi dispensasi wajib diisi' })
  @IsNotEmpty({ message: 'Alasan dispensasi tidak boleh kosong' })
  reason!: string;
}
