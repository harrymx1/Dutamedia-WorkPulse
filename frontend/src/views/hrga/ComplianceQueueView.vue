<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Link2,
} from 'lucide-vue-next';

interface ComplianceEventItem {
  id: string;
  userId: string;
  eventDate: string;
  stage: 'NO_SUBMISSION' | 'PATTERN_FLAG_3X' | 'COACHING_LOGGED' | 'RECORDED_WARNING' | 'FORMAL_HR_ESCALATION';
  followUpStatus: string;
  followUpManagerNoteId?: string;
  user: { id: string; fullName: string; email: string };
  followUpManagerNote?: {
    id: string;
    content: string;
    authorUser: { fullName: string };
  };
}

interface ComplianceSummary {
  totalEvents: number;
  openCount: number;
  patternCount: number;
  warningCount: number;
  escalationCount: number;
  noSubmissionCount: number;
}

// State
const loading = ref(false);
const events = ref<ComplianceEventItem[]>([]);
const summary = ref<ComplianceSummary | null>(null);

// Filters
const stageFilter = ref<string>('ALL');
const statusFilter = ref<string>('ALL');

// Modal
const isAddressModalOpen = ref(false);
const selectedEvent = ref<ComplianceEventItem | null>(null);
const managerNoteIdInput = ref('');
const submittingAddress = ref(false);

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

async function loadData() {
  loading.value = true;
  try {
    let url = '/compliance/queue?';
    if (stageFilter.value !== 'ALL') url += `stage=${stageFilter.value}&`;
    if (statusFilter.value !== 'ALL') url += `status=${statusFilter.value}&`;

    const [eventsRes, summaryRes] = await Promise.all([
      apiClient<ComplianceEventItem[]>(url),
      apiClient<ComplianceSummary>('/compliance/summary'),
    ]);

    if (eventsRes.data) events.value = eventsRes.data;
    if (summaryRes.data) summary.value = summaryRes.data;
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat antrean kepatuhan.', true);
  } finally {
    loading.value = false;
  }
}

const filteredEvents = computed(() => {
  return events.value.filter((e) => {
    if (stageFilter.value !== 'ALL' && e.stage !== stageFilter.value) return false;
    if (statusFilter.value !== 'ALL' && e.followUpStatus !== statusFilter.value) return false;
    return true;
  });
});

function openAddressModal(event: ComplianceEventItem) {
  selectedEvent.value = event;
  managerNoteIdInput.value = event.followUpManagerNoteId || '';
  isAddressModalOpen.value = true;
}

async function submitAddressCompliance() {
  if (!selectedEvent.value) return;
  if (!managerNoteIdInput.value.trim()) {
    showToast('Masukkan ID atau catatan pembinaan manajerial terkait.', true);
    return;
  }

  submittingAddress.value = true;
  try {
    await apiClient(`/compliance/events/${selectedEvent.value.id}/address`, {
      method: 'POST',
      body: JSON.stringify({
        managerNoteId: managerNoteIdInput.value.trim(),
      }),
    });

    isAddressModalOpen.value = false;
    showToast('Tindak lanjut peristiwa kepatuhan berhasil dicatat (ADDRESSED).');
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan tindak lanjut.', true);
  } finally {
    submittingAddress.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="compliance-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">HRGA / <strong>Antrean Kepatuhan &amp; Eskalasi Berjenjang (Prototipe 11)</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/exemptions" class="btn-topbar">Kelola Dispensasi</AccessLink>
        <AccessLink to="/corrections/review" class="btn-topbar">Antrean Koreksi</AccessLink>
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
          <span class="eyebrow">Pengawasan Kepatuhan &amp; Budaya Positif</span>
          <h1>Antrean Kepatuhan &amp; Tindak Lanjut HRGA</h1>
          <p class="subtitle">
            Pantau pelanggaran batas waktu check-in secara bertingkat (DEC-007). Sistem menjamin pendekatan non-punitif berorientasi pembinaan (Coaching First).
          </p>
        </div>
      </div>

      <!-- Top Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card amber">
          <div class="metric-top">
            <span class="metric-title">Pola 3x (Stage 1)</span>
            <AlertTriangle :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ summary?.patternCount ?? 0 }}</div>
          <div class="metric-sub">Pola keterlambatan berulang butuh klarifikasi atasan</div>
        </div>

        <div class="metric-card red">
          <div class="metric-top">
            <span class="metric-title">Peringatan Tertulis (Stage 2)</span>
            <ShieldAlert :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ summary?.warningCount ?? 0 }}</div>
          <div class="metric-sub">Peringatan formal yang tercatat dalam berkas HRGA</div>
        </div>

        <div class="metric-card dark-red">
          <div class="metric-top">
            <span class="metric-title">Eskalasi Direksi (Stage 3)</span>
            <Clock :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ summary?.escalationCount ?? 0 }}</div>
          <div class="metric-sub">Sidang evaluasi khusus bersama pimpinan eksekutif</div>
        </div>

        <div class="metric-card blue">
          <div class="metric-top">
            <span class="metric-title">Kasus Belum Ditangani</span>
            <AlertCircle :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ summary?.openCount ?? 0 }}</div>
          <div class="metric-sub">Peristiwa kepatuhan membutuhkan tindak lanjut</div>
        </div>
      </div>

      <!-- Table Panel -->
      <div class="panel">
        <div class="panel-head">
          <div class="filter-row">
            <h2>Daftar Peristiwa Kepatuhan Aktif</h2>
            <div class="filters">
              <select v-model="stageFilter" class="filter-select">
                <option value="ALL">Semua Jenjang (Stage)</option>
                <option value="PATTERN_FLAG_3X">Pola 3x (Stage 1)</option>
                <option value="RECORDED_WARNING">Surat Peringatan (Stage 2)</option>
                <option value="FORMAL_HR_ESCALATION">Eskalasi Direksi (Stage 3)</option>
                <option value="NO_SUBMISSION">Tidak Check-in</option>
              </select>

              <select v-model="statusFilter" class="filter-select">
                <option value="ALL">Semua Status</option>
                <option value="OPEN">Belum Ditindaklanjuti (OPEN)</option>
                <option value="ADDRESSED">Selesai (ADDRESSED)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-container">
          <div v-if="loading && events.length === 0" class="loading-state">
            <span>Memuat data kepatuhan...</span>
          </div>

          <div v-else-if="filteredEvents.length === 0" class="empty-state">
            <CheckCircle2 :size="36" class="empty-icon" />
            <h3>Tidak Ada Catatan Pelanggaran</h3>
            <p>Seluruh karyawan mematuhi disiplin pelaporan akuntabilitas dengan baik.</p>
          </div>

          <table v-else class="compliance-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Tanggal Kejadian</th>
                <th>Jenjang Kepatuhan (Stage)</th>
                <th>Status Tindak Lanjut</th>
                <th>Catatan Pembinaan / Solusi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredEvents" :key="item.id">
                <td class="col-user">
                  <div class="user-inline">
                    <User :size="15" />
                    <div>
                      <strong>{{ item.user.fullName }}</strong>
                      <small>{{ item.user.email }}</small>
                    </div>
                  </div>
                </td>
                <td class="col-date">
                  {{ new Date(item.eventDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}
                </td>
                <td class="col-stage">
                  <span class="stage-badge" :class="item.stage.toLowerCase()">
                    {{ item.stage }}
                  </span>
                </td>
                <td class="col-status">
                  <span
                    class="status-pill"
                    :class="item.followUpStatus === 'OPEN' ? 'status-open' : 'status-addressed'"
                  >
                    {{ item.followUpStatus }}
                  </span>
                </td>
                <td class="col-note">
                  <div v-if="item.followUpManagerNote" class="linked-note">
                    <strong>{{ item.followUpManagerNote.authorUser?.fullName }}:</strong>
                    <span>{{ item.followUpManagerNote.content }}</span>
                  </div>
                  <span v-else class="no-note-text">Belum ada catatan pembinaan</span>
                </td>
                <td class="col-action">
                  <button
                    type="button"
                    class="btn-action"
                    @click="openAddressModal(item)"
                  >
                    <Link2 :size="14" />
                    <span>Tindak Lanjut</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal Tindak Lanjut HRGA -->
    <div v-if="isAddressModalOpen" class="modal-backdrop" @click.self="isAddressModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Tindak Lanjut Peristiwa Kepatuhan</h3>
          <button type="button" class="btn-close" @click="isAddressModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Kaitkan catatan pembinaan / evaluasi manajerial yang telah dilakukan bersama atasan langsung karyawan (<strong>{{ selectedEvent?.user.fullName }}</strong>).
          </p>
          <div class="form-group">
            <label>ID Catatan Pembinaan Manajerial <span class="req">*</span></label>
            <input
              v-model="managerNoteIdInput"
              type="text"
              placeholder="Masukkan UUID catatan pembinaan dari /coaching..."
            />
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isAddressModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingAddress || !managerNoteIdInput.trim()"
            @click="submitAddressCompliance"
          >
            {{ submittingAddress ? 'Menyimpan...' : 'Tandai ADDRESSED' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compliance-layout {
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
  max-width: 760px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 16px 20px;
}

.metric-card.amber { border-left: 4px solid #D97706; }
.metric-card.red { border-left: 4px solid #DC2626; }
.metric-card.dark-red { border-left: 4px solid #7F1D1D; }
.metric-card.blue { border-left: 4px solid #2563EB; }

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
}

.metric-value {
  font-size: 32px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.amber .metric-value { color: #92400E; }
.red .metric-value { color: #991B1B; }
.dark-red .metric-value { color: #7F1D1D; }
.blue .metric-value { color: #075985; }

.metric-sub {
  font-size: 11.5px;
  color: #66736E;
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

.compliance-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.compliance-table th {
  background: #EFF5F2;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 12px;
  color: #5C6E68;
  border-bottom: 1px solid #DCE7E2;
  text-transform: uppercase;
}

.compliance-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #DCE7E2;
  vertical-align: middle;
}

.user-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-inline strong {
  display: block;
}

.user-inline small {
  color: #5C6E68;
}

.stage-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.stage-badge.pattern_flag_3x { background: #FEF3C7; color: #92400E; }
.stage-badge.recorded_warning { background: #FEE2E2; color: #991B1B; }
.stage-badge.formal_hr_escalation { background: #7F1D1D; color: #fff; }
.stage-badge.no_submission { background: #EFF5F2; color: #5C6E68; }

.status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.status-open { background: #FEE2E2; color: #991B1B; }
.status-addressed { background: #DCFCE7; color: #166534; }

.linked-note {
  font-size: 12px;
  background: #FAFCFB;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #EFF5F2;
  max-width: 320px;
}

.no-note-text {
  font-size: 12px;
  color: #66736E;
  font-style: italic;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  background: #E6F4EE;
  color: #00674D;
  font-weight: 700;
  font-size: 12px;
  border: 1px solid #A9C7BC;
  cursor: pointer;
}

.btn-action:hover {
  background: #00674D;
  color: #fff;
}

.empty-state, .loading-state {
  padding: 60px 24px;
  text-align: center;
  color: #5C6E68;
}

.empty-icon {
  color: #166534;
  margin-bottom: 8px;
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

.modal-hint {
  font-size: 12.5px;
  color: #5C6E68;
  margin-bottom: 14px;
}

.form-group {
  margin-bottom: 14px;
}

label {
  font-size: 12.5px;
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
}

.req { color: #991B1B; }

input[type="text"] {
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

@media (max-width: 900px) {
  .metrics-grid { grid-template-columns: 1fr 1fr; }
}
</style>
