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
import { AdminUsersService } from './admin-users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/user-status.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CanonicalRole, UserStatus } from '@prisma/client';

@Controller('api/v1/admin/users')
@UseGuards(AuthGuard, CsrfGuard, RolesGuard)
@Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.HRGA, CanonicalRole.CEO_MANAGEMENT)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
  ) {
    return await this.adminUsersService.listUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.adminUsersService.createUser(dto, adminUserId);
  }

  @Post(':userId/resend-invitation')
  @HttpCode(HttpStatus.OK)
  async resendInvitation(
    @Param('userId') userId: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.adminUsersService.resendInvitation(userId, adminUserId);
  }

  @Post(':userId/revoke-invitation')
  @HttpCode(HttpStatus.OK)
  async revokeInvitation(
    @Param('userId') userId: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.adminUsersService.revokeInvitation(userId, adminUserId);
  }

  @Patch(':userId/status')
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return await this.adminUsersService.updateUserStatus(userId, dto, adminUserId);
  }
}

