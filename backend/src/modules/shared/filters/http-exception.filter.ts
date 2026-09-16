import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiException } from '../exceptions/api.exception.js';
import type {
  ErrorDetail,
  StandardErrorResponse,
} from '../dto/base-response.dto.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private readonly statusCodeToErrorCode: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'BUSINESS_RULE_VIOLATION',
    [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
  };

  private readonly defaultMessages: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'Permintaan tidak valid atau format data salah',
    [HttpStatus.UNAUTHORIZED]: 'Sesi autentikasi tidak valid atau telah berakhir',
    [HttpStatus.FORBIDDEN]: 'Anda tidak memiliki hak akses untuk resource ini',
    [HttpStatus.NOT_FOUND]: 'Resource tidak ditemukan atau berada di luar jangkauan visibilitas',
    [HttpStatus.CONFLICT]: 'Kondisi state saat ini tidak valid untuk aksi tersebut',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Permintaan melanggar aturan bisnis sistem',
    [HttpStatus.TOO_MANY_REQUESTS]: 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Terjadi kesalahan internal pada server',
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = this.defaultMessages[HttpStatus.INTERNAL_SERVER_ERROR];
    let details: ErrorDetail[] | undefined = undefined;

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.statusCodeToErrorCode[status] || 'UNKNOWN_ERROR';
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, any>;
        
        // Handle custom code if provided in response object
        if (resObj.code) {
          code = resObj.code;
        }

        // Handle details if provided
        if (resObj.details && Array.isArray(resObj.details)) {
          details = resObj.details;
        }

        // Handle message
        if (resObj.message) {
          if (Array.isArray(resObj.message)) {
            // Default class-validator format without custom exceptionFactory
            message = resObj.message[0] || this.defaultMessages[status] || 'Error validasi';
            details = resObj.message.map((msg: string) => ({
              message: msg,
            }));
          } else {
            message = resObj.message;
          }
        } else {
          message = this.defaultMessages[status] || 'Terjadi kesalahan';
        }
      }
    } else {
      // Unhandled / system runtime error
      this.logger.error('Unhandled Exception:', exception);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = this.defaultMessages[HttpStatus.INTERNAL_SERVER_ERROR];
    }

    const errorBody: StandardErrorResponse = {
      error: {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorBody);
  }
}
