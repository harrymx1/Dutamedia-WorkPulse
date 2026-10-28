import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { PrismaClient, PolicyCategory, PolicyStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PolicyService } from '../../src/modules/policy/policy.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';

describe('Real PostgreSQL Integration Matrix: Policy Domain', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let policyService: PolicyService;

  beforeAll(async () => {
    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');
    const adapter = new PrismaPg({ connectionString: cleanUrl, ssl: false });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    const auditService = new AuditService(prisma as any);
    policyService = new PolicyService(prisma as any, auditService);
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-POL-01: Policy Resolution — should resolve active policies across categories in real PostgreSQL', async () => {
    const activePolicies = await policyService.getActivePolicies({});
    expect(activePolicies.length).toBeGreaterThanOrEqual(5);

    const categories = activePolicies.map((p) => p.category);
    expect(categories).toContain(PolicyCategory.Cutoff);
    expect(categories).toContain(PolicyCategory.ObjectionWindowDuration);
    expect(categories).toContain(PolicyCategory.EscalationThreshold);
    expect(categories).toContain(PolicyCategory.RetentionPeriod);

    // Verify raw query match with quoted "endDate"
    const rawRes = await pgClient.query<{ category: string; status: string }>(
      'SELECT category, status FROM policies WHERE status = \'Active\' AND "endDate" IS NULL'
    );
    expect(rawRes.rows.length).toBeGreaterThanOrEqual(5);
  });

  it('P2A-POL-02: Policy Versioning & Effective Dating — should close previous version and insert new active policy', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@dutamedia.test' } });
    expect(admin).not.toBeNull();

    // 1. Create a custom category policy for test
    const initialEffective = new Date('2026-01-01T00:00:00Z');
    const initialPolicy = await prisma.policy.create({
      data: {
        category: PolicyCategory.GracePeriod,
        value: { morningGraceMinutes: 15, eodGraceMinutes: 15 },
        effectiveDate: initialEffective,
        status: PolicyStatus.Active,
        createdByUserId: admin!.id,
      },
    });

    // 2. Update Policy: Create new version effective from 2026-11-01
    const newEffective = '2026-11-01T00:00:00.000Z';
    const updatedPolicy = await policyService.createPolicy(
      {
        category: PolicyCategory.GracePeriod,
        value: { morningGraceMinutes: 45, eodGraceMinutes: 45 },
        effectiveDate: newEffective,
      },
      admin!.id
    );

    expect(updatedPolicy.id).toBeDefined();
    expect(updatedPolicy.effectiveDate.toISOString().split('T')[0]).toBe('2026-11-01');

    // 3. Verify in PostgreSQL that the initial policy now has "endDate" set
    const oldVersionRaw = await pgClient.query<{ end_date: Date | null; status: string }>(
      'SELECT "endDate" as end_date, status FROM policies WHERE id = $1',
      [initialPolicy.id]
    );
    expect(oldVersionRaw.rows[0].end_date).not.toBeNull();

    // 4. Verify historical query AS OF 2026-06-01 resolves initial version
    const pastResolved = await policyService.getActivePolicies({
      category: PolicyCategory.GracePeriod,
      asOfDate: '2026-06-01T00:00:00.000Z',
    });
    expect(pastResolved.length).toBe(1);
    expect(pastResolved[0].id).toBe(initialPolicy.id);

    // 5. Verify future query AS OF 2026-11-15 resolves updated version
    const futureResolved = await policyService.getActivePolicies({
      category: PolicyCategory.GracePeriod,
      asOfDate: '2026-11-15T00:00:00.000Z',
    });
    expect(futureResolved.length).toBe(1);
    expect(futureResolved[0].id).toBe(updatedPolicy.id);

    // Cleanup
    await prisma.policy.deleteMany({
      where: { id: { in: [initialPolicy.id, updatedPolicy.id] } },
    });
  });

  it('P2A-POL-03: ReminderThreshold Resolution — should query ReminderThreshold category in real PostgreSQL without enum error', async () => {
    // Verify getActivePolicySnapshot with ReminderThreshold runs without PostgreSQL enum error
    const snapshot = await policyService.getActivePolicySnapshot(
      [PolicyCategory.ReminderThreshold],
      new Date(),
    );

    expect(snapshot[PolicyCategory.ReminderThreshold]).toBeDefined();
    expect(snapshot[PolicyCategory.ReminderThreshold]).toEqual({
      objectionWindowReminderHours: 2,
      leavePendingReminderHours: 24,
    });

    // Verify raw query in PostgreSQL pg_enum directly
    const res = await pgClient.query<{ enumlabel: string }>(
      "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'PolicyCategory' AND enumlabel = 'ReminderThreshold';"
    );
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].enumlabel).toBe('ReminderThreshold');
  });
});
