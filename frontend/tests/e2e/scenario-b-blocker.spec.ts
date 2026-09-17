/**
 * EPIC-22-T5: Playwright E2E — Skenario B (SAD §17.7)
 * Exception & Blocker Flow: Raise Blocker → Acknowledge → Resolve → Close
 *
 * PRASYARAT: Sama dengan scenario-a-correction-request.spec.ts
 * Set ENV: PLAYWRIGHT_MGR_EMAIL dan PLAYWRIGHT_MGR_PASSWORD untuk Manager role.
 *
 * CARA MENJALANKAN:
 *   npx playwright test scenario-b-blocker.spec.ts --headed
 */
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const EMP_EMAIL = process.env.PLAYWRIGHT_EMP_EMAIL ?? 'alice@dutamedia.com';
const EMP_PASSWORD = process.env.PLAYWRIGHT_EMP_PASSWORD ?? 'changeme';
const MGR_EMAIL = process.env.PLAYWRIGHT_MGR_EMAIL ?? 'bob.manager@dutamedia.com';
const MGR_PASSWORD = process.env.PLAYWRIGHT_MGR_PASSWORD ?? 'changeme';

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
  await page.locator('#login-submit-button').click();
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 15_000 });
}

// ===========================================================================
// Skenario B-1: Employee mengajukan Blocker Critical
// ===========================================================================
test('B-1: Employee ajukan Blocker Critical → status Open, notif ke Manager', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Navigasi ke halaman Blockers
  await page.locator('#nav-blockers').click();
  await page.locator('[data-testid="raise-blocker-button"]').click();

  // Isi form Blocker
  await page.locator('[data-testid="blocker-type-input"]').fill('Database primary node unreachable');
  await page.locator('[data-testid="blocker-severity-select"]').click();
  await page.locator('[data-testid="severity-option-Critical"]').click();
  await page.locator('[data-testid="blocker-impact-input"]').fill('Seluruh operasional write ke database terblokir');
  await page.locator('[data-testid="blocker-owner-type-select"]').click();
  await page.locator('[data-testid="owner-type-OrganizationalAuthority"]').click();
  await page.locator('[data-testid="blocker-submit-button"]').click();

  // Verifikasi Blocker Card muncul dengan status Open
  await expect(page.locator('[data-testid="blocker-card-status"]').first()).toContainText('Open', { timeout: 10_000 });
  await expect(page.locator('[data-testid="blocker-severity-badge"]').first()).toContainText('Critical');
});

// ===========================================================================
// Skenario B-2: Manager melihat Notification Bell dan Acknowledge Blocker
// ===========================================================================
test('B-2: Manager klik notifikasi Blocker Critical → Acknowledge → status Acknowledged', async ({ page }) => {
  await login(page, MGR_EMAIL, MGR_PASSWORD);

  // Klik Notification Bell
  await page.locator('[data-testid="notification-bell"]').click();
  await page.waitForSelector('[data-testid="notification-panel"]', { timeout: 10_000 });

  // Cari notifikasi BLOCKER_CRITICAL_RAISED
  await expect(page.locator('[data-testid="notification-item-BLOCKER_CRITICAL_RAISED"]').first()).toBeVisible();

  // Klik notifikasi untuk navigasi ke Blocker detail
  await page.locator('[data-testid="notification-item-BLOCKER_CRITICAL_RAISED"]').first().click();
  await page.waitForSelector('[data-testid="blocker-detail-card"]', { timeout: 10_000 });

  // Klik tombol Acknowledge
  await page.locator('[data-testid="blocker-acknowledge-button"]').click();

  // Verifikasi status berubah ke Acknowledged
  await expect(page.locator('[data-testid="blocker-detail-status"]')).toContainText('Acknowledged', { timeout: 10_000 });

  // Tombol Resolve dan Update sekarang tampil (availableActions)
  await expect(page.locator('[data-testid="blocker-resolve-button"]')).toBeVisible();
  await expect(page.locator('[data-testid="blocker-update-button"]')).toBeVisible();
});

// ===========================================================================
// Skenario B-3: Manager menyelesaikan (Resolve) Blocker
// ===========================================================================
test('B-3: Manager resolve Blocker → status Resolved, resolutionNote tersimpan', async ({ page }) => {
  await login(page, MGR_EMAIL, MGR_PASSWORD);

  // Navigasi langsung ke halaman Blockers
  await page.locator('#nav-blockers').click();

  // Klik pada Blocker Acknowledged pertama
  await page.locator('[data-testid="blocker-card-Acknowledged"]:first-child').click();
  await page.waitForSelector('[data-testid="blocker-detail-card"]', { timeout: 10_000 });

  // Klik Resolve
  await page.locator('[data-testid="blocker-resolve-button"]').click();

  // Isi resolution note
  await page.locator('[data-testid="blocker-resolution-note-input"]').fill('Failover ke replica database berhasil, layanan kembali normal');
  await page.locator('[data-testid="blocker-resolve-confirm-button"]').click();

  // Verifikasi status Resolved
  await expect(page.locator('[data-testid="blocker-detail-status"]')).toContainText('Resolved', { timeout: 10_000 });

  // Resolution note tampil di UI
  await expect(page.locator('[data-testid="blocker-resolution-note"]')).toContainText('Failover ke replica');
});

// ===========================================================================
// Skenario B-4: Employee (pelapor) menutup Blocker
// ===========================================================================
test('B-4: Employee (pelapor) close Blocker Resolved → status Closed', async ({ page }) => {
  await login(page, EMP_EMAIL, EMP_PASSWORD);

  // Navigasi ke Blockers milik sendiri
  await page.locator('#nav-blockers').click();

  // Klik pada Blocker Resolved pertama (yang diajukan oleh employee ini)
  await page.locator('[data-testid="blocker-card-Resolved"]:first-child').click();
  await page.waitForSelector('[data-testid="blocker-detail-card"]', { timeout: 10_000 });

  // Tombol Close hanya tampil untuk pelapor (raisedByUserId)
  await expect(page.locator('[data-testid="blocker-close-button"]')).toBeVisible();
  await page.locator('[data-testid="blocker-close-button"]').click();

  // Konfirmasi dialog
  await page.locator('[data-testid="blocker-close-confirm-button"]').click();

  // Verifikasi status Closed
  await expect(page.locator('[data-testid="blocker-detail-status"]')).toContainText('Ditutup', { timeout: 10_000 });

  // Semua tombol aksi harus hilang (tidak ada transisi dari Closed)
  await expect(page.locator('[data-testid="blocker-acknowledge-button"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="blocker-resolve-button"]')).not.toBeVisible();
});

// ===========================================================================
// Skenario B-5: DENY — Manager mencoba Close Blocker (bukan pelapor) → tombol tidak muncul
// ===========================================================================
test('B-5 [DENY]: Manager tidak melihat tombol Close pada Blocker (bukan pelapor) (SAD §9.4)', async ({ page }) => {
  await login(page, MGR_EMAIL, MGR_PASSWORD);
  await page.locator('#nav-blockers').click();

  // Klik pada Blocker Resolved pertama
  await page.locator('[data-testid="blocker-card-Resolved"]:first-child').click();
  await page.waitForSelector('[data-testid="blocker-detail-card"]', { timeout: 10_000 });

  // Manager TIDAK boleh melihat tombol Close (hanya pelapor)
  await expect(page.locator('[data-testid="blocker-close-button"]')).not.toBeVisible();
});
