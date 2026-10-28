import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import {
  PrismaClient,
  CorrectionClassification,
  CorrectionStatus,
  DailyStatus,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CorrectionRequestService } from '../../src/modules/correction-request/services/correction-request.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { PolicyService } from '../../src/modules/policy/policy.service.js';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { NotificationService } from '../../src/modules/notification/notification.service.js';

describe('Real PostgreSQL Integration Matrix: Correction Request Domain', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let correctionService: CorrectionRequestService;

  beforeAll(async () => {
    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');
    const adapter = new PrismaPg({ connectionString: cleanUrl, ssl: false });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    const auditService = new AuditService(prisma as any);
    const policyService = new PolicyService(prisma as any, auditService);
    const scopeFilterService = new ScopeFilterService(prisma as any);
    const notificationService = new NotificationService(prisma as any, { sendEmail: async () => ({ success: true }) } as any, {} as any);

    correctionService = new CorrectionRequestService(
      prisma as any,
      auditService,
      policyService,
      scopeFilterService,
      notificationService
    );

    // Clean up any test records
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    if (alice) {
      await prisma.dailyAccountabilityRecord.deleteMany({
        where: {
          employeeUserId: alice.id,
          workDate: { in: [new Date('2026-10-08T00:00:00Z'), new Date('2026-10-09T00:00:00Z')] },
        },
      });
    }
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-COR-01: Minor Correction — should apply immediately and update commitment in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    expect(alice).not.toBeNull();

    // 1. Create a daily record and locked commitment for Alice
    const dailyRecord = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: alice!.id,
        workDate: new Date('2026-10-08T00:00:00Z'),
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningSubmittedAt: new Date('2026-10-08T08:30:00Z'),
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: dailyRecord.id,
        sequenceNo: 1,
        text: 'Initial commitment text with minor typo',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    // 2. Submit Minor Correction (minor typo fix: < 10 words changed)
    const result = await correctionService.createCorrectionRequest(
      { userId: alice!.id, role: Role.Employee, email: alice!.email } as any,
      {
        targetCommitmentId: commitment.id,
        requestedChange: { text: 'Initial commitment text with fixed typo' },
        reason: 'Fixing typo in task description',
      }
    );

    expect(result).toBeDefined();
    expect(result.status).toBe(CorrectionStatus.Applied);
    expect(result.classification).toBe(CorrectionClassification.Minor);

    // 3. Raw PostgreSQL verification: Commitment updated
    const rawCommit = await pgClient.query<{ text: string }>(
      'SELECT text FROM commitments WHERE id = $1',
      [commitment.id]
    );
    expect(rawCommit.rows[0].text).toBe('Initial commitment text with fixed typo');

    // 4. Raw PostgreSQL verification: CorrectionRequest marked as Applied
    const rawCR = await pgClient.query<{ status: string; applied_at: Date | null }>(
      'SELECT status, "appliedAt" as applied_at FROM correction_requests WHERE id = $1',
      [result.id]
    );
    expect(rawCR.rows[0].status).toBe('Applied');
    expect(rawCR.rows[0].applied_at).not.toBeNull();

    // Cleanup
    await prisma.dailyAccountabilityRecord.delete({ where: { id: dailyRecord.id } });
  });

  it('P2A-COR-02: Material Correction Lifecycle — should create Pending, calculate objection window, and support rejection', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });

    // 1. Create a daily record and locked commitment for Alice
    const dailyRecord = await prisma.dailyAccountabilityRecord.create({
      data: {
        employeeUserId: alice!.id,
        workDate: new Date('2026-10-09T00:00:00Z'),
        orgContextSnapshot: { department: 'Engineering' },
        policySnapshot: { morningCutoff: '09:30' },
        morningSubmittedAt: new Date('2026-10-09T08:30:00Z'),
        initialStatus: DailyStatus.GREEN,
      },
    });

    const commitment = await prisma.commitment.create({
      data: {
        dailyRecordId: dailyRecord.id,
        sequenceNo: 1,
        text: 'Original planned project scope',
        initialRisk: DailyStatus.GREEN,
        isMorningLocked: true,
      },
    });

    // 2. Submit Material Correction (substantial text change + risk escalation)
    const materialCR = await correctionService.createCorrectionRequest(
      { userId: alice!.id, role: Role.Employee, email: alice!.email } as any,
      {
        targetCommitmentId: commitment.id,
        requestedChange: {
          text: 'Completely restructured deliverable requiring external vendor collaboration and architecture changes',
          initialRisk: DailyStatus.RED,
          knownBlockerNote: 'Waiting for vendor architecture blueprint approval',
        },
        reason: 'Scope expanded significantly due to infrastructure requirements',
      }
    );

    expect(materialCR.status).toBe(CorrectionStatus.Pending);
    expect(materialCR.classification).toBe(CorrectionClassification.Material);
    expect(materialCR.objectionWindowStart).toBeDefined();
    expect(materialCR.objectionWindowEnd).toBeDefined();

    // Raw PostgreSQL verification: objection window saved
    const rawCR = await pgClient.query<{ status: string; objection_window_end: Date }>(
      'SELECT status, "objectionWindowEnd" as objection_window_end FROM correction_requests WHERE id = $1',
      [materialCR.id]
    );
    expect(rawCR.rows[0].status).toBe('Pending');
    expect(rawCR.rows[0].objection_window_end).not.toBeNull();

    // 3. Sequential Idempotency / Duplicate Conflict: cannot submit second pending on same commitment
    await expect(
      correctionService.createCorrectionRequest(
        { userId: alice!.id, role: Role.Employee, email: alice!.email } as any,
        {
          targetCommitmentId: commitment.id,
          requestedChange: { text: 'Another conflicting edit' },
          reason: 'Duplicate submission attempt',
        }
      )
    ).rejects.toThrow(/masih terdapat pengajuan koreksi yang berstatus pending/i);

    // 4. Reviewer Rejection: Bob (Alice manager) objects to correction
    const rejectedCR = await correctionService.objectCorrection(
      { userId: bob!.id, role: Role.Supervisor_TL, email: bob!.email } as any,
      materialCR.id,
      { objectionReason: 'Scope change is too drastic for current sprint timeline' }
    );

    expect(rejectedCR.status).toBe(CorrectionStatus.Rejected);
    expect(rejectedCR.reviewedByUserId).toBe(bob!.id);

    // Raw PostgreSQL verification: status updated to Rejected
    const rawRejected = await pgClient.query<{ status: string; reviewed_by_user_id: string; objection_reason: string }>(
      'SELECT status, "reviewedByUserId" as reviewed_by_user_id, "objectionReason" as objection_reason FROM correction_requests WHERE id = $1',
      [materialCR.id]
    );
    expect(rawRejected.rows[0].status).toBe('Rejected');
    expect(rawRejected.rows[0].reviewed_by_user_id).toBe(bob!.id);
    expect(rawRejected.rows[0].objection_reason).toContain('sprint timeline');

    // Cleanup
    await prisma.dailyAccountabilityRecord.delete({ where: { id: dailyRecord.id } });
  });
});
