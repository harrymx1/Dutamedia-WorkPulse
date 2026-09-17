<template>
  <v-container class="py-6 max-w-1200">
    <!-- Header Area: Title & Instant Blocker Action -->
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <div class="d-flex align-center gap-2">
          <h1 class="text-h4 font-weight-bold">My Today</h1>
          <v-chip
            v-if="record?.finalStatus"
            size="small"
            :color="record.finalStatus === 'GREEN' ? 'success' : record.finalStatus === 'AMBER' ? 'warning' : 'error'"
            variant="flat"
            class="font-weight-bold"
          >
            STATUS: {{ record.finalStatus }}
          </v-chip>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Morning Commitment, Pekerjaan Tambahan & EOD Accountability Log
        </p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          color="error"
          variant="tonal"
          prepend-icon="mdi-alert-octagon"
          class="font-weight-medium"
          @click="showRaiseBlockerModal = true"
        >
          Raise Instant Blocker
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-3">Memuat akuntabilitas hari ini...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="isError"
      type="error"
      variant="tonal"
      class="mb-6"
    >
      Gagal memuat data akuntabilitas hari ini. Silakan muat ulang halaman.
    </v-alert>

    <div v-else>
      <!-- Cutoff Countdown Banner -->
      <v-card
        variant="tonal"
        :color="isCutoffLocked ? 'grey' : isMorningSubmitted ? 'info' : 'primary'"
        class="mb-6 rounded-lg pa-4 border"
      >
        <div class="d-flex flex-wrap align-center justify-space-between gap-3">
          <div class="d-flex align-center">
            <v-icon
              :icon="isCutoffLocked ? 'mdi-lock' : 'mdi-clock-outline'"
              size="28"
              class="mr-3"
            />
            <div>
              <div class="text-subtitle-2 font-weight-bold">
                {{ countdownTitle }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ countdownSubtitle }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-h6 font-weight-bold font-mono">
              {{ countdownDisplay }}
            </div>
          </div>
        </div>
      </v-card>

      <!-- Draft Copy-Forward Banner jika ada -->
      <v-alert
        v-if="!isMorningSubmitted && draftCopyForwardText"
        type="info"
        variant="tonal"
        class="mb-6 border"
        closable
      >
        <template #title>
          <span class="font-weight-bold">Draft Copy-Forward Terdeteksi</span>
        </template>
        Ditemukan catatan <em>Tomorrow Priority</em> dari hari kemarin:
        <strong class="d-block my-1">"{{ draftCopyForwardText }}"</strong>
        <div class="mt-2 d-flex gap-2">
          <v-btn size="small" color="primary" variant="flat" @click="applyDraftToSlot">
            Gunakan Sebagai Komitmen 1
          </v-btn>
        </div>
      </v-alert>

      <!-- ================================================================= -->
      <!-- SECTION 1: MORNING COMMITMENT                                      -->
      <!-- ================================================================= -->
      <v-card class="mb-6 rounded-lg border elevation-0">
        <v-card-item class="bg-surface-variant border-b py-3">
          <div class="d-flex flex-wrap align-center justify-space-between gap-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-weather-sunset-up" color="primary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                1. Morning Commitment
              </v-card-title>
            </div>

            <div class="d-flex align-center gap-2">
              <v-chip
                v-if="isMorningSubmitted"
                color="success"
                size="small"
                prepend-icon="mdi-check-circle"
                variant="flat"
              >
                Terserahkan
              </v-chip>
              <SubmissionTimingBadge
                v-if="record?.morningCutoffTiming"
                :timing="record.morningCutoffTiming"
              />
              <v-chip
                v-if="isCutoffLocked"
                color="error"
                size="small"
                prepend-icon="mdi-lock"
                variant="tonal"
              >
                Baseline Locked
              </v-chip>
            </div>
          </div>
        </v-card-item>

        <v-card-text class="pa-6">
          <!-- State A: Form Input Morning Check-in -->
          <div v-if="!isMorningSubmitted">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Tentukan moda kerja dan ajukan 1 hingga 3 komitmen utama sebelum batas waktu cutoff pagi.
            </p>

            <v-alert
              v-if="morningError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              closable
              @click:close="morningError = ''"
            >
              {{ morningError }}
            </v-alert>

            <!-- Work Type Selection -->
            <div class="mb-5">
              <label class="text-caption font-weight-bold text-medium-emphasis d-block mb-2">
                MODA KERJA HARI INI *
              </label>
              <v-btn-toggle
                v-model="workType"
                mandatory
                color="primary"
                variant="outlined"
                density="comfortable"
                class="flex-wrap"
              >
                <v-btn value="WFO" prepend-icon="mdi-office-building">
                  WFO (Kantor)
                </v-btn>
                <v-btn value="WFH" prepend-icon="mdi-home">
                  WFH (Rumah)
                </v-btn>
                <v-btn value="ClientVisit" prepend-icon="mdi-briefcase-account">
                  Kunjungan Klien
                </v-btn>
                <v-btn value="BusinessTrip" prepend-icon="mdi-airplane">
                  Dinas Luar
                </v-btn>
              </v-btn-toggle>
            </div>

            <!-- 3 Commitment Slots -->
            <div
              v-for="(slot, idx) in commitmentSlots"
              :key="idx"
              class="pa-4 mb-4 rounded-lg border bg-surface"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2 font-weight-bold text-primary">
                  Komitmen #{{ idx + 1 }} {{ idx === 0 ? '*' : '(Opsional)' }}
                </span>
                <v-btn
                  v-if="idx > 0"
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  size="x-small"
                  @click="removeCommitmentSlot(idx)"
                />
              </div>

              <v-textarea
                v-model="slot.description"
                :label="`Deskripsi Komitmen ${idx + 1}`"
                :placeholder="getPromptPlaceholder(idx)"
                rows="2"
                variant="outlined"
                density="comfortable"
                class="mb-2"
              />

              <v-row dense>
                <v-col cols="12" sm="7">
                  <v-text-field
                    v-model="slot.referenceUrl"
                    label="Reference / Task Link (Opsional)"
                    placeholder="https://jira... atau #PROJ-123"
                    prepend-inner-icon="mdi-link-variant"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" sm="5">
                  <v-select
                    v-model="slot.initialRisk"
                    label="Initial Risk *"
                    :items="riskOptions"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template #selection="{ item }">
                      <v-chip
                        size="small"
                        :color="item.raw.color"
                        variant="flat"
                        class="font-weight-bold"
                      >
                        {{ item.raw.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <!-- Conditional Blocker & Support Needed saat Initial Risk AMBER/RED -->
              <v-expand-transition>
                <div v-if="slot.initialRisk === 'AMBER' || slot.initialRisk === 'RED'" class="mt-2">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="slot.knownBlocker"
                        label="Known Blocker (Hambatan yang Diantisipasi) *"
                        placeholder="Contoh: Menunggu review PR dari senior engineer"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-alert-circle-outline"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="slot.supportNeeded"
                        label="Support Needed (Bantuan yang Dibutuhkan) *"
                        placeholder="Contoh: Pairing review 15 menit dengan TL"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-handshake-outline"
                      />
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>
            </div>

            <!-- Tombol Tambah Slot jika kurang dari 3 -->
            <div class="d-flex align-center justify-space-between mt-2">
              <v-btn
                v-if="commitmentSlots.length < 3"
                variant="tonal"
                size="small"
                prepend-icon="mdi-plus"
                @click="addCommitmentSlot"
              >
                Tambah Slot Komitmen ({{ commitmentSlots.length }}/3)
              </v-btn>
              <div v-else />

              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                prepend-icon="mdi-send"
                :loading="isSubmittingMorning"
                @click="handleMorningSubmit"
              >
                Serahkan Morning Commitment
              </v-btn>
            </div>
          </div>

          <!-- State B: Tampilan Komitmen yang Sudah Diserahkan -->
          <div v-else>
            <div class="d-flex align-center gap-4 mb-4 text-caption text-medium-emphasis">
              <div>
                <strong>Moda Kerja:</strong>
                <v-chip size="x-small" color="primary" variant="tonal" class="ml-1">
                  {{ record?.workType }}
                </v-chip>
              </div>
              <div>
                <strong>Diserahkan:</strong> {{ formatTime(record?.morningSubmittedAt) }}
              </div>
            </div>

            <div class="d-flex flex-column gap-3">
              <v-card
                v-for="(item, idx) in record?.commitments || []"
                :key="item.id"
                variant="outlined"
                class="pa-4 rounded-lg bg-surface"
              >
                <div class="d-flex flex-wrap align-start justify-space-between gap-2 mb-2">
                  <div class="d-flex align-center">
                    <span class="text-subtitle-2 font-weight-bold text-primary mr-2">
                      #{{ idx + 1 }}
                    </span>
                    <span class="text-body-1 font-weight-medium">
                      {{ item.description }}
                    </span>
                  </div>

                  <div class="d-flex align-center gap-2">
                    <StatusBadge :status="item.initialRisk" />
                    <!-- Tombol Ajukan Koreksi jika baseline locked -->
                    <v-btn
                      v-if="isCutoffLocked && !record?.eodSubmittedAt"
                      variant="text"
                      size="small"
                      color="primary"
                      prepend-icon="mdi-pencil"
                      @click="openCorrectionModal(item)"
                    >
                      Ajukan Koreksi
                    </v-btn>
                  </div>
                </div>

                <div v-if="item.referenceUrl" class="text-caption text-primary mb-1">
                  <v-icon icon="mdi-link-variant" size="x-small" class="mr-1" />
                  <a :href="item.referenceUrl" target="_blank" class="text-decoration-none">
                    {{ item.referenceUrl }}
                  </a>
                </div>

                <div
                  v-if="item.knownBlocker || item.supportNeeded"
                  class="bg-amber-lighten-5 pa-2 rounded mt-2 text-caption"
                >
                  <div v-if="item.knownBlocker">
                    <strong>Known Blocker:</strong> {{ item.knownBlocker }}
                  </div>
                  <div v-if="item.supportNeeded">
                    <strong>Support Needed:</strong> {{ item.supportNeeded }}
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- ================================================================= -->
      <!-- SECTION 2: ADDITIONAL WORK (Bobot Visual Setara)                  -->
      <!-- ================================================================= -->
      <v-card v-if="isMorningSubmitted" class="mb-6 rounded-lg border elevation-0">
        <v-card-item class="bg-surface-variant border-b py-3">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-briefcase-plus" color="secondary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                2. Additional Work (Pekerjaan Tambahan)
              </v-card-title>
            </div>

            <v-btn
              v-if="!record?.eodSubmittedAt"
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              @click="showAdditionalWorkModal = true"
            >
              Add Additional Work
            </v-btn>
          </div>
        </v-card-item>

        <v-card-text class="pa-6">
          <div v-if="!record?.additionalWorks || record.additionalWorks.length === 0" class="text-center py-6 text-medium-emphasis">
            <v-icon icon="mdi-playlist-plus" size="36" class="mb-2" />
            <p class="text-body-2">Belum ada pekerjaan tambahan yang dicatat hari ini.</p>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <v-card
              v-for="(work, wIdx) in record.additionalWorks"
              :key="work.id"
              variant="outlined"
              class="pa-4 rounded-lg bg-surface"
            >
              <div class="d-flex flex-wrap align-center justify-space-between gap-2">
                <div class="text-body-1 font-weight-medium">
                  <span class="text-subtitle-2 font-weight-bold text-secondary mr-2">
                    +{{ wIdx + 1 }}
                  </span>
                  {{ work.description }}
                </div>
                <div class="d-flex align-center gap-2">
                  <v-chip size="small" variant="tonal" color="info">
                    {{ work.reason }}
                  </v-chip>
                  <v-chip
                    v-if="work.assignedBy"
                    size="small"
                    variant="outlined"
                    color="secondary"
                    prepend-icon="mdi-account"
                  >
                    Oleh: {{ work.assignedBy }}
                  </v-chip>
                </div>
              </div>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <!-- ================================================================= -->
      <!-- SECTION 3: EOD OUTCOME & STATUS CHECK-IN                          -->
      <!-- ================================================================= -->
      <v-card v-if="isMorningSubmitted" class="mb-6 rounded-lg border elevation-0">
        <v-card-item class="bg-surface-variant border-b py-3">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-weather-sunset-down" color="primary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                3. End-of-Day (EOD) Check-in
              </v-card-title>
            </div>

            <div class="d-flex align-center gap-2">
              <v-chip
                v-if="record?.eodSubmittedAt"
                color="success"
                size="small"
                prepend-icon="mdi-check-all"
                variant="flat"
              >
                EOD Selesai
              </v-chip>
              <SubmissionTimingBadge
                v-if="record?.eodCutoffTiming"
                :timing="record.eodCutoffTiming"
              />
            </div>
          </div>
        </v-card-item>

        <v-card-text class="pa-6">
          <!-- State A: Form Input EOD Outcome -->
          <div v-if="!record?.eodSubmittedAt">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Laporkan hasil pencapaian (Outcome) dan rencana kelanjutan (Continuation) untuk setiap komitmen dan pekerjaan tambahan hari ini.
            </p>

            <v-alert
              v-if="eodError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              closable
              @click:close="eodError = ''"
            >
              {{ eodError }}
            </v-alert>

            <!-- Table-like List of all items -->
            <div class="d-flex flex-column gap-4 mb-6">
              <div
                v-for="item in allEodItems"
                :key="item.id"
                class="pa-4 rounded-lg border bg-surface"
              >
                <div class="text-subtitle-2 font-weight-bold mb-2">
                  <v-chip size="x-small" :color="item.type === 'Commitment' ? 'primary' : 'secondary'" class="mr-2">
                    {{ item.type }}
                  </v-chip>
                  {{ item.description }}
                </div>

                <v-row dense class="align-center mt-2">
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="eodForm[item.id].outcomeStatus"
                      label="Outcome Status *"
                      :items="outcomeOptions"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="eodForm[item.id].continuation"
                      label="Continuation Plan *"
                      :items="continuationOptions"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>

                <!-- Conditional Continuation Reason jika Continue dan Outcome != Completed -->
                <v-expand-transition>
                  <div
                    v-if="
                      eodForm[item.id].continuation === 'Continue' &&
                      eodForm[item.id].outcomeStatus !== 'Completed'
                    "
                    class="mt-2"
                  >
                    <v-text-field
                      v-model="eodForm[item.id].continuationReason"
                      label="Alasan Melanjutkan Pekerjaan (Continuation Reason) *"
                      placeholder="Jelaskan kendala atau kelanjutan target besok..."
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-clock-fast"
                    />
                  </div>
                </v-expand-transition>
              </div>
            </div>

            <v-divider class="my-6" />

            <!-- Final Day Status Selector -->
            <div class="mb-5">
              <label class="text-caption font-weight-bold text-medium-emphasis d-block mb-2">
                FINAL STATUS HARI INI (ACCOUNTABILITY DAY STATUS) *
              </label>
              <v-row dense>
                <v-col
                  v-for="opt in statusDayOptions"
                  :key="opt.value"
                  cols="12"
                  sm="4"
                >
                  <v-card
                    variant="outlined"
                    :color="selectedFinalStatus === opt.value ? opt.color : undefined"
                    :class="[
                      'pa-3 cursor-pointer rounded-lg border-2 text-center transition-all',
                      selectedFinalStatus === opt.value ? 'elevation-2 bg-surface' : 'bg-surface-variant'
                    ]"
                    @click="selectedFinalStatus = opt.value"
                  >
                    <v-icon :icon="opt.icon" :color="opt.color" size="28" class="mb-1" />
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ opt.title }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ opt.subtitle }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Tomorrow Priority (Opsional) -->
            <v-textarea
              v-model="tomorrowPriority"
              label="Tomorrow Priority (Rencana Prioritas Besok — Opsional)"
              placeholder="Catatan prioritas ini akan otomatis disiapkan sebagai draft copy-forward pada Morning Check-in besok..."
              rows="2"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <!-- Tombol Submit EOD -->
            <div class="text-right">
              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                prepend-icon="mdi-check-decagram"
                :loading="isSubmittingEod"
                @click="handleEodSubmit"
              >
                Submit EOD Check-in
              </v-btn>
            </div>
          </div>

          <!-- State B: Tampilan EOD yang Sudah Selesai -->
          <div v-else>
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <strong>Waktu Selesai EOD:</strong> {{ formatTime(record?.eodSubmittedAt) }}
              </div>
              <div class="d-flex align-center gap-2">
                <span class="text-caption font-weight-bold">Final Status:</span>
                <StatusBadge :status="record?.finalStatus || 'GREEN'" />
              </div>
            </div>

            <v-sheet rounded="lg" color="surface-variant" class="pa-4 mb-4">
              <div class="text-caption font-weight-bold text-medium-emphasis mb-2">
                RINGKASAN OUTCOME ITEM:
              </div>
              <div
                v-for="c in record?.commitments || []"
                :key="c.id"
                class="d-flex align-center justify-space-between py-2 border-b"
              >
                <div class="text-body-2">{{ c.description }}</div>
                <div class="d-flex align-center gap-2">
                  <v-chip size="x-small" color="primary" variant="tonal">
                    {{ c.outcomeStatus || 'NotRecorded' }}
                  </v-chip>
                  <v-chip size="x-small" color="secondary" variant="outlined">
                    {{ c.continuation }}
                  </v-chip>
                </div>
              </div>

              <div
                v-for="w in record?.additionalWorks || []"
                :key="w.id"
                class="d-flex align-center justify-space-between py-2 border-b"
              >
                <div class="text-body-2">{{ w.description }}</div>
                <div class="d-flex align-center gap-2">
                  <v-chip size="x-small" color="primary" variant="tonal">
                    {{ w.outcomeStatus || 'NotRecorded' }}
                  </v-chip>
                  <v-chip size="x-small" color="secondary" variant="outlined">
                    {{ w.continuation }}
                  </v-chip>
                </div>
              </div>
            </v-sheet>

            <div v-if="record?.tomorrowPriority" class="text-caption">
              <strong>Prioritas Esok Hari:</strong> {{ record.tomorrowPriority }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Modals -->
    <AdditionalWorkModal
      v-if="record?.id"
      v-model="showAdditionalWorkModal"
      :daily-record-id="record.id"
      @success="refetchToday"
    />

    <RaiseBlockerModal
      v-model="showRaiseBlockerModal"
      @success="refetchToday"
    />

    <ValidationPromptModal
      v-model="showValidationModal"
      :chosen-status="selectedFinalStatus"
      :suggested-status="calculatedSuggestedStatus"
      @confirm="handleConfirmValidation"
      @cancel="showValidationModal = false"
    />

    <CorrectionRequestModal
      v-if="selectedCorrectionCommitment"
      v-model="showCorrectionModal"
      :commitment-id="selectedCorrectionCommitment.id"
      :current-description="selectedCorrectionCommitment.description"
      @success="refetchToday"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import {
  useTodayRecordQuery,
  useMorningCheckinMutation,
  useEodCheckinMutation,
  useConfirmOverrideMutation,
} from '../queries/useDailyRecords.js';
import { StatusBadge, SubmissionTimingBadge } from '../components/shared/index.js';
import AdditionalWorkModal from '../components/self-service/AdditionalWorkModal.vue';
import RaiseBlockerModal from '../components/self-service/RaiseBlockerModal.vue';
import ValidationPromptModal from '../components/self-service/ValidationPromptModal.vue';
import CorrectionRequestModal from '../components/self-service/CorrectionRequestModal.vue';
import type {
  WorkType,
  RiskLevel,
  OutcomeStatus,
  ContinuationStatus,
  Commitment,
} from '../types/daily-records.js';

// 1. Data Query
const { data: record, isLoading, isError, refetch: refetchToday } = useTodayRecordQuery();

// 2. Computed State
const isMorningSubmitted = computed(() => !!record.value?.morningSubmittedAt);
const isCutoffLocked = computed(() => !!record.value?.cutoffLockedAt);

// 3. Cutoff Countdown Timer
const currentTime = ref(new Date());
let timerInterval: any = null;

onMounted(() => {
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const countdownTitle = computed(() => {
  if (isCutoffLocked.value) return 'Baseline Terkunci (Cutoff Passed)';
  if (!isMorningSubmitted.value) return 'Menuju Morning Cut-off (09:30 WIB)';
  if (!record.value?.eodSubmittedAt) return 'Menuju EOD Cut-off (18:00 WIB)';
  return 'Akuntabilitas Hari Ini Selesai';
});

const countdownSubtitle = computed(() => {
  if (isCutoffLocked.value) return 'Perubahan komitmen hanya dapat diajukan via Correction Request.';
  if (!isMorningSubmitted.value) return 'Serahkan komitmen sebelum waktu cutoff untuk status On-Time.';
  if (!record.value?.eodSubmittedAt) return 'Selesaikan evaluasi outcome pekerjaan sebelum batas akhir hari.';
  return 'Terima kasih atas kedisiplinan akuntabilitas Anda hari ini.';
});

const countdownDisplay = computed(() => {
  if (isCutoffLocked.value) return '00:00:00';
  const now = currentTime.value;
  const target = new Date(now);

  if (!isMorningSubmitted.value) {
    target.setHours(9, 30, 0, 0);
  } else {
    target.setHours(18, 0, 0, 0);
  }

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return '00:00:00';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 4. Morning Form State
const workType = ref<WorkType>('WFO');
const morningError = ref('');
const draftCopyForwardText = ref('');

const commitmentSlots = ref<
  Array<{
    description: string;
    referenceUrl: string;
    initialRisk: RiskLevel;
    knownBlocker: string;
    supportNeeded: string;
  }>
>([
  {
    description: '',
    referenceUrl: '',
    initialRisk: 'GREEN',
    knownBlocker: '',
    supportNeeded: '',
  },
]);

const riskOptions = [
  { title: 'GREEN (Sesuai Rencana)', value: 'GREEN' as RiskLevel, color: 'success' },
  { title: 'AMBER (Ada Potensi Risiko)', value: 'AMBER' as RiskLevel, color: 'warning' },
  { title: 'RED (Terhambat Kritis)', value: 'RED' as RiskLevel, color: 'error' },
];

function getPromptPlaceholder(idx: number): string {
  const prompts = [
    'Contoh: Menyelesaikan integrasi modul payment gateway dan push ke staging',
    'Contoh: Menulis unit test coverage minimal 80% untuk auth controller',
    'Contoh: Koordinasi sprint review dengan PM dan stakeholder',
  ];
  return prompts[idx] || 'Tuliskan deskripsi komitmen...';
}

function addCommitmentSlot() {
  if (commitmentSlots.value.length < 3) {
    commitmentSlots.value.push({
      description: '',
      referenceUrl: '',
      initialRisk: 'GREEN',
      knownBlocker: '',
      supportNeeded: '',
    });
  }
}

function removeCommitmentSlot(idx: number) {
  commitmentSlots.value.splice(idx, 1);
}

function applyDraftToSlot() {
  if (draftCopyForwardText.value && commitmentSlots.value.length > 0) {
    commitmentSlots.value[0].description = draftCopyForwardText.value;
  }
}

const { mutateAsync: submitMorning, isPending: isSubmittingMorning } = useMorningCheckinMutation();

async function handleMorningSubmit() {
  const firstSlot = commitmentSlots.value[0];
  if (!firstSlot || !firstSlot.description.trim()) {
    morningError.value = 'Komitmen #1 wajib diisi sebelum penyerahan.';
    return;
  }

  // Validasi AMBER / RED
  for (let i = 0; i < commitmentSlots.value.length; i++) {
    const slot = commitmentSlots.value[i];
    if (slot.description.trim()) {
      if (
        (slot.initialRisk === 'AMBER' || slot.initialRisk === 'RED') &&
        (!slot.knownBlocker.trim() || !slot.supportNeeded.trim())
      ) {
        morningError.value = `Komitmen #${i + 1} berstatus ${slot.initialRisk} mewajibkan pengisian Known Blocker & Support Needed.`;
        return;
      }
    }
  }

  morningError.value = '';

  const validCommitments = commitmentSlots.value
    .filter((s) => s.description.trim())
    .map((s) => ({
      description: s.description.trim(),
      referenceUrl: s.referenceUrl.trim() || undefined,
      initialRisk: s.initialRisk,
      knownBlocker: s.knownBlocker.trim() || undefined,
      supportNeeded: s.supportNeeded.trim() || undefined,
    }));

  try {
    await submitMorning({
      workType: workType.value,
      commitments: validCommitments,
    });
  } catch (err: any) {
    morningError.value = err?.message || 'Gagal menyerahkan morning check-in.';
  }
}

// 5. EOD Form State
const eodError = ref('');
const selectedFinalStatus = ref<RiskLevel>('GREEN');
const tomorrowPriority = ref('');
const showValidationModal = ref(false);

const eodForm = reactive<
  Record<
    string,
    {
      outcomeStatus: OutcomeStatus;
      continuation: ContinuationStatus;
      continuationReason: string;
    }
  >
>({});

const allEodItems = computed(() => {
  const items: Array<{ id: string; type: 'Commitment' | 'AdditionalWork'; description: string }> = [];
  if (record.value?.commitments) {
    for (const c of record.value.commitments) {
      items.push({ id: c.id, type: 'Commitment', description: c.description });
      if (!eodForm[c.id]) {
        eodForm[c.id] = {
          outcomeStatus: (c.outcomeStatus as OutcomeStatus) || 'Completed',
          continuation: (c.continuation as ContinuationStatus) || 'DoNotContinue',
          continuationReason: c.continuationReason || '',
        };
      }
    }
  }
  if (record.value?.additionalWorks) {
    for (const w of record.value.additionalWorks) {
      items.push({ id: w.id, type: 'AdditionalWork', description: w.description });
      if (!eodForm[w.id]) {
        eodForm[w.id] = {
          outcomeStatus: (w.outcomeStatus as OutcomeStatus) || 'Completed',
          continuation: (w.continuation as ContinuationStatus) || 'DoNotContinue',
          continuationReason: w.continuationReason || '',
        };
      }
    }
  }
  return items;
});

const outcomeOptions = [
  { title: 'Completed (Selesai 100%)', value: 'Completed' as OutcomeStatus },
  { title: 'Partially Completed (Sebagian)', value: 'PartiallyCompleted' as OutcomeStatus },
  { title: 'Not Completed (Belum Tercapai)', value: 'NotCompleted' as OutcomeStatus },
  { title: 'Cancelled (Dibatalkan)', value: 'Cancelled' as OutcomeStatus },
];

const continuationOptions = [
  { title: 'Do Not Continue (Tutup / Selesai)', value: 'DoNotContinue' as ContinuationStatus },
  { title: 'Continue (Lanjutkan Besok)', value: 'Continue' as ContinuationStatus },
];

const statusDayOptions = [
  {
    title: 'GREEN',
    subtitle: 'Deliverable tercapai, tidak ada kendala',
    value: 'GREEN' as RiskLevel,
    color: 'success',
    icon: 'mdi-check-circle',
  },
  {
    title: 'AMBER',
    subtitle: 'Terdapat kendala minor atau penundaan',
    value: 'AMBER' as RiskLevel,
    color: 'warning',
    icon: 'mdi-alert-circle',
  },
  {
    title: 'RED',
    subtitle: 'Deliverable gagal tercapai atau blocker kritis',
    value: 'RED' as RiskLevel,
    color: 'error',
    icon: 'mdi-close-octagon',
  },
];

const calculatedSuggestedStatus = computed<RiskLevel>(() => {
  let hasIncomplete = false;
  for (const item of allEodItems.value) {
    const status = eodForm[item.id]?.outcomeStatus;
    if (status === 'NotCompleted') {
      return 'RED';
    }
    if (status === 'PartiallyCompleted') {
      hasIncomplete = true;
    }
  }
  if (hasIncomplete) return 'AMBER';
  return 'GREEN';
});

const { mutateAsync: submitEod, isPending: isSubmittingEod } = useEodCheckinMutation(
  computed(() => record.value?.id),
);

const { mutateAsync: confirmOverride } = useConfirmOverrideMutation(
  computed(() => record.value?.id),
);

async function handleEodSubmit() {
  // Validasi continuation reason
  for (const item of allEodItems.value) {
    const f = eodForm[item.id];
    if (f.continuation === 'Continue' && f.outcomeStatus !== 'Completed' && !f.continuationReason.trim()) {
      eodError.value = `Item "${item.description}" yang dilanjutkan besok wajib memiliki alasan kelanjutan.`;
      return;
    }
  }

  eodError.value = '';

  // Evaluasi Status Suggestion Mismatch
  if (selectedFinalStatus.value === 'GREEN' && calculatedSuggestedStatus.value !== 'GREEN') {
    showValidationModal.value = true;
    return;
  }

  await executeEodSubmit(selectedFinalStatus.value);
}

async function executeEodSubmit(finalStatus: RiskLevel, overrideReason?: string) {
  const itemOutcomes = allEodItems.value.map((item) => ({
    id: item.id,
    outcomeStatus: eodForm[item.id].outcomeStatus,
    continuation: eodForm[item.id].continuation,
    continuationReason: eodForm[item.id].continuationReason || undefined,
  }));

  try {
    await submitEod({
      itemOutcomes,
      finalStatus,
      tomorrowPriority: tomorrowPriority.value.trim() || undefined,
    });

    if (overrideReason && record.value?.id) {
      await confirmOverride({
        overrideReason,
        finalStatus,
      });
    }
  } catch (err: any) {
    eodError.value = err?.message || 'Gagal menyerahkan EOD check-in.';
  }
}

async function handleConfirmValidation(payload: { finalStatus: RiskLevel; overrideReason?: string }) {
  selectedFinalStatus.value = payload.finalStatus;
  await executeEodSubmit(payload.finalStatus, payload.overrideReason);
}

// 6. Modal States
const showAdditionalWorkModal = ref(false);
const showRaiseBlockerModal = ref(false);
const showCorrectionModal = ref(false);
const selectedCorrectionCommitment = ref<Commitment | null>(null);

function openCorrectionModal(commitment: Commitment) {
  selectedCorrectionCommitment.value = commitment;
  showCorrectionModal.value = true;
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
.font-mono {
  font-family: monospace;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
