import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerLimitDetail,
  ThrottlerModuleOptions,
  ThrottlerStorage,
  InjectThrottlerOptions,
  InjectThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { RateLimitedException } from '../exceptions/api.exception.js';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: any,
    @InjectThrottlerStorage() storageService: any,
    @Inject(Reflector) reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Jika user terautentikasi, batasi berdasarkan userId (SAD §7.8)
    if (req.user?.userId || req.user?.id) {
      return `user-${req.user.userId || req.user.id}`;
    }

    // Jika belum terautentikasi (seperti login), batasi berdasarkan IP
    const clientIp =
      req.ip ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']?.split(',')[0]) ||
      req.socket?.remoteAddress ||
      'unknown-ip';

    return `ip-${clientIp}`;
  }

  protected async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new RateLimitedException(
      'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.',
    );
  }
}
