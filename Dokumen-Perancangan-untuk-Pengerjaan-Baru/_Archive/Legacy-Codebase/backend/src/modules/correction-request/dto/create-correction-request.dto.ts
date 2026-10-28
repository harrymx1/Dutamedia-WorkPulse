import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCorrectionRequestDto {
  @IsNotEmpty({ message: 'targetCommitmentId wajib diisi' })
  @IsUUID('4', { message: 'targetCommitmentId harus berupa format UUID v4 yang valid' })
  targetCommitmentId!: string;

  @IsNotEmpty({ message: 'requestedChange wajib diisi' })
  @IsObject({ message: 'requestedChange harus berupa objek JSON perubahan' })
  requestedChange!: Record<string, any>;

  @IsNotEmpty({ message: 'reason pengajuan koreksi wajib diisi' })
  @IsString({ message: 'reason harus berupa string teks' })
  @MaxLength(2000, { message: 'reason maksimal 2000 karakter' })
  reason!: string;
}
