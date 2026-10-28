import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PolicyCategory } from '@prisma/client';

export class QueryPoliciesDto {
  @IsOptional()
  @IsEnum(PolicyCategory, {
    message: 'Kategori kebijakan tidak valid sesuai PolicyCategory',
  })
  category?: PolicyCategory;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Format asOfDate harus berupa ISO Date (YYYY-MM-DD)' },
  )
  asOfDate?: string;
}
