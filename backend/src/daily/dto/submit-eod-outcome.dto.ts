import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CommitmentOutcome,
  ContinuationStatus,
  DailyRiskStatus,
  BlockerType,
  BlockerSeverity,
  BlockerImpact,
  AuthorityContext,
} from '@prisma/client';

export class CommitmentOutcomeItemDto {
  @IsUUID('4', { message: 'ID komitmen tidak valid' })
  commitmentId!: string;

  @IsEnum(CommitmentOutcome, { message: 'Hasil komitmen tidak valid' })
  outcome!: CommitmentOutcome;

  @IsOptional()
  @IsString()
  outcomeReason?: string;

  @IsOptional()
  @IsEnum(ContinuationStatus)
  continuation?: ContinuationStatus;

  @IsOptional()
  @IsString()
  continuationReason?: string;
}

export class AdditionalWorkOutcomeItemDto {
  @IsUUID('4', { message: 'ID pekerjaan tambahan tidak valid' })
  additionalWorkId!: string;

  @IsEnum(CommitmentOutcome, { message: 'Hasil pekerjaan tambahan tidak valid' })
  outcome!: CommitmentOutcome;

  @IsOptional()
  @IsString()
  outcomeReason?: string;

  @IsOptional()
  @IsEnum(ContinuationStatus)
  continuation?: ContinuationStatus;

  @IsOptional()
  @IsString()
  continuationReason?: string;
}

export class InstantBlockerDto {
  @IsEnum(BlockerType)
  type!: BlockerType;

  @IsEnum(BlockerSeverity)
  severity!: BlockerSeverity;

  @IsEnum(BlockerImpact)
  impact!: BlockerImpact;

  @IsString()
  description!: string;

  @IsEnum(AuthorityContext)
  ownerNeededType!: AuthorityContext;

  @IsUUID('4')
  assignedOwnerId!: string;

  @IsOptional()
  @IsString()
  projectCodeReference?: string;
}

export class SubmitEodOutcomeDto {
  @IsISO8601({}, { message: 'Tanggal kerja harus berformat YYYY-MM-DD' })
  workDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommitmentOutcomeItemDto)
  commitmentOutcomes!: CommitmentOutcomeItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalWorkOutcomeItemDto)
  additionalWorkOutcomes?: AdditionalWorkOutcomeItemDto[];

  @IsEnum(DailyRiskStatus, { message: 'Status refleksi mandiri harian tidak valid' })
  finalDailyStatus!: DailyRiskStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstantBlockerDto)
  instantBlocker?: InstantBlockerDto;
}
