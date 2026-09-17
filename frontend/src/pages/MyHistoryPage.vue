<template>
  <v-container class="py-6 max-w-1200">
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">My History</h1>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Riwayat akuntabilitas harian, outcome komitmen, dan bukti kerja personal
        </p>
      </div>

      <div class="d-flex align-center gap-2">
        <ExportButton
          :data="exportableData"
          filename="workpulse-my-history.csv"
        />
      </div>
    </div>

    <!-- Filter Bar Presets -->
    <v-card variant="outlined" class="mb-6 rounded-lg pa-4 bg-surface">
      <div class="d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="text-caption font-weight-bold text-medium-emphasis mr-2">
            PRESET FILTER:
          </span>
          <v-btn
            size="small"
            :variant="activePreset === 'this_week' ? 'flat' : 'outlined'"
            color="primary"
            @click="setPreset('this_week')"
          >
            Minggu Ini
          </v-btn>
          <v-btn
            size="small"
            :variant="activePreset === 'last_week' ? 'flat' : 'outlined'"
            color="primary"
            @click="setPreset('last_week')"
          >
            Minggu Lalu
          </v-btn>
          <v-btn
            size="small"
            :variant="activePreset === 'this_month' ? 'flat' : 'outlined'"
            color="primary"
            @click="setPreset('this_month')"
          >
            Bulan Ini
          </v-btn>
          <v-btn
            size="small"
            :variant="activePreset === 'all' ? 'flat' : 'outlined'"
            color="primary"
            @click="setPreset('all')"
          >
            Semua
          </v-btn>
        </div>

        <div class="d-flex align-center gap-2">
          <v-text-field
            v-model="startDate"
            type="date"
            label="Dari Tanggal"
            density="compact"
            variant="outlined"
            hide-details
            class="date-input"
          />
          <v-text-field
            v-model="endDate"
            type="date"
            label="Sampai Tanggal"
            density="compact"
            variant="outlined"
            hide-details
            class="date-input"
          />
        </div>
      </div>
    </v-card>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-3">Memuat riwayat akuntabilitas...</p>
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="!records || records.length === 0"
      variant="outlined"
      class="pa-8 text-center rounded-lg"
    >
      <v-icon icon="mdi-calendar-blank-outline" size="48" color="medium-emphasis" class="mb-3" />
      <h3 class="text-h6 font-weight-medium">Belum Ada Riwayat</h3>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Tidak ada catatan akuntabilitas ditemukan untuk rentang tanggal yang dipilih.
      </p>
    </v-card>

    <!-- Table of Records -->
    <v-card v-else variant="outlined" class="rounded-lg overflow-hidden border">
      <v-table hover density="comfortable">
        <thead>
          <tr class="bg-surface-variant">
            <th class="text-left font-weight-bold">Tanggal</th>
            <th class="text-left font-weight-bold">Moda</th>
            <!-- DUA DIMENSI STATUS BERDAMPINGAN (UI/UX Spec §4.6) -->
            <th class="text-left font-weight-bold">Submission Timing</th>
            <th class="text-left font-weight-bold">Day Status</th>
            <th class="text-left font-weight-bold">Komitmen</th>
            <th class="text-center font-weight-bold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="rec in records"
            :key="rec.id"
            class="cursor-pointer"
            @click="openDetail(rec)"
          >
            <!-- Tanggal -->
            <td class="font-weight-medium text-body-2 py-3">
              {{ formatDate(rec.workDate) }}
            </td>

            <!-- Moda Kerja -->
            <td>
              <v-chip size="x-small" variant="tonal" color="primary">
                {{ rec.workType || 'WFO' }}
              </v-chip>
            </td>

            <!-- Dimensi 1: Submission Timing Badge (On-Time / Late / No Submission) -->
            <td>
              <SubmissionTimingBadge
                :timing="rec.eodCutoffTiming || rec.morningCutoffTiming || 'OnTime'"
              />
            </td>

            <!-- Dimensi 2: Status Badge (GREEN / AMBER / RED) -->
            <td>
              <StatusBadge :status="rec.finalStatus || 'GREEN'" />
            </td>

            <!-- Komitmen Summary -->
            <td class="text-body-2">
              <span class="text-caption text-medium-emphasis">
                {{ rec.commitments?.length || 0 }} Komitmen,
                {{ rec.additionalWorks?.length || 0 }} Tambahan
              </span>
            </td>

            <!-- Aksi Drilldown -->
            <td class="text-center">
              <v-btn
                variant="text"
                color="primary"
                size="small"
                icon="mdi-chevron-right"
                @click.stop="openDetail(rec)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Detail Dialog -->
    <v-dialog v-model="showDetailDialog" max-width="680px">
      <v-card v-if="selectedRecord" class="rounded-lg">
        <v-card-item class="bg-surface-variant border-b py-3">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-calendar-text" color="primary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                Detail Akuntabilitas: {{ formatDate(selectedRecord.workDate) }}
              </v-card-title>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="showDetailDialog = false" />
          </div>
        </v-card-item>

        <v-card-text class="pt-4">
          <!-- Meta summary -->
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4 pa-3 bg-surface border rounded-lg">
            <div>
              <div class="text-caption text-medium-emphasis">Waktu Penyerahan:</div>
              <div class="text-body-2 font-weight-medium">
                Pagi: {{ formatTime(selectedRecord.morningSubmittedAt) }} | EOD: {{ formatTime(selectedRecord.eodSubmittedAt) }}
              </div>
            </div>
            <div class="d-flex align-center gap-2">
              <SubmissionTimingBadge :timing="selectedRecord.eodCutoffTiming || 'OnTime'" />
              <StatusBadge :status="selectedRecord.finalStatus || 'GREEN'" />
            </div>
          </div>

          <!-- Commitments List -->
          <div class="mb-4">
            <h4 class="text-subtitle-2 font-weight-bold mb-2 text-primary">
              Morning Commitments
            </h4>
            <div v-if="!selectedRecord.commitments?.length" class="text-caption text-medium-emphasis">
              Tidak ada data komitmen.
            </div>
            <v-sheet
              v-for="(c, cIdx) in selectedRecord.commitments"
              :key="c.id"
              rounded="md"
              class="pa-3 mb-2 border bg-surface"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">
                  #{{ cIdx + 1 }}. {{ c.description }}
                </span>
                <v-chip size="x-small" :color="c.outcomeStatus === 'Completed' ? 'success' : 'warning'">
                  {{ c.outcomeStatus || 'Pending' }}
                </v-chip>
              </div>
              <div class="d-flex align-center gap-3 text-caption text-medium-emphasis">
                <span>Rencana Lanjut: <strong>{{ c.continuation || 'Selesai' }}</strong></span>
                <span v-if="c.continuationReason">Catatan: {{ c.continuationReason }}</span>
              </div>
            </v-sheet>
          </div>

          <!-- Additional Works List -->
          <div v-if="selectedRecord.additionalWorks?.length" class="mb-4">
            <h4 class="text-subtitle-2 font-weight-bold mb-2 text-secondary">
              Additional Works
            </h4>
            <v-sheet
              v-for="(w, wIdx) in selectedRecord.additionalWorks"
              :key="w.id"
              rounded="md"
              class="pa-3 mb-2 border bg-surface"
            >
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">
                  +{{ wIdx + 1 }}. {{ w.description }}
                </span>
                <v-chip size="x-small" color="secondary" variant="tonal">
                  {{ w.reason }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                Ditugaskan oleh: <strong>{{ w.assignedBy || '-' }}</strong>
              </div>
            </v-sheet>
          </div>

          <!-- Tomorrow Priority -->
          <div v-if="selectedRecord.tomorrowPriority" class="mb-2">
            <h4 class="text-subtitle-2 font-weight-bold mb-1">
              Catatan Prioritas Esok Hari:
            </h4>
            <p class="text-body-2 bg-surface-variant pa-3 rounded border">
              {{ selectedRecord.tomorrowPriority }}
            </p>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="tonal" color="primary" @click="showDetailDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDailyRecordsQuery } from '../queries/useDailyRecords.js';
import { StatusBadge, SubmissionTimingBadge, ExportButton } from '../components/shared/index.js';
import type { DailyAccountabilityRecord } from '../types/daily-records.js';

// Date Presets
const activePreset = ref<'this_week' | 'last_week' | 'this_month' | 'all'>('this_month');
const startDate = ref(getDefaultStartDate());
const endDate = ref(new Date().toISOString().split('T')[0]);

function getDefaultStartDate(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  return d.toISOString().split('T')[0];
}

function setPreset(preset: 'this_week' | 'last_week' | 'this_month' | 'all') {
  activePreset.value = preset;
  const now = new Date();

  if (preset === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Senin
    const monday = new Date(now.setDate(diff));
    startDate.value = monday.toISOString().split('T')[0];
    endDate.value = new Date().toISOString().split('T')[0];
  } else if (preset === 'last_week') {
    const day = now.getDay();
    const diff = now.getDate() - day - 6;
    const prevMonday = new Date(now.setDate(diff));
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    startDate.value = prevMonday.toISOString().split('T')[0];
    endDate.value = prevSunday.toISOString().split('T')[0];
  } else if (preset === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.value = firstDay.toISOString().split('T')[0];
    endDate.value = new Date().toISOString().split('T')[0];
  } else {
    startDate.value = '';
    endDate.value = '';
  }
}

// Query
const queryParams = computed(() => ({
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined,
  limit: 50,
}));

const { data: responseData, isLoading } = useDailyRecordsQuery(queryParams);
const records = computed(() => responseData.value?.items || []);

// Detail Dialog
const showDetailDialog = ref(false);
const selectedRecord = ref<DailyAccountabilityRecord | null>(null);

function openDetail(record: DailyAccountabilityRecord) {
  selectedRecord.value = record;
  showDetailDialog.value = true;
}

// Exportable Data for CSV Export
const exportableData = computed(() => {
  return records.value.map((r) => ({
    Tanggal: formatDate(r.workDate),
    ModaKerja: r.workType || 'WFO',
    SubmissionTiming: r.eodCutoffTiming || r.morningCutoffTiming || 'OnTime',
    FinalStatus: r.finalStatus || 'GREEN',
    JumlahKomitmen: r.commitments?.length || 0,
    JumlahAdditionalWork: r.additionalWorks?.length || 0,
    WaktuPagi: r.morningSubmittedAt || '-',
    WaktuEOD: r.eodSubmittedAt || '-',
  }));
});

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(isoStr?: string | null): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}
</script>

<style scoped>
.max-w-1200 {
  max-width: 1200px;
}
.date-input {
  max-width: 160px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
