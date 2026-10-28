import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateTempReviewerDto {
  @IsNotEmpty({ message: 'reviewerUserId wajib diisi' })
  @IsUUID('4', { message: 'reviewerUserId harus berupa UUID yang valid' })
  reviewerUserId!: string;

  @IsNotEmpty({ message: 'scope wajib diisi' })
  @IsString({ message: 'scope harus berupa string' })
  scope!: string;

  @IsNotEmpty({ message: 'Alasan penugasan (reason) wajib diisi' })
  @IsString({ message: 'Alasan harus berupa string' })
  reason!: string;

  @IsNotEmpty({ message: 'Tanggal efektif (effectiveDate) wajib diisi' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'effectiveDate harus dalam format YYYY-MM-DD',
  })
  effectiveDate!: string;

  @IsNotEmpty({ message: 'Tanggal kadaluarsa (expiryDate) wajib diisi (BR-11)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'expiryDate harus dalam format YYYY-MM-DD',
  })
  expiryDate!: string;
}
