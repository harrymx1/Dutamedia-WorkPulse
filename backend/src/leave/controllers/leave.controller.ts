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
import { LeaveStatus } from '@prisma/client';

@Controller('leave-requests')
@UseGuards(AuthGuard, CsrfGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async createLeaveRequest(@Req() req: any, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.createLeaveRequest(req.user.id, dto);
  }

  @Get('my')
  async getMyLeaveRequests(@Req() req: any) {
    return this.leaveService.getMyLeaveRequests(req.user.id);
  }

  @Get('queue')
  async getApprovalQueue(@Query('status') status?: LeaveStatus) {
    return this.leaveService.getApprovalQueue(status);
  }

  @Post(':id/review')
  async reviewLeaveRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewLeaveRequestDto,
  ) {
    return this.leaveService.reviewLeaveRequest(req.user.id, id, dto);
  }
}

