<script setup lang="ts">
import AccessLink from '../../components/AccessLink.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../api/client';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
} from 'lucide-vue-next';

interface TemporaryReviewerRow {
  id: string;
  delegateUserId: string;
  targetFunction: string;
  delegationReason: string;
  effectiveDate: string;
  expiryDate: string;
  createdAt: string;
  delegateUser: { id: string; fullName: string; email: string };
  createdBy: { id: string; fullName: string; email: string };
}

interface SimpleUser {
  id: string;
  fullName: string;
  email: string;
}

const authStore = useAuthStore();

const delegations = ref<TemporaryReviewerRow[]>([]);
const availableUsers = ref<SimpleUser[]>([]);
const isLoading = ref(false);
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Modal state
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const modalError = ref<string | null>(null);

const form = ref({
  delegateUserId: '',
  targetFunction: 'Engineering',
  delegationReason: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
});

async function loadData() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const [delRes, usersRes] = await Promise.all([
      apiClient<{ data: TemporaryReviewerRow[] }>('/v1/admin/temporary-reviewers'),
      apiClient<{ data: SimpleUser[] }>('/v1/admin/users?limit=100'),
    ]);
    delegations.value = delRes.data.data || (delRes.data as any) || [];
    availableUsers.value = usersRes.data.data || (usersRes.data as any) || [];
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memuat data reviewer sementara.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchMe();
  }
  // Pembatasan peran ditegakkan oleh router guard (meta.roles) sebelum halaman dimuat.
  window.addEventListener('keydown', handleKeydown);
  await loadData();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isModalOpen.value) {
    isModalOpen.value = false;
  }
}

function openModal() {
  modalError.value = null;
  form.value = {
    delegateUserId: availableUsers.value[0]?.id || '',
    targetFunction: 'Engineering',
    delegationReason: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  };
  isModalOpen.value = true;
}

async function handleCreateDelegation() {
  modalError.value = null;
  if (!form.value.delegateUserId || !form.value.delegationReason.trim()) {
    modalError.value = 'Semua field wajib diisi.';
    return;
  }

  if (new Date(form.value.expiryDate) < new Date(form.value.effectiveDate)) {
    modalError.value = 'Tanggal kedaluwarsa tidak boleh mendahului tanggal efektif.';
    return;
  }

  isSubmitting.value = true;
  try {
    await apiClient('/v1/admin/temporary-reviewers', {
      method: 'POST',
      body: JSON.stringify(form.value),
    });
    isModalOpen.value = false;
    showToast('Delegasi reviewer sementara berhasil diterbitkan!');
    await loadData();
  } catch (err: any) {
    modalError.value = err.message || 'Gagal menerbitkan delegasi reviewer sementara.';
  } finally {
    isSubmitting.value = false;
  }
}

function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 3800);
}
</script>

<template>
  <div class="admin-layout">
    <header class="top-nav">
      <div class="nav-left">
        <div class="brand-badge">WP</div>
        <span class="brand-name">WorkPulse</span>
        <span class="system-tag">Temporary Reviewer</span>
      </div>
      <div class="nav-right">
        <AccessLink to="/admin/organization" class="nav-link">Struktur Organisasi</AccessLink>
        <AccessLink to="/admin/users" class="nav-link">Kelola Pengguna</AccessLink>
        <AccessLink to="/profile" class="nav-link">Profil Saya</AccessLink>
      </div>
    </header>

    <div v-if="toastMessage" class="toast-popup success">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>
    <div v-if="errorMessage" class="toast-popup error">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <main class="content-container">
      <div class="page-header">
        <div>
          <h2>Pendelegasian Reviewer Sementara</h2>
          <p class="subtitle">
            Delegasikan wewenang peninjauan komitmen & kendala divisi secara temporer (/admin/temporary-reviewers).
          </p>
        </div>
        <button class="btn btn-primary" @click="openModal">
          <Plus :size="18" />
          <span>Delegasikan Reviewer Baru</span>
        </button>
      </div>

      <div class="table-card">
        <div v-if="isLoading" class="state-container">
          <p>Memuat daftar reviewer sementara...</p>
        </div>
        <div v-else-if="delegations.length === 0" class="state-container empty">
          <Clock :size="36" class="empty-icon" />
          <h3>Tidak Ada Delegasi Aktif</h3>
          <p>Saat ini tidak ada pendelegasian wewenang reviewer sementara yang sedang berlaku.</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>PENERIMA DELEGASI</th>
              <th>FUNGSI TARGET</th>
              <th>PERIODE DELEGASI</th>
              <th>STATUS</th>
              <th>DITERBITKAN OLEH</th>
              <th>ALASAN DELEGASI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in delegations" :key="d.id">
              <td>
                <strong class="user-name">{{ d.delegateUser?.fullName || '-' }}</strong>
                <span class="user-email-text mono-num">{{ d.delegateUser?.email || '-' }}</span>
              </td>
              <td>
                <span class="func-pill">{{ d.targetFunction }}</span>
              </td>
              <td>
                <span class="date-text mono-num">
                  {{ new Date(d.effectiveDate).toLocaleDateString('id-ID') }}
                  s/d
                  {{ new Date(d.expiryDate).toLocaleDateString('id-ID') }}
                </span>
              </td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    new Date(d.effectiveDate) <= new Date() && new Date(d.expiryDate) >= new Date()
                      ? 'active'
                      : 'expired',
                  ]"
                >
                  {{
                    new Date(d.effectiveDate) <= new Date() && new Date(d.expiryDate) >= new Date()
                      ? 'Aktif'
                      : 'Kedaluwarsa'
                  }}
                </span>
              </td>
              <td>
                <span class="creator-name">{{ d.createdBy?.fullName || 'System' }}</span>
              </td>
              <td>
                <span class="reason-text">{{ d.delegationReason }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Delegasi Reviewer -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen = false">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Delegasikan Reviewer Sementara</h3>
          <button class="close-btn" @click="isModalOpen = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleCreateDelegation">
          <div v-if="modalError" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ modalError }}</span>
          </div>

          <div class="form-group">
            <label for="del-user">Penerima Wewenang Delegasi</label>
            <select id="del-user" v-model="form.delegateUserId" required>
              <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="del-func">Fungsi Target Delegasi</label>
            <select id="del-func" v-model="form.targetFunction" required>
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

          <div class="form-row">
            <div class="form-group">
              <label for="del-eff">Tanggal Efektif Mulai</label>
              <input id="del-eff" v-model="form.effectiveDate" type="date" required />
            </div>
            <div class="form-group">
              <label for="del-exp">Batas Tanggal Kedaluwarsa</label>
              <input id="del-exp" v-model="form.expiryDate" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label for="del-reason">Alasan Delegasi (Audit Log)</label>
            <textarea
              id="del-reason"
              v-model="form.delegationReason"
              rows="2"
              placeholder="Contoh: Menggantikan Head of Engineering yang sedang cuti tahunan..."
              required
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menerbitkan...' : 'Terbitkan Delegasi' }}
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

.nav-right {
  display: flex;
  gap: 16px;
}

.nav-link {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-brand-primary);
}

.content-container {
  max-width: 1180px;
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

.user-name {
  display: block;
  font-size: 13.5px;
  color: var(--color-text-primary);
}

.user-email-text {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  display: block;
}

.func-pill {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-surface-subtle);
  padding: 3px 8px;
  border-radius: 6px;
}

.date-text {
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-badge.active {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
}

.status-badge.expired {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
}

.creator-name {
  font-weight: 600;
}

.reason-text {
  font-size: 12.5px;
  color: var(--color-text-secondary);
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

.state-container {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin: 0 auto 12px;
  color: var(--color-brand-primary);
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
}

.toast-popup.success {
  background: #00674D;
  color: #FFFFFF;
}

.toast-popup.error {
  background: #991B1B;
  color: #FFFFFF;
}

/* Modal */
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
  width: min(100%, 520px);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 28px;
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
  margin-bottom: 14px;
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
  margin-bottom: 4px;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13.5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 14px;
}

.alert-banner.error {
  background: var(--color-status-red-bg);
  border: 1px solid var(--color-status-red-border);
  color: var(--color-status-red-fg);
}
</style>
