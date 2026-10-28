import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ManagerNoteType, NoteVisibility } from '@prisma/client';

export class CreateManagerNoteDto {
  @IsUUID('4', { message: 'ID karyawan subjek tidak valid' })
  subjectUserId!: string;

  @IsEnum(ManagerNoteType, { message: 'Jenis catatan manajerial harus COACHING, RECOGNITION, atau CORRECTIVE' })
  noteType!: ManagerNoteType;

  @IsEnum(NoteVisibility, { message: 'Tingkat visibilitas tidak valid' })
  visibility!: NoteVisibility;

  @IsString({ message: 'Isi catatan manajerial wajib diisi' })
  @MinLength(10, { message: 'Isi catatan manajerial minimal 10 karakter berbasis fakta objektif' })
  content!: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsUUID('4')
  relatedEntityId?: string;
}

