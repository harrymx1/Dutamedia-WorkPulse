import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FileStorageService } from '../services/file-storage.service.js';
import { GenerateUploadUrlDto } from '../dto/generate-upload-url.dto.js';
import { QueryDownloadUrlDto } from '../dto/query-download-url.dto.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';
import { ThrottleUpload } from '../../shared/decorators/throttle.decorator.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('FileStorage')
@Controller('files')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  /**
   * POST /api/v1/files/upload-url (SAD §10.12, §14.3, §14.5, EPIC-14-T1)
   * Mengembalikan pre-signed PUT URL (kedaluwarsa 5 menit) untuk upload langsung ke storage.
   * Dilindungi rate limit 10 req/menit (@ThrottleUpload).
   */
  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @ThrottleUpload()
  async generateUploadUrl(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateUploadUrlDto,
  ) {
    return this.fileStorageService.generateUploadUrl(user, dto);
  }

  /**
   * GET /api/v1/files/:fileId/download-url (SAD §10.12, §14.4, EPIC-14-T2)
   * Mengembalikan pre-signed GET URL (kedaluwarsa 15 menit) dengan otorisasi berbasis resource pemilik.
   */
  @Get(':fileId/download-url')
  @HttpCode(HttpStatus.OK)
  async generateDownloadUrl(
    @CurrentUser() user: CurrentUserPayload,
    @Param('fileId') fileId: string,
    @Query() query: QueryDownloadUrlDto,
  ) {
    return this.fileStorageService.generateDownloadUrl(user, fileId, query);
  }
}
