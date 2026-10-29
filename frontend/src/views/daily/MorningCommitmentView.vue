<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Clock,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next';

interface CommitmentSlot {
  taskText: string;
  referenceLink: string;
  initialRisk: 'GREEN' | 'AMBER' | 'RED';
  knownBlockerNote: string;
  supportNeeded: string;
  originCommitmentId?: string;
  carryOverDaysCount: number;
}

interface CarryOverDraft {
  originCommitmentId: string;
  taskText: string;
  referenceLink: string | null;
  carryOverDaysCount: number;
  suggestedRisk: 'GREEN' | 'AMBER' | 'RED';
  isAmberWarningAdvised: boolean;
}

// State
const loading = ref(false);
const submitting = ref(false);
const workDate = ref('');
const currentTime = ref('');
const isMorningLocked = ref(false);
const isLate = ref(false);
const morningOnTimeCutoff = ref('09:00');
const morningLockCutoff = ref('09:30');

const isZeroCommitment = ref(false);
const zeroCommitmentReason = ref('');

const isCopyForwardOpen = ref(false);
const availableCarryOvers = ref<CarryOverDraft[]>([]);

const commitmentSlots = ref<CommitmentSlot[]>([
  {
    taskText: '',
    referenceLink: '',
    initialRisk: 'GREEN',
    knownBlockerNote: '',
    supportNeeded: '',
    carryOverDaysCount: 0,
  },
]);

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isSubmittedSuccess = ref(false);

// Computed initial daily status
const initialDailyStatus = computed(() => {
  if (isZeroCommitment.value) return 'NOT_APPLICABLE_NO_COMMITMENT';
  const hasRed = commitmentSlots.value.some((c) => c.initialRisk === 'RED');
  if (hasRed) return 'RED';
  const hasAmber = commitmentSlots.value.some((c) => c.initialRisk === 'AMBER');
  if (hasAmber) return 'AMBER';
  return 'GREEN';
});

async function loadTodayState() {
  loading.value = true;
  try {
    const res = await apiClient<{
      workDate: string;
      currentTime: string;
      cutoffTimings: {
        morningOnTimeCutoff: string;
        morningLockCutoff: string;
        isMorningLocked: boolean;
      };
      record: any;
      availableCarryOvers: CarryOverDraft[];
    }>('/daily/today');

    const data = res.data;
    workDate.value = data.workDate;
    currentTime.value = data.currentTime;
    morningOnTimeCutoff.value = data.cutoffTimings.morningOnTimeCutoff;
    morningLockCutoff.value = data.cutoffTimings.morningLockCutoff;
    isMorningLocked.value = data.cutoffTimings.isMorningLocked;
    isLate.value = data.currentTime > data.cutoffTimings.morningOnTimeCutoff && !data.cutoffTimings.isMorningLocked;
    availableCarryOvers.value = data.availableCarryOvers || [];

    // Jika record sudah ada di DB
    if (data.record) {
      if (data.record.initialDailyStatus === 'NOT_APPLICABLE_NO_COMMITMENT') {
        isZeroCommitment.value = true;
        zeroCommitmentReason.value = data.record.zeroCommitmentReason || '';
      } else if (data.record.commitments && data.record.commitments.length > 0) {
        commitmentSlots.value = data.record.commitments.map((c: any) => ({
          taskText: c.taskText,
          referenceLink: c.referenceLink || '',
          initialRisk: c.initialRisk,
          knownBlockerNote: c.knownBlockerNote || '',
          supportNeeded: c.supportNeeded || '',
          originCommitmentId: c.originCommitmentId || undefined,
          carryOverDaysCount: c.carryOverDaysCount || 0,
        }));
      }
      isSubmittedSuccess.value = true;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat status komitmen hari ini.', true);
  } finally {
    loading.value = false;
  }
}

function addSlot() {
  if (commitmentSlots.value.length >= 3) {
    showToast('Maksimal 3 komitmen terencana dalam satu hari (DEC-004).', true);
    return;
  }
  commitmentSlots.value.push({
    taskText: '',
    referenceLink: '',
    initialRisk: 'GREEN',
    knownBlockerNote: '',
    supportNeeded: '',
    carryOverDaysCount: 0,
  });
}

function removeSlot(index: number) {
  if (commitmentSlots.value.length === 1) {
    showToast('Minimal 1 slot komitmen atau centang opsi 0 Komitmen (DEC-004).', true);
    return;
  }
  commitmentSlots.value.splice(index, 1);
}

function applyCarryOver(draft: CarryOverDraft) {
  // Cari slot kosong pertama, atau tambahkan jika slot < 3
  let targetIndex = commitmentSlots.value.findIndex((s) => !s.taskText.trim());
  if (targetIndex === -1 && commitmentSlots.value.length < 3) {
    addSlot();
    targetIndex = commitmentSlots.value.length - 1;
  }

  if (targetIndex !== -1) {
    commitmentSlots.value[targetIndex] = {
      taskText: draft.taskText,
      referenceLink: draft.referenceLink || '',
      initialRisk: draft.suggestedRisk,
      knownBlockerNote: '',
      supportNeeded: '',
      originCommitmentId: draft.originCommitmentId,
      carryOverDaysCount: draft.carryOverDaysCount,
    };
    showToast(`Draf tugas carry-over #${draft.carryOverDaysCount} diterapkan ke slot #${targetIndex + 1}.`);
  } else {
    showToast('Semua 3 slot telah terisi. Hapus salah satu slot terlebih dahulu.', true);
  }
}

async function submitMorningCheckin() {
  errorMessage.value = null;

  if (isZeroCommitment.value) {
    if (zeroCommitmentReason.value.trim().length < 10) {
      errorMessage.value = 'Alasan tidak menetapkan komitmen wajib diisi minimal 10 karakter (DEC-004).';
      return;
    }
  } else {
    if (commitmentSlots.value.length === 0 || commitmentSlots.value.length > 3) {
      errorMessage.value = 'Jumlah komitmen harus 1 hingga 3 tugas (DEC-004).';
      return;
    }

    for (let i = 0; i < commitmentSlots.value.length; i++) {
      const slot = commitmentSlots.value[i];
      if (slot.taskText.trim().length < 3) {
        errorMessage.value = `Slot #${i + 1}: Deskripsi komitmen wajib diisi minimal 3 karakter.`;
        return;
      }
      if (
        (slot.initialRisk === 'AMBER' || slot.initialRisk === 'RED') &&
        slot.knownBlockerNote.trim().length === 0
      ) {
        errorMessage.value = `Slot #${i + 1}: Komitmen dengan risiko ${slot.initialRisk} wajib menyertakan potensi kendala.`;
        return;
      }
    }
  }

  submitting.value = true;
  try {
    const payload = {
      workDate: workDate.value,
      commitments: isZeroCommitment.value
        ? []
        : commitmentSlots.value.map((s) => ({
            taskText: s.taskText.trim(),
            referenceLink: s.referenceLink.trim() ? s.referenceLink.trim() : undefined,
            initialRisk: s.initialRisk,
            knownBlockerNote: s.knownBlockerNote.trim() ? s.knownBlockerNote.trim() : undefined,
            supportNeeded: s.supportNeeded.trim() ? s.supportNeeded.trim() : undefined,
            originCommitmentId: s.originCommitmentId,
          })),
      zeroCommitmentReason: isZeroCommitment.value ? zeroCommitmentReason.value.trim() : undefined,
    };

    await apiClient('/daily/morning', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    showToast('Morning Commitment berhasil dikirim dan dicatat.');
    isSubmittedSuccess.value = true;
    await loadTodayState();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengirim Morning Commitment.';
  } finally {
    submitting.value = false;
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
        <span class="breadcrumb">My Today / <strong>Morning Commitment</strong></span>
      </div>
      <div class="topbar-right">
        <AccessLink to="/daily/history" class="nav-btn">Riwayat Saya</AccessLink>
        <AccessLink to="/profile" class="nav-btn">Profil</AccessLink>
      </div>
    </header>

    <!-- Daily Workflow Step Bar -->
    <nav class="workflow-bar" aria-label="Alur Akuntabilitas Harian">
      <AccessLink to="/daily/morning" class="step-item active">
        <span class="step-num">1</span>
        <span>Morning Commitment</span>
      </AccessLink>
      <AccessLink to="/daily/additional-work" class="step-item">
        <span class="step-num">2</span>
        <span>Additional Work</span>
      </AccessLink>
      <AccessLink to="/daily/eod" class="step-item">
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
          <h1>Morning Commitment</h1>
          <p class="subtitle">
            Tetapkan 1 hingga 3 komitmen terukur yang akan Anda tuntaskan hari ini. Identifikasi risiko secara transparan agar tim dapat memberikan dukungan tepat waktu.
          </p>
        </div>
      </div>

      <!-- Konteks Hari Ini Panel -->
      <section class="panel context-panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Konteks Hari Ini</div>
            <h2>Jadwal & Batas Pengisian Hari Ini</h2>
          </div>
          <span class="badge badge-info">Kebijakan: On-Time {{ morningOnTimeCutoff }} · Cut-Off {{ morningLockCutoff }} WIB</span>
        </div>
        <div class="panel-body">
          <div class="context-grid">
            <div class="context-item">
              <span class="context-label">Tanggal Kerja</span>
              <span class="context-value mono">{{ workDate || '...' }}</span>
              <span class="context-sub">Hari Kerja Aktif</span>
            </div>
            <div class="context-item">
              <span class="context-label">Batas On-Time</span>
              <span class="context-value mono">{{ morningOnTimeCutoff }} WIB</span>
              <span class="context-sub">Cut-Off Penguncian: {{ morningLockCutoff }} WIB</span>
            </div>
            <div class="context-item">
              <span class="context-label">Status Waktu</span>
              <div class="context-value">
                <span v-if="isMorningLocked" class="badge badge-danger">LOCKED (Pasca Cut-Off)</span>
                <span v-else-if="isLate" class="badge badge-late">LATE (Jendela Toleransi)</span>
                <span v-else class="badge badge-ontime">ON-TIME</span>
              </div>
              <span class="context-sub">Jam Server: {{ currentTime || '...' }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">Initial Daily Status</span>
              <div class="context-value">
                <span v-if="initialDailyStatus === 'GREEN'" class="badge badge-active">GREEN — Terkendali</span>
                <span v-else-if="initialDailyStatus === 'AMBER'" class="badge badge-warning">AMBER — Berisiko</span>
                <span v-else-if="initialDailyStatus === 'RED'" class="badge badge-danger">RED — Kritis</span>
                <span v-else class="badge badge-neutral">0 KOMITMEN</span>
              </div>
              <span class="context-sub">Agregasi Tingkat Risiko</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Alert Banner jika terkunci -->
      <div v-if="isMorningLocked" class="alert-banner locked" role="alert">
        <Lock :size="20" />
        <div>
          <strong>Batas Cut-Off ({{ morningLockCutoff }} WIB) Telah Berakhir — Formulir Terkunci (DEC-002):</strong>
          Jendela pengisian Morning Commitment hari ini telah ditutup sesuai Kebijakan Sistem. Anda tetap dapat mencatat pekerjaan dadakan di halaman <em>Additional Work</em> dan menyelesaikan <em>EOD Outcome</em> sore hari.
        </div>
      </div>

      <!-- Alert Banner jika Late (09:00 - 09:30) -->
      <div v-else-if="isLate" class="alert-banner late">
        <Clock :size="20" />
        <div>
          <strong>Jendela Grace Period / Late Aktif ({{ morningOnTimeCutoff }} – {{ morningLockCutoff }} WIB):</strong>
          Batas waktu On-Time telah terlewati, namun Anda masih berada sebelum batas cut-off penguncian. Komitmen yang dikirim sekarang langsung sah dengan status <strong>LATE</strong>.
        </div>
      </div>

      <!-- Zero Commitment Option Box (DEC-004) -->
      <div class="zero-box">
        <label class="zero-label">
          <input
            type="checkbox"
            v-model="isZeroCommitment"
            :disabled="isMorningLocked"
          />
          <span>Hari ini tidak ada komitmen harian khusus (0 Komitmen / Zero Commitment — DEC-004)</span>
        </label>
        <div v-if="isZeroCommitment" class="zero-reason-box">
          <label for="zero-reason-input" class="form-label">
            Alasan Tidak Menetapkan Komitmen (Wajib Diisi) *
          </label>
          <textarea
            id="zero-reason-input"
            v-model="zeroCommitmentReason"
            class="input-control"
            rows="2"
            placeholder="Contoh: Mengikuti workshop arsitektur sistem seharian penuh bersama tim infra..."
            :disabled="isMorningLocked"
            minlength="10"
            required
          ></textarea>
          <span class="field-sub">
            Status hari ini akan tercatat sebagai <strong>NOT_APPLICABLE — NO_COMMITMENT</strong> (bukan No Submission).
          </span>
        </div>
      </div>

      <!-- Copy-Forward Section (FR-11, DEC-013) -->
      <section v-if="!isZeroCommitment && availableCarryOvers.length > 0" class="panel copy-forward-panel">
        <div class="panel-head clickable" @click="isCopyForwardOpen = !isCopyForwardOpen">
          <div>
            <div class="kicker">Lanjutan Hari Kerja Sebelumnya</div>
            <h2>Draf Tugas Berlanjut dari Kemarin (Continuation = Continue)</h2>
          </div>
          <div class="head-right">
            <span class="badge badge-info">{{ availableCarryOvers.length }} Tersedia</span>
            <button type="button" class="btn btn-secondary icon-text-btn">
              <span>{{ isCopyForwardOpen ? 'Tutup' : 'Lihat Draf' }}</span>
              <ChevronUp v-if="isCopyForwardOpen" :size="16" />
              <ChevronDown v-else :size="16" />
            </button>
          </div>
        </div>

        <div v-if="isCopyForwardOpen" class="panel-body">
          <p class="copy-desc">
            Pilih tugas dari hari kerja sebelumnya untuk disalin ke slot komitmen hari ini (DEC-013):
          </p>
          <div class="carry-list">
            <div v-for="item in availableCarryOvers" :key="item.originCommitmentId" class="carry-card">
              <div class="carry-main">
                <div class="carry-title">{{ item.taskText }}</div>
                <div class="carry-meta">
                  <span class="badge" :class="item.carryOverDaysCount >= 3 ? 'badge-warning' : 'badge-neutral'">
                    Carry-Over #{{ item.carryOverDaysCount }}
                  </span>
                  <span v-if="item.isAmberWarningAdvised" class="amber-advice">
                    Carry-over 3+ hari berturut-turut — Disarankan AMBER (DEC-003)
                  </span>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-secondary"
                :disabled="isMorningLocked"
                @click="applyCarryOver(item)"
              >
                <Copy :size="14" />
                <span>Salin ke Slot</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Commitment Slots Form (1-3) -->
      <section v-if="!isZeroCommitment" class="panel slots-panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Slot Komitmen Harian</div>
            <h2>Daftar Komitmen Hari Ini ({{ commitmentSlots.length }}/3)</h2>
          </div>
          <button
            v-if="commitmentSlots.length < 3 && !isMorningLocked"
            type="button"
            class="btn btn-secondary"
            @click="addSlot"
          >
            <Plus :size="16" />
            <span>Tambah Slot</span>
          </button>
        </div>

        <div class="panel-body slots-body">
          <div
            v-for="(slot, idx) in commitmentSlots"
            :key="idx"
            class="slot-card"
            :class="{ 'amber-slot': slot.initialRisk === 'AMBER', 'red-slot': slot.initialRisk === 'RED' }"
          >
            <div class="slot-header">
              <div class="slot-num-badge">
                <span>Komitmen #{{ idx + 1 }}</span>
                <span v-if="slot.carryOverDaysCount > 0" class="badge badge-warning">
                  Carry-Over #{{ slot.carryOverDaysCount }}
                </span>
              </div>
              <button
                v-if="commitmentSlots.length > 1 && !isMorningLocked"
                type="button"
                class="remove-btn"
                title="Hapus slot"
                @click="removeSlot(idx)"
              >
                <Trash2 :size="16" />
              </button>
            </div>

            <!-- Task text input -->
            <div class="form-group">
              <label class="form-label">Teks Komitmen Terukur *</label>
              <textarea
                v-model="slot.taskText"
                class="input-control"
                rows="2"
                placeholder="Deskripsikan deliverable utama yang dapat diverifikasi selesai hari ini..."
                :disabled="isMorningLocked"
                required
              ></textarea>
            </div>

            <!-- Reference link input -->
            <div class="form-group">
              <label class="form-label">Tautan Dokumen / PR / Tiket (Opsional)</label>
              <div class="input-with-icon">
                <LinkIcon :size="16" class="inner-icon" />
                <input
                  v-model="slot.referenceLink"
                  type="url"
                  class="input-control with-icon"
                  placeholder="https://github.com/... atau https://docs.google.com/..."
                  :disabled="isMorningLocked"
                />
              </div>
            </div>

            <!-- Initial Risk Selection -->
            <div class="form-group">
              <label class="form-label">Tingkat Risiko Awal & Potensi Kendala *</label>
              <div class="risk-options">
                <label
                  class="risk-card green"
                  :class="{ selected: slot.initialRisk === 'GREEN' }"
                >
                  <input
                    type="radio"
                    :name="`risk-${idx}`"
                    value="GREEN"
                    v-model="slot.initialRisk"
                    :disabled="isMorningLocked"
                  />
                  <div class="risk-title">GREEN</div>
                  <div class="risk-desc">Terkendali Mandiri (Tanpa hambatan eksternal)</div>
                </label>

                <label
                  class="risk-card amber"
                  :class="{ selected: slot.initialRisk === 'AMBER' }"
                >
                  <input
                    type="radio"
                    :name="`risk-${idx}`"
                    value="AMBER"
                    v-model="slot.initialRisk"
                    :disabled="isMorningLocked"
                  />
                  <div class="risk-title">AMBER</div>
                  <div class="risk-desc">Ada Dependensi / Potensi Hambatan</div>
                </label>

                <label
                  class="risk-card red"
                  :class="{ selected: slot.initialRisk === 'RED' }"
                >
                  <input
                    type="radio"
                    :name="`risk-${idx}`"
                    value="RED"
                    v-model="slot.initialRisk"
                    :disabled="isMorningLocked"
                  />
                  <div class="risk-title">RED</div>
                  <div class="risk-desc">Kritis / Memerlukan Intervensi Atasan</div>
                </label>
              </div>
            </div>

            <!-- Known Blocker & Support Needed (Muncul jika AMBER / RED) -->
            <div v-if="slot.initialRisk === 'AMBER' || slot.initialRisk === 'RED'" class="blocker-inputs-box">
              <div class="form-group">
                <label class="form-label">Catatan Potensi Kendala (Known Blocker Note) *</label>
                <textarea
                  v-model="slot.knownBlockerNote"
                  class="input-control"
                  rows="2"
                  placeholder="Jelaskan hambatan atau pihak yang ditunggu agar pimpinan dapat memantau..."
                  :disabled="isMorningLocked"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Bantuan yang Diharapkan (Support Needed)</label>
                <input
                  v-model="slot.supportNeeded"
                  type="text"
                  class="input-control"
                  placeholder="Misal: Bantuan eskalasi review PR ke Tech Lead"
                  :disabled="isMorningLocked"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Action Footer -->
      <div v-if="!isMorningLocked" class="action-footer">
        <div class="footer-info">
          Pastikan seluruh komitmen telah diisi dengan akurat sebelum batas cut-off {{ morningLockCutoff }} WIB.
        </div>
        <div class="footer-btns">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="submitting"
            @click="submitMorningCheckin"
          >
            <span>{{ submitting ? 'Mengirim...' : 'Kirim Morning Commitment' }}</span>
          </button>
        </div>
      </div>

      <!-- Success / Post-Submit Navigation Panel -->
      <div v-if="isSubmittedSuccess" class="post-submit-panel">
        <div class="post-submit-header">
          <CheckCircle2 :size="20" class="text-green" />
          <div>
            <h3>Morning Commitment Berhasil Tercatat</h3>
            <p>Baseline komitmen pagi tersimpan rapi. Anda dapat melanjutkan ke tahapan berikutnya sepanjang hari:</p>
          </div>
        </div>
        <div class="next-grid">
          <AccessLink to="/daily/additional-work" class="next-card">
            <h4>Pekerjaan Tambahan (Additional Work)</h4>
            <p>Catat pekerjaan tak terduga yang muncul di siang hari tanpa mengubah baseline pagi.</p>
          </AccessLink>
          <AccessLink to="/daily/eod" class="next-card">
            <h4>Evaluasi Sore (EOD Outcome)</h4>
            <p>Isi evaluasi capaian komitmen dan konfirmasi refleksi mandiri di akhir hari kerja.</p>
          </AccessLink>
        </div>
      </div>
    </main>
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

/* Workflow Step Bar */
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

/* Main Content */
.main-content {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
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

/* Panels */
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

.panel-head.clickable {
  cursor: pointer;
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

/* Context Grid */
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

.context-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* Alerts */
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

.alert-banner.late {
  background: var(--color-timing-late-bg);
  border: 1px solid var(--color-timing-late-border);
  color: var(--color-timing-late-fg);
}

/* Zero Commitment Box */
.zero-box {
  background: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
}

.zero-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
}

.zero-reason-box {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Copy forward panel */
.copy-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.carry-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.carry-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
}

.carry-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.carry-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.amber-advice {
  font-size: 11px;
  color: var(--color-status-amber-fg);
  font-weight: 600;
}

/* Slots Form */
.slots-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.slot-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slot-card.amber-slot {
  border-left: 4px solid #f59e0b;
}

.slot-card.red-slot {
  border-left: 4px solid #ef4444;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slot-num-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-primary);
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.remove-btn:hover {
  color: var(--color-status-red-fg);
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

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.inner-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary);
}

.input-control.with-icon {
  padding-left: 32px;
  width: 100%;
}

/* Risk radio cards */
.risk-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.risk-card {
  padding: 12px 14px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.risk-card input {
  display: none;
}

.risk-title {
  font-size: 13px;
  font-weight: 800;
}

.risk-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}

.risk-card.green.selected {
  border-color: #22c55e;
  background: var(--color-status-green-bg);
}

.risk-card.green .risk-title {
  color: var(--color-status-green-fg);
}

.risk-card.amber.selected {
  border-color: #f59e0b;
  background: var(--color-status-amber-bg);
}

.risk-card.amber .risk-title {
  color: var(--color-status-amber-fg);
}

.risk-card.red.selected {
  border-color: #ef4444;
  background: var(--color-status-red-bg);
}

.risk-card.red .risk-title {
  color: var(--color-status-red-fg);
}

.blocker-inputs-box {
  background: #fff;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Footer */
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

.btn-secondary:hover {
  background: var(--color-surface-subtle);
}

.icon-text-btn {
  height: 32px;
  padding: 4px 10px;
  font-size: 12px;
}

/* Post submit panel */
.post-submit-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-status-green-border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-submit-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
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

.next-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.next-card {
  padding: 14px;
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.next-card h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-primary);
}

.next-card p {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.next-card:hover {
  border-color: var(--color-brand-primary);
}

/* Badges */
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
