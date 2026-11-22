import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { NotificationChannel } from '@prisma/client';
import { CreateBoundedExemptionDto } from '../dto/create-exemption.dto';

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
      const fmt = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const startLabel = fmt.format(start);
      const endLabel = fmt.format(end);
      const periodLabel =
        startLabel === endLabel ? startLabel : `${startLabel} s/d ${endLabel}`;
      const creatorName = created.createdByUser?.fullName || 'Tim HRGA / Pimpinan';

      await this.prisma.notification.create({
        data: {
          recipientUserId: dto.userId,
          triggerType: 'EXEMPTION_GRANTED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: `Dispensasi Resmi Didaftarkan (${trimmedCategory})`,
          message: `${creatorName} mendaftarkan dispensasi ${trimmedCategory} untuk Anda pada periode ${periodLabel}. Alasan: ${trimmedReason}`,
          actionUrl: '/notifications',
          relatedEntityType: 'bounded_exemptions',
          relatedEntityId: created.id,
        },
      });
    }

    return created;
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

