import { Injectable, Logger } from '@nestjs/common';
import {
  ExceptionStatus,
  ExceptionType,
  NotificationChannel,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import { NotificationService } from '../../notification/notification.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import {
  BusinessRuleViolationException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';
import type { CreateLeaveDto } from '../dto/create-leave.dto.js';
import type { CreateHolidayDto } from '../dto/create-holiday.dto.js';
import type { CreateExemptionDto } from '../dto/create-exemption.dto.js';
import type { RejectLeaveDto } from '../dto/reject-leave.dto.js';
import type { QueryExceptionsDto } from '../dto/query-exceptions.dto.js';

export interface ExceptionActionTarget {
  type: ExceptionType;
  status: ExceptionStatus;
  employeeUserId?: string | null;
}

@Injectable()
export class ExceptionService {
  private readonly logger = new Logger(ExceptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Menghitung daftar aksi yang tersedia untuk sebuah Exception (SAD §7.12, §10.6).
   */
  computeAvailableActions(
    exception: ExceptionActionTarget | null | undefined,
    user: CurrentUserPayload,
    isAuthorizedReviewer: boolean,
  ): string[] {
    const actions: string[] = [];
    if (!exception) return actions;

    // Hanya Leave dengan status Pending yang memiliki aksi persetujuan (approve/reject)
    if (
      exception.type === ExceptionType.Leave &&
      exception.status === ExceptionStatus.Pending
    ) {
      // Pemohon tidak boleh menyetujui cutinya sendiri
      if (isAuthorizedReviewer && exception.employeeUserId !== user.userId) {
        actions.push('approve', 'reject');
      }
    }

    return actions;
  }

  /**
   * Helper untuk memeriksa apakah user berwenang mereview/menyetujui cuti target employee (SAD §8.7, §8.11, §10.6).
   */
  async isAuthorizedApprover(
    user: CurrentUserPayload,
    employeeUserId: string,
    asOfDate: Date = new Date(),
  ): Promise<boolean> {
    if (user.userId === employeeUserId) {
      return false; // Tidak boleh review cuti sendiri
    }

    // HRGA & CEO_Management memiliki kewenangan peninjauan company-wide
    if (user.role === Role.HRGA || user.role === Role.CEO_Management) {
      return true;
    }

    // Supervisor_TL dan Head berwenang jika employeeUserId dalam scope aktif mereka
    if (user.role === Role.Supervisor_TL || user.role === Role.Head) {
      return this.scopeFilterService.isUserInScope(user, employeeUserId, asOfDate);
    }

    return false;
  }

  /**
   * Helper memformat tanggal ke format YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * EPIC-10-T1: Submit Leave Request (SAD §10.6, FR-47).
   * Diajukan oleh Employee untuk dirinya sendiri dengan status awal Pending.
   */
  async createLeave(user: CurrentUserPayload, dto: CreateLeaveDto) {
    const start = new Date(dto.dateStart);
    const end = new Date(dto.dateEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BusinessRuleViolationException(
        'Format tanggal dateStart atau dateEnd tidak valid',
        [{ field: 'dateStart', reason: 'INVALID_DATE' }],
      );
    }

    if (start > end) {
      throw new BusinessRuleViolationException(
        'Tanggal mulai (dateStart) tidak boleh lebih besar dari tanggal akhir (dateEnd)',
        [{ field: 'dateStart', reason: 'DATE_START_AFTER_DATE_END' }],
      );
    }

    // Cek tumpang tindih (overlap) cuti aktif/pending milik user yang sama
    const overlapping = await this.prisma.exception.findFirst({
      where: {
        type: ExceptionType.Leave,
        employeeUserId: user.userId,
        status: { in: [ExceptionStatus.Pending, ExceptionStatus.Approved] },
        dateStart: { lte: end },
        dateEnd: { gte: start },
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'Sudah terdapat permohonan cuti aktif atau pending pada rentang tanggal tersebut',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const exception = await tx.exception.create({
        data: {
          type: ExceptionType.Leave,
          employeeUserId: user.userId,
          dateStart: start,
          dateEnd: end,
          status: ExceptionStatus.Pending,
          reason: dto.reason ?? null,
          createdByUserId: user.userId,
        },
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'EXCEPTION_LEAVE_REQUESTED',
          relatedEntityType: 'Exception',
          relatedEntityId: exception.id,
          valueAfter: exception,
        },
        tx,
      );

      // Cari direct manager pelapor untuk notifikasi pengajuan cuti (SAD §12.1 trigger #12)
      const orgAssignment = await tx.organizationalAssignment.findFirst({
        where: {
          userId: user.userId,
          effectiveDate: { lte: new Date() },
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        orderBy: { effectiveDate: 'desc' },
      });

      const recipientUserId = orgAssignment?.directManagerId;
      if (recipientUserId) {
        await this.notificationService.dispatch(
          {
            triggerType: 'LEAVE_REQUEST_SUBMITTED',
            recipientUserId,
            payload: {
              title: 'Permohonan Cuti Baru Memerlukan Persetujuan',
              body: `${exception.employee?.fullName || 'Karyawan'} mengajukan cuti untuk periode ${this.formatDate(start)} s/d ${this.formatDate(end)}.`,
              linkPath: `/exceptions/${exception.id}`,
            },
            relatedEntityType: 'Exception',
            relatedEntityId: exception.id,
            channels: [
              NotificationChannel.Email,
              NotificationChannel.BrowserPush,
            ],
          },
          tx,
        );
      }

      this.logger.log(
        `Permohonan cuti dibuat oleh user ${user.userId} untuk ${this.formatDate(start)} s/d ${this.formatDate(end)} (id: ${exception.id})`,
      );

      return {
        ...exception,
        availableActions: this.computeAvailableActions(exception, user, false),
      };
    });
  }

  /**
   * EPIC-10-T1: Create Holiday (SAD §10.6, BR-18, FR-46).
   * Dibuat oleh SystemAdmin / HRGA. Langsung berstatus Approved dan employeeUserId bernilai null.
   */
  async createHoliday(user: CurrentUserPayload, dto: CreateHolidayDto) {
    const start = new Date(dto.dateStart);
    const end = new Date(dto.dateEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BusinessRuleViolationException(
        'Format tanggal dateStart atau dateEnd tidak valid',
        [{ field: 'dateStart', reason: 'INVALID_DATE' }],
      );
    }

    if (start > end) {
      throw new BusinessRuleViolationException(
        'Tanggal mulai (dateStart) tidak boleh lebih besar dari tanggal akhir (dateEnd)',
        [{ field: 'dateStart', reason: 'DATE_START_AFTER_DATE_END' }],
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const holiday = await tx.exception.create({
        data: {
          type: ExceptionType.Holiday,
          employeeUserId: null,
          dateStart: start,
          dateEnd: end,
          status: ExceptionStatus.Approved, // Valid langsung (BR-18)
          reason: dto.reason,
          createdByUserId: user.userId,
        },
        include: {
          createdBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'EXCEPTION_HOLIDAY_CREATED',
          relatedEntityType: 'Exception',
          relatedEntityId: holiday.id,
          valueAfter: holiday,
        },
        tx,
      );

      this.logger.log(
        `Hari libur baru dibuat oleh ${user.userId}: '${dto.reason}' (${this.formatDate(start)} s/d ${this.formatDate(end)})`,
      );

      return {
        ...holiday,
        availableActions: this.computeAvailableActions(holiday, user, false),
      };
    });
  }

  /**
   * EPIC-10-T1: Create Individual Exemption (SAD §10.6, BR-18, FR-46).
   * Dibuat oleh SystemAdmin / HRGA untuk karyawan tertentu. Langsung berstatus Approved.
   */
  async createExemption(user: CurrentUserPayload, dto: CreateExemptionDto) {
    const start = new Date(dto.dateStart);
    const end = new Date(dto.dateEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BusinessRuleViolationException(
        'Format tanggal dateStart atau dateEnd tidak valid',
        [{ field: 'dateStart', reason: 'INVALID_DATE' }],
      );
    }

    if (start > end) {
      throw new BusinessRuleViolationException(
        'Tanggal mulai (dateStart) tidak boleh lebih besar dari tanggal akhir (dateEnd)',
        [{ field: 'dateStart', reason: 'DATE_START_AFTER_DATE_END' }],
      );
    }

    const employee = await this.prisma.user.findUnique({
      where: { id: dto.employeeUserId },
      select: { id: true, fullName: true, email: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Karyawan dengan ID '${dto.employeeUserId}' tidak ditemukan`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const exemption = await tx.exception.create({
        data: {
          type: ExceptionType.Exemption,
          employeeUserId: dto.employeeUserId,
          dateStart: start,
          dateEnd: end,
          status: ExceptionStatus.Approved, // Valid langsung (BR-18)
          reason: dto.reason,
          createdByUserId: user.userId,
        },
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
          createdBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'EXCEPTION_EXEMPTION_CREATED',
          relatedEntityType: 'Exception',
          relatedEntityId: exemption.id,
          valueAfter: exemption,
        },
        tx,
      );

      this.logger.log(
        `Pengecualian dibuat oleh ${user.userId} untuk karyawan ${dto.employeeUserId} (${this.formatDate(start)} s/d ${this.formatDate(end)})`,
      );

      return {
        ...exemption,
        availableActions: this.computeAvailableActions(exemption, user, false),
      };
    });
  }

  /**
   * EPIC-10-T2: List Exceptions — Scope Filtered (SAD §8.11, §10.6).
   */
  async findAll(user: CurrentUserPayload, query: QueryExceptionsDto) {
    const asOfDate = new Date();
    const where: Prisma.ExceptionWhereInput = {};

    // 1. Penerapan Scope Filtering (SAD §8.11)
    if (user.role === Role.SystemAdmin) {
      // SystemAdmin mengelola data Holiday & Exemption
      where.type = { in: [ExceptionType.Holiday, ExceptionType.Exemption] };
    } else if (user.role === Role.HRGA || user.role === Role.CEO_Management) {
      // Bebas scope pembatas (company-wide)
    } else {
      // Employee, Supervisor_TL, Head, PM: dibatasi scope akses subordinat/divisi + Holiday publik
      const accessibleUserIds =
        await this.scopeFilterService.getAccessibleUserIds(user, asOfDate);

      if (accessibleUserIds !== null) {
        where.OR = [
          { employeeUserId: { in: accessibleUserIds } },
          { type: ExceptionType.Holiday }, // Semua user berhak melihat hari libur perusahaan
        ];
      }
    }

    // 2. Query filter tambahan dari request pengguna
    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.employeeUserId) {
      where.employeeUserId = query.employeeUserId;
    }

    if (query.dateStart) {
      const parsedStart = new Date(query.dateStart);
      if (!isNaN(parsedStart.getTime())) {
        where.dateEnd = { gte: parsedStart };
      }
    }

    if (query.dateEnd) {
      const parsedEnd = new Date(query.dateEnd);
      if (!isNaN(parsedEnd.getTime())) {
        where.dateStart = { lte: parsedEnd };
      }
    }

    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const [totalItems, exceptions] = await Promise.all([
      this.prisma.exception.count({ where }),
      this.prisma.exception.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateStart: 'desc' },
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
          approvedBy: { select: { id: true, fullName: true, email: true } },
          createdBy: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // Hitung availableActions untuk masing-masing item
    const dataWithActions = await Promise.all(
      exceptions.map(async (exc) => {
        let isApprover = false;
        if (exc.employeeUserId && exc.employeeUserId !== user.userId) {
          isApprover = await this.isAuthorizedApprover(
            user,
            exc.employeeUserId,
            asOfDate,
          );
        }
        return {
          ...exc,
          availableActions: this.computeAvailableActions(exc, user, isApprover),
        };
      }),
    );

    return {
      data: dataWithActions,
      meta: {
        totalItems,
        totalPages,
        page,
        limit,
      },
    };
  }

  /**
   * EPIC-10-T2: Detail Exception — Scope Filtered (SAD §7.7, §8.11, §10.6).
   * Merespons 404 jika di luar scope visibility.
   */
  async findById(user: CurrentUserPayload, id: string) {
    const asOfDate = new Date();
    const exception = await this.prisma.exception.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, fullName: true, email: true } },
        approvedBy: { select: { id: true, fullName: true, email: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!exception) {
      throw new NotFoundException(
        'Data Exception tidak ditemukan atau berada di luar cakupan akses',
      );
    }

    // Holiday bersifat publik untuk seluruh karyawan
    if (exception.type === ExceptionType.Holiday) {
      return {
        ...exception,
        availableActions: this.computeAvailableActions(exception, user, false),
      };
    }

    // SystemAdmin hanya boleh melihat Holiday dan Exemption
    if (user.role === Role.SystemAdmin) {
      if (exception.type !== ExceptionType.Exemption) {
        throw new NotFoundException(
          'Data Exception tidak ditemukan atau berada di luar cakupan akses',
        );
      }
      return {
        ...exception,
        availableActions: this.computeAvailableActions(exception, user, false),
      };
    }

    // Verifikasi scope visibility pengguna
    if (exception.employeeUserId) {
      const inScope = await this.scopeFilterService.isUserInScope(
        user,
        exception.employeeUserId,
        asOfDate,
      );

      if (!inScope) {
        throw new NotFoundException(
          'Data Exception tidak ditemukan atau berada di luar cakupan akses',
        );
      }
    }

    let isApprover = false;
    if (exception.employeeUserId && exception.employeeUserId !== user.userId) {
      isApprover = await this.isAuthorizedApprover(
        user,
        exception.employeeUserId,
        asOfDate,
      );
    }

    return {
      ...exception,
      availableActions: this.computeAvailableActions(exception, user, isApprover),
    };
  }

  /**
   * EPIC-10-T3: Approve Leave Request (SAD §10.6, FR-47).
   * Hanya dapat dilakukan oleh Authorized Reviewer untuk permohonan cuti (Leave) berstatus Pending.
   */
  async approveLeave(user: CurrentUserPayload, id: string) {
    const asOfDate = new Date();
    const exception = await this.prisma.exception.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!exception) {
      throw new NotFoundException('Permohonan cuti tidak ditemukan');
    }

    if (exception.type !== ExceptionType.Leave) {
      throw new ConflictException(
        'Aksi persetujuan hanya berlaku untuk permohonan cuti (Leave)',
      );
    }

    if (exception.status !== ExceptionStatus.Pending) {
      throw new ConflictException(
        `Permohonan cuti tidak dapat disetujui karena berada dalam status '${exception.status}' (hanya diizinkan untuk status 'Pending')`,
      );
    }

    if (!exception.employeeUserId) {
      throw new ConflictException('Permohonan cuti tidak memiliki data karyawan');
    }

    // Karyawan tidak boleh menyetujui cutinya sendiri
    if (exception.employeeUserId === user.userId) {
      throw new ForbiddenException(
        'Karyawan tidak memiliki kewenangan menyetujui permohonan cuti miliknya sendiri',
      );
    }

    // Verifikasi wewenang peninjau
    const isAuthorized = await this.isAuthorizedApprover(
      user,
      exception.employeeUserId,
      asOfDate,
    );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Anda tidak memiliki wewenang (Authorized Approver) untuk menyetujui permohonan cuti ini',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.exception.update({
        where: { id },
        data: {
          status: ExceptionStatus.Approved,
          approvedByUserId: user.userId,
        },
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
          approvedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'EXCEPTION_LEAVE_APPROVED',
          relatedEntityType: 'Exception',
          relatedEntityId: exception.id,
          valueBefore: { status: exception.status },
          valueAfter: {
            status: updated.status,
            approvedByUserId: user.userId,
          },
        },
        tx,
      );

      // Kirim notifikasi hasil persetujuan cuti ke karyawan (SAD §12.1 trigger #13)
      await this.notificationService.dispatch(
        {
          triggerType: 'LEAVE_REQUEST_RESOLVED',
          recipientUserId: exception.employeeUserId!,
          payload: {
            title: '[DISETUJUI] Permohonan Cuti Disetujui',
            body: `Permohonan cuti Anda untuk periode ${this.formatDate(exception.dateStart)} s/d ${this.formatDate(exception.dateEnd)} telah disetujui oleh ${user.email}.`,
            linkPath: `/exceptions/${exception.id}`,
          },
          relatedEntityType: 'Exception',
          relatedEntityId: exception.id,
          channels: [
            NotificationChannel.Email,
            NotificationChannel.WebNotificationCenter,
          ],
        },
        tx,
      );

      this.logger.log(
        `Permohonan cuti ${exception.id} milik ${exception.employeeUserId} disetujui oleh reviewer ${user.userId}`,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, user, true),
      };
    });
  }

  /**
   * EPIC-10-T3: Reject Leave Request (SAD §10.6, FR-47).
   * Hanya dapat dilakukan oleh Authorized Reviewer untuk permohonan cuti (Leave) berstatus Pending.
   */
  async rejectLeave(
    user: CurrentUserPayload,
    id: string,
    dto: RejectLeaveDto,
  ) {
    const asOfDate = new Date();
    const exception = await this.prisma.exception.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!exception) {
      throw new NotFoundException('Permohonan cuti tidak ditemukan');
    }

    if (exception.type !== ExceptionType.Leave) {
      throw new ConflictException(
        'Aksi penolakan hanya berlaku untuk permohonan cuti (Leave)',
      );
    }

    if (exception.status !== ExceptionStatus.Pending) {
      throw new ConflictException(
        `Permohonan cuti tidak dapat ditolak karena berada dalam status '${exception.status}' (hanya diizinkan untuk status 'Pending')`,
      );
    }

    if (!exception.employeeUserId) {
      throw new ConflictException('Permohonan cuti tidak memiliki data karyawan');
    }

    // Karyawan tidak boleh menolak cutinya sendiri
    if (exception.employeeUserId === user.userId) {
      throw new ForbiddenException(
        'Karyawan tidak memiliki kewenangan menolak permohonan cuti miliknya sendiri',
      );
    }

    // Verifikasi wewenang peninjau
    const isAuthorized = await this.isAuthorizedApprover(
      user,
      exception.employeeUserId,
      asOfDate,
    );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Anda tidak memiliki wewenang (Authorized Approver) untuk menolak permohonan cuti ini',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.exception.update({
        where: { id },
        data: {
          status: ExceptionStatus.Rejected,
          approvedByUserId: user.userId, // Ditandai oleh reviewer yang menolak
        },
        include: {
          employee: { select: { id: true, fullName: true, email: true } },
          approvedBy: { select: { id: true, fullName: true, email: true } },
        },
      });

      await this.auditService.record(
        {
          actorUserId: user.userId,
          action: 'EXCEPTION_LEAVE_REJECTED',
          relatedEntityType: 'Exception',
          relatedEntityId: exception.id,
          valueBefore: { status: exception.status },
          valueAfter: {
            status: updated.status,
            rejectionReason: dto.rejectionReason,
            approvedByUserId: user.userId,
          },
        },
        tx,
      );

      // Kirim notifikasi penolakan cuti ke karyawan (SAD §12.1 trigger #13)
      await this.notificationService.dispatch(
        {
          triggerType: 'LEAVE_REQUEST_RESOLVED',
          recipientUserId: exception.employeeUserId!,
          payload: {
            title: '[DITOLAK] Permohonan Cuti Ditolak',
            body: `Permohonan cuti Anda untuk periode ${this.formatDate(exception.dateStart)} s/d ${this.formatDate(exception.dateEnd)} telah ditolak. Alasan: ${dto.rejectionReason}`,
            linkPath: `/exceptions/${exception.id}`,
          },
          relatedEntityType: 'Exception',
          relatedEntityId: exception.id,
          channels: [
            NotificationChannel.Email,
            NotificationChannel.WebNotificationCenter,
          ],
        },
        tx,
      );

      this.logger.log(
        `Permohonan cuti ${exception.id} milik ${exception.employeeUserId} ditolak oleh reviewer ${user.userId}. Alasan: ${dto.rejectionReason}`,
      );

      return {
        ...updated,
        availableActions: this.computeAvailableActions(updated, user, true),
      };
    });
  }
}
