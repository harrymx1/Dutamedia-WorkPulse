<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Info,
} from 'lucide-vue-next';

interface SummaryData {
  totalEmployees: number;
  participationRate: number;
  onTimePercent: number;
  latePercent: number;
  noSubmissionPercent: number;
  avgBlockerMttrHours: number;
}

interface DepartmentItem {
  department: string;
  totalMembers: number;
  participationRate: number;
  onTimePercent: number;
  latePercent: number;
  noSubmissionPercent: number;
  openBlockersCount: number;
  mttrHours: number;
}

interface ReportResponse {
  period: string;
  summary: SummaryData;
  departmentBreakdown: DepartmentItem[];
}

const loading = ref(false);
const activePeriod = ref('today');

const report = ref<ReportResponse>({
  period: 'today',
  summary: {
    totalEmployees: 32,
    participationRate: 96.2,
    onTimePercent: 88.5,
    latePercent: 7.7,
    noSubmissionPercent: 3.8,
    avgBlockerMttrHours: 4.2,
  },
  departmentBreakdown: [],
});

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

async function loadReport() {
  loading.value = true;
  try {
    const res = await apiClient<ReportResponse>(`/v1/reports/executive?period=${activePeriod.value}`);
    const data = res?.data || res;
    if (data && data.summary) {
      report.value = data;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat laporan eksekutif.', true);
  } finally {
    loading.value = false;
  }
}

function handlePeriodChange(p: string) {
  activePeriod.value = p;
  loadReport();
}

async function handleExport() {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const exportUrl = `${baseUrl}/reports/export?period=${activePeriod.value}`;
    window.open(exportUrl, '_blank');
    showToast('Mengunduh berkas laporan CSV...');
  } catch (err: any) {
    showToast('Gagal mengekspor laporan.', true);
  }
}

onMounted(() => {
  loadReport();
});
</script>

<template>
  <div class="reports-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Laporan / <strong>Reports</strong></span>
      </div>
      <div class="topbar-right">
        <button type="button" class="btn btn-secondary" @click="handleExport">
          <Download :size="15" />
          <span>Export Data (CSV)</span>
        </button>
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
      <!-- Page Header -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Laporan &amp; Analitik Organisasi</span>
          <h1>Reports</h1>
          <p class="subtitle">
            Visualisasi tren akuntabilitas harian, metrik ketepatan waktu, kompilasi blocker, dan rekap kepatuhan tingkat tim hingga organisasi.
          </p>
        </div>
      </div>

      <!-- Filter Bar with Time Presets -->
      <div class="filter-bar">
        <div class="filter-row">
          <div class="time-presets" role="group" aria-label="Pilih Periode Waktu">
            <button
              type="button"
              class="preset-btn"
              :class="{ active: activePeriod === 'today' }"
              @click="handlePeriodChange('today')"
            >
              Hari Ini
            </button>
            <button
              type="button"
              class="preset-btn"
              :class="{ active: activePeriod === 'week' }"
              @click="handlePeriodChange('week')"
            >
              Pekan Ini
            </button>
            <button
              type="button"
              class="preset-btn"
              :class="{ active: activePeriod === 'month' }"
              @click="handlePeriodChange('month')"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              class="preset-btn"
              :class="{ active: activePeriod === 'quarter' }"
              @click="handlePeriodChange('quarter')"
            >
              Kuartal Ini
            </button>
          </div>
        </div>
      </div>

      <!-- 5 Summary Metrics Cards -->
      <div class="metrics-row">
        <!-- 1. Partisipasi Harian -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Partisipasi Harian</span>
            <TrendingUp :size="16" class="text-green" />
          </div>
          <div class="summary-num">{{ report.summary.participationRate }}%</div>
          <div class="summary-foot">Tingkat kepatuhan tim</div>
        </div>

        <!-- 2. On-Time -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Tepat Waktu (On-Time)</span>
            <span class="pill green">Sebelum 09:30</span>
          </div>
          <div class="summary-num text-green">{{ report.summary.onTimePercent }}%</div>
          <div class="summary-foot">Check-in sebelum batas cut-off</div>
        </div>

        <!-- 3. Late -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Terlambat Sah (Late)</span>
            <span class="pill amber">09:30 - 21:00</span>
          </div>
          <div class="summary-num text-amber">{{ report.summary.latePercent }}%</div>
          <div class="summary-foot">Pengisian pasca cut-off</div>
        </div>

        <!-- 4. No Submission -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Lewat Batas (No Sub)</span>
            <span class="pill red">Lewat 21:00</span>
          </div>
          <div class="summary-num text-red">{{ report.summary.noSubmissionPercent }}%</div>
          <div class="summary-foot">Tanpa pengecualian sah</div>
        </div>

        <!-- 5. MTTR Blocker -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Resolusi Blocker (MTTR)</span>
            <Clock :size="16" />
          </div>
          <div class="summary-num">{{ report.summary.avgBlockerMttrHours }} Jam</div>
          <div class="summary-foot">Rata-rata kecepatan resolusi</div>
        </div>
      </div>

      <!-- Guardrail Non-Punitive Callout -->
      <div class="guardrail-callout">
        <Info :size="20" class="guardrail-icon" />
        <div>
          <strong>Prinsip Non-Punitive:</strong> Laporan ini dirancang untuk perbaikan berkelanjutan alur kerja dan identifikasi hambatan sistemik, bukan sebagai alat pemeringkatan personil secara individual. Gunakan hasil analitik untuk merancang dukungan proaktif dan alokasi sumber daya lintas fungsi.
        </div>
      </div>

      <!-- Departmental Breakdown Table -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Rekapitulasi Kepatuhan &amp; Hambatan per Unit Kerja</h2>
            <p class="panel-subtitle">Agregasi partisipasi, kepatuhan tepat waktu, dan beban blocker di masing-masing fungsi.</p>
          </div>
          <span class="pill neutral">{{ report.departmentBreakdown.length }} Unit Kerja</span>
        </div>

        <div v-if="loading" class="empty-state">
          <Clock :size="24" class="spin" />
          <p>Memuat rekapitulasi laporan...</p>
        </div>

        <div v-else class="table-wrap">
          <table class="report-table">
            <thead>
              <tr>
                <th scope="col">Departemen / Unit Kerja</th>
                <th scope="col" class="text-center">Personil</th>
                <th scope="col" class="text-center">Partisipasi</th>
                <th scope="col" class="text-center">Tepat Waktu</th>
                <th scope="col" class="text-center">Terlambat</th>
                <th scope="col" class="text-center">No Sub</th>
                <th scope="col" class="text-center">Blocker Aktif</th>
                <th scope="col" class="text-center">MTTR Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in report.departmentBreakdown" :key="dept.department">
                <td>
                  <strong>{{ dept.department }}</strong>
                </td>
                <td class="text-center">{{ dept.totalMembers }} Orang</td>
                <td class="text-center">
                  <span class="bold">{{ dept.participationRate }}%</span>
                </td>
                <td class="text-center">
                  <span class="badge green">{{ dept.onTimePercent }}%</span>
                </td>
                <td class="text-center">
                  <span class="badge amber">{{ dept.latePercent }}%</span>
                </td>
                <td class="text-center">
                  <span class="badge red">{{ dept.noSubmissionPercent }}%</span>
                </td>
                <td class="text-center">
                  <span :class="{ 'text-red bold': dept.openBlockersCount > 0 }">{{ dept.openBlockersCount }}</span>
                </td>
                <td class="text-center">{{ dept.mttrHours }} Jam</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.reports-layout {
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

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  margin-bottom: 20px;
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

.filter-bar {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 22px;
}

.time-presets {
  display: inline-flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 6px;
  gap: 2px;
}

.preset-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn.active {
  background: #FFFFFF;
  color: var(--color-brand-primary, #00674D);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

@media (max-width: 960px) {
  .metrics-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.summary-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary, #5C6E68);
  letter-spacing: 0.04em;
}

.summary-num {
  font-size: 24px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.summary-foot {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.text-green { color: #166534; }
.text-amber { color: #92400E; }
.text-red { color: #991B1B; }
.bold { font-weight: 700; }

.guardrail-callout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 18px;
  border-radius: 8px;
  background: #F8FAF9;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-left: 4px solid var(--color-brand-primary, #00674D);
  color: var(--color-text-secondary, #5C6E68);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.guardrail-callout strong {
  color: var(--color-text-primary, #0E211B);
}

.guardrail-icon {
  color: var(--color-brand-primary, #00674D);
  flex-shrink: 0;
  margin-top: 1px;
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
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.table-wrap {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th {
  text-align: left;
  padding: 10px 18px;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.report-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  font-size: 13px;
}

.text-center {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge.green { background: #DCFCE7; color: #166534; }
.badge.amber { background: #FEF3C7; color: #92400E; }
.badge.red { background: #FEE2E2; color: #991B1B; }

.pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.pill.green { background: #DCFCE7; color: #166534; }
.pill.amber { background: #FEF3C7; color: #92400E; }
.pill.red { background: #FEE2E2; color: #991B1B; }
.pill.neutral { background: #F1F5F9; color: #334155; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-secondary {
  background: #FFFFFF;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
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
