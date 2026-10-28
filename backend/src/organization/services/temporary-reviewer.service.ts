import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemporaryReviewerDto } from '../dto/temporary-reviewer.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { CanonicalFunction } from '@prisma/client';

@Injectable()
export class TemporaryReviewerService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemporaryReviewer(
    dto: CreateTemporaryReviewerDto,
    adminUserId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.delegateUserId },
    });

    if (!user) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna penerima delegasi reviewer tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const effectiveDate = new Date(dto.effectiveDate);
    const expiryDate = new Date(dto.expiryDate);

    if (expiryDate < effectiveDate) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Batas tanggal kedaluwarsa delegasi tidak boleh mendahului tanggal efektif.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return await this.prisma.temporaryReviewerAssignment.create({
      data: {
        delegateUserId: dto.delegateUserId,
        targetFunction: dto.targetFunction,
        delegationReason: dto.delegationReason.trim(),
        effectiveDate,
        expiryDate,
        createdByUserId: adminUserId,
      },
      include: {
        delegateUser: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async listTemporaryReviewers(options: {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.activeOnly) {
      const today = new Date();
      where.effectiveDate = { lte: today };
      where.expiryDate = { gte: today };
    }

    const [totalRecords, data] = await Promise.all([
      this.prisma.temporaryReviewerAssignment.count({ where }),
      this.prisma.temporaryReviewerAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { effectiveDate: 'desc' },
        include: {
          delegateUser: { select: { id: true, fullName: true, email: true } },
          createdBy: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    };
  }

  async getActiveDelegationsForFunction(
    targetFunction: CanonicalFunction,
    targetDate = new Date(),
  ) {
    return await this.prisma.temporaryReviewerAssignment.findMany({
      where: {
        targetFunction,
        effectiveDate: { lte: targetDate },
        expiryDate: { gte: targetDate },
      },
      include: {
        delegateUser: true,
      },
    });
  }

  async getActiveDelegationsForUser(userId: string, targetDate = new Date()) {
    return await this.prisma.temporaryReviewerAssignment.findMany({
      where: {
        delegateUserId: userId,
        effectiveDate: { lte: targetDate },
        expiryDate: { gte: targetDate },
      },
    });
  }
}
