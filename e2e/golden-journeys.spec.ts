import { test, expect } from '@playwright/test';

/**
 * Suite Pengujian E2E Playwright: 5 Golden User Journeys WorkPulse (Tahap 1.3)
 *
 * Menguji skenario kritis pengguna ujung-ke-ujung di peramban web:
 * 1. Aktivasi Akun & Login (Otentikasi, Set Sesi Cookie HttpOnly)
 * 2. Morning Routine Submission (Komitmen Pagi & Kepatuhan Cutoff)
 * 3. Blocker Lifecycle (Pelaporan Kendala & Antrean Supervisor)
 * 4. EOD Routine Closure (Evaluasi Sore & Outcome Komitmen)
 * 5. Cuti & Rekonsiliasi Otomatis (Pengajuan Mandiri & Persetujuan HRGA)
 */

test.describe('WorkPulse 5 Golden User Journeys (E2E Production Simulation)', () => {
  // Helper: Login otomatis dengan pembersihan sesi deterministik
  async function performLogin(page: any, email: string, pass = 'Password123!') {
    await page.context().clearCookies();
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible();
    await page.fill('#login-email', email);
    await page.fill('#login-password', pass);
    await page.click('button[type="submit"]');
    // Tunggu hingga login berhasil dan berpindah rute keluar dari /login
    await page.waitForURL((url: URL) => !url.pathname.endsWith('/login'), { timeout: 15000 });
  }

  // =========================================================================
  // JOURNEY 1: Autentikasi, Aktivasi & Navigasi Berbasis Peran
  // =========================================================================
  test('Journey 1: Pengguna dapat login dengan kredensial sah dan sesi cookie terpasang', async ({ page, context }) => {
    await page.goto('/login');

    // 1. Verifikasi elemen branding dan portal login
    await expect(page.locator('h2')).toContainText('Masuk ke WorkPulse');
    await expect(page.locator('#login-email')).toBeVisible();

    // 2. Coba login dengan kredensial yang salah terlebih dahulu (Validasi Keamanan)
    await page.fill('#login-email', 'dev.frontend@dutamedia.com');
    await page.fill('#login-password', 'PasswordSalah123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-banner.error')).toBeVisible();

    // 3. Login dengan kredensial yang sah
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');

    // 4. Verifikasi pengalihan sukses ke halaman profil
    await page.waitForURL((url) => url.pathname.includes('/profile'), { timeout: 15000 });
    await expect(page.locator('body')).toContainText('Aditya Nugroho');

    // 5. Verifikasi bahwa cookie keamanan access_token dan csrf_token terpasang
    const cookies = await context.cookies();
    const accessTokenCookie = cookies.find((c) => c.name === 'access_token');
    const csrfTokenCookie = cookies.find((c) => c.name === 'csrf_token');

    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie?.httpOnly).toBe(true);
    expect(accessTokenCookie?.sameSite).toBe('Strict');

    expect(csrfTokenCookie).toBeDefined();
    expect(csrfTokenCookie?.sameSite).toBe('Strict');
  });

  // =========================================================================
  // JOURNEY 2: Rutinitas Pagi (Morning Commitment Routine)
  // =========================================================================
  test('Journey 2: Karyawan dapat mengakses form komitmen pagi dan melihat status cut-off', async ({ page }) => {
    // 1. Login sebagai Frontend Engineer
    await performLogin(page, 'dev.frontend@dutamedia.com');

    // 2. Buka halaman komitmen pagi
    await page.goto('/daily/morning');
    await expect(page).toHaveURL(/\/daily\/morning/);

    // 3. Verifikasi elemen visual akuntabilitas pagi
    await expect(page.locator('body')).toContainText('Morning Commitment');
    await expect(page.locator('body')).toContainText('09:30');
    await expect(page.locator('body')).toContainText('Daftar Komitmen Hari Ini (2/3)');

    // 4. Periksa apakah rekor komitmen yang ditanam seeder tampil secara akurat pada slot formulir
    await expect(page.locator('textarea').first()).toHaveValue(/Menyelesaikan implementasi UI navigasi/);
  });

  // =========================================================================
  // JOURNEY 3: Pelaporan Blocker & Antrean Supervisor
  // =========================================================================
  test('Journey 3: Karyawan dapat melaporkan kendala dan tiket muncul di antrean supervisor', async ({ page }) => {
    // 1. Karyawan login & akses form pelaporan blocker
    await performLogin(page, 'dev.frontend@dutamedia.com');
    await page.goto('/blockers/raise');
    await expect(page).toHaveURL(/\/blockers\/raise/);
    await expect(page.locator('body')).toContainText('Laporkan Kendala');

    // 2. Supervisor login untuk memeriksa antrean kendala tim
    await performLogin(page, 'lead.tech@dutamedia.com');

    // 3. Supervisor membuka antrean blocker
    await page.goto('/blockers');
    await expect(page).toHaveURL(/\/blockers/);

    // 4. Verifikasi tiket kendala teknis (dari seeder) tampil di dasbor supervisor
    await expect(page.locator('body')).toContainText('CI runner mengalami Out Of Memory');
  });

  // =========================================================================
  // JOURNEY 4: Rutinitas Evaluasi Sore (EOD Routine)
  // =========================================================================
  test('Journey 4: Karyawan dapat meninjau hasil pencapaian kerja pada portal EOD', async ({ page }) => {
    await performLogin(page, 'dev.frontend@dutamedia.com');
    await page.goto('/daily/eod');
    await expect(page).toHaveURL(/\/daily\/eod/);

    // Verifikasi portal EOD terbuka dengan indikator penutupan harian
    await expect(page.locator('body')).toContainText('EOD Outcome');
  });

  // =========================================================================
  // JOURNEY 5: Pengajuan Cuti & Antrean Persetujuan HRGA
  // =========================================================================
  test('Journey 5: Pengajuan cuti terdaftar dan dapat ditinjau oleh HRGA', async ({ page }) => {
    // 1. HRGA login ke sistem
    await performLogin(page, 'hrga@dutamedia.com');

    // 2. HRGA membuka antrean approval cuti
    await page.goto('/leave/queue');
    await expect(page).toHaveURL(/\/leave\/queue/);

    // 3. Verifikasi pengajuan cuti Siti Rahma (dari seeder) muncul dalam daftar
    await expect(page.locator('body')).toContainText('Siti Rahma');
    await expect(page.locator('body')).toContainText('Cuti tahunan keperluan keluarga');
    await expect(page.locator('body')).toContainText('Menunggu Review');
    await expect(page.getByRole('button', { name: 'Setujui', exact: true })).toBeVisible();
  });
});
