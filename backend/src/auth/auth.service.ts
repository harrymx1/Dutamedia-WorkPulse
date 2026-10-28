import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { LoginDto } from './dto/login.dto';
import { ActivateDto } from './dto/activate.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/constants/error-codes';
import { CanonicalRole } from '@prisma/client';

export interface LoginResult {
  accessToken: string;
  csrfToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
  ) {}

  async login(
    loginDto: LoginDto,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Alamat email atau kata sandi tidak valid.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (user.status === 'INVITED') {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message:
          'Akun Anda belum diaktifkan. Silakan periksa tautan aktivasi pada email Anda atau hubungi administrator.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (user.status === 'INACTIVE') {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message:
          'Akun Anda dinonaktifkan oleh administrator. Hubungi HRGA untuk informasi lebih lanjut.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!user.passwordHash) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Akun belum memiliki kata sandi aktif.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const isPasswordValid = await this.passwordHasher.verify(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Alamat email atau kata sandi tidak valid.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    // Resolusi Peran Aktif Pengguna dari Penugasan Organisasi Aktif
    const today = new Date();
    const activeOrg = await this.prisma.organizationalAssignment.findFirst({
      where: {
        userId: user.id,
        effectiveDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    const role: string = activeOrg?.role || CanonicalRole.EMPLOYEE;

    // Penerbitan Sesi Baru (24 Jam)
    const sessionTokenRaw = this.tokenService.generateRandomToken(32);
    const sessionTokenHash = this.tokenService.hashToken(sessionTokenRaw);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionTokenHash,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    // JWT Access Token
    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      sessionId: session.id,
      email: user.email,
      role,
      fullName: user.fullName,
    });

    // CSRF Token (Random Hex untuk Double Submit)
    const csrfToken = this.tokenService.generateRandomToken(24);

    return {
      accessToken,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
        status: user.status,
      },
      session: {
        id: session.id,
        expiresAt,
      },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async activate(activateDto: ActivateDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(activateDto.token.trim());

    const invitation = await this.prisma.userInvitation.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!invitation) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Token aktivasi tidak valid atau tidak ditemukan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (invitation.status !== 'PENDING') {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          invitation.status === 'USED'
            ? 'Tautan aktivasi ini telah digunakan sebelumnya. Silakan login langsung.'
            : 'Tautan aktivasi ini telah dibatalkan atau dicabut oleh administrator.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (new Date(invitation.expiresAt) <= new Date()) {
      await this.prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });

      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message:
          'Tautan aktivasi telah kedaluwarsa (melebihi batas waktu 72 jam). Hubungi administrator untuk mengirimkan ulang tautan undangan.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const passwordHash = await this.passwordHasher.hash(activateDto.password);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: invitation.userId },
        data: {
          passwordHash,
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });
    });

    return {
      message:
        'Akun Anda berhasil diaktifkan dengan aman. Silakan masuk menggunakan kata sandi yang baru dibuat.',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Pengguna tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const isCurrentValid = await this.passwordHasher.verify(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentValid) {
      throw new AppException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Kata sandi lama yang Anda masukkan tidak sesuai.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const newPasswordHash = await this.passwordHasher.hash(
      changePasswordDto.newPassword,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustResetPassword: false,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Kata sandi berhasil diperbarui dengan aman.',
    };
  }
}

