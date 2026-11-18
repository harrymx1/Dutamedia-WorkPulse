import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlockerService } from '../services/blocker.service';
import {
  AcceptRiskBlockerDto,
  DeleteBlockerDto,
  RaiseBlockerDto,
  ReopenBlockerDto,
  ResolveBlockerDto,
  RespondSupportContributionDto,
  UpdateBlockerDto,
} from '../dto/raise-blocker.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AuthorityContext, BlockerStatus, CanonicalFunction } from '@prisma/client';

@Controller(['blockers', 'api/blockers'])
@UseGuards(AuthGuard, CsrfGuard)
export class BlockerController {
  constructor(private readonly blockerService: BlockerService) {}

  @Post()
  async raiseBlocker(@Req() req: any, @Body() dto: RaiseBlockerDto) {
    return this.blockerService.raiseBlocker(req.user.id, dto);
  }

  @Get('routing-preview')
  async getRoutingPreview(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('ownerNeededType') ownerNeededType?: AuthorityContext,
    @Query('projectCode') projectCode?: string,
    @Query('waitingForFunction') waitingForFunction?: CanonicalFunction,
  ) {
    const [slaMinutes, suggestion] = await Promise.all([
      this.blockerService.getSlaMinutesMap(),
      this.blockerService.resolveSuggestedOwner(req.user.id, {
        type,
        ownerNeededType,
        projectCode,
        waitingForFunction,
      }),
    ]);
    return {
      slaMinutes,
      suggestedOwner: suggestion.owner,
      reason: suggestion.reason,
      divisionLabel: suggestion.divisionLabel,
      routingNote: suggestion.routingNote,
    };
  }

  @Get('aging')
  async getEscalationAgingMetrics(@Req() req: any) {
    return this.blockerService.getEscalationAgingMetrics(req.user?.id);
  }

  @Get()
  async getBlockerQueue(
    @Req() req: any,
    @Query('status') status?: BlockerStatus,
    @Query('mine') mine?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (mine === 'assigned') filters.assignedOwnerId = req.user.id;
    if (mine === 'raised') filters.raisedByUserId = req.user.id;

    return this.blockerService.getBlockerQueue(filters, req.user?.id);
  }

  @Post(':id/acknowledge')
  async acknowledgeBlocker(@Req() req: any, @Param('id') id: string) {
    return this.blockerService.acknowledgeBlocker(req.user.id, id);
  }

  @Post(':id/resolve')
  async resolveBlocker(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ResolveBlockerDto,
  ) {
    return this.blockerService.resolveBlocker(req.user.id, id, dto);
  }

  @Post(':id/accept-risk')
  async acceptRiskBlocker(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AcceptRiskBlockerDto,
  ) {
    return this.blockerService.acceptRiskBlocker(req.user.id, id, dto);
  }

  @Post(':id/close')
  async closeBlocker(@Req() req: any, @Param('id') id: string) {
    return this.blockerService.closeBlocker(req.user.id, id);
  }

  @Post(':id/reopen')
  async reopenBlocker(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReopenBlockerDto,
  ) {
    return this.blockerService.reopenBlocker(req.user.id, id, dto);
  }

  @Post(':id/support')
  async addSupportContribution(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { actionTaken: string; resultNote: string },
  ) {
    return this.blockerService.addSupportContribution(
      req.user.id,
      id,
      body.actionTaken,
      body.resultNote,
    );
  }

  @Post(':id/support/:supportId/respond')
  async respondToSupportContribution(
    @Req() req: any,
    @Param('id') id: string,
    @Param('supportId') supportId: string,
    @Body() dto: RespondSupportContributionDto,
  ) {
    return this.blockerService.respondToSupportContribution(
      req.user.id,
      id,
      supportId,
      dto,
    );
  }

  @Post(':id/update')
  async updateBlockerViaPost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBlockerDto,
  ) {
    return this.blockerService.updateBlocker(req.user.id, id, dto);
  }

  @Patch(':id')
  async updateBlocker(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBlockerDto,
  ) {
    return this.blockerService.updateBlocker(req.user.id, id, dto);
  }

  @Post(':id/delete')
  async deleteBlockerViaPost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: DeleteBlockerDto,
  ) {
    return this.blockerService.deleteBlocker(req.user.id, id, dto);
  }

  @Delete(':id')
  async deleteBlocker(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: DeleteBlockerDto,
  ) {
    return this.blockerService.deleteBlocker(req.user.id, id, dto);
  }
}
