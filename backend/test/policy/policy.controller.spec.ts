import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyCategory } from '@prisma/client';
import {
  PolicyController,
  PolicyOwnerAssignmentController,
} from '../../src/modules/policy/policy.controller.js';

describe('PolicyController (SAD §10.9 - EPIC-06)', () => {
  let controller: PolicyController;
  let ownerAssignmentController: PolicyOwnerAssignmentController;
  let mockPolicyService: any;

  beforeEach(() => {
    mockPolicyService = {
      getActivePolicies: vi.fn(),
      getPolicyHistory: vi.fn(),
      createPolicy: vi.fn(),
      createPolicyOwnerAssignment: vi.fn(),
    };

    controller = new PolicyController(mockPolicyService);
    ownerAssignmentController = new PolicyOwnerAssignmentController(
      mockPolicyService,
    );
  });

  describe('getActivePolicies (GET /api/v1/policies)', () => {
    it('harus memanggil policyService.getActivePolicies dengan query DTO', async () => {
      const mockResult = [{ id: 'pol-1', category: PolicyCategory.Cutoff }];
      mockPolicyService.getActivePolicies.mockResolvedValue(mockResult);

      const query = { category: PolicyCategory.Cutoff };
      const result = await controller.getActivePolicies(query);

      expect(mockPolicyService.getActivePolicies).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createPolicy (POST /api/v1/policies)', () => {
    it('harus memanggil policyService.createPolicy dengan DTO dan actorUserId', async () => {
      const mockCreated = { id: 'pol-new-1', category: PolicyCategory.Cutoff };
      mockPolicyService.createPolicy.mockResolvedValue(mockCreated);

      const dto = {
        category: PolicyCategory.Cutoff,
        value: { morningOnTimeDeadline: '09:00' },
        effectiveDate: '2026-09-01',
      };

      const result = await controller.createPolicy(dto, 'owner-user-1');

      expect(mockPolicyService.createPolicy).toHaveBeenCalledWith(
        dto,
        'owner-user-1',
      );
      expect(result).toEqual(mockCreated);
    });
  });

  describe('getPolicyHistory (GET /api/v1/policies/:category/history)', () => {
    it('harus memanggil policyService.getPolicyHistory dengan category', async () => {
      const mockHistory = [{ id: 'pol-1' }, { id: 'pol-2' }];
      mockPolicyService.getPolicyHistory.mockResolvedValue(mockHistory);

      const result = await controller.getPolicyHistory(PolicyCategory.Cutoff);

      expect(mockPolicyService.getPolicyHistory).toHaveBeenCalledWith(
        PolicyCategory.Cutoff,
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe('createPolicyOwnerAssignment (POST /api/v1/policy-owner-assignments)', () => {
    it('harus memanggil policyService.createPolicyOwnerAssignment dengan DTO dan actorAdminId', async () => {
      const mockAssignment = { id: 'poa-1', userId: 'user-1' };
      mockPolicyService.createPolicyOwnerAssignment.mockResolvedValue(
        mockAssignment,
      );

      const dto = {
        userId: 'user-1',
        policyCategory: PolicyCategory.Cutoff,
        effectiveDate: '2026-09-01',
      };

      const result = await ownerAssignmentController.createPolicyOwnerAssignment(
        dto,
        'admin-user-1',
      );

      expect(
        mockPolicyService.createPolicyOwnerAssignment,
      ).toHaveBeenCalledWith(dto, 'admin-user-1');
      expect(result).toEqual(mockAssignment);
    });
  });
});
