import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import { ComplianceEventStage } from '@prisma/client';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil antrean peristiwa kepatuhan untuk pengawasan HRGA (Prototipe 11).
   */
  async getComplianceQueue(filters?: {
    stage?: ComplianceEventStage;
    status?: string;
  }) {
    return this.prisma.complianceEvent.findMany({
      where: {
        ...(filters?.stage && { stage: filters.stage }),
        ...(filters?.status && { followUpStatus: filters.status }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        dailyRecord: true,
        followUpManagerNote: {
          include: { authorUser: { select: { id: true, fullName: true } } },
        },
      },
      orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Menindaklanjuti peristiwa kepatuhan dengan menautkan catatan pembinaan manajerial.
   */
  async addressComplianceEvent(
    eventId: string,
    followUpManagerNoteId: string,
  ) {
    const event = await this.prisma.complianceEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Peristiwa kepatuhan tidak ditemukan.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.prisma.complianceEvent.update({
      where: { id: eventId },
      data: {
        followUpStatus: 'ADDRESSED',
        followUpManagerNoteId,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        followUpManagerNote: true,
      },
    });
  }

  /**
   * Ringkasan metrik kepatuhan HRGA (Prototipe 11).
   */
  async getComplianceSummary() {
    const allEvents = await this.prisma.complianceEvent.findMany();
    const patternCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.PATTERN_FLAG_3X,
    ).length;
    const warningCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.RECORDED_WARNING,
    ).length;
    const escalationCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.FORMAL_HR_ESCALATION,
    ).length;
    const noSubmissionCount = allEvents.filter(
      (e) => e.stage === ComplianceEventStage.NO_SUBMISSION,
    ).length;
    const openCount = allEvents.filter((e) => e.followUpStatus === 'OPEN').length;

    return {
      totalEvents: allEvents.length,
      openCount,
      patternCount,
      warningCount,
      escalationCount,
      noSubmissionCount,
    };
  }
}
