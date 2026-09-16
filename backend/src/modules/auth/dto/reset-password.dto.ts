import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(8, { message: 'Password baru minimal 8 karakter' })
  newPassword!: string;
}
