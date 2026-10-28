<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../api/client';
import {
  Building2,
  FolderGit2,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from 'lucide-vue-next';

interface OrgAssignmentRow {
  id: string;
  userId: string;
  jobTitle: string;
  role: string;
  function: string;
  directManagerId: string | null;
  effectiveDate: string;
  endDate: string | null;
  assignmentReason: string;
  user: { id: string; fullName: string; email: string };
  directManager?: { id: string; fullName: string; email: string } | null;
}

interface ProjectAuthorityRow {
  id: string;
  projectCode: string;
  projectName: string;
  projectManagerId: string;
  escalationReviewerId: string;
  involvedFunction: string;
  effectiveDate: string;
  endDate: string | null;
  assignmentReason: string;
  projectManager: { id: string; fullName: string; email: string };
  escalationReviewer: { id: string; fullName: string; email: string };
}

interface SimpleUser {
  id: string;
  fullName: string;
  email: string;
}

const router = useRouter();
const authStore = useAuthStore();

// Tab state: 'org' | 'project'
const currentTab = ref<'org' | 'project'>('org');

// Data Lists
const orgAssignments = ref<OrgAssignmentRow[]>([]);
const projectAuthorities = ref<ProjectAuthorityRow[]>([]);
const availableUsers = ref<SimpleUser[]>([]);

const isLoading = ref(false);
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Modal Org Assignment State
const isOrgModalOpen = ref(false);
const isOrgSubmitting = ref(false);
const orgModalError = ref<string | null>(null);
const orgForm = ref({
  userId: '',
  jobTitle: '',
  role: 'EMPLOYEE',
  function: 'Engineering',
  directManagerId: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  assignmentReason: '',
});

// Modal Project Authority State
const isPaModalOpen = ref(false);
const isPaSubmitting = ref(false);
const paModalError = ref<string | null>(null);
const paForm = ref({
  projectCode: '',
  projectName: '',
  projectManagerId: '',
  escalationReviewerId: '',
  involvedFunction: 'Engineering',
  effectiveDate: new Date().toISOString().split('T')[0],
  assignmentReason: '',
});

async function loadData() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const [orgRes, paRes, usersRes] = await Promise.all([
      apiClient<{ data: OrgAssignmentRow[] }>('/v1/admin/organization/assignments'),
      apiClient<{ data: ProjectAuthorityRow[] }>('/v1/admin/project-authorities'),
      apiClient<{ data: SimpleUser[] }>('/v1/admin/users?limit=100'),
    ]);

    orgAssignments.value = orgRes.data.data || (orgRes.data as any) || [];
    projectAuthorities.value = paRes.data.data || (paRes.data as any) || [];
    availableUsers.value = usersRes.data.data || (usersRes.data as any) || [];
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memuat data struktur organisasi.';
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
  await loadData();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (isOrgModalOpen.value) isOrgModalOpen.value = false;
    if (isPaModalOpen.value) isPaModalOpen.value = false;
  }
}

function openOrgModal() {
  orgModalError.value = null;
  orgForm.value = {
    userId: availableUsers.value[0]?.id || '',
    jobTitle: '',
    role: 'EMPLOYEE',
    function: 'Engineering',
    directManagerId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    assignmentReason: '',
  };
  isOrgModalOpen.value = true;
}

function openPaModal() {
  paModalError.value = null;
  paForm.value = {
    projectCode: '',
    projectName: '',
    projectManagerId: availableUsers.value[0]?.id || '',
    escalationReviewerId: availableUsers.value[1]?.id || availableUsers.value[0]?.id || '',
    involvedFunction: 'Engineering',
    effectiveDate: new Date().toISOString().split('T')[0],
    assignmentReason: '',
  };
  isPaModalOpen.value = true;
}

async function handleCreateOrgAssignment() {
  orgModalError.value = null;
  if (!orgForm.value.userId || !orgForm.value.jobTitle.trim() || !orgForm.value.assignmentReason.trim()) {
    orgModalError.value = 'Semua field wajib diisi.';
    return;
  }
  if (orgForm.value.userId === orgForm.value.directManagerId) {
    orgModalError.value = 'Karyawan tidak dapat melapor kepada dirinya sendiri.';
    return;
  }

  isOrgSubmitting.value = true;
  try {
    await apiClient('/v1/admin/organization/assignments', {
      method: 'POST',
      body: JSON.stringify({
        ...orgForm.value,
        directManagerId: orgForm.value.directManagerId || null,
      }),
    });
    isOrgModalOpen.value = false;
    showToast('Penugasan organisasi baru berhasil disimpan dan masa berlaku lama telah ditutup!');
    await loadData();
  } catch (err: any) {
    orgModalError.value = err.message || 'Gagal menyimpan penugasan organisasi.';
  } finally {
    isOrgSubmitting.value = false;
  }
}

async function handleCreatePa() {
  paModalError.value = null;
  if (
    !paForm.value.projectCode.trim() ||
    !paForm.value.projectName.trim() ||
    !paForm.value.projectManagerId ||
    !paForm.value.escalationReviewerId ||
    !paForm.value.assignmentReason.trim()
  ) {
    paModalError.value = 'Semua field wajib diisi.';
    return;
  }

  isPaSubmitting.value = true;
  try {
    await apiClient('/v1/admin/project-authorities', {
      method: 'POST',
      body: JSON.stringify(paForm.value),
    });
    isPaModalOpen.value = false;
    showToast('Kewenangan proyek berhasil ditetapkan!');
    await loadData();
  } catch (err: any) {
    paModalError.value = err.message || 'Gagal menetapkan kewenangan proyek.';
  } finally {
    isPaSubmitting.value = false;
  }
}

async function handleEndPa(id: string) {
  if (!confirm('Apakah Anda yakin ingin menutup kewenangan proyek ini pada hari ini?')) return;
  try {
    await apiClient(`/v1/admin/project-authorities/${id}/end`, { method: 'PATCH' });
    showToast('Kewenangan proyek berhasil ditutup.');
    await loadData();
  } catch (err: any) {
    showToast(err.message || 'Gagal menutup kewenangan proyek.', true);
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
</script>

<template>
  <div class="admin-layout">
    <header class="top-nav">
      <div class="nav-left">
        <div class="brand-badge">WP</div>
        <span class="brand-name">WorkPulse</span>
        <span class="system-tag">Struktur Organisasi</span>
      </div>
      <div class="nav-right">
        <router-link to="/admin/users" class="nav-link">Kelola Pengguna</router-link>
        <router-link to="/admin/temporary-reviewers" class="nav-link">Reviewer Sementara</router-link>
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

    <main class="content-container">
      <div class="page-header">
        <div>
          <h2>Struktur Organisasi & Kewenangan Proyek</h2>
          <p class="subtitle">
            Kelola hierarki pelaporan, penugasan divisi, dan pemetaan Project Authority (/admin/organization).
          </p>
        </div>
        <div class="header-actions">
          <button v-if="currentTab === 'org'" class="btn btn-primary" @click="openOrgModal">
            <Plus :size="18" />
            <span>Atur Penugasan Baru</span>
          </button>
          <button v-else class="btn btn-primary" @click="openPaModal">
            <Plus :size="18" />
            <span>Tetapkan Wewenang Proyek</span>
          </button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-bar">
        <button
          :class="['tab-bar-btn', { active: currentTab === 'org' }]"
          @click="currentTab = 'org'"
        >
          <Building2 :size="16" />
          <span>Struktur & Penugasan Karyawan</span>
        </button>
        <button
          :class="['tab-bar-btn', { active: currentTab === 'project' }]"
          @click="currentTab = 'project'"
        >
          <FolderGit2 :size="16" />
          <span>Kewenangan Proyek (Project Authority)</span>
        </button>
      </div>

      <!-- Tab Content 1: Organizational Assignments -->
      <div v-if="currentTab === 'org'" class="table-card">
        <div v-if="isLoading" class="state-container">
          <p>Memuat data penugasan organisasi...</p>
        </div>
        <div v-else-if="orgAssignments.length === 0" class="state-container empty">
          <Layers :size="36" class="empty-icon" />
          <h3>Belum Ada Penugasan Aktif</h3>
          <p>Klik tombol "Atur Penugasan Baru" untuk memetakan karyawan ke struktur organisasi.</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>KARYAWAN</th>
              <th>JABATAN & PERAN</th>
              <th>FUNGSI / DIVISI</th>
              <th>ATASAN LANGSUNG</th>
              <th>MASA BERLAKU</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asg in orgAssignments" :key="asg.id">
              <td>
                <strong class="user-name">{{ asg.user?.fullName || '-' }}</strong>
                <span class="user-email-text mono-num">{{ asg.user?.email || '-' }}</span>
              </td>
              <td>
                <span class="role-badge">{{ asg.role }}</span>
                <span class="job-title-text">{{ asg.jobTitle }}</span>
              </td>
              <td>
                <span class="func-pill">{{ asg.function }}</span>
              </td>
              <td>
                <template v-if="asg.directManager">
                  <span class="manager-name">{{ asg.directManager.fullName }}</span>
                  <span class="manager-email mono-num">{{ asg.directManager.email }}</span>
                </template>
                <span v-else class="text-muted">(Pucuk Pimpinan / Tidak Ada)</span>
              </td>
              <td>
                <span class="date-text mono-num">
                  {{ new Date(asg.effectiveDate).toLocaleDateString('id-ID') }}
                  s/d
                  {{ asg.endDate ? new Date(asg.endDate).toLocaleDateString('id-ID') : 'Sekarang' }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', !asg.endDate || new Date(asg.endDate) >= new Date() ? 'active' : 'inactive']">
                  {{ !asg.endDate || new Date(asg.endDate) >= new Date() ? 'Aktif' : 'Riwayat' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab Content 2: Project Authority Mappings -->
      <div v-else class="table-card">
        <div v-if="isLoading" class="state-container">
          <p>Memuat kewenangan proyek...</p>
        </div>
        <div v-else-if="projectAuthorities.length === 0" class="state-container empty">
          <FolderGit2 :size="36" class="empty-icon" />
          <h3>Belum Ada Wewenang Proyek</h3>
          <p>Belum ada penunjukan Project Authority. Klik tombol untuk menambahkan proyek baru.</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>KODE & NAMA PROYEK</th>
              <th>PROJECT MANAGER</th>
              <th>ESCALATION REVIEWER</th>
              <th>FUNGSI TERLIBAT</th>
              <th>MASA BERLAKU</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pa in projectAuthorities" :key="pa.id">
              <td>
                <strong class="project-code mono-num">{{ pa.projectCode }}</strong>
                <span class="project-name-text">{{ pa.projectName }}</span>
              </td>
              <td>
                <span class="pm-name">{{ pa.projectManager?.fullName || '-' }}</span>
                <span class="pm-email mono-num">{{ pa.projectManager?.email || '-' }}</span>
              </td>
              <td>
                <span class="reviewer-name">{{ pa.escalationReviewer?.fullName || '-' }}</span>
                <span class="reviewer-email mono-num">{{ pa.escalationReviewer?.email || '-' }}</span>
              </td>
              <td>
                <span class="func-pill">{{ pa.involvedFunction }}</span>
              </td>
              <td>
                <span class="date-text mono-num">
                  {{ new Date(pa.effectiveDate).toLocaleDateString('id-ID') }}
                  s/d
                  {{ pa.endDate ? new Date(pa.endDate).toLocaleDateString('id-ID') : 'Aktif' }}
                </span>
              </td>
              <td>
                <button
                  v-if="!pa.endDate || new Date(pa.endDate) >= new Date()"
                  class="btn-end-pa"
                  @click="handleEndPa(pa.id)"
                >
                  Tutup Wewenang
                </button>
                <span v-else class="text-muted">Ditutup</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Atur Penugasan Baru -->
    <div v-if="isOrgModalOpen" class="modal-backdrop" @click.self="isOrgModalOpen = false">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Atur Penugasan Organisasi Baru</h3>
          <button class="close-btn" @click="isOrgModalOpen = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleCreateOrgAssignment">
          <div v-if="orgModalError" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ orgModalError }}</span>
          </div>

          <div class="form-group">
            <label for="asg-user">Karyawan</label>
            <select id="asg-user" v-model="orgForm.userId" required>
              <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="asg-title">Nama Jabatan (Job Title)</label>
            <input id="asg-title" v-model="orgForm.jobTitle" type="text" placeholder="Contoh: Senior Fullstack Engineer" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="asg-role">Peran Kanonikal</label>
              <select id="asg-role" v-model="orgForm.role" required>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="HEAD">HEAD</option>
                <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                <option value="HRGA">HRGA</option>
                <option value="CEO_MANAGEMENT">CEO_MANAGEMENT</option>
              </select>
            </div>
            <div class="form-group">
              <label for="asg-func">Fungsi / Divisi</label>
              <select id="asg-func" v-model="orgForm.function" required>
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
            <label for="asg-mgr">Atasan Langsung (Direct Manager)</label>
            <select id="asg-mgr" v-model="orgForm.directManagerId">
              <option value="">-- Tanpa Atasan (Pucuk Pimpinan) --</option>
              <option
                v-for="u in availableUsers.filter(x => x.id !== orgForm.userId)"
                :key="u.id"
                :value="u.id"
              >
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="asg-date">Tanggal Efektif Penugasan</label>
            <input id="asg-date" v-model="orgForm.effectiveDate" type="date" required />
            <span class="field-hint">Backdating tanggal lampau ditolak oleh trigger basis data (DEC-008).</span>
          </div>

          <div class="form-group">
            <label for="asg-reason">Alasan Penugasan (Audit Log)</label>
            <textarea id="asg-reason" v-model="orgForm.assignmentReason" rows="2" placeholder="Jelaskan alasan penugasan atau perubahan hierarki..." required></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isOrgModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isOrgSubmitting">
              {{ isOrgSubmitting ? 'Menyimpan...' : 'Simpan Penugasan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Tetapkan Kewenangan Proyek -->
    <div v-if="isPaModalOpen" class="modal-backdrop" @click.self="isPaModalOpen = false">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Tetapkan Kewenangan Proyek (Project Authority)</h3>
          <button class="close-btn" @click="isPaModalOpen = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="handleCreatePa">
          <div v-if="paModalError" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ paModalError }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="pa-code">Kode Proyek</label>
              <input id="pa-code" v-model="paForm.projectCode" type="text" placeholder="Contoh: PRJ-CORP-WEB" class="mono-num" required />
            </div>
            <div class="form-group">
              <label for="pa-name">Nama Proyek</label>
              <input id="pa-name" v-model="paForm.projectName" type="text" placeholder="Contoh: Corporate Web Revamp" required />
            </div>
          </div>

          <div class="form-group">
            <label for="pa-pm">Project Manager</label>
            <select id="pa-pm" v-model="paForm.projectManagerId" required>
              <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="pa-rev">Escalation Reviewer</label>
            <select id="pa-rev" v-model="paForm.escalationReviewerId" required>
              <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="pa-func">Fungsi Terlibat</label>
              <select id="pa-func" v-model="paForm.involvedFunction" required>
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
            <div class="form-group">
              <label for="pa-date">Tanggal Efektif</label>
              <input id="pa-date" v-model="paForm.effectiveDate" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label for="pa-reason">Alasan Penunjukan (Audit Log)</label>
            <textarea id="pa-reason" v-model="paForm.assignmentReason" rows="2" placeholder="Jelaskan alasan penunjukan kewenangan proyek..." required></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isPaModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isPaSubmitting">
              {{ isPaSubmitting ? 'Menyimpan...' : 'Tetapkan Proyek' }}
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
  margin-bottom: 20px;
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

.tab-bar {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 20px;
}

.tab-bar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 0;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13.5px;
  font-weight: 700;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-bar-btn.active {
  color: var(--color-brand-primary);
  border-bottom-color: var(--color-brand-primary);
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

.user-email-text, .manager-email, .pm-email, .reviewer-email {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  display: block;
}

.role-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-strong);
  color: var(--color-brand-primary);
}

.job-title-text {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.func-pill {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-surface-subtle);
  padding: 3px 8px;
  border-radius: 6px;
}

.manager-name, .pm-name, .reviewer-name {
  display: block;
  font-weight: 600;
}

.project-code {
  display: block;
  font-weight: 800;
  color: var(--color-brand-primary);
}

.project-name-text {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
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

.status-badge.inactive {
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
}

.btn-end-pa {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  cursor: pointer;
}

.btn-end-pa:hover {
  background: #FEE2E2;
  color: #991B1B;
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

.field-hint {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 4px;
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
