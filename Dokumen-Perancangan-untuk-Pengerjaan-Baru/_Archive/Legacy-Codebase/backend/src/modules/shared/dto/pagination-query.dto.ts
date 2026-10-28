import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa bilangan bulat' })
  @Min(1, { message: 'page minimal bernilai 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize harus berupa bilangan bulat' })
  @Min(1, { message: 'pageSize minimal bernilai 1' })
  @Max(100, { message: 'pageSize maksimal bernilai 100' })
  pageSize: number = 20;

  @IsOptional()
  @IsString({ message: 'sortBy harus berupa string' })
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder harus bernilai asc atau desc' })
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString({ message: 'search harus berupa string' })
  search?: string;
}
