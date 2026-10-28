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
import { CorrectionService } from '../services/correction.service';
import {
  CreateCorrectionRequestDto,
  ReviewCorrectionRequestDto,
} from '../dto/create-correction-request.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { CorrectionStatus } from '@prisma/client';

@Controller('correction-requests')
@UseGuards(AuthGuard, CsrfGuard)
export class CorrectionController {
  constructor(private readonly correctionService: CorrectionService) {}

  @Post()
  async createCorrectionRequest(
    @Req() req: any,
    @Body() dto: CreateCorrectionRequestDto,
  ) {
    return this.correctionService.createCorrectionRequest(req.user.id, dto);
  }

  @Get()
  async getCorrectionRequests(
    @Query('status') status?: CorrectionStatus,
    @Query('requesterId') requesterId?: string,
  ) {
    return this.correctionService.getCorrectionRequests({
      status,
      requesterId,
    });
  }

  @Post(':id/review')
  async reviewCorrectionRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewCorrectionRequestDto,
  ) {
    return this.correctionService.reviewCorrectionRequest(
      req.user.id,
      id,
      dto,
    );
  }
}
