<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <!-- Header Page -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-file-chart-outline" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Reports</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Laporan Analisis Akuntabilitas Operasional, Bukti Evaluasi &amp; Ekspor Dokumen
        </p>
      </div>
    </div>

    <!-- Governance Banner (PRD §9, AC-16) -->
    <v-alert
      type="info"
      variant="tonal"
      density="compact"
      icon="mdi-shield-check-outline"
      class="mb-6 rounded-lg"
    >
      <strong>Kebijakan Tata Kelola Kerja:</strong> Laporan operasional menyajikan bukti fakta akuntabilitas dan metrik agregat tim. Sistem WorkPulse secara tegas melarang pembuatan leaderboard, gamifikasi, atau perangkingan performa antar rekan kerja.
    </v-alert>

    <!-- 5 Report Navigation Tabs -->
    <v-card variant="outlined" class="rounded-lg border-subtle mb-6">
      <v-tabs v-model="activeReportTab" color="primary" class="border-b" show-arrows>
        <v-tab value="daily-exception" class="text-none font-weight-bold">
          <v-icon icon="mdi-calendar-alert" class="mr-2" />
          Pengecualian Harian
        </v-tab>
        <v-tab value="weekly-team" class="text-none font-weight-bold">
          <v-icon icon="mdi-calendar-range" class="mr-2" />
          Ringkasan Mingguan Tim
        </v-tab>
        <v-tab value="monthly-trend" class="text-none font-weight-bold">
          <v-icon icon="mdi-trending-up" class="mr-2" />
          Tren Bulanan Manajemen
        </v-tab>
        <v-tab value="individual-evidence" class="text-none font-weight-bold">
          <v-icon icon="mdi-account-details-outline" class="mr-2" />
          Bukti Review Individual
        </v-tab>
        <v-tab value="blocker-root-cause" class="text-none font-weight-bold">
          <v-icon icon="mdi-wrench-clock" class="mr-2" />
          Akar Masalah Blocker
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4 pa-md-6">
        <!-- ============================================================= -->
        <!-- TAB 1: DAILY EXCEPTION REPORT -->
        <!-- ============================================================= -->
        <div v-if="activeReportTab === 'daily-exception'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-text-field
                v-model="dailyDate"
                label="Tanggal Laporan"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 170px"
              />
            </div>

            <!-- Export Button -->
            <ExportButton
              :loading="isExporting"
              @export="(fmt) => triggerExport('daily-exception', fmt)"
            />
          </div>

          <div v-if="isLoadingDaily" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat laporan pengecualian harian...</div>
          </div>

          <div v-else-if="!dailyReport || dailyReport.items.length === 0" class="py-12 text-center text-medium-emphasis border rounded-lg">
            <v-icon icon="mdi-check-circle-outline" color="success" size="48" class="mb-2" />
            <div class="font-weight-bold">Tidak Ada Pengecualian</div>
            <div class="text-caption">Seluruh karyawan memenuhi komitmen pengisian pada tanggal ini.</div>
          </div>

          <div v-else>
            <div class="text-subtitle-2 font-weight-bold mb-2">
              Ditemukan {{ dailyReport.totalItems }} Karyawan Memerlukan Perhatian Operasional
            </div>
            <v-table density="comfortable" class="border rounded-lg">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">Karyawan</th>
                  <th class="text-left font-weight-bold">Fungsi</th>
                  <th class="text-center font-weight-bold">Status Harian</th>
                  <th class="text-center font-weight-bold">Waktu Pengisian</th>
                  <th class="text-center font-weight-bold">Komitmen</th>
                  <th class="text-center font-weight-bold">Blocker Kritis</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in dailyReport.items" :key="item.userId">
                  <td class="font-weight-medium">{{ item.userName }}</td>
                  <td class="text-medium-emphasis">{{ item.function }}</td>
                  <td class="text-center">
                    <StatusBadge :status="item.status" />
                  </td>
                  <td class="text-center">
                    <SubmissionTimingBadge :timing="item.submissionTiming" />
                  </td>
                  <td class="text-center font-weight-bold">{{ item.commitmentsCount }}</td>
                  <td class="text-center">
                    <v-chip
                      v-if="item.criticalBlockersCount > 0"
                      size="x-small"
                      color="error"
                      class="font-weight-bold"
                    >
                      {{ item.criticalBlockersCount }}
                    </v-chip>
                    <span v-else class="text-medium-emphasis">-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 2: WEEKLY TEAM SUMMARY REPORT -->
        <!-- ============================================================= -->
        <div v-else-if="activeReportTab === 'weekly-team'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-text-field
                v-model="weeklyStartDate"
                label="Tanggal Mulai Minggu"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 180px"
              />
            </div>

            <ExportButton
              :loading="isExporting"
              @export="(fmt) => triggerExport('weekly-team-summary', fmt)"
            />
          </div>

          <div v-if="isLoadingWeekly" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat ringkasan mingguan...</div>
          </div>

          <div v-else-if="weeklyReport" class="d-flex flex-column ga-4">
            <!-- Metrics Overview -->
            <v-row>
              <v-col cols="6" sm="3">
                <v-card variant="flat" class="pa-3 border rounded bg-surface-elevated text-center">
                  <div class="text-caption text-medium-emphasis font-weight-bold">TOTAL CHECK-IN</div>
                  <div class="text-h5 font-weight-black mt-1">{{ weeklyReport.totalSubmissions }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="flat" class="pa-3 border rounded bg-green-lighten-5 text-center">
                  <div class="text-caption text-green-darken-3 font-weight-bold">STATUS HIJAU</div>
                  <div class="text-h5 font-weight-black text-green-darken-3 mt-1">{{ weeklyReport.greenCount }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="flat" class="pa-3 border rounded bg-amber-lighten-5 text-center">
                  <div class="text-caption text-amber-darken-3 font-weight-bold">STATUS KUNING</div>
                  <div class="text-h5 font-weight-black text-amber-darken-3 mt-1">{{ weeklyReport.amberCount }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card variant="flat" class="pa-3 border rounded bg-red-lighten-5 text-center">
                  <div class="text-caption text-red-darken-3 font-weight-bold">STATUS MERAH</div>
                  <div class="text-h5 font-weight-black text-red-darken-3 mt-1">{{ weeklyReport.redCount }}</div>
                </v-card>
              </v-col>
            </v-row>

            <v-card variant="outlined" class="pa-4 rounded border-subtle">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Tingkat Kelanjutan Komitmen (Continuation Rate)</div>
                  <div class="text-caption text-medium-emphasis">Persentase komitmen harian yang dilanjutkan secara konsisten</div>
                </div>
                <div class="text-h4 font-weight-bold text-primary">{{ weeklyReport.continuationRate }}%</div>
              </div>
            </v-card>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 3: MONTHLY TREND REPORT -->
        <!-- ============================================================= -->
        <div v-else-if="activeReportTab === 'monthly-trend'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-select
                v-model="monthlyYear"
                label="Tahun"
                :items="[2025, 2026, 2027]"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 110px"
              />
              <v-select
                v-model="monthlyMonth"
                label="Bulan"
                :items="monthOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 140px"
              />
            </div>

            <ExportButton
              :loading="isExporting"
              @export="(fmt) => triggerExport('monthly-trend', fmt)"
            />
          </div>

          <div v-if="isLoadingMonthly" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat tren bulanan...</div>
          </div>

          <div v-else-if="monthlyReport" class="d-flex flex-column ga-4">
            <v-row>
              <v-col cols="12" sm="4">
                <v-card variant="flat" class="pa-4 border rounded bg-surface-elevated text-center">
                  <div class="text-caption text-medium-emphasis font-weight-bold">HARI KERJA EFEKTIF</div>
                  <div class="text-h4 font-weight-bold mt-1">{{ monthlyReport.totalWorkingDays }} Hari</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card variant="flat" class="pa-4 border rounded bg-surface-elevated text-center">
                  <div class="text-caption text-medium-emphasis font-weight-bold">TINGKAT PENYELESAIAN KOMITMEN</div>
                  <div class="text-h4 font-weight-bold text-success mt-1">{{ monthlyReport.completionRate }}%</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card variant="flat" class="pa-4 border rounded bg-surface-elevated text-center">
                  <div class="text-caption text-medium-emphasis font-weight-bold">TINGKAT KETEPATAN WAKTU CHECK-IN</div>
                  <div class="text-h4 font-weight-bold text-primary mt-1">{{ monthlyReport.onTimeRate }}%</div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 4: INDIVIDUAL REVIEW EVIDENCE -->
        <!-- ============================================================= -->
        <div v-else-if="activeReportTab === 'individual-evidence'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-select
                v-model="selectedEmployeeId"
                label="Pilih Karyawan"
                :items="ownerOptions"
                item-title="fullName"
                item-value="id"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 240px"
              />
              <v-text-field
                v-model="evidenceStartDate"
                label="Dari"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 150px"
              />
              <v-text-field
                v-model="evidenceEndDate"
                label="Sampai"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 150px"
              />
            </div>

            <ExportButton
              :disabled="!selectedEmployeeId"
              :loading="isExporting"
              @export="(fmt) => triggerExport('individual-evidence', fmt)"
            />
          </div>

          <div v-if="!selectedEmployeeId" class="py-12 text-center text-medium-emphasis border rounded-lg">
            <v-icon icon="mdi-account-search-outline" size="48" class="mb-2" />
            <div>Pilih karyawan dan tentukan rentang tanggal untuk mengompilasi bukti review kinerja.</div>
          </div>

          <div v-else-if="isLoadingEvidence" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat bukti review individual...</div>
          </div>

          <div v-else-if="evidenceReport" class="d-flex flex-column ga-6">
            <!-- Header Profil -->
            <v-card variant="flat" class="pa-4 rounded-lg border bg-surface-elevated">
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" size="44" class="text-h6 font-weight-bold text-white">
                  {{ getInitials(evidenceReport.userName) }}
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold">{{ evidenceReport.userName }}</div>
                  <div class="text-caption text-medium-emphasis">
                    Fungsi: {{ evidenceReport.function }} | Periode: {{ formatDate(evidenceReport.period.startDate) }} s.d. {{ formatDate(evidenceReport.period.endDate) }}
                  </div>
                </div>
              </div>
            </v-card>

            <!-- Ringkasan Status Harian -->
            <div>
              <h3 class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-2">
                Distribusi Status Hari Kerja
              </h3>
              <v-row>
                <v-col cols="6" sm="3">
                  <v-card variant="flat" class="pa-3 border rounded bg-green-lighten-5 text-center">
                    <div class="text-h5 font-weight-bold text-green-darken-3">{{ evidenceReport.metrics.greenDays }}</div>
                    <div class="text-caption text-medium-emphasis">Hari Hijau</div>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-card variant="flat" class="pa-3 border rounded bg-amber-lighten-5 text-center">
                    <div class="text-h5 font-weight-bold text-amber-darken-3">{{ evidenceReport.metrics.amberDays }}</div>
                    <div class="text-caption text-medium-emphasis">Hari Kuning</div>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-card variant="flat" class="pa-3 border rounded bg-red-lighten-5 text-center">
                    <div class="text-h5 font-weight-bold text-red-darken-3">{{ evidenceReport.metrics.redDays }}</div>
                    <div class="text-caption text-medium-emphasis">Hari Merah</div>
                  </v-card>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-card variant="flat" class="pa-3 border rounded bg-grey-lighten-4 text-center">
                    <div class="text-h5 font-weight-bold">{{ evidenceReport.metrics.noSubDays }}</div>
                    <div class="text-caption text-medium-emphasis">Tidak Mengisi</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Catatan Manajerial -->
            <div>
              <h3 class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-2">
                Catatan Pembinaan Manajerial ({{ evidenceReport.managerNotes.length }})
              </h3>
              <div v-if="evidenceReport.managerNotes.length === 0" class="text-caption text-medium-emphasis py-2">
                Tidak ada catatan pembinaan dalam periode ini.
              </div>
              <div v-else class="d-flex flex-column ga-2">
                <v-card
                  v-for="note in evidenceReport.managerNotes"
                  :key="note.id"
                  variant="outlined"
                  class="pa-3 rounded border-subtle bg-surface"
                >
                  <div class="d-flex align-center justify-space-between mb-1">
                    <v-chip size="x-small" color="primary" class="font-weight-bold">
                      {{ note.category || 'Pembinaan' }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">{{ formatDate(note.createdAt) }}</span>
                  </div>
                  <div class="text-body-2 font-weight-medium">{{ note.note }}</div>
                  <div class="text-caption text-medium-emphasis mt-1">Oleh: {{ note.createdByName || 'Manajer' }}</div>
                </v-card>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 5: BLOCKER ROOT CAUSE REPORT -->
        <!-- ============================================================= -->
        <div v-else-if="activeReportTab === 'blocker-root-cause'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-text-field
                v-model="rootCauseStartDate"
                label="Dari Tanggal"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 160px"
              />
              <v-text-field
                v-model="rootCauseEndDate"
                label="Sampai Tanggal"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 160px"
              />
            </div>

            <ExportButton
              :loading="isExporting"
              @export="(fmt) => triggerExport('blocker-root-cause', fmt)"
            />
          </div>

          <div v-if="isLoadingRootCause" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat analisis akar masalah blocker...</div>
          </div>

          <div v-else-if="rootCauseReport" class="d-flex flex-column ga-4">
            <v-row>
              <v-col cols="12" sm="6">
                <v-card variant="flat" class="pa-4 border rounded bg-surface-elevated text-center">
                  <div class="text-caption text-medium-emphasis font-weight-bold">TOTAL BLOCKER PERIODE INI</div>
                  <div class="text-h4 font-weight-bold mt-1">{{ rootCauseReport.totalBlockers }} Kendala</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6">
                <v-card variant="flat" class="pa-4 border rounded bg-surface-elevated text-center">
                  <div class="text-caption text-medium-emphasis font-weight-bold">RATA-RATA WAKTU PENYELESAIAN</div>
                  <div class="text-h4 font-weight-bold text-primary mt-1">{{ rootCauseReport.averageResolutionHours }} Jam</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Root Cause Breakdown -->
            <v-card variant="outlined" class="pa-4 rounded border-subtle">
              <h3 class="text-subtitle-2 font-weight-bold mb-3">Distribusi Kategori Akar Masalah</h3>
              <div v-if="rootCauseReport.rootCauseBreakdown.length === 0" class="text-caption text-medium-emphasis">
                Belum ada data kategorisasi akar masalah.
              </div>
              <v-table v-else density="comfortable">
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold">Kategori Masalah</th>
                    <th class="text-center font-weight-bold">Jumlah Kejadian</th>
                    <th class="text-center font-weight-bold">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rc in rootCauseReport.rootCauseBreakdown" :key="rc.category">
                    <td class="font-weight-medium">{{ rc.category }}</td>
                    <td class="text-center font-weight-bold">{{ rc.count }}</td>
                    <td class="text-center">{{ rc.percentage }}%</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExportButton, StatusBadge, SubmissionTimingBadge } from '../components/shared/index.js';
import {
  useDailyExceptionQuery,
  useWeeklyTeamSummaryQuery,
  useMonthlyTrendQuery,
  useIndividualEvidenceQuery,
  useBlockerRootCauseQuery,
  useExportReportMutation,
} from '../queries/useReporting.js';
import { useBlockerOwnersQuery } from '../queries/useBlockers.js';
import type { ExportReportPayload } from '../types/management.js';

const activeReportTab = ref<string>('daily-exception');
const todayStr = new Date().toISOString().slice(0, 10);

// Filters State
const dailyDate = ref<string>(todayStr);
const weeklyStartDate = ref<string>(todayStr);
const monthlyYear = ref<number>(new Date().getFullYear());
const monthlyMonth = ref<number>(new Date().getMonth() + 1);

const selectedEmployeeId = ref<string>('');
const evidenceStartDate = ref<string>(
  new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
);
const evidenceEndDate = ref<string>(todayStr);

const rootCauseStartDate = ref<string>(
  new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
);
const rootCauseEndDate = ref<string>(todayStr);

const monthOptions = [
  { title: 'Januari', value: 1 },
  { title: 'Februari', value: 2 },
  { title: 'Maret', value: 3 },
  { title: 'April', value: 4 },
  { title: 'Mei', value: 5 },
  { title: 'Juni', value: 6 },
  { title: 'Juli', value: 7 },
  { title: 'Agustus', value: 8 },
  { title: 'September', value: 9 },
  { title: 'Oktober', value: 10 },
  { title: 'November', value: 11 },
  { title: 'Desember', value: 12 },
];

// Employee dropdown for individual evidence
const { data: ownerOptions } = useBlockerOwnersQuery();

// Queries
const { data: dailyReport, isLoading: isLoadingDaily } = useDailyExceptionQuery(() => ({
  date: dailyDate.value,
}));

const { data: weeklyReport, isLoading: isLoadingWeekly } = useWeeklyTeamSummaryQuery(() => ({
  weekStartDate: weeklyStartDate.value,
}));

const { data: monthlyReport, isLoading: isLoadingMonthly } = useMonthlyTrendQuery(() => ({
  year: monthlyYear.value,
  month: monthlyMonth.value,
}));

const { data: evidenceReport, isLoading: isLoadingEvidence } = useIndividualEvidenceQuery(() => ({
  userId: selectedEmployeeId.value,
  startDate: evidenceStartDate.value,
  endDate: evidenceEndDate.value,
}));

const { data: rootCauseReport, isLoading: isLoadingRootCause } = useBlockerRootCauseQuery(() => ({
  startDate: rootCauseStartDate.value,
  endDate: rootCauseEndDate.value,
}));

// Export Mutation
const exportMutation = useExportReportMutation();
const isExporting = exportMutation.isPending;

async function triggerExport(reportType: ExportReportPayload['reportType'], format: 'pdf' | 'xlsx' | 'PDF' | 'XLSX') {
  try {
    const normalizedFormat = format.toUpperCase() as 'PDF' | 'XLSX';
    const payload: ExportReportPayload = {
      reportType,
      format: normalizedFormat,
    };

    if (reportType === 'daily-exception') {
      payload.date = dailyDate.value;
    } else if (reportType === 'weekly-team-summary') {
      payload.weekStartDate = weeklyStartDate.value;
    } else if (reportType === 'monthly-trend') {
      payload.year = monthlyYear.value;
      payload.month = monthlyMonth.value;
    } else if (reportType === 'individual-evidence') {
      payload.userId = selectedEmployeeId.value;
      payload.startDate = evidenceStartDate.value;
      payload.endDate = evidenceEndDate.value;
    } else if (reportType === 'blocker-root-cause') {
      payload.startDate = rootCauseStartDate.value;
      payload.endDate = rootCauseEndDate.value;
    }

    const res = await exportMutation.mutateAsync(payload);
    if (res.signedUrl) {
      window.open(res.signedUrl, '_blank');
    }
  } catch (err: any) {
    alert(err.message || 'Gagal mengekspor laporan.');
  }
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
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.bg-surface-elevated {
  background-color: #eff5f2 !important;
}
</style>
