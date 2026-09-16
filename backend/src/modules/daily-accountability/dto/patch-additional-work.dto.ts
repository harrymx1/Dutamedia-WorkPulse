import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  AdditionalWorkReason,
  CommitmentOutcome,
  Continuation,
} from '@prisma/client';

export class PatchAdditionalWorkDto {
  @IsOptional()
  @IsString({ message: 'Teks pekerjaan tambahan harus berupa string' })
  text?: string;

  @IsOptional()
  @IsEnum(AdditionalWorkReason, {
    message:
      'reason harus berupa NewlyAssigned, MissedInPlanning, PriorityChange, OperationalIncident, atau Other',
  })
  reason?: AdditionalWorkReason;

  @IsOptional()
  @IsUUID('all', { message: 'assignedByUserId harus berupa UUID yang valid' })
  assignedByUserId?: string;

  @IsOptional()
  @IsEnum(CommitmentOutcome, {
    message:
      'outcome harus berupa Completed, PartiallyCompleted, NotCompleted, atau Cancelled',
  })
  outcome?: CommitmentOutcome;

  @IsOptional()
  @IsString({ message: 'outcomeReason harus berupa string' })
  outcomeReason?: string;

  @IsOptional()
  @IsEnum(Continuation, {
    message: 'continuation harus berupa Continue atau DoNotContinue',
  })
  continuation?: Continuation;

  @IsOptional()
  @IsString({ message: 'continuationReason harus berupa string' })
  continuationReason?: string;
}
