<template>
  <v-dialog v-model="isOpen" max-width="600px" persistent>
    <v-card class="rounded-lg">
      <v-card-item class="bg-error-lighten-5 border-b py-3">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-alert-octagon" color="error" class="mr-2" />
            <v-card-title class="text-subtitle-1 font-weight-bold text-error">
              Raise Instant Blocker
            </v-card-title>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeModal" />
        </div>
      </v-card-item>

      <v-card-text class="pt-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Ajukan blocker operasional atau hambatan kritis secara langsung. Blocker akan memicu eskalasi notifikasi ke pihak pemilik wewenang yang dipilih.
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
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="blockerType"
                label="Tipe Blocker *"
                :items="typeOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="severity"
                label="Tingkat Keparahan (Severity) *"
                :items="severityOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-icon
                        :icon="item.raw.value === 'Critical' ? 'mdi-alert' : 'mdi-circle-slice-8'"
                        :color="item.raw.color"
                        size="small"
                        class="mr-2"
                      />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-autocomplete
            v-model="targetOwnerUserId"
            label="Pemilik Wewenang Tindak Lanjut (Owner Needed) *"
            :items="ownerOptions"
            item-title="fullName"
            item-value="id"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-search"
            :loading="isLoadingOwners"
            :rules="[rules.required]"
            class="mt-2 mb-3"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :subtitle="item.raw.email">
                <template #append>
                  <v-chip size="x-small" variant="tonal" color="primary">
                    {{ item.raw.role || 'User' }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-textarea
            v-model="impactDescription"
            label="Deskripsi Dampak & Rincian Hambatan *"
            placeholder="Jelaskan apa yang terhambat, mengapa terjadi, dan dampaknya terhadap target..."
            rows="3"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
          />

          <v-text-field
            v-model="expectedResolution"
            label="Ekspektasi Solusi / Bantuan yang Diharapkan (Opsional)"
            placeholder="Contoh: Approval akses VPN staging dari tim IT Security"
            variant="outlined"
            density="comfortable"
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
          color="error"
          variant="elevated"
          :loading="isPending"
          prepend-icon="mdi-send"
          @click="handleSubmit"
        >
          Kirim Blocker
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCreateBlockerMutation, useBlockerOwnersQuery } from '../../queries/useBlockers.js';
import type { BlockerType, BlockerSeverity } from '../../types/daily-records.js';

const props = defineProps<{
  modelValue: boolean;
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
const blockerType = ref<BlockerType>('Technical');
const severity = ref<BlockerSeverity>('Medium');
const targetOwnerUserId = ref('');
const impactDescription = ref('');
const expectedResolution = ref('');
const errorMessage = ref('');

const typeOptions = [
  { title: 'Technical (Kendala Teknis/Sistem)', value: 'Technical' },
  { title: 'Inter-Team Dependency (Ketergantungan Antar Tim)', value: 'InterTeamDependency' },
  { title: 'Resource or Access (Akses/Fasilitas)', value: 'ResourceOrAccess' },
  { title: 'Scope or Requirement (Kejelasan Spek/Ruang Lingkup)', value: 'ScopeOrRequirement' },
  { title: 'Vendor or Third-Party (Pihak Ketiga/Vendor)', value: 'VendorOrThirdParty' },
  { title: 'Other (Lainnya)', value: 'Other' },
];

const severityOptions = [
  { title: 'Low — Tidak memblokir langsung', value: 'Low', color: 'info' },
  { title: 'Medium — Mengurangi produktivitas', value: 'Medium', color: 'warning' },
  { title: 'High — Mengancam deliverable hari ini', value: 'High', color: 'orange' },
  { title: 'Critical — Terhenti total (Eskalasi Cepat)', value: 'Critical', color: 'error' },
];

const rules = {
  required: (v: string) => !!v || 'Field ini wajib diisi',
};

const { data: owners, isLoading: isLoadingOwners } = useBlockerOwnersQuery();
const ownerOptions = computed(() => owners.value || []);

const { mutateAsync: createBlocker, isPending } = useCreateBlockerMutation();

function closeModal() {
  isOpen.value = false;
  blockerType.value = 'Technical';
  severity.value = 'Medium';
  targetOwnerUserId.value = '';
  impactDescription.value = '';
  expectedResolution.value = '';
  errorMessage.value = '';
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  errorMessage.value = '';

  try {
    await createBlocker({
      type: blockerType.value,
      severity: severity.value,
      targetOwnerUserId: targetOwnerUserId.value,
      impactDescription: impactDescription.value.trim(),
      expectedResolution: expectedResolution.value.trim() || undefined,
    });
    emit('success');
    closeModal();
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal mengajukan blocker.';
  }
}
</script>
