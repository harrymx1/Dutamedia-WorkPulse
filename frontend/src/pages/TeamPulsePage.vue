<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <!-- Header Page -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
      <div>
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-account-group" color="primary" size="28" />
          <h1 class="text-h4 font-weight-bold">Team Pulse</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Dashboard Akuntabilitas Harian Tim &amp; Antrean Blocker (Cakupan Supervisor / Team Lead)
        </p>
      </div>

      <!-- Filter Tanggal -->
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

    <!-- 1. Shared ExceptionSummaryWidget (SAD §13.2) -->
    <ExceptionSummaryWidget scope="Team" :date="selectedDate" />

    <!-- 2. Main Workspace Navigation Tabs -->
    <v-card variant="outlined" class="rounded-lg border-subtle mb-6">
      <v-tabs v-model="activeTab" color="primary" class="border-b">
        <v-tab value="roster" class="text-none font-weight-bold">
          <v-icon icon="mdi-format-list-checks" class="mr-2" />
          Roster Akuntabilitas Tim ({{ rosterList.length }})
        </v-tab>
        <v-tab value="blockers" class="text-none font-weight-bold">
          <v-icon icon="mdi-alert-octagon-outline" class="mr-2" />
          Blocker Terbuka ({{ openBlockers.length }})
        </v-tab>
        <v-tab value="reviews" class="text-none font-weight-bold">
          <v-icon icon="mdi-clipboard-check-outline" class="mr-2" />
          Review Koreksi &amp; Cuti
          <v-chip
            v-if="pendingCorrections.length + pendingLeaves.length > 0"
            size="x-small"
            color="warning"
            class="ml-2 font-weight-bold"
          >
            {{ pendingCorrections.length + pendingLeaves.length }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4 pa-md-6">
        <!-- ============================================================= -->
        <!-- TAB 1: ROSTER AKUNTABILITAS TIM -->
        <!-- ============================================================= -->
        <div v-if="activeTab === 'roster'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <h2 class="text-subtitle-1 font-weight-bold">Daftar Anggota Tim</h2>
            <v-btn
              size="small"
              variant="text"
              icon="mdi-refresh"
              :loading="isFetchingRoster"
              @click="refetchRoster"
            />
          </div>

          <!-- Loading Roster -->
          <div v-if="isLoadingRoster" class="py-8 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="text-caption text-medium-emphasis mt-2">Memuat data anggota tim...</div>
          </div>

          <!-- Empty Roster -->
          <div
            v-else-if="rosterList.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-account-off-outline" size="48" class="mb-2" />
            <div>Tidak ada data aktivitas anggota tim untuk tanggal yang dipilih.</div>
          </div>

          <!-- Roster Cards List -->
          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="record in rosterList"
              :key="record.id"
              variant="outlined"
              :class="[
                'pa-4 rounded-lg border-subtle transition-all',
                (record.status || record.finalStatus) === 'RED' ? 'border-red-subtle bg-red-lighten-5' : 'bg-surface'
              ]"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <!-- User Profile & Status Badges -->
                <div class="d-flex align-center ga-3 min-w-0">
                  <v-avatar color="primary" size="36" class="font-weight-bold text-white text-caption">
                    {{ getInitials(record.user?.fullName || record.user?.email || 'User') }}
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-2 font-weight-bold text-truncate">
                      {{ record.user?.fullName || record.user?.email }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ record.user?.function || 'Engineering' }}
                    </div>
                  </div>
                </div>

                <!-- Badges -->
                <div class="d-flex align-center flex-wrap ga-2">
                  <StatusBadge :status="record.status || record.finalStatus || 'GREEN'" />
                  <SubmissionTimingBadge :timing="record.morningSubmissionTiming" />
                  <v-chip
                    v-if="record.blockers && record.blockers.length > 0"
                    size="small"
                    color="error"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ record.blockers.length }} Blocker
                  </v-chip>
                </div>

                <!-- Komitmen Count Meta -->
                <div class="text-body-2 text-medium-emphasis">
                  <strong class="text-high-emphasis">{{ record.commitments?.length || 0 }}</strong> Komitmen
                  <span v-if="record.commitments && record.commitments.length > 0" class="text-caption">
                    ({{ getCompletedCommitmentCount(record.commitments) }} selesai)
                  </span>
                </div>

                <!-- Actions -->
                <div class="d-flex align-center ga-2">
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-comment-text-outline"
                    @click="openManagerNote(record.userId || record.employeeUserId || record.user?.id || '', record.user?.fullName || record.user?.email || 'Anggota')"
                  >
                    Catatan Pembinaan
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    icon="mdi-chevron-down"
                    :class="{ 'rotate-180': expandedRecordId === record.id }"
                    @click="toggleExpandRecord(record.id)"
                  />
                </div>
              </div>

              <!-- Expanded Commitments & Blockers Details -->
              <v-expand-transition>
                <div v-show="expandedRecordId === record.id" class="mt-4 pt-4 border-t">
                  <h3 class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">
                    Daftar Komitmen Hari Ini
                  </h3>
                  <div
                    v-if="!record.commitments || record.commitments.length === 0"
                    class="text-caption text-medium-emphasis py-2"
                  >
                    Belum ada komitmen yang didaftarkan.
                  </div>
                  <div v-else class="d-flex flex-column ga-2">
                    <div
                      v-for="comm in record.commitments"
                      :key="comm.id"
                      class="pa-3 rounded border bg-surface-elevated d-flex align-center justify-space-between flex-wrap ga-2"
                    >
                      <div class="text-body-2 font-weight-medium">{{ comm.description || comm.taskDescription }}</div>
                      <div class="d-flex align-center ga-2">
                        <v-chip size="x-small" variant="outlined">
                          {{ comm.initialRisk || 'GREEN' }}
                        </v-chip>
                        <v-chip
                          size="x-small"
                          :color="getOutcomeColor(comm.outcomeStatus || comm.outcome || undefined)"
                          class="font-weight-bold"
                        >
                          {{ comm.outcomeStatus || comm.outcome || 'Pending' }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </v-card>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 2: BLOCKER TERBUKA TIM -->
        <!-- ============================================================= -->
        <div v-else-if="activeTab === 'blockers'">
          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
            <div>
              <h2 class="text-subtitle-1 font-weight-bold">Antrean Blocker Terbuka</h2>
              <p class="text-caption text-medium-emphasis">
                Kendala yang memerlukan tindak lanjut atau koordinasi wewenang lintas fungsi
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

          <!-- Empty State -->
          <div
            v-if="openBlockers.length === 0"
            class="py-12 text-center text-medium-emphasis border rounded-lg"
          >
            <v-icon icon="mdi-check-circle-outline" color="success" size="48" class="mb-2" />
            <div class="font-weight-bold">Semua Blocker Selesai</div>
            <div class="text-caption">Tidak ada kendala aktif yang belum diselesaikan pada tim ini.</div>
          </div>

          <!-- Blocker List -->
          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="blocker in openBlockers"
              :key="blocker.id"
              variant="outlined"
              :class="[
                'pa-4 rounded-lg border-subtle',
                blocker.severity === 'Critical' ? 'border-red-subtle bg-red-lighten-5' : 'bg-surface'
              ]"
            >
              <div class="d-flex align-start justify-space-between flex-wrap ga-3">
                <div class="d-flex align-start ga-3">
                  <v-avatar
                    size="28"
                    :color="blocker.severity === 'Critical' ? 'error' : 'warning'"
                    class="mt-1"
                  >
                    <v-icon icon="mdi-alert-circle-outline" size="18" color="white" />
                  </v-avatar>
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
                      Target Pemilik: <strong>{{ blocker.ownerNeededName || 'Pending Assignment' }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="d-flex align-center ga-2">
                  <v-btn
                    v-if="blocker.status === 'Open'"
                    size="small"
                    color="primary"
                    variant="tonal"
                    @click="openBlockerAction(blocker, 'acknowledge')"
                  >
                    Akui (Acknowledge)
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    @click="openBlockerAction(blocker, 'update')"
                  >
                    Perbarui Progres
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

        <!-- ============================================================= -->
        <!-- TAB 3: REVIEW KOREKSI & PERMOHONAN CUTI (EPIC-20-T3) -->
        <!-- ============================================================= -->
        <div v-else-if="activeTab === 'reviews'">
          <div class="mb-6">
            <h2 class="text-subtitle-1 font-weight-bold mb-1">
              Permohonan Koreksi Komitmen (Pending Objection Window)
            </h2>
            <p class="text-caption text-medium-emphasis mb-3">
              Permohonan koreksi material yang menunggu masa sanggah keberatan 48 jam (SAD §9.6)
            </p>

            <div
              v-if="pendingCorrections.length === 0"
              class="py-6 text-center text-caption text-medium-emphasis border rounded-lg"
            >
              Tidak ada permohonan koreksi pending saat ini.
            </div>

            <div v-else class="d-flex flex-column ga-2">
              <v-card
                v-for="req in pendingCorrections"
                :key="req.id"
                variant="outlined"
                class="pa-3 rounded border-subtle bg-surface"
              >
                <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                  <div>
                    <div class="d-flex align-center ga-2 mb-1">
                      <span class="text-subtitle-2 font-weight-bold">{{ req.userName || 'Karyawan' }}</span>
                      <ClassificationTag :classification="req.classification" />
                      <ObjectionWindowIndicator
                        v-if="req.objectionWindowDeadline"
                        :target-date="req.objectionWindowDeadline"
                      />
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Perubahan yang diminta: {{ JSON.stringify(req.requestedChanges) }}
                    </div>
                  </div>

                  <v-btn
                    size="small"
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-hand-back-right-outline"
                    @click="openObjectCorrection(req)"
                  >
                    Ajukan Keberatan
                  </v-btn>
                </div>
              </v-card>
            </div>
          </div>

          <v-divider class="my-6" />

          <!-- Persetujuan Cuti -->
          <div>
            <h2 class="text-subtitle-1 font-weight-bold mb-1">Permohonan Cuti Tertunda (Leave Approvals)</h2>
            <p class="text-caption text-medium-emphasis mb-3">
              Persetujuan cuti anggota tim (SAD §10.6, FR-47)
            </p>

            <div
              v-if="pendingLeaves.length === 0"
              class="py-6 text-center text-caption text-medium-emphasis border rounded-lg"
            >
              Tidak ada permohonan cuti tertunda saat ini.
            </div>

            <div v-else class="d-flex flex-column ga-2">
              <v-card
                v-for="leave in pendingLeaves"
                :key="leave.id"
                variant="outlined"
                class="pa-3 rounded border-subtle bg-surface"
              >
                <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">{{ leave.userName || 'Karyawan' }}</div>
                    <div class="text-caption text-medium-emphasis">
                      Periode: <strong>{{ formatDate(leave.startDate) }} s.d. {{ formatDate(leave.endDate) }}</strong>
                    </div>
                    <div class="text-caption mt-1">Alasan: "{{ leave.reason }}"</div>
                  </div>

                  <div class="d-flex align-center ga-2">
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      :loading="isRejectingLeave"
                      @click="handleRejectLeave(leave.id)"
                    >
                      Tolak
                    </v-btn>
                    <v-btn
                      size="small"
                      color="success"
                      variant="elevated"
                      :loading="isApprovingLeave"
                      @click="handleApproveLeave(leave.id)"
                    >
                      Setujui
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialogs -->
    <ManagerNoteModal
      v-model="showManagerNoteModal"
      :target-user-id="selectedTargetUserId"
      :target-user-name="selectedTargetUserName"
      @saved="handleNoteSaved"
    />

    <BlockerActionModal
      v-model="showBlockerActionModal"
      :blocker="selectedBlocker"
      :action="selectedBlockerAction"
      @success="refetchBlockers"
    />

    <!-- Dialog Keberatan Koreksi -->
    <v-dialog v-model="showObjectDialog" max-width="480">
      <v-card class="pa-2 rounded-lg">
        <v-card-title class="text-h6 font-weight-bold">Ajukan Keberatan Koreksi</v-card-title>
        <v-card-text class="pt-2">
          <p class="text-caption text-medium-emphasis mb-3">
            Tuliskan alasan keberatan atas koreksi komitmen ini sebelum batas waktu berakhir.
          </p>
          <v-textarea
            v-model="objectionReason"
            label="Alasan Keberatan"
            variant="outlined"
            rows="3"
            :rules="[(v: string) => !!v || 'Alasan keberatan wajib diisi']"
          />
        </v-card-text>
        <v-card-actions class="px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="showObjectDialog = false">Batal</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="!objectionReason.trim()"
            :loading="isObjectingCorrection"
            @click="submitObjectCorrection"
          >
            Kirim Keberatan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ExceptionSummaryWidget from '../components/management/ExceptionSummaryWidget.vue';
import ManagerNoteModal from '../components/management/ManagerNoteModal.vue';
import BlockerActionModal from '../components/management/BlockerActionModal.vue';
import {
  StatusBadge,
  SubmissionTimingBadge,
  ClassificationTag,
  ObjectionWindowIndicator,
} from '../components/shared/index.js';
import { useDailyRecordsQuery } from '../queries/useDailyRecords.js';
import { useBlockersListQuery } from '../queries/useBlockers.js';
import {
  useCorrectionRequestsQuery,
  useObjectCorrectionMutation,
} from '../queries/useCorrectionRequests.js';
import {
  useExceptionsQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
} from '../queries/useExceptions.js';
import type { BlockerItem, CorrectionRequestItem } from '../types/management.js';

const todayStr = new Date().toISOString().slice(0, 10);
const selectedDate = ref<string>(todayStr);
const activeTab = ref<'roster' | 'blockers' | 'reviews'>('roster');
const expandedRecordId = ref<string | null>(null);

// Manager Note Modal State
const showManagerNoteModal = ref<boolean>(false);
const selectedTargetUserId = ref<string>('');
const selectedTargetUserName = ref<string>('');

// Blocker Action Modal State
const showBlockerActionModal = ref<boolean>(false);
const selectedBlocker = ref<BlockerItem | null>(null);
const selectedBlockerAction = ref<'acknowledge' | 'update' | 'resolve' | 'acceptRisk' | 'close' | 'support'>('update');

// Objection Dialog State
const showObjectDialog = ref<boolean>(false);
const selectedCorrection = ref<CorrectionRequestItem | null>(null);
const objectionReason = ref<string>('');

// Queries
const {
  data: dailyData,
  isLoading: isLoadingRoster,
  isFetching: isFetchingRoster,
  refetch: refetchRoster,
} = useDailyRecordsQuery(() => ({
  date: selectedDate.value,
  scope: 'Team',
}));

const {
  data: blockersData,
  isFetching: isFetchingBlockers,
  refetch: refetchBlockers,
} = useBlockersListQuery({
  status: 'Open',
  scope: 'Team',
});

const { data: correctionsData, refetch: refetchCorrections } = useCorrectionRequestsQuery({
  status: 'Pending',
  scope: 'Team',
});

const { data: exceptionsData, refetch: refetchExceptions } = useExceptionsQuery({
  type: 'Leave',
  status: 'Pending',
});

// Mutations
const objectMutation = useObjectCorrectionMutation();
const approveLeaveMutation = useApproveLeaveMutation();
const rejectLeaveMutation = useRejectLeaveMutation();

const isObjectingCorrection = computed(() => objectMutation.isPending.value);
const isApprovingLeave = computed(() => approveLeaveMutation.isPending.value);
const isRejectingLeave = computed(() => rejectLeaveMutation.isPending.value);

const rosterList = computed(() => dailyData.value?.items || []);
const openBlockers = computed(() => blockersData.value?.blockers || []);
const pendingCorrections = computed(() => correctionsData.value?.requests || []);
const pendingLeaves = computed(() => exceptionsData.value?.exceptions || []);

function toggleExpandRecord(recordId: string) {
  expandedRecordId.value = expandedRecordId.value === recordId ? null : recordId;
}

function openManagerNote(userId: string, userName: string) {
  selectedTargetUserId.value = userId;
  selectedTargetUserName.value = userName;
  showManagerNoteModal.value = true;
}

function handleNoteSaved() {
  refetchRoster();
}

function openBlockerAction(
  blocker: BlockerItem,
  action: 'acknowledge' | 'update' | 'resolve' | 'acceptRisk' | 'close' | 'support',
) {
  selectedBlocker.value = blocker;
  selectedBlockerAction.value = action;
  showBlockerActionModal.value = true;
}

function openObjectCorrection(req: CorrectionRequestItem) {
  selectedCorrection.value = req;
  objectionReason.value = '';
  showObjectDialog.value = true;
}

async function submitObjectCorrection() {
  if (!selectedCorrection.value || !objectionReason.value.trim()) return;
  try {
    await objectMutation.mutateAsync({
      id: selectedCorrection.value.id,
      payload: { objectionReason: objectionReason.value.trim() },
    });
    showObjectDialog.value = false;
    refetchCorrections();
  } catch (err: any) {
    alert(err.message || 'Gagal mengajukan keberatan.');
  }
}

async function handleApproveLeave(id: string) {
  try {
    await approveLeaveMutation.mutateAsync(id);
    refetchExceptions();
  } catch (err: any) {
    alert(err.message || 'Gagal menyetujui cuti.');
  }
}

async function handleRejectLeave(id: string) {
  const reason = prompt('Masukkan alasan penolakan cuti:');
  if (!reason) return;
  try {
    await rejectLeaveMutation.mutateAsync({ id, payload: { reason } });
    refetchExceptions();
  } catch (err: any) {
    alert(err.message || 'Gagal menolak cuti.');
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

function getCompletedCommitmentCount(commitments: any[]): number {
  return commitments.filter((c) => (c.outcomeStatus || c.outcome) === 'Completed').length;
}

function getOutcomeColor(outcome?: string): string {
  switch (outcome) {
    case 'Completed':
      return 'success';
    case 'PartiallyCompleted':
      return 'warning';
    case 'NotCompleted':
      return 'error';
    case 'Cancelled':
      return 'grey';
    default:
      return 'primary';
  }
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
.border-red-subtle {
  border-color: rgba(220, 38, 38, 0.3) !important;
}
.bg-surface-elevated {
  background-color: #eff5f2 !important;
}
.rotate-180 {
  transform: rotate(180deg);
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
