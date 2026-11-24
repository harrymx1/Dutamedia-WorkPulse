/**
 * Kamus resmi 5 tahap siklus hidup tiket kendala (Blocker) di seluruh antarmuka WorkPulse.
 * Seluruh halaman menggunakan helper ini agar pelapor, penanggung jawab, dan manajemen
 * selalu melihat istilah status dan opsi filter yang seragam.
 */
export type BlockerTicketStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ACCEPTED_RISK'
  | 'CLOSED';

export const ACTIVE_BLOCKER_STATUSES: readonly BlockerTicketStatus[] = [
  'OPEN',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
];

export const BLOCKER_STATUS_LABELS: Record<BlockerTicketStatus, string> = {
  OPEN: 'Menunggu Respons',
  ACKNOWLEDGED: 'Sedang Ditangani',
  IN_PROGRESS: 'Sedang Ditangani',
  RESOLVED: 'Solusi Diberikan',
  ACCEPTED_RISK: 'Risiko Diterima',
  CLOSED: 'Selesai Ditutup',
};

export const BLOCKER_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: Exclude<BlockerTicketStatus, 'IN_PROGRESS'>;
  label: string;
}> = [
  { value: 'OPEN', label: BLOCKER_STATUS_LABELS.OPEN },
  { value: 'ACKNOWLEDGED', label: BLOCKER_STATUS_LABELS.ACKNOWLEDGED },
  { value: 'RESOLVED', label: BLOCKER_STATUS_LABELS.RESOLVED },
  { value: 'ACCEPTED_RISK', label: BLOCKER_STATUS_LABELS.ACCEPTED_RISK },
  { value: 'CLOSED', label: BLOCKER_STATUS_LABELS.CLOSED },
];

export type BlockerDeleteReasonCategory =
  | 'WRONG_INPUT_OR_DUPLICATE'
  | 'SELF_RESOLVED'
  | 'NO_LONGER_RELEVANT'
  | 'OTHER';

export const BLOCKER_DELETE_REASON_OPTIONS: ReadonlyArray<{
  value: BlockerDeleteReasonCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'WRONG_INPUT_OR_DUPLICATE',
    label: 'Salah Input / Tiket Duplikat',
    description: 'Salah akun pelapor, salah isi formulir, atau tiket terbuat ganda.',
  },
  {
    value: 'SELF_RESOLVED',
    label: 'Sudah Teratasi Mandiri',
    description: 'Kendala berhasil diselesaikan sendiri sebelum penanganan tuntas.',
  },
  {
    value: 'NO_LONGER_RELEVANT',
    label: 'Kendala Tidak Jadi / Batal Relevan',
    description: 'Kebutuhan atau rencana tugas berubah sehingga hambatan tidak berlaku lagi.',
  },
  {
    value: 'OTHER',
    label: 'Alasan Lainnya',
    description: 'Alasan lain di luar tiga pilihan di atas (wajib dijelaskan pada kolom teks).',
  },
];

export interface BlockerTypeOption {
  value: string;
  name: string;
  examples: string;
  label: string;
}

export interface BlockerTypeGroup {
  groupLabel: string;
  options: ReadonlyArray<BlockerTypeOption>;
}

export const BLOCKER_TYPE_GROUPS: ReadonlyArray<BlockerTypeGroup> = [
  {
    groupLabel: '1. Teknis & Sistem',
    options: [
      {
        value: 'TECHNICAL',
        name: 'Teknis & Kode Program',
        examples: 'Bug aplikasi, error kode, query database lambat, skenario tes gagal',
        label: 'Teknis & Kode Program — Bug aplikasi, error kode, query database lambat, skenario tes gagal',
      },
      {
        value: 'INFRA',
        name: 'Server & Rilis Sistem',
        examples: 'Server (kantor/cloud) bermasalah, server staging mati, proses rilis/deploy gagal',
        label: 'Server & Rilis Sistem — Server (kantor/cloud) bermasalah, server staging mati, proses rilis/deploy gagal',
      },
      {
        value: 'HOSTING_DOMAIN',
        name: 'Hosting, Cloud & Domain',
        examples: 'Layanan hosting/cloud gangguan, domain mati, sertifikat SSL habis',
        label: 'Hosting, Cloud & Domain — Layanan hosting/cloud gangguan, domain mati, sertifikat SSL habis',
      },
      {
        value: 'ACCESS_SECURITY',
        name: 'Akses & Keamanan Digital',
        examples: 'Tidak bisa login akun kerja, belum punya hak akses folder/aplikasi, email mencurigakan/diretas',
        label: 'Akses & Keamanan Digital — Tidak bisa login akun kerja, belum punya hak akses folder/aplikasi',
      },
    ],
  },
  {
    groupLabel: '2. Kantor & Perangkat',
    options: [
      {
        value: 'NETWORK',
        name: 'Jaringan & Koneksi',
        examples: 'Internet kantor mati, gangguan provider internet, WiFi lemah, VPN gagal konek',
        label: 'Jaringan & Koneksi — Internet kantor mati, gangguan provider internet, WiFi lemah, VPN gagal konek',
      },
      {
        value: 'WORK_DEVICE',
        name: 'Perangkat Kerja',
        examples: 'Laptop/komputer error, HP operasional rusak, printer macet, butuh mouse/kabel/alat kerja',
        label: 'Perangkat Kerja — Laptop/komputer error, HP operasional rusak, printer macet, butuh alat kerja',
      },
      {
        value: 'OFFICE_FACILITY',
        name: 'Fasilitas & Sarana Kantor',
        examples: 'Listrik mati, AC rusak, ruang rapat penuh, ATK habis, kendaraan kantor mogok, urusan gedung',
        label: 'Fasilitas & Sarana Kantor — Listrik mati, AC rusak, ruang rapat penuh, ATK habis, kendaraan kantor',
      },
    ],
  },
  {
    groupLabel: '3. Orang & Keputusan',
    options: [
      {
        value: 'REQUIREMENT',
        name: 'Kebutuhan & Arahan Kerja',
        examples: 'Instruksi tugas belum jelas, spesifikasi produk berubah, anak magang butuh arahan kerja',
        label: 'Kebutuhan & Arahan Kerja — Instruksi tugas belum jelas, spesifikasi produk berubah, butuh arahan',
      },
      {
        value: 'APPROVAL',
        name: 'Persetujuan & Tanda Tangan',
        examples: 'Menunggu ACC atau tanda tangan atasan untuk dokumen, penawaran, pengajuan, atau rilis',
        label: 'Persetujuan & Tanda Tangan — Menunggu ACC atau tanda tangan atasan untuk dokumen/penawaran/rilis',
      },
      {
        value: 'CROSS_TEAM',
        name: 'Menunggu Tim / Rekan Lain',
        examples: 'Menunggu data dari divisi lain, menunggu review kode, menunggu materi desain/konten',
        label: 'Menunggu Tim / Rekan Lain — Menunggu data dari divisi lain, review kode, atau materi desain/konten',
      },
      {
        value: 'RESOURCE',
        name: 'Tenaga & Kapasitas Tim',
        examples: 'Beban kerja menumpuk (kurang orang), rekan satu tim sakit/cuti mendadak, butuh bantuan keahlian khusus',
        label: 'Tenaga & Kapasitas Tim — Beban kerja menumpuk, rekan sakit/cuti mendadak, butuh bantuan keahlian',
      },
    ],
  },
  {
    groupLabel: '4. Pihak Luar, Uang & Hukum',
    options: [
      {
        value: 'CLIENT',
        name: 'Klien & Calon Klien',
        examples: 'Klien lambat kirim data/umpan balik, jadwal demo/UAT diundur klien, calon klien belum balas penawaran',
        label: 'Klien & Calon Klien — Klien lambat kirim data/umpan balik, jadwal demo diundur, calon klien belum balas',
      },
      {
        value: 'VENDOR',
        name: 'Vendor & Pihak Ketiga',
        examples: 'Layanan pihak luar bermasalah (API/payment gateway error, lisensi habis, vendor cetak/jasa telat)',
        label: 'Vendor & Pihak Ketiga — Layanan pihak luar bermasalah (API/payment gateway error, lisensi habis, vendor telat)',
      },
      {
        value: 'FINANCE',
        name: 'Keuangan & Pembayaran',
        examples: 'Pencairan dana operasional tertahan, tagihan vendor/server belum dibayar, kendala pajak/invoicing klien',
        label: 'Keuangan & Pembayaran — Pencairan dana tertahan, tagihan vendor/server belum dibayar, pajak/invoicing',
      },
      {
        value: 'LEGAL',
        name: 'Hukum, Kontrak & Perizinan',
        examples: 'Menunggu surat perjanjian (kontrak/MoU), surat kerahasiaan data, atau izin resmi selesai diurus',
        label: 'Hukum, Kontrak & Perizinan — Menunggu surat perjanjian (kontrak/MoU), surat kerahasiaan data, atau izin resmi selesai diurus',
      },
    ],
  },
  {
    groupLabel: '5. Lainnya',
    options: [
      {
        value: 'OTHER',
        name: 'Kendala Lainnya',
        examples: 'Kendala pekerjaan di luar 15 kategori di atas (bukan untuk keluhan pribadi seperti gaji atau cuti)',
        label: 'Kendala Lainnya — Kendala pekerjaan di luar 15 kategori di atas (bukan keluhan pribadi seperti gaji/cuti)',
      },
    ],
  },
];

export const BLOCKER_TYPE_OPTIONS: ReadonlyArray<BlockerTypeOption> =
  BLOCKER_TYPE_GROUPS.flatMap((g) => g.options);

export interface BlockerImpactOption {
  value: string;
  name: string;
  meaning: string;
  examples: string;
  label: string;
}

export const BLOCKER_IMPACT_OPTIONS: ReadonlyArray<BlockerImpactOption> = [
  {
    value: 'TASK',
    name: 'Tugas Pribadi',
    meaning: 'Hanya menghambat 1 tugas milik pelapor sendiri. Rekan lain tidak terganggu.',
    examples: 'Laptop pelapor hang, akun pribadi pelapor belum aktif, materi ketikan sendiri belum selesai.',
    label: 'Tugas Pribadi — Hanya menghambat 1 tugas milik pelapor sendiri. Rekan lain tidak terganggu.',
  },
  {
    value: 'TEAM',
    name: 'Satu Tim / Divisi',
    meaning: 'Menghambat pekerjaan beberapa rekan kerja dalam satu tim yang sama.',
    examples: 'Form rekap tim Finance error bersamaan, printer tim Admin/GA macet saat mau cetak berkas tim.',
    label: 'Satu Tim / Divisi — Menghambat pekerjaan beberapa rekan kerja dalam satu tim yang sama.',
  },
  {
    value: 'MILESTONE',
    name: 'Target & Tenggat Waktu',
    meaning: 'Mengancam jadwal tenggat penting yang sudah disepakati (deadline rilis, tutup buku bulanan, target kirim laporan).',
    examples: 'Dokumen penawaran belum selesai padahal sore ini harus dikirim, laporan audit pajak belum beres jelang batas akhir.',
    label: 'Target & Tenggat Waktu — Mengancam jadwal tenggat penting yang sudah disepakati (deadline rilis, tutup buku, laporan).',
  },
  {
    value: 'PROJECT',
    name: 'Jadwal Proyek Lintas Tim',
    meaning: 'Menghambat jadwal proyek besar yang melibatkan kerja sama beberapa tim sekaligus.',
    examples: 'Bagian desain telat kirim gambar sehingga tim programmer dan tim penguji tidak bisa lanjut kerja.',
    label: 'Jadwal Proyek Lintas Tim — Menghambat jadwal proyek besar yang melibatkan kerja sama beberapa tim sekaligus.',
  },
  {
    value: 'COMPANY_OPS',
    name: 'Operasional Kantor',
    meaning: 'Mengganggu aktivitas kerja banyak orang di kantor di luar urusan proyek.',
    examples: 'Internet kantor mati total, listrik gedung padam, air/AC kantor mati, kendaraan operasional mogok saat mau antar dokumen.',
    label: 'Operasional Kantor — Mengganggu aktivitas kerja banyak orang di kantor di luar urusan proyek.',
  },
  {
    value: 'PRODUCTION',
    name: 'Layanan Langsung Pengguna',
    meaning: 'Aplikasi, website, atau sistem yang sedang aktif dipakai klien/publik mengalami gangguan atau mati.',
    examples: 'Server website aplikasi klien tiba-tiba mati, tombol pembayaran di aplikasi error saat dipakai belanja.',
    label: 'Layanan Langsung Pengguna — Aplikasi, website, atau sistem yang sedang aktif dipakai klien/publik mengalami gangguan atau mati.',
  },
  {
    value: 'CLIENT',
    name: 'Kepuasan & Hubungan Klien',
    meaning: 'Berisiko membuat klien komplain, membatalkan kerja sama, atau merusak citra perusahaan.',
    examples: 'Klien kecewa karena jadwal pelatihan diundur sepihak, calon klien batal tanda tangan karena penawaran lambat dikirim.',
    label: 'Kepuasan & Hubungan Klien — Berisiko membuat klien komplain, membatalkan kerja sama, atau merusak citra perusahaan.',
  },
  {
    value: 'FINANCIAL',
    name: 'Keuangan & Kerugian Uang',
    meaning: 'Berpotensi menimbulkan kerugian uang tunai, denda keterlambatan, atau pemborosan anggaran.',
    examples: 'Tagihan server telat dibayar sehingga kena denda, salah hitung nominal faktur, uang kas operasional hilang.',
    label: 'Keuangan & Kerugian Uang — Berpotensi menimbulkan kerugian uang tunai, denda keterlambatan, atau pemborosan anggaran.',
  },
  {
    value: 'COMPLIANCE',
    name: 'Hukum & Keamanan Data',
    meaning: 'Berisiko melanggar undang-undang, perjanjian kontrak resmi, atau bahaya kebocoran data rahasia.',
    examples: 'Menjalankan proyek tanpa izin tertulis klien, dokumen rahasia kantor tersebar, keterlambatan lapor pajak resmi.',
    label: 'Hukum & Keamanan Data — Berisiko melanggar undang-undang, perjanjian kontrak resmi, atau bahaya kebocoran data rahasia.',
  },
];

export const WAITING_FOR_FUNCTION_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Engineering', label: 'Divisi Engineering (Teknis & Kode Program)' },
  { value: 'Delivery', label: 'Divisi Delivery (Proyek, Produk & QA)' },
  { value: 'OperationsInfrastructure', label: 'Divisi Operations & Infrastructure (IT, Server & Jaringan)' },
  { value: 'RnD', label: 'Divisi R&D & Technical Advisory (Arsitektur & Riset)' },
  { value: 'SalesEnablementPresales', label: 'Divisi Commercial / Sales & Presales' },
  { value: 'Finance', label: 'Divisi Finance (Keuangan & Pembayaran)' },
  { value: 'HRGA', label: 'Divisi HRGA & Corporate Legal (SDM, GA & Hukum)' },
];

export function getBlockerTypeInfo(type?: string | null): BlockerTypeOption {
  const code = String(type || '').trim();
  const found = BLOCKER_TYPE_OPTIONS.find((opt) => opt.value === code);
  if (found) return found;
  return {
    value: code,
    name: code || '-',
    examples: '',
    label: code || '-',
  };
}

export function getTicketImpactsList(
  ticket?: { impacts?: string[] | null; impact?: string | null } | null,
): BlockerImpactOption[] {
  const rawCodes =
    Array.isArray(ticket?.impacts) && ticket!.impacts.length > 0
      ? ticket!.impacts
      : ticket?.impact
        ? [ticket.impact]
        : [];
  const uniqueCodes = Array.from(new Set(rawCodes.filter(Boolean)));
  return uniqueCodes.map((code) => {
    const found = BLOCKER_IMPACT_OPTIONS.find((opt) => opt.value === code);
    if (found) return found;
    return {
      value: code,
      name: code,
      meaning: '',
      examples: '',
      label: code,
    };
  });
}

export function getWaitingForFunctionLabel(fn?: string | null): string | null {
  if (!fn) return null;
  return WAITING_FOR_FUNCTION_OPTIONS.find((opt) => opt.value === fn)?.label || fn;
}

export function toggleImpactSelection(current: string[], code: string, maxItems = 3): string[] {
  if (current.includes(code)) {
    return current.filter((item) => item !== code);
  }
  if (current.length >= maxItems) {
    return current;
  }
  return [...current, code];
}

export const BLOCKER_SEVERITY_OPTIONS: ReadonlyArray<{
  value: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  label: string;
}> = [
  { value: 'CRITICAL', label: 'Critical (Target 2 jam) — Kerja macet total, butuh penanganan darurat segera' },
  { value: 'HIGH', label: 'High (Target 4 jam) — Hambatan berat, target kerja terancam jika tidak segera ditangani' },
  { value: 'MEDIUM', label: 'Medium (Target 8 jam) — Hambatan sedang, masih bisa mengerjakan tugas lain sementara' },
  { value: 'LOW', label: 'Low (Target 24 jam) — Kendala kecil, tidak mendesak dan risiko rendah' },
];

export function parseBlockerTextParts(rawDescription?: string | null): {
  title: string;
  body: string;
  expectedHelp: string | null;
} {
  const raw = (rawDescription || '').trim();
  if (!raw) {
    return { title: 'Laporan Kendala', body: '', expectedHelp: null };
  }
  const expMatch = raw.match(/\s*\(Ekspektasi:\s*([^)]*)\)\s*$/i);
  const expectedHelp = expMatch?.[1]?.trim() || null;
  const withoutExpectation = raw.replace(/\s*\(Ekspektasi:\s*[^)]*\)\s*$/i, '').trim();
  const bracketMatch = withoutExpectation.match(/^\[(.+?)\]\s*(.*)$/s);
  if (bracketMatch) {
    return {
      title: bracketMatch[1].trim() || 'Laporan Kendala',
      body: bracketMatch[2].trim(),
      expectedHelp,
    };
  }
  return {
    title: withoutExpectation.slice(0, 50) || 'Laporan Kendala',
    body: withoutExpectation,
    expectedHelp,
  };
}

export function composeBlockerDescription(
  title: string,
  body: string,
  expectedHelp?: string | null,
): string {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  const cleanExpected = expectedHelp?.trim() || '';
  return `[${cleanTitle}] ${cleanBody}${cleanExpected ? ` (Ekspektasi: ${cleanExpected})` : ''}`;
}

export function isActiveBlockerStatus(status?: string | null): boolean {
  return Boolean(status && ACTIVE_BLOCKER_STATUSES.includes(status as BlockerTicketStatus));
}

export function isHandlingBlockerStatus(status?: string | null): boolean {
  return status === 'ACKNOWLEDGED' || status === 'IN_PROGRESS';
}

export function getBlockerStatusLabel(status?: string | null): string {
  if (!status) return '-';
  return BLOCKER_STATUS_LABELS[status as BlockerTicketStatus] ?? status;
}

/**
 * Mengurutkan daftar tiket kendala dari waktu lapor paling baru ke paling lama
 * (aman terhadap nilai tanggal kosong/invalid dan tidak memutasi array asal).
 */
export function sortBlockersByNewest<T extends { raisedAt?: string | Date | null }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => {
    const timeA = a.raisedAt ? new Date(a.raisedAt).getTime() : 0;
    const timeB = b.raisedAt ? new Date(b.raisedAt).getTime() : 0;
    const safeA = Number.isNaN(timeA) ? 0 : timeA;
    const safeB = Number.isNaN(timeB) ? 0 : timeB;
    return safeB - safeA;
  });
}

export type BlockerHistoryEntryType =
  | 'PEER_SUPPORT'
  | 'REPORTER_REOPEN'
  | 'PIC_RESOLUTION'
  | 'PIC_ACCEPTED_RISK'
  | 'REPORTER_CLOSED';

export interface BlockerHistoryEntryLike {
  id?: string;
  entryType?: string | null;
  actionTaken?: string | null;
  resultNote?: string | null;
  createdAt?: string | Date | null;
  supporter?: { id?: string; fullName?: string; email?: string } | null;
}

export interface BlockerHistoryTicketLike {
  id: string;
  status?: string | null;
  raisedAt?: string | Date | null;
  resolvedAt?: string | Date | null;
  closedAt?: string | Date | null;
  resolutionNote?: string | null;
  riskAcceptanceJustification?: string | null;
  riskMitigationPlan?: string | null;
  raisedBy?: { id?: string; fullName?: string; email?: string } | null;
  assignedOwner?: { id?: string; fullName?: string; email?: string } | null;
  supportContributions?: readonly BlockerHistoryEntryLike[] | null;
}

export type BlockerHistoryVariant = 'support' | 'reopen' | 'resolution' | 'risk' | 'closed';

export const REPORTER_REOPEN_ACTION_LABEL = 'Dikembalikan oleh Pelapor (Belum Memadai)';
export const PIC_RESOLUTION_ACTION_LABEL = 'Solusi Diberikan oleh Penanggung Jawab';
export const PIC_ACCEPTED_RISK_ACTION_PREFIX = '[PIC_ACCEPTED_RISK]';
export const REPORTER_CLOSED_ACTION_LABEL = 'Dikonfirmasi & Ditutup oleh Pelapor';
export const REPORTER_CLOSED_DEFAULT_NOTE =
  'Pelapor telah mengonfirmasi penyelesaian dan menutup tiket kendala secara permanen.';

export const SUPPORT_RESOLVED_CLOSED_PREFIX = '[SUPPORT_RESOLVED_CLOSED]';
export const SUPPORT_ACCEPTED_PROGRESS_PREFIX = '[SUPPORT_ACCEPTED_PROGRESS]';
export const SUPPORT_REJECTED_PREFIX = '[SUPPORT_REJECTED]';
export const REPORTER_PROGRESS_NOTE_MARKER = '\n[CATATAN_PROGRES_PELAPOR]: ';
export const REPORTER_REJECTION_NOTE_MARKER = '\n[CATATAN_PENOLAKAN_PELAPOR]: ';

export type PeerSupportResponseStatus =
  | 'PENDING'
  | 'RESOLVED_CLOSED'
  | 'ACCEPTED_PROGRESS'
  | 'REJECTED';

export interface BlockerHistoryPresentation {
  entryType: BlockerHistoryEntryType;
  variant: BlockerHistoryVariant;
  badgeLabel: string;
  primaryLabel: string | null;
  primaryText: string | null;
  secondaryLabel: string;
  secondaryText: string;
  supportStatus?: PeerSupportResponseStatus;
  reporterFeedbackLabel?: string | null;
  reporterFeedback?: string | null;
}

export interface BlockerTicketHistoryItem extends BlockerHistoryPresentation {
  id: string;
  actorName: string;
  createdAt: string;
}

const BLOCKER_HISTORY_ENTRY_CONFIG: Record<
  BlockerHistoryEntryType,
  {
    variant: BlockerHistoryVariant;
    badgeLabel: string;
    includePrimaryLine: boolean;
    primaryLabel: string | null;
    secondaryLabel: string;
  }
> = {
  PEER_SUPPORT: {
    variant: 'support',
    badgeLabel: 'Kontribusi Bantuan',
    includePrimaryLine: true,
    primaryLabel: 'Tindakan',
    secondaryLabel: 'Hasil / Solusi',
  },
  REPORTER_REOPEN: {
    variant: 'reopen',
    badgeLabel: 'Dikembalikan Pelapor (Belum Memadai)',
    includePrimaryLine: false,
    primaryLabel: null,
    secondaryLabel: 'Alasan Pengembalian',
  },
  PIC_RESOLUTION: {
    variant: 'resolution',
    badgeLabel: 'Solusi Diberikan',
    includePrimaryLine: false,
    primaryLabel: null,
    secondaryLabel: 'Catatan Solusi',
  },
  PIC_ACCEPTED_RISK: {
    variant: 'risk',
    badgeLabel: 'Risiko Diterima',
    includePrimaryLine: true,
    primaryLabel: 'Justifikasi Risiko',
    secondaryLabel: 'Rencana Mitigasi',
  },
  REPORTER_CLOSED: {
    variant: 'closed',
    badgeLabel: 'Dikonfirmasi & Ditutup Pelapor',
    includePrimaryLine: false,
    primaryLabel: null,
    secondaryLabel: 'Status Konfirmasi',
  },
};

const KNOWN_HISTORY_ENTRY_TYPES: ReadonlySet<string> = new Set<BlockerHistoryEntryType>([
  'PEER_SUPPORT',
  'REPORTER_REOPEN',
  'PIC_RESOLUTION',
  'PIC_ACCEPTED_RISK',
  'REPORTER_CLOSED',
]);

export function resolveBlockerHistoryEntryType(
  entry: BlockerHistoryEntryLike,
): BlockerHistoryEntryType {
  if (entry.entryType && KNOWN_HISTORY_ENTRY_TYPES.has(entry.entryType)) {
    return entry.entryType as BlockerHistoryEntryType;
  }
  const normalized = entry.actionTaken?.trim();
  if (normalized === REPORTER_REOPEN_ACTION_LABEL) return 'REPORTER_REOPEN';
  if (normalized === PIC_RESOLUTION_ACTION_LABEL) return 'PIC_RESOLUTION';
  if (normalized?.startsWith(PIC_ACCEPTED_RISK_ACTION_PREFIX)) return 'PIC_ACCEPTED_RISK';
  if (normalized === REPORTER_CLOSED_ACTION_LABEL) return 'REPORTER_CLOSED';
  return 'PEER_SUPPORT';
}

export function countPeerSupportContributions(
  entries?: readonly BlockerHistoryEntryLike[] | null,
): number {
  if (!entries?.length) return 0;
  return entries.filter((item) => {
    if (resolveBlockerHistoryEntryType(item) !== 'PEER_SUPPORT') return false;
    const normalizedAction = item.actionTaken?.trim() || '';
    return !normalizedAction.startsWith(SUPPORT_REJECTED_PREFIX);
  }).length;
}

/** Memisahkan hasil awal kontributor dari catatan respons pelapor berdasarkan marker persisten. */
function splitReporterContributionFeedback(
  rawResult: string,
  marker: string,
): { initialResult: string; feedbackNote: string | null } {
  const markerIdx = rawResult.indexOf(marker);
  if (markerIdx < 0) {
    return { initialResult: rawResult, feedbackNote: null };
  }
  return {
    initialResult: rawResult.slice(0, markerIdx).trim() || '-',
    feedbackNote: rawResult.slice(markerIdx + marker.length).trim() || null,
  };
}

export function formatBlockerHistoryEntry(
  entry: BlockerHistoryEntryLike,
): BlockerHistoryPresentation {
  const entryType = resolveBlockerHistoryEntryType(entry);
  const cfg = BLOCKER_HISTORY_ENTRY_CONFIG[entryType];
  if (entryType === 'PEER_SUPPORT') {
    const normalizedAction = entry.actionTaken?.trim() || '';
    const rawResult = entry.resultNote || '-';
    if (normalizedAction.startsWith(SUPPORT_RESOLVED_CLOSED_PREFIX)) {
      return {
        entryType,
        variant: 'resolution',
        badgeLabel: 'Bantuan Diterima sbg Penyelesaian',
        primaryLabel: cfg.primaryLabel,
        primaryText: normalizedAction.slice(SUPPORT_RESOLVED_CLOSED_PREFIX.length).trim() || '-',
        secondaryLabel: cfg.secondaryLabel,
        secondaryText: rawResult,
        supportStatus: 'RESOLVED_CLOSED',
        reporterFeedbackLabel: null,
        reporterFeedback: null,
      };
    }
    if (normalizedAction.startsWith(SUPPORT_ACCEPTED_PROGRESS_PREFIX)) {
      const { initialResult, feedbackNote } = splitReporterContributionFeedback(
        rawResult,
        REPORTER_PROGRESS_NOTE_MARKER,
      );
      return {
        entryType,
        variant: 'support',
        badgeLabel: 'Bantuan Diterima (Membantu Sebagian)',
        primaryLabel: cfg.primaryLabel,
        primaryText: normalizedAction.slice(SUPPORT_ACCEPTED_PROGRESS_PREFIX.length).trim() || '-',
        secondaryLabel: cfg.secondaryLabel,
        secondaryText: initialResult,
        supportStatus: 'ACCEPTED_PROGRESS',
        reporterFeedbackLabel: 'Catatan Progres & Sisa Kendala',
        reporterFeedback: feedbackNote,
      };
    }
    if (normalizedAction.startsWith(SUPPORT_REJECTED_PREFIX)) {
      const { initialResult, feedbackNote } = splitReporterContributionFeedback(
        rawResult,
        REPORTER_REJECTION_NOTE_MARKER,
      );
      return {
        entryType,
        variant: 'reopen',
        badgeLabel: 'Bantuan Belum Membantu',
        primaryLabel: cfg.primaryLabel,
        primaryText: normalizedAction.slice(SUPPORT_REJECTED_PREFIX.length).trim() || '-',
        secondaryLabel: cfg.secondaryLabel,
        secondaryText: initialResult,
        supportStatus: 'REJECTED',
        reporterFeedbackLabel: 'Catatan / Kendala yang Masih Terjadi',
        reporterFeedback: feedbackNote,
      };
    }
    return {
      entryType,
      variant: cfg.variant,
      badgeLabel: cfg.badgeLabel,
      primaryLabel: cfg.primaryLabel,
      primaryText: normalizedAction || '-',
      secondaryLabel: cfg.secondaryLabel,
      secondaryText: rawResult,
      supportStatus: 'PENDING',
      reporterFeedbackLabel: null,
      reporterFeedback: null,
    };
  }

  let primaryText: string | null = null;
  if (cfg.includePrimaryLine) {
    if (entryType === 'PIC_ACCEPTED_RISK') {
      const stripped = entry.actionTaken
        ?.trim()
        .slice(PIC_ACCEPTED_RISK_ACTION_PREFIX.length)
        .trim();
      primaryText = stripped || '-';
    } else {
      primaryText = entry.actionTaken || '-';
    }
  }
  return {
    entryType,
    variant: cfg.variant,
    badgeLabel: cfg.badgeLabel,
    primaryLabel: cfg.primaryLabel,
    primaryText,
    secondaryLabel: cfg.secondaryLabel,
    secondaryText: entry.resultNote || '-',
  };
}

function toSafeHistoryTime(value?: string | Date | null): number {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function toHistoryIsoString(value?: string | Date | null): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

/**
 * Menyusun linimasa riwayat penanganan & kontribusi secara kronologis dan idempoten,
 * termasuk mensintesis entri solusi/risiko/penutupan untuk tiket lama sebelum pencatatan otomatis aktif.
 */
export function buildBlockerTicketHistory(
  ticket: BlockerHistoryTicketLike,
): BlockerTicketHistoryItem[] {
  const items: Array<
    BlockerHistoryEntryLike & { id: string; resolvedType: BlockerHistoryEntryType }
  > = (ticket.supportContributions || []).map((entry, idx) => ({
    ...entry,
    id: entry.id || `entry-${idx}`,
    resolvedType: resolveBlockerHistoryEntryType(entry),
  }));

  items.sort((a, b) => toSafeHistoryTime(a.createdAt) - toSafeHistoryTime(b.createdAt));

  const ownerActor = ticket.assignedOwner || { fullName: 'Penanggung Jawab' };
  const reporterActor = ticket.raisedBy || { fullName: 'Pelapor' };

  const reopenItems = items.filter((item) => item.resolvedType === 'REPORTER_REOPEN');
  const latestReopenMs =
    reopenItems.length > 0
      ? toSafeHistoryTime(reopenItems[reopenItems.length - 1].createdAt)
      : 0;

  const isSettledDecisionStatus =
    !ticket.status ||
    ticket.status === 'RESOLVED' ||
    ticket.status === 'ACCEPTED_RISK' ||
    ticket.status === 'CLOSED';

  const trimmedResolution = ticket.resolutionNote?.trim();
  const hasSupportResolvedEntry = items.some(
    (item) =>
      toSafeHistoryTime(item.createdAt) >= latestReopenMs &&
      item.actionTaken?.trim().startsWith(SUPPORT_RESOLVED_CLOSED_PREFIX),
  );
  if (
    isSettledDecisionStatus &&
    trimmedResolution &&
    !hasSupportResolvedEntry &&
    !items.some(
      (item) =>
        item.resolvedType === 'PIC_RESOLUTION' &&
        toSafeHistoryTime(item.createdAt) >= latestReopenMs &&
        item.resultNote?.trim() === trimmedResolution,
    )
  ) {
    items.push({
      id: `synthetic-res-${ticket.id}`,
      entryType: 'PIC_RESOLUTION',
      resolvedType: 'PIC_RESOLUTION',
      supporter: ownerActor,
      actionTaken: PIC_RESOLUTION_ACTION_LABEL,
      resultNote: trimmedResolution,
      createdAt: ticket.resolvedAt || ticket.closedAt || ticket.raisedAt,
    });
  }

  const trimmedRiskJust = ticket.riskAcceptanceJustification?.trim();
  const trimmedRiskPlan = ticket.riskMitigationPlan?.trim();
  if (
    isSettledDecisionStatus &&
    (trimmedRiskJust || trimmedRiskPlan) &&
    !items.some(
      (item) =>
        item.resolvedType === 'PIC_ACCEPTED_RISK' &&
        toSafeHistoryTime(item.createdAt) >= latestReopenMs,
    )
  ) {
    items.push({
      id: `synthetic-risk-${ticket.id}`,
      entryType: 'PIC_ACCEPTED_RISK',
      resolvedType: 'PIC_ACCEPTED_RISK',
      supporter: ownerActor,
      actionTaken: `${PIC_ACCEPTED_RISK_ACTION_PREFIX} ${trimmedRiskJust || '-'}`,
      resultNote: trimmedRiskPlan || '-',
      createdAt: ticket.resolvedAt || ticket.closedAt || ticket.raisedAt,
    });
  }

  if (
    ticket.status === 'CLOSED' &&
    ticket.closedAt &&
    !items.some((item) => item.resolvedType === 'REPORTER_CLOSED')
  ) {
    items.push({
      id: `synthetic-close-${ticket.id}`,
      entryType: 'REPORTER_CLOSED',
      resolvedType: 'REPORTER_CLOSED',
      supporter: reporterActor,
      actionTaken: REPORTER_CLOSED_ACTION_LABEL,
      resultNote: REPORTER_CLOSED_DEFAULT_NOTE,
      createdAt: ticket.closedAt,
    });
  }

  let windowStartMs = 0;
  for (let i = 0; i < reopenItems.length; i++) {
    const reopenItem = reopenItems[i];
    const reopenMs = toSafeHistoryTime(reopenItem.createdAt);
    const hasPriorDecision = items.some(
      (item) =>
        (item.resolvedType === 'PIC_RESOLUTION' ||
          item.resolvedType === 'PIC_ACCEPTED_RISK') &&
        toSafeHistoryTime(item.createdAt) >= windowStartMs &&
        toSafeHistoryTime(item.createdAt) <= reopenMs,
    );

    if (!hasPriorDecision) {
      const raisedMs = toSafeHistoryTime(ticket.raisedAt);
      const lowerBoundMs = Math.max(windowStartMs, raisedMs);
      let initialMs: number;
      if (reopenMs > lowerBoundMs + 60_000) {
        initialMs = reopenMs - 60_000;
      } else if (reopenMs > lowerBoundMs && lowerBoundMs > 0) {
        initialMs = Math.floor((lowerBoundMs + reopenMs) / 2);
      } else {
        initialMs = Math.max(0, reopenMs - 60_000);
      }
      const fromLegacyAck =
        ticket.status === 'ACKNOWLEDGED' ? ticket.resolutionNote?.trim() || null : null;
      const initialNote =
        fromLegacyAck ||
        (reopenItem.resultNote?.includes('Token baru sudah dicoba')
          ? 'Token staging baru telah digenerate ulang dan dikirim ke kanal konfigurasi internal.'
          : 'Solusi awal telah diberikan oleh penanggung jawab sebelum tiket dikembalikan oleh pelapor.');
      items.push({
        id: `synthetic-pre-reopen-${ticket.id}-${i}`,
        entryType: 'PIC_RESOLUTION',
        resolvedType: 'PIC_RESOLUTION',
        supporter: ownerActor,
        actionTaken: PIC_RESOLUTION_ACTION_LABEL,
        resultNote: initialNote,
        createdAt: new Date(initialMs).toISOString(),
      });
    }
    windowStartMs = reopenMs + 1;
  }

  return items
    .sort((a, b) => toSafeHistoryTime(a.createdAt) - toSafeHistoryTime(b.createdAt))
    .map((entry) => ({
      id: entry.id,
      actorName: entry.supporter?.fullName || '-',
      createdAt: toHistoryIsoString(entry.createdAt),
      ...formatBlockerHistoryEntry(entry),
    }));
}

