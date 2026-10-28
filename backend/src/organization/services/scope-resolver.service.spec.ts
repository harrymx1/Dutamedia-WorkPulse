import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScopeResolverService } from './scope-resolver.service';
import { CanonicalFunction, CanonicalRole } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

describe('ScopeResolverService (WP-EP03-TK006 / SAD IV.4 3-Layer Authorization)', () => {
  let scopeResolver: ScopeResolverService;
  let mockPrisma: any;
  let mockOrgService: any;
  let mockTempReviewerService: any;
  let mockProjectAuthService: any;

  beforeEach(() => {
    mockPrisma = {};
    mockOrgService = {
      getUserActiveAssignment: vi.fn(),
    };
    mockTempReviewerService = {
      getActiveDelegationsForUser: vi.fn().mockResolvedValue([]),
    };
    mockProjectAuthService = {
      getAuthorityForProject: vi.fn(),
    };

    scopeResolver = new ScopeResolverService(
      mockPrisma,
      mockOrgService,
      mockTempReviewerService,
      mockProjectAuthService,
    );
  });

  it('caller accessing their own records must always be allowed', async () => {
    const isAllowed = await scopeResolver.canAccessUser('usr-self', 'usr-self');
    expect(isAllowed).toBe(true);
  });

  it('SYSTEM_ADMIN, CEO_MANAGEMENT, and HRGA must have universal organization scope', async () => {
    mockOrgService.getUserActiveAssignment.mockResolvedValue({
      role: CanonicalRole.SYSTEM_ADMIN,
    });

    const isAllowedAdmin = await scopeResolver.canAccessUser('usr-admin', 'usr-target');
    expect(isAllowedAdmin).toBe(true);

    mockOrgService.getUserActiveAssignment.mockResolvedValue({
      role: CanonicalRole.HRGA,
    });
    const isAllowedHR = await scopeResolver.canAccessUser('usr-hr', 'usr-target');
    expect(isAllowedHR).toBe(true);
  });

  it('HEAD of Engineering can access employee in Engineering function', async () => {
    mockOrgService.getUserActiveAssignment
      .mockResolvedValueOnce({
        role: CanonicalRole.HEAD,
        function: CanonicalFunction.Engineering,
      }) // Caller (Head)
      .mockResolvedValueOnce({
        role: CanonicalRole.EMPLOYEE,
        function: CanonicalFunction.Engineering,
      }); // Target

    const isAllowed = await scopeResolver.canAccessUser('usr-head', 'usr-eng-emp');
    expect(isAllowed).toBe(true);
  });

  it('HEAD of Engineering attempting to access Finance employee must be denied AUTH_FORBIDDEN_SCOPE', async () => {
    mockOrgService.getUserActiveAssignment
      .mockResolvedValueOnce({
        role: CanonicalRole.HEAD,
        function: CanonicalFunction.Engineering,
      }) // Caller (Head Eng)
      .mockResolvedValueOnce({
        role: CanonicalRole.EMPLOYEE,
        function: CanonicalFunction.Finance,
      }); // Target (Finance)

    await expect(
      scopeResolver.enforceUserScope('usr-head', 'usr-fin-emp'),
    ).rejects.toThrowError(AppException);

    try {
      await scopeResolver.enforceUserScope('usr-head', 'usr-fin-emp');
    } catch (err: any) {
      expect(err.code).toBe(ErrorCode.AUTH_FORBIDDEN_SCOPE);
      expect(err.getStatus()).toBe(403);
    }
  });

  it('active Temporary Reviewer delegation allows cross-function review within validity window', async () => {
    mockOrgService.getUserActiveAssignment
      .mockResolvedValueOnce({
        role: CanonicalRole.EMPLOYEE,
        function: CanonicalFunction.Engineering,
      }) // Caller (Eng employee)
      .mockResolvedValueOnce({
        role: CanonicalRole.EMPLOYEE,
        function: CanonicalFunction.Quality,
      }); // Target (Quality employee)

    // Caller memiliki delegasi peninjau sementara untuk fungsi Quality
    mockTempReviewerService.getActiveDelegationsForUser.mockResolvedValue([
      {
        targetFunction: CanonicalFunction.Quality,
        effectiveDate: new Date('2026-10-01'),
        expiryDate: new Date('2026-11-30'),
      },
    ]);

    const isAllowed = await scopeResolver.canAccessUser('usr-delegate', 'usr-qa-emp');
    expect(isAllowed).toBe(true);
  });
});
