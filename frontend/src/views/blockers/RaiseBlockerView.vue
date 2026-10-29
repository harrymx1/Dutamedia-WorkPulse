<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
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
  ListFilter,
} from 'lucide-vue-next';

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
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menerbitkan tiket kendala.';
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadInitialData();
});
</script>

<template>
  <div class="blocker-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Blocker / <strong>Laporkan Kendala Cepat (Prototipe 05)</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/blockers" class="btn-topbar">
          <ListFilter :size="16" />
          <span>Antrean Tiket</span>
        </AccessLink>
        <AccessLink to="/blockers/aging" class="btn-topbar">
          <Clock :size="16" />
          <span>Aging Radar</span>
        </AccessLink>
        <AccessLink to="/daily/morning" class="btn-topbar">My Today</AccessLink>
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
          <span class="eyebrow">Manajemen Kendala &amp; Eskalasi Otomatis</span>
          <h1>Laporkan &amp; Pantau Blocker</h1>
          <p class="subtitle">
            Laporkan hambatan pekerjaan seketika tanpa menunggu pergantian hari. Sistem menetapkan penanggung jawab awal dan timer SLA eskalasi otomatis.
          </p>
        </div>
        <div class="heading-side">
          <AccessLink to="/blockers" class="btn-blocker-secondary">
            <ListFilter :size="16" />
            <span>Lihat Antrean Blocker Aktif</span>
          </AccessLink>
        </div>
      </div>

      <!-- Success Screen If Submitted -->
      <div v-if="submittedTicket" class="submitted-card">
        <div class="submitted-icon">
          <CheckCircle2 :size="36" />
        </div>
        <h2>Tiket Kendala Berhasil Diterbitkan</h2>
        <p class="submitted-msg">
          Tiket ID: <code>{{ submittedTicket.id }}</code> telah dicatat pada sistem dengan status <strong>{{ submittedTicket.status }}</strong>. Notifikasi segera dikirimkan kepada penanggung jawab terkait.
        </p>
        <div class="submitted-actions">
          <AccessLink to="/blockers" class="btn-primary">
            <span>Buka Antrean Blocker</span>
            <ArrowRight :size="16" />
          </AccessLink>
          <button type="button" class="btn-secondary" @click="submittedTicket = null; title = ''; description = ''">
            Laporkan Kendala Lain
          </button>
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
                <option value="">— Tidak terkait tugas tertentu (Kendala Umum / Fasilitas) —</option>
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
                placeholder="Jelaskan fakta kendala, pesan error, serta langkah mandiri yang sudah dicoba... (min. 20 karakter)"
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

        <!-- Form Sticky Footer -->
        <div class="sticky-footer">
          <div class="footer-content">
            <span class="footer-hint">
              Pastikan fakta kendala akurat. Tiket yang diterbitkan tidak dapat dihapus (Audit Trail DEC-008).
            </span>
            <div class="footer-actions">
              <AccessLink to="/blockers" class="btn-secondary">Batal</AccessLink>
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitting || !isFormValid"
              >
                <span v-if="submitting">Menerbitkan Tiket...</span>
                <span v-else>Kirim Tiket Kendala</span>
              </button>
            </div>
          </div>
        </div>
      </form>
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

.btn-topbar:hover {
  background: #EFF5F2;
  color: #0E211B;
}

.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 100px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
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
  max-width: 620px;
}

.btn-blocker-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #00674D;
  background: #E6F4EE;
  color: #00674D;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
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
}

.pill-brand {
  background: #E6F4EE;
  color: #00674D;
}

.pill-sla {
  background: #EFF5F2;
  color: #5C6E68;
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

.sticky-footer {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid #DCE7E2;
  padding: 14px 20px;
  margin: 0 -20px;
  z-index: 25;
}

.footer-content {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-hint {
  font-size: 12px;
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
  max-width: 580px;
  margin: 40px auto;
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
  gap: 12px;
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
