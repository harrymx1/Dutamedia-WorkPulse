import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { DailyStatus } from '@prisma/client';

export class CreateCommitmentItemDto {
  @IsInt({ message: 'sequenceNo harus berupa integer 1-3' })
  @Min(1, { message: 'sequenceNo minimal bernilai 1' })
  @Max(3, { message: 'sequenceNo maksimal bernilai 3' })
  sequenceNo!: number;

  @IsNotEmpty({ message: 'Teks komitmen tidak boleh kosong' })
  @IsString({ message: 'Teks komitmen harus berupa string' })
  text!: string;

  @IsOptional()
  @IsString({ message: 'Tautan referensi harus berupa string' })
  @MaxLength(500, { message: 'Tautan referensi maksimal 500 karakter' })
  referenceLink?: string;

  @IsNotEmpty({ message: 'initialRisk wajib ditentukan' })
  @IsEnum(DailyStatus, {
    message: 'initialRisk harus berupa GREEN, AMBER, atau RED',
  })
  initialRisk!: DailyStatus;

  @IsOptional()
  @IsString({ message: 'Catatan blocker harus berupa string' })
  knownBlockerNote?: string;

  @IsOptional()
  @IsString({ message: 'Bantuan yang dibutuhkan harus berupa string' })
  supportNeeded?: string;
}

export class MorningCheckinDto {
  @IsArray({ message: 'commitments harus berupa array' })
  @ArrayMinSize(1, { message: 'Minimal 1 komitmen wajib diisi' })
  @ArrayMaxSize(3, { message: 'Maksimal 3 komitmen per hari (BR-01)' })
  @ValidateNested({ each: true })
  @Type(() => CreateCommitmentItemDto)
  commitments!: CreateCommitmentItemDto[];
}
