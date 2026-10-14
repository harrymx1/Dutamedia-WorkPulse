import { execSync } from 'child_process';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env.test from backend directory
const envTestPath = path.resolve(__dirname, '../../.env.test');
dotenv.config({ path: envTestPath });

const databaseUrl = process.env.DATABASE_URL || '';

/**
 * STRICT SAFETY INVARIANT CHECK
 * Fails closed if DATABASE_URL is invalid, missing, or points to Supabase.
 */
export function assertSafeTestDatabase(url: string = databaseUrl): void {
  if (!url || typeof url !== 'string') {
    throw new Error('FATAL SAFETY VIOLATION: DATABASE_URL is not set or empty.');
  }

  // 1. Prohibit any Supabase domain or pooler
  if (
    url.includes('supabase.co') ||
    url.includes('pooler.supabase.com') ||
    url.includes('supabase.in')
  ) {
    throw new Error(
      `FATAL SAFETY VIOLATION: DATABASE_URL points to Supabase Cloud! (${url.replace(/:[^:@]+@/, ':***@')}) Aborting immediately.`
    );
  }

  // 2. Parse URL and validate host and port
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (err: any) {
    throw new Error(`FATAL SAFETY VIOLATION: Malformed DATABASE_URL: ${err.message}`);
  }

  const allowedHosts = ['localhost', '127.0.0.1', 'test-db'];
  if (!allowedHosts.includes(parsed.hostname)) {
    throw new Error(
      `FATAL SAFETY VIOLATION: Target host '${parsed.hostname}' is not an authorized test host (${allowedHosts.join(', ')}).`
    );
  }

  // Allow port 54332 (host mapping) or 5432 (inside docker/CI network)
  const allowedPorts = ['54332', '5432'];
  if (parsed.port && !allowedPorts.includes(parsed.port)) {
    throw new Error(
      `FATAL SAFETY VIOLATION: Target port '${parsed.port}' is not an authorized test port (${allowedPorts.join(', ')}).`
    );
  }

  // Ensure target database name contains 'test'
  if (!parsed.pathname.includes('test')) {
    throw new Error(
      `FATAL SAFETY VIOLATION: Target database name '${parsed.pathname}' must contain 'test'.`
    );
  }
}

/**
 * Wait until PostgreSQL server is healthy and accepting connections
 */
async function waitForDatabase(maxRetries = 30, intervalMs = 1000): Promise<void> {
  assertSafeTestDatabase();
  console.log(`[test:db:wait] Checking connection to: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = new pg.Client({ connectionString: databaseUrl });
    try {
      await client.connect();
      const res = await client.query('SELECT 1 as ready, version(), current_database() as db');
      await client.end();
      console.log(`[test:db:wait] Connected successfully! Engine: ${res.rows[0].version}`);
      console.log(`[test:db:wait] Active Database: ${res.rows[0].db}`);
      return;
    } catch (err: any) {
      try {
        await client.end();
      } catch (_) {}
      console.log(`[test:db:wait] Attempt ${attempt}/${maxRetries} failed (${err.message}). Retrying in ${intervalMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(`[test:db:wait] Database did not become ready after ${maxRetries} attempts.`);
}

/**
 * Run Prisma migrations against the safe test database
 */
function runMigrate(): void {
  assertSafeTestDatabase();
  console.log('[test:db:migrate] Executing prisma migrate deploy against isolated test DB...');
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
  console.log('[test:db:migrate] Migrations deployed successfully.');
}

/**
 * Run deterministic test seeding
 */
function runSeed(): void {
  assertSafeTestDatabase();
  console.log('[test:db:seed] Executing deterministic seed...');
  execSync('npx tsx prisma/seed.test.ts', {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
  console.log('[test:db:seed] Deterministic seed executed successfully.');
}

/**
 * Safely reset tables and re-seed
 */
async function runReset(): Promise<void> {
  assertSafeTestDatabase();
  console.log('[test:db:reset] Truncating all tables in isolated test database...');
  
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    // Truncate all non-system tables
    const tableRes = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename != '_prisma_migrations';
    `);

    if (tableRes.rows.length > 0) {
      const tableNames = tableRes.rows.map((r: any) => `"${r.tablename}"`).join(', ');
      await client.query(`TRUNCATE TABLE ${tableNames} CASCADE;`);
      console.log(`[test:db:reset] Truncated tables: ${tableNames}`);
    }
  } finally {
    await client.end();
  }

  console.log('[test:db:reset] Re-seeding deterministic fixtures...');
  runSeed();
  console.log('[test:db:reset] Reset completed successfully.');
}

// CLI Command Dispatcher
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'wait':
      await waitForDatabase();
      break;
    case 'migrate':
      runMigrate();
      break;
    case 'seed':
      runSeed();
      break;
    case 'reset':
      await runReset();
      break;
    case 'safety-check':
      assertSafeTestDatabase();
      console.log('✅ Safety Check Passed: DATABASE_URL is verified safe for test execution.');
      break;
    default:
      console.log(`Usage: tsx src/scripts/test-db-lifecycle.ts [wait|migrate|seed|reset|safety-check]`);
      process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ test-db-lifecycle failed:', err.message);
    process.exit(1);
  });
}
