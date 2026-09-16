import { describe, it, expect, beforeEach } from 'vitest';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { TransformInterceptor } from '../../src/modules/shared/interceptors/transform.interceptor.js';
import { SKIP_ENVELOPE_KEY } from '../../src/modules/shared/decorators/skip-envelope.decorator.js';

describe('TransformInterceptor (SAD §7.5)', () => {
  let interceptor: TransformInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformInterceptor(reflector);
  });

  function createMockContext(skip = false): ExecutionContext {
    const handler = () => {};
    const targetClass = class {};

    if (skip) {
      Reflect.defineMetadata(SKIP_ENVELOPE_KEY, true, handler);
    }

    return {
      getHandler: () => handler,
      getClass: () => targetClass,
    } as unknown as ExecutionContext;
  }

  it('harus membungkus single resource ke dalam format { data, meta: { timestamp } }', async () => {
    const mockData = { id: 'user-1', name: 'John Doe' };
    const context = createMockContext();
    const next: CallHandler = { handle: () => of(mockData) };

    const result = (await firstValueFrom(
      interceptor.intercept(context, next),
    )) as any;

    expect(result).toHaveProperty('data');
    expect(result.data).toEqual(mockData);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('timestamp');
    expect(new Date(result.meta.timestamp).toISOString()).toBe(
      result.meta.timestamp,
    );
  });

  it('harus membungkus paginated result { items, pagination } sesuai SAD §7.5', async () => {
    const mockItems = [{ id: '1' }, { id: '2' }];
    const mockPagination = {
      page: 1,
      pageSize: 20,
      totalItems: 42,
      totalPages: 3,
    };
    const context = createMockContext();
    const next: CallHandler = {
      handle: () => of({ items: mockItems, pagination: mockPagination }),
    };

    const result = (await firstValueFrom(
      interceptor.intercept(context, next),
    )) as any;

    expect(result.data).toEqual(mockItems);
    expect(result.meta.pagination).toEqual(mockPagination);
    expect(result.meta).toHaveProperty('timestamp');
  });

  it('harus membungkus paginated result { data, pagination }', async () => {
    const mockList = [{ id: '1' }];
    const mockPagination = {
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    };
    const context = createMockContext();
    const next: CallHandler = {
      handle: () => of({ data: mockList, pagination: mockPagination }),
    };

    const result = (await firstValueFrom(
      interceptor.intercept(context, next),
    )) as any;

    expect(result.data).toEqual(mockList);
    expect(result.meta.pagination).toEqual(mockPagination);
  });

  it('harus mempertahankan respon yang sudah memiliki format { data, meta }', async () => {
    const alreadyWrapped = {
      data: { status: 'OK' },
      meta: { custom: 'info' },
    };
    const context = createMockContext();
    const next: CallHandler = { handle: () => of(alreadyWrapped) };

    const result = (await firstValueFrom(
      interceptor.intercept(context, next),
    )) as any;

    expect(result.data).toEqual({ status: 'OK' });
    expect(result.meta.custom).toBe('info');
    expect(result.meta).toHaveProperty('timestamp');
  });

  it('harus melewatkan pembungkusan envelope jika diberi decorator @SkipEnvelope()', async () => {
    const rawData = 'raw-stream-content-or-signed-url';
    const context = createMockContext(true);
    const next: CallHandler = { handle: () => of(rawData) };

    const result = await firstValueFrom(interceptor.intercept(context, next));

    expect(result).toBe(rawData);
  });
});
