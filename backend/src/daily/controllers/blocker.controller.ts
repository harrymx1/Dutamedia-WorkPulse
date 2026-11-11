import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlockerService } from '../services/blocker.service';
import { RaiseBlockerDto, ResolveBlockerDto } from '../dto/raise-blocker.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AuthorityContext, BlockerStatus } from '@prisma/client';

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
  ) {
    const [slaMinutes, suggestion] = await Promise.all([
      this.blockerService.getSlaMinutesMap(),
      this.blockerService.resolveSuggestedOwner(req.user.id, { type, ownerNeededType, projectCode }),
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
  async getEscalationAgingMetrics() {
    return this.blockerService.getEscalationAgingMetrics();
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

    return this.blockerService.getBlockerQueue(filters);
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
}
