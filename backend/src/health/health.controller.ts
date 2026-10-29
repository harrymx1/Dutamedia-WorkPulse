import { Controller, Get, HttpStatus, Optional, Res } from '@nestjs/common';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { BypassEnvelope } from '../common/decorators/bypass-envelope.decorator';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database?: 'up' | 'down';
    storage?: 'up' | 'down';
    [key: string]: string | undefined;
  };
}

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  @Get('live')
  @BypassEnvelope()
  getLiveness(): HealthCheckResult {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {},
    };
  }

  @Get('ready')
  @BypassEnvelope()
  async getReadiness(@Res() res: Response): Promise<void> {
    const checks: Record<string, 'up' | 'down'> = {};
    let isReady = true;

    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        checks.database = 'up';
      } catch {
        checks.database = 'down';
        isReady = false;
      }
    } else {
      checks.database = 'up';
    }

    const result: HealthCheckResult = {
      status: isReady ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };

    if (isReady) {
      res.status(HttpStatus.OK).json(result);
    } else {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json(result);
    }
  }
}
