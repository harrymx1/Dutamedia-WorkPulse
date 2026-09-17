<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-calendar-plus" color="primary" />
          <span class="text-h6 font-weight-bold">Tambah Hari Libur / Pengecualian</span>
        </div>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          :disabled="isPending"
          @click="emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-card-subtitle class="text-caption text-medium-emphasis">
        Pengecualian jadwal kerja operasional (SAD §10.6, BR-18)
      </v-card-subtitle>

      <v-card-text class="pt-4">
        <!-- Jenis Pengecualian -->
        <v-radio-group v-model="exemptionKind" inline class="mb-2">
          <v-radio label="Hari Libur Perusahaan / Nasional" value="holiday" color="primary" />
          <v-radio label="Pengecualian Karyawan Spesifik" value="exemption" color="primary" />
        </v-radio-group>

        <!-- Dropdown Karyawan jika Individual Exemption -->
        <v-select
          v-if="exemptionKind === 'exemption'"
          v-model="targetUserId"
          label="Pilih Karyawan"
          :items="ownerOptions"
          item-title="fullName"
          item-value="id"
          variant="outlined"
          density="comfortable"
          :loading="isLoadingOwners"
          :rules="[(v: string) => !!v || 'Karyawan wajib dipilih']"
          class="mb-3"
        />

        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="startDate"
              label="Tanggal Mulai"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[(v: string) => !!v || 'Tanggal mulai wajib diisi']"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="endDate"
              label="Tanggal Selesai"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[(v: string) => !!v || 'Tanggal selesai wajib diisi']"
            />
          </v-col>
        </v-row>

        <v-textarea
          v-model="reason"
          label="Keterangan / Alasan Pengecualian"
          placeholder="Contoh: Hari Raya Idul Fitri, Training Eksternal, dsb."
          variant="outlined"
          rows="3"
          :rules="[(v: string) => !!v || 'Alasan wajib diisi']"
          class="mt-2"
        />

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-2"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="isPending"
          @click="emit('update:modelValue', false)"
        >
          Batal
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="isPending"
          :disabled="!isSubmitValid"
          @click="handleSubmit"
        >
          Simpan Pengecualian
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  useCreateHolidayMutation,
  useCreateExemptionMutation,
} from '../../queries/useExceptions.js';
import { useBlockerOwnersQuery } from '../../queries/useBlockers.js';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'created'): void;
}>();

const exemptionKind = ref<'holiday' | 'exemption'>('holiday');
const targetUserId = ref<string>('');
const startDate = ref<string>('');
const endDate = ref<string>('');
const reason = ref<string>('');
const errorMessage = ref<string>('');

const { data: ownerOptions, isLoading: isLoadingOwners } = useBlockerOwnersQuery();

const createHolidayMutation = useCreateHolidayMutation();
const createExemptionMutation = useCreateExemptionMutation();

const isPending = computed(
  () => createHolidayMutation.isPending.value || createExemptionMutation.isPending.value,
);

const isSubmitValid = computed(() => {
  if (!startDate.value || !endDate.value || !reason.value.trim()) return false;
  if (exemptionKind.value === 'exemption' && !targetUserId.value) return false;
  return true;
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const today = new Date().toISOString().slice(0, 10);
      startDate.value = today;
      endDate.value = today;
      reason.value = '';
      targetUserId.value = '';
      errorMessage.value = '';
    }
  },
);

async function handleSubmit() {
  if (!isSubmitValid.value) return;
  errorMessage.value = '';

  try {
    if (exemptionKind.value === 'holiday') {
      await createHolidayMutation.mutateAsync({
        startDate: startDate.value,
        endDate: endDate.value,
        reason: reason.value.trim(),
      });
    } else {
      await createExemptionMutation.mutateAsync({
        userId: targetUserId.value,
        startDate: startDate.value,
        endDate: endDate.value,
        reason: reason.value.trim(),
      });
    }
    emit('created');
    emit('update:modelValue', false);
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menyimpan pengecualian.';
  }
}
</script>
