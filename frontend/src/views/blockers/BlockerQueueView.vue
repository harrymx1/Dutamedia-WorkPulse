<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Check,
  User,
  HeartHandshake,
  CheckSquare,
  ShieldAlert,
  ChevronRight,
} from 'lucide-vue-next';

interface BlockerTicketItem {
  id: string;
  description: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
  raisedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  targetResolutionAt?: string;
  ownerNeededType: string;
  projectCodeReference?: string;
  resolutionNote?: string;
  raisedBy: { id: string; fullName: string; email: string };
  assignedOwner?: { id: string; fullName: string; email: string };
  supportContributions?: Array<{
    id: string;
    supporter: { id: string; fullName: string; email: string };
    actionTaken: string;
    resultNote: string;
    createdAt: string;
  }>;
}

// State
const loading = ref(false);
const blockers = ref<BlockerTicketItem[]>([]);
const selectedTicket = ref<BlockerTicketItem | null>(null);

// Filters
const statusFilter = ref<string>('ALL');
const mineFilter = ref<string>('ALL');
const typeFilter = ref<string>('ALL');

// Modals
const isSupportModalOpen = ref(false);
const supportAction = ref('');
const supportResult = ref('');
const submittingSupport = ref(false);

const isResolveModalOpen = ref(false);
const resolutionNote = ref('');
const submittingResolve = ref(false);

const acknowledging = ref(false);

// Toast & Feedback
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

async function loadBlockers() {
  loading.value = true;
  try {
    let url = '/blockers?';
    if (statusFilter.value !== 'ALL') url += `status=${statusFilter.value}&`;
    if (mineFilter.value !== 'ALL') url += `mine=${mineFilter.value}&`;

    const res = await apiClient<BlockerTicketItem[]>(url);
    if (res.data) {
      blockers.value = res.data;
      if (blockers.value.length > 0 && !selectedTicket.value) {
        selectedTicket.value = blockers.value[0];
      } else if (selectedTicket.value) {
        // Refresh selected ticket in place
        const updated = blockers.value.find((b) => b.id === selectedTicket.value?.id);
        if (updated) selectedTicket.value = updated;
      }
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat antrean tiket kendala.', true);
  } finally {
    loading.value = false;
  }
}

// Metrics
const criticalCount = computed(() => blockers.value.filter((b) => b.severity === 'CRITICAL' && b.status !== 'RESOLVED').length);
const pendingAckCount = computed(() => blockers.value.filter((b) => b.status === 'OPEN').length);
const totalActiveCount = computed(() => blockers.value.filter((b) => b.status !== 'RESOLVED').length);

const filteredBlockers = computed(() => {
  return blockers.value.filter((b) => {
    if (typeFilter.value !== 'ALL' && b.type !== typeFilter.value) return false;
    return true;
  });
});

function selectTicket(ticket: BlockerTicketItem) {
  selectedTicket.value = ticket;
}

// Acknowledge Action
async function handleAcknowledge(ticketId: string) {
  acknowledging.value = true;
  try {
    await apiClient(`/blockers/${ticketId}/acknowledge`, { method: 'POST' });
    showToast('Tiket kendala berhasil di-acknowledge.');
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal acknowledge tiket.', true);
  } finally {
    acknowledging.value = false;
  }
}

// Support Contribution Action
function openSupportModal() {
  supportAction.value = '';
  supportResult.value = '';
  isSupportModalOpen.value = true;
}

async function submitSupportContribution() {
  if (!selectedTicket.value) return;
  if (supportAction.value.trim().length < 5) {
    showToast('Tindakan bantuan minimal 5 karakter.', true);
    return;
  }
  if (supportResult.value.trim().length < 5) {
    showToast('Hasil / progres bantuan minimal 5 karakter.', true);
    return;
  }

  submittingSupport.value = true;
  try {
    await apiClient(`/blockers/${selectedTicket.value.id}/support`, {
      method: 'POST',
      body: JSON.stringify({
        actionTaken: supportAction.value.trim(),
        resultNote: supportResult.value.trim(),
      }),
    });
    isSupportModalOpen.value = false;
    showToast('Kontribusi bantuan berhasil dicatat.');
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menambahkan bantuan.', true);
  } finally {
    submittingSupport.value = false;
  }
}

// Resolve Action
function openResolveModal() {
  resolutionNote.value = '';
  isResolveModalOpen.value = true;
}

async function submitResolve() {
  if (!selectedTicket.value) return;
  if (resolutionNote.value.trim().length < 10) {
    showToast('Catatan resolusi wajib diisi minimal 10 karakter.', true);
    return;
  }

  submittingResolve.value = true;
  try {
    await apiClient(`/blockers/${selectedTicket.value.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        resolutionNote: resolutionNote.value.trim(),
      }),
    });
    isResolveModalOpen.value = false;
    showToast('Tiket kendala berhasil diselesaikan (RESOLVED).');
    await loadBlockers();
  } catch (err: any) {
    showToast(err.message || 'Gagal menyelesaikan tiket.', true);
  } finally {
    submittingResolve.value = false;
  }
}

function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

function isSlaBreached(targetStr?: string) {
  if (!targetStr) return false;
  return new Date() > new Date(targetStr);
}

onMounted(() => {
  loadBlockers();
});
</script>

<template>
  <div class="queue-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Blocker / <strong>Antrean &amp; Resolusi Kendala (Prototipe 09)</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/blockers/aging" class="btn-topbar">
          <Clock :size="16" />
          <span>Aging Radar</span>
        </AccessLink>
        <AccessLink to="/blockers/raise" class="btn-topbar-primary">
          <Plus :size="16" />
          <span>Laporkan Blocker</span>
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
      <!-- Page Heading & Metric Summary Cards -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Manajemen Kendala, Eskalasi &amp; Dukungan Lintas Fungsi</span>
          <h1>Antrean Eskalasi Blocker</h1>
          <p class="subtitle">
            Pantau seluruh kendala aktif, berikan respons awal (Acknowledge), salurkan bantuan (Support), dan catat resolusi sebelum melewati batas waktu SLA.
          </p>
        </div>
      </div>

      <!-- Top 3 Exception Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card alert-rose">
          <div class="metric-top">
            <span class="metric-label">Kritis Belum Selesai</span>
            <ShieldAlert :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ criticalCount }}</div>
          <div class="metric-sub">Tiket skala Critical aktif membutuhkan mitigasi darurat</div>
        </div>

        <div class="metric-card alert-amber">
          <div class="metric-top">
            <span class="metric-label">Menunggu Acknowledge</span>
            <Clock :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ pendingAckCount }}</div>
          <div class="metric-sub">Tiket status OPEN belum direspons oleh PIC terkait</div>
        </div>

        <div class="metric-card alert-blue">
          <div class="metric-top">
            <span class="metric-label">Total Kendala Aktif</span>
            <AlertTriangle :size="20" class="metric-icon" />
          </div>
          <div class="metric-value">{{ totalActiveCount }}</div>
          <div class="metric-sub">Tiket dalam penanganan (OPEN, ACKNOWLEDGED, IN_PROGRESS)</div>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="toolbar">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter" @change="loadBlockers">
            <option value="ALL">Semua Status</option>
            <option value="OPEN">Terbuka (OPEN)</option>
            <option value="ACKNOWLEDGED">Diterima (ACKNOWLEDGED)</option>
            <option value="RESOLVED">Selesai (RESOLVED)</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Kepemilikan:</label>
          <select v-model="mineFilter" @change="loadBlockers">
            <option value="ALL">Semua Tiket</option>
            <option value="assigned">Ditugaskan ke Saya</option>
            <option value="raised">Dilaporkan oleh Saya</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Kategori:</label>
          <select v-model="typeFilter">
            <option value="ALL">Semua Kategori</option>
            <option value="TECHNICAL">Technical</option>
            <option value="REQUIREMENT">Requirement</option>
            <option value="INFRA">Infra</option>
            <option value="APPROVAL">Approval</option>
            <option value="CLIENT">Client</option>
            <option value="VENDOR">Vendor</option>
            <option value="RESOURCE">Resource</option>
          </select>
        </div>

        <div class="toolbar-spacer"></div>

        <AccessLink to="/blockers/raise" class="btn-create">
          <Plus :size="16" />
          <span>Laporkan Blocker Baru</span>
        </AccessLink>
      </div>

      <!-- Main Queue 2-Column Split -->
      <div class="queue-split">
        <!-- Kolom Kiri: Daftar Tiket -->
        <div class="ticket-list-col">
          <div v-if="loading" class="empty-state">
            <span>Memuat antrean kendala...</span>
          </div>
          <div v-else-if="filteredBlockers.length === 0" class="empty-state">
            <CheckCircle2 :size="32" class="empty-icon" />
            <p>Tidak ada tiket kendala yang cocok dengan filter saat ini.</p>
          </div>

          <div
            v-for="ticket in filteredBlockers"
            :key="ticket.id"
            class="ticket-card"
            :class="{
              selected: selectedTicket?.id === ticket.id,
              'sla-breached': isSlaBreached(ticket.targetResolutionAt) && ticket.status !== 'RESOLVED'
            }"
            @click="selectTicket(ticket)"
          >
            <!-- Baris 1: Severity, Kategori, Status & SLA Indicator -->
            <div class="ticket-row-1">
              <div class="badge-cluster">
                <span class="sev-badge" :class="ticket.severity.toLowerCase()">{{ ticket.severity }}</span>
                <span class="type-pill">{{ ticket.type }}</span>
                <span v-if="ticket.projectCodeReference" class="proj-pill">{{ ticket.projectCodeReference }}</span>
              </div>
              <div class="status-wrap">
                <span
                  v-if="ticket.status !== 'RESOLVED' && isSlaBreached(ticket.targetResolutionAt)"
                  class="sla-breach-badge"
                >
                  TERLEWAT SLA
                </span>
                <span class="status-badge" :class="ticket.status.toLowerCase()">{{ ticket.status }}</span>
              </div>
            </div>

            <!-- Baris 2: Deskripsi Ringkas -->
            <div class="ticket-row-2">
              <p class="ticket-desc">{{ ticket.description }}</p>
            </div>

            <!-- Baris 3: Pelapor, PIC & Support Counter -->
            <div class="ticket-row-3">
              <div class="ticket-meta">
                <span class="meta-item"><User :size="13" /> {{ ticket.raisedBy.fullName }}</span>
                <span class="meta-sep">·</span>
                <span class="meta-time">{{ formatRelativeTime(ticket.raisedAt) }}</span>
              </div>
              <div class="ticket-side-info">
                <span v-if="ticket.supportContributions && ticket.supportContributions.length > 0" class="support-count">
                  <HeartHandshake :size="13" /> {{ ticket.supportContributions.length }} Bantuan
                </span>
                <ChevronRight :size="16" class="arrow-icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Detail & Aksi Tiket Terpilih -->
        <div class="ticket-detail-col">
          <div v-if="!selectedTicket" class="detail-empty">
            <p>Pilih tiket kendala di kolom sebelah kiri untuk melihat detail dan tindakan.</p>
          </div>

          <div v-else class="detail-card">
            <!-- Header Detail -->
            <div class="detail-head">
              <div>
                <span class="ticket-id">Tiket #{{ selectedTicket.id.substring(0, 8) }}</span>
                <div class="detail-badges">
                  <span class="sev-badge" :class="selectedTicket.severity.toLowerCase()">{{ selectedTicket.severity }}</span>
                  <span class="type-pill">{{ selectedTicket.type }}</span>
                  <span class="status-badge" :class="selectedTicket.status.toLowerCase()">{{ selectedTicket.status }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="detail-actions">
                <button
                  v-if="selectedTicket.status === 'OPEN'"
                  type="button"
                  class="btn-action ack"
                  :disabled="acknowledging"
                  @click="handleAcknowledge(selectedTicket.id)"
                >
                  <CheckSquare :size="15" />
                  <span>{{ acknowledging ? 'Memproses...' : 'Acknowledge' }}</span>
                </button>

                <button
                  v-if="selectedTicket.status !== 'RESOLVED'"
                  type="button"
                  class="btn-action support"
                  @click="openSupportModal"
                >
                  <HeartHandshake :size="15" />
                  <span>Beri Bantuan</span>
                </button>

                <button
                  v-if="selectedTicket.status !== 'RESOLVED'"
                  type="button"
                  class="btn-action resolve"
                  @click="openResolveModal"
                >
                  <Check :size="15" />
                  <span>Selesaikan</span>
                </button>
              </div>
            </div>

            <!-- Body Detail -->
            <div class="detail-body">
              <div class="info-block">
                <label>Fakta &amp; Deskripsi Kendala</label>
                <div class="desc-content">{{ selectedTicket.description }}</div>
              </div>

              <div class="info-grid-2">
                <div class="info-block">
                  <label>Pelapor</label>
                  <div class="user-item">
                    <User :size="16" />
                    <div>
                      <strong>{{ selectedTicket.raisedBy.fullName }}</strong>
                      <small>{{ selectedTicket.raisedBy.email }}</small>
                    </div>
                  </div>
                </div>

                <div class="info-block">
                  <label>Penanggung Jawab Awal (PIC)</label>
                  <div class="user-item">
                    <User :size="16" />
                    <div>
                      <strong>{{ selectedTicket.assignedOwner ? selectedTicket.assignedOwner.fullName : 'Otomatis Sistem' }}</strong>
                      <small>{{ selectedTicket.assignedOwner ? selectedTicket.assignedOwner.email : 'Sesuai Pemetaan Otoritas' }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-grid-2">
                <div class="info-block">
                  <label>Konteks Kewenangan</label>
                  <div class="context-val">
                    <strong>{{ selectedTicket.ownerNeededType }}</strong>
                    <span v-if="selectedTicket.projectCodeReference"> — Proyek {{ selectedTicket.projectCodeReference }}</span>
                  </div>
                </div>

                <div class="info-block">
                  <label>Target SLA Resolusi</label>
                  <div class="context-val">
                    <Clock :size="14" />
                    <span>{{ selectedTicket.targetResolutionAt ? new Date(selectedTicket.targetResolutionAt).toLocaleString('id-ID') : 'Tidak ditentukan' }}</span>
                  </div>
                </div>
              </div>

              <!-- Hasil Resolusi Jika Sudah Selesai -->
              <div v-if="selectedTicket.status === 'RESOLVED' && selectedTicket.resolutionNote" class="resolution-box">
                <div class="res-head">
                  <CheckCircle2 :size="18" />
                  <strong>Catatan Resolusi Akhir</strong>
                </div>
                <p>{{ selectedTicket.resolutionNote }}</p>
              </div>

              <!-- Support Contributions Feed -->
              <div class="support-section">
                <div class="sec-head">
                  <HeartHandshake :size="18" />
                  <h3>Riwayat Kontribusi Bantuan ({{ selectedTicket.supportContributions?.length || 0 }})</h3>
                </div>

                <div v-if="!selectedTicket.supportContributions || selectedTicket.supportContributions.length === 0" class="no-support">
                  Belum ada bantuan tercatat untuk tiket ini. Klik "Beri Bantuan" untuk mencatat kontribusi peer-support.
                </div>

                <div v-else class="support-list">
                  <div v-for="sup in selectedTicket.supportContributions" :key="sup.id" class="support-item">
                    <div class="sup-meta">
                      <strong>{{ sup.supporter.fullName }}</strong>
                      <span>{{ new Date(sup.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB</span>
                    </div>
                    <div class="sup-action"><strong>Tindakan:</strong> {{ sup.actionTaken }}</div>
                    <div class="sup-result"><strong>Hasil / Solusi:</strong> {{ sup.resultNote }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Support Contribution -->
    <div v-if="isSupportModalOpen" class="modal-backdrop" @click.self="isSupportModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Salurkan Kontribusi Bantuan (Peer Support)</h3>
          <button type="button" class="btn-close" @click="isSupportModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Catat bantuan konkret yang telah Anda berikan untuk mengurai kendala rekan kerja.
          </p>
          <div class="form-group">
            <label>Aksi Bantuan yang Diberikan <span class="req">*</span></label>
            <input
              v-model="supportAction"
              type="text"
              placeholder="Contoh: Mengirimkan kredensial staging baru via secret manager..."
            />
          </div>
          <div class="form-group">
            <label>Hasil / Progres yang Dicapai <span class="req">*</span></label>
            <textarea
              v-model="supportResult"
              rows="3"
              placeholder="Contoh: Koneksi API sandbox telah terverifikasi normal kembali..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isSupportModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingSupport"
            @click="submitSupportContribution"
          >
            {{ submittingSupport ? 'Menyimpan...' : 'Simpan Kontribusi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Resolve Blocker -->
    <div v-if="isResolveModalOpen" class="modal-backdrop" @click.self="isResolveModalOpen = false">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Selesaikan Kendala (Resolve Blocker)</h3>
          <button type="button" class="btn-close" @click="isResolveModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">
            Catat fakta solusi yang diterapkan agar menjadi referensi pengetahuan bagi tim.
          </p>
          <div class="form-group">
            <label>Catatan Resolusi / Tindakan Perbaikan <span class="req">*</span></label>
            <textarea
              v-model="resolutionNote"
              rows="4"
              minlength="10"
              placeholder="Jelaskan langkah konkret penyelesaian masalah ini (min. 10 karakter)..."
            ></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-secondary" @click="isResolveModalOpen = false">Batal</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="submittingResolve"
            @click="submitResolve"
          >
            {{ submittingResolve ? 'Menyelesaikan...' : 'Tandai Selesai' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue-layout {
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

.btn-topbar-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

.page-heading {
  margin-bottom: 20px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 16px 20px;
}

.metric-card.alert-rose { border-left: 4px solid #DC2626; }
.metric-card.alert-amber { border-left: 4px solid #D97706; }
.metric-card.alert-blue { border-left: 4px solid #2563EB; }

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
}

.metric-value {
  font-size: 28px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.alert-rose .metric-value { color: #991B1B; }
.alert-amber .metric-value { color: #92400E; }
.alert-blue .metric-value { color: #075985; }

.metric-sub {
  font-size: 11.5px;
  color: #66736E;
}

.toolbar {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 12.5px;
  background: #fff;
}

.toolbar-spacer {
  flex: 1;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  background: #00674D;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.queue-split {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 20px;
}

.ticket-list-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding-right: 4px;
}

.ticket-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ticket-card:hover {
  border-color: #A9C7BC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ticket-card.selected {
  border-color: #00674D;
  background: #FAFCFB;
  box-shadow: 0 0 0 1px #00674D;
}

.ticket-card.sla-breached {
  border-left: 4px solid #DC2626;
}

.ticket-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.badge-cluster {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.sev-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.sev-badge.critical { background: #FEE2E2; color: #991B1B; }
.sev-badge.high { background: #FFEDD5; color: #9A3412; }
.sev-badge.medium { background: #FEF3C7; color: #92400E; }
.sev-badge.low { background: #EFF5F2; color: #5C6E68; }

.type-pill, .proj-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #EFF5F2;
  color: #5C6E68;
}

.status-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-badge.open { background: #FEF3C7; color: #92400E; }
.status-badge.acknowledged { background: #E0F2FE; color: #075985; }
.status-badge.resolved { background: #DCFCE7; color: #166534; }

.sla-breach-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: #FEE2E2;
  color: #991B1B;
  margin-right: 6px;
}

.ticket-desc {
  font-size: 13px;
  font-weight: 600;
  color: #0E211B;
  line-height: 1.4;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-row-3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #5C6E68;
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ticket-side-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.support-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #00674D;
  font-weight: 700;
  background: #E6F4EE;
  padding: 2px 6px;
  border-radius: 4px;
}

.ticket-detail-col {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  overflow: hidden;
}

.detail-empty {
  padding: 60px 24px;
  text-align: center;
  color: #5C6E68;
  font-size: 13.5px;
}

.detail-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAFCFB;
  flex-wrap: wrap;
  gap: 12px;
}

.ticket-id {
  font-size: 12px;
  font-family: var(--font-mono, monospace);
  color: #5C6E68;
}

.detail-badges {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-action.ack { background: #E0F2FE; color: #075985; border-color: #BAE6FD; }
.btn-action.support { background: #E6F4EE; color: #00674D; border-color: #A7F3D0; }
.btn-action.resolve { background: #DCFCE7; color: #166534; border-color: #86EFAC; }

.detail-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-block label {
  font-size: 11.5px;
  font-weight: 700;
  color: #5C6E68;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}

.desc-content {
  font-size: 13.5px;
  line-height: 1.5;
  color: #0E211B;
  background: #FAFCFB;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #EFF5F2;
  white-space: pre-line;
}

.info-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.user-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-item strong {
  font-size: 13px;
  display: block;
}

.user-item small {
  font-size: 11.5px;
  color: #5C6E68;
}

.context-val {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.resolution-box {
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  padding: 14px 16px;
  border-radius: 8px;
}

.res-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  margin-bottom: 6px;
}

.resolution-box p {
  font-size: 13px;
  color: #166534;
  margin: 0;
  line-height: 1.45;
}

.support-section {
  border-top: 1px solid #DCE7E2;
  padding-top: 16px;
}

.sec-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #00674D;
}

.sec-head h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.no-support {
  font-size: 12.5px;
  color: #5C6E68;
  padding: 12px;
  background: #FAFCFB;
  border-radius: 6px;
  text-align: center;
}

.support-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.support-item {
  background: #F4FBF7;
  border: 1px solid #C4EBD8;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
}

.sup-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: #00674D;
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
  max-width: 520px;
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
  .queue-split {
    grid-template-columns: 1fr;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
