import { IsEnum, IsISO8601, IsObject, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { PolicyCategory } from '@prisma/client';

export class CreatePolicyVersionDto {
  @IsEnum(PolicyCategory, { message: 'Kategori kebijakan tidak valid' })
  category!: PolicyCategory;

  @IsObject({ message: 'Nilai konfigurasi harus berupa objek JSON' })
  configurationValues!: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isIllustrative?: boolean;

  @IsISO8601({}, { message: 'Tanggal efektif harus berformat ISO8601 (YYYY-MM-DD)' })
  effectiveDate!: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Tanggal berakhir harus berformat ISO8601 (YYYY-MM-DD)' })
  endDate?: string;

  @IsString({ message: 'Alasan perubahan wajib berupa teks' })
  @MinLength(15, { message: 'Alasan perubahan kebijakan minimal 15 karakter untuk kebutuhan jejak audit' })
  changeJustification!: string;
}
