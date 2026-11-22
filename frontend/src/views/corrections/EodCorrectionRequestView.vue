<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { formatDateWib } from '../../utils/dateTime';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from 'lucide-vue-next';

interface CommitmentItem {
  id: string;
  sequenceNo: number;
  taskText: string;
  outcome?: string | null;
  outcomeReason?: string;
  continuation?: string | null;
}

interface CorrectionHistoryItem {
  id: string;
  targetCommitmentId?: string;
  scopeType?: 'MORNING_COMMITMENT' | 'EOD_OUTCOME';
  classification: 'MINOR' | 'MATERIAL';
  reason: string;
  status: 'PENDING' | 'AUTO_APPLIED' | 'APPROVED' | 'REJECTED';
  valueBefore: any;
  valueRequested: any;
  createdAt: string;
  reviewNote?: string;
  objectionWindowEndsAt?: string;
  targetCommitment?: {
    id?: string;
    sequenceNo?: number;
    taskText?: string;
  };
  reviewedByUser?: {
    id?: string;
    fullName?: string;
    email?: string;
  };
}

// State
const loading = ref(false);
const submitting = ref(false);
const todayCommitments = ref<CommitmentItem[]>([]);
const myCorrections = ref<CorrectionHistoryItem[]>([]);
const eodSubmittedAt = ref<string | null>(null);
const eodLockCutoff = ref('21:00');

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

const hasSubmittedEod = computed(() => {
  return Boolean(eodSubmittedAt.value) || todayCommitments.value.some((c) => Boolean(c.outcome));
});

const pendingRequestForSelected = computed(() => {
  if (!selectedCommitmentId.value) return null;
  return (
    myCorrections.value.find(
      (h) =>
        h.status === 'PENDING' &&
        (h.targetCommitmentId === selectedCommitmentId.value ||
          h.targetCommitment?.id === selectedCommitmentId.value),
    ) || null
  );
});

const latestRejectedForSelected = computed(() => {
  if (!selectedCommitmentId.value) return null;
  const latest = myCorrections.value.find(
    (h) =>
      h.targetCommitmentId === selectedCommitmentId.value ||
      h.targetCommitment?.id === selectedCommitmentId.value,
  );
  return latest?.status === 'REJECTED' ? latest : null;
});

const DB_TO_FORM_OUTCOME: Record<string, 'DONE' | 'IN_PROGRESS' | 'BLOCKED' | 'DROPPED'> = {
  DONE: 'DONE',
  COMPLETED: 'DONE',
  IN_PROGRESS: 'IN_PROGRESS',
  PARTIALLY_COMPLETED: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  NOT_COMPLETED: 'BLOCKED',
  DROPPED: 'DROPPED',
  CANCELLED: 'DROPPED',
};

const DB_TO_FORM_CONTINUATION: Record<string, 'CONTINUE_TOMORROW' | 'ARCHIVE' | 'HANDOVER'> = {
  CONTINUE_TOMORROW: 'CONTINUE_TOMORROW',
  CONTINUE: 'CONTINUE_TOMORROW',
  ARCHIVE: 'ARCHIVE',
  DO_NOT_CONTINUE: 'ARCHIVE',
  HANDOVER: 'HANDOVER',
};

const hasRequestedDiff = computed(() => {
  const base = selectedCommitment.value;
  if (!base) return false;
  const baseOutcome = DB_TO_FORM_OUTCOME[base.outcome || ''] || 'DONE';
  const baseReason = (base.outcomeReason || '').trim() || null;
  const baseContinuation = DB_TO_FORM_CONTINUATION[base.continuation || ''] || 'ARCHIVE';
  return (
    newOutcome.value !== baseOutcome ||
    (newOutcomeReason.value.trim() || null) !== baseReason ||
    newContinuation.value !== baseContinuation
  );
});

function formatOutcomeLabel(outcome?: string | null): string {
  const normalized = DB_TO_FORM_OUTCOME[outcome || ''];
  if (normalized === 'DONE') return 'DONE (Tuntas)';
  if (normalized === 'IN_PROGRESS') return 'IN_PROGRESS (Sebagian)';
  if (normalized === 'BLOCKED') return 'BLOCKED (Terhambat)';
  if (normalized === 'DROPPED') return 'DROPPED (Dibatalkan)';
  return 'Belum diisi';
}

function formatContinuationLabel(continuation?: string | null): string {
  const normalized = DB_TO_FORM_CONTINUATION[continuation || ''];
  if (normalized === 'CONTINUE_TOMORROW') return 'Lanjutkan Besok';
  if (normalized === 'ARCHIVE') return 'Arsipkan / Tuntas';
  if (normalized === 'HANDOVER') return 'Serah Terima ke Rekan Lain';
  return 'Belum diatur';
}

function getCommitmentSequenceNo(item: CorrectionHistoryItem): number | null {
  if (item.targetCommitment?.sequenceNo) {
    return item.targetCommitment.sequenceNo;
  }
  const matched = todayCommitments.value.find(
    (c) => c.id === item.targetCommitmentId || c.id === item.targetCommitment?.id,
  );
  return matched?.sequenceNo ?? null;
}

function hasContinuationDiff(item: CorrectionHistoryItem): boolean {
  const beforeCont = DB_TO_FORM_CONTINUATION[item.valueBefore?.continuation || ''] || null;
  const afterCont = DB_TO_FORM_CONTINUATION[item.valueRequested?.continuation || ''] || null;
  return Boolean(afterCont && beforeCont !== afterCont);
}

function hasOutcomeReasonDiff(item: CorrectionHistoryItem): boolean {
  const beforeReason = (item.valueBefore?.outcomeReason || '').trim();
  const afterReason = (item.valueRequested?.outcomeReason || '').trim();
  return beforeReason !== afterReason && Boolean(beforeReason || afterReason);
}

function handleCommitmentSelect() {
  if (selectedCommitment.value) {
    newOutcome.value = DB_TO_FORM_OUTCOME[selectedCommitment.value.outcome || ''] || 'DONE';
    newOutcomeReason.value = selectedCommitment.value.outcomeReason || '';
    newContinuation.value = DB_TO_FORM_CONTINUATION[selectedCommitment.value.continuation || ''] || 'ARCHIVE';
  }
}

function resetForm() {
  handleCommitmentSelect();
  reason.value = '';
  errorMessage.value = null;
}

function prefillFromRejected(item: CorrectionHistoryItem) {
  const requested = item.valueRequested || {};
  if (requested.outcome && DB_TO_FORM_OUTCOME[requested.outcome]) {
    newOutcome.value = DB_TO_FORM_OUTCOME[requested.outcome];
  }
  if (requested.outcomeReason !== undefined) {
    newOutcomeReason.value = requested.outcomeReason || '';
  }
  if (requested.continuation && DB_TO_FORM_CONTINUATION[requested.continuation]) {
    newContinuation.value = DB_TO_FORM_CONTINUATION[requested.continuation];
  }
  if (!reason.value.trim()) {
    reason.value = 'Penyesuaian permohonan atas arahan atasan: ';
  }
  showToast('Draf sebelumnya berhasil dimuat. Silakan sesuaikan kembali sebelum mengirim.');
}

async function loadData(syncSelectedForm = false) {
  loading.value = true;
  try {
    const [todayRes, historyRes] = await Promise.all([
      apiClient<{
        cutoffTimings?: { eodLockCutoff?: string };
        record?: { eodSubmittedAt?: string | null; commitments?: CommitmentItem[] } | null;
      }>('/daily/today'),
      apiClient<CorrectionHistoryItem[]>('/correction-requests?mode=mine'),
    ]);

    eodLockCutoff.value = todayRes.data?.cutoffTimings?.eodLockCutoff || '21:00';
    eodSubmittedAt.value = todayRes.data?.record?.eodSubmittedAt ?? null;

    if (todayRes.data?.record?.commitments) {
      todayCommitments.value = todayRes.data.record.commitments;
      if (todayCommitments.value.length > 0 && !selectedCommitmentId.value) {
        selectedCommitmentId.value = todayCommitments.value[0].id;
        handleCommitmentSelect();
      } else if (syncSelectedForm && selectedCommitment.value) {
        handleCommitmentSelect();
      }
    } else {
      todayCommitments.value = [];
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
  if (pendingRequestForSelected.value) {
    showToast(
      'Masih ada permohonan koreksi material yang sedang menunggu tinjauan atasan untuk tugas ini.',
      true,
    );
    return;
  }
  if (!hasRequestedDiff.value) {
    showToast(
      'Perubahan yang diajukan masih sama dengan data evaluasi sore saat ini. Silakan ubah minimal satu isian evaluasi sore.',
      true,
    );
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
    await loadData(true);
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
    <TopBar breadcrumb="Workspace / Koreksi Evaluasi Sore" />

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
            Koreksi hasil capaian EOD setelah batas waktu cut-off {{ eodLockCutoff }} WIB terkunci. Pilihan hasil akhir tetap memberikan ruang refleksi mandiri secara objektif.
          </p>
        </div>
      </div>

      <!-- Tab Perpindahan Konteks Pagi / Sore -->
      <nav class="context-tabs-wrap" aria-label="Pilihan Jenis Koreksi">
        <AccessLink to="/corrections/morning" class="context-tab">
          <span>Koreksi Komitmen Pagi</span>
          <span class="context-tab-tag">Alur Pagi</span>
        </AccessLink>
        <AccessLink to="/corrections/eod" class="context-tab active">
          <span>Koreksi Evaluasi Sore (EOD)</span>
          <span class="context-tab-tag">Alur Sore · Aktif</span>
        </AccessLink>
      </nav>

      <!-- State: No commitments to correct -->
      <div v-if="todayCommitments.length === 0 && !loading" class="no-baseline-card">
        <AlertCircle :size="32" class="empty-icon" />
        <h2>Tidak Ada Komitmen Hari Ini</h2>
        <p>Anda belum mengisi komitmen pagi hari ini, sehingga belum ada tugas evaluasi sore yang dapat dikoreksi.</p>
        <AccessLink to="/daily/morning" class="btn-primary" style="margin-top: 14px;">
          Buka Morning Commitment
        </AccessLink>
      </div>

      <!-- State: Morning submitted, but EOD never submitted today -->
      <div v-else-if="!hasSubmittedEod && !loading" class="no-baseline-card">
        <AlertCircle :size="32" class="empty-icon" />
        <h2>Belum Ada Evaluasi Sore Hari Ini</h2>
        <p>
          Formulir koreksi evaluasi sore hanya berlaku untuk memperbaiki laporan evaluasi sore yang sudah pernah dikirim. Pengajuan ini tidak dapat dipakai untuk membuat laporan baru atau menghapus status tidak lapor.
        </p>
        <AccessLink to="/daily/eod" class="btn-primary" style="margin-top: 14px;">
          Buka Evaluasi Sore (EOD)
        </AccessLink>
      </div>

      <div v-else class="split-layout">
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
                  [Tugas #{{ c.sequenceNo }}] {{ c.taskText }} (Hasil: {{ formatOutcomeLabel(c.outcome) }})
                </option>
              </select>
            </div>

            <!-- Baseline Snapshot -->
            <div v-if="selectedCommitment" class="baseline-box">
              <span class="baseline-tag">Baseline EOD Tersimpan</span>
              <div class="base-task">{{ selectedCommitment.taskText }}</div>
              <div class="base-meta">
                <span>Hasil: <strong>{{ formatOutcomeLabel(selectedCommitment.outcome) }}</strong></span>
                <span> · Kelanjutan: <strong>{{ formatContinuationLabel(selectedCommitment.continuation) }}</strong></span>
                <span v-if="selectedCommitment.outcomeReason"> · Catatan: {{ selectedCommitment.outcomeReason }}</span>
              </div>
            </div>

            <!-- Banner Pengajuan Menunggu Review pada Tugas Terpilih -->
            <div v-if="pendingRequestForSelected" class="in-flight-banner" role="status">
              <Clock :size="18" />
              <div class="in-flight-body">
                <strong>Permohonan Koreksi Material EOD Sedang Menunggu Tinjauan Atasan</strong>
                <p>
                  Tugas ini masih memiliki pengajuan perubahan hasil evaluasi sore yang menunggu keputusan atasan.
                  <span v-if="pendingRequestForSelected.objectionWindowEndsAt">
                    Batas waktu tinjauan 24 jam: <strong>{{ formatDateWib(pendingRequestForSelected.objectionWindowEndsAt) }}</strong>.
                  </span>
                  Anda tetap dapat memilih tugas nomor lain di atas jika ingin mengajukan koreksi berbeda.
                </p>
              </div>
            </div>

            <!-- Banner Arahan Revisi Saat Pengajuan Sebelumnya Ditolak -->
            <div
              v-else-if="latestRejectedForSelected"
              class="post-objection-banner"
              role="status"
            >
              <AlertCircle :size="18" />
              <div class="post-objection-body">
                <strong>Catatan Penolakan Atasan pada Pengajuan Sebelumnya</strong>
                <p v-if="latestRejectedForSelected.reviewNote">
                  "{{ latestRejectedForSelected.reviewNote }}"
                </p>
                <p v-else>
                  Permohonan koreksi sebelumnya ditolak oleh atasan. Sesuaikan kembali usulan Anda sebelum mengirim ulang.
                </p>
                <button
                  type="button"
                  class="btn-prefill-revision"
                  @click="prefillFromRejected(latestRejectedForSelected)"
                >
                  Gunakan Draf Sebelumnya &amp; Sesuaikan
                </button>
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
                  <span>IN_PROGRESS (Sebagian)</span>
                </label>
                <label class="outcome-card blocked" :class="{ selected: newOutcome === 'BLOCKED' }">
                  <input type="radio" v-model="newOutcome" value="BLOCKED" />
                  <AlertTriangle :size="16" />
                  <span>BLOCKED (Terhambat)</span>
                </label>
                <label class="outcome-card dropped" :class="{ selected: newOutcome === 'DROPPED' }">
                  <input type="radio" v-model="newOutcome" value="DROPPED" />
                  <AlertCircle :size="16" />
                  <span>DROPPED (Dibatalkan)</span>
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
              <div class="label-row">
                <label for="eodReasonInput">Alasan Resmi Permohonan Koreksi <span class="req">*</span></label>
                <span
                  class="char-counter"
                  :class="{ valid: reason.trim().length >= 10, invalid: reason.trim().length > 0 && reason.trim().length < 10 }"
                >
                  {{
                    reason.trim().length >= 10
                      ? `Alasan memenuhi syarat (${reason.trim().length} karakter)`
                      : `${reason.trim().length} / 10 karakter minimum`
                  }}
                </span>
              </div>
              <textarea
                id="eodReasonInput"
                v-model="reason"
                rows="3"
                minlength="10"
                required
                placeholder="Tuliskan justifikasi objektif mengapa evaluasi EOD ini perlu dikoreksi (min. 10 karakter)..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn-reset"
                :disabled="submitting"
                @click="resetForm"
              >
                <RotateCcw :size="14" />
                <span>Reset Isian</span>
              </button>
              <button
                type="submit"
                class="btn-submit"
                :disabled="submitting || !selectedCommitmentId || reason.trim().length < 10 || !!pendingRequestForSelected"
              >
                <span v-if="submitting">Mengajukan...</span>
                <span v-else>Kirim Permohonan Koreksi EOD</span>
              </button>
            </div>
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
                    <span v-if="getCommitmentSequenceNo(item)" class="seq-pill">
                      Tugas #{{ getCommitmentSequenceNo(item) }}
                    </span>
                    <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
                    <span class="class-pill">{{ item.classification }}</span>
                  </div>
                  <span class="hist-date wp-datetime">
                    {{ formatDateWib(item.createdAt) }}
                  </span>
                </div>

                <div class="hist-diff">
                  <div class="diff-before">
                    <small>Sebelum:</small>
                    <p>{{ formatOutcomeLabel(item.valueBefore?.outcome) }}</p>
                  </div>
                  <div class="diff-arrow"><ArrowRight :size="14" /></div>
                  <div class="diff-after">
                    <small>Diajukan:</small>
                    <p>{{ formatOutcomeLabel(item.valueRequested?.outcome) }}</p>
                  </div>
                </div>

                <div v-if="hasContinuationDiff(item) || hasOutcomeReasonDiff(item)" class="hist-extra-changes">
                  <div v-if="hasContinuationDiff(item)" class="extra-change-row">
                    <strong>Kelanjutan Tugas:</strong>
                    <span>{{ formatContinuationLabel(item.valueBefore?.continuation) }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ formatContinuationLabel(item.valueRequested?.continuation) }}</span>
                  </div>
                  <div v-if="hasOutcomeReasonDiff(item)" class="extra-change-row">
                    <strong>Keterangan Hasil:</strong>
                    <span>{{ item.valueBefore?.outcomeReason || '(kosong)' }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ item.valueRequested?.outcomeReason || '(dihapus)' }}</span>
                  </div>
                </div>

                <div class="hist-reason">
                  <strong>Alasan:</strong> {{ item.reason }}
                </div>

                <div v-if="item.status === 'PENDING' && item.objectionWindowEndsAt" class="hist-window-note">
                  <Clock :size="13" />
                  <span>Batas Waktu Tinjauan 24 Jam: {{ formatDateWib(item.objectionWindowEndsAt) }}</span>
                </div>

                <div v-if="item.reviewNote" class="hist-review-note" :class="item.status.toLowerCase()">
                  <strong>{{ item.reviewedByUser?.fullName ? `Catatan Peninjau (${item.reviewedByUser.fullName}):` : 'Catatan Peninjau:' }}</strong> {{ item.reviewNote }}
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
  margin-bottom: 18px;
}

.context-tabs-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #DCE7E2;
  margin-bottom: 20px;
}

.context-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #5C6E68;
  text-decoration: none;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s ease;
}

.context-tab:hover {
  color: #0E211B;
}

.context-tab.active {
  color: #00674D;
  border-bottom-color: #00674D;
}

.context-tab-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: #EFF5F2;
  color: #5C6E68;
}

.context-tab.active .context-tab-tag {
  background: #E6F4EE;
  color: #00674D;
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
  min-width: 0;
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

.in-flight-banner,
.post-objection-banner {
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  line-height: 1.45;
}

.in-flight-banner {
  background: #E0F2FE;
  border: 1px solid #7DD3FC;
  color: #075985;
}

.post-objection-banner {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}

.in-flight-banner svg,
.post-objection-banner svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.in-flight-body strong,
.post-objection-body strong {
  display: block;
  margin-bottom: 3px;
}

.in-flight-body p,
.post-objection-body p {
  margin: 0;
}

.btn-prefill-revision {
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #FCA5A5;
  background: #FFFFFF;
  color: #991B1B;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-prefill-revision:hover {
  background: #FEF2F2;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.label-row label {
  margin-bottom: 0;
}

.char-counter {
  font-size: 11.5px;
  font-weight: 700;
  color: #5C6E68;
  font-variant-numeric: tabular-nums;
}

.char-counter.valid {
  color: #166534;
}

.char-counter.invalid {
  color: #991B1B;
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

.form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #DCE7E2;
  background: #FFFFFF;
  color: #0E211B;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-reset:hover:not(:disabled) {
  background: #EFF5F2;
}

.btn-reset:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
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

.seq-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: #F1F5F9;
  color: #334155;
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

.diff-before, .diff-after { flex: 1; min-width: 0; }
.diff-before small, .diff-after small { color: #5C6E68; font-weight: 700; display: block; }
.diff-before p, .diff-after p { margin: 2px 0 0; overflow-wrap: anywhere; word-break: break-word; }
.diff-arrow { color: #5C6E68; flex-shrink: 0; }

.hist-reason {
  font-size: 12px;
  color: #0E211B;
}

.hist-extra-changes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
  padding: 6px 8px;
  background: #EFF5F2;
  border-radius: 6px;
  font-size: 11.5px;
  color: #0E211B;
}

.extra-change-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  overflow-wrap: anywhere;
}

.hist-window-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #075985;
  background: #E0F2FE;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 6px;
}

.hist-review-note {
  font-size: 11.5px;
  color: #00674D;
  background: #E6F4EE;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 6px;
}

.hist-review-note.rejected {
  color: #991B1B;
  background: #FEE2E2;
}

.empty-feed {
  padding: 60px 20px;
  text-align: center;
  color: #5C6E68;
}

.no-baseline-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  max-width: 540px;
  margin: 40px auto;
}

.no-baseline-card p {
  color: #5C6E68;
  font-size: 13.5px;
  line-height: 1.5;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  background: #00674D;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.btn-primary:hover {
  background: #00523D;
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

@media (max-width: 640px) {
  .main-content {
    padding: 16px 14px 64px;
  }

  .context-tabs-wrap {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    border-bottom: none;
  }

  .context-tab {
    border: 1px solid #DCE7E2;
    border-radius: 8px;
    justify-content: space-between;
    margin-bottom: 0;
  }

  .context-tab.active {
    border-color: #00674D;
    background: #E6F4EE;
    border-bottom-color: #00674D;
  }

  .class-grid,
  .outcome-grid {
    grid-template-columns: 1fr;
  }

  .label-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-reset,
  .btn-submit {
    width: 100%;
  }

  .hist-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .hist-badges {
    flex-wrap: wrap;
  }

  .hist-diff {
    flex-direction: column;
    align-items: flex-start;
  }

  .diff-arrow {
    transform: rotate(90deg);
  }

  .toast-popup {
    left: 14px;
    right: 14px;
    top: 64px;
  }
}
</style>

