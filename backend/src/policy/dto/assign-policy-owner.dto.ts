import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PolicyCategory } from '@prisma/client';

export class AssignPolicyOwnerDto {
  @IsUUID('4', { message: 'ID pengguna tidak valid' })
  userId!: string;

  @IsEnum(PolicyCategory, { message: 'Kategori kebijakan tidak valid' })
  policyCategory!: PolicyCategory;

  @IsISO8601({}, { message: 'Tanggal efektif harus berformat ISO8601 (YYYY-MM-DD)' })
  effectiveDate!: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Tanggal berakhir harus berformat ISO8601 (YYYY-MM-DD)' })
  endDate?: string;
}
