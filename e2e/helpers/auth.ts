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
  const logoutBtn = page.locator('[data-testid="nav-logout"]');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    const toggle = page.locator('[data-testid="nav-toggle"]');
    if (await toggle.count() && (await toggle.isVisible())) {
      await toggle.click();
    }
    await logoutBtn.click();
  }
  await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 15000 });
}

