import { describe, it, expect } from 'vitest';
import { navForRole, navGroups } from './navigation';
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

  it('SYSTEM_ADMIN melihat menu administrasi', () => {
    const links = flatten('SYSTEM_ADMIN');
    expect(links).toContain('/admin/users');
    expect(links).toContain('/admin/policies');
    expect(links).toContain('/reports');
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
});

