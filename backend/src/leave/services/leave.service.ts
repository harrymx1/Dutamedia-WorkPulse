import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { LeaveStatus, NotificationChannel } from '@prisma/client';
import {
  CreateLeaveRequestDto,
  ReviewLeaveRequestDto,
} from '../dto/create-leave-request.dto';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengajukan permohonan cuti resmi mandiri (Prototipe 20).
   */
  async createLeaveRequest(userId: string, dto: CreateLeaveRequestDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal selesai cuti tidak boleh lebih awal dari tanggal mulai.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Cek tumpang tindih permohonan cuti aktif
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    if (overlapping) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Terdapat permohonan cuti aktif pada rentang tanggal yang dipilih.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const now = this.clockService.now();

    return this.prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.create({
        data: {
          userId,
          startDate: start,
          endDate: end,
          leaveType: dto.leaveType.trim(),
          reason: dto.reason.trim(),
          status: LeaveStatus.PENDING,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Cari atasan langsung untuk notifikasi approval
      const assignment = await tx.organizationalAssignment.findFirst({
        where: { userId, endDate: null },
      });

      if (assignment?.directManagerId) {
        await tx.notification.create({
          data: {
            recipientUserId: assignment.directManagerId,
            triggerType: 'LEAVE_REQUESTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Pengajuan Cuti Karyawan Baru',
            message: `${leave.user.fullName} mengajukan cuti ${dto.leaveType} (${dto.startDate} s/d ${dto.endDate}).`,
            actionUrl: '/leave/queue',
            relatedEntityType: 'leave_requests',
            relatedEntityId: leave.id,
          },
        });
      }

      return leave;
    });
  }

  /**
   * Mengambil riwayat pengajuan cuti pribadi (Prototipe 20).
   */
  async getMyLeaveRequests(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        reviewedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Mengambil antrean persetujuan cuti untuk Atasan / HRGA (Prototipe 21).
   */
  async getApprovalQueue(status?: LeaveStatus) {
    return this.prisma.leaveRequest.findMany({
      where: {
        ...(status && { status }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        reviewedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  /**
   * Meninjau permohonan cuti (Approve / Reject) dengan rekonsiliasi retroaktif DEC-007.
   */
  async reviewLeaveRequest(
    reviewerUserId: string,
    id: string,
    dto: ReviewLeaveRequestDto,
  ) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!leave) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Permohonan cuti tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Permohonan cuti sudah ditinjau sebelumnya.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const now = this.clockService.now();
    const newStatus = dto.decision === 'APPROVE' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: newStatus,
          reviewedByUserId: reviewerUserId,
          reviewNote: dto.reviewNote?.trim() || null,
          reviewedAt: now,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { id: true, fullName: true } },
        },
      });

      // DEC-007 Retroactive Reconciliation:
      // Jika disetujui dan mencakup masa lalu / hari ini, hapus event kepatuhan yang mungkin tercatat
      if (dto.decision === 'APPROVE') {
        await tx.complianceEvent.deleteMany({
          where: {
            userId: leave.userId,
            eventDate: {
              gte: leave.startDate,
              lte: leave.endDate,
            },
          },
        });

        // Kirim notifikasi persetujuan
        await tx.notification.create({
          data: {
            recipientUserId: leave.userId,
            triggerType: 'LEAVE_APPROVED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Permohonan Cuti Disetujui',
            message: `Permohonan cuti Anda untuk periode ${leave.startDate.toISOString().slice(0, 10)} s/d ${leave.endDate.toISOString().slice(0, 10)} telah disetujui.`,
            actionUrl: '/leave/my',
            relatedEntityType: 'leave_requests',
            relatedEntityId: leave.id,
          },
        });
      } else {
        // Notifikasi penolakan
        await tx.notification.create({
          data: {
            recipientUserId: leave.userId,
            triggerType: 'LEAVE_REJECTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Permohonan Cuti Ditolak',
            message: `Permohonan cuti Anda ditolak oleh atasan: "${dto.reviewNote || 'Tidak ada alasan khusus'}".`,
            actionUrl: '/leave/my',
            relatedEntityType: 'leave_requests',
            relatedEntityId: leave.id,
          },
        });
      }

      return updated;
    });
  }
}

