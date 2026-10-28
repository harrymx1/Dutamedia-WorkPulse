import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CommitmentOutcome, Continuation, DailyStatus } from '@prisma/client';

export class CommitmentOutcomeItemDto {
  @IsNotEmpty({ message: 'commitmentId wajib diisi' })
  @IsUUID('all', { message: 'commitmentId harus berupa UUID yang valid' })
  commitmentId!: string;

  @IsNotEmpty({ message: 'outcome komitmen wajib ditentukan' })
  @IsEnum(CommitmentOutcome, {
    message:
      'outcome harus berupa Completed, PartiallyCompleted, NotCompleted, atau Cancelled',
  })
  outcome!: CommitmentOutcome;

  @IsOptional()
  @IsString({ message: 'outcomeReason harus berupa string' })
  outcomeReason?: string;

  @IsNotEmpty({ message: 'continuation komitmen wajib ditentukan' })
  @IsEnum(Continuation, {
    message: 'continuation harus berupa Continue atau DoNotContinue',
  })
  continuation!: Continuation;

  @IsOptional()
  @IsString({ message: 'continuationReason harus berupa string' })
  continuationReason?: string;
}

export class AdditionalWorkOutcomeItemDto {
  @IsNotEmpty({ message: 'additionalWorkId wajib diisi' })
  @IsUUID('all', { message: 'additionalWorkId harus berupa UUID yang valid' })
  additionalWorkId!: string;

  @IsNotEmpty({ message: 'outcome pekerjaan tambahan wajib ditentukan' })
  @IsEnum(CommitmentOutcome, {
    message:
      'outcome harus berupa Completed, PartiallyCompleted, NotCompleted, atau Cancelled',
  })
  outcome!: CommitmentOutcome;

  @IsOptional()
  @IsString({ message: 'outcomeReason harus berupa string' })
  outcomeReason?: string;

  @IsNotEmpty({ message: 'continuation pekerjaan tambahan wajib ditentukan' })
  @IsEnum(Continuation, {
    message: 'continuation harus berupa Continue atau DoNotContinue',
  })
  continuation!: Continuation;

  @IsOptional()
  @IsString({ message: 'continuationReason harus berupa string' })
  continuationReason?: string;
}

export class EodCheckinDto {
  @IsArray({ message: 'commitmentOutcomes harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => CommitmentOutcomeItemDto)
  commitmentOutcomes!: CommitmentOutcomeItemDto[];

  @IsOptional()
  @IsArray({ message: 'additionalWorkOutcomes harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => AdditionalWorkOutcomeItemDto)
  additionalWorkOutcomes?: AdditionalWorkOutcomeItemDto[];

  @IsNotEmpty({ message: 'finalStatus wajib ditentukan' })
  @IsEnum(DailyStatus, {
    message: 'finalStatus harus berupa GREEN, AMBER, atau RED',
  })
  finalStatus!: DailyStatus;
}
