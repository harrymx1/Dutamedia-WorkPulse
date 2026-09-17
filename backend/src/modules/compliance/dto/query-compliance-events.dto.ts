import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ComplianceEventType } from '@prisma/client';

export class QueryComplianceEventsDto {
  @IsOptional()
  @IsUUID('4', { message: 'userId harus berupa format UUID v4 yang valid' })
  userId?: string;

  @IsOptional()
  @IsEnum(ComplianceEventType, {
    message:
      'eventType harus salah satu dari: NoSubmission, PatternFlag, Coaching, RecordedWarning, EscalatedFormalProcess',
  })
  eventType?: ComplianceEventType;

  @IsOptional()
  @IsISO8601(
    { strict: false },
    { message: 'startDate harus berformat ISO 8601 (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsISO8601(
    { strict: false },
    { message: 'endDate harus berformat ISO 8601 (YYYY-MM-DD)' },
  )
  endDate?: string;

  @IsOptional()
  @IsString({ message: 'followUpStatus harus berupa string' })
  followUpStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa bilangan bulat' })
  @Min(1, { message: 'page minimal bernilai 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit harus berupa bilangan bulat' })
  @Min(1, { message: 'limit minimal bernilai 1' })
  @Max(100, { message: 'limit maksimal bernilai 100' })
  limit?: number = 20;
}
