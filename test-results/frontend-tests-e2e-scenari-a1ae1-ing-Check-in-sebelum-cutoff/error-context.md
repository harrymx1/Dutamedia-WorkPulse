# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend\tests\e2e\scenario-a-correction-request.spec.ts >> A-1: Employee submit Morning Check-in sebelum cutoff
- Location: frontend\tests\e2e\scenario-a-correction-request.spec.ts:39:1

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:5173/login"
  navigated to "http://localhost:5173/login"
============================================================
```

# Page snapshot

```yaml
- main [ref=f1e5]:
  - generic [ref=f1e7]:
    - generic [ref=f1e9]:
      - generic [ref=f1e10]: WorkPulse
      - generic [ref=f1e11]: Daily Accountability & Blocker Log System
    - generic [ref=f1e13]:
      - generic [ref=f1e14]:
        - generic [ref=f1e16]:
          - generic [aria-hidden] [ref=f1e18]: 󰇰
          - generic [ref=f1e19]:
            - generic: Email Kantor
            - textbox "Email Kantor" [ref=f1e20]:
              - /placeholder: nama@dutamedia.com
        - alert [ref=f1e21]
      - generic [ref=f1e23]:
        - generic [ref=f1e25]:
          - generic [aria-hidden] [ref=f1e27]: 󰍁
          - generic [ref=f1e28]:
            - generic: Password
            - textbox "Password" [ref=f1e29]
        - alert [ref=f1e30]
      - button "Masuk" [ref=f1e32] [cursor=pointer]
    - generic [ref=f1e34]: Dutamedia Internal System v1.0
```

# Test source

```ts
  1   | /**
  2   |  * EPIC-22-T5: Playwright E2E — Skenario A (SAD §17.7)
  3   |  * Normal Flow: Morning Check-in → Correction Request Minor/Material → Reviewer Object
  4   |  *
  5   |  * PRASYARAT SEBELUM MENJALANKAN:
  6   |  * 1. npm install --save-dev @playwright/test && npx playwright install chromium
  7   |  * 2. Backend + Frontend harus berjalan (atau set PLAYWRIGHT_BASE_URL ke deployed URL)
  8   |  * 3. Database test memiliki akun Employee (alice@dutamedia.test) dan
  9   |  *    Supervisor (bob@dutamedia.test) dengan password Password123!.
  10  |  *
  11  |  * CARA MENJALANKAN:
  12  |  *   npx playwright test scenario-a-correction-request.spec.ts
  13  |  */
  14  | import { test, expect, type Page } from '@playwright/test';
  15  | 
  16  | // ===========================================================================
  17  | // Konfigurasi dari environment
  18  | // ===========================================================================
  19  | const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
  20  | const EMP_EMAIL = process.env.PLAYWRIGHT_EMP_EMAIL ?? 'alice@dutamedia.test';
  21  | const EMP_PASSWORD = process.env.PLAYWRIGHT_EMP_PASSWORD ?? 'TestPassword123!';
  22  | const SPV_EMAIL = process.env.PLAYWRIGHT_SPV_EMAIL ?? 'bob@dutamedia.test';
  23  | const SPV_PASSWORD = process.env.PLAYWRIGHT_SPV_PASSWORD ?? 'TestPassword123!';
  24  | 
  25  | // ===========================================================================
  26  | // Helper: Login
  27  | // ===========================================================================
  28  | async function login(page: Page, email: string, password: string) {
  29  |   await page.goto(`${BASE}/login`);
  30  |   await page.locator('#login-email-input').fill(email);
  31  |   await page.locator('#login-password-input').fill(password);
  32  |   await page.locator('#login-submit-button').click();
> 33  |   await page.waitForURL(new RegExp(`${BASE}/today`), { timeout: 15_000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  34  | }
  35  | 
  36  | // ===========================================================================
  37  | // Skenario A-1: Employee submit Morning Check-in (langkah 1 dari §17.7)
  38  | // ===========================================================================
  39  | test('A-1: Employee submit Morning Check-in sebelum cutoff', async ({ page }) => {
  40  |   await login(page, EMP_EMAIL, EMP_PASSWORD);
  41  | 
  42  |   // Navigasi ke halaman My Today (Morning Check-in)
  43  |   await page.locator('#nav-my-today').click();
  44  |   await page.waitForSelector('[data-testid="morning-checkin-form"], [data-testid="morning-submission-status"]', { timeout: 10_000 });
  45  | 
  46  |   const formVisible = await page.locator('[data-testid="morning-checkin-form"]').isVisible().catch(() => false);
  47  |   if (formVisible) {
  48  |     // Isi commitment pertama
  49  |     await page.locator('[data-testid="commitment-text-input-0"] textarea').fill('Deploy fitur login ke staging');
  50  |     // Submit Morning Check-in
  51  |     await page.locator('[data-testid="morning-submit-button"]').click();
  52  |   }
  53  | 
  54  |   // Verifikasi status submit berhasil atau alert cutoff jika dijalankan setelah cutoff pagi
  55  |   const statusOrCutoff = page.locator('[data-testid="morning-submission-status"]').or(page.getByText('Batas waktu penyerahan Morning Check-in (Cut-off) telah berakhir'));
  56  |   await expect(statusOrCutoff.first()).toBeVisible({ timeout: 10_000 });
  57  | });
  58  | 
  59  | // ===========================================================================
  60  | // Skenario A-2: Employee mengajukan Koreksi Minor setelah cutoff
  61  | // ===========================================================================
  62  | test('A-2: Employee ajukan Koreksi Minor setelah Morning Lock', async ({ page }) => {
  63  |   await login(page, EMP_EMAIL, EMP_PASSWORD);
  64  |   await page.locator('#nav-my-today').click();
  65  | 
  66  |   const correctionBtn = page.locator('[data-testid="correction-request-button-0"]');
  67  |   if (await correctionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  68  |     await correctionBtn.click();
  69  |     await page.locator('[data-testid="correction-description-input"] textarea').fill('Deploy fitur login ke staging (minor update)');
  70  |     await page.locator('[data-testid="correction-reason-input"] textarea').fill('Perbaikan penulisan target');
  71  |     await page.locator('[data-testid="correction-submit-button"]').click();
  72  |     await expect(page.locator('.v-snackbar, [data-testid="morning-submission-status"]').first()).toBeVisible({ timeout: 10_000 });
  73  |   }
  74  | });
  75  | 
  76  | // ===========================================================================
  77  | // Skenario A-3: Employee mengajukan Koreksi Material
  78  | // ===========================================================================
  79  | test('A-3: Employee ajukan Koreksi Material → status Menunggu Tinjauan', async ({ page }) => {
  80  |   await login(page, EMP_EMAIL, EMP_PASSWORD);
  81  |   await page.locator('#nav-my-today').click();
  82  | 
  83  |   const correctionBtn = page.locator('[data-testid="correction-request-button-0"]');
  84  |   if (await correctionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  85  |     await correctionBtn.click();
  86  | 
  87  |     // Ubah komitmen dengan perubahan kata > 10 (Material per SAD §9.6)
  88  |     await page.locator('[data-testid="correction-description-input"] textarea').fill(
  89  |       'Redesign and implement multi-tenant payment gateway integration supporting automated settlement currency conversion retry policies and dispute reconciliation'
  90  |     );
  91  |     await page.locator('[data-testid="correction-reason-input"] textarea').fill(
  92  |       'Primary payment gateway vendor announced emergency downtime window requiring architecture change'
  93  |     );
  94  |     await page.locator('[data-testid="correction-submit-button"]').click();
  95  | 
  96  |     await expect(page.locator('.v-snackbar, [data-testid="morning-submission-status"]').first()).toBeVisible({ timeout: 10_000 });
  97  |   }
  98  | });
  99  | 
  100 | // ===========================================================================
  101 | // Skenario A-4: Supervisor menolak (object) Koreksi Material
  102 | // ===========================================================================
  103 | test('A-4: Supervisor menolak Koreksi Material → status Ditolak, notifikasi ke employee', async ({ page }) => {
  104 |   await login(page, SPV_EMAIL, SPV_PASSWORD);
  105 | 
  106 |   // Navigasi ke halaman Team Pulse
  107 |   await page.locator('#nav-team').click();
  108 |   await page.waitForURL(new RegExp(`${BASE}/team`), { timeout: 15_000 });
  109 | 
  110 |   // Buka tab Review Koreksi & Cuti
  111 |   await page.locator('[data-testid="tab-reviews"]').click();
  112 |   await page.waitForTimeout(1000);
  113 | 
  114 |   const objectBtn = page.locator('[data-testid="correction-object-button"]').first();
  115 |   if (await objectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  116 |     await objectBtn.click();
  117 |     await page.locator('[data-testid="objection-reason-input"] textarea').fill('Perubahan baseline tidak mencerminkan fakta lapangan');
  118 |     await page.locator('[data-testid="objection-submit-button"]').click();
  119 |     await expect(page.locator('.v-snackbar, [data-testid="tab-reviews"]').first()).toBeVisible({ timeout: 10_000 });
  120 |   }
  121 | });
  122 | 
```