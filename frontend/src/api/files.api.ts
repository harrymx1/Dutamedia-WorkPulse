import { apiClient } from './client.js';
import type { ApiResponse } from '../types/api.js';

export type FilePurpose = 'evidence' | 'manager-note-evidence' | 'exports';
export type AllowedMimeType = 'image/png' | 'image/jpeg' | 'application/pdf';

export interface RequestUploadUrlPayload {
  purpose: FilePurpose;
  contentType: AllowedMimeType;
  fileSize: number;
  entityType?: string;
  entityId?: string;
  originalFileName?: string;
}

export interface UploadUrlResponse {
  fileId: string;
  uploadUrl: string;
  storagePath: string;
  expiresIn: number;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}

export const filesApi = {
  /**
   * Langkah 1 & 2: Meminta pre-signed PUT URL dari Backend (SAD §17.6 langkah 1 & 2)
   */
  async requestUploadUrl(
    payload: RequestUploadUrlPayload,
  ): Promise<ApiResponse<UploadUrlResponse>> {
    return apiClient.post<UploadUrlResponse>('files/upload-url', payload);
  },

  /**
   * Langkah 3: Melakukan HTTP PUT langsung ke Object Storage (SAD §17.6 langkah 3)
   * Request ini independen, tidak membawa cookie auth WorkPulse (credentials: omit).
   */
  async uploadDirectToStorage(
    uploadUrl: string,
    file: File | Blob,
    contentType: string,
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
      credentials: 'omit', // SAD §17.6 langkah 3: koneksi terpisah tanpa cookie
    });

    if (!response.ok) {
      throw new Error(
        `Gagal mengunggah file ke penyimpanan storage (HTTP ${response.status}: ${response.statusText})`,
      );
    }
  },

  /**
   * Mengambil pre-signed download URL untuk fileId tertentu (SAD §14.4)
   */
  async getDownloadUrl(
    fileId: string,
    query?: { category?: string; resourceId?: string },
  ): Promise<ApiResponse<DownloadUrlResponse>> {
    const searchParams = new URLSearchParams();
    if (query?.category) searchParams.set('category', query.category);
    if (query?.resourceId) searchParams.set('resourceId', query.resourceId);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<DownloadUrlResponse>(`files/${fileId}/download-url${qs}`);
  },

  /**
   * Helper eksekusi upload round-trip lengkap (SAD §17.6 Langkah 1 s/d 3)
   */
  async executeUploadFlow(
    file: File,
    purpose: FilePurpose = 'evidence',
    meta?: { entityType?: string; entityId?: string },
  ): Promise<{ fileId: string; storagePath: string }> {
    // 1. Minta signed URL dari Backend
    const urlRes = await filesApi.requestUploadUrl({
      purpose,
      contentType: file.type as AllowedMimeType,
      fileSize: file.size,
      entityType: meta?.entityType,
      entityId: meta?.entityId,
      originalFileName: file.name,
    });

    const { fileId, uploadUrl, storagePath } = urlRes.data;

    // 2. Upload langsung ke Object Storage via signed PUT URL
    await filesApi.uploadDirectToStorage(uploadUrl, file, file.type);

    // 3. Kembalikan fileId untuk disertakan pada pembuatan resource
    return { fileId, storagePath };
  },
};
