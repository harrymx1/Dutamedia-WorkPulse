<template>
  <v-card variant="outlined" class="rounded-lg mb-6 border-subtle bg-surface">
    <!-- Header Widget -->
    <v-card-item class="pb-2">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-alert-decagram-outline" color="primary" size="24" />
          <h2 class="text-subtitle-1 font-weight-bold">
            Ringkasan Pengecualian &amp; Risiko Operasional ({{ scopeTitle }})
          </h2>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip size="small" variant="tonal" color="primary" class="font-weight-medium">
            {{ formattedDate }}
          </v-chip>
          <v-btn
            icon="mdi-refresh"
            size="x-small"
            variant="text"
            :loading="isFetching"
            @click="refetch"
          />
        </div>
      </div>
    </v-card-item>

    <v-card-text class="pt-2">
      <!-- Loading State -->
      <v-row v-if="isLoading">
        <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="3">
          <v-skeleton-loader type="card" height="90" />
        </v-col>
      </v-row>

      <!-- Metrics Cards -->
      <v-row v-else-if="summary">
        <!-- 1. Total Karyawan Diharapkan -->
        <v-col cols="12" sm="6" md="3">
          <v-card
            variant="flat"
            class="pa-4 rounded-lg border-subtle bg-surface-elevated h-100 d-flex flex-column justify-space-between"
          >
            <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase">
              Total Karyawan
            </div>
            <div class="d-flex align-baseline ga-2 mt-1">
              <span class="text-h4 font-weight-black">{{ summary.metrics.totalExpectedEmployees }}</span>
              <span class="text-caption text-medium-emphasis">
                ({{ summary.metrics.submittedCount }} mengisi)
              </span>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Check-in diharapkan hari ini
            </div>
          </v-card>
        </v-col>

        <!-- 2. Belum Mengisi (No Submission) -->
        <v-col cols="12" sm="6" md="3">
          <v-card
            variant="flat"
            :class="[
              'pa-4 rounded-lg h-100 d-flex flex-column justify-space-between border-subtle',
              summary.metrics.noSubmissionCount > 0 ? 'bg-amber-lighten-5' : 'bg-surface-elevated'
            ]"
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
              Belum Mengisi
            </div>
            <div class="d-flex align-baseline ga-2 mt-1">
              <span
                class="text-h4 font-weight-black"
                :class="summary.metrics.noSubmissionCount > 0 ? 'text-amber-darken-3' : 'text-high-emphasis'"
              >
                {{ summary.metrics.noSubmissionCount }}
              </span>
              <span class="text-caption text-medium-emphasis">karyawan</span>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Melebihi jendela check-in
            </div>
          </v-card>
        </v-col>

        <!-- 3. Risiko Merah (RED) -->
        <v-col cols="12" sm="6" md="3">
          <v-card
            variant="flat"
            :class="[
              'pa-4 rounded-lg h-100 d-flex flex-column justify-space-between border-subtle',
              summary.metrics.redCount > 0 ? 'bg-red-lighten-5' : 'bg-surface-elevated'
            ]"
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
              Status Merah (RED)
            </div>
            <div class="d-flex align-baseline ga-2 mt-1">
              <span
                class="text-h4 font-weight-black"
                :class="summary.metrics.redCount > 0 ? 'text-error' : 'text-high-emphasis'"
              >
                {{ summary.metrics.redCount }}
              </span>
              <span class="text-caption text-medium-emphasis">laporan</span>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Komitmen tertunda signifikan
            </div>
          </v-card>
        </v-col>

        <!-- 4. Blocker Kritis & SLA Overdue -->
        <v-col cols="12" sm="6" md="3">
          <v-card
            variant="flat"
            :class="[
              'pa-4 rounded-lg h-100 d-flex flex-column justify-space-between border-subtle',
              (summary.metrics.criticalBlockerCount > 0 || summary.metrics.overdueAcknowledgementCount > 0)
                ? 'bg-red-lighten-5'
                : 'bg-surface-elevated'
            ]"
          >
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
              Blocker Kritis / Overdue
            </div>
            <div class="d-flex align-baseline ga-2 mt-1">
              <span
                class="text-h4 font-weight-black"
                :class="(summary.metrics.criticalBlockerCount > 0 || summary.metrics.overdueAcknowledgementCount > 0) ? 'text-error' : 'text-high-emphasis'"
              >
                {{ summary.metrics.criticalBlockerCount + summary.metrics.overdueAcknowledgementCount }}
              </span>
              <span class="text-caption text-medium-emphasis">
                ({{ summary.metrics.criticalBlockerCount }} kritis, {{ summary.metrics.overdueAcknowledgementCount }} SLA)
              </span>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Memerlukan tindakan segera
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Exception Items List Toggle -->
      <div v-if="summary && summary.exceptions.length > 0" class="mt-4 pt-3 border-t">
        <div
          class="d-flex align-center justify-space-between cursor-pointer py-1"
          @click="showExceptions = !showExceptions"
        >
          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="showExceptions ? 'mdi-chevron-down' : 'mdi-chevron-right'"
              size="20"
            />
            <span class="text-body-2 font-weight-bold">
              Rincian Daftar Pengecualian Hari Ini ({{ summary.exceptions.length }} isu)
            </span>
          </div>
          <span class="text-caption text-primary font-weight-medium">
            {{ showExceptions ? 'Sembunyikan' : 'Tampilkan' }}
          </span>
        </div>

        <v-expand-transition>
          <div v-show="showExceptions" class="mt-3 d-flex flex-column ga-2">
            <v-card
              v-for="(exc, idx) in summary.exceptions"
              :key="idx"
              variant="outlined"
              class="pa-3 rounded border-subtle bg-surface-elevated"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <div class="d-flex align-center ga-2">
                  <v-chip
                    size="x-small"
                    :color="getExceptionChipColor(exc.type)"
                    class="font-weight-bold text-uppercase"
                  >
                    {{ getExceptionLabel(exc.type) }}
                  </v-chip>
                  <span class="text-subtitle-2 font-weight-bold">{{ exc.userName || exc.title }}</span>
                  <span v-if="exc.userFunction" class="text-caption text-medium-emphasis">
                    ({{ exc.userFunction }})
                  </span>
                </div>
                <span class="text-caption text-medium-emphasis">{{ exc.details }}</span>
              </div>
            </v-card>
          </div>
        </v-expand-transition>
      </div>

      <!-- Zero Exceptions State -->
      <div
        v-else-if="summary && summary.exceptions.length === 0"
        class="mt-3 py-3 text-center text-caption text-medium-emphasis border-t"
      >
        <v-icon icon="mdi-check-circle-outline" color="success" class="mr-1" />
        Tidak ada pengecualian operasional atau blocker kritis aktif saat ini.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useExceptionSummaryQuery } from '../../queries/useReporting.js';

interface Props {
  scope?: 'Team' | 'Function' | 'Company';
  date?: string;
}

const props = withDefaults(defineProps<Props>(), {
  scope: 'Team',
});

const showExceptions = ref<boolean>(false);

const { data: summary, isLoading, isFetching, refetch } = useExceptionSummaryQuery(
  () => props.scope,
  () => props.date,
);

const scopeTitle = computed(() => {
  switch (props.scope) {
    case 'Company':
      return 'Perusahaan';
    case 'Function':
      return 'Fungsi / Departemen';
    case 'Team':
    default:
      return 'Tim';
  }
});

const formattedDate = computed(() => {
  const d = props.date ? new Date(props.date) : new Date();
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

function getExceptionChipColor(type: string): string {
  switch (type) {
    case 'CRITICAL_BLOCKER':
    case 'OVERDUE_ACKNOWLEDGEMENT':
    case 'RISK_RED':
      return 'error';
    case 'NO_SUBMISSION':
    case 'RISK_AMBER':
      return 'warning';
    default:
      return 'secondary';
  }
}

function getExceptionLabel(type: string): string {
  switch (type) {
    case 'NO_SUBMISSION':
      return 'Belum Mengisi';
    case 'RISK_RED':
      return 'Status Merah';
    case 'RISK_AMBER':
      return 'Status Kuning';
    case 'CRITICAL_BLOCKER':
      return 'Blocker Kritis';
    case 'OVERDUE_ACKNOWLEDGEMENT':
      return 'SLA Overdue';
    default:
      return type;
  }
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
