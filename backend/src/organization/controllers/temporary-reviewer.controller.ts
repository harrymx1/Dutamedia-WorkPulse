import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemporaryReviewerService } from '../services/temporary-reviewer.service';
import { CreateTemporaryReviewerDto } from '../dto/temporary-reviewer.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CanonicalRole } from '@prisma/client';

@Controller('api/v1/admin/temporary-reviewers')
@UseGuards(AuthGuard, CsrfGuard, RolesGuard)
@Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
export class TemporaryReviewerController {
  constructor(private readonly tempReviewerService: TemporaryReviewerService) {}

  @Get()
  async listTemporaryReviewers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return await this.tempReviewerService.listTemporaryReviewers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      activeOnly: activeOnly === 'true',
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA)
  async createTemporaryReviewer(
    @Body() dto: CreateTemporaryReviewerDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.tempReviewerService.createTemporaryReviewer(dto, adminUserId);
  }
}
