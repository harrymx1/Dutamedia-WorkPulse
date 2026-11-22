import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { ScopeResolverService } from '../../organization/services/scope-resolver.service';
import { CanonicalRole, EmploymentStatus, LeaveStatus, NotificationChannel } from '@prisma/client';
import { toJakartaDateOnly } from '../../common/time/date-only.util';
import {
  CreateLeaveRequestDto,
  INTERN_ALLOWED_LEAVE_TYPES,
  ReviewLeaveRequestDto,
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
    private readonly scopeResolverService: ScopeResolverService,
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

    const requestedWorkingDays = countWorkingDaysInclusive(start, end);
    if (requestedWorkingDays === 0) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Rentang tanggal yang dipilih hanya mencakup hari libur akhir pekan (Sabtu/Minggu) dengan 0 hari kerja. Pilih minimal 1 hari kerja (Senin–Jumat).',
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
    const todayDateOnly = toJakartaDateOnly(now);

    // Periksa status kepegawaian aktif pemohon (Aturan Paket #1: Intern hanya boleh Izin & Sakit, Non-Intern batas 12 hari/tahun)
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

    const normalizedLeaveType = dto.leaveType.trim();
    if (activeEmploymentStatus === EmploymentStatus.INTERN) {
      if (!(INTERN_ALLOWED_LEAVE_TYPES as readonly string[]).includes(normalizedLeaveType)) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message:
            'Karyawan berstatus Intern tidak memiliki hak cuti tahunan atau cuti khusus. Silakan pilih jenis pengajuan Izin (dengan alasan logis) atau Sakit.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    } else if (normalizedLeaveType === 'ANNUAL' && this.prisma.leaveRequest?.findMany) {
      const targetYear = start.getUTCFullYear();
      const yearStart = new Date(Date.UTC(targetYear, 0, 1));
      const yearEnd = new Date(Date.UTC(targetYear, 11, 31));
      const existingAnnualLeaves = await this.prisma.leaveRequest.findMany({
        where: {
          userId,
          leaveType: 'ANNUAL',
          status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
          startDate: { lte: yearEnd },
          endDate: { gte: yearStart },
        },
      });
      const usedOrPendingDays = (existingAnnualLeaves || []).reduce(
        (acc: number, item: any) =>
          acc + countWorkingDaysInclusive(new Date(item.startDate), new Date(item.endDate)),
        0,
      );
      if (usedOrPendingDays + requestedWorkingDays > ANNUAL_LEAVE_QUOTA_DAYS) {
        const remaining = Math.max(0, ANNUAL_LEAVE_QUOTA_DAYS - usedOrPendingDays);
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: `Pengajuan melebihi batas jatah Cuti Tahunan ${ANNUAL_LEAVE_QUOTA_DAYS} hari kerja per tahun (terpakai/menunggu: ${usedOrPendingDays} hari, sisa: ${remaining} hari, diajukan: ${requestedWorkingDays} hari).`,
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.create({
        data: {
          userId,
          startDate: start,
          endDate: end,
          leaveType: normalizedLeaveType,
          reason: dto.reason.trim(),
          status: LeaveStatus.PENDING,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Cari atasan langsung untuk notifikasi approval (termasuk akun Intern yang memiliki endDate aktif)
      const assignment = await tx.organizationalAssignment.findFirst({
        where: {
          userId,
          effectiveDate: { lte: todayDateOnly },
          OR: [{ endDate: null }, { endDate: { gte: todayDateOnly } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });

      const leaveLabel = getLeaveTypeLabel(normalizedLeaveType);
      const periodText = formatLeavePeriodId(start, end);
      const isPermitOrSick =
        normalizedLeaveType === 'PERMIT' || normalizedLeaveType === 'SICK';
      const notifTitle = isPermitOrSick
        ? `Pengajuan ${leaveLabel} Karyawan Baru`
        : 'Pengajuan Cuti Karyawan Baru';
      const notifActionPhrase = isPermitOrSick
        ? `mengajukan ${leaveLabel.toLowerCase()}`
        : `mengajukan ${leaveLabel}`;
      const notifMessage = `${leave.user.fullName} ${notifActionPhrase} (${periodText}, ${requestedWorkingDays} hari kerja).`;

      if (assignment?.directManagerId) {
        await tx.notification.create({
          data: {
            recipientUserId: assignment.directManagerId,
            triggerType: 'LEAVE_REQUESTED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: notifTitle,
            message: notifMessage,
            actionUrl: '/leave/queue',
            relatedEntityType: 'leave_requests',
            relatedEntityId: leave.id,
          },
        });
      }

      // Kirim notifikasi juga kepada Reviewer Sementara aktif untuk divisi pemohon (jika ada)
      if (
        assignment?.function &&
        assignment.role !== CanonicalRole.HEAD &&
        assignment.role !== CanonicalRole.CEO_MANAGEMENT &&
        tx.temporaryReviewerAssignment?.findMany
      ) {
        const activeDelegations = await tx.temporaryReviewerAssignment.findMany({
          where: {
            targetFunction: assignment.function,
            effectiveDate: { lte: todayDateOnly },
            expiryDate: { gte: todayDateOnly },
          },
          select: { delegateUserId: true },
          distinct: ['delegateUserId'],
        });

        for (const del of activeDelegations) {
          if (
            del.delegateUserId !== userId &&
            del.delegateUserId !== assignment.directManagerId
          ) {
            await tx.notification.create({
              data: {
                recipientUserId: del.delegateUserId,
                triggerType: 'LEAVE_REQUESTED',
                channel: NotificationChannel.IN_APP_CENTER,
                title: `${notifTitle} (Delegasi Reviewer)`,
                message: notifMessage,
                actionUrl: '/leave/queue',
                relatedEntityType: 'leave_requests',
                relatedEntityId: leave.id,
              },
            });
          }
        }
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
   * Mengambil informasi jatah cuti tahunan & hak pengajuan sesuai status kepegawaian (Paket #1).
   * - Karyawan Tetap & Kontrak: jatah 12 hari kerja per tahun (Cuti Tahunan).
   * - Karyawan Intern: tidak memiliki jatah cuti tahunan, hanya diperbolehkan Izin & Sakit.
   */
  async getMyLeaveQuota(userId: string, year?: number) {
    const now = this.clockService.now();
    const todayDateOnly = toJakartaDateOnly(now);
    const targetYear = year || todayDateOnly.getUTCFullYear();

    let employmentStatus: EmploymentStatus = EmploymentStatus.PERMANENT;
    if (this.prisma.organizationalAssignment?.findFirst) {
      const activeOrg = await this.prisma.organizationalAssignment.findFirst({
        where: {
          userId,
          effectiveDate: { lte: todayDateOnly },
          OR: [{ endDate: null }, { endDate: { gte: todayDateOnly } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });
      employmentStatus =
        (activeOrg as any)?.employmentStatus || EmploymentStatus.PERMANENT;
    }

    if (employmentStatus === EmploymentStatus.INTERN) {
      return {
        year: targetYear,
        employmentStatus,
        hasAnnualQuota: false,
        annualQuotaDays: 0,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 0,
        allowedLeaveTypes: [...INTERN_ALLOWED_LEAVE_TYPES],
      };
    }

    const yearStart = new Date(Date.UTC(targetYear, 0, 1));
    const yearEnd = new Date(Date.UTC(targetYear, 11, 31));
    const annualLeaves = this.prisma.leaveRequest?.findMany
      ? await this.prisma.leaveRequest.findMany({
          where: {
            userId,
            leaveType: 'ANNUAL',
            status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
            startDate: { lte: yearEnd },
            endDate: { gte: yearStart },
          },
        })
      : [];

    let usedDays = 0;
    let pendingDays = 0;
    for (const item of annualLeaves || []) {
      const days = countWorkingDaysInclusive(
        new Date(item.startDate),
        new Date(item.endDate),
      );
      if (item.status === LeaveStatus.APPROVED) usedDays += days;
      else if (item.status === LeaveStatus.PENDING) pendingDays += days;
    }

    const remainingDays = Math.max(0, ANNUAL_LEAVE_QUOTA_DAYS - usedDays - pendingDays);

    return {
      year: targetYear,
      employmentStatus,
      hasAnnualQuota: true,
      annualQuotaDays: ANNUAL_LEAVE_QUOTA_DAYS,
      usedDays,
      pendingDays,
      remainingDays,
      allowedLeaveTypes: [
        'ANNUAL',
        'SICK',
        'PERMIT',
        'SPECIAL_LEAVE',
        'MATERNITY',
        'UNPAID',
      ],
    };
  }

  /**
   * Mengambil antrean persetujuan cuti untuk Atasan / HRGA (Prototipe 21).
   */
  async getApprovalQueue(reviewerUserId?: string, status?: LeaveStatus) {
    const todayDateOnly = toJakartaDateOnly(this.clockService.now());
    const rawList = await this.prisma.leaveRequest.findMany({
      where: {
        ...(status ? { status } : { status: { not: LeaveStatus.CANCELLED } }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            orgAssignments: {
              where: {
                effectiveDate: { lte: todayDateOnly },
                OR: [{ endDate: null }, { endDate: { gte: todayDateOnly } }],
              },
              orderBy: { effectiveDate: 'desc' },
              take: 1,
              select: { role: true, jobTitle: true, employmentStatus: true },
            },
          },
        },
        reviewedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const list = (rawList || []).map((item: any) => {
      const activeOrg = item.user?.orgAssignments?.[0];
      if (!item.user) return item;
      return {
        ...item,
        user: {
          id: item.user.id,
          fullName: item.user.fullName,
          email: item.user.email,
          role: activeOrg?.role || item.user.role,
          jobTitle: activeOrg?.jobTitle || null,
          employmentStatus: activeOrg?.employmentStatus || EmploymentStatus.PERMANENT,
        },
      };
    });

    if (!reviewerUserId) {
      return list;
    }

    const accessible: typeof list = [];
    for (const item of list) {
      if (item.userId === reviewerUserId) {
        continue;
      }
      const canReview = this.scopeResolverService.canReviewUser
        ? await this.scopeResolverService.canReviewUser(reviewerUserId, item.userId)
        : await this.scopeResolverService.canAccessUser(reviewerUserId, item.userId);
      if (canReview) {
        accessible.push(item);
      }
    }
    return accessible;
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

    if (reviewerUserId === leave.userId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message:
          'Pelanggaran tata kelola: Anda tidak diperkenankan meninjau atau menyetujui permohonan cuti milik Anda sendiri.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    // Penegakan batas wewenang hierarki manajerial 3-Lapis (WP-EP03-TK006 / SAD IV.4 & DEC-010)
    if (this.scopeResolverService.enforceReviewerScope) {
      await this.scopeResolverService.enforceReviewerScope(reviewerUserId, leave.userId);
    } else {
      await this.scopeResolverService.enforceUserScope(reviewerUserId, leave.userId);
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
      const leaveLabel = getLeaveTypeLabel(leave.leaveType);
      const periodText = formatLeavePeriodId(leave.startDate, leave.endDate);

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
            title: `Permohonan ${leaveLabel} Disetujui`,
            message: `Permohonan ${leaveLabel} Anda untuk periode ${periodText} telah disetujui.`,
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
            title: `Permohonan ${leaveLabel} Ditolak`,
            message: `Permohonan ${leaveLabel} Anda (${periodText}) ditolak oleh peninjau: "${dto.reviewNote || 'Tidak ada alasan khusus'}".`,
            actionUrl: '/leave/my',
            relatedEntityType: 'leave_requests',
            relatedEntityId: leave.id,
          },
        });
      }

      return updated;
    });
  }

  /**
   * Membatalkan permohonan cuti mandiri yang masih berstatus PENDING (TC-LEAV-004).
   */
  async cancelLeaveRequest(userId: string, id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Permohonan cuti tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (leave.userId !== userId) {
      throw new AppException({
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Anda hanya dapat membatalkan permohonan cuti milik sendiri.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Hanya permohonan berstatus Menunggu Review yang dapat dibatalkan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.CANCELLED,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}

