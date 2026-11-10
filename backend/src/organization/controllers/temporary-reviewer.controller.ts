import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemporaryReviewerService } from '../services/temporary-reviewer.service';
import {
  CreateTemporaryReviewerDto,
  UpdateTemporaryReviewerDto,
  RevokeTemporaryReviewerDto,
} from '../dto/temporary-reviewer.dto';
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
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
  async createTemporaryReviewer(
    @Body() dto: CreateTemporaryReviewerDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.tempReviewerService.createTemporaryReviewer(dto, adminUserId);
  }

  @Patch(':id')
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
  async updateTemporaryReviewer(
    @Param('id') id: string,
    @Body() dto: UpdateTemporaryReviewerDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.tempReviewerService.updateTemporaryReviewer(id, dto, adminUserId);
  }

  @Delete(':id')
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
  async revokeTemporaryReviewer(
    @Param('id') id: string,
    @Body() dto: RevokeTemporaryReviewerDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.tempReviewerService.revokeTemporaryReviewer(id, dto, adminUserId);
  }
}

