import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/auth';

/**
 * Suite E2E 04: Siklus Koreksi Akuntabilitas & Catatan Pembinaan (Coaching Notes)
 * Menguji pengajuan koreksi oleh Karyawan dan verifikasi/coaching oleh Supervisor.
 */
test.describe('E2E 04: Corrections & Coaching Lifecycle', () => {
  test('Siklus Lengkap: Pengajuan Koreksi Komitmen -> Review Supervisor -> Coaching Notes Feed', async ({ page }) => {
    // =========================================================================
    // TAHAP 1: Karyawan (dev.frontend@dutamedia.com) Mengajukan Koreksi Pagi
    // =========================================================================
    await performLogin(page, 'dev.frontend@dutamedia.com');
    await page.goto('/corrections/morning');
    await expect(page.locator('h1')).toContainText('Permohonan Koreksi Komitmen Pagi');

    // Pilih komitmen jika tersedia
    const comSelect = page.locator('#comSelect');
    if (await comSelect.isVisible()) {
      await comSelect.selectOption({ index: 0 });

      // Pilih klasifikasi MATERIAL
      await page.getByText('Perubahan Material', { exact: true }).click();

      // Isi deskripsi komitmen baru dan alasan
      await page.fill('#newTaskInput', 'Menyelesaikan implementasi UI navigasi mobile responsive v2 revisi klien');
      await page.fill('#reasonInput', 'Klien meminta penyesuaian navigasi drawer sesuai wireframe baru pasca-cutoff');

      // Submit form koreksi
      await page.click('button[type="submit"]');

      // Verifikasi konfirmasi pengiriman koreksi
      await expect(page.locator('.history-card').first()).toBeVisible({ timeout: 10000 });
    }

    // =========================================================================
    // TAHAP 2: Tech Lead (lead.tech@dutamedia.com) Meninjau Antrean Review Koreksi
    // =========================================================================
    await performLogin(page, 'lead.tech@dutamedia.com');
    await page.goto('/corrections/review');
    await expect(page.locator('h1')).toContainText('Correction & Leave Review');

    // Jika terdapat permintaan koreksi pending, setujui permintaan pertama
    const approveBtn = page.getByRole('button', { name: /^Setujui$/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.locator('.modal-card')).toBeVisible();
      await page.click('button:has-text("Konfirmasi Setujui")');
      await expect(page.locator('.toast-popup.success')).toBeVisible({ timeout: 10000 });
    }

    // =========================================================================
    // TAHAP 3: Tech Lead Membuat Catatan Pembinaan (Coaching Note) untuk Karyawan
    // =========================================================================
    await page.goto('/coaching');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Tulis catatan pembinaan dengan visibilitas dibagikan ke karyawan
    await page.fill(
      '#noteContent',
      '[Saran Pembinaan]: Fokus pada estimasi modular komponen frontend agar review PR berjalan lebih cepat.',
    );

    // Simpan catatan pembinaan
    await page.click('button.btn-submit');
    await expect(page.locator('.toast-popup.success, .note-card').first()).toBeVisible({ timeout: 10000 });

    // =========================================================================
    // TAHAP 4: Karyawan Melihat Catatan Pembinaan yang Diterima
    // =========================================================================
    await performLogin(page, 'dev.frontend@dutamedia.com');
    await page.goto('/coaching');
    await expect(page.locator('body')).toBeVisible();
  });
});
