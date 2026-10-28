import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import {
  CorrectionClassification,
  CorrectionScopeType,
} from '@prisma/client';

export class CreateCorrectionRequestDto {
  @IsUUID('4', { message: 'ID komitmen target tidak valid' })
  targetCommitmentId!: string;

  @IsEnum(CorrectionScopeType, { message: 'Lingkup koreksi harus MORNING_COMMITMENT atau EOD_OUTCOME' })
  scopeType!: CorrectionScopeType;

  @IsEnum(CorrectionClassification, { message: 'Klasifikasi koreksi harus MINOR atau MATERIAL' })
  classification!: CorrectionClassification;

  @IsString({ message: 'Alasan permohonan koreksi wajib diisi' })
  @MinLength(10, { message: 'Alasan permohonan koreksi minimal 10 karakter' })
  reason!: string;

  @IsObject({ message: 'Perubahan nilai yang diajukan harus berupa objek data' })
  @IsNotEmpty({ message: 'Perubahan nilai tidak boleh kosong' })
  requestedChange!: Record<string, any>;
}

export class ReviewCorrectionRequestDto {
  @IsEnum(['APPROVE', 'REJECT'], { message: 'Keputusan review harus APPROVE atau REJECT' })
  decision!: 'APPROVE' | 'REJECT';

  @IsString({ message: 'Catatan review peninjau wajib diisi' })
  @MinLength(5, { message: 'Catatan review peninjau minimal 5 karakter' })
  reviewNote!: string;
}

