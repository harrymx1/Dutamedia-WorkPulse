<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  Info,
} from 'lucide-vue-next';

interface PolicyItem {
  id: string;
  category: string;
  configurationValues: Record<string, any>;
  isIllustrative: boolean;
  isFallback: boolean;
  effectiveDate: string;
  endDate: string | null;
  createdBy: { id: string; fullName: string; email: string };
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: { fullName: string; email: string };
  actionCode: string;
  category: string;
  effectiveDate: string | null;
  changeJustification: string;
  valueBefore: any;
  valueAfter: any;
}

interface PolicyOwner {
  id: string;
  policyCategory: string;
  user: { id: string; fullName: string; email: string };
}

// State
const loading = ref(false);
const policies = ref<PolicyItem[]>([]);
const auditLogs = ref<AuditLogItem[]>([]);
const policyOwners = ref<PolicyOwner[]>([]);
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Modal state
const isModalOpen = ref(false);
const modalSubmitting = ref(false);
const modalError = ref<string | null>(null);

const formCategory = ref('CHECKIN_TIMING');
const formEffectiveDate = ref('');
const formEndDate = ref('');
const formJustification = ref('');

// Dynamic fields for categories
const formMorningCutoff = ref('09:30');
const formEodCutoff = ref('21:00');
const formMorningOntime = ref('09:00');
const formEodOntime = ref('17:00');

const formSlaL1Hours = ref(4);
const formSlaL2Hours = ref(8);
const formAutoEscalateHours = ref(4);

const formCarryOverAmberDays = ref(3);
const formAllowGreenWithCarryOver = ref(true);

const formMaxCorrectionDays = ref(7);

const todayStr = computed(() => {
  const d = new Date();
  return d.toISOString().split('T')[0];
});

// Policies dictionary by category
const policyMap = computed(() => {
  const map: Record<string, PolicyItem | undefined> = {};
  for (const p of policies.value) {
    map[p.category] = p;
  }
  return map;
});

// Load data
async function loadData() {
  loading.value = true;
  try {
    const res = await apiClient<{ policies: PolicyItem[]; owners: PolicyOwner[] }>('/policies');
    policies.value = res.data.policies || [];
    policyOwners.value = res.data.owners || [];

    const auditRes = await apiClient<AuditLogItem[]>('/policies/audit');
    auditLogs.value = auditRes.data || [];
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat pengaturan kebijakan.', true);
  } finally {
    loading.value = false;
  }
}

function openCreateModal(defaultCategory?: string) {
  if (defaultCategory) {
    formCategory.value = defaultCategory;
  }
  formEffectiveDate.value = todayStr.value;
  formEndDate.value = '';
  formJustification.value = '';
  modalError.value = null;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  modalError.value = null;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal();
  }
}

async function submitNewVersion() {
  if (formJustification.value.trim().length < 15) {
    modalError.value = 'Alasan perubahan kebijakan minimal 15 karakter untuk kebutuhan jejak audit kepatuhan.';
    return;
  }

  if (formEffectiveDate.value < todayStr.value) {
    modalError.value = 'Tanggal mulai berlaku tidak boleh di masa lampau (DEC-008: Dilarang Backdating).';
    return;
  }

  modalSubmitting.value = true;
  modalError.value = null;

  let configurationValues: Record<string, any> = {};

  if (formCategory.value === 'CHECKIN_TIMING') {
    configurationValues = {
      morningOnTimeCutoff: formMorningOntime.value,
      morningLockCutoff: formMorningCutoff.value,
      eodOnTimeCutoff: formEodOntime.value,
      eodLockCutoff: formEodCutoff.value,
      timezone: 'Asia/Jakarta',
    };
  } else if (formCategory.value === 'BLOCKER_SLA') {
    configurationValues = {
      level1Hours: Number(formSlaL1Hours.value),
      level2Hours: Number(formSlaL2Hours.value),
      autoEscalateAfterHours: Number(formAutoEscalateHours.value),
      operatingHoursStart: '09:00',
      operatingHoursEnd: '17:00',
      countWeekends: false,
    };
  } else if (formCategory.value === 'COMPLIANCE_THRESHOLD') {
    configurationValues = {
      carryOverAmberDays: Number(formCarryOverAmberDays.value),
      allowGreenWithCarryOver: formAllowGreenWithCarryOver.value,
      maxConsecutiveNoSubmissions: 2,
      minCommitmentsPerDay: 0,
      maxCommitmentsPerDay: 3,
      zeroCommitmentRequiresReason: true,
    };
  } else if (formCategory.value === 'CORRECTION_WINDOW') {
    configurationValues = {
      maxCorrectionDays: Number(formMaxCorrectionDays.value),
      requireDirectManagerApproval: true,
      requireHrgaApproval: true,
    };
  } else {
    configurationValues = {
      morningReminderMinutesBefore: 60,
      eodReminderMinutesBefore: 60,
      slaWarningPercent: 75,
    };
  }

  try {
    await apiClient('/policies', {
      method: 'POST',
      body: JSON.stringify({
        category: formCategory.value,
        configurationValues,
        isIllustrative: false, // Perubahan resmi menandai parameter non-ilustratif
        effectiveDate: formEffectiveDate.value,
        endDate: formEndDate.value ? formEndDate.value : undefined,
        changeJustification: formJustification.value.trim(),
      }),
    });

    showToast('Versi kebijakan baru berhasil disimpan dan diterapkan.');
    closeModal();
    await loadData();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal menyimpan versi kebijakan baru.';
  } finally {
    modalSubmitting.value = false;
  }
}

async function triggerIllustrativeSeed() {
  try {
    await apiClient('/policies/seed', { method: 'POST' });
    showToast('Parameter ilustratif kanonikal (DEC-011) berhasil di-seed.');
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal melakukan seed parameter.', true);
  }
}

function exportAuditCSV() {
  if (auditLogs.value.length === 0) {
    showToast('Tidak ada jejak audit untuk diunduh.', true);
    return;
  }

  const headers = ['ID', 'Waktu', 'Pengubah', 'Email', 'Kategori', 'Tanggal Efektif', 'Alasan Perubahan'];
  const rows = auditLogs.value.map((log) => [
    log.id,
    new Date(log.timestamp).toLocaleString('id-ID'),
    log.actor?.fullName || 'System',
    log.actor?.email || '-',
    log.category,
    log.effectiveDate || '-',
    `"${(log.changeJustification || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `workpulse-policy-audit-${todayStr.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  window.addEventListener('keydown', handleKeydown);
  loadData();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="admin-layout">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="brand-badge">WP</div>
        <span class="brand-name">WorkPulse</span>
        <span class="system-tag">Tata Kelola Kebijakan</span>
      </div>
      <div class="nav-right">
        <AccessLink to="/admin/organization" class="nav-link">Struktur Organisasi</AccessLink>
        <AccessLink to="/admin/temporary-reviewers" class="nav-link">Reviewer Sementara</AccessLink>
        <AccessLink to="/admin/users" class="nav-link">Kelola Pengguna</AccessLink>
        <AccessLink to="/admin/policies" class="nav-link active">Pengaturan Kebijakan</AccessLink>
        <AccessLink to="/profile" class="nav-link">Profil Saya</AccessLink>
      </div>
    </header>

    <!-- Toast Notifications -->
    <div v-if="toastMessage" class="toast-popup success" role="status">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>
    <div v-if="errorMessage" class="toast-popup error" role="alert">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <main class="content-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="kicker">
            <ShieldAlert :size="14" />
            <span>Administration · Policy Governance & Versioned Audit</span>
          </div>
          <h1>Pengaturan Kebijakan Sistem (Policy Settings)</h1>
          <p class="subtitle">
            Konfigurasi parameter operasional organisasi: jam kerja dan penguncian cut-off (DEC-002), SLA kendala berjenjang, ambang carry-over berulang tanpa penguncian status (DEC-003), kebijakan komitmen nol (DEC-004), serta penegakan tanggal efektif wajib di masa depan tanpa backdating (DEC-008).
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" type="button" @click="triggerIllustrativeSeed" title="Seed default parameter ilustratif (DEC-011)">
            <span>Seed Ilustratif (DEC-011)</span>
          </button>
          <button class="btn btn-primary" type="button" @click="openCreateModal()">
            <Plus :size="18" />
            <span>+ Buat Versi Kebijakan Baru</span>
          </button>
        </div>
      </div>

      <!-- 4 Summary Metric Cards -->
      <section class="metrics-grid" aria-label="Ringkasan Kebijakan Sistem">
        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">Morning Cut-Off</span>
            <span class="badge badge-info">DEC-002</span>
          </div>
          <div class="metric-value">
            {{ policyMap.CHECKIN_TIMING?.configurationValues?.morningLockCutoff || '09:30' }} WIB
          </div>
          <div class="metric-sub">
            On-Time Deadline: {{ policyMap.CHECKIN_TIMING?.configurationValues?.morningOnTimeCutoff || '09:00' }} WIB (Toleransi 30m)
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">EOD Cut-Off</span>
            <span class="badge badge-info">DEC-002</span>
          </div>
          <div class="metric-value">
            {{ policyMap.CHECKIN_TIMING?.configurationValues?.eodLockCutoff || '21:00' }} WIB
          </div>
          <div class="metric-sub">
            On-Time Deadline: {{ policyMap.CHECKIN_TIMING?.configurationValues?.eodOnTimeCutoff || '17:00' }} WIB (Locked pasca-21:00)
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">SLA Blocker L1 / L2</span>
            <span class="badge badge-active">Active SLA</span>
          </div>
          <div class="metric-value">
            {{ policyMap.BLOCKER_SLA?.configurationValues?.level1Hours || 4 }}j / {{ policyMap.BLOCKER_SLA?.configurationValues?.level2Hours || 8 }}j Kerja
          </div>
          <div class="metric-sub">
            Auto-escalation threshold: {{ policyMap.BLOCKER_SLA?.configurationValues?.autoEscalateAfterHours || 4 }} jam tanpa ack
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">Versi Audit Tercatat</span>
            <span class="badge badge-neutral">DEC-008</span>
          </div>
          <div class="metric-value">{{ auditLogs.length }} Versi</div>
          <div class="metric-sub">Riwayat versi tersimpan aman tanpa overwrite</div>
        </article>
      </section>

      <!-- Architecture Principle Callout -->
      <div class="callout">
        <Info class="callout-icon" :size="20" />
        <div class="callout-content">
          <div class="callout-title">Prinsip Tata Kelola Kebijakan Terpadu</div>
          <p>
            Perubahan nilai kebijakan tidak pernah menimpa (overwrite) rekaman historis secara langsung. Setiap modifikasi parameter akan menerbitkan <strong>Versi Kebijakan Baru</strong> dengan tanggal berlaku efektif (<code>effectiveDate >= today</code>) sesuai <strong>DEC-008</strong>. Penegakan status locked pasca-cut-off dijalankan secara otomatis oleh scheduler sistem (<strong>DEC-002</strong>).
          </p>
        </div>
      </div>

      <!-- SECTION 1: Jam Kerja & Batas Pengiriman (DEC-002) -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <Clock :size="18" />
              <span>1. Jam Kerja, Batas Pengiriman & Penguncian Cut-Off (DEC-002)</span>
            </h2>
            <p>Menetapkan jadwal kerja operasional, batas on-time check-in, dan jendela cut-off penguncian formulir otomatis.</p>
          </div>
          <div class="head-badges">
            <span v-if="policyMap.CHECKIN_TIMING?.isIllustrative" class="badge badge-illustrative">
              Ilustratif (DEC-011)
            </span>
            <span class="badge badge-active">Sedang Berlaku</span>
          </div>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Morning On-Time Deadline</span>
                <span class="badge badge-ontime">On-Time</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.CHECKIN_TIMING?.configurationValues?.morningOnTimeCutoff || '09:00' }}</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Batas waktu pengiriman Morning Commitment agar berstatus On-Time. Pengingat otomatis dikirim 60 menit sebelumnya.</div>
              <div class="param-status-rule">
                <span class="badge badge-ontime">On-Time</span>
                <span class="status-note">Pengiriman sebelum jam deadline dihitung On-Time (Biru #075985)</span>
              </div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Morning Cut-Off & Locking Threshold</span>
                <span class="badge badge-cutoff">Cut-Off</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.CHECKIN_TIMING?.configurationValues?.morningLockCutoff || '09:30' }}</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Toleransi 30 menit. Pengiriman antara deadline & cutoff berstatus LATE. Melewati batas ini form <strong>LOCKED</strong>.</div>
              <div class="param-status-rule">
                <span class="badge badge-late">Late</span>
                <span class="badge badge-neutral">Locked</span>
                <span class="status-note">Setelah cutoff otomatis No Submission</span>
              </div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">EOD On-Time Deadline</span>
                <span class="badge badge-ontime">On-Time</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.CHECKIN_TIMING?.configurationValues?.eodOnTimeCutoff || '17:00' }}</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Batas waktu pengisian evaluasi EOD Outcome harian sebelum jam pulang resmi perusahaan.</div>
              <div class="param-status-rule">
                <span class="badge badge-ontime">On-Time</span>
                <span class="status-note">Pengiriman sebelum deadline berstatus On-Time</span>
              </div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">EOD Cut-Off & Overnight Lock</span>
                <span class="badge badge-cutoff">Cut-Off</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.CHECKIN_TIMING?.configurationValues?.eodLockCutoff || '21:00' }}</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Toleransi lembur fleksibel. Melewati 21:00 WIB, hari dinyatakan selesai dan form EOD <strong>LOCKED</strong>.</div>
              <div class="param-status-rule">
                <span class="badge badge-neutral">Locked</span>
                <span class="status-note">Koreksi pasca-cut-off hanya lewat alur koreksi</span>
              </div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Penjelasan Penegakan DEC-002:</strong> Status Locked mencegah manipulasi pengisian retroaktif di luar jam kerja. Anggota tim yang melewatkan jam cut-off tidak dapat lagi mengisi form secara reguler; sistem otomatis mencatat status <code>No Submission</code> pada hari kerja tersebut dan memerlukan pengajuan <em>Correction Request</em> bertahap.
          </div>
        </div>
      </section>

      <!-- SECTION 2: Blocker SLA & Escalation -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <AlertTriangle :size="18" />
              <span>2. SLA Penanganan Kendala (Blocker SLA & Auto-Escalation)</span>
            </h2>
            <p>Target waktu respon dan penyelesaian kendala agar tidak menghambat deliverable sprint.</p>
          </div>
          <div class="head-badges">
            <span v-if="policyMap.BLOCKER_SLA?.isIllustrative" class="badge badge-illustrative">
              Ilustratif (DEC-011)
            </span>
            <span class="badge badge-active">Sedang Berlaku</span>
          </div>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">SLA Level 1 (Supervisor / Pejabat L1)</span>
                <span class="badge badge-active">Level 1</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.BLOCKER_SLA?.configurationValues?.level1Hours || 4 }}</span>
                <span class="param-unit">Jam Kerja</span>
              </div>
              <div class="param-desc">Batas waktu bagi atasan langsung untuk acknowledgement resmi dan mencatat mitigasi awal.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">SLA Level 2 (Head of Department)</span>
                <span class="badge badge-warning">Level 2</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.BLOCKER_SLA?.configurationValues?.level2Hours || 8 }}</span>
                <span class="param-unit">Jam Kerja</span>
              </div>
              <div class="param-desc">Target penyelesaian menyeluruh atau penguraian dependensi lintas divisi oleh pimpinan fungsi.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Auto-Escalation Threshold</span>
                <span class="badge badge-danger">Otomatis L2</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.BLOCKER_SLA?.configurationValues?.autoEscalateAfterHours || 4 }}</span>
                <span class="param-unit">Jam Kerja Tanpa Ack</span>
              </div>
              <div class="param-desc">Jika blocker belum di-acknowledge dalam durasi ini, sistem otomatis menaikkan status eskalasi ke L2.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Kalkulasi Jam Operasional SLA</span>
                <span class="badge badge-info">Senin - Jumat</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">09:00 - 17:00</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Penghitungan durasi aging SLA dijeda pada malam hari dan akhir pekan / hari libur nasional resmi.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: Carry-Over Threshold (DEC-003) -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <Layers :size="18" />
              <span>3. Ambang Batas Carry-Over Berulang & Larangan Lock GREEN (DEC-003)</span>
            </h2>
            <p>Aturan deteksi tugas berlanjut tanpa menghukum atau mengunci hak refleksi mandiri karyawan.</p>
          </div>
          <div class="head-badges">
            <span v-if="policyMap.COMPLIANCE_THRESHOLD?.isIllustrative" class="badge badge-illustrative">
              Ilustratif (DEC-011)
            </span>
            <span class="badge badge-active">Sedang Berlaku</span>
          </div>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Ambang Peringatan Saran AMBER</span>
                <span class="badge badge-warning">Hari ke-3+</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.COMPLIANCE_THRESHOLD?.configurationValues?.carryOverAmberDays || 3 }}</span>
                <span class="param-unit">Hari Berturut-turut</span>
              </div>
              <div class="param-desc">Tugas yang mengalami <code>Continue</code> sebanyak 3 hari berturut-turut memicu status saran minimal AMBER dari sistem.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Proteksi Hak Opsi GREEN (DEC-003)</span>
                <span class="badge badge-active">Dilarang Di-Lock</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-green">UNLOCKED (TIDAK BOLEH DIKUNCI)</span>
              </div>
              <div class="param-desc">Opsi GREEN pada Morning maupun EOD <strong>TIDAK BOLEH PERNAH DI-DISABLE</strong>. Karyawan tetap berhak memilih GREEN dengan konfirmasi refleksi mandiri.</div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Ketetapan Arsitektur DEC-003:</strong> Sistem WorkPulse menolak pola antarmuka punitif. Deteksi carry-over berulang dihadirkan melalui badge carry-over (#2, #3+) dan dialog refleksi persuasif, bukan dengan merampas hak anggota tim.
          </div>
        </div>
      </section>

      <!-- SECTION 4: Zero-Commitment Policy (DEC-004) -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <CheckCircle2 :size="18" />
              <span>4. Kebijakan Komitmen Nol / Zero-Commitment (DEC-004)</span>
            </h2>
            <p>Pengaturan toleransi hari kerja tanpa komitmen terencana untuk skenario pelatihan atau penugasan khusus.</p>
          </div>
          <span class="badge badge-active">Sedang Berlaku</span>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Batas Jumlah Komitmen Harian</span>
                <span class="badge badge-info">0 s/d 3 Komitmen</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">0 - 3</span>
                <span class="param-unit">Komitmen</span>
              </div>
              <div class="param-desc">Rentang komitmen pagi yang diizinkan untuk dikirimkan oleh karyawan dalam satu hari kerja normal.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Penanganan Kasus 0 Komitmen</span>
                <span class="badge badge-neutral">Wajib Alasan</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-bold">JUSTIFICATION REQUIRED</span>
              </div>
              <div class="param-desc">Jika 0 komitmen dipilih, kolom alasan wajib diisi (misal: pelatihan seharian). Status otomatis menjadi <code>NOT_APPLICABLE — NO_COMMITMENT</code>.</div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Makna Status NOT_APPLICABLE — NO_COMMITMENT:</strong> Status ini merupakan fakta sah non-operasional dan secara tegas <strong>bukan merupakan status GREEN dan bukan No Submission</strong>.
          </div>
        </div>
      </section>

      <!-- SECTION 5: Effective Date & Anti-Backdating (DEC-008) -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <ShieldAlert :size="18" />
              <span>5. Penegakan Tanggal Efektif & Larangan Backdating (DEC-008)</span>
            </h2>
            <p>Aturan integritas data legal agar histori performa masa lampau tidak dapat diubah surut.</p>
          </div>
          <span class="badge badge-active">Sedang Berlaku</span>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Validasi Effective Date</span>
                <span class="badge badge-danger">DEC-008</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-green">effectiveDate &gt;= today</span>
              </div>
              <div class="param-desc">Tanggal mulai berlaku kebijakan baru WAJIB hari ini atau masa depan. Input tanggal lampau otomatis ditolak sistem.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Alasan Perubahan Kebijakan</span>
                <span class="badge badge-info">Wajib Diisi</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-primary">MANDATORY RATIONALE</span>
              </div>
              <div class="param-desc">Setiap penerbitan versi baru wajib menyertakan minimal 15 karakter alasan bisnis untuk kebutuhan jejak audit ISO/HRGA.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Audit Trail Table -->
      <section class="audit-section" aria-label="Jejak Audit Perubahan Kebijakan">
        <div class="audit-head">
          <div>
            <h2>Jejak Audit Perubahan Kebijakan (Policy Audit Trail)</h2>
            <p>Catatan lengkap riwayat versi, parameter sebelum/sesudah, pembuat, dan alasan perubahan.</p>
          </div>
          <button class="btn btn-secondary" type="button" @click="exportAuditCSV">
            <FileSpreadsheet :size="16" />
            <span>Unduh Audit CSV</span>
          </button>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Kategori Kebijakan</th>
                <th>Mulai Berlaku</th>
                <th>Diubah Oleh</th>
                <th>Alasan Perubahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="auditLogs.length === 0">
                <td colspan="6" class="text-center empty-cell">
                  Belum ada jejak audit perubahan kebijakan yang tercatat.
                </td>
              </tr>
              <tr v-for="log in auditLogs" :key="log.id">
                <td class="mono-text">{{ new Date(log.timestamp).toLocaleString('id-ID') }}</td>
                <td>
                  <span class="badge badge-info">{{ log.category }}</span>
                </td>
                <td class="mono-text">{{ log.effectiveDate || '-' }}</td>
                <td>
                  <div class="user-meta">
                    <span class="user-name">{{ log.actor?.fullName || 'System' }}</span>
                    <span class="user-email">{{ log.actor?.email || '' }}</span>
                  </div>
                </td>
                <td class="rationale-cell">{{ log.changeJustification || '-' }}</td>
                <td>
                  <span class="badge badge-active">{{ log.actionCode }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Modal Buat Versi Kebijakan Baru -->
    <div v-if="isModalOpen" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 id="modalTitle">Buat Versi Kebijakan Baru</h3>
            <p class="modal-subtitle">Nilai lama akan diarsipkan otomatis sebagai riwayat audit tanpa ditimpa (DEC-008).</p>
          </div>
          <button class="icon-btn" type="button" @click="closeModal" aria-label="Tutup dialog">
            <X :size="20" />
          </button>
        </div>

        <div v-if="modalError" class="modal-error-alert" role="alert">
          <AlertCircle :size="16" />
          <span>{{ modalError }}</span>
        </div>

        <form @submit.prevent="submitNewVersion" class="modal-form">
          <div class="form-group">
            <label for="select-cat">Kategori Kebijakan *</label>
            <select id="select-cat" v-model="formCategory" class="input-control" required>
              <option value="CHECKIN_TIMING">Jam Kerja & Batas Pengiriman (Cut-Off)</option>
              <option value="BLOCKER_SLA">SLA Penanganan Kendala (Blocker SLA)</option>
              <option value="COMPLIANCE_THRESHOLD">Ambang Batas Carry-Over Berulang</option>
              <option value="CORRECTION_WINDOW">Jendela Pengajuan Koreksi</option>
              <option value="NOTIFICATION_REMINDER_THRESHOLD">Ambang Notifikasi & Pengingat</option>
            </select>
          </div>

          <!-- Dynamic inputs based on category -->
          <div v-if="formCategory === 'CHECKIN_TIMING'" class="form-row">
            <div class="form-group">
              <label for="input-morning-ontime">Morning On-Time Deadline *</label>
              <input id="input-morning-ontime" v-model="formMorningOntime" type="time" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-morning-cutoff">Morning Cut-Off (Locking) *</label>
              <input id="input-morning-cutoff" v-model="formMorningCutoff" type="time" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-eod-ontime">EOD On-Time Deadline *</label>
              <input id="input-eod-ontime" v-model="formEodOntime" type="time" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-eod-cutoff">EOD Cut-Off (Locking) *</label>
              <input id="input-eod-cutoff" v-model="formEodCutoff" type="time" class="input-control" required />
            </div>
          </div>

          <div v-else-if="formCategory === 'BLOCKER_SLA'" class="form-row">
            <div class="form-group">
              <label for="input-sla-l1">SLA Level 1 (Jam Kerja) *</label>
              <input id="input-sla-l1" v-model="formSlaL1Hours" type="number" min="1" max="24" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-sla-l2">SLA Level 2 (Jam Kerja) *</label>
              <input id="input-sla-l2" v-model="formSlaL2Hours" type="number" min="1" max="48" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-sla-auto">Auto-Escalate (Jam Kerja) *</label>
              <input id="input-sla-auto" v-model="formAutoEscalateHours" type="number" min="1" max="24" class="input-control" required />
            </div>
          </div>

          <div v-else-if="formCategory === 'COMPLIANCE_THRESHOLD'" class="form-row">
            <div class="form-group">
              <label for="input-carryover-days">Ambang Saran Amber Carry-Over (Hari) *</label>
              <input id="input-carryover-days" v-model="formCarryOverAmberDays" type="number" min="1" max="10" class="input-control" required />
            </div>
            <div class="form-group">
              <label>Proteksi Hak Hijau (DEC-003)</label>
              <div class="readonly-badge">UNLOCKED (DILARANG LOCK GREEN)</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="input-effective-date">Tanggal Mulai Berlaku (Effective Date) *</label>
              <input
                id="input-effective-date"
                v-model="formEffectiveDate"
                type="date"
                :min="todayStr"
                class="input-control"
                required
              />
              <span class="field-help">Harus hari ini atau masa depan (DEC-008: Dilarang Backdating).</span>
            </div>
            <div class="form-group">
              <label for="input-end-date">Tanggal Berakhir (Opsional)</label>
              <input
                id="input-end-date"
                v-model="formEndDate"
                type="date"
                :min="formEffectiveDate || todayStr"
                class="input-control"
              />
              <span class="field-help">Kosongkan bila berlaku permanen.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="input-reason">Alasan Perubahan Kebijakan (Change Justification) *</label>
            <textarea
              id="input-reason"
              v-model="formJustification"
              rows="3"
              class="input-control"
              placeholder="Tuliskan latar belakang dan alasan operasional perubahan ini..."
              minlength="15"
              required
            ></textarea>
            <span class="field-help">Minimal 15 karakter untuk kebutuhan jejak audit ISO/HRGA.</span>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" type="button" @click="closeModal">Batal</button>
            <button class="btn btn-primary" type="submit" :disabled="modalSubmitting">
              <span>{{ modalSubmitting ? 'Menyimpan...' : 'Simpan & Terapkan Versi Baru' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: var(--color-canvas);
  display: flex;
  flex-direction: column;
}

.top-nav {
  height: 60px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-left {
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

.brand-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-text-primary);
}

.system-tag {
  background: var(--color-surface-subtle);
  color: var(--color-brand-primary);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.nav-right {
  display: flex;
  gap: 16px;
}

.nav-link {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.nav-link.active,
.nav-link:hover {
  color: var(--color-brand-primary);
  background: var(--color-brand-tint);
}

.content-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.kicker {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 820px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-brand-hover);
}

.btn-secondary {
  background: var(--color-surface);
  border-color: var(--color-border-subtle);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-surface-subtle);
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  margin-bottom: 6px;
}

.metric-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Callout */
.callout {
  display: flex;
  gap: 14px;
  background: var(--color-surface-subtle);
  border-left: 4px solid var(--color-brand-primary);
  padding: 16px 20px;
  border-radius: 4px var(--radius-sm) var(--radius-sm) 4px;
}

.callout-icon {
  color: var(--color-brand-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.callout-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.callout-content p {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Policy Section */
.policy-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.policy-head {
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.policy-head-info h2 {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.policy-head-info p {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.head-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.policy-body {
  padding: 22px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-bottom: 16px;
}

.param-item {
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 16px;
}

.param-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.param-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.param-value-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}

.param-value {
  font-size: 26px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.param-unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.param-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.45;
  margin-bottom: 10px;
}

.param-status-rule {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-note {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.policy-guidance {
  background: #f8fafc;
  border: 1px dashed var(--color-border-subtle);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Audit Section */
.audit-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 22px;
}

.audit-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.audit-head h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.audit-head p {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.table-card {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: var(--color-canvas);
  color: var(--color-text-secondary);
  font-weight: 600;
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
}

.mono-text {
  font-family: var(--font-mono);
  font-size: 12px;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
}

.user-email {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.rationale-cell {
  max-width: 300px;
  color: var(--color-text-secondary);
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

.badge-cutoff {
  background: #ffedd5;
  color: #c2410c;
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

.badge-illustrative {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.text-green {
  color: var(--color-status-green-fg);
  font-size: 16px;
}

.text-bold {
  color: var(--color-text-primary);
  font-size: 16px;
}

.text-primary {
  color: var(--color-brand-primary);
  font-size: 16px;
}

.readonly-badge {
  padding: 9px 12px;
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  font-weight: 700;
  font-size: 13px;
  border-radius: var(--radius-sm);
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
  max-width: 620px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.modal-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-error-alert {
  margin: 16px 24px 0;
  padding: 10px 14px;
  background: var(--color-status-red-bg);
  border: 1px solid var(--color-status-red-border);
  color: var(--color-status-red-fg);
  border-radius: var(--radius-sm);
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.modal-form {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.form-group label {
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
  box-shadow: 0 0 0 3px var(--color-brand-tint);
}

.field-help {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.form-row {
  display: flex;
  gap: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

/* Toast popup */
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
