import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import pg from 'pg';
import {
  PrismaClient,
  Role,
  UserStatus,
  DailyStatus,
  SubmissionTiming,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { DailyAccountabilityService } from '../../src/modules/daily-accountability/services/daily-accountability.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { PolicyService } from '../../src/modules/policy/policy.service.js';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { StatusSuggestionService } from '../../src/modules/daily-accountability/services/status-suggestion.service.js';
import { NotificationService } from '../../src/modules/notification/notification.service.js';
import { ConcurrencyBarrier } from '../harness/concurrency-harness.js';
import { BusinessRuleViolationException, ConflictException } from '../../src/modules/shared/exceptions/api.exception.js';

interface RequestMetric {
  userId: string;
  email: string;
  startHrTime: [number, number];
  endHrTime: [number, number];
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  statusCode: number;
  success: boolean;
  businessOutcome: string;
  errorMessage?: string;
  recordId?: string;
}

interface ProfileSummary {
  profileName: string;
  totalUsers: number;
  totalRequests: number;
  successCount: number;
  expected4xx: number;
  unexpected4xx: number;
  status5xx: number;
  timeouts: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  wallClockDurationMs: number;
  throughputRps: number;
  dbIntegrityPass: boolean;
  maxActivePgConnections: number;
  metrics: RequestMetric[];
}

function calculatePercentiles(durations: number[]) {
  if (durations.length === 0) {
    return { minMs: 0, maxMs: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0 };
  }
  const sorted = [...durations].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  };

  return {
    minMs: Number(sorted[0].toFixed(2)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(2)),
    avgMs: Number((sum / sorted.length).toFixed(2)),
    p50Ms: Number(getPercentile(50).toFixed(2)),
    p95Ms: Number(getPercentile(95).toFixed(2)),
    p99Ms: Number(getPercentile(99).toFixed(2)),
  };
}

describe('S3-T1 Phase 2B-2: Realistic Morning Check-in Write-Load & Concurrency Benchmark', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let dailyService: DailyAccountabilityService;
  let auditService: AuditService;
  let policyService: PolicyService;
  let scopeFilterService: ScopeFilterService;
  let statusSuggestionService: StatusSuggestionService;
  let notificationService: NotificationService;

  // 60 Deterministic Synthetic User Fixtures
  const syntheticUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    managerId: string;
  }> = [];

  for (let i = 1; i <= 60; i++) {
    const hex = i.toString().padStart(4, '0');
    syntheticUsers.push({
      id: `00000000-0000-4000-a100-00000000${hex}`,
      email: `synth.load.worker.${i}@dutamedia.test`,
      fullName: `Synthetic Load Worker ${i}`,
      managerId: '00000000-0000-4000-a000-000000000002', // Bob Supervisor
    });
  }

  beforeAll(async () => {
    expect(databaseUrl).toContain('workpulse_test');
    expect(databaseUrl).not.toContain('supabase');

    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');
    const adapter = new PrismaPg({ connectionString: cleanUrl, ssl: false });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    auditService = new AuditService(prisma as any);
    policyService = new PolicyService(prisma as any, auditService);
    scopeFilterService = new ScopeFilterService(prisma as any);
    notificationService = new NotificationService(
      prisma as any,
      { sendEmail: async () => ({ success: true }) } as any,
      { sendPushNotification: async () => ({ success: true }) } as any
    );
    statusSuggestionService = new StatusSuggestionService(prisma as any);

    dailyService = new DailyAccountabilityService(
      prisma as any,
      auditService,
      policyService,
      scopeFilterService,
      statusSuggestionService,
      notificationService
    );

    // Seed the 60 synthetic users and active organizational assignments in isolated PostgreSQL
    const passwordHash = await argon2.hash('TestPassword123!');
    const effectiveDate = new Date('2026-01-01T00:00:00Z');

    for (const u of syntheticUsers) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          fullName: u.fullName,
          status: UserStatus.Active,
        },
        create: {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          passwordHash,
          status: UserStatus.Active,
          mustResetPassword: false,
        },
      });

      const existingAssignment = await prisma.organizationalAssignment.findFirst({
        where: { userId: u.id, endDate: null },
      });

      if (!existingAssignment) {
        await prisma.organizationalAssignment.create({
          data: {
            userId: u.id,
            role: Role.Employee,
            function: 'Engineering',
            directManagerId: u.managerId,
            effectiveDate,
            endDate: null,
            createdByUserId: '00000000-0000-4000-a000-000000000006', // SystemAdmin
          },
        });
      }
    }
  }, 90000);

  afterAll(async () => {
    // Clean up created synthetic users and records
    if (prisma) {
      const synthIds = syntheticUsers.map((u) => u.id);
      await prisma.commitment.deleteMany({
        where: { dailyRecord: { employeeUserId: { in: synthIds } } },
      });
      await prisma.auditLog.deleteMany({
        where: { actorUserId: { in: synthIds } },
      });
      await prisma.notification.deleteMany({
        where: { recipientUserId: { in: synthIds } },
      });
      await prisma.dailyAccountabilityRecord.deleteMany({
        where: { employeeUserId: { in: synthIds } },
      });
      await prisma.organizationalAssignment.deleteMany({
        where: { userId: { in: synthIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: synthIds } },
      });
      await prisma.$disconnect();
    }
    if (pgClient) await pgClient.end();
  });

  /**
   * Helper to clean daily records for synthetic users for a specific date
   */
  async function cleanRecordsForUsers(users: typeof syntheticUsers, workDate: Date) {
    const userIds = users.map((u) => u.id);
    const dateStart = new Date(workDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(workDate);
    dateEnd.setHours(23, 59, 59, 999);

    const records = await prisma.dailyAccountabilityRecord.findMany({
      where: {
        employeeUserId: { in: userIds },
        workDate: { gte: dateStart, lte: dateEnd },
      },
      select: { id: true },
    });
    const recordIds = records.map((r) => r.id);

    if (recordIds.length > 0) {
      await prisma.commitment.deleteMany({
        where: { dailyRecordId: { in: recordIds } },
      });
      await prisma.auditLog.deleteMany({
        where: {
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: { in: recordIds },
        },
      });
      await prisma.notification.deleteMany({
        where: {
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: { in: recordIds },
        },
      });
      await prisma.dailyAccountabilityRecord.deleteMany({
        where: { id: { in: recordIds } },
      });
    }
  }

  /**
   * Helper to execute true concurrent load profile with barrier synchronization
   */
  async function executeProfile(
    profileName: string,
    usersToRun: typeof syntheticUsers,
    payloadGenerator: (idx: number) => any
  ): Promise<ProfileSummary> {
    const N = usersToRun.length;
    const barrier = new ConcurrencyBarrier(N, 30000);
    const metrics: RequestMetric[] = [];

    // Observe active connections before/during run
    let peakConnections = 0;
    const monitorInterval = setInterval(async () => {
      try {
        const res = await pgClient.query('SELECT count(*)::int as active FROM pg_stat_activity WHERE state = \'active\'');
        const active = res.rows[0]?.active || 0;
        if (active > peakConnections) peakConnections = active;
      } catch {}
    }, 20);

    const overallStartHr = process.hrtime();
    const overallStartMs = Date.now();

    const workerPromises = usersToRun.map(async (user, idx) => {
      const payload = payloadGenerator(idx + 1);

      // 1. All N workers synchronize on barrier before firing
      await barrier.wait(`worker-${idx + 1}`);

      const startHr = process.hrtime();
      const startTimeMs = Date.now();
      try {
        const result = await dailyService.submitMorningCheckin(user.id, payload);
        const diffHr = process.hrtime(startHr);
        const durationMs = Number(((diffHr[0] * 1e9 + diffHr[1]) / 1e6).toFixed(2));
        const endTimeMs = startTimeMs + durationMs;

        metrics.push({
          userId: user.id,
          email: user.email,
          startHrTime: startHr,
          endHrTime: diffHr,
          startTimeMs,
          endTimeMs,
          durationMs,
          statusCode: 201,
          success: true,
          businessOutcome: 'SUCCESS_201_CREATED',
          recordId: result.id,
        });
      } catch (err: any) {
        const diffHr = process.hrtime(startHr);
        const durationMs = Number(((diffHr[0] * 1e9 + diffHr[1]) / 1e6).toFixed(2));
        const endTimeMs = startTimeMs + durationMs;

        let statusCode = 500;
        let businessOutcome = 'UNEXPECTED_500';

        if (err instanceof BusinessRuleViolationException) {
          statusCode = 400;
          businessOutcome = 'EXPECTED_400_BUSINESS_RULE';
        } else if (err instanceof ConflictException) {
          statusCode = 409;
          businessOutcome = 'EXPECTED_409_CONFLICT';
        }

        metrics.push({
          userId: user.id,
          email: user.email,
          startHrTime: startHr,
          endHrTime: diffHr,
          startTimeMs,
          endTimeMs,
          durationMs,
          statusCode,
          success: false,
          businessOutcome,
          errorMessage: err.message,
        });
      }
    });

    await Promise.all(workerPromises);
    clearInterval(monitorInterval);

    const overallDiffHr = process.hrtime(overallStartHr);
    const wallClockDurationMs = Number(((overallDiffHr[0] * 1e9 + overallDiffHr[1]) / 1e6).toFixed(2));

    const durations = metrics.map((m) => m.durationMs);
    const percentiles = calculatePercentiles(durations);

    const successCount = metrics.filter((m) => m.success).length;
    const expected4xx = metrics.filter((m) => m.statusCode >= 400 && m.statusCode < 500 && m.businessOutcome.startsWith('EXPECTED')).length;
    const unexpected4xx = metrics.filter((m) => m.statusCode >= 400 && m.statusCode < 500 && !m.businessOutcome.startsWith('EXPECTED')).length;
    const status5xx = metrics.filter((m) => m.statusCode >= 500).length;
    const timeouts = metrics.filter((m) => m.errorMessage?.toLowerCase().includes('timeout')).length;

    // Direct Database Integrity Verification
    const userIds = usersToRun.map((u) => u.id);
    const successfulUserIds = metrics.filter((m) => m.success).map((m) => m.userId);

    // 1. Daily records count match
    const recordsInDb = await prisma.dailyAccountabilityRecord.findMany({
      where: { employeeUserId: { in: userIds } },
      include: { commitments: true },
    });

    const dbIntegrityPass =
      recordsInDb.length === successCount &&
      recordsInDb.every((r) => r.commitments.length >= 1 && r.commitments.length <= 10) &&
      status5xx === 0 &&
      unexpected4xx === 0;

    return {
      profileName,
      totalUsers: N,
      totalRequests: metrics.length,
      successCount,
      expected4xx,
      unexpected4xx,
      status5xx,
      timeouts,
      minMs: percentiles.minMs,
      maxMs: percentiles.maxMs,
      avgMs: percentiles.avgMs,
      p50Ms: percentiles.p50Ms,
      p95Ms: percentiles.p95Ms,
      p99Ms: percentiles.p99Ms,
      wallClockDurationMs,
      throughputRps: Number(((metrics.length / (wallClockDurationMs / 1000))).toFixed(2)),
      dbIntegrityPass,
      maxActivePgConnections: peakConnections,
      metrics,
    };
  }

  // =========================================================================
  // PROFILE A — 30 USERS (Baseline Realistic Concurrency)
  // =========================================================================
  it('PROFILE A: 30 Concurrent Users — Morning Check-in under OnTime Window (08:30 WIB)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-12T08:30:00+07:00')); // OnTime window
    const targetUsers = syntheticUsers.slice(0, 30);
    const testDate = new Date('2026-10-12T08:30:00+07:00'); // Clean Monday morning

    await cleanRecordsForUsers(targetUsers, testDate);

    // Execute with realistic payload (2-3 commitments, some AMBER with proper blocker note)
    const summary = await executeProfile('PROFILE_A_30_USERS', targetUsers, (workerIdx) => {
      const isAmber = workerIdx % 6 === 0;
      return {
        commitments: [
          {
            sequenceNo: 1,
            text: `Core sprint objective task for worker ${workerIdx}`,
            initialRisk: DailyStatus.GREEN,
          },
          {
            sequenceNo: 2,
            text: `Cross-team alignment and test automation for worker ${workerIdx}`,
            initialRisk: isAmber ? DailyStatus.AMBER : DailyStatus.GREEN,
            knownBlockerNote: isAmber ? 'Waiting on QA staging environment provision' : undefined,
            supportNeeded: isAmber ? 'Need DevOps assistance for staging certificate' : undefined,
          },
        ],
      };
    });

    console.log('\n--- PROFILE A RESULT SUMMARY ---');
    console.log(JSON.stringify({
      profile: summary.profileName,
      users: summary.totalUsers,
      requests: summary.totalRequests,
      success: summary.successCount,
      expected4xx: summary.expected4xx,
      unexpected4xx: summary.unexpected4xx,
      status5xx: summary.status5xx,
      timeouts: summary.timeouts,
      minMs: summary.minMs,
      maxMs: summary.maxMs,
      avgMs: summary.avgMs,
      p50Ms: summary.p50Ms,
      p95Ms: summary.p95Ms,
      p99Ms: summary.p99Ms,
      wallClockDurationMs: summary.wallClockDurationMs,
      throughputRps: summary.throughputRps,
      dbIntegrityPass: summary.dbIntegrityPass,
      peakPgConn: summary.maxActivePgConnections,
    }, null, 2));

    expect(summary.totalRequests).toBe(30);
    expect(summary.successCount).toBe(30);
    expect(summary.status5xx).toBe(0);
    expect(summary.unexpected4xx).toBe(0);
    expect(summary.timeouts).toBe(0);
    expect(summary.dbIntegrityPass).toBe(true);

    // PRD NFR-03 check: response time < 2000 ms
    expect(summary.p95Ms).toBeLessThan(2000);

    // Verify AuditLog count for 30 submissions = exactly 30 DAILY_RECORD_MORNING_SUBMITTED
    const auditCount = await prisma.auditLog.count({
      where: {
        actorUserId: { in: targetUsers.map((u) => u.id) },
        action: 'DAILY_RECORD_MORNING_SUBMITTED',
      },
    });
    expect(auditCount).toBe(30);

    // Verify DEF-01 Pending Uniqueness remains 0 duplicates
    const rawDef01 = await pgClient.query(`
      SELECT "targetCommitmentId", count(*) 
      FROM correction_requests 
      WHERE status = 'Pending' 
      GROUP BY "targetCommitmentId" 
      HAVING count(*) > 1;
    `);
    expect(rawDef01.rows.length).toBe(0);
  }, 45000);

  // =========================================================================
  // PROFILE B — 60 USERS (Upper-Bound Concurrency Primary Gate)
  // =========================================================================
  it('PROFILE B: 60 Concurrent Users — Morning Check-in under OnTime Window (08:45 WIB)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-13T08:45:00+07:00'));
    const targetUsers = syntheticUsers.slice(0, 60);
    const testDate = new Date('2026-10-13T08:45:00+07:00'); // Clean Tuesday morning

    await cleanRecordsForUsers(targetUsers, testDate);

    const summary = await executeProfile('PROFILE_B_60_USERS', targetUsers, (workerIdx) => {
      const isAmber = workerIdx % 5 === 0;
      return {
        commitments: [
          {
            sequenceNo: 1,
            text: `High-priority feature delivery commitment worker ${workerIdx}`,
            initialRisk: DailyStatus.GREEN,
          },
          {
            sequenceNo: 2,
            text: `Peer review and production readiness worker ${workerIdx}`,
            initialRisk: isAmber ? DailyStatus.AMBER : DailyStatus.GREEN,
            knownBlockerNote: isAmber ? 'Waiting on third-party API approval' : undefined,
            supportNeeded: isAmber ? 'Lead engineer sign-off required' : undefined,
          },
        ],
      };
    });

    console.log('\n--- PROFILE B RESULT SUMMARY ---');
    console.log(JSON.stringify({
      profile: summary.profileName,
      users: summary.totalUsers,
      requests: summary.totalRequests,
      success: summary.successCount,
      expected4xx: summary.expected4xx,
      unexpected4xx: summary.unexpected4xx,
      status5xx: summary.status5xx,
      timeouts: summary.timeouts,
      minMs: summary.minMs,
      maxMs: summary.maxMs,
      avgMs: summary.avgMs,
      p50Ms: summary.p50Ms,
      p95Ms: summary.p95Ms,
      p99Ms: summary.p99Ms,
      wallClockDurationMs: summary.wallClockDurationMs,
      throughputRps: summary.throughputRps,
      dbIntegrityPass: summary.dbIntegrityPass,
      peakPgConn: summary.maxActivePgConnections,
    }, null, 2));

    expect(summary.totalRequests).toBe(60);
    expect(summary.successCount).toBe(60);
    expect(summary.status5xx).toBe(0);
    expect(summary.unexpected4xx).toBe(0);
    expect(summary.timeouts).toBe(0);
    expect(summary.dbIntegrityPass).toBe(true);

    // PRD NFR-03 check: response time < 2000 ms
    expect(summary.p95Ms).toBeLessThan(2000);

    // Verify AuditLog count for 60 submissions = exactly 60
    const auditCount = await prisma.auditLog.count({
      where: {
        actorUserId: { in: targetUsers.map((u) => u.id) },
        action: 'DAILY_RECORD_MORNING_SUBMITTED',
      },
    });
    expect(auditCount).toBe(60);

    // Verify DEF-01 Invariant
    const rawDef01 = await pgClient.query(`
      SELECT "targetCommitmentId", count(*) 
      FROM correction_requests 
      WHERE status = 'Pending' 
      GROUP BY "targetCommitmentId" 
      HAVING count(*) > 1;
    `);
    expect(rawDef01.rows.length).toBe(0);
  }, 60000);

  // =========================================================================
  // PROFILE C — CUTOFF BURST (60 Concurrent Users Near Cutoff 09:29 WIB)
  // Deadline 09:00, Grace 30 min -> Cutoff 09:30. At 09:29:50 it is 10s before lock.
  // =========================================================================
  it('PROFILE C: Cutoff Burst — 60 Concurrent Users submitting within 10 seconds before Cutoff (09:29:50 WIB)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-14T09:29:50+07:00')); // 10 seconds before 09:30 cutoff
    const targetUsers = syntheticUsers.slice(0, 60);
    const testDate = new Date('2026-10-14T09:29:50+07:00');

    await cleanRecordsForUsers(targetUsers, testDate);

    const summary = await executeProfile('PROFILE_C_CUTOFF_BURST', targetUsers, (workerIdx) => {
      const isAmber = workerIdx % 4 === 0;
      return {
        commitments: [
          {
            sequenceNo: 1,
            text: `Cutoff-burst commitment #1 worker ${workerIdx}`,
            initialRisk: DailyStatus.GREEN,
          },
          {
            sequenceNo: 2,
            text: `Cutoff-burst commitment #2 worker ${workerIdx}`,
            initialRisk: isAmber ? DailyStatus.AMBER : DailyStatus.GREEN,
            knownBlockerNote: isAmber ? 'Dependency on external vendor gateway release' : undefined,
            supportNeeded: isAmber ? 'Escalation to vendor account manager' : undefined,
          },
        ],
      };
    });

    console.log('\n--- PROFILE C RESULT SUMMARY ---');
    console.log(JSON.stringify({
      profile: summary.profileName,
      users: summary.totalUsers,
      requests: summary.totalRequests,
      success: summary.successCount,
      expected4xx: summary.expected4xx,
      unexpected4xx: summary.unexpected4xx,
      status5xx: summary.status5xx,
      timeouts: summary.timeouts,
      minMs: summary.minMs,
      maxMs: summary.maxMs,
      avgMs: summary.avgMs,
      p50Ms: summary.p50Ms,
      p95Ms: summary.p95Ms,
      p99Ms: summary.p99Ms,
      wallClockDurationMs: summary.wallClockDurationMs,
      throughputRps: summary.throughputRps,
      dbIntegrityPass: summary.dbIntegrityPass,
      peakPgConn: summary.maxActivePgConnections,
    }, null, 2));

    expect(summary.totalRequests).toBe(60);
    expect(summary.successCount).toBe(60);
    expect(summary.status5xx).toBe(0);
    expect(summary.unexpected4xx).toBe(0);
    expect(summary.timeouts).toBe(0);
    expect(summary.dbIntegrityPass).toBe(true);

    // Verify all 60 records received Late timing because submitted between 09:00 and 09:30
    const records = await prisma.dailyAccountabilityRecord.findMany({
      where: { employeeUserId: { in: targetUsers.map((u) => u.id) } },
      select: { morningTiming: true },
    });
    expect(records.every((r) => r.morningTiming === SubmissionTiming.Late)).toBe(true);

    // PRD NFR-03 check: response time < 2000 ms
    expect(summary.p95Ms).toBeLessThan(2000);

    // Verify DEF-01 Invariant
    const rawDef01 = await pgClient.query(`
      SELECT "targetCommitmentId", count(*) 
      FROM correction_requests 
      WHERE status = 'Pending' 
      GROUP BY "targetCommitmentId" 
      HAVING count(*) > 1;
    `);
    expect(rawDef01.rows.length).toBe(0);
  }, 60000);

  // =========================================================================
  // PROFILE REPEATABILITY — 60 USERS SECOND RUN
  // =========================================================================
  it('PROFILE REPEATABILITY: 60 Concurrent Users Run 2 — Proves Determinism vs Lucky Pass', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-15T08:50:00+07:00'));
    const targetUsers = syntheticUsers.slice(0, 60);
    const testDate = new Date('2026-10-15T08:50:00+07:00'); // Clean Thursday morning

    await cleanRecordsForUsers(targetUsers, testDate);

    const summary = await executeProfile('PROFILE_B_REPEAT_60_USERS', targetUsers, (workerIdx) => {
      const isAmber = workerIdx % 7 === 0;
      return {
        commitments: [
          {
            sequenceNo: 1,
            text: `Repeatability run commitment #1 worker ${workerIdx}`,
            initialRisk: DailyStatus.GREEN,
          },
          {
            sequenceNo: 2,
            text: `Repeatability run commitment #2 worker ${workerIdx}`,
            initialRisk: isAmber ? DailyStatus.AMBER : DailyStatus.GREEN,
            knownBlockerNote: isAmber ? 'Waiting on internal database migration' : undefined,
            supportNeeded: isAmber ? 'DBA assist required' : undefined,
          },
        ],
      };
    });

    console.log('\n--- PROFILE REPEATABILITY RESULT SUMMARY ---');
    console.log(JSON.stringify({
      profile: summary.profileName,
      users: summary.totalUsers,
      requests: summary.totalRequests,
      success: summary.successCount,
      expected4xx: summary.expected4xx,
      unexpected4xx: summary.unexpected4xx,
      status5xx: summary.status5xx,
      timeouts: summary.timeouts,
      minMs: summary.minMs,
      maxMs: summary.maxMs,
      avgMs: summary.avgMs,
      p50Ms: summary.p50Ms,
      p95Ms: summary.p95Ms,
      p99Ms: summary.p99Ms,
      wallClockDurationMs: summary.wallClockDurationMs,
      throughputRps: summary.throughputRps,
      dbIntegrityPass: summary.dbIntegrityPass,
      peakPgConn: summary.maxActivePgConnections,
    }, null, 2));

    expect(summary.totalRequests).toBe(60);
    expect(summary.successCount).toBe(60);
    expect(summary.status5xx).toBe(0);
    expect(summary.unexpected4xx).toBe(0);
    expect(summary.timeouts).toBe(0);
    expect(summary.dbIntegrityPass).toBe(true);
    expect(summary.p95Ms).toBeLessThan(2000);

    // Verify DEF-01 Invariant
    const rawDef01 = await pgClient.query(`
      SELECT "targetCommitmentId", count(*) 
      FROM correction_requests 
      WHERE status = 'Pending' 
      GROUP BY "targetCommitmentId" 
      HAVING count(*) > 1;
    `);
    expect(rawDef01.rows.length).toBe(0);
  }, 60000);

  // =========================================================================
  // POST-LOAD COMPREHENSIVE DATABASE INTEGRITY GATES
  // =========================================================================
  it('DATABASE INTEGRITY GATES: Comprehensive Verification of Invariants across Engine', async () => {
    // 1. DEF-01 Invariant
    const def01Res = await pgClient.query(`
      SELECT "targetCommitmentId", count(*) 
      FROM correction_requests 
      WHERE status = 'Pending' 
      GROUP BY "targetCommitmentId" 
      HAVING count(*) > 1;
    `);
    expect(def01Res.rows.length).toBe(0);

    // 2. Orphan commitments check
    const orphanCommitments = await pgClient.query(`
      SELECT count(*)::int as cnt 
      FROM commitments c 
      LEFT JOIN daily_accountability_records r ON c."dailyRecordId" = r.id 
      WHERE r.id IS NULL;
    `);
    expect(orphanCommitments.rows[0].cnt).toBe(0);

    // 3. Null required columns check in daily_accountability_records
    const nullRecords = await pgClient.query(`
      SELECT count(*)::int as cnt 
      FROM daily_accountability_records 
      WHERE "employeeUserId" IS NULL OR "workDate" IS NULL OR "initialStatus" IS NULL;
    `);
    expect(nullRecords.rows[0].cnt).toBe(0);

    // 4. Null required columns check in commitments
    const nullCommitments = await pgClient.query(`
      SELECT count(*)::int as cnt 
      FROM commitments 
      WHERE text IS NULL OR "initialRisk" IS NULL OR "sequenceNo" IS NULL;
    `);
    expect(nullCommitments.rows[0].cnt).toBe(0);

    // 5. Foreign key validity for employeeUserId
    const invalidUsers = await pgClient.query(`
      SELECT count(*)::int as cnt 
      FROM daily_accountability_records r 
      LEFT JOIN users u ON r."employeeUserId" = u.id 
      WHERE u.id IS NULL;
    `);
    expect(invalidUsers.rows[0].cnt).toBe(0);

    // 6. Zero deadlocks reported by engine
    const deadlocksRes = await pgClient.query<{ deadlocks: number }>(`
      SELECT deadlocks::int as deadlocks FROM pg_stat_database WHERE datname = 'workpulse_test';
    `);
    expect(Number(deadlocksRes.rows[0].deadlocks)).toBe(0);

    // 7. AuditLog atomicity & completeness check: 
    // Every DailyAccountabilityRecord for synthetic users has exactly 1 matching DAILY_RECORD_MORNING_SUBMITTED audit log
    const synthUserIds = syntheticUsers.map((u) => u.id);
    const auditRecordMismatch = await pgClient.query(`
      SELECT r.id, r."employeeUserId", r."workDate", count(a.id)::int as audit_count
      FROM daily_accountability_records r
      LEFT JOIN audit_logs a ON a."relatedEntityId" = r.id AND a.action = 'DAILY_RECORD_MORNING_SUBMITTED'
      WHERE r."employeeUserId" = ANY($1::uuid[])
      GROUP BY r.id, r."employeeUserId", r."workDate"
      HAVING count(a.id) != 1;
    `, [synthUserIds]);

    if (auditRecordMismatch.rows.length > 0) {
      console.log('MISMATCH ROWS:', auditRecordMismatch.rows);
    }
    expect(auditRecordMismatch.rows.length).toBe(0);

    console.log('\n--- COMPREHENSIVE POST-LOAD DATABASE INTEGRITY GATES: ALL PASSED ---');
    console.log('DEF-01 Duplicate Pending Violations: 0');
    console.log('Orphan Commitments: 0');
    console.log('Null Invariants: 0');
    console.log('Invalid Foreign Keys: 0');
    console.log('Engine Deadlocks: 0');
    console.log('AuditLog 1:1 Correlation: VERIFIED');
  });
});
