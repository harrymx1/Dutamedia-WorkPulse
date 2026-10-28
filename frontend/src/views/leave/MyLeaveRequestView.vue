<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Send,
  RotateCcw,
  Info,
  CalendarDays,
} from 'lucide-vue-next';

interface LeaveRequestItem {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reconciled?: boolean;
  reconciliationNote?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

const loading = ref(false);
const submitting = ref(false);
const leaveRequests = ref<LeaveRequestItem[]>([]);

// Form inputs
const startDate = ref('');
const endDate = ref('');
const reason = ref('');
const formError = ref('');

// Filter & Search
const activeFilter = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
const searchQuery = ref('');

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

async function loadLeaveRequests() {
  loading.value = true;
  try {
    const res = await apiClient<LeaveRequestItem[]>('/leave/my');
    leaveRequests.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat riwayat pengajuan cuti.', true);
  } finally {
    loading.value = false;
  }
}

const filteredRequests = computed(() => {
  return leaveRequests.value.filter((req) => {
    if (activeFilter.value !== 'ALL' && req.status !== activeFilter.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchReason = req.reason?.toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      const matchDate = req.startDate.includes(q) || req.endDate.includes(q);
      return matchReason || matchId || matchDate;
    }
    return true;
  });
});

function calculateDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

async function handleSubmit() {
  formError.value = '';
  if (!startDate.value) {
    formError.value = 'Pilih tanggal mulai cuti.';
    return;
  }
  if (!endDate.value) {
    formError.value = 'Pilih tanggal selesai cuti.';
    return;
  }
  if (new Date(endDate.value) < new Date(startDate.value)) {
    formError.value = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
    return;
  }

  submitting.value = true;
  try {
    await apiClient('/leave/requests', {
      method: 'POST',
      body: JSON.stringify({
        startDate: startDate.value,
        endDate: endDate.value,
        reason: reason.value.trim() || undefined,
      }),
    });
    showToast('Permohonan cuti berhasil diajukan.');
    startDate.value = '';
    endDate.value = '';
    reason.value = '';
    await loadLeaveRequests();
  } catch (err: any) {
    formError.value = err.message || 'Gagal mengajukan permohonan cuti.';
    showToast(formError.value, true);
  } finally {
    submitting.value = false;
  }
}

function handleReset() {
  startDate.value = '';
  endDate.value = '';
  reason.value = '';
  formError.value = '';
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

onMounted(() => {
  loadLeaveRequests();
});
</script>

<template>
  <div class="leave-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Workspace / <strong>My Leave Request</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/leave/queue" class="btn-topbar">
          <CalendarDays :size="16" />
          <span>Antrean Approval</span>
        </router-link>
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
      <div class="page-heading">
        <div>
          <span class="eyebrow">Manajemen Kehadiran &amp; Ketidakhadiran Sah</span>
          <h1>My Leave Request</h1>
          <p class="subtitle">
            Ajukan permohonan cuti dan pantau status persetujuan serta rekonsiliasi kehadiran harian Anda di satu tempat.
          </p>
        </div>
        <span class="pill neutral"><span class="dot-sm"></span>Pengajuan Milik Saya</span>
      </div>

      <div class="layout-grid">
        <!-- Form Panel -->
        <section class="panel form-panel" aria-labelledby="form-title">
          <div class="panel-head">
            <div>
              <h2 id="form-title">Ajukan Leave Request</h2>
              <p class="panel-subtitle">Tentukan rentang tanggal cuti yang diajukan.</p>
            </div>
          </div>
          <div class="panel-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="field">
                <label for="startDate">Tanggal mulai <span class="required">*</span></label>
                <div class="input-wrap">
                  <Calendar :size="16" class="field-icon" />
                  <input
                    id="startDate"
                    v-model="startDate"
                    type="date"
                    class="input"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label for="endDate">Tanggal selesai <span class="required">*</span></label>
                <div class="input-wrap">
                  <Calendar :size="16" class="field-icon" />
                  <input
                    id="endDate"
                    v-model="endDate"
                    type="date"
                    class="input"
                    required
                  />
                </div>
                <div v-if="startDate && endDate" class="duration-hint">
                  Durasi cuti: <strong>{{ calculateDuration(startDate, endDate) }} hari kerja</strong>
                </div>
              </div>

              <div class="field">
                <label for="reason">Alasan <span class="opt-label">(opsional)</span></label>
                <textarea
                  id="reason"
                  v-model="reason"
                  class="textarea"
                  rows="3"
                  maxlength="1000"
                  placeholder="Tambahkan alasan pengajuan cuti atau keterangan darurat bila diperlukan."
                ></textarea>
              </div>

              <!-- Note Info Blue: Rekonsiliasi Cuti Pasca-Cut-Off (DEC-007) -->
              <div class="info-note">
                <Info :size="18" class="info-icon" />
                <div>
                  <strong>Ketentuan Status Leave (Pending):</strong> Tanggal yang masih berstatus
                  <strong>Leave (Pending)</strong> belum mengecualikan kewajiban check-in harian hingga disetujui (<strong>Approved</strong>). Apabila cuti mendadak disetujui setelah jam Cut-Off pagi (09:30 WIB), catatan <em>No Submission</em> hari tersebut akan direkonsiliasi otomatis menjadi <strong>Approved Leave (Superseded by Approved Leave)</strong>.
                </div>
              </div>

              <div v-if="formError" class="error-banner" role="alert">
                {{ formError }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="handleReset">
                  <RotateCcw :size="15" />
                  <span>Bersihkan</span>
                </button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <Send :size="15" />
                  <span>{{ submitting ? 'Mengajukan...' : 'Ajukan Permohonan' }}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- History Panel -->
        <section class="panel" aria-labelledby="history-title">
          <div class="panel-head">
            <div>
              <h2 id="history-title">Riwayat Leave Request</h2>
              <p class="panel-subtitle">
                Pantau status setiap permohonan cuti dan jejak rekonsiliasi pasca-Cut-Off yang Anda ajukan.
              </p>
            </div>
            <span class="pill neutral">{{ filteredRequests.length }} permohonan</span>
          </div>

          <div class="list-tools">
            <div class="search-wrap">
              <Search :size="16" class="search-icon" />
              <input
                v-model="searchQuery"
                type="search"
                class="search-input"
                placeholder="Cari alasan, ID tiket, atau tanggal..."
                aria-label="Cari alasan atau tanggal"
              />
            </div>

            <div class="filters" role="group" aria-label="Filter status">
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'ALL' }"
                @click="activeFilter = 'ALL'"
              >
                Semua
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'PENDING' }"
                @click="activeFilter = 'PENDING'"
              >
                Pending
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'APPROVED' }"
                @click="activeFilter = 'APPROVED'"
              >
                Approved
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'REJECTED' }"
                @click="activeFilter = 'REJECTED'"
              >
                Rejected
              </button>
            </div>
          </div>

          <div v-if="loading" class="empty-state">
            <Clock :size="24" class="spin" />
            <p>Memuat riwayat permohonan cuti...</p>
          </div>

          <div v-else-if="filteredRequests.length === 0" class="empty-state">
            <Calendar :size="32" />
            <p>Belum ada riwayat permohonan cuti.</p>
          </div>

          <div v-else class="table-wrap">
            <table class="leave-table">
              <thead>
                <tr>
                  <th scope="col">Tanggal Cuti</th>
                  <th scope="col">Alasan &amp; Jejak Pengajuan</th>
                  <th scope="col">Status &amp; Rekonsiliasi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in filteredRequests" :key="req.id">
                  <td>
                    <div class="date-main">{{ formatDateRange(req.startDate, req.endDate) }}</div>
                    <div class="date-sub">{{ calculateDuration(req.startDate, req.endDate) }} hari kerja</div>
                  </td>
                  <td>
                    <div class="reason-text">{{ req.reason || '(Tanpa alasan khusus)' }}</div>
                    <div class="request-id">
                      #{{ req.id }} · Diajukan {{ new Date(req.createdAt).toLocaleDateString('id-ID') }}
                    </div>
                    <div v-if="req.reconciled || req.reconciliationNote" class="reconcile-note">
                      <strong>Rekonsiliasi Otomatis:</strong> {{ req.reconciliationNote || 'Tercatat No Submission pagi direkonsiliasi otomatis menjadi Approved Leave pasca persetujuan.' }}
                    </div>
                    <div v-if="req.reviewNotes" class="review-note">
                      Catatan Reviewer: {{ req.reviewNotes }}
                    </div>
                  </td>
                  <td class="status-cell">
                    <div class="status-line">
                      <span v-if="req.status === 'PENDING'" class="pill blue">Leave (Pending)</span>
                      <span v-else-if="req.status === 'APPROVED'" class="pill green">Leave (Approved)</span>
                      <span v-else-if="req.status === 'REJECTED'" class="pill red">Leave (Rejected)</span>
                      <span v-else class="pill neutral">{{ req.status }}</span>

                      <span v-if="req.reconciled" class="pill neutral">Superseded by Approved Leave</span>
                    </div>
                    <span v-if="req.status === 'PENDING'" class="status-sub">
                      Menunggu keputusan approver
                    </span>
                    <span v-else-if="req.status === 'APPROVED'" class="status-sub">
                      Disetujui · Check-in harian dikecualikan
                    </span>
                    <span v-else-if="req.status === 'REJECTED'" class="status-sub">
                      Ditolak · Check-in harian tetap berlaku
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.leave-layout {
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
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
  max-width: 720px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
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

.panel-body {
  padding: 20px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.required {
  color: #DC2626;
}

.opt-label {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary, #5C6E68);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary, #5C6E68);
  pointer-events: none;
}

.input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  font-size: 13.5px;
}

.duration-hint {
  font-size: 12px;
  color: var(--color-brand-primary, #00674D);
  margin-top: 4px;
}

.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  font-size: 13.5px;
  resize: vertical;
}

.info-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #E0F2FE;
  border: 1px solid #7DD3FC;
  border-radius: 8px;
  padding: 12px;
  font-size: 12.5px;
  color: #075985;
  line-height: 1.45;
  margin-bottom: 16px;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.error-banner {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-secondary {
  background: #FFFFFF;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: #00543F;
}

.list-tools {
  padding: 14px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
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

.filters {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.filter-btn.active {
  background: #E6F4EE;
  color: var(--color-brand-primary, #00674D);
  border-color: #86EFAC;
}

.table-wrap {
  overflow-x: auto;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
}

.leave-table th {
  text-align: left;
  padding: 10px 18px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.leave-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  vertical-align: top;
}

.date-main {
  font-weight: 700;
  font-size: 13.5px;
}

.date-sub {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.reason-text {
  font-weight: 600;
  font-size: 13.5px;
}

.request-id {
  font-size: 11.5px;
  font-family: monospace;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 3px;
}

.reconcile-note {
  margin-top: 6px;
  padding: 6px 10px;
  background: #F1F5F9;
  border-left: 3px solid #00674D;
  border-radius: 4px;
  font-size: 12px;
  color: #334155;
}

.review-note {
  margin-top: 4px;
  font-size: 12px;
  color: #92400E;
}

.status-cell {
  min-width: 200px;
}

.status-line {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.status-sub {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 4px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid transparent;
}

.pill.blue {
  background: #E0F2FE;
  color: #075985;
  border-color: #7DD3FC;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border-color: #86EFAC;
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

.dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-brand-primary, #00674D);
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
