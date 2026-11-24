import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { ScopeResolverService } from '../../organization/services/scope-resolver.service';
import { EmploymentStatus, LeaveStatus, NotificationChannel } from '@prisma/client';
import { toJakartaDateOnly } from '../../common/time/date-only.util';
import {
  INTERN_ALLOWED_LEAVE_TYPES,
  RecordApprovedLeaveDto,
  UpdateApprovedLeaveDto,
} from '../dto/create-leave-request.dto';

export const ANNUAL_LEAVE_QUOTA_DAYS = 12;

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Cuti Tahunan',
  SICK: 'Sakit',
  PERMIT: 'Izin',
  SPECIAL_LEAVE: 'Cuti Khusus',
  MATERNITY: 'Cuti Melahirkan',
  UNPAID: 'Cuti di Luar Tanggungan',
};

function getLeaveTypeLabel(leaveType?: string | null): string {
  if (!leaveType) return 'Cuti Tahunan';
  return LEAVE_TYPE_LABELS[leaveType] || leaveType;
}

const ID_DATE_FORMATTER_UTC = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatLeavePeriodId(start: Date, end: Date): string {
  const s = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const e = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  const startText = ID_DATE_FORMATTER_UTC.format(s);
  if (s.getTime() === e.getTime()) {
    return startText;
  }
  const endText = ID_DATE_FORMATTER_UTC.format(e);
  return `${startText} s/d ${endText}`;
}

function countWorkingDaysInclusive(start: Date, end: Date): number {
  const s = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const e = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  if (e < s) return 0;
  let count = 0;
  const cursor = new Date(s);
  while (cursor <= e) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
    private readonly _scopeResolverService?: ScopeResolverService,
  ) {}

  private async validateLeavePayload(params: {
    userId: string;
    start: Date;
    end: Date;
    leaveType: string;
    reason: string;
    excludeLeaveId?: string;
  }) {
    const { userId, start, end, leaveType, reason, excludeLeaveId } = params;

    if (end < start) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal selesai cuti tidak boleh lebih awal dari tanggal mulai.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const workingDays = countWorkingDaysInclusive(start, end);
    if (workingDays === 0) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Rentang tanggal yang dipilih hanya mencakup hari libur akhir pekan (Sabtu/Minggu) dengan 0 hari kerja. Pilih minimal 1 hari kerja (Senin–Jumat).',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (reason.trim().length < 5) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Keterangan cuti wajib diisi minimal 5 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (this.prisma.user?.findUnique) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true },
      });
      if (!targetUser) {
        throw new AppException({
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Karyawan tidak ditemukan.',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
    }

    if (this.prisma.leaveRequest?.findFirst) {
      const overlapping = await this.prisma.leaveRequest.findFirst({
        where: {
          ...(excludeLeaveId ? { id: { not: excludeLeaveId } } : {}),
          userId,
          status: LeaveStatus.APPROVED,
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });

      if (overlapping) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message: 'Karyawan tersebut sudah memiliki catatan cuti resmi pada rentang tanggal yang bertumpuk.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    const todayDateOnly = toJakartaDateOnly(this.clockService.now());
    let activeEmploymentStatus: EmploymentStatus = EmploymentStatus.PERMANENT;
    if (this.prisma.organizationalAssignment?.findFirst) {
      const activeOrg = await this.prisma.organizationalAssignment.findFirst({
        where: {
          userId,
          effectiveDate: { lte: todayDateOnly },
          OR: [{ endDate: null }, { endDate: { gte: todayDateOnly } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });
      activeEmploymentStatus =
        (activeOrg as any)?.employmentStatus || EmploymentStatus.PERMANENT;
    }

    if (
      activeEmploymentStatus === EmploymentStatus.INTERN &&
      !(INTERN_ALLOWED_LEAVE_TYPES as readonly string[]).includes(leaveType)
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Karyawan berstatus Intern tidak memiliki hak cuti tahunan/khusus. Pilih jenis Izin (PERMIT) atau Sakit (SICK).',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return { workingDays };
  }

  /**
   * Mengambil seluruh daftar catatan cuti resmi (ter-ACC) untuk HRGA / Direktur / Admin (DEC-018).
   */
  async getAllApprovedLeaves(userId?: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        status: LeaveStatus.APPROVED,
        ...(userId ? { userId } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        reviewedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Mencatat data cuti resmi yang sudah disetujui di luar sistem (DEC-018).
   * Otomatis berstatus APPROVED, menghapus event kepatuhan pada periode tersebut, dan memberi notifikasi karyawan.
   */
  async recordApprovedLeave(actorUserId: string, dto: RecordApprovedLeaveDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const normalizedLeaveType = dto.leaveType.trim();
    const trimmedReason = (dto.reason || '').trim();

    const { workingDays } = await this.validateLeavePayload({
      userId: dto.userId,
      start,
      end,
      leaveType: normalizedLeaveType,
      reason: trimmedReason,
    });

    const now = this.clockService.now();

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.leaveRequest.create({
        data: {
          userId: dto.userId,
          startDate: start,
          endDate: end,
          leaveType: normalizedLeaveType,
          reason: trimmedReason,
          status: LeaveStatus.APPROVED,
          reviewedByUserId: actorUserId,
          reviewedAt: now,
          reviewNote: 'Dicatat resmi sebagai cuti ter-ACC (DEC-018)',
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (tx.complianceEvent?.deleteMany) {
        await tx.complianceEvent.deleteMany({
          where: {
            userId: dto.userId,
            eventDate: { gte: start, lte: end },
          },
        });
      }

      if (tx.notification?.create) {
        const leaveLabel = getLeaveTypeLabel(normalizedLeaveType);
        const periodText = formatLeavePeriodId(start, end);
        const actorName = created.reviewedBy?.fullName || 'Tim HRGA / Pimpinan';

        await tx.notification.create({
          data: {
            recipientUserId: dto.userId,
            triggerType: 'LEAVE_RECORDED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: `Catatan ${leaveLabel} Resmi Didaftarkan`,
            message: `${actorName} mencatat ${leaveLabel} resmi untuk Anda pada periode ${periodText} (${workingDays} hari kerja). Anda dibebaskan otomatis dari pengisian komitmen harian pada periode tersebut.`,
            actionUrl: '/daily/history',
            relatedEntityType: 'leave_requests',
            relatedEntityId: created.id,
          },
        });
      }

      return created;
    });
  }

  /**
   * Mengubah catatan cuti resmi yang sudah terdaftar (DEC-018).
   */
  async updateApprovedLeave(
    actorUserId: string,
    id: string,
    dto: UpdateApprovedLeaveDto,
  ) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Catatan cuti tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const nextUserId = dto.userId ?? existing.userId;
    const start = dto.startDate ? new Date(dto.startDate) : new Date(existing.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : new Date(existing.endDate);
    const normalizedLeaveType =
      dto.leaveType !== undefined ? dto.leaveType.trim() : existing.leaveType;
    const trimmedReason =
      dto.reason !== undefined ? dto.reason.trim() : existing.reason;

    const { workingDays } = await this.validateLeavePayload({
      userId: nextUserId,
      start,
      end,
      leaveType: normalizedLeaveType,
      reason: trimmedReason,
      excludeLeaveId: id,
    });

    const now = this.clockService.now();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          userId: nextUserId,
          startDate: start,
          endDate: end,
          leaveType: normalizedLeaveType,
          reason: trimmedReason,
          status: LeaveStatus.APPROVED,
          reviewedByUserId: actorUserId,
          reviewedAt: now,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (tx.complianceEvent?.deleteMany) {
        await tx.complianceEvent.deleteMany({
          where: {
            userId: nextUserId,
            eventDate: { gte: start, lte: end },
          },
        });
      }

      if (tx.notification?.create) {
        const leaveLabel = getLeaveTypeLabel(normalizedLeaveType);
        const periodText = formatLeavePeriodId(start, end);
        const actorName = updated.reviewedBy?.fullName || 'Tim HRGA / Pimpinan';

        await tx.notification.create({
          data: {
            recipientUserId: nextUserId,
            triggerType: 'LEAVE_UPDATED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: `Catatan ${leaveLabel} Diperbarui`,
            message: `${actorName} memperbarui catatan ${leaveLabel} resmi Anda menjadi periode ${periodText} (${workingDays} hari kerja). Keterangan: ${trimmedReason}`,
            actionUrl: '/daily/history',
            relatedEntityType: 'leave_requests',
            relatedEntityId: updated.id,
          },
        });
      }

      return updated;
    });
  }

  /**
   * Menghapus catatan cuti resmi dari sistem (DEC-018).
   */
  async deleteApprovedLeave(actorUserId: string, id: string) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });

    if (!existing) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Catatan cuti tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.prisma.leaveRequest.delete({
      where: { id },
    });

    if (this.prisma.notification?.create) {
      const actor = this.prisma.user?.findUnique
        ? await this.prisma.user.findUnique({
            where: { id: actorUserId },
            select: { fullName: true },
          })
        : null;
      const actorName = actor?.fullName || 'Tim HRGA / Pimpinan';
      const leaveLabel = getLeaveTypeLabel(existing.leaveType);
      const periodText = formatLeavePeriodId(
        new Date(existing.startDate),
        new Date(existing.endDate),
      );

      await this.prisma.notification.create({
        data: {
          recipientUserId: existing.userId,
          triggerType: 'LEAVE_DELETED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Catatan ${leaveLabel} Dihapus`,
          message: `${actorName} menghapus catatan ${leaveLabel} resmi Anda untuk periode ${periodText}. Jadwal akuntabilitas harian normal berlaku kembali.`,
          actionUrl: '/daily/history',
          relatedEntityType: 'leave_requests',
          relatedEntityId: id,
        },
      });
    }

    return { deleted: true, id };
  }

  /**
   * Mengambil riwayat cuti resmi tercatat (read-only) untuk karyawan sendiri (DEC-018).
   */
  async getMyLeaveRequests(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        userId,
        status: LeaveStatus.APPROVED,
      },
      include: {
        reviewedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });
  }
}

