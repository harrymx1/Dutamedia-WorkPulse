import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTemporaryReviewerDto,
  UpdateTemporaryReviewerDto,
  RevokeTemporaryReviewerDto,
} from '../dto/temporary-reviewer.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  CanonicalFunction,
  CanonicalRole,
  NotificationChannel,
  UserStatus,
} from '@prisma/client';
import { toJakartaDateOnly } from '../../common/time/date-only.util';

@Injectable()
export class TemporaryReviewerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengirim notifikasi transparansi kepada seluruh anggota tim (bawahan) pada divisi target.
   * Cakupan penerima sengaja disamakan dengan cakupan wewenang reviewer sementara
   * (seluruh anggota aktif divisi target), kecuali pihak yang sudah diberi notifikasi khusus,
   * penerbit delegasi, dan akun System Administrator.
   * Alasan delegasi sengaja TIDAK disertakan demi menjaga privasi pejabat yang berhalangan.
   * Kegagalan pengiriman tidak boleh menggagalkan proses delegasi utama.
   */
  private async notifyTeamMembers(params: {
    targetFunction: CanonicalFunction;
    excludeUserIds: Array<string | null | undefined>;
    triggerType: string;
    title: string;
    message: string;
    assignmentId: string;
  }): Promise<void> {
    try {
      const today = toJakartaDateOnly();
      const excluded = params.excludeUserIds.filter((id): id is string => Boolean(id));

      const members = await this.prisma.organizationalAssignment.findMany({
        where: {
          function: params.targetFunction,
          role: {
            notIn: [
              CanonicalRole.SYSTEM_ADMIN,
              CanonicalRole.CEO_MANAGEMENT,
              CanonicalRole.HEAD,
            ],
          },
          effectiveDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
          userId: { notIn: excluded },
          user: { status: UserStatus.ACTIVE },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      if (members.length === 0) return;

      await this.prisma.notification.createMany({
        data: members.map((m) => ({
          recipientUserId: m.userId,
          triggerType: params.triggerType,
          channel: NotificationChannel.IN_APP_CENTER,
          title: params.title,
          message: params.message,
          relatedEntityType: 'temporary_reviewer_assignments',
          relatedEntityId: params.assignmentId,
        })),
      });
    } catch (err) {
      console.error('Gagal mengirim notifikasi transparansi ke anggota tim:', err);
    }
  }

  async createTemporaryReviewer(
    dto: CreateTemporaryReviewerDto,
    adminUserId: string,
  ) {
    const today = toJakartaDateOnly();
    const user = await this.prisma.user.findUnique({
      where: { id: dto.delegateUserId },
      include: {
        orgAssignments: {
          where: { OR: [{ endDate: null }, { endDate: { gte: today } }] },
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

    if (user.status && user.status !== UserStatus.ACTIVE) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Hanya pengguna berstatus AKTIF yang dapat ditunjuk sebagai penerima delegasi reviewer sementara.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.replacedUserId && dto.replacedUserId === dto.delegateUserId) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Pejabat yang berhalangan tidak dapat mendelegasikan wewenang peninjauan kepada dirinya sendiri.',
        statusCode: HttpStatus.BAD_REQUEST,
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

    if (this.prisma.temporaryReviewerAssignment?.findFirst) {
      const overlapping = await this.prisma.temporaryReviewerAssignment.findFirst({
        where: {
          delegateUserId: dto.delegateUserId,
          targetFunction: dto.targetFunction,
          effectiveDate: { lte: expiryDate },
          expiryDate: { gte: effectiveDate },
        },
      });

      if (overlapping) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message: `Pejabat pengganti ini sudah memiliki mandat reviewer sementara yang bersinggungan untuk Divisi ${dto.targetFunction} pada rentang tanggal tersebut. Silakan gunakan tombol Edit pada delegasi yang sudah ada.`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
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

      // 3. Notifikasi Transparansi untuk Seluruh Anggota Tim (Bawahan) pada Divisi Target
      await this.notifyTeamMembers({
        targetFunction: dto.targetFunction,
        excludeUserIds: [dto.delegateUserId, replacedUser?.id, adminUserId],
        triggerType: 'TEMPORARY_REVIEWER_TEAM_NOTICE',
        title: 'Pelimpahan Wewenang Peninjauan Atasan Tim Anda',
        message: [
          `Selama atasan Anda ${replacedName ?? `Divisi ${dto.targetFunction}`} berhalangan, wewenang peninjauan dan persetujuan dialihkan sementara kepada ${delegateName}. Permohonan cuti dan koreksi komitmen Anda pada periode ini akan ditinjau oleh ${delegateName}.`,
          'Cakupan Wewenang: Persetujuan cuti dan review koreksi komitmen tim',
          `Divisi Wewenang: ${dto.targetFunction}`,
          replacedName ? `Atasan Berhalangan: ${replacedName}` : null,
          `Pejabat Pengganti: ${delegateName}`,
          `Periode Pelimpahan: ${effStr} s/d ${expStr}`,
          `Diterbitkan Oleh: ${issuerName}`,
        ].filter(Boolean).join('\n'),
        assignmentId: assignment.id,
      });
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

    if (this.prisma.temporaryReviewerAssignment?.findFirst) {
      const overlapping = await this.prisma.temporaryReviewerAssignment.findFirst({
        where: {
          id: { not: id },
          delegateUserId: assignment.delegateUserId,
          targetFunction: assignment.targetFunction,
          effectiveDate: { lte: expiryDate },
          expiryDate: { gte: effectiveDate },
        },
      });

      if (overlapping) {
        throw new AppException({
          code: ErrorCode.RESOURCE_CONFLICT,
          message: `Rentang tanggal baru bersinggungan dengan mandat reviewer sementara lain milik pejabat pengganti ini di Divisi ${assignment.targetFunction}.`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
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

      // 3. Notifikasi Transparansi untuk Seluruh Anggota Tim (Bawahan)
      await this.notifyTeamMembers({
        targetFunction: assignment.targetFunction,
        excludeUserIds: [assignment.delegateUserId, replacedUser?.id, adminUserId],
        triggerType: 'TEMPORARY_REVIEWER_TEAM_NOTICE',
        title: 'Pembaruan Masa Pelimpahan Wewenang Atasan Tim Anda',
        message: [
          `Masa pelimpahan wewenang peninjauan atasan Anda (${replacedName}) kepada ${delegateName} telah diperbarui. Permohonan cuti dan koreksi komitmen Anda tetap ditinjau oleh ${delegateName} selama periode berikut.`,
          'Cakupan Wewenang: Persetujuan cuti dan review koreksi komitmen tim',
          `Divisi Wewenang: ${assignment.targetFunction}`,
          `Atasan Berhalangan: ${replacedName}`,
          `Pejabat Pengganti: ${delegateName}`,
          `Periode Berlaku Baru: ${effStr} s/d ${expStr}`,
          `Diperbarui Oleh: ${issuerName}`,
        ].join('\n'),
        assignmentId: assignment.id,
      });
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

      // 3. Notifikasi Transparansi untuk Seluruh Anggota Tim (Bawahan)
      await this.notifyTeamMembers({
        targetFunction: assignment.targetFunction,
        excludeUserIds: [assignment.delegateUserId, replacedUser?.id, adminUserId],
        triggerType: 'TEMPORARY_REVIEWER_TEAM_NOTICE',
        title: 'Pelimpahan Wewenang Atasan Tim Anda Telah Berakhir',
        message: [
          `Pelimpahan wewenang peninjauan atasan Anda (${replacedName}) kepada ${delegateName} telah resmi berakhir. Permohonan cuti dan koreksi komitmen Anda kini kembali ditinjau langsung oleh atasan Anda.`,
          'Status Wewenang: Kembali kepada atasan definitif',
          `Divisi Wewenang: ${assignment.targetFunction}`,
          `Atasan Definitif: ${replacedName}`,
          `Pejabat Pengganti Sebelumnya: ${delegateName}`,
          `Diproses Oleh: ${issuerName}`,
        ].join('\n'),
        assignmentId: assignment.id,
      });
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

    const today = toJakartaDateOnly();
    const where: any = {};
    if (options.activeOnly) {
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
                where: { OR: [{ endDate: null }, { endDate: { gte: today } }] },
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
    const dateOnly = toJakartaDateOnly(targetDate);
    return await this.prisma.temporaryReviewerAssignment.findMany({
      where: {
        targetFunction,
        effectiveDate: { lte: dateOnly },
        expiryDate: { gte: dateOnly },
      },
      include: {
        delegateUser: true,
      },
    });
  }

  async getActiveDelegationsForUser(userId: string, targetDate = new Date()) {
    const dateOnly = toJakartaDateOnly(targetDate);
    return await this.prisma.temporaryReviewerAssignment.findMany({
      where: {
        delegateUserId: userId,
        effectiveDate: { lte: dateOnly },
        expiryDate: { gte: dateOnly },
      },
    });
  }
}

