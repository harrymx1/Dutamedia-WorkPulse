<template>
  <v-dialog v-model="isOpen" max-width="560px" persistent>
    <v-card class="rounded-lg">
      <v-card-item class="bg-warning-lighten-5 border-b py-3">
        <div class="d-flex align-center">
          <v-icon icon="mdi-alert-decagram" color="warning" class="mr-2" size="24" />
          <v-card-title class="text-subtitle-1 font-weight-bold">
            Validasi Status Hari: Perbedaan Deteksi Sistem
          </v-card-title>
        </div>
      </v-card-item>

      <v-card-text class="pt-4">
        <p class="text-body-2 mb-4">
          Anda memilih status <strong class="text-uppercase">{{ chosenStatus }}</strong>, namun Status Suggestion Engine menyarankan status <strong class="text-uppercase text-warning">{{ suggestedStatus }}</strong> berdasarkan evaluasi deliverable dan blocker aktif hari ini.
        </p>

        <v-sheet rounded="md" color="surface-variant" class="pa-3 mb-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-medium">Pilihan Anda:</span>
            <v-chip size="small" :color="getStatusColor(chosenStatus)" variant="flat">
              {{ chosenStatus }}
            </v-chip>
          </div>
          <div class="d-flex align-center justify-space-between">
            <span class="text-caption font-weight-medium">Saran Sistem:</span>
            <v-chip size="small" :color="getStatusColor(suggestedStatus)" variant="flat">
              {{ suggestedStatus }}
            </v-chip>
          </div>
        </v-sheet>

        <p class="text-caption text-medium-emphasis mb-3">
          Silakan tentukan apakah Anda ingin mengikuti saran sistem atau mempertahankan pilihan Anda dengan memberikan alasan objektif:
        </p>

        <v-radio-group v-model="actionChoice" density="comfortable" class="mb-2">
          <v-radio
            :label="`Ubah status hari saya menjadi ${suggestedStatus} (Sesuai saran sistem)`"
            value="accept_suggested"
          />
          <v-radio
            :label="`Tetap gunakan status ${chosenStatus} (Override manual)`"
            value="override"
          />
        </v-radio-group>

        <v-expand-transition>
          <div v-if="actionChoice === 'override'">
            <v-textarea
              v-model="overrideReason"
              label="Alasan Mempertahankan Status (Override Reason) *"
              placeholder="Jelaskan pertimbangan konteks mengapa status tetap relevan..."
              rows="3"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              class="mt-2"
            />
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="handleCancel">
          Batal
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="actionChoice === 'override' && !overrideReason.trim()"
          @click="handleConfirm"
        >
          Konfirmasi & Submit EOD
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RiskLevel } from '../../types/daily-records.js';

const props = defineProps<{
  modelValue: boolean;
  chosenStatus: RiskLevel;
  suggestedStatus: RiskLevel;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm', payload: { finalStatus: RiskLevel; overrideReason?: string }): void;
  (e: 'cancel'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const actionChoice = ref<'accept_suggested' | 'override'>('accept_suggested');
const overrideReason = ref('');

const rules = {
  required: (v: string) => !!v || 'Alasan override wajib diisi',
};

function getStatusColor(status: RiskLevel): string {
  switch (status) {
    case 'GREEN':
      return 'success';
    case 'AMBER':
      return 'warning';
    case 'RED':
      return 'error';
    default:
      return 'grey';
  }
}

function handleCancel() {
  isOpen.value = false;
  overrideReason.value = '';
  actionChoice.value = 'accept_suggested';
  emit('cancel');
}

function handleConfirm() {
  if (actionChoice.value === 'accept_suggested') {
    emit('confirm', { finalStatus: props.suggestedStatus });
  } else {
    emit('confirm', {
      finalStatus: props.chosenStatus,
      overrideReason: overrideReason.value.trim(),
    });
  }
  isOpen.value = false;
  overrideReason.value = '';
}
</script>
