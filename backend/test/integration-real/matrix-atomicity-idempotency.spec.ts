import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { PrismaClient, DailyStatus, SubmissionTiming } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

describe('Real PostgreSQL Integration Matrix: Transaction Atomicity & Idempotency', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;

  beforeAll(async () => {
    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');
    const adapter = new PrismaPg({ connectionString: cleanUrl, ssl: false });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-ATM-01: Transaction Atomicity — multi-table transaction commits all rows atomically in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const targetDate = new Date('2026-12-01T00:00:00Z');

    let createdRecordId: string = '';

    // Atomic multi-table write inside Prisma $transaction
    await prisma.$transaction(async (tx) => {
      const record = await tx.dailyAccountabilityRecord.create({
        data: {
          employeeUserId: alice!.id,
          workDate: targetDate,
          orgContextSnapshot: { department: 'Engineering' },
          policySnapshot: { morningCutoff: '09:30' },
          morningSubmittedAt: new Date(),
          morningTiming: SubmissionTiming.OnTime,
          initialStatus: DailyStatus.GREEN,
        },
      });
      createdRecordId = record.id;

      await tx.commitment.create({
        data: {
          dailyRecordId: record.id,
          sequenceNo: 1,
          text: 'Atomic transaction commitment #1',
          initialRisk: DailyStatus.GREEN,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: alice!.id,
          action: 'DAILY_RECORD_ATOMIC_TEST',
          relatedEntityType: 'DailyAccountabilityRecord',
          relatedEntityId: record.id,
        },
      });
    });

    // Verify all 3 tables have the rows in PostgreSQL
    const resRecord = await pgClient.query('SELECT count(*) FROM daily_accountability_records WHERE id = $1', [createdRecordId]);
    const resCommit = await pgClient.query('SELECT count(*) FROM commitments WHERE "dailyRecordId" = $1', [createdRecordId]);
    const resAudit = await pgClient.query('SELECT count(*) FROM audit_logs WHERE "relatedEntityId" = $1', [createdRecordId]);

    expect(Number(resRecord.rows[0].count)).toBe(1);
    expect(Number(resCommit.rows[0].count)).toBe(1);
    expect(Number(resAudit.rows[0].count)).toBe(1);

    // Cleanup
    await prisma.dailyAccountabilityRecord.delete({ where: { id: createdRecordId } });
    await prisma.auditLog.deleteMany({ where: { relatedEntityId: createdRecordId } });
  });

  it('P2A-ATM-02: Transaction Rollback — controlled error rolls back all pending mutations in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const rollbackDate = new Date('2026-12-02T00:00:00Z');
    let rollbackRecordId: string = '';

    // Attempt multi-table write that deliberately fails before commit
    await expect(
      prisma.$transaction(async (tx) => {
        const record = await tx.dailyAccountabilityRecord.create({
          data: {
            employeeUserId: alice!.id,
            workDate: rollbackDate,
            orgContextSnapshot: { department: 'Engineering' },
            policySnapshot: { morningCutoff: '09:30' },
            morningSubmittedAt: new Date(),
            morningTiming: SubmissionTiming.OnTime,
            initialStatus: DailyStatus.GREEN,
          },
        });
        rollbackRecordId = record.id;

        await tx.commitment.create({
          data: {
            dailyRecordId: record.id,
            sequenceNo: 1,
            text: 'Should be rolled back',
            initialRisk: DailyStatus.GREEN,
          },
        });

        // Trigger controlled failure inside transaction block
        throw new Error('SIMULATED_CONTROLLED_TRANSACTION_FAILURE');
      })
    ).rejects.toThrow('SIMULATED_CONTROLLED_TRANSACTION_FAILURE');

    // Verify raw PostgreSQL: ZERO rows exist for either table
    const checkRecord = await pgClient.query('SELECT count(*) FROM daily_accountability_records WHERE id = $1', [rollbackRecordId]);
    const checkCommit = await pgClient.query('SELECT count(*) FROM commitments WHERE "dailyRecordId" = $1', [rollbackRecordId]);

    expect(Number(checkRecord.rows[0].count)).toBe(0);
    expect(Number(checkCommit.rows[0].count)).toBe(0);
  });

  it('P2A-ATM-03: Sequential Idempotency — repeated deterministic operations yield stable state without duplicates', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });

    // 1. Initial count of Alice's organizational assignments
    const initialCount = await prisma.organizationalAssignment.count({
      where: { userId: alice!.id },
    });

    // 2. Query Alice's active context twice sequentially
    const firstContext = await prisma.organizationalAssignment.findFirst({
      where: {
        userId: alice!.id,
        effectiveDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    const secondContext = await prisma.organizationalAssignment.findFirst({
      where: {
        userId: alice!.id,
        effectiveDate: { lte: new Date() },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    expect(firstContext).not.toBeNull();
    expect(secondContext).not.toBeNull();
    expect(firstContext?.id).toBe(secondContext?.id);

    // 3. Verify total assignments count in PostgreSQL did not change
    const afterCount = await prisma.organizationalAssignment.count({
      where: { userId: alice!.id },
    });
    expect(afterCount).toBe(initialCount);
  });
});
