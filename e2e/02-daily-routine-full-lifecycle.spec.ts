import { test, expect } from '@playwright/test';
import { performLogin } from './helpers/auth';
import { resetDesignerDaily, unlockMorningCommitment, lockMorningCommitment } from './helpers/db';

/**
 * Suite E2E 02: Siklus Lengkap Rutinitas Harian (Morning, Additional Work, EOD, History)
 * Menguji peran EMPLOYEE (designer@dutamedia.com) dari awal pengisian hingga penutupan hari.
 */
test.describe('E2E 02: Daily Routine Full Lifecycle', () => {
  test.beforeEach(async () => {
    await resetDesignerDaily();
    await unlockMorningCommitment();
  });

  test.afterAll(async () => {
    await lockMorningCommitment();
  });
  test('Siklus Lengkap: Morning Commitment -> Additional Work -> EOD Outcome -> History', async ({ page }) => {
    // 1. Login sebagai Maya Putri (UI/UX Designer)
    await performLogin(page, 'designer@dutamedia.com');

    // =========================================================================
    // TAHAP A: MORNING COMMITMENT (/daily/morning)
    // =========================================================================
    await page.goto('/daily/morning');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Isi Slot #1 (GREEN)
    const slot1Text = page.locator('textarea').first();
    await slot1Text.fill('Mendesain komponen design system untuk halaman analitik risiko');
    await page.locator('label.risk-card.green').first().click();

    // Tambah Slot #2
    const addSlotBtn = page.getByRole('button', { name: /Tambah Slot/i });
    if (await addSlotBtn.isVisible()) {
      await addSlotBtn.click();
    }

    // Isi Slot #2 (AMBER)
    const textareas = page.locator('textarea');
    if ((await textareas.count()) > 1) {
      await textareas.nth(1).fill('Integrasi feedback user research dengan tim creative lead');
      // Pilih AMBER pada slot kedua
      const amberRadios = page.locator('label.risk-card.amber');
      if (await amberRadios.nth(1).isVisible()) {
        await amberRadios.nth(1).click();
      }
      // Isi catatan potensi kendala yang muncul untuk slot AMBER
      const blockerInputs = page.locator('textarea[placeholder*="hambatan"]');
      if (await blockerInputs.first().isVisible()) {
        await blockerInputs.first().fill('Menunggu hasil rapat review brand identity');
      }
    }

    // Kirim Morning Commitment
    const submitMorningBtn = page.getByRole('button', { name: /Kirim Morning Commitment/i });
    await submitMorningBtn.click();

    // Verifikasi konfirmasi sukses pagi
    await expect(page.locator('.post-submit-panel')).toBeVisible({ timeout: 10000 });

    // =========================================================================
    // TAHAP B: ADDITIONAL WORK (/daily/additional-work)
    // =========================================================================
    await page.goto('/daily/additional-work');
    await expect(page.locator('h1')).toContainText('Additional Work');

    // Isi form pekerjaan dadakan
    await page.fill('#input-task-text', 'Memperbaiki aset SVG ikon navigasi yang blur di layar resolusi tinggi');
    await page.selectOption('#select-reason', 'OPERATIONAL_INCIDENT');

    // Submit form pekerjaan tambahan
    await page.click('button[type="submit"]');

    // Verifikasi pekerjaan tambahan tercatat dalam daftar
    await expect(page.locator('.work-card').first()).toContainText('Memperbaiki aset SVG ikon navigasi');

    // =========================================================================
    // TAHAP C: EOD OUTCOME EVALUATION (/daily/eod)
    // =========================================================================
    await page.goto('/daily/eod');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Evaluasi Komitmen #1: COMPLETED
    const completedRadios = page.locator('input[value="COMPLETED"]');
    if (await completedRadios.first().isVisible()) {
      await completedRadios.first().check();
    }

    // Evaluasi Komitmen #2: PARTIALLY_COMPLETED dengan Continuation
    if ((await completedRadios.count()) > 1) {
      const partialRadios = page.locator('input[value="PARTIALLY_COMPLETED"]');
      if (await partialRadios.first().isVisible()) {
        await partialRadios.first().check();

        // Pilih keputusan kelanjutan: CONTINUE
        const continueRadio = page.locator('input[value="CONTINUE"]').first();
        if (await continueRadio.isVisible()) {
          await continueRadio.check();
          // Masukkan catatan kelanjutan
          const contReasonArea = page.locator('textarea[placeholder*="progres sisa"]').first();
          if (await contReasonArea.isVisible()) {
            await contReasonArea.fill('Progres 75% selesai, sisa detail token diselesaikan besok.');
          }
        }
      }
    }

    // Evaluasi Pekerjaan Tambahan: COMPLETED
    const allCompleted = page.locator('input[value="COMPLETED"]');
    const lastCompleted = allCompleted.last();
    if (await lastCompleted.isVisible()) {
      await lastCompleted.check();
    }

    // Konfirmasi status akhir hari: GREEN
    const greenStatusCard = page.locator('label.status-card.green');
    if (await greenStatusCard.isVisible()) {
      await greenStatusCard.click();
    }

    // Kirim evaluasi EOD
    const submitEodBtn = page.getByRole('button', { name: /Kirim Evaluasi EOD/i });
    await submitEodBtn.click();

    // Verifikasi pesan penutupan hari kerja
    await expect(page.locator('.post-submit-panel')).toBeVisible({ timeout: 10000 });

    // =========================================================================
    // TAHAP D: RIWAYAT AKUNTABILITAS (/daily/history)
    // =========================================================================
    await page.goto('/daily/history');
    await expect(page.locator('body')).toContainText('3 Item');
    await expect(page.locator('body')).toContainText('GREEN');

    // Klik tombol Detail untuk membuka rincian tugas komitmen & tambahan
    const detailBtn = page.getByRole('button', { name: /Detail/i }).first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.locator('body')).toContainText('Mendesain komponen design system');
    }
  });
});
