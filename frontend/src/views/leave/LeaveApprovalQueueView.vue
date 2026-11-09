<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  X,
  Info,
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
  reviewNotes?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
  };
}

const loading = ref(false);
const queue = ref<LeaveQueueItem[]>([]);

// Filters
const activeFilter = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
const searchQuery = ref('');

// Review Modal
const selectedRequest = ref<LeaveQueueItem | null>(null);
const isReviewModalOpen = ref(false);
const reviewDecision = ref<'APPROVED' | 'REJECTED'>('APPROVED');
const reviewNotes = ref('');
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

const filteredQueue = computed(() => {
  return queue.value.filter((item) => {
    if (activeFilter.value !== 'ALL' && item.status !== activeFilter.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchName = item.user?.fullName?.toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      return matchName || matchReason || matchId;
    }
    return true;
  });
});

function formatLeaveType(type?: string): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Cuti Sakit';
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

function calculateDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function formatDateRange(startStr: string, endStr: string) {
  const s = new Date(startStr);
  const e = new Date(endStr);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  if (startStr === endStr) {
    return s.toLocaleDateString('id-ID', options);
  }
  return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('id-ID', options)}`;
}

function openReviewModal(item: LeaveQueueItem, defaultDecision: 'APPROVED' | 'REJECTED' = 'APPROVED') {
  selectedRequest.value = item;
  reviewDecision.value = defaultDecision;
  reviewNotes.value = '';
  isReviewModalOpen.value = true;
}

function closeReviewModal() {
  selectedRequest.value = null;
  isReviewModalOpen.value = false;
  reviewNotes.value = '';
}

async function submitReview() {
  if (!selectedRequest.value) return;

  if (reviewDecision.value === 'REJECTED' && !reviewNotes.value.trim()) {
    showToast('Catatan alasan penolakan wajib diisi.', true);
    return;
  }

  submittingReview.value = true;
  try {
    const decision = reviewDecision.value === 'APPROVED' ? 'APPROVE' : 'REJECT';
    await apiClient(`/leave/${selectedRequest.value.id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        decision,
        reviewNote: reviewNotes.value.trim() || undefined,
      }),
    });
    showToast(`Permohonan cuti berhasil di-${reviewDecision.value === 'APPROVED' ? 'setujui' : 'tolak'}.`);
    closeReviewModal();
    await loadQueue();
  } catch (err: any) {
    showToast(err.message || 'Gagal memproses permohonan cuti.', true);
  } finally {
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
          <span class="eyebrow">Pusat Persetujuan Operasional &amp; Rekonsiliasi</span>
          <h1>Leave Approval Queue</h1>
          <p class="subtitle">
            Tinjau permohonan cuti anggota tim dan HRGA. Persetujuan cuti yang melewati cut-off pagi (09:30 WIB) akan otomatis menjalankan rekonsiliasi retroaktif.
          </p>
        </div>
      </div>

      <!-- 4 Metric Cards -->
      <div class="metrics-grid">
        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'ALL' }"
          @click="activeFilter = 'ALL'"
        >
          <div class="metric-label">Total Permohonan</div>
          <div class="metric-value">{{ countTotal }}</div>
          <div class="metric-caption">Semua tiket cuti</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'PENDING' }"
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
          @click="activeFilter = 'APPROVED'"
        >
          <div class="metric-label">Telah Disetujui</div>
          <div class="metric-value text-green">{{ countApproved }}</div>
          <div class="metric-caption">Cuti disahkan</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'REJECTED' }"
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
            <h2>Daftar Pengajuan Cuti</h2>
            <p class="panel-subtitle">Verifikasi alasan, durasi kerja, dan berikan keputusan.</p>
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
              placeholder="Cari nama karyawan, alasan, atau tiket..."
            />
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <Clock :size="24" class="spin" />
          <p>Memuat antrean cuti...</p>
        </div>

        <div v-else-if="filteredQueue.length === 0" class="empty-state">
          <CalendarDays :size="32" />
          <p>Tidak ada permohonan cuti pada filter ini.</p>
        </div>

        <div v-else class="table-wrap">
          <table class="queue-table">
            <thead>
              <tr>
                <th scope="col">Karyawan</th>
                <th scope="col">Tanggal &amp; Durasi</th>
                <th scope="col">Alasan &amp; Jejak Waktu</th>
                <th scope="col">Status</th>
                <th scope="col" style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredQueue" :key="item.id">
                <td>
                  <div class="employee-meta">
                    <div class="avatar">{{ item.user?.fullName?.charAt(0) || 'U' }}</div>
                    <div>
                      <div class="emp-name">{{ item.user?.fullName || 'Pengguna' }}</div>
                      <div class="emp-role">{{ item.user?.role || 'Karyawan' }} · {{ item.user?.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="pill-type">{{ formatLeaveType(item.leaveType) }}</span>
                  <div class="date-main">{{ formatDateRange(item.startDate, item.endDate) }}</div>
                  <div class="date-sub">{{ calculateDuration(item.startDate, item.endDate) }} hari kerja</div>
                </td>
                <td>
                  <div class="reason-text">{{ item.reason || '(Tanpa alasan khusus)' }}</div>
                  <div class="ticket-id">
                    #{{ item.id }} · Diajukan {{ new Date(item.createdAt).toLocaleDateString('id-ID') }}
                  </div>
                  <div v-if="item.reconciled || item.reconciliationNote" class="reconcile-chip">
                    {{ item.reconciliationNote || 'Direkonsiliasi retroaktif (Superseded by Approved Leave)' }}
                  </div>
                  <div v-if="item.reviewNotes" class="review-notes-chip">
                    Catatan: {{ item.reviewNotes }}
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
                </td>
                <td class="col-actions" style="text-align: right; vertical-align: middle;">
                  <div v-if="item.status === 'PENDING'" class="actions-line" style="justify-content: flex-end;">
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
      <div v-if="isReviewModalOpen && selectedRequest" class="modal-backdrop" @click.self="closeReviewModal">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h3>Tinjau Permohonan Cuti</h3>
              <p class="modal-subtitle">Tentukan keputusan persetujuan untuk pengajuan cuti anggota tim.</p>
            </div>
            <button type="button" class="close-btn" aria-label="Tutup modal" @click="closeReviewModal">
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <!-- Ringkasan Pengajuan Cuti -->
            <div class="detail-card">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Pemohon</span>
                  <div class="detail-val-user">
                    <strong>{{ selectedRequest.user?.fullName }}</strong>
                    <span class="user-role-badge">{{ selectedRequest.user?.role || 'Karyawan' }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Jenis Cuti</span>
                  <span class="leave-type-chip">{{ selectedRequest.leaveType || 'Cuti Tahunan' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Rentang Tanggal</span>
                  <div class="detail-val-date">
                    <CalendarDays :size="14" class="date-icon" />
                    <span>{{ formatDateRange(selectedRequest.startDate, selectedRequest.endDate) }}</span>
                    <span class="duration-badge">{{ calculateDuration(selectedRequest.startDate, selectedRequest.endDate) }} hari kerja</span>
                  </div>
                </div>

                <div class="detail-item detail-item-full">
                  <span class="detail-label">Alasan Cuti</span>
                  <p class="detail-reason">{{ selectedRequest.reason || '-' }}</p>
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
                  @click="reviewDecision = 'APPROVED'"
                >
                  <Check :size="16" />
                  <span>Setujui Permohonan</span>
                </button>
                <button
                  type="button"
                  class="decision-btn"
                  :class="{ active: reviewDecision === 'REJECTED', red: reviewDecision === 'REJECTED' }"
                  @click="reviewDecision = 'REJECTED'"
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
                <strong>Kebijakan Rekonsiliasi Kehadiran:</strong> Menyetujui cuti ini akan secara otomatis memperbarui status kehadiran personil dan merekonsiliasi catatan ketidakhadiran (No Submission) yang mungkin telah terbentuk pasca-cut off 09:30 WIB.
              </div>
            </div>

            <!-- Form Catatan Reviewer -->
            <div class="field">
              <div class="field-label-row">
                <label for="reviewNotes">
                  Catatan Reviewer
                </label>
                <span class="field-hint" :class="{ required: reviewDecision === 'REJECTED' }">
                  {{ reviewDecision === 'REJECTED' ? 'Wajib diisi untuk penolakan' : 'Opsional' }}
                </span>
              </div>
              <textarea
                id="reviewNotes"
                v-model="reviewNotes"
                class="textarea"
                rows="3"
                :placeholder="reviewDecision === 'APPROVED' ? 'Tuliskan arahan tugas atau catatan persetujuan untuk pemohon (opsional)...' : 'Tuliskan alasan penolakan secara jelas agar pemohon dapat mengetahuinya (wajib)...'"
              ></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeReviewModal">
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

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #FFFFFF;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.brand-title {
  font-weight: 800;
  font-size: 16px;
}

.breadcrumb {
  font-size: 13.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-left: 8px;
}

.btn-topbar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #0E211B);
  text-decoration: none;
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
}

.panel-head {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 320px;
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

.actions-line {
  display: flex;
  gap: 6px;
  align-items: center;
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

.col-actions {
  vertical-align: middle;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
