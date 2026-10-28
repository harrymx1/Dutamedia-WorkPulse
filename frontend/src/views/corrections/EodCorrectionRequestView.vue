<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-vue-next';

interface CommitmentItem {
  id: string;
  sequenceNo: number;
  taskText: string;
  outcome?: 'DONE' | 'IN_PROGRESS' | 'BLOCKED' | 'DROPPED';
  outcomeReason?: string;
  continuation?: 'CONTINUE_TOMORROW' | 'ARCHIVE' | 'HANDOVER';
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
}

// State
const loading = ref(false);
const submitting = ref(false);
const todayCommitments = ref<CommitmentItem[]>([]);
const myCorrections = ref<CorrectionHistoryItem[]>([]);

// Form fields
const selectedCommitmentId = ref<string>('');
const classification = ref<'MINOR' | 'MATERIAL'>('MINOR');
const newOutcome = ref<'DONE' | 'IN_PROGRESS' | 'BLOCKED' | 'DROPPED'>('DONE');
const newOutcomeReason = ref('');
const newContinuation = ref<'CONTINUE_TOMORROW' | 'ARCHIVE' | 'HANDOVER'>('ARCHIVE');
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
    newOutcome.value = selectedCommitment.value.outcome || 'DONE';
    newOutcomeReason.value = selectedCommitment.value.outcomeReason || '';
    newContinuation.value = selectedCommitment.value.continuation || 'ARCHIVE';
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
      myCorrections.value = historyRes.data.filter((h: any) => h.scopeType === 'EOD_OUTCOME');
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat baseline EOD.', true);
  } finally {
    loading.value = false;
  }
}

async function submitCorrection() {
  errorMessage.value = null;

  if (!selectedCommitmentId.value) {
    showToast('Pilih tugas/komitmen yang ingin dikoreksi.', true);
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
      scopeType: 'EOD_OUTCOME',
      classification: classification.value,
      reason: reason.value.trim(),
      requestedChange: {
        outcome: newOutcome.value,
        outcomeReason: newOutcomeReason.value.trim() || null,
        continuation: newContinuation.value,
      },
    };

    const res = await apiClient<any>('/correction-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.status === 'AUTO_APPLIED') {
      showToast('Koreksi minor EOD berhasil diterapkan seketika (AUTO_APPLIED).');
    } else {
      showToast('Permohonan koreksi material EOD diajukan. Jendela sanggahan 24 jam dibuka.');
    }

    reason.value = '';
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal mengajukan koreksi EOD.', true);
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
        <span class="breadcrumb">Akuntabilitas / <strong>Koreksi Evaluasi Sore EOD (Prototipe 16b)</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/corrections/morning" class="btn-topbar">Koreksi Morning</router-link>
        <router-link to="/daily/eod" class="btn-topbar">EOD Outcome</router-link>
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
          <span class="eyebrow">Pengecualian Formal &amp; Hasil Akhir Harian</span>
          <h1>Permohonan Koreksi Evaluasi Sore (EOD)</h1>
          <p class="subtitle">
            Koreksi hasil capaian EOD setelah batas waktu cut-off 21:00 WIB terkunci (DEC-002). Pilihan hasil akhir tidak pernah membatasi refleksi mandiri GREEN Anda (DEC-003).
          </p>
        </div>
      </div>

      <div class="split-layout">
        <!-- Panel Form Koreksi EOD -->
        <section class="panel form-panel">
          <div class="panel-head">
            <h2>Formulir Pengajuan Koreksi Evaluasi Sore</h2>
            <p class="panel-desc">Perbaikan hasil capaian kerja yang telah terkunci.</p>
          </div>

          <form class="panel-body" @submit.prevent="submitCorrection">
            <!-- Pilih Tugas -->
            <div class="form-group">
              <label for="eodSelect">Pilih Komitmen / Tugas Target <span class="req">*</span></label>
              <select id="eodSelect" v-model="selectedCommitmentId" @change="handleCommitmentSelect" required>
                <option v-for="c in todayCommitments" :key="c.id" :value="c.id">
                  [Tugas #{{ c.sequenceNo }}] {{ c.taskText }} (Hasil: {{ c.outcome || 'BELUM DIISI' }})
                </option>
              </select>
            </div>

            <!-- Baseline Snapshot -->
            <div v-if="selectedCommitment" class="baseline-box">
              <span class="baseline-tag">Baseline EOD Tersimpan</span>
              <div class="base-task">{{ selectedCommitment.taskText }}</div>
              <div class="base-meta">
                <span>Hasil: <strong>{{ selectedCommitment.outcome || 'Belum diisi' }}</strong></span>
                <span v-if="selectedCommitment.outcomeReason">· Catatan: {{ selectedCommitment.outcomeReason }}</span>
              </div>
            </div>

            <!-- Klasifikasi -->
            <div class="form-group">
              <label>Klasifikasi Perubahan <span class="req">*</span></label>
              <div class="class-grid">
                <label class="class-card" :class="{ selected: classification === 'MINOR' }">
                  <input type="radio" v-model="classification" value="MINOR" />
                  <div class="class-title">
                    <ShieldCheck :size="16" />
                    <strong>Perubahan Minor</strong>
                  </div>
                  <p>Penjelasan redaksional tambahan atau koreksi kecil. Diterapkan otomatis (AUTO_APPLIED).</p>
                </label>

                <label class="class-card" :class="{ selected: classification === 'MATERIAL' }">
                  <input type="radio" v-model="classification" value="MATERIAL" />
                  <div class="class-title">
                    <AlertTriangle :size="16" />
                    <strong>Perubahan Material</strong>
                  </div>
                  <p>Perubahan status capaian (misal dari BLOCKED ke DONE). Membuka 24 jam Objection Window.</p>
                </label>
              </div>
            </div>

            <!-- Hasil Baru yang Diajukan (DEC-003: GREEN Tidak Boleh Terkunci) -->
            <div class="form-group">
              <label>Hasil Baru yang Diajukan (Outcome) <span class="req">*</span></label>
              <div class="outcome-grid">
                <label class="outcome-card done" :class="{ selected: newOutcome === 'DONE' }">
                  <input type="radio" v-model="newOutcome" value="DONE" />
                  <CheckCircle2 :size="16" />
                  <span>DONE (Tuntas)</span>
                </label>
                <label class="outcome-card in-progress" :class="{ selected: newOutcome === 'IN_PROGRESS' }">
                  <input type="radio" v-model="newOutcome" value="IN_PROGRESS" />
                  <Clock :size="16" />
                  <span>IN_PROGRESS</span>
                </label>
                <label class="outcome-card blocked" :class="{ selected: newOutcome === 'BLOCKED' }">
                  <input type="radio" v-model="newOutcome" value="BLOCKED" />
                  <AlertTriangle :size="16" />
                  <span>BLOCKED</span>
                </label>
                <label class="outcome-card dropped" :class="{ selected: newOutcome === 'DROPPED' }">
                  <input type="radio" v-model="newOutcome" value="DROPPED" />
                  <AlertCircle :size="16" />
                  <span>DROPPED</span>
                </label>
              </div>
            </div>

            <!-- Alasan Hasil Baru -->
            <div class="form-group">
              <label for="outcomeReasonInput">Keterangan Hasil yang Diajukan</label>
              <textarea
                id="outcomeReasonInput"
                v-model="newOutcomeReason"
                rows="2"
                placeholder="Penjelasan ringkas mengenai hasil capaian yang diajukan..."
              ></textarea>
            </div>

            <!-- Kelanjutan Tugas -->
            <div class="form-group">
              <label for="continuationSelect">Status Kelanjutan Tugas</label>
              <select id="continuationSelect" v-model="newContinuation">
                <option value="CONTINUE_TOMORROW">Lanjutkan Besok (Carry-Forward)</option>
                <option value="ARCHIVE">Arsipkan / Tuntas</option>
                <option value="HANDOVER">Serah Terima ke Rekan Lain</option>
              </select>
            </div>

            <!-- Alasan Koreksi Resmi -->
            <div class="form-group">
              <label for="eodReasonInput">Alasan Resmi Permohonan Koreksi <span class="req">*</span></label>
              <textarea
                id="eodReasonInput"
                v-model="reason"
                rows="3"
                minlength="10"
                required
                placeholder="Tuliskan justifikasi objektif mengapa evaluasi EOD ini perlu dikoreksi (min. 10 karakter)..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="btn-submit"
              :disabled="submitting || reason.trim().length < 10"
            >
              <span v-if="submitting">Mengajukan...</span>
              <span v-else>Kirim Permohonan Koreksi EOD</span>
            </button>
          </form>
        </section>

        <!-- Panel Riwayat Koreksi EOD -->
        <section class="panel history-panel">
          <div class="panel-head">
            <h2>Riwayat Permohonan Koreksi EOD</h2>
            <p class="panel-desc">Audit trail resmi permohonan koreksi hasil akhir.</p>
          </div>

          <div class="panel-body">
            <div v-if="myCorrections.length === 0" class="empty-feed">
              <History :size="32" class="empty-icon" />
              <p>Belum ada permohonan koreksi EOD yang tercatat.</p>
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
                    <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
                    <span class="class-pill">{{ item.classification }}</span>
                  </div>
                  <span class="hist-date">
                    {{ new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'short' }) }}
                  </span>
                </div>

                <div class="hist-diff">
                  <div class="diff-before">
                    <small>Sebelum:</small>
                    <p>{{ item.valueBefore?.outcome || 'Belum diisi' }}</p>
                  </div>
                  <div class="diff-arrow"><ArrowRight :size="14" /></div>
                  <div class="diff-after">
                    <small>Diajukan:</small>
                    <p>{{ item.valueRequested?.outcome }}</p>
                  </div>
                </div>

                <div class="hist-reason">
                  <strong>Alasan:</strong> {{ item.reason }}
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

.outcome-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.outcome-card {
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: #fff;
}

.outcome-card input { display: none; }
.outcome-card.done.selected { background: #DCFCE7; color: #166534; border-color: #86EFAC; }
.outcome-card.in-progress.selected { background: #FEF3C7; color: #92400E; border-color: #FCD34D; }
.outcome-card.blocked.selected { background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }
.outcome-card.dropped.selected { background: #F1F5F9; color: #334155; border-color: #CBD5E1; }

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

.empty-feed {
  padding: 60px 20px;
  text-align: center;
  color: #5C6E68;
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

