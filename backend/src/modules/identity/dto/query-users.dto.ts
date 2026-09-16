import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto.js';

export class QueryUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserStatus, { message: 'status filter harus bernilai Active atau Inactive' })
  status?: UserStatus;

  @IsOptional()
  @IsEnum(Role, { message: 'role filter harus merupakan Role yang valid' })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'function filter harus berupa string' })
  function?: string;
}
