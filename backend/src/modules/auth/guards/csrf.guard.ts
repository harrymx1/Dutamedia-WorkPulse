import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator.js';
import { ForbiddenException } from '../../shared/exceptions/api.exception.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // 1. Lewatkan method safe (GET, HEAD, OPTIONS) sesuai SAD §8.5
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // 2. Lewatkan jika memiliki decorator @Public() atau @SkipCsrf()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || skipCsrf) {
      return true;
    }

    // 3. Double Submit Cookie Pattern: Bandingkan cookie csrf_token dengan header X-CSRF-Token
    const cookieToken = request.cookies?.csrf_token;
    const headerToken = request.headers['x-csrf-token'] as string | undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException(
        'Token CSRF tidak valid atau tidak sesuai dengan sesi Anda',
      );
    }

    return true;
  }
}
