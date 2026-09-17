import { IsDateString, IsNotEmpty } from 'class-validator';

export class WeeklyTeamSummaryQueryDto {
  @IsNotEmpty({ message: 'weekStart wajib diisi (SAD §13.4)' })
  @IsDateString({}, { message: 'weekStart harus berupa format tanggal ISO YYYY-MM-DD yang valid' })
  weekStart!: string;
}
