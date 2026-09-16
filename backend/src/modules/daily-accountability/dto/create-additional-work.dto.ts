import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AdditionalWorkReason } from '@prisma/client';

export class CreateAdditionalWorkDto {
  @IsNotEmpty({ message: 'dailyRecordId wajib diisi' })
  @IsUUID('all', { message: 'dailyRecordId harus berupa UUID yang valid' })
  dailyRecordId!: string;

  @IsNotEmpty({ message: 'Teks pekerjaan tambahan tidak boleh kosong' })
  @IsString({ message: 'Teks pekerjaan tambahan harus berupa string' })
  text!: string;

  @IsNotEmpty({ message: 'Alasan (reason) pekerjaan tambahan wajib ditentukan' })
  @IsEnum(AdditionalWorkReason, {
    message:
      'reason harus berupa NewlyAssigned, MissedInPlanning, PriorityChange, OperationalIncident, atau Other',
  })
  reason!: AdditionalWorkReason;

  @IsOptional()
  @IsUUID('all', { message: 'assignedByUserId harus berupa UUID yang valid' })
  assignedByUserId?: string;
}
