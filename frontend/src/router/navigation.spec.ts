import { describe, it, expect } from 'vitest';
import { navForRole, navGroups, OPERATIONAL_ROLES } from './navigation';
import { router } from './index';

const flatten = (role: string) => navForRole(role).flatMap((g) => g.items.map((i) => i.to));

describe('Navigasi & RBAC frontend', () => {
  it('setiap tautan menu merujuk ke rute yang benar-benar terdaftar', () => {
    const registered = router.getRoutes().map((r) => r.path);
    for (const group of navGroups) {
      for (const item of group.items) {
        expect(registered, `rute untuk menu "${item.label}" (${item.to})`).toContain(item.to);
      }
    }
  });

  it('EMPLOYEE tidak melihat menu admin/manajerial', () => {
    const links = flatten('EMPLOYEE');
    expect(links).toContain('/dashboard');
    expect(links).toContain('/daily/morning');
    expect(links).not.toContain('/admin/users');
    expect(links).not.toContain('/reports');
    expect(links).not.toContain('/leave/queue');
  });

  it('SYSTEM_ADMIN melihat menu administrasi dan manajemen, tetapi tidak melihat menu Workspace (IMP-026)', () => {
    const links = flatten('SYSTEM_ADMIN');
    // Melihat administrasi & manajemen
    expect(links).toContain('/admin/organization');
    expect(links).toContain('/admin/users');
    expect(links).toContain('/admin/policies');
    expect(links).toContain('/reports');
    expect(links).toContain('/dashboard');

    // Bebas dari menu operasional staf (Workspace dinonaktifkan)
    expect(links).not.toContain('/daily/morning');
    expect(links).not.toContain('/raise-blockers');
    expect(links).not.toContain('/daily/history');
    expect(links).not.toContain('/leave/my');
    expect(links).not.toContain('/corrections/morning');
    expect(links).not.toContain('/corrections/eod');

    const adminGroups = navForRole('SYSTEM_ADMIN').map((g) => g.title);
    expect(adminGroups).not.toContain('Workspace');
    expect(adminGroups).toContain('Management');
    expect(adminGroups).toContain('Administration');
  });

  it('seluruh peran operasional tetap memiliki akses ke grup Workspace (IMP-026)', () => {
    for (const role of OPERATIONAL_ROLES) {
      const groups = navForRole(role).map((g) => g.title);
      expect(groups, `peran ${role} harus memiliki grup Workspace`).toContain('Workspace');
      const links = flatten(role);
      expect(links, `peran ${role} harus memiliki My Today`).toContain('/daily/morning');
    }
  });

  it('rute operasional dilindungi oleh OPERATIONAL_ROLES dan menolak SYSTEM_ADMIN (IMP-026, TC-AUTH-005)', () => {
    const operationalRoutes = [
      '/daily/morning',
      '/daily/additional-work',
      '/daily/eod',
      '/daily/history',
      '/raise-blockers',
      '/corrections/morning',
      '/corrections/eod',
      '/leave/my',
    ];

    for (const path of operationalRoutes) {
      const route = router.getRoutes().find((r) => r.path === path);
      expect(route, `rute ${path} harus terdaftar`).toBeDefined();
      const allowedRoles = route?.meta?.roles as string[] | undefined;
      expect(allowedRoles, `rute ${path} harus mendefinisikan roles`).toBeDefined();
      expect(allowedRoles).toEqual(OPERATIONAL_ROLES);
      expect(allowedRoles).not.toContain('SYSTEM_ADMIN');
    }
  });

  it('menu yang tampil untuk suatu peran tidak pernah mengarah ke rute yang akan ditolak guard', () => {
    const roles = ['EMPLOYEE', 'SUPERVISOR', 'HEAD', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT', 'SYSTEM_ADMIN'];
    for (const role of roles) {
      for (const to of flatten(role)) {
        const route = router.getRoutes().find((r) => r.path === to)!;
        const allowed = route.meta.roles as string[] | undefined;
        if (allowed) {
          expect(allowed, `${role} -> ${to}`).toContain(role);
        }
      }
    }
  });

  it('peran tidak dikenal tidak mendapat menu', () => {
    expect(navForRole(undefined)).toEqual([]);
  });

  it('rute /raise-blockers terdaftar dan /blockers/raise dialihkan (redirect) ke /raise-blockers', () => {
    const raiseRoute = router.getRoutes().find((r) => r.path === '/raise-blockers');
    expect(raiseRoute).toBeDefined();
    expect(raiseRoute?.name).toBe('raise-blockers');

    const redirectRoute = router.getRoutes().find((r) => r.path === '/blockers/raise');
    expect(redirectRoute).toBeDefined();
    expect(redirectRoute?.redirect).toBe('/raise-blockers');
  });

  it('rute /blockers tetap terdaftar untuk antrean blocker manajerial', () => {
    const queueRoute = router.getRoutes().find((r) => r.path === '/blockers');
    expect(queueRoute).toBeDefined();
    expect(queueRoute?.name).toBe('blockers-queue');
  });

  it('rute /daily terdaftar dan dialihkan (redirect) ke /daily/morning (IMP-017)', () => {
    const dailyRoute = router.getRoutes().find((r) => r.path === '/daily');
    expect(dailyRoute).toBeDefined();
    expect(dailyRoute?.redirect).toBe('/daily/morning');
  });
});
