import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerLimitDetail,
  InjectThrottlerOptions,
  InjectThrottlerStorage,
} from '@nestjs/throttler';
import type { ThrottlerRequest } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { RateLimitedException } from '../exceptions/api.exception.js';

const THROTTLER_LIMIT = 'THROTTLER:LIMIT';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: any,
    @InjectThrottlerStorage() storageService: any,
    @Inject(Reflector) reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected override async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, throttler } = requestProps;
    const handler = context.getHandler();
    const classRef = context.getClass();

    // Throttler 'auth' hanya untuk endpoint yang secara eksplisit didekorasi @ThrottleAuth()
    if (throttler.name === 'auth') {
      const hasAuthThrottle = this.reflector.getAllAndOverride(
        `${THROTTLER_LIMIT}auth`,
        [handler, classRef],
      );
      if (!hasAuthThrottle) {
        return true;
      }
    }

    // Throttler 'upload' hanya untuk endpoint yang secara eksplisit didekorasi @ThrottleUpload()
    if (throttler.name === 'upload') {
      const hasUploadThrottle = this.reflector.getAllAndOverride(
        `${THROTTLER_LIMIT}upload`,
        [handler, classRef],
      );
      if (!hasUploadThrottle) {
        return true;
      }
    }

    // Throttler 'default' dilewati jika endpoint memiliki rate-limit khusus auth atau upload
    if (throttler.name === 'default') {
      const hasAuthThrottle = this.reflector.getAllAndOverride(
        `${THROTTLER_LIMIT}auth`,
        [handler, classRef],
      );
      const hasUploadThrottle = this.reflector.getAllAndOverride(
        `${THROTTLER_LIMIT}upload`,
        [handler, classRef],
      );
      if (hasAuthThrottle || hasUploadThrottle) {
        return true;
      }
    }

    return super.handleRequest(requestProps);
  }

  protected override async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    // 1. Jika req.user sudah di-attach oleh JwtAuthGuard
    if (req.user?.userId || req.user?.id) {
      return `user-${req.user.userId || req.user.id}`;
    }

    // 2. Jika req.user belum di-attach (karena CustomThrottlerGuard berjalan sebelum route guard),
    // cek cookie atau Authorization header untuk identifikasi user (SAD §7.8)
    const token =
      req.cookies?.access_token ||
      (typeof req.headers?.authorization === 'string'
        ? req.headers.authorization.replace(/^Bearer\s+/i, '')
        : undefined);

    if (token && typeof token === 'string') {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString('utf8'),
          );
          if (payload?.sub) {
            return `user-${payload.sub}`;
          }
        }
      } catch {
        // Fallback ke IP jika token tidak valid
      }
    }

    // 3. Endpoint publik / unauthenticated (seperti login): batasi berdasarkan IP
    const clientIp =
      req.ip ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']?.split(',')[0]) ||
      req.socket?.remoteAddress ||
      'unknown-ip';

    return `ip-${clientIp}`;
  }

  protected override async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new RateLimitedException(
      'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.',
    );
  }
}

