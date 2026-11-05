/**
 * Peta navigasi tunggal (Single Source of Truth) WorkPulse.
 * Memuat 3 grup navigasi baku WorkPulse Enterprise:
 * 1. Workspace
 * 2. Management
 * 3. Administration
 *
 * Sesuai Design System v1.5.0, PDD / PRD / UI/UX Spec, dan Aturan Wewenang CR-013.
 */

export type RoleName =
  | 'EMPLOYEE'
  | 'SUPERVISOR'
  | 'HEAD'
  | 'PROJECT_MANAGER'
  | 'HRGA'
  | 'CEO_MANAGEMENT'
  | 'SYSTEM_ADMIN';

export interface UserAccessContext {
  role?: string | null;
  hasSubordinates?: boolean;
  isTemporaryReviewer?: boolean;
  isProjectLead?: boolean;
}

export interface ResolvedAccessContext {
  role: RoleName | null;
  hasSubordinates: boolean;
  isTemporaryReviewer: boolean;
  isProjectLead: boolean;
}

export interface NavItem {
  label: string;
  to: string;
  iconName: string;
  roles?: RoleName[];
  requiresSubordinates?: boolean;
  allowTemporaryReviewer?: boolean;
  allowProjectLead?: boolean;
  badge?: string;
  badgeType?: 'amber' | 'red' | 'neutral' | 'green';
}

export interface NavGroup {
  title: 'Workspace' | 'Management' | 'Administration';
  items: NavItem[];
}

export const ALL_MANAGERIAL: RoleName[] = [
  'SUPERVISOR',
  'HEAD',
  'PROJECT_MANAGER',
  'HRGA',
  'CEO_MANAGEMENT',
  'SYSTEM_ADMIN',
];

/**
 * Aturan Poin 1: Grup Administration hanya dapat dilihat & diakses oleh System Admin, HRGA, dan CEO/Direktur.
 */
export const ADMIN_LEVEL: RoleName[] = [
  'SYSTEM_ADMIN',
  'HRGA',
  'CEO_MANAGEMENT',
];

/**
 * Aturan Poin 2: Menu kepegawaian di grup Management (Persetujuan Cuti & Review Koreksi)
 * hanya untuk Kepala Divisi (HEAD) dan CEO/Direktur (untuk bagian tanpa HEAD),
 * serta siapapun yang sedang ditunjuk aktif sebagai Reviewer Sementara.
 */
export const HR_APPROVAL_ROLES: RoleName[] = [
  'HEAD',
  'CEO_MANAGEMENT',
];

/** Peran staf operasional yang memiliki kewajiban komitmen harian (IMP-026). */
export const OPERATIONAL_ROLES: RoleName[] = [
  'EMPLOYEE',
  'SUPERVISOR',
  'HEAD',
  'PROJECT_MANAGER',
  'HRGA',
  'CEO_MANAGEMENT',
];

export const navGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'My Today', to: '/daily/morning', roles: OPERATIONAL_ROLES, iconName: 'Clock' },
      { label: 'Lapor Blocker', to: '/raise-blockers', roles: OPERATIONAL_ROLES, iconName: 'AlertTriangle' },
      { label: 'Riwayat Saya', to: '/daily/history', roles: OPERATIONAL_ROLES, iconName: 'CalendarDays' },
      { label: 'Cuti Saya', to: '/leave/my', roles: OPERATIONAL_ROLES, iconName: 'Plane' },
      { label: 'Koreksi Komitmen Pagi', to: '/corrections/morning', roles: OPERATIONAL_ROLES, iconName: 'FileEdit' },
      { label: 'Koreksi Evaluasi Sore', to: '/corrections/eod', roles: OPERATIONAL_ROLES, iconName: 'FilePenLine' },
      { label: 'Notifikasi', to: '/notifications', iconName: 'Bell' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Pulse Dashboard', to: '/dashboard', roles: ALL_MANAGERIAL, allowProjectLead: true, iconName: 'Activity' },
      { label: 'Antrean Blocker', to: '/blockers', roles: ALL_MANAGERIAL, allowProjectLead: true, iconName: 'ShieldAlert' },
      { label: 'Catatan Coaching', to: '/coaching', requiresSubordinates: true, iconName: 'MessagesSquare' },
      { label: 'Radar Risiko Proyek', to: '/projects/risk', roles: ALL_MANAGERIAL, allowProjectLead: true, iconName: 'FolderGit2' },
      { label: 'Penuaan & Eskalasi', to: '/blockers/aging', roles: ALL_MANAGERIAL, allowProjectLead: true, iconName: 'Clock' },
      { label: 'Persetujuan Cuti', to: '/leave/queue', roles: HR_APPROVAL_ROLES, allowTemporaryReviewer: true, iconName: 'CheckSquare' },
      { label: 'Review Koreksi & Cuti', to: '/corrections/review', roles: HR_APPROVAL_ROLES, allowTemporaryReviewer: true, iconName: 'FileCheck' },
      { label: 'Laporan Eksekutif', to: '/reports', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'], iconName: 'BarChart3' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Antrean Kepatuhan', to: '/compliance', roles: ADMIN_LEVEL, iconName: 'ClipboardCheck' },
      { label: 'Manajemen Dispensasi', to: '/exemptions', roles: ADMIN_LEVEL, iconName: 'CalendarRange' },
      { label: 'Kelola Pengguna', to: '/admin/users', roles: ADMIN_LEVEL, iconName: 'Users' },
      { label: 'Undangan Karyawan', to: '/admin/invitations', roles: ADMIN_LEVEL, iconName: 'UserPlus' },
      { label: 'Struktur Organisasi', to: '/admin/organization', roles: ADMIN_LEVEL, iconName: 'Network' },
      { label: 'Reviewer Sementara', to: '/admin/temporary-reviewers', roles: ADMIN_LEVEL, iconName: 'UserCheck' },
      { label: 'Kebijakan & Cut-off', to: '/admin/policies', roles: ADMIN_LEVEL, iconName: 'Sliders' },
      { label: 'Saluran Notifikasi', to: '/admin/notifications', roles: ADMIN_LEVEL, iconName: 'Megaphone' },
    ],
  },
];

export function resolveAccessContext(
  userOrRole: UserAccessContext | string | undefined | null,
): ResolvedAccessContext {
  if (!userOrRole) {
    return {
      role: null,
      hasSubordinates: false,
      isTemporaryReviewer: false,
      isProjectLead: false,
    };
  }
  if (typeof userOrRole === 'string') {
    const role = userOrRole as RoleName;
    return {
      role,
      hasSubordinates: role === 'HEAD' || role === 'CEO_MANAGEMENT',
      isTemporaryReviewer: false,
      isProjectLead: role === 'SUPERVISOR' || role === 'PROJECT_MANAGER',
    };
  }
  const role = (userOrRole.role as RoleName) || null;
  return {
    role,
    hasSubordinates:
      typeof userOrRole.hasSubordinates === 'boolean'
        ? userOrRole.hasSubordinates
        : role === 'HEAD' || role === 'CEO_MANAGEMENT',
    isTemporaryReviewer: Boolean(userOrRole.isTemporaryReviewer),
    isProjectLead:
      typeof userOrRole.isProjectLead === 'boolean'
        ? userOrRole.isProjectLead
        : role === 'SUPERVISOR' || role === 'PROJECT_MANAGER',
  };
}

export function canAccessNavItem(item: NavItem, ctx: ResolvedAccessContext): boolean {
  if (!ctx.role) return false;

  // Aturan Poin 3: Catatan Coaching murni untuk siapapun yang memiliki bawahan langsung aktif (tidak terbatas role/jabatan)
  if (item.requiresSubordinates) {
    return ctx.hasSubordinates === true;
  }

  // Aturan Poin 2: Menu kepegawaian mengizinkan Reviewer Sementara aktif (siapapun orangnya)
  if (item.allowTemporaryReviewer && ctx.isTemporaryReviewer) {
    return true;
  }

  // Wewenang Proyek Dinamis (Project Lead)
  if (item.allowProjectLead && ctx.isProjectLead) {
    return true;
  }

  if (!item.roles) {
    return true;
  }

  return item.roles.includes(ctx.role);
}

/**
 * Mengevaluasi apakah pengguna berhak mengakses suatu rute halaman.
 * Menggunakan aturan yang 100% identik dengan visibilitas Sidebar (Single Source of Truth).
 */
export function canAccessRoute(
  path: string,
  userOrRole: UserAccessContext | string | undefined | null,
): boolean {
  const ctx = resolveAccessContext(userOrRole);
  if (!ctx.role) return false;

  // Rute umum terautentikasi
  if (path === '/profile' || path === '/notifications' || path === '/forbidden') {
    return true;
  }

  // Sub-rute My Today mengikuti aturan Workspace (/daily/morning)
  const normalizedPath =
    path === '/daily/additional-work' || path === '/daily/eod' || path === '/daily'
      ? '/daily/morning'
      : path;

  if (ctx.role === 'SYSTEM_ADMIN') {
    const workspacePaths =
      navGroups.find((g) => g.title === 'Workspace')?.items.map((i) => i.to) || [];
    if (workspacePaths.includes(normalizedPath) && normalizedPath !== '/notifications') {
      return false;
    }
  }

  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.to === normalizedPath) {
        return canAccessNavItem(item, ctx);
      }
    }
  }

  return true;
}

/** Menyaring grup menu sesuai peran & kewenangan; grup kosong dibuang secara otomatis. */
export function navForRole(
  userOrRole: UserAccessContext | string | undefined | null,
): NavGroup[] {
  const ctx = resolveAccessContext(userOrRole);
  if (!ctx.role) return [];
  return navGroups
    .filter((g) => {
      // IMP-026: Persona SYSTEM_ADMIN murni untuk konfigurasi sistem & pengawasan manajerial,
      // grup 'Workspace' dinonaktifkan sepenuhnya guna menegakkan Separation of Duties.
      if (ctx.role === 'SYSTEM_ADMIN' && g.title === 'Workspace') {
        return false;
      }
      return true;
    })
    .map((g) => ({
      title: g.title,
      items: g.items.filter((i) => canAccessNavItem(i, ctx)),
    }))
    .filter((g) => g.items.length > 0);
}

/**
 * Resolver rute pendaratan resmi berdasarkan peran (SSOT Penjelasan-Halaman-01).
 * - EMPLOYEE -> /daily/morning (Morning Commitment)
 * - SUPERVISOR / HEAD / CEO_MANAGEMENT / PROJECT_MANAGER -> /dashboard (Pulse Dashboard)
 * - HRGA -> /compliance (Antrean Kepatuhan)
 * - SYSTEM_ADMIN -> /admin/organization (Struktur Organisasi)
 */
export function getLandingRouteForRole(role: string | undefined | null): string {
  switch (role) {
    case 'EMPLOYEE':
      return '/daily/morning';
    case 'SUPERVISOR':
    case 'HEAD':
    case 'CEO_MANAGEMENT':
    case 'PROJECT_MANAGER':
      return '/dashboard';
    case 'HRGA':
      return '/compliance';
    case 'SYSTEM_ADMIN':
      return '/admin/organization';
    default:
      return '/daily/morning';
  }
}
