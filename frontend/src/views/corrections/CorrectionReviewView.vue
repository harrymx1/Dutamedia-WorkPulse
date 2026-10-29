<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  Check,
  X,
  FileCheck,
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
  createdAt: string;
  requestedByUser: { id: string; fullName: string; email: string };
  reviewedByUser?: { id: string; fullName: string };
  targetCommitment: { sequenceNo: number; taskText: string };
}

// State
const loading = ref(false);
const requests = ref<CorrectionRequestItem[]>([]);
const statusFilter = ref<string>('PENDING');

// Review Modal
const isReviewModalOpen = ref(false);
const selectedRequest = ref<CorrectionRequestItem | null>(null);
const decision = ref<'APPROVE' | 'REJECT'>('APPROVE');
const reviewNote = ref('');
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
    let url = '/correction-requests?';
    if (statusFilter.value !== 'ALL') url += `status=${statusFilter.value}&`;

    const res = await apiClient<CorrectionRequestItem[]>(url);
    if (res.data) {
      requests.value = res.data;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat antrean review koreksi.', true);
  } finally {
    loading.value = false;
  }
}

const filteredRequests = computed(() => {
  return requests.value.filter((r) => {
    if (statusFilter.value !== 'ALL' && r.status !== statusFilter.value) return false;
    return true;
  });
});

function openReviewModal(item: CorrectionRequestItem, choice: 'APPROVE' | 'REJECT') {
  selectedRequest.value = item;
  decision.value = choice;
  reviewNote.value = choice === 'APPROVE' ? 'Disetujui sesuai kondisi faktual lapangan' : '';
  isReviewModalOpen.value = true;
}

async function submitReview() {
  if (!selectedRequest.value) return;
  if (reviewNote.value.trim().length < 5) {
    showToast('Catatan review minimal 5 karakter.', true);
    return;
  }

  submittingReview.value = true;
  try {
    await apiClient(`/correction-requests/${selectedRequest.value.id}/review`, {
      method: 'POST',
      body: JSON.stringify({
        decision: decision.value,
        reviewNote: reviewNote.value.trim(),
      }),
    });

    isReviewModalOpen.value = false;
    showToast(`Permohonan koreksi berhasil ${decision.value === 'APPROVE' ? 'disetujui' : 'ditolak'}.`);
    await loadRequests();
  } catch (err: any) {
    showToast(err.message || 'Gagal memproses review.', true);
  } finally {
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
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Review / <strong>Peninjauan Koreksi &amp; Dispensasi (Prototipe 22)</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/compliance" class="btn-topbar">Antrean Kepatuhan</AccessLink>
        <AccessLink to="/exemptions" class="btn-topbar">Kelola Dispensasi</AccessLink>
      </div>
    </header>

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
          <h1>Correction &amp; Leave Review</h1>
          <p class="subtitle">
            Tinjau permohonan koreksi material yang diajukan oleh anggota tim dalam masa jendela sanggahan 24 jam kerja (SAD 2.4).
          </p>
        </div>
      </div>

      <!-- Panel Antrean Peninjauan -->
      <section class="panel">
        <div class="panel-head">
          <div class="filter-row">
            <h2>Permohonan Koreksi Material</h2>
            <div class="filters">
              <select v-model="statusFilter" @change="loadRequests" class="filter-select">
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Menunggu Review (PENDING)</option>
                <option value="APPROVED">Disetujui (APPROVED)</option>
                <option value="REJECTED">Ditolak (REJECTED)</option>
                <option value="AUTO_APPLIED">Otomatis Diterapkan (AUTO_APPLIED)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-container">
          <div v-if="loading && requests.length === 0" class="loading-state">
            <span>Memuat antrean peninjauan...</span>
          </div>

          <div v-else-if="filteredRequests.length === 0" class="empty-state">
            <FileCheck :size="36" class="empty-icon" />
            <h3>Tidak Ada Permohonan Koreksi Tertunda</h3>
            <p>Seluruh permohonan koreksi telah ditinjau atau telah diaplikasikan otomatis.</p>
          </div>

          <table v-else class="review-table">
            <thead>
              <tr>
                <th>Pemohon</th>
                <th>Lingkup &amp; Komitmen</th>
                <th>Perbandingan Nilai (Diff)</th>
                <th>Alasan Permohonan</th>
                <th>Status &amp; Jendela Sanggahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredRequests" :key="item.id">
                <td class="col-user">
                  <div class="user-inline">
                    <User :size="14" />
                    <div>
                      <strong>{{ item.requestedByUser.fullName }}</strong>
                      <small>{{ item.requestedByUser.email }}</small>
                    </div>
                  </div>
                </td>
                <td class="col-scope">
                  <span class="scope-pill">{{ item.scopeType }}</span>
                  <div class="task-ref">
                    [Tugas #{{ item.targetCommitment.sequenceNo }}] {{ item.targetCommitment.taskText }}
                  </div>
                </td>
                <td class="col-diff">
                  <div class="diff-box">
                    <div class="diff-item before">
                      <span class="diff-tag">Sebelum:</span>
                      <p>{{ item.valueBefore?.taskText || item.valueBefore?.outcome || JSON.stringify(item.valueBefore) }}</p>
                    </div>
                    <ArrowRight :size="13" class="diff-arrow" />
                    <div class="diff-item after">
                      <span class="diff-tag">Diajukan:</span>
                      <p>{{ item.valueRequested?.taskText || item.valueRequested?.outcome || JSON.stringify(item.valueRequested) }}</p>
                    </div>
                  </div>
                </td>
                <td class="col-reason">
                  <p class="reason-text">{{ item.reason }}</p>
                </td>
                <td class="col-status">
                  <span class="status-badge" :class="item.status.toLowerCase()">
                    {{ item.status }}
                  </span>
                  <div v-if="item.status === 'PENDING' && item.objectionWindowEndsAt" class="window-timer">
                    <Clock :size="12" />
                    <span>{{ isWindowExpired(item.objectionWindowEndsAt) ? 'Jendela Usai' : 'Jendela Aktif 24j' }}</span>
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
    <div v-if="isReviewModalOpen" class="modal-backdrop" @click.self="isReviewModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>{{ decision === 'APPROVE' ? 'Setujui Permohonan Koreksi' : 'Sampaikan Keberatan / Tolak Koreksi' }}</h3>
          <button type="button" class="btn-close" @click="isReviewModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Pemohon: <strong>{{ selectedRequest?.requestedByUser.fullName }}</strong> (Komitmen #{{ selectedRequest?.targetCommitment.sequenceNo }}).
          </p>
          <div class="form-group">
            <label>Catatan Review / Alasan Keputusan <span class="req">*</span></label>
            <textarea
              v-model="reviewNote"
              rows="3"
              minlength="5"
              placeholder="Tuliskan justifikasi formal persetujuan atau penolakan (min. 5 karakter)..."
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isReviewModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :class="{ 'btn-danger': decision === 'REJECT' }"
            :disabled="submittingReview || reviewNote.trim().length < 5"
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

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

.page-heading {
  margin-bottom: 24px;
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
  max-width: 780px;
}

.panel {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  background: #FAFCFB;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-row h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 12.5px;
  background: #fff;
}

.table-container {
  overflow-x: auto;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.review-table th {
  background: #EFF5F2;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 12px;
  color: #5C6E68;
  border-bottom: 1px solid #DCE7E2;
  text-transform: uppercase;
}

.review-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #DCE7E2;
  vertical-align: middle;
}

.user-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-inline strong { display: block; }
.user-inline small { color: #5C6E68; }

.scope-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #E6F4EE;
  color: #00674D;
  display: inline-block;
  margin-bottom: 4px;
}

.task-ref {
  font-size: 12px;
  color: #5C6E68;
  max-width: 200px;
}

.diff-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FAFCFB;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 320px;
}

.diff-item { flex: 1; }
.diff-tag { font-size: 10px; font-weight: 700; color: #5C6E68; display: block; }
.diff-item p { margin: 2px 0 0; font-weight: 600; }
.diff-arrow { color: #5C6E68; flex-shrink: 0; }

.reason-text {
  font-size: 12px;
  color: #0E211B;
  max-width: 220px;
  margin: 0;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
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
  color: #D97706;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 6px;
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
  max-width: 500px;
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

.modal-head h3 { font-size: 15px; font-weight: 700; margin: 0; }
.btn-close { background: none; border: none; font-size: 16px; color: #5C6E68; cursor: pointer; }

.modal-body { padding: 20px; }
.modal-hint { font-size: 12.5px; color: #5C6E68; margin-bottom: 14px; }

.form-group { margin-bottom: 14px; }
label { font-size: 12.5px; font-weight: 700; display: block; margin-bottom: 6px; }
.req { color: #991B1B; }

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
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

.btn-danger {
  background: #DC2626 !important;
}

.empty-state, .loading-state {
  padding: 60px 24px;
  text-align: center;
  color: #5C6E68;
}

.empty-icon { color: #00674D; margin-bottom: 8px; }

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
</style>

