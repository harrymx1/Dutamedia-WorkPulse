<template>
  <div>
    <!-- Header & Action Button -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">User & Role Management</h2>
        <p class="text-caption text-medium-emphasis">
          Kelola direktori karyawan, penempatan departemen/fungsi, dan hak akses (role) sesuai SAD §10.2 & FR-22.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        class="text-none font-weight-bold"
        @click="openCreateDialog"
      >
        Tambah User Baru
      </v-btn>
    </div>

    <!-- Filter & Search Controls -->
    <v-card variant="outlined" class="border-subtle rounded-lg pa-3 mb-4 bg-surface">
      <v-row dense align="center">
        <v-col cols="12" sm="5" md="6">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Cari nama atau email..."
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" sm="3" md="3">
          <v-select
            v-model="selectedRole"
            label="Filter Role"
            :items="roleFilterOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="6" sm="4" md="3">
          <v-select
            v-model="selectedStatus"
            label="Filter Status"
            :items="statusFilterOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Data Table Card -->
    <v-card variant="outlined" class="border-subtle rounded-lg overflow-hidden">
      <v-progress-linear v-if="isLoading || isFetching" indeterminate color="primary" />

      <!-- Error State -->
      <v-alert
        v-if="isError"
        type="error"
        variant="tonal"
        class="ma-4"
        title="Gagal Memuat Data Pengguna"
        text="Terjadi kendala saat menghubungi server. Silakan coba lagi."
      >
        <template #append>
          <v-btn variant="outlined" size="small" color="error" @click="() => refetch()">
            Coba Lagi
          </v-btn>
        </template>
      </v-alert>

      <!-- Users Table -->
      <v-table v-else hover>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Nama Karyawan</th>
            <th class="text-left font-weight-bold">Email</th>
            <th class="text-left font-weight-bold">Role Sistem</th>
            <th class="text-left font-weight-bold">Fungsi / Departemen</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-center font-weight-bold" style="width: 140px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!usersList.length && !isLoading">
            <td colspan="6" class="text-center py-8 text-medium-emphasis">
              <v-icon icon="mdi-account-search" size="36" class="mb-2 d-block mx-auto text-disabled" />
              <span>Tidak ada pengguna yang sesuai kriteria pencarian.</span>
            </td>
          </tr>

          <tr v-for="user in usersList" :key="user.id">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="primary" size="32">
                  <span class="text-white text-caption font-weight-bold">{{ getInitials(user.fullName) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ user.fullName }}</div>
                  <div v-if="user.mustResetPassword" class="text-caption text-warning d-flex align-center ga-1">
                    <v-icon icon="mdi-key-alert" size="12" /> Wajib reset password
                  </div>
                </div>
              </div>
            </td>
            <td class="text-medium-emphasis text-body-2">{{ user.email }}</td>
            <td>
              <v-chip size="small" :color="getRoleColor(user.activeAssignment?.role)" variant="tonal" class="font-weight-bold">
                {{ user.activeAssignment?.role || 'Belum Ditugaskan' }}
              </v-chip>
            </td>
            <td class="text-medium-emphasis text-body-2">{{ user.activeAssignment?.function || '-' }}</td>
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
                <!-- Toggle Status Button (Deactivate / Activate) -->
                <v-tooltip :text="user.status === 'Active' ? 'Nonaktifkan Akun (SAD §10.2)' : 'Aktifkan Akun'">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      :color="user.status === 'Active' ? 'error' : 'success'"
                      :icon="user.status === 'Active' ? 'mdi-account-off' : 'mdi-account-check'"
                      :loading="updateStatusMutation.isPending && selectedUserForAction?.id === user.id"
                      @click="promptToggleStatus(user)"
                    />
                  </template>
                </v-tooltip>

                <!-- Admin Reset Password Button (FR-50) -->
                <v-tooltip text="Admin Reset Password (FR-50)">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="secondary"
                      icon="mdi-lock-reset"
                      :loading="resetPasswordMutation.isPending && selectedUserForAction?.id === user.id"
                      @click="promptResetPassword(user)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog: Tambah User Baru (FR-22, FR-50) -->
    <v-dialog v-model="createDialog" max-width="540" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-account-plus" color="primary" />
            <span class="text-h6 font-weight-bold">Tambah User Baru</span>
          </div>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            :disabled="isCreatingUser"
            @click="createDialog = false"
          />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Membuat identitas pengguna baru dan initial organizational assignment (SAD §10.2).
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleCreateUser">
            <v-text-field
              v-model="createForm.fullName"
              label="Nama Lengkap Karyawan"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v?.trim() || 'Nama lengkap wajib diisi']"
            />

            <v-text-field
              v-model="createForm.email"
              label="Alamat Email Perusahaan"
              type="email"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[
                (v: string) => !!v?.trim() || 'Email wajib diisi',
                (v: string) => /.+@.+\..+/.test(v) || 'Format email tidak valid',
              ]"
            />

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="createForm.initialRole"
                  label="Role Sistem Awal"
                  :items="ROLE_OPTIONS"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  :rules="[(v: Role) => !!v || 'Role wajib dipilih']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.function"
                  label="Fungsi / Departemen"
                  placeholder="mis. Engineering, Finance"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
                  :rules="[(v: string) => !!v?.trim() || 'Fungsi wajib diisi']"
                />
              </v-col>
            </v-row>

            <v-select
              v-model="createForm.directManagerId"
              label="Direct Manager (Atasan Langsung)"
              :items="managerOptions"
              item-title="fullName"
              item-value="id"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              clearable
              hint="Opsional — penanggung jawab approval & review"
              persistent-hint
            />

            <v-text-field
              v-model="createForm.effectiveDate"
              label="Tanggal Efektif Penugasan"
              type="date"
              variant="outlined"
              density="comfortable"
              class="mt-3 mb-2"
              :rules="[(v: string) => !!v || 'Tanggal efektif wajib diisi']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end ga-2">
          <v-btn
            variant="text"
            color="grey"
            :disabled="isCreatingUser"
            @click="createDialog = false"
          >
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isCreatingUser"
            :disabled="!isFormValid"
            @click="handleCreateUser"
          >
            Simpan User Baru
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Password Sementara Diterbitkan (FR-50) -->
    <v-dialog v-model="passwordDialog" max-width="460" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center ga-2 pt-3 pb-1">
          <v-icon icon="mdi-shield-key" color="success" />
          <span class="text-h6 font-weight-bold">{{ passwordDialogTitle }}</span>
        </v-card-title>

        <v-card-text class="pt-3">
          <p class="text-body-2 text-medium-emphasis mb-3">
            Password sementara berikut telah di-generate. Salin dan berikan secara aman kepada karyawan terkait. Akun berstatus <strong>mustResetPassword = true</strong> sehingga wajib membuat password baru saat login pertama (SAD §8.2, FR-50).
          </p>

          <v-sheet color="surface-variant" class="pa-3 rounded-lg d-flex align-center justify-space-between mb-2">
            <code class="text-subtitle-1 font-weight-bold text-primary font-monospace">{{ generatedPassword }}</code>
            <v-btn
              variant="text"
              size="small"
              icon="mdi-content-copy"
              color="primary"
              @click="copyPasswordToClipboard"
            />
          </v-sheet>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <v-btn color="primary" variant="flat" @click="passwordDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Konfirmasi Deaktivasi / Aktivasi Akun (SAD §10.2) -->
    <v-dialog v-model="statusConfirmDialog" max-width="440" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center ga-2 pt-3 pb-1">
          <v-icon
            :icon="targetNewStatus === 'Inactive' ? 'mdi-account-alert' : 'mdi-account-check'"
            :color="targetNewStatus === 'Inactive' ? 'error' : 'success'"
          />
          <span class="text-h6 font-weight-bold">
            {{ targetNewStatus === 'Inactive' ? 'Nonaktifkan Akun Pengguna' : 'Aktifkan Kembali Pengguna' }}
          </span>
        </v-card-title>

        <v-card-text class="pt-3">
          <p class="text-body-2 mb-2">
            Apakah Anda yakin ingin mengubah status akun <strong>{{ selectedUserForAction?.fullName }}</strong> ({{ selectedUserForAction?.email }}) menjadi <strong>{{ targetNewStatus === 'Inactive' ? 'Non-Aktif' : 'Aktif' }}</strong>?
          </p>
          <v-alert
            v-if="targetNewStatus === 'Inactive'"
            type="warning"
            variant="tonal"
            density="compact"
            class="text-caption mt-2"
          >
            Sesuai SAD §10.2, penonaktifan akun akan otomatis mencabut seluruh sesi aktif (Session Revocation) seketika.
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end ga-2">
          <v-btn variant="text" color="grey" :disabled="isUpdatingStatus" @click="statusConfirmDialog = false">
            Batal
          </v-btn>
          <v-btn
            :color="targetNewStatus === 'Inactive' ? 'error' : 'success'"
            variant="flat"
            :loading="isUpdatingStatus"
            @click="confirmToggleStatus"
          >
            Ya, Lanjutkan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Global Feedback Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Role } from '../../types/auth.js';
import type { UserItem, UserStatus, CreateUserPayload } from '../../types/identity.js';
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useAdminResetPasswordMutation,
} from '../../queries/useUsers.js';

// -----------------------------------------------------------------------------
// CONSTANTS & OPTIONS
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
// FILTER & SEARCH STATE
// -----------------------------------------------------------------------------
const searchQuery = ref('');
const selectedRole = ref<Role | ''>('');
const selectedStatus = ref<UserStatus | ''>('');

const queryParams = computed(() => ({
  search: searchQuery.value?.trim() || undefined,
  role: selectedRole.value ? (selectedRole.value as Role) : undefined,
  status: selectedStatus.value ? (selectedStatus.value as UserStatus) : undefined,
  pageSize: 100,
}));

// -----------------------------------------------------------------------------
// DATA QUERIES & MUTATIONS
// -----------------------------------------------------------------------------
const { data: usersData, isLoading, isFetching, isError, refetch } = useUsersQuery(queryParams);

const usersList = computed<UserItem[]>(() => usersData.value?.items || []);

const managerOptions = computed(() => {
  return (usersData.value?.items || [])
    .filter((u) => u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: `${u.fullName} (${u.activeAssignment?.role || 'User'})` }));
});

const createUserMutation = useCreateUserMutation();
const updateStatusMutation = useUpdateUserStatusMutation();
const resetPasswordMutation = useAdminResetPasswordMutation();

const isCreatingUser = computed(() => !!createUserMutation.isPending.value);
const isUpdatingStatus = computed(() => !!updateStatusMutation.isPending.value);

// -----------------------------------------------------------------------------
// UI DIALOG STATES
// -----------------------------------------------------------------------------
const createDialog = ref(false);
const formRef = ref<any>(null);
const isFormValid = ref(false);

const todayStr = new Date().toISOString().split('T')[0];
const createForm = ref<CreateUserPayload>({
  fullName: '',
  email: '',
  initialRole: 'Employee',
  function: 'Engineering',
  directManagerId: undefined,
  effectiveDate: todayStr,
});

const passwordDialog = ref(false);
const passwordDialogTitle = ref('');
const generatedPassword = ref('');

const statusConfirmDialog = ref(false);
const selectedUserForAction = ref<UserItem | null>(null);
const targetNewStatus = ref<UserStatus>('Inactive');

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
});

function showToast(text: string, color = 'success') {
  snackbar.value = { show: true, text, color };
}

// -----------------------------------------------------------------------------
// METHODS & HANDLERS
// -----------------------------------------------------------------------------
function getInitials(name: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getRoleColor(role?: Role | null): string {
  switch (role) {
    case 'SystemAdmin':
      return 'deep-purple';
    case 'Head':
    case 'Head_Dept':
      return 'indigo';
    case 'Supervisor_TL':
      return 'primary';
    case 'PM':
      return 'amber-darken-3';
    case 'HRGA':
      return 'cyan-darken-2';
    case 'CEO_Management':
    case 'CEO_Director':
      return 'deep-orange';
    default:
      return 'blue-grey';
  }
}

function openCreateDialog() {
  createForm.value = {
    fullName: '',
    email: '',
    initialRole: 'Employee',
    function: 'Engineering',
    directManagerId: undefined,
    effectiveDate: new Date().toISOString().split('T')[0],
  };
  createDialog.value = true;
}

async function handleCreateUser() {
  if (formRef.value) {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  } else if (!isFormValid.value) {
    return;
  }

  try {
    const res = await createUserMutation.mutateAsync({
      ...createForm.value,
      email: createForm.value.email.trim().toLowerCase(),
      fullName: createForm.value.fullName.trim(),
      function: createForm.value.function.trim(),
    });

    createDialog.value = false;
    passwordDialogTitle.value = 'Akun Pengguna Baru Berhasil Dibuat';
    generatedPassword.value = res.temporaryPassword || '(Password telah digenerate)';
    passwordDialog.value = true;
    showToast(`User ${res.user.fullName} berhasil didaftarkan.`);
  } catch (err: any) {
    showToast(err.message || 'Gagal mendaftarkan user baru.', 'error');
  }
}

function promptToggleStatus(user: UserItem) {
  selectedUserForAction.value = user;
  targetNewStatus.value = user.status === 'Active' ? 'Inactive' : 'Active';
  statusConfirmDialog.value = true;
}

async function confirmToggleStatus() {
  if (!selectedUserForAction.value) return;

  const target = selectedUserForAction.value;
  const newStatus = targetNewStatus.value;

  try {
    await updateStatusMutation.mutateAsync({
      id: target.id,
      payload: { status: newStatus },
    });

    statusConfirmDialog.value = false;
    showToast(
      `Status pengguna ${target.fullName} berhasil diubah menjadi ${newStatus === 'Active' ? 'Aktif' : 'Non-Aktif'}.`,
    );
  } catch (err: any) {
    showToast(err.message || 'Gagal mengubah status pengguna.', 'error');
  }
}

async function promptResetPassword(user: UserItem) {
  selectedUserForAction.value = user;
  try {
    const res = await resetPasswordMutation.mutateAsync(user.id);
    passwordDialogTitle.value = 'Password Berhasil Direset';
    generatedPassword.value = res.temporaryPassword;
    passwordDialog.value = true;
    showToast(`Password untuk ${user.fullName} berhasil direset.`);
  } catch (err: any) {
    showToast(err.message || 'Gagal mereset password pengguna.', 'error');
  }
}

async function copyPasswordToClipboard() {
  if (!generatedPassword.value) return;
  try {
    await navigator.clipboard.writeText(generatedPassword.value);
    showToast('Password berhasil disalin ke clipboard!');
  } catch {
    showToast('Gagal menyalin password ke clipboard.', 'error');
  }
}
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.font-monospace {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
</style>
