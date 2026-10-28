import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env.test before any test execution
const envTestPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envTestPath });

const databaseUrl = process.env.DATABASE_URL || '';

// Fail-closed safety invariant check
if (!databaseUrl || databaseUrl.includes('supabase.co') || databaseUrl.includes('pooler.supabase.com')) {
  throw new Error(
    `FATAL SAFETY VIOLATION: Integration test runner detected invalid or Supabase DATABASE_URL! (${databaseUrl.replace(/:[^:@]+@/, ':***@')}) Aborting tests.`
  );
}

const parsed = new URL(databaseUrl);
const allowedHosts = ['localhost', '127.0.0.1', 'test-db'];
if (!allowedHosts.includes(parsed.hostname)) {
  throw new Error(`FATAL SAFETY VIOLATION: Target host '${parsed.hostname}' is not authorized for test execution.`);
}

if (parsed.port && parsed.port !== '54332' && parsed.port !== '5432') {
  throw new Error(`FATAL SAFETY VIOLATION: Target port '${parsed.port}' is not authorized for test execution.`);
}

console.log(`[Integration Test Runner] Verified isolated database connection: ${parsed.protocol}//${parsed.username}@${parsed.hostname}:${parsed.port}${parsed.pathname}`);
