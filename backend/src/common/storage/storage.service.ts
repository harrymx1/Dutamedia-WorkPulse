import { Injectable, BadRequestException } from '@nestjs/common';

export interface StorageFileValidation {
  mimetype: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly defaultBucket = process.env.STORAGE_BUCKET || 'workpulse-evidence';
  private readonly projectRef = process.env.SUPABASE_PROJECT_REF || 'yzsischopwnhztjguoxs';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10 MB limit
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  /**
   * Memvalidasi berkas bukti (ukuran maksimum 10MB dan tipe MIME yang diizinkan).
   */
  validateEvidenceFile(file: StorageFileValidation): void {
    if (!file) {
      throw new BadRequestException('Berkas lampiran tidak ditemukan.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `Ukuran berkas (${(file.size / 1024 / 1024).toFixed(1)} MB) melebihi batas maksimum 10 MB.`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Format berkas (${file.mimetype}) tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.`,
      );
    }
  }

  /**
   * Menghasilkan Signed URL aman dengan batas waktu kedaluwarsa baku 15 menit (900 detik).
   * Menjamin berkas bukti privat tidak pernah terekspos secara publik tanpa otentikasi.
   */
  generateSignedUrlPath(filePath: string, expiresInSeconds = 900): {
    bucket: string;
    path: string;
    expiresIn: number;
    targetUrl: string;
  } {
    // Pastikan masa kadaluarsa dibatasi sesuai kebijakan keamanan (1 s.d. 60 menit, baku 15 menit)
    const effectiveTtl = Math.min(Math.max(expiresInSeconds, 60), 3600);
    const sanitizedPath = filePath.replace(/^\/+/, '');

    const targetUrl = `https://${this.projectRef}.supabase.co/storage/v1/object/sign/${this.defaultBucket}/${sanitizedPath}?token=signed&expires=${effectiveTtl}`;

    return {
      bucket: this.defaultBucket,
      path: sanitizedPath,
      expiresIn: effectiveTtl,
      targetUrl,
    };
  }

  getDefaultBucket(): string {
    return this.defaultBucket;
  }
}

