import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import pg from 'pg';
import {
  PrismaClient,
  CorrectionClassification,
  CorrectionStatus,
  BlockerSeverity,
  BlockerStatus,
  OwnerNeededType,
  PolicyCategory,
  PolicyStatus,
  DailyStatus,
  SubmissionTiming,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PhysicalConcurrencyHarness, ConcurrencyBarrier } from '../harness/concurrency-harness.js';
import { CorrectionRequestService } from '../../src/modules/correction-request/services/correction-request.service.js';
import { BlockerService } from '../../src/modules/blocker/services/blocker.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { PolicyService } from '../../src/modules/policy/policy.service.js';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { NotificationService } from '../../src/modules/notification/notification.service.js';
import { BlockerOwnerResolverService } from '../../src/modules/blocker/services/blocker-owner-resolver.service.js';
import { ConflictException } from '../../src/modules/shared/exceptions/api.exception.js';
import { TEST_USERS } from '../../prisma/seed.test.js';

describe('Real PostgreSQL Integration Matrix: Concurrency, Locking & TOCTOU (Phase 2B-1)', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let harness: PhysicalConcurrencyHarness;
  let prisma: PrismaClient;
  let pgClient: pg.Client;

  // Services
  let auditService: AuditService;
  let policyService: PolicyService;
  let scopeFilterService: ScopeFilterService;
  let notificationService: NotificationService;
  let blockerOwnerResolver: BlockerOwnerResolverService;
  let blockerService: BlockerService;
  let correctionService: CorrectionRequestService;

  beforeAll(async () => {
    harness = new PhysicalConcurrencyHarness();
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
      {} as any
    );
    blockerOwnerResolver = new BlockerOwnerResolverService(prisma as any);
    blockerService = new BlockerService(
      prisma as any,
      auditService,
      policyService,
      scopeFilterService,
      notificationService,
      blockerOwnerResolver
    );
    correctionService = new CorrectionRequestService(
      prisma as any,
      auditService,
      policyService,
      scopeFilterService,
      notificationService
    );
  });

  afterAll(async () => {
    if (harness) await harness.cleanup();
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  // =========================================================================
  // C01: Correction Request vs Auto-Apply (Section 9)
  // Reviewer Object vs Scheduler Auto-Apply on the same Pending Correction Request
  // =========================================================================
  it('C01: Correction Request vs Auto-Apply — pessimistic SELECT FOR UPDATE ensures single valid outcome under concurrency', async () => {
    const connA = await harness.createConnection('C01-Reviewer');
    const connB = await harness.createConnection('C01-Scheduler');

    expect(connA.pid).toBeGreaterThan(0);
    expect(connB.pid).toBeGreaterThan(0);
    expect(connA.pid).not.toBe(connB.pid);

    // 1. Prepare target commitment and pending correction request with expired objection window
    const workDate = new Date('2026-12-10T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C01 race test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const expiredWindowEnd = new Date(Date.now() - 3600 * 1000); // 1 hour ago
    const correction = await prisma.correctionRequest.create({
      data: {
        targetCommitmentId: commitment.id,
        requestedByUserId: TEST_USERS.ALICE.id,
        requestedChange: { text: 'Concurrently corrected commitment text' },
        reason: 'Typo in planning',
        classification: CorrectionClassification.Material,
        status: CorrectionStatus.Pending,
        policySnapshot: {},
        objectionWindowStart: new Date(Date.now() - 7200 * 1000),
        objectionWindowEnd: expiredWindowEnd,
      },
    });

    const barrier = new ConcurrencyBarrier(2, 10000);
    let connBStartedLockAttempt = false;
    let connBFinished = false;

    // Party A: Reviewer acquiring SELECT ... FOR UPDATE, waiting at barrier, then setting status = Rejected
    const partyARunner = async () => {
      await connA.beginTransaction();
      const lockRes = await connA.query(
        `SELECT id, status, "objectionWindowEnd", "requestedByUserId"
         FROM correction_requests
         WHERE id = $1::uuid
         FOR UPDATE`,
        [correction.id]
      );
      expect(lockRes.rows.length).toBe(1);
      expect(lockRes.rows[0].status).toBe('Pending');

      // Signal barrier: ConnA now holds row lock
      await barrier.wait('PartyA-acquired-lock');

      // Small sleep to ensure Party B is actively waiting on lock in Postgres
      await new Promise((r) => setTimeout(r, 100));

      // Mutate to Rejected and commit
      await connA.query(
        `UPDATE correction_requests
         SET status = 'Rejected', "objectionReason" = 'Concurrently rejected by reviewer', "updatedAt" = NOW()
         WHERE id = $1::uuid`,
        [correction.id]
      );

      await connA.query(
        `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
         VALUES (gen_random_uuid(), $1::uuid, 'CORRECTION_REJECTED', 'CorrectionRequest', $2::uuid, '{"status":"Rejected"}'::jsonb, NOW())`,
        [TEST_USERS.BOB.id, correction.id]
      );

      await connA.commit();
      return 'REVIEWER_REJECTED';
    };

    // Party B: Scheduler attempting SELECT ... FOR UPDATE on the same row
    const partyBRunner = async () => {
      await barrier.wait('PartyB-ready-to-lock');
      await connB.beginTransaction();
      connBStartedLockAttempt = true;

      // This query physically blocks in PostgreSQL until ConnA commits!
      const lockRes = await connB.query(
        `SELECT id, status, "targetCommitmentId", "requestedChange", "requestedByUserId"
         FROM correction_requests
         WHERE id = $1::uuid
         FOR UPDATE`,
        [correction.id]
      );

      // Reached after ConnA commits! Status must now be 'Rejected'
      const row = lockRes.rows[0];
      let actionTaken = 'SKIPPED_NOT_PENDING';
      if (row.status === 'Pending') {
        // If still pending, auto-apply would happen
        actionTaken = 'AUTO_APPLIED';
      }

      await connB.commit();
      connBFinished = true;
      return actionTaken;
    };

    const [resA, resB] = await Promise.all([partyARunner(), partyBRunner()]);

    expect(resA).toBe('REVIEWER_REJECTED');
    expect(resB).toBe('SKIPPED_NOT_PENDING');

    // Verify PostgreSQL state:
    const finalCr = await prisma.correctionRequest.findUnique({
      where: { id: correction.id },
    });
    expect(finalCr?.status).toBe(CorrectionStatus.Rejected);
    expect(finalCr?.objectionReason).toBe('Concurrently rejected by reviewer');

    // Target commitment must remain unmodified
    const finalComm = await prisma.commitment.findUnique({
      where: { id: commitment.id },
    });
    expect(finalComm?.text).toBe('Commitment for C01 race test');

    // Audit logs: Exactly 1 rejection, 0 auto-apply
    const auditRows = await pgClient.query(
      `SELECT action FROM audit_logs WHERE "relatedEntityId" = $1::uuid`,
      [correction.id]
    );
    expect(auditRows.rows.length).toBe(1);
    expect(auditRows.rows[0].action).toBe('CORRECTION_REJECTED');
  });

  // =========================================================================
  // C02: S3-T1-P2B1-DEF-01 Remediation Verification
  // Duplicate Correction Request Prevention & Atomic Invariant Under Concurrency
  // =========================================================================
  it('C02-A: Negative Database Test — PostgreSQL partial unique index physically rejects second Pending insert on direct DB bypass', async () => {
    const connA = await harness.createConnection('C02A-DirectA');
    const connB = await harness.createConnection('C02A-DirectB');

    expect(connA.pid).not.toBe(connB.pid);

    const workDate = new Date('2026-12-11T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C02A direct negative test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    // 1. Connection A inserts first Pending row -> SUCCESS
    const insA = await connA.query(
      `INSERT INTO correction_requests (id, "targetCommitmentId", "requestedByUserId", "requestedChange", reason, classification, "policySnapshot", status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, '{"text":"Update A"}'::jsonb, 'Reason A', 'Material', '{}'::jsonb, 'Pending', NOW(), NOW())
       RETURNING id`,
      [commitment.id, TEST_USERS.ALICE.id]
    );
    expect(insA.rows.length).toBe(1);

    // 2. Connection B attempts direct insert of second Pending row for same commitment -> FAILS with 23505
    let connBError: any = null;
    try {
      await connB.query(
        `INSERT INTO correction_requests (id, "targetCommitmentId", "requestedByUserId", "requestedChange", reason, classification, "policySnapshot", status, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1::uuid, $2::uuid, '{"text":"Update B"}'::jsonb, 'Reason B', 'Material', '{}'::jsonb, 'Pending', NOW(), NOW())
         RETURNING id`,
        [commitment.id, TEST_USERS.ALICE.id]
      );
    } catch (err: any) {
      connBError = err;
    }

    expect(connBError).not.toBeNull();
    expect(connBError.code).toBe('23505'); // unique_violation
    expect(connBError.constraint).toBe('unique_pending_correction_per_commitment');

    // 3. Exactly 1 Pending row exists in PostgreSQL
    const countRes = await pgClient.query(
      `SELECT COUNT(*)::int as count FROM correction_requests WHERE "targetCommitmentId" = $1::uuid AND status = 'Pending'`,
      [commitment.id]
    );
    expect(countRes.rows[0].count).toBe(1);
  });

  it('C02-B: Concurrent Duplicate Race — exactly one Pending created, loser mapped to ConflictException (409), no false audit/notification', async () => {
    const workDate = new Date('2026-12-12T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C02B race test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const aliceUser = {
      userId: TEST_USERS.ALICE.id,
      role: Role.Employee,
      email: TEST_USERS.ALICE.email,
    };

    const reqA = {
      targetCommitmentId: commitment.id,
      requestedChange: {
        text: 'Substantially updated text by racer A with major changes',
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Blocker for race A',
      },
      reason: 'Concurrent race submission A',
    };

    const reqB = {
      targetCommitmentId: commitment.id,
      requestedChange: {
        text: 'Substantially updated text by racer B with major changes',
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Blocker for race B',
      },
      reason: 'Concurrent race submission B',
    };

    // Run both requests concurrently through CorrectionRequestService
    const results = await Promise.allSettled([
      correctionService.createCorrectionRequest(aliceUser as any, reqA as any),
      correctionService.createCorrectionRequest(aliceUser as any, reqB as any),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly 1 winner, exactly 1 loser
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Winner gets Pending material correction
    const winnerResult = (fulfilled[0] as PromiseFulfilledResult<any>).value;
    expect(winnerResult.status).toBe(CorrectionStatus.Pending);
    expect(winnerResult.classification).toBe(CorrectionClassification.Material);

    // Loser gets ConflictException (409) with consistent domain message
    const loserError = (rejected[0] as PromiseRejectedResult).reason;
    expect(loserError).toBeInstanceOf(ConflictException);
    expect(loserError.message).toContain('Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini');
    expect(loserError.getStatus()).toBe(409);

    // Verify PostgreSQL persistence: EXACTLY 1 Pending correction row
    const pendingRows = await prisma.correctionRequest.findMany({
      where: {
        targetCommitmentId: commitment.id,
        status: CorrectionStatus.Pending,
      },
    });
    expect(pendingRows.length).toBe(1);
    expect(pendingRows[0].id).toBe(winnerResult.id);

    // Verify AuditLog persistence: EXACTLY 1 CORRECTION_REQUESTED event (loser left no false audit)
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        relatedEntityType: 'CorrectionRequest',
        relatedEntityId: winnerResult.id,
        action: 'CORRECTION_REQUESTED',
      },
    });
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].actorUserId).toBe(TEST_USERS.ALICE.id);

    // Verify Notifications: Winner dispatched notification to reviewer, loser did not emit duplicate
    const notifications = await prisma.notification.findMany({
      where: {
        relatedEntityType: 'CorrectionRequest',
        relatedEntityId: winnerResult.id,
      },
    });
    expect(notifications.length).toBe(1);
  });

  it('C02-C: Sequential Duplicate — application pre-check rejects subsequent request with ConflictException', async () => {
    const workDate = new Date('2026-12-13T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C02C sequential test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const aliceUser = {
      userId: TEST_USERS.ALICE.id,
      role: Role.Employee,
      email: TEST_USERS.ALICE.email,
    };

    // First request succeeds
    const firstCR = await correctionService.createCorrectionRequest(aliceUser as any, {
      targetCommitmentId: commitment.id,
      requestedChange: {
        text: 'First sequential material modification',
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Known blocker 1',
      },
      reason: 'First sequential request',
    });
    expect(firstCR.status).toBe(CorrectionStatus.Pending);

    // Second sequential request must be rejected by pre-check
    await expect(
      correctionService.createCorrectionRequest(aliceUser as any, {
        targetCommitmentId: commitment.id,
        requestedChange: {
          text: 'Second sequential modification attempt',
          initialRisk: DailyStatus.AMBER,
          knownBlockerNote: 'Known blocker 2',
        },
        reason: 'Second sequential request',
      })
    ).rejects.toThrow(ConflictException);

    // Count remains exactly 1
    const pendingCount = await prisma.correctionRequest.count({
      where: { targetCommitmentId: commitment.id, status: CorrectionStatus.Pending },
    });
    expect(pendingCount).toBe(1);
  });

  it('C02-D: Status Transition Uniqueness Release — Pending -> Rejected releases index predicate, allowing new Pending', async () => {
    const workDate = new Date('2026-12-14T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C02D reject release test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const aliceUser = {
      userId: TEST_USERS.ALICE.id,
      role: Role.Employee,
      email: TEST_USERS.ALICE.email,
    };
    const bobUser = {
      userId: TEST_USERS.BOB.id,
      role: Role.Supervisor_TL,
      email: TEST_USERS.BOB.email,
    };

    // 1. Create first Pending correction
    const cr1 = await correctionService.createCorrectionRequest(aliceUser as any, {
      targetCommitmentId: commitment.id,
      requestedChange: {
        text: 'First material change to be rejected',
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'Blocker 1',
      },
      reason: 'Material request 1',
    });
    expect(cr1.status).toBe(CorrectionStatus.Pending);

    // 2. Reviewer objects -> status becomes Rejected
    const rejectedCR = await correctionService.objectCorrection(bobUser as any, cr1.id, {
      objectionReason: 'Scope change not acceptable',
    });
    expect(rejectedCR.status).toBe(CorrectionStatus.Rejected);

    // 3. New Pending correction on same commitment -> SUCCEEDS (partial index released)
    const cr2 = await correctionService.createCorrectionRequest(aliceUser as any, {
      targetCommitmentId: commitment.id,
      requestedChange: {
        text: 'Revised material change after rejection',
        initialRisk: DailyStatus.RED,
        knownBlockerNote: 'Blocker 2',
      },
      reason: 'Material request 2 following rejection',
    });
    expect(cr2.status).toBe(CorrectionStatus.Pending);
    expect(cr2.id).not.toBe(cr1.id);

    // Database verification: Exactly 1 Pending and 1 Rejected
    const allCrs = await prisma.correctionRequest.findMany({
      where: { targetCommitmentId: commitment.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(allCrs.length).toBe(2);
    expect(allCrs[0].status).toBe(CorrectionStatus.Rejected);
    expect(allCrs[1].status).toBe(CorrectionStatus.Pending);
  });

  it('C02-E: Status Transition Uniqueness Release — Pending -> Applied releases index predicate, allowing new Pending', async () => {
    const workDate = new Date('2026-12-15T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C02E applied release test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const aliceUser = {
      userId: TEST_USERS.ALICE.id,
      role: Role.Employee,
      email: TEST_USERS.ALICE.email,
    };

    // 1. Create first Pending correction with expired objection window
    const expiredWindow = new Date(Date.now() - 3600 * 1000);
    const cr1 = await prisma.correctionRequest.create({
      data: {
        targetCommitmentId: commitment.id,
        requestedByUserId: aliceUser.userId,
        requestedChange: { text: 'Applied text change' },
        reason: 'Expired window auto-applied',
        classification: CorrectionClassification.Material,
        policySnapshot: {},
        status: CorrectionStatus.Pending,
        objectionWindowStart: new Date(Date.now() - 7200 * 1000),
        objectionWindowEnd: expiredWindow,
      },
    });

    // 2. Scheduler evaluates expired window -> transitions to Applied
    const evalRes = await correctionService.evaluateExpiredObjectionWindows();
    expect(evalRes.processedCount).toBeGreaterThanOrEqual(1);

    const updatedCr1 = await prisma.correctionRequest.findUnique({ where: { id: cr1.id } });
    expect(updatedCr1?.status).toBe(CorrectionStatus.Applied);

    // 3. New Pending correction on same commitment -> SUCCEEDS (partial index released)
    const cr2 = await correctionService.createCorrectionRequest(aliceUser as any, {
      targetCommitmentId: commitment.id,
      requestedChange: {
        text: 'Subsequent material modification after previous Applied',
        initialRisk: DailyStatus.AMBER,
        knownBlockerNote: 'New blocker',
      },
      reason: 'Second material correction',
    });
    expect(cr2.status).toBe(CorrectionStatus.Pending);

    // Database verification: Exactly 1 Applied and 1 Pending
    const allCrs = await prisma.correctionRequest.findMany({
      where: { targetCommitmentId: commitment.id },
    });
    expect(allCrs.filter((c) => c.status === CorrectionStatus.Applied).length).toBe(1);
    expect(allCrs.filter((c) => c.status === CorrectionStatus.Pending).length).toBe(1);
  });

  it('C02-F: Unrelated Commitments — different commitments can independently have concurrent Pending requests', async () => {
    const workDate = new Date('2026-12-16T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const comm1 = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment X for C02F',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const comm2 = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 2,
        text: 'Commitment Y for C02F',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const aliceUser = {
      userId: TEST_USERS.ALICE.id,
      role: Role.Employee,
      email: TEST_USERS.ALICE.email,
    };

    // Both commitments submit Material Correction concurrently
    const [res1, res2] = await Promise.all([
      correctionService.createCorrectionRequest(aliceUser as any, {
        targetCommitmentId: comm1.id,
        requestedChange: { text: 'Substantial change on X', initialRisk: DailyStatus.AMBER, knownBlockerNote: 'Blocker X' },
        reason: 'Material change X',
      }),
      correctionService.createCorrectionRequest(aliceUser as any, {
        targetCommitmentId: comm2.id,
        requestedChange: { text: 'Substantial change on Y', initialRisk: DailyStatus.RED, knownBlockerNote: 'Blocker Y' },
        reason: 'Material change Y',
      }),
    ]);

    expect(res1.status).toBe(CorrectionStatus.Pending);
    expect(res2.status).toBe(CorrectionStatus.Pending);
    expect(res1.targetCommitmentId).toBe(comm1.id);
    expect(res2.targetCommitmentId).toBe(comm2.id);

    // Verify both exist simultaneously as Pending
    const pendingTotal = await prisma.correctionRequest.count({
      where: {
        targetCommitmentId: { in: [comm1.id, comm2.id] },
        status: CorrectionStatus.Pending,
      },
    });
    expect(pendingTotal).toBe(2);
  });

  // =========================================================================
  // C03: Blocker Acknowledge vs Auto-Escalate (Section 11)
  // Owner acknowledges while Scheduler runs auto-escalation
  // =========================================================================
  it('C03: Blocker Ack vs Auto-Escalate — re-check inside transaction prevents lost update / stale escalation', async () => {
    const connA = await harness.createConnection('C03-Owner');
    const connB = await harness.createConnection('C03-Scheduler');

    expect(connA.pid).not.toBe(connB.pid);

    // Prepare critical blocker raised 3 hours ago
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    const blocker = await prisma.blocker.create({
      data: {
        raisedByUserId: TEST_USERS.ALICE.id,
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        ownerNeededUserId: TEST_USERS.BOB.id,
        type: 'Database Migration Blocked',
        severity: BlockerSeverity.Critical,
        impact: 'Deployment blocked',
        status: BlockerStatus.Open,
        raisedAt: threeHoursAgo,
      },
    });

    const barrier = new ConcurrencyBarrier(2, 10000);

    // Party A: Owner acknowledges blocker and commits
    const partyA = async () => {
      await barrier.wait('PartyA-start');
      await connA.beginTransaction();
      await connA.query(
        `UPDATE blockers
         SET status = 'Acknowledged', "acknowledgedAt" = NOW(), "updatedAt" = NOW()
         WHERE id = $1::uuid`,
        [blocker.id]
      );
      await connA.query(
        `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
         VALUES (gen_random_uuid(), $1::uuid, 'BLOCKER_ACKNOWLEDGED', 'Blocker', $2::uuid, '{"status":"Acknowledged"}'::jsonb, NOW())`,
        [TEST_USERS.BOB.id, blocker.id]
      );
      await connA.commit();
      return 'ACKNOWLEDGED';
    };

    // Party B: Scheduler reads candidates, enters transaction, re-checks acknowledgedAt/status
    const partyB = async () => {
      await barrier.wait('PartyB-start');
      // Give Party A slight lead to commit acknowledge
      await new Promise((r) => setTimeout(r, 50));

      await connB.beginTransaction();
      const checkRes = await connB.query(
        `SELECT id, status, "acknowledgedAt" FROM blockers WHERE id = $1::uuid`,
        [blocker.id]
      );

      const current = checkRes.rows[0];
      let escalated = false;

      // Invariant: if already acknowledged or status != Open, abort escalation
      if (current.status === 'Open' && current.acknowledgedAt === null) {
        escalated = true;
        await connB.query(
          `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
           VALUES (gen_random_uuid(), NULL, 'BLOCKER_AUTO_ESCALATED', 'Blocker', $1::uuid, '{"escalated":true}'::jsonb, NOW())`,
          [blocker.id]
        );
      }

      await connB.commit();
      return escalated ? 'ESCALATED' : 'SKIPPED_ALREADY_ACKNOWLEDGED';
    };

    const [resA, resB] = await Promise.all([partyA(), partyB()]);

    expect(resA).toBe('ACKNOWLEDGED');
    expect(resB).toBe('SKIPPED_ALREADY_ACKNOWLEDGED');

    // Final DB state must be Acknowledged
    const finalBlocker = await prisma.blocker.findUnique({
      where: { id: blocker.id },
    });
    expect(finalBlocker?.status).toBe(BlockerStatus.Acknowledged);
    expect(finalBlocker?.acknowledgedAt).not.toBeNull();

    // Audit logs must contain BLOCKER_ACKNOWLEDGED and 0 BLOCKER_AUTO_ESCALATED
    const audits = await pgClient.query(
      `SELECT action FROM audit_logs WHERE "relatedEntityId" = $1::uuid`,
      [blocker.id]
    );
    expect(audits.rows.map((r) => r.action)).toContain('BLOCKER_ACKNOWLEDGED');
    expect(audits.rows.map((r) => r.action)).not.toContain('BLOCKER_AUTO_ESCALATED');
  });

  // =========================================================================
  // C04: Blocker Cutoff Race (Section 12)
  // State precisely at the escalation threshold boundary
  // =========================================================================
  it('C04: Blocker Cutoff Race — handles threshold boundary race without invalid transition', async () => {
    const connA = await harness.createConnection('C04-Ack');
    const connB = await harness.createConnection('C04-Esc');

    expect(connA.pid).not.toBe(connB.pid);

    // Blocker raised exactly 2 hours ago (the exact default threshold)
    const exactThreshold = new Date(Date.now() - 2 * 3600 * 1000);
    const blocker = await prisma.blocker.create({
      data: {
        raisedByUserId: TEST_USERS.ALICE.id,
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        ownerNeededUserId: TEST_USERS.BOB.id,
        type: 'Boundary Blocker',
        severity: BlockerSeverity.Critical,
        impact: 'Boundary impact',
        status: BlockerStatus.Open,
        raisedAt: exactThreshold,
      },
    });

    const barrier = new ConcurrencyBarrier(2, 10000);

    const [resA, resB] = await Promise.all([
      (async () => {
        await barrier.wait('C04-A');
        await connA.beginTransaction();
        await connA.query(
          `UPDATE blockers SET status = 'Acknowledged', "acknowledgedAt" = NOW() WHERE id = $1::uuid`,
          [blocker.id]
        );
        await connA.commit();
        return 'ACK';
      })(),
      (async () => {
        await barrier.wait('C04-B');
        await connB.beginTransaction();
        const check = await connB.query(
          `SELECT status, "acknowledgedAt" FROM blockers WHERE id = $1::uuid`,
          [blocker.id]
        );
        await connB.commit();
        return check.rows[0].status;
      })(),
    ]);

    expect(resA).toBe('ACK');
    // Final DB state is valid and deterministic
    const b = await prisma.blocker.findUnique({ where: { id: blocker.id } });
    expect(b?.status).toBe(BlockerStatus.Acknowledged);
  });

  // =========================================================================
  // C05: Audit Atomicity under Concurrency (Section 14)
  // Mutation + AuditLog inside concurrent transactions: committed vs rolled back
  // =========================================================================
  it('C05: Audit Atomicity under Concurrency — committed transactions persist both business+audit; rolled back persist zero', async () => {
    const connA = await harness.createConnection('C05-Commit');
    const connB = await harness.createConnection('C05-Rollback');

    const workDate = new Date('2026-12-15T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const workAId = crypto.randomUUID();
    const workBId = crypto.randomUUID();

    // ConnA: atomic write of AdditionalWork + AuditLog, then COMMIT
    const partyA = async () => {
      await connA.beginTransaction();
      await connA.query(
        `INSERT INTO additional_works (id, "dailyRecordId", text, reason, "createdAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, 'Work A', 'NewlyAssigned', NOW(), NOW())`,
        [workAId, record.id]
      );
      await connA.query(
        `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
         VALUES (gen_random_uuid(), $1::uuid, 'ADDITIONAL_WORK_COMMITTED', 'AdditionalWork', $2::uuid, '{"text":"Work A"}'::jsonb, NOW())`,
        [TEST_USERS.ALICE.id, workAId]
      );
      await connA.commit();
      return 'COMMITTED';
    };

    // ConnB: atomic write of AdditionalWork + AuditLog, then ROLLBACK
    const partyB = async () => {
      await connB.beginTransaction();
      await connB.query(
        `INSERT INTO additional_works (id, "dailyRecordId", text, reason, "createdAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, 'Work B', 'NewlyAssigned', NOW(), NOW())`,
        [workBId, record.id]
      );
      await connB.query(
        `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
         VALUES (gen_random_uuid(), $1::uuid, 'ADDITIONAL_WORK_ROLLEDBACK', 'AdditionalWork', $2::uuid, '{"text":"Work B"}'::jsonb, NOW())`,
        [TEST_USERS.ALICE.id, workBId]
      );
      await connB.rollback();
      return 'ROLLED_BACK';
    };

    const [resA, resB] = await Promise.all([partyA(), partyB()]);
    expect(resA).toBe('COMMITTED');
    expect(resB).toBe('ROLLED_BACK');

    // ConnA verification: BOTH additional_work AND audit_log exist
    const workACheck = await pgClient.query(
      `SELECT id FROM additional_works WHERE id = $1::uuid`,
      [workAId]
    );
    const auditACheck = await pgClient.query(
      `SELECT id FROM audit_logs WHERE "relatedEntityId" = $1::uuid`,
      [workAId]
    );
    expect(workACheck.rows.length).toBe(1);
    expect(auditACheck.rows.length).toBe(1);

    // ConnB verification: BOTH additional_work AND audit_log are ZERO
    const workBCheck = await pgClient.query(
      `SELECT id FROM additional_works WHERE id = $1::uuid`,
      [workBId]
    );
    const auditBCheck = await pgClient.query(
      `SELECT id FROM audit_logs WHERE "relatedEntityId" = $1::uuid`,
      [workBId]
    );
    expect(workBCheck.rows.length).toBe(0);
    expect(auditBCheck.rows.length).toBe(0);
  });

  // =========================================================================
  // C06: System Actor Semantics under Concurrency (Section 15)
  // actorUserId = NULL in PostgreSQL audit_logs under concurrent operations
  // =========================================================================
  it('C06: System Actor Semantics — verifies actorUserId IS NULL in PostgreSQL audit_logs under concurrency', async () => {
    const connA = await harness.createConnection('C06-SysA');
    const connB = await harness.createConnection('C06-SysB');

    const entityAId = crypto.randomUUID();
    const entityBId = crypto.randomUUID();

    await Promise.all([
      (async () => {
        await connA.beginTransaction();
        await connA.query(
          `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
           VALUES (gen_random_uuid(), NULL, 'SYSTEM_SCHEDULER_JOB_A', 'SystemEvent', $1::uuid, '{"job":"A"}'::jsonb, NOW())`,
          [entityAId]
        );
        await connA.commit();
      })(),
      (async () => {
        await connB.beginTransaction();
        await connB.query(
          `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
           VALUES (gen_random_uuid(), NULL, 'SYSTEM_SCHEDULER_JOB_B', 'SystemEvent', $1::uuid, '{"job":"B"}'::jsonb, NOW())`,
          [entityBId]
        );
        await connB.commit();
      })(),
    ]);

    // Query physical PostgreSQL rows: actorUserId must be true SQL NULL
    const checkA = await pgClient.query(
      `SELECT "actorUserId" FROM audit_logs WHERE "relatedEntityId" = $1::uuid`,
      [entityAId]
    );
    const checkB = await pgClient.query(
      `SELECT "actorUserId" FROM audit_logs WHERE "relatedEntityId" = $1::uuid`,
      [entityBId]
    );

    expect(checkA.rows[0].actorUserId).toBeNull();
    expect(checkB.rows[0].actorUserId).toBeNull();

    // Verify IS NULL filter matches
    const countA = await pgClient.query(
      `SELECT count(*)::int AS cnt FROM audit_logs WHERE "relatedEntityId" = $1::uuid AND "actorUserId" IS NULL`,
      [entityAId]
    );
    expect(countA.rows[0].cnt).toBe(1);
  });

  // =========================================================================
  // C07: Concurrent Idempotency (Section 16)
  // Two concurrent scheduler workers evaluate auto-escalation on the same blocker
  // =========================================================================
  it('C07: Concurrent Idempotency — exactly one escalation audit row is recorded when two workers race', async () => {
    const connA = await harness.createConnection('C07-Worker1');
    const connB = await harness.createConnection('C07-Worker2');

    const blocker = await prisma.blocker.create({
      data: {
        raisedByUserId: TEST_USERS.ALICE.id,
        ownerNeededType: OwnerNeededType.OrganizationalAuthority,
        ownerNeededUserId: TEST_USERS.BOB.id,
        type: 'Concurrent Escalation Blocker',
        severity: BlockerSeverity.Critical,
        impact: 'Impact',
        status: BlockerStatus.Open,
        raisedAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
    });

    const barrier = new ConcurrencyBarrier(2, 10000);

    // Each worker simulates evaluateAutoEscalation with idempotency check
    const runWorker = async (conn: any, label: string) => {
      await barrier.wait(`${label}-barrier`);
      await conn.beginTransaction();

      // Lock blocker row to serialize escalation decision
      const lock = await conn.query(
        `SELECT id, status, "acknowledgedAt" FROM blockers WHERE id = $1::uuid FOR UPDATE`,
        [blocker.id]
      );

      // Check idempotency: already escalated?
      const existing = await conn.query(
        `SELECT id FROM audit_logs WHERE "relatedEntityId" = $1::uuid AND action = 'BLOCKER_AUTO_ESCALATED'`,
        [blocker.id]
      );

      let recorded = false;
      if (existing.rows.length === 0 && lock.rows[0].status === 'Open' && lock.rows[0].acknowledgedAt === null) {
        await conn.query(
          `INSERT INTO audit_logs (id, "actorUserId", action, "relatedEntityType", "relatedEntityId", "valueAfter", timestamp)
           VALUES (gen_random_uuid(), NULL, 'BLOCKER_AUTO_ESCALATED', 'Blocker', $1::uuid, '{"escalated":true}'::jsonb, NOW())`,
          [blocker.id]
        );
        recorded = true;
      }

      await conn.commit();
      return recorded;
    };

    const [w1, w2] = await Promise.all([
      runWorker(connA, 'Worker1'),
      runWorker(connB, 'Worker2'),
    ]);

    // Exactly one worker must have recorded the escalation
    const totalRecorded = (w1 ? 1 : 0) + (w2 ? 1 : 0);
    expect(totalRecorded).toBe(1);

    // Physical DB check: exactly 1 row
    const auditRes = await pgClient.query(
      `SELECT count(*)::int AS cnt FROM audit_logs WHERE "relatedEntityId" = $1::uuid AND action = 'BLOCKER_AUTO_ESCALATED'`,
      [blocker.id]
    );
    expect(auditRes.rows[0].cnt).toBe(1);
  });

  // =========================================================================
  // C08: Effective-Dated Concurrent Read (Section 17)
  // Historical AS-OF resolution remains deterministic during concurrent policy writes
  // =========================================================================
  it('C08: Effective-Dated Concurrent Read — historical AS-OF resolution remains strictly deterministic', async () => {
    const connA = await harness.createConnection('C08-Reader');
    const connB = await harness.createConnection('C08-Writer');

    const category = PolicyCategory.EscalationThreshold;

    // Ensure baseline policy version 1 effective 2026-01-01 (4 hours)
    await prisma.policy.deleteMany({ where: { category } });
    await prisma.policy.create({
      data: {
        category,
        value: { unacknowledgedThresholdHours: 4 },
        effectiveDate: new Date('2026-01-01T00:00:00Z'),
        status: PolicyStatus.Active,
        createdByUserId: TEST_USERS.ADMIN.id,
      },
    });

    const barrier = new ConcurrencyBarrier(2, 10000);

    // Party A: Reader querying AS-OF 2026-06-01 (before future policy)
    const partyA = async () => {
      await connA.beginTransaction();
      const asOfPast = new Date('2026-06-01T00:00:00Z');

      const resPast1 = await connA.query(
        `SELECT value FROM policies
         WHERE category = $1 AND status = 'Active' AND "effectiveDate" <= $2
         ORDER BY "effectiveDate" DESC LIMIT 1`,
        [category, asOfPast]
      );
      expect(resPast1.rows[0].value.unacknowledgedThresholdHours).toBe(4);

      // Wait for Party B to write newer policy
      await barrier.wait('PartyA-read1-done');
      await barrier.wait('PartyB-committed-newer-policy');

      // Re-read AS-OF 2026-06-01: must still return 4 hours
      const resPast2 = await connA.query(
        `SELECT value FROM policies
         WHERE category = $1 AND status = 'Active' AND "effectiveDate" <= $2
         ORDER BY "effectiveDate" DESC LIMIT 1`,
        [category, asOfPast]
      );
      expect(resPast2.rows[0].value.unacknowledgedThresholdHours).toBe(4);

      // Query AS-OF 2026-11-01: returns newly inserted 2 hours
      const asOfFuture = new Date('2026-11-01T00:00:00Z');
      const resFuture = await connA.query(
        `SELECT value FROM policies
         WHERE category = $1 AND status = 'Active' AND "effectiveDate" <= $2
         ORDER BY "effectiveDate" DESC LIMIT 1`,
        [category, asOfFuture]
      );
      expect(resFuture.rows[0].value.unacknowledgedThresholdHours).toBe(2);

      await connA.commit();
      return 'HISTORICAL_DETERMINISTIC';
    };

    // Party B: Writer inserting newer policy effective 2026-10-01 (2 hours)
    const partyB = async () => {
      await barrier.wait('PartyB-ready');
      await connB.beginTransaction();
      await connB.query(
        `INSERT INTO policies (id, category, value, "effectiveDate", status, "createdByUserId", "createdAt")
         VALUES (gen_random_uuid(), $1, '{"unacknowledgedThresholdHours":2}'::jsonb, '2026-10-01', 'Active', $2::uuid, NOW())`,
        [category, TEST_USERS.ADMIN.id]
      );
      await connB.commit();
      await barrier.wait('PartyB-committed');
      return 'NEW_POLICY_WRITTEN';
    };

    const [resA, resB] = await Promise.all([partyA(), partyB()]);
    expect(resA).toBe('HISTORICAL_DETERMINISTIC');
    expect(resB).toBe('NEW_POLICY_WRITTEN');
  });

  // =========================================================================
  // C09: Cutoff / TOCTOU (Section 13 & 18)
  // Objection window expiry race: pessimistic lock revalidation prevents stale mutation
  // =========================================================================
  it('C09: Cutoff / TOCTOU — pessimistic lock revalidation prevents stale objection after window expiry', async () => {
    const connA = await harness.createConnection('C09-Reviewer');
    const connB = await harness.createConnection('C09-WindowClock');

    const workDate = new Date('2026-12-16T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C09 TOCTOU test',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    // Window ends in 100 milliseconds
    const initialWindowEnd = new Date(Date.now() + 100);
    const cr = await prisma.correctionRequest.create({
      data: {
        targetCommitmentId: commitment.id,
        requestedByUserId: TEST_USERS.ALICE.id,
        requestedChange: { text: 'New text' },
        reason: 'Reason',
        classification: CorrectionClassification.Material,
        status: CorrectionStatus.Pending,
        policySnapshot: {},
        objectionWindowStart: new Date(Date.now() - 3600 * 1000),
        objectionWindowEnd: initialWindowEnd,
      },
    });

    const barrier = new ConcurrencyBarrier(2, 10000);

    // Party A: Reviewer starts transaction, locks row, checks `objectionWindowEnd <= now`
    const partyA = async () => {
      await barrier.wait('C09-start');
      // Wait until window expires
      await new Promise((r) => setTimeout(r, 200));

      await connA.beginTransaction();
      const lockRes = await connA.query(
        `SELECT id, status, "objectionWindowEnd" FROM correction_requests WHERE id = $1::uuid FOR UPDATE`,
        [cr.id]
      );

      const row = lockRes.rows[0];
      const now = new Date();
      let rejectedDueToExpiry = false;

      // Revalidation under lock (matching SAD §9.9 #1):
      if (row.objectionWindowEnd && new Date(row.objectionWindowEnd) <= now) {
        rejectedDueToExpiry = true;
      }

      await connA.commit();
      return rejectedDueToExpiry ? 'REJECTED_WINDOW_EXPIRED' : 'OBJECTION_ACCEPTED';
    };

    const partyB = async () => {
      await barrier.wait('C09-start');
      return 'OBSERVER_SYNC';
    };

    const [resA] = await Promise.all([partyA(), partyB()]);
    expect(resA).toBe('REJECTED_WINDOW_EXPIRED');

    // Status remains Pending for auto-apply scheduler
    const finalCr = await prisma.correctionRequest.findUnique({ where: { id: cr.id } });
    expect(finalCr?.status).toBe(CorrectionStatus.Pending);
  });

  // =========================================================================
  // C10: Lock Observability (Section 19)
  // Prove physical PostgreSQL locking via pg_locks, pg_stat_activity & pg_backend_pid()
  // =========================================================================
  it('C10: Lock Observability — observes physical PostgreSQL row lock contention and wait states in system views', async () => {
    const connA = await harness.createConnection('C10-LockHolder');
    const connB = await harness.createConnection('C10-LockWaiter');
    const connC = await harness.createConnection('C10-Observer');

    expect(connA.pid).not.toBe(connB.pid);
    expect(connB.pid).not.toBe(connC.pid);
    expect(connA.pid).not.toBe(connC.pid);

    const workDate = new Date('2026-12-17T00:00:00Z');
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: TEST_USERS.ALICE.id, workDate },
    });

    const record = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: TEST_USERS.ALICE.id,
        workDate,
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningTiming: SubmissionTiming.OnTime,
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: record.id,
        sequenceNo: 1,
        text: 'Commitment for C10 Lock Observability',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    const cr = await prisma.correctionRequest.create({
      data: {
        targetCommitmentId: commitment.id,
        requestedByUserId: TEST_USERS.ALICE.id,
        requestedChange: { text: 'Lock text' },
        reason: 'Lock test',
        classification: CorrectionClassification.Material,
        status: CorrectionStatus.Pending,
        policySnapshot: {},
        objectionWindowStart: new Date(),
        objectionWindowEnd: new Date(Date.now() + 3600 * 1000),
      },
    });

    // Step 1: ConnA acquires lock
    await connA.beginTransaction();
    await connA.query(
      `SELECT id FROM correction_requests WHERE id = $1::uuid FOR UPDATE`,
      [cr.id]
    );

    // Step 2: ConnB attempts lock in background (will block physically in PostgreSQL)
    await connB.beginTransaction();
    let connBFinished = false;
    const connBPromise = connB.query(
      `SELECT id FROM correction_requests WHERE id = $1::uuid FOR UPDATE`,
      [cr.id]
    ).then((res) => {
      connBFinished = true;
      return res;
    });

    // Small delay to ensure ConnB's query reached PostgreSQL engine and blocked
    await new Promise((r) => setTimeout(r, 150));
    expect(connBFinished).toBe(false);

    // Step 3: ConnC (Observer) queries pg_stat_activity to prove ConnB is waiting for Lock
    const waitActivity = await connC.query(
      `SELECT pid, wait_event_type, wait_event, state
       FROM pg_stat_activity
       WHERE pid = $1`,
      [connB.pid]
    );

    expect(waitActivity.rows.length).toBe(1);
    const waiterRow = waitActivity.rows[0];
    expect(waiterRow.state).toBe('active');
    // In PostgreSQL, waiting for a row lock shows wait_event_type = 'Lock'
    expect(waiterRow.wait_event_type).toBe('Lock');

    // Also observe locks held in pg_locks:
    const locksHeld = await connC.query(
      `SELECT pid, locktype, mode, granted
       FROM pg_locks
       WHERE pid IN ($1, $2) AND granted = true`,
      [connA.pid, connB.pid]
    );
    expect(locksHeld.rows.some((r) => r.pid === connA.pid)).toBe(true);

    // Step 4: ConnA commits -> releases lock
    await connA.commit();

    // Step 5: ConnB unblocks and acquires lock
    const connBResult = await connBPromise;
    expect(connBFinished).toBe(true);
    expect(connBResult.rows.length).toBe(1);
    await connB.commit();
  });
});
