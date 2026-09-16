import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RecordAuditLogDto {
  @IsOptional()
  @IsUUID('4', { message: 'actorUserId harus berupa UUID' })
  actorUserId?: string | null;

  @IsNotEmpty({ message: 'action tidak boleh kosong' })
  @IsString({ message: 'action harus berupa string' })
  action!: string;

  @IsNotEmpty({ message: 'relatedEntityType tidak boleh kosong' })
  @IsString({ message: 'relatedEntityType harus berupa string' })
  relatedEntityType!: string;

  @IsNotEmpty({ message: 'relatedEntityId tidak boleh kosong' })
  @IsUUID('4', { message: 'relatedEntityId harus berupa UUID' })
  relatedEntityId!: string;

  @IsOptional()
  valueBefore?: any;

  @IsOptional()
  valueAfter?: any;

  @IsOptional()
  timestamp?: Date;
}
