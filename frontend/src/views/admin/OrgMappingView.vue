<script setup lang="ts">
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../api/client';
import { formatDateWib, getTodayIsoWib } from '../../utils/dateTime';
import {
  EMPLOYMENT_STATUS_OPTIONS,
  formatEmploymentStatusLabel,
  isInternStatus,
  type EmploymentStatusCode,
} from '../../utils/employmentStatus';
import {
  Building2,
  FolderGit2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Layers,
} from 'lucide-vue-next';

interface OrgAssignmentRow {
  id: string;
  userId: string;
  jobTitle: string;
  role: string;
  function: string;
  employmentStatus?: EmploymentStatusCode;
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
  employmentStatus?: EmploymentStatusCode;
}

const authStore = useAuthStore();

// Tab state: 'org' | 'project'
const currentTab = ref<'org' | 'project'>('org');

// Data Lists
const orgAssignments = ref<OrgAssignmentRow[]>([]);
const projectAuthorities = ref<ProjectAuthorityRow[]>([]);
const availableUsers = ref<SimpleUser[]>([]);

// Karyawan Non-Intern yang memenuhi syarat untuk memegang peran wewenang (Atasan Langsung, PM, Reviewer)
const eligibleAuthorityUsers = computed(() =>
  availableUsers.value.filter((u) => !isInternStatus(u.employmentStatus)),
);

const isLoading = ref(false);
const toastMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Search & Filters
const orgSearchQuery = ref('');
const orgFunctionFilter = ref('ALL');
const orgStatusFilter = ref<'ALL' | 'ACTIVE' | 'HISTORY'>('ALL');
const paSearchQuery = ref('');

function isDateActiveWib(endDate: string | null | undefined): boolean {
  if (!endDate) return true;
  return endDate.slice(0, 10) >= getTodayIsoWib();
}

function formatRoleLabel(role: string): string {
  switch (role) {
    case 'EMPLOYEE':
      return 'Karyawan';
    case 'SUPERVISOR':
      return 'Supervisor';
    case 'HEAD':
      return 'Kepala Divisi';
    case 'PROJECT_MANAGER':
      return 'Manajer Proyek';
    case 'HRGA':
      return 'HRGA';
    case 'CEO_MANAGEMENT':
      return 'Direktur / CEO';
    case 'SYSTEM_ADMIN':
      return 'Admin Sistem';
    default:
      return role;
  }
}

const orgFunctionOptions = computed(() => {
  const unique = new Set<string>();
  for (const asg of orgAssignments.value) {
    if (asg.function) unique.add(asg.function);
  }
  return Array.from(unique).sort((a, b) => a.localeCompare(b, 'id'));
});

const filteredOrgAssignments = computed(() => {
  const q = orgSearchQuery.value.trim().toLowerCase();
  return orgAssignments.value.filter((asg) => {
    if (orgFunctionFilter.value !== 'ALL' && asg.function !== orgFunctionFilter.value) {
      return false;
    }
    const active = isDateActiveWib(asg.endDate);
    if (orgStatusFilter.value === 'ACTIVE' && !active) return false;
    if (orgStatusFilter.value === 'HISTORY' && active) return false;
    if (q) {
      const name = (asg.user?.fullName || '').toLowerCase();
      const email = (asg.user?.email || '').toLowerCase();
      const title = (asg.jobTitle || '').toLowerCase();
      const manager = (asg.directManager?.fullName || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !title.includes(q) && !manager.includes(q)) {
        return false;
      }
    }
    return true;
  });
});

const hasOrgFilters = computed(
  () =>
    orgSearchQuery.value.trim().length > 0 ||
    orgFunctionFilter.value !== 'ALL' ||
    orgStatusFilter.value !== 'ALL',
);

function resetOrgFilters() {
  orgSearchQuery.value = '';
  orgFunctionFilter.value = 'ALL';
  orgStatusFilter.value = 'ALL';
}

const filteredProjectAuthorities = computed(() => {
  const q = paSearchQuery.value.trim().toLowerCase();
  if (!q) return projectAuthorities.value;
  return projectAuthorities.value.filter((pa) => {
    const code = (pa.projectCode || '').toLowerCase();
    const name = (pa.projectName || '').toLowerCase();
    const pm = (pa.projectManager?.fullName || '').toLowerCase();
    const rev = (pa.escalationReviewer?.fullName || '').toLowerCase();
    const fn = (pa.involvedFunction || '').toLowerCase();
    return code.includes(q) || name.includes(q) || pm.includes(q) || rev.includes(q) || fn.includes(q);
  });
});

// Close Project Authority Confirmation Modal State
const endPaTarget = ref<ProjectAuthorityRow | null>(null);
const isEndingPa = ref(false);
const endPaError = ref<string | null>(null);

// Modal Org Assignment State
const isOrgModalOpen = ref(false);
const isOrgSubmitting = ref(false);
const orgModalError = ref<string | null>(null);
const orgForm = ref({
  userId: '',
  jobTitle: '',
  role: 'EMPLOYEE',
  function: 'Engineering',
  employmentStatus: 'PERMANENT' as EmploymentStatusCode,
  directManagerId: '',
  effectiveDate: getTodayIsoWib(),
  endDate: '',
  assignmentReason: '',
});

function handleOrgEmploymentStatusChange() {
  if (orgForm.value.employmentStatus === 'INTERN') {
    orgForm.value.role = 'EMPLOYEE';
  }
}

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
  effectiveDate: getTodayIsoWib(),
  assignmentReason: '',
});

async function loadData() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const [orgRes, paRes, usersRes] = await Promise.all([
      apiClient<{ data: OrgAssignmentRow[] }>('/v1/admin/organization/assignments?limit=100'),
      apiClient<{ data: ProjectAuthorityRow[] }>('/v1/admin/project-authorities?limit=100'),
      apiClient<{ data: SimpleUser[] }>('/v1/admin/users?limit=100'),
    ]);

    orgAssignments.value = orgRes.data.data || (orgRes.data as any) || [];
    projectAuthorities.value = paRes.data.data || (paRes.data as any) || [];
    availableUsers.value = usersRes.data.data || (usersRes.data as any) || [];
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat data struktur organisasi.', true);
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
  if (e.key === 'Escape') {
    if (isOrgModalOpen.value) isOrgModalOpen.value = false;
    if (isPaModalOpen.value) isPaModalOpen.value = false;
    if (endPaTarget.value && !isEndingPa.value) endPaTarget.value = null;
  }
}

function openOrgModal() {
  orgModalError.value = null;
  orgForm.value = {
    userId: availableUsers.value[0]?.id || '',
    jobTitle: '',
    role: 'EMPLOYEE',
    function: 'Engineering',
    employmentStatus: 'PERMANENT',
    directManagerId: '',
    effectiveDate: getTodayIsoWib(),
    endDate: '',
    assignmentReason: '',
  };
  isOrgModalOpen.value = true;
}

function openPaModal() {
  paModalError.value = null;
  paForm.value = {
    projectCode: '',
    projectName: '',
    projectManagerId: eligibleAuthorityUsers.value[0]?.id || '',
    escalationReviewerId:
      eligibleAuthorityUsers.value[1]?.id || eligibleAuthorityUsers.value[0]?.id || '',
    involvedFunction: 'Engineering',
    effectiveDate: getTodayIsoWib(),
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
  if (orgForm.value.employmentStatus === 'INTERN' && !orgForm.value.endDate) {
    orgModalError.value = 'Tanggal selesai magang wajib diisi untuk karyawan berstatus Intern.';
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
        role: orgForm.value.employmentStatus === 'INTERN' ? 'EMPLOYEE' : orgForm.value.role,
        directManagerId: orgForm.value.directManagerId || null,
        endDate: orgForm.value.endDate || undefined,
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
  if (paForm.value.projectManagerId === paForm.value.escalationReviewerId) {
    paModalError.value = 'Project Manager dan Escalation Reviewer tidak boleh dijabat oleh orang yang sama.';
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

function openEndPaConfirm(pa: ProjectAuthorityRow) {
  endPaError.value = null;
  endPaTarget.value = pa;
}

function cancelEndPaConfirm() {
  if (isEndingPa.value) return;
  endPaError.value = null;
  endPaTarget.value = null;
}

async function confirmEndPa() {
  if (!endPaTarget.value) return;
  isEndingPa.value = true;
  endPaError.value = null;
  try {
    await apiClient(`/v1/admin/project-authorities/${endPaTarget.value.id}/end`, { method: 'PATCH' });
    endPaTarget.value = null;
    showToast('Kewenangan proyek berhasil ditutup.');
    await loadData();
  } catch (err: any) {
    endPaError.value = err.message || 'Gagal menutup kewenangan proyek.';
  } finally {
    isEndingPa.value = false;
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
    <TopBar breadcrumb="Administration / Pemetaan Organisasi" />

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
          <h2>Struktur Organisasi &amp; Kewenangan Proyek</h2>
          <p class="subtitle">
            Kelola susunan atasan langsung, penugasan divisi, serta penunjukan pemimpin dan peninjau proyek perusahaan.
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
        <div v-if="orgAssignments.length > 0" class="table-toolbar">
          <div class="toolbar-search">
            <Search :size="15" class="search-icon" />
            <input
              id="orgSearchInput"
              v-model="orgSearchQuery"
              type="search"
              placeholder="Cari nama, email, jabatan, atau atasan..."
              aria-label="Cari penugasan karyawan"
            />
          </div>
          <div class="toolbar-selects">
            <select
              id="orgFunctionFilter"
              v-model="orgFunctionFilter"
              aria-label="Saring divisi"
            >
              <option value="ALL">Semua Divisi</option>
              <option v-for="fn in orgFunctionOptions" :key="fn" :value="fn">{{ fn }}</option>
            </select>
            <select
              id="orgStatusFilter"
              v-model="orgStatusFilter"
              aria-label="Saring status penugasan"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="HISTORY">Riwayat</option>
            </select>
          </div>
          <span class="toolbar-count">
            {{ filteredOrgAssignments.length }} dari {{ orgAssignments.length }} data
          </span>
        </div>

        <div v-if="isLoading" class="state-container">
          <p>Memuat data penugasan organisasi...</p>
        </div>
        <div v-else-if="orgAssignments.length === 0" class="state-container empty">
          <Layers :size="36" class="empty-icon" />
          <h3>Belum Ada Penugasan Aktif</h3>
          <p>Klik tombol "Atur Penugasan Baru" untuk memetakan karyawan ke struktur organisasi.</p>
        </div>
        <div v-else-if="filteredOrgAssignments.length === 0" class="state-container empty">
          <Layers :size="36" class="empty-icon" />
          <h3>Tidak Ada Penugasan yang Cocok</h3>
          <p>Ubah kata kunci pencarian atau saringan divisi dan status untuk melihat data lainnya.</p>
          <button v-if="hasOrgFilters" type="button" class="btn btn-secondary btn-reset-filter" @click="resetOrgFilters">
            Tampilkan Semua Penugasan
          </button>
        </div>
        <div v-else class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>KARYAWAN</th>
                <th>JABATAN &amp; PERAN</th>
                <th>FUNGSI / DIVISI</th>
                <th>ATASAN LANGSUNG</th>
                <th>MASA BERLAKU</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asg in filteredOrgAssignments" :key="asg.id">
                <td>
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <strong class="user-name">{{ asg.user?.fullName || '-' }}</strong>
                    <span v-if="isInternStatus(asg.employmentStatus)" class="badge-intern">Intern</span>
                    <span v-else-if="asg.employmentStatus === 'CONTRACT'" class="badge-contract">Kontrak</span>
                  </div>
                  <span class="user-email-text mono-num">{{ asg.user?.email || '-' }}</span>
                </td>
                <td>
                  <span class="role-badge">{{ formatRoleLabel(asg.role) }}</span>
                  <span class="job-title-text">{{ asg.jobTitle }}</span>
                  <span style="display: block; font-size: 11px; color: var(--color-text-secondary);">
                    {{ formatEmploymentStatusLabel(asg.employmentStatus) }}
                  </span>
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
                  <span class="date-text mono-num wp-datetime">
                    {{ formatDateWib(asg.effectiveDate) }}
                    s/d
                    {{ asg.endDate ? formatDateWib(asg.endDate) : 'Sekarang' }}
                  </span>
                </td>
                <td>
                  <span :class="['status-badge', isDateActiveWib(asg.endDate) ? 'active' : 'inactive']">
                    {{ isDateActiveWib(asg.endDate) ? 'Aktif' : 'Riwayat' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content 2: Project Authority Mappings -->
      <div v-else class="table-card">
        <div v-if="projectAuthorities.length > 0" class="table-toolbar">
          <div class="toolbar-search">
            <Search :size="15" class="search-icon" />
            <input
              id="paSearchInput"
              v-model="paSearchQuery"
              type="search"
              placeholder="Cari kode, nama proyek, Project Manager, atau divisi..."
              aria-label="Cari kewenangan proyek"
            />
          </div>
          <span class="toolbar-count">
            {{ filteredProjectAuthorities.length }} dari {{ projectAuthorities.length }} proyek
          </span>
        </div>

        <div v-if="isLoading" class="state-container">
          <p>Memuat kewenangan proyek...</p>
        </div>
        <div v-else-if="projectAuthorities.length === 0" class="state-container empty">
          <FolderGit2 :size="36" class="empty-icon" />
          <h3>Belum Ada Wewenang Proyek</h3>
          <p>Belum ada penunjukan Project Authority. Klik tombol untuk menambahkan proyek baru.</p>
        </div>
        <div v-else-if="filteredProjectAuthorities.length === 0" class="state-container empty">
          <FolderGit2 :size="36" class="empty-icon" />
          <h3>Tidak Ada Proyek yang Cocok</h3>
          <p>Ubah kata kunci pencarian untuk melihat daftar proyek lainnya.</p>
          <button type="button" class="btn btn-secondary btn-reset-filter" @click="paSearchQuery = ''">
            Tampilkan Semua Proyek
          </button>
        </div>
        <div v-else class="table-scroll">
          <table class="data-table project-authority-table">
            <thead>
              <tr>
                <th class="col-project">KODE &amp; NAMA PROYEK</th>
                <th>PROJECT MANAGER</th>
                <th>ESCALATION REVIEWER</th>
                <th>FUNGSI TERLIBAT</th>
                <th>MASA BERLAKU</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pa in filteredProjectAuthorities" :key="pa.id">
                <td class="col-project">
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
                  <span class="date-text mono-num wp-datetime">
                    {{ formatDateWib(pa.effectiveDate) }}
                    s/d
                    {{ pa.endDate ? formatDateWib(pa.endDate) : 'Aktif' }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="isDateActiveWib(pa.endDate)"
                    type="button"
                    class="btn-end-pa"
                    @click="openEndPaConfirm(pa)"
                  >
                    Tutup Wewenang
                  </button>
                  <span v-else class="text-muted">Ditutup</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal Atur Penugasan Baru -->
    <div v-if="isOrgModalOpen" class="modal-backdrop" @click.self="isOrgModalOpen = false">
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Atur Penugasan Organisasi Baru</h3>
          <button type="button" class="close-btn" aria-label="Tutup" @click="isOrgModalOpen = false"><X :size="20" /></button>
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
              <label for="asg-emp-status">Status Karyawan</label>
              <select
                id="asg-emp-status"
                v-model="orgForm.employmentStatus"
                @change="handleOrgEmploymentStatusChange"
                required
              >
                <option v-for="opt in EMPLOYMENT_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="asg-role">Peran Jabatan</label>
              <select
                id="asg-role"
                v-model="orgForm.role"
                :disabled="orgForm.employmentStatus === 'INTERN'"
                required
              >
                <option value="EMPLOYEE">Karyawan</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="HEAD">Kepala Divisi</option>
                <option value="PROJECT_MANAGER">Manajer Proyek</option>
                <option value="HRGA">HRGA</option>
                <option value="CEO_MANAGEMENT">Direktur / CEO</option>
              </select>
              <span v-if="orgForm.employmentStatus === 'INTERN'" class="field-hint">
                Karyawan Intern otomatis menggunakan peran EMPLOYEE.
              </span>
            </div>
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

          <div class="form-group">
            <label for="asg-mgr">Atasan Langsung (Direct Manager)</label>
            <select id="asg-mgr" v-model="orgForm.directManagerId">
              <option value="">-- Tanpa Atasan (Pucuk Pimpinan) --</option>
              <option
                v-for="u in eligibleAuthorityUsers.filter(x => x.id !== orgForm.userId)"
                :key="u.id"
                :value="u.id"
              >
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="asg-date">Tanggal Efektif Penugasan</label>
              <input id="asg-date" v-model="orgForm.effectiveDate" type="date" required />
              <span class="field-hint">Penetapan tanggal lampau tidak diizinkan oleh sistem.</span>
            </div>
            <div class="form-group">
              <label for="asg-end-date">
                {{ orgForm.employmentStatus === 'INTERN' ? 'Tanggal Selesai Magang *' : 'Tanggal Berakhir (Opsional)' }}
              </label>
              <input
                id="asg-end-date"
                v-model="orgForm.endDate"
                type="date"
                :min="orgForm.effectiveDate"
                :required="orgForm.employmentStatus === 'INTERN'"
              />
              <span class="field-hint">
                {{ orgForm.employmentStatus === 'INTERN' ? 'Wajib diisi untuk karyawan Intern.' : 'Kosongkan bila tidak ada batas akhir.' }}
              </span>
            </div>
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
          <button type="button" class="close-btn" aria-label="Tutup" @click="isPaModalOpen = false"><X :size="20" /></button>
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
              <option v-for="u in eligibleAuthorityUsers" :key="u.id" :value="u.id">
                {{ u.fullName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="pa-rev">Escalation Reviewer</label>
            <select id="pa-rev" v-model="paForm.escalationReviewerId" required>
              <option v-for="u in eligibleAuthorityUsers" :key="u.id" :value="u.id">
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
    <!-- Modal Konfirmasi Tutup Kewenangan Proyek -->
    <div v-if="endPaTarget" class="modal-backdrop" @click.self="cancelEndPaConfirm">
      <div class="modal-box modal-confirm-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Konfirmasi Tutup Wewenang Proyek</h3>
          <button type="button" class="close-btn" aria-label="Tutup" :disabled="isEndingPa" @click="cancelEndPaConfirm">
            <X :size="20" />
          </button>
        </div>
        <div v-if="endPaError" class="alert-banner error">
          <AlertCircle :size="18" />
          <span>{{ endPaError }}</span>
        </div>
        <p class="confirm-text">
          Apakah Anda yakin ingin menutup kewenangan proyek
          <strong>{{ endPaTarget.projectName }} ({{ endPaTarget.projectCode }})</strong>
          mulai hari ini?
        </p>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="isEndingPa" @click="cancelEndPaConfirm">
            Batal
          </button>
          <button type="button" class="btn btn-danger" :disabled="isEndingPa" @click="confirmEndPa">
            {{ isEndingPa ? 'Menutup...' : 'Ya, Tutup Wewenang' }}
          </button>
        </div>
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
  gap: 16px;
  margin-bottom: 20px;
}

.header-actions {
  flex-shrink: 0;
}

.header-actions .btn {
  white-space: nowrap;
  flex-shrink: 0;
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
  white-space: nowrap;
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
  white-space: nowrap;
}

.manager-name, .pm-name, .reviewer-name {
  display: block;
  font-weight: 600;
}

.project-code {
  display: block;
  font-weight: 800;
  color: var(--color-brand-primary);
  white-space: nowrap;
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
  white-space: nowrap;
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
  white-space: nowrap;
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
  padding: 16px;
  overflow-y: auto;
  z-index: 1000;
}

.modal-box {
  width: min(100%, 540px);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
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

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: #FAFCFB;
  flex-wrap: wrap;
}

.toolbar-search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 240px;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.toolbar-search input[type="search"] {
  padding-left: 32px;
}

.toolbar-selects {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-selects select {
  width: auto;
  min-width: 150px;
}

.toolbar-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.table-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.project-authority-table {
  min-width: 980px;
}

.col-project {
  min-width: 220px;
}

.btn-reset-filter {
  margin-top: 12px;
}

.modal-confirm-box {
  width: min(100%, 440px);
}

.confirm-text {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-text-primary);
  margin: 0;
}

.btn-danger {
  background: #DC2626;
  color: #FFFFFF;
}

.btn-danger:hover {
  background: #B91C1C;
}

.btn-danger:disabled,
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .content-container {
    margin: 16px auto;
    padding: 0 12px 48px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .tab-bar {
    flex-wrap: wrap;
  }

  .tab-bar-btn {
    flex: 1 1 auto;
    justify-content: center;
    padding: 10px 12px;
    font-size: 12.5px;
  }
}

@media (max-width: 640px) {
  .page-header h2 {
    font-size: 19px;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 14px;
    gap: 8px;
  }

  .toolbar-search,
  .toolbar-selects,
  .toolbar-selects select {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .toolbar-search {
    flex: none;
  }

  .toolbar-count {
    margin-left: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .modal-box {
    padding: 18px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }

  .toast-popup {
    left: 12px;
    right: 12px;
    top: 64px;
  }
}
</style>
