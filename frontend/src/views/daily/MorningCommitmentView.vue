<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { useAuthStore } from '../../stores/auth';
import { getPromptHintForFunction, resolveUserFunction } from '../../config/prompts';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Clock,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  Check,
  Bookmark,
} from 'lucide-vue-next';

interface CommitmentSlot {
  taskText: string;
  referenceLink: string;
  projectCode: string;
  linkedBlockerId: string;
  initialRisk: 'GREEN' | 'AMBER' | 'RED';
  knownBlockerNote: string;
  supportNeeded: string;
  originCommitmentId?: string;
  carryOverDaysCount: number;
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
  projectCodeReference: string | null;
  status: string;
}

interface CarryOverDraft {
  originCommitmentId: string;
  taskText: string;
  referenceLink: string | null;
  projectCode?: string | null;
  linkedBlockerId?: string | null;
  carryOverDaysCount: number;
  suggestedRisk: 'GREEN' | 'AMBER' | 'RED';
  isAmberWarningAdvised: boolean;
  continuationReason?: string | null;
}

interface ActiveLeave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
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
const morningSubmittedAt = ref<string | null>(null);
const activeLeave = ref<ActiveLeave | null>(null);

const isZeroCommitment = ref(false);
const zeroCommitmentReason = ref('');

const isCopyForwardOpen = ref(false);
const availableCarryOvers = ref<CarryOverDraft[]>([]);
const availableProjects = ref<ProjectOption[]>([
  { projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing' },
  { projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync' },
  { projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android' },
]);
const activeBlockers = ref<ActiveBlockerOption[]>([]);
const openBlockerPickerIndex = ref<number | null>(null);

const commitmentSlots = ref<CommitmentSlot[]>([
  {
    taskText: '',
    referenceLink: '',
    projectCode: '',
    linkedBlockerId: '',
    initialRisk: 'GREEN',
    knownBlockerNote: '',
    supportNeeded: '',
    carryOverDaysCount: 0,
  },
]);

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isSubmittedSuccess = ref(false);

const hasSubmittedMorning = computed(() => {
  return morningSubmittedAt.value !== null && morningSubmittedAt.value !== '';
});
const isFormLocked = computed(() => isMorningLocked.value || hasSubmittedMorning.value || Boolean(activeLeave.value));

function formatLeaveType(type?: string): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Cuti Sakit';
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
  if (!startStr || !endStr) return '';
  const s = new Date(startStr);
  const e = new Date(endStr);
  return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} s/d ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function formatTime(isoStr: string | null) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getProjectName(code?: string | null): string {
  if (!code) return 'Non-Proyek / Operasional Rutin';
  const prj = availableProjects.value.find((p) => p.projectCode === code);
  return prj ? `[${prj.projectCode}] ${prj.projectName}` : `[${code}]`;
}

function getBlockerCode(id?: string | null): string {
  if (!id) return '';
  const blk = activeBlockers.value.find((b) => b.id === id);
  return blk ? `${blk.code} — ${blk.description}` : `#BLK-${id.slice(0, 6).toUpperCase()}`;
}

// Format hari dan tanggal dinamis bahasa Indonesia untuk header konteks (IMP-027)
const formattedWorkDate = computed(() => {
  if (!workDate.value) return '';
  const parts = workDate.value.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const d = new Date(workDate.value);
  if (isNaN(d.getTime())) return workDate.value;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

// Role-Based Output Prompt & Responsive Placeholder (PRD v1.6 FR-12 / AC-37)
const authStore = useAuthStore();
const isDesktopOrTablet = ref(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

const userFunction = computed(() => resolveUserFunction(authStore.user));
const promptHint = computed(() => getPromptHintForFunction(userFunction.value));

const commitmentPlaceholder = computed(() => {
  if (isDesktopOrTablet.value) {
    return `Deskripsikan deliverable utama yang dapat diverifikasi selesai hari ini. Misalnya: ${promptHint.value}`;
  }
  return 'Deskripsikan deliverable utama yang dapat diverifikasi selesai hari ini...';
});

const tomorrowPriority = ref<string | null>(null);

// Computed initial daily status
const initialDailyStatus = computed(() => {
  if (isZeroCommitment.value) return 'NOT_APPLICABLE_NO_COMMITMENT';
  const hasRed = commitmentSlots.value.some((c) => c.initialRisk === 'RED');
  if (hasRed) return 'RED';
  const hasAmber = commitmentSlots.value.some(
    (c) => c.initialRisk === 'AMBER' || !!c.linkedBlockerId,
  );
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
      availableProjects?: ProjectOption[];
      activeBlockers?: ActiveBlockerOption[];
      activeLeave?: ActiveLeave | null;
    }>('/daily/today');

    const data = res.data;
    activeLeave.value = (data as any).activeLeave || null;
    workDate.value = data.workDate;
    currentTime.value = data.currentTime;
    morningOnTimeCutoff.value = data.cutoffTimings.morningOnTimeCutoff;
    morningLockCutoff.value = data.cutoffTimings.morningLockCutoff;
    isMorningLocked.value = data.cutoffTimings.isMorningLocked;
    isLate.value = data.currentTime > data.cutoffTimings.morningOnTimeCutoff && !data.cutoffTimings.isMorningLocked;
    availableCarryOvers.value = data.availableCarryOvers || [];
    tomorrowPriority.value = (data as any).tomorrowPriority || null;
    if (Array.isArray(data.availableProjects) && data.availableProjects.length > 0) {
      availableProjects.value = data.availableProjects;
    }
    if (Array.isArray(data.activeBlockers)) {
      activeBlockers.value = data.activeBlockers;
    }

    // Jika record sudah ada di DB
    if (data.record) {
      morningSubmittedAt.value = data.record.morningSubmittedAt
        ? new Date(data.record.morningSubmittedAt).toISOString()
        : null;

      if (data.record.initialDailyStatus === 'NOT_APPLICABLE_NO_COMMITMENT') {
        isZeroCommitment.value = true;
        zeroCommitmentReason.value = data.record.zeroCommitmentReason || '';
      } else if (data.record.commitments && data.record.commitments.length > 0) {
        commitmentSlots.value = data.record.commitments.map((c: any) => ({
          taskText: c.taskText,
          referenceLink: c.referenceLink || '',
          projectCode: c.projectCode || '',
          linkedBlockerId: c.linkedBlockerId || '',
          initialRisk: c.initialRisk,
          knownBlockerNote: c.knownBlockerNote || '',
          supportNeeded: c.supportNeeded || '',
          originCommitmentId: c.originCommitmentId || undefined,
          carryOverDaysCount: c.carryOverDaysCount || 0,
        }));
      }
      isSubmittedSuccess.value = !!morningSubmittedAt.value;
    } else {
      morningSubmittedAt.value = null;
      isSubmittedSuccess.value = false;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat status komitmen hari ini.', true);
  } finally {
    loading.value = false;
  }
}

function addSlot() {
  if (commitmentSlots.value.length >= 3) {
    showToast('Maksimal 3 komitmen terencana dalam satu hari.', true);
    return;
  }
  commitmentSlots.value.push({
    taskText: '',
    referenceLink: '',
    projectCode: '',
    linkedBlockerId: '',
    initialRisk: 'GREEN',
    knownBlockerNote: '',
    supportNeeded: '',
    carryOverDaysCount: 0,
  });
}

function removeSlot(index: number) {
  if (commitmentSlots.value.length === 1) {
    commitmentSlots.value[0] = {
      taskText: '',
      referenceLink: '',
      projectCode: '',
      linkedBlockerId: '',
      initialRisk: 'GREEN',
      knownBlockerNote: '',
      supportNeeded: '',
      carryOverDaysCount: 0,
    };
    showToast('Slot komitmen dikosongkan.');
    return;
  }
  commitmentSlots.value.splice(index, 1);
}

function isSlotUntouched(slot: CommitmentSlot): boolean {
  return (
    !slot.taskText.trim() &&
    !slot.referenceLink.trim() &&
    !slot.projectCode &&
    !slot.linkedBlockerId &&
    slot.initialRisk === 'GREEN' &&
    !slot.knownBlockerNote.trim() &&
    !slot.supportNeeded.trim()
  );
}

function isDraftApplied(originCommitmentId: string): boolean {
  return commitmentSlots.value.some(
    (s) => s.originCommitmentId === originCommitmentId && s.taskText.trim().length > 0
  );
}

function applyCarryOver(draft: CarryOverDraft) {
  if (isDraftApplied(draft.originCommitmentId)) {
    showToast('Draf tugas ini sudah disalin ke komitmen hari ini.', true);
    return;
  }

  // Cari slot komitmen pertama yang belum mendapat masukan apapun dari pengguna
  let targetIndex = commitmentSlots.value.findIndex(isSlotUntouched);
  if (targetIndex === -1 && commitmentSlots.value.length < 3) {
    addSlot();
    targetIndex = commitmentSlots.value.length - 1;
  }

  if (targetIndex !== -1) {
    commitmentSlots.value[targetIndex] = {
      taskText: draft.taskText,
      referenceLink: draft.referenceLink || '',
      projectCode: draft.projectCode || '',
      linkedBlockerId: draft.linkedBlockerId || '',
      initialRisk: draft.suggestedRisk,
      knownBlockerNote: '',
      supportNeeded: '',
      originCommitmentId: draft.originCommitmentId,
      carryOverDaysCount: draft.carryOverDaysCount,
    };
    showToast(`Draf tugas carry-over #${draft.carryOverDaysCount} diterapkan ke slot #${targetIndex + 1}.`);
  } else {
    showToast('Semua 3 slot telah terisi atau memiliki masukan. Hapus atau kosongkan salah satu slot terlebih dahulu.', true);
  }
}

function toggleBlockerPicker(slotIndex: number) {
  if (openBlockerPickerIndex.value === slotIndex) {
    openBlockerPickerIndex.value = null;
  } else {
    openBlockerPickerIndex.value = slotIndex;
  }
}

function selectBlockerForSlot(slotIndex: number, blocker: ActiveBlockerOption) {
  const slot = commitmentSlots.value[slotIndex];
  if (blocker && slot) {
    slot.referenceLink = `[${blocker.code}] ${blocker.description}`;
    slot.linkedBlockerId = blocker.id;
    if (slot.initialRisk === 'GREEN') {
      slot.initialRisk = 'AMBER';
    }
    if (blocker.projectCodeReference && !slot.projectCode) {
      slot.projectCode = blocker.projectCodeReference;
    }
    if (!slot.taskText.trim()) {
      slot.taskText = `Menyelesaikan kendala ${blocker.code}: ${blocker.description}`;
    }
  }
  openBlockerPickerIndex.value = null;
}

function truncateOptionText(text: string, maxLen = 65): string {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
}

function handleHinderedByBlockerChange(slotIndex: number) {
  const slot = commitmentSlots.value[slotIndex];
  if (!slot || !slot.linkedBlockerId) return;
  const blocker = activeBlockers.value.find((b) => b.id === slot.linkedBlockerId);
  if (blocker) {
    if (!slot.knownBlockerNote.trim()) {
      slot.knownBlockerNote = `Terkait kendala aktif ${blocker.code}: ${blocker.description}`;
    }
    if (blocker.projectCodeReference && !slot.projectCode) {
      slot.projectCode = blocker.projectCodeReference;
    }
  }
}

async function submitMorningCheckin() {
  errorMessage.value = null;

  if (isZeroCommitment.value) {
    if (zeroCommitmentReason.value.trim().length < 10) {
      errorMessage.value = 'Alasan tidak menetapkan komitmen wajib diisi minimal 10 karakter.';
      return;
    }
  } else {
    if (commitmentSlots.value.length === 0 || commitmentSlots.value.length > 3) {
      errorMessage.value = 'Jumlah komitmen harus 1 hingga 3 tugas.';
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
            projectCode: s.projectCode.trim() ? s.projectCode.trim() : undefined,
            linkedBlockerId: s.linkedBlockerId.trim() ? s.linkedBlockerId.trim() : undefined,
            initialRisk: s.initialRisk,
            knownBlockerNote: s.knownBlockerNote.trim() ? s.knownBlockerNote.trim() : undefined,
            supportNeeded: s.supportNeeded.trim() ? s.supportNeeded.trim() : undefined,
            originCommitmentId: s.originCommitmentId,
          })),
      zeroCommitmentReason: isZeroCommitment.value ? zeroCommitmentReason.value.trim() : undefined,
    };

    const res = await apiClient<{ morningSubmittedAt?: string }>('/daily/morning', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    showToast('Morning Commitment berhasil dikirim dan dicatat.');
    morningSubmittedAt.value = res.data?.morningSubmittedAt
      ? new Date(res.data.morningSubmittedAt).toISOString()
      : new Date().toISOString();
    isSubmittedSuccess.value = true;
    await loadTodayState();
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengirim Morning Commitment.';
    // Jika backend melaporkan sudah disubmit (konflik multi-tab), sinkronkan state agar langsung ke mode terkunci
    if (
      err.code === 'BUSINESS_RULE_ALREADY_SUBMITTED' ||
      err.statusCode === 422 ||
      (err.message && err.message.includes('telah diserahkan dan terkunci'))
    ) {
      await loadTodayState();
    }
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
  if (typeof window !== 'undefined') {
    const updateViewport = () => {
      isDesktopOrTablet.value = window.innerWidth >= 768;
    };
    window.addEventListener('resize', updateViewport);
  }
  loadTodayState();
});
</script>

<template>
  <div class="daily-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Workspace / My Today / Morning Commitment" />

    <!-- Daily Workflow Step Bar -->
    <nav class="workflow-bar" aria-label="Alur Akuntabilitas Harian">
      <div class="step-items">
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
          <h1>Morning Commitment</h1>
          <p class="subtitle">
            Tetapkan 1 hingga 3 komitmen terukur yang akan Anda tuntaskan hari ini. Identifikasi risiko secara transparan agar tim dapat memberikan dukungan tepat waktu.
          </p>
        </div>
      </div>

      <!-- Konteks Hari Ini Panel (IMP-027 Restrukturisasi & Pembersihan Metrik) -->
      <section class="panel context-panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Konteks Hari Ini</div>
            <h2>Jadwal & Batas Pengisian Hari Ini</h2>
          </div>
          <span class="badge badge-info" data-testid="context-date-badge">{{ formattedWorkDate || 'Hari Kerja Aktif' }}</span>
        </div>
        <div class="panel-body">
          <div class="context-grid">
            <div class="context-item" data-testid="context-item-ontime">
              <span class="context-label">Batas On-Time</span>
              <span class="context-value mono">{{ morningOnTimeCutoff }} WIB</span>
            </div>
            <div class="context-item" data-testid="context-item-cutoff">
              <span class="context-label">Batas Cut-Off</span>
              <span class="context-value mono">{{ morningLockCutoff }} WIB</span>
            </div>
            <div class="context-item" data-testid="context-item-time-status">
              <span class="context-label">Status Waktu</span>
              <div class="context-value">
                <span v-if="activeLeave" class="badge badge-active">CUTI RESMI (APPROVED LEAVE)</span>
                <span v-else-if="hasSubmittedMorning" class="badge badge-active">SUBMITTED (Terkunci)</span>
                <span v-else-if="isMorningLocked" class="badge badge-danger">LOCKED (Pasca Cut-Off)</span>
                <span v-else-if="isLate" class="badge badge-late">Terlambat (LATE)</span>
                <span v-else class="badge badge-ontime">ON-TIME</span>
              </div>
            </div>
            <div class="context-item" data-testid="context-item-initial-status">
              <span class="context-label">Status Awal Hari (Initial Daily Status)</span>
              <div class="context-value">
                <span v-if="activeLeave" class="badge badge-neutral">CUTI (DIKECUALIKAN)</span>
                <span v-else-if="initialDailyStatus === 'GREEN'" class="badge badge-active">GREEN — Terkendali</span>
                <span v-else-if="initialDailyStatus === 'AMBER'" class="badge badge-warning">AMBER — Berisiko</span>
                <span v-else-if="initialDailyStatus === 'RED'" class="badge badge-danger">RED — Kritis</span>
                <span v-else class="badge badge-neutral">0 KOMITMEN</span>
              </div>
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
            <span> {{ formatLeaveDateRange(activeLeave.startDate, activeLeave.endDate) }}</span>
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

      <!-- Alert Banner jika komitmen pagi telah disubmit (Baseline Locked) -->
      <div v-else-if="hasSubmittedMorning" class="alert-banner submitted" role="status">
        <CheckCircle2 :size="20" class="text-green" />
        <div class="submitted-banner-content">
          <div class="submitted-banner-title">
            <strong>Morning Commitment Telah Terkunci (Baseline Locked):</strong>
            <span> Disubmit pada {{ formatTime(morningSubmittedAt) }} WIB.</span>
          </div>
          <p class="submitted-banner-desc">
            Komitmen harian telah dicatat secara resmi sebagai baseline kerja hari ini. Form ini dikunci untuk menjaga integritas data akuntabilitas. Perubahan komitmen hanya dapat diajukan melalui mekanisme koreksi resmi.
          </p>
          <div class="submitted-banner-actions">
            <AccessLink to="/corrections/morning" class="btn btn-secondary btn-sm">
              Ajukan Koreksi Komitmen
            </AccessLink>
          </div>
        </div>
      </div>

      <!-- Alert Banner jika terkunci karena cut-off waktu -->
      <div v-else-if="isMorningLocked" class="alert-banner locked" role="alert">
        <Lock :size="20" />
        <div>
          <strong>Batas Cut-Off ({{ morningLockCutoff }} WIB) Telah Berakhir — Formulir Terkunci:</strong>
          Jendela pengisian Morning Commitment hari ini telah ditutup sesuai Kebijakan Sistem. Anda tetap dapat mencatat pekerjaan dadakan di halaman <em>Additional Work</em> dan menyelesaikan <em>EOD Outcome</em> sore hari.
        </div>
      </div>

      <!-- Alert Banner jika Late (IMP-028) -->
      <div v-else-if="isLate" class="alert-banner late" role="status" data-testid="late-alert-banner">
        <Clock :size="20" />
        <div>
          <strong>Pengisian Melewati Batas Waktu:</strong>
          Batas waktu On-Time ({{ morningOnTimeCutoff }} WIB) telah berakhir, namun Anda masih dapat mengirimkan komitmen sebelum sistem terkunci pada pukul {{ morningLockCutoff }} WIB. Komitmen Anda hari ini akan dicatat dengan status <strong>Terlambat (LATE)</strong>.
        </div>
      </div>

      <!-- Leave Notice Box saat cuti resmi aktif (DEC-008) -->
      <div v-if="activeLeave" class="leave-notice-box" data-testid="leave-notice-box">
        <div class="leave-notice-content">
          <CalendarCheck :size="32" class="text-green" />
          <div class="leave-notice-text">
            <h3>Hari Bebas Komitmen Kerja (Cuti Disetujui)</h3>
            <p>
              Sistem mencatat kehadiran Anda sebagai <strong>Cuti Resmi Disetujui (Bebas Kewajiban Check-In)</strong>. Anda tidak perlu menetapkan target komitmen harian, mencatat pekerjaan tambahan, maupun melaporkan evaluasi sore hari ini.
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

      <!-- Mode 1: Komitmen Pagi Telah Terkunci (Baseline Locked / Read-Only Summary Mode) -->
      <template v-else-if="hasSubmittedMorning">
        <!-- 1A: Jika 0 Komitmen -->
        <section v-if="isZeroCommitment" class="panel zero-summary-panel" data-testid="zero-commitment-summary">
          <div class="panel-head">
            <div>
              <div class="kicker">Komitmen Harian Resmi</div>
              <h2>Status 0 Komitmen (Bebas Komitmen Kerja Hari Ini)</h2>
            </div>
            <span class="badge badge-neutral">0 KOMITMEN (RESMI)</span>
          </div>
          <div class="panel-body">
            <div class="zero-summary-card">
              <div class="zero-summary-badge-row">
                <span class="badge badge-neutral">Bebas Komitmen (Disetujui)</span>
              </div>
              <div class="zero-summary-label">Alasan Tidak Menetapkan Komitmen:</div>
              <div class="zero-summary-reason">
                "{{ zeroCommitmentReason }}"
              </div>
              <div class="zero-summary-note">
                <CheckCircle2 :size="16" class="text-green" />
                <span>Telah dicatat secara resmi di database dan terbebas dari catatan Pelanggaran Pengisian (No Submission).</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 1B: Daftar Komitmen Resmi -->
        <section v-else class="panel summary-panel" data-testid="morning-summary-panel">
          <div class="panel-head">
            <div>
              <div class="kicker">Komitmen Pagi Resmi (Baseline Terkunci)</div>
              <h2>Daftar Target Komitmen Hari Ini ({{ commitmentSlots.length }} Tugas)</h2>
            </div>
            <div class="summary-head-badge">
              <CheckCircle2 :size="16" class="text-green" />
              <span class="badge badge-active">TERCATAT RESMI</span>
            </div>
          </div>

          <div class="panel-body summary-body">
            <div
              v-for="(slot, idx) in commitmentSlots"
              :key="idx"
              class="summary-card"
              :class="{
                'summary-card-green': slot.initialRisk === 'GREEN',
                'summary-card-amber': slot.initialRisk === 'AMBER',
                'summary-card-red': slot.initialRisk === 'RED',
              }"
              :data-testid="`summary-slot-${idx}`"
            >
              <div class="summary-card-top">
                <div class="summary-slot-badge">
                  <span class="slot-number">Komitmen #{{ idx + 1 }}</span>
                  <span v-if="slot.carryOverDaysCount > 0" class="badge badge-warning">
                    Carry-Over #{{ slot.carryOverDaysCount }}
                  </span>
                </div>
                <div class="summary-risk-pill">
                  <span v-if="slot.initialRisk === 'GREEN'" class="badge badge-active">GREEN — Terkendali</span>
                  <span v-else-if="slot.initialRisk === 'AMBER'" class="badge badge-warning">AMBER — Berisiko</span>
                  <span v-else-if="slot.initialRisk === 'RED'" class="badge badge-danger">RED — Kritis</span>
                </div>
              </div>

              <div class="summary-task-text">
                {{ slot.taskText }}
              </div>

              <div class="summary-meta-grid">
                <div class="meta-field">
                  <span class="meta-label">Proyek:</span>
                  <span class="meta-pill project-pill">
                    {{ getProjectName(slot.projectCode) }}
                  </span>
                </div>

                <div class="meta-field">
                  <span class="meta-label">Tautan / PR / Tiket:</span>
                  <a
                    v-if="slot.referenceLink && slot.referenceLink.startsWith('http')"
                    :href="slot.referenceLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="meta-link"
                    title="Buka tautan dokumen / PR"
                  >
                    <ExternalLink :size="11" />
                    <span class="truncate-link">{{ slot.referenceLink }}</span>
                  </a>
                  <span v-else-if="slot.referenceLink" class="meta-val text-link-inline">
                    <LinkIcon :size="11" />
                    <span>{{ slot.referenceLink }}</span>
                  </span>
                  <span v-else class="meta-val text-muted">-</span>
                </div>

                <div class="meta-field">
                  <span class="meta-label">Blocker Aktif:</span>
                  <span v-if="slot.linkedBlockerId" class="meta-pill blocker-pill">
                    <AlertTriangle :size="11" />
                    <span>{{ getBlockerCode(slot.linkedBlockerId) }}</span>
                  </span>
                  <span v-else class="meta-val text-muted">-</span>
                </div>
              </div>

              <!-- Callout jika AMBER / RED -->
              <div
                v-if="slot.initialRisk !== 'GREEN' && (slot.knownBlockerNote || slot.supportNeeded)"
                class="summary-callout"
              >
                <div v-if="slot.knownBlockerNote" class="callout-entry">
                  <span class="callout-tag">Potensi Hambatan:</span>
                  <span class="callout-desc">{{ slot.knownBlockerNote }}</span>
                </div>
                <div v-if="slot.supportNeeded" class="callout-entry">
                  <span class="callout-tag">Bantuan Dibutuhkan:</span>
                  <span class="callout-desc">{{ slot.supportNeeded }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Mode 2: Formulir Pengisian Komitmen Pagi (Sebelum Submit) -->
      <template v-else>
        <!-- Zero Commitment Option Box (IMP-029) -->
        <div class="zero-box">
        <label class="zero-label">
          <input
            type="checkbox"
            v-model="isZeroCommitment"
            :disabled="isFormLocked"
            data-testid="zero-commitment-checkbox"
          />
          <span data-testid="zero-commitment-label">Hari ini tidak ada komitmen harian khusus (0 Komitmen)</span>
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
            :disabled="isFormLocked"
            minlength="10"
            required
          ></textarea>
          <span class="field-sub" data-testid="zero-commitment-subtext">
            Hari Anda akan dicatat resmi sebagai <strong>Bebas Komitmen (Disetujui)</strong>, sehingga Anda tetap aman dan terbebas dari catatan Pelanggaran Pengisian (No Submission).
          </span>
        </div>
      </div>

      <!-- Copy-Forward Section (FR-11, DEC-013) -->
      <section v-if="!isZeroCommitment && availableCarryOvers.length > 0" class="panel copy-forward-panel">
        <div class="panel-head clickable" @click="isCopyForwardOpen = !isCopyForwardOpen">
          <div>
            <div class="kicker">Lanjutan Hari Kerja Sebelumnya</div>
            <h2>Draf Tugas Berlanjut dari Kemarin</h2>
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
            Pilih tugas dari hari kerja sebelumnya untuk disalin ke slot komitmen hari ini:
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
                    Carry-over 3+ hari berturut-turut — Disarankan AMBER
                  </span>
                </div>
                <div v-if="item.continuationReason" class="carry-note">
                  <span class="note-label">Catatan EOD Kemarin:</span>
                  <span class="note-val">"{{ item.continuationReason }}"</span>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-secondary icon-text-btn"
                :disabled="isFormLocked || isDraftApplied(item.originCommitmentId)"
                @click="applyCarryOver(item)"
              >
                <Check v-if="isDraftApplied(item.originCommitmentId)" :size="14" />
                <Copy v-else :size="14" />
                <span>{{ isDraftApplied(item.originCommitmentId) ? 'Sudah Tersalin' : 'Salin ke Slot' }}</span>
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
        </div>

        <div class="panel-body slots-body">
          <!-- Context Hint: Tomorrow Priority dari EOD Kemarin (Non-Binding Context) -->
          <div
            v-if="tomorrowPriority && !isZeroCommitment"
            class="tomorrow-priority-hint"
            data-testid="tomorrow-priority-banner"
          >
            <div class="tomorrow-priority-hint-content">
              <span class="tomorrow-priority-hint-label">
                <Bookmark :size="14" class="text-amber" />
                <span>Prioritas Kemarin Sore:</span>
              </span>
              <span class="tomorrow-priority-hint-text">"{{ tomorrowPriority }}"</span>
            </div>
            <span class="badge badge-warning">Hanya Referensi</span>
          </div>

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
                v-if="commitmentSlots.length > 1 && !isFormLocked"
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
                :placeholder="commitmentPlaceholder"
                :disabled="isFormLocked"
                required
              ></textarea>
            </div>

            <!-- Proyek Terkait & Tautan Referensi / Pilih Blocker Aktif -->
            <div class="form-row-meta">
              <div class="form-group">
                <label class="form-label">Proyek Terkait (Opsional)</label>
                <select
                  v-model="slot.projectCode"
                  class="input-control"
                  :disabled="isFormLocked"
                  :data-testid="`select-project-${idx}`"
                >
                  <option value="">-- Non-Proyek / Operasional Rutin --</option>
                  <option
                    v-for="prj in availableProjects"
                    :key="prj.projectCode"
                    :value="prj.projectCode"
                  >
                    [{{ prj.projectCode }}] {{ prj.projectName }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tautkan Tiket Tugas atau Blocker yang Ingin Dikerjakan (Opsional)</label>
                <div class="input-picker-group">
                  <div class="input-with-icon picker-input-flex">
                    <LinkIcon :size="16" class="inner-icon" />
                    <input
                      v-model="slot.referenceLink"
                      type="text"
                      class="input-control with-icon"
                      placeholder="https://github.com/... atau pilih blocker"
                      :disabled="isFormLocked"
                    />
                  </div>
                  <div v-if="!isFormLocked" class="picker-dropdown-wrap">
                    <button
                      type="button"
                      class="btn-picker-trigger"
                      :data-testid="`resolve-blocker-picker-${idx}`"
                      title="Pilih tiket blocker aktif yang sedang ditangani"
                      @click="toggleBlockerPicker(idx)"
                    >
                      <span>Pilih Blocker Aktif</span>
                      <ChevronDown :size="13" />
                    </button>
                    <div
                      v-if="openBlockerPickerIndex === idx"
                      class="picker-dropdown-menu show"
                    >
                      <div class="picker-menu-header">
                        <span>Blocker Aktif ({{ activeBlockers.length }})</span>
                        <span class="picker-menu-sub">Klik untuk menautkan</span>
                      </div>
                      <div v-if="activeBlockers.length === 0" class="picker-empty">
                        Tidak ada tiket blocker aktif saat ini.
                      </div>
                      <button
                        v-for="blk in activeBlockers"
                        :key="blk.id"
                        type="button"
                        class="picker-menu-item"
                        @click="selectBlockerForSlot(idx, blk)"
                      >
                        <div class="picker-item-top">
                          <span class="picker-item-code">{{ blk.code }}</span>
                          <span
                            class="badge-mini"
                            :class="blk.status === 'OPEN' ? 'open' : blk.status === 'ACKNOWLEDGED' ? 'ack' : 'in-prog'"
                          >
                            {{ blk.severity }} · {{ blk.status }}
                          </span>
                        </div>
                        <div class="picker-item-title">{{ blk.description }}</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Initial Risk Selection -->
            <div class="form-group">
              <label class="form-label">Tingkat Risiko Tugas Hari Ini *</label>
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
                    :disabled="isFormLocked"
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
                    :disabled="isFormLocked"
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
                    :disabled="isFormLocked"
                  />
                  <div class="risk-title">RED</div>
                  <div class="risk-desc">Kritis / Memerlukan Intervensi Atasan</div>
                </label>
              </div>
            </div>

            <!-- Known Blocker & Support Needed (Muncul jika AMBER / RED) -->
            <div v-if="slot.initialRisk === 'AMBER' || slot.initialRisk === 'RED'" class="blocker-inputs-box">
              <div class="form-group">
                <label class="form-label">Tiket Blocker Penyebab (Opsional)</label>
                <select
                  v-model="slot.linkedBlockerId"
                  class="input-control"
                  :disabled="isFormLocked"
                  :data-testid="`hindered-blocker-select-${idx}`"
                  @change="handleHinderedByBlockerChange(idx)"
                >
                  <option value="">-- Tidak Terkait Tiket Blocker Aktif --</option>
                  <option v-for="blk in activeBlockers" :key="blk.id" :value="blk.id">
                    {{ blk.code }} [{{ blk.severity }}] — {{ truncateOptionText(blk.description, 65) }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Uraian Resiko atau Potensi Kendala *</label>
                <textarea
                  v-model="slot.knownBlockerNote"
                  class="input-control"
                  rows="2"
                  placeholder="Jelaskan apa/siapa yang ditunggu atau dependensi apa yang berpotensi menghambat..."
                  :disabled="isFormLocked"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Tindakan / Bantuan yang Diharapkan (Opsional)</label>
                <input
                  v-model="slot.supportNeeded"
                  type="text"
                  class="input-control"
                  placeholder="Misal: Butuh Tech Lead bantu review PR sebelum jam 13:00"
                  :disabled="isFormLocked"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Add Slot Action (Linear Downward Flow) -->
          <div v-if="!isFormLocked" class="slots-bottom-action">
            <button
              v-if="commitmentSlots.length < 3"
              type="button"
              class="btn-add-slot-bottom"
              @click="addSlot"
              data-testid="add-slot-btn"
            >
              <Plus :size="16" />
              <span>Tambah Slot Komitmen ({{ commitmentSlots.length }}/3)</span>
            </button>
            <div v-else class="slots-max-hint">
              <CheckCircle2 :size="15" class="text-green" />
              <span>Batas maksimal 3 komitmen harian telah tercapai.</span>
            </div>
          </div>
        </div>
      </section>
        <!-- Action Footer -->
        <div v-if="!isFormLocked" class="action-footer">
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
      </template>

      <!-- Success / Post-Submit Navigation Panel -->
      <div v-if="hasSubmittedMorning" class="post-submit-panel">
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

.head-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.alert-banner.submitted {
  background: var(--color-status-green-bg);
  border: 1px solid var(--color-status-green-border);
  color: var(--color-status-green-fg);
}

.alert-banner.leave {
  background: var(--color-status-green-bg);
  border: 1px solid var(--color-status-green-border);
  color: var(--color-status-green-fg);
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

/* Summary Cards (Mode Review / Pasca-Submit Resmi) */
.summary-panel,
.zero-summary-panel {
  margin-top: 16px;
}

.summary-head-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
}

.summary-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card.summary-card-amber {
  border-left: 4px solid #f59e0b;
}

.summary-card.summary-card-red {
  border-left: 4px solid #ef4444;
}

.summary-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 1.2;
}

.summary-slot-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-number {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-brand-primary);
}

.summary-risk-pill .badge {
  font-size: 11px;
  padding: 2px 8px;
  font-weight: 600;
}

.summary-task-text {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.45;
}

.summary-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border-subtle);
}

.meta-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  line-height: 1.35;
}

.meta-label {
  color: var(--color-text-secondary);
  font-weight: 600;
  white-space: nowrap;
  font-size: 11.5px;
  min-width: 125px;
  flex-shrink: 0;
}

.meta-val {
  color: var(--color-text-primary);
  font-size: 11.5px;
}

.meta-val.text-muted {
  color: var(--color-text-disabled);
  font-weight: 500;
}

.text-link-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-primary);
  font-size: 11.5px;
}

.meta-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm, 4px);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-pill.project-pill {
  background: var(--color-surface);
  color: var(--color-brand-primary);
  border: 1px solid var(--color-border-subtle);
}

.meta-pill.blocker-pill {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.meta-link {
  font-size: 11.5px;
  color: var(--color-brand-primary);
  font-weight: 600;
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 480px;
}

.truncate-link {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-callout {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
  margin-top: 2px;
}

.callout-entry {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.callout-tag {
  font-weight: 700;
  color: var(--color-text-secondary);
  min-width: 120px;
  font-size: 11.5px;
}

.callout-desc {
  color: var(--color-text-primary);
  line-height: 1.35;
}

.zero-summary-panel .panel-body {
  padding: 14px 16px;
}

.zero-summary-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zero-summary-badge-row {
  margin-bottom: 2px;
}

.zero-summary-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.zero-summary-reason {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-style: italic;
  padding: 8px 12px;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-sm, 4px);
  border-left: 3px solid var(--color-brand-primary);
}

.zero-summary-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin-top: 2px;
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

.zero-reason-box .field-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.zero-reason-box .field-sub strong {
  color: var(--color-text-primary);
  font-weight: 600;
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

.carry-main {
  flex: 1;
  margin-right: 16px;
}

.carry-note {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--color-surface-subtle, #f8fafc);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm, 6px);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.carry-note .note-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.carry-note .note-val {
  font-size: 12px;
  color: var(--color-text-primary);
  font-style: italic;
  line-height: 1.45;
}

/* Tomorrow Priority Context Hint */
.tomorrow-priority-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-surface-subtle, #f8fafc);
  border: 1px solid var(--color-border-subtle);
  border-left: 3px solid var(--color-status-amber, #d97706);
  border-radius: var(--radius-sm, 6px);
  margin-bottom: 2px;
}

.tomorrow-priority-hint-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.tomorrow-priority-hint-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.tomorrow-priority-hint-text {
  font-size: 13px;
  font-style: italic;
  color: var(--color-text-primary);
  line-height: 1.45;
}

/* Slots Form */
.slots-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.slots-bottom-action {
  margin-top: 4px;
  display: flex;
  justify-content: center;
}

.btn-add-slot-bottom {
  width: 100%;
  padding: 12px 18px;
  background: var(--color-surface);
  border: 1.5px dashed var(--color-brand-primary);
  border-radius: var(--radius-sm);
  color: var(--color-brand-primary);
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-add-slot-bottom:hover {
  background: var(--color-brand-tint);
  border-style: solid;
}

.slots-max-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 10px 16px;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
  width: 100%;
  justify-content: center;
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
  color: #dc2626;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color 0.15s ease, opacity 0.15s ease;
}

.remove-btn:hover {
  color: #991b1b;
  opacity: 0.8;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input-control {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  color: var(--color-text-primary);
  text-overflow: ellipsis;
}

select.input-control {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%235C6E68' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 15px 15px;
  padding-right: 36px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.input-control:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
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

.slots-panel {
  overflow: visible;
}

.form-row-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

@media (max-width: 768px) {
  .form-row-meta {
    grid-template-columns: 1fr;
  }
}

.input-picker-group {
  display: flex;
  align-items: stretch;
  gap: 8px;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.picker-input-flex {
  flex: 1;
  min-width: 0;
}

.picker-dropdown-wrap {
  position: relative;
  flex-shrink: 0;
}

.btn-picker-trigger {
  height: 100%;
  min-height: 38px;
  padding: 0 12px;
  background: var(--color-surface-subtle, #f1f5f9);
  border: 1px solid var(--color-border-strong, #cbd5e1);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease-in-out;
}

.btn-picker-trigger:hover:not(:disabled) {
  background: #e6f4ee;
  border-color: var(--color-brand-primary);
}

.picker-dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 340px;
  max-width: 90vw;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 28px rgba(14, 33, 27, 0.14);
  z-index: 100;
  padding: 6px;
}

.picker-dropdown-menu.show {
  display: block;
}

.picker-menu-header {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  padding: 8px 10px 6px;
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-menu-sub {
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
  color: var(--color-text-secondary);
}

.picker-empty {
  padding: 12px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

.picker-menu-item {
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  display: block;
}

.picker-menu-item:hover {
  background: var(--color-surface-subtle, #f8fafc);
}

.picker-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
}

.picker-item-code {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-status-amber-fg);
  font-family: var(--font-mono);
}

.picker-item-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}

.badge-mini {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-block;
}

.badge-mini.open {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
}

.badge-mini.ack {
  background: var(--color-status-amber-bg);
  color: var(--color-status-amber-fg);
}

.badge-mini.in-prog {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
}
</style>
