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
} from '@nestjs/common';
import { ComplianceService } from '../services/compliance.service.js';
import { CoachComplianceEventDto } from '../dto/coach-compliance-event.dto.js';
import { RecordWarningDto } from '../dto/record-warning.dto.js';
import { EscalateFormalDto } from '../dto/escalate-formal.dto.js';
import { QueryComplianceEventsDto } from '../dto/query-compliance-events.dto.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';

@Controller('compliance-events')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * GET /api/v1/compliance-events (SAD §8.11, §10.8, EPIC-12-T3)
   * Daftar compliance event sesuai cakupan wewenang organisasi (Supervisor, Head, HRGA, CEO/Management).
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryComplianceEventsDto,
  ) {
    return this.complianceService.findAll(user, query);
  }

  /**
   * GET /api/v1/compliance-events/:id (SAD §9.7, §10.8, EPIC-12-T3)
   * Detail compliance event beserta availableActions.
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.complianceService.findById(user, id);
  }

  /**
   * POST /api/v1/compliance-events/:id/coach (SAD §9.7, §10.8, §15.1, EPIC-12-T4)
   * Melakukan pembinaan (Coaching) atas PatternFlag dalam transaksi atomik bersama ManagerNote.
   */
  @Post(':id/coach')
  @HttpCode(HttpStatus.OK)
  async coach(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CoachComplianceEventDto,
  ) {
    return this.complianceService.coach(user, id, dto);
  }

  /**
   * POST /api/v1/compliance-events/:id/record-warning (SAD §9.7, §10.8, BR-05, BR-06, EPIC-12-T5)
   * HRGA mencatat peringatan formal (Recorded Warning) berulang pasca Coaching.
   */
  @Post(':id/record-warning')
  @HttpCode(HttpStatus.OK)
  async recordWarning(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RecordWarningDto,
  ) {
    return this.complianceService.recordWarning(user, id, dto);
  }

  /**
   * POST /api/v1/compliance-events/:id/escalate-formal (SAD §9.7, §10.8, BR-05, BR-06, EPIC-12-T5)
   * HRGA mencatat eskalasi proses formal di luar sistem berulang pasca Recorded Warning.
   */
  @Post(':id/escalate-formal')
  @HttpCode(HttpStatus.OK)
  async escalateFormal(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: EscalateFormalDto,
  ) {
    return this.complianceService.escalateFormal(user, id, dto);
  }
}
