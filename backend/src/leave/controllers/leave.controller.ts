import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import {
  RecordApprovedLeaveDto,
  UpdateApprovedLeaveDto,
} from '../dto/create-leave-request.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CanonicalRole } from '@prisma/client';

export const LEAVE_REGISTRY_ADMIN_ROLES: CanonicalRole[] = [
  CanonicalRole.SYSTEM_ADMIN,
  CanonicalRole.HRGA,
  CanonicalRole.CEO_MANAGEMENT,
];

@Controller(['leave', 'leave-requests', 'api/leave', 'api/leave-requests'])
@UseGuards(AuthGuard, CsrfGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  /**
   * Riwayat cuti resmi tercatat (read-only) untuk karyawan sendiri.
   */
  @Get('my')
  async getMyLeaveRequests(@Req() req: any) {
    return this.leaveService.getMyLeaveRequests(req.user.id);
  }

  /**
   * Daftar seluruh catatan cuti resmi (ter-ACC) — dikelola HRGA / Direktur / Admin.
   */
  @Get('registry')
  @UseGuards(RolesGuard)
  @Roles(...LEAVE_REGISTRY_ADMIN_ROLES)
  async getAllApprovedLeaves(@Query('userId') userId?: string) {
    return this.leaveService.getAllApprovedLeaves(userId);
  }

  /**
   * Mencatat data cuti resmi yang sudah disetujui di luar sistem (langsung APPROVED).
   */
  @Post('registry')
  @UseGuards(RolesGuard)
  @Roles(...LEAVE_REGISTRY_ADMIN_ROLES)
  async recordApprovedLeave(
    @Req() req: any,
    @Body() dto: RecordApprovedLeaveDto,
  ) {
    return this.leaveService.recordApprovedLeave(req.user.id, dto);
  }

  /**
   * Mengubah catatan cuti resmi yang sudah terdaftar.
   */
  @Patch('registry/:id')
  @UseGuards(RolesGuard)
  @Roles(...LEAVE_REGISTRY_ADMIN_ROLES)
  async updateApprovedLeave(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateApprovedLeaveDto,
  ) {
    return this.leaveService.updateApprovedLeave(req.user.id, id, dto);
  }

  /**
   * Menghapus catatan cuti resmi dari sistem.
   */
  @Delete('registry/:id')
  @UseGuards(RolesGuard)
  @Roles(...LEAVE_REGISTRY_ADMIN_ROLES)
  async deleteApprovedLeave(@Req() req: any, @Param('id') id: string) {
    return this.leaveService.deleteApprovedLeave(req.user.id, id);
  }
}

