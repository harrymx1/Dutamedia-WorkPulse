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
import { LeaveService } from '../services/leave.service';
import {
  CreateLeaveRequestDto,
  ReviewLeaveRequestDto,
} from '../dto/create-leave-request.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CanonicalRole, LeaveStatus } from '@prisma/client';

export const SELF_LEAVE_OPERATIONAL_ROLES: CanonicalRole[] = [
  CanonicalRole.EMPLOYEE,
  CanonicalRole.SUPERVISOR,
  CanonicalRole.HEAD,
  CanonicalRole.PROJECT_MANAGER,
  CanonicalRole.HRGA,
  CanonicalRole.CEO_MANAGEMENT,
];

@Controller(['leave', 'leave-requests', 'api/leave', 'api/leave-requests'])
@UseGuards(AuthGuard, CsrfGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post(['', 'requests'])
  @UseGuards(RolesGuard)
  @Roles(...SELF_LEAVE_OPERATIONAL_ROLES)
  async createLeaveRequest(@Req() req: any, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.createLeaveRequest(req.user.id, dto);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(...SELF_LEAVE_OPERATIONAL_ROLES)
  async getMyLeaveRequests(@Req() req: any) {
    return this.leaveService.getMyLeaveRequests(req.user.id);
  }

  @Get('quota')
  @UseGuards(RolesGuard)
  @Roles(...SELF_LEAVE_OPERATIONAL_ROLES)
  async getMyLeaveQuota(@Req() req: any) {
    return this.leaveService.getMyLeaveQuota(req.user.id);
  }

  @Get('queue')
  async getApprovalQueue(@Req() req: any, @Query('status') status?: LeaveStatus) {
    return this.leaveService.getApprovalQueue(req.user?.id, status);
  }

  @Post([':id/review', 'requests/:id/review'])
  async reviewLeaveRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewLeaveRequestDto,
  ) {
    return this.leaveService.reviewLeaveRequest(req.user.id, id, dto);
  }

  @Post([':id/cancel', 'requests/:id/cancel'])
  @UseGuards(RolesGuard)
  @Roles(...SELF_LEAVE_OPERATIONAL_ROLES)
  async cancelLeaveRequest(@Req() req: any, @Param('id') id: string) {
    return this.leaveService.cancelLeaveRequest(req.user.id, id);
  }
}

