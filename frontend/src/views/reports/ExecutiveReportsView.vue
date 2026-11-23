<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { EMPLOYMENT_STATUS_FILTER_OPTIONS } from '../../utils/employmentStatus';
import { formatDateRangeWib, getTodayIsoWib } from '../../utils/dateTime';
import {
  Download,
  Printer,
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
  openBlockersCount?: number;
  resolvedBlockersCount: number;
  avgBlockerMttrHours: number;
  excludedSlotsCount: number;
}

interface DepartmentItem {
  functionCode?: string;
  department: string;
  employmentStatus?: string;
  totalMembers: number;
  participationRate: number;
  onTimePercent: number;
  latePercent: number;
  noSubmissionPercent: number;
  openBlockersCount: number;
  resolvedBlockersCount?: number;
  mttrHours: number;
  excludedSlotsCount?: number;
}

interface PolicyTimingInfo {
  morningOnTimeCutoff: string;
  morningLockCutoff: string;
  eodOnTimeCutoff: string;
  eodLockCutoff: string;
}

interface DivisionOption {
  value: string;
  label: string;
}

interface ReportResponse {
  period: string;
  employmentStatusFilter?: string;
  scope?: 'COMPANY' | 'DIVISION';
  lockedFunction?: string | null;
  functionFilter?: string;
  availableFunctions?: DivisionOption[];
  periodRange?: {
    startDate: string;
    endDate: string;
    workingDaysCount: number;
  };
  policyTiming?: PolicyTimingInfo;
  summary: SummaryData;
  departmentBreakdown: DepartmentItem[];
}

const loading = ref(false);
const exporting = ref(false);
const hasLoaded = ref(false);
const activePeriod = ref('today');
const selectedEmploymentStatus = ref('ALL');
const selectedDivision = ref('ALL');

const report = ref<ReportResponse>({
  period: 'today',
  scope: 'COMPANY',
  lockedFunction: null,
  functionFilter: 'ALL',
  availableFunctions: [],
  policyTiming: {
    morningOnTimeCutoff: '09:00',
    morningLockCutoff: '09:30',
    eodOnTimeCutoff: '17:00',
    eodLockCutoff: '21:00',
  },
  summary: {
    totalEmployees: 0,
    participationRate: 0,
    onTimePercent: 0,
    latePercent: 0,
    noSubmissionPercent: 0,
    openBlockersCount: 0,
    resolvedBlockersCount: 0,
    avgBlockerMttrHours: 0,
    excludedSlotsCount: 0,
  },
  departmentBreakdown: [],
});

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

function formatDepartmentLabel(fn?: string | null): string {
  switch (fn) {
    case 'OperationsInfrastructure':
      return 'Operations & Infrastructure';
    case 'RnD':
      return 'R&D & Technical Advisory';
    case 'SalesEnablementPresales':
      return 'Sales Enablement & Presales';
    case 'BusinessDevelopment':
      return 'Business Development';
    default:
      return fn || '-';
  }
}

const policyTiming = computed<PolicyTimingInfo>(() => ({
  morningOnTimeCutoff: report.value.policyTiming?.morningOnTimeCutoff || '09:00',
  morningLockCutoff: report.value.policyTiming?.morningLockCutoff || '09:30',
  eodOnTimeCutoff: report.value.policyTiming?.eodOnTimeCutoff || '17:00',
  eodLockCutoff: report.value.policyTiming?.eodLockCutoff || '21:00',
}));

const divisionOptions = computed<DivisionOption[]>(() => report.value.availableFunctions || []);

const isDivisionLocked = computed(() => report.value.scope === 'DIVISION');

const lockedFunctionLabel = computed(() => {
  if (report.value.lockedFunction) {
    return formatDepartmentLabel(report.value.lockedFunction);
  }
  return report.value.departmentBreakdown[0]?.department || 'Divisi Anda';
});

const scopeLabelText = computed(() => {
  if (isDivisionLocked.value) {
    return `Khusus Divisi ${lockedFunctionLabel.value}`;
  }
  if (selectedDivision.value !== 'ALL') {
    const matched = divisionOptions.value.find((d) => d.value === selectedDivision.value);
    return `Filter Divisi: ${matched?.label || formatDepartmentLabel(selectedDivision.value)}`;
  }
  return 'Seluruh Perusahaan';
});

const periodRangeText = computed(() => {
  const pr = report.value.periodRange;
  if (!hasLoaded.value || !pr?.startDate || !pr?.endDate) return '';
  const rangeStr = formatDateRangeWib(pr.startDate, pr.endDate);
  const days = pr.workingDaysCount ?? 0;
  return `${rangeStr} (${days} hari kerja)`;
});

const hasActiveFilters = computed(
  () =>
    activePeriod.value !== 'today' ||
    selectedEmploymentStatus.value !== 'ALL' ||
    (!isDivisionLocked.value && selectedDivision.value !== 'ALL'),
);

async function loadReport() {
  loading.value = true;
  try {
    const query = new URLSearchParams({ period: activePeriod.value });
    if (selectedEmploymentStatus.value !== 'ALL') {
      query.set('employmentStatus', selectedEmploymentStatus.value);
    }
    if (!isDivisionLocked.value && selectedDivision.value !== 'ALL') {
      query.set('function', selectedDivision.value);
    }
    const res = await apiClient<ReportResponse>(`/v1/reports/executive?${query.toString()}`);
    const data = res?.data || res;
    if (data && data.summary) {
      report.value = {
        ...data,
        scope: data.scope || 'COMPANY',
        availableFunctions: data.availableFunctions || [],
        summary: {
          ...data.summary,
          resolvedBlockersCount: data.summary.resolvedBlockersCount ?? 0,
          excludedSlotsCount: data.summary.excludedSlotsCount ?? 0,
        },
      };
      if (data.scope === 'DIVISION') {
        selectedDivision.value = 'ALL';
      }
      hasLoaded.value = true;
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

function resetFilters() {
  activePeriod.value = 'today';
  selectedEmploymentStatus.value = 'ALL';
  selectedDivision.value = 'ALL';
  loadReport();
}

function handlePrint() {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}

async function handleExport() {
  if (loading.value || exporting.value || report.value.departmentBreakdown.length === 0) return;
  exporting.value = true;
  try {
    showToast('Menyiapkan dan mengunduh berkas laporan CSV...');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const query = new URLSearchParams({ period: activePeriod.value });
    if (selectedEmploymentStatus.value !== 'ALL') {
      query.set('employmentStatus', selectedEmploymentStatus.value);
    }
    if (!isDivisionLocked.value && selectedDivision.value !== 'ALL') {
      query.set('function', selectedDivision.value);
    }
    const exportUrl = `${baseUrl}/v1/reports/export?${query.toString()}`;
    const res = await fetch(exportUrl, {
      credentials: 'include',
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || errJson?.message || 'Gagal mengunduh berkas laporan CSV.');
    }
    const blob =
      typeof res.blob === 'function'
        ? await res.blob()
        : new Blob([await res.text()], { type: 'text/csv; charset=utf-8' });
    const disposition = res.headers?.get?.('content-disposition') || '';
    const match = disposition.match(/filename="([^"]+)"/);
    const wibToday = getTodayIsoWib();
    const empSuffix =
      selectedEmploymentStatus.value !== 'ALL'
        ? `-${selectedEmploymentStatus.value.toLowerCase()}`
        : '';
    const divSuffix =
      !isDivisionLocked.value && selectedDivision.value !== 'ALL'
        ? `-${selectedDivision.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        : '';
    const fallbackName = `workpulse-report-${activePeriod.value}${divSuffix}${empSuffix}-${wibToday}.csv`;

    if (typeof window !== 'undefined' && typeof window.URL?.createObjectURL === 'function') {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', match?.[1] || fallbackName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }
    showToast('Berkas laporan CSV berhasil diunduh.');
  } catch (err: any) {
    showToast(err.message || 'Gagal mengekspor laporan.', true);
  } finally {
    exporting.value = false;
  }
}

onMounted(() => {
  loadReport();
});
</script>

<template>
  <div class="reports-layout">
    <TopBar breadcrumb="Management / Laporan Eksekutif" />

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
      <!-- Page Header + Actions -->
      <div class="page-heading">
        <div class="page-heading-info">
          <div class="eyebrow-row">
            <span class="eyebrow">Laporan &amp; Analitik Organisasi</span>
            <span
              class="scope-badge"
              :class="isDivisionLocked ? 'division' : 'company'"
              data-testid="reports-scope-badge"
            >
              {{ scopeLabelText }}
            </span>
          </div>
          <h1>Laporan Eksekutif</h1>
          <p class="subtitle">
            Ringkasan tren kepatuhan harian, ketepatan waktu pengisian, penanganan kendala, serta rekapitulasi antar unit kerja tanpa pemeringkatan individu.
          </p>
          <p v-if="periodRangeText" class="period-range-line" data-testid="reports-period-range">
            Rentang data: <strong>{{ periodRangeText }}</strong>
          </p>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="btn btn-secondary"
            data-testid="btn-export-csv"
            :disabled="loading || exporting || report.departmentBreakdown.length === 0"
            @click="handleExport"
          >
            <Download :size="15" />
            <span>{{ exporting ? 'Menyiapkan CSV...' : 'Unduh Laporan (CSV)' }}</span>
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-testid="btn-print-report"
            :disabled="loading || report.departmentBreakdown.length === 0"
            @click="handlePrint"
          >
            <Printer :size="15" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      <!-- Filter Bar: Periode, Divisi, Status Karyawan, Reset -->
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

          <div class="filter-controls">
            <select
              v-if="!isDivisionLocked && divisionOptions.length > 0"
              v-model="selectedDivision"
              class="emp-filter-select"
              data-testid="reports-division-filter"
              aria-label="Filter Divisi"
              @change="loadReport"
            >
              <option value="ALL">Semua Divisi</option>
              <option
                v-for="div in divisionOptions"
                :key="div.value"
                :value="div.value"
              >
                {{ div.label }}
              </option>
            </select>
            <span
              v-else-if="isDivisionLocked"
              class="division-lock-chip"
              data-testid="reports-division-locked"
            >
              Divisi: {{ lockedFunctionLabel }}
            </span>

            <select
              v-model="selectedEmploymentStatus"
              class="emp-filter-select"
              data-testid="reports-employment-status-filter"
              aria-label="Filter Status Karyawan"
              @change="loadReport"
            >
              <option
                v-for="opt in EMPLOYMENT_STATUS_FILTER_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>

            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn btn-reset"
              data-testid="reports-reset-filters"
              @click="resetFilters"
            >
              Tampilkan Semua
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
            <TrendingUp :size="16" class="text-brand" />
          </div>
          <div class="summary-num text-brand">
            {{ hasLoaded ? `${report.summary.participationRate}%` : '—' }}
          </div>
          <div class="summary-foot">
            <template v-if="hasLoaded">
              {{ report.summary.totalEmployees }} personil
              <template v-if="report.summary.excludedSlotsCount > 0">
                · {{ report.summary.excludedSlotsCount }} cuti/dispensasi dikecualikan
              </template>
            </template>
            <template v-else>Memuat data kepatuhan...</template>
          </div>
        </div>

        <!-- 2. Tepat Waktu (Info Blue kanonikal) -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Tepat Waktu</span>
          </div>
          <div class="summary-num timing-ontime-text">
            {{ hasLoaded ? `${report.summary.onTimePercent}%` : '—' }}
          </div>
          <div class="summary-pill-wrap">
            <span class="pill timing-ontime" data-testid="cutoff-badge-ontime">
              ≤ {{ policyTiming.morningOnTimeCutoff }} WIB
            </span>
            <span class="summary-foot">Sebelum batas tepat waktu</span>
          </div>
        </div>

        <!-- 3. Terlambat Sah (Late Orange kanonikal) -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Terlambat Sah</span>
          </div>
          <div class="summary-num timing-late-text">
            {{ hasLoaded ? `${report.summary.latePercent}%` : '—' }}
          </div>
          <div class="summary-pill-wrap">
            <span class="pill timing-late" data-testid="cutoff-badge-late">
              {{ policyTiming.morningOnTimeCutoff }}–{{ policyTiming.morningLockCutoff }} WIB
            </span>
            <span class="summary-foot">Lewat jam tepat waktu</span>
          </div>
        </div>

        <!-- 4. Belum Mengisi (Neutral Slate kanonikal) -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Belum Mengisi</span>
          </div>
          <div class="summary-num timing-nosub-text">
            {{ hasLoaded ? `${report.summary.noSubmissionPercent}%` : '—' }}
          </div>
          <div class="summary-pill-wrap">
            <span class="pill timing-nosub" data-testid="cutoff-badge-nosub">
              Lewat {{ policyTiming.morningLockCutoff }} WIB
            </span>
            <span class="summary-foot">Di luar cuti &amp; dispensasi sah</span>
          </div>
        </div>

        <!-- 5. Rata-rata Selesai Kendala (MTTR nyata) -->
        <div class="summary-card">
          <div class="summary-card-top">
            <span class="summary-label">Rata-rata Selesai Kendala</span>
            <Clock :size="16" class="text-muted-icon" />
          </div>
          <div class="summary-num" data-testid="metric-mttr">
            {{
              hasLoaded && report.summary.resolvedBlockersCount > 0
                ? `${report.summary.avgBlockerMttrHours} Jam`
                : '—'
            }}
          </div>
          <div class="summary-foot">
            <template v-if="hasLoaded">
              {{
                report.summary.resolvedBlockersCount > 0
                  ? `Dari ${report.summary.resolvedBlockersCount} kendala selesai`
                  : 'Belum ada kendala selesai'
              }}
            </template>
            <template v-else>Memuat data kendala...</template>
          </div>
        </div>
      </div>

      <!-- Guardrail Non-Punitive Callout -->
      <div class="guardrail-callout">
        <Info :size="20" class="guardrail-icon" />
        <div>
          <strong>Prinsip Non-Hukuman (Non-Punitive):</strong> Laporan ini dirancang untuk perbaikan berkelanjutan alur kerja dan identifikasi hambatan tim, bukan sebagai alat pemeringkatan personil secara individual. Gunakan data di bawah ini untuk merancang dukungan dan pembagian beban kerja lintas fungsi.
        </div>
      </div>

      <!-- Departmental Breakdown Table -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Rekapitulasi Kepatuhan &amp; Kendala per Unit Kerja</h2>
            <p class="panel-subtitle">
              Agregasi partisipasi, ketepatan waktu, dan kendala aktif pada masing-masing divisi.
            </p>
          </div>
          <span class="pill neutral unit-count-pill" data-testid="unit-count-badge">
            {{ report.departmentBreakdown.length }} Unit Kerja
          </span>
        </div>

        <p class="mobile-scroll-hint">Geser tabel ke samping untuk melihat seluruh kolom.</p>

        <div v-if="loading" class="empty-state">
          <Clock :size="24" class="spin" />
          <p>Memuat rekapitulasi laporan...</p>
        </div>

        <div v-else class="table-wrap">
          <table class="report-table">
            <thead>
              <tr>
                <th scope="col">Departemen / Unit Kerja</th>
                <th scope="col" class="text-center">Status Karyawan</th>
                <th scope="col" class="text-center">Personil</th>
                <th scope="col" class="text-center">Partisipasi</th>
                <th scope="col" class="text-center">Tepat Waktu</th>
                <th scope="col" class="text-center">Terlambat</th>
                <th scope="col" class="text-center">Belum Mengisi</th>
                <th scope="col" class="text-center">Kendala Aktif</th>
                <th scope="col" class="text-center">Rata-rata Selesai</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="report.departmentBreakdown.length === 0">
                <td colspan="9" class="empty-table-cell">
                  <p>Belum ada data karyawan untuk penyaring yang dipilih.</p>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm-reset"
                    data-testid="empty-reset-filters"
                    @click="resetFilters"
                  >
                    Tampilkan Semua
                  </button>
                </td>
              </tr>
              <tr v-for="dept in report.departmentBreakdown" :key="dept.department">
                <td>
                  <strong>{{ dept.department }}</strong>
                </td>
                <td class="text-center">
                  <span
                    :class="dept.employmentStatus === 'Intern' ? 'badge-intern' : dept.employmentStatus === 'Kontrak' ? 'badge-contract' : 'pill neutral'"
                  >
                    {{ dept.employmentStatus || 'Semua Status' }}
                  </span>
                </td>
                <td class="text-center">{{ dept.totalMembers }} Orang</td>
                <td class="text-center">
                  <span class="bold">{{ dept.participationRate }}%</span>
                </td>
                <td class="text-center">
                  <span class="badge ontime">{{ dept.onTimePercent }}%</span>
                </td>
                <td class="text-center">
                  <span class="badge late">{{ dept.latePercent }}%</span>
                </td>
                <td class="text-center">
                  <span class="badge nosub">{{ dept.noSubmissionPercent }}%</span>
                </td>
                <td class="text-center">
                  <span :class="{ 'text-red bold': dept.openBlockersCount > 0 }">{{ dept.openBlockersCount }}</span>
                </td>
                <td class="text-center">
                  {{ (dept.resolvedBlockersCount ?? 0) > 0 ? `${dept.mttrHours} Jam` : '—' }}
                </td>
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
  min-width: 0;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-heading-info {
  min-width: 0;
}

.eyebrow-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-primary, #00674D);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scope-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.scope-badge.company {
  background: #E8F5E9;
  color: #00674D;
  border: 1px solid #A7F3D0;
}

.scope-badge.division {
  background: #E0F2FE;
  color: #075985;
  border: 1px solid #7DD3FC;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary, #5C6E68);
  max-width: 740px;
}

.period-range-line {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-bar {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 22px;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.time-presets {
  display: inline-flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 6px;
  gap: 2px;
  flex-wrap: wrap;
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
  white-space: nowrap;
  transition: all 0.15s ease;
}

.preset-btn.active {
  background: #FFFFFF;
  color: var(--color-brand-primary, #00674D);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.emp-filter-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  background-color: #FFFFFF;
  color: var(--color-text-primary, #0E211B);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.division-lock-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  background: #E0F2FE;
  border: 1px solid #7DD3FC;
  color: #075985;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.summary-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 15px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}

.summary-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
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
  line-height: 1.2;
}

.summary-pill-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.summary-foot {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  line-height: 1.35;
}

.text-brand { color: var(--color-brand-primary, #00674D); }
.text-muted-icon { color: var(--color-text-secondary, #5C6E68); flex-shrink: 0; }
.text-red { color: #991B1B; }
.bold { font-weight: 700; }

/* Canonical Timing Tokens DS v1.5.0 */
.timing-ontime-text { color: #075985; }
.timing-late-text { color: #9A3412; }
.timing-nosub-text { color: #334155; }

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
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.unit-count-pill {
  white-space: nowrap;
  flex-shrink: 0;
}

.mobile-scroll-hint {
  display: none;
  margin: 0;
  padding: 8px 16px;
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
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
  padding: 10px 14px;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  white-space: nowrap;
}

.report-table td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  font-size: 13px;
}

.text-center {
  text-align: center;
}

.empty-table-cell {
  text-align: center;
  padding: 28px 16px !important;
  color: var(--color-text-secondary, #5C6E68);
}

.empty-table-cell p {
  margin: 0 0 12px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.badge.ontime {
  background: #E0F2FE;
  color: #075985;
  border: 1px solid #7DD3FC;
}

.badge.late {
  background: #FFEDD5;
  color: #9A3412;
  border: 1px solid #FDBA74;
}

.badge.nosub {
  background: #F1F5F9;
  color: #334155;
  border: 1px solid #CBD5E1;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.pill.timing-ontime {
  background: #E0F2FE;
  color: #075985;
  border: 1px solid #7DD3FC;
}

.pill.timing-late {
  background: #FFEDD5;
  color: #9A3412;
  border: 1px solid #FDBA74;
}

.pill.timing-nosub {
  background: #F1F5F9;
  color: #334155;
  border: 1px solid #CBD5E1;
}

.pill.neutral {
  background: #F1F5F9;
  color: #334155;
  border: 1px solid #CBD5E1;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  border-color: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: #00523D;
  border-color: #00523D;
}

.btn-secondary {
  background: #FFFFFF;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.btn-secondary:hover:not(:disabled) {
  background: #F1F5F9;
}

.btn-reset {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #0E211B;
  padding: 6px 12px;
  font-size: 12.5px;
}

.btn-sm-reset {
  padding: 6px 14px;
  font-size: 12.5px;
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

@media (max-width: 1024px) {
  .metrics-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .mobile-scroll-hint {
    display: block;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 14px 40px;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions .btn {
    flex: 1 1 auto;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .emp-filter-select,
  .division-lock-chip,
  .btn-reset {
    width: 100%;
  }

  .metrics-row {
    grid-template-columns: 1fr;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media print {
  .header-actions,
  .filter-bar,
  .toast-popup,
  .mobile-scroll-hint {
    display: none !important;
  }

  .main-content {
    max-width: 100%;
    padding: 0;
  }
}
</style>
