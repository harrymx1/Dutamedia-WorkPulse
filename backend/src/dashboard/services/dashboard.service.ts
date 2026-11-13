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

    // Tentukan apakah pemanggil adalah Project Lead langsung (projectManagerId)
    // Catatan: escalationReviewerId adalah atasan eskalasi struktural (Head/CEO), bukan Project Lead harian
    const callerLedMappings = options?.userId
      ? projectMappings.filter((m) => m.projectManagerId === options.userId)
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
      include: {
        raisedBy: { select: { id: true, fullName: true } },
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

    // Inisialisasi peta profil penugasan aktif
    const userFunctionMap = new Map<string, { function: string; jobTitle: string; fullName: string }>();
    for (const a of activeAssignments) {
      userFunctionMap.set(a.userId, {
        function: a.function,
        jobTitle: a.jobTitle,
        fullName: a.user?.fullName || 'Karyawan',
      });
    }

    // 1. Tentukan himpunan userId berdasarkan filter Divisi (jika ada)
    let divisionUserIds: Set<string> | null = null;
    if (targetDivision) {
      const normalizedTarget = targetDivision.toLowerCase().replace(/[^a-z0-9]/g, '');
      divisionUserIds = new Set(
        activeAssignments
          .filter((a) => {
            if (!a.function) return false;
            if (a.function === targetDivision) return true;
            const normFunc = String(a.function).toLowerCase().replace(/[^a-z0-9]/g, '');
            return (
              normFunc === normalizedTarget ||
              normFunc.includes(normalizedTarget) ||
              normalizedTarget.includes(normFunc)
            );
          })
          .map((a) => a.userId),
      );
    }

    // 2. Tentukan himpunan userId berdasarkan filter Proyek / Cakupan Tim (jika ada)
    let projectUserIds: Set<string> | null = null;
    const isTeamScope = options?.scope === 'team';
    if (isTeamScope || targetProject) {
      const activeProjectCodes = targetProject
        ? new Set([targetProject.toUpperCase()])
        : callerLedMappings.length > 0
          ? new Set(callerLedMappings.map((m) => m.projectCode.toUpperCase()))
          : new Set(availableProjects.map((p) => p.projectCode.toUpperCase()));

      const involvedFunctions = new Set(
        projectMappings
          .filter((m) => activeProjectCodes.has(m.projectCode.toUpperCase()))
          .map((m) => m.involvedFunction),
      );

      const pUsers = new Set<string>();

      for (const a of activeAssignments) {
        if (a.function && involvedFunctions.has(a.function)) {
          pUsers.add(a.userId);
        }
      }

      for (const m of projectMappings) {
        if (activeProjectCodes.has(m.projectCode.toUpperCase())) {
          if (m.projectManagerId) pUsers.add(m.projectManagerId);
          if (m.escalationReviewerId) pUsers.add(m.escalationReviewerId);
        }
      }

      for (const r of todayRecords) {
        const snap = (r.orgContextSnapshot as any) || {};
        const cMeta = snap.commitmentMeta || {};
        const hasProjectCommitment = (r.commitments || []).some((c: any) => {
          const pCode = cMeta[String(c.sequenceNo)]?.projectCode || null;
          if (pCode && activeProjectCodes.has(pCode.toUpperCase())) return true;
          if (c.referenceLink) {
            return Array.from(activeProjectCodes).some((code) =>
              String(c.referenceLink).toUpperCase().includes(code),
            );
          }
          return false;
        });
        if (hasProjectCommitment) {
          pUsers.add(r.userId);
        }
      }

      for (const b of openBlockers) {
        if (
          b.projectCodeReference &&
          activeProjectCodes.has(b.projectCodeReference.toUpperCase())
        ) {
          if (b.raisedByUserId) pUsers.add(b.raisedByUserId);
          if (b.assignedOwnerId) pUsers.add(b.assignedOwnerId);
        }
      }

      projectUserIds = pUsers;
    }

    // 3. Set Intersection: Gabungkan kriteria filter secara matematis presisi
    let effectiveUserIds: Set<string> | null = null;
    if (divisionUserIds !== null && projectUserIds !== null) {
      effectiveUserIds = new Set(
        [...divisionUserIds].filter((id) => projectUserIds!.has(id)),
      );
    } else if (divisionUserIds !== null) {
      effectiveUserIds = divisionUserIds;
    } else if (projectUserIds !== null) {
      effectiveUserIds = projectUserIds;
    }

    if (effectiveUserIds !== null) {
      totalEmployees = effectiveUserIds.size;
      todayRecords = todayRecords.filter((r: any) => effectiveUserIds!.has(r.userId));
      openBlockers = openBlockers.filter(
        (b: any) =>
          effectiveUserIds!.has(b.raisedByUserId) || effectiveUserIds!.has(b.assignedOwnerId),
      );
    }

    // 4. Jika filter proyek spesifik dipilih, lakukan penyaringan granular komitmen & blocker
    if (targetProject) {
      const pCodeUpper = targetProject.toUpperCase();
      todayRecords = todayRecords
        .map((r: any) => {
          const snap = (r.orgContextSnapshot as any) || {};
          const cMeta = snap.commitmentMeta || {};
          const filteredCommitments = (r.commitments || []).filter((c: any) => {
            const pCode = cMeta[String(c.sequenceNo)]?.projectCode || null;
            if (pCode) return pCode.toUpperCase() === pCodeUpper;
            if (c.referenceLink) {
              return String(c.referenceLink).toUpperCase().includes(pCodeUpper);
            }
            return false;
          });
          return {
            ...r,
            commitments: filteredCommitments,
          };
        });

      openBlockers = openBlockers.filter(
        (b: any) =>
          b.projectCodeReference &&
          b.projectCodeReference.toUpperCase() === pCodeUpper,
      );
    }

    const checkedInCount = todayRecords.filter((r: any) => {
      const isSubmitted = r.isMorningSubmitted || Boolean(r.morningSubmittedAt);
      if (!isSubmitted) return false;
      if (targetProject) {
        return (r.commitments || []).length > 0;
      }
      return true;
    }).length;
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

    // 1. Masukkan tiket kendala aktif (blockers) yang sedang berjalan
    for (const b of openBlockers as any[]) {
      const uInfo = userJobMap.get(b.raisedByUserId);
      const userName = b.raisedBy?.fullName || uInfo?.fullName || 'Anggota Tim';
      const jobTitle = uInfo?.jobTitle || 'Staf';
      const funcName = uInfo?.function || 'ENGINEERING';
      const isRed =
        b.severity === BlockerSeverity.CRITICAL || b.severity === BlockerSeverity.HIGH;

      attentionItems.push({
        id: `blocker-${b.id}`,
        userName,
        jobTitle,
        function: funcName,
        projectCode: b.projectCodeReference || null,
        level: isRed ? 'RED' : 'AMBER',
        badgeLabel:
          b.severity === BlockerSeverity.CRITICAL
            ? 'Blocker Kritis (P0)'
            : b.severity === BlockerSeverity.HIGH
              ? 'Blocker Tinggi (P1)'
              : 'Kendala Aktif',
        description: this.formatBlockerSummaryText(b.description),
        supportNote:
          b.status === BlockerStatus.OPEN
            ? 'Kendala aktif belum direspon — butuh tindakan pimpinan'
            : `Kendala dalam penanganan (${b.status})`,
        actionUrl: '/blockers',
        actionLabel: 'Bantu Unblock',
      });
    }

    // 2. Masukkan komitmen harian yang berisiko Amber atau Merah (hindari duplikasi jika sudah terdaftar di blocker di atas)
    const linkedCommitmentIdsFromBlockers = new Set(
      openBlockers.map((b: any) => b.linkedCommitmentId).filter(Boolean),
    );

    for (const r of todayRecords as any[]) {
      const uInfo = userJobMap.get(r.userId);
      const userName = r.user?.fullName || uInfo?.fullName || 'Anggota Tim';
      const jobTitle = uInfo?.jobTitle || (r.orgContextSnapshot as any)?.jobTitle || 'Staf';
      const funcName = uInfo?.function || (r.orgContextSnapshot as any)?.function || 'ENGINEERING';
      const cMeta = (r.orgContextSnapshot as any)?.commitmentMeta || {};

      for (const c of r.commitments || []) {
        if (c.id && linkedCommitmentIdsFromBlockers.has(c.id)) {
          continue;
        }

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
              c.initialRisk === CommitmentRisk.RED ? 'Komitmen Merah (Kritis)' : 'Komitmen Amber (Waspada)',
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
    // 1. Ambil seluruh project authority mappings aktif dari DB
    const mappings = await this.prisma.projectAuthorityMapping.findMany({
      where: { endDate: null },
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
        escalationReviewer: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { projectCode: 'asc' },
    });

    // 2. Ambil seluruh open blockers
    const allOpenBlockers = await this.prisma.blockerTicket.findMany({
      where: {
        status: { in: [BlockerStatus.OPEN, BlockerStatus.ACKNOWLEDGED, BlockerStatus.IN_PROGRESS] },
      },
      include: {
        assignedOwner: { select: { id: true, fullName: true } },
      },
    });

    // 3. Ambil komitmen aktif hari ini
    const today = this.clockService?.now ? this.clockService.now() : (this.clockService?.currentDate ? this.clockService.currentDate() : new Date());
    today.setHours(0, 0, 0, 0);
    const todayRecords = await this.prisma.dailyAccountabilityRecord.findMany({
      where: { workDate: today },
      include: { commitments: true },
    });

    return mappings.map((prj) => {
      // Hitung komitmen aktif pada proyek ini
      let activeCommitmentsCount = 0;
      for (const r of todayRecords) {
        const snap = (r.orgContextSnapshot as any) || {};
        const cMeta = snap.commitmentMeta || {};
        for (const c of r.commitments || []) {
          const pCode = cMeta[String(c.sequenceNo)]?.projectCode || null;
          if (pCode && pCode.toUpperCase() === prj.projectCode.toUpperCase()) {
            activeCommitmentsCount++;
          }
        }
      }

      // Hitung blocker terbuka untuk proyek ini
      const prjBlockers = allOpenBlockers.filter(
        (b) => b.projectCodeReference && b.projectCodeReference.toUpperCase() === prj.projectCode.toUpperCase(),
      );
      const criticalCount = prjBlockers.filter((b) => b.severity === BlockerSeverity.CRITICAL).length;
      const highCount = prjBlockers.filter((b) => b.severity === BlockerSeverity.HIGH).length;

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (criticalCount > 0) riskLevel = 'CRITICAL';
      else if (highCount > 0 || prjBlockers.length >= 3) riskLevel = 'HIGH';
      else if (prjBlockers.length > 0) riskLevel = 'MEDIUM';

      // Health Score: 100 base, dikurangi penalti blocker (CRITICAL -40, HIGH -25, MEDIUM -15, LOW -5)
      let penalty = 0;
      for (const b of prjBlockers) {
        if (b.severity === BlockerSeverity.CRITICAL) penalty += 40;
        else if (b.severity === BlockerSeverity.HIGH) penalty += 25;
        else if (b.severity === BlockerSeverity.MEDIUM) penalty += 15;
        else penalty += 5;
      }
      const healthScore = Math.max(0, 100 - penalty);

      const topBlocker = [...prjBlockers].sort((a, b) => {
        const ranks = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return ranks[b.severity] - ranks[a.severity];
      })[0];

      return {
        id: prj.id,
        code: prj.projectCode,
        projectCode: prj.projectCode,
        name: prj.projectName,
        projectName: prj.projectName,
        clientName: prj.involvedFunction,
        leadName: prj.projectManager?.fullName || 'Project Lead',
        activeCommitmentsCount,
        openBlockersCount: prjBlockers.length,
        totalBlockers: prjBlockers.length,
        criticalCount,
        highCount,
        riskLevel,
        healthScore,
        topBlockerTitle: topBlocker
          ? `[${topBlocker.severity}] ${this.formatBlockerSummaryText(topBlocker.description).slice(0, 80)}`
          : undefined,
      };
    });
  }

  private formatBlockerSummaryText(rawDescription?: string | null): string {
    const raw = (rawDescription || '').trim();
    if (!raw) return '';
    const withoutExpectation = raw.replace(/\s*\(Ekspektasi:\s*[^)]*\)\s*$/i, '').trim();
    const match = withoutExpectation.match(/^\[(.+?)\]\s*(.*)$/s);
    if (match) {
      const title = match[1].trim();
      const body = match[2].trim();
      return body ? `${title} — ${body}` : title;
    }
    return withoutExpectation;
  }
}