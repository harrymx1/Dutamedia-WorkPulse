import { Module } from '@nestjs/common';
import { FileStorageController } from './controllers/file-storage.controller.js';
import { FileStorageService } from './services/file-storage.service.js';
import { S3StorageService } from './services/s3-storage.service.js';

@Module({
  controllers: [FileStorageController],
  providers: [FileStorageService, S3StorageService],
  exports: [FileStorageService, S3StorageService],
})
export class FileStorageModule {}
