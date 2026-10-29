import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/auth';

/**
 * Suite E2E 06: Tata Kelola Administrasi Sistem & Laporan Eksekutif (Governance & Reports)
 * Menguji peran SYSTEM_ADMIN (manajemen pengguna, org tree, kebijakan, notifikasi)
 * dan CEO_MANAGEMENT (dashboard eksekutif, analisis risiko proyek, laporan kinerja).
 */
test.describe('E2E 06: Admin Governance & Executive Reports Lifecycle', () => {
  test('Siklus Lengkap: User Invitation -> Organization Tabs -> Policy Governance -> Executive Reports', async ({
    page,
  }) => {
    // =========================================================================
    // TAHAP 1: System Admin (admin@dutamedia.com) Mengelola Pengguna & Undangan
    // =========================================================================
    await performLogin(page, 'admin@dutamedia.com');
    await page.goto('/admin/users');
    await expect(page.locator('h2')).toContainText('Kelola Pengguna');

    // Uji pencarian pengguna
    const searchInput = page.locator('input[placeholder*="Cari nama"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Aditya');
      await expect(page.locator('.table-container, tbody')).toContainText('Aditya');
      await searchInput.fill('');
    }

    // Buka modal undang pengguna baru
    await page.click('button:has-text("Undang Pengguna Baru")');
    await expect(page.locator('.modal-box')).toBeVisible();

    const uniqueEmail = `qa.engineer.${Date.now()}@dutamedia.com`;
    await page.fill('#new-fullname', 'Rizky QA Engineer');
    await page.fill('#new-email', uniqueEmail);

    // Kirim formulir pembuatan pengguna baru
    await page.click('button[type="submit"]');

    // Verifikasi token aktivasi terbit dalam modal
    await expect(page.locator('.token-result-box')).toBeVisible({ timeout: 10000 });
    // Tutup modal
    const closeBtn = page.getByRole('button', { name: /Selesai|Tutup/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }

    // =========================================================================
    // TAHAP 2: Pemetaan Struktur Organisasi & Project Authority (/admin/organization)
    // =========================================================================
    await page.goto('/admin/organization');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Verifikasi tab Penugasan Struktural dan ganti ke Project Authority
    const projectTab = page.getByRole('button', { name: /Project Authority|Otoritas Proyek/i });
    if (await projectTab.isVisible()) {
      await projectTab.click();
      await expect(page.locator('body')).toContainText('WP-CORE');
    }

    // =========================================================================
    // TAHAP 3: Pengaturan Kebijakan & Jejak Audit (/admin/policies)
    // =========================================================================
    await page.goto('/admin/policies');
    await expect(page.locator('h1')).toContainText('Pengaturan Kebijakan Sistem');
    await expect(page.locator('.metric-card').first()).toBeVisible();

    // =========================================================================
    // TAHAP 4: Saluran Notifikasi & Simulasi Pengiriman (/admin/notifications)
    // =========================================================================
    await page.goto('/admin/notifications');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const testDeliveryBtn = page.getByRole('button', { name: /Simulasikan Pengiriman|Kirim Uji Coba/i }).first();
    if (await testDeliveryBtn.isVisible()) {
      await testDeliveryBtn.click();
      await expect(page.locator('.toast-popup, .test-result-box')).toBeVisible({ timeout: 10000 });
    }

    // =========================================================================
    // TAHAP 5: CEO Management (direktur@dutamedia.com) Dashboard & Laporan Eksekutif
    // =========================================================================
    await performLogin(page, 'direktur@dutamedia.com');

    // Dashboard Eksekutif
    await page.goto('/dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Analisis Risiko Proyek (/projects/risk)
    await page.goto('/projects/risk');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Laporan Eksekutif (/reports)
    await page.goto('/reports');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('body')).toContainText('Laporan');
  });
});
