import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsNotEmpty({ message: 'Status pengguna wajib diisi' })
  @IsEnum(UserStatus, { message: 'Nilai status tidak valid' })
  status!: UserStatus;

  @IsOptional()
  @IsString({ message: 'Alasan harus berupa teks' })
  @MaxLength(500, { message: 'Alasan maksimal 500 karakter' })
  reason?: string;
}

export class InvitationActionDto {
  @IsOptional()
  @IsString({ message: 'Catatan alasan harus berupa teks' })
  @MaxLength(500, { message: 'Catatan alasan maksimal 500 karakter' })
  reason?: string;
}

