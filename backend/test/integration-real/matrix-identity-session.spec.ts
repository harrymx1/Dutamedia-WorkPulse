import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { PrismaClient, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

describe('Real PostgreSQL Integration Matrix: Identity & Session', () => {
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

  it('P2A-ID-01: User Persistence — should create, read, and update user status in real PostgreSQL', async () => {
    const testEmail = `temp.user.${Date.now()}@dutamedia.test`;
    const passwordHash = await argon2.hash('SecurePassword123!');

    // 1. Create User via Prisma
    const created = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Integration Test User',
        passwordHash,
        status: UserStatus.Active,
        mustResetPassword: false,
      },
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe(testEmail);

    // 2. Verify direct persistence in PostgreSQL via raw pg client
    const rawRes = await pgClient.query<{ id: string; email: string; status: string }>(
      'SELECT id, email, status FROM users WHERE id = $1',
      [created.id]
    );
    expect(rawRes.rows.length).toBe(1);
    expect(rawRes.rows[0].email).toBe(testEmail);
    expect(rawRes.rows[0].status).toBe('Active');

    // 3. Update status to Inactive
    const updated = await prisma.user.update({
      where: { id: created.id },
      data: { status: UserStatus.Inactive },
    });
    expect(updated.status).toBe(UserStatus.Inactive);

    const rawUpdated = await pgClient.query<{ status: string }>(
      'SELECT status FROM users WHERE id = $1',
      [created.id]
    );
    expect(rawUpdated.rows[0].status).toBe('Inactive');

    // Cleanup
    await prisma.user.delete({ where: { id: created.id } });
  });

  it('P2A-ID-02: Session Persistence — should persist active session with expiration in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({
      where: { email: 'alice@dutamedia.test' },
    });
    expect(alice).not.toBeNull();

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

    // 1. Create Session
    const session = await prisma.session.create({
      data: {
        userId: alice!.id,
        userAgent: 'IntegrationTestRunner/1.0',
        expiresAt,
      },
    });

    expect(session.id).toBeDefined();
    expect(session.revokedAt).toBeNull();

    // 2. Query Session via raw PostgreSQL
    const rawSession = await pgClient.query<{ id: string; user_id: string; revoked_at: Date | null; expires_at: Date }>(
      'SELECT id, "userId" as user_id, "revokedAt" as revoked_at, "expiresAt" as expires_at FROM sessions WHERE id = $1',
      [session.id]
    );
    expect(rawSession.rows.length).toBe(1);
    expect(rawSession.rows[0].user_id).toBe(alice!.id);
    expect(rawSession.rows[0].revoked_at).toBeNull();
    expect(rawSession.rows[0].expires_at).toBeDefined();
    expect(new Date(rawSession.rows[0].expires_at).getTime()).toBeGreaterThan(Date.now());

    // Cleanup
    await prisma.session.delete({ where: { id: session.id } });
  });

  it('P2A-ID-03: Session Revocation — should persist revokedAt and reject revoked session in real PostgreSQL', async () => {
    const alice = await prisma.user.findUnique({
      where: { email: 'alice@dutamedia.test' },
    });

    const session = await prisma.session.create({
      data: {
        userId: alice!.id,
        userAgent: 'RevocationTest/1.0',
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    // 1. Revoke Session
    const revokedAt = new Date();
    const updated = await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt },
    });
    expect(updated.revokedAt).not.toBeNull();

    // 2. Verify raw PostgreSQL persistence
    const rawRes = await pgClient.query<{ revoked_at: Date | null }>(
      'SELECT "revokedAt" as revoked_at FROM sessions WHERE id = $1',
      [session.id]
    );
    expect(rawRes.rows[0].revoked_at).not.toBeNull();

    // 3. Verify Active Session lookup filter (SAD §8.4: session must not be revoked)
    const activeLookup = await prisma.session.findFirst({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    expect(activeLookup).toBeNull();

    // Cleanup
    await prisma.session.delete({ where: { id: session.id } });
  });
});
