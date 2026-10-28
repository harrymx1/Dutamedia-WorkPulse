import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { ErrorCode, ErrorDetail } from '../constants/error-codes';

export interface StandardErrorResponse {
  success: false;
  statusCode: number;
  data: null;
  error: {
    code: string;
    message: string;
    details: ErrorDetail[];
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const requestId =
      request?.id ||
      request?.requestId ||
      request?.headers?.['x-request-id'] ||
      'req_unknown';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan internal pada sistem.';
    let details: ErrorDetail[] = [];

    if (exception instanceof AppException) {
      statusCode = exception.getStatus();
      code = exception.code;
      message = exception.message;
      details = exception.details || [];
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as Record<string, any>;
        message = respObj.message || exception.message;
        
        // Menangani format standar class-validator ValidationPipe
        if (Array.isArray(respObj.message)) {
          code = ErrorCode.VALIDATION_FAILED;
          message = 'Validasi input gagal.';
          details = respObj.message.map((msg: string) => ({
            issue: msg,
          }));
        }

        if (respObj.code) {
          code = respObj.code;
        }
      }

      // Default status-to-code mapping jika belum terdefinisi
      if (code === ErrorCode.INTERNAL_SERVER_ERROR) {
        switch (statusCode) {
          case HttpStatus.UNAUTHORIZED:
            code = ErrorCode.AUTH_UNAUTHENTICATED;
            break;
          case HttpStatus.FORBIDDEN:
            code = ErrorCode.AUTH_FORBIDDEN_ROLE;
            break;
          case HttpStatus.NOT_FOUND:
            code = ErrorCode.RESOURCE_NOT_FOUND;
            break;
          case HttpStatus.CONFLICT:
            code = ErrorCode.RESOURCE_CONFLICT;
            break;
          case HttpStatus.UNPROCESSABLE_ENTITY:
            code = ErrorCode.VALIDATION_FAILED;
            break;
          case HttpStatus.BAD_REQUEST:
            if (!code || code === ErrorCode.INTERNAL_SERVER_ERROR) {
              code = ErrorCode.VALIDATION_FAILED;
            }
            break;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception [${requestId}]: ${exception.message}`, exception.stack);
    }

    const errorPayload: StandardErrorResponse = {
      success: false,
      statusCode,
      data: null,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: String(requestId),
      },
    };

    response.status(statusCode).json(errorPayload);
  }
}

