import {
  Body,
  Controller,
  Get,
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

@Controller('policies')
@UseGuards(AuthGuard, CsrfGuard)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async getAllActivePolicies(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    return this.policyService.getAllActivePolicies(targetDate);
  }

  @Get('audit')
  async getAuditTrail(@Query('category') category?: PolicyCategory) {
    return this.policyService.getAuditTrail(category);
  }

  @Get('owners')
  async getPolicyOwners() {
    return this.policyService.getPolicyOwners();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN, CanonicalRole.CEO_MANAGEMENT, CanonicalRole.HEAD)
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

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(CanonicalRole.SYSTEM_ADMIN)
  async seedIllustrativePolicies(@Req() req: any) {
    const actorUserId = req.user.id;
    return this.policyService.seedIllustrativePolicies(actorUserId);
  }
}

