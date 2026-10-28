import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateBlockerProgressDto {
  @IsNotEmpty({ message: 'Catatan progres (progressNote) tidak boleh kosong' })
  @IsString({ message: 'progressNote harus berupa teks' })
  @MinLength(3, { message: 'progressNote minimal 3 karakter' })
  progressNote!: string;
}
