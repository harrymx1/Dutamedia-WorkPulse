<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { formatDateSpanWib, formatDateWib } from '../../utils/dateTime';
import {
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
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
  outcomeReason?: string;
  continuation?: string;
  continuationReason?: string;
}

interface AdditionalWorkRecord {
  id: string;
  taskText: string;
  reason: string;
  outcome?: string;
  outcomeReason?: string;
  continuation?: string;
  continuationReason?: string;
}

interface OrgContextSnapshot {
  dailyRiskExplanation?: string;
  tomorrowPriority?: string;
  [key: string]: unknown;
}

interface DailyRecordRow {
  id: string;
  workDate: string;
  morningTiming: string;
  eodTiming: string;
  initialDailyStatus: string;
  finalDailyStatus?: string;
  zeroCommitmentReason?: string;
  orgContextSnapshot?: OrgContextSnapshot | null;
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

interface RecordedLeaveItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  reviewedBy?: { id: string; fullName: string } | null;
}

interface RecordedExemptionItem {
  id: string;
  exemptionCategory: string;
  officialReferenceNumber?: string | null;
  startDate: string;
  endDate?: string | null;
  reason: string;
  createdByUser?: { id: string; fullName: string } | null;
}

// State
const loading = ref(false);
const records = ref<DailyRecordRow[]>([]);
const recordedLeaves = ref<RecordedLeaveItem[]>([]);
const recordedExemptions = ref<RecordedExemptionItem[]>([]);
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
const dateRangeError = ref<string | null>(null);

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

function formatTimingLabel(timing: string, kind: 'morning' | 'eod'): string {
  switch (timing) {
    case 'ON_TIME':
      return 'Tepat Waktu';
    case 'LATE':
      return kind === 'eod' ? 'Di Luar Jam Normal' : 'Terlambat';
    case 'NO_SUBMISSION':
      return 'Belum Mengisi';
    case 'APPROVED_LEAVE':
      return 'Cuti Resmi';
    case 'EXEMPTED':
      return 'Dikecualikan';
    default:
      return timing || '-';
  }
}

function getTimingBadgeClass(timing: string): string {
  if (timing === 'ON_TIME') return 'badge-ontime';
  if (timing === 'LATE') return 'badge-late';
  return 'badge-neutral';
}

function formatDailyStatusLabel(status?: string): string {
  switch (status) {
    case 'GREEN':
      return 'Hijau (Terkendali)';
    case 'AMBER':
      return 'Kuning (Waspada)';
    case 'RED':
      return 'Merah (Kritis)';
    case 'NOT_APPLICABLE_NO_COMMITMENT':
      return 'Tidak Ada Komitmen';
    default:
      return status || '-';
  }
}

function getDailyStatusBadgeClass(status?: string): string {
  switch (status) {
    case 'GREEN':
      return 'badge-active';
    case 'AMBER':
      return 'badge-warning';
    case 'RED':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
}

function formatRiskLabel(risk?: string): string {
  switch (risk) {
    case 'GREEN':
      return 'Risiko Rendah';
    case 'AMBER':
      return 'Risiko Sedang';
    case 'RED':
      return 'Risiko Tinggi';
    default:
      return risk || '-';
  }
}

function getRiskBadgeClass(risk?: string): string {
  switch (risk) {
    case 'GREEN':
      return 'badge-active';
    case 'AMBER':
      return 'badge-warning';
    case 'RED':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
}

function formatOutcomeLabel(outcome?: string): string {
  switch (outcome) {
    case 'COMPLETED':
      return 'Selesai';
    case 'PARTIALLY_COMPLETED':
      return 'Selesai Sebagian';
    case 'NOT_COMPLETED':
      return 'Belum Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return outcome || '-';
  }
}

function getOutcomeBadgeClass(outcome?: string): string {
  switch (outcome) {
    case 'COMPLETED':
      return 'badge-active';
    case 'PARTIALLY_COMPLETED':
      return 'badge-warning';
    case 'NOT_COMPLETED':
      return 'badge-danger';
    case 'CANCELLED':
    default:
      return 'badge-neutral';
  }
}

function formatAdditionalReasonLabel(reason?: string): string {
  switch (reason) {
    case 'NEWLY_ASSIGNED':
      return 'Penugasan Baru Atasan';
    case 'OPERATIONAL_INCIDENT':
      return 'Perbaikan Error / Bug Kritis';
    case 'MISSED_IN_PLANNING':
      return 'Terlewat Catat Pagi';
    case 'MORNING_CUTOFF_MISSED':
      return 'Komitmen Pagi Terlewat';
    case 'PRIORITY_CHANGE':
      return 'Pengalihan Prioritas';
    case 'OTHER':
      return 'Lainnya';
    default:
      return reason || '-';
  }
}

function getSnapshotText(record: DailyRecordRow, key: 'dailyRiskExplanation' | 'tomorrowPriority'): string {
  const val = record.orgContextSnapshot?.[key];
  return typeof val === 'string' ? val.trim() : '';
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatLeaveTypeLabel(type?: string): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Sakit';
    case 'PERMIT':
      return 'Izin Resmi';
    case 'SPECIAL_LEAVE':
      return 'Cuti Khusus';
    case 'MATERNITY':
      return 'Cuti Melahirkan';
    case 'UNPAID':
      return 'Cuti di Luar Tanggungan';
    default:
      return type || 'Cuti Resmi';
  }
}

function formatDateRangeText(start: string, end?: string | null): string {
  if (!end) {
    const sLabel = formatDateWib(start, '');
    return sLabel ? `Mulai ${sLabel} (Permanen)` : 'Permanen';
  }
  return formatDateSpanWib(start, end, '');
}

async function loadHistory() {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    dateRangeError.value = 'Dari Tanggal tidak boleh lebih akhir daripada Sampai Tanggal.';
    showToast(dateRangeError.value, true);
    return;
  }
  dateRangeError.value = null;

  loading.value = true;
  try {
    const query = new URLSearchParams();
    if (startDate.value) query.set('startDate', startDate.value);
    if (endDate.value) query.set('endDate', endDate.value);

    const res = await apiClient<{
      dateRange: { startDate: string; endDate: string };
      kpi: HistoryKpi;
      records: DailyRecordRow[];
      recordedLeaves?: RecordedLeaveItem[];
      recordedExemptions?: RecordedExemptionItem[];
    }>(`/daily/history?${query.toString()}`);

    records.value = res.data.records || [];
    recordedLeaves.value = res.data.recordedLeaves || [];
    recordedExemptions.value = res.data.recordedExemptions || [];
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

  const headers = ['Tanggal', 'Waktu Pagi', 'Waktu EOD', 'Status Pagi', 'Status Akhir (Refleksi)', 'Jml Komitmen', 'Jml Pekerjaan Tambahan'];
  const rows = records.value.map((r) => [
    r.workDate.split('T')[0],
    formatTimingLabel(r.morningTiming, 'morning'),
    formatTimingLabel(r.eodTiming, 'eod'),
    formatDailyStatusLabel(r.initialDailyStatus),
    r.finalDailyStatus ? formatDailyStatusLabel(r.finalDailyStatus) : '-',
    r.commitments.length,
    r.additionalWorks.length,
  ]);

  const csvLines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(','));
  const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n');
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
    <TopBar breadcrumb="Workspace / My History" />

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
            Pantau kepatuhan ketepatan waktu check-in, tren risiko harian, dan evaluasi hasil komitmen Anda dari waktu ke waktu.
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
        <p v-if="dateRangeError" class="filter-error" role="alert" data-testid="date-range-error">
          {{ dateRangeError }}
        </p>
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
                    <span class="badge" :class="getTimingBadgeClass(r.morningTiming)">
                      {{ formatTimingLabel(r.morningTiming, 'morning') }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="getTimingBadgeClass(r.eodTiming)">
                      {{ formatTimingLabel(r.eodTiming, 'eod') }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="getDailyStatusBadgeClass(r.initialDailyStatus)">
                      {{ formatDailyStatusLabel(r.initialDailyStatus) }}
                    </span>
                  </td>
                  <td>
                    <span v-if="r.finalDailyStatus" class="badge" :class="getDailyStatusBadgeClass(r.finalDailyStatus)">
                      {{ formatDailyStatusLabel(r.finalDailyStatus) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="mono">{{ r.commitments.length + r.additionalWorks.length }} Item</td>
                  <td>
                    <button type="button" class="expand-btn" :aria-expanded="!!expandedRows[r.id]">
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

                      <div
                        v-if="getSnapshotText(r, 'dailyRiskExplanation')"
                        class="detail-note detail-note-risk"
                        data-testid="detail-risk-explanation"
                      >
                        <strong>Penjelasan Risiko Hari Ini:</strong>
                        <span>{{ getSnapshotText(r, 'dailyRiskExplanation') }}</span>
                      </div>

                      <div
                        v-if="getSnapshotText(r, 'tomorrowPriority')"
                        class="detail-note detail-note-priority"
                        data-testid="detail-tomorrow-priority"
                      >
                        <strong>Prioritas Esok Hari:</strong>
                        <span>{{ getSnapshotText(r, 'tomorrowPriority') }}</span>
                      </div>

                      <div v-if="r.commitments.length > 0" class="sub-section">
                        <h4>Komitmen Pagi ({{ r.commitments.length }}):</h4>
                        <div class="items-list">
                          <div v-for="c in r.commitments" :key="c.id" class="sub-item">
                            <div class="sub-item-header">
                              <span class="item-num">#{{ c.sequenceNo }}</span>
                              <span class="item-text">{{ c.taskText }}</span>
                              <span class="badge" :class="getRiskBadgeClass(c.initialRisk)">
                                {{ formatRiskLabel(c.initialRisk) }}
                              </span>
                              <span v-if="c.outcome" class="badge" :class="getOutcomeBadgeClass(c.outcome)">
                                {{ formatOutcomeLabel(c.outcome) }}
                              </span>
                            </div>
                            <div v-if="c.continuation === 'CONTINUE'" class="sub-item-meta">
                              <strong>Kelanjutan Besok:</strong> {{ c.continuationReason || c.outcomeReason || 'Dilanjutkan ke hari kerja berikutnya' }}
                            </div>
                            <div
                              v-if="c.outcome === 'CANCELLED' && c.outcomeReason"
                              class="sub-item-meta"
                              data-testid="detail-cancel-reason"
                            >
                              <strong>Alasan Pembatalan:</strong> {{ c.outcomeReason }}
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
                              <span class="badge badge-neutral">{{ formatAdditionalReasonLabel(w.reason) }}</span>
                              <span v-if="w.outcome" class="badge" :class="getOutcomeBadgeClass(w.outcome)">
                                {{ formatOutcomeLabel(w.outcome) }}
                              </span>
                            </div>
                            <div v-if="w.continuation === 'CONTINUE'" class="sub-item-meta">
                              <strong>Kelanjutan Besok:</strong> {{ w.continuationReason || w.outcomeReason || 'Dilanjutkan ke hari kerja berikutnya' }}
                            </div>
                            <div
                              v-if="w.outcome === 'CANCELLED' && w.outcomeReason"
                              class="sub-item-meta"
                              data-testid="detail-cancel-reason"
                            >
                              <strong>Alasan Pembatalan:</strong> {{ w.outcomeReason }}
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

      <!-- Riwayat Cuti & Dispensasi Resmi Tercatat -->
      <section class="panel readonly-absence-panel" data-testid="readonly-leave-exemption-panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Arsip Kehadiran Dikecualikan</div>
            <h2>Riwayat Cuti &amp; Dispensasi Resmi Tercatat</h2>
            <p class="panel-subtitle">
              Data di bawah ini dicatat resmi oleh HRGA / Direktur / Admin setelah disetujui. Pada periode tercantum, Anda dibebaskan otomatis dari kewajiban check-in harian. Jika terdapat perbedaan data, silakan hubungi tim HRGA atau atasan Anda.
            </p>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="recordedLeaves.length === 0 && recordedExemptions.length === 0" class="readonly-empty">
            <CalendarCheck :size="20" class="text-green" />
            <span>Belum ada catatan cuti resmi maupun dispensasi terdaftar pada akun Anda.</span>
          </div>

          <div v-else class="absence-grid">
            <div v-if="recordedLeaves.length > 0" class="absence-group">
              <h3>Catatan Cuti Resmi ({{ recordedLeaves.length }})</h3>
              <ul class="absence-list">
                <li v-for="lv in recordedLeaves" :key="lv.id" class="absence-item" :data-testid="`readonly-leave-${lv.id}`">
                  <div class="absence-top">
                    <span class="badge badge-active">{{ formatLeaveTypeLabel(lv.leaveType) }}</span>
                    <span class="absence-period wp-datetime">{{ formatDateRangeText(lv.startDate, lv.endDate) }}</span>
                  </div>
                  <p class="absence-reason">{{ lv.reason }}</p>
                  <small v-if="lv.reviewedBy?.fullName" class="absence-actor">Dicatat oleh: {{ lv.reviewedBy.fullName }}</small>
                </li>
              </ul>
            </div>

            <div v-if="recordedExemptions.length > 0" class="absence-group">
              <h3>Catatan Dispensasi Resmi ({{ recordedExemptions.length }})</h3>
              <ul class="absence-list">
                <li v-for="ex in recordedExemptions" :key="ex.id" class="absence-item" :data-testid="`readonly-exemption-${ex.id}`">
                  <div class="absence-top">
                    <span class="badge badge-warning">{{ ex.exemptionCategory }}</span>
                    <span class="absence-period wp-datetime">{{ formatDateRangeText(ex.startDate, ex.endDate) }}</span>
                  </div>
                  <p class="absence-reason">
                    <strong v-if="ex.officialReferenceNumber">[{{ ex.officialReferenceNumber }}] </strong>{{ ex.reason }}
                  </p>
                  <small v-if="ex.createdByUser?.fullName" class="absence-actor">Dicatat oleh: {{ ex.createdByUser.fullName }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.daily-layout {
  min-height: 100vh;
  max-width: 100%;
  overflow-x: clip;
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
  box-sizing: border-box;
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
  box-sizing: border-box;
  max-width: 100%;
}

.filter-inputs {
  display: flex;
  flex-wrap: wrap;
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

.filter-error {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-status-red-fg);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  min-width: 0;
  box-sizing: border-box;
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
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
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

.panel-subtitle {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-width: 78ch;
}

.panel-body {
  padding: 16px 20px 20px;
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

.detail-note {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--color-border-subtle);
  border-left: 3px solid var(--color-brand-primary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.45;
}

.detail-note-risk {
  border-left-color: #d97706;
  background: #fffbeb;
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
  flex-wrap: wrap;
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

.page-heading .btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.history-table td.mono,
.expand-btn {
  white-space: nowrap;
}

@media (max-width: 1120px) {
  .history-table th,
  .history-table td {
    padding: 10px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px 48px;
    gap: 16px;
  }

  .page-heading {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .page-heading .btn {
    align-self: flex-start;
  }

  .filter-card {
    padding: 14px 16px;
  }

  .filter-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    width: 100%;
  }

  .input-control,
  .filter-btn {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .kpi-card {
    padding: 14px;
  }

  .kpi-value {
    font-size: 22px;
  }

  .panel-head {
    padding: 14px 16px;
  }

  .panel-body {
    padding: 14px 16px 16px;
  }

  .toast-popup {
    left: 16px;
    right: 16px;
    top: 16px;
  }
}

@media (max-width: 640px) {
  .history-table .detail-row td {
    padding: 12px 0;
  }

  .detail-content {
    position: sticky;
    left: 12px;
    width: calc(100vw - 58px);
    max-width: calc(100vw - 58px);
    box-sizing: border-box;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 480px) {
  .page-heading h1 {
    font-size: 20px;
  }

  .kpi-card {
    padding: 12px;
  }

  .kpi-value {
    font-size: 20px;
  }

  .history-table th,
  .history-table td {
    padding: 10px 12px;
  }
}

.readonly-absence-panel {
  margin-top: 0;
}

.readonly-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #5C6E68;
  background: #FAFCFB;
  border: 1px dashed #CBE0D6;
  border-radius: 8px;
  padding: 14px;
}

.absence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.absence-group h3 {
  font-size: 13.5px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #0E211B;
}

.absence-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.absence-item {
  border: 1px solid #DCE7E2;
  background: #FAFCFB;
  border-radius: 8px;
  padding: 10px 12px;
}

.absence-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.absence-period {
  font-size: 12px;
  font-weight: 700;
  color: #00674D;
}

.absence-reason {
  font-size: 12.5px;
  color: #0E211B;
  margin: 0 0 4px;
  line-height: 1.4;
}

.absence-actor {
  font-size: 11px;
  color: #5C6E68;
}
</style>
