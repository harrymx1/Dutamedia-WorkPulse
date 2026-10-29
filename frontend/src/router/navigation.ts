/**
 * Peta navigasi tunggal (single source of truth) WorkPulse.
 * Dipakai oleh AppNavShell untuk membangun menu berbasis peran (RBAC).
 *
 * Aturan: setiap item `to` HARUS merujuk rute yang ada di router/index.ts.
 * Jika `roles` dihilangkan, item tampil untuk semua pengguna terautentikasi.
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
  roles?: RoleName[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const MANAGERIAL: RoleName[] = ['SUPERVISOR', 'HEAD', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT', 'SYSTEM_ADMIN'];
const ADMIN_LEVEL: RoleName[] = ['SYSTEM_ADMIN', 'HRGA', 'CEO_MANAGEMENT'];

export const navGroups: NavGroup[] = [
  {
    title: 'Utama',
    items: [{ label: 'Dashboard', to: '/dashboard' }],
  },
  {
    title: 'Rutinitas Harian',
    items: [
      { label: 'Komitmen Pagi', to: '/daily/morning' },
      { label: 'Pekerjaan Tambahan', to: '/daily/additional-work' },
      { label: 'Evaluasi Sore (EOD)', to: '/daily/eod' },
      { label: 'Riwayat Saya', to: '/daily/history' },
      { label: 'Koreksi Komitmen Pagi', to: '/corrections/morning' },
      { label: 'Koreksi Evaluasi Sore', to: '/corrections/eod' },
    ],
  },
  {
    title: 'Kendala (Blocker)',
    items: [
      { label: 'Lapor Kendala', to: '/blockers/raise' },
      { label: 'Antrean Blocker', to: '/blockers', roles: MANAGERIAL },
      { label: 'Penuaan & Eskalasi', to: '/blockers/aging', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'] },
    ],
  },
  {
    title: 'Cuti & Koreksi',
    items: [
      { label: 'Cuti Saya', to: '/leave/my' },
      { label: 'Persetujuan Cuti', to: '/leave/queue', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA', 'SUPERVISOR'] },
      { label: 'Review Koreksi', to: '/corrections/review', roles: MANAGERIAL },
    ],
  },
  {
    title: 'Tim & Pembinaan',
    items: [
      { label: 'Catatan Coaching', to: '/coaching' },
      {
        label: 'Radar Risiko Proyek',
        to: '/projects/risk',
        roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA', 'SUPERVISOR', 'PROJECT_MANAGER'],
      },
    ],
  },
  {
    title: 'HRGA & Manajemen',
    items: [
      { label: 'Laporan Eksekutif', to: '/reports', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'] },
      { label: 'Antrean Kepatuhan', to: '/compliance', roles: ADMIN_LEVEL },
      { label: 'Manajemen Dispensasi', to: '/exemptions', roles: ADMIN_LEVEL },
      { label: 'Kebijakan & Cut-off', to: '/admin/policies', roles: ['SYSTEM_ADMIN', 'CEO_MANAGEMENT', 'HEAD', 'HRGA'] },
    ],
  },
  {
    title: 'Administrasi Sistem',
    items: [
      { label: 'Kelola Pengguna', to: '/admin/users', roles: ['SYSTEM_ADMIN', 'HRGA'] },
      { label: 'Undangan Karyawan', to: '/admin/invitations', roles: ADMIN_LEVEL },
      { label: 'Struktur Organisasi', to: '/admin/organization', roles: ['SYSTEM_ADMIN', 'HRGA'] },
      { label: 'Reviewer Sementara', to: '/admin/temporary-reviewers', roles: ['SYSTEM_ADMIN', 'HRGA'] },
      { label: 'Saluran Notifikasi', to: '/admin/notifications', roles: ['SYSTEM_ADMIN', 'HRGA'] },
    ],
  },
  {
    title: 'Akun',
    items: [
      { label: 'Notifikasi', to: '/notifications' },
      { label: 'Profil & Kata Sandi', to: '/profile' },
    ],
  },
];

/** Menyaring grup menu sesuai peran; grup kosong dibuang. */
export function navForRole(role: string | undefined | null): NavGroup[] {
  if (!role) return [];
  return navGroups
    .map((g) => ({
      title: g.title,
      items: g.items.filter((i) => !i.roles || i.roles.includes(role as RoleName)),
    }))
    .filter((g) => g.items.length > 0);
}
