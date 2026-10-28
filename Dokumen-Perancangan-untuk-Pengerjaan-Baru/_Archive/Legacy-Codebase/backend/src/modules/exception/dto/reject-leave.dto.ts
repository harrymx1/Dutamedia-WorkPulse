import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectLeaveDto {
  @IsNotEmpty({ message: 'Alasan penolakan cuti (rejectionReason) wajib diisi' })
  @IsString({ message: 'Alasan penolakan cuti harus berupa teks' })
  @MinLength(3, { message: 'Alasan penolakan cuti minimal 3 karakter' })
  @MaxLength(500, { message: 'Alasan penolakan cuti maksimal 500 karakter' })
  rejectionReason!: string;
}
