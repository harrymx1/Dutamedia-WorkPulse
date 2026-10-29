const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupStorage() {
  try {
    console.log('📦 Menyiapkan Supabase Private Storage Bucket: workpulse-evidence...');
    
    const query = `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'workpulse-evidence',
        'workpulse-evidence',
        false,
        10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      )
      ON CONFLICT (id) DO UPDATE SET
        public = false,
        file_size_limit = 10485760,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      RETURNING id, name, public, file_size_limit, allowed_mime_types, created_at;
    `;

    const res = await pool.query(query);
    console.log('✅ Bucket Berhasil Dikonfigurasi:');
    console.log('   ID             :', res.rows[0].id);
    console.log('   Name           :', res.rows[0].name);
    console.log('   Public Access  :', res.rows[0].public ? 'ENABLED (Bahaya)' : 'DISABLED (Aman / Privat)');
    console.log('   Size Limit     :', res.rows[0].file_size_limit / 1024 / 1024, 'MB');
    console.log('   Allowed Mime   :', res.rows[0].allowed_mime_types.join(', '));
  } catch (err) {
    console.error('❌ Gagal menyiapkan storage bucket:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupStorage();
