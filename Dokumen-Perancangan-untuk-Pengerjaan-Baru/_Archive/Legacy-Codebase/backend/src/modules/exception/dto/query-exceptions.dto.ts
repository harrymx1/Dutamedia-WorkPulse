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
import { ExceptionStatus, ExceptionType } from '@prisma/client';

export class QueryExceptionsDto {
  @IsOptional()
  @IsEnum(ExceptionType, {
    message: 'type harus berupa Leave, Holiday, atau Exemption',
  })
  type?: ExceptionType;

  @IsOptional()
  @IsEnum(ExceptionStatus, {
    message: 'status harus berupa Pending, Approved, atau Rejected',
  })
  status?: ExceptionStatus;

  @IsOptional()
  @IsUUID('all', { message: 'employeeUserId harus berupa UUID yang valid' })
  employeeUserId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateStart harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateStart?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateEnd harus berupa format tanggal ISO yang valid (YYYY-MM-DD)' })
  dateEnd?: string;

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
