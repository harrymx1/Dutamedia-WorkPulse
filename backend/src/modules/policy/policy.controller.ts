import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PolicyCategory, Role } from '@prisma/client';
import { PolicyService } from './policy.service.js';
import { CreatePolicyDto } from './dto/create-policy.dto.js';
import { CreatePolicyOwnerAssignmentDto } from './dto/create-policy-owner-assignment.dto.js';
import { QueryPoliciesDto } from './dto/query-policies.dto.js';
import { PolicyOwnerGuard } from './guards/policy-owner.guard.js';
import { RequireRole } from '../authorization/decorators/require-role.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  /**
   * GET /api/v1/policies (SAD §10.9)
   * Terbuka untuk seluruh user terautentikasi.
   */
  @Get()
  async getActivePolicies(@Query() query: QueryPoliciesDto) {
    return this.policyService.getActivePolicies(query);
  }

  /**
   * POST /api/v1/policies (SAD §8.10, §10.9)
   * Dibatasi hanya untuk Authorized Policy Owner kategori terkait (BR-15).
   */
  @Post()
  @UseGuards(PolicyOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPolicy(
    @Body() dto: CreatePolicyDto,
    @CurrentUser('userId') actorUserId: string,
  ) {
    return this.policyService.createPolicy(dto, actorUserId);
  }

  /**
   * GET /api/v1/policies/:category/history (SAD §10.9)
   * Riwayat versi kebijakan untuk PolicyVersionHistory (Design System).
   */
  @Get(':category/history')
  async getPolicyHistory(
    @Param('category', new ParseEnumPipe(PolicyCategory))
    category: PolicyCategory,
  ) {
    return this.policyService.getPolicyHistory(category);
  }

  /**
   * POST /api/v1/policies/owner-assignments (SAD §10.9)
   * Alias atau endpoint penugasan Policy Owner oleh SystemAdmin.
   */
  @Post('owner-assignments')
  @RequireRole(Role.SystemAdmin)
  @HttpCode(HttpStatus.CREATED)
  async createPolicyOwnerAssignment(
    @Body() dto: CreatePolicyOwnerAssignmentDto,
    @CurrentUser('userId') actorAdminId: string,
  ) {
    return this.policyService.createPolicyOwnerAssignment(dto, actorAdminId);
  }
}

/**
 * Controller sekunder untuk path literal /policy-owner-assignments (SAD §10.9)
 */
@Controller('policy-owner-assignments')
export class PolicyOwnerAssignmentController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @RequireRole(Role.SystemAdmin)
  @HttpCode(HttpStatus.CREATED)
  async createPolicyOwnerAssignment(
    @Body() dto: CreatePolicyOwnerAssignmentDto,
    @CurrentUser('userId') actorAdminId: string,
  ) {
    return this.policyService.createPolicyOwnerAssignment(dto, actorAdminId);
  }
}
