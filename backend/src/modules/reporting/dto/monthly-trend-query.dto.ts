import { IsNotEmpty, Matches } from 'class-validator';

export class MonthlyTrendQueryDto {
  @IsNotEmpty({ message: 'month wajib diisi (SAD §13.4)' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month harus berupa format tahun-bulan YYYY-MM yang valid (contoh: 2026-09)',
  })
  month!: string;
}
