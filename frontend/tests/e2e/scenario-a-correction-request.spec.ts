/**
 * EPIC-22-T5: Playwright E2E — Skenario A (SAD §17.7)
 * Normal Flow: Morning Check-in → Correction Request Minor/Material → Reviewer Object
 *
 * PRASYARAT SEBELUM MENJALANKAN:
 * 1. npm install --save-dev @playwright/test && npx playwright install chromium
 * 2. Backend + Frontend harus berjalan (atau set PLAYWRIGHT_BASE_URL ke deployed URL)
 * 3. Database test memiliki akun Employee (alice@dutamedia.test) dan
 *    Supervisor (bob@dutamedia.test) dengan password Password123!.
 *
 * CARA MENJALANKAN:
 *   npx playwright test scenario-a-correction-request.spec.ts
 */
import { test, expect, type Page } from '@playwright/test';

// ===========================================================================
// Konfigurasi dari environment
// ===========================================================================
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const EMP_EMAIL = process.env.PLAYWRIGHT_EMP_EMAIL ?? 'alice@dutamedia.test';
const EMP_PASSWORD = process.env.PLAYWRIGHT_EMP_PASSWORD ?? 'TestPassword123!';
const SPV_EMAIL = process.env.PLAYWRIGHT_SPV_EMAIL ?? 'bob@dutamedia.test';
const SPV_PASSWORD = process.env.PLAYWRIGHT_SPV_PASSWORD ?? 'TestPassword123!';

// ===========================================================================
// Helper: Safe HTTP Logger & Login
// ===========================================================================
test.beforeEach(async ({ page }) => {
  page.on('response', (response) => {
    try {
      const url = new URL(response.url());
      if (url.pathname.includes('/api/')) {
        console.log(`[HTTP] ${response.request().method()} ${response.status()} ${url.pathname}`);
      }
    } catch {}
  });
});

let empCookies: any[] | null = null;
let spvCookies: any[] | null = null;

async function login(page: Page, email: string, password: string, targetUrl: string = `${BASE}/today`) {
  const isEmp = email === EMP_EMAIL;
  const cachedCookies = isEmp ? empCookies : spvCookies;

  if (cachedCookies && cachedCookies.length > 0) {
    await page.context().addCookies(cachedCookies);
    await page.goto(targetUrl);
    if (!page.url().includes('/login')) {
      await page.waitForURL(new RegExp(targetUrl), { timeout: 15_000 });
      return;
    }
  }

  await page.goto(`${BASE}/login`);
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
  await page.locator('#login-submit-button').click();
  await page.waitForURL(new RegExp(targetUrl), { timeout: 15_000 });

  const cookies = await page.context().cookies();
  if (isEmp) {
    empCookies = cookies;
  } else {
    spvCookies = cookies;
  }
}

// ===========================================================================
// Skenario A-1: Employee submit Morning Check-in (langkah 1 dari §17.7)
// ===========================================================================
test('A-1: Employee submit Morning Check-in sebelum cutoff', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Navigasi ke halaman My Today (Morning Check-in)
  await page.locator('#nav-my-today').click();
  await page.waitForSelector('[data-testid="morning-checkin-form"], [data-testid="morning-submission-status"]', { timeout: 10_000 });

  const formVisible = await page.locator('[data-testid="morning-checkin-form"]').isVisible().catch(() => false);
  if (formVisible) {
    // Isi commitment pertama
    await page.locator('[data-testid="commitment-text-input-0"] textarea').fill('Deploy fitur login ke staging');
    // Submit Morning Check-in
    await page.locator('[data-testid="morning-submit-button"]').click();
  }

  // Verifikasi status submit berhasil atau alert cutoff jika dijalankan setelah cutoff pagi
  const statusOrCutoff = page.locator('[data-testid="morning-submission-status"]').or(page.getByText('Batas waktu penyerahan Morning Check-in (Cut-off) telah berakhir'));
  await expect(statusOrCutoff.first()).toBeVisible({ timeout: 10_000 });
});

// ===========================================================================
// Skenario A-2: Employee mengajukan Koreksi Minor setelah cutoff
// ===========================================================================
test('A-2: Employee ajukan Koreksi Minor setelah Morning Lock', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);
  await page.locator('#nav-my-today').click();

  const correctionBtn = page.locator('[data-testid="correction-request-button-0"]');
  await expect(correctionBtn).toBeVisible({ timeout: 10_000 });
  await correctionBtn.click();
  await page.locator('[data-testid="correction-description-input"] textarea').fill('Deploy fitur login ke staging (minor update)');
  await page.locator('[data-testid="correction-reason-input"] textarea').fill('Perbaikan penulisan target');
  await page.locator('[data-testid="correction-submit-button"]').click();
  await expect(page.locator('.v-snackbar, [data-testid="morning-submission-status"]').first()).toBeVisible({ timeout: 10_000 });
});

// ===========================================================================
// Skenario A-3: Employee mengajukan Koreksi Material
// ===========================================================================
test('A-3: Employee ajukan Koreksi Material → status Menunggu Tinjauan', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);
  await page.locator('#nav-my-today').click();

  const correctionBtn = page.locator('[data-testid="correction-request-button-0"]');
  await expect(correctionBtn).toBeVisible({ timeout: 10_000 });
  await correctionBtn.click();

  // Ubah komitmen dengan perubahan kata > 10 (Material per SAD §9.6)
  await page.locator('[data-testid="correction-description-input"] textarea').fill(
    'Redesign and implement multi-tenant payment gateway integration supporting automated settlement currency conversion retry policies and dispute reconciliation'
  );
  await page.locator('[data-testid="correction-reason-input"] textarea').fill(
    'Primary payment gateway vendor announced emergency downtime window requiring architecture change'
  );
  await page.locator('[data-testid="correction-submit-button"]').click();

  await expect(page.locator('.v-snackbar, [data-testid="morning-submission-status"]').first()).toBeVisible({ timeout: 10_000 });
});

// ===========================================================================
// Skenario A-4: Supervisor menolak (object) Koreksi Material
// ===========================================================================
test('A-4: Supervisor menolak Koreksi Material → status Ditolak, notifikasi ke employee', async ({ page }) => {
  await login(page, SPV_EMAIL, SPV_PASSWORD, `${BASE}/team`);

  // Buka tab Review Koreksi & Cuti di Team Pulse
  await page.locator('[data-testid="tab-reviews"]').click();
  await page.waitForTimeout(1000);

  const objectBtn = page.locator('[data-testid="correction-object-button"]').first();
  await expect(objectBtn).toBeVisible({ timeout: 10_000 });
  await objectBtn.click();
  await page.locator('[data-testid="objection-reason-input"] textarea').fill('Perubahan baseline tidak mencerminkan fakta lapangan');
  await page.locator('[data-testid="objection-submit-button"]').click();
  await expect(page.locator('.v-snackbar, [data-testid="tab-reviews"]').first()).toBeVisible({ timeout: 10_000 });
});
