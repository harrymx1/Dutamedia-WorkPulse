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
  Pencil,
  Trash2,
  AlertTriangle,
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

// Karyawan lini operasional yang berhak didelegasikan atau digantikan (mengecualikan SYSTEM_ADMIN untuk Separation of Duties)
const operationalUsers = computed(() => {
  return availableUsers.value.filter(
    (u) => u.currentRole !== 'SYSTEM_ADMIN' && u.email !== 'admin@dutamedia.com',
  );
});

const groupedManagers = computed(() => {
  const heads = operationalUsers.value.filter((u) => u.currentRole === 'HEAD');
  const supervisors = operationalUsers.value.filter(
    (u) => u.currentRole === 'SUPERVISOR' || u.currentRole === 'PROJECT_MANAGER',
  );
  const executives = operationalUsers.value.filter(
    (u) => ['CEO_MANAGEMENT', 'HRGA'].includes(u.currentRole || ''),
  );
  const others = operationalUsers.value.filter(
    (u) =>
      !['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER', 'CEO_MANAGEMENT', 'HRGA'].includes(
        u.currentRole || '',
      ),
  );

  return [
    { label: '── Kepala Divisi (Department Heads) ──', users: heads },
    { label: '── Supervisor & Project Leads ──', users: supervisors },
    { label: '── Direksi & Manajemen HRGA ──', users: executives },
    { label: '── Pejabat / Staf Lainnya ──', users: others },
  ].filter((g) => g.users.length > 0);
});

const groupedDelegates = computed(() => {
  const replacedId = form.value.replacedUserId;
  const targetFunc = form.value.targetFunction;

  // 100% Seluruh karyawan operasional terjamin tampil, KECUALI pejabat yang sedang digantikan
  const allExceptReplaced = operationalUsers.value.filter((u) => u.id !== replacedId);

  // 1. Pimpinan / Lead di divisi yang sama (Prioritas Utama)
  const internalLeads = allExceptReplaced.filter(
    (u) =>
      u.currentFunction === targetFunc &&
      ['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER'].includes(u.currentRole || ''),
  );

  // 2. Pimpinan / Lead dari divisi lain (Lintas Divisi)
  const externalLeads = allExceptReplaced.filter(
    (u) =>
      u.currentFunction !== targetFunc &&
      ['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT'].includes(
        u.currentRole || '',
      ),
  );

  // 3. Staf / Anggota Tim di divisi yang sama
  const internalStaff = allExceptReplaced.filter(
    (u) =>
      u.currentFunction === targetFunc &&
      !['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT'].includes(
        u.currentRole || '',
      ),
  );

  // 4. Seluruh Karyawan Lainnya (Seluruh Perusahaan)
  const externalStaff = allExceptReplaced.filter(
    (u) =>
      u.currentFunction !== targetFunc &&
      !['HEAD', 'SUPERVISOR', 'PROJECT_MANAGER', 'HRGA', 'CEO_MANAGEMENT'].includes(
        u.currentRole || '',
      ),
  );

  return [
    {
      label: `── Pimpinan / Lead Internal Divisi ${targetFunc} (Prioritas Utama) ──`,
      users: internalLeads,
    },
    {
      label: '── Pimpinan / Lead Divisi Lain (Lintas Divisi) ──',
      users: externalLeads,
    },
    {
      label: `── Staf / Anggota Tim Divisi ${targetFunc} ──`,
      users: internalStaff,
    },
    {
      label: '── Seluruh Karyawan Lainnya (Seluruh Perusahaan) ──',
      users: externalStaff,
    },
  ].filter((g) => g.users.length > 0);
});

function onReplacedUserChange() {
  const manager = operationalUsers.value.find((u) => u.id === form.value.replacedUserId);
  if (manager) {
    if (manager.currentFunction) {
      form.value.targetFunction = manager.currentFunction;
    }
    // Set default delegate jika belum dipilih atau bentrok
    if (!form.value.delegateUserId || form.value.delegateUserId === manager.id) {
      const allDelegates = operationalUsers.value.filter((u) => u.id !== manager.id);
      const candidate =
        allDelegates.find(
          (u) => u.currentFunction === manager.currentFunction && u.id !== manager.id,
        ) || allDelegates[0];
      if (candidate) {
        form.value.delegateUserId = candidate.id;
      }
    }
  }
}

function onEffectiveDateChange() {
  // Jika tanggal kedaluwarsa mendahului tanggal efektif, sinkronkan otomatis
  if (new Date(form.value.expiryDate) < new Date(form.value.effectiveDate)) {
    form.value.expiryDate = form.value.effectiveDate;
  }
}

async function loadData() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const [delRes, usersRes] = await Promise.all([
      apiClient<{ data: TemporaryReviewerRow[] }>('/v1/admin/temporary-reviewers'),
      apiClient<{ data: SimpleUser[] }>('/v1/admin/users?limit=500'),
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
  if (e.key === 'Escape') {
    if (isModalOpen.value) isModalOpen.value = false;
    if (isEditModalOpen.value) isEditModalOpen.value = false;
    if (isRevokeModalOpen.value) isRevokeModalOpen.value = false;
  }
}

function openModal() {
  modalError.value = null;
  const defaultManager =
    operationalUsers.value.find((u) => u.currentRole === 'HEAD') || operationalUsers.value[0];
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
    operationalUsers.value.find(
      (u) =>
        u.id !== managerId &&
        (u.currentFunction === targetFunc || u.currentRole === 'SUPERVISOR'),
    ) || operationalUsers.value.find((u) => u.id !== managerId);

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
    modalError.value = 'Batas tanggal kedaluwarsa delegasi tidak boleh mendahului tanggal efektif mulai.';
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
        replacedUserId: form.value.replacedUserId,
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

// Edit Modal state & handlers
const isEditModalOpen = ref(false);
const isEditSubmitting = ref(false);
const editModalError = ref<string | null>(null);
const editForm = ref({
  id: '',
  replacedOfficial: '',
  delegateName: '',
  targetFunction: '',
  effectiveDate: '',
  expiryDate: '',
  updateReason: '',
});

function openEditModal(d: TemporaryReviewerRow) {
  editModalError.value = null;
  editForm.value = {
    id: d.id,
    replacedOfficial: parseReplacedOfficial(d.delegationReason, d.targetFunction),
    delegateName: d.delegateUser?.fullName || 'Pejabat Pengganti',
    targetFunction: d.targetFunction,
    effectiveDate: new Date(d.effectiveDate).toISOString().split('T')[0],
    expiryDate: new Date(d.expiryDate).toISOString().split('T')[0],
    updateReason: '',
  };
  isEditModalOpen.value = true;
}

function onEditEffectiveDateChange() {
  if (new Date(editForm.value.expiryDate) < new Date(editForm.value.effectiveDate)) {
    editForm.value.expiryDate = editForm.value.effectiveDate;
  }
}

async function handleUpdateDelegation() {
  editModalError.value = null;
  if (!editForm.value.updateReason.trim()) {
    editModalError.value = 'Alasan perubahan delegasi wajib diisi untuk kebutuhan jejak audit.';
    return;
  }
  if (new Date(editForm.value.expiryDate) < new Date(editForm.value.effectiveDate)) {
    editModalError.value = 'Batas tanggal kedaluwarsa delegasi tidak boleh mendahului tanggal efektif mulai.';
    return;
  }

  isEditSubmitting.value = true;
  try {
    await apiClient(`/v1/admin/temporary-reviewers/${editForm.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        effectiveDate: editForm.value.effectiveDate,
        expiryDate: editForm.value.expiryDate,
        updateReason: editForm.value.updateReason.trim(),
      }),
    });
    isEditModalOpen.value = false;
    showToast('Ketentuan delegasi reviewer sementara berhasil diperbarui!');
    await loadData();
  } catch (err: any) {
    editModalError.value = err.message || 'Gagal memperbarui delegasi reviewer sementara.';
  } finally {
    isEditSubmitting.value = false;
  }
}

// Revoke Modal state & handlers
const isRevokeModalOpen = ref(false);
const isRevokeSubmitting = ref(false);
const revokeModalError = ref<string | null>(null);
const revokeForm = ref({
  id: '',
  replacedOfficial: '',
  delegateName: '',
  targetFunction: '',
  revokeReason: '',
});

function openRevokeModal(d: TemporaryReviewerRow) {
  revokeModalError.value = null;
  revokeForm.value = {
    id: d.id,
    replacedOfficial: parseReplacedOfficial(d.delegationReason, d.targetFunction),
    delegateName: d.delegateUser?.fullName || 'Pejabat Pengganti',
    targetFunction: d.targetFunction,
    revokeReason: '',
  };
  isRevokeModalOpen.value = true;
}

async function handleRevokeDelegation() {
  revokeModalError.value = null;
  if (!revokeForm.value.revokeReason.trim()) {
    revokeModalError.value = 'Alasan pencabutan wewenang wajib diisi untuk kebutuhan jejak audit kepatuhan.';
    return;
  }

  isRevokeSubmitting.value = true;
  try {
    await apiClient(`/v1/admin/temporary-reviewers/${revokeForm.value.id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        revokeReason: revokeForm.value.revokeReason.trim(),
      }),
    });
    isRevokeModalOpen.value = false;
    showToast('Pendelegasian wewenang reviewer sementara berhasil dicabut!');
    await loadData();
  } catch (err: any) {
    revokeModalError.value = err.message || 'Gagal mencabut delegasi reviewer sementara.';
  } finally {
    isRevokeSubmitting.value = false;
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
              <th>AKSI</th>
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
              <td class="actions-cell">
                <button
                  type="button"
                  class="btn-icon btn-edit"
                  title="Edit Periode & Alasan Delegasi"
                  @click="openEditModal(d)"
                >
                  <Pencil :size="13" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  class="btn-icon btn-revoke"
                  title="Cabut Wewenang Delegasi Lebih Awal"
                  @click="openRevokeModal(d)"
                >
                  <Trash2 :size="13" />
                  <span>Cabut</span>
                </button>
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
              <optgroup
                v-for="group in groupedManagers"
                :key="group.label"
                :label="group.label"
              >
                <option v-for="u in group.users" :key="u.id" :value="u.id">
                  {{ u.fullName }} — {{ u.currentJobTitle || u.currentRole }} (Divisi {{ u.currentFunction || 'Umum' }})
                </option>
              </optgroup>
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
              <optgroup
                v-for="group in groupedDelegates"
                :key="group.label"
                :label="group.label"
              >
                <option v-for="u in group.users" :key="u.id" :value="u.id">
                  {{ u.fullName }} — {{ u.currentJobTitle || u.currentRole }} (Divisi {{ u.currentFunction || 'Umum' }})
                </option>
              </optgroup>
            </select>
            <span class="field-hint">Pilih personil yang mengambil alih wewenang persetujuan di divisi tersebut.</span>
          </div>

          <!-- 4. Rentang Tanggal -->
          <div class="form-row">
            <div class="form-group">
              <label for="del-eff">Tanggal Efektif Mulai *</label>
              <input
                id="del-eff"
                v-model="form.effectiveDate"
                type="date"
                required
                @change="onEffectiveDateChange"
              />
            </div>
            <div class="form-group">
              <label for="del-exp">Batas Tanggal Kedaluwarsa *</label>
              <input
                id="del-exp"
                v-model="form.expiryDate"
                type="date"
                :min="form.effectiveDate"
                required
              />
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

    <!-- Modal Edit Delegasi -->
    <div v-if="isEditModalOpen" class="modal-backdrop" @click.self="isEditModalOpen = false">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <h3>Edit Ketentuan Delegasi Reviewer</h3>
            <p class="modal-subtitle">
              Sesuaikan periode berlaku dan catat alasan perubahan pendelegasian wewenang.
            </p>
          </div>
          <button class="close-btn" @click="isEditModalOpen = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleUpdateDelegation">
          <div v-if="editModalError" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ editModalError }}</span>
          </div>

          <div class="readonly-summary-card">
            <div class="summary-line">
              <span class="label">Pejabat Pengganti:</span>
              <strong>{{ editForm.delegateName }}</strong>
            </div>
            <div class="summary-line">
              <span class="label">Menggantikan:</span>
              <strong>{{ editForm.replacedOfficial }}</strong>
            </div>
            <div class="summary-line">
              <span class="label">Divisi / Wewenang:</span>
              <span class="func-pill">{{ editForm.targetFunction }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-eff">Tanggal Efektif Mulai *</label>
              <input
                id="edit-eff"
                v-model="editForm.effectiveDate"
                type="date"
                required
                @change="onEditEffectiveDateChange"
              />
            </div>
            <div class="form-group">
              <label for="edit-exp">Batas Tanggal Kedaluwarsa *</label>
              <input
                id="edit-exp"
                v-model="editForm.expiryDate"
                type="date"
                :min="editForm.effectiveDate"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-reason">Alasan Perubahan / Revisi Delegasi *</label>
            <textarea
              id="edit-reason"
              v-model="editForm.updateReason"
              rows="2"
              placeholder="Contoh: Perpanjangan cuti tahunan atasan selama 3 hari kerja tambahan..."
              required
            ></textarea>
            <span class="field-hint">Kedua belah pihak akan otomatis menerima notifikasi pembaruan ketentuan ini.</span>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isEditModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isEditSubmitting">
              {{ isEditSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Cabut / Hapus Delegasi -->
    <div v-if="isRevokeModalOpen" class="modal-backdrop" @click.self="isRevokeModalOpen = false">
      <div class="modal-box modal-box-danger" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <h3 class="danger-title">Cabut Wewenang Reviewer Sementara</h3>
            <p class="modal-subtitle">
              Akhiri pelimpahan wewenang peninjauan lebih awal dan kembalikan hak akses ke atasan asal.
            </p>
          </div>
          <button class="close-btn" @click="isRevokeModalOpen = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleRevokeDelegation">
          <div v-if="revokeModalError" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ revokeModalError }}</span>
          </div>

          <div class="alert-banner warning">
            <AlertTriangle :size="18" />
            <span>Tindakan ini akan langsung menghentikan hak akses persetujuan cuti &amp; koreksi pejabat pengganti seketika.</span>
          </div>

          <div class="readonly-summary-card">
            <div class="summary-line">
              <span class="label">Pejabat yang Dicabut:</span>
              <strong>{{ revokeForm.delegateName }}</strong>
            </div>
            <div class="summary-line">
              <span class="label">Wewenang Kembali Ke:</span>
              <strong>{{ revokeForm.replacedOfficial }}</strong>
            </div>
            <div class="summary-line">
              <span class="label">Divisi:</span>
              <span class="func-pill">{{ revokeForm.targetFunction }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="revoke-reason">Alasan Pencabutan Wewenang *</label>
            <textarea
              id="revoke-reason"
              v-model="revokeForm.revokeReason"
              rows="2"
              placeholder="Contoh: Atasan definitif telah kembali aktif bekerja lebih awal dari cuti..."
              required
            ></textarea>
            <span class="field-hint">Kedua belah pihak akan otomatis menerima notifikasi pencabutan/pemulihan wewenang ini.</span>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isRevokeModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-danger" :disabled="isRevokeSubmitting">
              {{ isRevokeSubmitting ? 'Memproses...' : 'Cabut Wewenang Sekarang' }}
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

select {
  text-overflow: ellipsis;
}

optgroup {
  font-weight: 800;
  color: var(--color-brand-primary, #00674D);
  background: #F1F6F4;
  padding: 4px 0;
}

optgroup option {
  font-weight: normal;
  color: var(--color-text-primary, #0E211B);
  background: #FFFFFF;
  padding: 6px 10px;
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

.alert-banner.warning {
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  color: #92400E;
}

/* Actions in Table */
.actions-cell {
  white-space: nowrap;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease-in-out;
  margin-right: 6px;
}

.btn-edit {
  background: #F1F6F4;
  color: var(--color-brand-primary, #00674D);
  border-color: #C3DFD6;
}

.btn-edit:hover {
  background: #E0EFEA;
  border-color: #00674D;
}

.btn-revoke {
  background: #FEF2F2;
  color: #991B1B;
  border-color: #FECACA;
}

.btn-revoke:hover {
  background: #FEE2E2;
  border-color: #DC2626;
}

/* Readonly Summary Card in Modal */
.readonly-summary-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-sm, 6px);
  padding: 10px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-line .label {
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12px;
}

/* Danger Modal */
.modal-box-danger {
  border-top: 4px solid #DC2626;
}

.danger-title {
  color: #991B1B !important;
}

.btn-danger {
  background: #DC2626;
  color: #FFFFFF;
  border: 1px solid #B91C1C;
  font-weight: 700;
}

.btn-danger:hover:not(:disabled) {
  background: #B91C1C;
}
</style>
