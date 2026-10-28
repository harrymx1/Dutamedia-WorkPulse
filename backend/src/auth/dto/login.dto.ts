import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format alamat email tidak valid' })
  @IsNotEmpty({ message: 'Alamat email wajib diisi' })
  email!: string;

  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(8, { message: 'Kata sandi minimal terdiri dari 8 karakter' })
  password!: string;
}

