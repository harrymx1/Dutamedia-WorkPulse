import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ManagerNoteType, ManagerNoteVisibility } from '@prisma/client';

export class CreateManagerNoteDto {
  @IsNotEmpty({ message: 'aboutUserId wajib diisi' })
  @IsUUID('4', { message: 'aboutUserId harus berupa format UUID v4 yang valid' })
  aboutUserId!: string;

  @IsNotEmpty({ message: 'type catatan manajerial wajib diisi' })
  @IsEnum(ManagerNoteType, {
    message: 'type harus salah satu dari: Coaching, Recognition, Corrective',
  })
  type!: ManagerNoteType;

  @IsNotEmpty({ message: 'note catatan manajerial tidak boleh kosong' })
  @IsString({ message: 'note harus berupa string teks' })
  @MaxLength(5000, { message: 'note maksimal 5000 karakter' })
  note!: string;

  @IsOptional()
  @IsEnum(ManagerNoteVisibility, {
    message:
      'visibility harus salah satu dari: PrivateToManagement, VisibleToEmployee',
  })
  visibility?: ManagerNoteVisibility;

  @IsOptional()
  @IsString({ message: 'relatedEntityType harus berupa string' })
  @MaxLength(100, { message: 'relatedEntityType maksimal 100 karakter' })
  relatedEntityType?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'relatedEntityId harus berupa format UUID v4 yang valid',
  })
  relatedEntityId?: string;
}
