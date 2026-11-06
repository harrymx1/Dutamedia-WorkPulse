<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Shield,
  FolderGit2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Layers,
  RotateCcw,
} from 'lucide-vue-next';

// Tab State
const activeTab = ref<'create' | 'mine'>('create');

// Form Data
const title = ref('');
const linkedCommitmentId = ref('');
const blockerType = ref<string>('');
const blockerImpact = ref<string>('');
const blockerSeverity = ref<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
const description = ref('');
const expectedHelp = ref('');
const authorityContext = ref<'ORGANIZATIONAL_AUTHORITY' | 'PROJECT_AUTHORITY'>('ORGANIZATIONAL_AUTHORITY');
const projectCode = ref('');
const assignedOwnerId = ref('');

// Options & Reference Data
const todayCommitments = ref<Array<{ id: string; taskText: string; sequenceNumber: number }>>([]);
const availableProjects = ref([
  { code: 'PRJ-PORTAL', name: 'Website Customer Portal & Client Billing' },
  { code: 'PRJ-CORE', name: 'Enterprise Core Engine & Identity Sync' },
  { code: 'PRJ-MOBILE', name: 'WorkPulse Mobile Apps — iOS & Android' },
]);
const availableUsers = ref<Array<{ id: string; fullName: string; email: string }>>([]);

// State
const loading = ref(false);
const submitting = ref(false);
const submittedTicket = ref<any>(null);
const errorMessage = ref<string | null>(null);
const toastMessage = ref<string | null>(null);

// My Blockers State
const myBlockers = ref<any[]>([]);
const loadingBlockers = ref(false);
const blockerFilter = ref<'all' | 'active' | 'resolved' | 'closed'>('all');

const charCount = computed(() => title.value.length);

const isFormValid = computed(() => {
  if (title.value.trim().length < 10) return false;
  if (!blockerType.value) return false;
  if (!blockerImpact.value) return false;
  if (!blockerSeverity.value) return false;
  if (description.value.trim().length < 20) return false;
  if (authorityContext.value === 'PROJECT_AUTHORITY' && !projectCode.value.trim()) return false;
  return true;
});

const activeBlockersCount = computed(() => {
  return myBlockers.value.filter((b) =>
    ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].includes(b.status)
  ).length;
});

const countAll = computed(() => myBlockers.value.length);
const countActive = computed(
  () => myBlockers.value.filter((b) => ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(b.status)).length
);
const countResolved = computed(
  () => myBlockers.value.filter((b) => b.status === 'RESOLVED').length
);
const countClosed = computed(
  () => myBlockers.value.filter((b) => ['CLOSED', 'ACCEPTED_RISK'].includes(b.status)).length
);

const filteredBlockers = computed(() => {
  if (blockerFilter.value === 'active') {
    return myBlockers.value.filter((b) => ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(b.status));
  }
  if (blockerFilter.value === 'resolved') {
    return myBlockers.value.filter((b) => b.status === 'RESOLVED');
  }
  if (blockerFilter.value === 'closed') {
    return myBlockers.value.filter((b) => ['CLOSED', 'ACCEPTED_RISK'].includes(b.status));
  }
  return myBlockers.value;
});

function insertStructuredTemplate() {
  description.value =
`[Fakta Kendala]: 
[Dampak Nyata]: 
[Upaya Mandiri yang Telah Dicoba]: 
[Kebutuhan Bantuan Konkret]: `;
}

function appendExpectedHelp(chipText: string) {
  if (!expectedHelp.value) {
    expectedHelp.value = chipText;
  } else {
    expectedHelp.value += ` | ${chipText}`;
  }
}

function resetForm() {
  title.value = '';
  linkedCommitmentId.value = '';
  blockerType.value = '';
  blockerImpact.value = '';
  blockerSeverity.value = 'HIGH';
  description.value = '';
  expectedHelp.value = '';
  authorityContext.value = 'ORGANIZATIONAL_AUTHORITY';
  projectCode.value = '';
  if (availableUsers.value.length > 0) {
    assignedOwnerId.value = availableUsers.value[0].id;
  } else {
    assignedOwnerId.value = '';
  }
  errorMessage.value = null;
  submittedTicket.value = null;
  toastMessage.value = 'Formulir berhasil dibersihkan.';
  setTimeout(() => {
    toastMessage.value = null;
  }, 3000);
}

function resetFormForAnother() {
  submittedTicket.value = null;
  resetForm();
}

function switchToMyBlockers() {
  activeTab.value = 'mine';
  loadMyBlockers();
}

async function loadInitialData() {
  loading.value = true;
  try {
    // Ambil komitmen hari ini untuk ditautkan
    const todayRes = await apiClient<{ record?: { commitments?: any[] } }>('/daily/today');
    if (todayRes.data?.record?.commitments) {
      todayCommitments.value = todayRes.data.record.commitments;
    }

    // Ambil daftar pengguna untuk routing penugasan
    const usersRes = await apiClient<Array<{ id: string; fullName: string; email: string }>>('/v1/organization/users');
    if (usersRes.data) {
      availableUsers.value = usersRes.data;
      if (availableUsers.value.length > 0) {
        assignedOwnerId.value = availableUsers.value[0].id;
      }
    }
  } catch (err: any) {
    console.error('Failed to load initial data:', err);
  } finally {
    loading.value = false;
  }
}

async function loadMyBlockers() {
  loadingBlockers.value = true;
  try {
    const res = await apiClient<any[]>('/blockers?mine=raised');
    if (res.data) {
      myBlockers.value = res.data;
    }
  } catch (err: any) {
    console.error('Failed to load my blockers:', err);
  } finally {
    loadingBlockers.value = false;
  }
}

async function submitBlocker() {
  errorMessage.value = null;

  if (title.value.trim().length < 10) {
    errorMessage.value = 'Judul kendala wajib diisi minimal 10 karakter.';
    return;
  }
  if (!blockerType.value) {
    errorMessage.value = 'Kategori / jenis kendala (Type) wajib dipilih.';
    return;
  }
  if (!blockerImpact.value) {
    errorMessage.value = 'Dampak kendala (Impact) wajib dipilih.';
    return;
  }
  if (description.value.trim().length < 20) {
    errorMessage.value = 'Deskripsi kendala & upaya mandiri wajib diisi minimal 20 karakter.';
    return;
  }
  if (authorityContext.value === 'PROJECT_AUTHORITY' && !projectCode.value.trim()) {
    errorMessage.value = 'Kode proyek wajib diisi jika menggunakan Project Authority (DEC-002).';
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      type: blockerType.value,
      severity: blockerSeverity.value,
      impact: blockerImpact.value,
      description: `[${title.value.trim()}] ${description.value.trim()}${expectedHelp.value.trim() ? ` (Ekspektasi: ${expectedHelp.value.trim()})` : ''}`,
      ownerNeededType: authorityContext.value,
      assignedOwnerId: assignedOwnerId.value || undefined,
      projectCodeReference: authorityContext.value === 'PROJECT_AUTHORITY' ? projectCode.value.trim() : undefined,
      linkedCommitmentId: linkedCommitmentId.value ? linkedCommitmentId.value : undefined,
    };

    const res = await apiClient<any>('/blockers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    submittedTicket.value = res.data;
    toastMessage.value = 'Tiket kendala berhasil diterbitkan dan dinotifikasi ke penanggung jawab.';
    loadMyBlockers();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menerbitkan tiket kendala.';
  } finally {
    submitting.value = false;
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'RESOLVED':
      return 'green';
    case 'IN_PROGRESS':
    case 'ACKNOWLEDGED':
      return 'blue';
    case 'OPEN':
      return 'amber';
    case 'ACCEPTED_RISK':
      return 'orange';
    case 'CLOSED':
    default:
      return 'neutral';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'RESOLVED':
      return 'Solusi Diberikan · Menunggu Konfirmasi';
    case 'IN_PROGRESS':
      return 'Sedang Ditangani';
    case 'ACKNOWLEDGED':
      return 'Telah Diterima';
    case 'OPEN':
      return 'Menunggu Respons Atasan';
    case 'ACCEPTED_RISK':
      return 'Risiko Diterima';
    case 'CLOSED':
      return 'Selesai Ditutup';
    default:
      return status;
  }
}

function getSeverityClass(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'red';
    case 'HIGH':
      return 'amber';
    case 'MEDIUM':
      return 'blue';
    case 'LOW':
    default:
      return 'neutral';
  }
}

function formatDate(isoDate?: string): string {
  if (!isoDate) return 'Hari ini';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Hari ini';
  }
}

function getTicketTitle(ticket: any): string {
  if (ticket.title) return ticket.title;
  if (!ticket.description) return 'Laporan Kendala';
  const match = ticket.description.match(/^\[(.*?)\]/);
  if (match && match[1]) {
    return match[1];
  }
  return ticket.description.slice(0, 50);
}

function getTicketDescription(ticket: any): string {
  if (!ticket.description) return '';
  return ticket.description.replace(/^\[.*?\]\s*/, '');
}

onMounted(() => {
  loadInitialData();
  loadMyBlockers();
});
</script>

<template>
  <div class="blocker-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Workspace / Blocker" />

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
      <!-- Back Navigation Link (IMP-041) -->
      <router-link
        to="/daily/morning"
        class="back-nav-link"
        data-testid="back-nav-link"
        title="Kembali ke Ruang Kerja My Today"
      >
        <ArrowLeft :size="15" />
        <span>Kembali ke Ruang Kerja My Today</span>
      </router-link>

      <!-- Page Heading (IMP-041: No kicker, IMP-042: No antrean blocker aktif link) -->
      <div class="page-heading">
        <div>
          <h1>Laporkan &amp; Pantau Blocker</h1>
          <p class="subtitle">
            Laporkan hambatan atau dependensi kerja beserta dampak dan tingkat keparahannya agar penanggung jawab berwenang dapat segera menindaklanjuti.
          </p>
        </div>
      </div>

      <!-- View Mode Tabs (IMP-041: Buat Laporan Blocker vs Blocker Saya) -->
      <div class="view-tabs" role="tablist" aria-label="Mode Tampilan Halaman Blocker">
        <button
          type="button"
          class="view-tab"
          :class="{ active: activeTab === 'create' }"
          role="tab"
          :aria-selected="activeTab === 'create'"
          data-testid="tab-create-blocker"
          @click="activeTab = 'create'"
        >
          <Plus :size="16" />
          <span>Buat Laporan Blocker</span>
        </button>
        <button
          type="button"
          class="view-tab"
          :class="{ active: activeTab === 'mine' }"
          role="tab"
          :aria-selected="activeTab === 'mine'"
          data-testid="tab-my-blockers"
          @click="switchToMyBlockers"
        >
          <Layers :size="16" />
          <span>Blocker Saya</span>
          <span
            class="tab-badge"
            :class="{ alert: activeBlockersCount > 0 }"
            data-testid="active-blockers-count"
          >
            {{ activeBlockersCount }}
          </span>
        </button>
      </div>

      <!-- VIEW A: FORMULIR PELAPORAN CEPAT -->
      <div v-if="activeTab === 'create'" class="create-blocker-view">
        <!-- Success Screen If Submitted -->
        <div v-if="submittedTicket" class="submitted-card" data-testid="submitted-ticket-card">
          <div class="submitted-icon">
            <CheckCircle2 :size="36" />
          </div>
          <h2>Tiket Kendala Berhasil Diterbitkan</h2>
          <p class="submitted-msg">
            Tiket ID: <code>{{ submittedTicket.id }}</code> telah dicatat pada sistem dengan status <strong>{{ submittedTicket.status }}</strong>. Notifikasi segera dikirimkan kepada penanggung jawab terkait.
          </p>
          <div class="submitted-actions">
            <button
              type="button"
              class="btn-secondary"
              data-testid="btn-view-my-blockers"
              @click="switchToMyBlockers"
            >
              Lihat di Blocker Saya
            </button>
            <button
              type="button"
              class="btn-secondary"
              data-testid="btn-create-another"
              @click="resetFormForAnother"
            >
              Laporkan Kendala Lain
            </button>
            <router-link
              to="/daily/morning"
              class="btn-primary"
              data-testid="btn-back-to-workspace"
            >
              <span>Kembali ke Ruang Kerja</span>
              <ArrowRight :size="16" />
            </router-link>
          </div>
        </div>

        <!-- Form Utama -->
        <form v-else class="blocker-form" @submit.prevent="submitBlocker" novalidate>
          <!-- Panel 1: Detail Kendala -->
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>Detail Kendala, Taksonomi &amp; Dampak</h2>
                <p class="panel-desc">Tuliskan fakta kendala, kategori, dampak, dan tingkat keparahan (Severity).</p>
              </div>
              <span class="pill pill-brand">Bagian 1 dari 2</span>
            </div>

            <div class="panel-body">
              <!-- Judul -->
              <div class="form-group">
                <div class="label-row">
                  <label for="blockerTitle">Judul Kendala <span class="req">*</span></label>
                  <span class="char-counter" :class="{ 'char-valid': charCount >= 10 }">{{ charCount }} / 140</span>
                </div>
                <input
                  id="blockerTitle"
                  v-model="title"
                  type="text"
                  maxlength="140"
                  placeholder="Contoh: [Payment Gateway] Kredensial Sandbox Kadaluarsa (min. 10 karakter)"
                  required
                />
              </div>

              <!-- Tautan Komitmen -->
              <div class="form-group">
                <label for="linkedCommitment">Tautkan ke Komitmen / Tugas Hari Ini <span class="opt">(opsional)</span></label>
                <select id="linkedCommitment" v-model="linkedCommitmentId">
                  <option value="">— Tidak Terkait Komitmen Hari Ini —</option>
                  <option v-for="c in todayCommitments" :key="c.id" :value="c.id">
                    [Komitmen #{{ c.sequenceNumber }}] {{ c.taskText }}
                  </option>
                </select>
              </div>

              <!-- Kategori & Dampak -->
              <div class="form-grid-2">
                <div class="form-group">
                  <label for="blockerType">Kategori Kendala (Type) <span class="req">*</span></label>
                  <select id="blockerType" v-model="blockerType" required>
                    <option value="" disabled>-- Pilih Kategori (10 Enum Resmi) --</option>
                    <option value="TECHNICAL">Technical — Bug, kendala kode, query database</option>
                    <option value="REQUIREMENT">Requirement — Spesifikasi belum jelas / berubah</option>
                    <option value="CLIENT">Client — Menunggu respon, data, UAT dari klien</option>
                    <option value="VENDOR">Vendor — API eksternal, SaaS, lisensi pihak ketiga</option>
                    <option value="RESOURCE">Resource — Kapasitas tim, cuti, dependensi personil</option>
                    <option value="APPROVAL">Approval — Menunggu persetujuan pimpinan / stakeholder</option>
                    <option value="INFRA">Infra — Server, staging, CI/CD, VPN, jaringan</option>
                    <option value="FINANCE">Finance — Pembayaran server/domain/anggaran tertahan</option>
                    <option value="LEGAL">Legal — Kontrak, NDA, kepatuhan data</option>
                    <option value="OTHER">Other — Kendala operasional lainnya</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="blockerImpact">Dampak Kendala (Impact) <span class="req">*</span></label>
                  <select id="blockerImpact" v-model="blockerImpact" required>
                    <option value="" disabled>-- Pilih Cakupan Dampak (7 Enum Resmi) --</option>
                    <option value="TASK">Task — Menghambat 1 tugas individu</option>
                    <option value="MILESTONE">Milestone — Mengancam target fase / sprint</option>
                    <option value="PROJECT">Project — Menghambat jadwal proyek lintas tim</option>
                    <option value="PRODUCTION">Production — Mengganggu layanan live / klien aktif</option>
                    <option value="CLIENT">Client — Berdampak langsung pada kepuasan klien</option>
                    <option value="FINANCIAL">Financial — Potensi kerugian / pinalti finansial</option>
                    <option value="COMPLIANCE">Compliance — Risiko kepatuhan hukum / kontrak SLA</option>
                  </select>
                </div>
              </div>

              <!-- Severity Cards -->
              <div class="form-group">
                <div class="label-row">
                  <label>Tingkat Keparahan (Severity) <span class="req">*</span></label>
                  <span class="pill pill-sla">SLA Otomatis Sesuai Kebijakan Aktif</span>
                </div>
                <div class="severity-grid">
                  <label class="severity-card critical" :class="{ selected: blockerSeverity === 'CRITICAL' }">
                    <input type="radio" v-model="blockerSeverity" value="CRITICAL" />
                    <div class="card-head">
                      <span class="sev-badge critical">Critical</span>
                      <span class="sev-sla">SLA: 60m</span>
                    </div>
                    <p class="sev-desc">Pekerjaan terhenti total, memicu notifikasi darurat instan &amp; auto-escalate.</p>
                  </label>

                  <label class="severity-card high" :class="{ selected: blockerSeverity === 'HIGH' }">
                    <input type="radio" v-model="blockerSeverity" value="HIGH" />
                    <div class="card-head">
                      <span class="sev-badge high">High</span>
                      <span class="sev-sla">SLA: 120m</span>
                    </div>
                    <p class="sev-desc">Hambatan berat pada jadwal atau milestone utama harian.</p>
                  </label>

                  <label class="severity-card medium" :class="{ selected: blockerSeverity === 'MEDIUM' }">
                    <input type="radio" v-model="blockerSeverity" value="MEDIUM" />
                    <div class="card-head">
                      <span class="sev-badge medium">Medium</span>
                      <span class="sev-sla">SLA: 240m</span>
                    </div>
                    <p class="sev-desc">Hambatan parsial, namun masih dapat mengerjakan komitmen lain.</p>
                  </label>

                  <label class="severity-card low" :class="{ selected: blockerSeverity === 'LOW' }">
                    <input type="radio" v-model="blockerSeverity" value="LOW" />
                    <div class="card-head">
                      <span class="sev-badge low">Low</span>
                      <span class="sev-sla">SLA: 480m</span>
                    </div>
                    <p class="sev-desc">Kendala minor atau ketidaknyamanan operasional berisiko rendah.</p>
                  </label>
                </div>

                <!-- Critical Alert Box -->
                <div v-if="blockerSeverity === 'CRITICAL'" class="critical-notice">
                  <AlertTriangle :size="18" />
                  <span>
                    <strong>Perhatian Skala Critical:</strong> Opsi ini mengaktifkan timer darurat (SLA 60m) dan memicu eskalasi prioritas ke pimpinan divisi.
                  </span>
                </div>
              </div>

              <!-- Deskripsi & Upaya Mandiri -->
              <div class="form-group">
                <div class="label-row">
                  <label for="blockerDesc">Deskripsi Kendala &amp; Upaya Mandiri <span class="req">*</span></label>
                  <button type="button" class="btn-text-action" @click="insertStructuredTemplate">
                    + Gunakan Format Terstruktur
                  </button>
                </div>
                <textarea
                  id="blockerDesc"
                  v-model="description"
                  rows="5"
                  minlength="20"
                  placeholder="Jelaskan fakta kendala, pihak/area yang terdampak, serta langkah mandiri yang sudah dicoba... (min. 20 karakter)"
                  required
                ></textarea>
              </div>

              <!-- Ekspektasi Bantuan -->
              <div class="form-group">
                <div class="label-row">
                  <label for="expectedHelpInput">Bantuan Konkret yang Diharapkan <span class="opt">(opsional)</span></label>
                </div>
                <div class="chip-container">
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Approval PR/Tiket')">+ Approval</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Konfirmasi Requirement')">+ Requirement</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Akses Kredensial / Token')">+ Akses</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Bantuan Tim Infra / Server')">+ Infra</button>
                  <button type="button" class="quick-chip" @click="appendExpectedHelp('Review Solusi / Arsitektur')">+ Code Review</button>
                </div>
                <input
                  id="expectedHelpInput"
                  v-model="expectedHelp"
                  type="text"
                  maxlength="200"
                  placeholder="Aksi konkret yang Anda harapkan (Contoh: Butuh approval token staging oleh PM)..."
                />
              </div>
            </div>
          </section>

          <!-- Panel 2: Penanggung Jawab & Jalur Kewenangan -->
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>Penanggung Jawab Awal &amp; Jalur Kewenangan</h2>
                <p class="panel-desc">Tentukan konteks kewenangan penanganan kendala (DEC-002).</p>
              </div>
              <span class="pill pill-brand">Bagian 2 dari 2</span>
            </div>

            <div class="panel-body">
              <div class="authority-grid">
                <label
                  class="authority-card"
                  :class="{ selected: authorityContext === 'ORGANIZATIONAL_AUTHORITY' }"
                >
                  <input
                    type="radio"
                    v-model="authorityContext"
                    value="ORGANIZATIONAL_AUTHORITY"
                  />
                  <div class="auth-icon"><Shield :size="20" /></div>
                  <div>
                    <strong>Organizational Authority (Struktural)</strong>
                    <p>Ditangani oleh Atasan Langsung atau Lead Divisi dalam bagan organisasi (Level 1).</p>
                  </div>
                </label>

                <label
                  class="authority-card"
                  :class="{ selected: authorityContext === 'PROJECT_AUTHORITY' }"
                >
                  <input
                    type="radio"
                    v-model="authorityContext"
                    value="PROJECT_AUTHORITY"
                  />
                  <div class="auth-icon"><FolderGit2 :size="20" /></div>
                  <div>
                    <strong>Project Authority (Kewenangan Proyek)</strong>
                    <p>Ditangani oleh personil berwenang di proyek terkait (DEC-002: Wajib mencantumkan kode proyek).</p>
                  </div>
                </label>
              </div>

              <!-- Proyek Terkait (Kondisional jika Project Authority dipilih) -->
              <div v-if="authorityContext === 'PROJECT_AUTHORITY'" class="form-group" style="margin-top: 16px;">
                <label for="projectCodeSelect">Pilih Proyek Terdaftar <span class="req">*</span></label>
                <select id="projectCodeSelect" v-model="projectCode" required>
                  <option value="">-- Pilih Proyek Terdaftar --</option>
                  <option v-for="p in availableProjects" :key="p.code" :value="p.code">
                    {{ p.code }} — {{ p.name }}
                  </option>
                </select>
              </div>

              <!-- Pemilihan Orang Tertentu -->
              <div class="form-group" style="margin-top: 16px;">
                <label for="assignedOwner">Penanggung Jawab Khusus <span class="opt">(opsional)</span></label>
                <select id="assignedOwner" v-model="assignedOwnerId">
                  <option value="">— Tugaskan Otomatis ke Lead / Manager Terkait —</option>
                  <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                    {{ u.fullName }} ({{ u.email }})
                  </option>
                </select>
              </div>

              <!-- Route Preview Box -->
              <div class="route-preview">
                <Clock :size="20" class="route-icon" />
                <div>
                  <strong>Jalur Penanganan Otomatis:</strong>
                  <p v-if="authorityContext === 'ORGANIZATIONAL_AUTHORITY'">
                    Tiket diteruskan ke Atasan Langsung struktural. Timer SLA dimulai seketika saat tiket terbit.
                  </p>
                  <p v-else>
                    Tiket diteruskan ke Lead Proyek <strong>{{ projectCode || '(Pilih Proyek)' }}</strong> sesuai Project Authority Mapping aktif.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Form Sticky Footer (IMP-044) -->
          <div class="sticky-footer">
            <div class="footer-content">
              <span class="footer-hint" data-testid="footer-hint">
                Pastikan fakta kendala akurat dan objektif untuk mempercepat penanganan oleh atasan.
              </span>
              <div class="footer-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  data-testid="btn-reset-form"
                  @click="resetForm"
                >
                  <RotateCcw :size="15" />
                  <span>Bersihkan Formulir</span>
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  data-testid="btn-submit-blocker"
                  :disabled="submitting || !isFormValid"
                >
                  <span v-if="submitting">Mengirim Laporan...</span>
                  <span v-else>Kirim Laporan Blocker</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- VIEW B: DAFTAR BLOCKER SAYA (IMP-041) -->
      <section v-else class="my-blockers-view" data-testid="my-blockers-view">
        <div class="blockers-filter-bar">
          <div>
            <h2>Daftar Blocker yang Saya Laporkan</h2>
            <p class="subtitle">Pantau siklus hidup tiket kendala, sisa waktu SLA, dan tindak lanjut penanganan.</p>
          </div>
          <div class="filter-pills" role="radiogroup" aria-label="Filter status blocker">
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'all' }"
              data-testid="filter-all"
              @click="blockerFilter = 'all'"
            >
              Semua ({{ countAll }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'active' }"
              data-testid="filter-active"
              @click="blockerFilter = 'active'"
            >
              Aktif ({{ countActive }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'resolved' }"
              data-testid="filter-resolved"
              @click="blockerFilter = 'resolved'"
            >
              Menunggu Konfirmasi ({{ countResolved }})
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: blockerFilter === 'closed' }"
              data-testid="filter-closed"
              @click="blockerFilter = 'closed'"
            >
              Selesai / Ditutup ({{ countClosed }})
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingBlockers" class="loading-state" data-testid="loading-blockers">
          Memuat daftar blocker saya...
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBlockers.length === 0" class="empty-blockers" data-testid="empty-blockers">
          <div class="empty-blockers-icon">
            <Layers :size="24" />
          </div>
          <h3>Tidak Ada Blocker pada Filter Ini</h3>
          <p class="empty-desc">Semua kendala terkendali atau belum ada laporan pada kategori ini.</p>
        </div>

        <!-- Blocker Cards List -->
        <div v-else class="blockers-list" data-testid="blockers-list">
          <div
            v-for="b in filteredBlockers"
            :key="b.id"
            class="blocker-item-card"
            :class="{ resolved: b.status === 'RESOLVED' }"
            :data-ticket-id="b.id"
          >
            <div class="blocker-item-head">
              <div class="head-left">
                <span class="blocker-item-id">#{{ b.id.slice(0, 8) }}</span>
                <span class="pill" :class="getStatusBadgeClass(b.status)">
                  <span class="dot-sm"></span> {{ getStatusLabel(b.status) }}
                </span>
                <span class="pill pill-neutral">{{ b.type }}</span>
              </div>
              <div class="head-right">
                <span class="pill" :class="getSeverityClass(b.severity)">Tingkat {{ b.severity }}</span>
                <span class="date-sep"></span>
                <span class="blocker-date">{{ formatDate(b.raisedAt) }}</span>
              </div>
            </div>

            <div class="blocker-item-title">{{ getTicketTitle(b) }}</div>
            <p class="blocker-item-desc">{{ getTicketDescription(b) }}</p>

            <div class="blocker-item-meta">
              <span class="blocker-meta-item">Dampak: <strong>{{ b.impact }}</strong></span>
              <span class="blocker-meta-item">
                Penanggung Jawab: <strong>{{ b.assignedOwner?.fullName || 'Belum Ditugaskan' }}</strong>
              </span>
              <span v-if="b.linkedCommitment" class="blocker-meta-item">
                Terkait: <strong>Komitmen #{{ b.linkedCommitment.sequenceNumber }}</strong>
              </span>
            </div>

            <!-- Resolution Note (if available) -->
            <div v-if="b.resolutionNote" class="resolution-box">
              <div class="resolution-title">
                <CheckCircle2 :size="14" />
                <span>Catatan Penyelesaian:</span>
              </div>
              <p class="resolution-text">{{ b.resolutionNote }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.blocker-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px clamp(1.5rem, 4vw, 3.5rem) 120px;
}

/* Back Navigation Link */
.back-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-primary, #00674D);
  text-decoration: none;
  margin-bottom: 12px;
  padding: 4px 0;
  transition: color 0.15s ease;
}

.back-nav-link:hover {
  color: #0B8061;
  text-decoration: none;
}

.back-nav-link svg {
  transition: transform 0.15s ease;
}

.back-nav-link:hover svg {
  transform: translateX(-3px);
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 13.5px;
  color: #5C6E68;
  max-width: 720px;
  line-height: 1.5;
}

/* View Tabs */
.view-tabs {
  display: inline-flex;
  align-items: center;
  background: #EDF2F0;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
  margin-bottom: 24px;
}

.view-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: #5C6E68;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-tab:hover {
  color: #0E211B;
  background: rgba(255, 255, 255, 0.5);
}

.view-tab.active {
  background: #fff;
  color: #00674D;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #E6F4EE;
  color: #00674D;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.tab-badge.alert {
  background: #FEE2E2;
  color: #991B1B;
}

.panel {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FAFCFB;
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.panel-desc {
  font-size: 12.5px;
  color: #5C6E68;
  margin-top: 2px;
}

.pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.pill-brand {
  background: #E6F4EE;
  color: #00674D;
}

.pill-sla {
  background: #EFF5F2;
  color: #5C6E68;
}

.pill-neutral,
.pill.neutral {
  background: #F1F5F9;
  color: #334155;
  border: 1px solid #CBD5E1;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.pill.blue {
  background: #E0F2FE;
  color: #075985;
  border: 1px solid #7DD3FC;
}

.pill.amber {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.pill.orange {
  background: #FFEDD5;
  color: #9A3412;
  border: 1px solid #FDBA74;
}

.pill.red {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
}

.dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.panel-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

label {
  font-size: 13px;
  font-weight: 700;
  color: #0E211B;
}

.req {
  color: #991B1B;
}

.opt {
  font-size: 11px;
  color: #66736E;
  font-weight: normal;
}

.char-counter {
  font-size: 11.5px;
  color: #66736E;
}

.char-valid {
  color: #166534;
  font-weight: 700;
}

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  font-size: 13.5px;
  background: #fff;
  color: #0E211B;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #00674D;
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.severity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 6px;
}

.severity-card {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s ease;
  position: relative;
}

.severity-card input {
  position: absolute;
  top: 10px;
  right: 10px;
}

.severity-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
}

.severity-card.critical.selected {
  border-color: #DC2626;
  background: #FEF2F2;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.sev-badge {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.sev-badge.critical { background: #FEE2E2; color: #991B1B; }
.sev-badge.high { background: #FFEDD5; color: #9A3412; }
.sev-badge.medium { background: #FEF3C7; color: #92400E; }
.sev-badge.low { background: #EFF5F2; color: #5C6E68; }

.sev-sla {
  font-size: 11px;
  color: #5C6E68;
}

.sev-desc {
  font-size: 11.5px;
  color: #5C6E68;
  margin: 0;
  line-height: 1.35;
}

.critical-notice {
  margin-top: 10px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-text-action {
  background: none;
  border: none;
  color: #00674D;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.btn-text-action:hover {
  text-decoration: underline;
}

.chip-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.quick-chip {
  background: #EFF5F2;
  border: 1px solid #DCE7E2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #0E211B;
  cursor: pointer;
}

.quick-chip:hover {
  background: #E6F4EE;
  border-color: #00674D;
  color: #00674D;
}

.authority-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.authority-card {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  background: #fff;
  position: relative;
}

.authority-card input {
  position: absolute;
  top: 12px;
  right: 12px;
}

.authority-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
}

.auth-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #E6F4EE;
  color: #00674D;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.authority-card strong {
  font-size: 13px;
  display: block;
}

.authority-card p {
  font-size: 12px;
  color: #5C6E68;
  margin: 4px 0 0;
}

.route-preview {
  margin-top: 16px;
  background: #EFF5F2;
  border: 1px dashed #A9C7BC;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.route-icon {
  color: #00674D;
  flex-shrink: 0;
}

.route-preview strong {
  font-size: 12.5px;
  color: #0E211B;
}

.route-preview p {
  font-size: 12px;
  color: #5C6E68;
  margin: 2px 0 0;
}

/* Form Fixed Footer (Full-width from sidebar edge to screen edge - Prototipe 05) */
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 232px;
  right: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid #DCE7E2;
  box-shadow: 0 -4px 16px -2px rgba(0, 0, 0, 0.06);
  padding: 14px clamp(1.5rem, 4vw, 3.5rem);
  transition: left 0.2s ease;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (max-width: 992px) {
  .sticky-footer {
    left: 0;
    padding: 12px 16px;
  }
}

@media (max-width: 680px) {
  .sticky-footer {
    left: 0;
    padding: 12px 16px max(14px, env(safe-area-inset-bottom));
  }

  .footer-content {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .footer-actions {
    display: grid;
    grid-template-columns: 1fr 2fr;
    width: 100%;
    gap: 10px;
  }

  .footer-actions .btn-secondary,
  .footer-actions .btn-primary {
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    font-size: 14px;
    justify-content: center;
  }
}

.footer-hint {
  font-size: 12.5px;
  color: #5C6E68;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #DCE7E2;
  background: #fff;
  color: #0E211B;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #EFF5F2;
  border-color: #A9C7BC;
}

.btn-primary {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #00523D;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submitted-card {
  background: #fff;
  border: 1px solid #86EFAC;
  border-radius: 12px;
  padding: 36px 24px;
  text-align: center;
  max-width: 600px;
  margin: 30px auto;
}

.submitted-icon {
  color: #166534;
  margin-bottom: 12px;
}

.submitted-card h2 {
  font-size: 20px;
  font-weight: 800;
  color: #166534;
  margin-bottom: 8px;
}

.submitted-msg {
  font-size: 13.5px;
  color: #5C6E68;
  margin-bottom: 24px;
}

.submitted-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* My Blockers View Styling (IMP-041) */
.blockers-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.blockers-filter-bar h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
}

.filter-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 6px 14px;
  border: 1px solid #DCE7E2;
  background: #fff;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  color: #5C6E68;
  cursor: pointer;
  transition: all 0.15s ease;
  font-variant-numeric: tabular-nums;
}

.filter-pill:hover {
  border-color: #A9C7BC;
  color: #0E211B;
}

.filter-pill.active {
  background: #00674D;
  color: #fff;
  border-color: #00674D;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #5C6E68;
  font-size: 14px;
}

.empty-blockers {
  text-align: center;
  padding: 48px 24px;
  background: #fff;
  border: 1px dashed #DCE7E2;
  border-radius: 12px;
  margin: 10px 0;
}

.empty-blockers-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #E6F4EE;
  color: #00674D;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
}

.empty-blockers h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0E211B;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #5C6E68;
  max-width: 420px;
  margin: 0 auto;
}

.blocker-item-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 14px;
  transition: border-color 0.15s ease;
}

.blocker-item-card:hover {
  border-color: #A9C7BC;
}

.blocker-item-card.resolved {
  border-color: #86EFAC;
  box-shadow: 0 4px 14px rgba(22, 101, 52, 0.06);
}

.blocker-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.blocker-item-id {
  font-size: 13px;
  font-weight: 800;
  color: #00674D;
  letter-spacing: 0.02em;
  font-family: monospace;
}

.date-sep {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #CBD5E1;
}

.blocker-date {
  font-size: 12.5px;
  font-weight: 600;
  color: #5C6E68;
  white-space: nowrap;
}

.blocker-item-title {
  font-size: 15px;
  font-weight: 700;
  color: #0E211B;
  margin-bottom: 6px;
  line-height: 1.4;
}

.blocker-item-desc {
  font-size: 13.5px;
  color: #5C6E68;
  line-height: 1.5;
  margin: 0 0 12px;
}

.blocker-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5C6E68;
  flex-wrap: wrap;
}

.blocker-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #F8FAFC;
  border: 1px solid #DCE7E2;
  padding: 3px 9px;
  border-radius: 6px;
}

.blocker-meta-item strong {
  color: #0E211B;
  font-weight: 700;
}

.resolution-box {
  background: #DCFCE7;
  border: 1px solid #86EFAC;
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 12px;
}

.resolution-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 800;
  color: #166534;
  margin-bottom: 4px;
}

.resolution-text {
  font-size: 13px;
  color: #166534;
  line-height: 1.45;
  margin: 0;
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

@media (max-width: 768px) {
  .form-grid-2,
  .severity-grid,
  .authority-grid {
    grid-template-columns: 1fr;
  }
}
</style>
