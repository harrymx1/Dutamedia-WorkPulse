<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { formatDateTimeWib } from '../../utils/dateTime';
import { getUserInitials } from '../../utils/initials';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Check,
  X,
  FileCheck,
  Search,
  RotateCcw,
} from 'lucide-vue-next';

interface CorrectionRequestItem {
  id: string;
  scopeType: 'MORNING_COMMITMENT' | 'EOD_OUTCOME';
  classification: 'MINOR' | 'MATERIAL';
  reason: string;
  valueBefore: any;
  valueRequested: any;
  status: 'PENDING' | 'AUTO_APPLIED' | 'APPROVED' | 'REJECTED';
  objectionWindowEndsAt?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  requestedByUser: {
    id: string;
    fullName: string;
    email: string;
    role?: string | null;
    function?: string | null;
    jobTitle?: string | null;
    employmentStatus?: string | null;
  };
  reviewedByUser?: { id: string; fullName: string };
  targetCommitment: { sequenceNo: number; taskText: string };
}

interface DiffPair {
  label: string;
  before: string;
  after: string;
}

// State
const loading = ref(false);
const requests = ref<CorrectionRequestItem[]>([]);
const statusFilter = ref<string>('PENDING');
const scopeFilter = ref<string>('ALL');
const divisionFilter = ref<string>('ALL');
const searchQuery = ref<string>('');

// Review Modal
const isReviewModalOpen = ref(false);
const selectedRequest = ref<CorrectionRequestItem | null>(null);
const decision = ref<'APPROVE' | 'REJECT'>('APPROVE');
const reviewNote = ref('');
const modalError = ref('');
const submittingReview = ref(false);

// Toast
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

async function loadRequests() {
  loading.value = true;
  try {
    const res = await apiClient<CorrectionRequestItem[]>('/correction-requests?mode=review');
    if (res.data) {
      requests.value = Array.isArray(res.data) ? res.data : [];
    } else if (Array.isArray(res)) {
      requests.value = res;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat antrean review koreksi.', true);
  } finally {
    loading.value = false;
  }
}

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Karyawan',
  SUPERVISOR: 'Supervisor',
  HEAD: 'Kepala Divisi',
  PROJECT_MANAGER: 'Manajer Proyek',
  HRGA: 'HRGA',
  CEO_MANAGEMENT: 'Direktur / CEO',
  SYSTEM_ADMIN: 'Admin Sistem',
};

const FUNCTION_LABELS: Record<string, string> = {
  Engineering: 'Engineering',
  Quality: 'Quality',
  OperationsInfrastructure: 'Operations & Infrastructure',
  RnD: 'R&D',
  Delivery: 'Delivery',
  BusinessDevelopment: 'Business Development',
  SalesEnablementPresales: 'Sales Enablement & Presales',
  Finance: 'Finance',
  HRGA: 'HRGA',
  Management: 'Management',
};

function formatRoleLabel(role?: string | null): string {
  if (!role) return '';
  return ROLE_LABELS[role] || role;
}

function formatFunctionLabel(fn?: string | null): string {
  if (!fn) return '';
  return FUNCTION_LABELS[fn] || fn;
}

function formatScopeLabel(scope?: string): string {
  if (scope === 'MORNING_COMMITMENT') return 'Koreksi Komitmen Pagi';
  if (scope === 'EOD_OUTCOME') return 'Koreksi Evaluasi Sore';
  return scope || 'Koreksi';
}

function formatStatusLabel(status?: string): string {
  switch (status) {
    case 'PENDING':
      return 'Menunggu Review';
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    case 'AUTO_APPLIED':
      return 'Otomatis Diterapkan';
    default:
      return status || '-';
  }
}

function formatRiskLabel(risk?: string | null): string {
  switch (risk) {
    case 'GREEN':
      return 'Aman (GREEN)';
    case 'AMBER':
      return 'Waspada (AMBER)';
    case 'RED':
      return 'Kritis (RED)';
    default:
      return risk || 'Belum diisi';
  }
}

function formatOutcomeLabel(outcome?: string | null): string {
  if (!outcome) return 'Belum diisi';
  switch (outcome) {
    case 'COMPLETED':
    case 'DONE':
      return 'DONE (Tuntas)';
    case 'PARTIALLY_COMPLETED':
    case 'IN_PROGRESS':
      return 'IN_PROGRESS (Sebagian)';
    case 'NOT_COMPLETED':
    case 'BLOCKED':
      return 'BLOCKED (Terhambat)';
    case 'CANCELLED':
    case 'DROPPED':
      return 'DROPPED (Dibatalkan)';
    default:
      return outcome;
  }
}

function formatContinuationLabel(cont?: string | null): string {
  if (!cont) return 'Belum diatur';
  switch (cont) {
    case 'CONTINUE':
    case 'CONTINUE_TOMORROW':
      return 'Lanjutkan Besok';
    case 'HANDOVER':
      return 'Serah Terima';
    case 'DO_NOT_CONTINUE':
    case 'ARCHIVE':
      return 'Arsipkan / Tuntas';
    default:
      return cont;
  }
}

function buildDiffPairs(item: CorrectionRequestItem): DiffPair[] {
  const before = item.valueBefore || {};
  const after = item.valueRequested || {};
  const pairs: DiffPair[] = [];

  if (item.scopeType === 'MORNING_COMMITMENT') {
    const beforeTask = (before.taskText || '').trim();
    const afterTask = (after.taskText || '').trim();
    if (afterTask && afterTask !== beforeTask) {
      pairs.push({
        label: 'Deskripsi Tugas',
        before: beforeTask || 'Belum diisi',
        after: afterTask,
      });
    }

    if (after.initialRisk && after.initialRisk !== before.initialRisk) {
      pairs.push({
        label: 'Tingkat Risiko',
        before: formatRiskLabel(before.initialRisk),
        after: formatRiskLabel(after.initialRisk),
      });
    }

    const beforeLink = (before.referenceLink || '').trim();
    const afterLink = after.referenceLink !== undefined ? String(after.referenceLink || '').trim() : beforeLink;
    if (after.referenceLink !== undefined && afterLink !== beforeLink) {
      pairs.push({
        label: 'Tautan Referensi',
        before: beforeLink || 'Tidak ada',
        after: afterLink || 'Tidak ada',
      });
    }

    if (pairs.length === 0) {
      pairs.push({
        label: 'Deskripsi Tugas',
        before: beforeTask || 'Belum diisi',
        after: afterTask || beforeTask || '-',
      });
    }
    return pairs;
  }

  // EOD_OUTCOME
  if (after.outcome !== undefined || before.outcome !== undefined) {
    const afterOut = after.outcome !== undefined ? formatOutcomeLabel(after.outcome) : formatOutcomeLabel(before.outcome);
    if (after.outcome !== undefined) {
      pairs.push({
        label: 'Hasil Capaian',
        before: formatOutcomeLabel(before.outcome),
        after: afterOut,
      });
    }
  }

  if (after.continuation !== undefined && after.continuation !== before.continuation) {
    pairs.push({
      label: 'Kelanjutan Tugas',
      before: formatContinuationLabel(before.continuation),
      after: formatContinuationLabel(after.continuation),
    });
  }

  const beforeReason = (before.outcomeReason || '').trim();
  const afterReason =
    after.outcomeReason !== undefined ? String(after.outcomeReason || '').trim() : beforeReason;
  if (after.outcomeReason !== undefined && afterReason !== beforeReason) {
    pairs.push({
      label: 'Keterangan Hasil',
      before: beforeReason || 'Belum diisi',
      after: afterReason || 'Dikosongkan',
    });
  }

  if (pairs.length === 0) {
    pairs.push({
      label: 'Hasil Capaian',
      before: formatOutcomeLabel(before.outcome),
      after: after.outcome ? formatOutcomeLabel(after.outcome) : '-',
    });
  }

  return pairs;
}

// Metrics
const countPending = computed(() => requests.value.filter((r) => r.status === 'PENDING').length);
const countApproved = computed(() => requests.value.filter((r) => r.status === 'APPROVED').length);
const countRejected = computed(() => requests.value.filter((r) => r.status === 'REJECTED').length);
const countAutoApplied = computed(() => requests.value.filter((r) => r.status === 'AUTO_APPLIED').length);

const availableDivisions = computed(() => {
  const set = new Set<string>();
  for (const item of requests.value) {
    const fn = item.requestedByUser?.function;
    if (fn) set.add(fn);
  }
  return Array.from(set).sort((a, b) =>
    formatFunctionLabel(a).localeCompare(formatFunctionLabel(b), 'id'),
  );
});

const hasActiveFilters = computed(
  () =>
    statusFilter.value !== 'ALL' ||
    scopeFilter.value !== 'ALL' ||
    divisionFilter.value !== 'ALL' ||
    Boolean(searchQuery.value.trim()),
);

function resetFilters() {
  statusFilter.value = 'ALL';
  scopeFilter.value = 'ALL';
  divisionFilter.value = 'ALL';
  searchQuery.value = '';
}

const filteredRequests = computed(() => {
  return requests.value.filter((r) => {
    if (statusFilter.value !== 'ALL' && r.status !== statusFilter.value) return false;
    if (scopeFilter.value !== 'ALL' && r.scopeType !== scopeFilter.value) return false;
    if (divisionFilter.value !== 'ALL' && r.requestedByUser?.function !== divisionFilter.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchName = r.requestedByUser?.fullName?.toLowerCase().includes(q);
      const matchEmail = r.requestedByUser?.email?.toLowerCase().includes(q);
      const matchDiv = formatFunctionLabel(r.requestedByUser?.function).toLowerCase().includes(q);
      const matchTask = r.targetCommitment?.taskText?.toLowerCase().includes(q);
      const matchReason = r.reason?.toLowerCase().includes(q);
      const matchScope = formatScopeLabel(r.scopeType).toLowerCase().includes(q);
      const matchReviewer = r.reviewedByUser?.fullName?.toLowerCase().includes(q);
      return (
        matchName ||
        matchEmail ||
        matchDiv ||
        matchTask ||
        matchReason ||
        matchScope ||
        matchReviewer
      );
    }
    return true;
  });
});

function openReviewModal(item: CorrectionRequestItem, choice: 'APPROVE' | 'REJECT') {
  selectedRequest.value = item;
  decision.value = choice;
  reviewNote.value = choice === 'APPROVE' ? 'Disetujui sesuai kondisi faktual lapangan' : '';
  modalError.value = '';
  isReviewModalOpen.value = true;
}

function closeReviewModal() {
  if (submittingReview.value) return;
  isReviewModalOpen.value = false;
  selectedRequest.value = null;
  modalError.value = '';
}

const reviewNoteTrimmedLength = computed(() => reviewNote.value.trim().length);

async function submitReview() {
  if (!selectedRequest.value) return;
  modalError.value = '';
  const trimmed = reviewNote.value.trim();
  if (trimmed.length < 5) {
    modalError.value = 'Catatan review peninjau minimal 5 karakter.';
    showToast(modalError.value, true);
    return;
  }

  submittingReview.value = true;
  try {
    await apiClient(`/correction-requests/${selectedRequest.value.id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        decision: decision.value,
        reviewNote: trimmed,
      }),
    });

    submittingReview.value = false;
    closeReviewModal();
    showToast(`Permohonan koreksi berhasil ${decision.value === 'APPROVE' ? 'disetujui' : 'ditolak'}.`);
    await loadRequests();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal memproses review.';
    showToast(modalError.value, true);
    submittingReview.value = false;
  }
}

function isWindowExpired(endsAt?: string) {
  if (!endsAt) return false;
  return new Date() > new Date(endsAt);
}

onMounted(() => {
  loadRequests();
});
</script>

<template>
  <div class="review-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Management / Review Koreksi" />

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
      <!-- Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Kewenangan Peninjauan &amp; Jendela Sanggahan</span>
          <h1>Review Koreksi</h1>
          <p class="subtitle">
            Tinjau permohonan koreksi material yang diajukan anggota tim dalam masa jendela sanggahan 24 jam kerja.
          </p>
        </div>
      </div>

      <!-- 4 Metric Cards -->
      <div class="metrics-grid">
        <button
          type="button"
          class="metric-card"
          :class="{ active: statusFilter === 'PENDING' }"
          :aria-pressed="statusFilter === 'PENDING'"
          @click="statusFilter = 'PENDING'"
        >
          <span class="metric-label">Menunggu Review</span>
          <strong class="metric-value text-amber">{{ countPending }}</strong>
          <span class="metric-caption">Dalam jendela sanggahan</span>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: statusFilter === 'APPROVED' }"
          :aria-pressed="statusFilter === 'APPROVED'"
          @click="statusFilter = 'APPROVED'"
        >
          <span class="metric-label">Disetujui</span>
          <strong class="metric-value text-green">{{ countApproved }}</strong>
          <span class="metric-caption">Perubahan disahkan</span>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: statusFilter === 'REJECTED' }"
          :aria-pressed="statusFilter === 'REJECTED'"
          @click="statusFilter = 'REJECTED'"
        >
          <span class="metric-label">Ditolak</span>
          <strong class="metric-value text-red">{{ countRejected }}</strong>
          <span class="metric-caption">Keberatan dicatat</span>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: statusFilter === 'AUTO_APPLIED' }"
          :aria-pressed="statusFilter === 'AUTO_APPLIED'"
          @click="statusFilter = 'AUTO_APPLIED'"
        >
          <span class="metric-label">Otomatis Diterapkan</span>
          <strong class="metric-value text-blue">{{ countAutoApplied }}</strong>
          <span class="metric-caption">Koreksi minor / usai</span>
        </button>
      </div>

      <!-- Panel Antrean Peninjauan -->
      <section class="panel">
        <div class="panel-head">
          <div class="filter-row">
            <div>
              <h2>Permohonan Koreksi Material</h2>
              <p class="panel-subtitle">Bandingkan nilai sebelum dan yang diajukan sebelum memberi keputusan.</p>
            </div>
            <span class="count-pill">{{ filteredRequests.length }} ditampilkan</span>
          </div>

          <div class="list-tools">
            <div class="search-wrap">
              <Search :size="15" class="search-icon" />
              <input
                v-model="searchQuery"
                type="search"
                class="search-input"
                placeholder="Cari pemohon, divisi, tugas, atau alasan..."
                aria-label="Cari permohonan koreksi"
              />
            </div>

            <div class="filters">
              <select
                v-model="scopeFilter"
                class="filter-select"
                aria-label="Saring lingkup koreksi"
                data-testid="scope-filter"
              >
                <option value="ALL">Semua Lingkup</option>
                <option value="MORNING_COMMITMENT">Koreksi Komitmen Pagi</option>
                <option value="EOD_OUTCOME">Koreksi Evaluasi Sore</option>
              </select>

              <select
                v-if="availableDivisions.length > 1"
                v-model="divisionFilter"
                class="filter-select"
                aria-label="Saring divisi"
                data-testid="division-filter"
              >
                <option value="ALL">Semua Divisi</option>
                <option v-for="div in availableDivisions" :key="div" :value="div">
                  {{ formatFunctionLabel(div) }}
                </option>
              </select>

              <select
                v-model="statusFilter"
                class="filter-select"
                aria-label="Saring status koreksi"
                data-testid="status-filter"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Menunggu Review</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
                <option value="AUTO_APPLIED">Otomatis Diterapkan</option>
              </select>

              <button
                v-if="hasActiveFilters"
                type="button"
                class="btn-reset-toolbar"
                @click="resetFilters"
              >
                <RotateCcw :size="14" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        <div class="table-container">
          <div v-if="loading && requests.length === 0" class="loading-state">
            <span>Memuat antrean peninjauan...</span>
          </div>

          <div v-else-if="requests.length === 0" class="empty-state">
            <FileCheck :size="36" class="empty-icon" />
            <h3>Belum Ada Permohonan Koreksi</h3>
            <p>Belum ada pengajuan koreksi dalam cakupan peninjauan Anda.</p>
          </div>

          <div v-else-if="filteredRequests.length === 0" class="empty-state">
            <FileCheck :size="36" class="empty-icon" />
            <h3>Tidak Ada Permohonan yang Cocok</h3>
            <p>Tidak ditemukan permohonan koreksi yang sesuai dengan pencarian atau penyaring saat ini.</p>
            <button
              type="button"
              class="btn-reset-filters"
              data-testid="reset-review-filters"
              @click="resetFilters"
            >
              Tampilkan Semua
            </button>
          </div>

          <table v-else class="review-table">
            <thead>
              <tr>
                <th>Pemohon</th>
                <th>Lingkup &amp; Komitmen</th>
                <th>Perbandingan Nilai</th>
                <th>Alasan Permohonan</th>
                <th>Status &amp; Jendela Sanggahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredRequests" :key="item.id">
                <td class="col-user">
                  <div class="user-inline">
                    <div class="user-avatar">{{ getUserInitials(item.requestedByUser.fullName, item.requestedByUser.email) }}</div>
                    <div>
                      <strong>{{ item.requestedByUser.fullName }}</strong>
                      <small v-if="item.requestedByUser.role || item.requestedByUser.function" class="user-meta-role">
                        {{ formatRoleLabel(item.requestedByUser.role) }}<template v-if="item.requestedByUser.role && item.requestedByUser.function"> · </template>{{ formatFunctionLabel(item.requestedByUser.function) }}
                      </small>
                      <small>{{ item.requestedByUser.email }}</small>
                    </div>
                  </div>
                </td>
                <td class="col-scope">
                  <span class="scope-pill">{{ formatScopeLabel(item.scopeType) }}</span>
                  <div class="task-ref">
                    [Tugas #{{ item.targetCommitment.sequenceNo }}] {{ item.targetCommitment.taskText }}
                  </div>
                  <div class="submitted-meta wp-datetime">
                    Diajukan {{ formatDateTimeWib(item.createdAt) }}
                  </div>
                </td>
                <td class="col-diff">
                  <div class="diff-list">
                    <div v-for="(pair, pIdx) in buildDiffPairs(item)" :key="pIdx" class="diff-box">
                      <div class="diff-pair-label">{{ pair.label }}</div>
                      <div class="diff-pair-row">
                        <div class="diff-item before">
                          <span class="diff-tag">Sebelum:</span>
                          <p>{{ pair.before }}</p>
                        </div>
                        <ArrowRight :size="13" class="diff-arrow" />
                        <div class="diff-item after">
                          <span class="diff-tag">Diajukan:</span>
                          <p>{{ pair.after }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="col-reason">
                  <p class="reason-text">{{ item.reason }}</p>
                  <div v-if="item.reviewNote && item.status !== 'PENDING'" class="reviewer-note-chip" :class="{ rejected: item.status === 'REJECTED' }">
                    Catatan Peninjau: "{{ item.reviewNote }}"
                  </div>
                </td>
                <td class="col-status">
                  <span class="status-badge" :class="item.status.toLowerCase()">
                    {{ formatStatusLabel(item.status) }}
                  </span>
                  <div v-if="item.status === 'PENDING' && item.objectionWindowEndsAt" class="window-timer">
                    <Clock :size="12" />
                    <span>
                      {{ isWindowExpired(item.objectionWindowEndsAt) ? 'Jendela Usai' : 'Batas:' }}
                      <span class="wp-datetime">{{ formatDateTimeWib(item.objectionWindowEndsAt) }}</span>
                    </span>
                  </div>
                  <div
                    v-else-if="(item.status === 'APPROVED' || item.status === 'REJECTED') && (item.reviewedByUser?.fullName || item.reviewedAt)"
                    class="decision-meta-line"
                  >
                    {{ item.status === 'APPROVED' ? 'Disetujui oleh' : 'Ditolak oleh' }}
                    <strong>{{ item.reviewedByUser?.fullName || 'Peninjau' }}</strong>
                    <template v-if="item.reviewedAt"> · <span class="wp-datetime">{{ formatDateTimeWib(item.reviewedAt) }}</span></template>
                  </div>
                </td>
                <td class="col-actions">
                  <div v-if="item.status === 'PENDING'" class="action-buttons">
                    <button
                      type="button"
                      class="btn-decision approve"
                      title="Setujui Perubahan"
                      @click="openReviewModal(item, 'APPROVE')"
                    >
                      <Check :size="14" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      class="btn-decision reject"
                      title="Tolak Perubahan"
                      @click="openReviewModal(item, 'REJECT')"
                    >
                      <X :size="14" />
                      <span>Tolak</span>
                    </button>
                  </div>
                  <span v-else class="done-text">Selesai</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Modal Konfirmasi Review -->
    <div
      v-if="isReviewModalOpen && selectedRequest"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      @click.self="closeReviewModal"
    >
      <div class="modal-card">
        <div class="modal-head">
          <h3 id="review-modal-title">{{ decision === 'APPROVE' ? 'Setujui Permohonan Koreksi' : 'Sampaikan Keberatan / Tolak Koreksi' }}</h3>
          <button type="button" class="btn-close" aria-label="Tutup" :disabled="submittingReview" @click="closeReviewModal">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-summary-card" data-testid="modal-diff-summary">
            <div class="modal-summary-meta">
              <div>
                <span class="sum-label">Pemohon</span>
                <strong>
                  {{ selectedRequest.requestedByUser.fullName }}
                  <template v-if="selectedRequest.requestedByUser.function"> · {{ formatFunctionLabel(selectedRequest.requestedByUser.function) }}</template>
                </strong>
              </div>
              <div>
                <span class="sum-label">Lingkup &amp; Tugas</span>
                <strong>{{ formatScopeLabel(selectedRequest.scopeType) }} · Komitmen #{{ selectedRequest.targetCommitment.sequenceNo }}</strong>
              </div>
            </div>
            <div class="modal-diff-pairs">
              <div v-for="(pair, idx) in buildDiffPairs(selectedRequest)" :key="idx" class="modal-diff-row">
                <span class="sum-label">{{ pair.label }}</span>
                <div class="modal-diff-values">
                  <span class="val-before">{{ pair.before }}</span>
                  <ArrowRight :size="12" />
                  <span class="val-after">{{ pair.after }}</span>
                </div>
              </div>
            </div>
            <div class="modal-reason-box">
              <span class="sum-label">Alasan Pemohon</span>
              <p>{{ selectedRequest.reason }}</p>
            </div>
          </div>

          <div class="form-group">
            <label for="reviewNoteInput">Catatan Review / Alasan Keputusan <span class="req">*</span></label>
            <textarea
              id="reviewNoteInput"
              v-model="reviewNote"
              rows="3"
              minlength="5"
              maxlength="500"
              placeholder="Tuliskan justifikasi formal persetujuan atau penolakan (min. 5 karakter)..."
              required
              @input="modalError = ''"
            ></textarea>
            <div class="modal-char-counter" data-testid="review-note-counter">
              <span :class="{ 'counter-valid': reviewNoteTrimmedLength >= 5 }">
                {{ reviewNoteTrimmedLength }} / 5 karakter minimum
              </span>
              <span>{{ reviewNote.length }} / 500</span>
            </div>
          </div>

          <div v-if="modalError" class="modal-error-banner" role="alert" data-testid="modal-error">
            <AlertCircle :size="15" />
            <span>{{ modalError }}</span>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" :disabled="submittingReview" @click="closeReviewModal">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :class="{ 'btn-danger': decision === 'REJECT' }"
            :disabled="submittingReview"
            @click="submitReview"
          >
            {{ submittingReview ? 'Memproses...' : (decision === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 64px;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-brand-primary, #00674D);
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
  max-width: 720px;
  margin: 0;
}

.btn-leave-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #A9C7BC;
  background: #FFFFFF;
  color: #00674D;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.btn-leave-link:hover {
  background: #EFF5F2;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 15px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.metric-card.active {
  border-color: #00674D;
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
}

.metric-label {
  font-size: 12px;
  font-weight: 700;
  color: #5C6E68;
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0 2px;
}

.text-amber { color: #B45309; }
.text-green { color: #166534; }
.text-red { color: #991B1B; }
.text-blue { color: #075985; }

.metric-caption {
  font-size: 11.5px;
  color: #5C6E68;
}

.panel {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  background: #FAFCFB;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-row h2 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.panel-subtitle {
  font-size: 12.5px;
  color: #5C6E68;
  margin: 2px 0 0;
}

.count-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  color: #334155;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.list-tools {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #5C6E68;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 13px;
  background: #FFFFFF;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 7px 10px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
  background: #fff;
  color: #0E211B;
}

.btn-reset-toolbar,
.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid #A9C7BC;
  background: #FFFFFF;
  color: #00674D;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-reset-toolbar:hover,
.btn-reset-filters:hover {
  background: #EFF5F2;
}

.table-container {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.review-table th {
  background: #EFF5F2;
  padding: 11px 12px;
  font-weight: 700;
  font-size: 11.5px;
  line-height: 1.3;
  color: #5C6E68;
  border-bottom: 1px solid #DCE7E2;
  text-transform: uppercase;
  white-space: normal;
}

.review-table td {
  padding: 12px 12px;
  border-bottom: 1px solid #DCE7E2;
  vertical-align: top;
}

.user-inline {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #E6F4EE;
  color: #00674D;
  font-size: 12.5px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.user-inline strong { display: block; font-size: 13px; }
.user-inline small {
  display: block;
  color: #5C6E68;
  font-size: 11.5px;
  overflow-wrap: anywhere;
  max-width: 165px;
}
.user-meta-role { color: #00674D !important; font-weight: 600; margin-top: 1px; }

.scope-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #E6F4EE;
  color: #00674D;
  display: inline-block;
  margin-bottom: 5px;
}

.task-ref {
  font-size: 12.5px;
  color: #0E211B;
  font-weight: 600;
  max-width: 170px;
  line-height: 1.4;
}

.submitted-meta {
  font-size: 11px;
  color: #5C6E68;
  margin-top: 4px;
}

.diff-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  max-width: 250px;
}

.diff-box {
  background: #FAFCFB;
  border: 1px solid #DCE7E2;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.diff-pair-label {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #00674D;
  margin-bottom: 4px;
}

.diff-pair-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-item { flex: 1; min-width: 0; }
.diff-tag { font-size: 10px; font-weight: 700; color: #5C6E68; display: block; }
.diff-item p { margin: 2px 0 0; font-weight: 600; overflow-wrap: anywhere; word-break: break-word; }
.diff-arrow { color: #5C6E68; flex-shrink: 0; }

.reason-text {
  font-size: 12.5px;
  color: #0E211B;
  max-width: 180px;
  margin: 0;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.reviewer-note-chip {
  margin-top: 6px;
  padding: 5px 8px;
  border-radius: 5px;
  background: #F0FDF4;
  border-left: 3px solid #16A34A;
  color: #166534;
  font-size: 11.5px;
  max-width: 180px;
  overflow-wrap: anywhere;
}

.reviewer-note-chip.rejected {
  background: #FEF2F2;
  border-left-color: #DC2626;
  color: #991B1B;
}

.col-status {
  min-width: 135px;
  max-width: 165px;
}

.status-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  display: inline-block;
  white-space: nowrap;
}

.status-badge.pending { background: #FEF3C7; color: #92400E; }
.status-badge.approved { background: #DCFCE7; color: #166534; }
.status-badge.rejected { background: #FEE2E2; color: #991B1B; }
.status-badge.auto_applied { background: #E0F2FE; color: #075985; }

.window-timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #B45309;
  margin-top: 5px;
}

.decision-meta-line {
  margin-top: 5px;
  font-size: 11.5px;
  color: #5C6E68;
  line-height: 1.4;
}

.col-actions {
  white-space: nowrap;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-decision {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-decision.approve {
  background: #DCFCE7;
  color: #166534;
  border-color: #86EFAC;
}

.btn-decision.reject {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.done-text {
  font-size: 12px;
  color: #66736E;
  font-style: italic;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
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

.modal-head h3 { font-size: 16px; font-weight: 800; margin: 0; }
.btn-close { background: none; border: none; color: #5C6E68; cursor: pointer; display: inline-flex; padding: 4px; border-radius: 6px; }
.btn-close:hover { background: #F1F5F9; }

.modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-summary-card {
  background: #F8FAF9;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.modal-summary-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  margin-bottom: 10px;
}

.sum-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  color: #5C6E68;
  margin-bottom: 2px;
}

.modal-summary-meta strong {
  font-size: 12.5px;
  color: #0E211B;
}

.modal-diff-pairs {
  border-top: 1px dashed #DCE7E2;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-diff-row {
  font-size: 12px;
}

.modal-diff-values {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.val-before {
  color: #5C6E68;
  text-decoration: line-through;
}

.val-after {
  color: #00674D;
  font-weight: 700;
}

.modal-reason-box {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #DCE7E2;
}

.modal-reason-box p {
  margin: 0;
  font-size: 12.5px;
  color: #0E211B;
  line-height: 1.45;
}

.form-group { margin-bottom: 8px; }
label { font-size: 12.5px; font-weight: 700; display: block; margin-bottom: 6px; }
.req { color: #991B1B; }

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
}

.modal-char-counter {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 11.5px;
  color: #5C6E68;
}

.modal-char-counter .counter-valid {
  color: #00674D;
  font-weight: 700;
}

.modal-error-banner {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
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
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #A9C7BC;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger {
  background: #DC2626 !important;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state, .loading-state {
  padding: 56px 24px;
  text-align: center;
  color: #5C6E68;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon { color: #00674D; }

.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 200;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success { background: #DCFCE7; color: #166534; border: 1px solid #86EFAC; }
.toast-popup.error { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }

.col-user {
  min-width: 200px;
}

.col-scope {
  min-width: 210px;
}

.col-diff {
  min-width: 270px;
}

.diff-list {
  min-width: 245px;
  max-width: 300px;
}

.col-reason {
  min-width: 175px;
}

.scope-pill {
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 14px 40px;
  }

  h1 {
    font-size: 20px;
  }

  .btn-leave-link {
    width: 100%;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .panel-head {
    padding: 14px 16px;
  }

  .list-tools {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrap {
    min-width: 0;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .btn-reset-toolbar {
    width: 100%;
    justify-content: center;
  }

  .modal-summary-meta {
    grid-template-columns: 1fr;
  }

  .modal-foot {
    flex-direction: column-reverse;
  }

  .modal-foot button {
    width: 100%;
  }

  .toast-popup {
    left: 14px;
    right: 14px;
    top: 14px;
  }
}
</style>

