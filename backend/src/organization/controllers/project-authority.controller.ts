import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectAuthorityService } from '../services/project-authority.service';
import { CreateProjectAuthorityDto } from '../dto/project-authority.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CanonicalRole } from '@prisma/client';

@Controller('api/v1/admin/project-authorities')
@UseGuards(AuthGuard, CsrfGuard, RolesGuard)
@Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
export class ProjectAuthorityController {
  constructor(private readonly projectAuthService: ProjectAuthorityService) {}

  @Get()
  async listProjectAuthorities(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return await this.projectAuthService.listProjectAuthorities({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      activeOnly: activeOnly === 'true',
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA)
  async createProjectAuthority(
    @Body() dto: CreateProjectAuthorityDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.projectAuthService.createProjectAuthority(dto, adminUserId);
  }

  @Patch(':id/end')
  @HttpCode(HttpStatus.OK)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA)
  async endProjectAuthority(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.projectAuthService.endProjectAuthority(id, adminUserId);
  }
}
