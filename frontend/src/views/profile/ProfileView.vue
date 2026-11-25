<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { getUserInitials } from '../../utils/initials';
import { formatDateRangeWib, formatDateWib } from '../../utils/dateTime';
import { formatEmploymentStatusLabel, isInternStatus } from '../../utils/employmentStatus';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Eye,
  EyeOff,
  Circle,
  Info,
  Bell,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isLoggingOut = ref(false);

// Pemisahan Nama Lengkap dan Jabatan (IMP-021): Bersihkan string tanda kurung peran/posisi bila ada
const sanitizedFullName = computed(() => {
  const raw = authStore.user?.fullName;
  if (!raw) return '-';
  return raw.replace(/\s*\([^)]*\)/g, '').trim() || raw;
});

const userInitials = computed(() => {
  return getUserInitials(sanitizedFullName.value, authStore.user?.email);
});

// Form Password State
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrPwd = ref(false);
const showNewPwd = ref(false);
const showConfirmPwd = ref(false);
const revokeOtherSessions = ref(true);

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);

// Notification Permission State
const pushPermission = ref<'granted' | 'denied' | 'default' | 'unsupported'>('default');

onMounted(async () => {
  if (!authStore.user) {
    const u = await authStore.fetchMe();
    if (!u) {
      router.replace('/login');
      return;
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    pushPermission.value = 'unsupported';
  } else {
    pushPermission.value = Notification.permission as 'granted' | 'denied' | 'default';
  }
});

// Kode ringkas ramah-baca tanpa UUID panjang
const formattedNik = computed(() => {
  const id = authStore.user?.id;
  if (!id) return '-';
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    return `#USR-${id.slice(0, 8).toUpperCase()}`;
  }
  return id.toUpperCase();
});

const statusLabel = computed(() => {
  return authStore.user?.status === 'ACTIVE' || !authStore.user?.status
    ? 'Aktif · Terdaftar'
    : authStore.user?.status;
});

const formattedRole = computed(() => {
  const r = authStore.user?.role;
  switch (r) {
    case 'EMPLOYEE':
      return 'Karyawan';
    case 'SUPERVISOR':
      return 'Supervisor';
    case 'HEAD':
    case 'HEAD_OF_DEPARTMENT':
      return 'Kepala Divisi';
    case 'PROJECT_MANAGER':
      return 'Manajer Proyek';
    case 'HRGA':
      return 'HRGA';
    case 'CEO_MANAGEMENT':
    case 'CEO':
      return 'Direktur / Manajemen';
    case 'SYSTEM_ADMIN':
      return 'Admin Sistem';
    default:
      return r || 'Karyawan';
  }
});

const formattedJobTitle = computed(() => {
  if (authStore.user?.jobTitle) return authStore.user.jobTitle;

  const email = authStore.user?.email || '';
  if (email.includes('frontend')) return 'Frontend Engineer';
  if (email.includes('backend')) return 'Backend Engineer';
  if (email.includes('designer')) return 'UI/UX Designer';

  const r = authStore.user?.role;
  switch (r) {
    case 'SUPERVISOR':
      return 'Supervisor';
    case 'HEAD':
    case 'HEAD_OF_DEPARTMENT':
      return 'Kepala Divisi';
    case 'PROJECT_MANAGER':
      return 'Manajer Proyek';
    case 'HRGA':
      return 'Petugas HRGA';
    case 'CEO_MANAGEMENT':
    case 'CEO':
      return 'Direktur';
    case 'SYSTEM_ADMIN':
      return 'Admin Sistem';
    default:
      return '-';
  }
});

const formattedFunction = computed(() => {
  const fn = authStore.user?.function;
  if (fn) {
    if (fn === 'OperationsInfrastructure') return 'Operations & Infrastructure';
    if (fn === 'RnD') return 'R&D & Technical Advisory';
    if (fn === 'SalesEnablementPresales') return 'Commercial (Sales Enablement & Presales)';
    if (fn === 'BusinessDevelopment') return 'Commercial (Business Development)';
    return fn;
  }

  const r = authStore.user?.role;
  switch (r) {
    case 'HRGA':
      return 'HRGA';
    case 'CEO_MANAGEMENT':
    case 'CEO':
      return 'Management';
    case 'SYSTEM_ADMIN':
      return 'Operations & Infrastructure';
    default:
      return '-';
  }
});

const formattedManager = computed(() => {
  if (authStore.user?.managerName) {
    return authStore.user.managerName.replace(/\s*\([^)]*\)/g, '').trim();
  }
  const r = authStore.user?.role;
  if (r === 'CEO_MANAGEMENT' || r === 'CEO') return 'Dewan Komisaris';
  return '-';
});

const formattedEffectiveDate = computed(() => {
  const raw = authStore.user?.assignmentEffectiveDate;
  if (!raw) return '-';
  return formatDateWib(raw);
});

const isInternUser = computed(() => isInternStatus(authStore.user?.employmentStatus));

const formattedEmploymentStatus = computed(() =>
  formatEmploymentStatusLabel(authStore.user?.employmentStatus),
);

const formattedInternEndDate = computed(() => {
  const raw = authStore.user?.assignmentEndDate;
  if (!raw) return '-';
  return formatDateWib(raw);
});

const formattedExemption = computed(() => {
  const ex = authStore.user?.activeExemption;
  if (ex?.type === 'BOUNDED') {
    const rangeText =
      ex.startDate && ex.endDate ? ` (${formatDateRangeWib(ex.startDate, ex.endDate)})` : '';
    return `Dispensasi Aktif: ${ex.category}${rangeText}`;
  }
  if (ex?.type === 'PERMANENT') {
    const startText = ex.startDate ? ` (Mulai ${formatDateWib(ex.startDate)})` : '';
    return `Pengecualian Permanen: ${ex.category}${startText} · Lapor Blocker tetap aktif`;
  }
  const r = authStore.user?.role;
  if (ex?.type === 'ROLE_INDEFINITE' || r === 'CEO_MANAGEMENT' || r === 'CEO') {
    return 'Pengecualian Peran Eksekutif (Pengisian Opsional)';
  }
  return 'Tidak Ada Dispensasi Aktif';
});

const morningReminderDisplay = computed(
  () => authStore.user?.reminderSchedule?.morningReminderTime || '08:00',
);
const eodReminderDisplay = computed(
  () => authStore.user?.reminderSchedule?.eodReminderTime || '16:00',
);

// Real-Time Password Validation Criteria
const isMinLengthMet = computed(() => newPassword.value.length >= 8);
const isAlnumMet = computed(() => {
  const p = newPassword.value;
  return /[a-zA-Z]/.test(p) && /[0-9]/.test(p);
});
const isDiffMet = computed(() => {
  return (
    newPassword.value.length > 0 &&
    newPassword.value !== currentPassword.value
  );
});

const passwordScore = computed(() => {
  const p = newPassword.value;
  if (!p) return 0;
  let score = 0;
  if (isMinLengthMet.value) score++;
  if (isAlnumMet.value) score++;
  if (isDiffMet.value) score++;
  if (/[^a-zA-Z0-9]/.test(p) || p.length >= 12) score++;
  return Math.min(score, 4);
});

const strengthLabel = computed(() => {
  switch (passwordScore.value) {
    case 1:
      return 'Sangat Lemah (1/4 segmen)';
    case 2:
      return 'Cukup (2/4 segmen)';
    case 3:
      return 'Kuat (3/4 segmen)';
    case 4:
      return 'Sangat Kuat (4/4 segmen)';
    default:
      return 'Belum diisi (0/4 segmen)';
  }
});

// Notification Push Card Computeds (Bahasa Indonesia Penuh)
const pushPillClass = computed(() => {
  if (pushPermission.value === 'granted') return 'green';
  if (pushPermission.value === 'denied') return 'red';
  if (pushPermission.value === 'unsupported') return 'neutral';
  return 'amber';
});

const pushStatusHeaderLabel = computed(() => {
  if (pushPermission.value === 'granted') return 'Aktif di Perangkat Ini';
  if (pushPermission.value === 'denied') return 'Diblokir Peramban';
  if (pushPermission.value === 'unsupported') return 'Tidak Didukung Peramban';
  return 'Belum Diatur';
});

const pushStatusShortLabel = computed(() => {
  if (pushPermission.value === 'granted') return 'Aktif';
  if (pushPermission.value === 'denied') return 'Diblokir';
  if (pushPermission.value === 'unsupported') return 'Tidak Didukung';
  return 'Belum Diatur';
});

const pushStatusDesc = computed(() => {
  if (pushPermission.value === 'granted') {
    return 'Status izin dan langganan aktif khusus pada peramban atau perangkat yang sedang Anda gunakan saat ini.';
  }
  if (pushPermission.value === 'denied') {
    return 'Izin notifikasi ditolak pada peramban ini. Anda dapat mengaktifkannya kembali lewat pengaturan izin situs di peramban.';
  }
  if (pushPermission.value === 'unsupported') {
    return 'Peramban pada perangkat ini tidak mendukung notifikasi langsung. Pemberitahuan tetap tersedia melalui email dan Pusat Notifikasi.';
  }
  return 'Status izin dan langganan berlaku khusus pada peramban atau perangkat yang sedang Anda gunakan saat ini.';
});

async function handleChangePassword() {
  errorMessage.value = null;
  successMessage.value = null;

  if (!currentPassword.value) {
    errorMessage.value = 'Kata sandi saat ini wajib diisi.';
    return;
  }
  if (!newPassword.value || newPassword.value.length < 8) {
    errorMessage.value = 'Kata sandi baru minimal 8 karakter.';
    return;
  }
  if (!isAlnumMet.value) {
    errorMessage.value = 'Kata sandi baru harus kombinasi huruf dan angka.';
    return;
  }
  if (newPassword.value === currentPassword.value) {
    errorMessage.value = 'Kata sandi baru harus berbeda dari kata sandi saat ini.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.';
    return;
  }

  isLoading.value = true;
  try {
    const msg = await authStore.changePassword(
      currentPassword.value,
      newPassword.value,
      revokeOtherSessions.value,
    );
    successMessage.value = msg || 'Kata sandi berhasil diperbarui.';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memperbarui kata sandi.';
  } finally {
    isLoading.value = false;
  }
}

async function handleLogout() {
  isLoggingOut.value = true;
  await authStore.logout();
  router.replace('/login');
}
</script>

<template>
  <div class="profile-layout" data-testid="profile-layout">
    <!-- Global TopBar (IMP-018, IMP-019) -->
    <TopBar breadcrumb="Profil Akun" />

    <main v-if="isLoggingOut || !authStore.user" id="main-content" class="content">
      <div class="profile-loading-state" data-testid="profile-loading-state">
        <p>{{ isLoggingOut ? 'Mengakhiri sesi masuk...' : 'Memuat data profil akun...' }}</p>
      </div>
    </main>

    <main v-else id="main-content" class="content">
      <!-- Page Heading -->
      <div class="page-heading">
        <div class="eyebrow">Identitas &amp; Konteks Akun</div>
        <h1 data-testid="profile-page-title">Profil Pengguna &amp; Keamanan Akun</h1>
        <p class="subtitle">
          Informasi identitas resmi, penugasan organisasi aktif, pembaruan kata sandi mandiri, serta ringkasan kanal notifikasi pada perangkat ini.
        </p>
      </div>

      <!-- Hero Identity Strip (IMP-021 & IMP-022) -->
      <div class="profile-hero-card" data-testid="profile-hero-card">
        <div class="hero-avatar avatar-large" data-testid="profile-hero-avatar">
          {{ userInitials }}
        </div>
        <div class="hero-info">
          <div class="hero-title-row">
            <span class="hero-name" data-testid="profile-hero-name">{{ sanitizedFullName }}</span>
            <span v-if="isInternUser" class="badge-intern" data-testid="profile-intern-badge">Intern</span>
            <span class="pill neutral mono-id" data-testid="profile-hero-id">{{ formattedNik }}</span>
            <span class="status-badge" data-testid="profile-status-badge">
              <span class="status-indicator-dot"></span>
              <span>{{ statusLabel }}</span>
            </span>
          </div>
          <div class="hero-meta" data-testid="profile-hero-meta">
            <span class="hero-email">{{ authStore.user?.email || '-' }}</span>
            <span class="meta-dot">·</span>
            <span class="hero-job-title">{{ formattedJobTitle }}</span>
            <span class="meta-dot">·</span>
            <span class="hero-department">{{ formattedFunction }}</span>
          </div>
        </div>
      </div>

      <!-- PANEL 1: Kartu Identitas & Penugasan Aktif -->
      <section class="panel" aria-labelledby="panel1-title" data-testid="panel-identity">
        <div class="panel-head">
          <div>
            <h2 id="panel1-title">1. Kartu Identitas &amp; Penugasan Aktif</h2>
            <p>Data identitas resmi dan pemetaan organisasi yang berlaku saat ini pada setiap laporan harian Anda.</p>
          </div>
          <span class="pill neutral">Data Organisasi Terpusat</span>
        </div>
        <div class="panel-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nama Lengkap</span>
              <span class="info-value" data-testid="info-fullname">{{ sanitizedFullName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Kode Akun / ID</span>
              <span class="info-value mono-id" data-testid="info-nik">{{ formattedNik }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Alamat Email Resmi</span>
              <span class="info-value mono-id" data-testid="info-email">{{ authStore.user?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Jabatan</span>
              <span class="info-value" data-testid="info-jobtitle">{{ formattedJobTitle }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status Karyawan</span>
              <span class="info-value" data-testid="info-employment-status">
                <span
                  :class="isInternUser ? 'badge-intern' : authStore.user?.employmentStatus === 'CONTRACT' ? 'badge-contract' : 'badge-permanent'"
                >
                  {{ formattedEmploymentStatus }}
                </span>
              </span>
            </div>
            <div v-if="isInternUser && authStore.user?.assignmentEndDate" class="info-item">
              <span class="info-label">Masa Magang Berakhir</span>
              <span class="info-value wp-datetime" data-testid="info-intern-enddate">{{ formattedInternEndDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Peran Akses Sistem</span>
              <span class="info-value" data-testid="info-role">{{ formattedRole }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Divisi / Fungsi</span>
              <span class="info-value" data-testid="info-function">{{ formattedFunction }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Atasan Langsung</span>
              <span class="info-value" data-testid="info-manager">{{ formattedManager }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tanggal Efektif Penugasan</span>
              <span class="info-value tabular-nums" data-testid="info-effdate">{{ formattedEffectiveDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status Dispensasi Kerja</span>
              <span class="info-value" data-testid="info-exemption">{{ formattedExemption }}</span>
            </div>
          </div>

          <div class="info-note-box" data-testid="profile-governance-note">
            <Info :size="18" class="note-icon" />
            <div>
              Seluruh data identitas, divisi kerja, atasan langsung, dan status dispensasi kerja dikelola secara terpusat oleh tim HRGA &amp; Admin Sistem melalui menu Struktur Organisasi. Jika terdapat pembaruan jabatan atau mutasi unit kerja, silakan hubungi HRGA.
            </div>
          </div>
        </div>
      </section>

      <!-- PANEL 2: Keamanan & Pembaruan Kata Sandi Mandiri -->
      <section class="panel" aria-labelledby="panel2-title" data-testid="panel-security">
        <div class="panel-head">
          <div>
            <h2 id="panel2-title">2. Keamanan &amp; Kata Sandi — Pembaruan Mandiri</h2>
            <p>Kelola keamanan kata sandi akun Anda secara mandiri dengan pemeriksaan syarat kata sandi secara langsung.</p>
          </div>
        </div>
        <div class="panel-body">
          <div
            v-if="successMessage"
            class="alert-banner success"
            data-testid="pwd-success-banner"
            role="status"
          >
            <CheckCircle2 :size="18" />
            <span>{{ successMessage }}</span>
          </div>
          <div
            v-if="errorMessage"
            class="alert-banner error"
            data-testid="pwd-error-banner"
            role="alert"
          >
            <AlertCircle :size="18" />
            <span>{{ errorMessage }}</span>
          </div>

          <form style="max-width: 560px; position: relative;" novalidate @submit.prevent="handleChangePassword">
            <input
              type="text"
              name="username"
              :value="authStore.user?.email || ''"
              autocomplete="username"
              class="sr-only"
              tabindex="-1"
              aria-hidden="true"
            />

            <!-- Kata Sandi Saat Ini -->
            <div class="form-group">
              <label class="form-label" for="curr-pwd">Kata Sandi Saat Ini</label>
              <div class="input-container">
                <input
                  id="curr-pwd"
                  v-model="currentPassword"
                  :type="showCurrPwd ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi saat ini"
                  required
                  autocomplete="current-password"
                  @input="errorMessage = null"
                />
                <button
                  type="button"
                  class="input-icon-btn"
                  :aria-label="showCurrPwd ? 'Sembunyikan kata sandi saat ini' : 'Lihat kata sandi saat ini'"
                  @click="showCurrPwd = !showCurrPwd"
                >
                  <EyeOff v-if="showCurrPwd" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>
            </div>

            <!-- Kata Sandi Baru -->
            <div class="form-group">
              <label class="form-label" for="new-pwd">Kata Sandi Baru</label>
              <div class="input-container">
                <input
                  id="new-pwd"
                  v-model="newPassword"
                  :type="showNewPwd ? 'text' : 'password'"
                  placeholder="Min. 8 karakter (huruf &amp; angka)"
                  required
                  autocomplete="new-password"
                  @input="errorMessage = null"
                />
                <button
                  type="button"
                  class="input-icon-btn"
                  :aria-label="showNewPwd ? 'Sembunyikan kata sandi baru' : 'Lihat kata sandi baru'"
                  @click="showNewPwd = !showNewPwd"
                >
                  <EyeOff v-if="showNewPwd" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>

              <!-- 4-Segment Password Strength Meter -->
              <div class="pwd-meter-wrap" aria-live="polite">
                <div
                  class="pwd-meter-bars"
                  role="progressbar"
                  aria-label="Kekuatan kata sandi baru"
                  aria-valuemin="0"
                  aria-valuemax="4"
                  :aria-valuenow="passwordScore"
                >
                  <span class="pwd-segment" :class="{ 'level-1': passwordScore >= 1 }"></span>
                  <span class="pwd-segment" :class="{ 'level-2': passwordScore >= 2 }"></span>
                  <span class="pwd-segment" :class="{ 'level-3': passwordScore >= 3 }"></span>
                  <span class="pwd-segment" :class="{ 'level-4': passwordScore >= 4 }"></span>
                </div>
                <div class="pwd-meter-caption">
                  <span>Kekuatan Kata Sandi:</span>
                  <span class="strength-label" data-testid="pwd-strength-label">{{ strengthLabel }}</span>
                </div>
              </div>

              <!-- Checklist Syarat Kata Sandi -->
              <ul class="pwd-criteria-list" aria-label="Kriteria keamanan kata sandi">
                <li class="pwd-criteria-item" :class="{ met: isMinLengthMet }" data-testid="crit-length">
                  <CheckCircle2 v-if="isMinLengthMet" :size="15" class="crit-icon met" />
                  <Circle v-else :size="15" class="crit-icon" />
                  <span>Minimal 8 karakter</span>
                </li>
                <li class="pwd-criteria-item" :class="{ met: isAlnumMet }" data-testid="crit-alnum">
                  <CheckCircle2 v-if="isAlnumMet" :size="15" class="crit-icon met" />
                  <Circle v-else :size="15" class="crit-icon" />
                  <span>Kombinasi huruf &amp; angka</span>
                </li>
                <li class="pwd-criteria-item" :class="{ met: isDiffMet }" data-testid="crit-diff">
                  <CheckCircle2 v-if="isDiffMet" :size="15" class="crit-icon met" />
                  <Circle v-else :size="15" class="crit-icon" />
                  <span>Berbeda dari kata sandi saat ini</span>
                </li>
              </ul>
            </div>

            <!-- Konfirmasi Kata Sandi Baru -->
            <div class="form-group">
              <label class="form-label" for="confirm-pwd">Konfirmasi Kata Sandi Baru</label>
              <div class="input-container">
                <input
                  id="confirm-pwd"
                  v-model="confirmPassword"
                  :type="showConfirmPwd ? 'text' : 'password'"
                  placeholder="Ketik ulang kata sandi baru"
                  required
                  autocomplete="new-password"
                  @input="errorMessage = null"
                />
                <button
                  type="button"
                  class="input-icon-btn"
                  :aria-label="showConfirmPwd ? 'Sembunyikan konfirmasi kata sandi' : 'Lihat konfirmasi kata sandi'"
                  @click="showConfirmPwd = !showConfirmPwd"
                >
                  <EyeOff v-if="showConfirmPwd" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>
            </div>

            <!-- Checkbox Revoke Other Sessions -->
            <label class="checkbox-row" for="revoke-other-sessions">
              <input
                id="revoke-other-sessions"
                v-model="revokeOtherSessions"
                type="checkbox"
                data-testid="chk-revoke-other-sessions"
              />
              <span><strong>Akhiri seluruh sesi aktif di perangkat/peramban lain setelah kata sandi diperbarui</strong> (direkomendasikan untuk menjaga keamanan akses akun Anda).</span>
            </label>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
              data-testid="btn-save-pwd"
            >
              <KeyRound :size="16" />
              <span>{{ isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru' }}</span>
            </button>
          </form>

          <div class="divider"></div>

          <!-- Sesi Aktif Peramban Ini -->
          <div class="session-box">
            <div class="session-header">
              <Laptop :size="20" class="session-icon" />
              <div>
                <strong>Sesi Peramban Ini</strong>
                <p>Sesi masuk Anda terlindungi secara otomatis pada peramban ini.</p>
              </div>
            </div>
            <button
              class="btn btn-secondary btn-sm"
              type="button"
              data-testid="btn-logout-session"
              @click="handleLogout"
            >
              Keluar Sesi
            </button>
          </div>
        </div>
      </section>

      <!-- PANEL 3: Ringkasan Kanal Notifikasi Perangkat Ini -->
      <section class="panel" aria-labelledby="panel3-title" data-testid="panel-notifications">
        <div class="panel-head">
          <div>
            <h2 id="panel3-title">3. Ringkasan Kanal Notifikasi Perangkat Ini</h2>
            <p>Status izin notifikasi langsung pada peramban saat ini beserta aturan tetap pengingat harian.</p>
          </div>
          <span class="pill" :class="pushPillClass" data-testid="push-header-pill">
            Notifikasi Peramban: {{ pushStatusHeaderLabel }}
          </span>
        </div>
        <div class="panel-body">
          <div class="device-channel-summary">
            <!-- Card 1: Notifikasi Peramban -->
            <div class="device-channel-card">
              <div class="device-channel-card-top">
                <span class="device-channel-name">Notifikasi Peramban Ini</span>
                <span class="pill" :class="pushPillClass" data-testid="card-push-pill">{{ pushStatusShortLabel }}</span>
              </div>
              <div class="device-channel-desc" data-testid="card-push-desc">
                {{ pushStatusDesc }}
              </div>
            </div>

            <!-- Card 2: Aturan Tetap Pengingat -->
            <div class="device-channel-card">
              <div class="device-channel-card-top">
                <span class="device-channel-name">Aturan Tetap Pengingat</span>
                <span class="pill blue tabular-nums">60 Menit Sebelum Batas Waktu</span>
              </div>
              <div class="device-channel-desc tabular-nums" data-testid="card-reminder-desc">
                Pengingat Komitmen Pagi (<span class="mono-id">{{ morningReminderDisplay }} WIB</span>) dan Evaluasi Sore (<span class="mono-id">{{ eodReminderDisplay }} WIB</span>) dikirim tepat <strong>60 menit sebelum batas waktu tepat waktu</strong> dan berhenti saat batas waktu tiba.
              </div>
            </div>

            <!-- Card 3: Pusat Notifikasi & Email Resmi -->
            <div class="device-channel-card">
              <div class="device-channel-card-top">
                <span class="device-channel-name">Pusat Notifikasi &amp; Email Resmi</span>
                <span class="pill neutral">Saluran Sistem Tetap</span>
              </div>
              <div class="device-channel-desc">
                Pencatatan di Pusat Notifikasi web dan pengiriman email resmi dikelola terpusat mengikuti aturan peristiwa pemberitahuan perusahaan.
              </div>
            </div>
          </div>

          <div class="info-note-box" style="margin-top:0;margin-bottom:18px">
            <Bell :size="18" class="note-icon" />
            <div class="tabular-nums">
              Untuk menguji pengiriman notifikasi di perangkat ini, mendaftarkan ulang langganan perangkat, atau berhenti berlangganan pada perangkat ini, silakan buka pengaturan perangkat di halaman Pusat Notifikasi.
            </div>
          </div>

          <div style="display:flex;justify-content:flex-start">
            <router-link to="/notifications" class="btn btn-secondary" data-testid="btn-goto-notifications">
              <span>Kelola Saluran &amp; Uji Perangkat di Pusat Notifikasi →</span>
            </router-link>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ==============================================================
   PROFIL PENGGUNA & KEAMANAN AKUN (PROTOTIPE 24 & DESIGN SYSTEM v1.5.0)
   ============================================================== */
.profile-layout {
  min-height: 100vh;
  min-width: 0;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.sr-only {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 1px;
  max-width: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.profile-loading-state {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 36px 24px;
  text-align: center;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 14px;
  font-weight: 600;
}

.content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 28px clamp(1.5rem, 4vw, 3.5rem) 72px;
}

/* Page Heading */
.page-heading {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 12px;
  color: var(--color-brand-primary, #00674D);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text-primary, #0E211B);
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary, #5C6E68);
  max-width: 760px;
  line-height: 1.55;
}

/* Pills & Badges */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  background: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.pill.green {
  background: var(--color-status-green-bg, #DCFCE7);
  color: var(--color-status-green-fg, #166534);
  border-color: var(--color-status-green-border, #86EFAC);
}
.pill.amber {
  background: var(--color-status-amber-bg, #FEF3C7);
  color: var(--color-status-amber-fg, #92400E);
  border-color: var(--color-status-amber-border, #FCD34D);
}
.pill.red {
  background: var(--color-status-red-bg, #FEE2E2);
  color: var(--color-status-red-fg, #991B1B);
  border-color: var(--color-status-red-border, #FCA5A5);
}
.pill.blue {
  background: var(--color-status-blue-bg, #E0F2FE);
  color: var(--color-status-blue-fg, #075985);
  border-color: var(--color-status-blue-border, #7DD3FC);
}
.pill.neutral {
  background: var(--color-status-neutral-bg, #F1F5F9);
  color: var(--color-status-neutral-fg, #334155);
  border-color: var(--color-status-neutral-border, #CBD5E1);
}

.mono-id {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-variant-numeric: tabular-nums;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Hero Identity Strip Card */
.profile-hero-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 22px 26px;
  margin-bottom: 24px;
  box-shadow: none;
  flex-wrap: wrap;
}

.hero-avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--color-brand-tint, #E6F4EE);
  color: var(--color-brand-primary, #00674D);
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 800;
  border: 2px solid var(--color-border-strong, #A9C7BC);
  flex-shrink: 0;
}

.hero-info {
  flex: 1;
  min-width: 240px;
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.hero-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text-primary, #0E211B);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: var(--color-status-green-bg, #DCFCE7);
  color: var(--color-status-green-fg, #166534);
  border: 1px solid var(--color-status-green-border, #86EFAC);
}

.status-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.hero-meta {
  font-size: 13.5px;
  color: var(--color-text-secondary, #5C6E68);
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-dot {
  color: var(--color-border-strong, #A9C7BC);
  font-weight: 800;
}

/* Panels */
.panel {
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  box-shadow: none;
  margin-bottom: 24px;
  overflow: hidden;
  min-width: 0;
}

.panel-head {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.panel-head h2 {
  font-size: 17px;
  font-weight: 800;
  color: var(--color-text-primary, #0E211B);
}

.panel-head p {
  font-size: 13px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.panel-body {
  padding: 24px;
}

/* Info Grid (Panel 1) */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  background: var(--color-surface-subtle, #EFF5F2);
}

.info-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #0E211B);
  word-break: break-word;
}

.info-note-box {
  margin-top: 16px;
  padding: 13px 16px;
  border-radius: 8px;
  background: var(--color-surface-subtle, #EFF5F2);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary, #5C6E68);
  line-height: 1.5;
}

.note-icon {
  flex-shrink: 0;
  color: var(--color-brand-primary, #00674D);
  margin-top: 2px;
}

/* Form Styles (Panel 2) */
.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #0E211B);
  margin-bottom: 6px;
}

.input-container {
  position: relative;
}

input[type="text"]:not(.sr-only),
input[type="password"] {
  width: 100%;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  border-radius: 8px;
  padding: 10px 40px 10px 14px;
  font-size: 14px;
  color: var(--color-text-primary, #0E211B);
  background: #FFFFFF;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--color-brand-focus, #0B8061);
  box-shadow: 0 0 0 3px rgba(11, 128, 97, 0.12);
}

.input-icon-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  color: var(--color-text-secondary, #5C6E68);
  padding: 4px;
  border-radius: 4px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.input-icon-btn:hover {
  color: var(--color-text-primary, #0E211B);
}

/* 4-Segment Password Strength Meter */
.pwd-meter-wrap {
  margin-top: 10px;
}

.pwd-meter-bars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  height: 6px;
}

.pwd-segment {
  height: 6px;
  border-radius: 999px;
  background: var(--color-border-subtle, #DCE7E2);
  transition: background 0.2s ease;
}

.pwd-segment.level-1 {
  background: var(--color-status-red-fg, #991B1B);
}
.pwd-segment.level-2 {
  background: var(--color-timing-late-fg, #9A3412);
}
.pwd-segment.level-3 {
  background: var(--color-status-amber-fg, #92400E);
}
.pwd-segment.level-4 {
  background: var(--color-status-green-fg, #166534);
}

.pwd-meter-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
}

/* Checklist Kriteria Keamanan */
.pwd-criteria-list {
  list-style: none;
  display: grid;
  gap: 6px;
  margin: 10px 0 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--color-surface-subtle, #EFF5F2);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
}

.pwd-criteria-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #5C6E68);
}

.pwd-criteria-item.met {
  color: var(--color-status-green-fg, #166534);
  font-weight: 700;
}

.crit-icon {
  flex-shrink: 0;
}

.crit-icon.met {
  color: var(--color-status-green-fg, #166534);
}

/* Checkbox Row */
.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 16px 0 20px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--color-surface-subtle, #EFF5F2);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  font-size: 13px;
  color: var(--color-text-primary, #0E211B);
  cursor: pointer;
}

.checkbox-row input[type="checkbox"] {
  width: 17px;
  height: 17px;
  margin-top: 2px;
  accent-color: var(--color-brand-primary, #00674D);
  flex-shrink: 0;
}

/* Alerts */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 18px;
  line-height: 1.45;
}

.alert-banner.success {
  background: var(--color-status-green-bg, #DCFCE7);
  color: var(--color-status-green-fg, #166534);
  border: 1px solid var(--color-status-green-border, #86EFAC);
}

.alert-banner.error {
  background: var(--color-status-red-bg, #FEE2E2);
  color: var(--color-status-red-fg, #991B1B);
  border: 1px solid var(--color-status-red-border, #FCA5A5);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  border: 1px solid transparent;
  transition: all 0.15s;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-brand-hover, #00523E);
}

.btn-secondary {
  background: var(--color-surface, #FFFFFF);
  color: var(--color-text-primary, #0E211B);
  border-color: var(--color-border-strong, #A9C7BC);
}

.btn-secondary:hover {
  background: var(--color-surface-subtle, #EFF5F2);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12.5px;
}

.divider {
  height: 1px;
  background: var(--color-border-subtle, #DCE7E2);
  margin: 24px 0;
}

/* Sesi Aktif */
.session-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--color-surface-subtle, #EFF5F2);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  flex-wrap: wrap;
}

.session-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-icon {
  color: var(--color-brand-primary, #00674D);
  flex-shrink: 0;
}

.session-header strong {
  display: block;
  font-size: 13.5px;
  color: var(--color-text-primary, #0E211B);
}

.session-header p {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

/* Panel 3: Device Channel Summary Cards */
.device-channel-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.device-channel-card {
  padding: 14px 16px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  background: var(--color-surface-subtle, #EFF5F2);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.device-channel-card .pill {
  white-space: normal;
  text-align: left;
  max-width: 100%;
  line-height: 1.3;
}

.device-channel-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.device-channel-name {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--color-text-primary, #0E211B);
}

.device-channel-desc {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  line-height: 1.45;
}

/* Responsive Breakpoints */
@media (max-width: 1180px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .device-channel-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .content {
    padding: 20px 16px 72px;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .meta-dot {
    display: none;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
