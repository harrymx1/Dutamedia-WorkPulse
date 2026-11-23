<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { apiClient } from '../../api/client';
import { formatTimeWib, formatDateSpanWib, formatWeekdayDateWib } from '../../utils/dateTime';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  AlertTriangle,
  CalendarCheck,
  Info,
} from 'lucide-vue-next';

interface ActiveLeave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface ActiveBlockerSummary {
  id: string;
  code: string;
  description: string;
  severity: string;
  type?: string;
  status: string;
}

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
const recordId = ref<string | null>(null);
const isMorningLocked = ref(false);
const morningTiming = ref<string | null>(null);
const isEodLocked = ref(false);
const isLate = ref(false);
const eodOnTimeCutoff = ref('17:00');
const eodLockCutoff = ref('21:00');
const eodSubmittedAt = ref<string | null>(null);
const activeLeave = ref<ActiveLeave | null>(null);
const myActiveBlockers = ref<ActiveBlockerSummary[]>([]);

const hasSubmittedEod = computed(() => {
  return eodSubmittedAt.value !== null && eodSubmittedAt.value !== '';
});
const hasRecord = computed(() => Boolean(recordId.value));
const isMorningMissedPostCutoff = computed(
  () => (!hasRecord.value && isMorningLocked.value) || morningTiming.value === 'NO_SUBMISSION',
);
const isBlockedBeforeMorningCutoff = computed(
  () =>
    !hasRecord.value &&
    !isMorningLocked.value &&
    !activeLeave.value &&
    !isEodLocked.value &&
    !loading.value,
);
const isFormLocked = computed(() => isEodLocked.value || hasSubmittedEod.value || Boolean(activeLeave.value));

function formatLeaveType(type?: string): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Cuti Sakit';
    case 'PERMIT':
      return 'Izin';
    case 'SPECIAL_LEAVE':
      return 'Cuti Khusus';
    case 'MATERNITY':
      return 'Cuti Melahirkan';
    case 'UNPAID':
      return 'Cuti di Luar Tanggungan';
    default:
      return type || 'Cuti Resmi';
  }
}

function formatLeaveDateRange(startStr?: string, endStr?: string): string {
  return formatDateSpanWib(startStr, endStr, '');
}

function formatTime(isoStr: string | null) {
  return formatTimeWib(isoStr, '');
}

function formatReason(reason: string): string {
  const map: Record<string, string> = {
    NEWLY_ASSIGNED: 'Penugasan Baru Atasan',
    OPERATIONAL_INCIDENT: 'Perbaikan Error / Bug Kritis',
    MISSED_IN_PLANNING: 'Terlewat Catat Pagi',
    MORNING_CUTOFF_MISSED: 'Komitmen Pagi Terlewat',
    PRIORITY_CHANGE: 'Pengalihan Prioritas',
    OTHER: 'Lainnya',
  };
  return map[reason] || reason;
}

function formatOutcomeLabel(outcome: CommitmentOutcomeItem['outcome'] | null | undefined): string {
  switch (outcome) {
    case 'COMPLETED':
      return 'Selesai Penuh';
    case 'PARTIALLY_COMPLETED':
      return 'Selesai Sebagian';
    case 'NOT_COMPLETED':
      return 'Belum Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return hasSubmittedEod.value ? 'Belum Dievaluasi' : 'Terkunci (Melewati Cut-Off)';
  }
}

function getOutcomeBadgeClass(outcome: CommitmentOutcomeItem['outcome'] | null | undefined): string {
  switch (outcome) {
    case 'COMPLETED':
      return 'badge-active';
    case 'PARTIALLY_COMPLETED':
      return 'badge-warning';
    case 'NOT_COMPLETED':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
}

function getSummaryBorderClass(outcome: CommitmentOutcomeItem['outcome'] | null | undefined): string {
  switch (outcome) {
    case 'COMPLETED':
      return 'summary-card-green';
    case 'PARTIALLY_COMPLETED':
      return 'summary-card-amber';
    case 'NOT_COMPLETED':
      return 'summary-card-red';
    default:
      return 'summary-card-neutral';
  }
}

function formatContinuationLabel(continuation: CommitmentOutcomeItem['continuation'] | null | undefined): string {
  switch (continuation) {
    case 'CONTINUE':
      return 'Lanjutkan Besok (Carry-Over)';
    case 'DO_NOT_CONTINUE':
      return 'Hentikan / Selesai di Sini';
    default:
      return '-';
  }
}

function getFinalStatusInfo(status: 'GREEN' | 'AMBER' | 'RED' | null | undefined) {
  switch (status) {
    case 'GREEN':
      return {
        label: 'GREEN — Target Harian Tercapai / Terkendali',
        desc: 'Mayoritas target selesai tepat waktu tanpa hambatan berarti.',
        cardClass: 'summary-card-green',
        badgeClass: 'badge-active',
      };
    case 'AMBER':
      return {
        label: 'AMBER — Terkendala Sebagian / Butuh Penyesuaian',
        desc: 'Ada target tertunda atau butuh waktu lanjutan (Carry-Over).',
        cardClass: 'summary-card-amber',
        badgeClass: 'badge-warning',
      };
    case 'RED':
      return {
        label: 'RED — Hambatan Kritis / Gagal Target',
        desc: 'Terhambat blocker serius atau butuh eskalasi segera.',
        cardClass: 'summary-card-red',
        badgeClass: 'badge-danger',
      };
    default:
      return {
        label: 'Belum Ada Refleksi Akhir Hari',
        desc: 'Evaluasi akhir hari belum diserahkan sebelum batas waktu cut-off.',
        cardClass: 'summary-card-neutral',
        badgeClass: 'badge-neutral',
      };
  }
}

// Format hari dan tanggal dinamis bahasa Indonesia untuk header konteks (IMP-033)
const formattedWorkDate = computed(() => {
  if (!workDate.value) return '';
  return formatWeekdayDateWib(workDate.value, workDate.value);
});

const commitments = ref<CommitmentOutcomeItem[]>([]);
const additionalWorks = ref<AdditionalWorkOutcomeItem[]>([]);
const finalDailyStatus = ref<'GREEN' | 'AMBER' | 'RED'>('GREEN');
const dailyRiskExplanation = ref('');
const tomorrowPriority = ref('');
const showMismatchConfirm = ref(false);

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isSubmittedSuccess = ref(false);

function needsContinuation(outcome: CommitmentOutcomeItem['outcome']): boolean {
  return outcome === 'PARTIALLY_COMPLETED' || outcome === 'NOT_COMPLETED';
}

const requiresRiskExplanation = computed(
  () => finalDailyStatus.value === 'AMBER' || finalDailyStatus.value === 'RED',
);

const statusSuggestion = computed<{ status: 'GREEN' | 'AMBER' | 'RED'; reason: string } | null>(() => {
  const items = [...commitments.value, ...additionalWorks.value];
  const hasCriticalBlocker = myActiveBlockers.value.some((b) => b.severity === 'CRITICAL');
  const hasUnresolvedIncident = additionalWorks.value.some(
    (w) => w.reason === 'OPERATIONAL_INCIDENT' && w.outcome !== 'COMPLETED',
  );

  if (hasCriticalBlocker) {
    return {
      status: 'RED',
      reason: 'Terdapat blocker aktif dengan tingkat keparahan Kritis (Critical).',
    };
  }
  if (hasUnresolvedIncident) {
    return {
      status: 'RED',
      reason: 'Terdapat perbaikan error/insiden kritis hari ini yang belum selesai penuh.',
    };
  }

  if (items.length > 0) {
    const failedCount = items.filter(
      (i) => i.outcome === 'NOT_COMPLETED' || i.outcome === 'CANCELLED',
    ).length;
    if (failedCount / items.length >= 0.5) {
      return {
        status: 'RED',
        reason: 'Minimal 50% target pekerjaan hari ini berstatus Belum Selesai atau Dibatalkan.',
      };
    }
  }

  if (commitments.value.some((c) => c.carryOverDaysCount >= 2)) {
    return {
      status: 'AMBER',
      reason: 'Terdapat komitmen berlanjut 2 hari berturut-turut atau lebih (Carry-Over #2+).',
    };
  }

  if (myActiveBlockers.value.some((b) => b.severity === 'HIGH')) {
    return {
      status: 'AMBER',
      reason: 'Terdapat blocker aktif dengan prioritas Tinggi (High).',
    };
  }

  if (
    items.some(
      (i) =>
        i.outcome === 'PARTIALLY_COMPLETED' ||
        i.outcome === 'NOT_COMPLETED' ||
        i.outcome === 'CANCELLED',
    )
  ) {
    return {
      status: 'AMBER',
      reason: 'Terdapat pekerjaan yang selesai sebagian, belum selesai, atau dibatalkan.',
    };
  }

  if (myActiveBlockers.value.length > 0) {
    return {
      status: 'AMBER',
      reason: 'Masih terdapat blocker aktif milik Anda yang sedang berjalan.',
    };
  }

  if (items.length > 0 && items.every((i) => i.outcome === 'COMPLETED')) {
    return {
      status: 'GREEN',
      reason: 'Seluruh pekerjaan hari ini selesai penuh dan tidak ada blocker aktif.',
    };
  }

  return null;
});

const STATUS_WEIGHT: Record<'GREEN' | 'AMBER' | 'RED', number> = {
  GREEN: 0,
  AMBER: 1,
  RED: 2,
};

const isStatusLighterThanSuggestion = computed(() => {
  if (!statusSuggestion.value) return false;
  return STATUS_WEIGHT[finalDailyStatus.value] < STATUS_WEIGHT[statusSuggestion.value.status];
});

watch([finalDailyStatus, () => statusSuggestion.value?.status], () => {
  showMismatchConfirm.value = false;
});

async function loadTodayState() {
  loading.value = true;
  try {
    const res = await apiClient<{
      workDate: string;
      currentTime: string;
      cutoffTimings: {
        isMorningLocked?: boolean;
        eodOnTimeCutoff: string;
        eodLockCutoff: string;
        isEodLocked: boolean;
      };
      record: any;
      activeLeave?: ActiveLeave | null;
      myActiveBlockers?: ActiveBlockerSummary[];
    }>('/daily/today');

    const data = res.data;
    activeLeave.value = (data as any).activeLeave || null;
    workDate.value = data.workDate;
    currentTime.value = data.currentTime;
    isMorningLocked.value = Boolean(data.cutoffTimings?.isMorningLocked);
    eodOnTimeCutoff.value = data.cutoffTimings.eodOnTimeCutoff;
    eodLockCutoff.value = data.cutoffTimings.eodLockCutoff;
    isEodLocked.value = data.cutoffTimings.isEodLocked;
    isLate.value = data.currentTime > data.cutoffTimings.eodOnTimeCutoff && !data.cutoffTimings.isEodLocked;
    myActiveBlockers.value = Array.isArray((data as any).myActiveBlockers)
      ? (data as any).myActiveBlockers
      : [];
    showMismatchConfirm.value = false;

    if (data.record) {
      recordId.value = data.record.id || 'record';
      morningTiming.value = data.record.morningTiming || null;
      eodSubmittedAt.value = data.record.eodSubmittedAt
        ? new Date(data.record.eodSubmittedAt).toISOString()
        : null;

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
      }
      dailyRiskExplanation.value = (data.record.orgContextSnapshot as any)?.dailyRiskExplanation || '';
      tomorrowPriority.value = (data.record.orgContextSnapshot as any)?.tomorrowPriority || '';
      isSubmittedSuccess.value = !!eodSubmittedAt.value;
    } else {
      recordId.value = null;
      morningTiming.value = null;
      commitments.value = [];
      additionalWorks.value = [];
      dailyRiskExplanation.value = '';
      tomorrowPriority.value = '';
      eodSubmittedAt.value = null;
      isSubmittedSuccess.value = false;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat evaluasi EOD.', true);
  } finally {
    loading.value = false;
  }
}

async function submitEod(bypassMismatchConfirm = false) {
  errorMessage.value = null;

  // Validasi outcome & continuation (hanya wajib alasan kelanjutan jika outcome Sebagian / Belum Selesai)
  const itemsToValidate = [
    ...commitments.value.map((c) => ({
      label: `Komitmen #${c.sequenceNo}`,
      outcome: c.outcome,
      outcomeReason: c.outcomeReason,
      continuation: c.continuation,
      continuationReason: c.continuationReason,
    })),
    ...additionalWorks.value.map((w) => ({
      label: `Pekerjaan Tambahan "${w.taskText.slice(0, 20)}..."`,
      outcome: w.outcome,
      outcomeReason: w.outcomeReason,
      continuation: w.continuation,
      continuationReason: w.continuationReason,
    })),
  ];

  for (const item of itemsToValidate) {
    if (item.outcome === 'CANCELLED' && item.outcomeReason.trim().length === 0) {
      errorMessage.value = `${item.label}: Alasan pembatalan wajib diisi bila status Dibatalkan.`;
      return;
    }
    if (
      needsContinuation(item.outcome) &&
      item.continuation === 'CONTINUE' &&
      item.continuationReason.trim().length === 0
    ) {
      errorMessage.value = `${item.label}: Alasan kelanjutan (Continuation) wajib diisi bila tugas dilanjutkan.`;
      return;
    }
  }

  if (requiresRiskExplanation.value && dailyRiskExplanation.value.trim().length < 10) {
    errorMessage.value =
      'Penjelasan risiko atau kendala hari ini wajib diisi minimal 10 karakter ketika status akhir hari AMBER atau RED.';
    return;
  }

  if (!bypassMismatchConfirm && isStatusLighterThanSuggestion.value) {
    showMismatchConfirm.value = true;
    return;
  }

  submitting.value = true;
  showMismatchConfirm.value = false;
  try {
    const payload = {
      workDate: workDate.value,
      commitmentOutcomes: commitments.value.map((c) => ({
        commitmentId: c.id,
        outcome: c.outcome,
        outcomeReason: c.outcome === 'CANCELLED' && c.outcomeReason.trim() ? c.outcomeReason.trim() : undefined,
        continuation: needsContinuation(c.outcome) ? c.continuation : undefined,
        continuationReason:
          needsContinuation(c.outcome) && c.continuation === 'CONTINUE'
            ? c.continuationReason.trim()
            : undefined,
      })),
      additionalWorkOutcomes: additionalWorks.value.map((w) => ({
        additionalWorkId: w.id,
        outcome: w.outcome,
        outcomeReason: w.outcome === 'CANCELLED' && w.outcomeReason.trim() ? w.outcomeReason.trim() : undefined,
        continuation: needsContinuation(w.outcome) ? w.continuation : undefined,
        continuationReason:
          needsContinuation(w.outcome) && w.continuation === 'CONTINUE'
            ? w.continuationReason.trim()
            : undefined,
      })),
      finalDailyStatus: finalDailyStatus.value, // DEC-003: Hak konfirmasi status GREEN dijamin bebas
      dailyRiskExplanation:
        requiresRiskExplanation.value && dailyRiskExplanation.value.trim()
          ? dailyRiskExplanation.value.trim()
          : undefined,
      tomorrowPriority: tomorrowPriority.value.trim() ? tomorrowPriority.value.trim() : undefined,
    };

    const res = await apiClient<{ eodSubmittedAt?: string }>('/daily/eod', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    showToast('Evaluasi EOD Outcome berhasil dikirim dan dicatat.');
    eodSubmittedAt.value = res.data?.eodSubmittedAt
      ? new Date(res.data.eodSubmittedAt).toISOString()
      : new Date().toISOString();
    isSubmittedSuccess.value = true;
    await loadTodayState();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengirim evaluasi EOD.';
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
    <TopBar breadcrumb="Workspace / My Today / EOD Outcome" />

    <!-- Daily Workflow Step Bar -->
    <nav class="workflow-bar" aria-label="Alur Akuntabilitas Harian">
      <div class="step-items">
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
      </div>

      <div class="workflow-actions">
        <AccessLink
          to="/raise-blockers"
          class="btn-report-blocker"
          title="Laporkan kendala kritis atau dependensi"
          data-testid="report-blocker-btn"
        >
          <AlertTriangle :size="15" />
          <span>Laporkan Blocker</span>
        </AccessLink>
      </div>
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
          <p class="subtitle" data-testid="eod-subtitle">
            Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel.
          </p>
        </div>
      </div>

      <!-- Konteks Waktu EOD Panel (IMP-033 Restrukturisasi & Pembersihan Metrik) -->
      <section class="panel context-panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Konteks Waktu EOD</div>
            <h2>Batas Evaluasi Akhir Hari</h2>
          </div>
          <span class="badge badge-info" data-testid="context-date-badge">{{ formattedWorkDate || 'Hari Kerja Aktif' }}</span>
        </div>
        <div class="panel-body">
          <div class="context-grid">
            <div class="context-item" data-testid="context-item-ontime">
              <span class="context-label">Batas On-Time</span>
              <span class="context-value mono wp-datetime">{{ eodOnTimeCutoff }} WIB</span>
            </div>
            <div class="context-item" data-testid="context-item-cutoff">
              <span class="context-label">Batas Cut-Off</span>
              <span class="context-value mono wp-datetime">{{ eodLockCutoff }} WIB</span>
            </div>
            <div class="context-item" data-testid="context-item-time-status">
              <span class="context-label">Status Waktu</span>
              <div class="context-value">
                <span v-if="activeLeave" class="badge badge-active">CUTI RESMI (APPROVED LEAVE)</span>
                <span v-else-if="hasSubmittedEod" class="badge badge-active">SUBMITTED (Terkunci)</span>
                <span v-else-if="isEodLocked" class="badge badge-danger">LOCKED (Pasca {{ eodLockCutoff }} WIB)</span>
                <span v-else-if="isLate" class="badge badge-late">Di Luar Jam Normal (Lembur Fleksibel)</span>
                <span v-else class="badge badge-ontime">ON-TIME</span>
              </div>
            </div>
            <div class="context-item" data-testid="context-item-eval-count">
              <span class="context-label">Total Item Evaluasi</span>
              <span v-if="activeLeave" class="badge badge-neutral">CUTI (DIKECUALIKAN)</span>
              <span v-else class="context-value mono">{{ commitments.length + additionalWorks.length }} Tugas</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Alert Banner jika sedang dalam masa cuti resmi disetujui (DEC-008) -->
      <div v-if="activeLeave" class="alert-banner leave" role="status" data-testid="leave-active-banner">
        <CalendarCheck :size="20" class="text-green" />
        <div class="submitted-banner-content">
          <div class="submitted-banner-title">
            <strong>Masa Cuti Resmi Disetujui ({{ formatLeaveType(activeLeave.leaveType) }}):</strong>
            <span class="wp-datetime"> {{ formatLeaveDateRange(activeLeave.startDate, activeLeave.endDate) }}</span>
          </div>
          <p class="submitted-banner-desc">
            Anda sedang dalam masa cuti yang telah disetujui. Sesuai kebijakan perusahaan, Anda dibebaskan dari seluruh kewajiban pengisian komitmen pagi, tugas tambahan, dan evaluasi hasil sore hari ini.
          </p>
          <div v-if="activeLeave.reason" class="leave-banner-reason">
            Keterangan: {{ activeLeave.reason.replace(/\s*\(uji rekonsiliasi Superseded by Approved Leave\)/gi, '').trim() }}
          </div>
          <div class="submitted-banner-actions">
            <AccessLink to="/leave/my" class="btn btn-secondary btn-sm">
              Lihat Riwayat Cuti Saya
            </AccessLink>
          </div>
        </div>
      </div>

      <!-- Alert Banner jika EOD sudah disubmit (EOD Closed / Locked) -->
      <div v-else-if="hasSubmittedEod" class="alert-banner submitted" role="status">
        <CheckCircle2 :size="20" class="text-green" />
        <div class="submitted-banner-content">
          <div class="submitted-banner-title">
            <strong>Evaluasi EOD Telah Terkunci (EOD Closed):</strong>
            <span> Disubmit pada <span class="wp-datetime">{{ formatTime(eodSubmittedAt) }}</span>.</span>
          </div>
          <p class="submitted-banner-desc">
            Evaluasi capaian akhir hari telah dicatat secara resmi. Form evaluasi ini dikunci untuk menjaga integritas data akuntabilitas. Perubahan data EOD hanya dapat diajukan melalui mekanisme koreksi resmi.
          </p>
          <div class="submitted-banner-actions">
            <AccessLink to="/corrections/eod" class="btn btn-secondary btn-sm">
              Ajukan Koreksi EOD
            </AccessLink>
          </div>
        </div>
      </div>

      <!-- Alert jika terkunci -->
      <div v-else-if="isEodLocked" class="alert-banner locked" role="alert">
        <Lock :size="20" />
        <div class="submitted-banner-content">
          <div class="submitted-banner-title">
            <strong>Hari Kerja Telah Berakhir & Terkunci Permanen:</strong>
            <span>Batas cut-off lembur ({{ eodLockCutoff }} WIB) telah terlewati.</span>
          </div>
          <p class="submitted-banner-desc">
            Evaluasi tidak dapat lagi disubmit secara reguler. Silakan hubungi atasan atau ajukan permohonan koreksi jika diperlukan.
          </p>
          <div class="submitted-banner-actions">
            <AccessLink to="/corrections/eod" class="btn btn-secondary btn-sm">
              Ajukan Koreksi EOD
            </AccessLink>
          </div>
        </div>
      </div>

      <!-- Leave Notice Box saat cuti resmi aktif (DEC-008) -->
      <div v-if="activeLeave" class="leave-notice-box" data-testid="leave-notice-box">
        <div class="leave-notice-content">
          <CalendarCheck :size="32" class="text-green" />
          <div class="leave-notice-text">
            <h3>Hari Bebas Evaluasi Akhir Hari (Cuti Disetujui)</h3>
            <p>
              Sistem mencatat kehadiran Anda sebagai <strong>Cuti Resmi Disetujui (Bebas Kewajiban Check-In)</strong>. Anda tidak perlu mengisi evaluasi hasil sore maupun refleksi harian hari ini.
            </p>
            <div class="leave-notice-meta">
              <span>Jenis Cuti: <strong>{{ formatLeaveType(activeLeave.leaveType) }}</strong></span>
              <span>Periode: <strong>{{ formatLeaveDateRange(activeLeave.startDate, activeLeave.endDate) }}</strong></span>
              <span v-if="activeLeave.reason">Alasan: <em>"{{ activeLeave.reason.replace(/\s*\(uji rekonsiliasi Superseded by Approved Leave\)/gi, '').trim() }}"</em></span>
            </div>
          </div>
        </div>
        <div class="leave-notice-actions">
          <AccessLink to="/leave/my" class="btn btn-secondary">
            Lihat Permohonan Cuti Saya
          </AccessLink>
        </div>
      </div>

      <!-- Peringatan Pra Cut-Off Pagi jika belum mengisi Morning Commitment (Opsi A) -->
      <div
        v-else-if="isBlockedBeforeMorningCutoff"
        class="alert-box"
        role="alert"
        data-testid="eod-morning-required-alert"
      >
        <AlertCircle :size="20" />
        <div>
          <strong>Belum Mengisi Morning Commitment:</strong>
          Silakan kirimkan komitmen pagi terlebih dahulu sebelum mengisi evaluasi akhir hari.
          <AccessLink to="/daily/morning" class="alert-link">Buka Morning Commitment &rarr;</AccessLink>
        </div>
      </div>

      <template v-else>
      <!-- Informasi jika pagi terlewat pasca Cut-Off (Opsi A) -->
      <div
        v-if="!isFormLocked && isMorningMissedPostCutoff"
        class="alert-banner info"
        role="status"
        data-testid="eod-morning-missed-banner"
      >
        <Info :size="20" class="alert-icon-info" />
        <div class="submitted-banner-content">
          <div class="submitted-banner-title">
            <strong>Komitmen Pagi Hari Ini Terlewat:</strong>
            <span>Catatan pagi tetap tercatat tidak mengisi komitmen, namun Anda tetap dapat menyelesaikan Evaluasi Sore untuk pekerjaan tambahan dan refleksi harian.</span>
          </div>
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
            {{
              isMorningMissedPostCutoff
                ? 'Komitmen pagi hari ini terlewat dari batas waktu pengisian.'
                : 'Tidak ada komitmen terencana yang tercatat untuk pagi hari ini (0 Komitmen).'
            }}
          </div>
          <div v-else-if="!isFormLocked" class="eval-list">
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
                    <input type="radio" :name="`outcome-${c.id}`" value="COMPLETED" v-model="c.outcome" :disabled="isFormLocked" />
                    <span>Selesai</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: c.outcome === 'PARTIALLY_COMPLETED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="PARTIALLY_COMPLETED" v-model="c.outcome" :disabled="isFormLocked" />
                    <span>Sebagian</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: c.outcome === 'NOT_COMPLETED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="NOT_COMPLETED" v-model="c.outcome" :disabled="isFormLocked" />
                    <span>Belum Selesai</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: c.outcome === 'CANCELLED' }">
                    <input type="radio" :name="`outcome-${c.id}`" value="CANCELLED" v-model="c.outcome" :disabled="isFormLocked" />
                    <span>Dibatalkan</span>
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
                  :disabled="isFormLocked"
                  required
                ></textarea>
              </div>

              <!-- If NOT COMPLETED or PARTIALLY: Continuation Decision (DEC-013) -->
              <div v-if="c.outcome === 'PARTIALLY_COMPLETED' || c.outcome === 'NOT_COMPLETED'" class="conditional-box">
                <label class="form-label">Keputusan Kelanjutan Tugas Besok *</label>
                <div class="continuation-options">
                  <label class="cont-label" :class="{ selected: c.continuation === 'CONTINUE' }">
                    <input type="radio" :name="`cont-${c.id}`" value="CONTINUE" v-model="c.continuation" :disabled="isFormLocked" />
                    <span>Lanjutkan Besok (Tugas Berlanjut)</span>
                  </label>
                  <label class="cont-label" :class="{ selected: c.continuation === 'DO_NOT_CONTINUE' }">
                    <input type="radio" :name="`cont-${c.id}`" value="DO_NOT_CONTINUE" v-model="c.continuation" :disabled="isFormLocked" />
                    <span>Tidak Dilanjutkan</span>
                  </label>
                </div>

                <div v-if="c.continuation === 'CONTINUE'" class="mt-2 continuation-reason-group">
                  <label class="form-label">Catatan Kelanjutan *</label>
                  <textarea
                    v-model="c.continuationReason"
                    class="input-control"
                    rows="2"
                    placeholder="Jelaskan progres sisa dan rencana penuntasan besok..."
                    :disabled="isFormLocked"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="summary-list">
            <div
              v-for="c in commitments"
              :key="`summary-c-${c.id}`"
              class="eod-summary-card"
              :class="getSummaryBorderClass(c.outcome)"
            >
              <div class="summary-card-top">
                <div class="eval-title-group">
                  <span class="eval-idx">Komitmen #{{ c.sequenceNo }}</span>
                  <span v-if="c.carryOverDaysCount > 0" class="badge badge-neutral">
                    Carry-Over #{{ c.carryOverDaysCount }}
                  </span>
                </div>
                <div class="badges-row">
                  <span class="badge badge-neutral">Pagi: {{ c.initialRisk }}</span>
                  <span class="badge" :class="getOutcomeBadgeClass(c.outcome)">
                    {{ formatOutcomeLabel(c.outcome) }}
                  </span>
                </div>
              </div>
              <p class="summary-task-text">{{ c.taskText }}</p>
              <div
                v-if="c.outcome === 'PARTIALLY_COMPLETED' || c.outcome === 'NOT_COMPLETED' || c.outcome === 'CANCELLED'"
                class="summary-meta-grid"
              >
                <template v-if="c.outcome === 'PARTIALLY_COMPLETED' || c.outcome === 'NOT_COMPLETED'">
                  <div class="summary-meta-row">
                    <span class="summary-meta-label">Tindak Lanjut:</span>
                    <span class="summary-meta-val">{{ formatContinuationLabel(c.continuation) }}</span>
                  </div>
                  <div v-if="c.continuation === 'CONTINUE' && c.continuationReason" class="summary-meta-row">
                    <span class="summary-meta-label">Catatan / Alasan:</span>
                    <span class="summary-meta-val">{{ c.continuationReason }}</span>
                  </div>
                </template>
                <div v-else-if="c.outcome === 'CANCELLED'" class="summary-meta-row">
                  <span class="summary-meta-label">Alasan Pembatalan:</span>
                  <span class="summary-meta-val">{{ c.outcomeReason || '-' }}</span>
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
          <div v-if="!isFormLocked" class="eval-list">
            <div v-for="w in additionalWorks" :key="w.id" class="eval-card">
              <div class="eval-header">
                <span class="eval-task">{{ w.taskText }}</span>
                <span class="badge badge-info">{{ formatReason(w.reason) }}</span>
              </div>

              <div class="form-group">
                <label class="form-label">Hasil Pencapaian *</label>
                <div class="outcome-options">
                  <label class="outcome-label" :class="{ selected: w.outcome === 'COMPLETED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="COMPLETED" v-model="w.outcome" :disabled="isFormLocked" />
                    <span>Selesai</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: w.outcome === 'PARTIALLY_COMPLETED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="PARTIALLY_COMPLETED" v-model="w.outcome" :disabled="isFormLocked" />
                    <span>Sebagian</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: w.outcome === 'NOT_COMPLETED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="NOT_COMPLETED" v-model="w.outcome" :disabled="isFormLocked" />
                    <span>Belum Selesai</span>
                  </label>
                  <label class="outcome-label" :class="{ selected: w.outcome === 'CANCELLED' }">
                    <input type="radio" :name="`w-outcome-${w.id}`" value="CANCELLED" v-model="w.outcome" :disabled="isFormLocked" />
                    <span>Dibatalkan</span>
                  </label>
                </div>
              </div>

              <!-- If CANCELLED: Reason -->
              <div v-if="w.outcome === 'CANCELLED'" class="conditional-box">
                <label class="form-label">Alasan Pembatalan Pekerjaan Tambahan *</label>
                <textarea
                  v-model="w.outcomeReason"
                  class="input-control"
                  rows="2"
                  placeholder="Jelaskan alasan mengapa pekerjaan tambahan ini dibatalkan hari ini..."
                  :disabled="isFormLocked"
                  required
                ></textarea>
              </div>

              <!-- If NOT COMPLETED or PARTIALLY: Continuation Decision -->
              <div v-if="w.outcome === 'PARTIALLY_COMPLETED' || w.outcome === 'NOT_COMPLETED'" class="conditional-box">
                <label class="form-label">Keputusan Kelanjutan Tugas Besok *</label>
                <div class="continuation-options">
                  <label class="cont-label" :class="{ selected: w.continuation === 'CONTINUE' }">
                    <input type="radio" :name="`w-cont-${w.id}`" value="CONTINUE" v-model="w.continuation" :disabled="isFormLocked" />
                    <span>Lanjutkan Besok (Tugas Berlanjut)</span>
                  </label>
                  <label class="cont-label" :class="{ selected: w.continuation === 'DO_NOT_CONTINUE' }">
                    <input type="radio" :name="`w-cont-${w.id}`" value="DO_NOT_CONTINUE" v-model="w.continuation" :disabled="isFormLocked" />
                    <span>Tidak Dilanjutkan</span>
                  </label>
                </div>

                <div v-if="w.continuation === 'CONTINUE'" class="mt-2 continuation-reason-group">
                  <label class="form-label">Catatan Kelanjutan *</label>
                  <textarea
                    v-model="w.continuationReason"
                    class="input-control"
                    rows="2"
                    placeholder="Jelaskan progres sisa dan rencana penuntasan besok..."
                    :disabled="isFormLocked"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="summary-list">
            <div
              v-for="(w, idx) in additionalWorks"
              :key="`summary-w-${w.id}`"
              class="eod-summary-card"
              :class="getSummaryBorderClass(w.outcome)"
            >
              <div class="summary-card-top">
                <div class="eval-title-group">
                  <span class="eval-idx">Tambahan #{{ idx + 1 }}</span>
                  <span class="badge badge-info">{{ formatReason(w.reason) }}</span>
                </div>
                <span class="badge" :class="getOutcomeBadgeClass(w.outcome)">
                  {{ formatOutcomeLabel(w.outcome) }}
                </span>
              </div>
              <p class="summary-task-text">{{ w.taskText }}</p>
              <div
                v-if="w.outcome === 'PARTIALLY_COMPLETED' || w.outcome === 'NOT_COMPLETED' || w.outcome === 'CANCELLED'"
                class="summary-meta-grid"
              >
                <template v-if="w.outcome === 'PARTIALLY_COMPLETED' || w.outcome === 'NOT_COMPLETED'">
                  <div class="summary-meta-row">
                    <span class="summary-meta-label">Tindak Lanjut:</span>
                    <span class="summary-meta-val">{{ formatContinuationLabel(w.continuation) }}</span>
                  </div>
                  <div v-if="w.continuation === 'CONTINUE' && w.continuationReason" class="summary-meta-row">
                    <span class="summary-meta-label">Catatan / Alasan:</span>
                    <span class="summary-meta-val">{{ w.continuationReason }}</span>
                  </div>
                </template>
                <div v-else-if="w.outcome === 'CANCELLED'" class="summary-meta-row">
                  <span class="summary-meta-label">Alasan Pembatalan:</span>
                  <span class="summary-meta-val">{{ w.outcomeReason || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final Daily Self-Reflection Status (Hak Opsi GREEN Bebas & Humanis) -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Refleksi Mandiri Akhir Hari</div>
            <h2>Status Refleksi Akhir Hari Ini (Final Daily Status)</h2>
          </div>
          <span class="badge badge-active">Penilaian Otonom Karyawan</span>
        </div>
        <div class="panel-body">
          <template v-if="!isFormLocked">
            <p class="reflection-desc">
              Bagaimana penilaian mandiri Anda terhadap pencapaian kerja secara keseluruhan hari ini? Anda memiliki hak penuh untuk menentukan status refleksi hari ini secara jujur dan transparan demi pembelajaran bersama tim.
            </p>

            <!-- Saran Status Sistem (FR-13, informasi non-pengunci) -->
            <div
              v-if="statusSuggestion"
              class="suggestion-box"
              :class="`suggestion-${statusSuggestion.status.toLowerCase()}`"
              data-testid="status-suggestion-box"
            >
              <div class="suggestion-header">
                <Info :size="16" />
                <span>Saran Status Sistem:</span>
                <span
                  class="badge"
                  :class="
                    statusSuggestion.status === 'GREEN'
                      ? 'badge-active'
                      : statusSuggestion.status === 'AMBER'
                        ? 'badge-warning'
                        : 'badge-danger'
                  "
                >
                  {{ statusSuggestion.status }}
                </span>
              </div>
              <p class="suggestion-reason">
                {{ statusSuggestion.reason }}
                <span class="suggestion-note">Anda tetap bebas menentukan status refleksi akhir sesuai kondisi aktual.</span>
              </p>
            </div>

            <div class="status-selection-grid">
              <label class="status-select-card green" :class="{ selected: finalDailyStatus === 'GREEN' }">
                <input type="radio" value="GREEN" v-model="finalDailyStatus" :disabled="isFormLocked" />
                <div class="status-card-header">
                  <CheckCircle2 :size="20" class="text-green" />
                  <span class="status-name">GREEN</span>
                </div>
                <p class="status-summary">
                  Target hari ini tercapai memuaskan atau terkendali mandiri.
                </p>
              </label>

              <label class="status-select-card amber" :class="{ selected: finalDailyStatus === 'AMBER' }">
                <input type="radio" value="AMBER" v-model="finalDailyStatus" :disabled="isFormLocked" />
                <div class="status-card-header">
                  <AlertCircle :size="20" class="text-amber" />
                  <span class="status-name">AMBER</span>
                </div>
                <p class="status-summary">
                  Terdapat kendala dependensi atau carry-over berulang yang perlu atensi tim.
                </p>
              </label>

              <label class="status-select-card red" :class="{ selected: finalDailyStatus === 'RED' }">
                <input type="radio" value="RED" v-model="finalDailyStatus" :disabled="isFormLocked" />
                <div class="status-card-header">
                  <AlertTriangle :size="20" class="text-red" />
                  <span class="status-name">RED</span>
                </div>
                <p class="status-summary">
                  Kendala kritis tidak terselesaikan dan membutuhkan intervensi langsung atasan.
                </p>
              </label>
            </div>

            <!-- Penjelasan Risiko / Kendala Hari Ini (Wajib jika AMBER atau RED, FR-10) -->
            <div
              v-if="requiresRiskExplanation"
              class="field-group risk-explanation-group"
              style="margin-top: 20px;"
              data-testid="daily-risk-explanation-group"
            >
              <label class="form-label" for="daily-risk-explanation">
                <span>Penjelasan Risiko / Kendala Hari Ini *</span>
                <span class="field-sub-inline" style="font-weight: normal; font-size: 12px; color: var(--color-text-secondary); margin-left: 6px;">
                  (Wajib minimal 10 karakter saat memilih AMBER / RED)
                </span>
              </label>
              <textarea
                id="daily-risk-explanation"
                v-model="dailyRiskExplanation"
                class="input-control"
                rows="3"
                placeholder="Jelaskan faktor kendala, hambatan, atau risiko utama yang memengaruhi hasil kerja hari ini secara keseluruhan..."
                :disabled="isFormLocked"
                required
              ></textarea>
              <span class="field-sub" style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; display: block;">
                Karakter terisi: {{ dailyRiskExplanation.trim().length }} / minimal 10 karakter. Catatan ini menjelaskan kondisi risiko tingkat harian dan terpisah dari catatan pagi per tugas.
              </span>
            </div>

            <!-- Field Tomorrow Priority (Opsional) -->
            <div class="field-group" style="margin-top: 20px;">
              <label class="form-label" for="tomorrow-priority-input">
                <span>Prioritas Esok Hari (Tomorrow Priority)</span>
                <span class="field-sub-inline" style="font-weight: normal; font-size: 12px; color: var(--color-text-secondary); margin-left: 6px;">(Opsional)</span>
              </label>
              <textarea
                id="tomorrow-priority-input"
                v-model="tomorrowPriority"
                class="input-control"
                rows="2"
                placeholder="Tuliskan catatan fokus atau prioritas yang perlu langsung ditangani pada awal hari kerja berikutnya..."
                :disabled="isFormLocked"
              ></textarea>
              <span class="field-sub" style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; display: block;">
                Catatan ini akan otomatis muncul sebagai banner pengingat konteks di bagian atas formulir Morning Commitment esok hari. Bersifat murni referensi dan tidak menjadi komitmen otomatis.
              </span>
            </div>
          </template>

          <template v-else>
            <div
              class="final-status-summary-card"
              :class="getFinalStatusInfo(hasSubmittedEod ? finalDailyStatus : null).cardClass"
            >
              <div class="final-status-summary-header">
                <span class="final-status-summary-title">
                  {{ getFinalStatusInfo(hasSubmittedEod ? finalDailyStatus : null).label }}
                </span>
                <span
                  class="badge"
                  :class="getFinalStatusInfo(hasSubmittedEod ? finalDailyStatus : null).badgeClass"
                >
                  {{ hasSubmittedEod ? finalDailyStatus : 'TERKUNCI' }}
                </span>
              </div>
              <p class="final-status-summary-desc">
                {{ getFinalStatusInfo(hasSubmittedEod ? finalDailyStatus : null).desc }}
              </p>
            </div>

            <div
              v-if="hasSubmittedEod && (finalDailyStatus === 'AMBER' || finalDailyStatus === 'RED' || dailyRiskExplanation.trim())"
              class="tomorrow-priority-readonly"
              data-testid="daily-risk-readonly"
            >
              <div class="tomorrow-priority-label">Penjelasan Risiko / Kendala Hari Ini</div>
              <p class="tomorrow-priority-value" :class="{ muted: !dailyRiskExplanation.trim() }">
                {{ dailyRiskExplanation.trim() || 'Tidak ada catatan penjelasan risiko yang tersimpan.' }}
              </p>
            </div>

            <div class="tomorrow-priority-readonly">
              <div class="tomorrow-priority-label">Prioritas Esok Hari (Tomorrow Priority)</div>
              <p class="tomorrow-priority-value" :class="{ muted: !tomorrowPriority.trim() }">
                {{ tomorrowPriority.trim() || 'Tidak ada catatan prioritas esok hari yang ditambahkan.' }}
              </p>
            </div>
          </template>
        </div>
      </section>

      <!-- Konfirmasi Inline Ketidaksesuaian Saran Status (FR-14, tetap menjamin hak pilih GREEN DEC-003) -->
      <div
        v-if="!isFormLocked && showMismatchConfirm && statusSuggestion"
        class="mismatch-confirm-box"
        role="alertdialog"
        aria-labelledby="mismatch-confirm-title"
        data-testid="status-mismatch-confirm"
      >
        <div class="mismatch-confirm-content">
          <AlertTriangle :size="20" class="text-amber" />
          <div>
            <h3 id="mismatch-confirm-title">Konfirmasi Pilihan Status Akhir Hari</h3>
            <p>
              Sistem menyarankan status <strong>{{ statusSuggestion.status }}</strong> ({{ statusSuggestion.reason.replace(/\.$/, '') }}), sedangkan Anda memilih <strong>{{ finalDailyStatus }}</strong>. Anda tetap dapat mengirim dengan status <strong>{{ finalDailyStatus }}</strong> jika sudah yakin, atau sesuaikan ke saran sistem.
            </p>
          </div>
        </div>
        <div class="mismatch-actions">
          <button
            type="button"
            class="btn btn-secondary"
            data-testid="btn-apply-suggested-status"
            @click="finalDailyStatus = statusSuggestion.status; showMismatchConfirm = false"
          >
            Ubah ke Saran ({{ statusSuggestion.status }})
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="submitting"
            data-testid="btn-confirm-keep-status"
            @click="submitEod(true)"
          >
            Tetap Kirim sebagai {{ finalDailyStatus }}
          </button>
        </div>
      </div>

      <!-- Action Footer -->
      <div v-if="!isFormLocked" class="action-footer">
        <div class="footer-info">
          Pastikan hasil evaluasi telah diverifikasi sebelum jam penguncian {{ eodLockCutoff }} WIB.
        </div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="submitting"
          @click="submitEod(false)"
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
      </template>
    </main>
  </div>
</template>

<style scoped>
.daily-layout {
  min-height: 100vh;
  max-width: 100%;
  overflow-x: hidden;
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
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.step-items {
  display: flex;
  gap: 32px;
}

.workflow-actions {
  display: flex;
  align-items: center;
}

.btn-report-blocker {
  height: 34px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.btn-report-blocker:hover {
  background: var(--color-surface-subtle);
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
  text-decoration: none;
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

.alert-banner.submitted {
  background: var(--color-status-green-bg);
  border: 1px solid var(--color-status-green-border);
  color: var(--color-status-green-fg);
}

.submitted-banner-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.submitted-banner-title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.submitted-banner-desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.submitted-banner-actions {
  margin-top: 4px;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  width: fit-content;
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

.continuation-reason-group {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
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
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-control {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  padding: 9px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  color: var(--color-text-primary);
}

textarea.input-control {
  resize: vertical;
  min-height: 64px;
  line-height: 1.5;
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
  gap: 16px;
}

.post-submit-panel .btn {
  white-space: nowrap;
  flex-shrink: 0;
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

/* Read-Only Summary Cards (IMP-045) */
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eod-summary-card {
  border: 1px solid var(--color-border);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card-green {
  border-left-color: var(--color-status-green-fg);
}

.summary-card-amber {
  border-left-color: var(--color-status-amber-fg);
}

.summary-card-red {
  border-left-color: var(--color-status-red-fg);
}

.summary-card-neutral {
  border-left-color: var(--color-border-strong, var(--color-border));
}

.summary-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-task-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.45;
}

.summary-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border);
  font-size: 13px;
}

.summary-meta-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
}

.summary-meta-label {
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 125px;
}

.summary-meta-val {
  color: var(--color-text-primary);
}

.final-status-summary-card {
  border: 1px solid var(--color-border);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  padding: 16px;
  background: var(--color-surface-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.final-status-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.final-status-summary-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.final-status-summary-desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.tomorrow-priority-readonly {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tomorrow-priority-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tomorrow-priority-value {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.5;
  white-space: pre-wrap;
}

.tomorrow-priority-value.muted {
  color: var(--color-text-secondary);
  font-style: italic;
}

.alert-banner.leave {
  background: var(--color-status-green-bg, #E6F4EE);
  border: 1px solid var(--color-status-green-border, #A7F3D0);
  color: var(--color-status-green-fg, #065F46);
}

.leave-banner-reason {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  margin-top: 4px;
}

.leave-notice-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.leave-notice-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.leave-notice-text h3 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.leave-notice-text p {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.leave-notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface-subtle);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
}

.leave-notice-actions {
  display: flex;
  gap: 10px;
}

.alert-box {
  background: var(--color-status-amber-bg);
  border: 1px solid var(--color-status-amber-border);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  display: flex;
  gap: 14px;
  align-items: center;
  color: var(--color-status-amber-fg);
  font-size: 13px;
}

.alert-link {
  margin-left: 8px;
  font-weight: 700;
  color: inherit;
  text-decoration: underline;
}

.alert-banner.info {
  background: var(--color-timing-ontime-bg);
  border: 1px solid var(--color-timing-ontime-border);
  color: var(--color-timing-ontime-fg);
}

.alert-icon-info {
  flex-shrink: 0;
  margin-top: 2px;
}

.suggestion-box {
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-subtle);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-box.suggestion-red {
  background: var(--color-status-red-bg);
  border-color: var(--color-status-red-border);
  color: var(--color-status-red-fg);
}

.suggestion-box.suggestion-amber {
  background: var(--color-status-amber-bg);
  border-color: var(--color-status-amber-border);
  color: var(--color-status-amber-fg);
}

.suggestion-box.suggestion-green {
  background: var(--color-status-green-bg);
  border-color: var(--color-status-green-border);
  color: var(--color-status-green-fg);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

.suggestion-reason {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--color-text-primary);
}

.suggestion-note {
  margin-left: 6px;
  color: var(--color-text-secondary);
}

.risk-explanation-group {
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
}

.mismatch-confirm-box {
  background: var(--color-status-amber-bg);
  border: 1px solid var(--color-status-amber-border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mismatch-confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.mismatch-confirm-content h3 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-status-amber-fg);
}

.mismatch-confirm-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.mismatch-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .workflow-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px 16px;
  }

  .step-items {
    gap: 10px 16px;
    flex-wrap: wrap;
  }

  .step-item {
    padding: 6px 0;
    font-size: 12.5px;
  }

  .workflow-actions {
    justify-content: flex-start;
  }

  .main-content {
    padding: 20px 16px 48px;
  }

  .panel {
    min-width: 0;
    max-width: 100%;
  }

  .panel-head {
    flex-wrap: wrap;
    gap: 8px;
    padding: 14px 16px;
  }

  .panel-body {
    padding: 16px;
  }

  .context-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .context-item {
    min-width: 0;
  }

  .eval-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .outcome-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .continuation-options {
    flex-wrap: wrap;
  }

  .status-selection-grid {
    grid-template-columns: 1fr;
  }

  .action-footer,
  .post-submit-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .post-submit-panel .btn {
    white-space: normal;
    justify-content: center;
    text-align: center;
  }

  .mismatch-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .toast-popup {
    left: 16px;
    right: 16px;
    top: 16px;
  }
}
</style>
