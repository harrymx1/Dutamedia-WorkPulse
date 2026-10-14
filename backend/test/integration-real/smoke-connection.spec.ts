import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

describe('Real PostgreSQL Test Environment Smoke Verification', () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  let pgClient: pg.Client;
  let prisma: PrismaClient;

  beforeAll(async () => {
    expect(databaseUrl).toContain('workpulse_test');
    expect(databaseUrl).not.toContain('supabase');

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

  it('1. should connect to real PostgreSQL 18 container on port 54332', async () => {
    const res = await pgClient.query('SELECT version(), current_database() as db_name, current_user as u_name;');
    expect(res.rows[0].version).toContain('PostgreSQL 18');
    expect(res.rows[0].db_name).toBe('workpulse_test');
    expect(res.rows[0].u_name).toBe('postgres');
  });

  it('2. should verify existing migrations and table structure on isolated test DB', async () => {
    const res = await pgClient.query(`
      SELECT count(*)::int as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    // WorkPulse has 18 domain/system tables + _prisma_migrations = 19 tables
    expect(res.rows[0].table_count).toBeGreaterThanOrEqual(18);
  });

  it('3. should verify deterministic test fixtures seeded in test DB', async () => {
    const userCount = await prisma.user.count();
    expect(userCount).toBe(6);

    const alice = await prisma.user.findUnique({
      where: { email: 'alice@dutamedia.test' },
      include: { organizationalAssignments: true },
    });
    expect(alice).not.toBeNull();
    expect(alice?.fullName).toBe('Alice Employee');
    expect(alice?.organizationalAssignments.length).toBeGreaterThan(0);
    expect(alice?.organizationalAssignments[0].role).toBe('Employee');
    expect(alice?.organizationalAssignments[0].function).toBe('Engineering');
  });

  it('4. should verify AuditLog persistence with nullable actorUserId on real engine', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(2);

    const humanLog = auditLogs.find((l) => l.action === 'USER_LOGIN');
    expect(humanLog).toBeDefined();
    expect(humanLog?.actorUserId).not.toBeNull();

    const systemLog = auditLogs.find((l) => l.action === 'SYSTEM_SCHEDULER_HEARTBEAT');
    expect(systemLog).toBeDefined();
    expect(systemLog?.actorUserId).toBeNull();
  });
});
