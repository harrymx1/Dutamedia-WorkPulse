import { IsNotEmpty, MinLength } from 'class-validator';

export class ActivateDto {
  @IsNotEmpty({ message: 'Token aktivasi wajib disertakan' })
  token!: string;

  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(8, { message: 'Kata sandi minimal terdiri dari 8 karakter' })
  password!: string;
}

