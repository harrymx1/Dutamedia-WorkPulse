import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_ENVELOPE_KEY } from '../decorators/skip-envelope.decorator.js';
import type { StandardResponse } from '../dto/base-response.dto.js';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | T> {
    const skipEnvelope = this.reflector.getAllAndOverride<boolean>(
      SKIP_ENVELOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipEnvelope) {
      return next.handle();
    }

    return next.handle().pipe(
      map((resData) => {
        const timestamp = new Date().toISOString();

        // 1. If response already formatted with data and meta
        if (
          resData &&
          typeof resData === 'object' &&
          'data' in resData &&
          'meta' in resData
        ) {
          return {
            ...resData,
            meta: {
              timestamp,
              ...resData.meta,
            },
          };
        }

        // 2. If response is a paginated result { items: [...], pagination: { ... } }
        if (
          resData &&
          typeof resData === 'object' &&
          'items' in resData &&
          'pagination' in resData
        ) {
          return {
            data: resData.items,
            meta: {
              timestamp,
              pagination: resData.pagination,
            },
          };
        }

        // 3. If response is a paginated result { data: [...], pagination: { ... } }
        if (
          resData &&
          typeof resData === 'object' &&
          'data' in resData &&
          'pagination' in resData
        ) {
          return {
            data: resData.data,
            meta: {
              timestamp,
              pagination: resData.pagination,
            },
          };
        }

        // 4. Standard single or list response
        return {
          data: resData ?? null,
          meta: {
            timestamp,
          },
        };
      }),
    );
  }
}
