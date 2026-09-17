<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="blocker" class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between pt-3 pb-1">
        <div class="d-flex align-center ga-2">
          <v-icon :icon="dialogIcon" :color="dialogColor" />
          <span class="text-h6 font-weight-bold">{{ dialogTitle }}</span>
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
        Deskripsi Blocker: <em>"{{ blocker.description }}"</em>
      </v-card-subtitle>

      <v-card-text class="pt-4">
        <!-- Aksi 1: Update Progress -->
        <div v-if="action === 'update'">
          <v-textarea
            v-model="progressSummary"
            label="Rangkuman Progres Penanganan"
            placeholder="Jelaskan langkah yang sudah diambil atau koordinasi yang sedang berjalan..."
            variant="outlined"
            rows="3"
            :rules="[(v: string) => !!v || 'Rangkuman progres wajib diisi']"
            class="mb-3"
          />
          <v-text-field
            v-model="targetResolutionDate"
            label="Estimasi Tanggal Resolusi (Opsional)"
            type="date"
            variant="outlined"
            density="comfortable"
          />
        </div>

        <!-- Aksi 2: Resolve atau Accept Risk -->
        <div v-else-if="action === 'resolve' || action === 'acceptRisk'">
          <v-alert
            v-if="action === 'acceptRisk'"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            Penerimaan risiko menandakan blocker diselesaikan dengan toleransi risiko operasional.
          </v-alert>
          <v-textarea
            v-model="rootCause"
            label="Akar Masalah (Root Cause)"
            placeholder="Jelaskan faktor penyebab utama terjadinya kendala/blocker ini..."
            variant="outlined"
            rows="2"
            :rules="[(v: string) => !!v || 'Akar masalah wajib diisi']"
            class="mb-3"
          />
          <v-textarea
            v-model="resolutionSummary"
            :label="action === 'resolve' ? 'Rangkuman Solusi / Penyelesaian' : 'Alasan Penerimaan Risiko & Mitigasi'"
            placeholder="Jelaskan solusi permanen atau tindakan mitigasi yang telah diterapkan..."
            variant="outlined"
            rows="3"
            :rules="[(v: string) => !!v || 'Rangkuman penyelesaian wajib diisi']"
          />
        </div>

        <!-- Aksi 3: Support Contribution -->
        <div v-else-if="action === 'support'">
          <v-textarea
            v-model="supportComment"
            label="Bantuan atau Komentar Kontribusi"
            placeholder="Tuliskan bantuan teknis, saran alternatif, atau sumber daya yang dapat Anda berikan..."
            variant="outlined"
            rows="3"
            :rules="[(v: string) => !!v || 'Komentar bantuan wajib diisi']"
          />
        </div>

        <!-- Aksi 4: Close atau Acknowledge Confirmation -->
        <div v-else-if="action === 'close'">
          <p class="text-body-2">
            Apakah Anda yakin kendala ini sudah tuntas dan ingin menutup (Close) blocker ini?
          </p>
        </div>

        <div v-else-if="action === 'acknowledge'">
          <p class="text-body-2">
            Dengan mengonfirmasi, Anda mengakui (Acknowledge) tanggung jawab penyelesaian kendala ini sebagai pemilik wewenang.
          </p>
        </div>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
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
          :color="dialogColor"
          variant="elevated"
          :loading="isPending"
          :disabled="!isSubmitEnabled"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { BlockerItem } from '../../types/management.js';
import {
  useAcknowledgeBlockerMutation,
  useUpdateBlockerProgressMutation,
  useResolveBlockerMutation,
  useAcceptRiskBlockerMutation,
  useCloseBlockerMutation,
  useSupportContributionMutation,
} from '../../queries/useBlockers.js';

type BlockerActionType = 'acknowledge' | 'update' | 'resolve' | 'acceptRisk' | 'close' | 'support';

interface Props {
  modelValue: boolean;
  blocker: BlockerItem | null;
  action: BlockerActionType;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'success'): void;
}>();

const progressSummary = ref<string>('');
const targetResolutionDate = ref<string>('');
const rootCause = ref<string>('');
const resolutionSummary = ref<string>('');
const supportComment = ref<string>('');
const errorMessage = ref<string>('');

const acknowledgeMutation = useAcknowledgeBlockerMutation();
const updateMutation = useUpdateBlockerProgressMutation();
const resolveMutation = useResolveBlockerMutation();
const acceptRiskMutation = useAcceptRiskBlockerMutation();
const closeMutation = useCloseBlockerMutation();
const supportMutation = useSupportContributionMutation();

const isPending = computed(() => {
  return (
    acknowledgeMutation.isPending.value ||
    updateMutation.isPending.value ||
    resolveMutation.isPending.value ||
    acceptRiskMutation.isPending.value ||
    closeMutation.isPending.value ||
    supportMutation.isPending.value
  );
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      progressSummary.value = '';
      targetResolutionDate.value = '';
      rootCause.value = '';
      resolutionSummary.value = '';
      supportComment.value = '';
      errorMessage.value = '';
    }
  },
);

const dialogTitle = computed(() => {
  switch (props.action) {
    case 'acknowledge':
      return 'Konfirmasi Penerimaan Tanggung Jawab';
    case 'update':
      return 'Perbarui Progres Blocker';
    case 'resolve':
      return 'Selesaikan Blocker';
    case 'acceptRisk':
      return 'Terima Risiko Blocker';
    case 'close':
      return 'Tutup Blocker Permanen';
    case 'support':
      return 'Beri Bantuan / Dukungan';
    default:
      return 'Tindakan Blocker';
  }
});

const dialogColor = computed(() => {
  switch (props.action) {
    case 'resolve':
    case 'close':
      return 'success';
    case 'acceptRisk':
      return 'warning';
    case 'update':
    case 'acknowledge':
    case 'support':
    default:
      return 'primary';
  }
});

const dialogIcon = computed(() => {
  switch (props.action) {
    case 'acknowledge':
      return 'mdi-handshake-outline';
    case 'update':
      return 'mdi-progress-clock';
    case 'resolve':
      return 'mdi-check-decagram';
    case 'acceptRisk':
      return 'mdi-alert-octagon-outline';
    case 'close':
      return 'mdi-lock-check';
    case 'support':
      return 'mdi-account-plus';
    default:
      return 'mdi-information';
  }
});

const submitLabel = computed(() => {
  switch (props.action) {
    case 'acknowledge':
      return 'Akui Tanggung Jawab';
    case 'update':
      return 'Simpan Progres';
    case 'resolve':
      return 'Selesaikan';
    case 'acceptRisk':
      return 'Konfirmasi Terima Risiko';
    case 'close':
      return 'Tutup Blocker';
    case 'support':
      return 'Kirim Bantuan';
    default:
      return 'Kirim';
  }
});

const isSubmitEnabled = computed(() => {
  if (!props.blocker) return false;
  switch (props.action) {
    case 'update':
      return !!progressSummary.value.trim();
    case 'resolve':
    case 'acceptRisk':
      return !!rootCause.value.trim() && !!resolutionSummary.value.trim();
    case 'support':
      return !!supportComment.value.trim();
    case 'acknowledge':
    case 'close':
      return true;
    default:
      return false;
  }
});

async function handleSubmit() {
  if (!props.blocker) return;
  errorMessage.value = '';

  try {
    switch (props.action) {
      case 'acknowledge':
        await acknowledgeMutation.mutateAsync(props.blocker.id);
        break;
      case 'update':
        await updateMutation.mutateAsync({
          id: props.blocker.id,
          payload: {
            progressSummary: progressSummary.value.trim(),
            targetResolutionDate: targetResolutionDate.value || undefined,
          },
        });
        break;
      case 'resolve':
        await resolveMutation.mutateAsync({
          id: props.blocker.id,
          payload: {
            rootCause: rootCause.value.trim(),
            resolutionSummary: resolutionSummary.value.trim(),
          },
        });
        break;
      case 'acceptRisk':
        await acceptRiskMutation.mutateAsync({
          id: props.blocker.id,
          payload: {
            rootCause: rootCause.value.trim(),
            resolutionSummary: resolutionSummary.value.trim(),
          },
        });
        break;
      case 'close':
        await closeMutation.mutateAsync(props.blocker.id);
        break;
      case 'support':
        await supportMutation.mutateAsync({
          id: props.blocker.id,
          payload: {
            comment: supportComment.value.trim(),
          },
        });
        break;
    }
    emit('success');
    emit('update:modelValue', false);
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memproses tindakan pada blocker.';
  }
}
</script>
