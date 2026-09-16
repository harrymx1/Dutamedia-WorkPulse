import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { PolicyCategory } from '@prisma/client';

export class CreatePolicyDto {
  @IsNotEmpty({ message: 'Kategori kebijakan tidak boleh kosong' })
  @IsEnum(PolicyCategory, {
    message: 'Kategori kebijakan tidak valid sesuai PolicyCategory',
  })
  category!: PolicyCategory;

  @IsNotEmpty({ message: 'Nilai kebijakan (value) tidak boleh kosong' })
  @IsObject({ message: 'Nilai kebijakan harus berupa objek JSON' })
  value!: Record<string, any>;

  @IsNotEmpty({ message: 'Tanggal efektif (effectiveDate) tidak boleh kosong' })
  @IsDateString(
    {},
    { message: 'Format tanggal efektif harus berupa ISO Date (YYYY-MM-DD)' },
  )
  effectiveDate!: string;
}
