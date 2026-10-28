import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateOrgAssignmentDto {
  @IsNotEmpty({ message: 'userId wajib diisi' })
  @IsUUID('4', { message: 'userId harus berupa UUID yang valid' })
  userId!: string;

  @IsNotEmpty({ message: 'Peran (role) wajib diisi' })
  @IsEnum(Role, {
    message:
      'role harus salah satu dari: Employee, Supervisor_TL, Head, PM, HRGA, CEO_Management, SystemAdmin',
  })
  role!: Role;

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
