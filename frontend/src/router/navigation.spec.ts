import { describe, it, expect } from 'vitest';
import {
  navForRole,
  navGroups,
  OPERATIONAL_ROLES,
  ADMIN_LEVEL,
  canAccessRoute,
  UserAccessContext,
} from './navigation';
import { router } from './index';

const flatten = (userOrRole: UserAccessContext | string) =>
  navForRole(userOrRole).flatMap((g) => g.items.map((i) => i.to));

describe('Navigasi & RBAC frontend (Aturan Poin 1, 2, dan 3)', () => {
  it('setiap tautan menu merujuk ke rute yang benar-benar terdaftar', () => {
    const registered = router.getRoutes().map((r) => r.path);
    for (const group of navGroups) {
      for (const item of group.items) {
        expect(registered, `rute untuk menu "${item.label}" (${item.to})`).toContain(item.to);
      }
    }
  });

  it('EMPLOYEE tanpa kewenangan tambahan hanya melihat Workspace dan tidak melihat menu Management/Administration', () => {
    const links = flatten({ role: 'EMPLOYEE', hasSubordinates: false, isTemporaryReviewer: false, isProjectLead: false });
    expect(links).not.toContain('/dashboard');
    expect(links).toContain('/daily/morning');
    expect(links).not.toContain('/admin/users');
    expect(links).not.toContain('/reports');
    expect(links).not.toContain('/leave/queue');
    expect(links).not.toContain('/coaching');

    const groups = navForRole({ role: 'EMPLOYEE', hasSubordinates: false }).map((g) => g.title);
    expect(groups).toEqual(['Workspace']);
  });

  it('Poin 1: Grup Administration HANYA tampil dan bisa diakses oleh SYSTEM_ADMIN, HRGA, dan CEO_MANAGEMENT (TIDAK untuk HEAD/SUPERVISOR/PM/EMPLOYEE)', () => {
    const adminPaths = [
      '/compliance',
      '/exemptions',
      '/admin/users',
      '/admin/invitations',
      '/admin/organization',
      '/admin/temporary-reviewers',
      '/admin/policies',
      '/admin/notifications',
    ];

    // 1. SYSTEM_ADMIN, HRGA, CEO_MANAGEMENT melihat seluruh menu Administration
    for (const adminRole of ADMIN_LEVEL) {
      const groups = navForRole(adminRole).map((g) => g.title);
      expect(groups, `${adminRole} wajib melihat grup Administration`).toContain('Administration');
      const links = flatten(adminRole);
      for (const p of adminPaths) {
        expect(links, `${adminRole} wajib melihat ${p}`).toContain(p);
        expect(canAccessRoute(p, adminRole), `${adminRole} wajib bisa mengakses ${p}`).toBe(true);
      }
    }

    // 2. HEAD, SUPERVISOR, PROJECT_MANAGER, EMPLOYEE TIDAK boleh melihat grup Administration & ditolak aksesnya
    const nonAdminRoles = ['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER', 'EMPLOYEE'];
    for (const role of nonAdminRoles) {
      const groups = navForRole(role).map((g) => g.title);
      expect(groups, `${role} TIDAK boleh melihat grup Administration`).not.toContain('Administration');
      const links = flatten(role);
      for (const p of adminPaths) {
        expect(links, `${role} TIDAK boleh melihat ${p}`).not.toContain(p);
        expect(canAccessRoute(p, role), `${role} harus ditolak mengakses ${p}`).toBe(false);
      }
    }
  });

  it('Poin 2: Menu Kepegawaian (/leave/queue & /corrections/review) hanya untuk HEAD, CEO_MANAGEMENT, atau Reviewer Sementara aktif', () => {
    const hrPaths = ['/leave/queue', '/corrections/review'];

    // HEAD & CEO_MANAGEMENT berhak melihat dan mengakses
    for (const role of ['HEAD', 'CEO_MANAGEMENT']) {
      const links = flatten(role);
      for (const p of hrPaths) {
        expect(links).toContain(p);
        expect(canAccessRoute(p, role)).toBe(true);
      }
    }

    // SUPERVISOR (Tech Lead), PROJECT_MANAGER, EMPLOYEE, HRGA, SYSTEM_ADMIN tanpa delegasi Reviewer Sementara TIDAK melihat menu kepegawaian di Management
    for (const role of ['SUPERVISOR', 'PROJECT_MANAGER', 'EMPLOYEE', 'HRGA', 'SYSTEM_ADMIN']) {
      const ctx = { role, isTemporaryReviewer: false };
      const links = flatten(ctx);
      for (const p of hrPaths) {
        expect(links, `${role} tanpa delegasi tidak boleh melihat ${p}`).not.toContain(p);
        expect(canAccessRoute(p, ctx), `${role} tanpa delegasi harus ditolak di ${p}`).toBe(false);
      }
    }

    // Siapapun (misal SUPERVISOR atau EMPLOYEE) yang ditunjuk sebagai Reviewer Sementara aktif langsung melihat & bisa mengakses!
    for (const role of ['SUPERVISOR', 'EMPLOYEE', 'PROJECT_MANAGER']) {
      const delegatedCtx = { role, isTemporaryReviewer: true };
      const links = flatten(delegatedCtx);
      for (const p of hrPaths) {
        expect(links, `${role} dengan isTemporaryReviewer=true wajib melihat ${p}`).toContain(p);
        expect(canAccessRoute(p, delegatedCtx)).toBe(true);
      }
    }
  });

  it('Poin 3: Catatan Coaching (/coaching) tampil & bisa diakses oleh siapapun yang memiliki bawahan (hasSubordinates=true), tidak terbatas pada jabatan/role', () => {
    const allRoles = ['EMPLOYEE', 'SUPERVISOR', 'PROJECT_MANAGER', 'HEAD', 'HRGA', 'CEO_MANAGEMENT', 'SYSTEM_ADMIN'];

    for (const role of allRoles) {
      // Memiliki bawahan -> tampil & bisa diakses
      const withSubs = { role, hasSubordinates: true };
      expect(flatten(withSubs), `${role} dengan bawahan wajib melihat /coaching`).toContain('/coaching');
      expect(canAccessRoute('/coaching', withSubs)).toBe(true);

      // Tidak memiliki bawahan -> sembunyi & ditolak
      const withoutSubs = { role, hasSubordinates: false };
      expect(flatten(withoutSubs), `${role} tanpa bawahan tidak boleh melihat /coaching`).not.toContain('/coaching');
      expect(canAccessRoute('/coaching', withoutSubs)).toBe(false);
    }
  });

  it('SYSTEM_ADMIN melihat menu administrasi dan manajemen, tetapi tidak melihat menu Workspace (IMP-026)', () => {
    const links = flatten('SYSTEM_ADMIN');
    expect(links).toContain('/admin/organization');
    expect(links).toContain('/admin/users');
    expect(links).toContain('/admin/policies');
    expect(links).toContain('/reports');
    expect(links).toContain('/dashboard');

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
      expect(canAccessRoute(path, 'SYSTEM_ADMIN')).toBe(false);
    }
  });

  it('menu yang tampil di sidebar selalu diizinkan oleh canAccessRoute (Single Source of Truth)', () => {
    const roles = ['EMPLOYEE', 'SUPERVISOR', 'HEAD', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT', 'SYSTEM_ADMIN'];
    for (const role of roles) {
      for (const to of flatten(role)) {
        expect(canAccessRoute(to, role), `${role} -> ${to}`).toBe(true);
      }
    }
  });

  it('peran tidak dikenal tidak mendapat menu', () => {
    expect(navForRole(undefined)).toEqual([]);
  });
});
