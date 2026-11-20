import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ActivateDto {
  @IsNotEmpty({ message: 'Token aktivasi wajib disertakan' })
  token!: string;

  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(8, { message: 'Kata sandi minimal terdiri dari 8 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Kata sandi wajib minimal 8 karakter dengan kombinasi huruf dan angka.',
  })
  password!: string;
}

