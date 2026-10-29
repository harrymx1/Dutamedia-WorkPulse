import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright E2E WorkPulse (Tahap 1.3)
 * Menjalankan uji alur pengguna ujung-ke-ujung (5 Golden User Journeys)
 * secara sekuensial pada peramban Chromium.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // 1 Worker menjamin konsistensi mutlak kondisi database antar-alur
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: [
    {
      command: 'powershell -Command "cd backend; node dist/src/main.js"',
      url: 'http://localhost:3000/health/live',
      reuseExistingServer: true,
      timeout: 60000,
      env: {
        PORT: '3000',
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://postgres:test_password_secure@localhost:54332/workpulse_test',
        AUTH_RATE_LIMIT: '100',
        NODE_ENV: 'test',
        JWT_SECRET:
          process.env.JWT_SECRET ||
          'workpulse-default-dev-jwt-secret-key-at-least-32-chars-long!',
      },
    },
    {
      command: 'npm --prefix frontend run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});

