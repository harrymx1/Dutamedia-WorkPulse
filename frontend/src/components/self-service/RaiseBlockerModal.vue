<template>
  <v-dialog v-model="isOpen" max-width="600px" persistent>
    <v-card class="rounded-lg">
      <v-card-item class="bg-error-lighten-5 border-b py-3">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-alert-octagon" color="error" class="mr-2" />
            <v-card-title class="text-subtitle-1 font-weight-bold text-error">
              {{ modalTitle }}
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
          v-if="commitmentId"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
          prepend-icon="mdi-link-variant"
          data-testid="commitment-context-alert"
        >
          <div class="text-caption text-medium-emphasis">Menautkan ke Komitmen:</div>
          <div class="font-weight-medium text-body-2">{{ commitmentDescription }}</div>
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
          <v-row density="compact">
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
                data-testid="blocker-type-select"
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
                data-testid="blocker-severity-select"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-icon
                        :icon="getSeverityValue(item) === 'Critical' ? 'mdi-alert' : 'mdi-circle-slice-8'"
                        :color="getSeverityColor(item)"
                        size="small"
                        class="mr-2"
                      />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-radio-group
            v-model="ownerNeededType"
            label="Pihak Berwenang / Jalur Eskalasi (Owner Needed) *"
            class="mt-2 mb-1"
            data-testid="blocker-authority-type-radio"
          >
            <v-radio
              value="OrganizationalAuthority"
              label="Atasan Langsung (Organizational Authority)"
              color="primary"
            />
            <v-radio
              value="ProjectAuthority"
              label="Pemilik Wewenang Proyek (Project Authority)"
              color="primary"
            />
          </v-radio-group>

          <div
            v-if="ownerNeededType === 'OrganizationalAuthority'"
            class="text-caption text-medium-emphasis mb-3 px-1"
            data-testid="org-authority-hint"
          >
            Sistem akan menugaskan blocker secara otomatis ke atasan langsung (Direct Manager) Anda sesuai struktur organisasi aktif.
          </div>
          <div
            v-else
            class="text-caption text-medium-emphasis mb-2 px-1"
            data-testid="project-authority-hint"
          >
            Sistem akan menugaskan blocker ke Project Manager / PIC yang berwenang atas ruang lingkup pekerjaan ini.
          </div>

          <v-text-field
            v-if="ownerNeededType === 'ProjectAuthority'"
            v-model="relatedScopeReference"
            label="Referensi Ruang Lingkup Proyek (Scope Reference) *"
            placeholder="Contoh: PROJ-ALPHA, JIRA-102, atau Nama Inisiatif"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
            data-testid="blocker-scope-reference-input"
          />

          <v-textarea
            v-model="impact"
            label="Deskripsi Dampak & Rincian Hambatan *"
            placeholder="Jelaskan apa yang terhambat, mengapa terjadi, dan dampaknya terhadap target..."
            rows="3"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.minLength(5)]"
            class="mb-3"
            data-testid="blocker-impact-input"
          />

          <v-text-field
            v-model="expectedResolution"
            label="Target Tanggal Resolusi (Opsional)"
            type="date"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            data-testid="blocker-expected-resolution-input"
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
          data-testid="blocker-submit-button"
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
import { useCreateBlockerMutation } from '../../queries/useBlockers.js';
import type { BlockerType, BlockerSeverity, OwnerNeededType } from '../../types/daily-records.js';

const props = defineProps<{
  modelValue: boolean;
  commitmentId?: string;
  commitmentDescription?: string;
}>();

const modalTitle = computed(() => {
  return props.commitmentId ? 'Laporkan Blocker untuk Komitmen' : 'Raise Instant Blocker';
});

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
const ownerNeededType = ref<OwnerNeededType>('OrganizationalAuthority');
const relatedScopeReference = ref('');
const impact = ref('');
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

function getSeverityValue(item: any): string {
  return item?.raw?.value ?? item?.value ?? '';
}

function getSeverityColor(item: any): string {
  return item?.raw?.color ?? item?.color ?? 'grey';
}

const rules = {
  required: (v: string) => !!v || 'Field ini wajib diisi',
  minLength: (min: number) => (v: string) =>
    (v && v.trim().length >= min) || `Minimal ${min} karakter`,
};

const { mutateAsync: createBlocker, isPending } = useCreateBlockerMutation();

function closeModal() {
  isOpen.value = false;
  blockerType.value = 'Technical';
  severity.value = 'Medium';
  ownerNeededType.value = 'OrganizationalAuthority';
  relatedScopeReference.value = '';
  impact.value = '';
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
      impact: impact.value.trim(),
      ownerNeededType: ownerNeededType.value,
      relatedScopeReference:
        ownerNeededType.value === 'ProjectAuthority'
          ? relatedScopeReference.value.trim()
          : undefined,
      expectedResolution: expectedResolution.value ? expectedResolution.value : undefined,
      linkedCommitmentId: props.commitmentId || undefined,
    });
    emit('success');
    closeModal();
  } catch (err: any) {
    if (err?.response?.data?.message) {
      if (Array.isArray(err.response.data.message)) {
        errorMessage.value = err.response.data.message.join(', ');
      } else {
        errorMessage.value = err.response.data.message;
      }
    } else if (err?.message) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'Gagal mengajukan blocker.';
    }
  }
}
</script>
