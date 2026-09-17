<template>
  <v-container class="py-6 max-w-1200">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-calendar-account" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">My Leave Request</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Pengajuan dan Riwayat Cuti (Leave) Karyawan
        </p>
      </div>
    </div>

    <v-row>
      <!-- Kolom Kiri: Form Pengajuan Baru -->
      <v-col cols="12" md="5">
        <v-card variant="outlined" class="rounded-lg border-subtle h-100">
          <v-card-item class="bg-surface-variant border-b py-3">
            <v-card-title class="text-subtitle-1 font-weight-bold">
              Form Pengajuan Cuti
            </v-card-title>
          </v-card-item>

          <v-card-text class="pa-6">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-6 rounded-lg text-caption"
            >
              Cuti yang disetujui akan secara otomatis mengecualikan Anda dari deteksi "No Submission" harian pada tanggal yang bersangkutan.
            </v-alert>

            <v-form @submit.prevent="submitLeave" ref="formRef">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.startDate"
                    label="Tanggal Mulai"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || 'Tanggal mulai wajib diisi']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.endDate"
                    label="Tanggal Selesai"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    :rules="[
                      v => !!v || 'Tanggal selesai wajib diisi',
                      v => !formData.startDate || v >= formData.startDate || 'Tanggal selesai harus >= Tanggal mulai'
                    ]"
                  />
                </v-col>
              </v-row>

              <v-textarea
                v-model="formData.reason"
                label="Alasan Cuti"
                variant="outlined"
                rows="3"
                class="mt-2"
                :rules="[v => !!v || 'Alasan cuti wajib diisi']"
              />

              <div class="d-flex justify-end mt-4">
                <v-btn
                  color="primary"
                  type="submit"
                  prepend-icon="mdi-send"
                  :loading="isSubmitting"
                  class="font-weight-medium"
                >
                  Ajukan Cuti
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Kolom Kanan: Riwayat Pengajuan -->
      <v-col cols="12" md="7">
        <v-card variant="outlined" class="rounded-lg border-subtle h-100">
          <v-card-item class="bg-surface-variant border-b py-3">
            <div class="d-flex align-center justify-space-between flex-wrap ga-2">
              <v-card-title class="text-subtitle-1 font-weight-bold">
                Riwayat Pengajuan Cuti Anda
              </v-card-title>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-refresh"
                :loading="isFetching"
                @click="refetch"
              />
            </div>
          </v-card-item>

          <v-card-text class="pa-4">
            <div v-if="isLoading" class="py-8 text-center">
              <v-progress-circular indeterminate color="primary" />
              <div class="text-caption text-medium-emphasis mt-2">Memuat riwayat cuti...</div>
            </div>

            <div
              v-else-if="myLeaves.length === 0"
              class="py-12 text-center text-medium-emphasis border rounded-lg"
            >
              <v-icon icon="mdi-calendar-blank" size="48" class="mb-2" />
              <div>Anda belum pernah mengajukan cuti.</div>
            </div>

            <div v-else class="d-flex flex-column ga-3">
              <v-card
                v-for="leave in myLeaves"
                :key="leave.id"
                variant="outlined"
                class="pa-4 rounded border-subtle"
              >
                <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-2">
                  <div>
                    <span class="text-subtitle-2 font-weight-bold">
                      {{ formatDate(leave.startDate) }} &mdash; {{ formatDate(leave.endDate) }}
                    </span>
                  </div>
                  <v-chip
                    size="small"
                    :color="getStatusColor(leave.status)"
                    class="font-weight-bold text-uppercase"
                    variant="flat"
                  >
                    {{ leave.status }}
                  </v-chip>
                </div>
                
                <div class="text-body-2 text-medium-emphasis mt-2">
                  <strong>Alasan:</strong> {{ leave.reason }}
                </div>
                
                <div v-if="leave.status === 'Rejected' && leave.rejectionReason" class="text-body-2 text-error mt-2">
                  <strong>Alasan Penolakan:</strong> {{ leave.rejectionReason }}
                </div>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth.store.js';
import { useExceptionsQuery, useCreateLeaveMutation } from '../queries/useExceptions.js';

const authStore = useAuthStore();
const userId = computed(() => authStore.user?.userId || '');

const formRef = ref<any>(null);
const formData = ref({
  startDate: '',
  endDate: '',
  reason: '',
});

// Mengambil data Leave
const {
  data: exceptionsData,
  isLoading,
  isFetching,
  refetch,
} = useExceptionsQuery({
  type: 'Leave',
});

// Filter lokal milik user sendiri (jika Backend tidak mem-filter by default)
const myLeaves = computed(() => {
  const list = exceptionsData.value?.exceptions || [];
  return list.filter((e) => e.userId === userId.value);
});

const createLeaveMutation = useCreateLeaveMutation();
const isSubmitting = computed(() => createLeaveMutation.isPending.value);

async function submitLeave() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  await createLeaveMutation.mutateAsync(formData.value);
  
  // Reset form
  formData.value = {
    startDate: '',
    endDate: '',
    reason: '',
  };
  formRef.value.resetValidation();
}

function formatDate(isoStr: string) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Approved': return 'success';
    case 'Pending': return 'warning';
    case 'Rejected': return 'error';
    default: return 'grey';
  }
}
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
.max-w-1200 { max-width: 1200px; margin: 0 auto; }
</style>
