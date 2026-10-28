import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AdditionalWorkReason } from '@prisma/client';

export class SubmitAdditionalWorkDto {
  @IsString({ message: 'Deskripsi pekerjaan tambahan wajib diisi' })
  @MinLength(5, { message: 'Deskripsi pekerjaan tambahan minimal 5 karakter' })
  taskText!: string;

  @IsEnum(AdditionalWorkReason, { message: 'Alasan pekerjaan tambahan tidak valid' })
  reason!: AdditionalWorkReason;

  @IsOptional()
  @IsUUID('4', { message: 'ID atasan penugasan tidak valid' })
  assignedByUserId?: string;
}

