import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum FilePurpose {
  EVIDENCE = 'evidence',
  MANAGER_NOTE_EVIDENCE = 'manager-note-evidence',
  EXPORTS = 'exports',
}

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (SAD §14.5)

export class GenerateUploadUrlDto {
  @IsNotEmpty({ message: 'purpose wajib diisi' })
  @IsIn(Object.values(FilePurpose), {
    message: 'purpose harus salah satu dari: evidence, manager-note-evidence, exports',
  })
  purpose!: FilePurpose;

  @IsNotEmpty({ message: 'contentType wajib diisi' })
  @IsIn(ALLOWED_MIME_TYPES, {
    message: 'contentType hanya diizinkan: image/png, image/jpeg, application/pdf',
  })
  contentType!: AllowedMimeType;

  @IsNotEmpty({ message: 'fileSize wajib diisi' })
  @IsInt({ message: 'fileSize harus berupa angka integer dalam byte' })
  @Min(1, { message: 'fileSize minimal 1 byte' })
  @Max(MAX_FILE_SIZE_BYTES, {
    message: 'fileSize melebihi batas maksimum 10 MB (10485760 bytes)',
  })
  fileSize!: number;

  @IsOptional()
  @IsString({ message: 'entityType harus berupa string' })
  @MaxLength(100, { message: 'entityType maksimal 100 karakter' })
  entityType?: string;

  @IsOptional()
  @IsUUID('4', { message: 'entityId harus berupa format UUID v4 yang valid' })
  entityId?: string;

  @IsOptional()
  @IsString({ message: 'originalFileName harus berupa string' })
  @MaxLength(255, { message: 'originalFileName maksimal 255 karakter' })
  originalFileName?: string;
}
