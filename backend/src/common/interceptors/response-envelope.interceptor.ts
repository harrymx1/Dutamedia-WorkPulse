import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_ENVELOPE_KEY } from '../decorators/bypass-envelope.decorator';

export interface StandardSuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  error: null;
  meta: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, StandardSuccessResponse<T> | T>
{
  constructor(private readonly reflector: Reflector = new Reflector()) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardSuccessResponse<T> | T> {
    const isBypassed = this.reflector.getAllAndOverride<boolean>(
      BYPASS_ENVELOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isBypassed) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();

    const statusCode = response.statusCode || 200;
    const requestId =
      request?.id ||
      request?.requestId ||
      request?.headers?.['x-request-id'] ||
      'req_unknown';

    return next.handle().pipe(
      map((result) => {
        let data = result;
        let pagination: any = undefined;

        // Mendeteksi payload paginasi terstruktur { data: [...], pagination: {...} }
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'pagination' in result
        ) {
          data = result.data;
          pagination = result.pagination;
        }

        const envelope: StandardSuccessResponse<T> = {
          success: true,
          statusCode,
          data,
          error: null,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: String(requestId),
            ...(pagination ? { pagination } : {}),
          },
        };

        return envelope;
      }),
    );
  }
}

