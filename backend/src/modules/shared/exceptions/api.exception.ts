import { HttpException, HttpStatus } from '@nestjs/common';
import type { ErrorDetail } from '../dto/base-response.dto.js';

export class ApiException extends HttpException {
  public readonly code: string;
  public readonly details?: ErrorDetail[];

  constructor(
    code: string,
    message: string,
    status: HttpStatus,
    details?: ErrorDetail[],
  ) {
    super({ code, message, details }, status);
    this.code = code;
    this.details = details;
  }
}

export class ValidationException extends ApiException {
  constructor(message: string = 'Request body tidak valid', details?: ErrorDetail[]) {
    super('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST, details);
  }
}

export class UnauthenticatedException extends ApiException {
  constructor(message: string = 'Sesi tidak valid atau telah berakhir') {
    super('UNAUTHENTICATED', message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends ApiException {
  constructor(message: string = 'Anda tidak memiliki hak akses untuk tindakan ini') {
    super('FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundException extends ApiException {
  constructor(message: string = 'Data tidak ditemukan atau berada di luar cakupan akses') {
    super('NOT_FOUND', message, HttpStatus.NOT_FOUND);
  }
}

export class ConflictException extends ApiException {
  constructor(message: string = 'Kondisi state saat ini tidak valid untuk tindakan tersebut') {
    super('CONFLICT', message, HttpStatus.CONFLICT);
  }
}

export class BusinessRuleViolationException extends ApiException {
  constructor(message: string = 'Tindakan melanggar aturan bisnis sistem', details?: ErrorDetail[]) {
    super('BUSINESS_RULE_VIOLATION', message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

export class RateLimitedException extends ApiException {
  constructor(message: string = 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.') {
    super('RATE_LIMITED', message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class InternalErrorException extends ApiException {
  constructor(message: string = 'Terjadi kesalahan internal pada server') {
    super('INTERNAL_ERROR', message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
