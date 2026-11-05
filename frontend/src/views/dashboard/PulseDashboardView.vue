<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../api/client';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  HeartHandshake,
} from 'lucide-vue-next';

interface AttentionItem {
  id: string;
  userName: string;
  jobTitle: string;
  function: string;
  projectCode: string | null;
  level: 'RED' | 'AMBER';
  badgeLabel: string;
  description: string;
  supportNote: string;
  actionUrl: string;
  actionLabel: string;
}

interface ProjectOption {
  projectCode: string;
  projectName: string;
}

interface DashboardMetrics {
  totalEmployees: number;
  submittedCount: number;
  noSubmissionCount: number;
  amberCommitmentsCount: number;
  redCommitmentsCount: number;
  unacknowledgedBlockersCount: number;
  completionRatePercent: number;
  isProjectLead?: boolean;
  callerFunction?: string | null;
  ledProjects?: ProjectOption[];
  availableProjects?: ProjectOption[];
  attentionItems?: AttentionItem[];
}

interface SupportFeedItem {
  id: string;
  supporterName: string;
  blockerTitle: string;
  actionTaken: string;
  resultNote: string;
  createdAt: string;
}

const auth = useAuthStore();

type ScopeType = 'team' | 'function' | 'management';

const isDynamicProjectLead = ref(false);

/**
 * Aturan Cakupan Pulse Dashboard PT Dutamedia Mandiri Pratama:
 * - team (Tim Proyek): Hanya untuk Project Lead (siapapun yang memimpin proyek di ProjectAuthorityMapping, atau PROJECT_MANAGER / SUPERVISOR)
 * - function (Divisi Saya): Hanya untuk Kepala Divisi (HEAD)
 * - management (Seluruh Perusahaan): Hanya untuk CEO (CEO_MANAGEMENT), SYSTEM_ADMIN, HRGA — dilengkapi filter per Divisi
 */
const allowedScopes = computed<ScopeType[]>(() => {
  const role = auth.user?.role;
  if (!role) {
    return ['team', 'function', 'management'];
  }

  const scopes: ScopeType[] = [];

  const isLead =
    isDynamicProjectLead.value ||
    role === 'PROJECT_MANAGER' ||
    role === 'SUPERVISOR';

  if (isLead) {
    scopes.push('team');
  }

  if (role === 'HEAD') {
    scopes.push('function');
  }

  if (['CEO_MANAGEMENT', 'SYSTEM_ADMIN', 'HRGA'].includes(role)) {
    scopes.push('management');
  }

  return scopes.length > 0 ? scopes : ['team'];
});

function getDefaultScope(role?: string | null): ScopeType {
  if (role === 'HEAD') return 'function';
  if (role === 'CEO_MANAGEMENT' || role === 'SYSTEM_ADMIN' || role === 'HRGA') return 'management';
  return 'team';
}

const loading = ref(false);
const activeScope = ref<ScopeType>(getDefaultScope(auth.user?.role));
const selectedDivision = ref('ALL');
const selectedProject = ref('ALL');
const selectedPeriod = ref('today');

const divisionOptions = [
  { value: 'ALL', label: 'Semua Divisi Perusahaan' },
  { value: 'ENGINEERING', label: 'Divisi Engineering' },
  { value: 'DELIVERY', label: 'Divisi Delivery' },
  { value: 'OPERATIONS_INFRA', label: 'Divisi Operations & Infrastructure' },
  { value: 'COMMERCIAL', label: 'Divisi Commercial & Sales Enablement' },
  { value: 'FINANCE', label: 'Divisi Finance' },
  { value: 'HRGA', label: 'Divisi HRGA & Legal' },
  { value: 'RND_ADVISORY', label: 'R&D & Technical Advisory' },
];

// Sinkronkan activeScope jika penugasan / role berubah
watch(
  () => auth.user?.role,
  (newRole) => {
    if (!allowedScopes.value.includes(activeScope.value)) {
      activeScope.value = getDefaultScope(newRole);
      loadDashboardData();
    }
  },
);

const metrics = ref<DashboardMetrics>({
  totalEmployees: 0,
  submittedCount: 0,
  noSubmissionCount: 0,
  amberCommitmentsCount: 0,
  redCommitmentsCount: 0,
  unacknowledgedBlockersCount: 0,
  completionRatePercent: 0,
  availableProjects: [
    { projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing' },
    { projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync' },
    { projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android' },
  ],
  attentionItems: [],
});

const projectFilterOptions = computed<ProjectOption[]>(() => {
  if (
    activeScope.value === 'team' &&
    metrics.value.ledProjects &&
    metrics.value.ledProjects.length > 0
  ) {
    return metrics.value.ledProjects;
  }
  return (
    metrics.value.availableProjects || [
      { projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing' },
      { projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync' },
      { projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android' },
    ]
  );
});

const feedItems = ref<SupportFeedItem[]>([]);

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

async function loadDashboardData() {
  loading.value = true;
  try {
    const query = new URLSearchParams({
      scope: activeScope.value,
    });
    if (activeScope.value === 'management' && selectedDivision.value !== 'ALL') {
      query.set('function', selectedDivision.value);
    }
    if (selectedProject.value !== 'ALL') {
      query.set('projectCode', selectedProject.value);
    }

    const [metricRes, feedRes] = await Promise.all([
      apiClient<any>(`/dashboard/metrics?${query.toString()}`),
      apiClient<SupportFeedItem[]>('/dashboard/feed'),
    ]);
    if (metricRes?.data) {
      const d = metricRes.data;
      const totalEmp = d.totalEmployees ?? 0;
      const submitted = d.submittedCount ?? d.checkedInCount ?? 0;
      const noSub = d.noSubmissionCount ?? Math.max(0, totalEmp - submitted);
      const amber = d.amberCommitmentsCount ?? d.commitments?.amberCount ?? 0;
      const red = d.redCommitmentsCount ?? d.commitments?.redCount ?? 0;
      const unack = d.unacknowledgedBlockersCount ?? d.blockers?.totalOpen ?? 0;
      const rate = d.completionRatePercent ?? d.participationRate ?? 0;

      if (typeof d.isProjectLead === 'boolean') {
        isDynamicProjectLead.value = d.isProjectLead;
      }

      metrics.value = {
        ...d,
        totalEmployees: totalEmp,
        submittedCount: submitted,
        noSubmissionCount: noSub,
        amberCommitmentsCount: amber,
        redCommitmentsCount: red,
        unacknowledgedBlockersCount: unack,
        completionRatePercent: rate,
        availableProjects: d.availableProjects || metrics.value.availableProjects,
        attentionItems: Array.isArray(d.attentionItems) ? d.attentionItems : [],
      };
    }

    const feedData = feedRes?.data || feedRes;
    if (Array.isArray(feedData)) feedItems.value = feedData;
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat metrik dashboard.', true);
  } finally {
    loading.value = false;
  }
}

function handleScopeChange(scope: 'team' | 'function' | 'management') {
  activeScope.value = scope;
  loadDashboardData();
}

const scopeTitle = computed(() => {
  if (activeScope.value === 'team') return 'Team Pulse (Tim Proyek)';
  if (activeScope.value === 'function') return 'Function Pulse (Divisi Saya)';
  return 'Management Pulse (Seluruh Perusahaan)';
});

const scopeBadgeLabel = computed(() => {
  if (activeScope.value === 'team') return 'TIM PROYEK';
  if (activeScope.value === 'function') return 'DIVISI SAYA';
  return 'SELURUH PERUSAHAAN';
});

const scopeSubtitle = computed(() => {
  if (activeScope.value === 'team') {
    return 'Ringkasan status kerja, komitmen harian, dan kendala (blocker) personel yang tergabung dalam proyek yang Anda pimpin.';
  }
  if (activeScope.value === 'function') {
    return 'Tinjauan operasional seluruh anggota di divisi Anda, kepatuhan komitmen harian, serta eskalasi hambatan kerja.';
  }
  return 'Laporan eksekutif kesehatan organisasi menyeluruh lintas divisi, tingkat kepatuhan harian, dan radar risiko proyek.';
});

function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="dashboard-layout">
    <!-- Topbar -->
    <TopBar breadcrumb="Management / Pulse Dashboard" />

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
      <!-- Page Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Dashboard Operasional &amp; Radar Eskalasi</span>
          <h1>{{ scopeTitle }}</h1>
          <p class="subtitle">{{ scopeSubtitle }}</p>
        </div>
        <div class="scope-pill-box">
          <div class="scope-icon-wrap">
            <Users :size="16" />
          </div>
          <div>
            <div class="scope-label">Lingkup Aktif</div>
            <strong class="scope-name" data-testid="active-scope-badge">{{ scopeBadgeLabel }}</strong>
          </div>
        </div>
      </div>

      <!-- Scope Switcher & Filter Bar -->
      <div class="scope-bar">
        <div v-if="allowedScopes.length > 1" class="scope-tabs" role="tablist">
          <button
            v-if="allowedScopes.includes('team')"
            type="button"
            class="scope-tab"
            :class="{ active: activeScope === 'team' }"
            @click="handleScopeChange('team')"
          >
            <span>Tim (Proyek)</span>
            <span class="badge">Project Lead</span>
          </button>
          <button
            v-if="allowedScopes.includes('function')"
            type="button"
            class="scope-tab"
            :class="{ active: activeScope === 'function' }"
            @click="handleScopeChange('function')"
          >
            <span>Divisi Saya</span>
            <span class="badge">Head Divisi</span>
          </button>
          <button
            v-if="allowedScopes.includes('management')"
            type="button"
            class="scope-tab"
            :class="{ active: activeScope === 'management' }"
            @click="handleScopeChange('management')"
          >
            <span>Seluruh Perusahaan</span>
            <span class="badge">CEO / Direksi</span>
          </button>
        </div>

        <div class="filter-tools">
          <!-- Filter Divisi khusus pada cakupan Seluruh Perusahaan (CEO) -->
          <select
            v-if="activeScope === 'management'"
            v-model="selectedDivision"
            class="filter-select"
            data-testid="filter-division-select"
            @change="loadDashboardData"
          >
            <option v-for="div in divisionOptions" :key="div.value" :value="div.value">
              {{ div.label }}
            </option>
          </select>

          <!-- Filter Proyek -->
          <select
            v-model="selectedProject"
            class="filter-select"
            data-testid="filter-project-select"
            @change="loadDashboardData"
          >
            <option value="ALL">Semua Proyek &amp; Inisiatif</option>
            <option
              v-for="prj in projectFilterOptions"
              :key="prj.projectCode"
              :value="prj.projectCode"
            >
              [{{ prj.projectCode }}] {{ prj.projectName }}
            </option>
          </select>

          <select v-model="selectedPeriod" class="filter-select">
            <option value="today">Hari Ini</option>
            <option value="yesterday">Kemarin</option>
            <option value="week">Pekan Ini</option>
          </select>
        </div>
      </div>

      <!-- 4 Exception-First Metric Cards -->
      <div class="metrics-grid">
        <!-- 1. Belum Mengisi Komitmen -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Belum Mengisi Komitmen</span>
            <span class="pill neutral">Perlu Diingatkan</span>
          </div>
          <div class="metric-val-wrap">
            <span class="metric-val">{{ metrics.noSubmissionCount }}</span>
            <span class="metric-unit">Orang</span>
          </div>
          <div class="metric-footer">
            <span>Partisipasi: {{ metrics.submittedCount }}/{{ metrics.totalEmployees }} ({{ metrics.completionRatePercent }}%)</span>
          </div>
        </div>

        <!-- 2. Komitmen Status Amber -->
        <div class="metric-card caution">
          <div class="metric-header">
            <span class="metric-label">Komitmen Waspada (Amber)</span>
            <span class="pill amber">Perlu Pantauan</span>
          </div>
          <div class="metric-val-wrap">
            <span class="metric-val text-amber">{{ metrics.amberCommitmentsCount }}</span>
            <span class="metric-unit">Tugas</span>
          </div>
          <div class="metric-footer">
            <span>Tugas berisiko terhambat</span>
          </div>
        </div>

        <!-- 3. Komitmen Status Merah -->
        <div class="metric-card alert">
          <div class="metric-header">
            <span class="metric-label">Komitmen Kritis (Merah)</span>
            <span class="pill red">Kritis</span>
          </div>
          <div class="metric-val-wrap">
            <span class="metric-val text-red">{{ metrics.redCommitmentsCount }}</span>
            <span class="metric-unit">Tugas Macet</span>
          </div>
          <div class="metric-footer">
            <span>Membutuhkan intervensi segera</span>
          </div>
        </div>

        <!-- 4. Blocker Belum Direspon -->
        <div class="metric-card blocker">
          <div class="metric-header">
            <span class="metric-label">Blocker Belum Direspon</span>
            <span class="pill red">SLA Menipis</span>
          </div>
          <div class="metric-val-wrap">
            <span class="metric-val text-red">{{ metrics.unacknowledgedBlockersCount }}</span>
            <span class="metric-unit">Blocker</span>
          </div>
          <div class="metric-footer">
            <AccessLink to="/blockers" class="link-footer">
              <span>Buka Antrean Blocker</span>
              <ArrowRight :size="13" />
            </AccessLink>
          </div>
        </div>
      </div>

      <!-- 2-Column Action & Feed Layout -->
      <div class="content-grid">
        <!-- Kolom Kiri: Action Needed (Dinamis dari Data Nyata) -->
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Personil Butuh Bantuan Hari Ini</h2>
              <p class="panel-subtitle">Daftar anggota yang mengalami kendala teknis atau komitmen yang memerlukan eskalasi.</p>
            </div>
          </div>
          <div class="panel-body">
            <div
              v-if="!metrics.attentionItems || metrics.attentionItems.length === 0"
              class="empty-feed"
              data-testid="empty-attention-items"
            >
              <CheckCircle2 :size="32" class="empty-icon" />
              <p>Seluruh personel dalam lingkup ini berjalan terkendali hari ini (Tidak ada komitmen Amber/Merah).</p>
            </div>
            <div v-else class="action-items-list">
              <div
                v-for="item in metrics.attentionItems"
                :key="item.id"
                class="action-item"
                :class="item.level === 'RED' ? 'alert' : 'warn'"
              >
                <div class="item-icon-wrap" :class="item.level === 'RED' ? 'red' : 'amber'">
                  <AlertCircle v-if="item.level === 'RED'" :size="18" />
                  <Clock v-else :size="18" />
                </div>
                <div class="item-info">
                  <div class="item-title">{{ item.userName }} · {{ item.jobTitle }}</div>
                  <div class="item-desc">{{ item.description }}</div>
                  <div class="item-meta">
                    <span class="pill" :class="item.level === 'RED' ? 'red' : 'amber'">
                      {{ item.badgeLabel }}
                    </span>
                    <span v-if="item.projectCode" class="pill neutral">
                      Proyek: {{ item.projectCode }}
                    </span>
                    <span>{{ item.supportNote }}</span>
                  </div>
                </div>
                <AccessLink :to="item.actionUrl" class="btn btn-secondary btn-sm">
                  {{ item.actionLabel }}
                </AccessLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Kolom Kanan: Feed Bantuan Lintas Fungsi -->
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Feed Dukungan Lintas Fungsi</h2>
              <p class="panel-subtitle">Jejak kontribusi bantuan rekan tim dalam menyelesaikan hambatan bersama.</p>
            </div>
          </div>
          <div class="panel-body">
            <div v-if="feedItems.length === 0" class="empty-feed">
              <HeartHandshake :size="32" class="empty-icon" />
              <p>Belum ada kontribusi bantuan yang dicatat hari ini.</p>
            </div>

            <div v-else class="feed-list">
              <div v-for="item in feedItems" :key="item.id" class="feed-item">
                <div class="feed-icon-wrap">
                  <HeartHandshake :size="16" />
                </div>
                <div class="feed-content">
                  <div class="feed-header">
                    <strong>{{ item.supporterName }}</strong>
                    <span class="feed-time">{{ formatRelativeTime(item.createdAt) }}</span>
                  </div>
                  <div class="feed-blocker-title">Membantu: {{ item.blockerTitle }}</div>
                  <p class="feed-action">{{ item.actionTaken }}</p>
                  <div class="feed-result">Hasil: {{ item.resultNote }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
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
  margin-left: 8px;
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
  margin-bottom: 20px;
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
  max-width: 760px;
}

.scope-pill-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  padding: 8px 14px;
}

.scope-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #E6F4EE;
  color: #00674D;
  display: grid;
  place-items: center;
}

.scope-label {
  font-size: 11px;
  color: var(--color-text-secondary, #5C6E68);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.scope-name {
  font-size: 13px;
}

.scope-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 12px;
}

.scope-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scope-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.scope-tab.active {
  background: #E6F4EE;
  color: #00674D;
  border-color: #86EFAC;
}

.scope-tab .badge {
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #DCE7E2;
}

.scope-tab.active .badge {
  background: #00674D;
  color: #FFFFFF;
}

.filter-tools {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 6px 34px 6px 12px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 6px;
  font-size: 12.5px;
  background-color: #FFFFFF;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235C6E68' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px 14px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
}

.metric-card.caution {
  border-left: 4px solid #D97706;
}

.metric-card.alert {
  border-left: 4px solid #DC2626;
}

.metric-card.blocker {
  border-left: 4px solid #EA580C;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.metric-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
}

.metric-val-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 10px 0 6px;
}

.metric-val {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.metric-unit {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.text-amber { color: #D97706; }
.text-red { color: #DC2626; }

.metric-footer {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
}

.link-footer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #00674D;
  font-weight: 700;
  text-decoration: none;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .content-grid {
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
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.panel-head h2 {
  font-size: 15.5px;
  font-weight: 800;
}

.panel-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.panel-body {
  padding: 16px 20px;
}

.action-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  background: #F8FAF9;
}

.action-item.alert {
  border-left: 3.5px solid #DC2626;
}

.action-item.warn {
  border-left: 3.5px solid #D97706;
}

.item-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.item-icon-wrap.red { background: #FEE2E2; color: #991B1B; }
.item-icon-wrap.amber { background: #FEF3C7; color: #92400E; }

.item-info {
  flex: 1;
}

.item-title {
  font-size: 13.5px;
  font-weight: 750;
}

.item-desc {
  font-size: 12.5px;
  color: #3F524A;
  margin: 3px 0;
}

.item-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-item {
  display: flex;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBF1EE;
}

.feed-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.feed-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E6F4EE;
  color: #00674D;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.feed-content {
  flex: 1;
  font-size: 12.5px;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.feed-time {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.feed-blocker-title {
  font-weight: 600;
  color: #00674D;
  margin-bottom: 3px;
}

.feed-action {
  margin: 0;
  color: var(--color-text-primary, #0E211B);
}

.feed-result {
  font-size: 11.5px;
  color: #5C6E68;
  margin-top: 2px;
  font-style: italic;
}

.empty-feed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12.5px;
  gap: 8px;
  text-align: center;
}

.empty-icon {
  color: #A9C7BC;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.pill.red { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
.pill.amber { background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
.pill.neutral { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  background: #FFFFFF;
  text-decoration: none;
  color: inherit;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 11.5px;
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
</style>
