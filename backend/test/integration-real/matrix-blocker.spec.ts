import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import {
  PrismaClient,
  BlockerSeverity,
  BlockerStatus,
  OwnerNeededType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { BlockerService } from '../../src/modules/blocker/services/blocker.service.js';
import { BlockerOwnerResolverService } from '../../src/modules/blocker/services/blocker-owner-resolver.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { PolicyService } from '../../src/modules/policy/policy.service.js';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { NotificationService } from '../../src/modules/notification/notification.service.js';

describe('Real PostgreSQL Integration Matrix: Blocker Lifecycle', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let blockerService: BlockerService;

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
    const blockerOwnerResolver = new BlockerOwnerResolverService(prisma as any);

    blockerService = new BlockerService(
      prisma as any,
      auditService,
      policyService,
      scopeFilterService,
      notificationService,
      blockerOwnerResolver
    );
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-BLK-01: Sequential Full Blocker Lifecycle — Open → Acknowledged → InProgress → Resolved → Closed', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();

    // 1. Create Blocker by Alice (Organizational Authority -> Bob)
    const blocker = await blockerService.createBlocker(alice!.id, {
      type: 'Technical',
      impact: 'Blocks integration test executions',
      severity: BlockerSeverity.Critical,
      ownerNeededType: OwnerNeededType.OrganizationalAuthority,
    });

    expect(blocker.id).toBeDefined();
    expect(blocker.status).toBe(BlockerStatus.Open);
    expect(blocker.ownerNeededUserId).toBe(bob!.id);

    // Verify Open in PostgreSQL
    const rawOpen = await pgClient.query<{ status: string; owner_needed_user_id: string }>(
      'SELECT status, "ownerNeededUserId" as owner_needed_user_id FROM blockers WHERE id = $1',
      [blocker.id]
    );
    expect(rawOpen.rows[0].status).toBe('Open');
    expect(rawOpen.rows[0].owner_needed_user_id).toBe(bob!.id);

    // 2. Bob acknowledges blocker (Open -> Acknowledged)
    const acked = await blockerService.acknowledge(bob!.id, blocker.id);
    expect(acked.status).toBe(BlockerStatus.Acknowledged);
    expect(acked.acknowledgedAt).not.toBeNull();

    const rawAck = await pgClient.query<{ status: string; acknowledged_at: Date | null }>(
      'SELECT status, "acknowledgedAt" as acknowledged_at FROM blockers WHERE id = $1',
      [blocker.id]
    );
    expect(rawAck.rows[0].status).toBe('Acknowledged');
    expect(rawAck.rows[0].acknowledged_at).not.toBeNull();

    // 3. Bob updates to InProgress (Acknowledged -> InProgress)
    const inProgress = await blockerService.updateProgress(bob!.id, blocker.id, {
      progressNote: 'Investigating max_connections and transaction leak',
    });
    expect(inProgress.status).toBe(BlockerStatus.InProgress);

    const rawProgress = await pgClient.query<{ status: string }>(
      'SELECT status FROM blockers WHERE id = $1',
      [blocker.id]
    );
    expect(rawProgress.rows[0].status).toBe('InProgress');

    // 4. Bob resolves blocker (InProgress -> Resolved)
    const resolved = await blockerService.resolve(bob!.id, blocker.id, {
      resolutionNote: 'Increased connection pool size to 100 with tmpfs fast-commit',
    });
    expect(resolved.status).toBe(BlockerStatus.Resolved);
    expect(resolved.resolvedAt).not.toBeNull();

    const rawResolved = await pgClient.query<{ status: string; resolved_at: Date | null }>(
      'SELECT status, "resolvedAt" as resolved_at FROM blockers WHERE id = $1',
      [blocker.id]
    );
    expect(rawResolved.rows[0].status).toBe('Resolved');
    expect(rawResolved.rows[0].resolved_at).not.toBeNull();

    // 5. Alice closes blocker (Resolved -> Closed)
    const closed = await blockerService.close(alice!.id, blocker.id);
    expect(closed.status).toBe(BlockerStatus.Closed);
    expect(closed.closedAt).not.toBeNull();

    const rawClosed = await pgClient.query<{ status: string; closed_at: Date | null }>(
      'SELECT status, "closedAt" as closed_at FROM blockers WHERE id = $1',
      [blocker.id]
    );
    expect(rawClosed.rows[0].status).toBe('Closed');
    expect(rawClosed.rows[0].closed_at).not.toBeNull();

    // Cleanup
    await prisma.blocker.delete({ where: { id: blocker.id } });
  });

  it('P2A-BLK-02: Project Authority Blocker Mapping & Accepted Risk terminal state', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });

    // 1. Create Blocker with Project Authority for 'Billing-Core-Module' (resolves to Bob)
    const blocker = await blockerService.createBlocker(alice!.id, {
      type: 'External',
      impact: 'Low impact until next quarter',
      severity: BlockerSeverity.Low,
      ownerNeededType: OwnerNeededType.ProjectAuthority,
      relatedScopeReference: 'Billing-Core-Module',
    });

    expect(blocker.ownerNeededUserId).toBe(bob!.id);
    expect(blocker.ownerNeededType).toBe(OwnerNeededType.ProjectAuthority);

    // 2. Bob acknowledges blocker
    await blockerService.acknowledge(bob!.id, blocker.id);

    // 3. Bob marks as AcceptedRisk
    const acceptedRisk = await blockerService.acceptRisk(bob!.id, blocker.id, {
      resolutionNote: 'Risk accepted per business SLA roadmap',
    });
    expect(acceptedRisk.status).toBe(BlockerStatus.AcceptedRisk);

    // Verify in raw PostgreSQL
    const rawRisk = await pgClient.query<{ status: string }>(
      'SELECT status FROM blockers WHERE id = $1',
      [blocker.id]
    );
    expect(rawRisk.rows[0].status).toBe('AcceptedRisk');

    // Cleanup
    await prisma.blocker.delete({ where: { id: blocker.id } });
  });
});
