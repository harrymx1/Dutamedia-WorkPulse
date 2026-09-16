import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResolveBlockerDto {
  @IsNotEmpty({ message: 'Catatan resolusi/mitigasi (resolutionNote) wajib diisi' })
  @IsString({ message: 'resolutionNote harus berupa teks' })
  @MinLength(5, {
    message: 'resolutionNote minimal 5 karakter untuk memberikan konteks resolusi/mitigasi',
  })
  resolutionNote!: string;
}
