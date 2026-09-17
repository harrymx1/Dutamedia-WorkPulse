import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { FileStorageController } from './controllers/file-storage.controller.js';
import {
  FilePurpose,
  GenerateUploadUrlDto,
} from './dto/generate-upload-url.dto.js';
import { QueryDownloadUrlDto } from './dto/query-download-url.dto.js';
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

describe('FileStorageController (SAD §10.12 - EPIC-14)', () => {
  let controller: FileStorageController;
  let mockFileStorageService: any;

  beforeEach(() => {
    mockFileStorageService = {
      generateUploadUrl: vi.fn(),
      generateDownloadUrl: vi.fn(),
    };

    controller = new FileStorageController(mockFileStorageService);
  });

  describe('generateUploadUrl (POST /api/v1/files/upload-url)', () => {
    it('harus meneruskan parameter ke fileStorageService.generateUploadUrl', async () => {
      const user = createMockUser({
        userId: 'emp-1',
        role: Role.Employee,
      });

      const dto: GenerateUploadUrlDto = {
        purpose: FilePurpose.EVIDENCE,
        contentType: 'image/png',
        fileSize: 1024 * 100,
        entityType: 'Blocker',
        entityId: '00000000-0000-0000-0000-000000000001',
      };

      const mockResponse = {
        fileId: 'file-1',
        uploadUrl: 'https://storage.test/put',
        storagePath: 'evidence/Blocker/00000000-0000-0000-0000-000000000001/file-1.png',
        expiresIn: 300,
      };

      mockFileStorageService.generateUploadUrl.mockResolvedValue(mockResponse);

      const result = await controller.generateUploadUrl(user, dto);

      expect(mockFileStorageService.generateUploadUrl).toHaveBeenCalledWith(user, dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateDownloadUrl (GET /api/v1/files/:fileId/download-url)', () => {
    it('harus meneruskan parameter ke fileStorageService.generateDownloadUrl', async () => {
      const user = createMockUser({
        userId: 'spv-1',
        role: Role.Supervisor_TL,
      });

      const fileId = 'file-uuid-123';
      const query: QueryDownloadUrlDto = {
        purpose: FilePurpose.EVIDENCE,
        entityType: 'Blocker',
        entityId: '00000000-0000-0000-0000-000000000001',
      };

      const mockResponse = {
        downloadUrl: 'https://storage.test/get',
        expiresIn: 900,
      };

      mockFileStorageService.generateDownloadUrl.mockResolvedValue(mockResponse);

      const result = await controller.generateDownloadUrl(user, fileId, query);

      expect(mockFileStorageService.generateDownloadUrl).toHaveBeenCalledWith(
        user,
        fileId,
        query,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
