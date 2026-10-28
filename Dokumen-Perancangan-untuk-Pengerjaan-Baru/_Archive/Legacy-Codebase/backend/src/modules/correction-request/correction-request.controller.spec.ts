import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { CorrectionRequestController } from './controllers/correction-request.controller.js';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

function createMockUser(
  partial: Partial<CurrentUserPayload> & { userId: string; role: Role },
): CurrentUserPayload {
  return {
    email: `${partial.userId}@dutamedia.com`,
    function: partial.function ?? 'Engineering',
    directManagerId: null,
    sessionId: `session-${partial.userId}`,
    mustResetPassword: false,
    ...partial,
  };
}

describe('CorrectionRequestController (SAD §10.5 - EPIC-09)', () => {
  let controller: CorrectionRequestController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      createCorrectionRequest: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      objectCorrection: vi.fn(),
    };

    controller = new CorrectionRequestController(mockService);
  });

  describe('create (POST /api/v1/correction-requests)', () => {
    it('harus memanggil createCorrectionRequest pada service', async () => {
      const user = createMockUser({
        userId: 'emp-1',
        role: Role.Employee,
      });
      const dto = {
        targetCommitmentId: 'comm-1',
        requestedChange: { text: 'Perubahan' },
        reason: 'Typo perbaikan',
      };
      const mockResult = { id: 'cr-1', ...dto };
      mockService.createCorrectionRequest.mockResolvedValue(mockResult);

      const result = await controller.create(user, dto);

      expect(mockService.createCorrectionRequest).toHaveBeenCalledWith(user, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll (GET /api/v1/correction-requests)', () => {
    it('harus memanggil findAll pada service', async () => {
      const user = createMockUser({
        userId: 'emp-1',
        role: Role.Employee,
      });
      const query = { page: 1, limit: 10 };
      const mockResult = { data: [], meta: { totalItems: 0, totalPages: 0, page: 1, limit: 10 } };
      mockService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(user, query);

      expect(mockService.findAll).toHaveBeenCalledWith(user, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById (GET /api/v1/correction-requests/:id)', () => {
    it('harus memanggil findById pada service', async () => {
      const user = createMockUser({
        userId: 'emp-1',
        role: Role.Employee,
      });
      const mockResult = { id: 'cr-1', reason: 'Alasan' };
      mockService.findById.mockResolvedValue(mockResult);

      const result = await controller.findById(user, 'cr-1');

      expect(mockService.findById).toHaveBeenCalledWith(user, 'cr-1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('objectCorrection (POST /api/v1/correction-requests/:id/object)', () => {
    it('harus memanggil objectCorrection pada service', async () => {
      const user = createMockUser({
        userId: 'spv-1',
        role: Role.Supervisor_TL,
      });
      const dto = { objectionReason: 'Tidak disetujui' };
      const mockResult = { id: 'cr-1', status: 'Rejected' };
      mockService.objectCorrection.mockResolvedValue(mockResult);

      const result = await controller.objectCorrection(user, 'cr-1', dto);

      expect(mockService.objectCorrection).toHaveBeenCalledWith(user, 'cr-1', dto);
      expect(result).toEqual(mockResult);
    });
  });
});
