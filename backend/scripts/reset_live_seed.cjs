const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.production') });
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DIRECT_URL atau DATABASE_URL tidak ditemukan di .env maupun .env.production.');
  process.exit(1);
}

const isSslRequired =
  connectionString.includes('supabase.co') ||
  connectionString.includes('sslmode=require');

async function resetAndSeedLiveDatabase() {
  const pool = new Pool({
    connectionString,
    ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log('🧹 [reset_live_seed] Mengambil daftar tabel aktif (selain _prisma_migrations)...');
    const { rows } = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
      ORDER BY tablename
    `);

    if (rows.length > 0) {
      const tableList = rows.map((r) => `"${r.tablename}"`).join(', ');
      console.log(`🧹 [reset_live_seed] Mengosongkan ${rows.length} tabel demo...`);
      await pool.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
    }
  } finally {
    await pool.end();
  }

  console.log('🌱 [reset_live_seed] Menjalankan npx prisma db seed...');
  execSync('npx prisma db seed', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  console.log('✅ [reset_live_seed] Database live bersih dan siap dipakai latihan demo!');
}

resetAndSeedLiveDatabase().catch((err) => {
  console.error('❌ [reset_live_seed] Gagal mereset & mengisi seed database:', err);
  process.exit(1);
});
