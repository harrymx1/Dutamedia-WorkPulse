/**
 * EPIC-22-T5: Playwright E2E — Skenario A (SAD §17.7)
 * Normal Flow: Morning Check-in → Correction Request Minor/Material → Reviewer Object
 *
 * PRASYARAT SEBELUM MENJALANKAN:
 * 1. npm install --save-dev @playwright/test && npx playwright install chromium
 * 2. Backend + Frontend harus berjalan (atau set PLAYWRIGHT_BASE_URL ke deployed URL)
 * 3. Database test harus memiliki akun Employee (emp-alice@dutamedia.com) dan
 *    Supervisor (spv-bob@dutamedia.com) dengan password yang diketahui.
 *    Set via ENV: PLAYWRIGHT_EMP_PASSWORD dan PLAYWRIGHT_SPV_PASSWORD.
 *
 * CARA MENJALANKAN:
 *   npx playwright test scenario-a-correction-request.spec.ts --headed
 */
import { test, expect, Page } from '@playwright/test';

// ===========================================================================
// Konfigurasi dari environment
// ===========================================================================
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const EMP_EMAIL = process.env.PLAYWRIGHT_EMP_EMAIL ?? 'alice@dutamedia.com';
const EMP_PASSWORD = process.env.PLAYWRIGHT_EMP_PASSWORD ?? 'changeme';
const SPV_EMAIL = process.env.PLAYWRIGHT_SPV_EMAIL ?? 'bob@dutamedia.com';
const SPV_PASSWORD = process.env.PLAYWRIGHT_SPV_PASSWORD ?? 'changeme';

// ===========================================================================
// Helper: Login
// ===========================================================================
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
  await page.locator('#login-submit-button').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 15_000 });
}

// ===========================================================================
// Skenario A-1: Employee submit Morning Check-in (langkah 1 dari §17.7)
// ===========================================================================
test('A-1: Employee submit Morning Check-in sebelum cutoff', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Navigasi ke halaman My Today (Morning Check-in)
  await page.locator('#nav-my-today').click();
  await page.waitForSelector('[data-testid="morning-checkin-form"]', { timeout: 10_000 });

  // Isi commitment pertama
  await page.locator('[data-testid="commitment-text-input-0"]').fill('Deploy fitur login ke staging');
  await page.locator('[data-testid="commitment-risk-select-0"]').click();
  await page.locator('[data-testid="risk-option-GREEN"]').click();

  // Submit Morning Check-in
  await page.locator('[data-testid="morning-submit-button"]').click();

  // Verifikasi status submit berhasil
  await expect(page.locator('[data-testid="morning-submission-status"]')).toContainText('Terkirim', { timeout: 10_000 });
});

// ===========================================================================
// Skenario A-2: Employee mengajukan Koreksi Minor setelah cutoff
// ===========================================================================
test('A-2: Employee ajukan Koreksi Minor (referenceLink) setelah Morning Lock', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Asumsi: Morning sudah terkunci (di CI, bisa di-mock via seeded data atau override waktu)
  await page.locator('#nav-my-today').click();

  // Klik tombol koreksi pada commitment pertama
  await page.locator('[data-testid="correction-request-button-0"]').click();

  // Isi form koreksi
  await page.locator('[data-testid="correction-referenceLink-input"]').fill('https://jira/DM-corrected-999');
  await page.locator('[data-testid="correction-reason-input"]').fill('Link tiket salah, ini koreksinya');
  await page.locator('[data-testid="correction-submit-button"]').click();

  // Untuk Minor: harus langsung Applied
  await expect(page.locator('[data-testid="correction-status-badge"]')).toContainText('Diterapkan', { timeout: 10_000 });

  // Verifikasi referenceLink ter-update di tampilan komitmen
  await expect(page.locator('[data-testid="commitment-reference-link-0"]')).toContainText('DM-corrected-999');
});

// ===========================================================================
// Skenario A-3: Employee mengajukan Koreksi Material — initialRisk RED
// ===========================================================================
test('A-3: Employee ajukan Koreksi Material (initialRisk RED) → status Menunggu Tinjauan', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);
  await page.locator('#nav-my-today').click();

  await page.locator('[data-testid="correction-request-button-0"]').click();

  // Ubah initialRisk ke RED (Material)
  await page.locator('[data-testid="correction-initialRisk-select"]').click();
  await page.locator('[data-testid="risk-option-RED"]').click();
  await page.locator('[data-testid="correction-knownBlockerNote-input"]').fill('Server production down total');
  await page.locator('[data-testid="correction-reason-input"]').fill('Insiden server kritis, risiko naik');
  await page.locator('[data-testid="correction-submit-button"]').click();

  // Untuk Material: harus Pending (Menunggu Tinjauan)
  await expect(page.locator('[data-testid="correction-status-badge"]')).toContainText('Menunggu Tinjauan', { timeout: 10_000 });

  // Objection window end harus tampil
  await expect(page.locator('[data-testid="correction-objection-window"]')).toBeVisible();
});

// ===========================================================================
// Skenario A-4: Supervisor menolak (object) Koreksi Material
// ===========================================================================
test('A-4: Supervisor menolak Koreksi Material → status Ditolak, notifikasi ke employee', async ({ page }) => {
  await login(page, SPV_EMAIL, SPV_PASSWORD);

  // Navigasi ke halaman Review (Correction Requests)
  await page.locator('#nav-correction-requests').click();
  await page.waitForSelector('[data-testid="correction-request-list"]', { timeout: 10_000 });

  // Klik pada item Pending pertama
  await page.locator('[data-testid="correction-request-item-pending"]:first-child').click();

  // Klik tombol Tolak
  await page.locator('[data-testid="correction-object-button"]').click();

  // Isi alasan penolakan
  await page.locator('[data-testid="objection-reason-input"]').fill('Perubahan baseline tidak mencerminkan fakta lapangan');
  await page.locator('[data-testid="objection-submit-button"]').click();

  // Verifikasi status berubah ke Ditolak
  await expect(page.locator('[data-testid="correction-detail-status"]')).toContainText('Ditolak', { timeout: 10_000 });
});
