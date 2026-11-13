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

export function isActiveBlockerStatus(status?: string | null): boolean {
  return Boolean(status && ACTIVE_BLOCKER_STATUSES.includes(status as BlockerTicketStatus));
}

export function getBlockerStatusLabel(status?: string | null): string {
  if (!status) return '-';
  return BLOCKER_STATUS_LABELS[status as BlockerTicketStatus] ?? status;
}

