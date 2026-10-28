import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  CorrectionClassification,
  CorrectionStatus,
} from '@prisma/client';

export class QueryCorrectionRequestsDto {
  @IsOptional()
  @IsUUID('4', { message: 'targetCommitmentId harus berupa format UUID v4 yang valid' })
  targetCommitmentId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'requestedByUserId harus berupa format UUID v4 yang valid' })
  requestedByUserId?: string;

  @IsOptional()
  @IsEnum(CorrectionStatus, {
    message: 'status harus salah satu dari: Applied, Pending, Rejected',
  })
  status?: CorrectionStatus;

  @IsOptional()
  @IsEnum(CorrectionClassification, {
    message: 'classification harus salah satu dari: Minor, Material',
  })
  classification?: CorrectionClassification;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa bilangan bulat' })
  @Min(1, { message: 'page minimal bernilai 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit harus berupa bilangan bulat' })
  @Min(1, { message: 'limit minimal bernilai 1' })
  @Max(100, { message: 'limit maksimal bernilai 100' })
  limit: number = 20;
}
