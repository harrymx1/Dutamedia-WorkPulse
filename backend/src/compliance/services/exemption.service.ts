import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { NotificationChannel } from '@prisma/client';
import {
  CreateBoundedExemptionDto,
  UpdateBoundedExemptionDto,
} from '../dto/create-exemption.dto';

function formatExemptionPeriod(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const startLabel = fmt.format(start);
  const endLabel = fmt.format(end);
  return startLabel === endLabel ? startLabel : `${startLabel} s/d ${endLabel}`;
}

@Injectable()
export class ExemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mendaftarkan dispensasi akuntabilitas individual (Dinas Luar, Pelatihan, dll - Prototipe 12).
   */
  async createBoundedExemption(
    createdByUserId: string,
    dto: CreateBoundedExemptionDto,
  ) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const trimmedReason = (dto.reason || '').trim();
    if (trimmedReason.length < 5) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Alasan resmi dispensasi minimal 5 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!targetUser) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Karyawan penerima dispensasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (this.prisma.boundedExemption.findFirst) {
      const overlapping = await this.prisma.boundedExemption.findFirst({
        where: {
          userId: dto.userId,
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });
      if (overlapping) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message:
            'Karyawan tersebut sudah memiliki dispensasi pada rentang tanggal yang bertumpuk.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    const trimmedCategory = dto.exemptionCategory.trim();

    const created = await this.prisma.boundedExemption.create({
      data: {
        userId: dto.userId,
        startDate: start,
        endDate: end,
        exemptionCategory: trimmedCategory,
        officialReferenceNumber: dto.officialReferenceNumber?.trim() || null,
        reason: trimmedReason,
        createdByUserId,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        createdByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (this.prisma.notification?.create) {
      const periodLabel = formatExemptionPeriod(start, end);
      const creatorName = created.createdByUser?.fullName || 'Tim HRGA / Pimpinan';

      await this.prisma.notification.create({
        data: {
          recipientUserId: dto.userId,
          triggerType: 'EXEMPTION_GRANTED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Dispensasi Resmi Didaftarkan (${trimmedCategory})`,
          message: `${creatorName} mendaftarkan dispensasi ${trimmedCategory} untuk Anda pada periode ${periodLabel}. Anda dibebaskan otomatis dari pengisian komitmen harian. Alasan: ${trimmedReason}`,
          actionUrl: '/daily/history',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: created.id,
        },
      });
    }

    return created;
  }

  /**
   * Mengubah catatan dispensasi resmi yang sudah terdaftar (DEC-018).
   */
  async updateBoundedExemption(
    actorUserId: string,
    id: string,
    dto: UpdateBoundedExemptionDto,
  ) {
    const existing = await this.prisma.boundedExemption.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existing) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Data dispensasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const nextUserId = dto.userId ?? existing.userId;
    const start = dto.startDate ? new Date(dto.startDate) : new Date(existing.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : new Date(existing.endDate);

    if (end < start) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const trimmedReason =
      dto.reason !== undefined ? dto.reason.trim() : existing.reason;
    if (trimmedReason.length < 5) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Alasan resmi dispensasi minimal 5 karakter.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const trimmedCategory =
      dto.exemptionCategory !== undefined
        ? dto.exemptionCategory.trim()
        : existing.exemptionCategory;
    if (!trimmedCategory) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Kategori pengecualian tidak boleh kosong.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (this.prisma.boundedExemption.findFirst) {
      const overlapping = await this.prisma.boundedExemption.findFirst({
        where: {
          id: { not: id },
          userId: nextUserId,
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });
      if (overlapping) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message:
            'Karyawan tersebut sudah memiliki dispensasi lain pada rentang tanggal yang bertumpuk.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    const updated = await this.prisma.boundedExemption.update({
      where: { id },
      data: {
        userId: nextUserId,
        startDate: start,
        endDate: end,
        exemptionCategory: trimmedCategory,
        officialReferenceNumber:
          dto.officialReferenceNumber !== undefined
            ? dto.officialReferenceNumber.trim() || null
            : existing.officialReferenceNumber,
        reason: trimmedReason,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        createdByUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (this.prisma.notification?.create) {
      const actor = this.prisma.user?.findUnique
        ? await this.prisma.user.findUnique({
            where: { id: actorUserId },
            select: { fullName: true },
          })
        : null;
      const actorName = actor?.fullName || 'Tim HRGA / Pimpinan';
      const periodLabel = formatExemptionPeriod(start, end);

      await this.prisma.notification.create({
        data: {
          recipientUserId: nextUserId,
          triggerType: 'EXEMPTION_UPDATED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Data Dispensasi Diperbarui (${trimmedCategory})`,
          message: `${actorName} memperbarui data dispensasi ${trimmedCategory} Anda menjadi periode ${periodLabel}. Alasan: ${trimmedReason}`,
          actionUrl: '/daily/history',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: updated.id,
        },
      });
    }

    return updated;
  }

  /**
   * Menghapus catatan dispensasi resmi dari sistem (DEC-018).
   */
  async deleteBoundedExemption(actorUserId: string, id: string) {
    const existing = await this.prisma.boundedExemption.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });

    if (!existing) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Data dispensasi tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.prisma.boundedExemption.delete({
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
      const periodLabel = formatExemptionPeriod(
        new Date(existing.startDate),
        new Date(existing.endDate),
      );

      await this.prisma.notification.create({
        data: {
          recipientUserId: existing.userId,
          triggerType: 'EXEMPTION_DELETED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Catatan Dispensasi Dihapus (${existing.exemptionCategory})`,
          message: `${actorName} menghapus catatan dispensasi ${existing.exemptionCategory} Anda untuk periode ${periodLabel}. Jadwal akuntabilitas harian normal berlaku kembali.`,
          actionUrl: '/daily/history',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: id,
        },
      });
    }

    return { deleted: true, id };
  }

  /**
   * Mengambil daftar seluruh pengecualian / dispensasi aktif (Prototipe 12).
   */
  async getBoundedExemptions(userId?: string) {
    return this.prisma.boundedExemption.findMany({
      where: {
        ...(userId && { userId }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        createdByUser: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });
  }
}

