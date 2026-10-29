import { expect, Page } from '@playwright/test';

/**
 * Helper Otentikasi dan Navigasi untuk Playwright E2E WorkPulse
 */
export async function performLogin(page: Page, email: string, password = 'Password123!') {
  await page.context().clearCookies();
  await page.goto('/login');
  await expect(page.locator('#login-email')).toBeVisible();
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.click('button[type="submit"]');
  // Menunggu navigasi sukses keluar dari halaman login
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 });
}

export async function logoutViaNav(page: Page) {
  // Buka menu shell jika belum terbuka
  const toggle = page.locator('[data-testid="nav-toggle"]');
  if (await toggle.isVisible()) {
    await toggle.click();
    await page.locator('[data-testid="nav-logout"]').click();
  } else {
    // Logout alternatif via endpoint auth
    await page.goto('/profile');
    const exitBtn = page.getByRole('button', { name: /Keluar/i }).first();
    if (await exitBtn.isVisible()) {
      await exitBtn.click();
    }
  }
  await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 15000 });
}

