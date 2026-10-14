import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ScopeFilterService } from '../../src/modules/authorization/services/scope-filter.service.js';
import { ProjectAuthorityService } from '../../src/modules/authorization/services/project-authority.service.js';
import { IdentityService } from '../../src/modules/identity/identity.service.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';

describe('Real PostgreSQL Integration Matrix: Organization, Effective Dating & Scope', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;
  let scopeFilterService: ScopeFilterService;
  let projectAuthorityService: ProjectAuthorityService;
  let identityService: IdentityService;

  beforeAll(async () => {
    pgClient = new pg.Client({ connectionString: databaseUrl });
    await pgClient.connect();

    const cleanUrl = databaseUrl.replace(/[?&]sslmode=require/g, '');
    const adapter = new PrismaPg({ connectionString: cleanUrl, ssl: false });
    prisma = new PrismaClient({ adapter });
    await prisma.$connect();

    const auditService = new AuditService(prisma as any);
    scopeFilterService = new ScopeFilterService(prisma as any);
    projectAuthorityService = new ProjectAuthorityService(prisma as any);
    identityService = new IdentityService(prisma as any, auditService);
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (pgClient) await pgClient.end();
  });

  it('P2A-ORG-01: Multi-Tier Hierarchy Persistence — should verify deterministic reporting lines in real PostgreSQL', async () => {
    const rawHierarchy = await pgClient.query<{ employee_email: string; manager_email: string }>(`
      SELECT u.email as employee_email, m.email as manager_email
      FROM organizational_assignments oa
      JOIN users u ON oa."userId" = u.id
      LEFT JOIN users m ON oa."directManagerId" = m.id
      ORDER BY u.email;
    `);

    const hierarchyMap = new Map<string, string | null>();
    for (const row of rawHierarchy.rows) {
      hierarchyMap.set(row.employee_email, row.manager_email);
    }

    // Alice -> Bob
    expect(hierarchyMap.get('alice@dutamedia.test')).toBe('bob@dutamedia.test');
    // Bob -> Carol
    expect(hierarchyMap.get('bob@dutamedia.test')).toBe('carol@dutamedia.test');
    // Carol -> Eva
    expect(hierarchyMap.get('carol@dutamedia.test')).toBe('eva@dutamedia.test');
    // Eva -> None (Top level)
    expect(hierarchyMap.get('eva@dutamedia.test')).toBeNull();
  });

  it('P2A-ORG-02: Effective Dating AS-OF Evaluation — should select correct assignment based on effective dates in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    const carol = await prisma.user.findUnique({ where: { email: 'carol@dutamedia.test' } });

    // Seed historical assignment for Alice (2025-01-01 to 2025-12-31 reporting to Carol)
    const historicalAssignment = await prisma.organizationalAssignment.create({
      data: {
        userId: alice!.id,
        role: Role.Employee,
        function: 'QualityAssurance',
        directManagerId: carol!.id,
        effectiveDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-12-31T23:59:59Z'),
        createdByUserId: bob!.id,
      },
    });

    // 1. Query AS OF 2025-06-15 (Historical): should return QualityAssurance under Carol
    const pastContext = await identityService.resolveActiveContext(alice!.id, new Date('2025-06-15T00:00:00Z'));
    expect(pastContext).not.toBeNull();
    expect(pastContext?.function).toBe('QualityAssurance');
    expect(pastContext?.directManagerId).toBe(carol!.id);

    // 2. Query AS OF Current Date (2026): should return Engineering under Bob
    const currentContext = await identityService.resolveActiveContext(alice!.id, new Date('2026-10-07T00:00:00Z'));
    expect(currentContext).not.toBeNull();
    expect(currentContext?.function).toBe('Engineering');
    expect(currentContext?.directManagerId).toBe(bob!.id);

    // Cleanup
    await prisma.organizationalAssignment.delete({ where: { id: historicalAssignment.id } });
  });

  it('P2A-ORG-03: Project Authority Mapping — should confirm authority for mapped scope in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    const dave = await prisma.user.findUnique({ where: { email: 'dave@dutamedia.test' } });

    // 1. Bob has Project Authority for 'Billing-Core-Module'
    const resPa = await projectAuthorityService.resolveAuthority(
      bob!.id,
      alice!.id,
      'Billing-Core-Module'
    );
    expect(resPa.authorized).toBe(true);
    expect(resPa.authorityType).toBe('ProjectAuthority');

    // 2. Dave (HRGA) does not have Project Authority for 'Billing-Core-Module' and is not Alice's direct manager
    const resDave = await projectAuthorityService.resolveAuthority(
      dave!.id,
      alice!.id,
      'Billing-Core-Module'
    );
    expect(resDave.authorized).toBe(false);

    // 3. Fallback to Organizational Authority when scopeReference is not matching
    const resFallback = await projectAuthorityService.resolveAuthority(
      bob!.id,
      alice!.id,
      'Unmapped-Scope-XYZ'
    );
    expect(resFallback.authorized).toBe(true);
    expect(resFallback.authorityType).toBe('OrganizationalAuthority');
  });

  it('P2A-ORG-04: Scope Filtering — should enforce proper scope per role using real PostgreSQL data', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@dutamedia.test' } });
    const bob = await prisma.user.findUnique({ where: { email: 'bob@dutamedia.test' } });
    const dave = await prisma.user.findUnique({ where: { email: 'dave@dutamedia.test' } });
    const admin = await prisma.user.findUnique({ where: { email: 'admin@dutamedia.test' } });

    // Employee scope: sees only self
    const empScope = await scopeFilterService.getAccessibleUserIds({
      userId: alice!.id,
      role: Role.Employee,
      email: alice!.email,
    } as any);
    expect(empScope).toEqual([alice!.id]);

    // Supervisor scope: sees self + direct subordinates from PostgreSQL
    const mgrScope = await scopeFilterService.getAccessibleUserIds({
      userId: bob!.id,
      role: Role.Supervisor_TL,
      email: bob!.email,
    } as any);
    expect(mgrScope).not.toBeNull();
    expect(mgrScope).toContain(bob!.id);
    expect(mgrScope).toContain(alice!.id);

    // HRGA scope: company-wide (returns null as unrestricted filter)
    const hrScope = await scopeFilterService.getAccessibleUserIds({
      userId: dave!.id,
      role: Role.HRGA,
      email: dave!.email,
    } as any);
    expect(hrScope).toBeNull();

    // SystemAdmin: forbidden on operational business records
    await expect(
      scopeFilterService.getAccessibleUserIds({
        userId: admin!.id,
        role: Role.SystemAdmin,
        email: admin!.email,
      } as any)
    ).rejects.toThrow();
  });
});
