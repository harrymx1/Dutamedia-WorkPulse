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
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ManagerNoteService } from '../services/manager-note.service.js';
import { CreateManagerNoteDto } from '../dto/create-manager-note.dto.js';
import { QueryManagerNotesDto } from '../dto/query-manager-notes.dto.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';
import { RequireRole } from '../../authorization/decorators/require-role.decorator.js';
import { RoleGuard } from '../../authorization/guards/role.guard.js';

@Controller('manager-notes')
export class ManagerNoteController {
  constructor(private readonly managerNoteService: ManagerNoteService) {}

  /**
   * POST /api/v1/manager-notes (SAD §10.7, §15.1, BR-14, FR-39, EPIC-11-T1)
   * Hanya diizinkan untuk Supervisor_TL, Head, dan HRGA.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireRole(Role.Supervisor_TL, Role.Head, Role.HRGA)
  @UseGuards(RoleGuard)
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateManagerNoteDto,
  ) {
    return this.managerNoteService.createManagerNote(user, dto);
  }

  /**
   * GET /api/v1/manager-notes (SAD §8.11, §10.7, BR-14, EPIC-11-T2)
   * Scope & visibility-filtered list.
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryManagerNotesDto,
  ) {
    return this.managerNoteService.findAll(user, query);
  }

  /**
   * GET /api/v1/manager-notes/:id (SAD §7.7, §10.7, BR-14, EPIC-11-T2)
   * Detail catatan manajerial, merespons 404 jika di luar visibilitas / scope.
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.managerNoteService.findById(user, id);
  }
}
