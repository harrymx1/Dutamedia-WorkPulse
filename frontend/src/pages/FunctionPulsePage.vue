<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <!-- Header Page -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-domain" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Function Pulse</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Overview Akuntabilitas Lintas Tim &amp; Eskalasi Departemen (Cakupan Head of Department)
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

    <!-- 1. Shared ExceptionSummaryWidget (scope: Function) -->
    <ExceptionSummaryWidget scope="Function" :date="selectedDate" />

    <!-- 2. Main Tabs: Roster Departemen & Eskalasi Blocker -->
    <v-card variant="outlined" class="rounded-lg border-subtle mb-6">
      <v-tabs v-model="activeTab" color="primary" class="border-b">
        <v-tab value="roster" class="text-none font-weight-bold">
          <v-icon icon="mdi-account-group" class="mr-2" />
          Roster Seluruh Tim ({{ records.length }})
        </v-tab>
        <v-tab value="escalations" class="text-none font-weight-bold">
          <v-icon icon="mdi-alert-octagon" class="mr-2" />
          Eskalasi Blocker Lintas Tim ({{ escalationBlockers.length }})
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4 pa-md-6">
        <!-- TAB 1: Roster Departemen -->
        <div v-if="activeTab === 'roster'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <h2 class="text-subtitle-1 font-weight-bold">Akuntabilitas Anggota Departemen</h2>
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
            <div class="text-caption text-medium-emphasis mt-2">Memuat data departemen...</div>
          </div>

          <div
            v-else-if="records.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-account-off-outline" size="48" class="mb-2" />
            <div>Tidak ada data aktivitas anggota pada tanggal ini.</div>
          </div>

          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="rec in records"
              :key="rec.id"
              variant="outlined"
              :class="[
                'pa-4 rounded-lg border-subtle',
                (rec.status || rec.finalStatus) === 'RED' ? 'border-red-subtle bg-red-lighten-5' : 'bg-surface'
              ]"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div class="d-flex align-center ga-3 min-w-0">
                  <v-avatar color="primary" size="36" class="font-weight-bold text-white text-caption">
                    {{ getInitials(rec.user?.fullName || rec.user?.email || 'User') }}
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 font-weight-bold text-truncate">
                      {{ rec.user?.fullName || rec.user?.email }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ rec.user?.function || 'Engineering' }}
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center flex-wrap ga-2">
                  <StatusBadge :status="rec.status || rec.finalStatus || 'GREEN'" />
                  <SubmissionTimingBadge :timing="rec.morningSubmissionTiming" />
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  <strong>{{ rec.commitments?.length || 0 }}</strong> Komitmen
                </div>

                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-comment-text-outline"
                  @click="openManagerNote(rec.userId || rec.employeeUserId || rec.user?.id || '', rec.user?.fullName || rec.user?.email || 'Anggota')"
                >
                  Catatan Pembinaan
                </v-btn>
              </div>
            </v-card>
          </div>
        </div>

        <!-- TAB 2: Eskalasi Blocker Lintas Tim -->
        <div v-else-if="activeTab === 'escalations'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <div>
              <h2 class="text-subtitle-1 font-weight-bold">Eskalasi Blocker Lintas Tim</h2>
              <p class="text-caption text-medium-emphasis">
                Blocker dengan tingkat keparahan Critical / High atau yang melampaui SLA respon (SAD §10.4)
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

          <div
            v-if="escalationBlockers.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-shield-check-outline" color="success" size="48" class="mb-2" />
            <div class="font-weight-bold">Tidak Ada Eskalasi Aktif</div>
            <div class="text-caption">Seluruh kendala lintas fungsi tertangani dalam SLA yang ditetapkan.</div>
          </div>

          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="blocker in escalationBlockers"
              :key="blocker.id"
              variant="outlined"
              class="pa-4 rounded-lg border-subtle bg-surface"
            >
              <div class="d-flex align-start justify-space-between flex-wrap ga-3">
                <div>
                  <div class="d-flex align-center flex-wrap ga-2 mb-1">
                    <span class="text-subtitle-2 font-weight-bold">{{ blocker.description }}</span>
                    <v-chip
                      size="x-small"
                      :color="blocker.severity === 'Critical' ? 'error' : 'warning'"
                      class="font-weight-bold text-uppercase"
                    >
                      {{ blocker.severity }}
                    </v-chip>
                    <v-chip size="x-small" variant="outlined">
                      Status: {{ blocker.status }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Pelapor: <strong>{{ blocker.raisedByName || 'Karyawan' }}</strong> |
                    Penanggung Jawab: <strong>{{ blocker.ownerNeededName || 'Pending Assignment' }}</strong>
                  </div>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    @click="openBlockerAction(blocker, 'update')"
                  >
                    Update Progres
                  </v-btn>
                  <v-btn
                    size="small"
                    color="success"
                    variant="elevated"
                    @click="openBlockerAction(blocker, 'resolve')"
                  >
                    Selesaikan
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialogs -->
    <ManagerNoteModal
      v-model="showManagerNoteModal"
      :target-user-id="selectedTargetUserId"
      :target-user-name="selectedTargetUserName"
      @saved="refetchRecords"
    />

    <BlockerActionModal
      v-model="showBlockerActionModal"
      :blocker="selectedBlocker"
      :action="selectedBlockerAction"
      @success="refetchBlockers"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ExceptionSummaryWidget from '../components/management/ExceptionSummaryWidget.vue';
import ManagerNoteModal from '../components/management/ManagerNoteModal.vue';
import BlockerActionModal from '../components/management/BlockerActionModal.vue';
import { StatusBadge, SubmissionTimingBadge } from '../components/shared/index.js';
import { useDailyRecordsQuery } from '../queries/useDailyRecords.js';
import { useBlockersListQuery } from '../queries/useBlockers.js';
import type { BlockerItem } from '../types/management.js';

const todayStr = new Date().toISOString().slice(0, 10);
const selectedDate = ref<string>(todayStr);
const activeTab = ref<'roster' | 'escalations'>('roster');

// Modals
const showManagerNoteModal = ref<boolean>(false);
const selectedTargetUserId = ref<string>('');
const selectedTargetUserName = ref<string>('');

const showBlockerActionModal = ref<boolean>(false);
const selectedBlocker = ref<BlockerItem | null>(null);
const selectedBlockerAction = ref<'acknowledge' | 'update' | 'resolve' | 'acceptRisk' | 'close' | 'support'>('update');

const {
  data: dailyData,
  isLoading: isLoadingRecords,
  isFetching: isFetchingRecords,
  refetch: refetchRecords,
} = useDailyRecordsQuery(() => ({
  date: selectedDate.value,
  scope: 'Function',
}));

const {
  data: blockersData,
  isFetching: isFetchingBlockers,
  refetch: refetchBlockers,
} = useBlockersListQuery({
  scope: 'Function',
});

const records = computed(() => dailyData.value?.items || []);
const escalationBlockers = computed(() => {
  const all = blockersData.value?.blockers || [];
  return all.filter((b) => b.severity === 'Critical' || b.severity === 'High' || b.status === 'Open');
});

function openManagerNote(userId: string, userName: string) {
  selectedTargetUserId.value = userId;
  selectedTargetUserName.value = userName;
  showManagerNoteModal.value = true;
}

function openBlockerAction(
  blocker: BlockerItem,
  action: 'acknowledge' | 'update' | 'resolve' | 'acceptRisk' | 'close' | 'support',
) {
  selectedBlocker.value = blocker;
  selectedBlockerAction.value = action;
  showBlockerActionModal.value = true;
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
</script>

<style scoped>
.border-subtle {
  border-color: #dce7e2 !important;
}
.border-red-subtle {
  border-color: rgba(220, 38, 38, 0.3) !important;
}
</style>
