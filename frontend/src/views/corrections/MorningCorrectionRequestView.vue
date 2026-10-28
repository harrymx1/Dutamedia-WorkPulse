<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-vue-next';

interface CommitmentItem {
  id: string;
  sequenceNo: number;
  taskText: string;
  referenceLink?: string;
  initialRisk: 'GREEN' | 'AMBER' | 'RED';
}

interface CorrectionHistoryItem {
  id: string;
  classification: 'MINOR' | 'MATERIAL';
  reason: string;
  status: 'PENDING' | 'AUTO_APPLIED' | 'APPROVED' | 'REJECTED';
  valueBefore: any;
  valueRequested: any;
  createdAt: string;
  reviewNote?: string;
  objectionWindowEndsAt?: string;
}

// State
const loading = ref(false);
const submitting = ref(false);
const todayCommitments = ref<CommitmentItem[]>([]);
const myCorrections = ref<CorrectionHistoryItem[]>([]);

// Form fields
const selectedCommitmentId = ref<string>('');
const classification = ref<'MINOR' | 'MATERIAL'>('MINOR');
const newTaskText = ref('');
const newReferenceLink = ref('');
const newInitialRisk = ref<'GREEN' | 'AMBER' | 'RED'>('GREEN');
const reason = ref('');

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

const selectedCommitment = computed(() => {
  return todayCommitments.value.find((c) => c.id === selectedCommitmentId.value) || null;
});

function handleCommitmentSelect() {
  if (selectedCommitment.value) {
    newTaskText.value = selectedCommitment.value.taskText;
    newReferenceLink.value = selectedCommitment.value.referenceLink || '';
    newInitialRisk.value = selectedCommitment.value.initialRisk;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const [todayRes, historyRes] = await Promise.all([
      apiClient<{ record?: { commitments?: CommitmentItem[] } }>('/daily/today'),
      apiClient<CorrectionHistoryItem[]>('/correction-requests'),
    ]);

    if (todayRes.data?.record?.commitments) {
      todayCommitments.value = todayRes.data.record.commitments;
      if (todayCommitments.value.length > 0 && !selectedCommitmentId.value) {
        selectedCommitmentId.value = todayCommitments.value[0].id;
        handleCommitmentSelect();
      }
    }

    if (historyRes.data) {
      myCorrections.value = historyRes.data;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat baseline komitmen.', true);
  } finally {
    loading.value = false;
  }
}

async function submitCorrection() {
  errorMessage.value = null;

  if (!selectedCommitmentId.value) {
    showToast('Pilih komitmen yang ingin dikoreksi.', true);
    return;
  }
  if (newTaskText.value.trim().length < 3) {
    showToast('Deskripsi komitmen baru minimal 3 karakter.', true);
    return;
  }
  if (reason.value.trim().length < 10) {
    showToast('Alasan permohonan koreksi minimal 10 karakter.', true);
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      targetCommitmentId: selectedCommitmentId.value,
      scopeType: 'MORNING_COMMITMENT',
      classification: classification.value,
      reason: reason.value.trim(),
      requestedChange: {
        taskText: newTaskText.value.trim(),
        referenceLink: newReferenceLink.value.trim() || null,
        initialRisk: newInitialRisk.value,
      },
    };

    const res = await apiClient<any>('/correction-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.status === 'AUTO_APPLIED') {
      showToast('Koreksi minor berhasil diterapkan seketika (AUTO_APPLIED).');
    } else {
      showToast('Permohonan koreksi material telah diajukan. Jendela keberatan aktif 24 jam.');
    }

    reason.value = '';
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal mengajukan koreksi.', true);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="correction-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Akuntabilitas / <strong>Koreksi Komitmen Pagi (Prototipe 16a)</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/corrections/eod" class="btn-topbar">Koreksi EOD</router-link>
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
      <!-- Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Pengecualian Formal &amp; Jejak Audit Anti-Backdating</span>
          <h1>Permohonan Koreksi Komitmen Pagi</h1>
          <p class="subtitle">
            Gunakan formulir resmi ini jika Anda memerlukan perbaikan komitmen pagi setelah batas waktu cut-off terkunci (DEC-002). Perubahan minor diterapkan seketika, sedangkan perubahan material ditinjau oleh Atasan Langsung.
          </p>
        </div>
      </div>

      <!-- State: No commitments to correct -->
      <div v-if="todayCommitments.length === 0 && !loading" class="no-baseline-card">
        <AlertCircle :size="32" class="empty-icon" />
        <h2>Tidak Ada Komitmen Hari Ini</h2>
        <p>Anda belum mengisi komitmen pagi hari ini, atau komitmen belum terkunci.</p>
        <router-link to="/daily/morning" class="btn-primary" style="margin-top: 14px;">
          Buka Morning Commitment
        </router-link>
      </div>

      <div v-else class="split-layout">
        <!-- Panel Formulir Koreksi -->
        <section class="panel form-panel">
          <div class="panel-head">
            <h2>Formulir Pengajuan Koreksi Komparatif</h2>
            <p class="panel-desc">Perbandingan baseline tersimpan dan perubahan yang diajukan.</p>
          </div>

          <form class="panel-body" @submit.prevent="submitCorrection">
            <!-- Pilih Komitmen Target -->
            <div class="form-group">
              <label for="comSelect">Pilih Komitmen yang Ingin Dikoreksi <span class="req">*</span></label>
              <select id="comSelect" v-model="selectedCommitmentId" @change="handleCommitmentSelect" required>
                <option v-for="c in todayCommitments" :key="c.id" :value="c.id">
                  [Komitmen #{{ c.sequenceNo }}] {{ c.taskText }} ({{ c.initialRisk }})
                </option>
              </select>
            </div>

            <!-- Baseline Snapshot Box -->
            <div v-if="selectedCommitment" class="baseline-box">
              <span class="baseline-tag">Baseline Tersimpan (Locked)</span>
              <div class="base-task">{{ selectedCommitment.taskText }}</div>
              <div class="base-meta">
                <span>Risiko Awal: <strong>{{ selectedCommitment.initialRisk }}</strong></span>
                <span v-if="selectedCommitment.referenceLink">· Link: {{ selectedCommitment.referenceLink }}</span>
              </div>
            </div>

            <!-- Klasifikasi Perubahan (Minor vs Material - SAD 2.4) -->
            <div class="form-group">
              <label>Klasifikasi Perubahan <span class="req">*</span></label>
              <div class="class-grid">
                <label class="class-card" :class="{ selected: classification === 'MINOR' }">
                  <input type="radio" v-model="classification" value="MINOR" />
                  <div class="class-title">
                    <ShieldCheck :size="16" />
                    <strong>Perubahan Minor</strong>
                  </div>
                  <p>Koreksi salah ketik (typo) atau perbaikan tautan referensi. Diterapkan seketika secara otomatis (AUTO_APPLIED).</p>
                </label>

                <label class="class-card" :class="{ selected: classification === 'MATERIAL' }">
                  <input type="radio" v-model="classification" value="MATERIAL" />
                  <div class="class-title">
                    <AlertTriangle :size="16" />
                    <strong>Perubahan Material</strong>
                  </div>
                  <p>Perubahan substansial target komitmen atau risiko. Membuka jendela sanggahan 24 jam untuk review Atasan.</p>
                </label>
              </div>
            </div>

            <!-- Teks Komitmen Baru -->
            <div class="form-group">
              <label for="newTaskInput">Deskripsi Komitmen Baru yang Diajukan <span class="req">*</span></label>
              <textarea
                id="newTaskInput"
                v-model="newTaskText"
                rows="3"
                required
                minlength="3"
                placeholder="Tuliskan rumusan komitmen yang telah diperbaiki..."
              ></textarea>
            </div>

            <!-- Link Referensi Baru -->
            <div class="form-group">
              <label for="newLinkInput">Tautan Referensi Baru <span class="opt">(opsional)</span></label>
              <input
                id="newLinkInput"
                v-model="newReferenceLink"
                type="text"
                placeholder="https://github.com/... atau tautan tiket tugas"
              />
            </div>

            <!-- Risiko Baru -->
            <div class="form-group">
              <label>Tingkat Risiko Baru</label>
              <div class="risk-options">
                <label class="risk-label green" :class="{ selected: newInitialRisk === 'GREEN' }">
                  <input type="radio" v-model="newInitialRisk" value="GREEN" />
                  <span>GREEN (Lancar)</span>
                </label>
                <label class="risk-label amber" :class="{ selected: newInitialRisk === 'AMBER' }">
                  <input type="radio" v-model="newInitialRisk" value="AMBER" />
                  <span>AMBER (Waspada)</span>
                </label>
                <label class="risk-label red" :class="{ selected: newInitialRisk === 'RED' }">
                  <input type="radio" v-model="newInitialRisk" value="RED" />
                  <span>RED (Kritis)</span>
                </label>
              </div>
            </div>

            <!-- Alasan Koreksi Resmi -->
            <div class="form-group">
              <label for="reasonInput">Alasan Resmi Permohonan Koreksi <span class="req">*</span></label>
              <textarea
                id="reasonInput"
                v-model="reason"
                rows="3"
                minlength="10"
                required
                placeholder="Jelaskan alasan objektif pengajuan perbaikan pasca-cutoff ini (min. 10 karakter)..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn-submit"
              :disabled="submitting || reason.trim().length < 10"
            >
              <span v-if="submitting">Mengajukan...</span>
              <span v-else>Kirim Permohonan Koreksi</span>
            </button>
          </form>
        </section>

        <!-- Panel Riwayat Permohonan Koreksi -->
        <section class="panel history-panel">
          <div class="panel-head">
            <h2>Riwayat Permohonan Koreksi</h2>
            <p class="panel-desc">Jejak audit append-only yang tidak dapat dimanipulasi.</p>
          </div>

          <div class="panel-body">
            <div v-if="myCorrections.length === 0" class="empty-feed">
              <History :size="32" class="empty-icon" />
              <p>Belum ada rekaman permohonan koreksi yang diajukan.</p>
            </div>

            <div v-else class="history-list">
              <div
                v-for="item in myCorrections"
                :key="item.id"
                class="history-card"
                :class="item.status.toLowerCase()"
              >
                <div class="hist-head">
                  <div class="hist-badges">
                    <span class="status-badge" :class="item.status.toLowerCase()">
                      {{ item.status }}
                    </span>
                    <span class="class-pill">{{ item.classification }}</span>
                  </div>
                  <span class="hist-date">
                    {{ new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'short' }) }}
                  </span>
                </div>

                <div class="hist-diff">
                  <div class="diff-before">
                    <small>Sebelum:</small>
                    <p>{{ item.valueBefore?.taskText || JSON.stringify(item.valueBefore) }}</p>
                  </div>
                  <div class="diff-arrow"><ArrowRight :size="14" /></div>
                  <div class="diff-after">
                    <small>Diajukan:</small>
                    <p>{{ item.valueRequested?.taskText || JSON.stringify(item.valueRequested) }}</p>
                  </div>
                </div>

                <div class="hist-reason">
                  <strong>Alasan:</strong> {{ item.reason }}
                </div>

                <div v-if="item.reviewNote" class="hist-review-note">
                  <strong>Catatan Peninjau:</strong> {{ item.reviewNote }}
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
.correction-layout {
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
  max-width: 780px;
}

.split-layout {
  display: grid;
  grid-template-columns: 520px 1fr;
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
}

.panel-head h2 {
  font-size: 16px;
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
  display: block;
  margin-bottom: 6px;
}

.req { color: #991B1B; }
.opt { font-size: 11px; color: #66736E; font-weight: normal; }

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  box-sizing: border-box;
}

.baseline-box {
  background: #F1F5F4;
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.baseline-tag {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: #5C6E68;
}

.base-task {
  font-size: 13px;
  font-weight: 600;
  margin: 4px 0;
}

.base-meta {
  font-size: 11.5px;
  color: #5C6E68;
}

.class-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.class-card {
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  background: #fff;
}

.class-card input { display: none; }
.class-card.selected { border-color: #00674D; background: #F4FBF7; }

.class-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.class-card strong { font-size: 12px; }
.class-card p { font-size: 11px; color: #5C6E68; margin: 0; line-height: 1.35; }

.risk-options {
  display: flex;
  gap: 10px;
}

.risk-label {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #DCE7E2;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.risk-label input { display: none; }
.risk-label.green.selected { background: #DCFCE7; color: #166534; border-color: #86EFAC; }
.risk-label.amber.selected { background: #FEF3C7; color: #92400E; border-color: #FCD34D; }
.risk-label.red.selected { background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }

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
  margin-top: 8px;
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 12px 14px;
}

.history-card.auto_applied { border-left: 4px solid #166534; }
.history-card.pending { border-left: 4px solid #D97706; }
.history-card.approved { border-left: 4px solid #00674D; }
.history-card.rejected { border-left: 4px solid #DC2626; }

.hist-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hist-badges {
  display: flex;
  gap: 6px;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-badge.auto_applied { background: #DCFCE7; color: #166534; }
.status-badge.pending { background: #FEF3C7; color: #92400E; }
.status-badge.approved { background: #E6F4EE; color: #00674D; }
.status-badge.rejected { background: #FEE2E2; color: #991B1B; }

.class-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #EFF5F2;
  color: #5C6E68;
}

.hist-date {
  font-size: 11px;
  color: #5C6E68;
}

.hist-diff {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FAFCFB;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 12px;
}

.diff-before, .diff-after { flex: 1; }
.diff-before small, .diff-after small { color: #5C6E68; font-weight: 700; display: block; }
.diff-before p, .diff-after p { margin: 2px 0 0; }
.diff-arrow { color: #5C6E68; flex-shrink: 0; }

.hist-reason {
  font-size: 12px;
  color: #0E211B;
}

.hist-review-note {
  font-size: 11.5px;
  color: #00674D;
  background: #E6F4EE;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 6px;
}

.no-baseline-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  max-width: 500px;
  margin: 40px auto;
}

.empty-icon { color: #00674D; margin-bottom: 8px; }

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
  .split-layout { grid-template-columns: 1fr; }
}
</style>
