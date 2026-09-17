import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManagerNoteVisibility, Role } from '@prisma/client';
import { FileStorageService } from './services/file-storage.service.js';
import {
  FilePurpose,
  GenerateUploadUrlDto,
} from './dto/generate-upload-url.dto.js';
import {
  BusinessRuleViolationException,
  ForbiddenException,
  NotFoundException,
} from '../shared/exceptions/api.exception.js';
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

describe('FileStorageService (EPIC-14)', () => {
  let service: FileStorageService;
  let prismaMock: any;
  let s3StorageMock: any;
  let scopeFilterMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      managerNote: {
        findUnique: vi.fn(),
      },
      blocker: {
        findUnique: vi.fn(),
      },
    };

    s3StorageMock = {
      getBucket: vi.fn().mockReturnValue('test-bucket'),
      createPresignedPutUrl: vi.fn().mockResolvedValue('https://storage.test/upload-signed-url'),
      createPresignedGetUrl: vi.fn().mockResolvedValue('https://storage.test/download-signed-url'),
    };

    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['emp-1', 'emp-2']),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue({ id: 'audit-log-uuid' }),
    };

    service = new FileStorageService(
      prismaMock,
      s3StorageMock,
      scopeFilterMock,
      auditMock,
    );
  });

  describe('generateUploadUrl (EPIC-14-T1 & EPIC-14-T3)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
    });

    it('harus berhasil membuat signed PUT URL untuk evidence dengan kedaluwarsa 300 detik', async () => {
      const dto: GenerateUploadUrlDto = {
        purpose: FilePurpose.EVIDENCE,
        contentType: 'image/png',
        fileSize: 1024 * 500, // 500 KB
        entityType: 'Blocker',
        entityId: '00000000-0000-0000-0000-000000000001',
        originalFileName: 'screenshot.png',
      };

      const result = await service.generateUploadUrl(employeeUser, dto);

      expect(result).toHaveProperty('fileId');
      expect(result).toHaveProperty('uploadUrl', 'https://storage.test/upload-signed-url');
      expect(result.expiresIn).toBe(300);
      expect(result.storagePath).toMatch(
        /^evidence\/Blocker\/00000000-0000-0000-0000-000000000001\/[a-f0-9-]+\.png$/,
      );
      expect(s3StorageMock.createPresignedPutUrl).toHaveBeenCalledWith(
        result.storagePath,
        'image/png',
        300,
      );
      expect(auditMock.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: 'emp-1',
          action: 'UPLOAD_FILE_URL_GENERATED',
        }),
      );
    });

    it('harus berhasil membuat signed PUT URL untuk manager-note-evidence', async () => {
      const supervisorUser = createMockUser({
        userId: 'spv-1',
        role: Role.Supervisor_TL,
      });

      const dto: GenerateUploadUrlDto = {
        purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
        contentType: 'application/pdf',
        fileSize: 1024 * 1024 * 2, // 2 MB
        entityId: '11111111-1111-1111-1111-111111111111',
        originalFileName: 'surat_peringatan.pdf',
      };

      const result = await service.generateUploadUrl(supervisorUser, dto);

      expect(result.expiresIn).toBe(300);
      expect(result.storagePath).toMatch(
        /^manager-note-evidence\/11111111-1111-1111-1111-111111111111\/[a-f0-9-]+\.pdf$/,
      );
    });

    it('harus menolak file dengan ukuran lebih dari 10 MB (SAD §14.5)', async () => {
      const dto: GenerateUploadUrlDto = {
        purpose: FilePurpose.EVIDENCE,
        contentType: 'image/jpeg',
        fileSize: 10 * 1024 * 1024 + 1, // 10MB + 1 byte
      };

      await expect(service.generateUploadUrl(employeeUser, dto)).rejects.toThrow(
        BusinessRuleViolationException,
      );
      await expect(service.generateUploadUrl(employeeUser, dto)).rejects.toThrow(
        /melebihi batas maksimum 10 MB/,
      );
    });

    it('harus menolak file dengan ukuran <= 0 byte', async () => {
      const dto: GenerateUploadUrlDto = {
        purpose: FilePurpose.EVIDENCE,
        contentType: 'image/jpeg',
        fileSize: 0,
      };

      await expect(service.generateUploadUrl(employeeUser, dto)).rejects.toThrow(
        BusinessRuleViolationException,
      );
    });

    it('harus menolak contentType di luar yang diizinkan (selain PNG, JPEG, PDF)', async () => {
      const dto: GenerateUploadUrlDto = {
        purpose: FilePurpose.EVIDENCE,
        contentType: 'application/zip' as any,
        fileSize: 1024,
      };

      await expect(service.generateUploadUrl(employeeUser, dto)).rejects.toThrow(
        BusinessRuleViolationException,
      );
      await expect(service.generateUploadUrl(employeeUser, dto)).rejects.toThrow(
        /Tipe file tidak diizinkan/,
      );
    });
  });

  describe('generateDownloadUrl (EPIC-14-T2 & EPIC-14-T3)', () => {
    const employeeUser = createMockUser({
      userId: 'emp-1',
      role: Role.Employee,
    });

    it('harus menolak keras akses ke folder backups (SAD §14.7)', async () => {
      await expect(
        service.generateDownloadUrl(employeeUser, 'backup-uuid', {
          storagePath: 'backups/2026-09-17/db-dump.sql.gz',
        }),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.generateDownloadUrl(employeeUser, 'backup-uuid', {
          purpose: 'backups',
        }),
      ).rejects.toThrow(/Folder backups tidak dapat diakses/);
    });

    it('harus menolak SystemAdmin dari akses data operasional (SAD §8.11)', async () => {
      const adminUser = createMockUser({
        userId: 'admin-1',
        role: Role.SystemAdmin,
      });

      await expect(
        service.generateDownloadUrl(adminUser, 'file-uuid-1', {
          storagePath: 'evidence/Blocker/blocker-1/file-uuid-1.png',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus berhasil membuat signed GET URL untuk evidence umum dengan kedaluwarsa 900 detik (15 menit)', async () => {
      const result = await service.generateDownloadUrl(employeeUser, 'file-uuid-1', {
        storagePath: 'evidence/file-uuid-1.png',
      });

      expect(result).toHaveProperty('downloadUrl', 'https://storage.test/download-signed-url');
      expect(result.expiresIn).toBe(900);
      expect(s3StorageMock.createPresignedGetUrl).toHaveBeenCalledWith(
        'evidence/file-uuid-1.png',
        900,
      );
    });

    describe('Otorisasi manager-note-evidence (BR-14)', () => {
      const managerNoteId = 'note-1';

      it('harus mengembalikan 404 jika ManagerNote tidak ditemukan', async () => {
        prismaMock.managerNote.findUnique.mockResolvedValue(null);

        await expect(
          service.generateDownloadUrl(employeeUser, 'file-1', {
            purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
            entityId: managerNoteId,
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('harus mengembalikan 404 untuk Employee jika catatan bukan tentang dirinya', async () => {
        prismaMock.managerNote.findUnique.mockResolvedValue({
          id: managerNoteId,
          aboutUserId: 'other-emp',
          visibility: ManagerNoteVisibility.VisibleToEmployee,
        });

        await expect(
          service.generateDownloadUrl(employeeUser, 'file-1', {
            purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
            entityId: managerNoteId,
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('harus mengembalikan 404 untuk Employee jika visibility PrivateToManagement', async () => {
        prismaMock.managerNote.findUnique.mockResolvedValue({
          id: managerNoteId,
          aboutUserId: employeeUser.userId,
          visibility: ManagerNoteVisibility.PrivateToManagement,
        });

        await expect(
          service.generateDownloadUrl(employeeUser, 'file-1', {
            purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
            entityId: managerNoteId,
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('harus berhasil untuk Employee jika catatan tentang dirinya dan VisibleToEmployee', async () => {
        prismaMock.managerNote.findUnique.mockResolvedValue({
          id: managerNoteId,
          aboutUserId: employeeUser.userId,
          visibility: ManagerNoteVisibility.VisibleToEmployee,
        });

        const result = await service.generateDownloadUrl(employeeUser, 'file-1', {
          purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
          entityId: managerNoteId,
        });

        expect(result.downloadUrl).toBe('https://storage.test/download-signed-url');
        expect(result.expiresIn).toBe(900);
      });

      it('harus mengizinkan Supervisor jika subordinat ada dalam scope', async () => {
        const supervisorUser = createMockUser({
          userId: 'spv-1',
          role: Role.Supervisor_TL,
        });

        prismaMock.managerNote.findUnique.mockResolvedValue({
          id: managerNoteId,
          aboutUserId: 'subordinate-1',
          visibility: ManagerNoteVisibility.PrivateToManagement,
        });

        scopeFilterMock.getAccessibleUserIds.mockResolvedValue([
          'spv-1',
          'subordinate-1',
        ]);

        const result = await service.generateDownloadUrl(supervisorUser, 'file-1', {
          purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
          entityId: managerNoteId,
        });

        expect(result.downloadUrl).toBe('https://storage.test/download-signed-url');
      });

      it('harus menolak Supervisor dengan 403 jika pegawai di luar scope manajerial', async () => {
        const supervisorUser = createMockUser({
          userId: 'spv-1',
          role: Role.Supervisor_TL,
        });

        prismaMock.managerNote.findUnique.mockResolvedValue({
          id: managerNoteId,
          aboutUserId: 'stranger-emp',
          visibility: ManagerNoteVisibility.PrivateToManagement,
        });

        scopeFilterMock.getAccessibleUserIds.mockResolvedValue(['spv-1', 'subordinate-1']);

        await expect(
          service.generateDownloadUrl(supervisorUser, 'file-1', {
            purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
            entityId: managerNoteId,
          }),
        ).rejects.toThrow(ForbiddenException);
      });

      it('harus mengizinkan HRGA secara company-wide', async () => {
        const hrgaUser = createMockUser({
          userId: 'hrga-1',
          role: Role.HRGA,
        });

        prismaMock.managerNote.findUnique.mockResolvedValue({
          id: managerNoteId,
          aboutUserId: 'any-emp',
          visibility: ManagerNoteVisibility.PrivateToManagement,
        });

        const result = await service.generateDownloadUrl(hrgaUser, 'file-1', {
          purpose: FilePurpose.MANAGER_NOTE_EVIDENCE,
          entityId: managerNoteId,
        });

        expect(result.downloadUrl).toBe('https://storage.test/download-signed-url');
      });
    });

    describe('Otorisasi blocker evidence', () => {
      const blockerId = 'blocker-1';

      it('harus mengizinkan pelapor blocker mengunduh evidence', async () => {
        prismaMock.blocker.findUnique.mockResolvedValue({
          id: blockerId,
          raisedByUserId: employeeUser.userId,
          ownerNeededUserId: 'other-user',
          supportContributions: [],
        });

        const result = await service.generateDownloadUrl(employeeUser, 'file-1', {
          purpose: FilePurpose.EVIDENCE,
          entityType: 'Blocker',
          entityId: blockerId,
        });

        expect(result.downloadUrl).toBe('https://storage.test/download-signed-url');
      });

      it('harus menolak Employee yang tidak terkait sama sekali dengan blocker (bukan pelapor/owner/supporter)', async () => {
        prismaMock.blocker.findUnique.mockResolvedValue({
          id: blockerId,
          raisedByUserId: 'user-a',
          ownerNeededUserId: 'user-b',
          supportContributions: [{ supporterUserId: 'user-c' }],
        });

        await expect(
          service.generateDownloadUrl(employeeUser, 'file-1', {
            purpose: FilePurpose.EVIDENCE,
            entityType: 'Blocker',
            entityId: blockerId,
          }),
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('Otorisasi export laporan', () => {
      it('harus menolak role Employee saat mencoba mengunduh file export', async () => {
        await expect(
          service.generateDownloadUrl(employeeUser, 'export-1', {
            purpose: FilePurpose.EXPORTS,
            storagePath: 'exports/daily-exception/req-1/export-1.pdf',
          }),
        ).rejects.toThrow(ForbiddenException);
      });

      it('harus mengizinkan role Head saat mengunduh file export', async () => {
        const headUser = createMockUser({
          userId: 'head-1',
          role: Role.Head,
        });

        const result = await service.generateDownloadUrl(headUser, 'export-1', {
          purpose: FilePurpose.EXPORTS,
          storagePath: 'exports/daily-exception/req-1/export-1.pdf',
        });

        expect(result.downloadUrl).toBe('https://storage.test/download-signed-url');
      });
    });
  });
});
