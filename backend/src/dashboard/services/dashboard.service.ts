import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import {
  BlockerSeverity,
  BlockerStatus,
  CommitmentOutcome,
  CommitmentRisk,
  UserStatus,
} from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil metrik harian Pulse Dashboard (Prototipe 08).
   */
  async getPulseMetrics() {
    const today = this.clockService.currentDate();

    // Total karyawan aktif
    const totalEmployees = await this.prisma.user.count({
      where: { status: UserStatus.ACTIVE },
    });

    // Record akuntabilitas hari ini
    const todayRecords = await this.prisma.dailyAccountabilityRecord.findMany({
      where: { workDate: today },
      include: {
        commitments: true,
        user: { select: { id: true, fullName: true } },
      },
    });

    const checkedInCount = todayRecords.filter(
      (r: any) => r.isMorningSubmitted || Boolean(r.morningSubmittedAt),
    ).length;
    const eodSubmittedCount = todayRecords.filter(
      (r: any) => r.isEodSubmitted || Boolean(r.eodSubmittedAt),
    ).length;

    // Breakdown Komitmen
    const allCommitments = todayRecords.flatMap((r) => r.commitments);
    const greenCount = allCommitments.filter((c) => c.initialRisk === CommitmentRisk.GREEN).length;
    const amberCount = allCommitments.filter((c) => c.initialRisk === CommitmentRisk.AMBER).length;
    const redCount = allCommitments.filter((c) => c.initialRisk === CommitmentRisk.RED).length;

    // Breakdown Outcome EOD
    const completedCount = allCommitments.filter((c) => c.outcome === CommitmentOutcome.COMPLETED).length;
    const partialCount = allCommitments.filter((c) => c.outcome === CommitmentOutcome.PARTIALLY_COMPLETED).length;
    const notCompletedCount = allCommitments.filter((c) => c.outcome === CommitmentOutcome.NOT_COMPLETED).length;
    const cancelledCount = allCommitments.filter((c) => c.outcome === CommitmentOutcome.CANCELLED).length;

    // Blocker Aktif
    const openBlockers = await this.prisma.blockerTicket.findMany({
      where: { status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] } },
    });
    const criticalBlockersCount = openBlockers.filter((b) => b.severity === BlockerSeverity.CRITICAL).length;

    return {
      date: today.toISOString().slice(0, 10),
      totalEmployees,
      checkedInCount,
      eodSubmittedCount,
      participationRate: totalEmployees > 0 ? Math.round((checkedInCount / totalEmployees) * 100) : 0,
      commitments: {
        total: allCommitments.length,
        greenCount,
        amberCount,
        redCount,
      },
      outcomes: {
        completedCount,
        partialCount,
        notCompletedCount,
        cancelledCount,
      },
      blockers: {
        totalOpen: openBlockers.length,
        criticalCount: criticalBlockersCount,
      },
    };
  }

  /**
   * Mengambil pemantauan risiko portofolio proyek (Prototipe 13).
   */
  async getProjectRiskOverview() {
    const projects = [
      { code: 'PRJ-PORTAL', name: 'Website Customer Portal & Client Billing' },
      { code: 'PRJ-CORE', name: 'Enterprise Core Engine & Identity Sync' },
      { code: 'PRJ-MOBILE', name: 'WorkPulse Mobile Apps — iOS & Android' },
    ];

    const allOpenBlockers = await this.prisma.blockerTicket.findMany({
      where: {
        status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] },
      },
    });

    return projects.map((prj) => {
      const prjBlockers = allOpenBlockers.filter((b) => b.projectCodeReference === prj.code);
      const criticalCount = prjBlockers.filter((b) => b.severity === BlockerSeverity.CRITICAL).length;
      const highCount = prjBlockers.filter((b) => b.severity === BlockerSeverity.HIGH).length;

      let riskLevel = 'LOW';
      if (criticalCount > 0) riskLevel = 'CRITICAL';
      else if (highCount > 0 || prjBlockers.length >= 3) riskLevel = 'HIGH';
      else if (prjBlockers.length > 0) riskLevel = 'MEDIUM';

      return {
        projectCode: prj.code,
        projectName: prj.name,
        totalBlockers: prjBlockers.length,
        criticalCount,
        highCount,
        riskLevel,
      };
    });
  }
}
