import { defineConfig, devices } from '@playwright/test';

/**
 * EPIC-22-T5: Playwright E2E Configuration (SAD §17.7, §19.1)
 *
 * CARA MENJALANKAN (setelah EPIC-23 deployment):
 *   1. Install: npm install --save-dev @playwright/test
 *   2. Install browsers: npx playwright install chromium
 *   3. Set ENV: PLAYWRIGHT_BASE_URL=https://your-deployed-url.vercel.app
 *   4. Run: npx playwright test
 *
 * Untuk development lokal:
 *   1. Start backend: npm --prefix backend run start:dev
 *   2. Start frontend: npm --prefix frontend run dev
 *   3. Run: npx playwright test --headed
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Web server auto-start untuk development lokal (comment out bila remote)
  // webServer: [
  //   {
  //     command: 'npm --prefix ../backend run start:dev',
  //     url: 'http://localhost:3000/api/v1/health',
  //     timeout: 120_000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run dev',
  //     url: 'http://localhost:5173',
  //     timeout: 60_000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
});
