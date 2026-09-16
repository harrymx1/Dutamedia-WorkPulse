import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DailyStatus } from '@prisma/client';
import {
  AdditionalWorkOutcomeItemDto,
  CommitmentOutcomeItemDto,
} from './eod-checkin.dto.js';

export class ConfirmOverrideDto {
  @IsNotEmpty({ message: 'finalStatus wajib ditentukan' })
  @IsEnum(DailyStatus, {
    message: 'finalStatus harus berupa GREEN, AMBER, atau RED',
  })
  finalStatus!: DailyStatus;

  @IsNotEmpty({ message: 'Alasan penolakan saran status (overrideReason) wajib diisi' })
  @IsString({ message: 'overrideReason harus berupa teks' })
  @MinLength(5, {
    message: 'overrideReason minimal 5 karakter untuk memberikan konteks memadai',
  })
  overrideReason!: string;

  @IsOptional()
  @IsArray({ message: 'commitmentOutcomes harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => CommitmentOutcomeItemDto)
  commitmentOutcomes?: CommitmentOutcomeItemDto[];

  @IsOptional()
  @IsArray({ message: 'additionalWorkOutcomes harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => AdditionalWorkOutcomeItemDto)
  additionalWorkOutcomes?: AdditionalWorkOutcomeItemDto[];
}
