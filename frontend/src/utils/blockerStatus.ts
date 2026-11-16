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

export const BLOCKER_TYPE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'TECHNICAL', label: 'Technical — Bug, kendala kode, query database' },
  { value: 'REQUIREMENT', label: 'Requirement — Spesifikasi belum jelas / berubah' },
  { value: 'CLIENT', label: 'Client — Menunggu respon, data, UAT dari klien' },
  { value: 'VENDOR', label: 'Vendor — API eksternal, SaaS, lisensi pihak ketiga' },
  { value: 'RESOURCE', label: 'Resource — Kapasitas tim, cuti, dependensi personil' },
  { value: 'APPROVAL', label: 'Approval — Menunggu persetujuan pimpinan / stakeholder' },
  { value: 'INFRA', label: 'Infra — Server, staging, CI/CD, VPN, jaringan' },
  { value: 'FINANCE', label: 'Finance — Pembayaran server/domain/anggaran tertahan' },
  { value: 'LEGAL', label: 'Legal — Kontrak, NDA, kepatuhan data' },
  { value: 'OTHER', label: 'Other — Kendala operasional lainnya' },
];

export const BLOCKER_IMPACT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'TASK', label: 'Task — Menghambat 1 tugas individu' },
  { value: 'MILESTONE', label: 'Milestone — Mengancam target fase / sprint' },
  { value: 'PROJECT', label: 'Project — Menghambat jadwal proyek lintas tim' },
  { value: 'PRODUCTION', label: 'Production — Mengganggu layanan live / klien aktif' },
  { value: 'CLIENT', label: 'Client — Berdampak langsung pada kepuasan klien' },
  { value: 'FINANCIAL', label: 'Financial — Potensi kerugian / pinalti finansial' },
  { value: 'COMPLIANCE', label: 'Compliance — Risiko kepatuhan hukum / perjanjian kontrak' },
];

export const BLOCKER_SEVERITY_OPTIONS: ReadonlyArray<{
  value: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  label: string;
}> = [
  { value: 'CRITICAL', label: 'Critical — Pekerjaan terhenti total / insiden produksi' },
  { value: 'HIGH', label: 'High — Hambatan berat pada jadwal atau milestone' },
  { value: 'MEDIUM', label: 'Medium — Hambatan parsial dengan alternatif kerja' },
  { value: 'LOW', label: 'Low — Kendala minor berisiko rendah' },
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
  return entries.filter((item) => resolveBlockerHistoryEntryType(item) === 'PEER_SUPPORT').length;
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
        reporterFeedback: null,
      };
    }
    if (normalizedAction.startsWith(SUPPORT_ACCEPTED_PROGRESS_PREFIX)) {
      return {
        entryType,
        variant: 'support',
        badgeLabel: 'Bantuan Diterima (Belum Selesai)',
        primaryLabel: cfg.primaryLabel,
        primaryText: normalizedAction.slice(SUPPORT_ACCEPTED_PROGRESS_PREFIX.length).trim() || '-',
        secondaryLabel: cfg.secondaryLabel,
        secondaryText: rawResult,
        supportStatus: 'ACCEPTED_PROGRESS',
        reporterFeedback: null,
      };
    }
    if (normalizedAction.startsWith(SUPPORT_REJECTED_PREFIX)) {
      const markerIdx = rawResult.indexOf(REPORTER_REJECTION_NOTE_MARKER);
      const initialResult =
        markerIdx >= 0 ? rawResult.slice(0, markerIdx).trim() || '-' : rawResult;
      const rejectionReason =
        markerIdx >= 0
          ? rawResult.slice(markerIdx + REPORTER_REJECTION_NOTE_MARKER.length).trim() || null
          : null;
      return {
        entryType,
        variant: 'reopen',
        badgeLabel: 'Belum Mengatasi Kendala',
        primaryLabel: cfg.primaryLabel,
        primaryText: normalizedAction.slice(SUPPORT_REJECTED_PREFIX.length).trim() || '-',
        secondaryLabel: cfg.secondaryLabel,
        secondaryText: initialResult,
        supportStatus: 'REJECTED',
        reporterFeedback: rejectionReason,
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

