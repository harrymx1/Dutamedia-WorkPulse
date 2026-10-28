import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../services/token.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token =
      request.cookies?.['access_token'] ||
      this.extractBearerToken(request.headers?.['authorization']);

    if (!token) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Sesi tidak ditemukan atau telah berakhir. Silakan login kembali.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    let payload: any;
    try {
      payload = this.tokenService.verifyAccessToken(token);
    } catch {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Token autentikasi tidak valid atau telah kedaluwarsa.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    // Verifikasi validitas sesi di basis data secara real-time
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      new Date(session.expiresAt) <= new Date()
    ) {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Sesi telah dicabut atau tidak berlaku.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (session.user.status !== 'ACTIVE') {
      throw new AppException({
        code: ErrorCode.AUTH_UNAUTHENTICATED,
        message: 'Akun Anda dinonaktifkan. Hubungi administrator.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    request.user = {
      ...payload,
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      status: session.user.status,
    };
    request.sessionId = session.id;

    return true;
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (typeof authHeader !== 'string') return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}

