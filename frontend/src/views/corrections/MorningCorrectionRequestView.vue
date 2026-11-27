<script setup lang="ts">
import ToastPopup from '../../components/ToastPopup.vue';
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { apiClient } from '../../api/client';
import { formatDateWib } from '../../utils/dateTime';
import {
  truncateOptionText,
  formatCorrectionStatusLabel,
  formatCorrectionClassificationLabel,
} from '../../utils/correctionLabels';
import {
  AlertCircle,
  History,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  RotateCcw,
} from 'lucide-vue-next';

interface CommitmentItem {
  id: string;
  sequenceNo: number;
  taskText: string;
  referenceLink?: string;
  projectCode?: string | null;
  linkedBlockerId?: string | null;
  initialRisk: 'GREEN' | 'AMBER' | 'RED';
  knownBlockerNote?: string | null;
  supportNeeded?: string | null;
}

interface ProjectOption {
  projectCode: string;
  projectName: string;
}

interface ActiveBlockerOption {
  id: string;
  code: string;
  description: string;
  severity: string;
  projectCodeReference?: string | null;
  status: string;
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
const availableProjects = ref<ProjectOption[]>([]);
const activeBlockers = ref<ActiveBlockerOption[]>([]);
const myCorrections = ref<CorrectionHistoryItem[]>([]);

// Form fields
const selectedCommitmentId = ref<string>('');
const classification = ref<'MINOR' | 'MATERIAL'>('MINOR');
const newTaskText = ref('');
const newProjectCode = ref('');
const newReferenceLink = ref('');
const newInitialRisk = ref<'GREEN' | 'AMBER' | 'RED'>('GREEN');
const newLinkedBlockerId = ref('');
const newKnownBlockerNote = ref('');
const newSupportNeeded = ref('');
const reason = ref('');

// Toast
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
  } else {
    toastMessage.value = msg;
  }
}

const selectedCommitment = computed(() => {
  return todayCommitments.value.find((c) => c.id === selectedCommitmentId.value) || null;
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

const hasRequestedDiff = computed(() => {
  const base = selectedCommitment.value;
  if (!base) return false;
  const taskChanged = newTaskText.value.trim() !== (base.taskText || '').trim();
  const projectChanged =
    (newProjectCode.value.trim() || null) !== ((base.projectCode || '').trim() || null);
  const linkChanged =
    (newReferenceLink.value.trim() || null) !==
    ((base.referenceLink || '').trim() || null);
  const riskChanged = newInitialRisk.value !== base.initialRisk;
  const effBlocker = newInitialRisk.value === 'GREEN' ? null : (newLinkedBlockerId.value.trim() || null);
  const effNote = newInitialRisk.value === 'GREEN' ? null : (newKnownBlockerNote.value.trim() || null);
  const effSupport = newInitialRisk.value === 'GREEN' ? null : (newSupportNeeded.value.trim() || null);
  const blockerChanged = effBlocker !== ((base.linkedBlockerId || '').trim() || null);
  const noteChanged = effNote !== ((base.knownBlockerNote || '').trim() || null);
  const supportChanged = effSupport !== ((base.supportNeeded || '').trim() || null);
  return (
    taskChanged ||
    projectChanged ||
    linkChanged ||
    riskChanged ||
    blockerChanged ||
    noteChanged ||
    supportChanged
  );
});

function formatRiskLabel(risk?: string): string {
  if (risk === 'GREEN') return 'GREEN (Lancar)';
  if (risk === 'AMBER') return 'AMBER (Waspada)';
  if (risk === 'RED') return 'RED (Kritis)';
  return risk || '-';
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

function hasRiskDiff(item: CorrectionHistoryItem): boolean {
  return Boolean(
    item.valueBefore?.initialRisk &&
    item.valueRequested?.initialRisk &&
    item.valueBefore.initialRisk !== item.valueRequested.initialRisk,
  );
}

function hasLinkDiff(item: CorrectionHistoryItem): boolean {
  const beforeLink = (item.valueBefore?.referenceLink || '').trim();
  const afterLink = (item.valueRequested?.referenceLink || '').trim();
  return beforeLink !== afterLink && Boolean(beforeLink || afterLink);
}

function formatBlockerShortLabel(blockerId?: string | null): string {
  const id = (blockerId || '').trim();
  if (!id) return 'Tidak ada';
  const matched = activeBlockers.value.find((b) => b.id === id);
  if (matched) return `${matched.code} (${truncateOptionText(matched.description, 45)})`;
  return `#BLK-${id.slice(0, 6).toUpperCase()}`;
}

function hasProjectDiff(item: CorrectionHistoryItem): boolean {
  const b = (item.valueBefore?.projectCode || '').trim();
  const a = (item.valueRequested?.projectCode || '').trim();
  return item.valueRequested?.projectCode !== undefined && b !== a;
}

function hasBlockerDiff(item: CorrectionHistoryItem): boolean {
  const b = (item.valueBefore?.linkedBlockerId || '').trim();
  const a = (item.valueRequested?.linkedBlockerId || '').trim();
  return item.valueRequested?.linkedBlockerId !== undefined && b !== a;
}

function hasBlockerNoteDiff(item: CorrectionHistoryItem): boolean {
  const b = (item.valueBefore?.knownBlockerNote || '').trim();
  const a = (item.valueRequested?.knownBlockerNote || '').trim();
  return item.valueRequested?.knownBlockerNote !== undefined && b !== a;
}

function hasSupportDiff(item: CorrectionHistoryItem): boolean {
  const b = (item.valueBefore?.supportNeeded || '').trim();
  const a = (item.valueRequested?.supportNeeded || '').trim();
  return item.valueRequested?.supportNeeded !== undefined && b !== a;
}

function handleLinkedBlockerChange() {
  const id = newLinkedBlockerId.value.trim();
  if (!id) return;
  const blk = activeBlockers.value.find((b) => b.id === id);
  if (blk && !newKnownBlockerNote.value.trim()) {
    newKnownBlockerNote.value = `Terkait kendala aktif ${blk.code}: ${blk.description}`;
  }
}

watch(classification, (nextCls) => {
  if (nextCls === 'MINOR' && selectedCommitment.value) {
    newInitialRisk.value = selectedCommitment.value.initialRisk;
    newLinkedBlockerId.value = selectedCommitment.value.linkedBlockerId || '';
    newKnownBlockerNote.value = selectedCommitment.value.knownBlockerNote || '';
    newSupportNeeded.value = selectedCommitment.value.supportNeeded || '';
  }
});

function handleCommitmentSelect() {
  if (selectedCommitment.value) {
    newTaskText.value = selectedCommitment.value.taskText;
    newProjectCode.value = selectedCommitment.value.projectCode || '';
    newReferenceLink.value = selectedCommitment.value.referenceLink || '';
    newInitialRisk.value = selectedCommitment.value.initialRisk;
    newLinkedBlockerId.value = selectedCommitment.value.linkedBlockerId || '';
    newKnownBlockerNote.value = selectedCommitment.value.knownBlockerNote || '';
    newSupportNeeded.value = selectedCommitment.value.supportNeeded || '';
  }
}

function resetForm() {
  handleCommitmentSelect();
  reason.value = '';
  errorMessage.value = null;
}

function prefillFromRejected(item: CorrectionHistoryItem) {
  const targetId = item.targetCommitmentId || item.targetCommitment?.id;
  if (targetId && todayCommitments.value.some((c) => c.id === targetId)) {
    selectedCommitmentId.value = targetId;
    handleCommitmentSelect();
  }
  if (item.classification === 'MINOR' || item.classification === 'MATERIAL') {
    classification.value = item.classification;
  }

  const requested = item.valueRequested || {};
  if (typeof requested.taskText === 'string' && requested.taskText.trim()) {
    newTaskText.value = requested.taskText;
  } else if (selectedCommitment.value) {
    newTaskText.value = selectedCommitment.value.taskText;
  }

  if (requested.projectCode !== undefined) {
    newProjectCode.value = requested.projectCode || '';
  }

  if (requested.referenceLink !== undefined) {
    newReferenceLink.value = requested.referenceLink || '';
  }

  if (
    requested.initialRisk === 'GREEN' ||
    requested.initialRisk === 'AMBER' ||
    requested.initialRisk === 'RED'
  ) {
    newInitialRisk.value = requested.initialRisk;
  }

  if (requested.linkedBlockerId !== undefined) {
    newLinkedBlockerId.value = requested.linkedBlockerId || '';
  }

  if (requested.knownBlockerNote !== undefined) {
    newKnownBlockerNote.value = requested.knownBlockerNote || '';
  }

  if (requested.supportNeeded !== undefined) {
    newSupportNeeded.value = requested.supportNeeded || '';
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
        record?: { commitments?: CommitmentItem[] };
        availableProjects?: ProjectOption[];
        activeBlockers?: ActiveBlockerOption[];
      }>('/daily/today'),
      apiClient<CorrectionHistoryItem[]>('/correction-requests?mode=mine'),
    ]);

    if (Array.isArray(todayRes.data?.availableProjects)) {
      availableProjects.value = todayRes.data.availableProjects;
    }
    if (Array.isArray(todayRes.data?.activeBlockers)) {
      activeBlockers.value = todayRes.data.activeBlockers;
    }

    if (todayRes.data?.record?.commitments) {
      todayCommitments.value = todayRes.data.record.commitments;
      if (todayCommitments.value.length > 0 && !selectedCommitmentId.value) {
        selectedCommitmentId.value = todayCommitments.value[0].id;
        handleCommitmentSelect();
      } else if (syncSelectedForm && selectedCommitment.value) {
        handleCommitmentSelect();
      }
    }

    if (historyRes.data) {
      myCorrections.value = historyRes.data.filter(
        (h: any) => !h.scopeType || h.scopeType === 'MORNING_COMMITMENT',
      );
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
  if (pendingRequestForSelected.value) {
    showToast(
      'Masih ada permohonan koreksi material yang sedang menunggu tinjauan atasan untuk komitmen ini.',
      true,
    );
    return;
  }
  if (newTaskText.value.trim().length < 3) {
    showToast('Deskripsi komitmen baru minimal 3 karakter.', true);
    return;
  }
  if (
    classification.value === 'MINOR' &&
    selectedCommitment.value &&
    newInitialRisk.value !== selectedCommitment.value.initialRisk
  ) {
    showToast('Perubahan tingkat risiko wajib diajukan melalui Perubahan Material.', true);
    return;
  }
  if (newInitialRisk.value === 'RED' && !newLinkedBlockerId.value.trim()) {
    showToast(
      'Komitmen dengan risiko RED wajib menautkan tiket Blocker aktif terlebih dahulu.',
      true,
    );
    return;
  }
  if (
    (newInitialRisk.value === 'AMBER' || newInitialRisk.value === 'RED') &&
    !newKnownBlockerNote.value.trim()
  ) {
    showToast(
      `Komitmen dengan risiko ${newInitialRisk.value} wajib menyertakan uraian potensi kendala.`,
      true,
    );
    return;
  }
  if (!hasRequestedDiff.value) {
    showToast(
      'Perubahan yang diajukan masih sama dengan data komitmen saat ini. Silakan ubah minimal satu isian komitmen.',
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
    const isGreen = newInitialRisk.value === 'GREEN';
    const payload = {
      targetCommitmentId: selectedCommitmentId.value,
      scopeType: 'MORNING_COMMITMENT',
      classification: classification.value,
      reason: reason.value.trim(),
      requestedChange: {
        taskText: newTaskText.value.trim(),
        projectCode: newProjectCode.value.trim() || null,
        referenceLink: newReferenceLink.value.trim() || null,
        initialRisk: newInitialRisk.value,
        linkedBlockerId: isGreen ? null : newLinkedBlockerId.value.trim() || null,
        knownBlockerNote: isGreen ? null : newKnownBlockerNote.value.trim() || null,
        supportNeeded: isGreen ? null : newSupportNeeded.value.trim() || null,
      },
    };

    const res = await apiClient<any>('/correction-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.status === 'AUTO_APPLIED') {
      showToast('Koreksi minor berhasil diterapkan otomatis dan tercatat di riwayat audit.');
    } else {
      showToast('Permohonan koreksi material telah diajukan dan menunggu tinjauan Atasan Berwenang.');
    }

    reason.value = '';
    await loadData(true);
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
    <TopBar breadcrumb="Workspace / Koreksi Komitmen Pagi" />

    <!-- Toasts -->
    <ToastPopup
      :toast-message="toastMessage"
      :error-message="errorMessage"
      @clear-toast="toastMessage = null"
      @clear-error="errorMessage = null"
    />

    <main class="main-content">
      <!-- Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Koreksi Resmi &amp; Jejak Audit</span>
          <h1>Permohonan Koreksi Komitmen Pagi</h1>
          <p class="subtitle">
            Gunakan formulir resmi ini jika Anda memerlukan perbaikan komitmen pagi setelah batas waktu cut-off terkunci. Perubahan minor diterapkan langsung secara otomatis, sedangkan perubahan material ditinjau oleh Atasan Berwenang.
          </p>
        </div>
      </div>

      <!-- Tab Perpindahan Konteks Pagi / Sore -->
      <nav class="context-tabs-wrap" aria-label="Pilihan Jenis Koreksi">
        <AccessLink to="/corrections/morning" class="context-tab active">
          <span>Koreksi Komitmen Pagi</span>
          <span class="context-tab-tag">Alur Pagi · Aktif</span>
        </AccessLink>
        <AccessLink to="/corrections/eod" class="context-tab">
          <span>Koreksi Evaluasi Sore (EOD)</span>
          <span class="context-tab-tag">Alur Sore</span>
        </AccessLink>
      </nav>

      <!-- State: No commitments to correct -->
      <div v-if="todayCommitments.length === 0 && !loading" class="no-baseline-card">
        <AlertCircle :size="32" class="empty-icon" />
        <h2>Tidak Ada Komitmen Hari Ini</h2>
        <p>Anda belum mengisi komitmen pagi hari ini, atau komitmen belum terkunci.</p>
        <AccessLink to="/daily/morning" class="btn-primary" style="margin-top: 14px;">
          Buka Morning Commitment
        </AccessLink>
      </div>

      <div v-else class="split-layout">
        <!-- Panel Formulir Koreksi -->
        <section class="panel form-panel">
          <div class="panel-head">
            <h2>Formulir Pengajuan Koreksi Komparatif</h2>
            <p class="panel-desc">Perbandingan data komitmen awal dan usulan perubahan.</p>
          </div>

          <form class="panel-body" @submit.prevent="submitCorrection">
            <!-- Pilih Komitmen Target -->
            <div class="form-group">
              <label for="comSelect">Pilih Komitmen yang Ingin Dikoreksi <span class="req">*</span></label>
              <select id="comSelect" v-model="selectedCommitmentId" @change="handleCommitmentSelect" required>
                <option v-for="c in todayCommitments" :key="c.id" :value="c.id">
                  [Komitmen #{{ c.sequenceNo }}] {{ truncateOptionText(c.taskText, 44) }} ({{ formatRiskLabel(c.initialRisk) }})
                </option>
              </select>
            </div>

            <!-- Baseline Snapshot Box -->
            <div v-if="selectedCommitment" class="baseline-box">
              <span class="baseline-tag">Komitmen Awal Tersimpan (Terkunci)</span>
              <div class="base-task">{{ selectedCommitment.taskText }}</div>
              <div class="base-meta">
                <span>Risiko Awal: <strong>{{ formatRiskLabel(selectedCommitment.initialRisk) }}</strong></span>
                <span v-if="selectedCommitment.projectCode"> · Proyek: <strong>{{ selectedCommitment.projectCode }}</strong></span>
                <span v-if="selectedCommitment.referenceLink"> · Link: {{ selectedCommitment.referenceLink }}</span>
              </div>
              <div v-if="selectedCommitment.linkedBlockerId || selectedCommitment.knownBlockerNote || selectedCommitment.supportNeeded" class="base-risk-meta">
                <div v-if="selectedCommitment.linkedBlockerId">
                  <strong>Tiket Blocker:</strong> {{ formatBlockerShortLabel(selectedCommitment.linkedBlockerId) }}
                </div>
                <div v-if="selectedCommitment.knownBlockerNote">
                  <strong>Uraian Kendala:</strong> {{ selectedCommitment.knownBlockerNote }}
                </div>
                <div v-if="selectedCommitment.supportNeeded">
                  <strong>Bantuan Diharapkan:</strong> {{ selectedCommitment.supportNeeded }}
                </div>
              </div>
            </div>

            <!-- Banner Pengajuan Menunggu Review pada Komitmen Terpilih -->
            <div v-if="pendingRequestForSelected" class="in-flight-banner" role="status">
              <Clock :size="18" />
              <div class="in-flight-body">
                <strong>Permohonan Koreksi Material Sedang Menunggu Tinjauan Atasan</strong>
                <p>
                  Komitmen ini masih memiliki pengajuan perubahan penting yang menunggu keputusan atasan.
                  <span v-if="pendingRequestForSelected.objectionWindowEndsAt">
                    Batas waktu tinjauan 24 jam: <strong>{{ formatDateWib(pendingRequestForSelected.objectionWindowEndsAt) }}</strong>.
                  </span>
                  Anda tetap dapat memilih komitmen nomor lain di atas jika ingin mengajukan koreksi berbeda.
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
                  <p>Koreksi salah ketik (typo) atau perbaikan tautan referensi. Diterapkan langsung secara otomatis dan tercatat di riwayat audit.</p>
                </label>

                <label class="class-card" :class="{ selected: classification === 'MATERIAL' }">
                  <input type="radio" v-model="classification" value="MATERIAL" />
                  <div class="class-title">
                    <AlertTriangle :size="16" />
                    <strong>Perubahan Material</strong>
                  </div>
                  <p>Perubahan substansial target komitmen atau risiko. Membuka jendela tinjauan 24 jam oleh Atasan Berwenang.</p>
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

            <!-- Proyek Terkait Baru -->
            <div class="form-group">
              <label for="newProjectSelect">Proyek Terkait <span class="opt">(opsional)</span></label>
              <select id="newProjectSelect" v-model="newProjectCode">
                <option value="">-- Non-Proyek / Operasional Rutin --</option>
                <option
                  v-for="prj in availableProjects"
                  :key="prj.projectCode"
                  :value="prj.projectCode"
                >
                  [{{ prj.projectCode }}] {{ truncateOptionText(prj.projectName, 40) }}
                </option>
              </select>
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
                <label
                  class="risk-label green"
                  :class="{ selected: newInitialRisk === 'GREEN', 'disabled-option': classification === 'MINOR' }"
                >
                  <input
                    type="radio"
                    v-model="newInitialRisk"
                    value="GREEN"
                    :disabled="classification === 'MINOR'"
                  />
                  <span>GREEN (Lancar)</span>
                </label>
                <label
                  class="risk-label amber"
                  :class="{ selected: newInitialRisk === 'AMBER', 'disabled-option': classification === 'MINOR' }"
                >
                  <input
                    type="radio"
                    v-model="newInitialRisk"
                    value="AMBER"
                    :disabled="classification === 'MINOR'"
                  />
                  <span>AMBER (Waspada)</span>
                </label>
                <label
                  class="risk-label red"
                  :class="{ selected: newInitialRisk === 'RED', 'disabled-option': classification === 'MINOR' }"
                >
                  <input
                    type="radio"
                    v-model="newInitialRisk"
                    value="RED"
                    :disabled="classification === 'MINOR'"
                  />
                  <span>RED (Kritis)</span>
                </label>
              </div>
              <p v-if="classification === 'MINOR'" class="field-hint">
                Tingkat risiko terkunci saat Perubahan Minor. Pilih <strong>Perubahan Material</strong> bila ingin mengubah risiko atau detail kendala.
              </p>
            </div>

            <!-- Detail Risiko & Kendala (DEC-020 & DEC-021 — Setara Halaman Harian) -->
            <div
              v-if="newInitialRisk === 'AMBER' || newInitialRisk === 'RED'"
              class="risk-details-box"
              data-testid="correction-risk-details"
            >
              <div class="form-group">
                <label for="newLinkedBlockerSelect">
                  {{ newInitialRisk === 'RED' ? 'Tiket Blocker Penyebab (Wajib untuk RED)' : 'Tiket Blocker Penyebab' }}
                  <span v-if="newInitialRisk === 'RED'" class="req">*</span>
                  <span v-else class="opt">(opsional)</span>
                </label>
                <select
                  id="newLinkedBlockerSelect"
                  v-model="newLinkedBlockerId"
                  data-testid="correction-blocker-select"
                  :disabled="classification === 'MINOR'"
                  :required="newInitialRisk === 'RED'"
                  @change="handleLinkedBlockerChange"
                >
                  <option value="">
                    {{
                      newInitialRisk === 'RED'
                        ? '-- Pilih Tiket Blocker Aktif (Wajib) --'
                        : '-- Tidak Terkait Tiket Blocker Aktif --'
                    }}
                  </option>
                  <option v-for="blk in activeBlockers" :key="blk.id" :value="blk.id">
                    {{ blk.code }} [{{ blk.severity }}] — {{ truncateOptionText(blk.description, 45) }}
                  </option>
                </select>
                <div
                  v-if="newInitialRisk === 'RED' && !newLinkedBlockerId"
                  class="blocker-shortcut-hint"
                >
                  <span>Belum punya tiket Blocker aktif? Buat tiket terlebih dahulu di halaman Lapor Blocker.</span>
                  <AccessLink to="/raise-blockers" class="blocker-shortcut-link">
                    + Buat Tiket Blocker
                  </AccessLink>
                </div>
              </div>

              <div class="form-group">
                <label for="newKnownBlockerNoteInput">
                  Uraian Risiko atau Potensi Kendala <span class="req">*</span>
                </label>
                <textarea
                  id="newKnownBlockerNoteInput"
                  v-model="newKnownBlockerNote"
                  rows="2"
                  :disabled="classification === 'MINOR'"
                  :required="newInitialRisk === 'AMBER' || newInitialRisk === 'RED'"
                  placeholder="Jelaskan potensi hambatan atau kendala yang memengaruhi penyelesaian komitmen..."
                ></textarea>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label for="newSupportNeededInput">
                  Tindakan / Bantuan yang Diharapkan <span class="opt">(opsional)</span>
                </label>
                <textarea
                  id="newSupportNeededInput"
                  v-model="newSupportNeeded"
                  rows="2"
                  :disabled="classification === 'MINOR'"
                  placeholder="Tuliskan dukungan spesifik dari atasan atau tim terkait..."
                ></textarea>
              </div>
            </div>

            <!-- Alasan Koreksi Resmi -->
            <div class="form-group">
              <div class="label-row">
                <label for="reasonInput">Alasan Resmi Permohonan Koreksi <span class="req">*</span></label>
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
                id="reasonInput"
                v-model="reason"
                rows="3"
                minlength="10"
                required
                placeholder="Jelaskan alasan objektif pengajuan perbaikan pasca-cutoff ini (min. 10 karakter)..."
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
                :disabled="submitting || !selectedCommitmentId || newTaskText.trim().length < 3 || reason.trim().length < 10 || !!pendingRequestForSelected"
              >
                <span v-if="submitting">Mengajukan...</span>
                <span v-else>Kirim Permohonan Koreksi</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Panel Riwayat Permohonan Koreksi -->
        <section class="panel history-panel">
          <div class="panel-head">
            <h2>Riwayat Permohonan Koreksi</h2>
            <p class="panel-desc">Riwayat permanen seluruh pengajuan koreksi yang tidak dapat diubah.</p>
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
                    <span v-if="getCommitmentSequenceNo(item)" class="seq-pill">
                      Komitmen #{{ getCommitmentSequenceNo(item) }}
                    </span>
                    <span class="status-badge" :class="item.status.toLowerCase()">
                      {{ formatCorrectionStatusLabel(item.status) }}
                    </span>
                    <span class="class-pill">{{ formatCorrectionClassificationLabel(item.classification) }}</span>
                  </div>
                  <span class="hist-date wp-datetime">
                    {{ formatDateWib(item.createdAt) }}
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

                <div
                  v-if="hasRiskDiff(item) || hasLinkDiff(item) || hasProjectDiff(item) || hasBlockerDiff(item) || hasBlockerNoteDiff(item) || hasSupportDiff(item)"
                  class="hist-extra-changes"
                >
                  <div v-if="hasProjectDiff(item)" class="extra-change-row">
                    <strong>Proyek Terkait:</strong>
                    <span>{{ item.valueBefore?.projectCode || '(non-proyek)' }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ item.valueRequested?.projectCode || '(non-proyek)' }}</span>
                  </div>
                  <div v-if="hasRiskDiff(item)" class="extra-change-row">
                    <strong>Tingkat Risiko:</strong>
                    <span>{{ formatRiskLabel(item.valueBefore?.initialRisk) }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ formatRiskLabel(item.valueRequested?.initialRisk) }}</span>
                  </div>
                  <div v-if="hasLinkDiff(item)" class="extra-change-row">
                    <strong>Tautan Referensi:</strong>
                    <span>{{ item.valueBefore?.referenceLink || '(kosong)' }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ item.valueRequested?.referenceLink || '(dihapus)' }}</span>
                  </div>
                  <div v-if="hasBlockerDiff(item)" class="extra-change-row">
                    <strong>Tiket Blocker:</strong>
                    <span>{{ formatBlockerShortLabel(item.valueBefore?.linkedBlockerId) }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ formatBlockerShortLabel(item.valueRequested?.linkedBlockerId) }}</span>
                  </div>
                  <div v-if="hasBlockerNoteDiff(item)" class="extra-change-row">
                    <strong>Uraian Kendala:</strong>
                    <span>{{ item.valueBefore?.knownBlockerNote || '(kosong)' }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ item.valueRequested?.knownBlockerNote || '(dihapus)' }}</span>
                  </div>
                  <div v-if="hasSupportDiff(item)" class="extra-change-row">
                    <strong>Bantuan Diharapkan:</strong>
                    <span>{{ item.valueBefore?.supportNeeded || '(kosong)' }}</span>
                    <ArrowRight :size="12" />
                    <span>{{ item.valueRequested?.supportNeeded || '(dihapus)' }}</span>
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

                <div v-if="item.status === 'REJECTED'" style="margin-top: 10px;">
                  <button
                    type="button"
                    class="btn-prefill-revision"
                    :data-testid="`prefill-rejected-${item.id}`"
                    @click="prefillFromRejected(item)"
                  >
                    Gunakan Draf Sebelumnya &amp; Sesuaikan
                  </button>
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

select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 36px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C6E68' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 16px 16px;
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
.risk-label.disabled-option {
  opacity: 0.65;
  cursor: not-allowed;
}

.field-hint {
  margin: 6px 0 0;
  font-size: 11.5px;
  color: #5C6E68;
  line-height: 1.4;
}

.base-risk-meta {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #CBD9D3;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  color: #334840;
}

.risk-details-box {
  background: #F8FBFA;
  border: 1px solid #DCE7E2;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 16px;
}

.blocker-shortcut-hint {
  margin-top: 8px;
  padding: 8px 10px;
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  border-radius: 6px;
  font-size: 11.5px;
  color: #92400E;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.blocker-shortcut-link {
  font-weight: 700;
  color: #92400E;
  text-decoration: underline;
  white-space: nowrap;
}

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

.no-baseline-card {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  max-width: 500px;
  margin: 40px auto;
}

.empty-feed {
  padding: 48px 20px;
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

.hist-head {
  flex-wrap: wrap;
  gap: 6px;
}

.hist-badges {
  flex-wrap: wrap;
}

.status-badge,
.class-pill,
.seq-pill,
.hist-date {
  white-space: nowrap;
}

@media (max-width: 1180px) {
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

  .class-grid {
    grid-template-columns: 1fr;
  }

  .risk-options {
    flex-direction: column;
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
