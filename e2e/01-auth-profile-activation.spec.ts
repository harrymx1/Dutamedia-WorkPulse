import { test, expect } from '@playwright/test';
import { performLogin, logoutViaNav } from './helpers/auth';
import { resetCalonKaryawan } from './helpers/db';

/**
 * Suite E2E 01: Siklus Otentikasi, Aktivasi Akun, Pengaturan Profil & Keamanan Sandi
 */
test.describe('E2E 01: Auth, Activation, Profile & Security Lifecycle', () => {
  test.beforeEach(async () => {
    await resetCalonKaryawan();
  });
  test('Aktivasi Akun Calon Karyawan dengan Token Undangan 72 Jam', async ({ page }) => {
    // 1. Kunjungi halaman aktivasi dengan token seeder
    await page.goto('/activate?token=wp_seed_invite_token_72h_demo_secret');
    await expect(page.locator('h2')).toContainText('Aktivasi Akun');

    // 2. Uji validasi ketidakcocokan konfirmasi kata sandi
    await page.fill('#activate-password', 'NewHirePass123!');
    await page.fill('#activate-confirm', 'MismatchedPass123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error-msg')).toContainText('Konfirmasi kata sandi tidak cocok.');

    // 3. Masukkan konfirmasi yang cocok dan aktifkan akun
    await page.fill('#activate-confirm', 'NewHirePass123!');
    await page.click('button[type="submit"]');

    // 4. Verifikasi layar sukses aktivasi muncul
    await expect(page.locator('.result-state-card')).toBeVisible();
    await expect(page.locator('.result-state-card h3')).toContainText('Aktivasi Berhasil!');

    // 5. Login menggunakan akun yang baru saja diaktifkan
    await page.click('text=Lanjut ke Halaman Masuk');
    await page.waitForURL((url) => url.pathname.includes('/login'));

    await page.fill('#login-email', 'calon.karyawan@dutamedia.com');
    await page.fill('#login-password', 'NewHirePass123!');
    await page.click('button[type="submit"]');

    // 6. Verifikasi sukses login dan mendarat di Dashboard
    await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 15000 });
    await expect(page.locator('[data-testid="nav-toggle"]')).toBeVisible();
  });

  test('Validasi Form Login & Keamanan Cookie HttpOnly Strict', async ({ page, context }) => {
    await page.context().clearCookies();
    await page.goto('/login');

    // 1. Uji login kosong
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error-msg').first()).toBeVisible();
    await expect(page.getByText('Alamat email wajib diisi.')).toBeVisible();

    // 2. Uji email tidak valid
    await page.fill('#login-email', 'bukan-email');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Format alamat email tidak valid.')).toBeVisible();

    // 3. Uji kata sandi salah
    await page.fill('#login-email', 'dev.frontend@dutamedia.com');
    await page.fill('#login-password', 'KataSandiSalah123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-banner.error')).toBeVisible();

    // 4. Login sah
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');

    // 5. Mendarat di /dashboard (Bukan /profile)
    await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 15000 });

    // 6. Verifikasi atribut keamanan cookie HttpOnly SameSite=Strict
    const cookies = await context.cookies();
    const accessToken = cookies.find((c) => c.name === 'access_token');
    const csrfToken = cookies.find((c) => c.name === 'csrf_token');

    expect(accessToken).toBeDefined();
    expect(accessToken?.httpOnly).toBe(true);
    expect(accessToken?.sameSite).toBe('Strict');
    expect(csrfToken).toBeDefined();
    expect(csrfToken?.sameSite).toBe('Strict');
  });

  test('Profil Akun: Ganti Kata Sandi & Verifikasi Login Ulang', async ({ page }) => {
    await performLogin(page, 'dev.frontend@dutamedia.com');

    // 1. Akses halaman profil via menu global
    await page.click('[data-testid="nav-toggle"]');
    await expect(page.locator('[data-testid="nav-drawer"]')).toBeVisible();
    await page.click('a[href="/profile"]');
    await page.waitForURL((url) => url.pathname.includes('/profile'));

    // 2. Verifikasi data pengguna di profil
    await expect(page.locator('.profile-layout')).toContainText('Aditya Nugroho (Frontend Engineer)');
    await expect(page.locator('.profile-layout')).toContainText('dev.frontend@dutamedia.com');

    // 3. Coba ganti kata sandi dengan konfirmasi salah
    await page.fill('#current-pwd', 'Password123!');
    await page.fill('#new-pwd', 'BaruPass123!');
    await page.fill('#confirm-pwd', 'SalahConfirm123!');
    await page.click('button:has-text("Perbarui Kata Sandi")');
    await expect(page.locator('.alert-banner.error')).toContainText('Konfirmasi kata sandi baru tidak cocok.');

    // 4. Ubah kata sandi ke BaruPass123!
    await page.fill('#confirm-pwd', 'BaruPass123!');
    await page.click('button:has-text("Perbarui Kata Sandi")');
    await expect(page.locator('.alert-banner.success')).toBeVisible();

    // 5. Logout dari sistem
    await logoutViaNav(page);

    // 6. Pastikan login dengan password lama gagal
    await page.fill('#login-email', 'dev.frontend@dutamedia.com');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-banner.error')).toBeVisible();

    // 7. Login dengan password baru berhasil
    await page.fill('#login-password', 'BaruPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname.includes('/dashboard'));

    // 8. Kembalikan kata sandi ke Password123! agar pengujian lain tetap konsisten
    await page.goto('/profile');
    await page.fill('#current-pwd', 'BaruPass123!');
    await page.fill('#new-pwd', 'Password123!');
    await page.fill('#confirm-pwd', 'Password123!');
    await page.click('button:has-text("Perbarui Kata Sandi")');
    await expect(page.locator('.alert-banner.success')).toBeVisible();
  });
});
