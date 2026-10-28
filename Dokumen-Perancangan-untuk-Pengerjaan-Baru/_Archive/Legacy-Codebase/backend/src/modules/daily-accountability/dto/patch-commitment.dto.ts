import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CommitmentOutcome, Continuation, DailyStatus } from '@prisma/client';

export class PatchCommitmentDto {
  // --- Kelompok Field Morning (SAD §5.4, §9.8) ---
  @IsOptional()
  @IsString({ message: 'Teks komitmen harus berupa string' })
  text?: string;

  @IsOptional()
  @IsString({ message: 'Tautan referensi harus berupa string' })
  @MaxLength(500, { message: 'Tautan referensi maksimal 500 karakter' })
  referenceLink?: string;

  @IsOptional()
  @IsEnum(DailyStatus, {
    message: 'initialRisk harus berupa GREEN, AMBER, atau RED',
  })
  initialRisk?: DailyStatus;

  @IsOptional()
  @IsString({ message: 'Catatan blocker harus berupa string' })
  knownBlockerNote?: string;

  @IsOptional()
  @IsString({ message: 'Bantuan yang dibutuhkan harus berupa string' })
  supportNeeded?: string;

  // --- Kelompok Field EOD (SAD §5.4, §9.8) ---
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
