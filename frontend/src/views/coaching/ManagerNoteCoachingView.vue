<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Award,
  Sparkles,
  BookOpen,
  ShieldAlert,
} from 'lucide-vue-next';

interface TeamMember {
  user: { id: string; fullName: string; email: string };
  jobTitle: string;
  function: string;
  totalNotes: number;
  lastNote: any;
  lastComplianceStage: string;
}

interface NoteItem {
  id: string;
  noteType: 'COACHING' | 'RECOGNITION' | 'CORRECTIVE';
  visibility: 'CONFIDENTIAL_MANAGER_ONLY' | 'SHARED_WITH_EMPLOYEE';
  content: string;
  createdAt: string;
  authorUser: { id: string; fullName: string; email: string };
  subjectUser?: { id: string; fullName: string; email: string };
}

const authStore = useAuthStore();

// State
const loading = ref(false);
const submitting = ref(false);
const teamOverview = ref<TeamMember[]>([]);
const notesFeed = ref<NoteItem[]>([]);
const selectedSubjectId = ref<string>('');

// Form state
const formSubjectId = ref<string>('');
const formNoteType = ref<'COACHING' | 'RECOGNITION' | 'CORRECTIVE'>('COACHING');
const formVisibility = ref<'CONFIDENTIAL_MANAGER_ONLY' | 'SHARED_WITH_EMPLOYEE'>('SHARED_WITH_EMPLOYEE');
const formContent = ref('');

// Toast
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

async function loadTeamData() {
  loading.value = true;
  try {
    const res = await apiClient<TeamMember[]>('/coaching/team');
    if (res.data) {
      teamOverview.value = res.data;
      if (teamOverview.value.length > 0) {
        if (!formSubjectId.value) {
          formSubjectId.value = teamOverview.value[0].user.id;
        }
        if (!selectedSubjectId.value) {
          selectedSubjectId.value = teamOverview.value[0].user.id;
        }
        await loadNotesForSubject(selectedSubjectId.value);
      } else {
        // Jika bukan manajer yang membawahi staf, load catatan untuk diri sendiri
        const meId = authStore.user?.id;
        if (meId) {
          await loadNotesForSubject(meId);
        }
      }
    }
  } catch (err: any) {
    console.error('Failed to load team overview:', err);
  } finally {
    loading.value = false;
  }
}

async function loadNotesForSubject(subjectId: string) {
  try {
    const res = await apiClient<NoteItem[]>(`/coaching/users/${subjectId}`);
    if (res.data) {
      notesFeed.value = res.data;
    }
  } catch (err: any) {
    console.error('Failed to load notes for subject:', err);
  }
}

async function handleFilterChange() {
  if (selectedSubjectId.value) {
    await loadNotesForSubject(selectedSubjectId.value);
  }
}

function applyTemplate(templateType: 'coaching' | 'recognition' | 'corrective') {
  if (templateType === 'coaching') {
    formNoteType.value = 'COACHING';
    formContent.value =
`[Fokus Pengembangan]: Peningkatan akurasi estimasi waktu komitmen harian.
[Fakta Objektif]: Terdapat 3 carry-over berturut-turut pada tugas integrasi API.
[Saran Perbaikan]: Pecah tugas besar menjadi sub-komitmen dengan estimasi maksimal 3 jam.
[Target Evaluasi]: Ditinjau kembali pada sesi 1-on-1 minggu depan.`;
  } else if (templateType === 'recognition') {
    formNoteType.value = 'RECOGNITION';
    formVisibility.value = 'SHARED_WITH_EMPLOYEE';
    formContent.value =
`[Apresiasi Prestasi]: Penanganan cepat blocker kritis production (SLA < 45 menit).
[Dampak Positif]: Klien tidak mengalami gangguan transaksi pembayaran.
[Umpan Balik]: Inisiatif kolaborasi lintas tim berjalan sangat baik. Terima kasih atas dedikasinya!`;
  } else {
    formNoteType.value = 'CORRECTIVE';
    formContent.value =
`[Pelanggaran / Deviasi]: Keterlambatan check-in pagi tanpa justifikasi izin resmi (DEC-002).
[Fakta]: Terlewat batas waktu cut-off 09:30 WIB sebanyak 2 kali dalam minggu ini.
[Langkah Korektif]: Wajib menyampaikan permohonan dispensasi resmi jika terjadi keadaan kahar.`;
  }
}

async function submitNote() {
  errorMessage.value = null;

  if (!formSubjectId.value) {
    showToast('Pilih karyawan subjek pembinaan.', true);
    return;
  }
  if (formContent.value.trim().length < 10) {
    showToast('Isi catatan pembinaan minimal 10 karakter berbasis fakta objektif.', true);
    return;
  }

  submitting.value = true;
  try {
    await apiClient('/coaching/notes', {
      method: 'POST',
      body: JSON.stringify({
        subjectUserId: formSubjectId.value,
        noteType: formNoteType.value,
        visibility: formVisibility.value,
        content: formContent.value.trim(),
      }),
    });

    showToast('Catatan pembinaan berhasil disimpan.');
    formContent.value = '';
    await loadTeamData();
    if (selectedSubjectId.value === formSubjectId.value) {
      await loadNotesForSubject(selectedSubjectId.value);
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan catatan pembinaan.', true);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadTeamData();
});
</script>

<template>
  <div class="coaching-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Manajerial / <strong>Catatan Evaluasi Kerja &amp; Pembinaan Tim (Prototipe 10)</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/blockers" class="btn-topbar">Antrean Blocker</router-link>
        <router-link to="/daily/morning" class="btn-topbar">My Today</router-link>
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
          <span class="eyebrow">Manajemen Kinerja &amp; Umpan Balik Positif</span>
          <h1>Catatan Evaluasi Kerja &amp; Pembinaan Tim</h1>
          <p class="subtitle">
            Ruang pembinaan terstruktur 1-on-1 bagi Atasan dan Tim. Rekam catatan bimbingan (Coaching), apresiasi (Recognition), serta tindakan korektif secara transparan atau rahasia manajerial.
          </p>
        </div>
      </div>

      <!-- Team Overview Cards Bar -->
      <div v-if="teamOverview.length > 0" class="team-cards-grid">
        <div
          v-for="member in teamOverview"
          :key="member.user.id"
          class="member-card"
          :class="{ selected: selectedSubjectId === member.user.id }"
          @click="selectedSubjectId = member.user.id; handleFilterChange()"
        >
          <div class="member-top">
            <div class="member-avatar">
              {{ member.user.fullName.substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <div class="member-name">{{ member.user.fullName }}</div>
              <div class="member-role">{{ member.jobTitle || 'Anggota Tim' }}</div>
            </div>
          </div>
          <div class="member-stats">
            <span class="stat-pill">
              <BookOpen :size="12" /> {{ member.totalNotes }} Catatan
            </span>
            <span
              class="stage-pill"
              :class="{
                'stage-clean': member.lastComplianceStage === 'CLEAN',
                'stage-alert': member.lastComplianceStage !== 'CLEAN'
              }"
            >
              {{ member.lastComplianceStage === 'CLEAN' ? 'Kepatuhan Baik' : member.lastComplianceStage }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2-Column Split: Form (Left) & Feed (Right) -->
      <div class="coaching-split">
        <!-- Panel Kiri: Form Catatan Baru -->
        <section class="panel form-panel">
          <div class="panel-head">
            <div>
              <h2>Buat Catatan Pembinaan Baru</h2>
              <p class="panel-desc">Tuliskan bimbingan atau umpan balik berbasis fakta objektif.</p>
            </div>
          </div>

          <form class="panel-body" @submit.prevent="submitNote">
            <!-- Pilihan Subjek Karyawan -->
            <div class="form-group">
              <label for="subjectSelect">Karyawan yang Dituju <span class="req">*</span></label>
              <select id="subjectSelect" v-model="formSubjectId" required>
                <option value="" disabled>-- Pilih Anggota Tim --</option>
                <option v-for="m in teamOverview" :key="m.user.id" :value="m.user.id">
                  {{ m.user.fullName }} ({{ m.jobTitle || m.function }})
                </option>
              </select>
            </div>

            <!-- Jenis Catatan (NoteType) -->
            <div class="form-group">
              <div class="label-row">
                <label>Jenis Catatan (Type) <span class="req">*</span></label>
              </div>
              <div class="type-selector-grid">
                <label class="type-option coaching" :class="{ selected: formNoteType === 'COACHING' }">
                  <input type="radio" v-model="formNoteType" value="COACHING" />
                  <Sparkles :size="16" />
                  <span>Coaching</span>
                </label>

                <label class="type-option recognition" :class="{ selected: formNoteType === 'RECOGNITION' }">
                  <input type="radio" v-model="formNoteType" value="RECOGNITION" />
                  <Award :size="16" />
                  <span>Recognition</span>
                </label>

                <label class="type-option corrective" :class="{ selected: formNoteType === 'CORRECTIVE' }">
                  <input type="radio" v-model="formNoteType" value="CORRECTIVE" />
                  <ShieldAlert :size="16" />
                  <span>Corrective</span>
                </label>
              </div>
            </div>

            <!-- Visibilitas (Visibility) -->
            <div class="form-group">
              <label>Tingkat Visibilitas <span class="req">*</span></label>
              <div class="vis-selector-grid">
                <label class="vis-card" :class="{ selected: formVisibility === 'SHARED_WITH_EMPLOYEE' }">
                  <input type="radio" v-model="formVisibility" value="SHARED_WITH_EMPLOYEE" />
                  <div class="vis-icon"><Eye :size="18" /></div>
                  <div>
                    <strong>Dibagikan ke Karyawan</strong>
                    <small>Karyawan dapat membaca catatan ini di laman profil &amp; menerima notifikasi in-app.</small>
                  </div>
                </label>

                <label class="vis-card" :class="{ selected: formVisibility === 'CONFIDENTIAL_MANAGER_ONLY' }">
                  <input type="radio" v-model="formVisibility" value="CONFIDENTIAL_MANAGER_ONLY" />
                  <div class="vis-icon"><EyeOff :size="18" /></div>
                  <div>
                    <strong>Rahasia (Manager Only)</strong>
                    <small>Hanya dapat diakses oleh Anda dan jajaran manajemen eksekutif.</small>
                  </div>
                </label>
              </div>
            </div>

            <!-- Template Cepat -->
            <div class="template-actions">
              <span class="template-label">Template Cepat:</span>
              <button type="button" class="btn-template" @click="applyTemplate('coaching')">Bimbingan 1-on-1</button>
              <button type="button" class="btn-template" @click="applyTemplate('recognition')">Apresiasi Blocker</button>
              <button type="button" class="btn-template" @click="applyTemplate('corrective')">Koreksi Kepatuhan</button>
            </div>

            <!-- Isi Catatan -->
            <div class="form-group">
              <label for="noteContent">Isi Catatan Pembinaan <span class="req">*</span></label>
              <textarea
                id="noteContent"
                v-model="formContent"
                rows="6"
                minlength="10"
                placeholder="Tuliskan catatan berbasis fakta nyata, saran perbaikan, atau apresiasi konkret (min. 10 karakter)..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn-submit"
              :disabled="submitting || formContent.trim().length < 10"
            >
              <span v-if="submitting">Menyimpan Catatan...</span>
              <span v-else>Simpan Catatan Pembinaan</span>
            </button>
          </form>
        </section>

        <!-- Panel Kanan: Riwayat Catatan Feed -->
        <section class="panel feed-panel">
          <div class="panel-head">
            <div>
              <h2>Riwayat Catatan Evaluasi &amp; Pembinaan</h2>
              <p class="panel-desc">Thread pembinaan aktif untuk anggota tim terpilih.</p>
            </div>
            <div class="filter-subject">
              <select v-model="selectedSubjectId" @change="handleFilterChange">
                <option v-for="m in teamOverview" :key="m.user.id" :value="m.user.id">
                  {{ m.user.fullName }}
                </option>
              </select>
            </div>
          </div>

          <div class="panel-body feed-body">
            <div v-if="notesFeed.length === 0" class="empty-feed">
              <BookOpen :size="32" class="empty-icon" />
              <h3>Belum Ada Catatan Pembinaan</h3>
              <p>Belum ada rekaman coaching atau umpan balik yang dicatat untuk anggota tim ini.</p>
            </div>

            <div v-else class="feed-list">
              <article
                v-for="note in notesFeed"
                :key="note.id"
                class="note-card"
                :class="note.noteType.toLowerCase()"
              >
                <div class="note-head">
                  <div class="note-type-cluster">
                    <span class="note-type-badge" :class="note.noteType.toLowerCase()">
                      {{ note.noteType }}
                    </span>
                    <span
                      class="vis-pill"
                      :class="note.visibility === 'SHARED_WITH_EMPLOYEE' ? 'vis-shared' : 'vis-confidential'"
                    >
                      {{ note.visibility === 'SHARED_WITH_EMPLOYEE' ? 'Dibagikan' : 'Rahasia Manajer' }}
                    </span>
                  </div>
                  <div class="note-date">
                    {{ new Date(note.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}
                  </div>
                </div>

                <div class="note-author">
                  <span>Dicatat oleh: <strong>{{ note.authorUser.fullName }}</strong></span>
                </div>

                <div class="note-content">
                  {{ note.content }}
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.coaching-layout {
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

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

.page-heading {
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

.team-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.member-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.member-card:hover {
  border-color: #00674D;
}

.member-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
  box-shadow: 0 0 0 1px #00674D;
}

.member-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E6F4EE;
  color: #00674D;
  font-weight: 800;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-name {
  font-size: 13px;
  font-weight: 700;
}

.member-role {
  font-size: 11.5px;
  color: #5C6E68;
}

.member-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-pill {
  font-size: 11px;
  color: #5C6E68;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stage-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.stage-clean { background: #DCFCE7; color: #166534; }
.stage-alert { background: #FEF3C7; color: #92400E; }

.coaching-split {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 20px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.panel-desc {
  font-size: 12px;
  color: #5C6E68;
  margin-top: 2px;
}

.panel-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  font-size: 12.5px;
  font-weight: 700;
  color: #0E211B;
  display: block;
  margin-bottom: 6px;
}

.req { color: #991B1B; }

select,
textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  color: #0E211B;
  box-sizing: border-box;
}

select:focus,
textarea:focus {
  outline: none;
  border-color: #00674D;
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
}

.type-selector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-option {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  background: #fff;
}

.type-option input { display: none; }

.type-option.coaching.selected { border-color: #00674D; background: #E6F4EE; color: #00674D; }
.type-option.recognition.selected { border-color: #D97706; background: #FEF3C7; color: #92400E; }
.type-option.corrective.selected { border-color: #DC2626; background: #FEE2E2; color: #991B1B; }

.vis-selector-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.vis-card {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: #fff;
}

.vis-card input { display: none; }

.vis-card.selected {
  border-color: #00674D;
  background: #F4FBF7;
}

.vis-icon {
  color: #00674D;
  flex-shrink: 0;
}

.vis-card strong {
  font-size: 12.5px;
  display: block;
}

.vis-card small {
  font-size: 11px;
  color: #5C6E68;
}

.template-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.template-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #5C6E68;
}

.btn-template {
  background: #EFF5F2;
  border: 1px solid #DCE7E2;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #00674D;
  cursor: pointer;
}

.btn-template:hover {
  background: #E6F4EE;
  border-color: #00674D;
}

.btn-submit {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feed-body {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.empty-feed {
  padding: 60px 20px;
  text-align: center;
  color: #5C6E68;
}

.empty-icon {
  color: #00674D;
  margin-bottom: 8px;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.note-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 10px;
  padding: 14px 16px;
}

.note-card.coaching { border-left: 4px solid #00674D; }
.note-card.recognition { border-left: 4px solid #D97706; }
.note-card.corrective { border-left: 4px solid #DC2626; }

.note-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-type-cluster {
  display: flex;
  gap: 6px;
  align-items: center;
}

.note-type-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.note-type-badge.coaching { background: #E6F4EE; color: #00674D; }
.note-type-badge.recognition { background: #FEF3C7; color: #92400E; }
.note-type-badge.corrective { background: #FEE2E2; color: #991B1B; }

.vis-pill {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.vis-shared { background: #EFF5F2; color: #5C6E68; }
.vis-confidential { background: #FEE2E2; color: #991B1B; }

.note-date {
  font-size: 11.5px;
  color: #5C6E68;
}

.note-author {
  font-size: 11.5px;
  color: #5C6E68;
  margin-bottom: 8px;
}

.note-content {
  font-size: 13px;
  line-height: 1.5;
  color: #0E211B;
  white-space: pre-line;
  background: #FAFCFB;
  padding: 10px 12px;
  border-radius: 6px;
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
  .coaching-split {
    grid-template-columns: 1fr;
  }
}
</style>
