<template>
  <div class="admin-temporary-reviewer-tab">
    <!-- Header & Action -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 class="text-h6 font-weight-bold">Temporary Reviewer Assignments</h2>
        <p class="text-caption text-medium-emphasis">
          Delegasikan kewenangan tinjauan atau approval (Reviewer Authority) kepada karyawan lain secara sementara (SAD §10.2, BR-11).
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-arrow-right" @click="openDelegationDialog">
        Delegasikan Wewenang
      </v-btn>
    </div>

    <!-- Compliance Note Alert -->
    <v-alert
      type="warning"
      variant="tonal"
      density="comfortable"
      class="mb-4 rounded-lg text-caption"
      icon="mdi-shield-alert-outline"
    >
      <strong>Aturan Bisnis & Kepatuhan Audit (BR-11):</strong>
      Pendelegasian wewenang reviewer sementara wajib memiliki tanggal kadaluarsa (<code>expiryDate > effectiveDate</code>).
      Seluruh tindakan review yang dilakukan oleh Reviewer Sementara dicatat dalam Audit Trail atas nama delegasi tersebut, dengan Atasan Asli tetap menerima notifikasi tembusan (CC).
    </v-alert>

    <!-- Data Table Card -->
    <v-card variant="outlined" class="border-subtle rounded-lg overflow-hidden">
      <v-progress-linear v-if="isLoading" indeterminate color="primary" />

      <v-table hover>
        <thead class="bg-surface-variant">
          <tr>
            <th class="text-left font-weight-bold">Penerima Delegasi (Reviewer)</th>
            <th class="text-left font-weight-bold">Lingkup Wewenang (Scope)</th>
            <th class="text-left font-weight-bold">Alasan Pendelegasian</th>
            <th class="text-left font-weight-bold">Periode Berlaku</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-center font-weight-bold" style="width: 140px;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!delegationsList.length && !isLoading">
            <td colspan="6" class="text-center py-8 text-medium-emphasis">
              <v-icon icon="mdi-account-clock-outline" size="36" class="mb-2 d-block mx-auto text-disabled" />
              <span>Belum ada penugasan reviewer sementara yang tercatat dalam sesi ini.</span>
            </td>
          </tr>

          <tr v-for="temp in delegationsList" :key="temp.id">
            <td>
              <div class="d-flex align-center ga-3 py-2">
                <v-avatar color="primary" size="32">
                  <span class="text-white text-caption font-weight-bold">{{ getInitials(temp.reviewerName) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">{{ temp.reviewerName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ temp.reviewerEmail }}</div>
                </div>
              </div>
            </td>
            <td>
              <v-chip size="small" color="teal" variant="tonal" class="font-weight-bold">
                {{ temp.scope }}
              </v-chip>
            </td>
            <td class="text-body-2 text-medium-emphasis">
              {{ temp.reason }}
            </td>
            <td class="text-body-2 text-medium-emphasis">
              <div>Mulai: <strong>{{ formatDate(temp.effectiveDate) }}</strong></div>
              <div class="text-caption text-warning font-weight-medium">
                Berakhir: {{ formatDate(temp.expiryDate) }}
              </div>
            </td>
            <td>
              <v-chip
                size="small"
                :color="isDelegationActive(temp) ? 'success' : 'grey'"
                variant="flat"
                class="font-weight-medium"
              >
                {{ isDelegationActive(temp) ? 'Aktif (Berlaku)' : 'Kadaluarsa / Selesai' }}
              </v-chip>
            </td>
            <td class="text-center">
              <div class="d-flex align-center justify-center ga-1">
                <v-tooltip text="Delegasikan Lagi / Salin Scope (BR-11)">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="primary"
                      icon="mdi-account-arrow-right"
                      @click="openExtendDelegationDialog(temp)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Lihat Detail Delegasi & Audit">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      size="small"
                      color="secondary"
                      icon="mdi-information-outline"
                      @click="viewDelegationDetail(temp)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog: Delegasikan Wewenang Sementara (BR-11) -->
    <v-dialog v-model="showDialog" max-width="540" persistent>
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-account-arrow-right" color="primary" />
            <span class="text-h6 font-weight-bold">Delegasikan Wewenang Sementara</span>
          </div>
          <v-btn icon="mdi-close" size="small" variant="text" :disabled="isSubmitting" @click="showDialog = false" />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Menerbitkan penugasan reviewer sementara sesuai <strong>SAD §10.2 dan BR-11</strong>.
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleCreateDelegation">
            <v-select
              v-model="form.reviewerUserId"
              :items="userSelectOptions"
              item-title="title"
              item-value="value"
              label="Pilih Penerima Delegasi (Reviewer)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v || 'Penerima delegasi wajib dipilih']"
            />

            <v-text-field
              v-model="form.scope"
              label="Lingkup Wewenang / Scope (mis. Engineering, Finance, Project-Alpha)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v: string) => !!v?.trim() || 'Scope wewenang wajib diisi']"
            />

            <v-textarea
              v-model="form.reason"
              label="Alasan Pendelegasian (mis. Atasan Cuti Tahunan, Dinas Luar)"
              variant="outlined"
              density="comfortable"
              rows="2"
              class="mb-2"
              :rules="[(v: string) => !!v?.trim() || 'Alasan wajib diisi']"
            />

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.effectiveDate"
                  type="date"
                  label="Tanggal Mulai (effectiveDate)"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'Tanggal mulai wajib diisi']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.expiryDate"
                  type="date"
                  label="Tanggal Berakhir (expiryDate)"
                  variant="outlined"
                  density="comfortable"
                  :rules="[
                    (v: string) => !!v || 'Tanggal kadaluarsa wajib diisi (BR-11)',
                    (v: string) => v > form.effectiveDate || 'Tanggal berakhir harus lebih besar dari tanggal mulai (BR-11)',
                  ]"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end ga-2">
          <v-btn variant="text" color="grey" :disabled="isSubmitting" @click="showDialog = false">
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isSubmitting"
            :disabled="!isFormValid"
            @click="handleCreateDelegation"
          >
            Simpan Delegasi (BR-11)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Detail Delegasi & Audit Info (BR-11) -->
    <v-dialog v-model="showDetailDialog" max-width="520">
      <v-card class="pa-3 rounded-lg">
        <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-shield-check" color="primary" />
            <span class="text-h6 font-weight-bold">Detail Pendelegasian Wewenang</span>
          </div>
          <v-btn icon="mdi-close" size="small" variant="text" @click="showDetailDialog = false" />
        </v-card-title>

        <v-card-subtitle class="text-caption text-medium-emphasis">
          Informasi lengkap penugasan wewenang reviewer sementara (SAD §10.2, BR-11).
        </v-card-subtitle>

        <v-card-text class="pt-3" v-if="selectedDelegation">
          <v-list density="compact">
            <v-list-item>
              <template #prepend><v-icon icon="mdi-account" color="primary" /></template>
              <v-list-item-title class="font-weight-bold text-body-2">Penerima Delegasi</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ selectedDelegation.reviewerName }} ({{ selectedDelegation.reviewerEmail }})
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend><v-icon icon="mdi-target" color="teal" /></template>
              <v-list-item-title class="font-weight-bold text-body-2">Scope Wewenang</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ selectedDelegation.scope }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend><v-icon icon="mdi-text" color="blue-grey" /></template>
              <v-list-item-title class="font-weight-bold text-body-2">Alasan Pendelegasian</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ selectedDelegation.reason }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend><v-icon icon="mdi-calendar-range" color="warning" /></template>
              <v-list-item-title class="font-weight-bold text-body-2">Periode Berlaku</v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-high-emphasis">
                {{ formatDate(selectedDelegation.effectiveDate) }} s.d. {{ formatDate(selectedDelegation.expiryDate) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert type="info" variant="tonal" density="compact" class="text-caption mt-3">
            Tindakan approval oleh delegasi ini tercatat dalam Audit Log resmi dengan CC notifikasi ke atasan asli (SAD §12.1).
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 justify-end">
          <v-btn color="primary" variant="flat" @click="showDetailDialog = false">
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
import type { UserItem, CreateTempReviewerPayload } from '../../types/identity.js';
import {
  useUsersQuery,
  useCreateTempReviewerMutation,
  useTempReviewersQuery,
} from '../../queries/useUsers.js';

interface TemporaryReviewerRecord {
  id: string;
  reviewerUserId: string;
  reviewerName: string;
  reviewerEmail: string;
  scope: string;
  reason: string;
  effectiveDate: string;
  expiryDate: string;
}

// -----------------------------------------------------------------------------
// DATA QUERIES & CANDIDATE REVIEWERS (ADR-002, SAD §10.2)
// -----------------------------------------------------------------------------
const { data: usersData, isLoading: isUsersLoading } = useUsersQuery({ pageSize: 100 });
const { data: tempReviewersData, isLoading: isReviewersLoading } = useTempReviewersQuery();

const isLoading = computed(() => isUsersLoading.value || isReviewersLoading.value);

const activeUsers = computed<UserItem[]>(() =>
  (usersData.value?.items || []).filter((u) => u.status === 'Active'),
);

const userSelectOptions = computed(() =>
  activeUsers.value.map((u) => ({
    title: `${u.fullName} — ${u.activeAssignment?.role || 'User'} (${u.email})`,
    value: u.id,
  })),
);

// -----------------------------------------------------------------------------
// MUTATIONS & STATE
// -----------------------------------------------------------------------------
const createTempReviewerMutation = useCreateTempReviewerMutation();
const isSubmitting = computed(() => !!createTempReviewerMutation.isPending.value);

// Reactive list of assigned temporary reviewers from API query (ADR-002)
const delegationsList = computed<TemporaryReviewerRecord[]>(() => {
  return (tempReviewersData.value || []).map((item) => ({
    id: item.id,
    reviewerUserId: item.reviewerUserId,
    reviewerName: item.reviewer?.fullName || 'Reviewer Terpilih',
    reviewerEmail: item.reviewer?.email || '',
    scope: item.scope,
    reason: item.reason || '-',
    effectiveDate: item.effectiveDate,
    expiryDate: item.expiryDate,
  }));
});

// Dialog & Form State
const showDialog = ref(false);
const formRef = ref<any>(null);
const isFormValid = ref(false);

const todayStr = new Date().toISOString().split('T')[0];
const nextWeekDate = new Date();
nextWeekDate.setDate(nextWeekDate.getDate() + 7);
const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

const form = ref<CreateTempReviewerPayload>({
  reviewerUserId: '',
  scope: '',
  reason: '',
  effectiveDate: todayStr,
  expiryDate: nextWeekStr,
});

// Snackbar State
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
});

function showToast(text: string, color: 'success' | 'error' = 'success') {
  snackbar.value = { show: true, text, color };
}

// Detail Dialog State
const showDetailDialog = ref(false);
const selectedDelegation = ref<TemporaryReviewerRecord | null>(null);

// -----------------------------------------------------------------------------
// HANDLERS
// -----------------------------------------------------------------------------
function openDelegationDialog() {
  form.value = {
    reviewerUserId: activeUsers.value[0]?.id || '',
    scope: 'Engineering',
    reason: 'Cuti Tahunan Atasan',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: nextWeekStr,
  };
  showDialog.value = true;
}

function openExtendDelegationDialog(temp: TemporaryReviewerRecord) {
  form.value = {
    reviewerUserId: temp.reviewerUserId,
    scope: temp.scope,
    reason: `Perpanjangan: ${temp.reason}`,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: nextWeekStr,
  };
  showDialog.value = true;
}

function viewDelegationDetail(temp: TemporaryReviewerRecord) {
  selectedDelegation.value = temp;
  showDetailDialog.value = true;
}

async function handleCreateDelegation() {
  if (formRef.value) {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  } else if (!isFormValid.value) {
    return;
  }

  // BR-11 check
  if (form.value.expiryDate <= form.value.effectiveDate) {
    showToast('Tanggal berakhir harus lebih besar dari tanggal mulai (BR-11).', 'error');
    return;
  }

  try {
    await createTempReviewerMutation.mutateAsync({
      reviewerUserId: form.value.reviewerUserId,
      scope: form.value.scope.trim(),
      reason: form.value.reason.trim(),
      effectiveDate: form.value.effectiveDate,
      expiryDate: form.value.expiryDate,
    });

    // Invalidation in useCreateTempReviewerMutation automatically triggers refetch (SAD §17.4)
    showDialog.value = false;
    showToast(`Pendelegasian wewenang reviewer berhasil disimpan ke database (BR-11).`);
  } catch (err: any) {
    showToast(err.message || 'Gagal mendelegasikan wewenang reviewer.', 'error');
  }
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
function isDelegationActive(record: TemporaryReviewerRecord): boolean {
  const today = new Date().toISOString().split('T')[0];
  return today >= record.effectiveDate && today <= record.expiryDate;
}

function getInitials(name: string): string {
  if (!name) return 'R';
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
</script>

<style scoped>
.border-subtle {
  border-color: rgba(var(--v-border-color), 0.12) !important;
}
</style>
