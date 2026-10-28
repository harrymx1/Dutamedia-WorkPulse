import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { TestDatabaseSafetyGuard } from '../../src/common/safety/test-db-guard';

describe('Database Integration: Anti-Backdating Triggers (TC-BKD-01, TC-BKD-02, TC-BKD-03)', () => {
  const dbUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:test_password_secure@localhost:54332/workpulse_test';

  let client: pg.Client | null = null;
  let isConnected = false;

  beforeAll(async () => {
    try {
      TestDatabaseSafetyGuard.validate(dbUrl);
      client = new pg.Client({ connectionString: dbUrl, connectionTimeoutMillis: 1000 });
      await client.connect();

      // Memastikan skema baseline diterapkan jika tabel belum ada di DB test
      const check = await client.query("SELECT to_regclass('public.users') as tbl");
      if (!check.rows[0].tbl) {
        const migrationPath = path.resolve(
          __dirname,
          '../../prisma/migrations/20261028000000_baseline_schema_and_triggers/migration.sql',
        );
        if (fs.existsSync(migrationPath)) {
          const sql = fs.readFileSync(migrationPath, 'utf8');
          await client.query(sql);
        }
      }

      isConnected = true;
    } catch {
      // Database not reachable in this offline/isolated local environment
      isConnected = false;
    }
  });

  afterAll(async () => {
    if (client && isConnected) {
      await client.end();
    }
  });

  it('TC-BKD-01: INSERT penugasan dengan tanggal lampau ditolak BACKDATING_FORBIDDEN', async (ctx) => {
    if (!isConnected || !client) {
      ctx.skip();
      return;
    }

    await client.query("SET app.org_timezone = 'Asia/Jakarta'");

    const uniqueEmail1 = `test-backdate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@dutamedia.test`;
    // Buat dummy user untuk FK
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, status)
       VALUES ('Integration Test User', $1, 'ACTIVE')
       RETURNING id`,
      [uniqueEmail1],
    );
    const userId = userRes.rows[0].id;

    // Coba insert dengan effective_date = '2020-01-01' (pasti lampau)
    let error: any = null;
    try {
      await client.query(
        `INSERT INTO organizational_assignments 
         (user_id, job_title, role, function, effective_date, assignment_reason, created_by_user_id)
         VALUES ($1, 'Software Engineer', 'EMPLOYEE', 'Engineering', '2020-01-01', 'Test Past Date', $1)`,
        [userId],
      );
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.message).toContain('BACKDATING_FORBIDDEN');
    expect(error.code).toBe('P0001');
  });

  it('TC-BKD-02: INSERT penugasan dengan tanggal hari ini berhasil disimpan', async (ctx) => {
    if (!isConnected || !client) {
      ctx.skip();
      return;
    }

    await client.query("SET app.org_timezone = 'Asia/Jakarta'");

    const uniqueEmail2 = `test-today-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@dutamedia.test`;
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, status)
       VALUES ('Integration Test User Today', $1, 'ACTIVE')
       RETURNING id`,
      [uniqueEmail2],
    );
    const userId = userRes.rows[0].id;

    const todayStr = new Date().toISOString().split('T')[0];

    const result = await client.query(
      `INSERT INTO organizational_assignments 
       (user_id, job_title, role, function, effective_date, assignment_reason, created_by_user_id)
       VALUES ($1, 'Senior Engineer', 'EMPLOYEE', 'Engineering', $2, 'Test Today Date', $1)
       RETURNING id, effective_date`,
      [userId, todayStr],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBeDefined();
  });

  it('TC-BKD-03: UPDATE end_date pada penugasan lama berhasil (tidak diblokir trigger)', async (ctx) => {
    if (!isConnected || !client) {
      ctx.skip();
      return;
    }

    await client.query("SET app.org_timezone = 'Asia/Jakarta'");

    const uniqueEmail3 = `test-update-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@dutamedia.test`;
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, status)
       VALUES ('Integration Test User Update', $1, 'ACTIVE')
       RETURNING id`,
      [uniqueEmail3],
    );
    const userId = userRes.rows[0].id;
    const todayStr = new Date().toISOString().split('T')[0];

    const insertRes = await client.query(
      `INSERT INTO organizational_assignments 
       (user_id, job_title, role, function, effective_date, assignment_reason, created_by_user_id)
       VALUES ($1, 'Lead Engineer', 'HEAD', 'Engineering', $2, 'Initial Assignment', $1)
       RETURNING id`,
      [userId, todayStr],
    );
    const assignmentId = insertRes.rows[0].id;

    // UPDATE end_date untuk menutup masa penugasan
    const updateRes = await client.query(
      `UPDATE organizational_assignments 
       SET end_date = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, end_date`,
      [todayStr, assignmentId],
    );

    expect(updateRes.rows).toHaveLength(1);
    expect(updateRes.rows[0].end_date).toBeDefined();
  });
});

