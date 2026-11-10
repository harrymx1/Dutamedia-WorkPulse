<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
  delegateUser: {
    id: string;
    fullName: string;
    email: string;
    orgAssignments?: Array<{
      role?: string;
      function?: string;
      jobTitle?: string;
    }>;
  };
  createdBy: { id: string; fullName: string; email: string };
}

interface SimpleUser {
  id: string;
  fullName: string;
  email: string;
  currentRole?: string;
  currentFunction?: string;
  currentJobTitle?: string;
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
  replacedUserId: '',
  delegateUserId: '',
  targetFunction: 'Engineering',
  delegationReason: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
});

const managerialRoles = ['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT'];

const eligibleManagers = computed(() => {
  const managers = availableUsers.value.filter(
    (u) => u.currentRole && managerialRoles.includes(u.currentRole),
  );
  return managers.length > 0 ? managers : availableUsers.value;
});

const eligibleDelegates = computed(() => {
  // Pejabat pengganti tidak boleh orang yang sama dengan yang digantikan
  return availableUsers.value.filter((u) => u.id !== form.value.replacedUserId);
});

function onReplacedUserChange() {
  const manager = availableUsers.value.find((u) => u.id === form.value.replacedUserId);
  if (manager) {
    if (manager.currentFunction) {
      form.value.targetFunction = manager.currentFunction;
    }
    // Set default delegate jika belum dipilih atau bentrok
    if (!form.value.delegateUserId || form.value.delegateUserId === manager.id) {
      const candidate =
        eligibleDelegates.value.find(
          (u) => u.currentFunction === manager.currentFunction && u.id !== manager.id,
        ) || eligibleDelegates.value[0];
      if (candidate) {
        form.value.delegateUserId = candidate.id;
      }
    }
  }
}

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
  const defaultManager =
    eligibleManagers.value.find((u) => u.currentRole === 'HEAD') || eligibleManagers.value[0];
  const managerId = defaultManager?.id || '';
  const targetFunc = defaultManager?.currentFunction || 'Engineering';

  form.value = {
    replacedUserId: managerId,
    delegateUserId: '',
    targetFunction: targetFunc,
    delegationReason: 'Cuti tahunan dan pelimpahan wewenang peninjauan sementara',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  };

  const defaultDelegate =
    availableUsers.value.find(
      (u) =>
        u.id !== managerId &&
        (u.currentFunction === targetFunc || u.currentRole === 'SUPERVISOR'),
    ) || availableUsers.value.find((u) => u.id !== managerId);

  if (defaultDelegate) {
    form.value.delegateUserId = defaultDelegate.id;
  }

  isModalOpen.value = true;
}

async function handleCreateDelegation() {
  modalError.value = null;
  if (!form.value.delegateUserId || !form.value.delegationReason.trim()) {
    modalError.value = 'Semua field wajib diisi.';
    return;
  }

  if (new Date(form.value.expiryDate) < new Date(form.value.effectiveDate)) {
    modalError.value = 'Batas tanggal kedaluwarsa delegasi tidak boleh mendahului tanggal efektif.';
    return;
  }

  const replacedUser = availableUsers.value.find((u) => u.id === form.value.replacedUserId);
  const replacedLabel = replacedUser
    ? `${replacedUser.fullName} (${replacedUser.currentJobTitle || replacedUser.currentRole || 'Atasan'})`
    : `Atasan Divisi ${form.value.targetFunction}`;

  const fullReason = form.value.delegationReason.includes('[Menggantikan')
    ? form.value.delegationReason.trim()
    : `[Menggantikan ${replacedLabel}] ${form.value.delegationReason.trim()}`;

  isSubmitting.value = true;
  try {
    await apiClient('/v1/admin/temporary-reviewers', {
      method: 'POST',
      body: JSON.stringify({
        delegateUserId: form.value.delegateUserId,
        targetFunction: form.value.targetFunction,
        delegationReason: fullReason,
        effectiveDate: form.value.effectiveDate,
        expiryDate: form.value.expiryDate,
      }),
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

function parseReplacedOfficial(reason: string, targetFunction: string): string {
  if (!reason) return `Atasan Divisi ${targetFunction}`;
  const match = reason.match(/\[Menggantikan\s+([^\]]+)\]/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return `Atasan Divisi ${targetFunction}`;
}

function cleanReason(reason: string): string {
  if (!reason) return '-';
  return reason.replace(/\[Menggantikan\s+[^\]]+\]\s*/i, '').trim() || reason;
}

function getDelegateSubtext(delegateUser: any): string {
  if (!delegateUser) return '-';
  const assignment = delegateUser.orgAssignments?.[0];
  if (assignment?.jobTitle) {
    return `${assignment.jobTitle} · ${assignment.function || ''}`;
  }
  const found = availableUsers.value.find((u) => u.id === delegateUser.id);
  if (found?.currentJobTitle) {
    return `${found.currentJobTitle} · ${found.currentFunction || ''}`;
  }
  return delegateUser.email || '-';
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
    <TopBar breadcrumb="Administration / Reviewer Sementara" />

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
            Pelimpahan wewenang peninjauan komitmen harian dan permohonan cuti secara temporer saat atasan berhalangan hadir.
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
              <th>PEJABAT PENGGANTI</th>
              <th>MENGGANTIKAN SIAPA</th>
              <th>DIVISI / WEWENANG</th>
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
                <span class="user-subtext">{{ getDelegateSubtext(d.delegateUser) }}</span>
              </td>
              <td>
                <strong class="replaced-name">{{ parseReplacedOfficial(d.delegationReason, d.targetFunction) }}</strong>
                <span class="badge-role">Pejabat Berhalangan</span>
              </td>
              <td>
                <span class="func-pill">{{ d.targetFunction }}</span>
                <span class="auth-scope-text">Persetujuan Cuti &amp; Koreksi</span>
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
                <span class="creator-name">{{ d.createdBy?.fullName || 'System Admin' }}</span>
              </td>
              <td>
                <span class="reason-text">{{ cleanReason(d.delegationReason) }}</span>
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
          <div>
            <h3>Delegasikan Reviewer Sementara</h3>
            <p class="modal-subtitle">
              Tunjuk atasan yang berhalangan lalu tetapkan pejabat pengganti sementaranya.
            </p>
          </div>
          <button class="close-btn" @click="isModalOpen = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleCreateDelegation">
          <div v-if="modalError" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ modalError }}</span>
          </div>

          <!-- 1. Pejabat yang Berhalangan (Yang Digantikan) -->
          <div class="form-group">
            <label for="del-replaced">1. Pejabat yang Berhalangan (Yang Digantikan) *</label>
            <select id="del-replaced" v-model="form.replacedUserId" required @change="onReplacedUserChange">
              <option v-for="u in eligibleManagers" :key="u.id" :value="u.id">
                {{ u.fullName }} — {{ u.currentJobTitle || u.currentRole }} (Divisi {{ u.currentFunction || 'Umum' }})
              </option>
            </select>
            <span class="field-hint">Pilih Atasan atau Kepala Divisi yang sedang cuti atau berhalangan hadir.</span>
          </div>

          <!-- 2. Divisi yang Dikelola (Otomatis) -->
          <div class="form-group">
            <label>2. Divisi Wewenang Peninjauan (Otomatis)</label>
            <div class="readonly-target-box">
              <span class="func-pill target-active">{{ form.targetFunction }}</span>
              <span class="field-hint inline">Mengikuti divisi dari pejabat yang digantikan.</span>
            </div>
          </div>

          <!-- 3. Pejabat Pengganti Sementara -->
          <div class="form-group">
            <label for="del-user">3. Pejabat Pengganti Sementara (Penerima Delegasi) *</label>
            <select id="del-user" v-model="form.delegateUserId" required>
              <option v-for="u in eligibleDelegates" :key="u.id" :value="u.id">
                {{ u.fullName }} — {{ u.currentJobTitle || u.currentRole }} (Divisi {{ u.currentFunction || 'Umum' }})
              </option>
            </select>
            <span class="field-hint">Pilih personil yang mengambil alih wewenang persetujuan di divisi tersebut.</span>
          </div>

          <!-- 4. Rentang Tanggal -->
          <div class="form-row">
            <div class="form-group">
              <label for="del-eff">Tanggal Efektif Mulai *</label>
              <input id="del-eff" v-model="form.effectiveDate" type="date" required />
            </div>
            <div class="form-group">
              <label for="del-exp">Batas Tanggal Kedaluwarsa *</label>
              <input id="del-exp" v-model="form.expiryDate" type="date" required />
            </div>
          </div>

          <!-- 5. Alasan Delegasi -->
          <div class="form-group">
            <label for="del-reason">Alasan Delegasi (Audit Trail) *</label>
            <textarea
              id="del-reason"
              v-model="form.delegationReason"
              rows="2"
              placeholder="Contoh: Cuti tahunan 2 minggu dan serah terima pengawasan sprint..."
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
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
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
  color: var(--color-text-primary, #0E211B);
}

.subtitle {
  font-size: 13.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 4px;
}

.table-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-surface-subtle, #F1F6F4);
  padding: 12px 18px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--color-text-secondary, #5C6E68);
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.data-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  font-size: 13px;
  vertical-align: top;
}

.user-name {
  display: block;
  font-size: 13.5px;
  color: var(--color-text-primary, #0E211B);
}

.user-subtext {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  display: block;
  margin-top: 2px;
}

.replaced-name {
  display: block;
  font-size: 13px;
  color: #0E211B;
  font-weight: 700;
}

.badge-role {
  font-size: 10.5px;
  background: #FEF3C7;
  color: #92400E;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  display: inline-block;
  margin-top: 3px;
}

.auth-scope-text {
  font-size: 11px;
  color: var(--color-text-secondary, #5C6E68);
  display: block;
  margin-top: 3px;
}

.func-pill {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  background: var(--color-surface-subtle, #EFF5F2);
  color: var(--color-brand-primary, #00674D);
  padding: 3px 8px;
  border-radius: 6px;
}

.func-pill.target-active {
  background: #E0F2FE;
  color: #0369A1;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 10px;
}

.readonly-target-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
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
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.expired {
  background: #FEE2E2;
  color: #991B1B;
}

.creator-name {
  font-weight: 600;
}

.reason-text {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  line-height: 1.4;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-sm, 8px);
  font-size: 13.5px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-primary:hover {
  background: var(--color-brand-hover, #00523E);
}

.btn-secondary {
  background: #FFFFFF;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.state-container {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-secondary, #5C6E68);
}

.empty-icon {
  margin: 0 auto 12px;
  color: var(--color-brand-primary, #00674D);
}

.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--radius-sm, 8px);
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
  width: min(100%, 540px);
  background: #FFFFFF;
  border-radius: var(--radius-lg, 12px);
  padding: 24px 28px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary, #0E211B);
}

.modal-subtitle {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 3px;
}

.close-btn {
  background: transparent;
  border: 0;
  color: var(--color-text-secondary, #5C6E68);
  cursor: pointer;
  padding: 4px;
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
  color: var(--color-text-primary, #0E211B);
  margin-bottom: 4px;
}

.field-hint {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 3px;
  display: block;
}

.field-hint.inline {
  display: inline;
  margin-top: 0;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  border-radius: var(--radius-sm, 6px);
  background: #FFFFFF;
  font-size: 13.5px;
  color: var(--color-text-primary, #0E211B);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-brand-primary, #00674D);
  box-shadow: 0 0 0 2px rgba(0, 103, 77, 0.15);
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
  border-radius: var(--radius-sm, 6px);
  font-size: 13px;
  margin-bottom: 14px;
}

.alert-banner.error {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}
</style>
