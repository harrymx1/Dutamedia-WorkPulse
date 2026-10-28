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
          Pengaturan Parameter Kebijakan Tata Tertib Kerja &amp; Batasan Sistem (SAD §5.9, §10.9)
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

    <!-- Policy Cards Grid (11 Kategori Resmi Backend) -->
    <v-row v-else>
      <v-col
        v-for="cat in categoryDefinitions"
        :key="cat.key"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          variant="outlined"
          class="pa-5 rounded-lg border-subtle bg-surface h-100 d-flex flex-column justify-space-between"
          :data-testid="`policy-card-${cat.key}`"
        >
          <div>
            <!-- Header Card -->
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <div class="d-flex align-center ga-2">
                <v-icon :icon="cat.icon" color="primary" size="22" />
                <h2 class="text-subtitle-1 font-weight-bold">{{ cat.title }}</h2>
              </div>
              <v-chip
                v-if="getPolicyForCategory(cat.key)"
                size="x-small"
                color="primary"
                variant="flat"
                class="font-weight-bold"
              >
                Aktif
              </v-chip>
              <v-chip
                v-else
                size="x-small"
                color="grey"
                variant="tonal"
                class="font-weight-bold"
              >
                Default
              </v-chip>
            </div>

            <p class="text-caption text-medium-emphasis mb-3">
              {{ cat.description }}
            </p>

            <!-- Read-only Banner for Special Rules -->
            <v-alert
              v-if="cat.isReadOnly"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-3 text-caption"
            >
              {{ cat.readOnlyReason }}
            </v-alert>

            <!-- Parameters Preview -->
            <div class="pa-3 rounded border bg-surface-elevated mb-3">
              <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2 d-flex justify-space-between">
                <span>Nilai Konfigurasi Aktif:</span>
                <span v-if="!getPolicyForCategory(cat.key)" class="text-caption text-disabled">(Default Sistem)</span>
              </div>
              <div class="d-flex flex-column ga-1 text-body-2 font-mono">
                <template v-if="getActiveValueKeys(cat.key).length > 0">
                  <div
                    v-for="k in getActiveValueKeys(cat.key)"
                    :key="k"
                    class="d-flex justify-space-between py-1 border-b"
                  >
                    <span class="text-medium-emphasis">{{ k }}:</span>
                    <strong class="text-high-emphasis">{{ JSON.stringify(getActiveValue(cat.key)[k]) }}</strong>
                  </div>
                </template>
                <div v-else class="text-caption text-medium-emphasis py-1 font-italic">
                  Tidak ada parameter konfigurasi dinamis.
                </div>
              </div>
            </div>

            <!-- Meta Tanggal Berlaku -->
            <div class="text-caption text-medium-emphasis mb-3">
              <template v-if="getPolicyForCategory(cat.key)">
                Berlaku Sejak: <strong>{{ formatDate(getPolicyForCategory(cat.key)?.effectiveDate) }}</strong>
              </template>
              <template v-else>
                Status: <strong>Menggunakan Default Konfigurasi Awal</strong>
              </template>
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
              v-if="!cat.isReadOnly"
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-pencil-outline"
              class="text-none font-weight-bold"
              :data-testid="`btn-edit-${cat.key}`"
              @click="openEdit(cat.key)"
            >
              Perbarui Kebijakan
            </v-btn>
            <v-tooltip v-else text="Kebijakan ini dikunci di level arsitektur produk" location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="grey"
                    prepend-icon="mdi-lock-outline"
                    class="text-none"
                    disabled
                  >
                    Terkunci (ADR)
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Riwayat Versi -->
    <PolicyVersionHistory
      v-if="selectedHistoryCategory"
      v-model="showHistoryModal"
      :category="selectedHistoryCategory"
    />

    <!-- Dialog Edit Kebijakan -->
    <v-dialog v-model="showEditModal" max-width="540" persistent>
      <v-card v-if="selectedEditCategory" class="pa-2 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold">
          Perbarui Kebijakan: {{ getCategoryMeta(selectedEditCategory)?.title }}
        </v-card-title>
        <v-card-subtitle class="text-caption text-medium-emphasis">
          Menerbitkan versi kebijakan baru dengan effective-dating (BR-15, SAD §10.9)
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
            v-model="editValueJson"
            label="Nilai Kebijakan (Format JSON)"
            variant="outlined"
            rows="6"
            class="font-mono mb-3"
            :rules="[validateJson]"
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
            data-testid="btn-submit-policy"
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
  isReadOnly?: boolean;
  readOnlyReason?: string;
}

/**
 * 11 Kategori resmi sesuai backend enum PolicyCategory & DEFAULT_POLICY_VALUES (SAD §5.9, §10.9).
 */
const categoryDefinitions: CategoryDefinition[] = [
  {
    key: 'Cutoff',
    title: 'Batas Waktu Pengisian (Cutoff)',
    description: 'Batas waktu penyerahan Morning Commitment dan EOD Check-in tepat waktu (FR-31, SAD §9.2).',
    icon: 'mdi-clock-outline',
  },
  {
    key: 'GracePeriod',
    title: 'Toleransi Keterlambatan (Grace Period)',
    description: 'Durasi toleransi menit keterlambatan pengisian Morning dan EOD sebelum berstatus Late (SAD §9.2).',
    icon: 'mdi-timer-sand',
  },
  {
    key: 'WorkdayCalendar',
    title: 'Kalender Hari Kerja (Workday Calendar)',
    description: 'Hari kerja aktif (1=Senin s.d. 5=Jumat) yang mewajibkan akuntabilitas (FR-32).',
    icon: 'mdi-calendar-week',
  },
  {
    key: 'EscalationThreshold',
    title: 'Ambang Eskalasi Blocker (Escalation Threshold)',
    description: 'Batas waktu blocker tidak di-acknowledge sebelum eskalasi otomatis dipicu (FR-33, SAD §9.2).',
    icon: 'mdi-alert-octagon-outline',
  },
  {
    key: 'CoachingFollowUpPeriod',
    title: 'Periode Evaluasi Kepatuhan (Coaching Follow-Up Period)',
    description: 'Jendela evaluasi hari riwayat kepatuhan (FR-29). Ambang batas deteksi pola dikunci pada 3 kejadian sesuai ADR-008.',
    icon: 'mdi-account-supervisor-outline',
  },
  {
    key: 'RetentionPeriod',
    title: 'Retensi Data & Berkas (Retention Period)',
    description: 'Masa simpan berkas cadangan database (hari) dan tautan ekspor audit (menit) (FR-34).',
    icon: 'mdi-database-clock-outline',
  },
  {
    key: 'ExemptionRule',
    title: 'Aturan Pengecualian Akuntabilitas (Exemption Rule)',
    description: 'Pengecualian kewajiban pengisian (Cuti/Sakit/Libur Nasional). Dikelola otomatis via leave flow (ADR-005, SAD §23).',
    icon: 'mdi-shield-check-outline',
    isReadOnly: true,
    readOnlyReason: 'Aturan pengecualian dikelola otomatis melalui modul pengajuan cuti dan kalender libur (ADR-005).',
  },
  {
    key: 'ObjectionWindowDuration',
    title: 'Masa Sanggah Koreksi (Objection Window Duration)',
    description: 'Durasi jam bagi supervisor untuk menyanggah permohonan koreksi sebelum auto-approve (BR-05).',
    icon: 'mdi-timer-outline',
  },
  {
    key: 'MinorMaterialThreshold',
    title: 'Ambang Koreksi Material (Minor vs Material)',
    description: 'Batas selisih kata perubahan komitmen yang membedakan koreksi minor vs material (FR-07, BR-03).',
    icon: 'mdi-file-compare',
  },
  {
    key: 'ParticipationRule',
    title: 'Aturan Partisipasi Karyawan (Participation Rule)',
    description: 'Kriteria peran wajib lapor (FR-35). Batasan 1-3 komitmen harian dikunci pada produk (ADR-006, BR-01).',
    icon: 'mdi-account-group-outline',
    isReadOnly: true,
    readOnlyReason: 'Batasan kuota 1-3 komitmen harian dikunci sebagai konstanta produk (ADR-006, BR-01).',
  },
  {
    key: 'ReminderThreshold',
    title: 'Ambang Pengingat Otomatis (Reminder Threshold)',
    description: 'Jadwal jam pengingat sebelum batas masa sanggah berakhir dan peringatan permohonan cuti pending.',
    icon: 'mdi-bell-ring-outline',
  },
];

/**
 * Nilai baku standar dari backend DEFAULT_POLICY_VALUES sebagai acuan tampilan fallback.
 */
const DEFAULT_VALUES: Record<PolicyCategory, Record<string, any>> = {
  Cutoff: {
    morningOnTimeDeadline: '09:00',
    eodOnTimeDeadline: '18:00',
  },
  GracePeriod: {
    morningGraceMinutes: 30,
    eodGraceMinutes: 30,
  },
  WorkdayCalendar: {
    workDays: [1, 2, 3, 4, 5],
  },
  EscalationThreshold: {
    unacknowledgedThresholdHours: 2,
  },
  CoachingFollowUpPeriod: {
    coachingWindowDays: 14,
  },
  RetentionPeriod: {
    backupRetentionDays: 14,
    exportRetentionMinutes: 15,
  },
  ExemptionRule: {},
  ObjectionWindowDuration: {
    durationHours: 24,
  },
  MinorMaterialThreshold: {
    wordsChangedThreshold: 10,
  },
  ParticipationRule: {},
  ReminderThreshold: {
    objectionWindowReminderHours: 2,
    leavePendingReminderHours: 24,
  },
};

const { data: policies, isLoading, refetch } = usePoliciesQuery();
const createPolicyMutation = useCreatePolicyMutation();

const showHistoryModal = ref<boolean>(false);
const selectedHistoryCategory = ref<PolicyCategory | null>(null);

const showEditModal = ref<boolean>(false);
const selectedEditCategory = ref<PolicyCategory | null>(null);
const editEffectiveDate = ref<string>('');
const editValueJson = ref<string>('');
const editErrorMessage = ref<string>('');

const isSubmittingEdit = createPolicyMutation.isPending;

function getCategoryMeta(cat: PolicyCategory): CategoryDefinition | undefined {
  return categoryDefinitions.find((c) => c.key === cat);
}

function getPolicyForCategory(cat: PolicyCategory): PolicyItem | undefined {
  return policies.value?.find((p) => p.category === cat);
}

function getActiveValue(cat: PolicyCategory): Record<string, any> {
  const policy = getPolicyForCategory(cat);
  if (policy && policy.value && typeof policy.value === 'object') {
    return policy.value;
  }
  return DEFAULT_VALUES[cat] || {};
}

function getActiveValueKeys(cat: PolicyCategory): string[] {
  const val = getActiveValue(cat);
  return Object.keys(val);
}

function openHistory(cat: PolicyCategory) {
  selectedHistoryCategory.value = cat;
  showHistoryModal.value = true;
}

function openEdit(cat: PolicyCategory) {
  selectedEditCategory.value = cat;
  const current = getPolicyForCategory(cat);
  editEffectiveDate.value = new Date().toISOString().slice(0, 10);
  editValueJson.value = current?.value
    ? JSON.stringify(current.value, null, 2)
    : JSON.stringify(DEFAULT_VALUES[cat] || {}, null, 2);
  editErrorMessage.value = '';
  showEditModal.value = true;
}

function validateJson(val: string): boolean | string {
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return 'Format nilai kebijakan harus berupa objek JSON ({ ... })';
    }
    return true;
  } catch {
    return 'Format nilai kebijakan harus merupakan string JSON yang valid';
  }
}

async function submitPolicyEdit() {
  if (!selectedEditCategory.value) return;
  editErrorMessage.value = '';

  try {
    const parsedVal = JSON.parse(editValueJson.value);
    await createPolicyMutation.mutateAsync({
      category: selectedEditCategory.value,
      effectiveDate: editEffectiveDate.value,
      value: parsedVal,
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
