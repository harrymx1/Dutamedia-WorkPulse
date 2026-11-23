import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../auth/services/token.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/user-status.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/constants/error-codes';
import {
  CanonicalFunction,
  CanonicalRole,
  EmploymentStatus,
  UserStatus,
} from '@prisma/client';
import { toJakartaDateOnly } from '../common/time/date-only.util';

export interface UserDirectorySummary {
  total: number;
  active: number;
  invited: number;
  invitedPending: number;
  invitedExpired: number;
  invitedRevoked: number;
  inactive: number;
  needsAttention: number;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  currentRole: string;
  currentFunction: string | null;
  currentJobTitle: string | null;
  directManagerName?: string | null;
  effectiveDate?: string | null;
  employmentStatus: EmploymentStatus;
  assignmentEndDate: string | null;
  isInternExpired: boolean;
  createdAt: Date;
  invitation?: {
    id: string;
    status: string;
    expiresAt: Date;
    createdAt: Date;
  } | null;
}

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  private resolveEffectiveInvitationStatus(
    inv: { status: string; expiresAt: Date | string } | null | undefined,
    now: Date = new Date(),
  ): string | null {
    if (!inv) return null;
    if (inv.status === 'PENDING' && new Date(inv.expiresAt) < now) {
      return 'EXPIRED';
    }
    return inv.status;
  }

  async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: CanonicalRole;
    function?: CanonicalFunction;
    employmentStatus?: EmploymentStatus;
  }): Promise<{
    data: UserListItem[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
    summary: UserDirectorySummary;
  }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(500, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        invitation: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        orgAssignments: {
          orderBy: { effectiveDate: 'desc' },
          take: 1,
          include: {
            directManager: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    const today = toJakartaDateOnly();
    const now = new Date();

    const summary: UserDirectorySummary = {
      total: 0,
      active: 0,
      invited: 0,
      invitedPending: 0,
      invitedExpired: 0,
      invitedRevoked: 0,
      inactive: 0,
      needsAttention: 0,
    };

    const mapped: UserListItem[] = users.map((u: any) => {
      const latestOrg = u.orgAssignments?.[0];
      const latestInv = u.invitation?.[0];
      const empStatus: EmploymentStatus =
        latestOrg?.employmentStatus || EmploymentStatus.PERMANENT;
      const endDateObj = latestOrg?.endDate ? new Date(latestOrg.endDate) : null;
      const assignmentEndDate = endDateObj
        ? endDateObj.toISOString().split('T')[0]
        : null;
      const effectiveDate = latestOrg?.effectiveDate
        ? new Date(latestOrg.effectiveDate).toISOString().split('T')[0]
        : null;
      const isInternExpired =
        empStatus === EmploymentStatus.INTERN &&
        Boolean(endDateObj) &&
        endDateObj! < today;

      const effInvStatus = this.resolveEffectiveInvitationStatus(latestInv, now);

      summary.total += 1;
      if (u.status === UserStatus.ACTIVE) {
        summary.active += 1;
      } else if (u.status === UserStatus.INACTIVE) {
        summary.inactive += 1;
        summary.needsAttention += 1;
      } else if (u.status === UserStatus.INVITED) {
        summary.invited += 1;
        if (effInvStatus === 'PENDING') {
          summary.invitedPending += 1;
        } else if (effInvStatus === 'EXPIRED') {
          summary.invitedExpired += 1;
          summary.needsAttention += 1;
        } else if (effInvStatus === 'REVOKED') {
          summary.invitedRevoked += 1;
          summary.needsAttention += 1;
        }
      }

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        status: u.status,
        currentRole: latestOrg?.role || CanonicalRole.EMPLOYEE,
        currentFunction: latestOrg?.function || null,
        currentJobTitle: latestOrg?.jobTitle || null,
        directManagerName: latestOrg?.directManager?.fullName || null,
        effectiveDate,
        employmentStatus: empStatus,
        assignmentEndDate,
        isInternExpired,
        createdAt: u.createdAt,
        invitation: latestInv
          ? {
              id: latestInv.id,
              status: effInvStatus || latestInv.status,
              expiresAt: latestInv.expiresAt,
              createdAt: latestInv.createdAt,
            }
          : null,
      };
    });

    const search = options.search?.trim().toLowerCase() || '';
    const filtered = mapped.filter((item) => {
      if (search) {
        const hay = [item.fullName, item.email, item.currentJobTitle || '']
          .join(' ')
          .toLowerCase();
        if (!hay.includes(search)) return false;
      }

      if (options.status) {
        const invSt = item.invitation?.status;
        if (options.status === 'INVITED_PENDING') {
          if (item.status !== UserStatus.INVITED || invSt !== 'PENDING') return false;
        } else if (options.status === 'INVITED_EXPIRED') {
          if (item.status !== UserStatus.INVITED || invSt !== 'EXPIRED') return false;
        } else if (options.status === 'INVITED_REVOKED') {
          if (item.status !== UserStatus.INVITED || invSt !== 'REVOKED') return false;
        } else if (options.status === 'NEEDS_ATTENTION') {
          const isAttention =
            item.status === UserStatus.INACTIVE ||
            (item.status === UserStatus.INVITED &&
              (invSt === 'EXPIRED' || invSt === 'REVOKED'));
          if (!isAttention) return false;
        } else if (item.status !== options.status) {
          return false;
        }
      }

      if (options.role && item.currentRole !== options.role) {
        return false;
      }

      if (options.function && item.currentFunction !== options.function) {
        return false;
      }

      if (options.employmentStatus && item.employmentStatus !== options.employmentStatus) {
        return false;
      }

      return true;
    });

    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
      summary,
    };
  }

  async createUser(
    dto: CreateUserDto,
    creatorUserId: string,
  ): Promise<{
    user: any;
    invitation: { token: string; expiresAt: Date };
  }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppException({
        code: ErrorCode.RESOURCE_CONFLICT,
        message: 'Pengguna dengan alamat email ini telah terdaftar.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const targetEmploymentStatus = dto.employmentStatus || EmploymentStatus.PERMANENT;
    const today = toJakartaDateOnly();

    if (targetEmploymentStatus === EmploymentStatus.INTERN) {
      if (dto.role && dto.role !== CanonicalRole.EMPLOYEE) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Karyawan berstatus Intern hanya dapat menggunakan peran Staff / Employee.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      if (!dto.endDate) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Tanggal selesai magang wajib diisi untuk karyawan berstatus Intern.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      const parsedEnd = new Date(dto.endDate);
      if (isNaN(parsedEnd.getTime()) || parsedEnd < today) {
        throw new AppException({
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Tanggal selesai magang tidak boleh lebih awal dari hari ini.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    const rawToken = this.tokenService.generateRandomToken(32);
    const tokenHash = this.tokenService.hashToken(rawToken);
    // Token kedaluwarsa dalam 72 jam (DEC-005)
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const result = await this.prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email: dto.email.toLowerCase().trim(),
          status: UserStatus.INVITED,
        },
      });

      const invitation = await tx.userInvitation.create({
        data: {
          userId: newUser.id,
          tokenHash,
          status: 'PENDING',
          expiresAt,
          createdByUserId: creatorUserId,
        },
      });

      // Jika role/function disertakan, buat penugasan organisasi awal
      if (dto.role && dto.function) {
        await tx.organizationalAssignment.create({
          data: {
            userId: newUser.id,
            jobTitle: dto.jobTitle || `${dto.function} Specialist`,
            role: targetEmploymentStatus === EmploymentStatus.INTERN ? CanonicalRole.EMPLOYEE : dto.role,
            function: dto.function,
            employmentStatus: targetEmploymentStatus,
            effectiveDate: today,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            assignmentReason: 'Initial Organizational Onboarding via Invitation',
            createdByUserId: creatorUserId,
          },
        });
      }

      if (tx.auditLog?.create) {
        await tx.auditLog.create({
          data: {
            actorUserId: creatorUserId,
            actionCode: 'USER_CREATED_AND_INVITED',
            relatedEntityType: 'User',
            relatedEntityId: newUser.id,
            valueAfter: {
              fullName: newUser.fullName,
              email: newUser.email,
              role: dto.role || null,
              function: dto.function || null,
              employmentStatus: targetEmploymentStatus,
            },
          },
        });
      }

      return { newUser, invitation };
    });

    return {
      user: {
        id: result.newUser.id,
        fullName: result.newUser.fullName,
        email: result.newUser.email,
        status: result.newUser.status,
      },
      invitation: {
        token: rawToken,
        expiresAt,
      },
    };
  }

  async resendInvitation(
    userId: string,
    adminUserId: string,
    reason?: string,
  ): Promise<{
    token: string;
    expiresAt: Date;
    user: { id: string; fullName: string; email: string };
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (user.status !== UserStatus.INVITED) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Pengiriman ulang undangan hanya dapat dilakukan untuk pengguna yang masih menunggu aktivasi.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const rawToken = this.tokenService.generateRandomToken(32);
    const tokenHash = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const revocationReason = reason?.trim() || 'RESENT_BY_ADMIN';

    await this.prisma.$transaction(async (tx: any) => {
      // 1. Hanguskan / Cabut semua token undangan aktif sebelumnya
      await tx.userInvitation.updateMany({
        where: { userId, status: 'PENDING' },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revocationReason,
        },
      });

      // 2. Terbitkan token baru dengan masa berlaku 72 jam
      await tx.userInvitation.create({
        data: {
          userId,
          tokenHash,
          status: 'PENDING',
          expiresAt,
          createdByUserId: adminUserId,
        },
      });

      if (tx.auditLog?.create) {
        await tx.auditLog.create({
          data: {
            actorUserId: adminUserId,
            actionCode: 'USER_INVITATION_RESENT',
            relatedEntityType: 'User',
            relatedEntityId: userId,
            valueAfter: {
              revocationReason,
              newExpiresAt: expiresAt.toISOString(),
            },
          },
        });
      }
    });

    return {
      token: rawToken,
      expiresAt,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  async revokeInvitation(
    userId: string,
    adminUserId: string,
    reason?: string,
  ): Promise<{ message: string }> {
    const pendingInvitations = await this.prisma.userInvitation.findMany({
      where: { userId, status: 'PENDING' },
    });

    if (pendingInvitations.length === 0) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tidak ada undangan aktif yang dapat dicabut.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const revocationReason = reason?.trim() || 'REVOKED_BY_ADMIN';

    await this.prisma.userInvitation.updateMany({
      where: { userId, status: 'PENDING' },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revocationReason,
      },
    });

    if ((this.prisma as any).auditLog?.create) {
      await (this.prisma as any).auditLog.create({
        data: {
          actorUserId: adminUserId,
          actionCode: 'USER_INVITATION_REVOKED',
          relatedEntityType: 'User',
          relatedEntityId: userId,
          valueAfter: {
            revocationReason,
            revokedCount: pendingInvitations.length,
          },
        },
      });
    }

    return {
      message: 'Tautan undangan pengguna berhasil dicabut.',
    };
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    adminUserId: string,
  ): Promise<{ message: string; status: UserStatus }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (userId === adminUserId && dto.status === UserStatus.INACTIVE) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang digunakan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (user.status === UserStatus.INVITED && dto.status === UserStatus.ACTIVE) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Akun yang belum menyelesaikan aktivasi kata sandi tidak dapat diaktifkan secara langsung. Kirim ulang undangan agar pengguna mengaktifkan akunnya sendiri.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (dto.status === UserStatus.INVITED) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Status akun tidak dapat diubah kembali menjadi menunggu aktivasi melalui menu ini.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          status: dto.status,
          updatedAt: new Date(),
        },
      });

      // KRITIKAL (AC): Jika akun dinonaktifkan, cabut seluruh sesi aktif secara instan
      if (dto.status === UserStatus.INACTIVE) {
        await tx.session.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      if (tx.auditLog?.create) {
        await tx.auditLog.create({
          data: {
            actorUserId: adminUserId,
            actionCode:
              dto.status === UserStatus.INACTIVE
                ? 'USER_DEACTIVATED'
                : 'USER_REACTIVATED',
            relatedEntityType: 'User',
            relatedEntityId: userId,
            valueBefore: { status: user.status },
            valueAfter: {
              status: dto.status,
              reason: dto.reason?.trim() || null,
            },
          },
        });
      }
    });

    const message =
      dto.status === UserStatus.INACTIVE
        ? 'Akun pengguna berhasil dinonaktifkan dan seluruh sesi aktif telah dihentikan.'
        : 'Akun pengguna berhasil diaktifkan kembali.';

    return {
      message,
      status: dto.status,
    };
  }
}

