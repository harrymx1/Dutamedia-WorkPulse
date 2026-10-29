import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AUDIT MENYELURUH ROUTING, NAVIGASI & RBAC FRONTEND (Tahap 3.1)
 *
 * Untuk SETIAP akun seed (setiap peran) tes ini:
 *  1. Login lewat UI dan memastikan pendaratan di /dashboard.
 *  2. Membuka SETIAP rute terdaftar (diambil otomatis dari router/index.ts).
 *     - Rute yang diizinkan peran tersebut harus tampil (bukan 403/404/kosong).
 *     - Rute yang tidak diizinkan harus berakhir di /forbidden.
 *  3. Mengumpulkan SETIAP tautan internal yang tampil di tiap halaman (+ menu global)
 *     dan memastikan tidak ada tautan buntu (menuju halaman yang ditolak/tidak ada).
 *  4. Mencatat error JS, console error, dan respons API >= 400 per halaman.
 *
 * Laporan lengkap ditulis ke e2e/.route-audit-report.json
 */

interface RouteDef {
  path: string;
  roles?: string[];
  requiresAuth: boolean;
  guestOnly: boolean;
}

function parseRoutes(): RouteDef[] {
  const src = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'src', 'router', 'index.ts'), 'utf8');
  const start = src.indexOf('const routes');
  const end = src.indexOf('export const router');
  const body = src.slice(start, end);
  const defs: RouteDef[] = [];
  const re = /\{\s*(?:\/\/[^\n]*\n\s*)?path:\s*'([^']+)'([\s\S]*?)\n  \},?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const p = m[1];
    const rest = m[2];
    if (p.includes(':pathMatch')) continue;
    const metaMatch = rest.match(/meta:\s*\{([^}]*(?:\[[^\]]*\][^}]*)*)\}/);
    const meta = metaMatch ? metaMatch[1] : '';
    const rolesMatch = meta.match(/roles:\s*\[([^\]]*)\]/);
    defs.push({
      path: p,
      roles: rolesMatch ? rolesMatch[1].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean) : undefined,
      requiresAuth: /requiresAuth:\s*true/.test(meta),
      guestOnly: /guestOnly:\s*true/.test(meta),
    });
  }
  return defs;
}

const ROUTES = parseRoutes();
const PROTECTED = ROUTES.filter((r) => r.requiresAuth && r.path !== '/forbidden');

const ACCOUNTS: Array<{ email: string; role: string }> = [
  { email: 'admin@dutamedia.com', role: 'SYSTEM_ADMIN' },
  { email: 'direktur@dutamedia.com', role: 'CEO_MANAGEMENT' },
  { email: 'hrga@dutamedia.com', role: 'HRGA' },
  { email: 'lead.tech@dutamedia.com', role: 'SUPERVISOR' },
  { email: 'lead.creative@dutamedia.com', role: 'SUPERVISOR' },
  { email: 'dev.frontend@dutamedia.com', role: 'EMPLOYEE' },
  { email: 'dev.backend@dutamedia.com', role: 'EMPLOYEE' },
  { email: 'designer@dutamedia.com', role: 'EMPLOYEE' },
];

const allowed = (r: RouteDef, role: string) => !r.roles || r.roles.includes(role);
const findRoute = (p: string) => ROUTES.find((r) => r.path === p);

const issues: string[] = [];
const report: any = { routesTested: PROTECTED.map((r) => r.path), accounts: {} };

async function login(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.fill('#login-email', email);
  await page.fill('#login-password', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 15000 });
}

async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 1500 }).catch(() => {});
  await page.waitForTimeout(150);
}

test.describe('Audit Routing, Navigasi & RBAC (semua peran × semua rute)', () => {
  test('rute terdeteksi dari router', () => {
    expect(PROTECTED.length).toBeGreaterThan(20);
  });

  for (const acc of ACCOUNTS) {
    test(`Peran ${acc.role} (${acc.email})`, async ({ page }) => {
      test.setTimeout(300000);
      const perPage: Record<string, string[]> = {};
      let current = 'login';
      const note = (msg: string) => {
        (perPage[current] ||= []).push(msg);
      };

      page.on('pageerror', (e) => note(`PAGEERROR: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') {
          const t = m.text();
          // Respons 4xx/5xx sudah dicatat lewat handler response di bawah
          if (!/Failed to load resource/.test(t)) note(`CONSOLE: ${t.slice(0, 200)}`);
        }
      });
      page.on('response', (r) => {
        const url = r.url();
        if (url.includes('/api/') && r.status() >= 400) {
          note(`API ${r.status()} ${r.request().method()} ${url.replace(/^https?:\/\/[^/]+/, '')}`);
        }
      });

      // 1. Login & pendaratan
      await login(page, acc.email);
      await settle(page);
      if (new URL(page.url()).pathname !== '/dashboard') {
        issues.push(`[${acc.role}] login mendarat di ${new URL(page.url()).pathname}, seharusnya /dashboard`);
      }

      // 2 & 3. Kunjungi setiap rute + kumpulkan tautan
      const linksByPage: Record<string, string[]> = {};
      for (const r of PROTECTED) {
        current = r.path;
        await page.goto(r.path);
        await settle(page);
        const finalPath = new URL(page.url()).pathname;
        const ok = allowed(r, acc.role);

        if (ok) {
          if (finalPath !== r.path) {
            issues.push(`[${acc.role}] ${r.path} diizinkan tetapi berakhir di ${finalPath}`);
            continue;
          }
          const textLen = await page.evaluate(() => (document.querySelector('#app') as HTMLElement | null)?.innerText.trim().length ?? 0);
          if (textLen < 30) issues.push(`[${acc.role}] ${r.path} tampil kosong (teks ${textLen} karakter)`);

          // Buka menu global agar tautannya ikut terkumpul
          const toggle = page.locator('[data-testid="nav-toggle"]');
          if (await toggle.count()) await toggle.click();
          const hrefs = await page.$$eval('a[href^="/"]', (as) =>
            Array.from(new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute('href') as string))),
          );
          linksByPage[r.path] = hrefs;
        } else {
          if (finalPath !== '/forbidden') {
            issues.push(`[${acc.role}] ${r.path} DITOLAK semestinya, tetapi berakhir di ${finalPath} (RBAC frontend bocor)`);
          }
        }
      }

      // 3b. Validasi setiap tautan yang tampil
      for (const [from, hrefs] of Object.entries(linksByPage)) {
        for (const href of hrefs) {
          const clean = href.split('?')[0].split('#')[0];
          const target = findRoute(clean);
          if (!target) {
            issues.push(`[${acc.role}] di ${from}: tautan ${href} menuju rute yang TIDAK ADA`);
          } else if (target.requiresAuth && !allowed(target, acc.role)) {
            issues.push(`[${acc.role}] di ${from}: tautan ${href} BUNTU (peran ini ditolak di tujuan)`);
          }
        }
      }

      // 4. Error runtime per halaman
      for (const [pg, msgs] of Object.entries(perPage)) {
        const uniq = Array.from(new Set(msgs));
        for (const msg of uniq) {
          const r = findRoute(pg);
          if (r && !allowed(r, acc.role) && /API 40[13]/.test(msg)) continue; // wajar pada halaman ditolak
          if (pg === 'login' && /API 401.*auth\/me/.test(msg)) continue; // wajar saat cek sesi sebelum login
          issues.push(`[${acc.role}] ${pg}: ${msg}`);
        }
      }

      // 5. Sudah login: /login & /activate & / harus mengarah ke dashboard; URL ngawur -> 404
      for (const p of ['/login', '/activate', '/']) {
        await page.goto(p);
        await settle(page);
        if (new URL(page.url()).pathname !== '/dashboard') {
          issues.push(`[${acc.role}] membuka ${p} saat login berakhir di ${new URL(page.url()).pathname}, seharusnya /dashboard`);
        }
      }
      await page.goto('/halaman/tidak-ada');
      await settle(page);
      if ((await page.locator('[data-testid="error-not-found"]').count()) === 0) {
        issues.push(`[${acc.role}] URL tidak dikenal tidak menampilkan halaman 404`);
      }

      // 6. Logout via menu mengakhiri sesi
      await page.goto('/dashboard');
      await settle(page);
      await page.click('[data-testid="nav-toggle"]');
      await page.click('[data-testid="nav-logout"]');
      await page.waitForURL((u) => u.pathname === '/login', { timeout: 8000 }).catch(() => {});
      if (new URL(page.url()).pathname !== '/login') issues.push(`[${acc.role}] logout via menu tidak kembali ke /login`);
      await page.goto('/dashboard');
      await settle(page);
      if (!new URL(page.url()).pathname.startsWith('/login')) {
        issues.push(`[${acc.role}] setelah logout, /dashboard masih bisa dibuka tanpa sesi`);
      }

      report.accounts[acc.email] = { role: acc.role, linksByPage, runtime: perPage };
    });
  }

  test('Tanpa login: semua rute terlindungi diarahkan ke /login', async ({ page }) => {
    await page.context().clearCookies();
    for (const r of PROTECTED) {
      await page.goto(r.path);
      await settle(page);
      const u = new URL(page.url());
      if (u.pathname !== '/login') issues.push(`[ANON] ${r.path} tidak diarahkan ke /login (berakhir di ${u.pathname})`);
      else if (u.searchParams.get('redirect') !== r.path) issues.push(`[ANON] ${r.path}: parameter redirect hilang/salah (${u.search})`);
    }
  });

  test('Rangkuman: tidak boleh ada temuan', async () => {
    report.issues = issues;
    fs.writeFileSync(path.join(__dirname, '.route-audit-report.json'), JSON.stringify(report, null, 2));
    if (issues.length) console.log('\n===== TEMUAN AUDIT =====\n' + issues.map((i, n) => `${n + 1}. ${i}`).join('\n'));
    expect(issues, 'Temuan audit routing/navigasi/RBAC').toEqual([]);
  });
});

