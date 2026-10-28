<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-vue-next';

interface AdditionalWorkItem {
  id: string;
  taskText: string;
  reason: string;
  assignedByUser?: { id: string; fullName: string };
  createdAt: string;
}

interface SimpleUser {
  id: string;
  fullName: string;
  email: string;
}

// State
const loading = ref(false);
const submitting = ref(false);
const recordId = ref<string | null>(null);
const workDate = ref('');
const additionalWorks = ref<AdditionalWorkItem[]>([]);
const availableManagers = ref<SimpleUser[]>([]);

const formTaskText = ref('');
const formReason = ref('NEWLY_ASSIGNED');
const formAssignedBy = ref('');

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function loadTodayState() {
  loading.value = true;
  try {
    const res = await apiClient<{
      workDate: string;
      record: any;
    }>('/daily/today');

    workDate.value = res.data.workDate;
    if (res.data.record) {
      recordId.value = res.data.record.id;
      additionalWorks.value = res.data.record.additionalWorks || [];
    }

    // Load available managers for NEWLY_ASSIGNED
    const usersRes = await apiClient<SimpleUser[]>('/organization/users');
    availableManagers.value = usersRes.data || [];
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat pekerjaan tambahan.', true);
  } finally {
    loading.value = false;
  }
}

async function addAdditionalWork() {
  if (!recordId.value) {
    showToast('Silakan isi Morning Commitment hari ini terlebih dahulu sebelum mencatat pekerjaan tambahan.', true);
    return;
  }

  if (formTaskText.value.trim().length < 5) {
    showToast('Deskripsi pekerjaan tambahan minimal 5 karakter.', true);
    return;
  }

  if (formReason.value === 'NEWLY_ASSIGNED' && !formAssignedBy.value) {
    showToast('Pekerjaan dengan alasan Penugasan Baru wajib memilih atasan yang menugaskan.', true);
    return;
  }

  submitting.value = true;
  try {
    await apiClient(`/daily/records/${recordId.value}/additional-work`, {
      method: 'POST',
      body: JSON.stringify({
        taskText: formTaskText.value.trim(),
        reason: formReason.value,
        assignedByUserId: formReason.value === 'NEWLY_ASSIGNED' ? formAssignedBy.value : undefined,
      }),
    });

    showToast('Pekerjaan tambahan berhasil dicatat.');
    formTaskText.value = '';
    formReason.value = 'NEWLY_ASSIGNED';
    formAssignedBy.value = '';
    await loadTodayState();
  } catch (err: any) {
    showToast(err.message || 'Gagal menambahkan pekerjaan tambahan.', true);
  } finally {
    submitting.value = false;
  }
}

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => { errorMessage.value = null; }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => { toastMessage.value = null; }, 3800);
  }
}

onMounted(() => {
  loadTodayState();
});
</script>

<template>
  <div class="daily-layout">
    <!-- Topbar Navigation -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">My Today / <strong>Additional Work</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/daily/history" class="nav-btn">Riwayat Saya</router-link>
        <router-link to="/profile" class="nav-btn">Profil</router-link>
      </div>
    </header>

    <!-- Daily Workflow Step Bar -->
    <nav class="workflow-bar" aria-label="Alur Akuntabilitas Harian">
      <router-link to="/daily/morning" class="step-item">
        <span class="step-num">1</span>
        <span>Morning Commitment</span>
      </router-link>
      <router-link to="/daily/additional-work" class="step-item active">
        <span class="step-num">2</span>
        <span>Additional Work</span>
      </router-link>
      <router-link to="/daily/eod" class="step-item">
        <span class="step-num">3</span>
        <span>EOD Outcome</span>
      </router-link>
    </nav>

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
          <h1>Additional Work (Pekerjaan Tambahan)</h1>
          <p class="subtitle">
            Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari tanpa mengubah baseline komitmen pagi (Prototipe 03).
          </p>
        </div>
      </div>

      <!-- Warning jika belum Morning Check-in -->
      <div v-if="!recordId && !loading" class="alert-box" role="alert">
        <AlertCircle :size="20" />
        <div>
          <strong>Belum Mengisi Morning Commitment:</strong>
          Silakan kirimkan komitmen pagi terlebih dahulu sebelum menambahkan pekerjaan tambahan siang hari.
          <router-link to="/daily/morning" class="alert-link">Buka Morning Commitment &rarr;</router-link>
        </div>
      </div>

      <!-- Form Tambah Additional Work -->
      <section v-if="recordId" class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Input Pekerjaan Tambahan</div>
            <h2>Formulir Pencatatan Pekerjaan Tambahan</h2>
          </div>
        </div>
        <div class="panel-body">
          <form @submit.prevent="addAdditionalWork" class="form-container">
            <div class="form-group">
              <label for="input-task-text" class="form-label">Deskripsi Pekerjaan Tambahan *</label>
              <textarea
                id="input-task-text"
                v-model="formTaskText"
                class="input-control"
                rows="2"
                placeholder="Deskripsikan pekerjaan tambahan atau tugas baru yang dikerjakan..."
                required
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="select-reason" class="form-label">Alasan Pekerjaan Tambahan *</label>
                <select id="select-reason" v-model="formReason" class="input-control" required>
                  <option value="NEWLY_ASSIGNED">Penugasan Baru dari Atasan (NEWLY_ASSIGNED)</option>
                  <option value="MISSED_IN_PLANNING">Terlewat saat Perencanaan Pagi (MISSED_IN_PLANNING)</option>
                  <option value="PRIORITY_CHANGE">Perubahan Prioritas Proyek (PRIORITY_CHANGE)</option>
                  <option value="OPERATIONAL_INCIDENT">Insiden Operasional / Bug Mendesak (OPERATIONAL_INCIDENT)</option>
                  <option value="OTHER">Lainnya (OTHER)</option>
                </select>
              </div>

              <div v-if="formReason === 'NEWLY_ASSIGNED'" class="form-group">
                <label for="select-assigned-by" class="form-label">Ditugaskan Oleh (Atasan Langsung/Lead) *</label>
                <select id="select-assigned-by" v-model="formAssignedBy" class="input-control" required>
                  <option value="" disabled>-- Pilih Atasan Penugas --</option>
                  <option v-for="user in availableManagers" :key="user.id" :value="user.id">
                    {{ user.fullName }} ({{ user.email }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <Plus :size="16" />
                <span>{{ submitting ? 'Menambahkan...' : 'Tambahkan Pekerjaan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Daftar Pekerjaan Tambahan Hari Ini -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <div class="kicker">Daftar Hari Ini</div>
            <h2>Pekerjaan Tambahan yang Tercatat ({{ additionalWorks.length }})</h2>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="additionalWorks.length === 0" class="empty-state">
            <Briefcase :size="32" class="empty-icon" />
            <p>Belum ada pekerjaan tambahan yang dicatat untuk hari ini.</p>
          </div>
          <div v-else class="works-list">
            <div v-for="(item, idx) in additionalWorks" :key="item.id" class="work-card">
              <div class="work-main">
                <div class="work-header">
                  <span class="work-idx">#{{ idx + 1 }}</span>
                  <span class="badge badge-info">{{ item.reason }}</span>
                  <span v-if="item.assignedByUser" class="assigned-by">
                    Ditugaskan oleh: <strong>{{ item.assignedByUser.fullName }}</strong>
                  </span>
                </div>
                <div class="work-title">{{ item.taskText }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.daily-layout {
  min-height: 100vh;
  background-color: var(--color-canvas);
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  background: var(--color-brand-primary);
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text-primary);
}

.breadcrumb {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.topbar-right {
  display: flex;
  gap: 14px;
}

.nav-btn {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.nav-btn:hover {
  background: var(--color-surface-subtle);
  color: var(--color-brand-primary);
}

.workflow-bar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  padding: 0 24px;
  gap: 32px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.step-item.active {
  color: var(--color-brand-primary);
  border-bottom-color: var(--color-brand-primary);
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-item.active .step-num {
  background: var(--color-brand-primary);
  color: #fff;
}

.main-content {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-heading h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.alert-box {
  background: var(--color-status-amber-bg);
  border: 1px solid var(--color-status-amber-border);
  color: var(--color-status-amber-fg);
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 13px;
}

.alert-link {
  font-weight: 700;
  color: var(--color-brand-primary);
  margin-left: 6px;
}

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.kicker {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.panel-body {
  padding: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-control {
  padding: 9px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  color: var(--color-text-primary);
}

.input-control:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-brand-hover);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  gap: 8px;
}

.empty-icon {
  color: var(--color-border-strong);
}

.works-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.work-card {
  padding: 14px 18px;
  background: var(--color-canvas);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
}

.work-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.work-idx {
  font-weight: 800;
  font-size: 13px;
  color: var(--color-brand-primary);
}

.assigned-by {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.work-title {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.badge-info {
  background: #e0f2fe;
  color: #0369a1;
}

.toast-popup {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  border: 1px solid var(--color-status-green-border);
}

.toast-popup.error {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
  border: 1px solid var(--color-status-red-border);
}
</style>
