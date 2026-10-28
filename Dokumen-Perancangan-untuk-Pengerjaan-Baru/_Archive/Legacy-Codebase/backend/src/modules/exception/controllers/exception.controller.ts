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
import { ExceptionService } from '../services/exception.service.js';
import { CreateLeaveDto } from '../dto/create-leave.dto.js';
import { CreateHolidayDto } from '../dto/create-holiday.dto.js';
import { CreateExemptionDto } from '../dto/create-exemption.dto.js';
import { RejectLeaveDto } from '../dto/reject-leave.dto.js';
import { QueryExceptionsDto } from '../dto/query-exceptions.dto.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';
import { RequireRole } from '../../authorization/decorators/require-role.decorator.js';
import { RoleGuard } from '../../authorization/guards/role.guard.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Exception')
@Controller('exceptions')
export class ExceptionController {
  constructor(private readonly exceptionService: ExceptionService) {}

  /**
   * POST /api/v1/exceptions/leave (SAD §10.6, FR-47, EPIC-10-T1)
   * Diajukan oleh Employee untuk dirinya sendiri dengan status Pending.
   */
  @Post('leave')
  @HttpCode(HttpStatus.CREATED)
  async createLeave(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateLeaveDto,
  ) {
    return this.exceptionService.createLeave(user, dto);
  }

  /**
   * POST /api/v1/exceptions/holiday (SAD §10.6, BR-18, FR-46, EPIC-10-T1)
   * Dibuat oleh SystemAdmin / HRGA. Langsung berstatus Approved.
   */
  @Post('holiday')
  @HttpCode(HttpStatus.CREATED)
  @RequireRole(Role.SystemAdmin, Role.HRGA)
  @UseGuards(RoleGuard)
  async createHoliday(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateHolidayDto,
  ) {
    return this.exceptionService.createHoliday(user, dto);
  }

  /**
   * POST /api/v1/exceptions/exemption (SAD §10.6, BR-18, FR-46, EPIC-10-T1)
   * Dibuat oleh SystemAdmin / HRGA untuk individual karyawan. Langsung berstatus Approved.
   */
  @Post('exemption')
  @HttpCode(HttpStatus.CREATED)
  @RequireRole(Role.SystemAdmin, Role.HRGA)
  @UseGuards(RoleGuard)
  async createExemption(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateExemptionDto,
  ) {
    return this.exceptionService.createExemption(user, dto);
  }

  /**
   * GET /api/v1/exceptions (SAD §8.11, §10.6, EPIC-10-T2)
   * Scope-filtered query sesuai role dan fungsi pengguna.
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryExceptionsDto,
  ) {
    return this.exceptionService.findAll(user, query);
  }

  /**
   * GET /api/v1/exceptions/:id (SAD §7.7, §8.11, §10.6, EPIC-10-T2)
   * Scope-filtered detail, merespons 404 jika di luar cakupan akses.
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.exceptionService.findById(user, id);
  }

  /**
   * POST /api/v1/exceptions/:id/approve (SAD §10.6, FR-47, EPIC-10-T3)
   * Persetujuan permohonan cuti oleh Authorized Reviewer (Manager / HRGA / Head).
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveLeave(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.exceptionService.approveLeave(user, id);
  }

  /**
   * POST /api/v1/exceptions/:id/reject (SAD §10.6, FR-47, EPIC-10-T3)
   * Penolakan permohonan cuti oleh Authorized Reviewer disertai alasan penolakan.
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectLeave(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RejectLeaveDto,
  ) {
    return this.exceptionService.rejectLeave(user, id, dto);
  }
}
