import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoachingService } from '../services/coaching.service';
import { CreateManagerNoteDto } from '../dto/create-manager-note.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

@Controller('coaching')
@UseGuards(AuthGuard, CsrfGuard)
export class CoachingController {
  constructor(private readonly coachingService: CoachingService) {}

  @Post('notes')
  async createManagerNote(@Req() req: any, @Body() dto: CreateManagerNoteDto) {
    return this.coachingService.createManagerNote(req.user.id, dto);
  }

  @Get('team')
  async getTeamOverview(@Req() req: any) {
    return this.coachingService.getTeamOverview(req.user.id);
  }

  @Get('users/:id')
  async getNotesForSubject(@Req() req: any, @Param('id') id: string) {
    return this.coachingService.getNotesForSubject(req.user.id, id);
  }
}

