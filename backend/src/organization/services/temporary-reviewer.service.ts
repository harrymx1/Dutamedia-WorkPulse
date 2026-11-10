import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTemporaryReviewerDto,
  UpdateTemporaryReviewerDto,
  RevokeTemporaryReviewerDto,
} from '../dto/temporary-reviewer.dto';
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

      // Cari data pejabat penerbit delegasi (Admin / HRGA)
      const adminUser = await this.prisma.user.findUnique({
        where: { id: adminUserId },
        select: { id: true, fullName: true, email: true },
      });
      const issuerName = adminUser?.fullName || 'Administrator / HRGA';

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
      const cleanReason = dto.delegationReason.replace(/\[Menggantikan\s+[^\]]+\]\s*/i, '').trim() || dto.delegationReason;

      // 1. Notifikasi In-App untuk Pejabat Penerima Delegasi (Pejabat Pengganti)
      const delegateMessage = [
        replacedName
          ? `Anda telah resmi diberikan pelimpahan wewenang sebagai Reviewer Sementara untuk Divisi ${dto.targetFunction} menggantikan ${replacedName}.`
          : `Anda telah resmi diberikan pelimpahan wewenang sebagai Reviewer Sementara untuk Divisi ${dto.targetFunction}.`,
        'Cakupan Wewenang: Persetujuan cuti dan review koreksi komitmen tim',
        `Divisi Wewenang: ${dto.targetFunction}`,
        replacedName ? `Menggantikan: ${replacedName}` : null,
        `Periode Berlaku: ${effStr} s/d ${expStr}`,
        `Alasan Pelimpahan: "${cleanReason}"`,
        `Diterbitkan Oleh: ${issuerName}`,
      ].filter(Boolean).join('\n');

      await this.prisma.notification.create({
        data: {
          recipientUserId: dto.delegateUserId,
          triggerType: 'TEMPORARY_REVIEWER_ASSIGNED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: 'Penugasan Reviewer Sementara Baru',
          message: delegateMessage,
          actionUrl: '/leave/queue',
          relatedEntityType: 'temporary_reviewer_assignments',
          relatedEntityId: assignment.id,
        },
      });

      // 2. Notifikasi In-App untuk Pejabat yang Digantikan
      if (replacedUser && replacedUser.id !== dto.delegateUserId) {
        const replacedMessage = [
          `Wewenang peninjauan Anda untuk Divisi ${dto.targetFunction} telah resmi dialihkan sementara kepada ${delegateName} selama masa berhalangan hadir.`,
          'Cakupan Wewenang: Persetujuan cuti dan review koreksi komitmen tim',
          `Divisi Wewenang: ${dto.targetFunction}`,
          `Pejabat Pengganti: ${delegateName}`,
          `Periode Pelimpahan: ${effStr} s/d ${expStr}`,
          `Alasan Pelimpahan: "${cleanReason}"`,
          `Diterbitkan Oleh: ${issuerName}`,
        ].join('\n');

        await this.prisma.notification.create({
          data: {
            recipientUserId: replacedUser.id,
            triggerType: 'TEMPORARY_REVIEWER_DELEGATED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Pemberitahuan Pelimpahan Wewenang Peninjauan',
            message: replacedMessage,
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

  async updateTemporaryReviewer(
    id: string,
    dto: UpdateTemporaryReviewerDto,
    adminUserId: string,
  ) {
    const assignment = await this.prisma.temporaryReviewerAssignment.findUnique({
      where: { id },
      include: {
        delegateUser: { select: { id: true, fullName: true, email: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!assignment) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pendelegasian reviewer sementara tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, fullName: true, email: true },
    });
    const issuerName = adminUser?.fullName || 'Administrator / HRGA';

    const effectiveDate = dto.effectiveDate ? new Date(dto.effectiveDate) : assignment.effectiveDate;
    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : assignment.expiryDate;

    if (expiryDate < effectiveDate) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Batas tanggal kedaluwarsa delegasi tidak boleh mendahului tanggal efektif mulai.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const baseReason = assignment.delegationReason.replace(/\s*\[Revisi:[^\]]*\]/g, '').trim();
    const updatedReason = `${baseReason} [Revisi: ${dto.updateReason.trim()}]`;

    const updatedAssignment = await this.prisma.temporaryReviewerAssignment.update({
      where: { id },
      data: {
        effectiveDate,
        expiryDate,
        delegationReason: updatedReason,
      },
      include: {
        delegateUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    try {
      const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const effStr = effectiveDate.toLocaleDateString('id-ID', dateOptions);
      const expStr = expiryDate.toLocaleDateString('id-ID', dateOptions);

      // Cari atasan yang digantikan dari reason
      let replacedUser: { id: string; fullName: string; email: string } | null = null;
      const match = assignment.delegationReason.match(/\[Menggantikan\s+([^(]+)/i);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        replacedUser = await this.prisma.user.findFirst({
          where: { fullName: { contains: extractedName, mode: 'insensitive' } },
          select: { id: true, fullName: true, email: true },
        });
      }

      const replacedName = replacedUser ? replacedUser.fullName : `Atasan Divisi ${assignment.targetFunction}`;
      const delegateName = assignment.delegateUser?.fullName || 'Pejabat Pengganti';

      // 1. Notifikasi ke Pengganti
      const updateDelegateMessage = [
        `Ketentuan pelimpahan wewenang peninjauan yang diberikan kepada Anda untuk Divisi ${assignment.targetFunction} (menggantikan ${replacedName}) telah diperbarui oleh pihak manajemen.`,
        'Cakupan Wewenang: Persetujuan cuti dan review koreksi komitmen tim',
        `Divisi Wewenang: ${assignment.targetFunction}`,
        `Menggantikan: ${replacedName}`,
        `Periode Berlaku Baru: ${effStr} s/d ${expStr}`,
        `Alasan Perubahan: "${dto.updateReason.trim()}"`,
        `Diperbarui Oleh: ${issuerName}`,
      ].join('\n');

      await this.prisma.notification.create({
        data: {
          recipientUserId: assignment.delegateUserId,
          triggerType: 'TEMPORARY_REVIEWER_UPDATED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: 'Pembaruan Ketentuan Delegasi Reviewer Sementara',
          message: updateDelegateMessage,
          relatedEntityType: 'temporary_reviewer_assignments',
          relatedEntityId: assignment.id,
        },
      });

      // 2. Notifikasi ke Atasan yang Digantikan
      if (replacedUser && replacedUser.id !== assignment.delegateUserId) {
        const updateReplacedMessage = [
          `Ketentuan pelimpahan wewenang peninjauan Anda untuk Divisi ${assignment.targetFunction} kepada ${delegateName} telah diperbarui oleh pihak manajemen.`,
          'Cakupan Wewenang: Persetujuan cuti dan review koreksi komitmen tim',
          `Divisi Wewenang: ${assignment.targetFunction}`,
          `Pejabat Pengganti: ${delegateName}`,
          `Periode Berlaku Baru: ${effStr} s/d ${expStr}`,
          `Alasan Perubahan: "${dto.updateReason.trim()}"`,
          `Diperbarui Oleh: ${issuerName}`,
        ].join('\n');

        await this.prisma.notification.create({
          data: {
            recipientUserId: replacedUser.id,
            triggerType: 'TEMPORARY_REVIEWER_UPDATED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Pembaruan Ketentuan Pelimpahan Wewenang Peninjauan',
            message: updateReplacedMessage,
            relatedEntityType: 'temporary_reviewer_assignments',
            relatedEntityId: assignment.id,
          },
        });
      }
    } catch (err) {
      console.error('Gagal mengirim notifikasi pembaruan delegasi:', err);
    }

    return updatedAssignment;
  }

  async revokeTemporaryReviewer(
    id: string,
    dto: RevokeTemporaryReviewerDto,
    adminUserId: string,
  ) {
    const assignment = await this.prisma.temporaryReviewerAssignment.findUnique({
      where: { id },
      include: {
        delegateUser: { select: { id: true, fullName: true, email: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!assignment) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pendelegasian reviewer sementara tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, fullName: true, email: true },
    });
    const issuerName = adminUser?.fullName || 'Administrator / HRGA';

    // Hapus pendelegasian dari database
    await this.prisma.temporaryReviewerAssignment.delete({
      where: { id },
    });

    try {
      // Cari atasan yang digantikan dari reason
      let replacedUser: { id: string; fullName: string; email: string } | null = null;
      const match = assignment.delegationReason.match(/\[Menggantikan\s+([^(]+)/i);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        replacedUser = await this.prisma.user.findFirst({
          where: { fullName: { contains: extractedName, mode: 'insensitive' } },
          select: { id: true, fullName: true, email: true },
        });
      }

      const replacedName = replacedUser ? replacedUser.fullName : `Atasan Divisi ${assignment.targetFunction}`;
      const delegateName = assignment.delegateUser?.fullName || 'Pejabat Pengganti';

      // 1. Notifikasi ke Pengganti (Wewenang Dicabut)
      const revokeDelegateMessage = [
        `Pelimpahan wewenang peninjauan untuk Divisi ${assignment.targetFunction} (menggantikan ${replacedName}) yang sebelumnya diberikan kepada Anda telah resmi diakhiri/dicabut. Hak akses persetujuan cuti dan review koreksi komitmen telah dinonaktifkan.`,
        'Status Wewenang: Resmi Dicabut / Diakhiri (Akses Dinonaktifkan)',
        `Divisi Wewenang: ${assignment.targetFunction}`,
        `Pejabat Asli: ${replacedName}`,
        `Alasan Pengakhiran: "${dto.revokeReason.trim()}"`,
        `Diproses Oleh: ${issuerName}`,
      ].join('\n');

      await this.prisma.notification.create({
        data: {
          recipientUserId: assignment.delegateUserId,
          triggerType: 'TEMPORARY_REVIEWER_REVOKED',
          channel: NotificationChannel.IN_APP_CENTER,
          title: 'Pengakhiran Wewenang Reviewer Sementara',
          message: revokeDelegateMessage,
          relatedEntityType: 'temporary_reviewer_assignments',
          relatedEntityId: assignment.id,
        },
      });

      // 2. Notifikasi ke Atasan yang Digantikan (Wewenang Dikembalikan)
      if (replacedUser && replacedUser.id !== assignment.delegateUserId) {
        const revokeReplacedMessage = [
          `Pelimpahan wewenang peninjauan Anda untuk Divisi ${assignment.targetFunction} yang sebelumnya diberikan kepada ${delegateName} telah resmi berakhir. Seluruh wewenang persetujuan cuti dan review koreksi tim kini telah aktif kembali kepada Anda secara penuh.`,
          'Status Wewenang: Dipulihkan Mandiri Secara Penuh',
          `Divisi Wewenang: ${assignment.targetFunction}`,
          `Pejabat Pengganti Sebelumnya: ${delegateName}`,
          `Alasan Pemulihan: "${dto.revokeReason.trim()}"`,
          `Diproses Oleh: ${issuerName}`,
        ].join('\n');

        await this.prisma.notification.create({
          data: {
            recipientUserId: replacedUser.id,
            triggerType: 'TEMPORARY_REVIEWER_REVOKED',
            channel: NotificationChannel.IN_APP_CENTER,
            title: 'Pemulihan Wewenang Peninjauan Mandiri',
            message: revokeReplacedMessage,
            relatedEntityType: 'temporary_reviewer_assignments',
            relatedEntityId: assignment.id,
          },
        });
      }
    } catch (err) {
      console.error('Gagal mengirim notifikasi pencabutan delegasi:', err);
    }

    return { success: true, message: 'Pendelegasian reviewer sementara berhasil dicabut.' };
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

