import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ObjectCorrectionRequestDto {
  @IsNotEmpty({ message: 'objectionReason wajib diisi saat mengajukan keberatan' })
  @IsString({ message: 'objectionReason harus berupa string teks' })
  @MaxLength(2000, { message: 'objectionReason maksimal 2000 karakter' })
  objectionReason!: string;
}
