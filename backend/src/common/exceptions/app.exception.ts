import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorDetail } from '../constants/error-codes';

export interface AppExceptionOptions {
  code: ErrorCode | string;
  message: string;
  statusCode?: HttpStatus;
  details?: ErrorDetail[];
}

export class AppException extends HttpException {
  public readonly code: ErrorCode | string;
  public readonly details: ErrorDetail[];

  constructor(options: AppExceptionOptions) {
    const statusCode = options.statusCode || HttpStatus.BAD_REQUEST;
    super(
      {
        code: options.code,
        message: options.message,
        details: options.details || [],
      },
      statusCode,
    );
    this.code = options.code;
    this.details = options.details || [];
  }
}

