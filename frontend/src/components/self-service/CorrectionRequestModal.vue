<template>
  <v-dialog v-model="isOpen" max-width="580px" persistent>
    <v-card class="rounded-lg">
      <v-card-item class="bg-surface-variant border-b py-3">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-file-document-edit" color="primary" class="mr-2" />
            <v-card-title class="text-subtitle-1 font-weight-bold">
              Ajukan Koreksi Komitmen (Correction Request)
            </v-card-title>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeModal" />
        </div>
      </v-card-item>

      <v-card-text class="pt-4">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Baseline telah terkunci pasca Cut-Off. Perubahan komitmen akan diklasifikasikan secara otomatis oleh sistem sebagai Minor atau Material sesuai kebijakan kerja.
        </v-alert>

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
          <div class="mb-3">
            <label class="text-caption font-weight-medium text-medium-emphasis">
              Deskripsi Asli (Before — Read Only):
            </label>
            <v-sheet
              rounded="md"
              color="surface-variant"
              class="pa-3 text-body-2 border mt-1"
            >
              {{ currentDescription }}
            </v-sheet>
          </div>

          <v-textarea
            v-model="proposedDescription"
            label="Deskripsi Baru yang Diajukan (After) *"
            placeholder="Tuliskan deskripsi komitmen yang telah diperbaiki..."
            rows="3"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
          />

          <v-textarea
            v-model="reason"
            label="Alasan Koreksi *"
            placeholder="Jelaskan alasan perubahan target atau justifikasi koreksi..."
            rows="2"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-2"
          />
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
          Kirim Pengajuan Koreksi
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCorrectionRequestMutation } from '../../queries/useDailyRecords.js';

const props = defineProps<{
  modelValue: boolean;
  commitmentId: string;
  currentDescription: string;
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
const proposedDescription = ref('');
const reason = ref('');
const errorMessage = ref('');

const rules = {
  required: (v: string) => !!v || 'Field ini wajib diisi',
};

const { mutateAsync: requestCorrection, isPending } = useCorrectionRequestMutation();

function closeModal() {
  isOpen.value = false;
  proposedDescription.value = '';
  reason.value = '';
  errorMessage.value = '';
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  errorMessage.value = '';

  try {
    await requestCorrection({
      commitmentId: props.commitmentId,
      proposedDescription: proposedDescription.value.trim(),
      reason: reason.value.trim(),
    });
    emit('success');
    closeModal();
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal mengajukan koreksi komitmen.';
  }
}
</script>
