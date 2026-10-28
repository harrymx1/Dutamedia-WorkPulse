import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class QueryDownloadUrlDto {
  @IsOptional()
  @IsString({ message: 'purpose harus berupa string' })
  purpose?: string;

  @IsOptional()
  @IsString({ message: 'entityType harus berupa string' })
  @MaxLength(100, { message: 'entityType maksimal 100 karakter' })
  entityType?: string;

  @IsOptional()
  @IsUUID('4', { message: 'entityId harus berupa format UUID v4 yang valid' })
  entityId?: string;

  @IsOptional()
  @IsString({ message: 'storagePath harus berupa string' })
  @MaxLength(500, { message: 'storagePath maksimal 500 karakter' })
  storagePath?: string;
}
