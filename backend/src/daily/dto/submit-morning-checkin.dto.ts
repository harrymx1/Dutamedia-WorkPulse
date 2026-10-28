import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommitmentRisk } from '@prisma/client';

export class CommitmentItemDto {
  @IsString()
  @MinLength(3, { message: 'Teks komitmen minimal 3 karakter' })
  taskText!: string;

  @IsOptional()
  @IsString()
  referenceLink?: string;

  @IsEnum(CommitmentRisk, { message: 'Tingkat risiko awal komitmen harus GREEN, AMBER, atau RED' })
  initialRisk!: CommitmentRisk;

  @IsOptional()
  @IsString()
  knownBlockerNote?: string;

  @IsOptional()
  @IsString()
  supportNeeded?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID komitmen asal tidak valid' })
  originCommitmentId?: string;
}

export class SubmitMorningCheckinDto {
  @IsISO8601({}, { message: 'Tanggal kerja harus berformat YYYY-MM-DD' })
  workDate!: string;

  @IsArray({ message: 'Komitmen harus berupa daftar (array)' })
  @ValidateNested({ each: true })
  @Type(() => CommitmentItemDto)
  commitments!: CommitmentItemDto[];

  @IsOptional()
  @IsString()
  zeroCommitmentReason?: string;
}
