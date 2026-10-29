import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Visual Verification & Enterprise Layout Fidelity (Desktop 1440px & Mobile 375px)', () => {
  const artifactsDir = 'C:/Users/LOQ/.gemini/antigravity/brain/088b33f6-5e17-4b53-85dc-110770e55ffd';

  test('01. Verifikasi Login Employee mendarat di Morning Commitment dengan Sidebar 232px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');

    // Login sebagai EMPLOYEE
    await page.fill('#login-email', 'dev.frontend@dutamedia.com');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');

    // Mendarat di /daily/morning (BUKAN /dashboard)
    await page.waitForURL((url) => url.pathname.includes('/daily/morning'), { timeout: 15000 });
    expect(page.url()).toContain('/daily/morning');

    // Sidebar 232px permanen terpasang
    const sidebar = page.locator('[data-testid="enterprise-sidebar"]');
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box?.width).toBe(232);

    // Verifikasi brand mark WP dan Dutamedia Intranet
    await expect(page.locator('.brand-mark')).toHaveText('WP');
    await expect(page.locator('.brand-name')).toHaveText('WorkPulse');

    // Pastikan grup navigasi Workspace aktif
    await expect(page.locator('[data-testid="nav-group-workspace"]')).toBeVisible();

    // Pastikan TIDAK ADA tombol melayang ☰ Menu di pojok kiri bawah
    const floatingBtn = page.locator('.nav-toggle');
    expect(await floatingBtn.count()).toBe(0);

    // Ambil screenshot bukti visual
    const employeeImgPath = path.join(artifactsDir, 'visual_evidence_employee_morning_1440.png');
    await page.screenshot({ path: employeeImgPath, fullPage: false });
    console.log('Employee visual verification saved to:', employeeImgPath);
  });

  test('02. Verifikasi Login Supervisor mendarat di Pulse Dashboard dengan Sidebar 232px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');

    // Login sebagai SUPERVISOR
    await page.fill('#login-email', 'lead.tech@dutamedia.com');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');

    // Mendarat di /dashboard (Team Pulse)
    await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');

    // Sidebar 232px permanen terpasang
    const sidebar = page.locator('[data-testid="enterprise-sidebar"]');
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box?.width).toBe(232);

    // Verifikasi grup Management terlihat untuk Supervisor
    await expect(page.locator('[data-testid="nav-group-management"]')).toBeVisible();

    // Verifikasi profil pengguna di kaki sidebar
    await expect(page.locator('.user-name')).toContainText('Bambang Pratama');

    // Pastikan TIDAK ADA tombol melayang ☰ Menu
    const floatingBtn = page.locator('.nav-toggle');
    expect(await floatingBtn.count()).toBe(0);

    // Ambil screenshot bukti visual
    const supervisorImgPath = path.join(artifactsDir, 'visual_evidence_supervisor_dashboard_1440.png');
    await page.screenshot({ path: supervisorImgPath, fullPage: false });
    console.log('Supervisor visual verification saved to:', supervisorImgPath);
  });

  test('03. Verifikasi Tampilan Responsif Mobile 375px (Drawer Off-Canvas)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');

    // Login sebagai SUPERVISOR
    await page.fill('#login-email', 'lead.tech@dutamedia.com');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 15000 });

    // Pada mobile, sidebar tersembunyi off-canvas
    const sidebar = page.locator('[data-testid="enterprise-sidebar"]');
    // Buka drawer dengan tombol toggle mobile
    const toggleBtn = page.locator('.mobile-hamburger-btn');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/mobile-open/);

    const mobileImgPath = path.join(artifactsDir, 'visual_evidence_mobile_375.png');
    await page.screenshot({ path: mobileImgPath, fullPage: false });
    console.log('Mobile visual verification saved to:', mobileImgPath);
  });
});

