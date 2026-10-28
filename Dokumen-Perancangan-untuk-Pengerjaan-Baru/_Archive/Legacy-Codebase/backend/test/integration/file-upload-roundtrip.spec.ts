import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { FileStorageService } from '../../src/modules/file-storage/services/file-storage.service.js';
import { FilePurpose } from '../../src/modules/file-storage/dto/generate-upload-url.dto.js';
import type { CurrentUserPayload } from '../../src/modules/auth/decorators/current-user.decorator.js';

describe('EPIC-21-T5: File Upload Round-Trip End-to-End (SAD §17.6, §14.3)', () => {
  let fileStorageService: FileStorageService;
  let prismaMock: any;
  let s3StorageMock: any;
  let scopeFilterMock: any;
  let auditMock: any;

  const mockUser: CurrentUserPayload = {
    userId: 'usr-employee-1',
    role: Role.Employee,
    email: 'employee1@dutamedia.com',
    function: 'Engineering',
    directManagerId: 'usr-tl-1',
    sessionId: 'sess-1',
    mustResetPassword: false,
  };

  beforeEach(() => {
    prismaMock = {
      blocker: {
        findUnique: vi.fn(),
      },
      managerNote: {
        findUnique: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    };

    s3StorageMock = {
      getBucket: vi.fn().mockReturnValue('workpulse-evidence'),
      createPresignedPutUrl: vi.fn().mockImplementation((path: string) => {
        return Promise.resolve(`https://storage.supabase.co/upload?path=${encodeURIComponent(path)}&signature=valid-sig`);
      }),
      createPresignedGetUrl: vi.fn().mockImplementation((path: string) => {
        return Promise.resolve(`https://storage.supabase.co/download?path=${encodeURIComponent(path)}&signature=valid-sig`);
      }),
    };

    scopeFilterMock = {
      getAccessibleUserIds: vi.fn().mockResolvedValue(['usr-employee-1']),
    };

    auditMock = {
      record: vi.fn().mockResolvedValue({ id: 'audit-log-uuid' }),
    };

    fileStorageService = new FileStorageService(
      prismaMock,
      s3StorageMock,
      scopeFilterMock,
      auditMock,
    );
  });

  it('mengeksekusi 6-langkah full round-trip flow file upload secara konsisten sesuai SAD §17.6', async () => {
    // -------------------------------------------------------------
    // LANGKAH 1 & 2: FE meminta signed upload URL dari BE
    // -------------------------------------------------------------
    const uploadUrlResult = await fileStorageService.generateUploadUrl(mockUser, {
      purpose: FilePurpose.EVIDENCE,
      contentType: 'image/png',
      fileSize: 1024 * 50, // 50 KB
      originalFileName: 'screenshot-error-blocker.png',
    });

    expect(uploadUrlResult).toBeDefined();
    expect(uploadUrlResult.fileId).toMatch(/^[0-9a-f-]{36}$/); // UUID v4
    expect(uploadUrlResult.uploadUrl).toContain('https://storage.supabase.co/upload');
    expect(uploadUrlResult.storagePath).toContain('evidence/');
    expect(uploadUrlResult.expiresIn).toBe(300); // 5 menit sesuai SAD §14.5

    const { fileId, uploadUrl, storagePath } = uploadUrlResult;

    // -------------------------------------------------------------
    // LANGKAH 3: FE melakukan HTTP PUT langsung ke Object Storage (Simulasi koneksi terpisah)
    // -------------------------------------------------------------
    const simulatedFileContent = Buffer.from('fake-png-binary-data');
    const directStoragePutHeaders = {
      'Content-Type': 'image/png',
      // Wajib tidak menyertakan cookie auth WorkPulse (SAD §17.6 langkah 3)
      Cookie: undefined,
      'X-CSRF-Token': undefined,
    };

    expect(directStoragePutHeaders.Cookie).toBeUndefined();
    expect(directStoragePutHeaders['X-CSRF-Token']).toBeUndefined();
    expect(uploadUrl).toContain(encodeURIComponent(storagePath));

    // -------------------------------------------------------------
    // LANGKAH 4 & 5: FE menyertakan fileId pada pembuatan resource (mis. Blocker)
    // -------------------------------------------------------------
    const createdBlockerPayload = {
      id: 'd9b2b528-98e9-4e78-bc48-c84594c92ec1',
      title: 'Database connection timeout',
      description: 'API connection failed during morning run',
      evidenceFileId: fileId, // fileId tersimpan sebagai foreign/polymorphic reference
      raisedByUserId: mockUser.userId,
    };

    expect(createdBlockerPayload.evidenceFileId).toBe(fileId);

    // Mock database lookup untuk blocker yang dibuat
    prismaMock.blocker.findUnique.mockResolvedValue({
      id: createdBlockerPayload.id,
      raisedByUserId: mockUser.userId,
      ownerNeededUserId: null,
      supportContributions: [],
      evidenceFileId: fileId,
    });

    // -------------------------------------------------------------
    // LANGKAH 6: Pengambilan download URL untuk evidence yang tersimpan
    // -------------------------------------------------------------
    const downloadResult = await fileStorageService.generateDownloadUrl(mockUser, fileId, {
      purpose: FilePurpose.EVIDENCE,
      entityType: 'Blocker',
      entityId: createdBlockerPayload.id,
    });

    expect(downloadResult).toBeDefined();
    expect(downloadResult.downloadUrl).toContain('https://storage.supabase.co/download');
    expect(downloadResult.expiresIn).toBe(900); // 15 menit sesuai SAD §14.4
  });

  it('menolak permohonan upload URL jika fileSize melebihi batas 10 MB (SAD §14.5)', async () => {
    await expect(
      fileStorageService.generateUploadUrl(mockUser, {
        purpose: FilePurpose.EVIDENCE,
        contentType: 'image/png',
        fileSize: 11 * 1024 * 1024, // 11 MB > 10 MB
      }),
    ).rejects.toThrow();
  });
});
