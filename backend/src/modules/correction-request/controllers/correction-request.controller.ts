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
import { CorrectionRequestService } from '../services/correction-request.service.js';
import { CreateCorrectionRequestDto } from '../dto/create-correction-request.dto.js';
import { ObjectCorrectionRequestDto } from '../dto/object-correction-request.dto.js';
import { QueryCorrectionRequestsDto } from '../dto/query-correction-requests.dto.js';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../auth/decorators/current-user.decorator.js';

@Controller('correction-requests')
export class CorrectionRequestController {
  constructor(
    private readonly correctionRequestService: CorrectionRequestService,
  ) {}

  /**
   * POST /api/v1/correction-requests (SAD §10.5, §9.6, FR-43, EPIC-09-T1)
   * Diajukan oleh Employee untuk komitmen terkunci miliknya.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCorrectionRequestDto,
  ) {
    return this.correctionRequestService.createCorrectionRequest(user, dto);
  }

  /**
   * GET /api/v1/correction-requests (SAD §10.5, §8.11, EPIC-09-T2/T3)
   * Scope-filtered query list.
   */
  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryCorrectionRequestsDto,
  ) {
    return this.correctionRequestService.findAll(user, query);
  }

  /**
   * GET /api/v1/correction-requests/:id (SAD §7.12, §10.5)
   * Detail koreksi dengan availableActions ('object' jika Pending & user reviewer berwenang).
   */
  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.correctionRequestService.findById(user, id);
  }

  /**
   * POST /api/v1/correction-requests/:id/object (SAD §9.6, §9.9 #1, §10.5, EPIC-09-T4)
   * Keberatan oleh Authorized Reviewer sebelum Objection Window berakhir.
   */
  @Post(':id/object')
  @HttpCode(HttpStatus.OK)
  async objectCorrection(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ObjectCorrectionRequestDto,
  ) {
    return this.correctionRequestService.objectCorrection(user, id, dto);
  }
}
