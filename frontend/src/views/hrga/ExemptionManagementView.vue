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

interface ExemptionItem {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  exemptionCategory: string;
  officialReferenceNumber?: string;
  reason: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  createdByUser: { id: string; fullName: string };
}

function toInputDate(val?: string): string {
  if (!val) return '';
  return String(val).slice(0, 10);
}

// State
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const exemptions = ref<ExemptionItem[]>([]);
const availableUsers = ref<Array<{ id: string; fullName: string; email: string }>>([]);

// Form (Tambah / Edit)
const editingId = ref<string | null>(null);
const deletingTarget = ref<ExemptionItem | null>(null);
const formUserId = ref('');
const formStartDate = ref('');
const formEndDate = ref('');
const formIsPermanent = ref(false);
const formCategory = ref('Dinas Luar');
const formRefNo = ref('');
const formReason = ref('');

// Toast
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Search & Filter
const searchQuery = ref('');
const categoryFilter = ref('ALL');

const filteredExemptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return exemptions.value.filter((item) => {
    if (categoryFilter.value !== 'ALL' && item.exemptionCategory !== categoryFilter.value) {
      return false;
    }
    if (!q) return true;
    return (
      item.user.fullName.toLowerCase().includes(q) ||
      (item.user.email || '').toLowerCase().includes(q) ||
      (item.officialReferenceNumber || '').toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    );
  });
});

function formatPeriodLabel(startDate: string, endDate?: string | null): string {
  const startLabel = formatDateWib(startDate);
  if (!endDate) {
    return `Mulai ${startLabel} (Permanen)`;
  }
  const endLabel = formatDateWib(endDate);
  if (startLabel === endLabel) {
    return startLabel;
  }
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
    const [exemptionsRes, usersRes] = await Promise.all([
      apiClient<ExemptionItem[]>('/compliance/exemptions'),
      apiClient<Array<{ id: string; fullName: string; email: string }>>('/v1/organization/users'),
    ]);

    if (exemptionsRes.data) exemptions.value = exemptionsRes.data;
    if (usersRes.data) {
      availableUsers.value = usersRes.data;
      if (availableUsers.value.length > 0 && !formUserId.value) {
        formUserId.value = availableUsers.value[0].id;
      }
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat data dispensasi.', true);
  } finally {
    loading.value = false;
  }
}

function startEdit(item: ExemptionItem) {
  editingId.value = item.id;
  formUserId.value = item.userId;
  formStartDate.value = toInputDate(item.startDate);
  formIsPermanent.value = !item.endDate;
  formEndDate.value = item.endDate ? toInputDate(item.endDate) : '';
  formCategory.value = item.exemptionCategory || 'Dinas Luar';
  formRefNo.value = item.officialReferenceNumber || '';
  formReason.value = item.reason || '';
}

function cancelEdit() {
  editingId.value = null;
  if (availableUsers.value.length > 0) {
    formUserId.value = availableUsers.value[0].id;
  }
  formStartDate.value = '';
  formEndDate.value = '';
  formIsPermanent.value = false;
  formCategory.value = 'Dinas Luar';
  formRefNo.value = '';
  formReason.value = '';
}

function openDeleteConfirm(item: ExemptionItem) {
  deletingTarget.value = item;
}

function closeDeleteConfirm() {
  deletingTarget.value = null;
}

async function confirmDeleteExemption() {
  if (!deletingTarget.value) return;
  deleting.value = true;
  try {
    const targetId = deletingTarget.value.id;
    await apiClient(`/compliance/exemptions/${targetId}`, {
      method: 'DELETE',
    });
    if (editingId.value === targetId) {
      cancelEdit();
    }
    deletingTarget.value = null;
    showToast('Catatan dispensasi berhasil dihapus. Jadwal akuntabilitas normal berlaku kembali.');
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal menghapus data dispensasi.', true);
  } finally {
    deleting.value = false;
  }
}

async function submitExemption() {
  errorMessage.value = null;

  if (!formUserId.value) {
    showToast('Pilih karyawan penerima dispensasi.', true);
    return;
  }
  if (!formStartDate.value) {
    showToast('Tanggal mulai wajib diisi.', true);
    return;
  }
  if (!formIsPermanent.value) {
    if (!formEndDate.value) {
      showToast('Tanggal selesai wajib diisi kecuali berlaku permanen.', true);
      return;
    }
    if (new Date(formEndDate.value) < new Date(formStartDate.value)) {
      showToast('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', true);
      return;
    }
  }
  if (formReason.value.trim().length < 5) {
    showToast('Alasan resmi dispensasi wajib diisi minimal 5 karakter.', true);
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      userId: formUserId.value,
      startDate: formStartDate.value,
      endDate: formIsPermanent.value ? null : formEndDate.value,
      isPermanent: formIsPermanent.value,
      exemptionCategory: formCategory.value,
      officialReferenceNumber: formRefNo.value.trim() || undefined,
      reason: formReason.value.trim(),
    };

    if (editingId.value) {
      await apiClient(`/compliance/exemptions/${editingId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      showToast('Data dispensasi resmi berhasil diperbarui dan dinotifikasikan ke karyawan.');
      cancelEdit();
    } else {
      await apiClient('/compliance/exemptions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast(
        formIsPermanent.value
          ? 'Pengecualian permanen berhasil didaftarkan. Menu komitmen harian otomatis dinonaktifkan (Lapor Blocker tetap aktif).'
          : 'Dispensasi akuntabilitas berhasil didaftarkan. Karyawan otomatis dibebaskan dari check-in.',
      );
      formStartDate.value = '';
      formEndDate.value = '';
      formIsPermanent.value = false;
      formReason.value = '';
      formRefNo.value = '';
    }
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan data dispensasi.', true);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="exemption-layout">
    <!-- Topbar Navigation -->
    <TopBar breadcrumb="Administration / Manajemen Dispensasi" />

    <!-- Toasts -->
    <ToastPopup
      :toast-message="toastMessage"
      :error-message="errorMessage"
      @clear-toast="toastMessage = null"
      @clear-error="errorMessage = null"
    />

    <main class="main-content">
      <!-- Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Tata Kelola Dispensasi &amp; Pengecualian</span>
          <h1>Manajemen Dispensasi &amp; Pengecualian Akuntabilitas</h1>
          <p class="subtitle">
            Daftarkan dispensasi akuntabilitas individual yang sudah sah (Dinas Luar, Pelatihan Sertifikasi, Tugas Khusus) langsung oleh HRGA/Direktur/Admin tanpa alur pengajuan ulang. Karyawan otomatis dibebaskan dari kewajiban check-in harian tanpa perlu memilih 0 komitmen.
          </p>
        </div>
      </div>

      <!-- 2-Column Split: Form (Left) & Table (Right) -->
      <div class="split-layout">
        <!-- Panel Form Pendaftaran / Edit -->
        <section class="panel form-panel">
          <div class="panel-head">
            <h2>{{ editingId ? 'Ubah Data Dispensasi' : 'Daftarkan Dispensasi Baru' }}</h2>
            <p class="panel-desc">
              {{ editingId ? 'Perbarui periode, kategori, atau alasan dispensasi resmi.' : 'Pengecualian resmi berbasis dokumen penugasan yang otomatis membebaskan check-in.' }}
            </p>
          </div>

          <form class="panel-body" @submit.prevent="submitExemption">
            <!-- Karyawan -->
            <div class="form-group">
              <label for="empSelect">Karyawan Penerima Dispensasi <span class="req">*</span></label>
              <select id="empSelect" v-model="formUserId" required>
                <option value="" disabled>-- Pilih Karyawan --</option>
                <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                  {{ u.fullName }} ({{ u.email }})
                </option>
              </select>
            </div>

            <!-- Periode Tanggal -->
            <div class="form-grid-2">
              <div class="form-group">
                <label for="startDateInput">Tanggal Mulai <span class="req">*</span></label>
                <input id="startDateInput" v-model="formStartDate" type="date" required />
              </div>
              <div class="form-group">
                <label for="endDateInput">
                  Tanggal Selesai <span v-if="!formIsPermanent" class="req">*</span>
                </label>
                <input
                  id="endDateInput"
                  v-model="formEndDate"
                  type="date"
                  :min="formStartDate || undefined"
                  :disabled="formIsPermanent"
                  :required="!formIsPermanent"
                />
              </div>
            </div>

            <!-- Toggle Pengecualian Permanen (DEC-022) -->
            <div class="permanent-toggle-box">
              <label class="permanent-checkbox-label" for="permanentCheck">
                <input
                  id="permanentCheck"
                  v-model="formIsPermanent"
                  type="checkbox"
                  data-testid="permanent-exemption-checkbox"
                />
                <span>Berlaku Permanen (tanpa tanggal berakhir, sampai diubah/dihapus Admin)</span>
              </label>
              <p v-if="formIsPermanent" class="permanent-hint">
                Aktif terus mulai Tanggal Mulai. Menu komitmen harian &amp; koreksi disembunyikan, sementara Lapor Blocker tetap aktif.
              </p>
            </div>

            <!-- Kategori Pengecualian -->
            <div class="form-group">
              <label for="catSelect">Kategori Pengecualian <span class="req">*</span></label>
              <select id="catSelect" v-model="formCategory" required>
                <option value="Dinas Luar">Dinas Luar (Penugasan Luar Kantor / Klien)</option>
                <option value="Pelatihan Sertifikasi">Pelatihan / Sertifikasi Profesional</option>
                <option value="Cuti Khusus">Cuti Khusus / Dispensasi Resmi Perusahaan</option>
                <option value="Tugas Khusus">Tugas Khusus Manajemen Eksekutif</option>
                <option value="Pengecualian Permanen">Pengecualian Permanen (Bebas Komitmen Harian)</option>
              </select>
            </div>

            <!-- Nomor Surat Tugas -->
            <div class="form-group">
              <label for="refNoInput">Nomor Surat Tugas / Referensi <span class="opt">(opsional)</span></label>
              <input
                id="refNoInput"
                v-model="formRefNo"
                type="text"
                placeholder="Contoh: ST/HRGA/2026/X/042"
              />
            </div>

            <!-- Alasan Resmi -->
            <div class="form-group">
              <label for="reasonInput">Alasan Resmi Dispensasi <span class="req">*</span></label>
              <textarea
                id="reasonInput"
                v-model="formReason"
                rows="3"
                minlength="5"
                placeholder="Tuliskan keterangan detail keperluan dinas luar atau pelatihan..."
                required
              ></textarea>
            </div>

            <div class="form-actions-row">
              <button
                type="submit"
                class="btn-submit"
                :disabled="submitting"
                data-testid="submit-exemption-btn"
              >
                <span v-if="submitting">Menyimpan...</span>
                <span v-else>{{ editingId ? 'Simpan Perubahan Dispensasi' : 'Daftarkan Dispensasi' }}</span>
              </button>
              <button
                v-if="editingId"
                type="button"
                class="btn-cancel-edit"
                data-testid="cancel-exemption-edit"
                @click="cancelEdit"
              >
                Batal Edit
              </button>
            </div>
          </form>
        </section>

        <!-- Panel Tabel Riwayat Dispensasi -->
        <section class="panel table-panel">
          <div class="panel-head table-panel-head">
            <div>
              <h2>Daftar Pengecualian Resmi Aktif</h2>
              <p class="panel-desc">
                Menampilkan {{ filteredExemptions.length }} dari {{ exemptions.length }} rekaman dispensasi terdaftar.
              </p>
            </div>
            <div class="table-filters">
              <input
                id="exemptionSearchInput"
                v-model="searchQuery"
                type="search"
                placeholder="Cari karyawan, no. surat, alasan..."
                aria-label="Cari dispensasi"
              />
              <select
                id="exemptionCategoryFilter"
                v-model="categoryFilter"
                aria-label="Saring kategori dispensasi"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Dinas Luar">Dinas Luar</option>
                <option value="Pelatihan Sertifikasi">Pelatihan Sertifikasi</option>
                <option value="Cuti Khusus">Cuti Khusus</option>
                <option value="Tugas Khusus">Tugas Khusus</option>
                <option value="Pengecualian Permanen">Pengecualian Permanen</option>
              </select>
            </div>
          </div>

          <div class="table-container">
            <div v-if="loading && exemptions.length === 0" class="loading-state">
              <span>Memuat data dispensasi...</span>
            </div>

            <div v-else-if="exemptions.length === 0" class="empty-state">
              <Calendar :size="36" class="empty-icon" />
              <h3>Belum Ada Dispensasi Aktif</h3>
              <p>Seluruh karyawan berada dalam jadwal kerja akuntabilitas harian normal.</p>
            </div>

            <div v-else-if="filteredExemptions.length === 0" class="empty-state">
              <Calendar :size="36" class="empty-icon" />
              <h3>Tidak Ada Dispensasi yang Cocok</h3>
              <p>Ubah kata kunci pencarian atau pilihan kategori untuk melihat daftar dispensasi lainnya.</p>
            </div>

            <table v-else class="exemption-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Periode Dispensasi</th>
                  <th>Kategori</th>
                  <th>No. Referensi &amp; Alasan</th>
                  <th>Dicatat Oleh</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredExemptions" :key="item.id" :data-testid="`exemption-row-${item.id}`">
                  <td class="col-user">
                    <div class="user-inline">
                      <User :size="14" />
                      <strong>{{ item.user.fullName }}</strong>
                    </div>
                  </td>
                  <td class="col-period">
                    <span class="period-text wp-datetime">
                      {{ formatPeriodLabel(item.startDate, item.endDate) }}
                    </span>
                  </td>
                  <td class="col-cat">
                    <span class="cat-pill">{{ item.exemptionCategory }}</span>
                  </td>
                  <td class="col-reason">
                    <span v-if="item.officialReferenceNumber" class="ref-pill">{{ item.officialReferenceNumber }}</span>
                    <p class="reason-desc">{{ item.reason }}</p>
                  </td>
                  <td class="col-creator">
                    <small>{{ item.createdByUser.fullName }}</small>
                  </td>
                  <td class="col-actions">
                    <div class="row-actions">
                      <button
                        type="button"
                        class="btn-row edit"
                        :data-testid="`edit-exemption-${item.id}`"
                        @click="startEdit(item)"
                      >
                        <Pencil :size="13" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        class="btn-row delete"
                        :data-testid="`delete-exemption-${item.id}`"
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

    <!-- Modal Konfirmasi Hapus Dispensasi -->
    <div v-if="deletingTarget" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Hapus Catatan Dispensasi?</h3>
          <button type="button" class="close-btn" aria-label="Tutup" @click="closeDeleteConfirm">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p>
            Anda akan menghapus dispensasi <strong>{{ deletingTarget.exemptionCategory }}</strong> milik
            <strong>{{ deletingTarget.user.fullName }}</strong> periode
            <strong>{{ formatPeriodLabel(deletingTarget.startDate, deletingTarget.endDate) }}</strong>.
          </p>
          <p class="modal-note">
            Setelah dihapus, kewajiban akuntabilitas harian normal karyawan berlaku kembali dan pemberitahuan akan dikirim.
          </p>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn-cancel-edit" @click="closeDeleteConfirm">Batal</button>
          <button
            type="button"
            class="btn-danger"
            :disabled="deleting"
            data-testid="confirm-delete-exemption"
            @click="confirmDeleteExemption"
          >
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Dispensasi' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exemption-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
  font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
}

.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #DCE7E2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  background: #00674D;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;
}

.brand-title {
  font-weight: 800;
  font-size: 15px;
}

.breadcrumb {
  font-size: 13px;
  color: #5C6E68;
  border-left: 1px solid #DCE7E2;
  padding-left: 12px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-topbar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #DCE7E2;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: #5C6E68;
  text-decoration: none;
}

.main-content {
  max-width: 1200px;
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
  max-width: 760px;
}

.split-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
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
.opt { font-size: 11px; color: #66736E; font-weight: normal; }

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

.table-panel-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-filters input[type="search"] {
  flex: 1 1 220px;
  min-width: 0;
}

.table-filters select {
  flex: 0 0 180px;
  width: 180px;
}

.form-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-submit {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
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

.btn-row.edit { color: #00674D; border-color: #CBE0D6; }
.btn-row.edit:hover { background: #E6F4EE; }
.btn-row.delete { color: #991B1B; border-color: #FECACA; }
.btn-row.delete:hover { background: #FEF2F2; }

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

.close-btn { border: none; background: transparent; color: #5C6E68; cursor: pointer; }
.modal-body { padding: 18px; font-size: 13px; line-height: 1.5; }
.modal-note { color: #5C6E68; font-size: 12px; margin-top: 8px; margin-bottom: 0; }
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

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

.exemption-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.exemption-table th {
  background: #EFF5F2;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 12px;
  color: #5C6E68;
  border-bottom: 1px solid #DCE7E2;
  text-transform: uppercase;
}

.exemption-table td {
  padding: 14px 16px;
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
}

.cat-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #EFF5F2;
  color: #5C6E68;
}

.ref-pill {
  font-size: 10.5px;
  font-family: monospace;
  font-weight: 700;
  background: #F1F5F9;
  padding: 1px 4px;
  border-radius: 3px;
  display: inline-block;
  margin-bottom: 2px;
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

.table-filters {
  flex-wrap: wrap;
}

.period-text,
.cat-pill {
  display: inline-block;
  white-space: nowrap;
}

.permanent-toggle-box {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #CBE0D6;
  background: #F4FAF7;
}

.permanent-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: #0E211B;
  cursor: pointer;
}

.permanent-checkbox-label input[type="checkbox"] {
  width: auto;
  margin-top: 2px;
  accent-color: #00674D;
}

.permanent-hint {
  margin: 6px 0 0 22px;
  font-size: 11.5px;
  line-height: 1.45;
  color: #00674D;
}

@media (max-width: 1180px) {
  .split-layout { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 12px 64px;
  }

  h1 {
    font-size: 20px;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .panel-head {
    padding: 14px 16px;
  }

  .panel-body {
    padding: 16px;
  }

  .table-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .table-filters input[type="search"],
  .table-filters select {
    width: 100%;
    max-width: 100%;
    flex: none;
  }

  .table-container {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toast-popup {
    left: 12px;
    right: 12px;
    top: 64px;
  }
}
</style>
