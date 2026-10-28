/**
 * Konstanta Aturan Tetap Produk untuk Daily Accountability (PDD §8, PRD BR-01).
 * Batas jumlah komitmen harian adalah aturan baku produk, bukan parameter kebijakan (Policy).
 */
export const MIN_DAILY_COMMITMENTS = 1;
export const MAX_DAILY_COMMITMENTS = 3;

/**
 * Role-Based Output Prompt Hints per Canonical Function (ADR-016, PRD FR-12).
 * Kamus statis resmi untuk panduan komitmen Morning Check-in.
 */
export const ROLE_BASED_PROMPT_HINTS: Record<string, string> = {
  Engineering: 'Contoh: Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji',
  'Ops & Infra': 'Contoh: Menyelesaikan konfigurasi atau pekerjaan infrastruktur yang direncanakan hari ini',
  Finance: 'Contoh: Menyelesaikan rekonsiliasi atau proses administrasi keuangan yang menjadi prioritas hari ini',
  'Sales Enablement': 'Contoh: Menyelesaikan materi atau kebutuhan pendukung aktivitas penjualan hari ini',
  Delivery: 'Contoh: Menyelesaikan koordinasi atau pekerjaan yang mendukung delivery proyek hari ini',
  HRGA: 'Contoh: Menyelesaikan proses administrasi atau kebutuhan operasional karyawan hari ini',
  Management: 'Contoh: Menyelesaikan prioritas koordinasi atau keputusan yang perlu ditindaklanjuti hari ini',
};

/**
 * Fallback resmi untuk fungsi null, string kosong, whitespace, atau fungsi yang tidak terdaftar (ADR-016).
 */
export const DEFAULT_PROMPT_HINT =
  'Contoh: Tuliskan rencana pekerjaan yang ingin Anda selesaikan hari ini';

/**
 * Helper resolusi prompt berbasis atribut function organisasi pengguna aktif (ADR-016).
 * Bersifat deterministik murni, tidak bergantung pada role atau nomor slot.
 */
export function getRoleBasedPrompt(userFunction?: string | null): string {
  if (!userFunction || !userFunction.trim()) {
    return DEFAULT_PROMPT_HINT;
  }
  return ROLE_BASED_PROMPT_HINTS[userFunction.trim()] ?? DEFAULT_PROMPT_HINT;
}

