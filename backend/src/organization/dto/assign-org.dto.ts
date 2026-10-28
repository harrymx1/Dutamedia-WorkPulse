import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CanonicalFunction, CanonicalRole } from '@prisma/client';

export class AssignOrgDto {
  @IsUUID('4', { message: 'ID pengguna harus berupa format UUID yang valid' })
  @IsNotEmpty({ message: 'ID pengguna wajib disertakan' })
  userId!: string;

  @IsNotEmpty({ message: 'Nama jabatan (job title) wajib diisi' })
  @MaxLength(150, { message: 'Nama jabatan maksimal 150 karakter' })
  jobTitle!: string;

  @IsEnum(CanonicalRole, { message: 'Peran kanonikal tidak valid' })
  @IsNotEmpty({ message: 'Peran kanonikal wajib diisi' })
  role!: CanonicalRole;

  @IsEnum(CanonicalFunction, { message: 'Fungsi kanonikal tidak valid' })
  @IsNotEmpty({ message: 'Fungsi kanonikal wajib diisi' })
  function!: CanonicalFunction;

  @IsOptional()
  @IsUUID('4', { message: 'ID atasan langsung harus berupa format UUID' })
  directManagerId?: string | null;

  @IsDateString({}, { message: 'Format tanggal efektif harus YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Tanggal efektif penugasan wajib diisi' })
  effectiveDate!: string;

  @IsNotEmpty({ message: 'Alasan penugasan wajib diisi untuk rekam audit' })
  assignmentReason!: string;
}
