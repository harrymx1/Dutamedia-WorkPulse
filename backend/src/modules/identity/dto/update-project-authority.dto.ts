import { IsNotEmpty, Matches } from 'class-validator';

export class UpdateProjectAuthorityDto {
  @IsNotEmpty({ message: 'endDate wajib diisi untuk mengakhiri kewenangan proyek' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate harus dalam format YYYY-MM-DD',
  })
  endDate!: string;
}
