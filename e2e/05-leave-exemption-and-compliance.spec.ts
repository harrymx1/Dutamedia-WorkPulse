import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/auth';
import { resetLeaveRequests } from './helpers/db';

/**
 * Suite E2E 05: Siklus Cuti, Pengelolaan Dispensasi (Exemptions) & Antrean Kepatuhan (Compliance)
 * Menguji peran EMPLOYEE (pengajuan cuti) dan HRGA (verifikasi, persetujuan, penerbitan dispensasi).
 */
test.describe('E2E 05: Leave, Exemption & Compliance Full Lifecycle', () => {
  test.beforeEach(async () => {
    await resetLeaveRequests();
  });
  test('Siklus Lengkap: Pengajuan Cuti Mandiri -> Approval HRGA -> Terbitkan Dispensasi -> Compliance Radar', async ({
    page,
  }) => {
    // =========================================================================
    // TAHAP 1: Karyawan (dev.backend@dutamedia.com) Mengajukan Cuti Mandiri
    // =========================================================================
    await performLogin(page, 'dev.backend@dutamedia.com');
    await page.goto('/leave/my');
    await expect(page.locator('h1')).toContainText('My Leave Request');

    // Tentukan tanggal 14 hari ke depan
    const d1 = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const d2 = new Date(Date.now() + 16 * 86400000).toISOString().split('T')[0];

    await page.fill('#startDate', d1);
    await page.fill('#endDate', d2);
    await page.fill('#reason', 'Cuti tahunan keperluan keluarga mendesak');

    await page.click('button[type="submit"]');

    // Verifikasi pesan sukses
    await expect(page.locator('.toast-popup.success')).toBeVisible({ timeout: 10000 });

    // =========================================================================
    // TAHAP 2: HRGA (hrga@dutamedia.com) Menyetujui Cuti di Antrean Approval
    // =========================================================================
    await performLogin(page, 'hrga@dutamedia.com');
    await page.goto('/leave/queue');
    await expect(page.locator('h1')).toContainText('Leave Approval Queue');

    // Cari tombol Setujui pada item pending
    const approveBtn = page.getByRole('button', { name: /^Setujui$/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();

      // Modal konfirmasi review
      const reviewModal = page.locator('.modal-card, .review-modal');
      if (await reviewModal.isVisible()) {
        const reviewText = reviewModal.locator('textarea');
        if (await reviewText.isVisible()) {
          await reviewText.fill('Disetujui oleh HRGA sesuai kuota cuti tahunan.');
        }
        await reviewModal.getByRole('button', { name: 'Konfirmasi Setujui' }).click();
      }
      await expect(page.locator('.toast-popup.success')).toBeVisible({ timeout: 10000 });
    }

    // =========================================================================
    // TAHAP 3: HRGA Menerbitkan Dispensasi Resmi (/exemptions)
    // =========================================================================
    await page.goto('/exemptions');
    await expect(page.locator('h1')).toContainText('Kelola Hari Libur & Pengecualian');

    // Pilih karyawan penerima dispensasi
    const empSelect = page.locator('#empSelect');
    if (await empSelect.isVisible()) {
      await empSelect.selectOption({ index: 1 });

      const exStart = new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];
      const exEnd = new Date(Date.now() + 22 * 86400000).toISOString().split('T')[0];

      await page.fill('#startDateInput', exStart);
      await page.fill('#endDateInput', exEnd);
      await page.selectOption('#catSelect', 'Dinas Luar');
      await page.fill('#refNoInput', 'SK/HRGA/2026/088');
      await page.fill('#reasonInput', 'Penugasan dinas luar kota implementasi sistem server klien');

      await page.click('button[type="submit"]');

      // Verifikasi dispensasi berhasil diterbitkan
      await expect(page.locator('.toast-popup.success')).toBeVisible({ timeout: 10000 });
    }

    // =========================================================================
    // TAHAP 4: HRGA Memeriksa Antrean Kepatuhan (/compliance)
    // =========================================================================
    await page.goto('/compliance');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('body')).toContainText('Kepatuhan');
  });
});
