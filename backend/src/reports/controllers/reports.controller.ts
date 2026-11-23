import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CanonicalRole } from '@prisma/client';

@Controller(['reports', 'api/reports', 'api/v1/reports', 'v1/reports'])
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
  async getExecutiveReport(
    @Req() req: any,
    @Query('period') period?: string,
    @Query('employmentStatus') employmentStatus?: string,
    @Query('function') filterFunction?: string,
  ) {
    return await this.reportsService.getExecutiveReport(period, employmentStatus, {
      userId: req.user?.id,
      userRole: req.user?.role,
      userFunction: req.user?.function,
      filterFunction,
    });
  }

  @Get('export')
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.HRGA,
  )
  async exportReport(
    @Req() req: any,
    @Query('period') period: string,
    @Query('employmentStatus') employmentStatus: string,
    @Query('function') filterFunction: string,
    @Res() res: Response,
  ) {
    const exportData = await this.reportsService.exportAuditData(period, employmentStatus, {
      userId: req.user?.id,
      userRole: req.user?.role,
      userFunction: req.user?.function,
      filterFunction,
    });
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
    return res.send(exportData.data);
  }
}

