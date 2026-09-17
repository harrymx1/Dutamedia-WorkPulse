import { IsDateString, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateExemptionDto {
  @IsNotEmpty({ message: 'employeeUserId wajib ditentukan' })
  @IsUUID('all', { message: 'employeeUserId harus berupa UUID yang valid' })
  employeeUserId!: string;

  @IsNotEmpty({ message: 'Tanggal mulai pengecualian (dateStart) wajib diisi' })
  @IsDateString({}, { message: 'dateStart harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateStart!: string;

  @IsNotEmpty({ message: 'Tanggal akhir pengecualian (dateEnd) wajib diisi' })
  @IsDateString({}, { message: 'dateEnd harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateEnd!: string;

  @IsNotEmpty({ message: 'Alasan pengecualian (reason) wajib diisi' })
  @IsString({ message: 'Alasan pengecualian harus berupa teks' })
  @MinLength(3, { message: 'Alasan pengecualian minimal 3 karakter' })
  @MaxLength(500, { message: 'Alasan pengecualian maksimal 500 karakter' })
  reason!: string;
}
