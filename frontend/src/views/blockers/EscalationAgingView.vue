<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ListFilter,
  User,
  ArrowUpRight,
} from 'lucide-vue-next';

interface AgingBlockerItem {
  id: string;
  description: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
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
const toastMessage = ref<string | null>(null);

async function loadAgingMetrics() {
  loading.value = true;
  try {
    const res = await apiClient<AgingMetricsResponse>('/blockers/aging');
    if (res.data) {
      data.value = res.data;
      toastMessage.value = 'Metrik aging eskalasi berhasil diperbarui.';
      setTimeout(() => { toastMessage.value = null; }, 2500);
    }
  } catch (err: any) {
    console.error('Failed to load aging metrics:', err);
  } finally {
    loading.value = false;
  }
}

const filteredBlockers = computed(() => {
  if (!data.value) return [];
  return data.value.blockers.filter((b) => {
    if (severityFilter.value !== 'ALL' && b.severity !== severityFilter.value) return false;
    if (breachOnlyFilter.value && !b.isBreached) return false;
    return true;
  });
});

onMounted(() => {
  loadAgingMetrics();
});
</script>

<template>
  <div class="aging-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Blocker / <strong>Radar Penuaan &amp; Pelanggaran SLA (Prototipe 14)</strong></span>
      </div>
      <div class="topbar-right">
        <button type="button" class="btn-topbar" :disabled="loading" @click="loadAgingMetrics">
          <RefreshCw :size="15" :class="{ spinning: loading }" />
          <span>Segarkan Data</span>
        </button>
        <router-link to="/blockers" class="btn-topbar">
          <ListFilter :size="16" />
          <span>Antrean Tiket</span>
        </router-link>
      </div>
    </header>

    <!-- Toast -->
    <div v-if="toastMessage" class="toast-popup success" role="status">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>

    <main class="main-content">
      <!-- Page Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Pengawasan Eksekutif &amp; Peringatan SLA</span>
          <h1>Keterlambatan Penanganan Blocker</h1>
          <p class="subtitle">
            Pantau radar penuaan kendala aktif, identifikasi hambatan yang melampaui ambang batas waktu SLA, dan dorong intervensi manajerial tepat waktu.
          </p>
        </div>
        <div class="heading-side">
          <span v-if="data?.evaluatedAt" class="eval-pill">
            Evaluasi: {{ new Date(data.evaluatedAt).toLocaleTimeString('id-ID') }} WIB
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
          <div class="metric-label">Terlewat SLA (Breached)</div>
          <div class="metric-value">{{ data?.summary.breachedCount ?? 0 }}</div>
          <div class="metric-sub">Tiket melampaui SLA Level 1 / Level 2</div>
        </div>

        <div class="metric-card alert-critical">
          <div class="metric-label">Prioritas Kritis (Critical)</div>
          <div class="metric-value">{{ data?.summary.criticalCount ?? 0 }}</div>
          <div class="metric-sub">Kendala dengan dampak terhenti total</div>
        </div>

        <div class="metric-card rate-card">
          <div class="metric-label">SLA Compliance Rate</div>
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
              <select v-model="severityFilter" class="filter-select">
                <option value="ALL">Semua Tingkat Keparahan</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <label class="toggle-label">
                <input type="checkbox" v-model="breachOnlyFilter" />
                <span>Hanya Terlewat SLA</span>
              </label>
            </div>
          </div>
        </div>

        <div class="table-container">
          <div v-if="loading && !data" class="loading-state">
            <span>Menghitung radar eskalasi kendala...</span>
          </div>

          <div v-else-if="filteredBlockers.length === 0" class="empty-state">
            <CheckCircle2 :size="36" class="empty-icon" />
            <h3>Tidak Ada Kendala Tertahan</h3>
            <p>Seluruh kendala aktif tertangani dalam batas waktu SLA kebijakan.</p>
          </div>

          <table v-else class="aging-table">
            <thead>
              <tr>
                <th>Kendala &amp; Taksonomi</th>
                <th>Pelapor &amp; Konteks</th>
                <th>Penanggung Jawab</th>
                <th>Tingkat Keparahan</th>
                <th>Umur Kendala</th>
                <th>Status SLA</th>
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
                  <div class="ticket-type-row">
                    <span class="type-pill">{{ item.type }}</span>
                    <span v-if="item.projectCodeReference" class="proj-pill">{{ item.projectCodeReference }}</span>
                  </div>
                  <div class="ticket-title-desc">{{ item.description }}</div>
                </td>

                <!-- Kolom 2: Pelapor -->
                <td class="col-reporter">
                  <div class="user-inline">
                    <User :size="14" />
                    <span>{{ item.raisedBy.fullName }}</span>
                  </div>
                  <small class="time-sub">{{ new Date(item.raisedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) }}</small>
                </td>

                <!-- Kolom 3: PIC -->
                <td class="col-owner">
                  <span v-if="item.assignedOwner">{{ item.assignedOwner.fullName }}</span>
                  <span v-else class="unassigned-text">Belum Di-assign</span>
                </td>

                <!-- Kolom 4: Severity -->
                <td class="col-sev">
                  <span class="sev-badge" :class="item.severity.toLowerCase()">{{ item.severity }}</span>
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
                    <span>N/A</span>
                  </div>
                </td>

                <!-- Kolom 7: Action -->
                <td class="col-action">
                  <router-link to="/blockers" class="btn-inspect" title="Buka Tiket di Antrean">
                    <span>Buka</span>
                    <ArrowUpRight :size="14" />
                  </router-link>
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

.eval-pill {
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
  gap: 14px;
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

.sla-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
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
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

@media (max-width: 900px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
