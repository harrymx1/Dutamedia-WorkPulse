import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:test_password_secure@localhost:54332/workpulse_test';

const pool = new Pool({ connectionString });

export async function resetCalonKaryawan() {
  await pool.query(`
    UPDATE users
    SET status = 'INVITED', password_hash = NULL
    WHERE email = 'calon.karyawan@dutamedia.com';
    
    UPDATE user_invitations
    SET status = 'PENDING', used_at = NULL
    WHERE user_id IN (SELECT id FROM users WHERE email = 'calon.karyawan@dutamedia.com');
  `);
}

export async function resetDesignerDaily() {
  await pool.query(`
    DELETE FROM daily_accountability_records
    WHERE user_id IN (SELECT id FROM users WHERE email = 'designer@dutamedia.com');
  `);
}

export async function unlockMorningCommitment() {
  await pool.query(`
    UPDATE policies
    SET configuration_values = jsonb_set(
      jsonb_set(configuration_values, '{morningLockCutoff}', '"23:59"'),
      '{morningOnTimeCutoff}', '"23:50"'
    )
    WHERE category = 'CHECKIN_TIMING';
  `);
}

export async function lockMorningCommitment() {
  await pool.query(`
    UPDATE policies
    SET configuration_values = jsonb_set(
      jsonb_set(configuration_values, '{morningLockCutoff}', '"09:30"'),
      '{morningOnTimeCutoff}', '"09:00"'
    )
    WHERE category = 'CHECKIN_TIMING';
  `);
}

export async function resetLeaveRequests() {
  await pool.query(`
    DELETE FROM leave_requests
    WHERE reason LIKE '%mendesak%';
    DELETE FROM bounded_exemptions
    WHERE official_reference_number = 'SK/HRGA/2026/088';
  `);
}

export async function closePool() {
  await pool.end();
}
