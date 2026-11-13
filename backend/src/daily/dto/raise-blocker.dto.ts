import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import {
  BlockerType,
  BlockerSeverity,
  BlockerImpact,
  AuthorityContext,
} from '@prisma/client';

export class RaiseBlockerDto {
  @IsEnum(BlockerType, { message: 'Jenis kendala tidak valid' })
  type!: BlockerType;

  @IsEnum(BlockerSeverity, { message: 'Tingkat keparahan kendala tidak valid' })
  severity!: BlockerSeverity;

  @IsEnum(BlockerImpact, { message: 'Dampak kendala tidak valid' })
  impact!: BlockerImpact;

  @IsString({ message: 'Deskripsi kendala wajib diisi' })
  @MinLength(10, { message: 'Deskripsi kendala minimal 10 karakter' })
  description!: string;

  @IsEnum(AuthorityContext, { message: 'Konteks kewenangan pemilik tidak valid' })
  ownerNeededType!: AuthorityContext;

  @IsOptional()
  @IsUUID('4', { message: 'ID pemilik eskalasi tidak valid' })
  assignedOwnerId?: string;

  @IsOptional()
  @IsString()
  projectCodeReference?: string;

  @IsOptional()
  @IsUUID('4')
  linkedCommitmentId?: string;
}

export class AcknowledgeBlockerDto {
  @IsOptional()
  @IsString()
  acknowledgementNote?: string;
}

export class ResolveBlockerDto {
  @IsString({ message: 'Catatan resolusi wajib diisi' })
  @MinLength(10, { message: 'Catatan resolusi minimal 10 karakter' })
  resolutionNote!: string;
}

export class AcceptRiskBlockerDto {
  @IsString({ message: 'Justifikasi penerimaan risiko wajib diisi' })
  @MinLength(10, { message: 'Justifikasi penerimaan risiko minimal 10 karakter' })
  riskAcceptanceJustification!: string;

  @IsString({ message: 'Rencana mitigasi risiko wajib diisi' })
  @MinLength(10, { message: 'Rencana mitigasi risiko minimal 10 karakter' })
  riskMitigationPlan!: string;
}

export class ReopenBlockerDto {
  @IsString({ message: 'Alasan pembukaan kembali wajib diisi' })
  @MinLength(10, { message: 'Alasan pembukaan kembali minimal 10 karakter' })
  reopenReason!: string;
}

