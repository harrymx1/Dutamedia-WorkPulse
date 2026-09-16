import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSupportContributionDto {
  @IsNotEmpty({ message: 'Tindakan dukungan (action) tidak boleh kosong' })
  @IsString({ message: 'action harus berupa teks' })
  @MinLength(3, { message: 'action minimal 3 karakter' })
  action!: string;

  @IsNotEmpty({ message: 'Catatan hasil dukungan (resultNote) tidak boleh kosong' })
  @IsString({ message: 'resultNote harus berupa teks' })
  @MinLength(3, { message: 'resultNote minimal 3 karakter' })
  resultNote!: string;
}
