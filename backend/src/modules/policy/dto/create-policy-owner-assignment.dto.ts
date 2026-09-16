import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { PolicyCategory } from '@prisma/client';

export class CreatePolicyOwnerAssignmentDto {
  @IsNotEmpty({ message: 'User ID tidak boleh kosong' })
  @IsUUID('4', { message: 'User ID harus berupa UUID v4 yang valid' })
  userId!: string;

  @IsNotEmpty({ message: 'Kategori kebijakan tidak boleh kosong' })
  @IsEnum(PolicyCategory, {
    message: 'Kategori kebijakan tidak valid sesuai PolicyCategory',
  })
  policyCategory!: PolicyCategory;

  @IsNotEmpty({ message: 'Tanggal efektif (effectiveDate) tidak boleh kosong' })
  @IsDateString(
    {},
    { message: 'Format tanggal efektif harus berupa ISO Date (YYYY-MM-DD)' },
  )
  effectiveDate!: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Format tanggal berakhir harus berupa ISO Date (YYYY-MM-DD)' },
  )
  endDate?: string;
}
