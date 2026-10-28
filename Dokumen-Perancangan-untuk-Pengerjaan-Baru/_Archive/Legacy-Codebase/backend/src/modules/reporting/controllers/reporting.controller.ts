import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReportingService } from '../services/reporting.service.js';
import { DailyExceptionQueryDto } from '../dto/daily-exception-query.dto.js';
import { WeeklyTeamSummaryQueryDto } from '../dto/weekly-team-summary-query.dto.js';
import { MonthlyTrendQueryDto } from '../dto/monthly-trend-query.dto.js';
import { IndividualEvidenceQueryDto } from '../dto/individual-evidence-query.dto.js';
import { BlockerRootCauseQueryDto } from '../dto/blocker-root-cause-query.dto.js';
import { ExportReportQueryDto } from '../dto/export-report-query.dto.js';
import { RoleGuard } from '../../authorization/guards/role.guard.js';
import { RequireRole } from '../../authorization/decorators/require-role.decorator.js';
import { CurrentUser, type CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reporting')
@Controller('reports')
@UseGuards(RoleGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  /**
   * GET /api/v1/reports/daily-exception (SAD §10.11, §13.1, PRD §9)
   * Role: Head, CEO_Management
   */
  @Get('daily-exception')
  @RequireRole(Role.Head, Role.CEO_Management)
  async getDailyException(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: DailyExceptionQueryDto,
  ) {
    return this.reportingService.getDailyExceptionReport(user, query);
  }

  /**
   * GET /api/v1/reports/exception-summary (SAD §13.2)
   * Shared aggregation service untuk ExceptionSummaryWidget di dashboard & alert
   */
  @Get('exception-summary')
  @RequireRole(Role.Supervisor_TL, Role.Head, Role.CEO_Management, Role.HRGA)
  async getExceptionSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: DailyExceptionQueryDto,
  ) {
    return this.reportingService.getExceptionSummary(user, query.date);
  }

  /**
   * GET /api/v1/reports/weekly-team-summary (SAD §10.11, FR-41, PRD §9)
   * Role: Supervisor_TL, Head, CEO_Management
   */
  @Get('weekly-team-summary')
  @RequireRole(Role.Supervisor_TL, Role.Head, Role.CEO_Management)
  async getWeeklyTeamSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: WeeklyTeamSummaryQueryDto,
  ) {
    return this.reportingService.getWeeklyTeamSummary(user, query);
  }

  /**
   * GET /api/v1/reports/monthly-trend (SAD §10.11, FR-41, PRD §9)
   * Role: CEO_Management
   */
  @Get('monthly-trend')
  @RequireRole(Role.CEO_Management)
  async getMonthlyTrend(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: MonthlyTrendQueryDto,
  ) {
    return this.reportingService.getMonthlyTrend(user, query);
  }

  /**
   * GET /api/v1/reports/individual-evidence/:userId (SAD §10.11, §13.6, PRD §9)
   * Role: Terautentikasi (otorisasi spesifik diverifikasi via ScopeFilterService)
   */
  @Get('individual-evidence/:userId')
  async getIndividualEvidence(
    @CurrentUser() user: CurrentUserPayload,
    @Param('userId') targetUserId: string,
    @Query() query: IndividualEvidenceQueryDto,
  ) {
    return this.reportingService.getIndividualEvidence(user, targetUserId, query);
  }

  /**
   * GET /api/v1/reports/blocker-root-cause (SAD §10.11, PRD §9)
   * Role: Head, CEO_Management
   */
  @Get('blocker-root-cause')
  @RequireRole(Role.Head, Role.CEO_Management)
  async getBlockerRootCause(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: BlockerRootCauseQueryDto,
  ) {
    return this.reportingService.getBlockerRootCauseReport(user, query);
  }

  /**
   * GET /api/v1/reports/:reportType/export (SAD §10.11, §13.5, FR-42/AC-20)
   * Role: Mengikuti kewenangan report terkait
   */
  @Get(':reportType/export')
  async exportReport(
    @CurrentUser() user: CurrentUserPayload,
    @Param('reportType') reportType: string,
    @Query() query: ExportReportQueryDto,
  ) {
    return this.reportingService.exportReport(user, reportType, query);
  }
}
