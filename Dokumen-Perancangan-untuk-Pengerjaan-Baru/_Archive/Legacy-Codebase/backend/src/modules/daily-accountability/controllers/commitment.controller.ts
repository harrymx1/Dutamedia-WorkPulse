import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { DailyAccountabilityService } from '../services/daily-accountability.service.js';
import { PatchCommitmentDto } from '../dto/patch-commitment.dto.js';
import { RequireRole } from '../../authorization/decorators/require-role.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { RoleGuard } from '../../authorization/guards/role.guard.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('DailyAccountability')
@Controller('commitments')
export class CommitmentController {
  constructor(
    private readonly dailyAccountabilityService: DailyAccountabilityService,
  ) {}

  /**
   * PATCH /api/v1/commitments/:id (SAD §10.3, EPIC-07-T5)
   * Role: Employee (pemilik)
   * Ditolak jika field yang diubah sudah berstatus locked (SAD §9.8).
   */
  @Patch(':id')
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  @HttpCode(HttpStatus.OK)
  async patchCommitment(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: PatchCommitmentDto,
  ) {
    return this.dailyAccountabilityService.patchCommitment(userId, id, dto);
  }
}
