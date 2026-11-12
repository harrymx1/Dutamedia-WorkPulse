<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { apiClient } from '../../api/client';
import { useAuthStore } from '@/stores/auth';
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
  ShieldCheck,
  UserCheck,
  Trash2,
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
  effectiveDate?: string;
  endDate?: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    orgAssignments?: Array<{
      role?: string;
      jobTitle?: string | null;
      division?: { id: string; name: string } | null;
    }>;
  };
}

interface SimpleUser {
  id: string;
  fullName: string;
  email: string;
  jobTitle?: string | null;
  role?: string | null;
  function?: string | null;
}

// State
const loading = ref(false);
const policies = ref<PolicyItem[]>([]);
const auditLogs = ref<AuditLogItem[]>([]);
const policyOwners = ref<PolicyOwner[]>([]);
const availableUsers = ref<SimpleUser[]>([]);
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Modal state
const isModalOpen = ref(false);
const modalSubmitting = ref(false);
const modalError = ref<string | null>(null);

// Policy owner modal state
const isOwnerModalOpen = ref(false);
const ownerModalSubmitting = ref(false);
const ownerModalError = ref<string | null>(null);

const ownerForm = ref({
  policyCategory: 'CHECKIN_TIMING',
  userId: '',
  effectiveDate: '',
});

const policyCategoryOptions = [
  {
    value: 'CHECKIN_TIMING',
    label: 'Jam Kerja & Waktu Komitmen (Check-in Timing)',
    description: 'Jadwal morning check-in, batas on-time 09:00 WIB, dan penguncian formulir cut-off 09:30 WIB.',
  },
  {
    value: 'BLOCKER_SLA',
    label: 'Target Waktu Respon & Penanganan Kendala (Blocker SLA)',
    description: 'Target respon jenjang pertama, batas penanganan eskalasi, dan rute eskalasi kritis pimpinan.',
  },
  {
    value: 'COMPLIANCE_THRESHOLD',
    label: 'Ambang Batas Kepatuhan & Disiplin Kerja (Compliance Threshold)',
    description: 'Batas tugas berlanjut (carry-over), ambang eskalasi pola ketidakpatuhan, dan pembinaan HRGA.',
  },
  {
    value: 'CORRECTION_WINDOW',
    label: 'Jendela Waktu Koreksi Mandiri (Correction Window)',
    description: 'Batas waktu pengajuan sanggahan/koreksi komitmen pagi (24 jam) dan evaluasi sore EOD (48 jam).',
  },
];

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
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  } catch {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }
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

    try {
      const usersRes = await apiClient<any>('/v1/organization/users');
      const uList = usersRes.data || [];
      if (Array.isArray(uList) && uList.length > 0) {
        availableUsers.value = uList;
      }
    } catch {
      try {
        const adminUsersRes = await apiClient<any>('/v1/admin/users?limit=500');
        const raw = adminUsersRes.data?.data || adminUsersRes.data || [];
        if (Array.isArray(raw)) availableUsers.value = raw;
      } catch {}
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat pengaturan kebijakan.', true);
  } finally {
    loading.value = false;
  }
}

const authStore = useAuthStore();

const isSuperAdminOrCeo = computed(() => {
  const r = authStore.user?.role;
  return r === 'CEO_MANAGEMENT' || r === 'SYSTEM_ADMIN';
});

// Kategori di mana pengguna saat ini aktif terdaftar sebagai Pemilik Kebijakan
const userOwnedCategories = computed(() => {
  const currentUserId = authStore.user?.id;
  if (!currentUserId) return [];
  return policyOwners.value
    .filter((o) => o.user?.id === currentUserId)
    .map((o) => o.policyCategory);
});

function getOwnersForCategory(category: string): PolicyOwner[] {
  return policyOwners.value.filter((o) => o.policyCategory === category);
}

// Validasi wewenang perubahan kebijakan (BR-15 & FR-34)
function canEditCategory(cat: string): boolean {
  if (userOwnedCategories.value.includes(cat)) return true;
  // Jika kategori ini belum memiliki satupun penugasan pemilik di sistem, Direksi/Admin dapat mengelola
  const categoryOwners = getOwnersForCategory(cat);
  if (categoryOwners.length === 0 && isSuperAdminOrCeo.value) return true;
  return false;
}

function getCategoryLabel(categoryVal: string): string {
  const found = policyCategoryOptions.find((c) => c.value === categoryVal);
  return found ? found.label : categoryVal;
}

function getInitials(name?: string): string {
  if (!name) return 'PIC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isUserAlreadyOwnerOfCategory(userId: string, category: string): boolean {
  return getOwnersForCategory(category).some((o) => o.user?.id === userId);
}

function getUserSubtext(userId?: string): string {
  if (!userId) return '-';
  const owner = policyOwners.value.find((o) => o.user?.id === userId);
  const org = owner?.user?.orgAssignments?.[0];
  if (org) {
    const roleTitle = org.jobTitle || org.role;
    const divName = org.division?.name;
    return divName ? `${roleTitle} · ${divName}` : `${roleTitle}`;
  }

  const found = availableUsers.value.find((u) => u.id === userId);
  if (found?.jobTitle) {
    return `${found.jobTitle}${found.function ? ` · ${found.function}` : ''}`;
  }
  if (found?.role) {
    return found.role;
  }
  return '-';
}

function openOwnerModal(category?: string) {
  ownerModalError.value = null;
  const initialCategory = category || 'CHECKIN_TIMING';
  
  // Pilih default user yang belum aktif ditugaskan pada kategori ini
  const existingUserIds = getOwnersForCategory(initialCategory).map((o) => o.user?.id);
  const candidateUser = availableUsers.value.find((u) => !existingUserIds.includes(u.id)) || availableUsers.value[0];

  ownerForm.value = {
    policyCategory: initialCategory,
    userId: candidateUser?.id || '',
    effectiveDate: todayStr.value,
  };
  isOwnerModalOpen.value = true;
}

function closeOwnerModal() {
  isOwnerModalOpen.value = false;
  ownerModalError.value = null;
}

async function submitOwnerAssignment() {
  if (!ownerForm.value.userId) {
    ownerModalError.value = 'Silakan pilih pejabat penanggung jawab kebijakan.';
    return;
  }
  if (!ownerForm.value.effectiveDate) {
    ownerModalError.value = 'Silakan tentukan tanggal berlaku efektif.';
    return;
  }

  ownerModalSubmitting.value = true;
  ownerModalError.value = null;
  try {
    await apiClient('/policies/owners', {
      method: 'POST',
      body: JSON.stringify({
        policyCategory: ownerForm.value.policyCategory,
        userId: ownerForm.value.userId,
        effectiveDate: ownerForm.value.effectiveDate,
      }),
    });
    showToast('Penugasan pemilik kebijakan berhasil disimpan.');
    closeOwnerModal();
    await loadData();
  } catch (err: any) {
    ownerModalError.value = err.message || 'Gagal menyimpan penugasan pemilik kebijakan.';
  } finally {
    ownerModalSubmitting.value = false;
  }
}

// State & metode untuk pencabutan penugasan pemilik kebijakan (Revoke)
const ownerToRevoke = ref<PolicyOwner | null>(null);
const isRevokeModalOpen = ref(false);
const revokeModalSubmitting = ref(false);
const revokeModalError = ref<string | null>(null);

function confirmRevokeOwner(owner: PolicyOwner) {
  ownerToRevoke.value = owner;
  revokeModalError.value = null;
  isRevokeModalOpen.value = true;
}

function closeRevokeModal() {
  isRevokeModalOpen.value = false;
  ownerToRevoke.value = null;
  revokeModalError.value = null;
}

async function executeRevokeOwner() {
  if (!ownerToRevoke.value) return;
  revokeModalSubmitting.value = true;
  revokeModalError.value = null;
  try {
    await apiClient(`/policies/owners/${ownerToRevoke.value.id}`, {
      method: 'DELETE',
    });
    showToast(`Wewenang ${ownerToRevoke.value.user?.fullName} untuk kategori ${getCategoryLabel(ownerToRevoke.value.policyCategory)} berhasil dicabut.`);
    closeRevokeModal();
    await loadData();
  } catch (err: any) {
    revokeModalError.value = err.message || 'Gagal mencabut wewenang pemilik kebijakan.';
  } finally {
    revokeModalSubmitting.value = false;
  }
}

function syncFormWithActivePolicy() {
  const timing = policyMap.value.CHECKIN_TIMING?.configurationValues;
  if (timing) {
    formMorningOntime.value = timing.morningOnTimeCutoff || '09:00';
    formMorningCutoff.value = timing.morningLockCutoff || '09:30';
    formEodOntime.value = timing.eodOnTimeCutoff || '17:00';
    formEodCutoff.value = timing.eodLockCutoff || '21:00';
  }

  const sla = policyMap.value.BLOCKER_SLA?.configurationValues;
  if (sla) {
    formSlaL1Hours.value = sla.level1Hours ?? 4;
    formSlaL2Hours.value = sla.level2Hours ?? 8;
    formAutoEscalateHours.value = sla.autoEscalateAfterHours ?? 4;
  }

  const comp = policyMap.value.COMPLIANCE_THRESHOLD?.configurationValues;
  if (comp) {
    formCarryOverAmberDays.value = comp.carryOverAmberDays ?? 3;
    formAllowGreenWithCarryOver.value = comp.allowGreenWithCarryOver ?? true;
  }

  const corr = policyMap.value.CORRECTION_WINDOW?.configurationValues;
  if (corr) {
    formMaxCorrectionDays.value = corr.maxCorrectionDays ?? 7;
  }
}

function openCreateModal(defaultCategory?: string) {
  syncFormWithActivePolicy();
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
  if (e.key === 'Escape') {
    if (isModalOpen.value) closeModal();
    if (isOwnerModalOpen.value) closeOwnerModal();
    if (isRevokeModalOpen.value) closeRevokeModal();
  }
}

async function submitNewVersion() {
  if (formJustification.value.trim().length < 15) {
    modalError.value = 'Alasan perubahan kebijakan minimal 15 karakter untuk kebutuhan jejak audit kepatuhan.';
    return;
  }

  if (formEffectiveDate.value < todayStr.value) {
    modalError.value = 'Tanggal mulai berlaku tidak boleh di masa lampau (Dilarang Backdating / Ubah Surut).';
    return;
  }

  // Penegakan wewenang BR-15 & FR-34 di sisi antarmuka
  if (!canEditCategory(formCategory.value)) {
    modalError.value = `Akses Ditolak: Anda tidak terdaftar sebagai Pemilik Kebijakan aktif untuk kategori "${getCategoryLabel(formCategory.value)}". Sesuai tata kelola BR-15 & FR-34, wewenang penerbitan versi baru hanya dimiliki oleh personil yang tercatat pada tabel Penugasan Pemilik Kebijakan.`;
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

  const activePol = policyMap.value[formCategory.value];
  if (activePol && !activePol.isIllustrative && activePol.configurationValues) {
    const prev = activePol.configurationValues;
    const isSame = Object.keys(configurationValues).every(
      (k) => String(prev[k]) === String(configurationValues[k]),
    );
    if (isSame) {
      modalError.value =
        'Tidak ada perubahan nilai parameter dibandingkan kebijakan yang sedang berlaku saat ini. Silakan ubah minimal satu parameter sebelum menyimpan.';
      modalSubmitting.value = false;
      return;
    }
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

function formatDateDisplay(val?: string | null): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}

function formatTimestampDisplay(val: string): string {
  try {
    const d = new Date(val);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return val;
  }
}

function formatCategoryLabel(cat?: string): string {
  switch (cat) {
    case 'CHECKIN_TIMING':
      return 'Jam Kerja & Cut-Off';
    case 'BLOCKER_SLA':
      return 'Target Waktu Penanganan Kendala';
    case 'COMPLIANCE_THRESHOLD':
      return 'Ambang Batas Carry-Over';
    case 'CORRECTION_WINDOW':
      return 'Jendela Pengajuan Koreksi';
    case 'NOTIFICATION_REMINDER_THRESHOLD':
      return 'Ambang Notifikasi & Pengingat';
    default:
      return cat || 'Umum';
  }
}

function formatAuditChanges(log: AuditLogItem): string {
  const after = log.valueAfter;
  const before = log.valueBefore;
  if (!after) return 'Versi Baru Diterapkan';

  if (log.actionCode === 'POLICY_OWNER_ASSIGNED') {
    const targetUser = availableUsers.value.find((u) => u.id === after.userId);
    const userName = targetUser?.fullName || after.userId || 'Pejabat Terpilih';
    return `Penugasan Pemilik: ${userName} (${formatCategoryLabel(after.category || log.category)})`;
  }

  if (log.category === 'CHECKIN_TIMING') {
    const parts: string[] = [];
    if (after.morningLockCutoff) {
      if (before?.morningLockCutoff && before.morningLockCutoff !== after.morningLockCutoff) {
        parts.push(`Cut-Off Pagi: ${before.morningLockCutoff} → ${after.morningLockCutoff} WIB`);
      } else {
        parts.push(`Cut-Off Pagi: ${after.morningLockCutoff} WIB`);
      }
    }
    if (after.morningOnTimeCutoff) {
      if (before?.morningOnTimeCutoff && before.morningOnTimeCutoff !== after.morningOnTimeCutoff) {
        parts.push(`On-Time Pagi: ${before.morningOnTimeCutoff} → ${after.morningOnTimeCutoff} WIB`);
      } else {
        parts.push(`On-Time Pagi: ${after.morningOnTimeCutoff} WIB`);
      }
    }
    if (after.eodLockCutoff) {
      if (before?.eodLockCutoff && before.eodLockCutoff !== after.eodLockCutoff) {
        parts.push(`Cut-Off EOD: ${before.eodLockCutoff} → ${after.eodLockCutoff} WIB`);
      } else {
        parts.push(`Cut-Off EOD: ${after.eodLockCutoff} WIB`);
      }
    }
    if (after.eodOnTimeCutoff) {
      if (before?.eodOnTimeCutoff && before.eodOnTimeCutoff !== after.eodOnTimeCutoff) {
        parts.push(`On-Time EOD: ${before.eodOnTimeCutoff} → ${after.eodOnTimeCutoff} WIB`);
      }
    }
    return parts.join(' · ') || 'Parameter Cut-Off Diperbarui';
  }

  if (log.category === 'BLOCKER_SLA') {
    const parts: string[] = [];
    if (after.level1Hours !== undefined) {
      if (before?.level1Hours !== undefined && before.level1Hours !== after.level1Hours) {
        parts.push(`Respon Jenjang 1: ${before.level1Hours}j → ${after.level1Hours}j`);
      } else {
        parts.push(`Respon Jenjang 1: ${after.level1Hours}j Kerja`);
      }
    }
    if (after.level2Hours !== undefined) {
      if (before?.level2Hours !== undefined && before.level2Hours !== after.level2Hours) {
        parts.push(`Penanganan Jenjang Lanjutan: ${before.level2Hours}j → ${after.level2Hours}j`);
      } else {
        parts.push(`Penanganan Jenjang Lanjutan: ${after.level2Hours}j Kerja`);
      }
    }
    if (after.autoEscalateAfterHours !== undefined) {
      if (before?.autoEscalateAfterHours !== undefined && before.autoEscalateAfterHours !== after.autoEscalateAfterHours) {
        parts.push(`Batas Naik Jenjang: ${before.autoEscalateAfterHours}j → ${after.autoEscalateAfterHours}j`);
      } else {
        parts.push(`Batas Naik Jenjang: ${after.autoEscalateAfterHours}j`);
      }
    }
    return parts.join(' · ') || 'Target Waktu Kendala Diperbarui';
  }

  if (log.category === 'COMPLIANCE_THRESHOLD') {
    const parts: string[] = [];
    if (after.carryOverAmberDays !== undefined) {
      if (before?.carryOverAmberDays !== undefined && before.carryOverAmberDays !== after.carryOverAmberDays) {
        parts.push(`Ambang Carry-Over: ${before.carryOverAmberDays} → ${after.carryOverAmberDays} Hari`);
      } else {
        parts.push(`Ambang Carry-Over: ${after.carryOverAmberDays} Hari`);
      }
    }
    return parts.join(' · ') || 'Ambang Batas Kepatuhan Diperbarui';
  }

  if (log.category === 'CORRECTION_WINDOW') {
    return `Maks Koreksi: ${after.maxCorrectionDays ?? 7} Hari`;
  }

  return 'Versi Kebijakan Diterapkan';
}

function exportAuditCSV() {
  if (auditLogs.value.length === 0) {
    showToast('Tidak ada jejak audit untuk diunduh.', true);
    return;
  }

  const headers = ['ID', 'Waktu', 'Pengubah', 'Email', 'Kategori', 'Tanggal Efektif', 'Alasan Perubahan', 'Perubahan Parameter'];
  const rows = auditLogs.value.map((log) => [
    log.id,
    new Date(log.timestamp).toLocaleString('id-ID'),
    log.actor?.fullName || 'System',
    log.actor?.email || '-',
    formatCategoryLabel(log.category),
    formatDateDisplay(log.effectiveDate),
    `"${(log.changeJustification || '').replace(/"/g, '""')}"`,
    `"${formatAuditChanges(log).replace(/"/g, '""')}"`,
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
    <TopBar breadcrumb="Administration / Pengaturan Kebijakan" />

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
            Konfigurasi parameter operasional organisasi: jam kerja dan batas penguncian formulir (cut-off), target waktu penanganan kendala berjenjang, ambang batas tugas berlanjut (carry-over), kebijakan hari bebas komitmen, serta penegakan tanggal berlaku efektif tanpa perubahan surut.
          </p>
        </div>
        <div class="header-actions">
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
            <span class="badge badge-info">Komitmen Pagi</span>
          </div>
          <div class="metric-value">
            {{ policyMap.CHECKIN_TIMING?.configurationValues?.morningLockCutoff || '09:30' }} WIB
          </div>
          <div class="metric-sub">
            On-Time Deadline: {{ policyMap.CHECKIN_TIMING?.configurationValues?.morningOnTimeCutoff || '09:00' }} WIB
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">EOD Cut-Off</span>
            <span class="badge badge-info">Evaluasi Sore</span>
          </div>
          <div class="metric-value">
            {{ policyMap.CHECKIN_TIMING?.configurationValues?.eodLockCutoff || '21:00' }} WIB
          </div>
          <div class="metric-sub">
            On-Time Deadline: {{ policyMap.CHECKIN_TIMING?.configurationValues?.eodOnTimeCutoff || '17:00' }} WIB
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">Target Waktu Penanganan Kendala</span>
            <span class="badge badge-active">Acuan Respon</span>
          </div>
          <div class="metric-value">
            {{ policyMap.BLOCKER_SLA?.configurationValues?.level1Hours || 4 }}j / {{ policyMap.BLOCKER_SLA?.configurationValues?.level2Hours || 8 }}j Kerja
          </div>
          <div class="metric-sub">
            Batas naik ke atasan berikutnya: {{ policyMap.BLOCKER_SLA?.configurationValues?.autoEscalateAfterHours || 4 }} jam tanpa ditanggapi
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-label">Versi Audit Tercatat</span>
            <span class="badge badge-neutral">Jejak Audit</span>
          </div>
          <div class="metric-value">{{ auditLogs.length }} Versi</div>
          <div class="metric-sub">Riwayat versi tersimpan aman tanpa overwrite</div>
        </article>
      </section>

      <!-- Architecture Principle Callout -->
      <div class="callout">
        <Info class="callout-icon" :size="20" />
        <div class="callout-content">
          <div class="callout-title">Prinsip Tata Kelola Kebijakan Organisasi</div>
          <p>
            Perubahan nilai kebijakan tidak pernah menimpa (overwrite) rekaman historis secara langsung. Setiap modifikasi parameter akan menerbitkan <strong>Versi Kebijakan Baru</strong> dengan tanggal berlaku efektif mulai hari ini atau masa depan. Penegakan status penguncian formulir otomatis dijalankan secara konsisten oleh sistem guna menjaga integritas dan akuntabilitas kerja.
          </p>
        </div>
      </div>

      <!-- SECTION 1: Jam Kerja & Batas Pengiriman -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <Clock :size="18" />
              <span>1. Jam Kerja, Batas Pengiriman & Penguncian Cut-Off</span>
            </h2>
            <p>Menetapkan jadwal kerja operasional, batas on-time check-in, dan jendela cut-off penguncian formulir otomatis.</p>
          </div>
          <div class="head-badges">
            <span v-if="policyMap.CHECKIN_TIMING?.isIllustrative" class="badge badge-illustrative">
              Nilai Awal
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
                <span class="status-note">Pengiriman sebelum jam deadline dihitung tepat waktu</span>
              </div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Morning Cut-Off & Penguncian Formulir</span>
                <span class="badge badge-cutoff">Cut-Off</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.CHECKIN_TIMING?.configurationValues?.morningLockCutoff || '09:30' }}</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Batas akhir pengisian komitmen pagi. Pengiriman antara deadline & cutoff berstatus LATE. Melewati batas ini form <strong>LOCKED</strong>.</div>
              <div class="param-status-rule">
                <span class="badge badge-late">Late</span>
                <span class="badge badge-neutral">Locked</span>
                <span class="status-note">Setelah cutoff otomatis tercatat No Submission</span>
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
                <span class="param-title">EOD Cut-Off & Penguncian Malam Hari</span>
                <span class="badge badge-cutoff">Cut-Off</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.CHECKIN_TIMING?.configurationValues?.eodLockCutoff || '21:00' }}</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Batas toleransi evaluasi kerja harian. Melewati batas cut-off sore, hari dinyatakan selesai dan form EOD <strong>LOCKED</strong>.</div>
              <div class="param-status-rule">
                <span class="badge badge-neutral">Locked</span>
                <span class="status-note">Koreksi pasca-cut-off hanya lewat alur koreksi resmi</span>
              </div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Prinsip Penguncian Formulir:</strong> Status Locked mencegah manipulasi pengisian retroaktif di luar jam kerja. Anggota tim yang melewatkan jam cut-off tidak dapat lagi mengisi form secara reguler; sistem otomatis mencatat status <code>No Submission</code> pada hari kerja tersebut dan memerlukan pengajuan <em>Correction Request</em> bertahap.
          </div>
        </div>
      </section>

      <!-- SECTION 2: Target Waktu Penanganan Kendala -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <AlertTriangle :size="18" />
              <span>2. Target Waktu Respon &amp; Eskalasi Berjenjang Kendala</span>
            </h2>
            <p>Aturan batas waktu bagi penanggung jawab untuk menanggapi kendala di setiap jenjang wewenang sebelum dinaikkan ke pimpinan di atasnya.</p>
          </div>
          <div class="head-badges">
            <span v-if="policyMap.BLOCKER_SLA?.isIllustrative" class="badge badge-illustrative">
              Nilai Awal
            </span>
            <span class="badge badge-active">Sedang Berlaku</span>
          </div>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Batas Respon Jenjang Pertama</span>
                <span class="badge badge-active">Penanggung Jawab Awal</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.BLOCKER_SLA?.configurationValues?.level1Hours || 4 }}</span>
                <span class="param-unit">Jam Kerja</span>
              </div>
              <div class="param-desc">Batas waktu bagi penanggung jawab pertama (Atasan Langsung, Ketua Proyek, atau PIC terkait) untuk menanggapi laporan kendala dalam {{ policyMap.BLOCKER_SLA?.configurationValues?.level1Hours || 4 }} jam kerja dan memulai penanganan awal.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Batas Penanganan Jenjang Lanjutan</span>
                <span class="badge badge-warning">Pimpinan di Atasnya</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.BLOCKER_SLA?.configurationValues?.level2Hours || 8 }}</span>
                <span class="param-unit">Jam Kerja</span>
              </div>
              <div class="param-desc">Batas waktu penanganan setelah kendala naik ke pimpinan satu tingkat di atasnya (Kepala Divisi, Pengarah Proyek, atau Direksi) selama {{ policyMap.BLOCKER_SLA?.configurationValues?.level2Hours || 8 }} jam kerja. Jika melewati batas ini belum tuntas, kendala naik lagi hingga tingkat Direksi dan berstatus Lewat Batas Waktu.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Batas Waktu Naik ke Atasan Berikutnya</span>
                <span class="badge badge-danger">Naik Otomatis</span>
              </div>
              <div class="param-value-box">
                <span class="param-value">{{ policyMap.BLOCKER_SLA?.configurationValues?.autoEscalateAfterHours || 4 }}</span>
                <span class="param-unit">jam kerja tanpa ditanggapi</span>
              </div>
              <div class="param-desc">Jika kendala belum ditanggapi sama sekali selama {{ policyMap.BLOCKER_SLA?.configurationValues?.autoEscalateAfterHours || 4 }} jam kerja, sistem meneruskan kendala satu tingkat ke atasan di atasnya secara berjenjang.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Jam Kerja Perhitungan Waktu</span>
                <span class="badge badge-info">Senin - Jumat</span>
              </div>
              <div class="param-value-box">
                <span class="param-value compact">09:00 - 17:00</span>
                <span class="param-unit">WIB</span>
              </div>
              <div class="param-desc">Perhitungan waktu berjalan pada jam kerja aktif Senin–Jumat pukul 09:00–17:00 WIB, serta dijeda pada malam hari, akhir pekan, dan hari libur nasional resmi.</div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Panduan Alur Eskalasi Berjenjang &amp; Perbedaannya dengan Tingkat Keparahan (Severity):</strong> (1) <strong>Rantai Wewenang Dinamis:</strong> Jenjang mengikuti posisi pelapor secara otomatis (N+1 → N+2 → Direksi); jika yang melapor adalah Supervisor atau Kepala Divisi, maka jenjang pertamanya langsung atasan di atasnya hingga bermuara di Direktur/CEO, dan jika penanggung jawab sedang cuti/memiliki Reviewer Sementara aktif, kendala otomatis dialihkan. (2) <strong>Berdampingan dengan Severity Kendala:</strong> Parameter di atas mengatur batas waktu tanggap di setiap jenjang jabatan, sedangkan target waktu penyelesaian masalah secara keseluruhan mengikuti tingkat keparahan kendala saat dilaporkan (<em>Critical</em> 2 jam, <em>High</em> 4 jam, <em>Medium</em> 8 jam, <em>Low</em> 24 jam). Khusus kendala <em>Critical</em>, pemberitahuan eskalasi darurat dikirim seketika ke pimpinan tanpa menunggu batas waktu normal.
          </div>
        </div>
      </section>

      <!-- SECTION 3: Carry-Over Threshold -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <Layers :size="18" />
              <span>3. Ambang Batas Carry-Over Berulang & Larangan Kunci GREEN</span>
            </h2>
            <p>Aturan deteksi tugas berlanjut tanpa menghukum atau mengunci hak refleksi mandiri karyawan.</p>
          </div>
          <div class="head-badges">
            <span v-if="policyMap.COMPLIANCE_THRESHOLD?.isIllustrative" class="badge badge-illustrative">
              Nilai Awal
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
                <span class="param-title">Proteksi Hak Opsi GREEN</span>
                <span class="badge badge-active">Hak Karyawan</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-green">Bebas Dipilih (Tidak Terkunci)</span>
              </div>
              <div class="param-desc">Opsi GREEN pada Morning maupun EOD dapat dipilih secara bebas oleh karyawan dengan konfirmasi refleksi mandiri.</div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Prinsip Kepatuhan Transparan:</strong> Sistem WorkPulse menolak pola antarmuka punitif. Deteksi carry-over berulang dihadirkan melalui penanda tugas berlanjut dan dialog refleksi persuasif, guna membangun transparansi tanpa merampas hak anggota tim.
          </div>
        </div>
      </section>

      <!-- SECTION 4: Zero-Commitment Policy -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <CheckCircle2 :size="18" />
              <span>4. Kebijakan Hari Bebas Komitmen (Zero-Commitment)</span>
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
                <span class="param-value text-bold">Wajib Mengisi Alasan</span>
              </div>
              <div class="param-desc">Jika 0 komitmen dipilih, kolom alasan wajib diisi (misal: agenda pelatihan seharian). Status otomatis menjadi <code>Bebas Komitmen (Disetujui)</code>.</div>
            </div>
          </div>
          <div class="policy-guidance">
            <strong>Makna Status Bebas Komitmen:</strong> Status ini merupakan fakta sah non-operasional dan secara transparan dicatat tersendiri (bukan status GREEN dan bukan No Submission).
          </div>
        </div>
      </section>

      <!-- SECTION 5: Effective Date & Anti-Backdating -->
      <section class="policy-section">
        <div class="policy-head">
          <div class="policy-head-info">
            <h2>
              <ShieldAlert :size="18" />
              <span>5. Penegakan Tanggal Efektif & Larangan Ubah Surut (Anti-Backdating)</span>
            </h2>
            <p>Aturan integritas data legal agar histori performa masa lampau tidak dapat diubah surut.</p>
          </div>
          <span class="badge badge-active">Sedang Berlaku</span>
        </div>
        <div class="policy-body">
          <div class="params-grid">
            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Validasi Tanggal Berlaku Efektif</span>
                <span class="badge badge-info">Integritas Data</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-green">Hari Ini / Masa Depan</span>
              </div>
              <div class="param-desc">Tanggal mulai berlaku kebijakan baru WAJIB hari ini atau masa depan. Input tanggal lampau otomatis ditolak sistem.</div>
            </div>

            <div class="param-item">
              <div class="param-item-header">
                <span class="param-title">Alasan Perubahan Kebijakan</span>
                <span class="badge badge-info">Wajib Diisi</span>
              </div>
              <div class="param-value-box">
                <span class="param-value text-primary">Justifikasi Bisnis Wajib</span>
              </div>
              <div class="param-desc">Setiap penerbitan versi baru wajib menyertakan minimal 15 karakter alasan bisnis untuk kebutuhan jejak audit ISO/HRGA.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Penugasan Pemilik Kebijakan (Policy Owners) -->
      <section class="policy-section policy-owners-section" aria-label="Penugasan Pemilik Kebijakan (Policy Owners)">
        <div class="policy-head">
          <div class="policy-head-info">
            <div class="policy-title-row">
              <ShieldCheck :size="20" class="policy-icon" />
              <h2>Penugasan Pemilik Kebijakan (Policy Owners)</h2>
              <span class="badge badge-active">Tata Kelola &amp; Akuntabilitas</span>
            </div>
            <p class="policy-desc">
              Penetapan pejabat penanggung jawab resmi (PIC) untuk setiap kategori kebijakan operasional perusahaan guna memastikan kepemilikan dan akuntabilitas tata kelola.
            </p>
          </div>
          <div class="policy-head-actions">
            <button class="btn btn-primary" type="button" @click="openOwnerModal()">
              <UserCheck :size="16" />
              <span>Tetapkan Pemilik</span>
            </button>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 28%;">Kategori Kebijakan</th>
                <th style="width: 54%;">Pejabat Penanggung Jawab Aktif (Multi-Owner PIC)</th>
                <th style="width: 18%; text-align: right;">Aksi Tata Kelola</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in policyCategoryOptions" :key="cat.value">
                <td style="vertical-align: top;">
                  <strong>{{ cat.label }}</strong>
                  <div class="param-desc">{{ cat.description }}</div>
                  <div class="category-owner-count mt-2">
                    <span v-if="getOwnersForCategory(cat.value).length > 0" class="badge badge-active badge-xs">
                      {{ getOwnersForCategory(cat.value).length }} Pemilik Aktif
                    </span>
                    <span v-else class="badge badge-warning badge-xs">
                      Belum Ada Pemilik
                    </span>
                  </div>
                </td>
                <td>
                  <div v-if="getOwnersForCategory(cat.value).length > 0" class="owner-chips-grid">
                    <div
                      v-for="owner in getOwnersForCategory(cat.value)"
                      :key="owner.id"
                      class="owner-chip-card"
                    >
                      <div class="owner-chip-avatar">
                        <span class="avatar-text">{{ getInitials(owner.user?.fullName) }}</span>
                      </div>
                      <div class="owner-chip-body">
                        <div class="owner-chip-top">
                          <span class="owner-chip-name">{{ owner.user?.fullName }}</span>
                          <span class="badge badge-active badge-xs">Aktif</span>
                        </div>
                        <div class="owner-chip-email">{{ owner.user?.email }}</div>
                        <div class="owner-chip-role">
                          {{ getUserSubtext(owner.user?.id) }}
                        </div>
                        <div class="owner-chip-date">
                          Mulai: {{ formatDateDisplay(owner.effectiveDate) }}
                        </div>
                      </div>
                      <div class="owner-chip-action">
                        <button
                          class="btn-revoke-owner"
                          type="button"
                          :title="`Cabut wewenang ${owner.user?.fullName}`"
                          @click="confirmRevokeOwner(owner)"
                        >
                          <Trash2 :size="13" />
                          <span>Cabut</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-owners-box">
                    <span class="text-muted">Belum ada pejabat penanggung jawab ditetapkan untuk kategori ini.</span>
                  </div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <button
                    class="btn btn-secondary btn-sm"
                    type="button"
                    @click="openOwnerModal(cat.value)"
                  >
                    <Plus :size="14" />
                    <span>Tambah Pemilik</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
                <th>Perubahan Parameter</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="auditLogs.length === 0">
                <td colspan="6" class="text-center empty-cell">
                  Belum ada jejak audit perubahan kebijakan yang tercatat.
                </td>
              </tr>
              <tr v-for="log in auditLogs" :key="log.id">
                <td class="mono-text">{{ formatTimestampDisplay(log.timestamp) }}</td>
                <td>
                  <span class="badge badge-info">{{ formatCategoryLabel(log.category) }}</span>
                </td>
                <td class="mono-text">{{ formatDateDisplay(log.effectiveDate) }}</td>
                <td>
                  <div class="user-meta">
                    <span class="user-name">{{ log.actor?.fullName || 'System' }}</span>
                    <span class="user-email">{{ log.actor?.email || '' }}</span>
                  </div>
                </td>
                <td class="rationale-cell">{{ log.changeJustification || '-' }}</td>
                <td class="changes-cell">
                  <span class="change-detail-text">{{ formatAuditChanges(log) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Modal Buat Versi Kebijakan Baru -->
    <div
      v-if="isModalOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      @click.self="closeModal"
    >
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 id="modalTitle">Buat Versi Kebijakan Baru</h3>
            <p class="modal-subtitle">Nilai lama akan diarsipkan otomatis sebagai riwayat audit tanpa ditimpa (Versioned Audit Trail).</p>
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
            <select id="select-cat" v-model="formCategory" @change="syncFormWithActivePolicy" class="input-control" required>
              <option value="CHECKIN_TIMING">
                Jam Kerja &amp; Batas Pengiriman (Cut-Off) {{ canEditCategory('CHECKIN_TIMING') ? '— [Wewenang Anda Aktif]' : '— [Terkunci: Bukan Pemilik]' }}
              </option>
              <option value="BLOCKER_SLA">
                Target Waktu Penanganan Kendala {{ canEditCategory('BLOCKER_SLA') ? '— [Wewenang Anda Aktif]' : '— [Terkunci: Bukan Pemilik]' }}
              </option>
              <option value="COMPLIANCE_THRESHOLD">
                Ambang Batas Carry-Over Berulang {{ canEditCategory('COMPLIANCE_THRESHOLD') ? '— [Wewenang Anda Aktif]' : '— [Terkunci: Bukan Pemilik]' }}
              </option>
              <option value="CORRECTION_WINDOW">
                Jendela Pengajuan Koreksi {{ canEditCategory('CORRECTION_WINDOW') ? '— [Wewenang Anda Aktif]' : '— [Terkunci: Bukan Pemilik]' }}
              </option>
              <option value="NOTIFICATION_REMINDER_THRESHOLD">
                Ambang Notifikasi &amp; Pengingat {{ canEditCategory('NOTIFICATION_REMINDER_THRESHOLD') ? '— [Wewenang Anda Aktif]' : '— [Terkunci: Bukan Pemilik]' }}
              </option>
            </select>
            <div v-if="!canEditCategory(formCategory)" class="category-wewenang-alert mt-2">
              <AlertTriangle :size="16" />
              <span>Perhatian (BR-15 &amp; FR-34): Anda tidak terdaftar sebagai Pemilik Kebijakan aktif untuk kategori ini. Wewenang perubahan hanya dimiliki oleh personil yang tercatat pada tabel Penugasan Pemilik Kebijakan.</span>
            </div>
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
              <label for="input-sla-l1">Batas Respon Jenjang Pertama (Jam Kerja) *</label>
              <input id="input-sla-l1" v-model="formSlaL1Hours" type="number" min="1" max="24" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-sla-l2">Batas Penanganan Jenjang Lanjutan (Jam Kerja) *</label>
              <input id="input-sla-l2" v-model="formSlaL2Hours" type="number" min="1" max="48" class="input-control" required />
            </div>
            <div class="form-group">
              <label for="input-sla-auto">Batas Waktu Naik ke Atasan Berikutnya (Jam Kerja) *</label>
              <input id="input-sla-auto" v-model="formAutoEscalateHours" type="number" min="1" max="24" class="input-control" required />
            </div>
          </div>

          <div v-else-if="formCategory === 'COMPLIANCE_THRESHOLD'" class="form-row">
            <div class="form-group">
              <label for="input-carryover-days">Ambang Saran Amber Carry-Over (Hari) *</label>
              <input id="input-carryover-days" v-model="formCarryOverAmberDays" type="number" min="1" max="10" class="input-control" required />
            </div>
            <div class="form-group">
              <label>Proteksi Hak Hijau</label>
              <div class="readonly-badge">Bebas Dipilih (Tidak Terkunci)</div>
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
              <span class="field-help">Harus hari ini atau masa depan (Dilarang Backdating / Ubah Surut).</span>
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

    <!-- Modal Tetapkan Pemilik Kebijakan (Policy Owner Assignment) -->
    <div
      v-if="isOwnerModalOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ownerModalTitle"
      @click.self="closeOwnerModal"
    >
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <h3 id="ownerModalTitle">Tetapkan Pemilik Kebijakan (Policy Owner)</h3>
            <p class="modal-subtitle">Tunjuk pejabat penanggung jawab resmi yang berwenang atas tata kelola dan evaluasi kategori kebijakan ini.</p>
          </div>
          <button class="icon-btn" type="button" @click="closeOwnerModal" aria-label="Tutup dialog">
            <X :size="20" />
          </button>
        </div>

        <div v-if="ownerModalError" class="modal-error-alert" role="alert">
          <AlertCircle :size="16" />
          <span>{{ ownerModalError }}</span>
        </div>

        <form @submit.prevent="submitOwnerAssignment" class="modal-form">
          <div class="form-group">
            <label for="owner-cat">Kategori Kebijakan *</label>
            <select id="owner-cat" v-model="ownerForm.policyCategory" class="input-control" required>
              <option v-for="cat in policyCategoryOptions" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="owner-user">Pejabat Penanggung Jawab (Pemilik Kebijakan) *</label>
            <select id="owner-user" v-model="ownerForm.userId" class="input-control" required>
              <option value="" disabled>-- Pilih Pejabat / Staf Penanggung Jawab --</option>
              <option
                v-for="u in availableUsers"
                :key="u.id"
                :value="u.id"
                :disabled="isUserAlreadyOwnerOfCategory(u.id, ownerForm.policyCategory)"
              >
                {{ u.fullName }} — {{ u.jobTitle || u.role || 'Staf' }} ({{ u.email }})
                {{ isUserAlreadyOwnerOfCategory(u.id, ownerForm.policyCategory) ? '— [Sudah Aktif Ditugaskan]' : '' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="owner-effective">Mulai Berlaku Efektif *</label>
            <input
              id="owner-effective"
              v-model="ownerForm.effectiveDate"
              type="date"
              class="input-control"
              :min="todayStr"
              required
            />
            <small class="helper-text">
              Penetapan penanggung jawab berlaku efektif mulai tanggal yang ditentukan dan dicatat dalam Jejak Audit.
            </small>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" type="button" @click="closeOwnerModal" :disabled="ownerModalSubmitting">
              Batal
            </button>
            <button class="btn btn-primary" type="submit" :disabled="ownerModalSubmitting">
              <span>{{ ownerModalSubmitting ? 'Menyimpan...' : 'Simpan Penugasan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Cabut Wewenang Pemilik Kebijakan (Revoke) -->
    <div
      v-if="isRevokeModalOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revokeModalTitle"
      @click.self="closeRevokeModal"
    >
      <div class="modal-box modal-box-sm">
        <div class="modal-header">
          <div class="modal-title-with-icon">
            <AlertTriangle :size="20" class="text-danger" />
            <h3 id="revokeModalTitle">Cabut Wewenang Pemilik Kebijakan</h3>
          </div>
          <button class="icon-btn" type="button" @click="closeRevokeModal" aria-label="Tutup dialog">
            <X :size="20" />
          </button>
        </div>

        <div v-if="revokeModalError" class="modal-error-alert" role="alert">
          <AlertCircle :size="16" />
          <span>{{ revokeModalError }}</span>
        </div>

        <div class="modal-body-content">
          <p class="modal-lead-text">
            Apakah Anda yakin ingin mencabut wewenang tata kelola kebijakan dari personil berikut?
          </p>

          <div class="revoke-target-card">
            <div class="revoke-target-name">{{ ownerToRevoke?.user?.fullName }}</div>
            <div class="revoke-target-email">{{ ownerToRevoke?.user?.email }}</div>
            <div class="revoke-target-cat">
              Kategori Kebijakan: <strong>{{ getCategoryLabel(ownerToRevoke?.policyCategory || '') }}</strong>
            </div>
          </div>

          <p class="helper-text mt-3">
            Pencabutan ini akan menonaktifkan hak akses personil tersebut untuk menerbitkan versi baru pada kategori kebijakan ini (BR-15 &amp; FR-34). Tindakan ini akan dicatat dalam Jejak Audit resmi.
          </p>

          <div class="modal-actions mt-4">
            <button class="btn btn-secondary" type="button" @click="closeRevokeModal" :disabled="revokeModalSubmitting">
              Batal
            </button>
            <button class="btn btn-danger" type="button" @click="executeRevokeOwner" :disabled="revokeModalSubmitting">
              <span>{{ revokeModalSubmitting ? 'Mencabut...' : 'Ya, Cabut Wewenang' }}</span>
            </button>
          </div>
        </div>
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

.param-value.compact {
  font-size: 19px;
  white-space: nowrap;
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

.changes-cell {
  max-width: 340px;
}

.change-detail-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-primary);
  background: var(--color-surface-subtle);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  line-height: 1.45;
  border: 1px solid var(--color-border-subtle);
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
  max-width: 640px;
  width: 100%;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
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
  margin: 12px 24px 0;
  padding: 10px 14px;
  background: var(--color-status-red-bg);
  border: 1px solid var(--color-status-red-border);
  color: var(--color-status-red-fg);
  border-radius: var(--radius-sm);
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  flex-shrink: 0;
}

.modal-form {
  padding: 18px 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 12.5px;
  gap: 6px;
}

.policy-icon {
  color: var(--color-brand-primary);
}

.helper-text {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.text-muted {
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 12px;
}

/* Policy Owners Multi-PIC Styling */
.owner-chips-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.owner-chip-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  transition: all 0.15s ease;
}

.owner-chip-card:hover {
  border-color: var(--color-border-default, #cbd5e1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.owner-chip-avatar .avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-brand-subtle, #ecfdf5);
  color: var(--color-brand-primary, #047857);
  font-weight: 700;
  font-size: 11px;
}

.owner-chip-body {
  flex: 1;
  min-width: 0;
}

.owner-chip-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-chip-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.owner-chip-email {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.owner-chip-role {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 1px;
}

.owner-chip-date {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.owner-chip-action {
  flex-shrink: 0;
}

.btn-revoke-owner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: var(--radius-xs, 4px);
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-revoke-owner:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: 1px solid #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.badge-xs {
  font-size: 10px;
  padding: 1px 6px;
}

.modal-box-sm {
  max-width: 480px;
}

.modal-title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-body-content {
  padding: 18px 24px 22px;
  display: flex;
  flex-direction: column;
}

.modal-lead-text {
  font-size: 13.5px;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.revoke-target-card {
  background: var(--color-surface-subtle, #f8fafc);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-top: 12px;
}

.revoke-target-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-text-primary);
}

.revoke-target-email {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.revoke-target-cat {
  font-size: 12px;
  color: var(--color-text-primary);
  margin-top: 6px;
}

.category-wewenang-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #b45309;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.4;
}

.text-danger {
  color: #dc2626;
}

.empty-owners-box {
  padding: 12px;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border-subtle);
}
</style>
