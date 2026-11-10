import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemporaryReviewerDto } from '../dto/temporary-reviewer.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { CanonicalFunction, NotificationChannel } from '@prisma/client';

@Injectable()
export class TemporaryReviewerService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemporaryReviewer(
    dto: CreateTemporaryReviewerDto,
    adminUserId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.delegateUserId },
      include: {
        orgAssignments: {
          where: { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna penerima delegasi reviewer tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (
      user.email === 'admin@dutamedia.com' ||
      user.orgAssignments?.[0]?.role === 'SYSTEM_ADMIN'
    ) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Akun System Administrator tidak dapat ditunjuk sebagai reviewer operasional (Prinsip Separation of Duties).',
        statusCode: HttpStatus.BAD_REQUEST,
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

    const assignment = await this.prisma.temporaryReviewerAssignment.create({
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

    try {
      // Format tanggal Indonesia untuk notifikasi
      const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const effStr = effectiveDate.toLocaleDateString('id-ID', dateOptions);
      const expStr = expiryDate.toLocaleDateString('id-ID', dateOptions);

      // Cari data pejabat yang digantikan
      let replacedUser: { id: string; fullName: string; email: string } | null = null;
      if (dto.replacedUserId) {
        replacedUser = await this.prisma.user.findUnique({
          where: { id: dto.replacedUserId },
          select: { id: true, fullName: true, email: true },
        });
      } else {
        // Fallback: ekstrak nama dari format "[Menggantikan Nama (Jabatan)]"
        const match = dto.delegationReason.match(/\[Menggantikan\s+([^(]+)/i);
        if (match && match[1]) {
          const extractedName = match[1].trim();
          replacedUser = await this.prisma.user.findFirst({
            where: { fullName: { contains: extractedName, mode: 'insensitive' } },
            select: { id: true, fullName: true, email: true },
          });
        }
      }

      const replacedName = replacedUser ? replacedUser.fullName : null;
      const delegateName = assignment.delegateUser?.fullName || 'Pejabat Pengganti';

      // 1. Notifikasi In-App untuk Pejabat Penerima Delegasi (Pejabat Pengganti)
      await this.prisma.notification.create({
        data: {
          recipientUserId: dto.delegateUserId,
          triggerType: 'TEMPORARY_REVIEWER_ASSIGNED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: 'Penugasan Reviewer Sementara Baru',
          message: replacedName
            ? `Anda telah resmi ditugaskan sebagai Reviewer Sementara untuk Divisi ${dto.targetFunction} menggantikan ${replacedName} pada periode ${effStr} s/d ${expStr}.`
            : `Anda telah resmi ditugaskan sebagai Reviewer Sementara untuk Divisi ${dto.targetFunction} pada periode ${effStr} s/d ${expStr}.`,
          actionUrl: '/leave/queue',
          relatedEntityType: 'temporary_reviewer_assignments',
          relatedEntityId: assignment.id,
        },
      });

      // 2. Notifikasi In-App untuk Pejabat yang Digantikan
      if (replacedUser && replacedUser.id !== dto.delegateUserId) {
        await this.prisma.notification.create({
          data: {
            recipientUserId: replacedUser.id,
            triggerType: 'TEMPORARY_REVIEWER_DELEGATED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Pemberitahuan Pelimpahan Wewenang Peninjauan',
            message: `Wewenang peninjauan Anda untuk Divisi ${dto.targetFunction} telah resmi didelegasikan sementara kepada ${delegateName} pada periode ${effStr} s/d ${expStr}.`,
            actionUrl: '/notifications',
            relatedEntityType: 'temporary_reviewer_assignments',
            relatedEntityId: assignment.id,
          },
        });
      }
    } catch (notifErr) {
      // Logging error notifikasi tanpa menggagalkan transaksi delegasi utama
      console.error('Gagal mengirimkan notifikasi pendelegasian wewenang:', notifErr);
    }

    return assignment;
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
          delegateUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
              orgAssignments: {
                where: { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
                orderBy: { effectiveDate: 'desc' },
                take: 1,
                select: { role: true, function: true, jobTitle: true },
              },
            },
          },
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

