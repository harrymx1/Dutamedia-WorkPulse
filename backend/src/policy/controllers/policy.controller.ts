import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PolicyService } from '../services/policy.service';
import { CreatePolicyVersionDto } from '../dto/create-policy-version.dto';
import { AssignPolicyOwnerDto } from '../dto/assign-policy-owner.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CanonicalRole, PolicyCategory } from '@prisma/client';

@Controller(['policies', 'api/policies', 'api/v1/policies', 'v1/policies'])
@UseGuards(AuthGuard, CsrfGuard, RolesGuard)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.HRGA,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.PROJECT_MANAGER,
  )
  async getAllActivePolicies(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    return this.policyService.getAllActivePolicies(targetDate);
  }

  @Get('audit')
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.HRGA,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.PROJECT_MANAGER,
  )
  async getAuditTrail(@Query('category') category?: PolicyCategory) {
    return this.policyService.getAuditTrail(category);
  }

  @Get('owners')
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.HRGA,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.PROJECT_MANAGER,
  )
  async getPolicyOwners() {
    return this.policyService.getPolicyOwners();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(
    CanonicalRole.SYSTEM_ADMIN,
    CanonicalRole.HRGA,
    CanonicalRole.CEO_MANAGEMENT,
    CanonicalRole.HEAD,
    CanonicalRole.PROJECT_MANAGER,
  )
  async createPolicyVersion(
    @Body() dto: CreatePolicyVersionDto,
    @Req() req: any,
  ) {
    const actorUserId = req.user.id;
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    return this.policyService.createPolicyVersion(actorUserId, dto, meta);
  }

  @Post('owners')
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.CEO_MANAGEMENT)
  async assignPolicyOwner(
    @Body() dto: AssignPolicyOwnerDto,
    @Req() req: any,
  ) {
    const actorUserId = req.user.id;
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    return this.policyService.assignPolicyOwner(actorUserId, dto, meta);
  }

  @Delete('owners/:id')
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.CEO_MANAGEMENT)
  async revokePolicyOwner(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const actorUserId = req.user.id;
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    return this.policyService.revokePolicyOwner(actorUserId, id, meta);
  }

  @Post('owners/:id/revoke')
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.CEO_MANAGEMENT)
  async revokePolicyOwnerPost(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const actorUserId = req.user.id;
    const meta = {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    return this.policyService.revokePolicyOwner(actorUserId, id, meta);
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN)
  async seedIllustrativePolicies(@Req() req: any) {
    const actorUserId = req.user.id;
    return this.policyService.seedIllustrativePolicies(actorUserId);
  }
}

