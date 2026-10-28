import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportingService } from './services/reporting.service.js';
import {
  BlockerSeverity,
  BlockerStatus,
  CommitmentOutcome,
  ComplianceEventType,
  DailyStatus,
  ManagerNoteVisibility,
  Role,
} from '@prisma/client';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import {
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from '../shared/exceptions/api.exception.js';

describe('ReportingService', () => {
  let service: ReportingService;
  let mockPrisma: any;
  let mockScopeFilterService: any;
  let mockExportGeneratorService: any;

  const mockHeadUser: CurrentUserPayload = {
    userId: 'head-user-1',
    email: 'head@dutamedia.com',
    role: Role.Head,
    function: 'Engineering',
    directManagerId: null,
    sessionId: 'session-head-1',
    mustResetPassword: false,
  };

  const mockEmployeeUser: CurrentUserPayload = {
    userId: 'emp-user-1',
    email: 'emp@dutamedia.com',
    role: Role.Employee,
    function: 'Engineering',
    directManagerId: 'head-user-1',
    sessionId: 'session-emp-1',
    mustResetPassword: false,
  };

  beforeEach(() => {
    mockPrisma = {
      organizationalAssignment: {
        findMany: vi.fn(),
      },
      dailyAccountabilityRecord: {
        findMany: vi.fn(),
      },
      exception: {
        findMany: vi.fn(),
      },
      blocker: {
        findMany: vi.fn(),
      },
      complianceEvent: {
        findMany: vi.fn(),
      },
      managerNote: {
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    mockScopeFilterService = {
      getAccessibleUserIds: vi.fn(),
      buildScopeFilter: vi.fn(),
    };

    mockExportGeneratorService = {
      generateAndUploadExport: vi.fn(),
    };

    service = new ReportingService(
      mockPrisma,
      mockScopeFilterService,
      mockExportGeneratorService,
    );
  });

  // ===========================================================================
  // EPIC-16-T1: getExceptionSummary
  // ===========================================================================
  describe('getExceptionSummary (EPIC-16-T1, SAD §13.2)', () => {
    it('harus menghitung metrik exception dan daftar exception secara akurat', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue([
        'emp-1',
        'emp-2',
        'emp-3',
      ]);

      // 3 active assignments
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1', function: 'Engineering', user: { id: 'emp-1', fullName: 'Alice' } },
        { userId: 'emp-2', function: 'Engineering', user: { id: 'emp-2', fullName: 'Bob' } },
        { userId: 'emp-3', function: 'Engineering', user: { id: 'emp-3', fullName: 'Charlie' } },
      ]);

      // emp-1 submitted RED, emp-2 submitted GREEN, emp-3 did not submit
      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          employeeUserId: 'emp-1',
          workDate: new Date('2026-09-17'),
          initialStatus: DailyStatus.RED,
          employee: { id: 'emp-1', fullName: 'Alice' },
          commitments: [
            { id: 'c-1', text: 'Server migration', initialRisk: DailyStatus.RED },
          ],
        },
        {
          id: 'rec-2',
          employeeUserId: 'emp-2',
          workDate: new Date('2026-09-17'),
          initialStatus: DailyStatus.GREEN,
          employee: { id: 'emp-2', fullName: 'Bob' },
          commitments: [
            { id: 'c-2', text: 'Bug fixing', initialRisk: DailyStatus.GREEN },
          ],
        },
      ]);

      // No approved exceptions
      mockPrisma.exception.findMany.mockResolvedValue([]);

      // 1 critical blocker
      mockPrisma.blocker.findMany.mockResolvedValue([
        {
          id: 'b-1',
          raisedByUserId: 'emp-1',
          ownerNeededUserId: 'emp-2',
          type: 'Technical',
          severity: BlockerSeverity.Critical,
          impact: 'Database down',
          status: BlockerStatus.Open,
          raisedAt: new Date(),
          acknowledgedAt: null,
          raisedBy: { id: 'emp-1', fullName: 'Alice' },
          ownerNeeded: { id: 'emp-2', fullName: 'Bob' },
        },
      ]);

      const result = await service.getExceptionSummary(mockHeadUser, '2026-09-17');

      expect(result.date).toBe('2026-09-17');
      expect(result.metrics.totalExpectedEmployees).toBe(3);
      expect(result.metrics.submittedCount).toBe(2);
      expect(result.metrics.noSubmissionCount).toBe(1); // Charlie has no submission
      expect(result.metrics.redCount).toBe(1); // Alice is RED
      expect(result.metrics.greenCount).toBe(1); // Bob is GREEN
      expect(result.metrics.criticalBlockerCount).toBe(1);

      // Exceptions list must contain Charlie (No submission), Alice (RED), and Critical Blocker
      const noSub = result.exceptions.find((e) => e.type === 'NO_SUBMISSION');
      expect(noSub).toBeDefined();
      expect(noSub?.userName).toBe('Charlie');

      const redEx = result.exceptions.find((e) => e.type === 'RISK_RED');
      expect(redEx).toBeDefined();
      expect(redEx?.userName).toBe('Alice');

      const critEx = result.exceptions.find((e) => e.type === 'CRITICAL_BLOCKER');
      expect(critEx).toBeDefined();
      expect(critEx?.title).toContain('Critical Blocker');
    });

    it('tidak menandai pegawai dengan cuti yang disetujui sebagai No Submission (AC-09, AC-19)', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(['emp-1']);

      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1', function: 'Engineering', user: { id: 'emp-1', fullName: 'Alice' } },
      ]);

      // Belum ada submission
      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);

      // Memiliki Cuti/Leave yang disetujui (Approved)
      mockPrisma.exception.findMany.mockResolvedValue([
        { employeeUserId: 'emp-1' },
      ]);

      mockPrisma.blocker.findMany.mockResolvedValue([]);

      const result = await service.getExceptionSummary(mockHeadUser, '2026-09-17');

      expect(result.metrics.totalExpectedEmployees).toBe(1);
      expect(result.metrics.submittedCount).toBe(0);
      expect(result.metrics.noSubmissionCount).toBe(0); // Dikecualikan karena cuti disetujui!
      expect(result.exceptions.some((e) => e.type === 'NO_SUBMISSION')).toBe(false);
    });
  });

  // ===========================================================================
  // EPIC-16-T2: 5 Report Implementations
  // ===========================================================================
  describe('getWeeklyTeamSummary (EPIC-16-T2, SAD §10.11, FR-41)', () => {
    it('harus mengagregasi distribusi outcome, continuation, dan recurring blocker tanpa leaderboard individual', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(['emp-1', 'emp-2']);

      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          employeeUserId: 'emp-1',
          commitments: [
            {
              id: 'c-1',
              outcome: CommitmentOutcome.Completed,
              continuation: 'None',
            },
            {
              id: 'c-2',
              outcome: CommitmentOutcome.PartiallyCompleted,
              continuation: 'Continue',
            },
          ],
          additionalWorks: [],
        },
      ]);

      mockPrisma.blocker.findMany.mockResolvedValue([
        {
          id: 'b-1',
          type: 'Technical',
          status: BlockerStatus.Resolved,
          supportContributions: [{ id: 'sc-1' }],
        },
        {
          id: 'b-2',
          type: 'Technical',
          status: BlockerStatus.Open,
          supportContributions: [],
        },
      ]);

      mockPrisma.complianceEvent.findMany.mockResolvedValue([
        { eventType: ComplianceEventType.NoSubmission },
      ]);

      const result = await service.getWeeklyTeamSummary(mockHeadUser, {
        weekStart: '2026-09-14',
      });

      expect(result.period.weekStart).toBe('2026-09-14');
      expect(result.summary.totalCommitments).toBe(2);
      expect(result.summary.totalBlockers).toBe(2);
      expect(result.summary.resolvedBlockers).toBe(1);
      expect(result.outcomeDistribution.Completed).toBe(1);
      expect(result.outcomeDistribution.PartiallyCompleted).toBe(1);
      expect(result.continuationDistribution.Continue).toBe(1);
      expect(result.recurringBlockers[0]).toEqual({ category: 'Technical', count: 2 });

      // Verifikasi konstraint PRD §9 & AC-16: tidak ada leaderboard/ranking individual
      expect((result as any).leaderboard).toBeUndefined();
      expect((result as any).rankings).toBeUndefined();
    });
  });

  describe('getMonthlyTrend (EPIC-16-T2, SAD §10.11, FR-41)', () => {
    it('harus mengagregasikan tren per fungsi, root cause, escalation aging, dan compliance pattern', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(null); // CEO company-wide

      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([
        { userId: 'emp-1', function: 'Engineering' },
        { userId: 'emp-2', function: 'Design' },
      ]);

      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
        { id: 'r-1', employeeUserId: 'emp-1', initialStatus: DailyStatus.RED },
        { id: 'r-2', employeeUserId: 'emp-2', initialStatus: DailyStatus.GREEN },
      ]);

      mockPrisma.blocker.findMany.mockResolvedValue([
        {
          id: 'b-1',
          type: 'ThirdParty',
          raisedAt: new Date('2026-09-01T08:00:00Z'),
          resolvedAt: new Date('2026-09-01T10:00:00Z'), // 2 hours (< 4h)
        },
        {
          id: 'b-2',
          type: 'ThirdParty',
          raisedAt: new Date('2026-09-02T08:00:00Z'),
          resolvedAt: null, // unresolved
        },
      ]);

      mockPrisma.complianceEvent.findMany.mockResolvedValue([
        { eventType: ComplianceEventType.RecordedWarning, followUpStatus: 'RecordedWarning' },
      ]);

      const result = await service.getMonthlyTrend(mockHeadUser, {
        month: '2026-09',
      });

      expect(result.month).toBe('2026-09');
      expect(result.summary.totalRecords).toBe(2);
      expect(result.summary.totalBlockers).toBe(2);
      expect(result.functionalTrends).toHaveLength(2);
      expect(result.rootCauseDistribution.ThirdParty).toBe(2);
      expect(result.escalationAging.under4Hours).toBe(1);
      expect(result.escalationAging.unresolved).toBe(1);
      expect(result.compliancePatterns.RecordedWarning).toBe(1);
    });
  });

  describe('getIndividualEvidence (EPIC-16-T2, SAD §13.6, PRD §9)', () => {
    it('harus mengembalikan data dossier individu dan mematuhi visibilitas BR-14', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(['emp-1']);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'emp-1',
        fullName: 'Alice Worker',
        email: 'alice@dutamedia.com',
        organizationalAssignments: [{ role: Role.Employee, function: 'Engineering' }],
      });

      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([
        {
          id: 'r-1',
          workDate: new Date('2026-09-15'),
          initialStatus: DailyStatus.GREEN,
          finalStatus: DailyStatus.GREEN,
          commitments: [],
          additionalWorks: [],
        },
      ]);

      mockPrisma.managerNote.findMany.mockResolvedValue([
        {
          id: 'n-1',
          note: 'Coaching session notes',
          visibility: ManagerNoteVisibility.VisibleToEmployee,
          createdBy: { fullName: 'Budi Santoso' },
        },
      ]);

      mockPrisma.complianceEvent.findMany.mockResolvedValue([]);
      mockPrisma.blocker.findMany.mockResolvedValue([]);

      const result = await service.getIndividualEvidence(mockHeadUser, 'emp-1', {
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });

      expect(result.user.id).toBe('emp-1');
      expect(result.user.fullName).toBe('Alice Worker');
      expect(result.records).toHaveLength(1);
      expect(result.managerNotes).toHaveLength(1);
    });

    it('harus melempar ForbiddenException jika user mencoba melihat data pegawai di luar scope', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(['emp-1']); // hanya emp-1

      await expect(
        service.getIndividualEvidence(mockHeadUser, 'emp-2', {
          startDate: '2026-09-01',
          endDate: '2026-09-30',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus melempar NotFoundException jika target user tidak ditemukan di database', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(['emp-unknown']);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getIndividualEvidence(mockHeadUser, 'emp-unknown', {
          startDate: '2026-09-01',
          endDate: '2026-09-30',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBlockerRootCauseReport (EPIC-16-T2, SAD §10.11)', () => {
    it('harus mengembalikan ringkasan root cause, severity, dan rata-rata waktu penyelesaian', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(null);

      mockPrisma.blocker.findMany.mockResolvedValue([
        {
          id: 'b-1',
          type: 'ExternalVendor',
          severity: BlockerSeverity.High,
          impact: 'API down',
          status: BlockerStatus.Resolved,
          raisedAt: new Date('2026-09-01T08:00:00Z'),
          resolvedAt: new Date('2026-09-01T14:00:00Z'), // 6 hours
          raisedBy: { fullName: 'Alice' },
          ownerNeeded: { fullName: 'Bob' },
        },
      ]);

      const result = await service.getBlockerRootCauseReport(mockHeadUser, {
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });

      expect(result.metrics.totalBlockers).toBe(1);
      expect(result.metrics.resolvedCount).toBe(1);
      expect(result.metrics.averageResolutionHours).toBe(6);
      expect(result.categoryBreakdown.ExternalVendor).toBe(1);
      expect(result.bottlenecks[0].category).toBe('ExternalVendor');
    });
  });

  // ===========================================================================
  // EPIC-16-T3: exportReport
  // ===========================================================================
  describe('exportReport (EPIC-16-T3, SAD §13.5, §10.11)', () => {
    it('harus menolak role Employee yang mencoba melakukan export laporan manajerial', async () => {
      await expect(
        service.exportReport(mockEmployeeUser, 'daily-exception', {
          format: 'pdf',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('harus memproses export daily-exception dan mendelegasikannya ke ExportGeneratorService', async () => {
      mockScopeFilterService.getAccessibleUserIds.mockResolvedValue(['emp-1']);
      mockPrisma.organizationalAssignment.findMany.mockResolvedValue([]);
      mockPrisma.dailyAccountabilityRecord.findMany.mockResolvedValue([]);
      mockPrisma.exception.findMany.mockResolvedValue([]);
      mockPrisma.blocker.findMany.mockResolvedValue([]);

      mockExportGeneratorService.generateAndUploadExport.mockResolvedValue({
        downloadUrl: 'https://storage.dutamedia.com/signed-url',
        expiresIn: 900,
        filename: 'WorkPulse_daily-exception.pdf',
        format: 'pdf',
        storagePath: 'exports/daily-exception/123.pdf',
      });

      const result = await service.exportReport(mockHeadUser, 'daily-exception', {
        format: 'pdf',
        date: '2026-09-17',
      });

      expect(result.downloadUrl).toBe('https://storage.dutamedia.com/signed-url');
      expect(mockExportGeneratorService.generateAndUploadExport).toHaveBeenCalledWith(
        mockHeadUser,
        'daily-exception',
        'pdf',
        expect.objectContaining({
          reportType: 'daily-exception',
          title: expect.stringContaining('Daily Exception Report'),
        }),
      );
    });

    it('harus melempar ValidationException jika reportType tidak dikenal', async () => {
      await expect(
        service.exportReport(mockHeadUser, 'unknown-report-type', {
          format: 'pdf',
        }),
      ).rejects.toThrow(ValidationException);
    });
  });
});
