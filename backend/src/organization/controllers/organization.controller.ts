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
import { OrganizationService } from '../services/organization.service';
import { AssignOrgDto } from '../dto/assign-org.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CanonicalFunction, CanonicalRole } from '@prisma/client';

@Controller('api/v1')
@UseGuards(AuthGuard, CsrfGuard)
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('organization/my-assignment')
  async getMyAssignment(@CurrentUser('id') userId: string) {
    return await this.orgService.getUserActiveAssignment(userId);
  }

  @Get('admin/organization/assignments')
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
  async listAssignments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('function') func?: CanonicalFunction,
    @Query('role') role?: CanonicalRole,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return await this.orgService.listAssignments({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      function: func,
      role,
      activeOnly: activeOnly === 'true',
    });
  }

  @Post('admin/organization/assignments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA)
  async assignUser(
    @Body() dto: AssignOrgDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.orgService.assignUser(dto, adminUserId);
  }
}

