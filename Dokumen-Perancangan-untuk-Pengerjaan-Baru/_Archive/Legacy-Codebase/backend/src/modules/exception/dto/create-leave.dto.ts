import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeaveDto {
  @IsNotEmpty({ message: 'Tanggal mulai cuti (dateStart) wajib diisi' })
  @IsDateString({}, { message: 'dateStart harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateStart!: string;

  @IsNotEmpty({ message: 'Tanggal akhir cuti (dateEnd) wajib diisi' })
  @IsDateString({}, { message: 'dateEnd harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateEnd!: string;

  @IsOptional()
  @IsString({ message: 'Alasan cuti (reason) harus berupa teks' })
  @MaxLength(500, { message: 'Alasan cuti maksimal 500 karakter' })
  reason?: string;
}
