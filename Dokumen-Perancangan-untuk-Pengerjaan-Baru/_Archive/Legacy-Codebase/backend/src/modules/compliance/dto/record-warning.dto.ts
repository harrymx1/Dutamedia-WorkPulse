import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RecordWarningDto {
  @IsNotEmpty({ message: 'note catatan peringatan (warning) tidak boleh kosong' })
  @IsString({ message: 'note harus berupa string teks' })
  @MaxLength(5000, { message: 'note maksimal 5000 karakter' })
  note!: string;
}
