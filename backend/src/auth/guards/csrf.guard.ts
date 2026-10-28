import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // Metode aman/idempoten tidak memerlukan verifikasi token CSRF
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const cookieCsrf = request.cookies?.['csrf_token'];
    const headerCsrf =
      request.headers?.['x-csrf-token'] || request.headers?.['X-CSRF-Token'];

    if (!cookieCsrf || !headerCsrf || cookieCsrf !== headerCsrf) {
      throw new AppException({
        code: ErrorCode.AUTH_CSRF_INVALID,
        message:
          'Verifikasi keamanan CSRF gagal. Nilai token tidak cocok atau tidak disertakan.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}

