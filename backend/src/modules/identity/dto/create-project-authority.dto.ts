import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateProjectAuthorityDto {
  @IsNotEmpty({ message: 'userId wajib diisi' })
  @IsUUID('4', { message: 'userId harus berupa UUID yang valid' })
  userId!: string;

  @IsNotEmpty({ message: 'scopeReference wajib diisi' })
  @IsString({ message: 'scopeReference harus berupa string' })
  scopeReference!: string;

  @IsNotEmpty({ message: 'effectiveDate wajib diisi' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'effectiveDate harus dalam format YYYY-MM-DD',
  })
  effectiveDate!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate harus dalam format YYYY-MM-DD',
  })
  endDate?: string;
}
