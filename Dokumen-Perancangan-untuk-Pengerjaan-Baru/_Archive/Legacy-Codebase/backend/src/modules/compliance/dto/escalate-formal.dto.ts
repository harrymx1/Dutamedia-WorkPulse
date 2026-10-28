import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EscalateFormalDto {
  @IsNotEmpty({
    message: 'note catatan eskalasi proses formal tidak boleh kosong',
  })
  @IsString({ message: 'note harus berupa string teks' })
  @MaxLength(5000, { message: 'note maksimal 5000 karakter' })
  note!: string;
}
