import { Injectable, Logger } from '@nestjs/common';
import {
  BlockerSeverity,
  BlockerStatus,
  CommitmentOutcome,
  ComplianceEventType,
  DailyStatus,
  ExceptionStatus,
  ManagerNoteVisibility,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ScopeFilterService } from '../../authorization/services/scope-filter.service.js';
import { ExportGeneratorService, type ExportPayload } from './export-generator.service.js';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator.js';
import {
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from '../../shared/exceptions/api.exception.js';
import type { DailyExceptionQueryDto } from '../dto/daily-exception-query.dto.js';
import type { WeeklyTeamSummaryQueryDto } from '../dto/weekly-team-summary-query.dto.js';
import type { MonthlyTrendQueryDto } from '../dto/monthly-trend-query.dto.js';
import type { IndividualEvidenceQueryDto } from '../dto/individual-evidence-query.dto.js';
import type { BlockerRootCauseQueryDto } from '../dto/blocker-root-cause-query.dto.js';
import type { ExportReportQueryDto } from '../dto/export-report-query.dto.js';

export interface ExceptionSummaryResult {
  date: string;
  metrics: {
    totalExpectedEmployees: number;
    submittedCount: number;
    noSubmissionCount: number;
    redCount: number;
    amberCount: number;
    greenCount: number;
    criticalBlockerCount: number;
    overdueAcknowledgementCount: number;
  };
  exceptions: Array<{
    type: 'NO_SUBMISSION' | 'RISK_RED' | 'RISK_AMBER' | 'CRITICAL_BLOCKER' | 'OVERDUE_ACKNOWLEDGEMENT';
    userId?: string;
    userName?: string;
    userFunction?: string;
    recordId?: string;
    blockerId?: string;
    title: string;
    details: string;
    severity?: string;
    status?: string;
  }>;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeFilterService: ScopeFilterService,
    private readonly exportGeneratorService: ExportGeneratorService,
  ) {}

  /**
   * Helper konversi string YYYY-MM-DD ke Date (UTC midnight).
   */
  private parseDateString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  /**
   * Helper format Date ke YYYY-MM-DD.
   */
  private formatDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  // ===========================================================================
  // EPIC-16-T1: Service getExceptionSummary(scope, date) (SAD §13.2)
  // Dipakai bersama oleh dashboard widget & Daily Exception Report
  // ===========================================================================

  async getExceptionSummary(
    user: CurrentUserPayload,
    dateStr?: string,
  ): Promise<ExceptionSummaryResult> {
    const targetDateStr = dateStr || this.formatDateString(new Date());
    const targetDate = this.parseDateString(targetDateStr);

    // 1. Dapatkan daftar userId yang boleh diakses sesuai scope peran (SAD §8.11, §13.3)
    const accessibleUserIds = await this.scopeFilterService.getAccessibleUserIds(
      user,
      targetDate,
    );

    // 2. Ambil seluruh penugasan organisasi aktif pada tanggal terkait (kecuali SystemAdmin)
    const activeAssignments =
      await this.prisma.organizationalAssignment.findMany({
        where: {
          role: { not: Role.SystemAdmin },
          effectiveDate: { lte: targetDate },
          OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
          ...(accessibleUserIds ? { userId: { in: accessibleUserIds } } : {}),
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

    // Dedup user ID aktif dalam scope
    const userMap = new Map<string, { id: string; fullName: string; functionName: string }>();
    for (const a of activeAssignments) {
      if (!userMap.has(a.userId)) {
        userMap.set(a.userId, {
          id: a.userId,
          fullName: a.user.fullName,
          functionName: a.function,
        });
      }
    }
    const totalExpectedEmployees = userMap.size;

    // 3. Ambil seluruh DailyAccountabilityRecord pada workDate ini dalam scope
    const records = await this.prisma.dailyAccountabilityRecord.findMany({
      where: {
        workDate: targetDate,
        ...(accessibleUserIds
          ? { employeeUserId: { in: accessibleUserIds } }
          : {}),
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        commitments: true,
      },
    });

    const submittedUserIds = new Set<string>();
    let redCount = 0;
    let amberCount = 0;
    let greenCount = 0;

    const exceptions: ExceptionSummaryResult['exceptions'] = [];

    for (const rec of records) {
      submittedUserIds.add(rec.employeeUserId);

      // Hitung risk berdasarkan status atau commitments (DailyStatus: GREEN, AMBER, RED)
      const isRed =
        rec.initialStatus === DailyStatus.RED ||
        rec.commitments.some((c) => c.initialRisk === DailyStatus.RED);
      const isAmber =
        !isRed &&
        (rec.initialStatus === DailyStatus.AMBER ||
          rec.commitments.some((c) => c.initialRisk === DailyStatus.AMBER));
      const isGreen = !isRed && !isAmber;

      if (isRed) {
        redCount++;
        exceptions.push({
          type: 'RISK_RED',
          userId: rec.employeeUserId,
          userName: rec.employee.fullName,
          userFunction: userMap.get(rec.employeeUserId)?.functionName || '-',
          recordId: rec.id,
          title: `Komitmen RED: ${rec.employee.fullName}`,
          details: rec.commitments
            .filter((c) => c.initialRisk === DailyStatus.RED)
            .map((c) => c.text)
            .join('; ') || 'Morning commitment berisiko tinggi (RED)',
          severity: 'High',
        });
      } else if (isAmber) {
        amberCount++;
        exceptions.push({
          type: 'RISK_AMBER',
          userId: rec.employeeUserId,
          userName: rec.employee.fullName,
          userFunction: userMap.get(rec.employeeUserId)?.functionName || '-',
          recordId: rec.id,
          title: `Komitmen AMBER: ${rec.employee.fullName}`,
          details: rec.commitments
            .filter((c) => c.initialRisk === DailyStatus.AMBER)
            .map((c) => c.text)
            .join('; ') || 'Morning commitment perlu perhatian (AMBER)',
          severity: 'Medium',
        });
      } else if (isGreen) {
        greenCount++;
      }
    }

    // 4. Ambil pengecualian resmi yang disetujui (Cuti/Libur/ExemptWorkday)
    const approvedExceptions = await this.prisma.exception.findMany({
      where: {
        status: ExceptionStatus.Approved,
        dateStart: { lte: targetDate },
        dateEnd: { gte: targetDate },
        ...(accessibleUserIds
          ? { employeeUserId: { in: accessibleUserIds } }
          : {}),
      },
      select: { employeeUserId: true },
    });
    const exemptUserIds = new Set(approvedExceptions.map((e) => e.employeeUserId));

    // 5. Hitung No Submission (Expected - Submitted - Exempt)
    let noSubmissionCount = 0;
    for (const [uid, uInfo] of userMap.entries()) {
      if (!submittedUserIds.has(uid) && !exemptUserIds.has(uid)) {
        noSubmissionCount++;
        exceptions.push({
          type: 'NO_SUBMISSION',
          userId: uid,
          userName: uInfo.fullName,
          userFunction: uInfo.functionName,
          title: `No Submission: ${uInfo.fullName}`,
          details: 'Belum melakukan check-in dan tidak memiliki cuti/libur yang disetujui',
          severity: 'High',
        });
      }
    }

    // 6. Blocker Exceptions (Critical Blocker & Overdue Acknowledged)
    const blockers = await this.prisma.blocker.findMany({
      where: {
        status: { not: BlockerStatus.Closed },
        ...(accessibleUserIds
          ? {
              OR: [
                { raisedByUserId: { in: accessibleUserIds } },
                { ownerNeededUserId: { in: accessibleUserIds } },
              ],
            }
          : {}),
      },
      include: {
        raisedBy: { select: { id: true, fullName: true } },
        ownerNeeded: { select: { id: true, fullName: true } },
      },
    });

    let criticalBlockerCount = 0;
    let overdueAcknowledgementCount = 0;
    const now = new Date();

    for (const b of blockers) {
      if (b.severity === BlockerSeverity.Critical) {
        criticalBlockerCount++;
        exceptions.push({
          type: 'CRITICAL_BLOCKER',
          blockerId: b.id,
          userId: b.raisedByUserId,
          userName: b.raisedBy.fullName,
          title: `Critical Blocker: ${b.type}`,
          details: b.impact,
          severity: 'Critical',
          status: b.status,
        });
      }

      // Overdue acknowledgement (Open > 4 jam belum di-acknowledge)
      if (b.status === BlockerStatus.Open && !b.acknowledgedAt) {
        const hoursPending = (now.getTime() - new Date(b.raisedAt).getTime()) / (1000 * 60 * 60);
        if (hoursPending >= 4) {
          overdueAcknowledgementCount++;
          exceptions.push({
            type: 'OVERDUE_ACKNOWLEDGEMENT',
            blockerId: b.id,
            userId: b.ownerNeededUserId,
            userName: b.ownerNeeded.fullName,
            title: `Overdue Acknowledgement (${Math.floor(hoursPending)} jam): ${b.type}`,
            details: `Blocker dari ${b.raisedBy.fullName} menunggu konfirmasi penanggung jawab`,
            severity: 'Medium',
            status: b.status,
          });
        }
      }
    }

    return {
      date: targetDateStr,
      metrics: {
        totalExpectedEmployees,
        submittedCount: records.length,
        noSubmissionCount,
        redCount,
        amberCount,
        greenCount,
        criticalBlockerCount,
        overdueAcknowledgementCount,
      },
      exceptions,
    };
  }

  // ===========================================================================
  // EPIC-16-T2: 5 Endpoint Report (SAD §13.1, §10.11)
  // ===========================================================================

  /**
   * 1. Daily Exception Report (SAD §10.11, PRD §9)
   */
  async getDailyExceptionReport(
    user: CurrentUserPayload,
    query: DailyExceptionQueryDto,
  ) {
    return this.getExceptionSummary(user, query.date);
  }

  /**
   * 2. Weekly Team Summary (SAD §10.11, FR-41, PRD §9)
   * Mengagregasikan distribusi outcome, blocker berulang, dan continue berulang.
   * Tunduk pada konstraint PRD §9: tidak ada ranking/leaderboard individual.
   */
  async getWeeklyTeamSummary(
    user: CurrentUserPayload,
    query: WeeklyTeamSummaryQueryDto,
  ) {
    const weekStartDate = this.parseDateString(query.weekStart);
    const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

    const accessibleUserIds = await this.scopeFilterService.getAccessibleUserIds(
      user,
      weekStartDate,
    );

    // Ambil semua daily record dalam rentang minggu ini (SAD §13.4 index)
    const records = await this.prisma.dailyAccountabilityRecord.findMany({
      where: {
        workDate: { gte: weekStartDate, lte: weekEndDate },
        ...(accessibleUserIds
          ? { employeeUserId: { in: accessibleUserIds } }
          : {}),
      },
      include: {
        commitments: true,
        additionalWorks: true,
      },
    });

    // Outcome Distribution
    const outcomeDistribution: Record<CommitmentOutcome, number> = {
      [CommitmentOutcome.Completed]: 0,
      [CommitmentOutcome.PartiallyCompleted]: 0,
      [CommitmentOutcome.NotCompleted]: 0,
      [CommitmentOutcome.Cancelled]: 0,
    };

    // Continuation Distribution
    const continuationDistribution: Record<string, number> = {
      None: 0,
      Continue: 0,
      DoNotContinue: 0,
    };

    let totalCommitments = 0;
    let recurringContinuationsCount = 0;

    for (const rec of records) {
      for (const com of rec.commitments) {
        totalCommitments++;
        if (com.outcome) {
          outcomeDistribution[com.outcome] =
            (outcomeDistribution[com.outcome] || 0) + 1;
        }
        if (com.continuation) {
          continuationDistribution[com.continuation] =
            (continuationDistribution[com.continuation] || 0) + 1;
          if (com.continuation === 'Continue') {
            recurringContinuationsCount++;
          }
        }
      }
      for (const add of rec.additionalWorks) {
        if (add.outcome) {
          outcomeDistribution[add.outcome] =
            (outcomeDistribution[add.outcome] || 0) + 1;
        }
        if (add.continuation) {
          continuationDistribution[add.continuation] =
            (continuationDistribution[add.continuation] || 0) + 1;
        }
      }
    }

    // Blocker summary dalam periode minggu ini
    const blockers = await this.prisma.blocker.findMany({
      where: {
        raisedAt: { gte: weekStartDate, lte: new Date(weekEndDate.getTime() + 24 * 60 * 60 * 1000) },
        ...(accessibleUserIds
          ? {
              OR: [
                { raisedByUserId: { in: accessibleUserIds } },
                { ownerNeededUserId: { in: accessibleUserIds } },
              ],
            }
          : {}),
      },
      include: {
        supportContributions: true,
      },
    });

    // Blocker recurring category aggregation
    const blockerCategoryCounts: Record<string, number> = {};
    let resolvedBlockersCount = 0;
    let totalSupportContributions = 0;

    for (const b of blockers) {
      blockerCategoryCounts[b.type] = (blockerCategoryCounts[b.type] || 0) + 1;
      if (b.status === BlockerStatus.Resolved || b.status === BlockerStatus.Closed) {
        resolvedBlockersCount++;
      }
      totalSupportContributions += b.supportContributions.length;
    }

    const recurringBlockers = Object.entries(blockerCategoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Exception events dalam minggu ini
    const complianceEvents = await this.prisma.complianceEvent.findMany({
      where: {
        eventDate: { gte: weekStartDate, lte: weekEndDate },
        ...(accessibleUserIds ? { userId: { in: accessibleUserIds } } : {}),
      },
    });

    const noSubmissionEventsCount = complianceEvents.filter(
      (e) => e.eventType === ComplianceEventType.NoSubmission,
    ).length;

    return {
      period: {
        weekStart: query.weekStart,
        weekEnd: this.formatDateString(weekEndDate),
      },
      summary: {
        totalRecords: records.length,
        totalCommitments,
        totalBlockers: blockers.length,
        resolvedBlockers: resolvedBlockersCount,
        totalSupportContributions,
        noSubmissionCount: noSubmissionEventsCount,
        recurringContinuationsCount,
      },
      outcomeDistribution,
      continuationDistribution,
      recurringBlockers,
    };
  }

  /**
   * 3. Monthly Trend Report (SAD §10.11, FR-41, PRD §9)
   * Khusus CEO/Management. Trend per fungsi, recurring root cause, escalation aging, compliance pattern.
   */
  async getMonthlyTrend(
    user: CurrentUserPayload,
    query: MonthlyTrendQueryDto,
  ) {
    const [yearStr, monthStr] = query.month.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    const monthStartDate = new Date(Date.UTC(year, month - 1, 1));
    const monthEndDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const accessibleUserIds = await this.scopeFilterService.getAccessibleUserIds(
      user,
      monthStartDate,
    );

    // Ambil penugasan organisasi untuk grouping per Function (SAD §13.4)
    const assignments = await this.prisma.organizationalAssignment.findMany({
      where: {
        effectiveDate: { lte: monthEndDate },
        OR: [{ endDate: null }, { endDate: { gte: monthStartDate } }],
        ...(accessibleUserIds ? { userId: { in: accessibleUserIds } } : {}),
      },
      select: { userId: true, function: true },
    });

    const userFunctionMap = new Map<string, string>();
    const functionsSet = new Set<string>();
    for (const a of assignments) {
      userFunctionMap.set(a.userId, a.function);
      functionsSet.add(a.function);
    }

    // Ambil records bulan ini
    const records = await this.prisma.dailyAccountabilityRecord.findMany({
      where: {
        workDate: { gte: monthStartDate, lte: monthEndDate },
        ...(accessibleUserIds
          ? { employeeUserId: { in: accessibleUserIds } }
          : {}),
      },
      select: {
        id: true,
        employeeUserId: true,
        initialStatus: true,
        finalStatus: true,
        morningTiming: true,
      },
    });

    // Trend per fungsi
    const functionTrends: Record<
      string,
      { totalCheckins: number; redCount: number; amberCount: number; greenCount: number }
    > = {};

    for (const f of functionsSet) {
      functionTrends[f] = { totalCheckins: 0, redCount: 0, amberCount: 0, greenCount: 0 };
    }

    for (const r of records) {
      const func = userFunctionMap.get(r.employeeUserId) || 'Lainnya';
      if (!functionTrends[func]) {
        functionTrends[func] = { totalCheckins: 0, redCount: 0, amberCount: 0, greenCount: 0 };
      }
      functionTrends[func].totalCheckins++;
      if (r.initialStatus === DailyStatus.RED) functionTrends[func].redCount++;
      else if (r.initialStatus === DailyStatus.AMBER) functionTrends[func].amberCount++;
      else if (r.initialStatus === DailyStatus.GREEN) functionTrends[func].greenCount++;
    }

    // Blocker root causes & escalation aging
    const blockers = await this.prisma.blocker.findMany({
      where: {
        raisedAt: { gte: monthStartDate, lte: monthEndDate },
        ...(accessibleUserIds
          ? {
              OR: [
                { raisedByUserId: { in: accessibleUserIds } },
                { ownerNeededUserId: { in: accessibleUserIds } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        type: true,
        severity: true,
        raisedAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
        status: true,
      },
    });

    const rootCauseDistribution: Record<string, number> = {};
    const escalationAging = {
      under4Hours: 0,
      between4And24Hours: 0,
      between24And48Hours: 0,
      over48Hours: 0,
      unresolved: 0,
    };

    for (const b of blockers) {
      rootCauseDistribution[b.type] = (rootCauseDistribution[b.type] || 0) + 1;

      if (b.resolvedAt) {
        const resolutionHours =
          (new Date(b.resolvedAt).getTime() - new Date(b.raisedAt).getTime()) /
          (1000 * 60 * 60);
        if (resolutionHours < 4) escalationAging.under4Hours++;
        else if (resolutionHours < 24) escalationAging.between4And24Hours++;
        else if (resolutionHours < 48) escalationAging.between24And48Hours++;
        else escalationAging.over48Hours++;
      } else {
        escalationAging.unresolved++;
      }
    }

    // Compliance pattern bulanan
    const complianceEvents = await this.prisma.complianceEvent.findMany({
      where: {
        eventDate: { gte: monthStartDate, lte: monthEndDate },
        ...(accessibleUserIds ? { userId: { in: accessibleUserIds } } : {}),
      },
      select: { eventType: true, followUpStatus: true },
    });

    const compliancePatterns: Record<string, number> = {
      [ComplianceEventType.NoSubmission]: 0,
      [ComplianceEventType.PatternFlag]: 0,
      [ComplianceEventType.Coaching]: 0,
      [ComplianceEventType.RecordedWarning]: 0,
      [ComplianceEventType.EscalatedFormalProcess]: 0,
    };

    for (const ce of complianceEvents) {
      compliancePatterns[ce.eventType] =
        (compliancePatterns[ce.eventType] || 0) + 1;
    }

    return {
      month: query.month,
      summary: {
        totalRecords: records.length,
        totalBlockers: blockers.length,
        totalComplianceEvents: complianceEvents.length,
      },
      functionalTrends: Object.entries(functionTrends).map(([func, data]) => ({
        function: func,
        ...data,
      })),
      rootCauseDistribution,
      escalationAging,
      compliancePatterns,
    };
  }

  /**
   * 4. Individual Review Evidence Report (SAD §13.6, PRD §9)
   * Kumpulan data mentah satu individu (daily records, visible manager notes sesuai BR-14, compliance events, blockers).
   */
  async getIndividualEvidence(
    user: CurrentUserPayload,
    targetUserId: string,
    query: IndividualEvidenceQueryDto,
  ) {
    const startDate = this.parseDateString(query.startDate);
    const endDate = new Date(this.parseDateString(query.endDate).getTime() + 24 * 60 * 60 * 1000 - 1);

    // Verifikasi otorisasi scope (SAD §13.6, §8.11)
    const accessibleUserIds = await this.scopeFilterService.getAccessibleUserIds(
      user,
      startDate,
    );

    if (accessibleUserIds !== null && !accessibleUserIds.includes(targetUserId)) {
      throw new ForbiddenException(
        'Akses ditolak: target pegawai di luar scope kewenangan Anda (SAD §13.3)',
      );
    }

    // Ambil data profil pegawai
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        fullName: true,
        email: true,
        organizationalAssignments: {
          where: {
            effectiveDate: { lte: endDate },
            OR: [{ endDate: null }, { endDate: { gte: startDate } }],
          },
          select: { role: true, function: true },
          take: 1,
        },
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Data pegawai tidak ditemukan');
    }

    // Ambil DailyAccountabilityRecords
    const records = await this.prisma.dailyAccountabilityRecord.findMany({
      where: {
        employeeUserId: targetUserId,
        workDate: { gte: startDate, lte: endDate },
      },
      include: {
        commitments: {
          select: {
            sequenceNo: true,
            text: true,
            initialRisk: true,
            outcome: true,
            continuation: true,
          },
        },
        additionalWorks: {
          select: {
            text: true,
            reason: true,
            outcome: true,
            continuation: true,
          },
        },
      },
      orderBy: { workDate: 'asc' },
    });

    // Ambil ManagerNotes (dengan penegakan ketat BR-14, SAD §13.6)
    const managerNotes = await this.prisma.managerNote.findMany({
      where: {
        aboutUserId: targetUserId,
        createdAt: { gte: startDate, lte: endDate },
        ...(user.role === Role.Employee
          ? { visibility: ManagerNoteVisibility.VisibleToEmployee }
          : {}),
      },
      select: {
        id: true,
        note: true,
        visibility: true,
        relatedEntityType: true,
        createdAt: true,
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Ambil ComplianceEvents
    const complianceEvents = await this.prisma.complianceEvent.findMany({
      where: {
        userId: targetUserId,
        eventDate: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        eventType: true,
        followUpStatus: true,
        eventDate: true,
      },
      orderBy: { eventDate: 'desc' },
    });

    // Ambil Blockers (baik yang dilaporkan maupun yang ditugaskan)
    const blockers = await this.prisma.blocker.findMany({
      where: {
        OR: [
          { raisedByUserId: targetUserId },
          { ownerNeededUserId: targetUserId },
        ],
        raisedAt: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        type: true,
        severity: true,
        impact: true,
        status: true,
        raisedAt: true,
        resolvedAt: true,
      },
      orderBy: { raisedAt: 'desc' },
    });

    return {
      user: {
        id: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: targetUser.organizationalAssignments[0]?.role || Role.Employee,
        function: targetUser.organizationalAssignments[0]?.function || '-',
      },
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
      records,
      managerNotes,
      complianceEvents,
      blockers,
    };
  }

  /**
   * 5. Blocker Root Cause Report (SAD §10.11, PRD §9)
   * Kategori blocker paling sering dan systemic bottleneck.
   */
  async getBlockerRootCauseReport(
    user: CurrentUserPayload,
    query: BlockerRootCauseQueryDto,
  ) {
    const startDate = this.parseDateString(query.startDate);
    const endDate = new Date(this.parseDateString(query.endDate).getTime() + 24 * 60 * 60 * 1000 - 1);

    const accessibleUserIds = await this.scopeFilterService.getAccessibleUserIds(
      user,
      startDate,
    );

    const blockers = await this.prisma.blocker.findMany({
      where: {
        raisedAt: { gte: startDate, lte: endDate },
        ...(accessibleUserIds
          ? {
              OR: [
                { raisedByUserId: { in: accessibleUserIds } },
                { ownerNeededUserId: { in: accessibleUserIds } },
              ],
            }
          : {}),
      },
      include: {
        raisedBy: { select: { fullName: true } },
        ownerNeeded: { select: { fullName: true } },
      },
      orderBy: { raisedAt: 'desc' },
    });

    const categoryBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};
    let resolvedCount = 0;
    let totalResolutionHours = 0;

    for (const b of blockers) {
      categoryBreakdown[b.type] = (categoryBreakdown[b.type] || 0) + 1;
      severityBreakdown[b.severity] = (severityBreakdown[b.severity] || 0) + 1;

      if (b.resolvedAt) {
        resolvedCount++;
        totalResolutionHours +=
          (new Date(b.resolvedAt).getTime() - new Date(b.raisedAt).getTime()) /
          (1000 * 60 * 60);
      }
    }

    const averageResolutionHours =
      resolvedCount > 0 ? Math.round((totalResolutionHours / resolvedCount) * 10) / 10 : 0;

    // Bottlenecks: kategori yang paling banyak unresolved atau frekuensi tertinggi
    const bottlenecks = Object.entries(categoryBreakdown)
      .map(([category, count]) => ({
        category,
        totalCount: count,
        percentage: Math.round((count / (blockers.length || 1)) * 100),
      }))
      .sort((a, b) => b.totalCount - a.totalCount);

    return {
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
      metrics: {
        totalBlockers: blockers.length,
        resolvedCount,
        unresolvedCount: blockers.length - resolvedCount,
        averageResolutionHours,
      },
      categoryBreakdown,
      severityBreakdown,
      bottlenecks,
      items: blockers.map((b) => ({
        id: b.id,
        type: b.type,
        severity: b.severity,
        impact: b.impact,
        status: b.status,
        raisedBy: b.raisedBy.fullName,
        ownerNeeded: b.ownerNeeded.fullName,
        raisedAt: b.raisedAt,
        resolvedAt: b.resolvedAt,
      })),
    };
  }

  // ===========================================================================
  // EPIC-16-T3: Export Report (SAD §13.5, §10.11, §14.2, §14.4)
  // Format PDF / XLSX, diunggah ke Object Storage, kembalikan signed download URL
  // ===========================================================================

  async exportReport(
    user: CurrentUserPayload,
    reportType: string,
    query: ExportReportQueryDto,
  ) {
    // Sesuai SAD §14.4 & BR-14, role Employee tidak berhak mengunduh report export
    if (user.role === Role.Employee && reportType !== 'individual-evidence') {
      throw new ForbiddenException(
        'Role Employee tidak memiliki wewenang untuk mengunduh export laporan manajerial',
      );
    }

    let payload: ExportPayload;

    switch (reportType) {
      case 'daily-exception': {
        const data = await this.getDailyExceptionReport(user, {
          date: query.date,
        });
        payload = {
          reportType,
          title: 'Laporan Pengecualian Harian (Daily Exception Report)',
          subtitle: `Tanggal: ${data.date} | Total Pegawai: ${data.metrics.totalExpectedEmployees}`,
          generatedAt: new Date(),
          generatedBy: user.email,
          tables: [
            {
              title: 'Ringkasan Metrik',
              data: {
                headers: ['Metrik', 'Jumlah'],
                rows: [
                  ['Total Pegawai Terjadwal', data.metrics.totalExpectedEmployees],
                  ['Submit Tepat Waktu / Ada Record', data.metrics.submittedCount],
                  ['Tanpa Submit (No Submission)', data.metrics.noSubmissionCount],
                  ['Risiko RED', data.metrics.redCount],
                  ['Risiko AMBER', data.metrics.amberCount],
                  ['Risiko GREEN', data.metrics.greenCount],
                  ['Blocker Kritis Aktif', data.metrics.criticalBlockerCount],
                  ['Overdue Acknowledgement', data.metrics.overdueAcknowledgementCount],
                ],
              },
            },
            {
              title: 'Daftar Pengecualian (Exceptions)',
              data: {
                headers: ['Tipe', 'Pegawai / Pelapor', 'Fungsi', 'Judul / Dampak', 'Severity'],
                rows: data.exceptions.map((e) => [
                  e.type,
                  e.userName || '-',
                  e.userFunction || '-',
                  e.title,
                  e.severity || '-',
                ]),
              },
            },
          ],
        };
        break;
      }

      case 'weekly-team-summary': {
        if (!query.weekStart) {
          throw new ValidationException('Query parameter weekStart wajib diisi untuk export weekly-team-summary');
        }
        const data = await this.getWeeklyTeamSummary(user, {
          weekStart: query.weekStart,
        });
        payload = {
          reportType,
          title: 'Ringkasan Akuntabilitas Mingguan (Weekly Team Summary)',
          subtitle: `Periode: ${data.period.weekStart} s.d. ${data.period.weekEnd}`,
          generatedAt: new Date(),
          generatedBy: user.email,
          tables: [
            {
              title: 'Ringkasan Volume',
              data: {
                headers: ['Item', 'Jumlah'],
                rows: [
                  ['Total Record Check-in', data.summary.totalRecords],
                  ['Total Komitmen', data.summary.totalCommitments],
                  ['Total Blocker Masuk', data.summary.totalBlockers],
                  ['Blocker Terselesaikan', data.summary.resolvedBlockers],
                  ['Kontribusi Dukungan Tim', data.summary.totalSupportContributions],
                  ['Insiden No Submission', data.summary.noSubmissionCount],
                  ['Komitmen Berlanjut (Continue)', data.summary.recurringContinuationsCount],
                ],
              },
            },
            {
              title: 'Distribusi Hasil Komitmen (Outcome)',
              data: {
                headers: ['Outcome', 'Jumlah'],
                rows: Object.entries(data.outcomeDistribution).map(([k, v]) => [k, v]),
              },
            },
            {
              title: 'Kategori Blocker Berulang',
              data: {
                headers: ['Kategori', 'Frekuensi Kemunculan'],
                rows: data.recurringBlockers.map((b) => [b.category, b.count]),
              },
            },
          ],
        };
        break;
      }

      case 'monthly-trend': {
        if (!query.month) {
          throw new ValidationException('Query parameter month wajib diisi untuk export monthly-trend');
        }
        const data = await this.getMonthlyTrend(user, { month: query.month });
        payload = {
          reportType,
          title: 'Laporan Tren Manajemen Bulanan (Monthly Management Trend)',
          subtitle: `Bulan: ${data.month}`,
          generatedAt: new Date(),
          generatedBy: user.email,
          tables: [
            {
              title: 'Tren per Fungsi Organisasi',
              data: {
                headers: ['Fungsi Organisasi', 'Total Check-in', 'RED', 'AMBER', 'GREEN'],
                rows: data.functionalTrends.map((f) => [
                  f.function,
                  f.totalCheckins,
                  f.redCount,
                  f.amberCount,
                  f.greenCount,
                ]),
              },
            },
            {
              title: 'Distribusi Akar Masalah (Root Cause)',
              data: {
                headers: ['Kategori Blocker', 'Jumlah'],
                rows: Object.entries(data.rootCauseDistribution).map(([k, v]) => [k, v]),
              },
            },
            {
              title: 'Distribusi Durasi Eskalasi Blocker',
              data: {
                headers: ['Rentang Waktu', 'Jumlah'],
                rows: [
                  ['< 4 Jam', data.escalationAging.under4Hours],
                  ['4 - 24 Jam', data.escalationAging.between4And24Hours],
                  ['24 - 48 Jam', data.escalationAging.between24And48Hours],
                  ['> 48 Jam', data.escalationAging.over48Hours],
                  ['Belum Selesai (Unresolved)', data.escalationAging.unresolved],
                ],
              },
            },
            {
              title: 'Pola Kepatuhan (Compliance Patterns)',
              data: {
                headers: ['Jenis Pelanggaran', 'Jumlah'],
                rows: Object.entries(data.compliancePatterns).map(([k, v]) => [k, v]),
              },
            },
          ],
        };
        break;
      }

      case 'individual-evidence': {
        const targetUserId = query.userId || user.userId;
        if (!query.startDate || !query.endDate) {
          throw new ValidationException('startDate dan endDate wajib diisi untuk export individual-evidence');
        }
        const data = await this.getIndividualEvidence(user, targetUserId, {
          startDate: query.startDate,
          endDate: query.endDate,
        });
        payload = {
          reportType,
          title: `Bukti Evaluasi Individual: ${data.user.fullName}`,
          subtitle: `Fungsi: ${data.user.function} | Periode: ${data.period.startDate} s.d. ${data.period.endDate}`,
          generatedAt: new Date(),
          generatedBy: user.email,
          tables: [
            {
              title: 'Histori Check-in Harian',
              data: {
                headers: ['Tanggal', 'Initial Status', 'Final Status', 'Jml Komitmen', 'Jml Additional Work'],
                rows: data.records.map((r) => [
                  this.formatDateString(new Date(r.workDate)),
                  r.initialStatus || '-',
                  r.finalStatus || '-',
                  r.commitments.length,
                  r.additionalWorks.length,
                ]),
              },
            },
            {
              title: 'Catatan Manajerial (Manager Notes Terkait)',
              data: {
                headers: ['Tanggal', 'Penulis', 'Visibilitas', 'Isi Catatan'],
                rows: data.managerNotes.map((n) => [
                  this.formatDateString(new Date(n.createdAt)),
                  n.createdBy.fullName,
                  n.visibility,
                  n.note,
                ]),
              },
            },
            {
              title: 'Event Kepatuhan (Compliance)',
              data: {
                headers: ['Tanggal', 'Tipe Event', 'Status Tindak Lanjut'],
                rows: data.complianceEvents.map((c) => [
                  this.formatDateString(new Date(c.eventDate)),
                  c.eventType,
                  c.followUpStatus || '-',
                ]),
              },
            },
            {
              title: 'Daftar Blocker Terkait',
              data: {
                headers: ['Tipe', 'Severity', 'Status', 'Dampak'],
                rows: data.blockers.map((b) => [b.type, b.severity, b.status, b.impact]),
              },
            },
          ],
        };
        break;
      }

      case 'blocker-root-cause': {
        if (!query.startDate || !query.endDate) {
          throw new ValidationException('startDate dan endDate wajib diisi untuk export blocker-root-cause');
        }
        const data = await this.getBlockerRootCauseReport(user, {
          startDate: query.startDate,
          endDate: query.endDate,
        });
        payload = {
          reportType,
          title: 'Laporan Akar Masalah Blocker (Blocker Root Cause Report)',
          subtitle: `Periode: ${data.period.startDate} s.d. ${data.period.endDate}`,
          generatedAt: new Date(),
          generatedBy: user.email,
          tables: [
            {
              title: 'Metrik Utama Blocker',
              data: {
                headers: ['Indikator', 'Nilai'],
                rows: [
                  ['Total Blocker Muncul', data.metrics.totalBlockers],
                  ['Blocker Terselesaikan', data.metrics.resolvedCount],
                  ['Blocker Belum Selesai', data.metrics.unresolvedCount],
                  ['Rata-rata Waktu Penyelesaian', `${data.metrics.averageResolutionHours} Jam`],
                ],
              },
            },
            {
              title: 'Analisis Bottleneck Sistemik',
              data: {
                headers: ['Kategori Blocker', 'Jumlah Kasus', 'Persentase'],
                rows: data.bottlenecks.map((b) => [b.category, b.totalCount, `${b.percentage}%`]),
              },
            },
            {
              title: 'Daftar Kasus Blocker',
              data: {
                headers: ['Kategori', 'Severity', 'Status', 'Pelapor', 'Penanggung Jawab', 'Dampak'],
                rows: data.items.map((b) => [
                  b.type,
                  b.severity,
                  b.status,
                  b.raisedBy,
                  b.ownerNeeded,
                  b.impact,
                ]),
              },
            },
          ],
        };
        break;
      }

      default:
        throw new ValidationException(
          `Tipe laporan '${reportType}' tidak dikenali. Pilihan: daily-exception, weekly-team-summary, monthly-trend, individual-evidence, blocker-root-cause`,
        );
    }

    return this.exportGeneratorService.generateAndUploadExport(
      user,
      reportType,
      query.format,
      payload,
    );
  }
}
