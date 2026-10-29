<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Layers,
  ArrowRight,
} from 'lucide-vue-next';

interface ProjectRiskItem {
  id: string;
  code: string;
  name: string;
  clientName?: string;
  leadName: string;
  activeCommitmentsCount: number;
  openBlockersCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  healthScore: number;
  topBlockerTitle?: string;
}

const loading = ref(false);
const projects = ref<ProjectRiskItem[]>([]);

// Filters
const activeFilter = ref<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');
const searchQuery = ref('');

// Detail Modal
const selectedProject = ref<ProjectRiskItem | null>(null);

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

async function loadProjectRisks() {
  loading.value = true;
  try {
    const res = await apiClient<ProjectRiskItem[]>('/dashboard/projects');
    projects.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat status risiko proyek.', true);
  } finally {
    loading.value = false;
  }
}

// Metrics
const countTotal = computed(() => projects.value.length);
const countLow = computed(() => projects.value.filter((p) => p.riskLevel === 'LOW').length);
const countMedium = computed(() => projects.value.filter((p) => p.riskLevel === 'MEDIUM').length);
const countHigh = computed(() => projects.value.filter((p) => p.riskLevel === 'HIGH').length);
const countCritical = computed(() => projects.value.filter((p) => p.riskLevel === 'CRITICAL').length);

const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    if (activeFilter.value !== 'ALL' && p.riskLevel !== activeFilter.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchLead = p.leadName.toLowerCase().includes(q);
      return matchName || matchCode || matchLead;
    }
    return true;
  });
});

function openDetail(p: ProjectRiskItem) {
  selectedProject.value = p;
}

function closeDetail() {
  selectedProject.value = null;
}

onMounted(() => {
  loadProjectRisks();
});
</script>

<template>
  <div class="risk-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Projects / <strong>Project Risk Radar</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/dashboard" class="btn-topbar">
          <Layers :size="16" />
          <span>Pulse Dashboard</span>
        </AccessLink>
        <AccessLink to="/blockers" class="btn-topbar">
          <AlertTriangle :size="16" />
          <span>Antrean Blocker</span>
        </AccessLink>
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
      <!-- Page Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Pemantauan Risiko Portofolio &amp; Kesehatan Inisiatif</span>
          <h1>Project Risk Radar</h1>
          <p class="subtitle">
            Visualisasi status kesehatan komitmen harian dan eskalasi blocker di setiap inisiatif proyek untuk mengantisipasi hambatan rilis secara dini.
          </p>
        </div>
      </div>

      <!-- 5 Metric Cards (Click to Filter) -->
      <div class="metrics-grid">
        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'ALL' }"
          @click="activeFilter = 'ALL'"
        >
          <div class="metric-header">
            <span class="metric-title">Total Proyek</span>
            <FolderGit2 :size="16" />
          </div>
          <div class="metric-value">{{ countTotal }}</div>
          <div class="metric-note">Portofolio aktif</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'LOW' }"
          @click="activeFilter = 'LOW'"
        >
          <div class="metric-header">
            <span class="metric-title">Normal / Rendah</span>
            <span class="pill green">Sehat</span>
          </div>
          <div class="metric-value text-green">{{ countLow }}</div>
          <div class="metric-note">Risiko terkendali</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'MEDIUM' }"
          @click="activeFilter = 'MEDIUM'"
        >
          <div class="metric-header">
            <span class="metric-title">Waspada / Sedang</span>
            <span class="pill amber">Waspada</span>
          </div>
          <div class="metric-value text-amber">{{ countMedium }}</div>
          <div class="metric-note">Ada blocker terbuka</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'HIGH' }"
          @click="activeFilter = 'HIGH'"
        >
          <div class="metric-header">
            <span class="metric-title">Kritis / Tinggi</span>
            <span class="pill red">Tinggi</span>
          </div>
          <div class="metric-value text-red">{{ countHigh }}</div>
          <div class="metric-note">Membutuhkan PIC khusus</div>
        </button>

        <button
          type="button"
          class="metric-card"
          :class="{ active: activeFilter === 'CRITICAL' }"
          @click="activeFilter = 'CRITICAL'"
        >
          <div class="metric-header">
            <span class="metric-title">Macet Total</span>
            <span class="pill red">Macet</span>
          </div>
          <div class="metric-value text-red">{{ countCritical }}</div>
          <div class="metric-note">SLA terlanggar</div>
        </button>
      </div>

      <!-- Projects Table Panel -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Daftar Portofolio Proyek</h2>
            <p class="panel-subtitle">Evaluasi rasio komitmen selesai terhadap kendala yang aktif di lapangan.</p>
          </div>
          <span class="pill neutral">{{ filteredProjects.length }} Proyek</span>
        </div>

        <div class="list-tools">
          <div class="search-wrap">
            <Search :size="16" class="search-icon" />
            <input
              v-model="searchQuery"
              type="search"
              class="search-input"
              placeholder="Cari kode proyek, nama, atau Lead..."
            />
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <Clock :size="24" class="spin" />
          <p>Memuat status risiko proyek...</p>
        </div>

        <div v-else-if="filteredProjects.length === 0" class="empty-state">
          <FolderGit2 :size="32" />
          <p>Tidak ada proyek yang sesuai filter risiko ini.</p>
        </div>

        <div v-else class="table-wrap">
          <table class="project-table">
            <thead>
              <tr>
                <th scope="col">Inisiatif Proyek</th>
                <th scope="col">Project Lead</th>
                <th scope="col">Komitmen Aktif</th>
                <th scope="col">Blocker Terbuka</th>
                <th scope="col">Health Score &amp; Risiko</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredProjects" :key="p.id">
                <td>
                  <div class="project-title">{{ p.name }}</div>
                  <div class="project-code">#{{ p.code }} {{ p.clientName ? '· ' + p.clientName : '' }}</div>
                </td>
                <td>
                  <div class="lead-name">{{ p.leadName }}</div>
                </td>
                <td>
                  <span class="stat-num">{{ p.activeCommitmentsCount }}</span> tugas harian
                </td>
                <td>
                  <span class="stat-num" :class="{ 'text-red': p.openBlockersCount > 0 }">{{ p.openBlockersCount }}</span> kendala
                </td>
                <td>
                  <div class="risk-cell">
                    <span
                      class="pill"
                      :class="{
                        green: p.riskLevel === 'LOW',
                        amber: p.riskLevel === 'MEDIUM',
                        red: p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL',
                      }"
                    >
                      {{ p.riskLevel }} ({{ p.healthScore }}%)
                    </span>
                  </div>
                </td>
                <td>
                  <button type="button" class="btn btn-secondary btn-sm" @click="openDetail(p)">
                    <span>Rincian</span>
                    <ArrowRight :size="12" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Project Detail Modal -->
      <div v-if="selectedProject" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Rincian Risiko Proyek</h3>
            <button type="button" class="close-btn" @click="closeDetail">
              <X :size="18" />
            </button>
          </div>
          <div class="modal-body">
            <h4 class="modal-title">{{ selectedProject.name }} ({{ selectedProject.code }})</h4>
            <div class="modal-detail-box">
              <div class="detail-row">
                <span>Project Lead:</span>
                <strong>{{ selectedProject.leadName }}</strong>
              </div>
              <div class="detail-row">
                <span>Tingkat Risiko:</span>
                <span
                  class="pill"
                  :class="{
                    green: selectedProject.riskLevel === 'LOW',
                    amber: selectedProject.riskLevel === 'MEDIUM',
                    red: selectedProject.riskLevel === 'HIGH' || selectedProject.riskLevel === 'CRITICAL',
                  }"
                >
                  {{ selectedProject.riskLevel }}
                </span>
              </div>
              <div class="detail-row">
                <span>Skor Kesehatan (Health Score):</span>
                <strong>{{ selectedProject.healthScore }} / 100</strong>
              </div>
              <div class="detail-row">
                <span>Blocker Aktif Saat Ini:</span>
                <strong :class="{ 'text-red': selectedProject.openBlockersCount > 0 }">{{ selectedProject.openBlockersCount }} tiket kendala</strong>
              </div>
            </div>

            <div v-if="selectedProject.topBlockerTitle" class="blocker-warning-box">
              <AlertTriangle :size="16" class="text-red" />
              <div>
                <strong>Kendala Utama:</strong> {{ selectedProject.topBlockerTitle }}
              </div>
            </div>

            <div class="modal-actions">
              <AccessLink to="/blockers" class="btn btn-primary">
                <span>Buka Antrean Blocker Terkait</span>
                <ArrowRight :size="14" />
              </AccessLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.risk-layout {
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
  margin-bottom: 24px;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

@media (max-width: 960px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card.active {
  border-color: var(--color-brand-primary, #00674D);
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-title {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 26px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.text-green { color: #166534; }
.text-amber { color: #D97706; }
.text-red { color: #DC2626; }

.metric-note {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
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

.list-tools {
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 320px;
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

.table-wrap {
  overflow-x: auto;
}

.project-table {
  width: 100%;
  border-collapse: collapse;
}

.project-table th {
  text-align: left;
  padding: 10px 18px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.project-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  vertical-align: middle;
  font-size: 13px;
}

.project-title {
  font-weight: 700;
  font-size: 13.5px;
}

.project-code {
  font-size: 11.5px;
  font-family: monospace;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.lead-name {
  font-weight: 600;
}

.stat-num {
  font-weight: 700;
}

.risk-cell {
  display: flex;
  align-items: center;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: grid;
  place-items: center;
  z-index: 999;
  padding: 16px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 16px 36px rgba(14, 33, 27, 0.16);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 800;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary, #5C6E68);
}

.modal-body {
  padding: 20px;
}

.modal-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
}

.modal-detail-box {
  background: #F8FAF9;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  margin-bottom: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.blocker-warning-box {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12.5px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
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

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border-color: #86EFAC;
}

.pill.amber {
  background: #FEF3C7;
  color: #92400E;
  border-color: #FCD34D;
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

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
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

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
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
