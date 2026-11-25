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

function formatExemptionPeriod(start: Date, end?: Date | null): string {
  const fmt = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const startLabel = fmt.format(start);
  if (!end) {
    return `Mulai ${startLabel} (Permanen)`;
  }
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
   * Mendaftarkan dispensasi sementara atau pengecualian permanen (DEC-018 & DEC-022).
   */
  async createBoundedExemption(
    createdByUserId: string,
    dto: CreateBoundedExemptionDto,
  ) {
    const start = new Date(dto.startDate);
    const isPermanent = Boolean(dto.isPermanent) || !dto.endDate;
    const end = isPermanent ? null : new Date(dto.endDate as string);

    if (end && end < start) {
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
          ...(end ? { startDate: { lte: end } } : {}),
          OR: [{ endDate: null }, { endDate: { gte: start } }],
        },
      });
      if (overlapping) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message:
            'Karyawan tersebut sudah memiliki dispensasi atau pengecualian aktif pada periode yang bertumpuk.',
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

    if ((this.prisma as any).complianceEvent?.deleteMany) {
      await (this.prisma as any).complianceEvent.deleteMany({
        where: {
          userId: dto.userId,
          eventDate: end ? { gte: start, lte: end } : { gte: start },
        },
      });
    }

    if (this.prisma.notification?.create) {
      const periodLabel = formatExemptionPeriod(start, end);
      const creatorName = created.createdByUser?.fullName || 'Tim HRGA / Pimpinan';
      const titleText = isPermanent
        ? `Pengecualian Permanen Ditetapkan (${trimmedCategory})`
        : `Dispensasi Resmi Didaftarkan (${trimmedCategory})`;
      const blockerNote = isPermanent
        ? ' Anda tetap dapat mengakses Lapor Blocker jika perlu melaporkan kendala.'
        : '';

      await this.prisma.notification.create({
        data: {
          recipientUserId: dto.userId,
          triggerType: 'EXEMPTION_GRANTED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: titleText,
          message: `${creatorName} mendaftarkan ${isPermanent ? 'pengecualian permanen' : 'dispensasi'} ${trimmedCategory} untuk Anda (${periodLabel}). Anda dibebaskan otomatis dari pengisian komitmen harian.${blockerNote} Alasan: ${trimmedReason}`,
          actionUrl: '/daily/history',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: created.id,
        },
      });
    }

    return created;
  }

  /**
   * Mengubah catatan dispensasi / pengecualian permanen yang sudah terdaftar (DEC-018 & DEC-022).
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

    let end: Date | null;
    if (dto.isPermanent === true || dto.endDate === null || dto.endDate === '') {
      end = null;
    } else if (dto.endDate) {
      end = new Date(dto.endDate);
    } else if (dto.isPermanent === false && !existing.endDate) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Tanggal selesai wajib diisi jika bukan pengecualian permanen.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    } else {
      end = existing.endDate ? new Date(existing.endDate) : null;
    }

    if (end && end < start) {
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
          ...(end ? { startDate: { lte: end } } : {}),
          OR: [{ endDate: null }, { endDate: { gte: start } }],
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

    if ((this.prisma as any).complianceEvent?.deleteMany) {
      await (this.prisma as any).complianceEvent.deleteMany({
        where: {
          userId: nextUserId,
          eventDate: end ? { gte: start, lte: end } : { gte: start },
        },
      });
    }

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
          message: `${actorName} memperbarui data dispensasi ${trimmedCategory} Anda menjadi ${periodLabel}. Alasan: ${trimmedReason}`,
          actionUrl: '/daily/history',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: updated.id,
        },
      });
    }

    return updated;
  }

  /**
   * Menghapus catatan dispensasi resmi dari sistem (DEC-018 & DEC-022).
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
        existing.endDate ? new Date(existing.endDate) : null,
      );

      await this.prisma.notification.create({
        data: {
          recipientUserId: existing.userId,
          triggerType: 'EXEMPTION_DELETED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Catatan Dispensasi Dihapus (${existing.exemptionCategory})`,
          message: `${actorName} menghapus catatan dispensasi ${existing.exemptionCategory} Anda (${periodLabel}). Jadwal akuntabilitas harian normal berlaku kembali.`,
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

