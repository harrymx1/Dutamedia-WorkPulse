import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../auth/services/token.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/user-status.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/constants/error-codes';
import { CanonicalRole, UserStatus } from '@prisma/client';

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  currentRole: string;
  currentFunction: string | null;
  currentJobTitle: string | null;
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

  async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: UserStatus;
  }): Promise<{ data: UserListItem[]; pagination: any }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) {
      where.status = options.status;
    }
    if (options.search) {
      const search = options.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalRecords, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invitation: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          orgAssignments: {
            where: {
              OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
            },
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const data: UserListItem[] = users.map((u) => {
      const latestOrg = u.orgAssignments[0];
      const latestInv = u.invitation[0];

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        status: u.status,
        currentRole: latestOrg?.role || CanonicalRole.EMPLOYEE,
        currentFunction: latestOrg?.function || null,
        currentJobTitle: latestOrg?.jobTitle || null,
        createdAt: u.createdAt,
        invitation: latestInv
          ? {
              id: latestInv.id,
              status: latestInv.status,
              expiresAt: latestInv.expiresAt,
              createdAt: latestInv.createdAt,
            }
          : null,
      };
    });

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

    const rawToken = this.tokenService.generateRandomToken(32);
    const tokenHash = this.tokenService.hashToken(rawToken);
    // Token kedaluwarsa dalam 72 jam (DEC-005)
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const result = await this.prisma.$transaction(async (tx) => {
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
            role: dto.role,
            function: dto.function,
            effectiveDate: new Date(),
            assignmentReason: 'Initial Organizational Onboarding via Invitation',
            createdByUserId: creatorUserId,
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
  ): Promise<{ token: string; expiresAt: Date }> {
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
          'Pengiriman ulang undangan hanya dapat dilakukan untuk pengguna dengan status INVITED.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const rawToken = this.tokenService.generateRandomToken(32);
    const tokenHash = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      // 1. Hanguskan / Cabut semua token undangan aktif sebelumnya
      await tx.userInvitation.updateMany({
        where: { userId, status: 'PENDING' },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revocationReason: 'RESENT_BY_ADMIN',
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
    });

    return {
      token: rawToken,
      expiresAt,
    };
  }

  async revokeInvitation(
    userId: string,
    _adminUserId: string,
  ): Promise<{ message: string }> {
    const pendingInvitations = await this.prisma.userInvitation.findMany({
      where: { userId, status: 'PENDING' },
    });

    if (pendingInvitations.length === 0) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Tidak ada undangan berstatus PENDING yang dapat dicabut.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.prisma.userInvitation.updateMany({
      where: { userId, status: 'PENDING' },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revocationReason: 'REVOKED_BY_ADMIN',
      },
    });

    return {
      message: 'Tautan undangan pengguna berhasil dicabut.',
    };
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    _adminUserId: string,
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

    await this.prisma.$transaction(async (tx) => {
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
    });

    return {
      message: `Status pengguna berhasil diperbarui menjadi ${dto.status}.`,
      status: dto.status,
    };
  }
}

