import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Kata sandi saat ini wajib diisi' })
  currentPassword!: string;

  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(8, { message: 'Kata sandi baru minimal terdiri dari 8 karakter' })
  newPassword!: string;
}

