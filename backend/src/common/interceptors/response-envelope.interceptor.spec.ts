import { describe, it, expect } from 'vitest';
import { of, lastValueFrom } from 'rxjs';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('ResponseEnvelopeInterceptor (EP01-TK006 / SAD IV.2.1)', () => {
  const reflector = new Reflector();
  const interceptor = new ResponseEnvelopeInterceptor(reflector);

  const mockContext = (headers: Record<string, string> = {}, statusCode = 200): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          id: headers['x-request-id'] || 'req_test123',
        }),
        getResponse: () => ({
          statusCode,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext);

  it('should wrap standard object payload into SAD IV.2.1 Success Envelope', async () => {
    const handler: CallHandler = {
      handle: () => of({ message: 'Hello WorkPulse' }),
    };

    const ctx = mockContext({ 'x-request-id': 'req_c3a84b91' }, 200);
    const result$ = interceptor.intercept(ctx, handler);
    const result = (await lastValueFrom(result$)) as any;

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ message: 'Hello WorkPulse' });
    expect(result.meta.requestId).toBe('req_c3a84b91');
    expect(result.meta.timestamp).toBeDefined();
    expect(result.meta.pagination).toBeUndefined();
  });

  it('should format pagination inside meta if provided in controller response', async () => {
    const paginatedPayload = {
      data: [{ id: '1' }, { id: '2' }],
      pagination: {
        page: 1,
        limit: 20,
        totalRecords: 2,
        totalPages: 1,
      },
    };

    const handler: CallHandler = {
      handle: () => of(paginatedPayload),
    };

    const ctx = mockContext({ 'x-request-id': 'req_page_01' }, 200);
    const result$ = interceptor.intercept(ctx, handler);
    const result = (await lastValueFrom(result$)) as any;

    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ id: '1' }, { id: '2' }]);
    expect(result.meta.pagination).toEqual({
      page: 1,
      limit: 20,
      totalRecords: 2,
      totalPages: 1,
    });
  });
});

