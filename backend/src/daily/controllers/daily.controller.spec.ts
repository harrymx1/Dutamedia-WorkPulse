import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyController } from './daily.controller';
import { AppException } from '../../common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/constants/error-codes';

describe('DailyController (Scope & History Enforcement)', () => {
  let controller: DailyController;
  let mockDailyService: any;
  let mockScopeResolver: any;

  beforeEach(() => {
    mockDailyService = {
      getTodayState: vi.fn(),
      submitMorningCheckin: vi.fn(),
      submitAdditionalWork: vi.fn(),
      submitEodOutcome: vi.fn(),
      getWeeklyHistory: vi.fn(),
    };

    mockScopeResolver = {
      enforceUserScope: vi.fn(),
      canAccessUser: vi.fn(),
    };

    controller = new DailyController(mockDailyService, mockScopeResolver);
  });

  it('allows user to retrieve their own weekly history without invoking scopeResolver', async () => {
    const req = { user: { id: 'user-1' } };
    mockDailyService.getWeeklyHistory.mockResolvedValue({ records: [], summary: {} });

    const result = await controller.getWeeklyHistory(req);

    expect(mockScopeResolver.enforceUserScope).not.toHaveBeenCalled();
    expect(mockDailyService.getWeeklyHistory).toHaveBeenCalledWith('user-1', undefined, undefined);
    expect(result).toBeDefined();
  });

  it('enforces scope check when accessing weekly history of another user', async () => {
    const req = { user: { id: 'head-engineering-id' } };
    const targetUserId = 'dev-frontend-id';
    mockDailyService.getWeeklyHistory.mockResolvedValue({ records: [] });

    await controller.getWeeklyHistory(req, targetUserId);

    expect(mockScopeResolver.enforceUserScope).toHaveBeenCalledWith(
      'head-engineering-id',
      'dev-frontend-id',
    );
    expect(mockDailyService.getWeeklyHistory).toHaveBeenCalledWith(
      'dev-frontend-id',
      undefined,
      undefined,
    );
  });

  it('rejects with AUTH_FORBIDDEN_SCOPE if scopeResolver throws when accessing cross-function user', async () => {
    const req = { user: { id: 'head-engineering-id' } };
    const crossFuncUserId = 'maya-rnd-id';
    mockScopeResolver.enforceUserScope.mockRejectedValue(
      new AppException({
        statusCode: HttpStatus.FORBIDDEN,
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: 'Anda tidak memiliki kewenangan untuk mengakses atau meninjau rekaman di luar fungsi/squad Anda.',
      }),
    );

    await expect(
      controller.getWeeklyHistory(req, crossFuncUserId),
    ).rejects.toThrowError(AppException);

    expect(mockDailyService.getWeeklyHistory).not.toHaveBeenCalled();
  });
});
