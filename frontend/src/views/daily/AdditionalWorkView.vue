<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import AccessLink from '../../components/AccessLink.vue';
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Briefcase,
  ChevronDown,
} from 'lucide-vue-next';

interface AdditionalWorkItem {
  id: string;
  taskText: string;
  reason: string;
  projectCode?: string | null;
  linkedBlockerId?: string | null;
  referenceLink?: string | null;
  assignedByUser?: { id: string; fullName: string };
  createdAt: string;
}

interface SimpleUser {
  id: string;
  fullName: string;
  email: string;
}

interface ProjectOption {
  projectCode: string;
  projectName: string;
}

interface ActiveBlockerOption {
  id: string;
  code: string;
  description: string;
  severity: string;
  projectCodeReference: string | null;
  status: string;
}

// State
const loading = ref(false);
const submitting = ref(false);
const recordId = ref<string | null>(null);
const workDate = ref('');
const additionalWorks = ref<AdditionalWorkItem[]>([]);
const availableManagers = ref<SimpleUser[]>([]);
const availableProjects = ref<ProjectOption[]>([
  { projectCode: 'PRJ-PORTAL', projectName: 'Website Customer Portal & Client Billing' },
  { projectCode: 'PRJ-CORE', projectName: 'Enterprise Core Engine & Identity Sync' },
  { projectCode: 'PRJ-MOBILE', projectName: 'WorkPulse Mobile Apps — iOS & Android' },
]);
const activeBlockers = ref<ActiveBlockerOption[]>([]);
const isBlockerPickerOpen = ref(false);

const formTaskText = ref('');
const formReason = ref('NEWLY_ASSIGNED');
const formAssignedBy = ref('');
const formOtherReason = ref('');
const formProjectCode = ref('');
const formReferenceLink = ref('');
const formLinkedBlockerId = ref('');

function formatReason(reason: string): string {
  const map: Record<string, string> = {
    NEWLY_ASSIGNED: 'Penugasan Baru Atasan',
    OPERATIONAL_INCIDENT: 'Perbaikan Error / Bug Kritis',
    MISSED_IN_PLANNING: 'Terlewat Catat Pagi',
    PRIORITY_CHANGE: 'Pengalihan Prioritas',
    OTHER: 'Lainnya',
  };
  return map[reason] || reason;
}

const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function loadTodayState() {
  loading.value = true;
  try {
    const res = await apiClient<{
      workDate: string;
      record: any;
      availableProjects?: ProjectOption[];
      activeBlockers?: ActiveBlockerOption[];
    }>('/daily/today');

    workDate.value = res.data.workDate;
    if (Array.isArray(res.data.availableProjects) && res.data.availableProjects.length > 0) {
      availableProjects.value = res.data.availableProjects;
    }
    if (Array.isArray(res.data.activeBlockers)) {
      activeBlockers.value = res.data.activeBlockers;
    }
    if (res.data.record) {
      recordId.value = res.data.record.id;
      additionalWorks.value = res.data.record.additionalWorks || [];
    }

    // Load available managers for NEWLY_ASSIGNED
    const usersRes = await apiClient<SimpleUser[]>('/v1/organization/users');
    availableManagers.value = usersRes.data || [];
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat pekerjaan tambahan.', true);
  } finally {
    loading.value = false;
  }
}

function selectBlockerItem(blocker: ActiveBlockerOption) {
  formLinkedBlockerId.value = blocker.id;
  formReferenceLink.value = `[${blocker.code}] ${blocker.description}`;
  if (blocker.projectCodeReference && !formProjectCode.value) {
    formProjectCode.value = blocker.projectCodeReference;
  }
  if (!formTaskText.value.trim()) {
    formTaskText.value = `Menyelesaikan kendala ${blocker.code}: ${blocker.description}`;
  }
  isBlockerPickerOpen.value = false;
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

  if (formReason.value === 'OTHER' && formOtherReason.value.trim().length < 3) {
    showToast('Keterangan alasan lainnya wajib diisi minimal 3 karakter untuk menjelaskan konteks pekerjaan.', true);
    return;
  }

  const finalTaskText = formReason.value === 'OTHER'
    ? `${formTaskText.value.trim()} (Alasan: ${formOtherReason.value.trim()})`
    : formTaskText.value.trim();

  submitting.value = true;
  try {
    await apiClient(`/daily/records/${recordId.value}/additional-work`, {
      method: 'POST',
      body: JSON.stringify({
        taskText: finalTaskText,
        reason: formReason.value,
        assignedByUserId: formReason.value === 'NEWLY_ASSIGNED' ? formAssignedBy.value : undefined,
        projectCode: formProjectCode.value.trim() ? formProjectCode.value.trim() : undefined,
        referenceLink: formReferenceLink.value.trim() ? formReferenceLink.value.trim() : undefined,
        linkedBlockerId: formLinkedBlockerId.value.trim() ? formLinkedBlockerId.value.trim() : undefined,
      }),
    });

    showToast('Pekerjaan tambahan berhasil dicatat.');
    formTaskText.value = '';
    formReason.value = 'NEWLY_ASSIGNED';
    formAssignedBy.value = '';
    formOtherReason.value = '';
    formProjectCode.value = '';
    formReferenceLink.value = '';
    formLinkedBlockerId.value = '';
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
    <TopBar breadcrumb="Workspace / My Today / Additional Work" />

    <!-- Daily Workflow Step Bar -->
    <nav class="workflow-bar" aria-label="Alur Akuntabilitas Harian">
      <div class="step-items">
        <AccessLink to="/daily/morning" class="step-item">
          <span class="step-num">1</span>
          <span>Morning Commitment</span>
        </AccessLink>
        <AccessLink to="/daily/additional-work" class="step-item active">
          <span class="step-num">2</span>
          <span>Additional Work</span>
        </AccessLink>
        <AccessLink to="/daily/eod" class="step-item">
          <span class="step-num">3</span>
          <span>EOD Outcome</span>
        </AccessLink>
      </div>

      <div class="workflow-actions">
        <AccessLink
          to="/raise-blockers"
          class="btn-report-blocker"
          title="Laporkan kendala kritis atau dependensi"
          data-testid="report-blocker-btn"
        >
          <AlertTriangle :size="15" />
          <span>Laporkan Blocker</span>
        </AccessLink>
      </div>
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
          <p class="subtitle" data-testid="additional-work-subtitle">
            Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi.
          </p>
        </div>
      </div>

      <!-- Warning jika belum Morning Check-in -->
      <div v-if="!recordId && !loading" class="alert-box" role="alert">
        <AlertCircle :size="20" />
        <div>
          <strong>Belum Mengisi Morning Commitment:</strong>
          Silakan kirimkan komitmen pagi terlebih dahulu sebelum menambahkan pekerjaan tambahan siang hari.
          <AccessLink to="/daily/morning" class="alert-link">Buka Morning Commitment &rarr;</AccessLink>
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

            <div class="form-row" :class="{ 'single-col': formReason !== 'NEWLY_ASSIGNED' && formReason !== 'OTHER' }" data-testid="form-row-reason">
              <div class="form-group">
                <label for="select-reason" class="form-label">Alasan Pekerjaan Tambahan *</label>
                <select id="select-reason" v-model="formReason" class="input-control" required data-testid="select-reason">
                  <option value="NEWLY_ASSIGNED">Penugasan Baru dari Atasan</option>
                  <option value="OPERATIONAL_INCIDENT">Perbaikan Error / Bug Kritis</option>
                  <option value="MISSED_IN_PLANNING">Tugas Terlewat Dicatat Pagi</option>
                  <option value="PRIORITY_CHANGE">Pengalihan Prioritas Kerja</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div v-if="formReason === 'NEWLY_ASSIGNED'" class="form-group" data-testid="assigned-by-group">
                <label for="select-assigned-by" class="form-label">Ditugaskan Oleh (Atasan Langsung/Lead) *</label>
                <select id="select-assigned-by" v-model="formAssignedBy" class="input-control" required data-testid="select-assigned-by">
                  <option value="" disabled>-- Pilih Atasan Penugas --</option>
                  <option v-for="user in availableManagers" :key="user.id" :value="user.id">
                    {{ user.fullName }} ({{ user.email }})
                  </option>
                </select>
              </div>

              <div v-if="formReason === 'OTHER'" class="form-group" data-testid="other-reason-group">
                <label for="input-other-reason" class="form-label">Keterangan Alasan Lainnya *</label>
                <input
                  id="input-other-reason"
                  v-model="formOtherReason"
                  type="text"
                  class="input-control"
                  placeholder="Jelaskan alasan khusus pekerjaan ini..."
                  required
                  data-testid="input-other-reason"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="select-project" class="form-label">Proyek Terkait (Opsional)</label>
                <select
                  id="select-project"
                  v-model="formProjectCode"
                  class="input-control"
                  data-testid="select-additional-project"
                >
                  <option value="">-- Non-Proyek / Operasional Rutin --</option>
                  <option
                    v-for="prj in availableProjects"
                    :key="prj.projectCode"
                    :value="prj.projectCode"
                  >
                    [{{ prj.projectCode }}] {{ prj.projectName }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="input-ref-link" class="form-label">Tautan Referensi / Tiket Tugas (Opsional)</label>
                <div class="input-picker-group">
                  <input
                    id="input-ref-link"
                    v-model="formReferenceLink"
                    type="text"
                    class="input-control picker-input-flex"
                    placeholder="https://... atau pilih blocker"
                  />
                  <div class="picker-dropdown-wrap">
                    <button
                      type="button"
                      class="btn-picker-trigger"
                      data-testid="select-additional-blocker"
                      title="Pilih tiket blocker aktif yang sedang ditangani"
                      @click="isBlockerPickerOpen = !isBlockerPickerOpen"
                    >
                      <span>Pilih Blocker Aktif</span>
                      <ChevronDown :size="13" />
                    </button>
                    <div
                      v-if="isBlockerPickerOpen"
                      class="picker-dropdown-menu show"
                    >
                      <div class="picker-menu-header">
                        <span>Blocker Aktif ({{ activeBlockers.length }})</span>
                        <span class="picker-menu-sub">Klik untuk menautkan</span>
                      </div>
                      <div v-if="activeBlockers.length === 0" class="picker-empty">
                        Tidak ada tiket blocker aktif saat ini.
                      </div>
                      <button
                        v-for="blk in activeBlockers"
                        :key="blk.id"
                        type="button"
                        class="picker-menu-item"
                        @click="selectBlockerItem(blk)"
                      >
                        <div class="picker-item-top">
                          <span class="picker-item-code">{{ blk.code }}</span>
                          <span
                            class="badge-mini"
                            :class="blk.status === 'OPEN' ? 'open' : blk.status === 'ACKNOWLEDGED' ? 'ack' : 'in-prog'"
                          >
                            {{ blk.severity }} · {{ blk.status }}
                          </span>
                        </div>
                        <div class="picker-item-title">{{ blk.description }}</div>
                      </button>
                    </div>
                  </div>
                </div>
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
                  <span class="badge badge-info">{{ formatReason(item.reason) }}</span>
                  <span v-if="item.projectCode" class="badge badge-info" style="background: #E6F4EE; color: #00674D;">
                    Proyek: {{ item.projectCode }}
                  </span>
                  <span v-if="item.assignedByUser" class="assigned-by">
                    Ditugaskan oleh: <strong>{{ item.assignedByUser.fullName }}</strong>
                  </span>
                </div>
                <div class="work-title">{{ item.taskText }}</div>
                <div v-if="item.referenceLink" style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
                  Referensi: {{ item.referenceLink }}
                </div>
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
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.step-items {
  display: flex;
  gap: 32px;
}

.workflow-actions {
  display: flex;
  align-items: center;
}

.btn-report-blocker {
  height: 34px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.btn-report-blocker:hover {
  background: var(--color-surface-subtle);
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
  text-decoration: none;
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
  overflow: visible;
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.form-row.single-col {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input-control {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  color: var(--color-text-primary);
  text-overflow: ellipsis;
}

select.input-control {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%235C6E68' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 15px 15px;
  padding-right: 36px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
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

.input-picker-group {
  display: flex;
  align-items: stretch;
  gap: 8px;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.picker-input-flex {
  flex: 1;
  min-width: 0;
}

.picker-dropdown-wrap {
  position: relative;
  flex-shrink: 0;
}

.btn-picker-trigger {
  height: 100%;
  min-height: 38px;
  padding: 0 12px;
  background: var(--color-surface-subtle, #f1f5f9);
  border: 1px solid var(--color-border-strong, #cbd5e1);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease-in-out;
}

.btn-picker-trigger:hover:not(:disabled) {
  background: #e6f4ee;
  border-color: var(--color-brand-primary);
}

.picker-dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 340px;
  max-width: 90vw;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 28px rgba(14, 33, 27, 0.14);
  z-index: 100;
  padding: 6px;
}

.picker-dropdown-menu.show {
  display: block;
}

.picker-menu-header {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  padding: 8px 10px 6px;
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-menu-sub {
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
  color: var(--color-text-secondary);
}

.picker-empty {
  padding: 12px 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

.picker-menu-item {
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  display: block;
}

.picker-menu-item:hover {
  background: var(--color-surface-subtle, #f8fafc);
}

.picker-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
}

.picker-item-code {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-status-amber-fg);
  font-family: var(--font-mono);
}

.picker-item-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}

.badge-mini {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-block;
}

.badge-mini.open {
  background: var(--color-status-red-bg);
  color: var(--color-status-red-fg);
}

.badge-mini.ack {
  background: var(--color-status-amber-bg);
  color: var(--color-status-amber-fg);
}

.badge-mini.in-prog {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
}
</style>
