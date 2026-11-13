<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted, nextTick } from 'vue';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import {
  BLOCKER_STATUS_FILTER_OPTIONS,
  getBlockerStatusLabel,
  isActiveBlockerStatus,
  type BlockerTicketStatus,
} from '../../utils/blockerStatus';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Check,
  User,
  HeartHandshake,
  CheckSquare,
  ShieldAlert,
  RotateCcw,
  ChevronRight,
  ArrowUp,
  X,
} from 'lucide-vue-next';

export type { BlockerTicketStatus };

interface BlockerTicketItem {
  id: string;
  description: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  status: BlockerTicketStatus;
  raisedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  targetResolutionAt?: string;
  ownerNeededType: string;
  projectCodeReference?: string;
  resolutionNote?: string;
  riskAcceptanceJustification?: string;
  riskMitigationPlan?: string;
  raisedBy: { id: string; fullName: string; email: string };
  assignedOwner?: { id: string; fullName: string; email: string };
  supportContributions?: Array<{
    id: string;
    supporter: { id: string; fullName: string; email: string };
    actionTaken: string;
    resultNote: string;
    createdAt: string;
  }>;
}

const authStore = useAuthStore();

// State
const loading = ref(false);
const blockers = ref<BlockerTicketItem[]>([]);
const selectedTicket = ref<BlockerTicketItem | null>(null);
const listSectionRef = ref<HTMLElement | null>(null);
const detailSectionRef = ref<HTMLElement | null>(null);

// Menyesuaikan breakpoint CSS `.queue-split` saat beralih ke tampilan bertumpuk 1 kolom
const STACKED_QUEUE_MEDIA_QUERY = '(max-width: 1024px)';

// Filters
const statusFilter = ref<string>('ALL');
const mineFilter = ref<string>('ALL');
const typeFilter = ref<string>('ALL');

// Modals
const isSupportModalOpen = ref(false);
const supportAction = ref('');
const supportResult = ref('');
const submittingSupport = ref(false);

const isResolveModalOpen = ref(false);
const resolutionNote = ref('');
const submittingResolve = ref(false);

const isAcceptRiskModalOpen = ref(false);
const riskJustification = ref('');
const riskMitigation = ref('');
const submittingAcceptRisk = ref(false);

const isReopenModalOpen = ref(false);
const reopenReason = ref('');
const submittingReopen = ref(false);

const submittingClose = ref(false);
const acknowledging = ref(false);

// Toast & Feedback
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => { errorMessage.value = null; }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => { toastMessage.value = null; }, 3500);
  }
}

async function loadBlockers() {
  loading.value = true;
  try {
    let url = '/blockers?';
    if (statusFilter.value !== 'ALL') url += `status=${statusFilter.value}&`;
    if (mineFilter.value !== 'ALL') url += `mine=${mineFilter.value}&`;

    const res = await apiClient<BlockerTicketItem[]>(url);
    if (res.data) {
      blockers.value = res.data;
      if (blockers.value.length > 0 && !selectedTicket.value) {
        selectedTicket.value = blockers.value[0];
      } else if (selectedTicket.value) {
        // Refresh selected ticket in place atau sinkronkan ke tiket pertama jika tiket terpilih kena filter
        const updated = blockers.value.find((b) => b.id === selectedTicket.value?.id);
        selectedTicket.value = updated || blockers.value[0] || null;
      }
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat antrean tiket kendala.', true);
  } finally {
    loading.value = false;
  }
}

// Metrics & Lifecycle Helpers
const isActiveTicket = isActiveBlockerStatus;

const isSelectedTicketReporter = computed(() =>
  Boolean(
    selectedTicket.value &&
      authStore.user?.id &&
      selectedTicket.value.raisedBy?.id === authStore.user.id,
  ),
);

function parseTicketContent(rawDescription?: string): {
  title: string;
  body: string;
  expectedHelp: string | null;
} {
  const raw = (rawDescription || '').trim();
  if (!raw) {
    return { title: '-', body: '', expectedHelp: null };
  }

  let working = raw;
  let expectedHelp: string | null = null;
  const expMatch = working.match(/\s*\(Ekspektasi:\s*([^)]+)\)\s*$/i);
  if (expMatch) {
    expectedHelp = expMatch[1].trim();
    working = working.slice(0, expMatch.index).trim();
  }

  const titleMatch = working.match(/^\[(.+?)\]\s*(.*)$/s);
  if (titleMatch) {
    return {
      title: titleMatch[1].trim(),
      body: titleMatch[2].trim(),
      expectedHelp,
    };
  }

  return {
    title: working,
    body: '',
    expectedHelp,
  };
}

const parsedSelectedTicket = computed(() =>
  parseTicketContent(selectedTicket.value?.description),
);

function formatAuthorityLabel(ownerNeededType?: string): string {
  if (ownerNeededType === 'PROJECT_AUTHORITY') return 'Kewenangan Proyek';
  if (ownerNeededType === 'ORGANIZATIONAL_AUTHORITY') {
    return 'Struktural Organisasi (Atasan Langsung / Divisi)';
  }
  return ownerNeededType || '-';
}

const criticalCount = computed(
  () => blockers.value.filter((b) => b.severity === 'CRITICAL' && isActiveTicket(b.status)).length,
);
const pendingAckCount = computed(() => blockers.value.filter((b) => b.status === 'OPEN').length);
const totalActiveCount = computed(
  () => blockers.value.filter((b) => isActiveTicket(b.status)).length,
);

const filteredBlockers = computed(() => {
  return blockers.value.filter((b) => {
    if (typeFilter.value !== 'ALL' && b.type !== typeFilter.value) return false;
    return true;
  });
});

async function selectTicket(ticket: BlockerTicketItem) {
  selectedTicket.value = ticket;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia(STACKED_QUEUE_MEDIA_QUERY).matches) {
      await nextTick();
      detailSectionRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }
  }
}

function scrollBackToTicketList() {
  listSectionRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}

// Terima & Tangani Action
async function handleAcknowledge(ticketId: string) {
  acknowledging.value = true;
  try {
    await apiClient(`/blockers/${ticketId}/acknowledge`, { method: 'POST' });
    showToast(`Tiket kendala berhasil diterima dan berstatus ${getBlockerStatusLabel('ACKNOWLEDGED')}.`);
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menerima dan menangani tiket.', true);
  } finally {
    acknowledging.value = false;
  }
}

// Support Contribution Action
function openSupportModal() {
  supportAction.value = '';
  supportResult.value = '';
  isSupportModalOpen.value = true;
}

async function submitSupportContribution() {
  if (!selectedTicket.value) return;
  if (supportAction.value.trim().length < 5) {
    showToast('Tindakan bantuan minimal 5 karakter.', true);
    return;
  }
  if (supportResult.value.trim().length < 5) {
    showToast('Hasil / progres bantuan minimal 5 karakter.', true);
    return;
  }

  submittingSupport.value = true;
  try {
    await apiClient(`/blockers/${selectedTicket.value.id}/support`, {
      method: 'POST',
      body: JSON.stringify({
        actionTaken: supportAction.value.trim(),
        resultNote: supportResult.value.trim(),
      }),
    });
    isSupportModalOpen.value = false;
    showToast('Kontribusi bantuan berhasil dicatat.');
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menambahkan bantuan.', true);
  } finally {
    submittingSupport.value = false;
  }
}

// Resolve Action
function openResolveModal() {
  resolutionNote.value = '';
  isResolveModalOpen.value = true;
}

async function submitResolve() {
  if (!selectedTicket.value) return;
  if (resolutionNote.value.trim().length < 10) {
    showToast('Catatan resolusi wajib diisi minimal 10 karakter.', true);
    return;
  }

  submittingResolve.value = true;
  try {
    await apiClient(`/blockers/${selectedTicket.value.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        resolutionNote: resolutionNote.value.trim(),
      }),
    });
    isResolveModalOpen.value = false;
    showToast(`Solusi berhasil dicatat. Tiket berstatus ${getBlockerStatusLabel('RESOLVED')} dan menunggu konfirmasi pelapor.`);
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menyelesaikan tiket.', true);
  } finally {
    submittingResolve.value = false;
  }
}

// Accept Risk Action
function openAcceptRiskModal() {
  riskJustification.value = '';
  riskMitigation.value = '';
  isAcceptRiskModalOpen.value = true;
}

async function submitAcceptRisk() {
  if (!selectedTicket.value) return;
  if (riskJustification.value.trim().length < 10) {
    showToast('Justifikasi penerimaan risiko wajib diisi minimal 10 karakter.', true);
    return;
  }
  if (riskMitigation.value.trim().length < 10) {
    showToast('Rencana mitigasi risiko wajib diisi minimal 10 karakter.', true);
    return;
  }

  submittingAcceptRisk.value = true;
  try {
    await apiClient(`/blockers/${selectedTicket.value.id}/accept-risk`, {
      method: 'POST',
      body: JSON.stringify({
        riskAcceptanceJustification: riskJustification.value.trim(),
        riskMitigationPlan: riskMitigation.value.trim(),
      }),
    });
    isAcceptRiskModalOpen.value = false;
    showToast(`Keputusan ${getBlockerStatusLabel('ACCEPTED_RISK')} dicatat dan menunggu konfirmasi pelapor.`);
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menetapkan Terima Risiko.', true);
  } finally {
    submittingAcceptRisk.value = false;
  }
}

// Close & Reopen Actions (Reporter Confirmation)
async function handleCloseTicket(ticketId: string) {
  submittingClose.value = true;
  try {
    await apiClient(`/blockers/${ticketId}/close`, { method: 'POST' });
    showToast(`Tiket kendala telah dikonfirmasi dan berstatus ${getBlockerStatusLabel('CLOSED')}.`);
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menutup tiket kendala.', true);
  } finally {
    submittingClose.value = false;
  }
}

function openReopenModal() {
  reopenReason.value = '';
  isReopenModalOpen.value = true;
}

async function submitReopen() {
  if (!selectedTicket.value) return;
  if (reopenReason.value.trim().length < 10) {
    showToast('Alasan pengembalian tiket wajib diisi minimal 10 karakter.', true);
    return;
  }

  submittingReopen.value = true;
  try {
    await apiClient(`/blockers/${selectedTicket.value.id}/reopen`, {
      method: 'POST',
      body: JSON.stringify({
        reopenReason: reopenReason.value.trim(),
      }),
    });
    isReopenModalOpen.value = false;
    showToast(`Tiket dikembalikan ke penanggung jawab dengan status ${getBlockerStatusLabel('ACKNOWLEDGED')}.`);
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal mengembalikan tiket.', true);
  } finally {
    submittingReopen.value = false;
  }
}

function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

function isSlaBreached(targetStr?: string) {
  if (!targetStr) return false;
  return new Date() > new Date(targetStr);
}

onMounted(() => {
  loadBlockers();
});
</script>

<template>
  <div class="queue-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Management / Antrean Eskalasi Blocker" />

    <!-- Toasts -->
    <div v-if="toastMessage" class="toast-popup success" role="status">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>
    <div v-if="errorMessage" class="toast-popup error" role="alert">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <main class="main-content">
      <!-- Page Heading & Metric Summary Cards -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Manajemen Kendala, Eskalasi &amp; Dukungan Lintas Fungsi</span>
          <h1>Antrean Eskalasi Blocker</h1>
          <p class="subtitle">
            Pantau seluruh kendala aktif, terima dan tangani tiket masuk, salurkan bantuan tim, serta catat solusi atau keputusan risiko sebelum melewati batas waktu penanganan.
          </p>
        </div>
      </div>

      <!-- Top 3 Exception Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card alert-rose">
          <div class="metric-top">
            <span class="metric-label">Kritis Belum Selesai</span>
            <ShieldAlert :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ criticalCount }}</div>
          <div class="metric-sub">Tiket skala Critical aktif membutuhkan mitigasi darurat</div>
        </div>

        <div class="metric-card alert-amber">
          <div class="metric-top">
            <span class="metric-label">Menunggu Respons</span>
            <Clock :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ pendingAckCount }}</div>
          <div class="metric-sub">Tiket berstatus Menunggu Respons belum ditindaklanjuti oleh PIC terkait</div>
        </div>

        <div class="metric-card alert-blue">
          <div class="metric-top">
            <span class="metric-label">Total Kendala Aktif</span>
            <AlertTriangle :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ totalActiveCount }}</div>
          <div class="metric-sub">Tiket aktif yang masih berjalan (Menunggu Respons &amp; Sedang Ditangani)</div>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="toolbar">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter" @change="loadBlockers">
            <option value="ALL">Semua Status</option>
            <option
              v-for="statusOpt in BLOCKER_STATUS_FILTER_OPTIONS"
              :key="statusOpt.value"
              :value="statusOpt.value"
            >
              {{ statusOpt.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Kepemilikan:</label>
          <select v-model="mineFilter" @change="loadBlockers">
            <option value="ALL">Semua Tiket</option>
            <option value="assigned">Ditugaskan ke Saya</option>
            <option value="raised">Dilaporkan oleh Saya</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Kategori:</label>
          <select v-model="typeFilter">
            <option value="ALL">Semua Kategori</option>
            <option value="TECHNICAL">Technical</option>
            <option value="REQUIREMENT">Requirement</option>
            <option value="INFRA">Infra</option>
            <option value="APPROVAL">Approval</option>
            <option value="CLIENT">Client</option>
            <option value="VENDOR">Vendor</option>
            <option value="RESOURCE">Resource</option>
          </select>
        </div>

        <div class="toolbar-spacer"></div>

        <AccessLink to="/raise-blockers" class="btn-create">
          <Plus :size="16" />
          <span>Laporkan Blocker Baru</span>
        </AccessLink>
      </div>

      <!-- Main Queue 2-Column Split -->
      <div class="queue-split">
        <!-- Kolom Kiri: Daftar Tiket -->
        <div ref="listSectionRef" class="ticket-list-col" data-testid="ticket-list-panel">
          <div v-if="loading" class="empty-state">
            <span>Memuat antrean kendala...</span>
          </div>
          <div v-else-if="filteredBlockers.length === 0" class="empty-state">
            <CheckCircle2 :size="32" class="empty-icon" />
            <p>Tidak ada tiket kendala yang cocok dengan filter saat ini.</p>
          </div>

          <div
            v-for="ticket in filteredBlockers"
            :key="ticket.id"
            class="ticket-card"
            :class="{
              selected: selectedTicket?.id === ticket.id,
              'sla-breached': isSlaBreached(ticket.targetResolutionAt) && isActiveTicket(ticket.status)
            }"
            :data-testid="`ticket-card-${ticket.id}`"
            @click="selectTicket(ticket)"
          >
            <!-- Baris 1: Severity, Kategori, Status & Batas Waktu Indicator -->
            <div class="ticket-row-1">
              <div class="badge-cluster">
                <span class="sev-badge" :class="ticket.severity.toLowerCase()">{{ ticket.severity }}</span>
                <span class="type-pill">{{ ticket.type }}</span>
                <span v-if="ticket.projectCodeReference" class="proj-pill">{{ ticket.projectCodeReference }}</span>
              </div>
              <div class="status-wrap">
                <span
                  v-if="isActiveTicket(ticket.status) && isSlaBreached(ticket.targetResolutionAt)"
                  class="sla-breach-badge"
                >
                  LEWAT BATAS WAKTU
                </span>
                <span class="status-badge" :class="ticket.status.toLowerCase()">
                  {{ getBlockerStatusLabel(ticket.status) }}
                </span>
              </div>
            </div>

            <!-- Baris 2: Judul & Ringkasan Kendala -->
            <div class="ticket-row-2">
              <div class="ticket-list-title">{{ parseTicketContent(ticket.description).title }}</div>
              <p v-if="parseTicketContent(ticket.description).body" class="ticket-desc">
                {{ parseTicketContent(ticket.description).body }}
              </p>
            </div>

            <!-- Baris 3: Pelapor, PIC & Support Counter -->
            <div class="ticket-row-3">
              <div class="ticket-meta">
                <span class="meta-item"><User :size="13" /> {{ ticket.raisedBy.fullName }}</span>
                <span class="meta-sep">·</span>
                <span class="meta-time">{{ formatRelativeTime(ticket.raisedAt) }}</span>
              </div>
              <div class="ticket-side-info">
                <span v-if="ticket.supportContributions && ticket.supportContributions.length > 0" class="support-count">
                  <HeartHandshake :size="13" /> {{ ticket.supportContributions.length }} Bantuan
                </span>
                <ChevronRight :size="16" class="arrow-icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Detail & Aksi Tiket Terpilih -->
        <div ref="detailSectionRef" class="ticket-detail-col" data-testid="ticket-detail-panel">
          <div v-if="!selectedTicket" class="detail-empty">
            <p>Pilih tiket kendala di kolom sebelah kiri untuk melihat detail dan tindakan.</p>
          </div>

          <div v-else class="detail-card">
            <!-- Navigasi Balik ke Daftar (Khusus Tablet / Smartphone) -->
            <div class="detail-mobile-nav">
              <button
                type="button"
                class="btn-back-to-list"
                data-testid="btn-back-to-list"
                @click="scrollBackToTicketList"
              >
                <ArrowUp :size="14" />
                <span>Kembali ke Daftar</span>
              </button>
            </div>

            <!-- Header Detail -->
            <div class="detail-head">
              <div>
                <span class="ticket-id">Tiket #{{ selectedTicket.id.substring(0, 8) }}</span>
                <div class="detail-badges">
                  <span class="sev-badge" :class="selectedTicket.severity.toLowerCase()">{{ selectedTicket.severity }}</span>
                  <span class="type-pill">{{ selectedTicket.type }}</span>
                  <span class="status-badge" :class="selectedTicket.status.toLowerCase()">
                    {{ getBlockerStatusLabel(selectedTicket.status) }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="detail-actions">
                <button
                  v-if="selectedTicket.status === 'OPEN'"
                  type="button"
                  class="btn-action ack"
                  :disabled="acknowledging"
                  @click="handleAcknowledge(selectedTicket.id)"
                >
                  <CheckSquare :size="15" />
                  <span>{{ acknowledging ? 'Memproses...' : 'Terima & Tangani' }}</span>
                </button>

                <button
                  v-if="selectedTicket.status !== 'CLOSED'"
                  type="button"
                  class="btn-action support"
                  @click="openSupportModal"
                >
                  <HeartHandshake :size="15" />
                  <span>Beri Bantuan</span>
                </button>

                <button
                  v-if="isActiveTicket(selectedTicket.status)"
                  type="button"
                  class="btn-action accept-risk"
                  @click="openAcceptRiskModal"
                >
                  <ShieldAlert :size="15" />
                  <span>Terima Risiko</span>
                </button>

                <button
                  v-if="isActiveTicket(selectedTicket.status)"
                  type="button"
                  class="btn-action resolve"
                  @click="openResolveModal"
                >
                  <Check :size="15" />
                  <span>Selesaikan</span>
                </button>

                <button
                  v-if="
                    (selectedTicket.status === 'RESOLVED' ||
                      selectedTicket.status === 'ACCEPTED_RISK') &&
                    isSelectedTicketReporter
                  "
                  type="button"
                  class="btn-action reopen"
                  @click="openReopenModal"
                >
                  <RotateCcw :size="15" />
                  <span>Belum Memadai</span>
                </button>

                <button
                  v-if="
                    (selectedTicket.status === 'RESOLVED' ||
                      selectedTicket.status === 'ACCEPTED_RISK') &&
                    isSelectedTicketReporter
                  "
                  type="button"
                  class="btn-action close"
                  :disabled="submittingClose"
                  @click="handleCloseTicket(selectedTicket.id)"
                >
                  <CheckCircle2 :size="15" />
                  <span>{{ submittingClose ? 'Menutup...' : 'Konfirmasi & Tutup' }}</span>
                </button>
              </div>
            </div>

            <!-- Body Detail -->
            <div class="detail-body">
              <div class="info-block">
                <label>Fakta &amp; Deskripsi Kendala</label>
                <div class="desc-content">
                  <div class="parsed-title">{{ parsedSelectedTicket.title }}</div>
                  <p v-if="parsedSelectedTicket.body" class="parsed-body">{{ parsedSelectedTicket.body }}</p>
                  <div v-if="parsedSelectedTicket.expectedHelp" class="parsed-expectation">
                    <span class="exp-label">Ekspektasi Bantuan / Tindakan:</span>
                    <span>{{ parsedSelectedTicket.expectedHelp }}</span>
                  </div>
                </div>
              </div>

              <div class="info-grid-2">
                <div class="info-block">
                  <label>Pelapor</label>
                  <div class="user-item">
                    <User :size="16" />
                    <div>
                      <strong>{{ selectedTicket.raisedBy.fullName }}</strong>
                      <small>{{ selectedTicket.raisedBy.email }}</small>
                    </div>
                  </div>
                </div>

                <div class="info-block">
                  <label>Penanggung Jawab Awal (PIC)</label>
                  <div class="user-item">
                    <User :size="16" />
                    <div>
                      <strong>{{ selectedTicket.assignedOwner ? selectedTicket.assignedOwner.fullName : 'Otomatis Sistem' }}</strong>
                      <small>{{ selectedTicket.assignedOwner ? selectedTicket.assignedOwner.email : 'Sesuai Pemetaan Otoritas' }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-grid-2">
                <div class="info-block">
                  <label>Konteks Kewenangan</label>
                  <div class="authority-stack">
                    <strong class="authority-primary">{{ formatAuthorityLabel(selectedTicket.ownerNeededType) }}</strong>
                    <span v-if="selectedTicket.projectCodeReference" class="authority-proj-tag">
                      Proyek: {{ selectedTicket.projectCodeReference }}
                    </span>
                  </div>
                </div>

                <div class="info-block">
                  <label>Target Batas Penanganan</label>
                  <div class="context-val">
                    <Clock :size="14" />
                    <span>{{ selectedTicket.targetResolutionAt ? new Date(selectedTicket.targetResolutionAt).toLocaleString('id-ID') : 'Tidak ditentukan' }}</span>
                  </div>
                </div>
              </div>

              <!-- Banner Menunggu Konfirmasi Pelapor / Ditutup Final -->
              <div
                v-if="
                  selectedTicket.status === 'RESOLVED' ||
                  selectedTicket.status === 'ACCEPTED_RISK'
                "
                class="awaiting-confirm-banner"
              >
                <Clock :size="16" />
                <span>
                  Menunggu verifikasi dan konfirmasi penutupan dari pelapor ({{ selectedTicket.raisedBy.fullName }}).
                </span>
              </div>

              <div v-if="selectedTicket.status === 'CLOSED'" class="closed-banner">
                <CheckCircle2 :size="16" />
                <span>
                  Tiket telah dikonfirmasi selesai dan ditutup permanen oleh pelapor
                  <template v-if="selectedTicket.closedAt">
                    ({{ new Date(selectedTicket.closedAt).toLocaleString('id-ID') }})
                  </template>.
                </span>
              </div>

              <!-- Hasil Resolusi -->
              <div v-if="selectedTicket.resolutionNote" class="resolution-box">
                <div class="res-head">
                  <CheckCircle2 :size="18" />
                  <strong>Catatan Solusi / Penyelesaian</strong>
                </div>
                <p>{{ selectedTicket.resolutionNote }}</p>
              </div>

              <!-- Keputusan Risiko Diterima -->
              <div
                v-if="
                  selectedTicket.riskAcceptanceJustification ||
                  selectedTicket.riskMitigationPlan
                "
                class="accepted-risk-box"
              >
                <div class="risk-head">
                  <ShieldAlert :size="18" />
                  <strong>Keputusan {{ getBlockerStatusLabel('ACCEPTED_RISK') }}</strong>
                </div>
                <div v-if="selectedTicket.riskAcceptanceJustification" class="risk-field">
                  <span class="risk-field-label">Justifikasi Penerimaan Risiko:</span>
                  <p>{{ selectedTicket.riskAcceptanceJustification }}</p>
                </div>
                <div v-if="selectedTicket.riskMitigationPlan" class="risk-field">
                  <span class="risk-field-label">Rencana Mitigasi Sementara:</span>
                  <p>{{ selectedTicket.riskMitigationPlan }}</p>
                </div>
              </div>

              <!-- Support Contributions Feed -->
              <div class="support-section">
                <div class="sec-head">
                  <HeartHandshake :size="18" />
                  <h3>Riwayat Kontribusi Bantuan ({{ selectedTicket.supportContributions?.length || 0 }})</h3>
                </div>

                <div v-if="!selectedTicket.supportContributions || selectedTicket.supportContributions.length === 0" class="no-support">
                  Belum ada bantuan tercatat untuk tiket ini. Klik "Beri Bantuan" untuk mencatat kontribusi peer-support.
                </div>

                <div v-else class="support-list">
                  <div v-for="sup in selectedTicket.supportContributions" :key="sup.id" class="support-item">
                    <div class="sup-meta">
                      <strong>{{ sup.supporter.fullName }}</strong>
                      <span>{{ new Date(sup.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB</span>
                    </div>
                    <div class="sup-action"><strong>Tindakan:</strong> {{ sup.actionTaken }}</div>
                    <div class="sup-result"><strong>Hasil / Solusi:</strong> {{ sup.resultNote }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Support Contribution -->
    <div v-if="isSupportModalOpen" class="modal-backdrop" @click.self="isSupportModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Salurkan Kontribusi Bantuan (Peer Support)</h3>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isSupportModalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Catat bantuan konkret yang telah Anda berikan untuk mengurai kendala rekan kerja.
          </p>
          <div class="form-group">
            <label for="supportAction">Aksi Bantuan yang Diberikan <span class="req">*</span></label>
            <input
              id="supportAction"
              v-model="supportAction"
              type="text"
              placeholder="Contoh: Mengirimkan kredensial staging baru via secret manager..."
            />
          </div>
          <div class="form-group">
            <label for="supportResult">Hasil / Progres yang Dicapai <span class="req">*</span></label>
            <textarea
              id="supportResult"
              v-model="supportResult"
              rows="3"
              placeholder="Contoh: Koneksi API sandbox telah terverifikasi normal kembali..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isSupportModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingSupport"
            @click="submitSupportContribution"
          >
            {{ submittingSupport ? 'Menyimpan...' : 'Simpan Kontribusi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Resolve Blocker -->
    <div v-if="isResolveModalOpen" class="modal-backdrop" @click.self="isResolveModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Selesaikan Kendala</h3>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isResolveModalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Catat fakta solusi yang diterapkan agar menjadi referensi pengetahuan bagi tim.
          </p>
          <div class="form-group">
            <div class="label-row">
              <label for="resolutionNote">Catatan Resolusi / Tindakan Perbaikan <span class="req">*</span></label>
              <span class="char-count" :class="{ ok: resolutionNote.trim().length >= 10 }">
                {{ resolutionNote.trim().length }} / 10 karakter min
              </span>
            </div>
            <textarea
              id="resolutionNote"
              v-model="resolutionNote"
              rows="4"
              minlength="10"
              placeholder="Jelaskan langkah konkret penyelesaian masalah ini (min. 10 karakter)..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isResolveModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingResolve"
            @click="submitResolve"
          >
            {{ submittingResolve ? 'Menyimpan...' : 'Kirim Solusi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Accept Risk -->
    <div v-if="isAcceptRiskModalOpen" class="modal-backdrop" @click.self="isAcceptRiskModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Tetapkan {{ getBlockerStatusLabel('ACCEPTED_RISK') }}</h3>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isAcceptRiskModalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Gunakan opsi ini apabila kendala belum dapat dihilangkan dalam waktu dekat (misalnya ketergantungan pihak ketiga/biaya) dan pekerjaan harus tetap berjalan dengan mitigasi sementara.
          </p>
          <div class="form-group">
            <div class="label-row">
              <label for="riskJustification">Justifikasi Penerimaan Risiko <span class="req">*</span></label>
              <span class="char-count" :class="{ ok: riskJustification.trim().length >= 10 }">
                {{ riskJustification.trim().length }} / 10 min
              </span>
            </div>
            <textarea
              id="riskJustification"
              v-model="riskJustification"
              rows="3"
              placeholder="Jelaskan alasan mengapa risiko ini diterima sementara (min. 10 karakter)..."
            ></textarea>
          </div>
          <div class="form-group">
            <div class="label-row">
              <label for="riskMitigation">Rencana Mitigasi Sementara <span class="req">*</span></label>
              <span class="char-count" :class="{ ok: riskMitigation.trim().length >= 10 }">
                {{ riskMitigation.trim().length }} / 10 min
              </span>
            </div>
            <textarea
              id="riskMitigation"
              v-model="riskMitigation"
              rows="3"
              placeholder="Jelaskan langkah workaround atau kontrol risiko bagi pelapor (min. 10 karakter)..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isAcceptRiskModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingAcceptRisk"
            @click="submitAcceptRisk"
          >
            {{ submittingAcceptRisk ? 'Menyimpan...' : 'Tetapkan Terima Risiko' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Reopen Blocker -->
    <div v-if="isReopenModalOpen" class="modal-backdrop" @click.self="isReopenModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Kembalikan Tiket Kendala</h3>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isReopenModalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Tiket akan dikembalikan ke status {{ getBlockerStatusLabel('ACKNOWLEDGED') }} agar penanggung jawab menindaklanjuti ulang kendala Anda.
          </p>
          <div class="form-group">
            <div class="label-row">
              <label for="reopenReason">Alasan Solusi / Mitigasi Belum Memadai <span class="req">*</span></label>
              <span class="char-count" :class="{ ok: reopenReason.trim().length >= 10 }">
                {{ reopenReason.trim().length }} / 10 min
              </span>
            </div>
            <textarea
              id="reopenReason"
              v-model="reopenReason"
              rows="3"
              placeholder="Jelaskan bagian yang masih terhambat (min. 10 karakter)..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isReopenModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingReopen"
            @click="submitReopen"
          >
            {{ submittingReopen ? 'Mengembalikan...' : 'Kembalikan ke PIC' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  background: #00674D;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;
}

.brand-title {
  font-weight: 800;
  font-size: 15px;
}

.breadcrumb {
  font-size: 13px;
  color: #5C6E68;
  border-left: 1px solid #DCE7E2;
  padding-left: 12px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-topbar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #DCE7E2;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: #5C6E68;
  text-decoration: none;
}

.btn-topbar-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

.page-heading {
  margin-bottom: 20px;
}

.eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  color: #5C6E68;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0 6px;
}

.subtitle {
  font-size: 13.5px;
  color: #5C6E68;
  max-width: 760px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 16px 20px;
}

.metric-card.alert-rose { border-left: 4px solid #DC2626; }
.metric-card.alert-amber { border-left: 4px solid #D97706; }
.metric-card.alert-blue { border-left: 4px solid #2563EB; }

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
}

.metric-value {
  font-size: 28px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.alert-rose .metric-value { color: #991B1B; }
.alert-amber .metric-value { color: #92400E; }
.alert-blue .metric-value { color: #075985; }

.metric-sub {
  font-size: 11.5px;
  color: #66736E;
}

.toolbar {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 12.5px;
  background: #fff;
}

.toolbar-spacer {
  flex: 1;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.queue-split {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 20px;
}

.ticket-list-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding-right: 4px;
  scroll-margin-top: 76px;
}

.ticket-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ticket-card:hover {
  border-color: #A9C7BC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ticket-card.selected {
  border-color: #00674D;
  background: #FAFCFB;
  box-shadow: 0 0 0 1px #00674D;
}

.ticket-card.sla-breached {
  border-left: 4px solid #DC2626;
}

.ticket-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.badge-cluster {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.sev-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.sev-badge.critical { background: #FEE2E2; color: #991B1B; }
.sev-badge.high { background: #FFEDD5; color: #9A3412; }
.sev-badge.medium { background: #FEF3C7; color: #92400E; }
.sev-badge.low { background: #EFF5F2; color: #5C6E68; }

.type-pill, .proj-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #EFF5F2;
  color: #5C6E68;
}

.status-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.status-badge.open { background: #FEF3C7; color: #92400E; }
.status-badge.acknowledged { background: #E0F2FE; color: #075985; }
.status-badge.in_progress { background: #E0E7FF; color: #3730A3; }
.status-badge.resolved { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
.status-badge.accepted_risk { background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; }
.status-badge.closed { background: #DCFCE7; color: #166534; }

.sla-breach-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: #FEE2E2;
  color: #991B1B;
  margin-right: 6px;
}

.ticket-list-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0E211B;
  margin-bottom: 4px;
  line-height: 1.35;
}

.ticket-desc {
  font-size: 12.5px;
  font-weight: 400;
  color: #475B54;
  line-height: 1.4;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-row-3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #5C6E68;
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ticket-side-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.support-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #00674D;
  font-weight: 700;
  background: #E6F4EE;
  padding: 2px 6px;
  border-radius: 4px;
}

.ticket-detail-col {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  overflow: hidden;
  scroll-margin-top: 76px;
}

.detail-empty {
  padding: 60px 24px;
  text-align: center;
  color: #5C6E68;
  font-size: 13.5px;
}

.detail-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAFCFB;
  flex-wrap: wrap;
  gap: 12px;
}

.ticket-id {
  font-size: 12px;
  font-family: var(--font-mono, monospace);
  color: #5C6E68;
}

.detail-badges {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-mobile-nav {
  display: none;
}

.btn-back-to-list {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #CBE0D6;
  background: #fff;
  color: #00674D;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-back-to-list:hover {
  background: #E6F4EE;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-action.ack { background: #E0F2FE; color: #075985; border-color: #BAE6FD; }
.btn-action.support { background: #E6F4EE; color: #00674D; border-color: #A7F3D0; }
.btn-action.accept-risk { background: #FFF7ED; color: #C2410C; border-color: #FED7AA; }
.btn-action.resolve { background: #DCFCE7; color: #166534; border-color: #86EFAC; }
.btn-action.reopen { background: #FEF2F2; color: #991B1B; border-color: #FECACA; }
.btn-action.close { background: #00674D; color: #FFFFFF; border-color: #00674D; }

.detail-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-block label {
  font-size: 11.5px;
  font-weight: 700;
  color: #5C6E68;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}

.desc-content {
  font-size: 13.5px;
  line-height: 1.5;
  color: #0E211B;
  background: #FAFCFB;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #EFF5F2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.parsed-title {
  font-size: 14px;
  font-weight: 700;
  color: #0E211B;
}

.parsed-body {
  margin: 0;
  font-size: 13px;
  color: #334841;
  white-space: pre-line;
}

.parsed-expectation {
  margin-top: 2px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #EFF5F2;
  font-size: 12.5px;
  color: #1F352E;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-label {
  font-size: 11px;
  font-weight: 700;
  color: #00674D;
  text-transform: uppercase;
}

.authority-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.authority-primary {
  font-size: 13px;
  font-weight: 700;
  color: #0E211B;
  line-height: 1.35;
}

.authority-proj-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  background: #E6F4EE;
  color: #00674D;
  border: 1px solid #B7E4D1;
  font-size: 11.5px;
  font-weight: 700;
}

.awaiting-confirm-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
  font-size: 12.5px;
  font-weight: 600;
}

.closed-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  color: #166534;
  font-size: 12.5px;
  font-weight: 600;
}

.accepted-risk-box {
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  padding: 14px 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #C2410C;
}

.risk-field-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: #9A3412;
  margin-bottom: 2px;
}

.risk-field p {
  margin: 0;
  font-size: 13px;
  color: #7C2D12;
  line-height: 1.45;
}

.info-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.user-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-item strong {
  font-size: 13px;
  display: block;
}

.user-item small {
  font-size: 11.5px;
  color: #5C6E68;
}

.context-val {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.resolution-box {
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  padding: 14px 16px;
  border-radius: 8px;
}

.res-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  margin-bottom: 6px;
}

.resolution-box p {
  font-size: 13px;
  color: #166534;
  margin: 0;
  line-height: 1.45;
}

.support-section {
  border-top: 1px solid #DCE7E2;
  padding-top: 16px;
}

.sec-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #00674D;
}

.sec-head h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.no-support {
  font-size: 12.5px;
  color: #5C6E68;
  padding: 12px;
  background: #FAFCFB;
  border-radius: 6px;
  text-align: center;
}

.support-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.support-item {
  background: #F4FBF7;
  border: 1px solid #C4EBD8;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
}

.sup-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: #00674D;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(14, 33, 27, 0.16);
}

.modal-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-head h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #5C6E68;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.req {
  color: #DC2626;
}

.char-count {
  font-size: 11.5px;
  font-weight: 600;
  color: #94A3B8;
}

.char-count.ok {
  color: #00674D;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1.5px solid #CBD5E1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  color: #0F172A;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-group textarea {
  resize: vertical;
  min-height: 96px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00674D;
  box-shadow: 0 0 0 3px rgba(0, 103, 77, 0.12);
}

.modal-hint {
  font-size: 12.5px;
  color: #5C6E68;
  margin-bottom: 14px;
}

.modal-foot {
  padding: 14px 20px;
  border-top: 1px solid #DCE7E2;
  background: #FAFCFB;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid #DCE7E2;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 7px 16px;
  border-radius: 6px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.toast-popup {
  position: fixed;
  top: 70px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success { background: #DCFCE7; color: #166534; border: 1px solid #86EFAC; }
.toast-popup.error { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }

@media (max-width: 1024px) {
  .queue-split {
    grid-template-columns: 1fr;
  }
  .ticket-list-col {
    max-height: 440px;
  }
  .detail-mobile-nav {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #EFF5F2;
    background: #F7FAF9;
  }
}

@media (max-width: 900px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
