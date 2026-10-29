import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ComplianceService } from '../services/compliance.service';
import { ExemptionService } from '../services/exemption.service';
import { CreateBoundedExemptionDto } from '../dto/create-exemption.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ComplianceEventStage } from '@prisma/client';

@Controller(['compliance', 'api/compliance'])
@UseGuards(AuthGuard, CsrfGuard)
export class ComplianceController {
  constructor(
    private readonly complianceService: ComplianceService,
    private readonly exemptionService: ExemptionService,
  ) {}

  @Get('queue')
  async getComplianceQueue(
    @Query('stage') stage?: ComplianceEventStage,
    @Query('status') status?: string,
  ) {
    return this.complianceService.getComplianceQueue({ stage, status });
  }

  @Get('summary')
  async getComplianceSummary() {
    return this.complianceService.getComplianceSummary();
  }

  @Post('events/:id/address')
  async addressComplianceEvent(
    @Param('id') id: string,
    @Body('managerNoteId') managerNoteId: string,
  ) {
    return this.complianceService.addressComplianceEvent(id, managerNoteId);
  }

  @Get('exemptions')
  async getBoundedExemptions(@Query('userId') userId?: string) {
    return this.exemptionService.getBoundedExemptions(userId);
  }

  @Post('exemptions')
  async createBoundedExemption(
    @Req() req: any,
    @Body() dto: CreateBoundedExemptionDto,
  ) {
    return this.exemptionService.createBoundedExemption(req.user.id, dto);
  }
}

