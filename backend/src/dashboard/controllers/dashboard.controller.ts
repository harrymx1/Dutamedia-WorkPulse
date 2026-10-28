import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

@Controller()
@UseGuards(AuthGuard, CsrfGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/pulse')
  async getPulseMetrics() {
    return this.dashboardService.getPulseMetrics();
  }

  @Get('projects/risk')
  async getProjectRiskOverview() {
    return this.dashboardService.getProjectRiskOverview();
  }
}
