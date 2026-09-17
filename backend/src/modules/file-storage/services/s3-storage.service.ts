import { Injectable, Logger } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket =
      process.env.STORAGE_BUCKET ||
      process.env.S3_BUCKET ||
      'workpulse-storage';

    const endpoint =
      process.env.STORAGE_ENDPOINT || process.env.S3_ENDPOINT || undefined;
    const region =
      process.env.STORAGE_REGION || process.env.S3_REGION || 'us-east-1';
    const accessKeyId =
      process.env.STORAGE_ACCESS_KEY ||
      process.env.S3_ACCESS_KEY_ID ||
      process.env.AWS_ACCESS_KEY_ID ||
      'mock-access-key';
    const secretAccessKey =
      process.env.STORAGE_SECRET_KEY ||
      process.env.S3_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      'mock-secret-key';
    const forcePathStyle =
      process.env.STORAGE_FORCE_PATH_STYLE !== 'false';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });

    this.logger.log(
      `S3StorageService initialized. Bucket: ${this.bucket}, Region: ${region}, Endpoint: ${endpoint || 'AWS Default'}`,
    );
  }

  getBucket(): string {
    return this.bucket;
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 300,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async createPresignedGetUrl(
    key: string,
    expiresInSeconds = 900,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
