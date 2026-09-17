import { IsDateString, IsOptional } from 'class-validator';

export class DailyExceptionQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'date harus berupa format tanggal ISO YYYY-MM-DD yang valid' })
  date?: string;
}
