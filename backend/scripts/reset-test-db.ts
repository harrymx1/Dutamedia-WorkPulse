import { resetTestDatabase } from '../src/common/safety/test-db-reset';

async function run() {
  try {
    console.log('[reset-test-db] Memulai reset basis data pengujian...');
    resetTestDatabase();
    console.log('[reset-test-db] Sukses mereset basis data pengujian secara deterministik.');
  } catch (error: any) {
    console.error('[reset-test-db] GAGAL:', error.message);
    process.exit(1);
  }
}

run();

