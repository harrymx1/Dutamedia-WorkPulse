<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <!-- Header Page -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-cog-outline" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Policy Settings</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Pengaturan Parameter Kebijakan Tata Tertib Kerja &amp; Batasan Sistem (SAD §10.9)
        </p>
      </div>

      <v-btn
        size="small"
        variant="text"
        icon="mdi-refresh"
        :loading="isLoading"
        @click="refetch"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 text-center">
      <v-progress-circular indeterminate color="primary" />
      <div class="text-caption text-medium-emphasis mt-2">Memuat parameter kebijakan...</div>
    </div>

    <!-- Policy Cards Grid (6 Kategori) -->
    <v-row v-else>
      <v-col
        v-for="cat in categoryDefinitions"
        :key="cat.key"
        cols="12"
        md="6"
      >
        <v-card variant="outlined" class="pa-5 rounded-lg border-subtle bg-surface h-100 d-flex flex-column justify-space-between">
          <div>
            <!-- Header Card -->
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <div class="d-flex align-center ga-2">
                <v-icon :icon="cat.icon" color="primary" size="22" />
                <h2 class="text-h6 font-weight-bold">{{ cat.title }}</h2>
              </div>
              <v-chip
                v-if="getPolicyForCategory(cat.key)"
                size="x-small"
                color="primary"
                variant="flat"
                class="font-weight-bold"
              >
                Versi {{ getPolicyForCategory(cat.key)?.versionNumber }}
              </v-chip>
            </div>

            <p class="text-caption text-medium-emphasis mb-4">
              {{ cat.description }}
            </p>

            <!-- Parameters Preview -->
            <div class="pa-3 rounded border bg-surface-elevated mb-4">
              <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">
                Nilai Parameter Aktif:
              </div>
              <div
                v-if="!getPolicyForCategory(cat.key)"
                class="text-caption text-medium-emphasis py-1"
              >
                Menggunakan parameter default sistem.
              </div>
              <div v-else class="d-flex flex-column ga-1 text-body-2 font-mono">
                <div
                  v-for="(val, k) in getPolicyForCategory(cat.key)?.parameters"
                  :key="k"
                  class="d-flex justify-space-between py-1 border-b"
                >
                  <span class="text-medium-emphasis">{{ k }}:</span>
                  <strong class="text-high-emphasis">{{ JSON.stringify(val) }}</strong>
                </div>
              </div>
            </div>

            <!-- Meta Tanggal Berlaku -->
            <div v-if="getPolicyForCategory(cat.key)" class="text-caption text-medium-emphasis mb-4">
              Tanggal Berlaku: <strong>{{ formatDate(getPolicyForCategory(cat.key)?.effectiveDate) }}</strong>
              <span v-if="getPolicyForCategory(cat.key)?.changeReason">
                | Alasan: "{{ getPolicyForCategory(cat.key)?.changeReason }}"
              </span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="d-flex align-center justify-space-between pt-3 border-t">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-history"
              class="text-none font-weight-bold"
              @click="openHistory(cat.key)"
            >
              Riwayat Versi
            </v-btn>

            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-pencil-outline"
              class="text-none font-weight-bold"
              @click="openEdit(cat.key)"
            >
              Perbarui Kebijakan
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <PolicyVersionHistory
      v-if="selectedHistoryCategory"
      v-model="showHistoryModal"
      :category="selectedHistoryCategory"
    />

    <!-- Dialog Edit Kebijakan -->
    <v-dialog v-model="showEditModal" max-width="540" persistent>
      <v-card v-if="selectedEditCategory" class="pa-2 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold">
          Perbarui Kebijakan ({{ selectedEditCategory }})
        </v-card-title>
        <v-card-subtitle class="text-caption text-medium-emphasis">
          Menerbitkan versi kebijakan baru dengan audit trail (BR-15, SAD §10.9)
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-text-field
            v-model="editEffectiveDate"
            label="Tanggal Mulai Berlaku"
            type="date"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[(v: string) => !!v || 'Tanggal berlaku wajib diisi']"
          />

          <v-textarea
            v-model="editParametersJson"
            label="Parameter Kebijakan (Format JSON)"
            placeholder='{"cutoffHour": 9, "graceMinutes": 15}'
            variant="outlined"
            rows="5"
            class="font-mono mb-3"
            :rules="[validateJson]"
          />

          <v-textarea
            v-model="editChangeReason"
            label="Alasan Perubahan Kebijakan"
            placeholder="Jelaskan dasar pertimbangan manajemen atas perubahan aturan ini..."
            variant="outlined"
            rows="3"
            :rules="[(v: string) => !!v || 'Alasan perubahan wajib diisi']"
          />

          <v-alert
            v-if="editErrorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ editErrorMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" :disabled="isSubmittingEdit" @click="showEditModal = false">
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="isSubmittingEdit"
            @click="submitPolicyEdit"
          >
            Terbitkan Versi Baru
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PolicyVersionHistory from '../components/management/PolicyVersionHistory.vue';
import { usePoliciesQuery, useCreatePolicyMutation } from '../queries/usePolicies.js';
import type { PolicyCategory, PolicyItem } from '../types/management.js';

interface CategoryDefinition {
  key: PolicyCategory;
  title: string;
  description: string;
  icon: string;
}

const categoryDefinitions: CategoryDefinition[] = [
  {
    key: 'Schedule',
    title: 'Jadwal & Jam Kerja (Schedule)',
    description: 'Batas jam pengisian Morning Check-in dan rentang penyerahan EOD Check-in harian.',
    icon: 'mdi-clock-outline',
  },
  {
    key: 'SubmissionWindow',
    title: 'Jendela Pengisian (Submission Window)',
    description: 'Jangka waktu toleransi (grace period) sebelum pengisian ditandai sebagai terlambat.',
    icon: 'mdi-timer-sand',
  },
  {
    key: 'CommitmentBoundary',
    title: 'Batasan Komitmen (Commitment Boundary)',
    description: 'Batas jumlah minimum dan maksimum item komitmen kerja per hari untuk setiap karyawan.',
    icon: 'mdi-format-list-numbered',
  },
  {
    key: 'BlockerSLA',
    title: 'SLA Resolusi Blocker (Blocker SLA)',
    description: 'Batas waktu respon penerimaan (acknowledgment) dan penyelesaian blocker per tingkat keparahan.',
    icon: 'mdi-shield-alert-outline',
  },
  {
    key: 'ObjectionWindow',
    title: 'Masa Sanggah Koreksi (Objection Window)',
    description: 'Durasi waktu bagi supervisor untuk mengajukan keberatan sebelum permohonan koreksi disetujui otomatis.',
    icon: 'mdi-timer-outline',
  },
  {
    key: 'ComplianceThreshold',
    title: 'Ambang Batas Kepatuhan (Compliance Threshold)',
    description: 'Batas akumulasi hari tidak mengisi (NoSubmission) berturut-turut untuk memicu pembinaan formal.',
    icon: 'mdi-alert-decagram-outline',
  },
];

const { data: policies, isLoading, refetch } = usePoliciesQuery();
const createPolicyMutation = useCreatePolicyMutation();

const showHistoryModal = ref<boolean>(false);
const selectedHistoryCategory = ref<PolicyCategory | null>(null);

const showEditModal = ref<boolean>(false);
const selectedEditCategory = ref<PolicyCategory | null>(null);
const editEffectiveDate = ref<string>('');
const editParametersJson = ref<string>('');
const editChangeReason = ref<string>('');
const editErrorMessage = ref<string>('');

const isSubmittingEdit = createPolicyMutation.isPending;

function getPolicyForCategory(cat: PolicyCategory): PolicyItem | undefined {
  return policies.value?.find((p) => p.category === cat);
}

function openHistory(cat: PolicyCategory) {
  selectedHistoryCategory.value = cat;
  showHistoryModal.value = true;
}

function openEdit(cat: PolicyCategory) {
  selectedEditCategory.value = cat;
  const current = getPolicyForCategory(cat);
  editEffectiveDate.value = new Date().toISOString().slice(0, 10);
  editParametersJson.value = current
    ? JSON.stringify(current.parameters, null, 2)
    : '{\n  \n}';
  editChangeReason.value = '';
  editErrorMessage.value = '';
  showEditModal.value = true;
}

function validateJson(val: string): boolean | string {
  try {
    JSON.parse(val);
    return true;
  } catch {
    return 'Format parameter harus merupakan string JSON yang valid';
  }
}

async function submitPolicyEdit() {
  if (!selectedEditCategory.value) return;
  editErrorMessage.value = '';

  try {
    const parsedParams = JSON.parse(editParametersJson.value);
    await createPolicyMutation.mutateAsync({
      category: selectedEditCategory.value,
      effectiveDate: editEffectiveDate.value,
      parameters: parsedParams,
      changeReason: editChangeReason.value.trim(),
    });
    showEditModal.value = false;
    refetch();
  } catch (err: any) {
    editErrorMessage.value = err.message || 'Gagal memperbarui kebijakan.';
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.bg-surface-elevated {
  background-color: #eff5f2 !important;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>
