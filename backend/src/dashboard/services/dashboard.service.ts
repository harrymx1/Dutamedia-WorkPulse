import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/time/clock.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';
import {
  BlockerSeverity,
  BlockerStatus,
  CanonicalRole,
  CommitmentOutcome,
  CommitmentRisk,
  UserStatus,
} from '@prisma/client';

export interface PulseQueryOptions {
  userId?: string;
  userRole?: string;
  userFunction?: string;
  scope?: string;
  filterFunction?: string;
  projectCode?: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clockService: ClockService,
  ) {}

  /**
   * Mengambil metrik harian Pulse Dashboard (Prototipe 08) dengan penyaringan Scope:
   * - management (Seluruh Perusahaan): Khusus CEO_MANAGEMENT / SYSTEM_ADMIN / HRGA, dapat difilter per Divisi & Proyek
   * - function (Divisi Saya): Khusus HEAD (terkunci pada divisinya sendiri) / CEO_MANAGEMENT / SYSTEM_ADMIN
   * - team (Tim Proyek): Khusus Project Lead (siapapun yang memimpin proyek di ProjectAuthorityMapping / PM) / CEO
   */
  async getPulseMetrics(options?: PulseQueryOptions) {
    const today = this.clockService.currentDate();

    // Default projects fallback
    const defaultProjects = [
      { projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing' },
      { projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync' },
      { projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android' },
    ];

    // Ambil pemetaan proyek aktif jika tersedia di Prisma
    let projectMappings: any[] = [];
    if ((this.prisma as any).projectAuthorityMapping?.findMany) {
      projectMappings =
        (await (this.prisma as any).projectAuthorityMapping.findMany({
          where: {
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        })) || [];
    }

    const projectMap = new Map<string, string>();
    for (const p of [...projectMappings, ...defaultProjects]) {
      if (p.projectCode && !projectMap.has(p.projectCode)) {
        projectMap.set(p.projectCode, p.projectName);
      }
    }
    const availableProjects = Array.from(projectMap.entries()).map(([projectCode, projectName]) => ({
      projectCode,
      projectName,
    }));

    // Tentukan apakah pemanggil adalah Project Lead
    const callerLedMappings = options?.userId
      ? projectMappings.filter(
          (m) => m.projectManagerId === options.userId || m.escalationReviewerId === options.userId,
        )
      : [];
    const isProjectLead =
      callerLedMappings.length > 0 ||
      options?.userRole === CanonicalRole.PROJECT_MANAGER ||
      options?.userRole === CanonicalRole.SUPERVISOR;

    // Resolusi penugasan organisasi aktif bila tersedia
    let activeAssignments: any[] = [];
    if ((this.prisma as any).organizationalAssignment?.findMany) {
      activeAssignments =
        (await (this.prisma as any).organizationalAssignment.findMany({
          where: {
            effectiveDate: { lte: today },
            OR: [{ endDate: null }, { endDate: { gte: today } }],
            user: { status: UserStatus.ACTIVE },
          },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        })) || [];
    }

    const callerAssignment = options?.userId
      ? activeAssignments.find((a) => a.userId === options.userId)
      : null;
    const callerFunction = callerAssignment?.function || options?.userFunction || null;
    const callerRole = callerAssignment?.role || options?.userRole || null;

    // Penegakan otorisasi lintas divisi untuk HEAD pada scope=function
    if (
      options?.scope === 'function' &&
      callerRole === CanonicalRole.HEAD &&
      options?.filterFunction &&
      options.filterFunction !== 'ALL' &&
      callerFunction &&
      options.filterFunction !== callerFunction
    ) {
      throw new AppException({
        statusCode: HttpStatus.FORBIDDEN,
        code: ErrorCode.AUTH_FORBIDDEN_SCOPE,
        message: `Sebagai Head Divisi ${callerFunction}, Anda tidak memiliki akses ke data Divisi ${options.filterFunction}.`,
      });
    }

    // Total karyawan aktif (baseline)
    let totalEmployees = await this.prisma.user.count({
      where: { status: UserStatus.ACTIVE },
    });

    // Record akuntabilitas hari ini
    let todayRecords = await this.prisma.dailyAccountabilityRecord.findMany({
      where: { workDate: today },
      include: {
        commitments: true,
        user: { select: { id: true, fullName: true } },
      },
    });

    // Blocker Aktif
    let openBlockers = await this.prisma.blockerTicket.findMany({
      where: {
        status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] },
      },
    });

    // Filter berdasarkan Scope / Divisi / Proyek bila konteks organisasi tersedia
    let targetDivision: string | null = null;
    if (options?.scope === 'function') {
      targetDivision =
        callerRole === CanonicalRole.HEAD
          ? callerFunction
          : options.filterFunction && options.filterFunction !== 'ALL'
            ? options.filterFunction
            : callerFunction;
    } else if (options?.scope === 'management') {
      if (options.filterFunction && options.filterFunction !== 'ALL') {
        targetDivision = options.filterFunction;
      }
    }

    const targetProject =
      options?.projectCode && options.projectCode !== 'ALL' ? options.projectCode : null;

    if (activeAssignments.length > 0 && (targetDivision || options?.scope === 'team' || targetProject)) {
      const userFunctionMap = new Map<string, { function: string; jobTitle: string; fullName: string }>();
      for (const a of activeAssignments) {
        userFunctionMap.set(a.userId, {
          function: a.function,
          jobTitle: a.jobTitle,
          fullName: a.user?.fullName || 'Karyawan',
        });
      }

      if (targetDivision) {
        const divisionUserIds = new Set(
          activeAssignments.filter((a) => a.function === targetDivision).map((a) => a.userId),
        );
        totalEmployees = divisionUserIds.size;
        todayRecords = todayRecords.filter((r: any) => divisionUserIds.has(r.userId));
        openBlockers = openBlockers.filter(
          (b: any) => divisionUserIds.has(b.raisedByUserId) || divisionUserIds.has(b.assignedOwnerId),
        );
      }

      if (options?.scope === 'team' || targetProject) {
        const activeProjectCodes = targetProject
          ? new Set([targetProject])
          : callerLedMappings.length > 0
            ? new Set(callerLedMappings.map((m) => m.projectCode))
            : new Set(availableProjects.map((p) => p.projectCode));

        const involvedFunctions = new Set(
          projectMappings
            .filter((m) => activeProjectCodes.has(m.projectCode))
            .map((m) => m.involvedFunction),
        );

        // Filter records yang memiliki komitmen pada proyek terkait atau berada di fungsi yang terlibat
        todayRecords = todayRecords
          .map((r: any) => {
            const snap = (r.orgContextSnapshot as any) || {};
            const cMeta = snap.commitmentMeta || {};
            const filteredCommitments = (r.commitments || []).filter((c: any) => {
              const pCode = cMeta[String(c.sequenceNo)]?.projectCode || null;
              if (pCode) return activeProjectCodes.has(pCode);
              if (targetProject) {
                return (
                  c.referenceLink &&
                  String(c.referenceLink).toUpperCase().includes(targetProject.toUpperCase())
                );
              }
              return true;
            });
            return {
              ...r,
              commitments: filteredCommitments,
            };
          })
          .filter((r: any) => {
            if (targetProject) {
              return r.commitments.length > 0;
            }
            const uFunc = userFunctionMap.get(r.userId)?.function;
            return r.commitments.length > 0 || (uFunc && involvedFunctions.has(uFunc));
          });

        openBlockers = openBlockers.filter((b: any) =>
          b.projectCodeReference ? activeProjectCodes.has(b.projectCodeReference) : !targetProject,
        );

        if (targetProject) {
          const projectUserIds = new Set(todayRecords.map((r: any) => r.userId));
          const involvedUserIds = new Set(
            activeAssignments.filter((a) => involvedFunctions.has(a.function)).map((a) => a.userId),
          );
          totalEmployees = Math.max(projectUserIds.size, involvedUserIds.size);
        }
      }
    }

    const checkedInCount = todayRecords.filter(
      (r: any) => r.isMorningSubmitted || Boolean(r.morningSubmittedAt),
    ).length;
    const eodSubmittedCount = todayRecords.filter(
      (r: any) => r.isEodSubmitted || Boolean(r.eodSubmittedAt),
    ).length;

    // Breakdown Komitmen
    const allCommitments = todayRecords.flatMap((r: any) => r.commitments || []);
    const greenCount = allCommitments.filter((c: any) => c.initialRisk === CommitmentRisk.GREEN).length;
    const amberCount = allCommitments.filter((c: any) => c.initialRisk === CommitmentRisk.AMBER).length;
    const redCount = allCommitments.filter((c: any) => c.initialRisk === CommitmentRisk.RED).length;

    // Breakdown Outcome EOD
    const completedCount = allCommitments.filter(
      (c: any) => c.outcome === CommitmentOutcome.COMPLETED,
    ).length;
    const partialCount = allCommitments.filter(
      (c: any) => c.outcome === CommitmentOutcome.PARTIALLY_COMPLETED,
    ).length;
    const notCompletedCount = allCommitments.filter(
      (c: any) => c.outcome === CommitmentOutcome.NOT_COMPLETED,
    ).length;
    const cancelledCount = allCommitments.filter(
      (c: any) => c.outcome === CommitmentOutcome.CANCELLED,
    ).length;

    const criticalBlockersCount = openBlockers.filter(
      (b: any) => b.severity === BlockerSeverity.CRITICAL,
    ).length;
    const unacknowledgedBlockersCount = openBlockers.filter(
      (b: any) => b.status === BlockerStatus.OPEN,
    ).length;

    const participationRate =
      totalEmployees > 0 ? Math.round((checkedInCount / totalEmployees) * 100) : 0;
    const noSubmissionCount = Math.max(0, totalEmployees - checkedInCount);

    // Susun daftar personil butuh perhatian secara dinamis dari record & blocker nyata
    const userJobMap = new Map<string, { fullName: string; jobTitle: string; function: string }>();
    for (const a of activeAssignments) {
      userJobMap.set(a.userId, {
        fullName: a.user?.fullName || 'Karyawan',
        jobTitle: a.jobTitle || a.function,
        function: a.function,
      });
    }

    const attentionItems: Array<{
      id: string;
      userName: string;
      jobTitle: string;
      function: string;
      projectCode: string | null;
      level: 'RED' | 'AMBER';
      badgeLabel: string;
      description: string;
      supportNote: string;
      actionUrl: string;
      actionLabel: string;
    }> = [];

    for (const r of todayRecords as any[]) {
      const uInfo = userJobMap.get(r.userId);
      const userName = r.user?.fullName || uInfo?.fullName || 'Anggota Tim';
      const jobTitle = uInfo?.jobTitle || (r.orgContextSnapshot as any)?.jobTitle || 'Staf';
      const funcName = uInfo?.function || (r.orgContextSnapshot as any)?.function || 'ENGINEERING';
      const cMeta = (r.orgContextSnapshot as any)?.commitmentMeta || {};

      for (const c of r.commitments || []) {
        if (c.initialRisk === CommitmentRisk.RED || c.initialRisk === CommitmentRisk.AMBER) {
          const pCode = cMeta[String(c.sequenceNo)]?.projectCode || null;
          attentionItems.push({
            id: c.id || `${r.id}-${c.sequenceNo}`,
            userName,
            jobTitle,
            function: funcName,
            projectCode: pCode,
            level: c.initialRisk === CommitmentRisk.RED ? 'RED' : 'AMBER',
            badgeLabel:
              c.initialRisk === CommitmentRisk.RED ? 'Komitmen Merah (Kritis)' : 'Komitmen Amber',
            description: c.knownBlockerNote || c.taskText,
            supportNote: c.supportNeeded || `Tugas: ${c.taskText}`,
            actionUrl: c.initialRisk === CommitmentRisk.RED ? '/blockers' : '/coaching',
            actionLabel: c.initialRisk === CommitmentRisk.RED ? 'Bantu' : 'Catat',
          });
        }
      }
    }

    return {
      date: today.toISOString().slice(0, 10),
      totalEmployees,
      checkedInCount,
      eodSubmittedCount,
      participationRate,
      // Field kompatibel untuk frontend PulseDashboardView.vue:
      submittedCount: checkedInCount,
      noSubmissionCount,
      amberCommitmentsCount: amberCount,
      redCommitmentsCount: redCount,
      unacknowledgedBlockersCount,
      completionRatePercent: participationRate,
      isProjectLead,
      callerFunction,
      ledProjects: callerLedMappings.map((m) => ({
        projectCode: m.projectCode,
        projectName: m.projectName,
      })),
      availableProjects,
      attentionItems,
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
