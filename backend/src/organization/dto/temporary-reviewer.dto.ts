import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { CanonicalFunction } from '@prisma/client';

export class CreateTemporaryReviewerDto {
  @IsUUID('4', { message: 'ID pengguna penerima delegasi harus berupa format UUID yang valid' })
  @IsNotEmpty({ message: 'Pengguna penerima wewenang delegasi wajib dipilih' })
  delegateUserId!: string;

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

