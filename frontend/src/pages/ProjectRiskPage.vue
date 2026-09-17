<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-chart-timeline-variant-shimmer" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Project Risk View</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Agregasi risiko proyek berdasarkan referensi tiket/tugas lintas tim (Cakupan Project Manager)
        </p>
      </div>

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

    <!-- Alert Info (PRD §4.13) -->
    <v-alert
      type="info"
      variant="tonal"
      density="compact"
      class="mb-6 rounded-lg text-caption"
    >
      Halaman ini menampilkan komitmen anggota tim yang merujuk pada <strong>Reference Link</strong> yang sama. Item dengan status risiko AMBER/RED atau dengan kelanjutan "Continue" berulang kali akan disorot.
    </v-alert>

    <v-card variant="outlined" class="rounded-lg border-subtle mb-6">
      <v-card-item class="bg-surface-variant border-b py-3">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <v-card-title class="text-subtitle-1 font-weight-bold">
            Agregasi Reference / Task
          </v-card-title>
          <v-btn
            size="small"
            variant="text"
            icon="mdi-refresh"
            :loading="isFetching"
            @click="refetch"
          />
        </div>
      </v-card-item>

      <v-card-text class="pa-4 pa-md-6">
        <div v-if="isLoading" class="py-8 text-center">
          <v-progress-circular indeterminate color="primary" />
          <div class="text-caption text-medium-emphasis mt-2">Memuat agregasi proyek...</div>
        </div>

        <div
          v-else-if="groupedProjects.length === 0"
          class="py-12 text-center text-medium-emphasis border rounded-lg"
        >
          <v-icon icon="mdi-file-tree-outline" size="48" class="mb-2" />
          <div>Tidak ada data komitmen dengan referensi yang ditemukan pada hari ini.</div>
        </div>

        <div v-else class="d-flex flex-column ga-4">
          <v-card
            v-for="group in groupedProjects"
            :key="group.reference"
            variant="outlined"
            :class="[
              'rounded-lg border-subtle transition-all',
              group.hasRisk ? 'border-red-subtle bg-red-lighten-5' : 'bg-surface'
            ]"
          >
            <v-card-item class="pb-2">
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div class="d-flex align-center ga-2">
                  <v-icon
                    :icon="group.hasRisk ? 'mdi-alert' : 'mdi-link-variant'"
                    :color="group.hasRisk ? 'error' : 'primary'"
                  />
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold text-truncate" style="max-width: 400px">
                      {{ group.reference }}
                    </h3>
                    <div class="text-caption text-medium-emphasis">
                      {{ group.items.length }} Komitmen Terkait
                    </div>
                  </div>
                </div>
                
                <div class="d-flex align-center ga-2">
                  <v-chip
                    v-if="group.redCount > 0"
                    size="small"
                    color="error"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ group.redCount }} Risiko Merah
                  </v-chip>
                  <v-chip
                    v-if="group.amberCount > 0"
                    size="small"
                    color="warning"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ group.amberCount }} Risiko Kuning
                  </v-chip>
                </div>
              </div>
            </v-card-item>

            <v-card-text>
              <v-divider class="mb-3" />
              <div class="d-flex flex-column ga-2">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="d-flex flex-wrap align-center justify-space-between ga-2 pa-2 rounded border"
                  :class="{ 'bg-red-lighten-5 border-red-subtle': item.initialRisk === 'RED', 'bg-orange-lighten-5 border-warning': item.initialRisk === 'AMBER' }"
                >
                  <div class="d-flex align-start ga-2">
                    <v-avatar color="primary" size="24" class="mt-1">
                      <span class="text-white text-caption font-weight-bold">
                        {{ getInitials(item.userName) }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2">{{ item.description }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ item.userName }} &bull; {{ item.userFunction }}
                      </div>
                      <div v-if="item.continuation === 'Continue'" class="text-caption text-warning mt-1 font-weight-bold">
                        <v-icon icon="mdi-history" size="12" class="mr-1" />
                        Carry Over / Berulang
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <v-chip
                      size="x-small"
                      :color="item.initialRisk === 'RED' ? 'error' : item.initialRisk === 'AMBER' ? 'warning' : 'success'"
                      variant="tonal"
                      class="font-weight-bold mb-1"
                    >
                      Risk: {{ item.initialRisk }}
                    </v-chip>
                    <div class="text-caption text-medium-emphasis">
                      {{ item.outcomeStatus || 'Pending EOD' }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDailyRecordsQuery } from '../queries/useDailyRecords.js';

const todayStr = new Date().toISOString().slice(0, 10);
const selectedDate = ref<string>(todayStr);

const {
  data: dailyData,
  isLoading,
  isFetching,
  refetch,
} = useDailyRecordsQuery(() => ({
  date: selectedDate.value,
  scope: 'Company', // Diubah menjadi 'Company' untuk mensimulasikan PM scope lintas fungsi
}));

interface GroupedProject {
  reference: string;
  items: any[];
  redCount: number;
  amberCount: number;
  hasRisk: boolean;
}

const groupedProjects = computed<GroupedProject[]>(() => {
  const records = dailyData.value?.items || [];
  const groups = new Map<string, GroupedProject>();

  records.forEach((record) => {
    if (!record.commitments) return;
    
    record.commitments.forEach((cmt) => {
      if (!cmt.referenceUrl) return;
      
      const refUrl = cmt.referenceUrl.trim();
      if (!refUrl) return;

      if (!groups.has(refUrl)) {
        groups.set(refUrl, {
          reference: refUrl,
          items: [],
          redCount: 0,
          amberCount: 0,
          hasRisk: false,
        });
      }

      const group = groups.get(refUrl)!;
      group.items.push({
        ...cmt,
        userName: record.user?.fullName || record.user?.email || 'User',
        userFunction: record.user?.function || 'Tim',
      });

      if (cmt.initialRisk === 'RED') group.redCount++;
      if (cmt.initialRisk === 'AMBER') group.amberCount++;
      if (cmt.initialRisk === 'RED' || cmt.initialRisk === 'AMBER' || cmt.continuation === 'Continue') {
        group.hasRisk = true;
      }
    });
  });

  return Array.from(groups.values()).sort((a, b) => {
    if (a.hasRisk && !b.hasRisk) return -1;
    if (!a.hasRisk && b.hasRisk) return 1;
    return b.items.length - a.items.length;
  });
});

function getInitials(name: string) {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
.max-w-7xl { max-width: 1280px; margin: 0 auto; }
</style>
