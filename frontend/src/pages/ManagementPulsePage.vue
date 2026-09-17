<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <!-- Header Page -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-chart-line" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Management Pulse</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Kesehatan Operasional &amp; Akuntabilitas Seluruh Perusahaan (Cakupan Eksekutif / Direksi)
        </p>
      </div>

      <!-- Date Filter -->
      <div class="d-flex align-center ga-2">
        <v-text-field
          v-model="selectedDate"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          style="width: 170px"
        />
        <v-btn
          variant="outlined"
          density="comfortable"
          @click="selectedDate = todayStr"
        >
          Hari Ini
        </v-btn>
      </div>
    </div>

    <!-- 1. Shared ExceptionSummaryWidget (scope: Company) -->
    <ExceptionSummaryWidget scope="Company" :date="selectedDate" />

    <!-- Policy Banner: Larangan Ranking Individu (PRD §9, AC-16) -->
    <v-alert
      type="info"
      variant="tonal"
      density="compact"
      icon="mdi-information-outline"
      class="mb-6 rounded-lg"
    >
      <strong>Tata Kelola Transparansi:</strong> Tampilan eksekutif menyajikan distribusi kesehatan operasional agregat per fungsi departemen. Sistem WorkPulse tidak menyajikan pemeringkatan (ranking) atau leaderboard individu antar karyawan.
    </v-alert>

    <!-- 2. Breakdown per Fungsi / Departemen -->
    <div class="mb-8">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
        <h2 class="text-h6 font-weight-bold">Ringkasan Kesehatan per Fungsi</h2>
        <v-btn
          size="small"
          variant="text"
          icon="mdi-refresh"
          :loading="isFetchingRecords"
          @click="refetchRecords"
        />
      </div>

      <div v-if="isLoadingRecords" class="py-8 text-center">
        <v-progress-circular indeterminate color="primary" />
        <div class="text-caption text-medium-emphasis mt-2">Memuat distribusi fungsi...</div>
      </div>

      <v-row v-else>
        <v-col
          v-for="fn in functionSummaries"
          :key="fn.name"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card variant="outlined" class="pa-4 rounded-lg border-subtle bg-surface h-100 d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-subtitle-1 font-weight-bold">{{ fn.name }}</span>
                <span class="text-caption text-medium-emphasis">{{ fn.totalMembers }} Anggota</span>
              </div>

              <!-- Counts Breakdown Pills -->
              <div class="d-flex align-center flex-wrap ga-2 mb-3">
                <v-chip size="small" color="success" variant="tonal" class="font-weight-bold">
                  {{ fn.greenCount }} Hijau
                </v-chip>
                <v-chip size="small" color="warning" variant="tonal" class="font-weight-bold">
                  {{ fn.amberCount }} Kuning
                </v-chip>
                <v-chip size="small" color="error" variant="tonal" class="font-weight-bold">
                  {{ fn.redCount }} Merah
                </v-chip>
                <v-chip size="small" color="grey" variant="tonal" class="font-weight-bold">
                  {{ fn.noSubCount }} Belum Isi
                </v-chip>
              </div>
            </div>

            <div class="pt-3 border-t text-caption text-medium-emphasis d-flex justify-space-between">
              <span>Tingkat Kepatuhan Pengisian:</span>
              <strong class="text-high-emphasis">{{ fn.submissionRate }}%</strong>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 3. Aging Eskalasi Blocker Kritis Perusahaan -->
    <v-card variant="outlined" class="rounded-lg border-subtle mb-6">
      <v-card-item>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <h2 class="text-h6 font-weight-bold">Aging Eskalasi Blocker Kritis</h2>
            <p class="text-caption text-medium-emphasis">
              Daftar kendala berisiko tinggi yang melampaui SLA dan berpotensi menghambat milestone operasional
            </p>
          </div>
          <v-btn
            size="small"
            variant="text"
            icon="mdi-refresh"
            :loading="isFetchingBlockers"
            @click="refetchBlockers"
          />
        </div>
      </v-card-item>

      <v-card-text>
        <div
          v-if="criticalAgingBlockers.length === 0"
          class="py-8 text-center text-medium-emphasis"
        >
          <v-icon icon="mdi-shield-check-outline" color="success" size="48" class="mb-2" />
          <div class="font-weight-bold">Seluruh Blocker Dalam Batas Toleransi SLA</div>
          <div class="text-caption">Tidak ada kendala kritis yang mengalami keterlambatan penyelesaian eskalasi.</div>
        </div>

        <div v-else class="d-flex flex-column ga-2">
          <v-card
            v-for="b in criticalAgingBlockers"
            :key="b.id"
            variant="outlined"
            class="pa-3 rounded border-subtle bg-surface"
          >
            <div class="d-flex align-center justify-space-between flex-wrap ga-2">
              <div>
                <div class="d-flex align-center ga-2 mb-1">
                  <span class="text-subtitle-2 font-weight-bold">{{ b.description }}</span>
                  <v-chip size="x-small" color="error" class="font-weight-bold text-uppercase">
                    {{ b.severity }}
                  </v-chip>
                  <v-chip size="x-small" color="warning" variant="flat">
                    Eskalasi Otomatis
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">
                  Pelapor: {{ b.raisedByName || 'Karyawan' }} ({{ b.raisedByFunction || '-' }}) &rarr;
                  Penanggung Jawab: {{ b.ownerNeededName || 'Pending' }} ({{ b.ownerNeededFunction || '-' }})
                </div>
              </div>

              <div class="text-right">
                <span class="text-caption text-error font-weight-bold font-mono">
                  SLA Lewat
                </span>
              </div>
            </div>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ExceptionSummaryWidget from '../components/management/ExceptionSummaryWidget.vue';
import { useDailyRecordsQuery } from '../queries/useDailyRecords.js';
import { useBlockersListQuery } from '../queries/useBlockers.js';

const todayStr = new Date().toISOString().slice(0, 10);
const selectedDate = ref<string>(todayStr);

const {
  data: dailyData,
  isLoading: isLoadingRecords,
  isFetching: isFetchingRecords,
  refetch: refetchRecords,
} = useDailyRecordsQuery(() => ({
  date: selectedDate.value,
  scope: 'Company',
}));

const {
  data: blockersData,
  isFetching: isFetchingBlockers,
  refetch: refetchBlockers,
} = useBlockersListQuery({
  scope: 'Company',
});

// Group records by function
const functionSummaries = computed(() => {
  const records = dailyData.value?.items || [];
  const groups: Record<string, any> = {};

  records.forEach((r) => {
    const fn = r.user?.function || 'Umum / Lainnya';
    if (!groups[fn]) {
      groups[fn] = {
        name: fn,
        totalMembers: 0,
        greenCount: 0,
        amberCount: 0,
        redCount: 0,
        noSubCount: 0,
      };
    }
    groups[fn].totalMembers += 1;
    const status = r.status || r.finalStatus;
    if (status === 'GREEN') groups[fn].greenCount += 1;
    else if (status === 'AMBER') groups[fn].amberCount += 1;
    else if (status === 'RED') groups[fn].redCount += 1;

    if (r.morningSubmissionTiming === 'NoSubmission') {
      groups[fn].noSubCount += 1;
    }
  });

  return Object.values(groups).map((g) => {
    const submitted = g.totalMembers - g.noSubCount;
    const rate = g.totalMembers > 0 ? Math.round((submitted / g.totalMembers) * 100) : 0;
    return {
      ...g,
      submissionRate: rate,
    };
  });
});

const criticalAgingBlockers = computed(() => {
  const all = blockersData.value?.blockers || [];
  return all.filter((b) => b.severity === 'Critical' || b.severity === 'High');
});
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
</style>
