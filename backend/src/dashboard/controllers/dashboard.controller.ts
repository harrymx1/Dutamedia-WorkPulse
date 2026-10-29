import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

@Controller()
@UseGuards(AuthGuard, CsrfGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(['dashboard/pulse', 'api/dashboard/pulse', 'dashboard/metrics', 'api/dashboard/metrics'])
  async getPulseMetrics() {
    return this.dashboardService.getPulseMetrics();
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

