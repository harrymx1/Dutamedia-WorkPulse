import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExportReportQueryDto {
  @IsNotEmpty({ message: 'format wajib diisi (SAD §10.11)' })
  @IsIn(['pdf', 'xlsx'], { message: 'format harus bernilai pdf atau xlsx (SAD §13.5)' })
  format!: 'pdf' | 'xlsx';

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  weekStart?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
