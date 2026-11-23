<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../api/client';
import { normalizeCanonicalFunction } from '../../config/prompts';
import { getUserInitials } from '../../utils/initials';
import { formatDateTimeWib, formatDateWib, getTodayIsoWib } from '../../utils/dateTime';
import {
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_FILTER_OPTIONS,
  formatEmploymentStatusLabel,
  isInternStatus,
  type EmploymentStatusCode,
} from '../../utils/employmentStatus';
import {
  UserPlus,
  Search,
  RotateCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Copy,
  X,
  Info,
  ArrowRight,
  Lock,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<{ mode?: 'users' | 'invitations' }>(), {
  mode: 'users',
});

const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE';
  currentRole: string;
  currentFunction: string | null;
  currentJobTitle: string | null;
  directManagerName?: string | null;
  effectiveDate?: string | null;
  employmentStatus?: EmploymentStatusCode;
  assignmentEndDate?: string | null;
  isInternExpired?: boolean;
  createdAt: string;
  invitation?: {
    id: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  } | null;
}

interface UserDirectorySummary {
  total: number;
  active: number;
  invited: number;
  invitedPending: number;
  invitedExpired: number;
  invitedRevoked: number;
  inactive: number;
  needsAttention: number;
}

type LifecycleActionType = 'resend' | 'revoke' | 'deactivate' | 'reactivate';

const CANONICAL_ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Karyawan' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'HEAD', label: 'Kepala Divisi' },
  { value: 'PROJECT_MANAGER', label: 'Manajer Proyek' },
  { value: 'HRGA', label: 'HRGA' },
  { value: 'CEO_MANAGEMENT', label: 'Direktur / CEO' },
  { value: 'SYSTEM_ADMIN', label: 'Admin Sistem' },
] as const;

const CREATE_ROLE_OPTIONS = CANONICAL_ROLE_OPTIONS.filter(
  (r) => r.value !== 'SYSTEM_ADMIN',
);

const CANONICAL_FUNCTION_OPTIONS = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Quality', label: 'Quality' },
  { value: 'OperationsInfrastructure', label: 'Operations & Infrastructure' },
  { value: 'RnD', label: 'R&D' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'BusinessDevelopment', label: 'Business Development' },
  { value: 'SalesEnablementPresales', label: 'Sales Enablement & Presales' },
  { value: 'Finance', label: 'Finance' },
  { value: 'HRGA', label: 'HRGA' },
  { value: 'Management', label: 'Management' },
] as const;

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Karyawan',
  SUPERVISOR: 'Supervisor',
  HEAD: 'Kepala Divisi',
  PROJECT_MANAGER: 'Manajer Proyek',
  HRGA: 'HRGA',
  CEO_MANAGEMENT: 'Direktur / CEO',
  SYSTEM_ADMIN: 'Admin Sistem',
};

const authStore = useAuthStore();

const isInvitationsMode = computed(() => props.mode === 'invitations');
const pageBreadcrumb = computed(() =>
  isInvitationsMode.value
    ? 'Administration / Undangan Karyawan'
    : 'Administration / Kelola Pengguna',
);
const pageTitle = computed(() =>
  isInvitationsMode.value
    ? 'Undangan Karyawan & Aktivasi Akun'
    : 'Kelola Pengguna & Undangan',
);
const pageSubtitle = computed(() =>
  isInvitationsMode.value
    ? 'Kelola tautan aktivasi sekali pakai 72 jam, kirim ulang undangan kedaluwarsa, atau cabut undangan yang dibatalkan.'
    : 'Terbitkan undangan aktivasi 72 jam, kelola status akses akun, dan pantau penugasan karyawan.',
);

const defaultStatusForMode = () => (props.mode === 'invitations' ? 'INVITED' : '');

const users = ref<AdminUserRow[]>([]);
const summary = ref<UserDirectorySummary>({
  total: 0,
  active: 0,
  invited: 0,
  invitedPending: 0,
  invitedExpired: 0,
  invitedRevoked: 0,
  inactive: 0,
  needsAttention: 0,
});
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref(defaultStatusForMode());
const functionFilter = ref('');
const roleFilter = ref('');
const employmentStatusFilter = ref<'ALL' | EmploymentStatusCode>('ALL');
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let errorTimer: ReturnType<typeof setTimeout> | null = null;

// Modal 1: Undang Pengguna Baru & Pratinjau Tautan Aktivasi
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const modalError = ref<string | null>(null);
const createdToken = ref<string | null>(null);
const createdTargetName = ref('');
const createdTargetEmail = ref('');
const createdExpiresAt = ref<string | null>(null);
const tokenModalMode = ref<'create' | 'resend'>('create');

const form = ref({
  fullName: '',
  email: '',
  role: 'EMPLOYEE',
  function: 'Engineering',
  jobTitle: '',
  employmentStatus: 'PERMANENT' as EmploymentStatusCode,
  endDate: '',
});

// Modal 2: Konfirmasi Tindakan Siklus Akun & Undangan
const confirmModal = ref<{
  open: boolean;
  action: LifecycleActionType;
  user: AdminUserRow | null;
  reason: string;
  submitting: boolean;
  error: string | null;
}>({
  open: false,
  action: 'deactivate',
  user: null,
  reason: '',
  submitting: false,
  error: null,
});

function formatRoleLabel(role?: string | null): string {
  if (!role) return 'Karyawan';
  return ROLE_LABELS[role] || role;
}

function formatFunctionLabel(fn?: string | null): string {
  if (!fn) return 'Belum Dipetakan';
  return normalizeCanonicalFunction(fn) || fn;
}

function formatAccountStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif';
    case 'INVITED':
      return 'Menunggu Aktivasi';
    case 'INACTIVE':
      return 'Nonaktif';
    default:
      return status;
  }
}

function getEffectiveInvitationStatus(
  invitation?: AdminUserRow['invitation'],
): string | null {
  if (!invitation) return null;
  if (
    invitation.status === 'PENDING' &&
    invitation.expiresAt &&
    new Date(invitation.expiresAt).getTime() < Date.now()
  ) {
    return 'EXPIRED';
  }
  return invitation.status;
}

function formatInvitationStatusLabel(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Menunggu';
    case 'EXPIRED':
      return 'Kedaluwarsa';
    case 'REVOKED':
      return 'Dicabut';
    case 'USED':
      return 'Sudah Diaktifkan';
    default:
      return status || '—';
  }
}

function getInvitationBadgeClass(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'USED':
      return 'used';
    case 'EXPIRED':
      return 'expired';
    case 'REVOKED':
      return 'revoked';
    default:
      return 'neutral';
  }
}

function computeFallbackSummary(rows: AdminUserRow[]): UserDirectorySummary {
  const counts: UserDirectorySummary = {
    total: rows.length,
    active: 0,
    invited: 0,
    invitedPending: 0,
    invitedExpired: 0,
    invitedRevoked: 0,
    inactive: 0,
    needsAttention: 0,
  };
  for (const row of rows) {
    if (row.status === 'ACTIVE') {
      counts.active += 1;
    } else if (row.status === 'INACTIVE') {
      counts.inactive += 1;
      counts.needsAttention += 1;
    } else if (row.status === 'INVITED') {
      counts.invited += 1;
      const eff = getEffectiveInvitationStatus(row.invitation);
      if (eff === 'PENDING') {
        counts.invitedPending += 1;
      } else if (eff === 'EXPIRED') {
        counts.invitedExpired += 1;
        counts.needsAttention += 1;
      } else if (eff === 'REVOKED') {
        counts.invitedRevoked += 1;
        counts.needsAttention += 1;
      }
    }
  }
  return counts;
}

const hasAnyFilter = computed(
  () =>
    Boolean(searchQuery.value.trim()) ||
    Boolean(statusFilter.value) ||
    Boolean(functionFilter.value) ||
    Boolean(roleFilter.value) ||
    employmentStatusFilter.value !== 'ALL',
);

const confirmModalMeta = computed(() => {
  const email = confirmModal.value.user?.email || 'pengguna ini';
  switch (confirmModal.value.action) {
    case 'resend':
      return {
        title: 'Kirim Ulang Undangan Aktivasi',
        subtitle: 'Menerbitkan tautan sekali pakai baru yang berlaku 72 jam.',
        impactTitle: 'Token lama akan langsung dihanguskan',
        impactDesc: `Tautan aktivasi lama (jika masih berlaku) akan langsung dibatalkan. Sistem membuat tautan baru untuk disalin dan dibagikan kepada ${email}.`,
        tone: 'info',
        confirmLabel: 'Terbitkan Tautan Baru',
        confirmClass: 'btn-primary',
        reasonLabel: 'Catatan Pengiriman Ulang (Opsional)',
        reasonPlaceholder: 'Contoh: Tautan sebelumnya sudah melewati batas 72 jam...',
      };
    case 'revoke':
      return {
        title: 'Cabut Undangan Aktivasi',
        subtitle: 'Membatalkan tautan undangan aktif sehingga tidak bisa digunakan lagi.',
        impactTitle: 'Tautan aktivasi langsung tidak berlaku',
        impactDesc: `Pengguna (${email}) tidak lagi dapat mengaktifkan akun memakai tautan sebelumnya sampai Anda mengirim undangan baru.`,
        tone: 'danger',
        confirmLabel: 'Ya, Cabut Undangan',
        confirmClass: 'btn-danger',
        reasonLabel: 'Alasan Pencabutan Undangan (Opsional)',
        reasonPlaceholder: 'Contoh: Pendaftaran dibatalkan atau salah alamat email...',
      };
    case 'deactivate':
      return {
        title: 'Nonaktifkan Akun Pengguna',
        subtitle: 'Menghentikan akses masuk sambil menjaga keutuhan seluruh data historis.',
        impactTitle: 'Sesi aktif langsung dihentikan & check-in berikutnya berhenti',
        impactDesc:
          'Menonaktifkan akun akan mengakhiri seluruh sesi masuk pengguna saat ini secara instan dan mengecualikannya dari kewajiban laporan harian berikutnya, tanpa menghapus riwayat kerja maupun catatan lama.',
        tone: 'danger',
        confirmLabel: 'Ya, Nonaktifkan Akun',
        confirmClass: 'btn-danger',
        reasonLabel: 'Alasan Penonaktifan (Opsional)',
        reasonPlaceholder: 'Contoh: Masa kerja / kontrak telah berakhir...',
      };
    case 'reactivate':
    default:
      return {
        title: 'Aktifkan Kembali Akun Pengguna',
        subtitle: 'Memulihkan akses masuk ke WorkPulse.',
        impactTitle: 'Akses masuk & kewajiban check-in aktif kembali',
        impactDesc:
          'Akun akan kembali berstatus aktif, dapat masuk menggunakan kata sandi pribadinya, dan mengikuti kewajiban laporan harian sesuai jadwal kerja.',
        tone: 'info',
        confirmLabel: 'Ya, Aktifkan Kembali',
        confirmClass: 'btn-primary',
        reasonLabel: 'Alasan Pengaktifan Kembali (Opsional)',
        reasonPlaceholder: 'Contoh: Kontrak diperpanjang atau kembali bertugas...',
      };
  }
});

function handleEmploymentStatusChange() {
  if (form.value.employmentStatus === 'INTERN') {
    form.value.role = 'EMPLOYEE';
  }
}

async function loadUsers() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const params = new URLSearchParams({ limit: '200' });
    if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim());
    if (statusFilter.value) params.set('status', statusFilter.value);
    if (functionFilter.value) params.set('function', functionFilter.value);
    if (roleFilter.value) params.set('role', roleFilter.value);
    if (employmentStatusFilter.value && employmentStatusFilter.value !== 'ALL') {
      params.set('employmentStatus', employmentStatusFilter.value);
    }

    const res = await apiClient<{
      data: AdminUserRow[];
      summary?: UserDirectorySummary;
    }>(`/v1/admin/users?${params.toString()}`);

    const payload: any = res.data;
    const rows: AdminUserRow[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    users.value = rows;
    summary.value = res.meta?.summary || payload?.summary || computeFallbackSummary(rows);
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memuat daftar pengguna.';
  } finally {
    isLoading.value = false;
  }
}

function handleSearchInput() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    loadUsers();
  }, 300);
}

function triggerSearchNow() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
  loadUsers();
}

function selectMetricCardFilter(targetStatus: string) {
  if (targetStatus !== '' && statusFilter.value === targetStatus) {
    statusFilter.value = '';
  } else {
    statusFilter.value = targetStatus;
  }
  loadUsers();
}

function resetFilters() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
  searchQuery.value = '';
  statusFilter.value = defaultStatusForMode();
  functionFilter.value = '';
  roleFilter.value = '';
  employmentStatusFilter.value = 'ALL';
  loadUsers();
}

function showAllUsers() {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
  searchQuery.value = '';
  statusFilter.value = '';
  functionFilter.value = '';
  roleFilter.value = '';
  employmentStatusFilter.value = 'ALL';
  loadUsers();
}

watch(
  () => props.mode,
  () => {
    statusFilter.value = defaultStatusForMode();
    loadUsers();
  },
);

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchMe();
  }
  window.addEventListener('keydown', handleKeydown);
  await loadUsers();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  if (toastTimer) clearTimeout(toastTimer);
  if (errorTimer) clearTimeout(errorTimer);
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (confirmModal.value.open && !confirmModal.value.submitting) {
      closeConfirmModal();
    } else if (isModalOpen.value && !isSubmitting.value) {
      closeModal();
    }
  }
}

function openModal() {
  modalError.value = null;
  createdToken.value = null;
  createdTargetName.value = '';
  createdTargetEmail.value = '';
  createdExpiresAt.value = null;
  tokenModalMode.value = 'create';
  form.value = {
    fullName: '',
    email: '',
    role: 'EMPLOYEE',
    function: 'Engineering',
    jobTitle: '',
    employmentStatus: 'PERMANENT',
    endDate: '',
  };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  createdToken.value = null;
}

async function handleCreateUser() {
  modalError.value = null;
  if (!form.value.fullName.trim() || !form.value.email.trim()) {
    modalError.value = 'Nama lengkap dan alamat email perusahaan wajib diisi.';
    return;
  }
  if (form.value.employmentStatus === 'INTERN' && !form.value.endDate) {
    modalError.value = 'Tanggal selesai magang wajib diisi untuk karyawan berstatus Intern.';
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      fullName: form.value.fullName.trim(),
      email: form.value.email.trim(),
      jobTitle: form.value.jobTitle.trim() || undefined,
      role: form.value.employmentStatus === 'INTERN' ? 'EMPLOYEE' : form.value.role,
      endDate: form.value.endDate || undefined,
    };
    const res = await apiClient<{
      user: { fullName: string; email: string };
      invitation: { token: string; expiresAt: string };
    }>('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    tokenModalMode.value = 'create';
    createdToken.value = res.data.invitation.token;
    createdExpiresAt.value = res.data.invitation.expiresAt;
    createdTargetName.value = res.data.user?.fullName || form.value.fullName.trim();
    createdTargetEmail.value = res.data.user?.email || form.value.email.trim();
    showToast('Akun baru berhasil dibuat dan tautan aktivasi telah diterbitkan.');
    await loadUsers();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal membuat akun pengguna baru.';
  } finally {
    isSubmitting.value = false;
  }
}

function openConfirmModal(action: LifecycleActionType, user: AdminUserRow) {
  confirmModal.value = {
    open: true,
    action,
    user,
    reason: '',
    submitting: false,
    error: null,
  };
}

function closeConfirmModal() {
  confirmModal.value.open = false;
  confirmModal.value.user = null;
  confirmModal.value.reason = '';
  confirmModal.value.error = null;
}

async function submitLifecycleAction() {
  const target = confirmModal.value.user;
  if (!target) return;

  confirmModal.value.submitting = true;
  confirmModal.value.error = null;
  const reasonPayload = confirmModal.value.reason.trim() || undefined;

  try {
    if (confirmModal.value.action === 'resend') {
      const res = await apiClient<{
        token: string;
        expiresAt: string;
        user?: { fullName: string; email: string };
      }>(`/v1/admin/users/${target.id}/resend-invitation`, {
        method: 'POST',
        body: JSON.stringify({ reason: reasonPayload }),
      });

      closeConfirmModal();
      tokenModalMode.value = 'resend';
      createdToken.value = res.data.token;
      createdExpiresAt.value = res.data.expiresAt;
      createdTargetName.value = res.data.user?.fullName || target.fullName;
      createdTargetEmail.value = res.data.user?.email || target.email;
      modalError.value = null;
      isModalOpen.value = true;
      showToast('Tautan undangan baru (berlaku 72 jam) berhasil diterbitkan.');
      await loadUsers();
    } else if (confirmModal.value.action === 'revoke') {
      await apiClient(`/v1/admin/users/${target.id}/revoke-invitation`, {
        method: 'POST',
        body: JSON.stringify({ reason: reasonPayload }),
      });
      closeConfirmModal();
      showToast('Undangan pengguna berhasil dicabut.');
      await loadUsers();
    } else {
      const nextStatus =
        confirmModal.value.action === 'deactivate' ? 'INACTIVE' : 'ACTIVE';
      const res = await apiClient<{ message?: string }>(
        `/v1/admin/users/${target.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus, reason: reasonPayload }),
        },
      );
      closeConfirmModal();
      showToast(
        res.data?.message ||
          (nextStatus === 'INACTIVE'
            ? 'Akun pengguna berhasil dinonaktifkan dan seluruh sesi aktif telah dihentikan.'
            : 'Akun pengguna berhasil diaktifkan kembali.'),
      );
      await loadUsers();
    }
  } catch (err: any) {
    confirmModal.value.error = err.message || 'Gagal menjalankan tindakan pada akun.';
  } finally {
    confirmModal.value.submitting = false;
  }
}

function showToast(msg: string, isError = false) {
  if (isError) {
    if (errorTimer) clearTimeout(errorTimer);
    errorMessage.value = msg;
    errorTimer = setTimeout(() => {
      errorMessage.value = null;
    }, 4500);
  } else {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.value = msg;
    toastTimer = setTimeout(() => {
      toastMessage.value = null;
    }, 4000);
  }
}

async function copyToClipboard(text: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
    showToast('Tautan aktivasi berhasil disalin.');
  } catch {
    showToast('Tautan siap disalin secara manual dari kotak di atas.');
  }
}
</script>

<template>
  <div class="admin-layout">
    <TopBar :breadcrumb="pageBreadcrumb" />

    <div v-if="toastMessage" class="toast-popup success" role="status" aria-live="polite">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>
    <div v-if="errorMessage" class="toast-popup error" role="alert">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <main class="content-container">
      <div class="page-header">
        <div class="page-header-copy">
          <h1>{{ pageTitle }}</h1>
          <p class="subtitle">{{ pageSubtitle }}</p>
        </div>
        <button type="button" class="btn btn-primary cta-invite-btn" @click="openModal">
          <UserPlus :size="18" />
          <span>Undang Pengguna Baru</span>
        </button>
      </div>

      <!-- Banner Pemisahan Kelola Akun vs Struktur Organisasi -->
      <div class="crosslink-banner" role="note">
        <div class="crosslink-copy">
          <Info :size="18" class="crosslink-icon" />
          <p>
            <strong>Fokus Akun &amp; Undangan:</strong> Halaman ini khusus mengelola aktivasi akun, tautan 72 jam, dan status aktif/nonaktif pengguna. Untuk mengubah atasan langsung, mutasi divisi, atau wewenang proyek, gunakan menu <strong>Struktur Organisasi</strong>.
          </p>
        </div>
        <RouterLink to="/admin/organization" class="btn btn-secondary btn-sm crosslink-cta">
          <span>Buka Struktur Organisasi</span>
          <ArrowRight :size="15" />
        </RouterLink>
      </div>

      <!-- 4 Kartu Ringkasan Interaktif -->
      <section class="metrics-grid" aria-label="Ringkasan Status Akun">
        <button
          type="button"
          :class="['metric-card', 'accent-brand', { active: statusFilter === '' }]"
          :aria-pressed="statusFilter === ''"
          @click="selectMetricCardFilter('')"
        >
          <div class="metric-top">
            <span class="metric-label">Total Akun</span>
            <span class="metric-pill neutral">Semua</span>
          </div>
          <div class="metric-value mono-num">{{ summary.total }}</div>
          <div class="metric-sub">Seluruh akun terdaftar</div>
        </button>

        <button
          type="button"
          :class="['metric-card', 'accent-green', { active: statusFilter === 'ACTIVE' }]"
          :aria-pressed="statusFilter === 'ACTIVE'"
          @click="selectMetricCardFilter('ACTIVE')"
        >
          <div class="metric-top">
            <span class="metric-label">Aktif</span>
            <span class="metric-pill green">Aktif</span>
          </div>
          <div class="metric-value mono-num">{{ summary.active }}</div>
          <div class="metric-sub">Sudah aktivasi &amp; siap masuk</div>
        </button>

        <button
          type="button"
          :class="['metric-card', 'accent-blue', { active: statusFilter === 'INVITED_PENDING' }]"
          :aria-pressed="statusFilter === 'INVITED_PENDING'"
          @click="selectMetricCardFilter('INVITED_PENDING')"
        >
          <div class="metric-top">
            <span class="metric-label">Menunggu Aktivasi</span>
            <span class="metric-pill blue">Berlaku</span>
          </div>
          <div class="metric-value mono-num">{{ summary.invitedPending }}</div>
          <div class="metric-sub">Tautan undangan masih aktif</div>
        </button>

        <button
          type="button"
          :class="['metric-card', 'accent-red', { active: statusFilter === 'NEEDS_ATTENTION' }]"
          :aria-pressed="statusFilter === 'NEEDS_ATTENTION'"
          @click="selectMetricCardFilter('NEEDS_ATTENTION')"
        >
          <div class="metric-top">
            <span class="metric-label">Nonaktif / Kedaluwarsa</span>
            <span class="metric-pill red">Perlu Tindak</span>
          </div>
          <div class="metric-value mono-num">{{ summary.needsAttention }}</div>
          <div class="metric-sub">Kedaluwarsa, dicabut, atau nonaktif</div>
        </button>
      </section>

      <!-- Bar Pencarian & Penyaring -->
      <section class="filter-panel" aria-label="Pencarian dan Penyaring Pengguna">
        <div class="filter-grid">
          <div class="search-box">
            <label for="admin-users-search" class="sr-only">Cari nama, email, atau jabatan</label>
            <Search :size="17" class="search-icon" />
            <input
              id="admin-users-search"
              v-model="searchQuery"
              name="search"
              type="search"
              placeholder="Cari nama, email, atau jabatan..."
              @input="handleSearchInput"
              @keyup.enter="triggerSearchNow"
            />
          </div>

          <div class="select-wrap">
            <label for="admin-users-status" class="sr-only">Saring status akun dan undangan</label>
            <select
              id="admin-users-status"
              v-model="statusFilter"
              name="status"
              class="filter-select"
              @change="loadUsers"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INVITED">Semua Undangan</option>
              <option value="INVITED_PENDING">Menunggu Aktivasi</option>
              <option value="INVITED_EXPIRED">Undangan Kedaluwarsa</option>
              <option value="INVITED_REVOKED">Undangan Dicabut</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="NEEDS_ATTENTION">Nonaktif / Kedaluwarsa / Dicabut</option>
            </select>
          </div>

          <div class="select-wrap">
            <label for="admin-users-function" class="sr-only">Saring divisi</label>
            <select
              id="admin-users-function"
              v-model="functionFilter"
              name="function"
              class="filter-select"
              @change="loadUsers"
            >
              <option value="">Semua Divisi</option>
              <option
                v-for="opt in CANONICAL_FUNCTION_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="select-wrap">
            <label for="admin-users-role" class="sr-only">Saring peran</label>
            <select
              id="admin-users-role"
              v-model="roleFilter"
              name="role"
              class="filter-select"
              @change="loadUsers"
            >
              <option value="">Semua Peran</option>
              <option
                v-for="opt in CANONICAL_ROLE_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="select-wrap">
            <label for="admin-users-employment" class="sr-only">Saring status karyawan</label>
            <select
              id="admin-users-employment"
              v-model="employmentStatusFilter"
              name="employmentStatus"
              class="filter-select"
              data-testid="filter-employment-status"
              @change="loadUsers"
            >
              <option
                v-for="opt in EMPLOYMENT_STATUS_FILTER_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-meta-row">
          <span class="record-count mono-num">
            Menampilkan {{ users.length }} dari {{ summary.total }} akun
          </span>
          <button
            v-if="hasAnyFilter"
            type="button"
            class="btn btn-secondary btn-xs"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>
      </section>

      <!-- Tabel Pengguna & Undangan -->
      <div class="table-card">
        <div v-if="isLoading" class="state-container">
          <p>Memuat daftar pengguna...</p>
        </div>

        <div v-else-if="users.length === 0" class="state-container empty">
          <div class="empty-icon">👥</div>
          <h3>Tidak Ada Data yang Cocok</h3>
          <p>Tidak ditemukan akun yang sesuai dengan saringan atau pencarian saat ini.</p>
          <button
            v-if="hasAnyFilter"
            type="button"
            class="btn btn-secondary btn-sm empty-reset-btn"
            @click="showAllUsers"
          >
            Tampilkan Semua
          </button>
        </div>

        <div v-else class="table-scroll-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">NAMA &amp; EMAIL</th>
                <th scope="col">JABATAN, DIVISI &amp; PERAN</th>
                <th scope="col">STATUS AKUN</th>
                <th scope="col">STATUS UNDANGAN</th>
                <th scope="col" class="col-actions-header">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>
                  <div class="user-meta">
                    <div class="avatar-sm">{{ getUserInitials(u.fullName, u.email) }}</div>
                    <div class="user-identity">
                      <div class="user-name-line">
                        <strong class="user-name">{{ u.fullName }}</strong>
                        <span v-if="isInternStatus(u.employmentStatus)" class="badge-intern">Intern</span>
                        <span v-else-if="u.employmentStatus === 'CONTRACT'" class="badge-contract">Kontrak</span>
                        <span v-if="u.isInternExpired" class="badge-intern-expired">Masa Magang Berakhir</span>
                      </div>
                      <span class="user-email-text mono-num">{{ u.email }}</span>
                      <div
                        v-if="isInternStatus(u.employmentStatus) && u.assignmentEndDate"
                        class="intern-end-hint"
                      >
                        Selesai magang: <span class="wp-datetime">{{ formatDateWib(u.assignmentEndDate) }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge">{{ formatRoleLabel(u.currentRole) }}</span>
                  <span v-if="u.currentJobTitle" class="job-title-text">{{ u.currentJobTitle }}</span>
                  <span class="func-text">
                    {{ formatFunctionLabel(u.currentFunction) }} · {{ formatEmploymentStatusLabel(u.employmentStatus) }}
                  </span>
                  <span v-if="u.directManagerName" class="manager-hint">
                    Atasan: {{ u.directManagerName }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', u.status.toLowerCase()]">
                    {{ formatAccountStatusLabel(u.status) }}
                  </span>
                </td>
                <td>
                  <template v-if="u.invitation">
                    <span :class="['inv-badge', getInvitationBadgeClass(getEffectiveInvitationStatus(u.invitation))]">
                      {{ formatInvitationStatusLabel(getEffectiveInvitationStatus(u.invitation)) }}
                    </span>
                    <span
                      v-if="getEffectiveInvitationStatus(u.invitation) === 'PENDING'"
                      class="exp-hint"
                    >
                      Berlaku s.d. <span class="wp-datetime">{{ formatDateTimeWib(u.invitation.expiresAt) }}</span>
                    </span>
                    <span
                      v-else-if="getEffectiveInvitationStatus(u.invitation) === 'EXPIRED'"
                      class="exp-hint exp-hint-danger"
                    >
                      Berakhir <span class="wp-datetime">{{ formatDateWib(u.invitation.expiresAt) }}</span>
                    </span>
                  </template>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <template v-if="u.status === 'INVITED'">
                      <button
                        type="button"
                        class="btn-action"
                        :aria-label="'Kirim ulang undangan untuk ' + u.fullName"
                        @click="openConfirmModal('resend', u)"
                      >
                        <RotateCw :size="14" />
                        <span>Kirim Ulang</span>
                      </button>
                      <button
                        v-if="getEffectiveInvitationStatus(u.invitation) === 'PENDING'"
                        type="button"
                        class="btn-action danger"
                        :aria-label="'Cabut undangan untuk ' + u.fullName"
                        @click="openConfirmModal('revoke', u)"
                      >
                        <Ban :size="14" />
                        <span>Cabut</span>
                      </button>
                    </template>

                    <template v-else>
                      <span
                        v-if="u.id === authStore.user?.id"
                        class="self-account-pill"
                        title="Akun yang sedang Anda gunakan tidak dapat dinonaktifkan"
                      >
                        Akun Anda
                      </span>
                      <button
                        v-else
                        type="button"
                        :class="['btn-status-toggle', u.status === 'ACTIVE' ? 'deactivate' : 'activate']"
                        @click="openConfirmModal(u.status === 'ACTIVE' ? 'deactivate' : 'reactivate', u)"
                      >
                        {{ u.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan Kembali' }}
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal 1: Undang Pengguna Baru & Hasil Tautan Aktivasi -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="!isSubmitting && closeModal()">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h3 id="modal-title">
            {{
              createdToken
                ? tokenModalMode === 'resend'
                  ? 'Tautan Undangan Baru Siap Dibagikan'
                  : 'Tautan Aktivasi Berhasil Diterbitkan'
                : 'Undang Pengguna Baru'
            }}
          </h3>
          <button
            type="button"
            class="close-btn"
            aria-label="Tutup Dialog"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            <X :size="20" />
          </button>
        </div>

        <div v-if="createdToken" class="token-result-box">
          <div class="success-icon-circ">
            <CheckCircle2 :size="30" />
          </div>
          <h4>
            {{
              tokenModalMode === 'resend'
                ? 'Undangan Baru Telah Diterbitkan!'
                : 'Akun & Undangan Berhasil Dibuat!'
            }}
          </h4>
          <p class="token-recipient" v-if="createdTargetName || createdTargetEmail">
            Untuk <strong>{{ createdTargetName }}</strong>
            <span v-if="createdTargetEmail" class="mono-num">({{ createdTargetEmail }})</span>
          </p>
          <p class="token-validity">
            Tautan aktivasi sekali pakai ini berlaku 72 jam
            <template v-if="createdExpiresAt">
              hingga <span class="wp-datetime">{{ formatDateTimeWib(createdExpiresAt) }}</span>
            </template>.
          </p>

          <div class="token-display mono-num">
            {{ `${originUrl}/activate?token=${createdToken}` }}
          </div>

          <div class="modal-footer modal-footer-center">
            <button
              type="button"
              class="btn btn-secondary"
              @click="copyToClipboard(`${originUrl}/activate?token=${createdToken}`)"
            >
              <Copy :size="16" />
              <span>Salin Tautan Aktivasi</span>
            </button>
            <button type="button" class="btn btn-primary" @click="closeModal">Selesai</button>
          </div>
        </div>

        <form v-else @submit.prevent="handleCreateUser">
          <div v-if="modalError" class="alert-banner error" role="alert">
            <AlertCircle :size="18" />
            <span>{{ modalError }}</span>
          </div>

          <div class="form-group">
            <label for="new-fullname">Nama Lengkap</label>
            <input
              id="new-fullname"
              v-model="form.fullName"
              type="text"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div class="form-group">
            <label for="new-email">Alamat Email Perusahaan</label>
            <input
              id="new-email"
              v-model="form.email"
              type="email"
              placeholder="budi.santoso@dutamedia.com"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="new-emp-status">Status Karyawan</label>
              <select
                id="new-emp-status"
                v-model="form.employmentStatus"
                data-testid="input-employment-status"
                @change="handleEmploymentStatusChange"
              >
                <option v-for="opt in EMPLOYMENT_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="new-role">Peran</label>
              <select id="new-role" v-model="form.role" :disabled="form.employmentStatus === 'INTERN'">
                <option
                  v-for="opt in CREATE_ROLE_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <small v-if="form.employmentStatus === 'INTERN'" class="field-helper">
                Karyawan Intern otomatis menggunakan peran Karyawan.
              </small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="new-func">Divisi</label>
              <select id="new-func" v-model="form.function">
                <option
                  v-for="opt in CANONICAL_FUNCTION_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="new-title">Jabatan</label>
              <input
                id="new-title"
                v-model="form.jobTitle"
                type="text"
                placeholder="Contoh: Frontend Developer"
              />
            </div>
          </div>

          <div v-if="form.employmentStatus === 'INTERN' || form.employmentStatus === 'CONTRACT'" class="form-group">
            <label for="new-end-date">
              {{ form.employmentStatus === 'INTERN' ? 'Tanggal Selesai Magang *' : 'Tanggal Berakhir Kontrak (Opsional)' }}
            </label>
            <input
              id="new-end-date"
              v-model="form.endDate"
              type="date"
              :min="getTodayIsoWib()"
              :required="form.employmentStatus === 'INTERN'"
              data-testid="input-end-date"
            />
            <small v-if="form.employmentStatus === 'INTERN'" class="field-helper">
              Wajib diisi. Sistem akan menampilkan pengingat otomatis jika masa magang telah melewati tanggal ini.
            </small>
          </div>

          <div class="security-note-box">
            <Lock :size="16" class="security-note-icon" />
            <span>
              WorkPulse tidak memakai kata sandi buatan admin. Setelah dikirim, sistem membuat tautan aktivasi sekali pakai berlaku 72 jam agar karyawan membuat kata sandinya sendiri.
            </span>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" :disabled="isSubmitting" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menerbitkan...' : 'Terbitkan Undangan (72 Jam)' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Konfirmasi Tindakan Siklus Hidup Akun & Undangan -->
    <div
      v-if="confirmModal.open && confirmModal.user"
      class="modal-backdrop"
      @click.self="!confirmModal.submitting && closeConfirmModal()"
    >
      <div class="modal-box modal-box-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <div class="modal-header">
          <div>
            <h3 id="confirm-modal-title">{{ confirmModalMeta.title }}</h3>
            <p class="modal-subtitle">{{ confirmModalMeta.subtitle }}</p>
          </div>
          <button
            type="button"
            class="close-btn"
            aria-label="Tutup Konfirmasi"
            :disabled="confirmModal.submitting"
            @click="closeConfirmModal"
          >
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="submitLifecycleAction">
          <div class="target-summary-card">
            <div class="target-name">{{ confirmModal.user.fullName }}</div>
            <div class="target-meta mono-num">{{ confirmModal.user.email }}</div>
            <div class="target-meta">
              {{ formatRoleLabel(confirmModal.user.currentRole) }} · {{ formatFunctionLabel(confirmModal.user.currentFunction) }}
            </div>
          </div>

          <div :class="['impact-callout', confirmModalMeta.tone]">
            <AlertCircle :size="18" class="impact-icon" />
            <div>
              <strong>{{ confirmModalMeta.impactTitle }}</strong>
              <p>{{ confirmModalMeta.impactDesc }}</p>
            </div>
          </div>

          <div v-if="confirmModal.error" class="alert-banner error" role="alert">
            <AlertCircle :size="18" />
            <span>{{ confirmModal.error }}</span>
          </div>

          <div class="form-group">
            <label for="lifecycle-reason">{{ confirmModalMeta.reasonLabel }}</label>
            <textarea
              id="lifecycle-reason"
              v-model="confirmModal.reason"
              rows="3"
              maxlength="500"
              :placeholder="confirmModalMeta.reasonPlaceholder"
            />
            <small class="field-helper">Catatan ini akan disimpan ke dalam riwayat perubahan sistem.</small>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="confirmModal.submitting"
              @click="closeConfirmModal"
            >
              Batal
            </button>
            <button
              type="submit"
              :class="['btn', confirmModalMeta.confirmClass]"
              :disabled="confirmModal.submitting"
            >
              {{ confirmModal.submitting ? 'Memproses...' : confirmModalMeta.confirmLabel }}
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
  background: var(--color-canvas);
}

.content-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.page-header-copy {
  min-width: 0;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.25;
}

.subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 12.5px;
}

.btn-xs {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-brand-hover);
}

.btn-secondary {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
  text-decoration: none;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-surface-subtle);
  text-decoration: none;
}

.btn-danger {
  background: #991B1B;
  color: #FFFFFF;
}

.btn-danger:hover:not(:disabled) {
  background: #7F1D1D;
}

.crosslink-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  margin-bottom: 18px;
}

.crosslink-copy {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 0;
}

.crosslink-icon {
  color: var(--color-brand-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.crosslink-copy strong {
  color: var(--color-text-primary);
}

.crosslink-cta {
  flex-shrink: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-card {
  text-align: left;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
  min-width: 0;
}

.metric-card:hover {
  border-color: var(--color-border-strong);
}

.metric-card.active.accent-brand {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.14);
}

.metric-card.active.accent-green {
  border-color: #166534;
  box-shadow: 0 0 0 2px rgba(22, 101, 52, 0.14);
}

.metric-card.active.accent-blue {
  border-color: #075985;
  box-shadow: 0 0 0 2px rgba(7, 89, 133, 0.14);
}

.metric-card.active.accent-red {
  border-color: #991B1B;
  box-shadow: 0 0 0 2px rgba(153, 27, 27, 0.14);
}

.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.metric-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.metric-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

.metric-pill.neutral {
  background: var(--color-status-neutral-bg);
  color: var(--color-status-neutral-fg);
}

.metric-pill.green {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
}

.metric-pill.blue {
  background: var(--color-timing-ontime-bg);
  color: var(--color-timing-ontime-fg);
}

.metric-pill.red {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.15;
}

.metric-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.filter-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) repeat(4, minmax(145px, 1fr));
  gap: 10px;
}

.search-box {
  position: relative;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 38px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13px;
}

.select-wrap {
  min-width: 0;
}

.filter-select {
  width: 100%;
  height: 40px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  padding: 0 34px 0 11px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.filter-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-subtle);
}

.record-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.table-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-lg);
}

.data-table {
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-surface-subtle);
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-border-subtle);
  white-space: nowrap;
}

.data-table th:first-child {
  min-width: 280px;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 13px;
  vertical-align: top;
}

.data-table tbody tr:last-child td {
  border-bottom: 0;
}

.col-actions-header {
  text-align: right;
}

.user-meta {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
}

.user-identity {
  min-width: 0;
}

.user-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.user-name {
  font-size: 13.5px;
  color: var(--color-text-primary);
}

.user-email-text {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 1px;
  white-space: nowrap;
  word-break: normal;
}

.intern-end-hint {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 3px;
}

.role-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-strong);
  color: var(--color-brand-primary);
}

.job-title-text {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: 4px;
}

.func-text {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.manager-hint {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 6px;
  white-space: nowrap;
}

.status-badge.active {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  border: 1px solid var(--color-status-green-border);
}

.status-badge.invited {
  background: var(--color-timing-ontime-bg);
  color: var(--color-timing-ontime-fg);
  border: 1px solid var(--color-timing-ontime-border);
}

.status-badge.inactive {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
  border: 1px solid var(--color-status-red-border);
}

.inv-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
}

.inv-badge.pending {
  background: var(--color-status-amber-bg);
  color: var(--color-status-amber-fg);
  border: 1px solid var(--color-status-amber-border);
}

.inv-badge.used {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  border: 1px solid var(--color-status-green-border);
}

.inv-badge.expired {
  background: var(--color-status-neutral-bg);
  color: var(--color-status-neutral-fg);
  border: 1px solid var(--color-status-neutral-border);
}

.inv-badge.revoked {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
  border: 1px solid var(--color-status-red-border);
}

.inv-badge.neutral {
  background: var(--color-status-neutral-bg);
  color: var(--color-status-neutral-fg);
}

.exp-hint {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.exp-hint-danger {
  color: #991B1B;
}

.text-muted {
  color: var(--color-text-secondary);
}

.action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-action:hover {
  background: var(--color-surface-subtle);
  color: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}

.btn-action.danger {
  color: #991B1B;
  border-color: #FCA5A5;
}

.btn-action.danger:hover {
  background: #FEE2E2;
  color: #7F1D1D;
}

.btn-status-toggle {
  font-size: 12px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 6px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-primary);
  cursor: pointer;
  white-space: nowrap;
}

.btn-status-toggle.deactivate:hover {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.btn-status-toggle.activate:hover {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  border-color: var(--color-status-green-border);
}

.self-account-pill {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--color-status-neutral-bg);
  color: var(--color-status-neutral-fg);
  border: 1px solid var(--color-status-neutral-border);
  white-space: nowrap;
}

.state-container {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.state-container h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.empty-reset-btn {
  margin-top: 14px;
}

.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 600;
  z-index: 9999;
  max-width: min(440px, calc(100vw - 32px));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.toast-popup.success {
  background: #00674D;
  color: #FFFFFF;
}

.toast-popup.error {
  background: #991B1B;
  color: #FFFFFF;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  z-index: 1000;
}

.modal-box {
  width: min(100%, 540px);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 24px 26px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-box-sm {
  width: min(100%, 490px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.modal-subtitle {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.close-btn {
  background: transparent;
  border: 0;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 2px;
}

.alert-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 14px;
}

.alert-banner.error {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
  border: 1px solid var(--color-status-red-border);
}

.form-group {
  margin-bottom: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13.5px;
}

.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13px;
  resize: vertical;
}

.field-helper {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  display: block;
}

.security-note-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-timing-ontime-bg);
  border: 1px solid var(--color-timing-ontime-border);
  color: var(--color-timing-ontime-fg);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
}

.security-note-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.target-summary-card {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-subtle);
  margin-bottom: 14px;
}

.target-name {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.target-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  word-break: break-word;
}

.impact-callout {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  line-height: 1.45;
  margin-bottom: 14px;
}

.impact-callout strong {
  display: block;
  margin-bottom: 3px;
}

.impact-callout.danger {
  background: var(--color-status-red-bg);
  border: 1px solid var(--color-status-red-border);
  color: var(--color-status-red-fg);
}

.impact-callout.info {
  background: var(--color-timing-ontime-bg);
  border: 1px solid var(--color-timing-ontime-border);
  color: var(--color-timing-ontime-fg);
}

.impact-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.modal-footer-center {
  justify-content: center;
}

.token-result-box {
  text-align: center;
  padding: 6px 0 4px;
}

.token-result-box h4 {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.token-recipient {
  font-size: 13px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.token-validity {
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.success-icon-circ {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
}

.token-display {
  background: var(--color-surface-subtle);
  border: 1px dashed var(--color-border-strong);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  word-break: break-all;
  margin-top: 14px;
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filter-grid .search-box {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .content-container {
    padding: 16px 14px 40px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .cta-invite-btn {
    width: 100%;
  }

  .crosslink-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .crosslink-cta {
    width: 100%;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .metric-card {
    padding: 12px;
  }

  .metric-label {
    font-size: 11.5px;
  }

  .user-email-text {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-box {
    padding: 20px;
    width: calc(100% - 24px);
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
