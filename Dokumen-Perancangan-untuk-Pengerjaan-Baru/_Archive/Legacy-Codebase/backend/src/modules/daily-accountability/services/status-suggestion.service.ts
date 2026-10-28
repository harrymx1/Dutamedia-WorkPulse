import { Injectable } from '@nestjs/common';
import {
  BlockerSeverity,
  BlockerStatus,
  CommitmentOutcome,
  DailyStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface StatusSuggestionResult {
  suggestedStatus: DailyStatus;
  reasons: string[];
}

export interface OutcomeEvalItem {
  outcome?: CommitmentOutcome | null;
}

@Injectable()
export class StatusSuggestionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Status Suggestion Engine (SAD §9.3, PRD §3.3 FR-13/FR-14).
   * Menganalisis outcome komitmen, pekerjaan tambahan, dan blocker aktif
   * untuk menyarankan finalStatus yang konsisten secara objektif.
   */
  async evaluateSuggestedStatus(
    userId: string,
    items: OutcomeEvalItem[],
    asOfDate: Date = new Date(),
  ): Promise<StatusSuggestionResult> {
    const reasons: string[] = [];
    let severityRank = 0; // 0 = GREEN, 1 = AMBER, 2 = RED

    // 1. Evaluasi Blocker Aktif (FR-14)
    // Cek apakah ada blocker terbuka (Open, Acknowledged, InProgress) yang di-raise oleh user
    const startOfDay = new Date(asOfDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(asOfDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activeBlockers = await this.prisma.blocker.findMany({
      where: {
        raisedByUserId: userId,
        status: {
          in: [
            BlockerStatus.Open,
            BlockerStatus.Acknowledged,
            BlockerStatus.InProgress,
          ],
        },
      },
      select: {
        id: true,
        severity: true,
        type: true,
        impact: true,
      },
    });

    const hasCriticalBlocker = activeBlockers.some(
      (b) => b.severity === BlockerSeverity.Critical,
    );
    const hasHighBlocker = activeBlockers.some(
      (b) => b.severity === BlockerSeverity.High,
    );

    if (hasCriticalBlocker) {
      severityRank = Math.max(severityRank, 2);
      reasons.push(
        'Terdapat blocker dengan tingkat keparahan Critical yang masih aktif.',
      );
    } else if (hasHighBlocker) {
      severityRank = Math.max(severityRank, 1);
      reasons.push(
        'Terdapat blocker dengan tingkat keparahan High yang masih aktif.',
      );
    }

    // 2. Evaluasi Outcomes (Commitment & AdditionalWork)
    if (items.length > 0) {
      const notCompletedCount = items.filter(
        (i) =>
          i.outcome === CommitmentOutcome.NotCompleted ||
          i.outcome === CommitmentOutcome.Cancelled,
      ).length;
      const partiallyCompletedCount = items.filter(
        (i) => i.outcome === CommitmentOutcome.PartiallyCompleted,
      ).length;
      const completedCount = items.filter(
        (i) => i.outcome === CommitmentOutcome.Completed,
      ).length;

      if (notCompletedCount > 0) {
        // Jika mayoritas tidak selesai atau ada yang dibatalkan
        if (notCompletedCount >= items.length / 2) {
          severityRank = Math.max(severityRank, 2);
          reasons.push(
            `${notCompletedCount} dari ${items.length} pekerjaan berstatus NotCompleted atau Cancelled.`,
          );
        } else {
          severityRank = Math.max(severityRank, 1);
          reasons.push(
            `Sebagian pekerjaan berstatus NotCompleted atau Cancelled.`,
          );
        }
      }

      if (partiallyCompletedCount > 0 && severityRank < 2) {
        severityRank = Math.max(severityRank, 1);
        reasons.push(
          `${partiallyCompletedCount} pekerjaan berstatus PartiallyCompleted.`,
        );
      }

      if (completedCount === items.length && activeBlockers.length === 0) {
        reasons.push('Seluruh komitmen dan pekerjaan selesai (Completed).');
      }
    }

    let suggestedStatus: DailyStatus = DailyStatus.GREEN;
    if (severityRank === 2) {
      suggestedStatus = DailyStatus.RED;
    } else if (severityRank === 1) {
      suggestedStatus = DailyStatus.AMBER;
    } else {
      suggestedStatus = DailyStatus.GREEN;
    }

    return {
      suggestedStatus,
      reasons:
        reasons.length > 0
          ? reasons
          : ['Berdasarkan evaluasi seluruh parameter capaian hari ini.'],
    };
  }
}
