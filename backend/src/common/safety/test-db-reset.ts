import { TestDatabaseSafetyGuard } from './test-db-guard';
import { execSync } from 'child_process';

/**
 * Utilitas untuk mereset basis data pengujian secara deterministik.
 * Memastikan proteksi mutlak terhadap database produksi/pengembangan non-test.
 */
export function resetTestDatabase(databaseUrl?: string): void {
  const targetUrl = databaseUrl || process.env.DATABASE_URL;
  TestDatabaseSafetyGuard.validate(targetUrl);

  // Jalankan reset migrasi secara deterministik (Prisma 7 standard)
  execSync('npx prisma migrate reset --force', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: targetUrl },
  });
}

