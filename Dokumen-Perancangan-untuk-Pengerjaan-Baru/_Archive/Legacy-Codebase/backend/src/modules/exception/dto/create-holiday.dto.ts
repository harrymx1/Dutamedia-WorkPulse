import { IsDateString, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateHolidayDto {
  @IsNotEmpty({ message: 'Tanggal mulai libur (dateStart) wajib diisi' })
  @IsDateString({}, { message: 'dateStart harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateStart!: string;

  @IsNotEmpty({ message: 'Tanggal akhir libur (dateEnd) wajib diisi' })
  @IsDateString({}, { message: 'dateEnd harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateEnd!: string;

  @IsNotEmpty({ message: 'Keterangan hari libur (reason) wajib diisi' })
  @IsString({ message: 'Keterangan hari libur harus berupa teks' })
  @MinLength(3, { message: 'Keterangan hari libur minimal 3 karakter' })
  @MaxLength(255, { message: 'Keterangan hari libur maksimal 255 karakter' })
  reason!: string;
}
