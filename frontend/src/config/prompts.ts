/**
 * Kamus Resmi 10 Fungsi Kanonikal Dutamedia untuk Role-Based Output Prompt (PRD v1.6 FR-12 / AC-37).
 *
 * Panduan kontekstual sesuai fungsi organisasi pengguna saat pengisian Morning Check-in.
 * Murni inline hint non-binding berorientasi aksi (action-oriented) dalam Bahasa Indonesia.
 */

export const CANONICAL_PROMPT_HINTS: Record<string, string> = {
  Engineering:
    'Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji',
  Quality:
    'Menyelesaikan pengujian fitur, verifikasi kualitas, atau penelusuran temuan defect hari ini',
  'Operations & Infrastructure':
    'Menyelesaikan konfigurasi atau pekerjaan infrastruktur yang direncanakan hari ini',
  'R&D':
    'Menyelesaikan eksplorasi teknis, evaluasi arsitektur, atau penyusunan rekomendasi riset hari ini',
  Delivery:
    'Menyelesaikan koordinasi atau pekerjaan yang mendukung delivery proyek hari ini',
  'Business Development':
    'Menyelesaikan penjajakan kemitraan, tindak lanjut prospek, atau penyusunan proposal bisnis hari ini',
  'Sales Enablement & Presales':
    'Menyelesaikan materi atau kebutuhan pendukung aktivitas penjualan hari ini',
  Finance:
    'Menyelesaikan rekonsiliasi atau proses administrasi keuangan yang menjadi prioritas hari ini',
  HRGA:
    'Menyelesaikan proses administrasi atau kebutuhan operasional karyawan hari ini',
  Management:
    'Menyelesaikan prioritas koordinasi atau keputusan yang perlu ditindaklanjuti hari ini',
};

/**
 * Fallback netral resmi PRD v1.6 FR-12 jika fungsi kosong, null, atau belum terpetakan.
 */
export const DEFAULT_FALLBACK_PROMPT =
  'Tuliskan rencana pekerjaan yang ingin Anda selesaikan hari ini';

export function getPromptHintForFunction(func: string | undefined | null): string {
  if (!func) return DEFAULT_FALLBACK_PROMPT;
  return CANONICAL_PROMPT_HINTS[func] || DEFAULT_FALLBACK_PROMPT;
}

export function resolveUserFunction(user: { role?: string; email?: string } | null | undefined): string {
  if (!user) return 'Engineering';
  const role = user.role;
  switch (role) {
    case 'HRGA':
      return 'HRGA';
    case 'CEO_MANAGEMENT':
    case 'CEO':
      return 'Management';
    case 'SYSTEM_ADMIN':
      return 'Operations & Infrastructure';
    default:
      return 'Engineering';
  }
}

