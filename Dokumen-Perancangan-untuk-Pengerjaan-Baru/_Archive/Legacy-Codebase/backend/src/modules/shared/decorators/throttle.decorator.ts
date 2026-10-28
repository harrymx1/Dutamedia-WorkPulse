import { Throttle } from '@nestjs/throttler';

/**
 * Decorator untuk endpoint umum (100 request/menit per user) - SAD §7.8
 */
export const ThrottleDefault = () =>
  Throttle({ default: { limit: 100, ttl: 60000 } });

/**
 * Decorator untuk endpoint auth (5 percobaan/menit per IP) - SAD §7.8
 */
export const ThrottleAuth = () =>
  Throttle({ auth: { limit: 5, ttl: 60000 } });

/**
 * Decorator untuk endpoint upload file (10 request/menit per user) - SAD §7.8
 */
export const ThrottleUpload = () =>
  Throttle({ upload: { limit: 10, ttl: 60000 } });
