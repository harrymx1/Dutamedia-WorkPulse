import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { DailyAccountabilityService } from '../services/daily-accountability.service.js';
import { CreateAdditionalWorkDto } from '../dto/create-additional-work.dto.js';
import { PatchAdditionalWorkDto } from '../dto/patch-additional-work.dto.js';
import { RequireRole } from '../../authorization/decorators/require-role.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { RoleGuard } from '../../authorization/guards/role.guard.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('DailyAccountability')
@Controller('additional-work')
export class AdditionalWorkController {
  constructor(
    private readonly dailyAccountabilityService: DailyAccountabilityService,
  ) {}

  /**
   * POST /api/v1/additional-work (SAD §10.3, EPIC-07-T6, PRD FR-06)
   * Role: Employee (pemilik)
   * Mengikuti ADR-001: Tidak memblokir write, selalu tercatat AuditLog.
   */
  @Post()
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  @HttpCode(HttpStatus.CREATED)
  async createAdditionalWork(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAdditionalWorkDto,
  ) {
    return this.dailyAccountabilityService.createAdditionalWork(userId, dto);
  }

  /**
   * PATCH /api/v1/additional-work/:id (SAD §10.3, EPIC-07-T6)
   * Role: Employee (pemilik)
   * Mengikuti ADR-001: Tidak ada lock permanen pemblokir write.
   */
  @Patch(':id')
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  @HttpCode(HttpStatus.OK)
  async patchAdditionalWork(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: PatchAdditionalWorkDto,
  ) {
    return this.dailyAccountabilityService.patchAdditionalWork(userId, id, dto);
  }
}
