import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { CanonicalFunction, CanonicalRole, EmploymentStatus } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama lengkap pengguna wajib diisi' })
  @MaxLength(150, { message: 'Nama lengkap maksimal 150 karakter' })
  fullName!: string;

  @IsEmail({}, { message: 'Format alamat email tidak valid' })
  @IsNotEmpty({ message: 'Alamat email wajib diisi' })
  email!: string;

  @IsOptional()
  @IsEnum(CanonicalRole, { message: 'Peran kanonikal tidak valid' })
  role?: CanonicalRole;

  @IsOptional()
  @IsEnum(CanonicalFunction, { message: 'Fungsi kanonikal tidak valid' })
  function?: CanonicalFunction;

  @IsOptional()
  @IsEnum(EmploymentStatus, { message: 'Status karyawan tidak valid (PERMANENT, CONTRACT, INTERN)' })
  employmentStatus?: EmploymentStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai harus YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  jobTitle?: string;
}

