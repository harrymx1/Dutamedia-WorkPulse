import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CanonicalRole } from '@prisma/client';

@Controller('api/v1/reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('executive')
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.HRGA,
  )
  async getExecutiveReport(@Query('period') period?: string) {
    return await this.reportsService.getExecutiveReport(period);
  }

  @Get('export')
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.HRGA,
  )
  async exportReport(
    @Query('period') period: string,
    @Res() res: Response,
  ) {
    const exportData = await this.reportsService.exportAuditData(period);
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
    return res.send(exportData.data);
  }
}

