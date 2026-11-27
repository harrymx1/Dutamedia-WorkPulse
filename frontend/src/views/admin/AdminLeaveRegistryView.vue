<script setup lang="ts">
import ToastPopup from '../../components/ToastPopup.vue';
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { formatDateWib } from '../../utils/dateTime';
import {
  Calendar,
  User,
  Pencil,
  Trash2,
  X,
} from 'lucide-vue-next';

interface ApprovedLeaveRecord {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  reviewedBy?: { id: string; fullName: string; email?: string } | null;
}

const LEAVE_TYPE_OPTIONS = [
  { value: 'ANNUAL', label: 'Cuti Tahunan' },
  { value: 'SICK', label: 'Sakit' },
  { value: 'PERMIT', label: 'Izin Resmi' },
  { value: 'SPECIAL_LEAVE', label: 'Cuti Khusus' },
  { value: 'MATERNITY', label: 'Cuti Melahirkan' },
  { value: 'UNPAID', label: 'Cuti di Luar Tanggungan' },
];

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Cuti Tahunan',
  SICK: 'Sakit',
  PERMIT: 'Izin Resmi',
  SPECIAL_LEAVE: 'Cuti Khusus',
  MATERNITY: 'Cuti Melahirkan',
  UNPAID: 'Cuti di Luar Tanggungan',
};

function formatLeaveTypeLabel(type: string): string {
  return LEAVE_TYPE_LABELS[type] || type;
}

function toInputDate(val?: string): string {
  if (!val) return '';
  return String(val).slice(0, 10);
}

// State
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const leaves = ref<ApprovedLeaveRecord[]>([]);
const availableUsers = ref<Array<{ id: string; fullName: string; email: string }>>([]);

// Form (Tambah / Edit)
const editingId = ref<string | null>(null);
const formUserId = ref('');
const formStartDate = ref('');
const formEndDate = ref('');
const formLeaveType = ref('ANNUAL');
const formReason = ref('');

// Delete Confirmation Modal
const deletingTarget = ref<ApprovedLeaveRecord | null>(null);

// Search & Filter
const searchQuery = ref('');
const typeFilter = ref('ALL');

// Toast
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const filteredLeaves = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return leaves.value.filter((item) => {
    if (typeFilter.value !== 'ALL' && item.leaveType !== typeFilter.value) {
      return false;
    }
    if (!q) return true;
    return (
      (item.user?.fullName || '').toLowerCase().includes(q) ||
      (item.user?.email || '').toLowerCase().includes(q) ||
      (item.reason || '').toLowerCase().includes(q)
    );
  });
});

function formatPeriodLabel(startDate: string, endDate: string): string {
  const startLabel = formatDateWib(startDate);
  const endLabel = formatDateWib(endDate);
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} s/d ${endLabel}`;
}

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
  } else {
    toastMessage.value = msg;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const [leavesRes, usersRes] = await Promise.all([
      apiClient<ApprovedLeaveRecord[]>('/leave/registry'),
      apiClient<Array<{ id: string; fullName: string; email: string }>>('/v1/organization/users'),
    ]);

    if (leavesRes.data) leaves.value = leavesRes.data;
    if (usersRes.data) {
      availableUsers.value = usersRes.data;
      if (availableUsers.value.length > 0 && !formUserId.value) {
        formUserId.value = availableUsers.value[0].id;
      }
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat daftar catatan cuti resmi.', true);
  } finally {
    loading.value = false;
  }
}

function startEdit(item: ApprovedLeaveRecord) {
  editingId.value = item.id;
  formUserId.value = item.userId;
  formStartDate.value = toInputDate(item.startDate);
  formEndDate.value = toInputDate(item.endDate);
  formLeaveType.value = item.leaveType || 'ANNUAL';
  formReason.value = item.reason || '';
}

function cancelEdit() {
  editingId.value = null;
  if (availableUsers.value.length > 0) {
    formUserId.value = availableUsers.value[0].id;
  }
  formStartDate.value = '';
  formEndDate.value = '';
  formLeaveType.value = 'ANNUAL';
  formReason.value = '';
}

async function submitLeaveRecord() {
  errorMessage.value = null;

  if (!formUserId.value) {
    showToast('Pilih karyawan terlebih dahulu.', true);
    return;
  }
  if (!formStartDate.value || !formEndDate.value) {
    showToast('Tanggal mulai dan tanggal selesai wajib diisi.', true);
    return;
  }
  if (new Date(formEndDate.value) < new Date(formStartDate.value)) {
    showToast('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', true);
    return;
  }
  if (formReason.value.trim().length < 5) {
    showToast('Keterangan cuti resmi wajib diisi minimal 5 karakter.', true);
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      userId: formUserId.value,
      startDate: formStartDate.value,
      endDate: formEndDate.value,
      leaveType: formLeaveType.value,
      reason: formReason.value.trim(),
    };

    if (editingId.value) {
      await apiClient(`/leave/registry/${editingId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      showToast('Catatan cuti resmi berhasil diperbarui dan dinotifikasikan ke karyawan.');
      cancelEdit();
    } else {
      await apiClient('/leave/registry', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Catatan cuti resmi berhasil didaftarkan. Karyawan otomatis dibebaskan dari check-in.');
      formStartDate.value = '';
      formEndDate.value = '';
      formReason.value = '';
    }

    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan catatan cuti resmi.', true);
  } finally {
    submitting.value = false;
  }
}

function openDeleteConfirm(item: ApprovedLeaveRecord) {
  deletingTarget.value = item;
}

function closeDeleteConfirm() {
  deletingTarget.value = null;
}

async function confirmDelete() {
  if (!deletingTarget.value) return;
  deleting.value = true;
  try {
    const targetId = deletingTarget.value.id;
    await apiClient(`/leave/registry/${targetId}`, {
      method: 'DELETE',
    });
    if (editingId.value === targetId) {
      cancelEdit();
    }
    deletingTarget.value = null;
    showToast('Catatan cuti resmi berhasil dihapus. Jadwal kerja normal berlaku kembali.');
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal menghapus catatan cuti.', true);
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="leave-registry-layout">
    <TopBar breadcrumb="Administration / Pencatatan Cuti Resmi" />

    <!-- Toasts -->
    <ToastPopup
      :toast-message="toastMessage"
      :error-message="errorMessage"
      @clear-toast="toastMessage = null"
      @clear-error="errorMessage = null"
    />

    <main class="main-content">
      <div class="page-heading">
        <div>
          <span class="eyebrow">Administrasi Cuti Resmi Ter-ACC</span>
          <h1>Pencatatan Cuti Resmi</h1>
          <p class="subtitle">
            Catat hanya data cuti, sakit, atau izin yang telah disetujui secara resmi di luar sistem. Karyawan otomatis dibebaskan dari kewajiban komitmen harian dan tiket blocker terkait dialihkan otomatis ke atasan.
          </p>
        </div>
      </div>

      <div class="split-layout">
        <!-- Panel Form Pencatatan / Edit -->
        <section class="panel form-panel">
          <div class="panel-head">
            <h2>{{ editingId ? 'Ubah Catatan Cuti Resmi' : 'Catat Cuti Resmi Baru' }}</h2>
            <p class="panel-desc">
              {{ editingId ? 'Perbarui periode atau keterangan cuti resmi yang tercatat.' : 'Langsung berstatus resmi disetujui tanpa perlu alur pengajuan ulang.' }}
            </p>
          </div>

          <form class="panel-body" @submit.prevent="submitLeaveRecord">
            <div class="form-group">
              <label for="leaveUserSelect">Karyawan <span class="req">*</span></label>
              <select id="leaveUserSelect" v-model="formUserId" required>
                <option value="" disabled>-- Pilih Karyawan --</option>
                <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                  {{ u.fullName }} ({{ u.email }})
                </option>
              </select>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="leaveStartInput">Tanggal Mulai <span class="req">*</span></label>
                <input id="leaveStartInput" v-model="formStartDate" type="date" required />
              </div>
              <div class="form-group">
                <label for="leaveEndInput">Tanggal Selesai <span class="req">*</span></label>
                <input
                  id="leaveEndInput"
                  v-model="formEndDate"
                  type="date"
                  :min="formStartDate || undefined"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="leaveTypeSelect">Jenis Cuti / Izin <span class="req">*</span></label>
              <select id="leaveTypeSelect" v-model="formLeaveType" required>
                <option v-for="opt in LEAVE_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="leaveReasonInput">Keterangan Resmi / Dasar Persetujuan <span class="req">*</span></label>
              <textarea
                id="leaveReasonInput"
                v-model="formReason"
                rows="3"
                minlength="5"
                placeholder="Misal: Cuti tahunan disetujui pimpinan / Surat keterangan dokter terlampir..."
                required
              ></textarea>
            </div>

            <div class="form-actions-row">
              <button
                type="submit"
                class="btn-submit"
                :disabled="submitting"
                data-testid="submit-leave-record"
              >
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>{{ editingId ? 'Simpan Perubahan Cuti' : 'Daftarkan Cuti Resmi' }}</span>
              </button>
              <button
                v-if="editingId"
                type="button"
                class="btn-cancel-edit"
                data-testid="cancel-leave-edit"
                @click="cancelEdit"
              >
                Batal Edit
              </button>
            </div>
          </form>
        </section>

        <!-- Panel Tabel Daftar Cuti Resmi -->
        <section class="panel table-panel">
          <div class="panel-head table-panel-head">
            <div>
              <h2>Daftar Cuti Resmi Tercatat</h2>
              <p class="panel-desc">
                Menampilkan {{ filteredLeaves.length }} dari {{ leaves.length }} catatan cuti resmi terdaftar.
              </p>
            </div>
            <div class="table-filters">
              <input
                id="leaveSearchInput"
                v-model="searchQuery"
                type="search"
                placeholder="Cari karyawan atau keterangan..."
                aria-label="Cari catatan cuti"
              />
              <select
                id="leaveTypeFilter"
                v-model="typeFilter"
                aria-label="Saring jenis cuti"
              >
                <option value="ALL">Semua Jenis</option>
                <option v-for="opt in LEAVE_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="table-container">
            <div v-if="loading && leaves.length === 0" class="loading-state">
              <span>Memuat data cuti resmi...</span>
            </div>

            <div v-else-if="leaves.length === 0" class="empty-state">
              <Calendar :size="36" class="empty-icon" />
              <h3>Belum Ada Catatan Cuti Resmi</h3>
              <p>Seluruh karyawan berada dalam jadwal kerja akuntabilitas harian normal.</p>
            </div>

            <div v-else-if="filteredLeaves.length === 0" class="empty-state">
              <Calendar :size="36" class="empty-icon" />
              <h3>Tidak Ada Catatan yang Cocok</h3>
              <p>Ubah kata kunci pencarian atau filter jenis cuti.</p>
            </div>

            <table v-else class="registry-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Periode</th>
                  <th>Jenis</th>
                  <th>Keterangan</th>
                  <th>Dicatat Oleh</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredLeaves" :key="item.id" :data-testid="`leave-row-${item.id}`">
                  <td>
                    <div class="user-inline">
                      <User :size="14" />
                      <strong>{{ item.user?.fullName || '-' }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="period-text wp-datetime">
                      {{ formatPeriodLabel(item.startDate, item.endDate) }}
                    </span>
                  </td>
                  <td>
                    <span class="cat-pill">{{ formatLeaveTypeLabel(item.leaveType) }}</span>
                  </td>
                  <td>
                    <p class="reason-desc">{{ item.reason }}</p>
                  </td>
                  <td class="col-creator">
                    <small>{{ item.reviewedBy?.fullName || 'Tim HRGA' }}</small>
                  </td>
                  <td class="col-actions">
                    <div class="row-actions">
                      <button
                        type="button"
                        class="btn-row edit"
                        :data-testid="`edit-leave-${item.id}`"
                        title="Edit catatan cuti"
                        @click="startEdit(item)"
                      >
                        <Pencil :size="13" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        class="btn-row delete"
                        :data-testid="`delete-leave-${item.id}`"
                        title="Hapus catatan cuti"
                        @click="openDeleteConfirm(item)"
                      >
                        <Trash2 :size="13" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="deletingTarget" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Hapus Catatan Cuti Resmi?</h3>
          <button type="button" class="close-btn" aria-label="Tutup" @click="closeDeleteConfirm">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p>
            Anda akan menghapus catatan <strong>{{ formatLeaveTypeLabel(deletingTarget.leaveType) }}</strong> milik
            <strong>{{ deletingTarget.user?.fullName }}</strong> periode
            <strong>{{ formatPeriodLabel(deletingTarget.startDate, deletingTarget.endDate) }}</strong>.
          </p>
          <p class="modal-note">
            Setelah dihapus, kewajiban akuntabilitas harian normal karyawan berlaku kembali dan notifikasi pemberitahuan akan dikirim ke yang bersangkutan.
          </p>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-cancel-edit" @click="closeDeleteConfirm">Batal</button>
          <button
            type="button"
            class="btn-danger"
            :disabled="deleting"
            data-testid="confirm-delete-leave"
            @click="confirmDelete"
          >
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Catatan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-registry-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.main-content {
  max-width: 1240px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

.page-heading {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  color: #5C6E68;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0 6px;
}

.subtitle {
  font-size: 13.5px;
  color: #5C6E68;
  max-width: 780px;
}

.split-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
}

.panel {
  background: #fff;
  border: 1px solid #DCE7E2;
  border-radius: 12px;
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid #DCE7E2;
  background: #FAFCFB;
}

.panel-head h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.panel-desc {
  font-size: 12px;
  color: #5C6E68;
  margin-top: 2px;
}

.panel-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 14px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  font-size: 12.5px;
  font-weight: 700;
  color: #0E211B;
  display: block;
  margin-bottom: 5px;
}

.req { color: #991B1B; }

input[type="text"],
input[type="search"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #DCE7E2;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #0E211B;
  box-sizing: border-box;
}

.form-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-submit {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel-edit {
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #DCE7E2;
  background: #fff;
  color: #475B54;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.table-panel-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.table-filters input[type="search"] {
  flex: 1 1 220px;
  min-width: 0;
}

.table-filters select {
  flex: 0 0 190px;
  width: 190px;
}

.table-container {
  overflow-x: auto;
}

.registry-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.registry-table th {
  background: #EFF5F2;
  padding: 12px 14px;
  font-weight: 700;
  font-size: 11.5px;
  color: #5C6E68;
  border-bottom: 1px solid #DCE7E2;
  text-transform: uppercase;
}

.registry-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #DCE7E2;
  vertical-align: middle;
}

.user-inline {
  display: flex;
  align-items: center;
  gap: 6px;
}

.period-text {
  font-size: 12px;
  font-weight: 600;
  color: #00674D;
  background: #E6F4EE;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  display: inline-block;
}

.cat-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #EFF5F2;
  color: #475B54;
  white-space: nowrap;
  display: inline-block;
}

.reason-desc {
  font-size: 12px;
  color: #5C6E68;
  margin: 0;
}

.col-creator small {
  color: #66736E;
  font-size: 11.5px;
}

.row-actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.btn-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid #DCE7E2;
  background: #fff;
}

.btn-row.edit {
  color: #00674D;
  border-color: #CBE0D6;
}

.btn-row.edit:hover {
  background: #E6F4EE;
}

.btn-row.delete {
  color: #991B1B;
  border-color: #FECACA;
}

.btn-row.delete:hover {
  background: #FEF2F2;
}

.empty-state, .loading-state {
  padding: 60px 24px;
  text-align: center;
  color: #5C6E68;
}

.empty-icon {
  color: #00674D;
  margin-bottom: 8px;
}

.toast-popup {
  position: fixed;
  top: 70px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success { background: #DCFCE7; color: #166534; border: 1px solid #86EFAC; }
.toast-popup.error { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #DCE7E2;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #DCE7E2;
  background: #FAFCFB;
}

.modal-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #991B1B;
}

.close-btn {
  border: none;
  background: transparent;
  color: #5C6E68;
  cursor: pointer;
}

.modal-body {
  padding: 18px;
  font-size: 13px;
  line-height: 1.5;
}

.modal-note {
  color: #5C6E68;
  font-size: 12px;
  margin-top: 8px;
  margin-bottom: 0;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #DCE7E2;
  background: #FAFCFB;
}

.btn-danger {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #DC2626;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1180px) {
  .split-layout { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .main-content { padding: 16px 12px 64px; }
  .form-grid-2 { grid-template-columns: 1fr; gap: 0; }
  .table-filters { flex-direction: column; align-items: stretch; }
  .table-filters input[type="search"],
  .table-filters select { width: 100%; flex: none; }
}
</style>
