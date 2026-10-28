<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../api/client';
import {
  UserPlus,
  Search,
  RotateCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Copy,
  X,
} from 'lucide-vue-next';

const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE';
  currentRole: string;
  currentFunction: string | null;
  currentJobTitle: string | null;
  createdAt: string;
  invitation?: {
    id: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  } | null;
}

const router = useRouter();
const authStore = useAuthStore();

const users = ref<AdminUserRow[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Modal State
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const modalError = ref<string | null>(null);
const createdToken = ref<string | null>(null);

const form = ref({
  fullName: '',
  email: '',
  role: 'EMPLOYEE',
  function: 'Engineering',
  jobTitle: '',
});

async function loadUsers() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    let url = '/v1/admin/users?';
    if (searchQuery.value) url += `search=${encodeURIComponent(searchQuery.value)}&`;
    if (statusFilter.value) url += `status=${encodeURIComponent(statusFilter.value)}&`;

    const res = await apiClient<{ data: AdminUserRow[] }>(url);
    users.value = res.data.data || (res.data as any) || [];
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memuat data pengguna.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchMe();
  }
  if (!authStore.isSuperAdmin && !authStore.isHRGA) {
    router.push('/profile');
    return;
  }
  window.addEventListener('keydown', handleKeydown);
  await loadUsers();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// WCAG 2.1 AA: Tombol Escape menutup modal dialog
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal();
  }
}

function openModal() {
  modalError.value = null;
  createdToken.value = null;
  form.value = {
    fullName: '',
    email: '',
    role: 'EMPLOYEE',
    function: 'Engineering',
    jobTitle: '',
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
    modalError.value = 'Nama lengkap dan email wajib diisi.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await apiClient<{
      user: any;
      invitation: { token: string; expiresAt: string };
    }>('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(form.value),
    });

    createdToken.value = res.data.invitation.token;
    showToast('Pengguna baru berhasil dibuat dan undangan telah diterbitkan!');
    await loadUsers();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal membuat pengguna baru.';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleResend(userId: string) {
  try {
    await apiClient<{ token: string; expiresAt: string }>(
      `/v1/admin/users/${userId}/resend-invitation`,
      { method: 'POST' },
    );
    showToast('Tautan undangan baru berhasil diterbitkan (berlaku 72 jam).');
    await loadUsers();
  } catch (err: any) {
    showToast(err.message || 'Gagal mengirim ulang undangan.', true);
  }
}

async function handleRevoke(userId: string) {
  if (!confirm('Apakah Anda yakin ingin mencabut undangan ini?')) return;
  try {
    await apiClient(`/v1/admin/users/${userId}/revoke-invitation`, {
      method: 'POST',
    });
    showToast('Undangan pengguna berhasil dicabut.');
    await loadUsers();
  } catch (err: any) {
    showToast(err.message || 'Gagal mencabut undangan.', true);
  }
}

async function handleToggleStatus(userId: string, currentStatus: string) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const actionText = newStatus === 'INACTIVE' ? 'menonaktifkan' : 'mengaktifkan';

  if (!confirm(`Apakah Anda yakin ingin ${actionText} akun pengguna ini?`)) return;

  try {
    await apiClient(`/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    showToast(`Status pengguna berhasil diubah menjadi ${newStatus}.`);
    await loadUsers();
  } catch (err: any) {
    showToast(err.message || 'Gagal mengubah status pengguna.', true);
  }
}

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => {
      errorMessage.value = null;
    }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => {
      toastMessage.value = null;
    }, 3800);
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  showToast('Tautan aktivasi berhasil disalin ke clipboard!');
}
</script>

<template>
  <div class="admin-layout">
    <!-- Navbar -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="brand-badge">WP</div>
        <span class="brand-name">WorkPulse</span>
        <span class="system-tag">Admin Panel</span>
      </div>
      <div class="nav-right">
        <router-link to="/profile" class="nav-link">Profil Saya</router-link>
      </div>
    </header>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast-popup success">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>
    <div v-if="errorMessage" class="toast-popup error">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Main Container -->
    <main class="content-container">
      <div class="page-header">
        <div>
          <h2>Kelola Pengguna & Undangan</h2>
          <p class="subtitle">
            Terbitkan undangan aktivasi 72 jam, kelola status akses, dan penugasan organisasi.
          </p>
        </div>
        <button class="btn btn-primary" @click="openModal">
          <UserPlus :size="18" />
          <span>Undang Pengguna Baru</span>
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="filter-card">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            @input="loadUsers"
          />
        </div>
        <select v-model="statusFilter" class="status-select" @change="loadUsers">
          <option value="">Semua Status Akun</option>
          <option value="INVITED">INVITED (Menunggu Aktivasi)</option>
          <option value="ACTIVE">ACTIVE (Aktif)</option>
          <option value="INACTIVE">INACTIVE (Nonaktif)</option>
        </select>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <!-- 7 UI States: Loading Skeleton -->
        <div v-if="isLoading" class="state-container">
          <p>Memuat daftar pengguna...</p>
        </div>

        <!-- 7 UI States: Empty State -->
        <div v-else-if="users.length === 0" class="state-container empty">
          <div class="empty-icon">👥</div>
          <h3>Belum Ada Pengguna</h3>
          <p>Tidak ditemukan data pengguna yang cocok dengan kriteria pencarian Anda.</p>
        </div>

        <!-- Loaded State: Table -->
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>NAMA & EMAIL</th>
              <th>JABATAN & PERAN</th>
              <th>STATUS AKUN</th>
              <th>STATUS UNDANGAN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="user-meta">
                  <div class="avatar-sm">{{ u.fullName.charAt(0) }}</div>
                  <div>
                    <strong class="user-name">{{ u.fullName }}</strong>
                    <span class="user-email-text mono-num">{{ u.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge">{{ u.currentRole }}</span>
                <span v-if="u.currentFunction" class="func-text">{{ u.currentFunction }}</span>
              </td>
              <td>
                <span :class="['status-badge', u.status.toLowerCase()]">
                  {{ u.status }}
                </span>
              </td>
              <td>
                <template v-if="u.invitation">
                  <span :class="['inv-badge', u.invitation.status.toLowerCase()]">
                    {{ u.invitation.status }}
                  </span>
                  <span v-if="u.invitation.status === 'PENDING'" class="exp-hint">
                    Exp: {{ new Date(u.invitation.expiresAt).toLocaleDateString('id-ID') }}
                  </span>
                </template>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <template v-if="u.status === 'INVITED'">
                    <button
                      class="btn-icon"
                      title="Kirim Ulang Undangan (Hanguskan Token Lama)"
                      @click="handleResend(u.id)"
                    >
                      <RotateCw :size="15" />
                    </button>
                    <button
                      class="btn-icon danger"
                      title="Cabut Undangan"
                      @click="handleRevoke(u.id)"
                    >
                      <Ban :size="15" />
                    </button>
                  </template>

                  <button
                    v-if="u.status !== 'INVITED'"
                    :class="['btn-status-toggle', u.status === 'ACTIVE' ? 'deactivate' : 'activate']"
                    @click="handleToggleStatus(u.id, u.status)"
                  >
                    {{ u.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Dialog: Undang Pengguna Baru -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h3 id="modal-title">Undang Pengguna Baru</h3>
          <button class="close-btn" aria-label="Tutup Dialog (Esc)" @click="closeModal">
            <X :size="20" />
          </button>
        </div>

        <!-- Mode Tampilkan Token Hasil Terbit -->
        <div v-if="createdToken" class="token-result-box">
          <div class="success-icon-circ">
            <CheckCircle2 :size="32" />
          </div>
          <h4>Undangan Berhasil Dibuat!</h4>
          <p>Tautan aktivasi berlaku selama 72 jam. Bagikan tautan berikut kepada pengguna:</p>

          <div class="token-display mono-num">
            {{ `${originUrl}/activate?token=${createdToken}` }}
          </div>

          <div class="modal-footer" style="margin-top: 20px;">
            <button
              class="btn btn-secondary"
              @click="copyToClipboard(`${originUrl}/activate?token=${createdToken}`)"
            >
              <Copy :size="16" />
              <span>Salin Tautan Aktivasi</span>
            </button>
            <button class="btn btn-primary" @click="closeModal">Selesai</button>
          </div>
        </div>

        <!-- Mode Form Input -->
        <form v-else @submit.prevent="handleCreateUser">
          <div v-if="modalError" class="alert-banner error">
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
              <label for="new-role">Peran (Role)</label>
              <select id="new-role" v-model="form.role">
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="HEAD">HEAD</option>
                <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                <option value="HRGA">HRGA</option>
                <option value="CEO_MANAGEMENT">CEO_MANAGEMENT</option>
              </select>
            </div>

            <div class="form-group">
              <label for="new-func">Fungsi / Divisi</label>
              <select id="new-func" v-model="form.function">
                <option value="Engineering">Engineering</option>
                <option value="Quality">Quality</option>
                <option value="Operations & Infrastructure">Operations & Infrastructure</option>
                <option value="R&D">R&D</option>
                <option value="Delivery">Delivery</option>
                <option value="Business Development">Business Development</option>
                <option value="Sales Enablement & Presales">Sales Enablement & Presales</option>
                <option value="Finance">Finance</option>
                <option value="HRGA">HRGA</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="new-title">Jabatan (Job Title)</label>
            <input
              id="new-title"
              v-model="form.jobTitle"
              type="text"
              placeholder="Contoh: Frontend Developer"
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menerbitkan...' : 'Terbitkan Undangan (72 Jam)' }}
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
  width: 32px;
  height: 32px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
}

.brand-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-brand-primary);
}

.system-tag {
  font-size: 11px;
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.nav-link {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-brand-primary);
}

.content-container {
  max-width: 1140px;
  margin: 32px auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: var(--color-brand-hover);
}

.btn-secondary {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
}

.filter-card {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 12px;
  color: var(--color-text-secondary);
}

.search-box input {
  width: 100%;
  height: 42px;
  padding-left: 40px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13.5px;
}

.status-select {
  width: 240px;
  height: 42px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
}

.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-surface-subtle);
  padding: 12px 18px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border-subtle);
}

.data-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 13px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
}

.user-name {
  display: block;
  font-size: 13.5px;
  color: var(--color-text-primary);
}

.user-email-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.role-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-strong);
  color: var(--color-brand-primary);
}

.func-text {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
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
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.inv-badge.pending {
  background: var(--color-status-amber-bg);
  color: var(--color-status-amber-fg);
}

.inv-badge.used {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
}

.inv-badge.revoked, .inv-badge.expired {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
}

.exp-hint {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  display: grid;
  place-items: center;
  color: var(--color-text-secondary);
  transition: all 0.15s;
}

.btn-icon:hover {
  background: var(--color-surface-subtle);
  color: var(--color-brand-primary);
}

.btn-icon.danger:hover {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.btn-status-toggle {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  cursor: pointer;
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

.state-container {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
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

/* Modal Backdrop & Box */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  width: min(100%, 500px);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 800;
}

.close-btn {
  background: transparent;
  border: 0;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

input, select {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13.5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.token-result-box {
  text-align: center;
  padding: 12px 0;
}

.success-icon-circ {
  width: 56px;
  height: 56px;
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
</style>
