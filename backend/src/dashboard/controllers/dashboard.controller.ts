import { Controller, Get, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { CanonicalRole } from '@prisma/client';

@Controller()
@UseGuards(AuthGuard, CsrfGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get([
    'dashboard/pulse',
    'api/dashboard/pulse',
    'api/v1/dashboard/pulse',
    'dashboard/metrics',
    'api/dashboard/metrics',
    'api/v1/dashboard/metrics',
  ])
  async getPulseMetrics(
    @Req() req: any,
    @Query('scope') scope?: string,
    @Query('function') filterFunction?: string,
    @Query('projectCode') projectCode?: string,
  ) {
    const userRole = req.user?.role;
    if (scope === 'management') {
      if (
        userRole &&
        userRole !== CanonicalRole.CEO_MANAGEMENT &&
        userRole !== CanonicalRole.SYSTEM_ADMIN &&
        userRole !== CanonicalRole.HRGA
      ) {
        throw new AppException({
          statusCode: HttpStatus.FORBIDDEN,
          code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
          message: 'Anda tidak memiliki kewenangan untuk mengakses cakupan Seluruh Perusahaan (Management Pulse).',
        });
      }
    }
    if (scope === 'function') {
      if (
        userRole &&
        userRole !== CanonicalRole.HEAD &&
        userRole !== CanonicalRole.CEO_MANAGEMENT &&
        userRole !== CanonicalRole.SYSTEM_ADMIN
      ) {
        throw new AppException({
          statusCode: HttpStatus.FORBIDDEN,
          code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
          message: 'Anda tidak memiliki kewenangan untuk mengakses cakupan Divisi Saya (Function Pulse).',
        });
      }
    }
    return this.dashboardService.getPulseMetrics({
      userId: req.user?.id,
      userRole: req.user?.role,
      userFunction: req.user?.function,
      scope,
      filterFunction,
      projectCode,
    });
  }

  @Get(['projects/risk', 'api/projects/risk', 'dashboard/projects', 'api/dashboard/projects'])
  async getProjectRiskOverview() {
    return this.dashboardService.getProjectRiskOverview();
  }

  @Get(['dashboard/feed', 'api/dashboard/feed'])
  async getDashboardFeed() {
    return [];
  }
}
