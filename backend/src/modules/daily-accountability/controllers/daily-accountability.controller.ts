import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { DailyAccountabilityService } from '../services/daily-accountability.service.js';
import { MorningCheckinDto } from '../dto/morning-checkin.dto.js';
import { EodCheckinDto } from '../dto/eod-checkin.dto.js';
import { ConfirmOverrideDto } from '../dto/confirm-override.dto.js';
import { QueryDailyRecordsDto } from '../dto/query-daily-records.dto.js';
import { RequireRole } from '../../authorization/decorators/require-role.decorator.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';
import { RoleGuard } from '../../authorization/guards/role.guard.js';

@Controller('daily-accountability-records')
export class DailyAccountabilityController {
  constructor(
    private readonly dailyAccountabilityService: DailyAccountabilityService,
  ) {}

  /**
   * POST /api/v1/daily-accountability-records/morning-checkin (SAD §10.3, EPIC-07-T1)
   * Role: Employee
   */
  @Post('morning-checkin')
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  @HttpCode(HttpStatus.CREATED)
  async submitMorningCheckin(
    @CurrentUser('userId') userId: string,
    @Body() dto: MorningCheckinDto,
  ) {
    return this.dailyAccountabilityService.submitMorningCheckin(userId, dto);
  }

  /**
   * GET /api/v1/daily-accountability-records/today (SAD §10.3, EPIC-07-T2)
   * Role: Employee (pemilik)
   */
  @Get('today')
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  async getTodayRecord(@CurrentUser('userId') userId: string) {
    return this.dailyAccountabilityService.getTodayRecord(userId);
  }

  /**
   * POST /api/v1/daily-accountability-records/:id/eod-checkin (SAD §10.3, EPIC-07-T3)
   * Role: Employee (pemilik)
   */
  @Post(':id/eod-checkin')
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  @HttpCode(HttpStatus.OK)
  async submitEodCheckin(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: EodCheckinDto,
  ) {
    return this.dailyAccountabilityService.submitEodCheckin(userId, id, dto);
  }

  /**
   * POST /api/v1/daily-accountability-records/:id/eod-checkin/confirm-override (SAD §10.3, EPIC-07-T4)
   * Role: Employee (pemilik)
   */
  @Post(':id/eod-checkin/confirm-override')
  @UseGuards(RoleGuard)
  @RequireRole(Role.Employee)
  @HttpCode(HttpStatus.OK)
  async confirmOverride(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ConfirmOverrideDto,
  ) {
    return this.dailyAccountabilityService.confirmOverride(userId, id, dto);
  }

  /**
   * GET /api/v1/daily-accountability-records (SAD §10.3, EPIC-07-T7)
   * Sesuai Scope: My History, Team/Function/Management Pulse
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryDailyRecordsDto,
  ) {
    return this.dailyAccountabilityService.findAll(user, query);
  }

  /**
   * GET /api/v1/daily-accountability-records/:id (SAD §10.3, EPIC-07-T7)
   * Sesuai Scope, 404 jika di luar scope
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.dailyAccountabilityService.findById(user, id);
  }
}
