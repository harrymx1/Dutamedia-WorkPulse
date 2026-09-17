<template>
  <v-dialog
    :model-value="modelValue"
    max-width="540"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-note-edit-outline" color="primary" />
          <span class="text-h6 font-weight-bold">Tambah Catatan Manajerial</span>
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
        Catatan pembinaan atau pengakuan untuk <strong>{{ targetUserName }}</strong> (SAD §10.7, §15.1)
      </v-card-subtitle>

      <v-card-text class="pt-4">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
          <!-- Kategori Catatan -->
          <v-select
            v-model="category"
            label="Kategori Catatan"
            :items="categoryOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <!-- Visibilitas Catatan -->
          <v-select
            v-model="visibility"
            label="Visibilitas"
            :items="visibilityOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hint="Private: hanya manajer &amp; HRGA. Dibagikan: karyawan target dapat membaca di laporan review."
            persistent-hint
            class="mb-4"
          />

          <!-- Isi Catatan -->
          <v-textarea
            v-model="note"
            label="Isi Catatan Pembinaan / Evaluasi"
            placeholder="Tuliskan umpan balik objektif, hasil observasi, atau rencana aksi..."
            variant="outlined"
            rows="4"
            auto-grow
            counter="1000"
            :rules="[
              (v: string) => !!v || 'Isi catatan wajib diisi',
              (v: string) => (v && v.length >= 5) || 'Catatan minimal 5 karakter',
            ]"
            class="mb-2"
          />
        </v-form>

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
          :disabled="!isFormValid || !note.trim()"
          @click="handleSubmit"
        >
          Simpan Catatan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCreateManagerNoteMutation } from '../../queries/useManagerNotes.js';
import type { ManagerNoteCategory, ManagerNoteVisibility } from '../../types/management.js';

interface Props {
  modelValue: boolean;
  targetUserId: string;
  targetUserName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'saved'): void;
}>();

const isFormValid = ref<boolean>(false);
const category = ref<ManagerNoteCategory>('Coaching');
const visibility = ref<ManagerNoteVisibility>('SharedWithEmployee');
const note = ref<string>('');
const errorMessage = ref<string>('');

const categoryOptions = [
  { title: 'Pembinaan (Coaching)', value: 'Coaching' },
  { title: 'Apresiasi (Recognition)', value: 'Recognition' },
  { title: 'Korektif (Corrective)', value: 'Corrective' },
  { title: 'Umum (General)', value: 'General' },
];

const visibilityOptions = [
  { title: 'Dibagikan dengan Karyawan (Shared)', value: 'SharedWithEmployee' },
  { title: 'Hanya Manajer & HRGA (Private)', value: 'PrivateToManagers' },
];

const { mutateAsync: createNote, isPending } = useCreateManagerNoteMutation();

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      note.value = '';
      errorMessage.value = '';
    }
  },
);

async function handleSubmit() {
  if (!props.targetUserId || !note.value.trim()) return;

  try {
    errorMessage.value = '';
    await createNote({
      targetUserId: props.targetUserId,
      note: note.value.trim(),
      category: category.value,
      visibility: visibility.value,
    });
    emit('saved');
    emit('update:modelValue', false);
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal menyimpan catatan manajerial.';
  }
}
</script>
