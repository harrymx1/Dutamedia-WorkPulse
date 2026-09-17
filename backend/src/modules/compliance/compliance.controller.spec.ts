import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplianceEventType, ManagerNoteVisibility, Role } from '@prisma/client';
import { ComplianceController } from './controllers/compliance.controller.js';
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

describe('ComplianceController (SAD §10.8 - EPIC-12)', () => {
  let controller: ComplianceController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
      coach: vi.fn(),
      recordWarning: vi.fn(),
      escalateFormal: vi.fn(),
    };

    controller = new ComplianceController(mockService);
  });

  describe('findAll (GET /api/v1/compliance-events)', () => {
    it('harus mendelegasikan pemanggilan ke service.findAll', async () => {
      const user = createMockUser({
        userId: 'hrga-1',
        role: Role.HRGA,
      });
      const query = { page: 1, limit: 10 };
      const mockResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      mockService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(user, query);

      expect(mockService.findAll).toHaveBeenCalledWith(user, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById (GET /api/v1/compliance-events/:id)', () => {
    it('harus mendelegasikan pemanggilan ke service.findById', async () => {
      const user = createMockUser({
        userId: 'sup-1',
        role: Role.Supervisor_TL,
      });
      const mockResult = {
        id: 'event-1',
        eventType: ComplianceEventType.PatternFlag,
        availableActions: ['coach'],
      };
      mockService.findById.mockResolvedValue(mockResult);

      const result = await controller.findById(user, 'event-1');

      expect(mockService.findById).toHaveBeenCalledWith(user, 'event-1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('coach (POST /api/v1/compliance-events/:id/coach)', () => {
    it('harus mendelegasikan pemanggilan ke service.coach', async () => {
      const user = createMockUser({
        userId: 'sup-1',
        role: Role.Supervisor_TL,
      });
      const dto = {
        note: 'Sesi pembinaan kedisiplinan',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
      };
      const mockResult = {
        complianceEvent: { id: 'coach-1', eventType: ComplianceEventType.Coaching },
        managerNote: { id: 'note-1', note: dto.note },
      };
      mockService.coach.mockResolvedValue(mockResult);

      const result = await controller.coach(user, 'flag-1', dto);

      expect(mockService.coach).toHaveBeenCalledWith(user, 'flag-1', dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('recordWarning (POST /api/v1/compliance-events/:id/record-warning)', () => {
    it('harus mendelegasikan pemanggilan ke service.recordWarning', async () => {
      const user = createMockUser({
        userId: 'hrga-1',
        role: Role.HRGA,
      });
      const dto = { note: 'Peringatan tertulis pertama' };
      const mockResult = {
        id: 'warn-1',
        eventType: ComplianceEventType.RecordedWarning,
      };
      mockService.recordWarning.mockResolvedValue(mockResult);

      const result = await controller.recordWarning(user, 'coach-1', dto);

      expect(mockService.recordWarning).toHaveBeenCalledWith(user, 'coach-1', dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('escalateFormal (POST /api/v1/compliance-events/:id/escalate-formal)', () => {
    it('harus mendelegasikan pemanggilan ke service.escalateFormal', async () => {
      const user = createMockUser({
        userId: 'hrga-1',
        role: Role.HRGA,
      });
      const dto = { note: 'Eskalasi formal proses ke direksi' };
      const mockResult = {
        id: 'esc-1',
        eventType: ComplianceEventType.EscalatedFormalProcess,
      };
      mockService.escalateFormal.mockResolvedValue(mockResult);

      const result = await controller.escalateFormal(user, 'warn-1', dto);

      expect(mockService.escalateFormal).toHaveBeenCalledWith(user, 'warn-1', dto);
      expect(result).toEqual(mockResult);
    });
  });
});
