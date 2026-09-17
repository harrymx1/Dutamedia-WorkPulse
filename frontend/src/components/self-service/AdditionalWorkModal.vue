<template>
  <v-dialog v-model="isOpen" max-width="560px" persistent>
    <v-card class="rounded-lg">
      <v-card-item class="bg-surface-variant border-b py-3">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-briefcase-plus" color="primary" class="mr-2" />
            <v-card-title class="text-subtitle-1 font-weight-bold">
              Add Additional Work
            </v-card-title>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeModal" />
        </div>
      </v-card-item>

      <v-card-text class="pt-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Pekerjaan tambahan yang muncul di luar perencanaan morning check-in. Pekerjaan ini akan mendapatkan bobot tampilan yang setara pada evaluasi EOD.
        </p>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-textarea
            v-model="description"
            label="Deskripsi Pekerjaan Tambahan *"
            placeholder="Contoh: Investigasi bug produksi login timeout pada server staging"
            rows="3"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
          />

          <v-select
            v-model="reason"
            label="Alasan Penambahan *"
            :items="reasonOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
          />

          <v-fade-transition>
            <v-text-field
              v-if="reason === 'NewlyAssigned'"
              v-model="assignedBy"
              label="Ditugaskan Oleh (Assigned By) *"
              placeholder="Nama atasan / person yang menugaskan"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-arrow-right"
              :rules="[rules.required]"
              class="mb-3"
            />
          </v-fade-transition>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="isPending" @click="closeModal">
          Batal
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="isPending"
          @click="handleSubmit"
        >
          Tambahkan Pekerjaan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdditionalWorkMutation } from '../../queries/useDailyRecords.js';
import type { AdditionalWorkReason } from '../../types/daily-records.js';

const props = defineProps<{
  modelValue: boolean;
  dailyRecordId: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'success'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const formRef = ref<any>(null);
const description = ref('');
const reason = ref<AdditionalWorkReason>('NewlyAssigned');
const assignedBy = ref('');
const errorMessage = ref('');

const reasonOptions = [
  { title: 'Newly Assigned (Ditugaskan Baru)', value: 'NewlyAssigned' },
  { title: 'Missed in Planning (Terlewat Saat Planning)', value: 'MissedInPlanning' },
  { title: 'Priority Change (Perubahan Prioritas)', value: 'PriorityChange' },
  { title: 'Operational Incident (Insiden Operasional)', value: 'OperationalIncident' },
  { title: 'Other (Lainnya)', value: 'Other' },
];

const rules = {
  required: (v: string) => !!v || 'Field ini wajib diisi',
};

const { mutateAsync: createAdditionalWork, isPending } = useAdditionalWorkMutation();

function closeModal() {
  isOpen.value = false;
  description.value = '';
  reason.value = 'NewlyAssigned';
  assignedBy.value = '';
  errorMessage.value = '';
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (reason.value === 'NewlyAssigned' && !assignedBy.value.trim()) {
    errorMessage.value = 'Field "Ditugaskan Oleh" wajib diisi untuk penugasan baru.';
    return;
  }

  errorMessage.value = '';

  try {
    await createAdditionalWork({
      dailyRecordId: props.dailyRecordId,
      description: description.value.trim(),
      reason: reason.value,
      assignedBy: reason.value === 'NewlyAssigned' ? assignedBy.value.trim() : undefined,
    });
    emit('success');
    closeModal();
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal menambahkan pekerjaan tambahan.';
  }
}
</script>
