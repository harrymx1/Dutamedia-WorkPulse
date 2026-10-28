import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManagerNoteType, ManagerNoteVisibility, Role } from '@prisma/client';
import { ManagerNoteController } from './controllers/manager-note.controller.js';
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

describe('ManagerNoteController (SAD §10.7 - EPIC-11)', () => {
  let controller: ManagerNoteController;
  let mockManagerNoteService: any;

  beforeEach(() => {
    mockManagerNoteService = {
      createManagerNote: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
    };

    controller = new ManagerNoteController(mockManagerNoteService);
  });

  describe('create (POST /api/v1/manager-notes)', () => {
    it('harus meneruskan panggilan createManagerNote ke service dengan user dan DTO', async () => {
      const user = createMockUser({
        userId: 'spv-1',
        role: Role.Supervisor_TL,
        function: 'Engineering',
      });
      const dto = {
        aboutUserId: 'emp-1',
        type: ManagerNoteType.Coaching,
        note: 'Bimbingan teknis.',
        visibility: ManagerNoteVisibility.VisibleToEmployee,
      };
      const mockResult = { id: 'note-1', ...dto, createdByUserId: 'spv-1' };
      mockManagerNoteService.createManagerNote.mockResolvedValue(mockResult);

      const result = await controller.create(user, dto);

      expect(mockManagerNoteService.createManagerNote).toHaveBeenCalledWith(user, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll (GET /api/v1/manager-notes)', () => {
    it('harus meneruskan panggilan findAll ke service dengan user dan query DTO', async () => {
      const user = createMockUser({
        userId: 'emp-1',
        role: Role.Employee,
        function: 'Engineering',
      });
      const query = { page: 1, limit: 10 };
      const mockResult = { data: [], meta: { totalItems: 0, totalPages: 0, page: 1, limit: 10 } };
      mockManagerNoteService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(user, query);

      expect(mockManagerNoteService.findAll).toHaveBeenCalledWith(user, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById (GET /api/v1/manager-notes/:id)', () => {
    it('harus meneruskan panggilan findById ke service dengan user dan id', async () => {
      const user = createMockUser({
        userId: 'emp-1',
        role: Role.Employee,
        function: 'Engineering',
      });
      const mockResult = { id: 'note-1', note: 'Apresiasi' };
      mockManagerNoteService.findById.mockResolvedValue(mockResult);

      const result = await controller.findById(user, 'note-1');

      expect(mockManagerNoteService.findById).toHaveBeenCalledWith(user, 'note-1');
      expect(result).toEqual(mockResult);
    });
  });
});
