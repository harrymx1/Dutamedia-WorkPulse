import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DailyStatus } from '@prisma/client';

export class QueryDailyRecordsDto {
  @IsOptional()
  @IsDateString({}, { message: 'startDate harus berformat ISO Date (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate harus berformat ISO Date (YYYY-MM-DD)' })
  endDate?: string;

  @IsOptional()
  @IsUUID('all', { message: 'employeeUserId harus berupa UUID yang valid' })
  employeeUserId?: string;

  @IsOptional()
  @IsEnum(DailyStatus, {
    message: 'initialStatus harus berupa GREEN, AMBER, atau RED',
  })
  initialStatus?: DailyStatus;

  @IsOptional()
  @IsEnum(DailyStatus, {
    message: 'finalStatus harus berupa GREEN, AMBER, atau RED',
  })
  finalStatus?: DailyStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa integer' })
  @Min(1, { message: 'page minimal bernilai 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit harus berupa integer' })
  @Min(1, { message: 'limit minimal bernilai 1' })
  @Max(100, { message: 'limit maksimal bernilai 100' })
  limit: number = 20;
}
