import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/auth';

/**
 * Suite E2E 03: Siklus Blocker & Eskalasi (Pelaporan, Acknowledge, Resolusi, Aging)
 * Menguji kolaborasi lintas peran antara Karyawan pelapor dan Supervisor penyelesai.
 */
test.describe('E2E 03: Blocker & Escalation Full Lifecycle', () => {
  test('Siklus Lengkap: Raise Blocker -> Supervisor Acknowledge -> Resolve Ticket -> Aging Radar', async ({ page }) => {
    // =========================================================================
    // TAHAP 1: Karyawan (dev.frontend@dutamedia.com) Melaporkan Kendala Kritis
    // =========================================================================
    await performLogin(page, 'dev.frontend@dutamedia.com');
    await page.goto('/blockers/raise');
    await expect(page.locator('h2').first()).toContainText('Detail Kendala');

    // Isi formulir pelaporan kendala
    await page.fill('#blockerTitle', '[Infra] Database Connection Pooler Timeout 504');
    await page.selectOption('#blockerType', 'INFRA');
    await page.selectOption('#blockerImpact', 'TASK');

    // Pilih tingkat keparahan CRITICAL
    await page.locator('input[value="CRITICAL"]').check();

    // Pilih Penanggung Jawab: Tech Lead
    const ownerSelect = page.locator('#assignedOwner');
    if (await ownerSelect.isVisible()) {
      await ownerSelect.selectOption({ label: 'Bambang Pratama (Tech Lead) (lead.tech@dutamedia.com)' });
    }

    // Isi deskripsi kendala dan langkah mandiri
    await page.fill(
      '#blockerDesc',
      'Koneksi Supabase pooler mengalami timeout 504 saat concurrency tinggi. Telah dicoba restart aplikasi lokal namun tetap bottleneck.',
    );

    // Kirim tiket kendala
    await page.click('button[type="submit"]');

    // Verifikasi tiket berhasil diterbitkan
    await expect(page.locator('.submitted-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.submitted-card h2')).toContainText('Tiket Kendala Berhasil Diterbitkan');

    // =========================================================================
    // TAHAP 2: Supervisor (lead.tech@dutamedia.com) Merespons di Antrean Blocker
    // =========================================================================
    await performLogin(page, 'lead.tech@dutamedia.com');
    await page.goto('/blockers');
    await expect(page.locator('h1')).toContainText('Antrean Eskalasi Blocker');

    // Verifikasi tiket baru atau tiket seeded tampil di daftar
    await expect(page.locator('.ticket-card').first()).toBeVisible();

    // Cari dan klik tiket connection pooler atau tiket OPEN pertama
    const openTicket = page.locator('.ticket-card').first();
    await openTicket.click();

    // Lakukan Acknowledge jika tiket masih OPEN
    const ackBtn = page.locator('button.btn-action.ack');
    if (await ackBtn.isVisible()) {
      await ackBtn.click();
      await expect(page.locator('.toast-popup.success')).toBeVisible({ timeout: 5000 });
    }

    // Klik tombol Selesaikan untuk membuka modal resolusi
    const resolveBtn = page.locator('button.btn-action.resolve');
    await expect(resolveBtn).toBeVisible();
    await resolveBtn.click();

    // Isi formulir modal resolusi
    await expect(page.locator('.modal-card')).toBeVisible();
    await page.locator('.modal-card textarea').fill(
      'Konfigurasi pooler mode diubah ke transaction dan batas max connections ditingkatkan menjadi 100.',
    );
    await page.click('button:has-text("Tandai Selesai")');

    // Verifikasi konfirmasi resolusi
    await expect(page.locator('.toast-popup.success')).toContainText('RESOLVED');

    // =========================================================================
    // TAHAP 3: Buka Radar Penuaan Eskalasi (/blockers/aging)
    // =========================================================================
    await page.goto('/blockers/aging');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('body')).toContainText('Radar Penuaan');
    await expect(page.locator('body')).toContainText('Database Connection Pooler Timeout');
  });
});
