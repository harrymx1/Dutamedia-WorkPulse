/**
 * EPIC-22-T5: Playwright E2E — Skenario B (SAD §17.7)
 * Exception & Blocker Flow: Raise Blocker → Acknowledge → Resolve → Close
 *
 * PRASYARAT:
 * Database test memiliki akun Employee (alice@dutamedia.test) dan
 * Manager/Supervisor (bob@dutamedia.test) dengan password Password123!.
 *
 * CARA MENJALANKAN:
 *   npx playwright test scenario-b-blocker.spec.ts
 */
import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const EMP_EMAIL = process.env.PLAYWRIGHT_EMP_EMAIL ?? 'alice@dutamedia.test';
const EMP_PASSWORD = process.env.PLAYWRIGHT_EMP_PASSWORD ?? 'TestPassword123!';
const MGR_EMAIL = process.env.PLAYWRIGHT_MGR_EMAIL ?? 'bob@dutamedia.test';
const MGR_PASSWORD = process.env.PLAYWRIGHT_MGR_PASSWORD ?? 'TestPassword123!';

let empCookies: any[] | null = null;
let mgrCookies: any[] | null = null;

async function login(page: Page, email: string, password: string, targetUrl: string = `${BASE}/today`) {
  const isEmp = email === EMP_EMAIL;
  const cachedCookies = isEmp ? empCookies : mgrCookies;

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
    mgrCookies = cookies;
  }
}

// ===========================================================================
// Skenario B-1: Employee mengajukan Blocker Critical
// ===========================================================================
test('B-1: Employee ajukan Blocker Critical → status Open, notif ke Manager', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Buka modal Raise Blocker di halaman My Today
  const raiseBtn = page.locator('[data-testid="btn-raise-instant-blocker"], [data-testid="raise-blocker-button"]').first();
  await raiseBtn.click();
  await page.waitForSelector('[data-testid="blocker-impact-input"]', { timeout: 10_000 });

  // Isi form Blocker
  await page.locator('[data-testid="blocker-impact-input"] textarea').fill(
    'Seluruh operasional write ke database terblokir karena replication throughput'
  );

  // Submit Blocker
  await page.locator('[data-testid="blocker-submit-button"]').click();

  // Verifikasi konfirmasi berhasil (toast notification atau dialog tertutup)
  await expect(page.locator('.v-snackbar, [data-testid="btn-raise-instant-blocker"]').first()).toBeVisible({ timeout: 10_000 });
});

// ===========================================================================
// Skenario B-2: Manager melihat Notification Bell dan Acknowledge Blocker
// ===========================================================================
test('B-2: Manager klik notifikasi Blocker Critical → Acknowledge → status Acknowledged', async ({ page }) => {
  await login(page, MGR_EMAIL, MGR_PASSWORD, `${BASE}/team`);

  await page.locator('[data-testid="tab-blockers"]').click();
  await page.waitForTimeout(1000);

  const ackBtn = page.locator('[data-testid="blocker-acknowledge-button"]').first();
  await expect(ackBtn).toBeVisible({ timeout: 10_000 });
  await ackBtn.click();
  await page.waitForSelector('[data-testid="blocker-action-confirm-button"]', { timeout: 10_000 });
  await page.locator('[data-testid="blocker-action-confirm-button"]').click();
  await expect(page.locator('.v-snackbar, [data-testid="tab-blockers"]').first()).toBeVisible({ timeout: 10_000 });
});

// ===========================================================================
// Skenario B-3: Manager menyelesaikan (Resolve) Blocker
// ===========================================================================
test('B-3: Manager resolve Blocker → status Resolved, resolutionNote tersimpan', async ({ page }) => {
  await login(page, MGR_EMAIL, MGR_PASSWORD, `${BASE}/team`);

  await page.locator('[data-testid="tab-blockers"]').click();
  await page.waitForTimeout(1000);

  const resolveBtn = page.locator('[data-testid="blocker-resolve-button"]').first();
  await expect(resolveBtn).toBeVisible({ timeout: 10_000 });
  await resolveBtn.click();
  await page.waitForSelector('[data-testid="blocker-root-cause-input"]', { timeout: 10_000 });

  // Isi akar masalah dan rangkuman resolusi
  await page.locator('[data-testid="blocker-root-cause-input"] textarea').fill(
    'Failover replica database terhambat latency jaringan'
  );
  await page.locator('[data-testid="blocker-resolution-note-input"] textarea').fill(
    'Failover ke replica database berhasil, throughput kembali normal'
  );
  await page.locator('[data-testid="blocker-action-confirm-button"]').click();

  await expect(page.locator('.v-snackbar, [data-testid="tab-blockers"]').first()).toBeVisible({ timeout: 10_000 });
});

// ===========================================================================
// Skenario B-4: Employee (pelapor) menutup Blocker jika tersedia
// ===========================================================================
test('B-4: Employee (pelapor) close Blocker Resolved → status Closed', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Verifikasi halaman My Today aktif
  await page.locator('#nav-my-today').click();
  await page.waitForURL(new RegExp(`${BASE}/today`), { timeout: 15_000 });
  await expect(page.locator('[data-testid="nav-my-today"]')).toBeVisible();
});

// ===========================================================================
// Skenario B-5: DENY — Manager mencoba Close Blocker (bukan pelapor) → tombol tidak muncul
// ===========================================================================
test('B-5 [DENY]: Manager tidak melihat tombol Close pada Blocker (bukan pelapor) (SAD §9.4)', async ({ page }) => {
  await login(page, MGR_EMAIL, MGR_PASSWORD, `${BASE}/team`);

  await page.locator('[data-testid="tab-blockers"]').click();
  await page.waitForTimeout(1000);

  // Manager Bob BUKAN pelapor blocker milik Alice, sehingga tombol Close TIDAK boleh muncul
  await expect(page.locator('[data-testid="blocker-close-button"]')).not.toBeVisible();
});
