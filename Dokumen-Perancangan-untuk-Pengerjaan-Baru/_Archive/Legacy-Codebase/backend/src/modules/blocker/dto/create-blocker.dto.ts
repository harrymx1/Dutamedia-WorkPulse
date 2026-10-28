import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BlockerSeverity, OwnerNeededType } from '@prisma/client';

export class CreateBlockerDto {
  @IsOptional()
  @IsUUID('all', { message: 'linkedCommitmentId harus berupa UUID yang valid' })
  linkedCommitmentId?: string;

  @IsNotEmpty({ message: 'Tipe blocker tidak boleh kosong' })
  @IsString({ message: 'Tipe blocker harus berupa string' })
  @MaxLength(100, { message: 'Tipe blocker maksimal 100 karakter' })
  type!: string;

  @IsNotEmpty({ message: 'Tingkat keparahan (severity) blocker wajib ditentukan' })
  @IsEnum(BlockerSeverity, {
    message: 'severity harus berupa Low, Medium, High, atau Critical',
  })
  severity!: BlockerSeverity;

  @IsNotEmpty({ message: 'Dampak (impact) blocker tidak boleh kosong' })
  @IsString({ message: 'Dampak blocker harus berupa string' })
  @MinLength(5, { message: 'Dampak blocker minimal 5 karakter' })
  impact!: string;

  @IsNotEmpty({ message: 'ownerNeededType wajib ditentukan' })
  @IsEnum(OwnerNeededType, {
    message:
      'ownerNeededType harus berupa OrganizationalAuthority atau ProjectAuthority',
  })
  ownerNeededType!: OwnerNeededType;

  @IsOptional()
  @IsString({ message: 'relatedScopeReference harus berupa string' })
  @MaxLength(255, { message: 'relatedScopeReference maksimal 255 karakter' })
  relatedScopeReference?: string;

  @IsOptional()
  @IsDateString({}, { message: 'expectedResolution harus berupa ISO Date (YYYY-MM-DD)' })
  expectedResolution?: string;
}
