import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../../src/modules/shared/filters/http-exception.filter.js';
import {
  ValidationException,
  UnauthenticatedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BusinessRuleViolationException,
  RateLimitedException,
  InternalErrorException,
} from '../../src/modules/shared/exceptions/api.exception.js';

describe('HttpExceptionFilter (SAD §7.7)', () => {
  let filter: HttpExceptionFilter;
  let mockStatus: any;
  let mockJson: any;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockResponse = { status: mockStatus };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it('harus memetakan 400 ke VALIDATION_ERROR dengan details', () => {
    const details = [{ field: 'email', reason: 'IS_EMAIL', message: 'Email tidak valid' }];
    const exception = new ValidationException('Data tidak valid', details);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data tidak valid',
          details,
        },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
    );
  });

  it('harus memetakan 401 ke UNAUTHENTICATED', () => {
    const exception = new UnauthenticatedException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'UNAUTHENTICATED',
        }),
      }),
    );
  });

  it('harus memetakan 403 ke FORBIDDEN', () => {
    const exception = new ForbiddenException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'FORBIDDEN',
        }),
      }),
    );
  });

  it('harus memetakan 404 ke NOT_FOUND', () => {
    const exception = new NotFoundException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'NOT_FOUND',
        }),
      }),
    );
  });

  it('harus memetakan 409 ke CONFLICT', () => {
    const exception = new ConflictException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'CONFLICT',
        }),
      }),
    );
  });

  it('harus memetakan 422 ke BUSINESS_RULE_VIOLATION', () => {
    const exception = new BusinessRuleViolationException('Field terkunci tidak dapat diubah');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'BUSINESS_RULE_VIOLATION',
          message: 'Field terkunci tidak dapat diubah',
        }),
      }),
    );
  });

  it('harus memetakan 429 ke RATE_LIMITED', () => {
    const exception = new RateLimitedException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'RATE_LIMITED',
        }),
      }),
    );
  });

  it('harus memetakan 500 ke INTERNAL_ERROR', () => {
    const exception = new InternalErrorException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      }),
    );
  });

  it('harus memetakan HttpException generic ke kode SAD §7.7 yang bersesuaian', () => {
    const exception = new HttpException('Forbidden Action', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Forbidden Action',
        }),
      }),
    );
  });

  it('harus menangani unhandled error murni dengan HTTP 500 dan kode INTERNAL_ERROR', () => {
    const exception = new Error('Database connection crashed');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      }),
    );
  });
});
