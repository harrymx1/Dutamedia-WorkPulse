import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BlockerService } from '../services/blocker.service.js';
import { CreateBlockerDto } from '../dto/create-blocker.dto.js';
import { UpdateBlockerProgressDto } from '../dto/update-blocker-progress.dto.js';
import { ResolveBlockerDto } from '../dto/resolve-blocker.dto.js';
import { CreateSupportContributionDto } from '../dto/create-support-contribution.dto.js';
import { QueryBlockersDto } from '../dto/query-blockers.dto.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';

@Controller('blockers')
export class BlockerController {
  constructor(private readonly blockerService: BlockerService) {}

  /**
   * POST /api/v1/blockers (SAD §10.4, EPIC-08-T1)
   * Terbuka untuk seluruh role terautentikasi.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlocker(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateBlockerDto,
  ) {
    return this.blockerService.createBlocker(userId, dto);
  }

  /**
   * GET /api/v1/blockers (SAD §10.4, EPIC-08-T2)
   * Sesuai Scope visibility.
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryBlockersDto,
  ) {
    return this.blockerService.findAll(user, query);
  }

  /**
   * GET /api/v1/blockers/:id (SAD §10.4, EPIC-08-T2)
   * Sesuai Scope visibility, merespons 404 jika di luar scope.
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.blockerService.findById(user, id);
  }

  /**
   * POST /api/v1/blockers/:id/acknowledge (SAD §10.4, EPIC-08-T3)
   * Aktor: ownerNeededUserId.
   */
  @Post(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  async acknowledge(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.blockerService.acknowledge(userId, id);
  }

  /**
   * POST /api/v1/blockers/:id/update (SAD §10.4, EPIC-08-T3)
   * Aktor: ownerNeededUserId.
   */
  @Post(':id/update')
  @HttpCode(HttpStatus.OK)
  async updateProgress(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateBlockerProgressDto,
  ) {
    return this.blockerService.updateProgress(userId, id, dto);
  }

  /**
   * POST /api/v1/blockers/:id/resolve (SAD §10.4, EPIC-08-T3)
   * Aktor: ownerNeededUserId.
   */
  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolve(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ResolveBlockerDto,
  ) {
    return this.blockerService.resolve(userId, id, dto);
  }

  /**
   * POST /api/v1/blockers/:id/accept-risk (SAD §10.4, EPIC-08-T3)
   * Aktor: ownerNeededUserId.
   */
  @Post(':id/accept-risk')
  @HttpCode(HttpStatus.OK)
  async acceptRisk(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ResolveBlockerDto,
  ) {
    return this.blockerService.acceptRisk(userId, id, dto);
  }

  /**
   * POST /api/v1/blockers/:id/close (SAD §9.4, §10.4, EPIC-08-T3)
   * Aktor: raisedByUserId (pelapor).
   */
  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.blockerService.close(userId, id);
  }

  /**
   * POST /api/v1/blockers/:id/support (SAD §10.4, EPIC-08-T4)
   * Terbuka untuk seluruh role terautentikasi.
   */
  @Post(':id/support')
  @HttpCode(HttpStatus.CREATED)
  async addSupportContribution(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CreateSupportContributionDto,
  ) {
    return this.blockerService.addSupportContribution(userId, id, dto);
  }
}
