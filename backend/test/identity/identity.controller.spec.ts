import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role, UserStatus } from '@prisma/client';
import { IdentityController } from '../../src/modules/identity/identity.controller.js';
import type { IdentityService } from '../../src/modules/identity/identity.service.js';

describe('IdentityController (SAD §10.2)', () => {
  let controller: IdentityController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getUsers: vi.fn(),
      createUser: vi.fn(),
      getUserById: vi.fn(),
      updateUserStatus: vi.fn(),
      getOrganizationalAssignments: vi.fn(),
      createOrganizationalAssignment: vi.fn(),
      createProjectAuthorityMapping: vi.fn(),
      updateProjectAuthorityMapping: vi.fn(),
      createTemporaryReviewerAssignment: vi.fn(),
    };

    controller = new IdentityController(mockService as unknown as IdentityService);
  });

  const mockReq = { user: { userId: 'admin-1' } } as any;

  it('GET /users mendelegasikan ke service.getUsers', async () => {
    mockService.getUsers.mockResolvedValue({ items: [], pagination: {} });

    await controller.getUsers({ page: 1, pageSize: 20 });
    expect(mockService.getUsers).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('POST /users mendelegasikan ke service.createUser dengan actorUserId', async () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john@dutamedia.com',
      initialRole: Role.Employee,
      function: 'Operations',
      effectiveDate: '2026-09-01',
    };

    mockService.createUser.mockResolvedValue({ user: {}, temporaryPassword: 'pwd' });

    await controller.createUser(dto, mockReq);
    expect(mockService.createUser).toHaveBeenCalledWith(dto, 'admin-1');
  });

  it('PATCH /users/:id mendelegasikan ke service.updateUserStatus', async () => {
    await controller.updateUserStatus(
      'user-1',
      { status: UserStatus.Inactive },
      mockReq,
    );
    expect(mockService.updateUserStatus).toHaveBeenCalledWith(
      'user-1',
      { status: UserStatus.Inactive },
      'admin-1',
    );
  });

  it('POST /organizational-assignments mendelegasikan ke service.createOrganizationalAssignment', async () => {
    const dto = {
      userId: 'user-1',
      role: Role.Supervisor_TL,
      function: 'Engineering',
      effectiveDate: '2026-09-01',
    };

    await controller.createOrganizationalAssignment(dto, mockReq);
    expect(mockService.createOrganizationalAssignment).toHaveBeenCalledWith(
      dto,
      'admin-1',
    );
  });

  it('POST /project-authority-mappings mendelegasikan ke service.createProjectAuthorityMapping', async () => {
    const dto = {
      userId: 'user-1',
      scopeReference: 'Project Alpha',
      effectiveDate: '2026-09-01',
    };

    await controller.createProjectAuthorityMapping(dto, mockReq);
    expect(mockService.createProjectAuthorityMapping).toHaveBeenCalledWith(
      dto,
      'admin-1',
    );
  });

  it('PATCH /project-authority-mappings/:id mendelegasikan ke service.updateProjectAuthorityMapping', async () => {
    await controller.updateProjectAuthorityMapping(
      'map-1',
      { endDate: '2026-09-30' },
      mockReq,
    );
    expect(mockService.updateProjectAuthorityMapping).toHaveBeenCalledWith(
      'map-1',
      { endDate: '2026-09-30' },
      'admin-1',
    );
  });

  it('POST /temporary-reviewer-assignments mendelegasikan ke service.createTemporaryReviewerAssignment', async () => {
    const dto = {
      reviewerUserId: 'user-2',
      scope: 'Engineering',
      reason: 'Leave cover',
      effectiveDate: '2026-09-01',
      expiryDate: '2026-09-15',
    };

    await controller.createTemporaryReviewerAssignment(dto, mockReq);
    expect(mockService.createTemporaryReviewerAssignment).toHaveBeenCalledWith(
      dto,
      'admin-1',
    );
  });
});
