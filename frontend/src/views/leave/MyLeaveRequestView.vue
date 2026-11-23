<script setup lang="ts">
// WorkPulse - MyLeaveRequestView (with self-service cancellation)
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import { formatDateWib, formatDateRangeWib } from '../../utils/dateTime';
import { isInternStatus } from '../../utils/employmentStatus';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Send,
  RotateCcw,
  Info,
  Tag,
  X,
} from 'lucide-vue-next';

interface LeaveRequestItem {
  id: string;
  startDate: string;
  endDate: string;
  leaveType?: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reconciled?: boolean;
  reconciliationNote?: string;
  reviewedAt?: string;
  reviewNote?: string;
  reviewNotes?: string;
  reviewedBy?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

interface LeaveQuotaInfo {
  year: number;
  employmentStatus: 'PERMANENT' | 'CONTRACT' | 'INTERN';
  hasAnnualQuota: boolean;
  annualQuotaDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  allowedLeaveTypes: string[];
}

const authStore = useAuthStore();
const loading = ref(false);
const submitting = ref(false);
const leaveRequests = ref<LeaveRequestItem[]>([]);
const leaveQuota = ref<LeaveQuotaInfo | null>(null);

const isInternAccount = computed(() => {
  if (leaveQuota.value?.employmentStatus) {
    return leaveQuota.value.employmentStatus === 'INTERN';
  }
  return isInternStatus(authStore.user?.employmentStatus);
});

const leaveTypeOptions = computed(() => {
  if (isInternAccount.value) {
    return [
      { value: 'PERMIT', label: 'Izin (Keperluan Mendesak / Alasan Logis)' },
      { value: 'SICK', label: 'Sakit' },
    ];
  }
  return [
    { value: 'ANNUAL', label: 'Cuti Tahunan' },
    { value: 'PERMIT', label: 'Izin (Keperluan Mendesak / Alasan Logis)' },
    { value: 'SICK', label: 'Sakit' },
    { value: 'SPECIAL_LEAVE', label: 'Cuti Khusus (Pernikahan, Duka Cita, Keluarga)' },
    { value: 'MATERNITY', label: 'Cuti Melahirkan / Keguguran' },
    { value: 'UNPAID', label: 'Cuti di Luar Tanggungan (Tanpa Upah)' },
  ];
});

// Form inputs
const startDate = ref('');
const endDate = ref('');
const leaveType = ref(isInternStatus(authStore.user?.employmentStatus) ? 'PERMIT' : 'ANNUAL');
const reason = ref('');
const formError = ref('');

// Filter & Search
const activeFilter = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>('ALL');
const searchQuery = ref('');

// Toasts & Cancel confirmation modal
const toastMessage = ref('');
const errorMessage = ref('');
const cancellingId = ref<string | null>(null);
const cancelTarget = ref<LeaveRequestItem | null>(null);

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => {
      errorMessage.value = '';
    }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => {
      toastMessage.value = '';
    }, 4000);
  }
}

async function loadLeaveRequests() {
  loading.value = true;
  try {
    const [res, quotaRes] = await Promise.all([
      apiClient<LeaveRequestItem[]>('/leave/my'),
      apiClient<LeaveQuotaInfo>('/leave/quota').catch(() => null),
    ]);
    leaveRequests.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    if (quotaRes?.data && typeof quotaRes.data.hasAnnualQuota === 'boolean') {
      leaveQuota.value = quotaRes.data;
    }
    if (isInternAccount.value && !['PERMIT', 'SICK'].includes(leaveType.value)) {
      leaveType.value = 'PERMIT';
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat riwayat pengajuan.', true);
  } finally {
    loading.value = false;
  }
}

function formatRequestCode(req: LeaveRequestItem): string {
  const parsed = req.startDate ? new Date(req.startDate) : null;
  const datePart =
    parsed && !Number.isNaN(parsed.getTime())
      ? `${parsed.getUTCFullYear()}${String(parsed.getUTCMonth() + 1).padStart(2, '0')}${String(parsed.getUTCDate()).padStart(2, '0')}`
      : 'REQ';
  const shortId =
    (req.id || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase() || '0000';
  return `LVR-${datePart}-${shortId}`;
}

const filteredRequests = computed(() => {
  return leaveRequests.value.filter((req) => {
    if (activeFilter.value !== 'ALL' && req.status !== activeFilter.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchReason = req.reason?.toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      const matchCode = formatRequestCode(req).toLowerCase().includes(q);
      const matchType = formatLeaveType(req.leaveType).toLowerCase().includes(q);
      const matchReviewer = req.reviewedBy?.fullName?.toLowerCase().includes(q);
      const matchRange = formatDateRange(req.startDate, req.endDate).toLowerCase().includes(q);
      const matchDate = req.startDate.includes(q) || req.endDate.includes(q);
      return (
        matchReason ||
        matchId ||
        matchCode ||
        matchType ||
        matchReviewer ||
        matchRange ||
        matchDate
      );
    }
    return true;
  });
});

function formatLeaveType(type?: string): string {
  switch (type) {
    case 'ANNUAL':
      return 'Cuti Tahunan';
    case 'SICK':
      return 'Sakit';
    case 'PERMIT':
      return 'Izin';
    case 'SPECIAL_LEAVE':
      return 'Cuti Khusus';
    case 'MATERNITY':
      return 'Cuti Melahirkan';
    case 'UNPAID':
      return 'Di Luar Tanggungan';
    default:
      return type || 'Cuti Tahunan';
  }
}

function formatReason(text?: string): string {
  if (!text) return '(Tanpa alasan khusus)';
  return text.replace(/\s*\(uji rekonsiliasi Superseded by Approved Leave\)/gi, '').trim();
}

function calculateDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  const s = new Date(Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate()));
  const e = new Date(Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate()));
  if (e < s) return 0;
  let count = 0;
  const cursor = new Date(s);
  while (cursor <= e) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

const isValidDateOrder = computed(() => {
  if (!startDate.value || !endDate.value) return false;
  return new Date(endDate.value) >= new Date(startDate.value);
});

const requestedWorkingDays = computed(() => {
  if (!isValidDateOrder.value) return 0;
  return calculateDuration(startDate.value, endDate.value);
});

const isWeekendOnlySelection = computed(() => {
  return isValidDateOrder.value && requestedWorkingDays.value === 0;
});

const exceedsAnnualQuota = computed(() => {
  if (isInternAccount.value) return false;
  if (leaveType.value !== 'ANNUAL') return false;
  if (!leaveQuota.value?.hasAnnualQuota) return false;
  return requestedWorkingDays.value > leaveQuota.value.remainingDays;
});

const reasonTrimmedLength = computed(() => reason.value.trim().length);

async function handleSubmit() {
  formError.value = '';
  if (!startDate.value) {
    formError.value = isInternAccount.value ? 'Pilih tanggal mulai izin.' : 'Pilih tanggal mulai cuti.';
    return;
  }
  if (!endDate.value) {
    formError.value = isInternAccount.value ? 'Pilih tanggal selesai izin.' : 'Pilih tanggal selesai cuti.';
    return;
  }
  if (new Date(endDate.value) < new Date(startDate.value)) {
    formError.value = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
    return;
  }
  if (calculateDuration(startDate.value, endDate.value) === 0) {
    formError.value =
      'Rentang tanggal yang dipilih hanya mencakup akhir pekan (0 hari kerja). Pilih minimal 1 hari kerja (Senin–Jumat).';
    return;
  }
  if (reason.value.trim().length < 5) {
    formError.value = isInternAccount.value
      ? 'Alasan permohonan izin minimal 5 karakter.'
      : 'Alasan permohonan cuti minimal 5 karakter.';
    return;
  }

  submitting.value = true;
  try {
    await apiClient('/leave/requests', {
      method: 'POST',
      body: JSON.stringify({
        startDate: startDate.value,
        endDate: endDate.value,
        leaveType: leaveType.value || 'ANNUAL',
        reason: reason.value.trim(),
      }),
    });
    showToast(isInternAccount.value ? 'Permohonan izin berhasil diajukan.' : 'Permohonan cuti berhasil diajukan.');
    startDate.value = '';
    endDate.value = '';
    reason.value = '';
    await loadLeaveRequests();
  } catch (err: any) {
    formError.value =
      err.message ||
      (isInternAccount.value
        ? 'Gagal mengajukan permohonan izin / sakit.'
        : 'Gagal mengajukan permohonan cuti.');
    showToast(formError.value, true);
  } finally {
    submitting.value = false;
  }
}

function handleReset() {
  leaveType.value = isInternAccount.value ? 'PERMIT' : 'ANNUAL';
  startDate.value = '';
  endDate.value = '';
  reason.value = '';
  formError.value = '';
}

function resetHistoryFilters() {
  activeFilter.value = 'ALL';
  searchQuery.value = '';
}

function openCancelModal(req: LeaveRequestItem) {
  cancelTarget.value = req;
}

function closeCancelModal() {
  if (cancellingId.value) return;
  cancelTarget.value = null;
}

async function confirmCancel() {
  const target = cancelTarget.value;
  if (!target) return;
  cancellingId.value = target.id;
  try {
    await apiClient(`/leave/${target.id}/cancel`, {
      method: 'POST',
    });
    cancelTarget.value = null;
    showToast(
      isInternAccount.value
        ? 'Permohonan izin / sakit berhasil dibatalkan.'
        : 'Permohonan cuti berhasil dibatalkan.',
    );
    await loadLeaveRequests();
  } catch (err: any) {
    showToast(
      err.message ||
        (isInternAccount.value
          ? 'Gagal membatalkan permohonan izin / sakit.'
          : 'Gagal membatalkan permohonan cuti.'),
      true,
    );
  } finally {
    cancellingId.value = null;
  }
}

function formatDateRange(startStr: string, endStr: string) {
  return formatDateRangeWib(startStr, endStr);
}

onMounted(() => {
  loadLeaveRequests();
});
</script>

<template>
  <div class="leave-layout">
    <!-- Topbar -->
    <TopBar :breadcrumb="isInternAccount ? 'Workspace / Izin & Sakit Saya' : 'Workspace / Cuti Saya'" />

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
          <span class="eyebrow">Manajemen Kehadiran &amp; Ketidakhadiran Sah</span>
          <h1>{{ isInternAccount ? 'Pengajuan & Riwayat Izin / Sakit' : 'Pengajuan & Riwayat Cuti' }}</h1>
          <p class="subtitle">
            {{
              isInternAccount
                ? 'Ajukan permohonan izin atau sakit dan pantau status persetujuan serta penyesuaian kehadiran harian Anda di satu tempat.'
                : 'Ajukan permohonan cuti dan pantau status persetujuan serta penyesuaian kehadiran harian Anda di satu tempat.'
            }}
          </p>
        </div>
        <span class="pill neutral"><span class="dot-sm"></span>Pengajuan Milik Saya</span>
      </div>

      <div class="layout-grid">
        <!-- Form Panel -->
        <section class="panel form-panel" aria-labelledby="form-title">
          <div class="panel-head">
            <div>
              <h2 id="form-title">{{ isInternAccount ? 'Ajukan Permohonan Izin / Sakit' : 'Ajukan Permohonan Cuti' }}</h2>
              <p class="panel-subtitle">
                {{ isInternAccount ? 'Tentukan rentang tanggal izin atau sakit yang diajukan.' : 'Tentukan rentang tanggal cuti yang diajukan.' }}
              </p>
            </div>
          </div>
          <div class="panel-body">
            <!-- Kartu Informasi Status Intern vs Jatah Cuti Tahunan 12 Hari (Paket #1) -->
            <div v-if="isInternAccount" class="intern-leave-banner" data-testid="intern-leave-info">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge-intern">Intern</span>
                <strong>Aturan Izin Karyawan Magang</strong>
              </div>
              <p>
                Karyawan berstatus Intern tidak memiliki jatah cuti tahunan, namun tetap dapat mengajukan <strong>Izin</strong> (dengan alasan yang jelas dan logis) atau <strong>Sakit</strong>.
              </p>
            </div>

            <div
              v-else-if="leaveQuota && leaveQuota.hasAnnualQuota"
              class="annual-quota-box"
              data-testid="annual-leave-quota"
            >
              <div class="quota-top">
                <span class="quota-title">Jatah Cuti Tahunan {{ leaveQuota.year }}</span>
                <strong class="quota-remaining">Tersisa {{ leaveQuota.remainingDays }} dari {{ leaveQuota.annualQuotaDays }} hari kerja</strong>
              </div>
              <div class="quota-meta">
                <span>Disetujui: {{ leaveQuota.usedDays }} hari</span>
                <span>·</span>
                <span>Menunggu Review: {{ leaveQuota.pendingDays }} hari</span>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="field">
                <label for="leaveType">{{ isInternAccount ? 'Jenis Pengajuan' : 'Jenis Cuti / Izin' }} <span class="required">*</span></label>
                <div class="input-wrap">
                  <Tag :size="16" class="field-icon" />
                  <select
                    id="leaveType"
                    v-model="leaveType"
                    class="input select-input"
                    required
                  >
                    <option
                      v-for="opt in leaveTypeOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label for="startDate">Tanggal mulai <span class="required">*</span></label>
                <div class="input-wrap">
                  <Calendar :size="16" class="field-icon" />
                  <input
                    id="startDate"
                    v-model="startDate"
                    type="date"
                    class="input"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label for="endDate">Tanggal selesai <span class="required">*</span></label>
                <div class="input-wrap">
                  <Calendar :size="16" class="field-icon" />
                  <input
                    id="endDate"
                    v-model="endDate"
                    type="date"
                    class="input"
                    :min="startDate || undefined"
                    required
                  />
                </div>
                <div
                  v-if="isValidDateOrder"
                  class="duration-hint"
                  :class="{ 'is-warning': isWeekendOnlySelection }"
                >
                  <template v-if="isWeekendOnlySelection">
                    <strong>0 hari kerja</strong> (akhir pekan Sabtu/Minggu sudah hari libur). Pilih minimal 1 hari kerja Senin–Jumat.
                  </template>
                  <template v-else>
                    {{ isInternAccount ? 'Durasi izin:' : 'Durasi cuti:' }} <strong>{{ requestedWorkingDays }} hari kerja</strong>
                  </template>
                </div>
                <div v-if="exceedsAnnualQuota" class="duration-quota-warn" data-testid="quota-exceeded-hint">
                  Melebihi sisa jatah Cuti Tahunan Anda ({{ leaveQuota?.remainingDays }} hari kerja tersisa).
                </div>
              </div>

              <div class="field">
                <label for="reason">Alasan <span class="required">*</span></label>
                <textarea
                  id="reason"
                  v-model="reason"
                  class="textarea"
                  rows="3"
                  maxlength="1000"
                  required
                  :placeholder="isInternAccount ? 'Tuliskan alasan pengajuan izin/sakit secara singkat dan jelas (minimal 5 karakter).' : 'Tuliskan alasan pengajuan cuti secara singkat dan jelas (minimal 5 karakter).'"
                ></textarea>
                <div class="field-meta-row" data-testid="reason-char-counter">
                  <span :class="{ 'counter-valid': reasonTrimmedLength >= 5 }">
                    {{ reasonTrimmedLength }} / 5 karakter minimum
                  </span>
                  <span>{{ reason.length }} / 1.000</span>
                </div>
              </div>

              <!-- Note Info Blue: Penyesuaian Pasca-Batas Waktu Pagi -->
              <div class="info-note">
                <Info :size="18" class="info-icon" />
                <div>
                  <strong>{{ isInternAccount ? 'Ketentuan Pengajuan Izin / Sakit:' : 'Ketentuan Pengajuan Cuti:' }}</strong> Tanggal yang masih berstatus
                  <strong>Menunggu Review</strong> belum membebaskan kewajiban check-in harian hingga disetujui oleh atasan. Apabila {{ isInternAccount ? 'izin atau sakit mendadak' : 'cuti darurat/mendadak' }} baru disetujui setelah batas waktu laporan pagi yang berlaku, status belum mengisi komitmen pada hari tersebut otomatis <strong>diputihkan menjadi {{ isInternAccount ? 'Izin Disetujui' : 'Cuti Disetujui' }}</strong> (bebas dari catatan ketidakpatuhan).
                </div>
              </div>

              <div v-if="formError" class="error-banner" role="alert">
                {{ formError }}
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="handleReset">
                  <RotateCcw :size="15" />
                  <span>Bersihkan</span>
                </button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <Send :size="15" />
                  <span>{{ submitting ? 'Mengajukan...' : 'Ajukan Permohonan' }}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- History Panel -->
        <section class="panel" aria-labelledby="history-title">
          <div class="panel-head">
            <div>
              <h2 id="history-title">{{ isInternAccount ? 'Riwayat Permohonan Izin / Sakit' : 'Riwayat Permohonan Cuti' }}</h2>
              <p class="panel-subtitle">
                {{
                  isInternAccount
                    ? 'Pantau status persetujuan dan jejak penyesuaian kehadiran untuk setiap izin atau sakit yang Anda ajukan.'
                    : 'Pantau status persetujuan dan jejak penyesuaian kehadiran untuk setiap cuti yang Anda ajukan.'
                }}
              </p>
            </div>
            <span class="pill neutral">{{ filteredRequests.length }} permohonan</span>
          </div>

          <div class="list-tools">
            <div class="search-wrap">
              <Search :size="16" class="search-icon" />
              <input
                v-model="searchQuery"
                type="search"
                class="search-input"
                placeholder="Cari alasan, jenis, peninjau, atau tanggal..."
                aria-label="Cari alasan, jenis, peninjau, atau tanggal"
              />
            </div>

            <div class="filters" role="group" aria-label="Filter status">
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'ALL' }"
                :aria-pressed="activeFilter === 'ALL'"
                @click="activeFilter = 'ALL'"
              >
                Semua
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'PENDING' }"
                :aria-pressed="activeFilter === 'PENDING'"
                @click="activeFilter = 'PENDING'"
              >
                Menunggu
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'APPROVED' }"
                :aria-pressed="activeFilter === 'APPROVED'"
                @click="activeFilter = 'APPROVED'"
              >
                Disetujui
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'REJECTED' }"
                :aria-pressed="activeFilter === 'REJECTED'"
                @click="activeFilter = 'REJECTED'"
              >
                Ditolak
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: activeFilter === 'CANCELLED' }"
                :aria-pressed="activeFilter === 'CANCELLED'"
                @click="activeFilter = 'CANCELLED'"
              >
                Dibatalkan
              </button>
            </div>
          </div>

          <div v-if="loading" class="empty-state">
            <Clock :size="24" class="spin" />
            <p>{{ isInternAccount ? 'Memuat riwayat permohonan izin / sakit...' : 'Memuat riwayat permohonan cuti...' }}</p>
          </div>

          <div v-else-if="leaveRequests.length === 0" class="empty-state">
            <Calendar :size="32" />
            <p>{{ isInternAccount ? 'Belum ada riwayat permohonan izin atau sakit.' : 'Belum ada riwayat permohonan cuti.' }}</p>
          </div>

          <div v-else-if="filteredRequests.length === 0" class="empty-state">
            <Search :size="28" />
            <p>Tidak ada permohonan yang cocok dengan pencarian atau filter status.</p>
            <button
              type="button"
              class="btn-reset-filters"
              data-testid="reset-filters-btn"
              @click="resetHistoryFilters"
            >
              Tampilkan Semua
            </button>
          </div>

          <div v-else class="table-wrap">
            <table class="leave-table">
              <thead>
                <tr>
                  <th scope="col" class="col-date">{{ isInternAccount ? 'Tanggal Izin / Sakit' : 'Tanggal Cuti' }}</th>
                  <th scope="col" class="col-reason">Alasan &amp; Jejak Pengajuan</th>
                  <th scope="col" class="col-status">Status Persetujuan</th>
                  <th scope="col" class="col-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in filteredRequests" :key="req.id">
                  <td>
                    <span class="pill-type">{{ formatLeaveType(req.leaveType) }}</span>
                    <div class="date-main wp-datetime">{{ formatDateRange(req.startDate, req.endDate) }}</div>
                    <div class="date-sub">{{ calculateDuration(req.startDate, req.endDate) }} hari kerja</div>
                  </td>
                  <td>
                    <div class="reason-text">{{ formatReason(req.reason) }}</div>
                    <div class="request-id">
                      #{{ formatRequestCode(req) }} · Diajukan <span class="wp-datetime">{{ formatDateWib(req.createdAt) }}</span>
                    </div>
                    <div v-if="req.reconciled || req.reconciliationNote" class="reconcile-note">
                      <strong>Pemutihan Kehadiran Otomatis:</strong> {{ req.reconciliationNote || (isInternAccount ? 'Catatan belum check-in pagi otomatis diputihkan menjadi Izin Disetujui.' : 'Catatan belum check-in pagi otomatis diputihkan menjadi Cuti Disetujui.') }}
                    </div>
                    <div v-if="req.reviewNote || req.reviewNotes" class="review-note" :class="{ rejected: req.status === 'REJECTED' }">
                      <span class="review-note-label">Catatan Reviewer{{ req.reviewedBy?.fullName ? ` (${req.reviewedBy.fullName})` : '' }}:</span>
                      <span class="review-note-body">"{{ req.reviewNote || req.reviewNotes }}"</span>
                    </div>
                  </td>
                  <td class="status-cell">
                    <div class="status-line">
                      <span v-if="req.status === 'PENDING'" class="pill blue">Menunggu Review</span>
                      <span v-else-if="req.status === 'APPROVED'" class="pill green">Disetujui</span>
                      <span v-else-if="req.status === 'REJECTED'" class="pill red">Ditolak</span>
                      <span v-else-if="req.status === 'CANCELLED'" class="pill neutral">Dibatalkan</span>
                      <span v-else class="pill neutral">{{ req.status }}</span>

                      <span v-if="req.reconciled" class="pill neutral">{{ isInternAccount ? 'Izin Disetujui (Bebas Check-In)' : 'Cuti Disetujui (Bebas Check-In)' }}</span>
                    </div>
                    <span v-if="req.status === 'PENDING'" class="status-sub">
                      Menunggu keputusan atasan
                    </span>
                    <span v-else-if="req.status === 'APPROVED'" class="status-sub">
                      Disetujui · Check-in harian dikecualikan
                    </span>
                    <span v-else-if="req.status === 'REJECTED'" class="status-sub">
                      Ditolak · Check-in harian tetap berlaku
                    </span>
                    <span v-else-if="req.status === 'CANCELLED'" class="status-sub">
                      Dibatalkan mandiri
                    </span>
                  </td>
                  <td class="col-action-cell">
                    <button
                      v-if="req.status === 'PENDING'"
                      type="button"
                      class="btn-cancel"
                      :disabled="cancellingId === req.id"
                      @click="openCancelModal(req)"
                    >
                      {{ cancellingId === req.id ? 'Membatalkan...' : 'Batalkan' }}
                    </button>
                    <span v-else class="no-action-text">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <!-- In-app Cancel Confirmation Modal -->
    <div
      v-if="cancelTarget"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      data-testid="cancel-confirm-modal"
      @click.self="closeCancelModal"
    >
      <div class="modal-card">
        <div class="modal-head">
          <h3 id="cancel-modal-title">
            {{ isInternAccount ? 'Batalkan Permohonan Izin / Sakit?' : 'Batalkan Permohonan Cuti?' }}
          </h3>
          <button
            type="button"
            class="modal-close"
            aria-label="Tutup jendela konfirmasi"
            :disabled="Boolean(cancellingId)"
            @click="closeCancelModal"
          >
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-lead">
            {{
              isInternAccount
                ? 'Apakah Anda yakin ingin membatalkan pengajuan izin atau sakit berikut? Pengajuan yang dibatalkan tidak akan diproses oleh atasan.'
                : 'Apakah Anda yakin ingin membatalkan pengajuan cuti berikut? Pengajuan yang dibatalkan tidak akan diproses dan sisa jatah cuti akan tetap utuh.'
            }}
          </p>
          <div class="modal-summary">
            <div class="modal-summary-row">
              <span>Jenis</span>
              <strong>{{ formatLeaveType(cancelTarget.leaveType) }}</strong>
            </div>
            <div class="modal-summary-row">
              <span>Tanggal</span>
              <strong>
                {{ formatDateRange(cancelTarget.startDate, cancelTarget.endDate) }}
                ({{ calculateDuration(cancelTarget.startDate, cancelTarget.endDate) }} hari kerja)
              </strong>
            </div>
            <div class="modal-summary-row">
              <span>Alasan</span>
              <strong>{{ formatReason(cancelTarget.reason) }}</strong>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="Boolean(cancellingId)"
            @click="closeCancelModal"
          >
            Kembali
          </button>
          <button
            type="button"
            class="btn btn-danger"
            data-testid="confirm-cancel-btn"
            :disabled="Boolean(cancellingId)"
            @click="confirmCancel"
          >
            {{ cancellingId ? 'Membatalkan...' : 'Ya, Batalkan Permohonan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
}

.annual-quota-box {
  background: #EFF5F2;
  border: 1px solid #A9C7BC;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.quota-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.quota-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #0E211B;
}

.quota-remaining {
  font-size: 13px;
  color: #00674D;
}

.quota-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: #5C6E68;
}

.intern-leave-banner {
  background: #F5F3FF;
  border: 1px solid #C4B5FD;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 12.5px;
  color: #4C1D95;
  line-height: 1.5;
}

.intern-leave-banner p {
  margin: 0;
}

.badge-intern {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #EDE9FE;
  color: #5B21B6;
  border: 1px solid #C4B5FD;
  font-size: 11px;
  font-weight: 700;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-primary, #00674D);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary, #5C6E68);
  max-width: 720px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;
}

.panel-head {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.panel-head h2 {
  font-size: 16px;
  font-weight: 800;
}

.panel-subtitle {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.panel-body {
  padding: 20px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.required {
  color: #DC2626;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary, #5C6E68);
  pointer-events: none;
}

.input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  font-size: 13.5px;
}

.duration-hint {
  font-size: 12px;
  color: var(--color-brand-primary, #00674D);
  margin-top: 6px;
}

.duration-hint.is-warning {
  color: #B45309;
  background: #FEF3C7;
  border: 1px solid #FDE68A;
  padding: 6px 10px;
  border-radius: 6px;
}

.duration-quota-warn {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #B45309;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  padding: 6px 10px;
  border-radius: 6px;
}

.field-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.field-meta-row .counter-valid {
  color: var(--color-brand-primary, #00674D);
  font-weight: 600;
}

.select-input {
  cursor: pointer;
  background-color: #FFFFFF;
  padding-right: 36px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.pill-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background: #E8F5E9;
  color: #1B5E20;
  border: 1px solid #C8E6C9;
  margin-bottom: 4px;
}

.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  font-size: 13.5px;
  resize: vertical;
}

.info-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #E0F2FE;
  border: 1px solid #7DD3FC;
  border-radius: 8px;
  padding: 12px;
  font-size: 12.5px;
  color: #075985;
  line-height: 1.45;
  margin-bottom: 16px;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.error-banner {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-secondary {
  background: #FFFFFF;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: #00543F;
}

.list-tools {
  padding: 14px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary, #5C6E68);
}

.search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 6px;
  font-size: 13px;
}

.filters {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.filter-btn.active {
  background: #E6F4EE;
  color: var(--color-brand-primary, #00674D);
  border-color: #86EFAC;
}

.table-wrap {
  overflow-x: auto;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
}

.leave-table th {
  text-align: left;
  padding: 10px 18px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.leave-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  vertical-align: top;
}

.col-date {
  width: 18%;
  min-width: 130px;
  white-space: nowrap;
}

.col-reason {
  width: 44%;
  min-width: 220px;
}

.col-status {
  width: 26%;
  min-width: 180px;
}

.col-action {
  width: 12%;
  min-width: 110px;
  text-align: center !important;
  white-space: nowrap;
}

.col-action-cell {
  text-align: center !important;
  vertical-align: middle !important;
  min-width: 110px;
}

.date-main {
  font-weight: 700;
  font-size: 13.5px;
}

.date-sub {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.reason-text {
  font-weight: 600;
  font-size: 13.5px;
}

.request-id {
  font-size: 11.5px;
  font-family: monospace;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 3px;
}

.reconcile-note {
  margin-top: 6px;
  padding: 6px 10px;
  background: #F1F5F9;
  border-left: 3px solid #00674D;
  border-radius: 4px;
  font-size: 12px;
  color: #334155;
}

.review-note {
  margin-top: 6px;
  padding: 6px 10px;
  background: #F0FDF4;
  border-left: 3px solid #16A34A;
  border-radius: 4px;
  font-size: 12px;
  color: #14532D;
  line-height: 1.4;
}

.review-note.rejected {
  background: #FEF2F2;
  border-left-color: #DC2626;
  color: #991B1B;
}

.review-note-label {
  font-weight: 700;
  display: block;
  margin-bottom: 2px;
}

.review-note-body {
  font-style: italic;
}

.status-cell {
  min-width: 200px;
}

.status-line {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.status-sub {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 4px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid transparent;
}

.pill.blue {
  background: #E0F2FE;
  color: #075985;
  border-color: #7DD3FC;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border-color: #86EFAC;
}

.pill.red {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.pill.neutral {
  background: #F1F5F9;
  color: #334155;
  border-color: #CBD5E1;
}

.dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-brand-primary, #00674D);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--color-text-secondary, #5C6E68);
  gap: 12px;
}

.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: #DCFCE7;
  border: 1px solid #86EFAC;
  color: #166534;
}

.toast-popup.error {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}

.spin {
  animation: spin 1s linear infinite;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #BE123C;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #FFE4E6;
  border-color: #FDA4AF;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-action-text {
  display: inline-block;
  color: var(--color-text-secondary, #94A3B8);
  font-size: 14px;
}

.btn-reset-filters {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  background: #FFFFFF;
  color: var(--color-brand-primary, #00674D);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-reset-filters:hover {
  background: #EFF5F2;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1200;
}

.modal-card {
  width: 100%;
  max-width: 460px;
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  box-shadow: 0 20px 44px rgba(14, 33, 27, 0.18);
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.modal-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary, #0E211B);
}

.modal-close {
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover:not(:disabled) {
  background: #F1F5F9;
  color: var(--color-text-primary, #0E211B);
}

.modal-body {
  padding: 18px 20px;
}

.modal-lead {
  margin: 0 0 14px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-text-secondary, #5C6E68);
}

.modal-summary {
  background: #F8FAF9;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  font-size: 12.5px;
}

.modal-summary-row span {
  color: var(--color-text-secondary, #5C6E68);
  flex-shrink: 0;
}

.modal-summary-row strong {
  color: var(--color-text-primary, #0E211B);
  text-align: right;
  word-break: break-word;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  background: #F8FAF9;
  border-top: 1px solid var(--color-border-subtle, #DCE7E2);
}

.btn-danger {
  background: #DC2626;
  color: #FFFFFF;
}

.btn-danger:hover:not(:disabled) {
  background: #B91C1C;
}

.btn-danger:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters {
  flex-wrap: wrap;
}

.filter-btn,
.pill {
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 1180px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 14px 36px;
  }

  h1 {
    font-size: 20px;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
  }

  .panel-body {
    padding: 16px;
  }

  .list-tools {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrap {
    min-width: 0;
  }

  .filters {
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .form-actions,
  .modal-actions {
    flex-direction: column-reverse;
  }

  .form-actions .btn,
  .modal-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .toast-popup {
    left: 14px;
    right: 14px;
    top: 14px;
  }

  .table-wrap {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
