import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString({ message: 'Nama lengkap harus berupa string' })
  fullName!: string;

  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsNotEmpty({ message: 'Peran (initialRole) wajib diisi' })
  @IsEnum(Role, {
    message:
      'initialRole harus salah satu dari: Employee, Supervisor_TL, Head, PM, HRGA, CEO_Management, SystemAdmin',
  })
  initialRole!: Role;

  @IsNotEmpty({ message: 'Fungsi organisasi (function) wajib diisi' })
  @IsString({ message: 'Fungsi harus berupa string' })
  function!: string;

  @IsOptional()
  @IsUUID('4', { message: 'directManagerId harus berupa UUID yang valid' })
  directManagerId?: string;

  @IsNotEmpty({ message: 'Tanggal efektif (effectiveDate) wajib diisi' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'effectiveDate harus dalam format YYYY-MM-DD',
  })
  effectiveDate!: string;
}
