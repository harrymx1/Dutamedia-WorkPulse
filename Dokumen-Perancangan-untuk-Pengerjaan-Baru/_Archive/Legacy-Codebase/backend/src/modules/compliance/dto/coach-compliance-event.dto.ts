import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ManagerNoteVisibility } from '@prisma/client';

export class CoachComplianceEventDto {
  @IsNotEmpty({ message: 'note catatan pembinaan (coaching) tidak boleh kosong' })
  @IsString({ message: 'note harus berupa string teks' })
  @MaxLength(5000, { message: 'note maksimal 5000 karakter' })
  note!: string;

  @IsOptional()
  @IsEnum(ManagerNoteVisibility, {
    message:
      'visibility harus salah satu dari: PrivateToManagement, VisibleToEmployee',
  })
  visibility?: ManagerNoteVisibility;
}
