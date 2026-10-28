import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CanonicalFunction } from '@prisma/client';

export class CreateProjectAuthorityDto {
  @IsNotEmpty({ message: 'Kode proyek wajib diisi' })
  @MaxLength(50, { message: 'Kode proyek maksimal 50 karakter' })
  projectCode!: string;

  @IsNotEmpty({ message: 'Nama proyek wajib diisi' })
  @MaxLength(150, { message: 'Nama proyek maksimal 150 karakter' })
  projectName!: string;

  @IsUUID('4', { message: 'ID Project Manager harus berupa format UUID yang valid' })
  @IsNotEmpty({ message: 'Project Manager wajib dipilih' })
  projectManagerId!: string;

  @IsUUID('4', { message: 'ID Escalation Reviewer harus berupa format UUID yang valid' })
  @IsNotEmpty({ message: 'Escalation Reviewer wajib dipilih' })
  escalationReviewerId!: string;

  @IsEnum(CanonicalFunction, { message: 'Fungsi kanonikal tidak valid' })
  @IsNotEmpty({ message: 'Fungsi terlibat wajib dipilih' })
  involvedFunction!: CanonicalFunction;

  @IsDateString({}, { message: 'Format tanggal efektif harus YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Tanggal efektif penugasan wajib diisi' })
  effectiveDate!: string;

  @IsNotEmpty({ message: 'Alasan penunjukan wewenang proyek wajib diisi' })
  assignmentReason!: string;
}

