import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { CanonicalFunction } from '@prisma/client';

export class CreateTemporaryReviewerDto {
  @IsUUID('4', { message: 'ID pengguna penerima delegasi harus berupa format UUID yang valid' })
  @IsNotEmpty({ message: 'Pengguna penerima wewenang delegasi wajib dipilih' })
  delegateUserId!: string;

  @IsUUID('4', { message: 'ID pejabat yang digantikan harus berupa format UUID yang valid' })
  @IsOptional()
  replacedUserId?: string;

  @IsEnum(CanonicalFunction, { message: 'Fungsi target delegasi tidak valid' })
  @IsNotEmpty({ message: 'Fungsi target delegasi wajib dipilih' })
  targetFunction!: CanonicalFunction;

  @IsNotEmpty({ message: 'Alasan delegasi peninjau sementara wajib diisi' })
  delegationReason!: string;

  @IsDateString({}, { message: 'Format tanggal efektif harus YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Tanggal efektif delegasi wajib diisi' })
  effectiveDate!: string;

  @IsDateString({}, { message: 'Format batas tanggal kedaluwarsa harus YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Batas tanggal kedaluwarsa delegasi wajib diisi' })
  expiryDate!: string;
}

export class UpdateTemporaryReviewerDto {
  @IsDateString({}, { message: 'Format tanggal efektif harus YYYY-MM-DD' })
  @IsOptional()
  effectiveDate?: string;

  @IsDateString({}, { message: 'Format batas tanggal kedaluwarsa harus YYYY-MM-DD' })
  @IsOptional()
  expiryDate?: string;

  @IsNotEmpty({ message: 'Alasan perubahan delegasi wajib diisi' })
  updateReason!: string;
}

export class RevokeTemporaryReviewerDto {
  @IsNotEmpty({ message: 'Alasan pencabutan delegasi wajib diisi' })
  revokeReason!: string;
}

