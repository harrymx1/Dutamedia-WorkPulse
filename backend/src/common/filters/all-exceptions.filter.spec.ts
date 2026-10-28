import { describe, it, expect, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppException } from '../exceptions/app.exception';
import { ErrorCode } from '../constants/error-codes';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter (EP01-TK006 / SAD IV.2.2)', () => {
  const filter = new AllExceptionsFilter();

  const createMockHost = (requestId = 'req_c3a84b91') => {
    let capturedStatus: number | undefined;
    let capturedJson: any;

    const mockResponse = {
      status: vi.fn().mockImplementation((status: number) => {
        capturedStatus = status;
        return mockResponse;
      }),
      json: vi.fn().mockImplementation((data: any) => {
        capturedJson = data;
        return mockResponse;
      }),
    };

    const mockRequest = {
      id: requestId,
      headers: { 'x-request-id': requestId },
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    return {
      host,
      getStatus: () => capturedStatus,
      getJson: () => capturedJson,
    };
  };

  it('should transform AppException into SAD IV.2.2 Error Envelope', () => {
    const { host, getStatus, getJson } = createMockHost('req_scope_err');

    const appException = new AppException({
      code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
      message: 'Anda tidak memiliki kewenangan untuk mengakses atau meninjau rekaman di luar fungsi/squad Anda.',
      statusCode: HttpStatus.FORBIDDEN,
      details: [
        {
          field: 'scope',
          issue: 'Requested user USR-004 is outside caller supervision scope',
        },
      ],
    });

    filter.catch(appException, host);

    expect(getStatus()).toBe(403);
    const body = getJson();
    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(403);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe(ErrorCode.AUTH_FORBIDDEN_SCOPE);
    expect(body.error.message).toContain('kewenangan untuk mengakses');
    expect(body.error.details).toHaveLength(1);
    expect(body.error.details[0].field).toBe('scope');
    expect(body.meta.requestId).toBe('req_scope_err');
    expect(body.meta.timestamp).toBeDefined();
  });

  it('should handle unhandled standard Error gracefully without leaking internal stack', () => {
    const { host, getStatus, getJson } = createMockHost('req_unhandled');

    const error = new Error('Database connection socket timeout');
    filter.catch(error, host);

    expect(getStatus()).toBe(500);
    const body = getJson();
    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(500);
    expect(body.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(body.error.message).toBe('Terjadi kesalahan internal pada sistem.');
    expect(body.meta.requestId).toBe('req_unhandled');
  });
});

