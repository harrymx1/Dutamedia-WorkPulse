/**
 * Peta navigasi tunggal (Single Source of Truth) WorkPulse.
 * Memuat 3 grup navigasi baku WorkPulse Enterprise:
 * 1. Workspace
 * 2. Management
 * 3. Administration
 *
 * Sesuai Design System v1.5.0 dan PDD / PRD / UI/UX Spec.
 */

export type RoleName =
  | 'EMPLOYEE'
  | 'SUPERVISOR'
  | 'HEAD'
  | 'PROJECT_MANAGER'
  | 'HRGA'
  | 'CEO_MANAGEMENT'
  | 'SYSTEM_ADMIN';

export interface NavItem {
  label: string;
  to: string;
  iconName: string;
  roles?: RoleName[];
  badge?: string;
  badgeType?: 'amber' | 'red' | 'neutral' | 'green';
}

export interface NavGroup {
  title: 'Workspace' | 'Management' | 'Administration';
  items: NavItem[];
}

const ALL_MANAGERIAL: RoleName[] = [
  'SUPERVISOR',
  'HEAD',
  'PROJECT_MANAGER',
  'HRGA',
  'CEO_MANAGEMENT',
  'SYSTEM_ADMIN',
];

const ADMIN_LEVEL: RoleName[] = [
  'SYSTEM_ADMIN',
  'HRGA',
  'CEO_MANAGEMENT',
];

export const navGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Morning Commitment', to: '/daily/morning', iconName: 'Sunrise' },
      { label: 'Additional Work', to: '/daily/additional-work', iconName: 'PlusCircle' },
      { label: 'EOD Outcome', to: '/daily/eod', iconName: 'Sunset' },
      { label: 'Lapor Blocker', to: '/blockers/raise', iconName: 'AlertTriangle' },
      { label: 'Riwayat Saya', to: '/daily/history', iconName: 'CalendarDays' },
      { label: 'Cuti Saya', to: '/leave/my', iconName: 'Plane' },
      { label: 'Koreksi Komitmen Pagi', to: '/corrections/morning', iconName: 'FileEdit' },
      { label: 'Koreksi Evaluasi Sore', to: '/corrections/eod', iconName: 'FilePenLine' },
      { label: 'Notifikasi', to: '/notifications', iconName: 'Bell' },
    ],
  },
  {
    title: 'Management',
    items: [
      // Dashboard terbuka untuk semua pengguna terotentikasi (tampilan disesuaikan peran)
      { label: 'Pulse Dashboard', to: '/dashboard', iconName: 'Activity' },
      { label: 'Antrean Blocker', to: '/blockers', roles: ALL_MANAGERIAL, iconName: 'ShieldAlert' },
      { label: 'Catatan Coaching', to: '/coaching', roles: ALL_MANAGERIAL, iconName: 'MessagesSquare' },
      { label: 'Radar Risiko Proyek', to: '/projects/risk', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA', 'SUPERVISOR', 'PROJECT_MANAGER'], iconName: 'FolderGit2' },
      { label: 'Penuaan & Eskalasi', to: '/blockers/aging', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA', 'SUPERVISOR'], iconName: 'Clock' },
      { label: 'Persetujuan Cuti', to: '/leave/queue', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA', 'SUPERVISOR'], iconName: 'CheckSquare' },
      { label: 'Review Koreksi & Cuti', to: '/corrections/review', roles: ALL_MANAGERIAL, iconName: 'FileCheck' },
      { label: 'Laporan Eksekutif', to: '/reports', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'], iconName: 'BarChart3' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Antrean Kepatuhan', to: '/compliance', roles: ADMIN_LEVEL, iconName: 'ClipboardCheck' },
      { label: 'Manajemen Dispensasi', to: '/exemptions', roles: ADMIN_LEVEL, iconName: 'CalendarRange' },
      { label: 'Kelola Pengguna', to: '/admin/users', roles: ['SYSTEM_ADMIN', 'HRGA'], iconName: 'Users' },
      { label: 'Undangan Karyawan', to: '/admin/invitations', roles: ADMIN_LEVEL, iconName: 'UserPlus' },
      { label: 'Struktur Organisasi', to: '/admin/organization', roles: ['SYSTEM_ADMIN', 'HRGA'], iconName: 'Network' },
      { label: 'Reviewer Sementara', to: '/admin/temporary-reviewers', roles: ['SYSTEM_ADMIN', 'HRGA'], iconName: 'UserCheck' },
      { label: 'Kebijakan & Cut-off', to: '/admin/policies', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'], iconName: 'Sliders' },
      { label: 'Saluran Notifikasi', to: '/admin/notifications', roles: ['SYSTEM_ADMIN', 'HRGA'], iconName: 'Megaphone' },
    ],
  },
];

/** Menyaring grup menu sesuai peran; grup kosong dibuang secara otomatis. */
export function navForRole(role: string | undefined | null): NavGroup[] {
  if (!role) return [];
  return navGroups
    .map((g) => ({
      title: g.title,
      items: g.items.filter((i) => !i.roles || i.roles.includes(role as RoleName)),
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
