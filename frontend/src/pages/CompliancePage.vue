<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <!-- Header Page -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-shield-check" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Compliance &amp; Exemption</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Penegakan Kepatuhan Tata Tertib Kerja, Manajemen Pengecualian &amp; Rekam Pembinaan (HRGA)
        </p>
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn
          v-if="activeTab === 'exemptions'"
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateExemptionModal = true"
        >
          Tambah Pengecualian / Libur
        </v-btn>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <v-card variant="outlined" class="rounded-lg border-subtle mb-6">
      <v-tabs v-model="activeTab" color="primary" class="border-b">
        <v-tab value="queue" class="text-none font-weight-bold">
          <v-icon icon="mdi-alert-octagon-outline" class="mr-2" />
          Antrean Kepatuhan (Compliance Queue)
          <v-chip
            v-if="pendingEventsCount > 0"
            size="x-small"
            color="error"
            class="ml-2 font-weight-bold"
          >
            {{ pendingEventsCount }}
          </v-chip>
        </v-tab>
        <v-tab value="exemptions" class="text-none font-weight-bold">
          <v-icon icon="mdi-calendar-check-outline" class="mr-2" />
          Manajemen Pengecualian &amp; Libur
        </v-tab>
        <v-tab value="records" class="text-none font-weight-bold">
          <v-icon icon="mdi-file-document-outline" class="mr-2" />
          Rekam SP &amp; Pembinaan
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4 pa-md-6">
        <!-- ============================================================= -->
        <!-- TAB 1: COMPLIANCE QUEUE -->
        <!-- ============================================================= -->
        <div v-if="activeTab === 'queue'">
          <!-- Filter Bar -->
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-select
                v-model="eventTypeFilter"
                label="Jenis Pelanggaran"
                :items="eventTypeOptions"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 200px"
              />
              <v-select
                v-model="followUpFilter"
                label="Status Tindak Lanjut"
                :items="followUpOptions"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 180px"
              />
            </div>
            <v-btn
              size="small"
              variant="text"
              icon="mdi-refresh"
              :loading="isFetchingEvents"
              @click="refetchEvents"
            />
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingEvents" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat antrean kepatuhan...</div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredEvents.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-check-circle-outline" color="success" size="48" class="mb-2" />
            <div class="font-weight-bold">Antrean Bersih</div>
            <div class="text-caption">Tidak ada insiden kepatuhan atau pelanggaran yang memerlukan tindak lanjut.</div>
          </div>

          <!-- Events List -->
          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="evt in filteredEvents"
              :key="evt.id"
              variant="outlined"
              :class="[
                'pa-4 rounded-lg border-subtle',
                evt.eventType === 'EscalatedFormalProcess'
                  ? 'border-red-strong bg-red-lighten-5'
                  : evt.eventType === 'PatternFlag'
                  ? 'border-amber-subtle bg-amber-lighten-5'
                  : 'bg-surface'
              ]"
            >
              <div class="d-flex align-start justify-space-between flex-wrap ga-3">
                <div class="d-flex align-start ga-3">
                  <v-avatar color="primary" size="36" class="text-caption font-weight-bold text-white mt-1">
                    {{ getInitials(evt.userName || evt.userEmail || 'User') }}
                  </v-avatar>
                  <div>
                    <div class="d-flex align-center flex-wrap ga-2 mb-1">
                      <span class="text-subtitle-2 font-weight-bold">{{ evt.userName || evt.userEmail }}</span>
                      <span class="text-caption text-medium-emphasis font-weight-medium">({{ evt.userFunction || 'Fungsi' }})</span>
                      <v-chip
                        size="x-small"
                        :color="getEventTypeChipColor(evt.eventType)"
                        class="font-weight-bold text-uppercase"
                      >
                        {{ getEventTypeLabel(evt.eventType) }}
                      </v-chip>
                      <v-chip size="x-small" variant="outlined">
                        Tindak Lanjut: {{ evt.followUpStatus }}
                      </v-chip>
                    </div>

                    <div class="text-caption text-medium-emphasis mb-2">
                      Tanggal Insiden: <strong>{{ formatDate(evt.eventDate) }}</strong> |
                      Tercatat pada: {{ formatDateTime(evt.createdAt) }}
                    </div>

                    <div class="text-body-2 font-weight-medium">
                      {{ getEventDescription(evt) }}
                    </div>
                  </div>
                </div>

                <!-- Action Buttons Sesuai State Machine BR-05 & BR-06 -->
                <div class="d-flex align-center flex-wrap ga-2">
                  <!-- Bina (Coaching) untuk PatternFlag -->
                  <v-btn
                    v-if="evt.eventType === 'PatternFlag' || evt.followUpStatus === 'Pending'"
                    size="small"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-account-voice"
                    @click="openCoachAction(evt)"
                  >
                    Bina (Coaching)
                  </v-btn>

                  <!-- Catat SP (Recorded Warning) -->
                  <v-btn
                    v-if="evt.eventType === 'PatternFlag' || evt.eventType === 'Coaching'"
                    size="small"
                    color="warning"
                    variant="tonal"
                    prepend-icon="mdi-file-alert"
                    @click="openRecordWarningAction(evt)"
                  >
                    Catat SP (Warning)
                  </v-btn>

                  <!-- Eskalasi Formal -->
                  <v-btn
                    v-if="evt.eventType === 'RecordedWarning'"
                    size="small"
                    color="error"
                    variant="elevated"
                    prepend-icon="mdi-gavel"
                    @click="openEscalateFormalAction(evt)"
                  >
                    Eskalasi Formal
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 2: EXEMPTION MANAGEMENT -->
        <!-- ============================================================= -->
        <div v-else-if="activeTab === 'exemptions'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <h2 class="text-subtitle-1 font-weight-bold">Daftar Hari Libur &amp; Pengecualian Jadwal</h2>
            <v-btn
              size="small"
              variant="text"
              icon="mdi-refresh"
              :loading="isFetchingExceptions"
              @click="refetchExceptions"
            />
          </div>

          <div v-if="isLoadingExceptions" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat daftar pengecualian...</div>
          </div>

          <div
            v-else-if="exceptionsList.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-calendar-blank-outline" size="48" class="mb-2" />
            <div>Belum ada jadwal hari libur atau pengecualian yang tercatat.</div>
          </div>

          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="exc in exceptionsList"
              :key="exc.id"
              variant="outlined"
              class="pa-4 rounded-lg border-subtle bg-surface"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div>
                  <div class="d-flex align-center ga-2 mb-1">
                    <span class="text-subtitle-2 font-weight-bold">{{ exc.reason }}</span>
                    <v-chip size="x-small" color="primary" class="font-weight-bold">
                      {{ exc.type === 'CompanyHoliday' ? 'Libur Perusahaan/Nasional' : 'Pengecualian Individual' }}
                    </v-chip>
                    <v-chip size="x-small" :color="exc.status === 'Approved' ? 'success' : 'warning'" variant="tonal">
                      {{ exc.status }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Periode: <strong>{{ formatDate(exc.startDate) }} s.d. {{ formatDate(exc.endDate) }}</strong>
                    <span v-if="exc.userName"> | Karyawan: <strong>{{ exc.userName }}</strong></span>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 3: COACHING & WARNING RECORDS -->
        <!-- ============================================================= -->
        <div v-else-if="activeTab === 'records'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <h2 class="text-subtitle-1 font-weight-bold">Arsip Riwayat Pembinaan &amp; Surat Peringatan (SP)</h2>
            <v-btn
              size="small"
              variant="text"
              icon="mdi-refresh"
              :loading="isFetchingEvents"
              @click="refetchEvents"
            />
          </div>

          <div
            v-if="coachingAndWarningRecords.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-folder-open-outline" size="48" class="mb-2" />
            <div>Belum ada riwayat pembinaan atau surat peringatan tercatat.</div>
          </div>

          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="rec in coachingAndWarningRecords"
              :key="rec.id"
              variant="outlined"
              class="pa-4 rounded-lg border-subtle bg-surface"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
                <div class="d-flex align-center ga-2">
                  <v-chip
                    size="x-small"
                    :color="getEventTypeChipColor(rec.eventType)"
                    class="font-weight-bold text-uppercase"
                  >
                    {{ getEventTypeLabel(rec.eventType) }}
                  </v-chip>
                  <span class="text-subtitle-2 font-weight-bold">{{ rec.userName || 'Karyawan' }}</span>
                </div>
                <span class="text-caption text-medium-emphasis">{{ formatDateTime(rec.createdAt) }}</span>
              </div>
              <div class="text-body-2">
                {{ getEventDescription(rec) }}
              </div>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialogs -->
    <CreateExemptionModal
      v-model="showCreateExemptionModal"
      @created="refetchExceptions"
    />

    <!-- Dialog Aksi Pembinaan / Warning / Eskalasi -->
    <v-dialog v-model="showActionDialog" max-width="520" persistent>
      <v-card v-if="selectedEvent" class="pa-2 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold">{{ actionDialogTitle }}</v-card-title>
        <v-card-subtitle class="text-caption text-medium-emphasis">
          Karyawan: <strong>{{ selectedEvent.userName }}</strong>
        </v-card-subtitle>
        <v-card-text class="pt-3">
          <!-- Form Coaching -->
          <div v-if="currentActionType === 'coach'">
            <v-textarea
              v-model="actionNotes"
              label="Catatan Pembinaan (Coaching Notes)"
              placeholder="Tuliskan materi pembinaan dan komitmen perbaikan karyawan..."
              variant="outlined"
              rows="4"
              :rules="[(v: string) => !!v || 'Catatan pembinaan wajib diisi']"
            />
          </div>

          <!-- Form Record Warning -->
          <div v-else-if="currentActionType === 'warning'">
            <v-text-field
              v-model="warningLetterRef"
              label="Nomor Surat Peringatan (Ref SP)"
              placeholder="Contoh: SP/HRGA/2026/09/012"
              variant="outlined"
              density="comfortable"
              :rules="[(v: string) => !!v || 'Nomor referensi SP wajib diisi']"
              class="mb-3"
            />
            <v-textarea
              v-model="actionNotes"
              label="Keterangan Pelanggaran &amp; Konsekuensi"
              variant="outlined"
              rows="3"
            />
          </div>

          <!-- Form Escalate Formal -->
          <div v-else-if="currentActionType === 'escalate'">
            <v-text-field
              v-model="externalCaseRef"
              label="Nomor Berkas Kasus Formal Eksternal"
              placeholder="Contoh: FORMAL-CASE-2026-088"
              variant="outlined"
              density="comfortable"
              :rules="[(v: string) => !!v || 'Nomor kasus formal wajib diisi']"
              class="mb-3"
            />
            <v-textarea
              v-model="actionNotes"
              label="Catatan Eskalasi Kasus Formal"
              variant="outlined"
              rows="3"
            />
          </div>

          <v-alert
            v-if="actionErrorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ actionErrorMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" :disabled="isSubmittingAction" @click="showActionDialog = false">
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="isSubmittingAction"
            @click="submitComplianceAction"
          >
            Simpan Tindakan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CreateExemptionModal from '../components/management/CreateExemptionModal.vue';
import {
  useComplianceEventsQuery,
  useCoachMutation,
  useRecordWarningMutation,
  useEscalateFormalMutation,
} from '../queries/useCompliance.js';
import { useExceptionsQuery } from '../queries/useExceptions.js';
import type { ComplianceEventItem } from '../types/management.js';

const activeTab = ref<'queue' | 'exemptions' | 'records'>('queue');
const showCreateExemptionModal = ref<boolean>(false);

// Filters
const eventTypeFilter = ref<string>('ALL');
const followUpFilter = ref<string>('ALL');

const eventTypeOptions = [
  { title: 'Semua Jenis Pelanggaran', value: 'ALL' },
  { title: 'Pola Pelanggaran (PatternFlag)', value: 'PatternFlag' },
  { title: 'Tidak Mengisi (NoSubmission)', value: 'NoSubmission' },
  { title: 'Pembinaan (Coaching)', value: 'Coaching' },
  { title: 'Surat Peringatan (RecordedWarning)', value: 'RecordedWarning' },
  { title: 'Eskalasi Formal (EscalatedFormalProcess)', value: 'EscalatedFormalProcess' },
];

const followUpOptions = [
  { title: 'Semua Status Tindak Lanjut', value: 'ALL' },
  { title: 'Pending (Belum Ditindaklanjuti)', value: 'Pending' },
  { title: 'Sudah Dibina (Coached)', value: 'Coached' },
  { title: 'SP Diterbitkan (WarningIssued)', value: 'WarningIssued' },
  { title: 'Eskalasi Formal (FormalEscalated)', value: 'FormalEscalated' },
];

// Queries
const {
  data: eventsData,
  isLoading: isLoadingEvents,
  isFetching: isFetchingEvents,
  refetch: refetchEvents,
} = useComplianceEventsQuery();

const {
  data: exceptionsData,
  isLoading: isLoadingExceptions,
  isFetching: isFetchingExceptions,
  refetch: refetchExceptions,
} = useExceptionsQuery();

// Mutations
const coachMutation = useCoachMutation();
const warningMutation = useRecordWarningMutation();
const escalateMutation = useEscalateFormalMutation();

// Action Modal State
const showActionDialog = ref<boolean>(false);
const selectedEvent = ref<ComplianceEventItem | null>(null);
const currentActionType = ref<'coach' | 'warning' | 'escalate'>('coach');
const actionNotes = ref<string>('');
const warningLetterRef = ref<string>('');
const externalCaseRef = ref<string>('');
const actionErrorMessage = ref<string>('');

const isSubmittingAction = computed(
  () => coachMutation.isPending.value || warningMutation.isPending.value || escalateMutation.isPending.value,
);

const allEvents = computed(() => eventsData.value?.events || []);
const exceptionsList = computed(() => exceptionsData.value?.exceptions || []);

const pendingEventsCount = computed(
  () => allEvents.value.filter((e) => e.followUpStatus === 'Pending').length,
);

const filteredEvents = computed(() => {
  return allEvents.value.filter((e) => {
    if (eventTypeFilter.value !== 'ALL' && e.eventType !== eventTypeFilter.value) {
      return false;
    }
    if (followUpFilter.value !== 'ALL' && e.followUpStatus !== followUpFilter.value) {
      return false;
    }
    return true;
  });
});

const coachingAndWarningRecords = computed(() => {
  return allEvents.value.filter(
    (e) => e.eventType === 'Coaching' || e.eventType === 'RecordedWarning' || e.eventType === 'EscalatedFormalProcess',
  );
});

const actionDialogTitle = computed(() => {
  switch (currentActionType.value) {
    case 'coach':
      return 'Pembinaan Karyawan (Coaching)';
    case 'warning':
      return 'Catat Surat Peringatan (Record Warning)';
    case 'escalate':
      return 'Eskalasi Proses Formal Perusahaan';
    default:
      return 'Tindakan Kepatuhan';
  }
});

function openCoachAction(evt: ComplianceEventItem) {
  selectedEvent.value = evt;
  currentActionType.value = 'coach';
  actionNotes.value = '';
  actionErrorMessage.value = '';
  showActionDialog.value = true;
}

function openRecordWarningAction(evt: ComplianceEventItem) {
  selectedEvent.value = evt;
  currentActionType.value = 'warning';
  warningLetterRef.value = '';
  actionNotes.value = '';
  actionErrorMessage.value = '';
  showActionDialog.value = true;
}

function openEscalateFormalAction(evt: ComplianceEventItem) {
  selectedEvent.value = evt;
  currentActionType.value = 'escalate';
  externalCaseRef.value = '';
  actionNotes.value = '';
  actionErrorMessage.value = '';
  showActionDialog.value = true;
}

async function submitComplianceAction() {
  if (!selectedEvent.value) return;
  actionErrorMessage.value = '';

  try {
    if (currentActionType.value === 'coach') {
      if (!actionNotes.value.trim()) {
        actionErrorMessage.value = 'Catatan pembinaan wajib diisi.';
        return;
      }
      await coachMutation.mutateAsync({
        id: selectedEvent.value.id,
        payload: { coachingNotes: actionNotes.value.trim() },
      });
    } else if (currentActionType.value === 'warning') {
      if (!warningLetterRef.value.trim()) {
        actionErrorMessage.value = 'Nomor referensi SP wajib diisi.';
        return;
      }
      await warningMutation.mutateAsync({
        id: selectedEvent.value.id,
        payload: {
          warningLetterRef: warningLetterRef.value.trim(),
          notes: actionNotes.value.trim() || undefined,
        },
      });
    } else if (currentActionType.value === 'escalate') {
      if (!externalCaseRef.value.trim()) {
        actionErrorMessage.value = 'Nomor kasus formal wajib diisi.';
        return;
      }
      await escalateMutation.mutateAsync({
        id: selectedEvent.value.id,
        payload: {
          externalCaseRef: externalCaseRef.value.trim(),
          notes: actionNotes.value.trim() || undefined,
        },
      });
    }

    showActionDialog.value = false;
    refetchEvents();
  } catch (err: any) {
    actionErrorMessage.value = err.message || 'Gagal menyimpan tindakan.';
  }
}

function getEventTypeChipColor(type: string): string {
  switch (type) {
    case 'EscalatedFormalProcess':
      return 'error';
    case 'RecordedWarning':
      return 'deep-orange';
    case 'Coaching':
      return 'primary';
    case 'PatternFlag':
      return 'warning';
    case 'NoSubmission':
    default:
      return 'grey';
  }
}

function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'PatternFlag':
      return 'Pola Pelanggaran';
    case 'NoSubmission':
      return 'Tidak Mengisi';
    case 'Coaching':
      return 'Pembinaan';
    case 'RecordedWarning':
      return 'Surat Peringatan';
    case 'EscalatedFormalProcess':
      return 'Eskalasi Formal';
    default:
      return type;
  }
}

function getEventDescription(evt: ComplianceEventItem): string {
  if (evt.eventType === 'PatternFlag') {
    return 'Terdeteksi pola ketidakhadiran/keterlambatan berturut-turut yang memenuhi ambang batas pembinaan (SAD §9.7).';
  }
  if (evt.eventType === 'NoSubmission') {
    return 'Karyawan tidak menyerahkan check-in harian pada jendela waktu yang ditentukan kebijakan.';
  }
  if (evt.eventType === 'Coaching') {
    return 'Telah dilakukan sesi pembinaan 1-on-1 bersama manajer/HRGA.';
  }
  if (evt.eventType === 'RecordedWarning') {
    return 'Surat Peringatan formal telah diterbitkan atas pengulangan pelanggaran.';
  }
  if (evt.eventType === 'EscalatedFormalProcess') {
    return 'Kasus telah dieskalasi ke proses ketenagakerjaan/disipliner formal tingkat perusahaan.';
  }
  return 'Insiden kepatuhan tata tertib kerja tercatat.';
}

function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.border-red-strong {
  border-color: #dc2626 !important;
}
.border-amber-subtle {
  border-color: rgba(245, 158, 11, 0.4) !important;
}
</style>
