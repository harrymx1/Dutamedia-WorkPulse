import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ManagerNoteType, ManagerNoteVisibility } from '@prisma/client';

export class QueryManagerNotesDto {
  @IsOptional()
  @IsUUID('4', { message: 'aboutUserId harus berupa format UUID v4 yang valid' })
  aboutUserId?: string;

  @IsOptional()
  @IsEnum(ManagerNoteType, {
    message: 'type harus salah satu dari: Coaching, Recognition, Corrective',
  })
  type?: ManagerNoteType;

  @IsOptional()
  @IsEnum(ManagerNoteVisibility, {
    message:
      'visibility harus salah satu dari: PrivateToManagement, VisibleToEmployee',
  })
  visibility?: ManagerNoteVisibility;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa bilangan bulat' })
  @Min(1, { message: 'page minimal bernilai 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit harus berupa bilangan bulat' })
  @Min(1, { message: 'limit minimal bernilai 1' })
  @Max(100, { message: 'limit maksimal bernilai 100' })
  limit: number = 20;
}
