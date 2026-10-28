import { IsDateString, IsNotEmpty } from 'class-validator';

export class IndividualEvidenceQueryDto {
  @IsNotEmpty({ message: 'startDate wajib diisi' })
  @IsDateString({}, { message: 'startDate harus berupa format tanggal ISO YYYY-MM-DD yang valid' })
  startDate!: string;

  @IsNotEmpty({ message: 'endDate wajib diisi' })
  @IsDateString({}, { message: 'endDate harus berupa format tanggal ISO YYYY-MM-DD yang valid' })
  endDate!: string;
}
