<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { formatDateWib, formatDateTimeWib, formatDateRangeWib } from '../../utils/dateTime';
import { isInternStatus } from '../../utils/employmentStatus';
import { getUserInitials } from '../../utils/initials';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  X,
  Info,
  RotateCcw,
} from 'lucide-vue-next';

interface LeaveQueueItem {
  id: string;
  startDate: string;
  endDate: string;
  leaveType?: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reconciled?: boolean;
  reconciliationNote?: string;
  reviewedAt?: string;
  reviewNote?: string;
  reviewNotes?: string;
  reviewedBy?: {
    id: string;
    fullName: string;
  } | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
    jobTitle?: string | null;
    function?: string | null;
    employmentStatus?: string;
  };
}

const loading = ref(false);
const queue = ref<LeaveQueueItem[]>([]);

// Filters
const activeFilter = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
const typeFilter = ref<string>('ALL');
const divisionFilter = ref<string>('ALL');
const searchQuery = ref('');

// Review Modal
const selectedRequest = ref<LeaveQueueItem | null>(null);
const isReviewModalOpen = ref(false);
const reviewDecision = ref<'APPROVED' | 'REJECTED'>('APPROVED');
const reviewNotes = ref('');
const modalError = ref('');
const submittingReview = ref(false);

// Toasts
const toastMessage = ref('');
const errorMessage = ref('');

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => {
      errorMessage.value = '';
    }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => {
      toastMessage.value = '';
    }, 4000);
  }
}

async function loadQueue() {
  loading.value = true;
  try {
    const res = await apiClient<LeaveQueueItem[]>('/leave/queue');
    queue.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat antrean permohonan cuti.', true);
  } finally {
    loading.value = false;
  }
}

// Metrics
const countTotal = computed(() => queue.value.length);
const countPending = computed(() => queue.value.filter((q) => q.status === 'PENDING').length);
const countApproved = computed(() => queue.value.filter((q) => q.status === 'APPROVED').length);
const countRejected = computed(() => queue.value.filter((q) => q.status === 'REJECTED').length);

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
  if (!role) return 'Karyawan';
  return ROLE_LABELS[role] || role;
}

function formatFunctionLabel(fn?: string | null): string {
  if (!fn) return '';
  return FUNCTION_LABELS[fn] || fn;
}

function formatRequestCode(item: LeaveQueueItem): string {
  const parsed = item.startDate ? new Date(item.startDate) : null;
  const datePart =
    parsed && !Number.isNaN(parsed.getTime())
      ? `${parsed.getUTCFullYear()}${String(parsed.getUTCMonth() + 1).padStart(2, '0')}${String(parsed.getUTCDate()).padStart(2, '0')}`
      : 'REQ';
  const shortId =
    (item.id || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase() || '0000';
  return `LVR-${datePart}-${shortId}`;
}

const availableDivisions = computed(() => {
  const set = new Set<string>();
  for (const item of queue.value) {
    const fn = item.user?.function;
    if (fn) set.add(fn);
  }
  return Array.from(set).sort((a, b) =>
    formatFunctionLabel(a).localeCompare(formatFunctionLabel(b), 'id'),
  );
});

const hasActiveFilters = computed(
  () =>
    activeFilter.value !== 'ALL' ||
    typeFilter.value !== 'ALL' ||
    divisionFilter.value !== 'ALL' ||
    Boolean(searchQuery.value.trim()),
);

function resetFilters() {
  activeFilter.value = 'ALL';
  typeFilter.value = 'ALL';
  divisionFilter.value = 'ALL';
  searchQuery.value = '';
}

const filteredQueue = computed(() => {
  return queue.value.filter((item) => {
    if (activeFilter.value !== 'ALL' && item.status !== activeFilter.value) {
      return false;
    }
    if (typeFilter.value !== 'ALL' && (item.leaveType || 'ANNUAL') !== typeFilter.value) {
      return false;
    }
    if (divisionFilter.value !== 'ALL' && item.user?.function !== divisionFilter.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchName = item.user?.fullName?.toLowerCase().includes(q);
      const matchEmail = item.user?.email?.toLowerCase().includes(q);
      const matchRole = formatRoleLabel(item.user?.role).toLowerCase().includes(q);
      const matchDivision = formatFunctionLabel(item.user?.function).toLowerCase().includes(q);
      const matchType = formatLeaveType(item.leaveType).toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchCode = formatRequestCode(item).toLowerCase().includes(q);
      const matchRange = formatDateRange(item.startDate, item.endDate).toLowerCase().includes(q);
      const matchDates = item.startDate.includes(q) || item.endDate.includes(q);
      const matchReviewer = item.reviewedBy?.fullName?.toLowerCase().includes(q);
      return (
        matchName ||
        matchEmail ||
        matchRole ||
        matchDivision ||
        matchType ||
        matchReason ||
        matchId ||
        matchCode ||
        matchRange ||
        matchDates ||
        matchReviewer
      );
    }
    return true;
  });
});

function formatLeaveType(type?: string): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Sakit';
    case 'PERMIT':
      return 'Izin';
    case 'SPECIAL_LEAVE':
      return 'Cuti Khusus';
    case 'MATERNITY':
      return 'Cuti Melahirkan';
    case 'UNPAID':
      return 'Di Luar Tanggungan';
    default:
      return type || 'Cuti Tahunan';
  }
}

function formatReason(reason?: string): string {
  if (!reason) return '(Tanpa keterangan alasan)';
  return reason.replace(/\s*\(uji rekonsiliasi Superseded by Approved Leave\)/gi, '').trim();
}

function calculateDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  const s = new Date(Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate()));
  const e = new Date(Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate()));
  if (e < s) return 0;
  let count = 0;
  const cursor = new Date(s);
  while (cursor <= e) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

function formatDateRange(startStr: string, endStr: string) {
  return formatDateRangeWib(startStr, endStr);
}

const isPermitOrInternSelected = computed(() => {
  if (!selectedRequest.value) return false;
  return (
    selectedRequest.value.leaveType === 'PERMIT' ||
    selectedRequest.value.leaveType === 'SICK' ||
    isInternStatus(selectedRequest.value.user?.employmentStatus)
  );
});

const reviewNoteTrimmedLength = computed(() => reviewNotes.value.trim().length);

function openReviewModal(item: LeaveQueueItem, defaultDecision: 'APPROVED' | 'REJECTED' = 'APPROVED') {
  selectedRequest.value = item;
  reviewDecision.value = defaultDecision;
  reviewNotes.value = '';
  modalError.value = '';
  isReviewModalOpen.value = true;
}

function closeReviewModal() {
  if (submittingReview.value) return;
  selectedRequest.value = null;
  isReviewModalOpen.value = false;
  reviewNotes.value = '';
  modalError.value = '';
}

function selectDecision(decision: 'APPROVED' | 'REJECTED') {
  reviewDecision.value = decision;
  modalError.value = '';
}

async function submitReview() {
  if (!selectedRequest.value) return;
  modalError.value = '';

  const trimmedNote = reviewNotes.value.trim();
  if (reviewDecision.value === 'REJECTED' && trimmedNote.length < 5) {
    modalError.value = 'Catatan alasan penolakan wajib diisi minimal 5 karakter.';
    showToast(modalError.value, true);
    return;
  }

  submittingReview.value = true;
  try {
    const decision = reviewDecision.value === 'APPROVED' ? 'APPROVE' : 'REJECT';
    await apiClient(`/leave/${selectedRequest.value.id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        decision,
        reviewNote: trimmedNote || undefined,
      }),
    });
    const isPermitOrIntern =
      selectedRequest.value.leaveType === 'PERMIT' ||
      selectedRequest.value.leaveType === 'SICK' ||
      isInternStatus(selectedRequest.value.user?.employmentStatus);
    const labelStr = isPermitOrIntern ? 'Permohonan izin' : 'Permohonan cuti';
    showToast(`${labelStr} berhasil ${reviewDecision.value === 'APPROVED' ? 'disetujui' : 'ditolak'}.`);
    submittingReview.value = false;
    closeReviewModal();
    await loadQueue();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal memproses permohonan cuti.';
    showToast(modalError.value, true);
    submittingReview.value = false;
  }
}

onMounted(() => {
  loadQueue();
});
</script>

<template>
  <div class="approval-layout">
    <!-- Topbar -->
    <TopBar breadcrumb="Management / Persetujuan Cuti" />

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
      <div class="page-heading">
        <div>
          <span class="eyebrow">Pusat Persetujuan Operasional &amp; Kehadiran</span>
          <h1>Antrean Persetujuan Cuti</h1>
          <p class="subtitle">
            Tinjau permohonan cuti atau izin anggota tim dalam cakupan kewenangan Anda. Persetujuan untuk hari berjalan setelah batas waktu laporan pagi yang berlaku akan otomatis memutihkan catatan ketidakhadiran hari tersebut.
          </p>
        </div>
      </div>

      <!-- 4 Metric Cards -->
      <div class="metrics-grid">
        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'ALL' }"
          :aria-pressed="activeFilter === 'ALL'"
          @click="activeFilter = 'ALL'"
        >
          <div class="metric-label">Total Permohonan</div>
          <div class="metric-value">{{ countTotal }}</div>
          <div class="metric-caption">Semua tiket cuti &amp; izin</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'PENDING' }"
          :aria-pressed="activeFilter === 'PENDING'"
          @click="activeFilter = 'PENDING'"
        >
          <div class="metric-label">Menunggu Review</div>
          <div class="metric-value text-blue">{{ countPending }}</div>
          <div class="metric-caption">Membutuhkan tindakan</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'APPROVED' }"
          :aria-pressed="activeFilter === 'APPROVED'"
          @click="activeFilter = 'APPROVED'"
        >
          <div class="metric-label">Telah Disetujui</div>
          <div class="metric-value text-green">{{ countApproved }}</div>
          <div class="metric-caption">Cuti &amp; izin disahkan</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'REJECTED' }"
          :aria-pressed="activeFilter === 'REJECTED'"
          @click="activeFilter = 'REJECTED'"
        >
          <div class="metric-label">Ditolak</div>
          <div class="metric-value text-red">{{ countRejected }}</div>
          <div class="metric-caption">Tidak disetujui</div>
        </button>
      </div>

      <!-- Table Panel -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Daftar Pengajuan Cuti &amp; Izin</h2>
            <p class="panel-subtitle">Verifikasi alasan, durasi hari kerja, dan berikan keputusan.</p>
          </div>
          <span class="pill neutral">{{ filteredQueue.length }} ditampilkan</span>
        </div>

        <div class="list-tools">
          <div class="search-wrap">
            <Search :size="16" class="search-icon" />
            <input
              v-model="searchQuery"
              type="search"
              class="search-input"
              placeholder="Cari nama, divisi, jenis, alasan, peninjau, atau kode..."
              aria-label="Cari pengajuan cuti atau izin"
            />
          </div>

          <div class="toolbar-filters">
            <select
              v-model="typeFilter"
              class="filter-select"
              aria-label="Saring jenis pengajuan"
              data-testid="type-filter"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="ANNUAL">Cuti Tahunan</option>
              <option value="PERMIT">Izin</option>
              <option value="SICK">Sakit</option>
              <option value="SPECIAL_LEAVE">Cuti Khusus</option>
              <option value="MATERNITY">Cuti Melahirkan</option>
              <option value="UNPAID">Di Luar Tanggungan</option>
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

            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn-reset-toolbar"
              @click="resetFilters"
            >
              <RotateCcw :size="14" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <Clock :size="24" class="spin" />
          <p>Memuat antrean persetujuan cuti &amp; izin...</p>
        </div>

        <div v-else-if="queue.length === 0" class="empty-state">
          <CalendarDays :size="32" />
          <p>Belum ada pengajuan cuti atau izin dalam antrean.</p>
        </div>

        <div v-else-if="filteredQueue.length === 0" class="empty-state">
          <Search :size="28" />
          <p>Tidak ada pengajuan yang cocok dengan filter atau pencarian saat ini.</p>
          <button
            type="button"
            class="btn-reset-filters"
            data-testid="reset-queue-filters"
            @click="resetFilters"
          >
            Tampilkan Semua
          </button>
        </div>

        <div v-else class="table-wrap">
          <table class="queue-table">
            <thead>
              <tr>
                <th scope="col">Karyawan</th>
                <th scope="col">Tanggal &amp; Durasi</th>
                <th scope="col">Alasan &amp; Jejak Waktu</th>
                <th scope="col">Status</th>
                <th scope="col" class="col-actions-head">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredQueue" :key="item.id">
                <td>
                  <div class="employee-meta">
                    <div class="avatar">{{ getUserInitials(item.user?.fullName, item.user?.email) }}</div>
                    <div>
                      <div class="emp-name">
                        <span>{{ item.user?.fullName || 'Pengguna' }}</span>
                        <span v-if="isInternStatus(item.user?.employmentStatus)" class="badge-intern">Intern</span>
                      </div>
                      <div class="emp-role">
                        {{ formatRoleLabel(item.user?.role) }}<template v-if="item.user?.function"> · {{ formatFunctionLabel(item.user?.function) }}</template> · {{ item.user?.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="pill-type">{{ formatLeaveType(item.leaveType) }}</span>
                  <div class="date-main wp-datetime">{{ formatDateRange(item.startDate, item.endDate) }}</div>
                  <div class="date-sub">{{ calculateDuration(item.startDate, item.endDate) }} hari kerja</div>
                </td>
                <td>
                  <div class="reason-text">{{ formatReason(item.reason) }}</div>
                  <div class="ticket-id">
                    #{{ formatRequestCode(item) }} · Diajukan <span class="wp-datetime">{{ formatDateWib(item.createdAt) }}</span>
                  </div>
                  <div v-if="item.reconciled || item.reconciliationNote" class="reconcile-chip">
                    {{ item.reconciliationNote || 'Kehadiran diputihkan otomatis (Cuti / Izin Disetujui)' }}
                  </div>
                  <div v-if="item.reviewNote || item.reviewNotes" class="review-notes-chip" :class="{ rejected: item.status === 'REJECTED' }">
                    Catatan: {{ item.reviewNote || item.reviewNotes }}
                  </div>
                </td>
                <td class="col-status">
                  <div class="status-badge-wrap">
                    <span v-if="item.status === 'PENDING'" class="pill yellow">Menunggu Review</span>
                    <span v-else-if="item.status === 'APPROVED'" class="pill green">Disetujui</span>
                    <span v-else-if="item.status === 'REJECTED'" class="pill red">Ditolak</span>
                    <span v-else class="pill neutral">{{ item.status }}</span>
                    <span v-if="item.reconciled" class="pill neutral">Rekonsiliasi Sah</span>
                  </div>
                  <div
                    v-if="(item.status === 'APPROVED' || item.status === 'REJECTED') && (item.reviewedBy?.fullName || item.reviewedAt)"
                    class="decision-meta-line"
                  >
                    {{ item.status === 'APPROVED' ? 'Disetujui oleh' : 'Ditolak oleh' }}
                    <strong>{{ item.reviewedBy?.fullName || 'Peninjau' }}</strong>
                    <template v-if="item.reviewedAt"> · <span class="wp-datetime">{{ formatDateTimeWib(item.reviewedAt) }}</span></template>
                  </div>
                </td>
                <td class="col-actions">
                  <div v-if="item.status === 'PENDING'" class="actions-line">
                    <button
                      type="button"
                      class="btn-action approve"
                      @click="openReviewModal(item, 'APPROVED')"
                    >
                      <Check :size="14" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      class="btn-action reject"
                      @click="openReviewModal(item, 'REJECTED')"
                    >
                      <X :size="14" />
                      <span>Tolak</span>
                    </button>
                  </div>
                  <span v-else class="no-action-text">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Review Modal -->
      <div
        v-if="isReviewModalOpen && selectedRequest"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        @click.self="closeReviewModal"
      >
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h3 id="review-modal-title">
                {{ isPermitOrInternSelected ? 'Tinjau Permohonan Izin / Sakit' : 'Tinjau Permohonan Cuti' }}
              </h3>
              <p class="modal-subtitle">
                {{
                  isPermitOrInternSelected
                    ? 'Tentukan keputusan persetujuan untuk pengajuan izin atau sakit anggota tim.'
                    : 'Tentukan keputusan persetujuan untuk pengajuan cuti anggota tim.'
                }}
              </p>
            </div>
            <button type="button" class="close-btn" aria-label="Tutup modal" :disabled="submittingReview" @click="closeReviewModal">
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <!-- Ringkasan Pengajuan -->
            <div class="detail-card">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Pemohon</span>
                  <div class="detail-val-user">
                    <strong>{{ selectedRequest.user?.fullName }}</strong>
                    <span class="user-role-badge">{{ formatRoleLabel(selectedRequest.user?.role) }}</span>
                    <span v-if="selectedRequest.user?.function" class="user-role-badge">{{ formatFunctionLabel(selectedRequest.user?.function) }}</span>
                    <span v-if="isInternStatus(selectedRequest.user?.employmentStatus)" class="badge-intern">Intern</span>
                  </div>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Jenis Pengajuan</span>
                  <span class="leave-type-chip">{{ formatLeaveType(selectedRequest.leaveType) }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Rentang Tanggal</span>
                  <div class="detail-val-date">
                    <CalendarDays :size="14" class="date-icon" />
                    <span class="wp-datetime">{{ formatDateRange(selectedRequest.startDate, selectedRequest.endDate) }}</span>
                    <span class="duration-badge">{{ calculateDuration(selectedRequest.startDate, selectedRequest.endDate) }} hari kerja</span>
                  </div>
                </div>

                <div class="detail-item detail-item-full">
                  <span class="detail-label">{{ isPermitOrInternSelected ? 'Alasan Izin / Pengajuan' : 'Alasan Cuti' }}</span>
                  <p class="detail-reason">{{ formatReason(selectedRequest.reason) }}</p>
                </div>
              </div>
            </div>

            <!-- Segmented Decision Control -->
            <div class="decision-selector">
              <label class="selector-label">Keputusan Persetujuan <span class="req">*</span></label>
              <div class="decision-toggle">
                <button
                  type="button"
                  class="decision-btn"
                  :class="{ active: reviewDecision === 'APPROVED', green: reviewDecision === 'APPROVED' }"
                  @click="selectDecision('APPROVED')"
                >
                  <Check :size="16" />
                  <span>Setujui Permohonan</span>
                </button>
                <button
                  type="button"
                  class="decision-btn"
                  :class="{ active: reviewDecision === 'REJECTED', red: reviewDecision === 'REJECTED' }"
                  @click="selectDecision('REJECTED')"
                >
                  <X :size="16" />
                  <span>Tolak Permohonan</span>
                </button>
              </div>
            </div>

            <!-- Banner Info Rekonsiliasi Otomatis (Saat Setujui) -->
            <div v-if="reviewDecision === 'APPROVED'" class="info-note">
              <Info :size="18" class="info-icon" />
              <div class="info-text">
                <strong>Kebijakan Rekonsiliasi Kehadiran:</strong> Menyetujui permohonan ini akan secara otomatis memperbarui status kehadiran personil dan memutihkan catatan ketidakhadiran yang mungkin telah terbentuk setelah batas waktu laporan pagi yang berlaku.
              </div>
            </div>

            <!-- Form Catatan Reviewer -->
            <div class="field">
              <div class="field-label-row">
                <label for="reviewNotes">
                  Catatan Reviewer
                </label>
                <span class="field-hint" :class="{ required: reviewDecision === 'REJECTED' }">
                  {{ reviewDecision === 'REJECTED' ? 'Wajib diisi (min. 5 karakter)' : 'Opsional' }}
                </span>
              </div>
              <textarea
                id="reviewNotes"
                v-model="reviewNotes"
                class="textarea"
                rows="3"
                maxlength="500"
                :placeholder="reviewDecision === 'APPROVED' ? 'Tuliskan arahan tugas atau catatan persetujuan untuk pemohon (opsional)...' : 'Tuliskan alasan penolakan secara jelas agar pemohon dapat mengetahuinya (wajib minimal 5 karakter)...'"
                @input="modalError = ''"
              ></textarea>
              <div v-if="reviewDecision === 'REJECTED'" class="modal-char-counter" data-testid="review-note-counter">
                <span :class="{ 'counter-valid': reviewNoteTrimmedLength >= 5 }">
                  {{ reviewNoteTrimmedLength }} / 5 karakter minimum
                </span>
                <span>{{ reviewNotes.length }} / 500</span>
              </div>
            </div>

            <div v-if="modalError" class="modal-error-banner" role="alert" data-testid="modal-error">
              <AlertCircle :size="15" />
              <span>{{ modalError }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" :disabled="submittingReview" @click="closeReviewModal">
              Batal
            </button>
            <button
              type="button"
              class="btn"
              :class="reviewDecision === 'APPROVED' ? 'btn-primary' : 'btn-danger'"
              :disabled="submittingReview"
              @click="submitReview"
            >
              <Check v-if="reviewDecision === 'APPROVED'" :size="15" />
              <X v-else :size="15" />
              <span>{{ submittingReview ? 'Memproses...' : (reviewDecision === 'APPROVED' ? 'Setujui Permohonan' : 'Tolak Permohonan') }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.approval-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 12px;
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
  font-size: 14px;
  color: var(--color-text-secondary, #5C6E68);
  max-width: 760px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.metric-card.active {
  border-color: var(--color-brand-primary, #00674D);
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
}

.metric-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
}

.metric-value {
  font-size: 26px;
  font-weight: 800;
  margin: 4px 0;
}

.text-blue { color: #075985; }
.text-green { color: #166534; }
.text-red { color: #991B1B; }

.metric-caption {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.panel {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;
}

.panel-head {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.panel-head h2 {
  font-size: 16px;
  font-weight: 800;
}

.panel-subtitle {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.list-tools {
  padding: 12px 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
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
  color: var(--color-text-secondary, #5C6E68);
}

.search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 6px;
  font-size: 13px;
}

.toolbar-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 7px 10px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 6px;
  background: #FFFFFF;
  color: var(--color-text-primary, #0E211B);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-reset-toolbar,
.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  background: #FFFFFF;
  color: var(--color-brand-primary, #00674D);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-reset-toolbar:hover,
.btn-reset-filters:hover {
  background: #EFF5F2;
}

.table-wrap {
  overflow-x: auto;
}

.queue-table {
  width: 100%;
  border-collapse: collapse;
}

.queue-table th {
  text-align: left;
  padding: 10px 18px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  white-space: nowrap;
}

.queue-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  vertical-align: middle;
}

.employee-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #E6F4EE;
  color: #00674D;
  font-weight: 800;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.emp-name {
  font-weight: 700;
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge-intern {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  background: #EDE9FE;
  color: #5B21B6;
  border: 1px solid #C4B5FD;
  font-size: 10.5px;
  font-weight: 700;
}

.emp-role {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.pill-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background: #E8F5E9;
  color: #1B5E20;
  border: 1px solid #C8E6C9;
  margin-bottom: 4px;
}

.date-main {
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
}

.date-sub {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  white-space: nowrap;
}

.reason-text {
  font-weight: 600;
  font-size: 13px;
}

.ticket-id {
  font-size: 11.5px;
  font-family: monospace;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.reconcile-chip {
  margin-top: 4px;
  padding: 3px 8px;
  background: #F1F5F9;
  border-left: 2px solid #00674D;
  border-radius: 4px;
  font-size: 11.5px;
  color: #334155;
}

.review-notes-chip {
  margin-top: 4px;
  font-size: 11.5px;
  color: #92400E;
}

.review-notes-chip.rejected {
  color: #991B1B;
}

.decision-meta-line {
  margin-top: 5px;
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  line-height: 1.4;
}

.actions-line {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-action.approve {
  background: #DCFCE7;
  color: #166534;
  border-color: #86EFAC;
}

.btn-action.reject {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid transparent;
  white-space: nowrap;
}

.col-status {
  vertical-align: middle;
}

.col-actions-head {
  text-align: right !important;
}

.col-actions {
  vertical-align: middle;
  text-align: right;
}

.no-action-text {
  color: var(--color-text-secondary, #94A3B8);
  font-size: 13px;
  padding-right: 12px;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border-color: #86EFAC;
}

.pill.yellow {
  background: #FEF9C3;
  color: #854D0E;
  border-color: #FDE047;
}

.pill.red {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.pill.neutral {
  background: #F1F5F9;
  color: #334155;
  border-color: #CBD5E1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--color-text-secondary, #5C6E68);
  gap: 12px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 999;
  padding: 16px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 16px 36px rgba(14, 33, 27, 0.16);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  overflow: hidden;
}

.modal-header {
  padding: 18px 24px 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary, #0E211B);
  margin: 0 0 4px;
}

.modal-subtitle {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary, #5C6E68);
  padding: 4px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #F0F4F2;
  color: var(--color-text-primary, #0E211B);
}

.modal-body {
  padding: 20px 24px;
}

/* Detail Card */
.detail-card {
  background: #F8FAF9;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item-full {
  grid-column: 1 / -1;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border-subtle, #DCE7E2);
}

.detail-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
}

.detail-val-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--color-text-primary, #0E211B);
}

.user-role-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: #E5E7EB;
  color: #374151;
}

.leave-type-chip {
  align-self: flex-start;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #E6F4EA;
  color: #137333;
}

.detail-val-date {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-primary, #0E211B);
  font-weight: 600;
}

.date-icon {
  color: var(--color-brand-primary, #00674D);
  flex-shrink: 0;
}

.duration-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  background: #EFF6FF;
  color: #1D4ED8;
}

.detail-reason {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-primary, #0E211B);
}

/* Decision Selector */
.decision-selector {
  margin-bottom: 16px;
}

.selector-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary, #0E211B);
  margin-bottom: 8px;
}

.decision-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.decision-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  background: #FFFFFF;
  color: var(--color-text-secondary, #5C6E68);
  cursor: pointer;
  transition: all 0.15s ease;
}

.decision-btn:hover {
  background: #F8FAF9;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.decision-btn.active.green {
  background: #ECFDF5;
  color: #065F46;
  border-color: #6EE7B7;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.decision-btn.active.red {
  background: #FFF1F2;
  color: #9F1239;
  border-color: #FDA4AF;
  box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.15);
}

/* Info Note */
.info-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 12px;
  color: #0369A1;
  line-height: 1.5;
  margin-bottom: 16px;
}

.info-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  min-width: 18px;
  color: #0284C7;
  margin-top: 1px;
}

.info-text {
  flex: 1;
}

/* Field */
.field {
  margin-bottom: 0;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.field-label-row label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary, #0E211B);
}

.field-hint {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.field-hint.required {
  color: #DC2626;
  font-weight: 600;
}

.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-primary, #0E211B);
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  transition: all 0.15s ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--color-brand-primary, #00674D);
  box-shadow: 0 0 0 3px rgba(0, 103, 77, 0.12);
}

.modal-actions {
  padding: 14px 24px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  background: #F8FAF9;
  border-top: 1px solid var(--color-border-subtle, #DCE7E2);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn-secondary {
  background: #FFFFFF;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.btn-secondary:hover {
  background: #F0F4F2;
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: #00523D;
}

.btn-danger {
  background: #DC2626;
  color: #FFFFFF;
}

.btn-danger:hover {
  background: #B91C1C;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: #DCFCE7;
  border: 1px solid #86EFAC;
  color: #166534;
}

.toast-popup.error {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}

.spin {
  animation: spin 1s linear infinite;
}

.modal-card {
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
}

.modal-body {
  overflow-y: auto;
  flex: 1;
}

.detail-val-user {
  flex-wrap: wrap;
}

.modal-char-counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.modal-char-counter .counter-valid {
  color: var(--color-brand-primary, #00674D);
  font-weight: 600;
}

.modal-error-banner {
  margin-top: 12px;
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

@media (max-width: 640px) {
  .main-content {
    padding: 16px 14px 36px;
  }

  h1 {
    font-size: 20px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
  }

  .list-tools {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrap {
    min-width: 0;
  }

  .toolbar-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .btn-reset-toolbar {
    width: 100%;
    justify-content: center;
  }

  .table-wrap {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-header,
  .modal-body,
  .modal-actions {
    padding-left: 16px;
    padding-right: 16px;
  }

  .detail-grid,
  .decision-toggle {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .toast-popup {
    left: 14px;
    right: 14px;
    top: 14px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
