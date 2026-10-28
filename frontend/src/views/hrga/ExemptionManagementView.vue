<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
} from 'lucide-vue-next';

interface ExemptionItem {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  exemptionCategory: string;
  officialReferenceNumber?: string;
  reason: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  createdByUser: { id: string; fullName: string };
}

// State
const loading = ref(false);
const submitting = ref(false);
const exemptions = ref<ExemptionItem[]>([]);
const availableUsers = ref<Array<{ id: string; fullName: string; email: string }>>([]);

// Form
const formUserId = ref('');
const formStartDate = ref('');
const formEndDate = ref('');
const formCategory = ref('Dinas Luar');
const formRefNo = ref('');
const formReason = ref('');

// Toast
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => { errorMessage.value = null; }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => { toastMessage.value = null; }, 3500);
  }
}

async function loadData() {
  loading.value = true;
  try {
    const [exemptionsRes, usersRes] = await Promise.all([
      apiClient<ExemptionItem[]>('/compliance/exemptions'),
      apiClient<Array<{ id: string; fullName: string; email: string }>>('/organization/users'),
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

async function submitExemption() {
  errorMessage.value = null;

  if (!formUserId.value) {
    showToast('Pilih karyawan penerima dispensasi.', true);
    return;
  }
  if (!formStartDate.value || !formEndDate.value) {
    showToast('Tanggal mulai dan selesai wajib diisi.', true);
    return;
  }
  if (new Date(formEndDate.value) < new Date(formStartDate.value)) {
    showToast('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', true);
    return;
  }
  if (formReason.value.trim().length < 5) {
    showToast('Alasan resmi dispensasi wajib diisi minimal 5 karakter.', true);
    return;
  }

  submitting.value = true;
  try {
    await apiClient('/compliance/exemptions', {
      method: 'POST',
      body: JSON.stringify({
        userId: formUserId.value,
        startDate: formStartDate.value,
        endDate: formEndDate.value,
        exemptionCategory: formCategory.value,
        officialReferenceNumber: formRefNo.value.trim() || undefined,
        reason: formReason.value.trim(),
      }),
    });

    showToast('Dispensasi akuntabilitas berhasil didaftarkan.');
    formReason.value = '';
    formRefNo.value = '';
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal mendaftarkan dispensasi.', true);
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
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">HRGA / <strong>Kelola Hari Libur &amp; Pengecualian (Prototipe 12)</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/compliance" class="btn-topbar">Antrean Kepatuhan</router-link>
        <router-link to="/corrections/review" class="btn-topbar">Antrean Koreksi</router-link>
      </div>
    </header>

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
      <!-- Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Tata Kelola Dispensasi &amp; Pengecualian</span>
          <h1>Kelola Hari Libur &amp; Pengecualian</h1>
          <p class="subtitle">
            Daftarkan dispensasi akuntabilitas individual (Dinas Luar, Pelatihan Sertifikasi, Cuti Khusus). Hari dispensasi otomatis dikecualikan dari pemantauan pola keterlambatan (DEC-007).
          </p>
        </div>
      </div>

      <!-- 2-Column Split: Form (Left) & Table (Right) -->
      <div class="split-layout">
        <!-- Panel Form Pendaftaran -->
        <section class="panel form-panel">
          <div class="panel-head">
            <h2>Daftarkan Dispensasi Baru</h2>
            <p class="panel-desc">Pengecualian resmi berbasis dokumen penugasan.</p>
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
                <label for="endDateInput">Tanggal Selesai <span class="req">*</span></label>
                <input id="endDateInput" v-model="formEndDate" type="date" required />
              </div>
            </div>

            <!-- Kategori Pengecualian -->
            <div class="form-group">
              <label for="catSelect">Kategori Pengecualian <span class="req">*</span></label>
              <select id="catSelect" v-model="formCategory" required>
                <option value="Dinas Luar">Dinas Luar (Penugasan Luar Kantor / Klien)</option>
                <option value="Pelatihan Sertifikasi">Pelatihan / Sertifikasi Profesional</option>
                <option value="Cuti Khusus">Cuti Khusus / Dispensasi Resmi Perusahaan</option>
                <option value="Tugas Khusus">Tugas Khusus Manajemen Eksekutif</option>
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

            <button
              type="submit"
              class="btn-submit"
              :disabled="submitting"
            >
              <span v-if="submitting">Mendaftarkan...</span>
              <span v-else>Daftarkan Dispensasi</span>
            </button>
          </form>
        </section>

        <!-- Panel Tabel Riwayat Dispensasi -->
        <section class="panel table-panel">
          <div class="panel-head">
            <h2>Daftar Pengecualian Resmi Aktif</h2>
            <p class="panel-desc">Total {{ exemptions.length }} rekaman dispensasi terdaftar.</p>
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

            <table v-else class="exemption-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Periode Dispensasi</th>
                  <th>Kategori</th>
                  <th>No. Referensi &amp; Alasan</th>
                  <th>Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in exemptions" :key="item.id">
                  <td class="col-user">
                    <div class="user-inline">
                      <User :size="14" />
                      <strong>{{ item.user.fullName }}</strong>
                    </div>
                  </td>
                  <td class="col-period">
                    <span class="period-text">
                      {{ new Date(item.startDate).toLocaleDateString('id-ID', { dateStyle: 'short' }) }}
                      s/d
                      {{ new Date(item.endDate).toLocaleDateString('id-ID', { dateStyle: 'short' }) }}
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
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
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

.btn-submit {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #00674D;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
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

@media (max-width: 900px) {
  .split-layout { grid-template-columns: 1fr; }
}
</style>
