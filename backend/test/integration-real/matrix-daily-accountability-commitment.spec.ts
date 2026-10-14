import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import pg from 'pg';
import {
  PrismaClient,
  DailyStatus,
  CommitmentOutcome,
  Continuation,
  AdditionalWorkReason,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DailyAccountabilityService } from '../../src/modules/daily-accountability/services/daily-accountability.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { PolicyService } from '../../src/modules/policy/policy.service.js';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { StatusSuggestionService } from '../../src/modules/daily-accountability/services/status-suggestion.service.js';

describe('Real PostgreSQL Integration Matrix: Daily Accountability & Commitment', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let dailyService: DailyAccountabilityService;

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
    const statusSuggestionService = new StatusSuggestionService(prisma as any);

    dailyService = new DailyAccountabilityService(
      prisma as any,
      auditService,
      policyService,
      scopeFilterService,
      statusSuggestionService
    );

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-07T08:30:00+07:00'));
  });

  afterAll(async () => {
    vi.useRealTimers();
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-DAC-01: Morning Check-in Persistence — should persist record & commitments in real PostgreSQL', async () => {
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    expect(bob).not.toBeNull();

    // Clean any pre-existing record for Bob to have clean test state
    await prisma.dailyAccountabilityRecord.deleteMany({
      where: { employeeUserId: bob!.id },
    });

    // 1. Submit Morning Check-in with 2 commitments (supportNeeded provided for AMBER)
    const result = await dailyService.submitMorningCheckin(bob!.id, {
      commitments: [
        {
          sequenceNo: 1,
          text: 'Integration testing for backend modules',
          initialRisk: DailyStatus.GREEN,
        },
        {
          sequenceNo: 2,
          text: 'Documentation and audit review',
          initialRisk: DailyStatus.AMBER,
          supportNeeded: 'Need staging environment access',
          knownBlockerNote: 'Waiting for staging credentials',
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.commitments.length).toBe(2);

    // 2. Raw PostgreSQL verification: daily record table
    const rawRecord = await pgClient.query<{ id: string; initial_status: string; employee_user_id: string }>(
      'SELECT id, "initialStatus" as initial_status, "employeeUserId" as employee_user_id FROM daily_accountability_records WHERE id = $1',
      [result.id]
    );
    expect(rawRecord.rows.length).toBe(1);
    expect(rawRecord.rows[0].employee_user_id).toBe(bob!.id);
    expect(rawRecord.rows[0].initial_status).toBe('AMBER'); // worst-of: GREEN vs AMBER -> AMBER

    // 3. Raw PostgreSQL verification: commitments table
    const rawCommitments = await pgClient.query<{ sequence_no: number; text: string; initial_risk: string }>(
      'SELECT "sequenceNo" as sequence_no, text, "initialRisk" as initial_risk FROM commitments WHERE "dailyRecordId" = $1 ORDER BY "sequenceNo" ASC',
      [result.id]
    );
    expect(rawCommitments.rows.length).toBe(2);
    expect(rawCommitments.rows[0].sequence_no).toBe(1);
    expect(rawCommitments.rows[1].sequence_no).toBe(2);
  });

  it('P2A-DAC-02: Maximum 3 Commitments Guardrail — should reject submission exceeding 3 commitments', async () => {
    const carol = await prisma.user.findUnique({ where: { email: 'carol@dutamedia.test' } });

    // Attempt to submit 4 commitments (violates product rule: maximum 3 commitments)
    await expect(
      dailyService.submitMorningCheckin(carol!.id, {
        commitments: [
          { sequenceNo: 1, text: 'Task 1', initialRisk: DailyStatus.GREEN },
          { sequenceNo: 2, text: 'Task 2', initialRisk: DailyStatus.GREEN },
          { sequenceNo: 3, text: 'Task 3', initialRisk: DailyStatus.GREEN },
          { sequenceNo: 4, text: 'Task 4 (ILLEGAL #4)', initialRisk: DailyStatus.GREEN },
        ],
      })
    ).rejects.toThrow(/komitmen/i);
  });

  it('P2A-DAC-03: Additional Work Persistence — should persist in additional_works without polluting commitments table', async () => {
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    const record = await prisma.dailyAccountabilityRecord.findFirst({
      where: { employeeUserId: bob!.id },
      orderBy: { createdAt: 'desc' },
    });
    expect(record).not.toBeNull();

    // 1. Submit Additional Work
    const addWork = await dailyService.createAdditionalWork(bob!.id, {
      dailyRecordId: record!.id,
      text: 'Urgent hotfix for staging container',
      reason: AdditionalWorkReason.MissedInPlanning,
    });

    expect(addWork.id).toBeDefined();

    // 2. Raw DB verification: Additional Work exists in additional_works
    const rawAddWork = await pgClient.query<{ id: string; text: string; daily_record_id: string }>(
      'SELECT id, text, "dailyRecordId" as daily_record_id FROM additional_works WHERE id = $1',
      [addWork.id]
    );
    expect(rawAddWork.rows.length).toBe(1);
    expect(rawAddWork.rows[0].daily_record_id).toBe(record!.id);

    // 3. Raw DB verification: Commitments table still contains exactly 2 commitments (not 3, not 4)
    const commitCount = await pgClient.query<{ count: string }>(
      'SELECT count(*) FROM commitments WHERE "dailyRecordId" = $1',
      [record!.id]
    );
    expect(Number(commitCount.rows[0].count)).toBe(2);
  });

  it('P2A-DAC-04: EOD Outcome Persistence — should persist EOD status & commitment outcomes in real PostgreSQL', async () => {
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    const record = await prisma.dailyAccountabilityRecord.findFirst({
      where: { employeeUserId: bob!.id },
      orderBy: { createdAt: 'desc' },
      include: { commitments: { orderBy: { sequenceNo: 'asc' } } },
    });
    expect(record).not.toBeNull();

    const commit1 = record!.commitments[0];
    const commit2 = record!.commitments[1];

    // 1. Submit EOD Check-in (within EOD window)
    vi.setSystemTime(new Date('2026-10-07T17:30:00+07:00'));
    const eodResult = await dailyService.submitEodCheckin(bob!.id, record!.id, {
      commitmentOutcomes: [
        {
          commitmentId: commit1.id,
          outcome: CommitmentOutcome.Completed,
          continuation: Continuation.DoNotContinue,
        },
        {
          commitmentId: commit2.id,
          outcome: CommitmentOutcome.PartiallyCompleted,
          continuation: Continuation.Continue,
          continuationReason: 'Will complete remaining tasks tomorrow morning',
        },
      ],
      finalStatus: DailyStatus.AMBER,
    });

    expect(eodResult).toBeDefined();

    // 2. Raw PostgreSQL verification: daily record updated with final_status
    const rawRecord = await pgClient.query<{ final_status: string; eod_submitted_at: Date | null }>(
      'SELECT "finalStatus" as final_status, "eodSubmittedAt" as eod_submitted_at FROM daily_accountability_records WHERE id = $1',
      [record!.id]
    );
    expect(rawRecord.rows[0].eod_submitted_at).not.toBeNull();
    expect(rawRecord.rows[0].final_status).toBe('AMBER');

    // 3. Raw PostgreSQL verification: commitments have outcomes and continuation
    const rawCommit1 = await pgClient.query<{ outcome: string; continuation: string }>(
      'SELECT outcome, continuation FROM commitments WHERE id = $1',
      [commit1.id]
    );
    expect(rawCommit1.rows[0].outcome).toBe('Completed');
    expect(rawCommit1.rows[0].continuation).toBe('DoNotContinue');

    const rawCommit2 = await pgClient.query<{ outcome: string; continuation: string }>(
      'SELECT outcome, continuation FROM commitments WHERE id = $1',
      [commit2.id]
    );
    expect(rawCommit2.rows[0].outcome).toBe('PartiallyCompleted');
    expect(rawCommit2.rows[0].continuation).toBe('Continue');
  });
});
