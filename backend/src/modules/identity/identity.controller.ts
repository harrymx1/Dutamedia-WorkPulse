import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { IdentityService } from './identity.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { CreateOrgAssignmentDto } from './dto/create-org-assignment.dto.js';
import { CreateProjectAuthorityDto } from './dto/create-project-authority.dto.js';
import { UpdateProjectAuthorityDto } from './dto/update-project-authority.dto.js';
import { CreateTempReviewerDto } from './dto/create-temp-reviewer.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Identity')
@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  /**
   * GET /api/v1/users (SAD §10.2)
   */
  @Get('users')
  async getUsers(@Query() query: QueryUsersDto) {
    return this.identityService.getUsers(query);
  }

  /**
   * POST /api/v1/users (SAD §10.2)
   */
  @Post('users')
  async createUser(@Body() dto: CreateUserDto, @Req() req: Request) {
    const actorUserId = (req as any).user?.userId;
    return this.identityService.createUser(dto, actorUserId);
  }

  /**
   * GET /api/v1/users/:id
   */
  @Get('users/:id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.identityService.getUserById(id);
  }

  /**
   * PATCH /api/v1/users/:id (SAD §10.2)
   */
  @Patch('users/:id')
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req as any).user?.userId;
    return this.identityService.updateUserStatus(id, dto, actorUserId);
  }

  /**
   * GET /api/v1/users/:id/organizational-assignments (SAD §10.2)
   */
  @Get('users/:id/organizational-assignments')
  async getOrganizationalAssignments(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.identityService.getOrganizationalAssignments(id);
  }

  /**
   * POST /api/v1/organizational-assignments (SAD §10.2)
   */
  @Post('organizational-assignments')
  async createOrganizationalAssignment(
    @Body() dto: CreateOrgAssignmentDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req as any).user?.userId;
    return this.identityService.createOrganizationalAssignment(dto, actorUserId);
  }

  /**
   * POST /api/v1/project-authority-mappings (SAD §10.2)
   */
  @Post('project-authority-mappings')
  async createProjectAuthorityMapping(
    @Body() dto: CreateProjectAuthorityDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req as any).user?.userId;
    return this.identityService.createProjectAuthorityMapping(dto, actorUserId);
  }

  /**
   * PATCH /api/v1/project-authority-mappings/:id (SAD §10.2)
   */
  @Patch('project-authority-mappings/:id')
  async updateProjectAuthorityMapping(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectAuthorityDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req as any).user?.userId;
    return this.identityService.updateProjectAuthorityMapping(
      id,
      dto,
      actorUserId,
    );
  }

  /**
   * POST /api/v1/temporary-reviewer-assignments (SAD §10.2)
   */
  @Post('temporary-reviewer-assignments')
  async createTemporaryReviewerAssignment(
    @Body() dto: CreateTempReviewerDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req as any).user?.userId;
    return this.identityService.createTemporaryReviewerAssignment(
      dto,
      actorUserId,
    );
  }
}
