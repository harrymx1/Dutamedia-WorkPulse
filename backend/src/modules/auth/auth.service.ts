import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentityService } from '../identity/identity.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  ForbiddenException,
  NotFoundException,
  UnauthenticatedException,
} from '../shared/exceptions/api.exception.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly identityService: IdentityService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * EPIC-03-T1: Login dengan verifikasi Argon2id, Session 12 jam, dan token JWT + CSRF.
   * SAD §8.4 & §10.1
   */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const email = dto.email.toLowerCase().trim();

    // 1. Cari pengguna
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthenticatedException('Kombinasi email atau password salah');
    }

    // 2. Verifikasi password dengan Argon2id
    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthenticatedException('Kombinasi email atau password salah');
    }

    // 3. Validasi status aktif pengguna
    if (user.status !== UserStatus.Active) {
      throw new ForbiddenException(
        'Akun Anda berstatus nonaktif. Silakan hubungi Administrator.',
      );
    }

    // 4. Buat sesi baru berdurasi 12 jam (SAD §5.3, §8.4 & §8.6)
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        userAgent: userAgent ?? null,
        expiresAt,
      },
    });

    // 5. Terbitkan token JWT { sub: userId, jti: sessionId }
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      jti: session.id,
    });

    // 6. Buat token CSRF acak untuk Double Submit Cookie Pattern (SAD §8.5)
    const csrfToken = randomBytes(16).toString('hex');

    // 7. Resolusi peran & fungsi aktif per hari ini
    const activeContext = await this.identityService.resolveActiveContext(
      user.id,
      new Date(),
    );

    this.logger.log(`Pengguna berhasil login: ${user.email} (${session.id})`);

    return {
      accessToken,
      csrfToken,
      mustResetPassword: user.mustResetPassword,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: activeContext?.role ?? null,
        function: activeContext?.function ?? null,
      },
    };
  }

  /**
   * EPIC-03-T2: Logout dengan pencabutan sesi di database (SAD §8.4).
   */
  async logout(sessionId: string): Promise<void> {
    if (!sessionId) {
      return;
    }

    await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`Sesi ${sessionId} berhasil dicabut (logout)`);
  }

  /**
   * EPIC-03-T4: Pengguna mengganti password pertama kali / mandiri (SAD §8.2 & §10.1).
   */
  async resetPassword(userId: string, dto: ResetPasswordDto): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          mustResetPassword: false, // Buka penguncian password
        },
      });

      await this.auditService.record(
        {
          actorUserId: userId,
          action: 'USER_PASSWORD_RESET',
          relatedEntityType: 'User',
          relatedEntityId: userId,
          valueBefore: { mustResetPassword: user.mustResetPassword },
          valueAfter: { mustResetPassword: false },
        },
        tx,
      );
    });

    this.logger.log(`Password pengguna ${userId} berhasil diperbarui.`);
    return { success: true };
  }

  /**
   * EPIC-03-T4: SystemAdmin me-reset password pengguna lain (SAD §8.2, §10.1, §15.3).
   * Menghasilkan temporary password baru, set mustResetPassword=true, dan revoke semua sesi aktif.
   */
  async adminResetPassword(
    targetUserId: string,
    actorAdminId?: string,
  ): Promise<{ temporaryPassword: string }> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException(
        `Pengguna target dengan ID '${targetUserId}' tidak ditemukan`,
      );
    }

    const temporaryPassword = randomBytes(6).toString('hex'); // 12 karakter hex
    const passwordHash = await argon2.hash(temporaryPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction(async (tx) => {
      // 1. Update password dan kunci kembali akun
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          passwordHash,
          mustResetPassword: true,
        },
      });

      // 2. Cabut seluruh sesi aktif milik target user
      await tx.session.updateMany({
        where: {
          userId: targetUserId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // 3. Catat audit trail resmi (SAD §15.3)
      await this.auditService.record(
        {
          actorUserId: actorAdminId ?? null,
          action: 'ADMIN_PASSWORD_RESET',
          relatedEntityType: 'User',
          relatedEntityId: targetUserId,
          valueAfter: {
            mustResetPassword: true,
          },
        },
        tx,
      );
    });

    this.logger.warn(
      `Admin ${actorAdminId ?? 'SYSTEM'} mereset password pengguna ${targetUserId}`,
    );

    return { temporaryPassword };
  }

  /**
   * EPIC-03-T5: Mengambil profil lengkap pengguna untuk inisialisasi frontend (SAD §10.1).
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const today = new Date();
    const activeContext = await this.identityService.resolveActiveContext(
      userId,
      today,
    );

    const projectAuthorities =
      await this.identityService.resolveProjectAuthorities(userId, today);

    const temporaryReviewers =
      await this.identityService.resolveTemporaryReviewers(userId, today);

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: activeContext?.role ?? null,
      function: activeContext?.function ?? null,
      directManagerId: activeContext?.directManagerId ?? null,
      mustResetPassword: user.mustResetPassword,
      permissionsSummary: {
        projectAuthorities,
        temporaryReviewerScopes: temporaryReviewers.map((t) => t.scope),
      },
    };
  }
}
