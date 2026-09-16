import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BlockerSeverity, BlockerStatus, OwnerNeededType } from '@prisma/client';

export class QueryBlockersDto {
  @IsOptional()
  @IsEnum(BlockerStatus, {
    message:
      'status harus berupa Open, Acknowledged, InProgress, Resolved, Closed, atau AcceptedRisk',
  })
  status?: BlockerStatus;

  @IsOptional()
  @IsEnum(BlockerSeverity, {
    message: 'severity harus berupa Low, Medium, High, atau Critical',
  })
  severity?: BlockerSeverity;

  @IsOptional()
  @IsEnum(OwnerNeededType, {
    message:
      'ownerNeededType harus berupa OrganizationalAuthority atau ProjectAuthority',
  })
  ownerNeededType?: OwnerNeededType;

  @IsOptional()
  @IsUUID('all', { message: 'raisedByUserId harus berupa UUID yang valid' })
  raisedByUserId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'ownerNeededUserId harus berupa UUID yang valid' })
  ownerNeededUserId?: string;

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
