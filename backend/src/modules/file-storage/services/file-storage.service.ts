import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ManagerNoteVisibility, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { S3StorageService } from './s3-storage.service.js';
import {
  GenerateUploadUrlDto,
  FilePurpose,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../dto/generate-upload-url.dto.js';
import { QueryDownloadUrlDto } from '../dto/query-download-url.dto.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import {
  BusinessRuleViolationException,
  ForbiddenException,
  NotFoundException,
} from '../../shared/exceptions/api.exception.js';

export interface GenerateUploadUrlResult {
  fileId: string;
  uploadUrl: string;
  storagePath: string;
  expiresIn: number;
}

export interface GenerateDownloadUrlResult {
  downloadUrl: string;
  expiresIn: number;
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3StorageService: S3StorageService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Mengembalikan ekstensi file yang sesuai berdasarkan contentType dan nama asli file.
   */
  private resolveExtension(
    contentType: string,
    originalFileName?: string,
  ): string {
    if (originalFileName && originalFileName.includes('.')) {
      const ext = originalFileName.split('.').pop()?.toLowerCase();
      if (ext && ['png', 'jpg', 'jpeg', 'pdf', 'xlsx'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }

    switch (contentType) {
      case 'image/png':
        return 'png';
      case 'image/jpeg':
        return 'jpg';
      case 'application/pdf':
        return 'pdf';
      default:
        return 'bin';
    }
  }

  /**
   * Membangun storagePath sesuai spesifikasi hierarki folder SAD §14.2:
   * - evidence/{entityType}/{entityId}/{fileId}.{ext}
   * - manager-note-evidence/{managerNoteId}/{fileId}.{ext}
   * - exports/{reportType}/{requestId}/{fileId}.{pdf|xlsx}
   */
  private buildStoragePath(
    purpose: FilePurpose,
    fileId: string,
    extension: string,
    entityType?: string,
    entityId?: string,
  ): string {
    switch (purpose) {
      case FilePurpose.MANAGER_NOTE_EVIDENCE:
        return entityId
          ? `manager-note-evidence/${entityId}/${fileId}.${extension}`
          : `manager-note-evidence/${fileId}.${extension}`;

      case FilePurpose.EXPORTS:
        if (entityType && entityId) {
          return `exports/${entityType}/${entityId}/${fileId}.${extension}`;
        }
        return `exports/${fileId}.${extension}`;

      case FilePurpose.EVIDENCE:
      default:
        if (entityType && entityId) {
          return `evidence/${entityType}/${entityId}/${fileId}.${extension}`;
        } else if (entityType) {
          return `evidence/${entityType}/${fileId}.${extension}`;
        }
        return `evidence/${fileId}.${extension}`;
    }
  }

  /**
   * Endpoint POST /api/v1/files/upload-url (SAD §10.12, §14.3, §14.5).
   * Menghasilkan signed PUT URL bertenggat waktu 5 menit (300 detik).
   */
  async generateUploadUrl(
    user: CurrentUserPayload,
    dto: GenerateUploadUrlDto,
  ): Promise<GenerateUploadUrlResult> {
    // 1. Validasi ukuran file (maks 10 MB, SAD §14.5)
    if (dto.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new BusinessRuleViolationException(
        `Ukuran file melebihi batas maksimum 10 MB (${MAX_FILE_SIZE_BYTES} bytes)`,
      );
    }
    if (dto.fileSize <= 0) {
      throw new BusinessRuleViolationException(
        'Ukuran file minimal harus lebih dari 0 byte',
      );
    }

    // 2. Validasi tipe MIME yang diizinkan (SAD §14.5)
    if (!ALLOWED_MIME_TYPES.includes(dto.contentType)) {
      throw new BusinessRuleViolationException(
        'Tipe file tidak diizinkan. Hanya PNG, JPEG, dan PDF yang diperbolehkan (SAD §14.5)',
      );
    }

    // 3. Generate fileId unik (UUID v4)
    const fileId = randomUUID();

    // 4. Bangun storage path sesuai SAD §14.2
    const extension = this.resolveExtension(dto.contentType, dto.originalFileName);
    const storagePath = this.buildStoragePath(
      dto.purpose,
      fileId,
      extension,
      dto.entityType,
      dto.entityId,
    );

    // 5. Generate signed PUT URL (kedaluwarsa 5 menit = 300 detik, SAD §14.3)
    const expiresIn = 300;
    const uploadUrl = await this.s3StorageService.createPresignedPutUrl(
      storagePath,
      dto.contentType,
      expiresIn,
    );

    // 6. Catat audit trail
    await this.auditService.record({
      actorUserId: user.userId,
      action: 'UPLOAD_FILE_URL_GENERATED',
      relatedEntityType: dto.entityType || 'File',
      relatedEntityId: dto.entityId || fileId,
      valueAfter: {
        fileId,
        purpose: dto.purpose,
        storagePath,
        contentType: dto.contentType,
        fileSize: dto.fileSize,
        expiresIn,
      },
    });

    return {
      fileId,
      uploadUrl,
      storagePath,
      expiresIn,
    };
  }

  /**
   * Endpoint GET /api/v1/files/:fileId/download-url (SAD §10.12, §14.4).
   * Otorisasi download mengikuti resource pemilik file, signed GET URL 15 menit (900 detik).
   */
  async generateDownloadUrl(
    user: CurrentUserPayload,
    fileId: string,
    query?: QueryDownloadUrlDto,
  ): Promise<GenerateDownloadUrlResult> {
    // 1. SAD §14.7: Folder backups TIDAK PERNAH diekspos melalui API
    if (
      query?.storagePath?.includes('backups/') ||
      query?.storagePath?.startsWith('backups') ||
      query?.purpose === 'backups'
    ) {
      throw new ForbiddenException(
        'Folder backups tidak dapat diakses melalui API (SAD §14.7)',
      );
    }

    // SystemAdmin dilarang mengakses data operasional (SAD §8.11)
    if (user.role === Role.SystemAdmin) {
      throw new ForbiddenException(
        'SystemAdmin tidak memiliki kewenangan mengakses data operasional (SAD §8.11)',
      );
    }

    // 2. Resolusi otorisasi mengikuti resource pemilik (SAD §14.4)
    const storagePath = query?.storagePath;
    const isManagerNote =
      query?.purpose === FilePurpose.MANAGER_NOTE_EVIDENCE ||
      query?.entityType === 'ManagerNote' ||
      storagePath?.includes('manager-note-evidence');

    const isBlocker =
      query?.purpose === FilePurpose.EVIDENCE ||
      query?.entityType === 'Blocker' ||
      storagePath?.includes('evidence/Blocker');

    const isExport =
      query?.purpose === FilePurpose.EXPORTS ||
      storagePath?.includes('exports');

    if (isManagerNote) {
      await this.authorizeManagerNoteEvidence(user, query?.entityId, storagePath);
    } else if (isBlocker) {
      await this.authorizeBlockerEvidence(user, query?.entityId, storagePath);
    } else if (isExport) {
      this.authorizeExportDownload(user);
    }

    // 3. Tentukan key path di storage
    let key = storagePath;
    if (!key) {
      if (isManagerNote) {
        key = query?.entityId
          ? `manager-note-evidence/${query.entityId}/${fileId}`
          : `manager-note-evidence/${fileId}`;
      } else if (isExport) {
        key = `exports/${fileId}`;
      } else {
        key = query?.entityType && query?.entityId
          ? `evidence/${query.entityType}/${query.entityId}/${fileId}`
          : `evidence/${fileId}`;
      }
    }

    // 4. Generate signed GET URL (kedaluwarsa 15 menit = 900 detik, SAD §14.4)
    const expiresIn = 900;
    const downloadUrl = await this.s3StorageService.createPresignedGetUrl(
      key,
      expiresIn,
    );

    // 5. Catat audit trail
    await this.auditService.record({
      actorUserId: user.userId,
      action: 'DOWNLOAD_FILE_URL_GENERATED',
      relatedEntityType: query?.entityType || 'File',
      relatedEntityId: query?.entityId || fileId,
      valueAfter: {
        fileId,
        storagePath: key,
        expiresIn,
      },
    });

    return {
      downloadUrl,
      expiresIn,
    };
  }

  /**
   * Verifikasi kepatuhan BR-14 untuk manager-note-evidence.
   */
  private async authorizeManagerNoteEvidence(
    user: CurrentUserPayload,
    entityId?: string,
    storagePath?: string,
  ): Promise<void> {
    let noteId = entityId;

    if (!noteId && storagePath) {
      const match = storagePath.match(/manager-note-evidence\/([^/]+)/);
      if (match && match[1] && !match[1].includes('.')) {
        noteId = match[1];
      }
    }

    if (noteId) {
      const managerNote = await this.prisma.managerNote.findUnique({
        where: { id: noteId },
      });

      if (!managerNote) {
        throw new NotFoundException('Manager note pemilik file tidak ditemukan');
      }

      // Aturan BR-14: Employee hanya boleh melihat jika catatan tentang dirinya dan VisibleToEmployee
      if (user.role === Role.Employee) {
        if (
          managerNote.aboutUserId !== user.userId ||
          managerNote.visibility !== ManagerNoteVisibility.VisibleToEmployee
        ) {
          // SAD §10.7: 404 jika di luar visibility
          throw new NotFoundException('Data tidak ditemukan');
        }
      } else if (
        user.role === Role.Supervisor_TL ||
        user.role === Role.Head
      ) {
        const accessibleUserIds =
          await this.scopeFilterService.getAccessibleUserIds(user);
        if (
          accessibleUserIds &&
          !accessibleUserIds.includes(managerNote.aboutUserId)
        ) {
          throw new ForbiddenException(
            'Akses ditolak: data di luar scope manajerial Anda',
          );
        }
      }
      // HRGA dan CEO_Management memiliki wewenang company-wide (PRD §7)
    }
  }

  /**
   * Verifikasi kepatuhan scope untuk blocker evidence.
   */
  private async authorizeBlockerEvidence(
    user: CurrentUserPayload,
    entityId?: string,
    storagePath?: string,
  ): Promise<void> {
    let blockerId = entityId;

    if (!blockerId && storagePath) {
      const match = storagePath.match(/evidence\/Blocker\/([^/]+)/);
      if (match && match[1] && !match[1].includes('.')) {
        blockerId = match[1];
      }
    }

    if (blockerId) {
      const blocker = await this.prisma.blocker.findUnique({
        where: { id: blockerId },
        include: { supportContributions: true },
      });

      if (!blocker) {
        throw new NotFoundException('Blocker pemilik file tidak ditemukan');
      }

      if (user.role === Role.Employee) {
        const isReporter = blocker.raisedByUserId === user.userId;
        const isOwnerNeeded = blocker.ownerNeededUserId === user.userId;
        const isSupporter = blocker.supportContributions.some(
          (sc) => sc.supporterUserId === user.userId,
        );

        if (!isReporter && !isOwnerNeeded && !isSupporter) {
          throw new ForbiddenException(
            'Akses ditolak: Anda bukan pelapor, penanggung jawab, maupun kontributor blocker ini',
          );
        }
      } else if (
        user.role === Role.Supervisor_TL ||
        user.role === Role.Head
      ) {
        const accessibleUserIds =
          await this.scopeFilterService.getAccessibleUserIds(user);
        if (
          accessibleUserIds &&
          !accessibleUserIds.includes(blocker.raisedByUserId) &&
          !accessibleUserIds.includes(blocker.ownerNeededUserId)
        ) {
          throw new ForbiddenException(
            'Akses ditolak: blocker di luar scope organisasi Anda',
          );
        }
      }
    }
  }

  /**
   * Verifikasi otorisasi download export laporan (Employee dilarang).
   */
  private authorizeExportDownload(user: CurrentUserPayload): void {
    if (user.role === Role.Employee) {
      throw new ForbiddenException(
        'Role Employee tidak memiliki wewenang untuk mengunduh export laporan',
      );
    }
  }
}
