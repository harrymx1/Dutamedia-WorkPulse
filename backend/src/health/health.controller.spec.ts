import { describe, it, expect, vi } from 'vitest';
import { HealthController } from './health.controller';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('HealthController (EP01-TK006 / SAD VI.2)', () => {
  const mockResponse = () => {
    let capturedStatus = 200;
    let capturedJson: any = null;

    const res = {
      status: vi.fn().mockImplementation((status: number) => {
        capturedStatus = status;
        return res;
      }),
      json: vi.fn().mockImplementation((payload: any) => {
        capturedJson = payload;
        return res;
      }),
    } as unknown as Response;

    return {
      res,
      getStatus: () => capturedStatus,
      getJson: () => capturedJson,
    };
  };

  it('GET /health/live should return 200 OK and status ok', () => {
    const controller = new HealthController();
    const liveness = controller.getLiveness();
    expect(liveness.status).toBe('ok');
    expect(liveness.uptime).toBeGreaterThanOrEqual(0);
    expect(liveness.timestamp).toBeDefined();
  });

  it('GET /health/ready should return 200 OK when database check succeeds', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as any;

    const controller = new HealthController(mockPrisma);
    const { res, getStatus, getJson } = mockResponse();

    await controller.getReadiness(res);

    expect(getStatus()).toBe(HttpStatus.OK);
    expect(getJson().status).toBe('ok');
    expect(getJson().checks.database).toBe('up');
  });

  it('GET /health/ready should return 503 SERVICE_UNAVAILABLE when database check fails', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('Connection failed')),
    } as any;

    const controller = new HealthController(mockPrisma);
    const { res, getStatus, getJson } = mockResponse();

    await controller.getReadiness(res);

    expect(getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(getJson().status).toBe('error');
    expect(getJson().checks.database).toBe('down');
  });
});
