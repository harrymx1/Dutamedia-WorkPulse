import { describe, it, expect } from 'vitest';
import pino from 'pino';
import { PINO_REDACT_PATHS } from './pino-logger.config';

describe('Pino Logger Redaction (EP01-TK006 / SAD VI.1)', () => {
  it('should redact sensitive properties such as password, token, and secret', () => {
    let capturedLog = '';
    const destination = {
      write: (msg: string) => {
        capturedLog += msg;
      },
    };

    const logger = pino(
      {
        redact: {
          paths: PINO_REDACT_PATHS,
          censor: '[REDACTED]',
        },
      },
      destination,
    );

    logger.info({
      user: 'john.doe@dutamedia.com',
      password: 'super_secret_password_123',
      token: 'session_jwt_token_abc',
      secret: 'minio_secret_key',
    });

    const parsed = JSON.parse(capturedLog);
    expect(parsed.user).toBe('john.doe@dutamedia.com');
    expect(parsed.password).toBe('[REDACTED]');
    expect(parsed.token).toBe('[REDACTED]');
    expect(parsed.secret).toBe('[REDACTED]');
  });
});

