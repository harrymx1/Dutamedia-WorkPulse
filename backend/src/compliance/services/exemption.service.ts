import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
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

    return this.prisma.boundedExemption.create({
      data: {
        userId: dto.userId,
        startDate: start,
        endDate: end,
        exemptionCategory: dto.exemptionCategory.trim(),
        officialReferenceNumber: dto.officialReferenceNumber?.trim() || null,
        reason: dto.reason.trim(),
        createdByUserId,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        createdByUser: { select: { id: true, fullName: true, email: true } },
      },
    });
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

