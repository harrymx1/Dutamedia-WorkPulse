<template>
  <div class="admin-organization-tab">
    <!-- Header & Action Buttons -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">Organization & Authority Mapping</h2>
        <p class="text-caption text-medium-emphasis">
          Kelola struktur hierarki Atasan Langsung (Direct Manager) dan Otoritas Proyek (Project Authority) secara Effective-Dated (SAD §10.2, BR-10).
        </p>
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-shield-account"
          @click="openProjectAuthDialog"
        >
          Mapping Project Authority
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-switch"
          @click="openOrgAssignmentDialog()"
        >
          Penugasan Baru (BR-10)
        </v-btn>
      </div>
    </div>

    <!-- Search & Filter Card -->
    <v-card variant="outlined" class="border-subtle rounded-lg pa-4 mb-4">
      <v-row dense align="center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            placeholder="Cari nama karyawan, email, atau atasan..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="selectedRole"
            :items="roleFilterOptions"
            density="compact"
            variant="outlined"
            label="Filter Role"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="selectedStatus"
            :items="statusFilterOptions"
            density="compact"
            variant="outlined"
            label="Status Pengguna"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Table Card -->
    <v-card variant="outlined" class="border-subtle rounded-lg overflow-hidden">
      <v-progress-linear v-if="isLoading || isFetching" indeterminate color="primary" />

      <v-alert
        v-if="isError"
        type="error"
        variant="tonal"
        class="ma-4"
        title="Gagal Memuat Data Penugasan Organisasi"
        text="Terjadi kesalahan jaringan saat mengambil data dari IdentityModule."
      >
        <template #append>
          <v-btn variant="outlined" size="small" color="error" @click="() => refetch()">
            Coba Lagi
          </v-btn>
        </template>
      </v-alert>

      <v-table v-else hover>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Karyawan (Subjek)</th>
            <th class="text-left font-weight-bold">Role & Departemen</th>
            <th class="text-left font-weight-bold">Atasan Langsung (Direct Manager)</th>
            <th class="text-left font-weight-bold">Periode Berlaku</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-center font-weight-bold" style="width: 180px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredUsers.length && !isLoading">
            <td colspan="6" class="text-center py-8 text-medium-emphasis">
              <v-icon icon="mdi-account-search-outline" size="36" class="mb-2 d-block mx-auto text-disabled" />
              <span>Tidak ada penugasan organisasi yang sesuai kriteria pencarian.</span>
            </td>
          </tr>

          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="primary" size="32">
                  <span class="text-white text-caption font-weight-bold">{{ getInitials(user.fullName) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ user.fullName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <v-chip size="small" :color="getRoleColor(user.activeAssignment?.role)" variant="tonal" class="font-weight-bold mb-1">
                {{ user.activeAssignment?.role || 'Belum Ditugaskan' }}
              </v-chip>
              <div class="text-caption text-medium-emphasis">
                {{ user.activeAssignment?.function || '-' }}
              </div>
            </td>
            <td>
              <div v-if="user.activeAssignment?.directManager" class="d-flex align-center ga-2">
                <v-icon icon="mdi-account-tie" size="18" color="primary" />
                <div>
                  <div class="font-weight-medium text-body-2">{{ user.activeAssignment.directManager.fullName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ user.activeAssignment.directManager.email }}</div>
                </div>
              </div>
              <span v-else class="text-caption text-disabled italic">Tidak Ada Atasan Langsung</span>
            </td>
            <td class="text-body-2 text-medium-emphasis">
              <div>Mulai: <strong>{{ formatDate(user.activeAssignment?.effectiveDate) }}</strong></div>
              <div v-if="user.activeAssignment?.endDate" class="text-caption text-warning">
                Sampai: {{ formatDate(user.activeAssignment.endDate) }}
              </div>
              <div v-else class="text-caption text-success font-weight-medium">
                Aktif (Tanpa Batas)
              </div>
            </td>
            <td>
              <v-chip
                size="small"
                :color="user.status === 'Active' ? 'success' : 'grey'"
                variant="flat"
                class="font-weight-medium"
              >
                {{ user.status === 'Active' ? 'Aktif' : 'Non-Aktif' }}
              </v-chip>
            </td>
            <td class="text-center">
              <div class="d-flex align-center justify-center ga-1">
                <v-tooltip text="Ubah Penugasan Organisasi / Atasan (BR-10)">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="primary"
                      icon="mdi-account-edit"
                      @click="openOrgAssignmentDialog(user)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="Tambah Mapping Project Authority (SAD §10.2)">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="secondary"
                      icon="mdi-shield-plus"
                      @click="openProjectAuthDialog(user)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="Akhiri Otoritas Proyek (SAD §10.2)">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="warning"
                      icon="mdi-shield-off"
                      @click="openEndProjectAuthDialog(user)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="Lihat Riwayat Assignment Lengkap">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="info"
                      icon="mdi-history"
                      @click="viewAssignmentHistory(user)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog: Penugasan Organisasi Baru (BR-10) -->
    <v-dialog v-model="showOrgDialog" max-width="560" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-account-switch" color="primary" />
            <span class="text-h6 font-weight-bold">Penugasan Organisasi Baru</span>
          </div>
          <v-btn icon="mdi-close" size="small" variant="text" :disabled="isCreatingOrg" @click="showOrgDialog = false" />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Sesuai <strong>BR-10</strong>, assignment baru akan otomatis menutup tanggal akhir (endDate) pada penugasan aktif sebelumnya.
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-form ref="orgFormRef" v-model="isOrgFormValid" @submit.prevent="handleSaveOrgAssignment">
            <v-select
              v-model="orgForm.userId"
              :items="userSelectOptions"
              item-title="title"
              item-value="value"
              label="Pilih Karyawan (Subjek)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v || 'Karyawan wajib dipilih']"
            />

            <v-select
              v-model="orgForm.role"
              :items="ROLE_OPTIONS"
              label="Role Organisasi"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v || 'Role wajib dipilih']"
            />

            <v-text-field
              v-model="orgForm.function"
              label="Fungsi / Departemen (mis. Engineering, Finance)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v?.trim() || 'Fungsi/Departemen wajib diisi']"
            />

            <v-select
              v-model="orgForm.directManagerId"
              :items="managerSelectOptions"
              item-title="title"
              item-value="value"
              label="Atasan Langsung (Direct Manager)"
              variant="outlined"
              density="comfortable"
              clearable
              class="mb-2"
              hint="Opsional. Kosongkan jika role berada di puncak hierarki (mis. CEO)."
              persistent-hint
            />

            <v-text-field
              v-model="orgForm.effectiveDate"
              type="date"
              label="Tanggal Mulai Efektif (effectiveDate)"
              variant="outlined"
              density="comfortable"
              class="mt-3 mb-2"
              :rules="[(v: string) => !!v || 'Tanggal efektif wajib diisi']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end ga-2">
          <v-btn variant="text" color="grey" :disabled="isCreatingOrg" @click="showOrgDialog = false">
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isCreatingOrg"
            :disabled="!isOrgFormValid"
            @click="handleSaveOrgAssignment"
          >
            Terapkan Penugasan (BR-10)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Mapping Project Authority (SAD §10.2) -->
    <v-dialog v-model="showProjectAuthDialog" max-width="540" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-shield-account" color="secondary" />
            <span class="text-h6 font-weight-bold">Mapping Project Authority</span>
          </div>
          <v-btn icon="mdi-close" size="small" variant="text" :disabled="isCreatingProjAuth" @click="showProjectAuthDialog = false" />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Menetapkan kewenangan wewenang proyek (Project Manager/Authority) secara concurrent sesuai SAD §10.2.
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-form ref="projFormRef" v-model="isProjFormValid" @submit.prevent="handleSaveProjectAuthority">
            <v-select
              v-model="projectAuthForm.userId"
              :items="userSelectOptions"
              item-title="title"
              item-value="value"
              label="Pilih Pemegang Wewenang (User)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v || 'User wajib dipilih']"
            />

            <v-text-field
              v-model="projectAuthForm.scopeReference"
              label="Scope Reference (mis. Project-Alpha, Engineering)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v?.trim() || 'Scope Reference wajib diisi']"
            />

            <v-text-field
              v-model="projectAuthForm.effectiveDate"
              type="date"
              label="Tanggal Mulai Efektif"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v || 'Tanggal efektif wajib diisi']"
            />

            <v-text-field
              v-model="projectAuthForm.endDate"
              type="date"
              label="Tanggal Berakhir (Opsional)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              hint="Kosongkan jika wewenang berlaku tanpa batas waktu."
              persistent-hint
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end ga-2">
          <v-btn variant="text" color="grey" :disabled="isCreatingProjAuth" @click="showProjectAuthDialog = false">
            Batal
          </v-btn>
          <v-btn
            color="secondary"
            variant="flat"
            :loading="isCreatingProjAuth"
            :disabled="!isProjFormValid"
            @click="handleSaveProjectAuthority"
          >
            Simpan Project Authority
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Akhiri Mapping Project Authority (SAD §10.2) -->
    <v-dialog v-model="showEndProjectAuthDialog" max-width="500" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-shield-off" color="warning" />
            <span class="text-h6 font-weight-bold">Akhiri Project Authority</span>
          </div>
          <v-btn icon="mdi-close" size="small" variant="text" :disabled="isUpdatingProjAuth" @click="showEndProjectAuthDialog = false" />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Mengakhiri wewenang proyek dengan menetapkan tanggal selesai (endDate) sesuai SAD §10.2.
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-form ref="endProjFormRef" v-model="isEndProjFormValid" @submit.prevent="handleSaveEndProjectAuthority">
            <div class="text-body-2 mb-3">
              Pengguna: <strong>{{ selectedUserForEndAuth?.fullName }}</strong> ({{ selectedUserForEndAuth?.email }})
            </div>

            <v-text-field
              v-model="endProjAuthForm.mappingId"
              label="ID Mapping Project Authority (UUID)"
              variant="outlined"
              density="comfortable"
              placeholder="Masukkan UUID Mapping Project Authority"
              class="mb-2"
              :rules="[(v: string) => !!v?.trim() || 'ID Mapping wajib diisi']"
            />

            <v-text-field
              v-model="endProjAuthForm.endDate"
              type="date"
              label="Tanggal Berakhir (endDate)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v || 'Tanggal berakhir wajib diisi']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-2 justify-end ga-2">
          <v-btn variant="text" color="grey" :disabled="isUpdatingProjAuth" @click="showEndProjectAuthDialog = false">
            Batal
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="isUpdatingProjAuth"
            :disabled="!isEndProjFormValid"
            @click="handleSaveEndProjectAuthority"
          >
            Tetapkan Tanggal Berakhir
          </v-btn>
        </v-card-actions>
        <div class="px-4 pb-3 text-caption text-medium-emphasis text-center">
          <v-icon icon="mdi-information-outline" size="12" class="mr-1" />
          Catatan Admin: Mapping ID dicari manual dari log/catatan penugasan proyek (ADR-003: keterbatasan MVP yang diterima sadar).
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog: Riwayat Penugasan Organisasi (SAD §10.2) -->
    <v-dialog v-model="showHistoryDialog" max-width="720">
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-history" color="primary" />
            <span class="text-h6 font-weight-bold">
              Riwayat Penugasan: {{ selectedUserForHistory?.fullName }}
            </span>
          </div>
          <v-btn icon="mdi-close" size="small" variant="text" @click="showHistoryDialog = false" />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Seluruh log penugasan organisasi (effective-dated) yang pernah aktif untuk pengguna ini.
        </v-card-subtitle>

        <v-card-text class="pt-3">
          <v-progress-linear v-if="isHistoryLoading" indeterminate color="primary" class="mb-3" />

          <v-table v-else density="comfortable">
            <thead>
              <tr class="bg-surface-light">
                <th class="text-left font-weight-bold">Role</th>
                <th class="text-left font-weight-bold">Fungsi</th>
                <th class="text-left font-weight-bold">Atasan Langsung</th>
                <th class="text-left font-weight-bold">Tanggal Mulai</th>
                <th class="text-left font-weight-bold">Tanggal Selesai</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!historyAssignments.length">
                <td colspan="5" class="text-center py-4 text-medium-emphasis">
                  Belum ada riwayat penugasan organisasi.
                </td>
              </tr>
              <tr v-for="item in historyAssignments" :key="item.id">
                <td>
                  <v-chip size="x-small" :color="getRoleColor(item.role)" variant="tonal" class="font-weight-bold">
                    {{ item.role }}
                  </v-chip>
                </td>
                <td class="text-body-2">{{ item.function }}</td>
                <td class="text-body-2">
                  {{ item.directManager?.fullName || 'Tidak Ada' }}
                </td>
                <td class="text-body-2 font-weight-medium">{{ formatDate(item.effectiveDate) }}</td>
                <td class="text-body-2">
                  <span v-if="item.endDate" class="text-medium-emphasis">{{ formatDate(item.endDate) }}</span>
                  <v-chip v-else size="x-small" color="success" variant="flat">Aktif Sekarang</v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <v-btn color="primary" variant="flat" @click="showHistoryDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Feedback Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Role } from '../../types/auth.js';
import type {
  UserItem,
  UserStatus,
  CreateOrgAssignmentPayload,
  CreateProjectAuthorityPayload,
  OrganizationalAssignment,
} from '../../types/identity.js';
import {
  useUsersQuery,
  useUserAssignmentsQuery,
  useCreateOrgAssignmentMutation,
  useCreateProjectAuthorityMutation,
  useUpdateProjectAuthorityMutation,
} from '../../queries/useUsers.js';

// -----------------------------------------------------------------------------
// CONSTANTS & FILTER OPTIONS
// -----------------------------------------------------------------------------
const ROLE_OPTIONS: Role[] = [
  'Employee',
  'Supervisor_TL',
  'Head',
  'PM',
  'HRGA',
  'CEO_Management',
  'SystemAdmin',
];

const roleFilterOptions = [
  { title: 'Semua Role', value: '' },
  ...ROLE_OPTIONS.map((r) => ({ title: r, value: r })),
];

const statusFilterOptions = [
  { title: 'Semua Status', value: '' },
  { title: 'Aktif', value: 'Active' },
  { title: 'Non-Aktif', value: 'Inactive' },
];

// -----------------------------------------------------------------------------
// QUERY & FILTER STATE
// -----------------------------------------------------------------------------
const searchQuery = ref('');
const selectedRole = ref<Role | ''>('');
const selectedStatus = ref<UserStatus | ''>('');

const queryParams = computed(() => ({
  pageSize: 100,
  role: selectedRole.value ? (selectedRole.value as Role) : undefined,
  status: selectedStatus.value ? (selectedStatus.value as UserStatus) : undefined,
}));

const { data: usersData, isLoading, isFetching, isError, refetch } = useUsersQuery(queryParams);

const usersList = computed<UserItem[]>(() => usersData.value?.items || []);

const filteredUsers = computed(() => {
  const list = usersList.value;
  if (!searchQuery.value?.trim()) return list;
  const q = searchQuery.value.trim().toLowerCase();
  return list.filter(
    (u) =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.activeAssignment?.directManager?.fullName || '').toLowerCase().includes(q),
  );
});

const userSelectOptions = computed(() =>
  usersList.value.map((u) => ({
    title: `${u.fullName} (${u.email})`,
    value: u.id,
  })),
);

const managerSelectOptions = computed(() =>
  usersList.value
    .filter((u) => u.status === 'Active')
    .map((u) => ({
      title: `${u.fullName} (${u.activeAssignment?.role || 'User'})`,
      value: u.id,
    })),
);

// -----------------------------------------------------------------------------
// MUTATIONS
// -----------------------------------------------------------------------------
const createOrgMutation = useCreateOrgAssignmentMutation();
const createProjectAuthMutation = useCreateProjectAuthorityMutation();
const updateProjectAuthMutation = useUpdateProjectAuthorityMutation();

const isCreatingOrg = computed(() => !!createOrgMutation.isPending.value);
const isCreatingProjAuth = computed(() => !!createProjectAuthMutation.isPending.value);
const isUpdatingProjAuth = computed(() => !!updateProjectAuthMutation.isPending.value);

// -----------------------------------------------------------------------------
// DIALOG STATES
// -----------------------------------------------------------------------------
const todayStr = new Date().toISOString().split('T')[0];

const showOrgDialog = ref(false);
const orgFormRef = ref<any>(null);
const isOrgFormValid = ref(false);
const orgForm = ref<CreateOrgAssignmentPayload>({
  userId: '',
  role: 'Employee',
  function: 'Engineering',
  directManagerId: undefined,
  effectiveDate: todayStr,
});

const showProjectAuthDialog = ref(false);
const projFormRef = ref<any>(null);
const isProjFormValid = ref(false);
const projectAuthForm = ref<CreateProjectAuthorityPayload>({
  userId: '',
  scopeReference: '',
  effectiveDate: todayStr,
  endDate: undefined,
});

// History Dialog
const showHistoryDialog = ref(false);
const selectedUserForHistory = ref<UserItem | null>(null);
const historyUserId = computed(() => selectedUserForHistory.value?.id || '');
const { data: historyData, isLoading: isHistoryLoading } = useUserAssignmentsQuery(historyUserId);
const historyAssignments = computed<OrganizationalAssignment[]>(() => historyData.value || []);

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
});

function showToast(text: string, color: 'success' | 'error' = 'success') {
  snackbar.value = { show: true, text, color };
}

// -----------------------------------------------------------------------------
// HANDLERS
// -----------------------------------------------------------------------------
function openOrgAssignmentDialog(user?: UserItem) {
  orgForm.value = {
    userId: user?.id || (usersList.value[0]?.id || ''),
    role: (user?.activeAssignment?.role as Role) || 'Employee',
    function: user?.activeAssignment?.function || 'Engineering',
    directManagerId: user?.activeAssignment?.directManager?.id || undefined,
    effectiveDate: new Date().toISOString().split('T')[0],
  };
  showOrgDialog.value = true;
}

async function handleSaveOrgAssignment() {
  if (orgFormRef.value) {
    const { valid } = await orgFormRef.value.validate();
    if (!valid) return;
  } else if (!isOrgFormValid.value) {
    return;
  }

  try {
    await createOrgMutation.mutateAsync({
      userId: orgForm.value.userId,
      role: orgForm.value.role,
      function: orgForm.value.function.trim(),
      directManagerId: orgForm.value.directManagerId || null,
      effectiveDate: orgForm.value.effectiveDate,
    });

    showOrgDialog.value = false;
    showToast('Penugasan organisasi berhasil disimpan. Assignment lama ditutup (BR-10).');
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan penugasan organisasi.', 'error');
  }
}

function openProjectAuthDialog(user?: UserItem) {
  projectAuthForm.value = {
    userId: user?.id || (usersList.value[0]?.id || ''),
    scopeReference: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
  };
  showProjectAuthDialog.value = true;
}

const showEndProjectAuthDialog = ref(false);
const endProjFormRef = ref<any>(null);
const isEndProjFormValid = ref(false);
const selectedUserForEndAuth = ref<UserItem | null>(null);
const endProjAuthForm = ref({
  mappingId: '',
  endDate: todayStr,
});

function openEndProjectAuthDialog(user: UserItem) {
  selectedUserForEndAuth.value = user;
  endProjAuthForm.value = {
    mappingId: '',
    endDate: new Date().toISOString().split('T')[0],
  };
  showEndProjectAuthDialog.value = true;
}

async function handleSaveEndProjectAuthority() {
  if (endProjFormRef.value) {
    const { valid } = await endProjFormRef.value.validate();
    if (!valid) return;
  } else if (!isEndProjFormValid.value) {
    return;
  }

  try {
    await updateProjectAuthMutation.mutateAsync({
      id: endProjAuthForm.value.mappingId.trim(),
      payload: { endDate: endProjAuthForm.value.endDate },
    });

    showEndProjectAuthDialog.value = false;
    showToast('Project authority mapping berhasil diakhiri (endDate ditetapkan).');
  } catch (err: any) {
    showToast(err.message || 'Gagal memperbarui mapping project authority.', 'error');
  }
}

async function handleSaveProjectAuthority() {
  if (projFormRef.value) {
    const { valid } = await projFormRef.value.validate();
    if (!valid) return;
  } else if (!isProjFormValid.value) {
    return;
  }

  try {
    await createProjectAuthMutation.mutateAsync({
      userId: projectAuthForm.value.userId,
      scopeReference: projectAuthForm.value.scopeReference.trim(),
      effectiveDate: projectAuthForm.value.effectiveDate,
      endDate: projectAuthForm.value.endDate || undefined,
    });

    showProjectAuthDialog.value = false;
    showToast('Project authority mapping berhasil disimpan.');
  } catch (err: any) {
    showToast(err.message || 'Gagal menyimpan mapping project authority.', 'error');
  }
}

function viewAssignmentHistory(user: UserItem) {
  selectedUserForHistory.value = user;
  showHistoryDialog.value = true;
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getRoleColor(role?: string): string {
  switch (role) {
    case 'SystemAdmin':
      return 'red-darken-1';
    case 'HRGA':
      return 'purple-darken-1';
    case 'Supervisor_TL':
      return 'blue-darken-2';
    case 'Head':
      return 'indigo-darken-2';
    case 'PM':
      return 'cyan-darken-2';
    case 'CEO_Management':
    case 'CEO_Director':
      return 'deep-orange';
    default:
      return 'blue-grey';
  }
}
</script>

<style scoped>
.border-subtle {
  border-color: rgba(var(--v-border-color), 0.12) !important;
}
</style>
