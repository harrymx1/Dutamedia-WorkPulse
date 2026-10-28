<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next';

interface CommitmentRecord {
  id: string;
  sequenceNo: number;
  taskText: string;
  referenceLink?: string;
  initialRisk: string;
  knownBlockerNote?: string;
  isCarryOver: boolean;
  carryOverDaysCount: number;
  outcome?: string;
  continuation?: string;
  continuationReason?: string;
}

interface AdditionalWorkRecord {
  id: string;
  taskText: string;
  reason: string;
  outcome?: string;
}

interface DailyRecordRow {
  id: string;
  workDate: string;
  morningTiming: string;
  eodTiming: string;
  initialDailyStatus: string;
  finalDailyStatus?: string;
  zeroCommitmentReason?: string;
  commitments: CommitmentRecord[];
  additionalWorks: AdditionalWorkRecord[];
}

interface HistoryKpi {
  totalDays: number;
  onTimeSubmissions: number;
  onTimeRate: number;
  greenDays: number;
  amberDays: number;
  redDays: number;
}

// State
const loading = ref(false);
const records = ref<DailyRecordRow[]>([]);
const kpi = ref<HistoryKpi>({
  totalDays: 0,
  onTimeSubmissions: 0,
  onTimeRate: 0,
  greenDays: 0,
  amberDays: 0,
  redDays: 0,
});

const startDate = ref('');
const endDate = ref('');
const expandedRows = ref<Record<string, boolean>>({});

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function loadHistory() {
  loading.value = true;
  try {
    const query = new URLSearchParams();
    if (startDate.value) query.set('startDate', startDate.value);
    if (endDate.value) query.set('endDate', endDate.value);

    const res = await apiClient<{
      dateRange: { startDate: string; endDate: string };
      kpi: HistoryKpi;
      records: DailyRecordRow[];
    }>(`/daily/history?${query.toString()}`);

    records.value = res.data.records || [];
    kpi.value = res.data.kpi;
    if (!startDate.value) startDate.value = res.data.dateRange.startDate;
    if (!endDate.value) endDate.value = res.data.dateRange.endDate;
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat riwayat akuntabilitas.', true);
  } finally {
    loading.value = false;
  }
}

function toggleExpand(id: string) {
  expandedRows.value[id] = !expandedRows.value[id];
}

function exportCsv() {
  if (records.value.length === 0) {
    showToast('Tidak ada data riwayat untuk diunduh.', true);
    return;
  }

  const headers = ['Tanggal', 'Morning Timing', 'EOD Timing', 'Status Pagi', 'Status Akhir (Refleksi)', 'Jml Komitmen', 'Jml Pekerjaan Tambahan'];
  const rows = records.value.map((r) => [
    r.workDate.split('T')[0],
    r.morningTiming,
    r.eodTiming,
    r.initialDailyStatus,
    r.finalDailyStatus || '-',
    r.commitments.length,
    r.additionalWorks.length,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `workpulse-history-${startDate.value}-sd-${endDate.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => { errorMessage.value = null; }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => { toastMessage.value = null; }, 3800);
  }
}

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <div class="daily-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">My Account / <strong>Riwayat Akuntabilitas</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/daily/morning" class="nav-btn">Morning Check-in</router-link>
        <router-link to="/profile" class="nav-btn">Profil</router-link>
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
          <h1>Riwayat Akuntabilitas & Weekly Summary</h1>
          <p class="subtitle">
            Pantau kepatuhan ketepatan waktu check-in, tren risiko harian, dan evaluasi hasil komitmen Anda dari waktu ke waktu (Prototipe 06).
          </p>
        </div>
        <button type="button" class="btn btn-secondary" @click="exportCsv">
          <FileSpreadsheet :size="16" />
          <span>Unduh CSV</span>
        </button>
      </div>

      <!-- Date Range Filter -->
      <section class="filter-card">
        <div class="filter-inputs">
          <div class="filter-group">
            <label for="start-date" class="filter-label">Dari Tanggal</label>
            <input id="start-date" v-model="startDate" type="date" class="input-control" />
          </div>
          <div class="filter-group">
            <label for="end-date" class="filter-label">Sampai Tanggal</label>
            <input id="end-date" v-model="endDate" type="date" class="input-control" />
          </div>
          <button type="button" class="btn btn-primary filter-btn" @click="loadHistory">
            <span>Terapkan Rentang</span>
          </button>
        </div>
      </section>

      <!-- 4 Summary KPI Cards -->
      <section class="kpi-grid">
        <article class="kpi-card">
          <div class="kpi-label">Ketepatan Waktu Check-In</div>
          <div class="kpi-value">{{ kpi.onTimeRate }}%</div>
          <div class="kpi-sub">{{ kpi.onTimeSubmissions }} dari {{ kpi.totalDays }} hari On-Time</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-label">Hari Hijau (GREEN)</div>
          <div class="kpi-value text-green">{{ kpi.greenDays }} Hari</div>
          <div class="kpi-sub">Refleksi mandiri terkendali</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-label">Hari Amber (AMBER)</div>
          <div class="kpi-value text-amber">{{ kpi.amberDays }} Hari</div>
          <div class="kpi-sub">Terdapat dependensi / carry-over</div>
        </article>

        <article class="kpi-card">
          <div class="kpi-label">Hari Merah (RED)</div>
          <div class="kpi-value text-red">{{ kpi.redDays }} Hari</div>
          <div class="kpi-sub">Kendala kritis memerlukan eskalasi</div>
        </article>
      </section>

      <!-- Tabel Riwayat Harian -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Daftar Hari Kerja</div>
            <h2>Log Harian & Evaluasi Detail</h2>
          </div>
        </div>

        <div class="panel-body table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                <th>Tanggal Kerja</th>
                <th>Waktu Pagi</th>
                <th>Waktu EOD</th>
                <th>Status Pagi</th>
                <th>Status Akhir (Refleksi)</th>
                <th>Total Tugas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="records.length === 0">
                <td colspan="7" class="text-center empty-cell">
                  Belum ada log akuntabilitas pada rentang tanggal yang dipilih.
                </td>
              </tr>
              <template v-for="r in records" :key="r.id">
                <tr class="main-row" @click="toggleExpand(r.id)">
                  <td class="mono font-bold">{{ r.workDate.split('T')[0] }}</td>
                  <td>
                    <span class="badge" :class="r.morningTiming === 'ON_TIME' ? 'badge-ontime' : r.morningTiming === 'LATE' ? 'badge-late' : 'badge-neutral'">
                      {{ r.morningTiming }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="r.eodTiming === 'ON_TIME' ? 'badge-ontime' : r.eodTiming === 'LATE' ? 'badge-late' : 'badge-neutral'">
                      {{ r.eodTiming }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="r.initialDailyStatus === 'GREEN' ? 'badge-active' : r.initialDailyStatus === 'AMBER' ? 'badge-warning' : r.initialDailyStatus === 'RED' ? 'badge-danger' : 'badge-neutral'">
                      {{ r.initialDailyStatus }}
                    </span>
                  </td>
                  <td>
                    <span v-if="r.finalDailyStatus" class="badge" :class="r.finalDailyStatus === 'GREEN' ? 'badge-active' : r.finalDailyStatus === 'AMBER' ? 'badge-warning' : 'badge-danger'">
                      {{ r.finalDailyStatus }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="mono">{{ r.commitments.length + r.additionalWorks.length }} Item</td>
                  <td>
                    <button type="button" class="expand-btn">
                      <span>{{ expandedRows[r.id] ? 'Tutup' : 'Detail' }}</span>
                      <ChevronUp v-if="expandedRows[r.id]" :size="14" />
                      <ChevronDown v-else :size="14" />
                    </button>
                  </td>
                </tr>

                <!-- Accordion Detail Row -->
                <tr v-if="expandedRows[r.id]" class="detail-row">
                  <td colspan="7">
                    <div class="detail-content">
                      <div v-if="r.zeroCommitmentReason" class="detail-zero">
                        <strong>Alasan 0 Komitmen:</strong> {{ r.zeroCommitmentReason }}
                      </div>

                      <div v-if="r.commitments.length > 0" class="sub-section">
                        <h4>Komitmen Pagi ({{ r.commitments.length }}):</h4>
                        <div class="items-list">
                          <div v-for="c in r.commitments" :key="c.id" class="sub-item">
                            <div class="sub-item-header">
                              <span class="item-num">#{{ c.sequenceNo }}</span>
                              <span class="item-text">{{ c.taskText }}</span>
                              <span class="badge badge-info">{{ c.initialRisk }}</span>
                              <span v-if="c.outcome" class="badge badge-active">{{ c.outcome }}</span>
                            </div>
                            <div v-if="c.continuation === 'CONTINUE'" class="sub-item-meta">
                              <strong>Kelanjutan Besok:</strong> {{ c.continuationReason }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-if="r.additionalWorks.length > 0" class="sub-section">
                        <h4>Pekerjaan Tambahan Siang ({{ r.additionalWorks.length }}):</h4>
                        <div class="items-list">
                          <div v-for="w in r.additionalWorks" :key="w.id" class="sub-item">
                            <div class="sub-item-header">
                              <span class="item-text">{{ w.taskText }}</span>
                              <span class="badge badge-neutral">{{ w.reason }}</span>
                              <span v-if="w.outcome" class="badge badge-active">{{ w.outcome }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.daily-layout {
  min-height: 100vh;
  background-color: var(--color-canvas);
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  background: var(--color-brand-primary);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text-primary);
}

.breadcrumb {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.topbar-right {
  display: flex;
  gap: 14px;
}

.nav-btn {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.nav-btn:hover {
  background: var(--color-surface-subtle);
  color: var(--color-brand-primary);
}

.main-content {
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-heading h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.filter-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}

.filter-inputs {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.filter-btn {
  height: 38px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 18px 20px;
}

.kpi-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.kpi-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.kicker {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.table-wrap {
  padding: 0;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.history-table th {
  background: var(--color-canvas);
  color: var(--color-text-secondary);
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.history-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
}

.main-row {
  cursor: pointer;
}

.main-row:hover {
  background: var(--color-surface-subtle);
}

.expand-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-primary);
}

.detail-row td {
  background: #f8fafc;
  padding: 16px 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-zero {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.sub-section h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-primary);
  margin-bottom: 6px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-item {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-num {
  font-weight: 800;
  font-size: 12px;
  color: var(--color-brand-primary);
}

.item-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.sub-item-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.input-control {
  padding: 8px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #fff;
}

.btn-secondary {
  background: #fff;
  border-color: var(--color-border-subtle);
  color: var(--color-text-primary);
}

.mono {
  font-family: var(--font-mono);
}

.font-bold {
  font-weight: 700;
}

.text-muted {
  color: var(--color-text-secondary);
}

.text-green { color: #166534; }
.text-amber { color: #92400e; }
.text-red { color: #991b1b; }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.badge-info { background: #e0f2fe; color: #0369a1; }
.badge-ontime {
  background: var(--color-timing-ontime-bg);
  color: var(--color-timing-ontime-fg);
  border: 1px solid var(--color-timing-ontime-border);
}
.badge-late {
  background: var(--color-timing-late-bg);
  color: var(--color-timing-late-fg);
  border: 1px solid var(--color-timing-late-border);
}
.badge-active { background: var(--color-status-green-bg); color: var(--color-status-green-fg); }
.badge-warning { background: var(--color-status-amber-bg); color: var(--color-status-amber-fg); }
.badge-danger { background: var(--color-status-red-bg); color: var(--color-status-red-fg); }
.badge-neutral { background: var(--color-status-neutral-bg); color: var(--color-status-neutral-fg); }

.toast-popup {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  border: 1px solid var(--color-status-green-border);
}

.toast-popup.error {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
  border: 1px solid var(--color-status-red-border);
}
</style>
