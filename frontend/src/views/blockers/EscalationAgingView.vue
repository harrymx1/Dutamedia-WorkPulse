<script setup lang="ts">
import ToastPopup from '../../components/ToastPopup.vue';
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { getBlockerTypeInfo, getTicketImpactsList } from '../../utils/blockerStatus';
import { formatTimeWib, formatShortDateTimeWib } from '../../utils/dateTime';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  User,
  ArrowUpRight,
} from 'lucide-vue-next';

interface AgingBlockerItem {
  id: string;
  description: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  impacts?: string[];
  status: string;
  raisedAt: string;
  targetResolutionAt?: string;
  elapsedHours: number;
  hoursRemaining: number | null;
  isBreached: boolean;
  raisedBy: { id: string; fullName: string };
  assignedOwner?: { id: string; fullName: string };
  projectCodeReference?: string;
}

interface AgingMetricsResponse {
  evaluatedAt: string;
  summary: {
    totalOpen: number;
    breachedCount: number;
    criticalCount: number;
    highCount: number;
    slaComplianceRate: number;
  };
  blockers: AgingBlockerItem[];
}

// State
const loading = ref(false);
const data = ref<AgingMetricsResponse | null>(null);
const severityFilter = ref<string>('ALL');
const breachOnlyFilter = ref<boolean>(false);
const searchQuery = ref('');
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function loadAgingMetrics(showRefreshToast = false) {
  loading.value = true;
  errorMessage.value = null;
  try {
    const res = await apiClient<AgingMetricsResponse>('/blockers/aging');
    if (res.data) {
      data.value = res.data;
      if (showRefreshToast) {
        toastMessage.value = 'Data penuaan kendala berhasil diperbarui.';
        setTimeout(() => { toastMessage.value = null; }, 2500);
      }
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal memuat data penuaan kendala.';
    setTimeout(() => { errorMessage.value = null; }, 4000);
  } finally {
    loading.value = false;
  }
}

const filteredBlockers = computed(() => {
  if (!data.value) return [];
  const q = searchQuery.value.trim().toLowerCase();
  return data.value.blockers.filter((b) => {
    if (severityFilter.value !== 'ALL' && b.severity !== severityFilter.value) return false;
    if (breachOnlyFilter.value && !b.isBreached) return false;
    if (q) {
      const summary = formatCleanBlockerSummary(b.description).toLowerCase();
      const projectCode = (b.projectCodeReference || '').toLowerCase();
      const reporter = (b.raisedBy?.fullName || '').toLowerCase();
      const owner = (b.assignedOwner?.fullName || '').toLowerCase();
      const typeName = getBlockerTypeInfo(b.type).name.toLowerCase();
      if (
        !summary.includes(q) &&
        !projectCode.includes(q) &&
        !reporter.includes(q) &&
        !owner.includes(q) &&
        !typeName.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
});

const hasActiveFilters = computed(
  () =>
    severityFilter.value !== 'ALL' ||
    breachOnlyFilter.value ||
    searchQuery.value.trim().length > 0,
);

function resetFilters() {
  severityFilter.value = 'ALL';
  breachOnlyFilter.value = false;
  searchQuery.value = '';
}

function formatSeverityLabel(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'Kritis';
    case 'HIGH':
      return 'Tinggi';
    case 'MEDIUM':
      return 'Sedang';
    case 'LOW':
      return 'Rendah';
    default:
      return severity;
  }
}

function formatCleanBlockerSummary(rawDescription?: string): string {
  const raw = (rawDescription || '').trim();
  if (!raw) return '-';
  const withoutExpectation = raw.replace(/\s*\(Ekspektasi:\s*[^)]+\)\s*$/i, '').trim();
  const match = withoutExpectation.match(/^\[(.+?)\]\s*(.*)$/s);
  if (match) {
    const title = match[1].trim();
    const body = match[2].trim();
    return body ? `${title} — ${body}` : title;
  }
  return withoutExpectation;
}

onMounted(() => {
  loadAgingMetrics(false);
});
</script>

<template>
  <div class="aging-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Management / Penuaan & Eskalasi">
      <template #actions>
        <button type="button" class="btn-topbar" :disabled="loading" @click="loadAgingMetrics(true)">
          <RefreshCw :size="15" :class="{ spinning: loading }" />
          <span>Segarkan Data</span>
        </button>
      </template>
    </TopBar>

    <!-- Toasts -->
    <ToastPopup
      :toast-message="toastMessage"
      :error-message="errorMessage"
      @clear-toast="toastMessage = null"
      @clear-error="errorMessage = null"
    />

    <main class="main-content">
      <!-- Page Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Pengawasan Eksekutif &amp; Peringatan Batas Waktu</span>
          <h1>Keterlambatan Penanganan Blocker</h1>
          <p class="subtitle">
            Pantau radar penuaan kendala aktif, identifikasi hambatan yang melampaui ambang batas waktu penanganan, dan dorong intervensi manajerial tepat waktu.
          </p>
        </div>
        <div class="heading-side">
          <span v-if="data?.evaluatedAt" class="eval-pill">
            Evaluasi: <span class="wp-datetime">{{ formatTimeWib(data.evaluatedAt) }}</span>
          </span>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Kendala Tertahan</div>
          <div class="metric-value">{{ data?.summary.totalOpen ?? 0 }}</div>
          <div class="metric-sub">Tiket kendala belum terselesaikan</div>
        </div>

        <div class="metric-card alert-breach">
          <div class="metric-label">Lewat Batas Waktu</div>
          <div class="metric-value">{{ data?.summary.breachedCount ?? 0 }}</div>
          <div class="metric-sub">Tiket melampaui target batas penanganan</div>
        </div>

        <div class="metric-card alert-critical">
          <div class="metric-label">Prioritas Kritis</div>
          <div class="metric-value">{{ data?.summary.criticalCount ?? 0 }}</div>
          <div class="metric-sub">Kendala dengan dampak terhenti total</div>
        </div>

        <div class="metric-card rate-card">
          <div class="metric-label">Tingkat Ketepatan Waktu</div>
          <div class="metric-value">{{ data?.summary.slaComplianceRate ?? 100 }}%</div>
          <div class="metric-sub">Persentase tiket terselesaikan tepat waktu</div>
        </div>
      </div>

      <!-- Table Panel -->
      <div class="panel">
        <div class="panel-head">
          <div class="filter-row">
            <h2>Daftar Kendala Tertahan</h2>
            <div class="filters">
              <div class="search-wrap">
                <Search :size="15" class="search-icon" />
                <input
                  id="agingSearchInput"
                  v-model="searchQuery"
                  type="search"
                  class="search-input"
                  placeholder="Cari kendala, proyek, pelapor, atau PIC..."
                  aria-label="Cari kendala tertahan"
                />
              </div>

              <select id="agingSeverityFilter" v-model="severityFilter" class="filter-select" aria-label="Saring tingkat keparahan">
                <option value="ALL">Semua Tingkat Keparahan</option>
                <option value="CRITICAL">Kritis</option>
                <option value="HIGH">Tinggi</option>
                <option value="MEDIUM">Sedang</option>
                <option value="LOW">Rendah</option>
              </select>

              <label class="toggle-label">
                <input type="checkbox" v-model="breachOnlyFilter" />
                <span>Hanya Lewat Batas Waktu</span>
              </label>
            </div>
          </div>
        </div>

        <div class="table-container">
          <div v-if="loading && !data" class="loading-state">
            <span>Menghitung radar eskalasi kendala...</span>
          </div>

          <div v-else-if="(data?.blockers.length ?? 0) === 0" class="empty-state">
            <CheckCircle2 :size="36" class="empty-icon" />
            <h3>Tidak Ada Kendala Tertahan</h3>
            <p>Seluruh kendala aktif tertangani dalam batas waktu penanganan kebijakan.</p>
          </div>

          <div v-else-if="filteredBlockers.length === 0" class="empty-state">
            <CheckCircle2 :size="36" class="empty-icon" />
            <h3>Tidak Ada Kendala yang Cocok</h3>
            <p>Ubah pilihan tingkat keparahan atau kata kunci pencarian untuk melihat kendala lainnya.</p>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn-reset-filter"
              @click="resetFilters"
            >
              Tampilkan Semua Kendala
            </button>
          </div>

          <table v-else class="aging-table">
            <thead>
              <tr>
                <th>Kendala &amp; Taksonomi</th>
                <th>Pelapor &amp; Konteks</th>
                <th>Penanggung Jawab</th>
                <th>Tingkat Keparahan</th>
                <th>Umur Kendala</th>
                <th>Status Batas Waktu</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredBlockers"
                :key="item.id"
                :class="{ 'row-breached': item.isBreached }"
              >
                <!-- Kolom 1: Kendala -->
                <td class="col-desc">
                  <div v-if="item.projectCodeReference" class="ticket-type-row">
                    <span class="proj-pill">{{ item.projectCodeReference }}</span>
                  </div>
                  <div class="ticket-title-desc">{{ formatCleanBlockerSummary(item.description) }}</div>
                  <div class="aging-taxonomy-meta">
                    <span><strong>Kategori:</strong> {{ getBlockerTypeInfo(item.type).name }}</span>
                    <span> · </span>
                    <span><strong>Dampak:</strong> {{ getTicketImpactsList(item).map((i) => i.name).join(', ') }}</span>
                  </div>
                </td>

                <!-- Kolom 2: Pelapor -->
                <td class="col-reporter">
                  <div class="user-inline">
                    <User :size="14" />
                    <span>{{ item.raisedBy.fullName }}</span>
                  </div>
                  <small class="time-sub wp-datetime">{{ formatShortDateTimeWib(item.raisedAt) }}</small>
                </td>

                <!-- Kolom 3: PIC -->
                <td class="col-owner">
                  <span v-if="item.assignedOwner">{{ item.assignedOwner.fullName }}</span>
                  <span v-else class="unassigned-text">Belum Ditugaskan</span>
                </td>

                <!-- Kolom 4: Severity -->
                <td class="col-sev">
                  <span class="sev-badge" :class="item.severity.toLowerCase()">{{ formatSeverityLabel(item.severity) }}</span>
                </td>

                <!-- Kolom 5: Elapsed Hours -->
                <td class="col-elapsed">
                  <strong>{{ item.elapsedHours }} jam</strong>
                </td>

                <!-- Kolom 6: SLA Status -->
                <td class="col-sla">
                  <div v-if="item.isBreached" class="sla-pill breached">
                    <AlertTriangle :size="13" />
                    <span>Terlewat ({{ Math.abs(item.hoursRemaining || 0) }}j)</span>
                  </div>
                  <div v-else-if="item.hoursRemaining !== null" class="sla-pill on-time">
                    <Clock :size="13" />
                    <span>Sisa {{ item.hoursRemaining }}j</span>
                  </div>
                  <div v-else class="sla-pill neutral">
                    <span>Tanpa Batas Waktu</span>
                  </div>
                </td>

                <!-- Kolom 7: Action -->
                <td class="col-action">
                  <AccessLink :to="`/blockers?ticketId=${item.id}`" class="btn-inspect" title="Buka Tiket di Antrean">
                    <span>Buka</span>
                    <ArrowUpRight :size="14" />
                  </AccessLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.aging-layout {
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
  cursor: pointer;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.heading-side {
  flex-shrink: 0;
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

.eval-pill {
  display: inline-block;
  white-space: nowrap;
  font-size: 11.5px;
  font-weight: 700;
  color: #00674D;
  background: #E6F4EE;
  padding: 4px 10px;
  border-radius: 999px;
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
  padding: 18px 20px;
}

.metric-card.alert-breach { border-left: 4px solid #DC2626; }
.metric-card.alert-critical { border-left: 4px solid #EA580C; }
.metric-card.rate-card { border-left: 4px solid #166534; }

.metric-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
}

.metric-value {
  font-size: 32px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.alert-breach .metric-value { color: #991B1B; }
.alert-critical .metric-value { color: #9A3412; }
.rate-card .metric-value { color: #166534; }

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
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #5C6E68;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 6px 10px 6px 30px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 12.5px;
  background: #fff;
  color: #0E211B;
  box-sizing: border-box;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 12.5px;
  background: #fff;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0E211B;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.aging-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.aging-table th {
  background: #EFF5F2;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 12px;
  color: #5C6E68;
  border-bottom: 1px solid #DCE7E2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.aging-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #DCE7E2;
  vertical-align: middle;
}

.aging-table tr:hover {
  background: #FAFCFB;
}

.row-breached {
  background: #FFFDFD;
}

.ticket-type-row {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.type-pill, .proj-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: #EFF5F2;
  color: #5C6E68;
}

.ticket-title-desc {
  font-weight: 600;
  color: #0E211B;
  line-height: 1.4;
  max-width: 360px;
}

.aging-taxonomy-meta {
  margin-top: 4px;
  font-size: 11.5px;
  color: #5C6E68;
  line-height: 1.35;
}

.user-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.time-sub {
  color: #5C6E68;
  font-size: 11px;
}

.unassigned-text {
  color: #92400E;
  font-style: italic;
  font-size: 12px;
}

.sev-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.sev-badge.critical { background: #FEE2E2; color: #991B1B; }
.sev-badge.high { background: #FFEDD5; color: #9A3412; }
.sev-badge.medium { background: #FEF3C7; color: #92400E; }
.sev-badge.low { background: #EFF5F2; color: #5C6E68; }

.col-desc {
  min-width: 260px;
}

.col-reporter,
.col-owner {
  min-width: 130px;
}

.col-elapsed {
  white-space: nowrap;
}

.sla-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.sla-pill.breached {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.sla-pill.on-time {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.sla-pill.neutral {
  background: #EFF5F2;
  color: #5C6E68;
}

.btn-inspect {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: #E6F4EE;
  color: #00674D;
  font-weight: 700;
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
}

.btn-inspect:hover {
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

.btn-reset-filter {
  margin-top: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #A9C7BC;
  background: #fff;
  color: #00674D;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-reset-filter:hover {
  background: #E6F4EE;
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

.toast-popup.success {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.toast-popup.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

@media (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 12px 64px;
  }

  .page-heading {
    flex-direction: column;
    gap: 10px;
  }

  h1 {
    font-size: 20px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .panel-head {
    padding: 14px 16px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }

  .search-wrap,
  .filter-select {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .table-container {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toast-popup {
    left: 12px;
    right: 12px;
    top: 64px;
  }
}
</style>
