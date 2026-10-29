<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  AlertTriangle,
  X,
} from 'lucide-vue-next';

interface CommitmentOutcomeItem {
  id: string;
  sequenceNo: number;
  taskText: string;
  initialRisk: string;
  carryOverDaysCount: number;
  outcome: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'NOT_COMPLETED' | 'CANCELLED';
  outcomeReason: string;
  continuation: 'CONTINUE' | 'DO_NOT_CONTINUE';
  continuationReason: string;
}

interface AdditionalWorkOutcomeItem {
  id: string;
  taskText: string;
  reason: string;
  outcome: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'NOT_COMPLETED' | 'CANCELLED';
  outcomeReason: string;
  continuation: 'CONTINUE' | 'DO_NOT_CONTINUE';
  continuationReason: string;
}

// State
const loading = ref(false);
const submitting = ref(false);
const workDate = ref('');
const currentTime = ref('');
const isEodLocked = ref(false);
const isLate = ref(false);
const eodOnTimeCutoff = ref('17:00');
const eodLockCutoff = ref('21:00');

const commitments = ref<CommitmentOutcomeItem[]>([]);
const additionalWorks = ref<AdditionalWorkOutcomeItem[]>([]);
const finalDailyStatus = ref<'GREEN' | 'AMBER' | 'RED'>('GREEN');

// Instant blocker modal state
const isBlockerModalOpen = ref(false);
const blockerType = ref('TECHNICAL');
const blockerSeverity = ref('HIGH');
const blockerImpact = ref('TASK');
const blockerDesc = ref('');
const blockerOwnerType = ref('ORGANIZATIONAL_AUTHORITY');
const blockerOwnerId = ref('');
const blockerProjectCode = ref('');
const availableUsers = ref<Array<{ id: string; fullName: string }>>([]);

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isSubmittedSuccess = ref(false);

async function loadTodayState() {
  loading.value = true;
  try {
    const res = await apiClient<{
      workDate: string;
      currentTime: string;
      cutoffTimings: {
        eodOnTimeCutoff: string;
        eodLockCutoff: string;
        isEodLocked: boolean;
      };
      record: any;
    }>('/daily/today');

    const data = res.data;
    workDate.value = data.workDate;
    currentTime.value = data.currentTime;
    eodOnTimeCutoff.value = data.cutoffTimings.eodOnTimeCutoff;
    eodLockCutoff.value = data.cutoffTimings.eodLockCutoff;
    isEodLocked.value = data.cutoffTimings.isEodLocked;
    isLate.value = data.currentTime > data.cutoffTimings.eodOnTimeCutoff && !data.cutoffTimings.isEodLocked;

    if (data.record) {
      if (data.record.commitments) {
        commitments.value = data.record.commitments.map((c: any) => ({
          id: c.id,
          sequenceNo: c.sequenceNo,
          taskText: c.taskText,
          initialRisk: c.initialRisk,
          carryOverDaysCount: c.carryOverDaysCount || 0,
          outcome: c.outcome || 'COMPLETED',
          outcomeReason: c.outcomeReason || '',
          continuation: c.continuation || 'DO_NOT_CONTINUE',
          continuationReason: c.continuationReason || '',
        }));
      }

      if (data.record.additionalWorks) {
        additionalWorks.value = data.record.additionalWorks.map((w: any) => ({
          id: w.id,
          taskText: w.taskText,
          reason: w.reason,
          outcome: w.outcome || 'COMPLETED',
          outcomeReason: w.outcomeReason || '',
          continuation: w.continuation || 'DO_NOT_CONTINUE',
          continuationReason: w.continuationReason || '',
        }));
      }

      if (data.record.finalDailyStatus && data.record.finalDailyStatus !== 'NOT_APPLICABLE_NO_COMMITMENT') {
        finalDailyStatus.value = data.record.finalDailyStatus;
        isSubmittedSuccess.value = true;
      }
    }

    // Load users for blocker modal
    const usersRes = await apiClient<Array<{ id: string; fullName: string }>>('/v1/organization/users');
    availableUsers.value = usersRes.data || [];
    if (availableUsers.value.length > 0) {
      blockerOwnerId.value = availableUsers.value[0].id;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat evaluasi EOD.', true);
  } finally {
    loading.value = false;
  }
}

async function submitEod() {
  errorMessage.value = null;

  // Validasi outcome komitmen
  for (const c of commitments.value) {
    if (c.outcome === 'CANCELLED' && c.outcomeReason.trim().length === 0) {
      errorMessage.value = `Komitmen #${c.sequenceNo}: Alasan pembatalan wajib diisi bila status Dibatalkan.`;
      return;
    }
    if (c.continuation === 'CONTINUE' && c.continuationReason.trim().length === 0) {
      errorMessage.value = `Komitmen #${c.sequenceNo}: Alasan kelanjutan (Continuation) wajib diisi bila tugas dilanjutkan.`;
      return;
    }
  }

  // Validasi outcome additional work
  for (const w of additionalWorks.value) {
    if (w.outcome === 'CANCELLED' && w.outcomeReason.trim().length === 0) {
      errorMessage.value = `Pekerjaan Tambahan "${w.taskText.slice(0, 20)}...": Alasan pembatalan wajib diisi.`;
      return;
    }
    if (w.continuation === 'CONTINUE' && w.continuationReason.trim().length === 0) {
      errorMessage.value = `Pekerjaan Tambahan "${w.taskText.slice(0, 20)}...": Alasan kelanjutan wajib diisi.`;
      return;
    }
  }

  submitting.value = true;
  try {
    const payload = {
      workDate: workDate.value,
      commitmentOutcomes: commitments.value.map((c) => ({
        commitmentId: c.id,
        outcome: c.outcome,
        outcomeReason: c.outcomeReason.trim() ? c.outcomeReason.trim() : undefined,
        continuation: c.outcome !== 'COMPLETED' ? c.continuation : undefined,
        continuationReason: c.continuation === 'CONTINUE' ? c.continuationReason.trim() : undefined,
      })),
      additionalWorkOutcomes: additionalWorks.value.map((w) => ({
        additionalWorkId: w.id,
        outcome: w.outcome,
        outcomeReason: w.outcomeReason.trim() ? w.outcomeReason.trim() : undefined,
        continuation: w.outcome !== 'COMPLETED' ? w.continuation : undefined,
        continuationReason: w.continuation === 'CONTINUE' ? w.continuationReason.trim() : undefined,
      })),
      finalDailyStatus: finalDailyStatus.value, // DEC-003: Hak konfirmasi status GREEN dijamin bebas
    };

    await apiClient('/daily/eod', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    showToast('Evaluasi EOD Outcome berhasil dikirim dan dicatat.');
    isSubmittedSuccess.value = true;
    await loadTodayState();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengirim evaluasi EOD.';
  } finally {
    submitting.value = false;
  }
}

async function submitInstantBlocker() {
  if (blockerDesc.value.trim().length < 10) {
    showToast('Deskripsi kendala minimal 10 karakter.', true);
    return;
  }

  if (blockerOwnerType.value === 'PROJECT_AUTHORITY' && blockerProjectCode.value.trim().length === 0) {
    showToast('Kode proyek referensi wajib diisi bila memilih Kewenangan Proyek.', true);
    return;
  }

  try {
    await apiClient('/blockers', {
      method: 'POST',
      body: JSON.stringify({
        type: blockerType.value,
        severity: blockerSeverity.value,
        impact: blockerImpact.value,
        description: blockerDesc.value.trim(),
        ownerNeededType: blockerOwnerType.value,
        assignedOwnerId: blockerOwnerId.value,
        projectCodeReference: blockerOwnerType.value === 'PROJECT_AUTHORITY' ? blockerProjectCode.value.trim() : undefined,
      }),
    });

    showToast('Kendala mendesak (Instant Blocker) berhasil dilaporkan ke antrean eskalasi.');
    isBlockerModalOpen.value = false;
    blockerDesc.value = '';
    blockerProjectCode.value = '';
  } catch (err: any) {
    showToast(err.message || 'Gagal melaporkan kendala.', true);
  }
}

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => { errorMessage.value = null; }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => { toastMessage.value = null; }, 3800);
  }
}

onMounted(() => {
  loadTodayState();
});
</script>

<template>
  <div class="daily-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">My Today / <strong>EOD Outcome</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/daily/history" class="nav-btn">Riwayat Saya</AccessLink>
        <AccessLink to="/profile" class="nav-btn">Profil</AccessLink>
      </div>
    </header>

    <!-- Daily Workflow Step Bar -->
    <nav class="workflow-bar" aria-label="Alur Akuntabilitas Harian">
      <AccessLink to="/daily/morning" class="step-item">
        <span class="step-num">1</span>
        <span>Morning Commitment</span>
      </AccessLink>
      <AccessLink to="/daily/additional-work" class="step-item">
        <span class="step-num">2</span>
        <span>Additional Work</span>
      </AccessLink>
      <AccessLink to="/daily/eod" class="step-item active">
        <span class="step-num">3</span>
        <span>EOD Outcome</span>
      </AccessLink>
    </nav>

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
      <div class="page-heading">
        <div>
          <h1>EOD Outcome & Daily Reflection</h1>
          <p class="subtitle">
            Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan kelanjutan tugas (Prototipe 04).
          </p>
        </div>
        <button
          type="button"
          class="btn btn-secondary blocker-cta"
          @click="isBlockerModalOpen = true"
        >
          <AlertTriangle :size="16" />
          <span>+ Laporkan Blocker Mendesak</span>
        </button>
      </div>

      <!-- Konteks Waktu EOD Panel -->
      <section class="panel context-panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Konteks Waktu EOD</div>
            <h2>Batas Evaluasi Akhir Hari</h2>
          </div>
          <span class="badge badge-info">On-Time {{ eodOnTimeCutoff }} · Cut-Off {{ eodLockCutoff }} WIB</span>
        </div>
        <div class="panel-body">
          <div class="context-grid">
            <div class="context-item">
              <span class="context-label">Tanggal Kerja</span>
              <span class="context-value mono">{{ workDate || '...' }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">Batas On-Time EOD</span>
              <span class="context-value mono">{{ eodOnTimeCutoff }} WIB</span>
            </div>
            <div class="context-item">
              <span class="context-label">Status Waktu</span>
              <div class="context-value">
                <span v-if="isEodLocked" class="badge badge-danger">LOCKED (Pasca {{ eodLockCutoff }} WIB)</span>
                <span v-else-if="isLate" class="badge badge-late">LATE (Lembur Fleksibel)</span>
                <span v-else class="badge badge-ontime">ON-TIME</span>
              </div>
            </div>
            <div class="context-item">
              <span class="context-label">Total Item Evaluasi</span>
              <span class="context-value mono">{{ commitments.length + additionalWorks.length }} Tugas</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Alert jika terkunci -->
      <div v-if="isEodLocked" class="alert-banner locked" role="alert">
        <Lock :size="20" />
        <div>
          <strong>Hari Kerja Telah Berakhir & Terkunci Permanen (DEC-002):</strong>
          Batas cut-off lembur ({{ eodLockCutoff }} WIB) telah terlewati. Evaluasi tidak dapat lagi disubmit secara reguler. Silakan hubungi atasan atau ajukan permohonan koreksi jika diperlukan.
        </div>
      </div>

      <!-- Daftar Komitmen Pagi untuk Dievaluasi -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Komitmen Pagi</div>
            <h2>Evaluasi Capaian Komitmen ({{ commitments.length }})</h2>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="commitments.length === 0" class="empty-hint">
            Tidak ada komitmen terencana yang tercatat untuk pagi hari ini (0 Komitmen).
          </div>
          <div v-else class="eval-list">
            <div v-for="c in commitments" :key="c.id" class="eval-card">
              <div class="eval-header">
                <div class="eval-title-group">
                  <span class="eval-idx">#{{ c.sequenceNo }}</span>
                  <span class="eval-task">{{ c.taskText }}</span>
                </div>
                <div class="badges-row">
                  <span class="badge" :class="c.initialRisk === 'GREEN' ? 'badge-active' : c.initialRisk === 'AMBER' ? 'badge-warning' : 'badge-danger'">
                    Pagi: {{ c.initialRisk }}
                  </span>
                  <span v-if="c.carryOverDaysCount > 0" class="badge badge-neutral">
                    Carry-Over #{{ c.carryOverDaysCount }}
                  </span>
                </div>
              </div>

              <!-- Radio Outcome Selection -->
              <div class="form-group">
                <label class="form-label">Hasil Pencapaian Komitmen *</label>
                <div class="outcome-options">
                  <label class="outcome-label" :class="{ selected: c.outcome === 'COMPLETED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="COMPLETED" v-model="c.outcome" :disabled="isEodLocked" />
                    <span>Selesai (COMPLETED)</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: c.outcome === 'PARTIALLY_COMPLETED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="PARTIALLY_COMPLETED" v-model="c.outcome" :disabled="isEodLocked" />
                    <span>Sebagian (PARTIALLY)</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: c.outcome === 'NOT_COMPLETED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="NOT_COMPLETED" v-model="c.outcome" :disabled="isEodLocked" />
                    <span>Belum Selesai (NOT_COMPLETED)</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: c.outcome === 'CANCELLED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="CANCELLED" v-model="c.outcome" :disabled="isEodLocked" />
                    <span>Dibatalkan (CANCELLED)</span>
                  </label>
                </div>
              </div>

              <!-- If CANCELLED: Reason -->
              <div v-if="c.outcome === 'CANCELLED'" class="conditional-box">
                <label class="form-label">Alasan Pembatalan Tugas *</label>
                <textarea
                  v-model="c.outcomeReason"
                  class="input-control"
                  rows="2"
                  placeholder="Jelaskan alasan mengapa komitmen ini dibatalkan hari ini..."
                  :disabled="isEodLocked"
                  required
                ></textarea>
              </div>

              <!-- If NOT COMPLETED or PARTIALLY: Continuation Decision (DEC-013) -->
              <div v-if="c.outcome === 'PARTIALLY_COMPLETED' || c.outcome === 'NOT_COMPLETED'" class="conditional-box">
                <label class="form-label">Keputusan Kelanjutan Tugas Besok (Continuation Decision) *</label>
                <div class="continuation-options">
                  <label class="cont-label" :class="{ selected: c.continuation === 'CONTINUE' }">
                    <input type="radio" :name="`cont-${c.id}`" value="CONTINUE" v-model="c.continuation" :disabled="isEodLocked" />
                    <span>Lanjutkan Besok (CONTINUE &rarr; Carry-Over)</span>
                  </label>
                  <label class="cont-label" :class="{ selected: c.continuation === 'DO_NOT_CONTINUE' }">
                    <input type="radio" :name="`cont-${c.id}`" value="DO_NOT_CONTINUE" v-model="c.continuation" :disabled="isEodLocked" />
                    <span>Jangan Lanjutkan (DO_NOT_CONTINUE)</span>
                  </label>
                </div>

                <div v-if="c.continuation === 'CONTINUE'" class="mt-2">
                  <label class="form-label">Catatan Kelanjutan (Continuation Reason) *</label>
                  <textarea
                    v-model="c.continuationReason"
                    class="input-control"
                    rows="2"
                    placeholder="Jelaskan progres sisa dan rencana penuntasan besok..."
                    :disabled="isEodLocked"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Evaluasi Pekerjaan Tambahan (Jika Ada) -->
      <section v-if="additionalWorks.length > 0" class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Pekerjaan Tambahan</div>
            <h2>Evaluasi Pekerjaan Tambahan ({{ additionalWorks.length }})</h2>
          </div>
        </div>
        <div class="panel-body">
          <div class="eval-list">
            <div v-for="w in additionalWorks" :key="w.id" class="eval-card">
              <div class="eval-header">
                <span class="eval-task">{{ w.taskText }}</span>
                <span class="badge badge-info">{{ w.reason }}</span>
              </div>

              <div class="form-group">
                <label class="form-label">Hasil Pencapaian *</label>
                <div class="outcome-options">
                  <label class="outcome-label" :class="{ selected: w.outcome === 'COMPLETED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="COMPLETED" v-model="w.outcome" :disabled="isEodLocked" />
                    <span>Selesai (COMPLETED)</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: w.outcome === 'PARTIALLY_COMPLETED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="PARTIALLY_COMPLETED" v-model="w.outcome" :disabled="isEodLocked" />
                    <span>Sebagian</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: w.outcome === 'NOT_COMPLETED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="NOT_COMPLETED" v-model="w.outcome" :disabled="isEodLocked" />
                    <span>Belum Selesai</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final Daily Self-Reflection Status (DEC-003: Hak Opsi GREEN Tidak Boleh Dikunci) -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Refleksi Mandiri Karyawan (DEC-003)</div>
            <h2>Status Refleksi Akhir Hari Ini (Final Daily Status)</h2>
          </div>
          <span class="badge badge-active">Proteksi Hak Opsi GREEN</span>
        </div>
        <div class="panel-body">
          <p class="reflection-desc">
            Bagaimana penilaian mandiri Anda terhadap pencapaian keseluruhan hari ini? Sesuai <strong>DEC-003</strong>, sistem tidak pernah mengunci opsi GREEN secara punitif.
          </p>

          <div class="status-selection-grid">
            <label class="status-select-card green" :class="{ selected: finalDailyStatus === 'GREEN' }">
              <input type="radio" value="GREEN" v-model="finalDailyStatus" :disabled="isEodLocked" />
              <div class="status-card-header">
                <CheckCircle2 :size="20" class="text-green" />
                <span class="status-name">GREEN</span>
              </div>
              <p class="status-summary">
                Target hari ini tercapai memuaskan atau terkendali mandiri.
              </p>
            </label>

            <label class="status-select-card amber" :class="{ selected: finalDailyStatus === 'AMBER' }">
              <input type="radio" value="AMBER" v-model="finalDailyStatus" :disabled="isEodLocked" />
              <div class="status-card-header">
                <AlertCircle :size="20" class="text-amber" />
                <span class="status-name">AMBER</span>
              </div>
              <p class="status-summary">
                Terdapat kendala dependensi atau carry-over berulang yang perlu atensi tim.
              </p>
            </label>

            <label class="status-select-card red" :class="{ selected: finalDailyStatus === 'RED' }">
              <input type="radio" value="RED" v-model="finalDailyStatus" :disabled="isEodLocked" />
              <div class="status-card-header">
                <AlertTriangle :size="20" class="text-red" />
                <span class="status-name">RED</span>
              </div>
              <p class="status-summary">
                Kendala kritis tidak terselesaikan dan membutuhkan intervensi langsung atasan.
              </p>
            </label>
          </div>
        </div>
      </section>

      <!-- Action Footer -->
      <div v-if="!isEodLocked" class="action-footer">
        <div class="footer-info">
          Pastikan hasil evaluasi telah diverifikasi sebelum jam penguncian {{ eodLockCutoff }} WIB.
        </div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="submitting"
          @click="submitEod"
        >
          <span>{{ submitting ? 'Mengirim...' : 'Kirim Evaluasi EOD' }}</span>
        </button>
      </div>

      <!-- Success Banner -->
      <div v-if="isSubmittedSuccess" class="post-submit-panel">
        <div class="post-submit-header">
          <CheckCircle2 :size="22" class="text-green" />
          <div>
            <h3>Evaluasi EOD Berhasil Disimpan</h3>
            <p>Hari kerja Anda telah ditutup secara resmi. Terima kasih atas dedikasi dan akuntabilitas Anda hari ini!</p>
          </div>
        </div>
        <AccessLink to="/daily/history" class="btn btn-secondary history-btn">
          <span>Lihat Ringkasan Riwayat Akuntabilitas &rarr;</span>
        </AccessLink>
      </div>
    </main>

    <!-- Modal Instant Blocker -->
    <div v-if="isBlockerModalOpen" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3>Laporkan Kendala Mendesak (Instant Blocker)</h3>
            <p>Eskalasi kendala ke antrean reviewer dengan target respon SLA (Prototipe 05).</p>
          </div>
          <button type="button" class="icon-btn" @click="isBlockerModalOpen = false">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="submitInstantBlocker" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Jenis Kendala *</label>
              <select v-model="blockerType" class="input-control" required>
                <option value="TECHNICAL">Teknis / Arsitektur (TECHNICAL)</option>
                <option value="REQUIREMENT">Kebutuhan / Spesifikasi (REQUIREMENT)</option>
                <option value="APPROVAL">Persetujuan / Approval (APPROVAL)</option>
                <option value="VENDOR">Vendor / Pihak Ketiga (VENDOR)</option>
                <option value="INFRA">Infrastruktur / Cloud (INFRA)</option>
                <option value="OTHER">Lainnya (OTHER)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tingkat Keparahan *</label>
              <select v-model="blockerSeverity" class="input-control" required>
                <option value="LOW">Low (Rendah)</option>
                <option value="MEDIUM">Medium (Sedang)</option>
                <option value="HIGH">High (Tinggi)</option>
                <option value="CRITICAL">Critical (Kritis)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi Kendala *</label>
            <textarea
              v-model="blockerDesc"
              class="input-control"
              rows="3"
              placeholder="Jelaskan kendala, dampak terhadap timeline, dan tindakan mitigasi yang telah dicoba..."
              minlength="10"
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Konteks Kewenangan *</label>
              <select v-model="blockerOwnerType" class="input-control" required>
                <option value="ORGANIZATIONAL_AUTHORITY">Kewenangan Hierarki (Supervisor/Head)</option>
                <option value="PROJECT_AUTHORITY">Kewenangan Proyek (Project Manager)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Penerima Eskalasi (Owner) *</label>
              <select v-model="blockerOwnerId" class="input-control" required>
                <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                  {{ u.fullName }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="blockerOwnerType === 'PROJECT_AUTHORITY'" class="form-group">
            <label class="form-label">Kode Proyek Referensi *</label>
            <input
              v-model="blockerProjectCode"
              type="text"
              class="input-control"
              placeholder="Contoh: PRJ-WORKPULSE-01"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="isBlockerModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">Laporkan Blocker</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-layout {
  min-height: 100vh;
  background-color: var(--color-canvas);
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  background: var(--color-brand-primary);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text-primary);
}

.breadcrumb {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.topbar-right {
  display: flex;
  gap: 14px;
}

.nav-btn {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.nav-btn:hover {
  background: var(--color-surface-subtle);
  color: var(--color-brand-primary);
}

.workflow-bar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  padding: 0 24px;
  gap: 32px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.step-item.active {
  color: var(--color-brand-primary);
  border-bottom-color: var(--color-brand-primary);
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-item.active .step-num {
  background: var(--color-brand-primary);
  color: #fff;
}

.main-content {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-heading h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.blocker-cta {
  color: var(--color-status-amber-fg);
  border-color: var(--color-status-amber-border);
  background: var(--color-status-amber-bg);
  flex-shrink: 0;
}

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kicker {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.panel-body {
  padding: 20px;
}

.context-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.context-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.context-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.context-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.context-value.mono {
  font-family: var(--font-mono);
}

.alert-banner {
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.5;
}

.alert-banner.locked {
  background: var(--color-status-neutral-bg);
  border: 1px solid var(--color-status-neutral-border);
  color: var(--color-status-neutral-fg);
}

.eval-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eval-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.eval-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eval-idx {
  font-weight: 800;
  font-size: 14px;
  color: var(--color-brand-primary);
}

.eval-task {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.badges-row {
  display: flex;
  gap: 8px;
}

.outcome-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.outcome-label {
  padding: 10px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.outcome-label input {
  display: none;
}

.outcome-label.selected {
  border-color: var(--color-brand-primary);
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
}

.conditional-box {
  background: #fff;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.continuation-options {
  display: flex;
  gap: 12px;
}

.cont-label {
  padding: 8px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.cont-label input {
  display: none;
}

.cont-label.selected {
  border-color: #f59e0b;
  background: #fef3c7;
  color: #92400e;
}

.mt-2 {
  margin-top: 8px;
}

/* Status Reflection Cards */
.reflection-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.status-selection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.status-select-card {
  padding: 18px 20px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.15s ease;
}

.status-select-card input {
  display: none;
}

.status-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-name {
  font-size: 16px;
  font-weight: 800;
}

.status-summary {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.status-select-card.green.selected {
  border-color: #22c55e;
  background: var(--color-status-green-bg);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
}

.status-select-card.green .status-name {
  color: var(--color-status-green-fg);
}

.status-select-card.amber.selected {
  border-color: #f59e0b;
  background: var(--color-status-amber-bg);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.status-select-card.amber .status-name {
  color: var(--color-status-amber-fg);
}

.status-select-card.red.selected {
  border-color: #ef4444;
  background: var(--color-status-red-bg);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.status-select-card.red .status-name {
  color: var(--color-status-red-fg);
}

.action-footer {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-brand-hover);
}

.btn-secondary {
  background: #fff;
  border-color: var(--color-border-subtle);
  color: var(--color-text-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-control {
  padding: 9px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  color: var(--color-text-primary);
}

.input-control:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.badge-info {
  background: #e0f2fe;
  color: #0369a1;
}

.badge-ontime {
  background: var(--color-timing-ontime-bg);
  color: var(--color-timing-ontime-fg);
  border: 1px solid var(--color-timing-ontime-border);
}

.badge-late {
  background: var(--color-timing-late-bg);
  color: var(--color-timing-late-fg);
  border: 1px solid var(--color-timing-late-border);
}

.badge-active {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
}

.badge-warning {
  background: var(--color-status-amber-bg);
  color: var(--color-status-amber-fg);
}

.badge-danger {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
}

.badge-neutral {
  background: var(--color-status-neutral-bg);
  color: var(--color-status-neutral-fg);
}

.text-green { color: #166534; }
.text-amber { color: #92400e; }
.text-red { color: #991b1b; }

.post-submit-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-status-green-border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-submit-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.post-submit-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-brand-primary);
}

.post-submit-header p {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-box {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 580px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 700;
}

.modal-header p {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-form {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.toast-popup {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  border: 1px solid var(--color-status-green-border);
}

.toast-popup.error {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
  border: 1px solid var(--color-status-red-border);
}
</style>
