import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IdentityService } from '../../identity/identity.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import {
  ForbiddenException,
  UnauthenticatedException,
} from '../../shared/exceptions/api.exception.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly identityService: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthenticatedException('Token autentikasi tidak ditemukan');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthenticatedException(
        'Token autentikasi tidak valid atau telah kedaluwarsa',
      );
    }

    if (!payload?.sub || !payload?.jti) {
      throw new UnauthenticatedException('Struktur payload token tidak valid');
    }

    // 1. Verifikasi Session di database (SAD §8.4)
    const session = await this.prisma.session.findUnique({
      where: { id: payload.jti },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthenticatedException('Sesi telah dicabut atau berakhir');
    }

    // 2. Verifikasi status pengguna
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthenticatedException(
        'Akun pengguna tidak aktif atau tidak ditemukan',
      );
    }

    // 3. Penegakan lock password (FR-50 & SAD §8.2)
    const originalUrl = request.originalUrl || request.url || '';
    const isResetOrLogout =
      originalUrl.includes('/auth/reset-password') ||
      originalUrl.includes('/auth/logout');

    if (user.mustResetPassword && !isResetOrLogout) {
      throw new ForbiddenException(
        'Anda wajib mengganti password sementara sebelum mengakses sistem (FR-50)',
      );
    }

    // 4. Resolusi peran & fungsi aktif per hari ini (SAD §8.4 langkah 4)
    const activeContext = await this.identityService.resolveActiveContext(
      user.id,
      new Date(),
    );

    // 5. Sematkan ke context request
    (request as any).user = {
      userId: user.id,
      email: user.email,
      role: activeContext?.role ?? null,
      function: activeContext?.function ?? null,
      directManagerId: activeContext?.directManagerId ?? null,
      assignmentId: activeContext?.assignmentId ?? null,
      sessionId: session.id,
      mustResetPassword: user.mustResetPassword,
    };

    return true;
  }

  private extractToken(request: Request): string | null {
    // 1. Coba dari cookie access_token (SAD §8.1)
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }

    // 2. Fallback header Authorization: Bearer <token>
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    return null;
  }
}
