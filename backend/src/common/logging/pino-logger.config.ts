import pino from 'pino';
import { Options as PinoHttpOptions } from 'pino-http';

export const PINO_REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-csrf-token"]',
  'req.body.password',
  'req.body.token',
  'req.body.oldPassword',
  'req.body.newPassword',
  'password',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'secret',
];

export const createPinoHttpConfig = (): PinoHttpOptions => {
  return {
    redact: {
      paths: PINO_REDACT_PATHS,
      censor: '[REDACTED]',
    },
    genReqId: (req) => {
      const headerId = req.headers['x-request-id'];
      if (typeof headerId === 'string' && headerId.trim().length > 0) {
        return headerId;
      }
      return (req as any).id || (req as any).requestId || undefined;
    },
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  };
};

export const rootLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: PINO_REDACT_PATHS,
    censor: '[REDACTED]',
  },
  base: {
    service: 'workpulse-backend',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

