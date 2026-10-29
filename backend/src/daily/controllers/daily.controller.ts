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
import { DailyService } from '../services/daily.service';
import { SubmitMorningCheckinDto } from '../dto/submit-morning-checkin.dto';
import { SubmitAdditionalWorkDto } from '../dto/submit-additional-work.dto';
import { SubmitEodOutcomeDto } from '../dto/submit-eod-outcome.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

@Controller(['daily', 'api/daily'])
@UseGuards(AuthGuard, CsrfGuard)
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Get('today')
  async getTodayState(@Req() req: any, @Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    return this.dailyService.getTodayState(req.user.id, targetDate);
  }

  @Post('morning')
  async submitMorningCheckin(@Req() req: any, @Body() dto: SubmitMorningCheckinDto) {
    return this.dailyService.submitMorningCheckin(req.user.id, dto);
  }

  @Post('records/:id/additional-work')
  async submitAdditionalWork(
    @Req() req: any,
    @Param('id') recordId: string,
    @Body() dto: SubmitAdditionalWorkDto,
  ) {
    return this.dailyService.submitAdditionalWork(req.user.id, recordId, dto);
  }

  @Post('eod')
  async submitEodOutcome(@Req() req: any, @Body() dto: SubmitEodOutcomeDto) {
    return this.dailyService.submitEodOutcome(req.user.id, dto);
  }

  @Get('history')
  async getWeeklyHistory(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dailyService.getWeeklyHistory(req.user.id, startDate, endDate);
  }
}

