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
          data-testid="btn-raise-instant-blocker"
          id="raise-blocker-button"
          @click="openInstantBlocker"
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

      <!-- Draft Copy-Forward Banner (FR-11, ADR-017) jika ada -->
      <v-card
        v-if="!isMorningSubmitted && carryOverDrafts.length > 0"
        variant="tonal"
        color="info"
        class="mb-6 border rounded-lg pa-4"
        data-testid="draft-banner"
      >
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-icon icon="mdi-history" color="info" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold">
              Draft Komitmen Lanjutan dari Hari Kemarin ({{ carryOverDrafts.length }})
            </span>
          </div>
          <v-chip size="small" variant="outlined" color="info">
            Sisa Kuota: {{ remainingCommitmentCapacity }}/{{ MAX_DAILY_COMMITMENTS }}
          </v-chip>
        </div>

        <p class="text-caption text-medium-emphasis mb-3">
          Terdapat komitmen berstatus <em>Continue</em> dari hari kerja sebelumnya. Pilih untuk mengonfirmasi atau menyunting draft ke dalam slot komitmen pagi ini.
        </p>

        <v-alert
          v-if="isMaxCapacityReached"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3 text-caption"
          data-testid="max-capacity-alert"
        >
          Kapasitas komitmen harian telah mencapai batas maksimum ({{ MAX_DAILY_COMMITMENTS }} komitmen terisi). Kosongkan atau hapus slot jika ingin menggunakan draft lain.
        </v-alert>

        <div class="d-flex flex-column gap-3">
          <v-card
            v-for="draft in carryOverDrafts"
            :key="draft.sourceCommitmentId"
            variant="outlined"
            class="pa-3 bg-surface rounded"
            :data-testid="`draft-card-${draft.sourceCommitmentId}`"
          >
            <div class="d-flex flex-wrap align-start justify-space-between gap-2">
              <div class="flex-grow-1 mr-3">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-chip size="x-small" color="primary" variant="flat">
                    Komitmen Lanjutan
                  </v-chip>
                  <v-chip
                    v-if="appliedDraftIds.has(draft.sourceCommitmentId)"
                    size="x-small"
                    color="success"
                    variant="tonal"
                    prepend-icon="mdi-check"
                    data-testid="badge-applied"
                  >
                    Sudah Dimasukkan
                  </v-chip>
                </div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  "{{ draft.text }}"
                </div>
                <div
                  v-if="draft.continuationReason"
                  class="text-caption text-medium-emphasis mt-1"
                >
                  <v-icon icon="mdi-comment-text-outline" size="x-small" class="mr-1" />
                  Alasan: {{ draft.continuationReason }}
                </div>
                <div
                  v-if="draft.referenceLink"
                  class="text-caption text-primary mt-1"
                >
                  <v-icon icon="mdi-link-variant" size="x-small" class="mr-1" />
                  {{ draft.referenceLink }}
                </div>
              </div>

              <div class="d-flex gap-2 align-center">
                <template v-if="!appliedDraftIds.has(draft.sourceCommitmentId)">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="tonal"
                    :disabled="isMaxCapacityReached"
                    @click="applyDraftToSlot(draft)"
                    :data-testid="`btn-confirm-${draft.sourceCommitmentId}`"
                  >
                    Gunakan (Confirm as-is)
                  </v-btn>
                  <v-btn
                    size="small"
                    color="secondary"
                    variant="outlined"
                    :disabled="isMaxCapacityReached"
                    @click="applyDraftToSlot(draft)"
                    :data-testid="`btn-edit-${draft.sourceCommitmentId}`"
                  >
                    Gunakan & Edit
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn
                    size="small"
                    color="error"
                    variant="text"
                    @click="removeDraftFromSlot(draft.sourceCommitmentId)"
                    :data-testid="`btn-remove-${draft.sourceCommitmentId}`"
                  >
                    Lepas dari Slot
                  </v-btn>
                </template>
              </div>
            </div>
          </v-card>
        </div>
      </v-card>

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
                data-testid="morning-submission-status"
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
          <div v-if="!isMorningSubmitted" data-testid="morning-checkin-form">
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
              v-for="(commitmentSlot, idx) in commitmentSlots"
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
                v-model="commitmentSlot.description"
                :label="`Deskripsi Komitmen ${idx + 1}`"
                :placeholder="commitmentPromptPlaceholder"
                rows="2"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                :data-testid="`commitment-text-input-${idx}`"
              />

              <v-row density="compact">
                <v-col cols="12" sm="7">
                  <v-text-field
                    v-model="commitmentSlot.referenceUrl"
                    label="Reference / Task Link (Opsional)"
                    :placeholder="'https:\/\/jira... atau #PROJ-123'"
                    prepend-inner-icon="mdi-link-variant"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" sm="5">
                  <v-select
                    v-model="commitmentSlot.initialRisk"
                    label="Initial Risk *"
                    :items="riskOptions"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <!-- Conditional Blocker & Support Needed saat Initial Risk AMBER/RED -->
              <v-expand-transition>
                <div v-if="commitmentSlot.initialRisk === 'AMBER' || commitmentSlot.initialRisk === 'RED'" class="mt-2">
                  <v-row density="compact">
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="commitmentSlot.knownBlocker"
                        label="Known Blocker (Hambatan yang Diantisipasi) *"
                        placeholder="Contoh: Menunggu review PR dari senior engineer"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-alert-circle-outline"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="commitmentSlot.supportNeeded"
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

            <!-- Tombol Tambah Slot jika kurang dari batas produk -->
            <div class="d-flex align-center justify-space-between mt-2">
              <v-btn
                v-if="commitmentSlots.length < MAX_DAILY_COMMITMENTS"
                variant="tonal"
                size="small"
                prepend-icon="mdi-plus"
                @click="addCommitmentSlot"
              >
                Tambah Slot Komitmen ({{ commitmentSlots.length }}/{{ MAX_DAILY_COMMITMENTS }})
              </v-btn>
              <div v-else />

              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                prepend-icon="mdi-send"
                :loading="isSubmittingMorning"
                data-testid="morning-submit-button"
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
                v-for="(item, idx) in recordedCommitments"
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
                      {{ item.description || (item as any).text }}
                    </span>
                  </div>

                  <div class="d-flex align-center gap-2">
                    <StatusBadge :status="item.initialRisk" />
                    <!-- Tombol Laporkan Blocker kontekstual (S2-FR-15-1) -->
                    <v-btn
                      v-if="!record?.eodSubmittedAt"
                      variant="text"
                      size="small"
                      color="error"
                      prepend-icon="mdi-alert-circle-outline"
                      :data-testid="`btn-raise-blocker-${item.id}`"
                      @click="openBlockerForCommitment(item)"
                    >
                      Laporkan Blocker
                    </v-btn>
                    <!-- Tombol Ajukan Koreksi jika baseline locked -->
                    <v-btn
                      v-if="isCutoffLocked && !record?.eodSubmittedAt"
                      variant="text"
                      size="small"
                      color="primary"
                      prepend-icon="mdi-pencil"
                      :data-testid="`correction-request-button-${idx}`"
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
          <div v-if="recordedAdditionalWorks.length === 0" class="text-center py-6 text-medium-emphasis">
            <v-icon icon="mdi-playlist-plus" size="36" class="mb-2" />
            <p class="text-body-2">Belum ada pekerjaan tambahan yang dicatat hari ini.</p>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <v-card
              v-for="(work, wIdx) in recordedAdditionalWorks"
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

                <v-row density="compact" class="align-center mt-2">
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
              <v-row density="compact">
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
      :commitment-id="selectedBlockerCommitment?.id"
      :commitment-description="selectedBlockerCommitment?.description"
      @update:model-value="(val) => { if (!val) selectedBlockerCommitment = null; }"
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
      :current-description="selectedCorrectionCommitment.description || (selectedCorrectionCommitment as any).text"
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
  DailyAccountabilityRecord,
  WorkType,
  RiskLevel,
  OutcomeStatus,
  ContinuationStatus,
  Commitment,
  AdditionalWork,
  CarryOverDraftItem,
  MorningCommitmentInput,
} from '../types/daily-records.js';
import {
  MAX_DAILY_COMMITMENTS,
  getRoleBasedPrompt,
} from '../constants/daily-records.constants.js';
import { useAuthStore } from '../stores/auth.store.js';

const authStore = useAuthStore();
const commitmentPromptPlaceholder = computed(() =>
  getRoleBasedPrompt(authStore.user?.function),
);

// 1. Data Query (ADR-017)
const { data: todayData, isLoading, isError, refetch: refetchToday } = useTodayRecordQuery();
const record = computed<DailyAccountabilityRecord | null>(() => {
  if (!todayData.value) return null;
  if ('record' in todayData.value) {
    return todayData.value.record;
  }
  return todayData.value as unknown as DailyAccountabilityRecord;
});

const recordedCommitments = computed<Commitment[]>(() => record.value?.commitments || []);
const recordedAdditionalWorks = computed<AdditionalWork[]>(() => record.value?.additionalWorks || []);

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

// 4. Morning Form State (ADR-017)
interface CommitmentSlotState {
  description: string;
  referenceUrl: string;
  initialRisk: RiskLevel;
  knownBlocker: string;
  supportNeeded: string;
  sourceCommitmentId?: string; // transient UI identity/reference (never submitted)
}

const workType = ref<WorkType>('WFO');
const morningError = ref('');

const carryOverDrafts = computed<CarryOverDraftItem[]>(() => {
  if (isMorningSubmitted.value) return [];
  const drafts = todayData.value?.carryOverDraft;
  if (!drafts || !Array.isArray(drafts)) return [];

  // Contract verification: setiap item wajib memiliki sourceCommitmentId (ADR-017)
  for (const item of drafts) {
    if (!item.sourceCommitmentId) {
      console.error('API Contract Violation: CarryOverDraftItem missing sourceCommitmentId', item);
      throw new Error('API Contract Violation: CarryOverDraftItem missing sourceCommitmentId');
    }
  }

  return drafts;
});

const commitmentSlots = ref<CommitmentSlotState[]>([
  {
    description: '',
    referenceUrl: '',
    initialRisk: 'GREEN',
    knownBlocker: '',
    supportNeeded: '',
  },
]);

const appliedDraftIds = computed<Set<string>>(() => {
  return new Set(
    commitmentSlots.value
      .map((s) => s.sourceCommitmentId)
      .filter((id): id is string => Boolean(id)),
  );
});

const filledCommitmentCount = computed(() => {
  return commitmentSlots.value.filter((s) => s.description.trim().length > 0).length;
});

const remainingCommitmentCapacity = computed(() => {
  return Math.max(0, MAX_DAILY_COMMITMENTS - filledCommitmentCount.value);
});

const isMaxCapacityReached = computed(() => {
  return filledCommitmentCount.value >= MAX_DAILY_COMMITMENTS;
});

const riskOptions = [
  { title: 'GREEN (Sesuai Rencana)', value: 'GREEN' as RiskLevel, color: 'success' },
  { title: 'AMBER (Ada Potensi Risiko)', value: 'AMBER' as RiskLevel, color: 'warning' },
  { title: 'RED (Terhambat Kritis)', value: 'RED' as RiskLevel, color: 'error' },
];

function addCommitmentSlot() {
  if (commitmentSlots.value.length < MAX_DAILY_COMMITMENTS) {
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
  if (commitmentSlots.value.length === 0) {
    commitmentSlots.value.push({
      description: '',
      referenceUrl: '',
      initialRisk: 'GREEN',
      knownBlocker: '',
      supportNeeded: '',
    });
  }
}

function applyDraftToSlot(draft: CarryOverDraftItem) {
  if (isMaxCapacityReached.value) return;
  if (appliedDraftIds.value.has(draft.sourceCommitmentId)) return;

  // 1. Cari slot yang masih kosong
  const emptySlotIdx = commitmentSlots.value.findIndex((s) => !s.description.trim());

  let targetIdx = emptySlotIdx;
  if (targetIdx !== -1) {
    const slot = commitmentSlots.value[targetIdx];
    slot.description = draft.text;
    slot.referenceUrl = draft.referenceLink || slot.referenceUrl || '';
    slot.sourceCommitmentId = draft.sourceCommitmentId;
  } else if (commitmentSlots.value.length < MAX_DAILY_COMMITMENTS) {
    targetIdx = commitmentSlots.value.length;
    commitmentSlots.value.push({
      description: draft.text,
      referenceUrl: draft.referenceLink || '',
      initialRisk: 'GREEN',
      knownBlocker: '',
      supportNeeded: '',
      sourceCommitmentId: draft.sourceCommitmentId,
    });
  }
}

function removeDraftFromSlot(sourceCommitmentId: string) {
  const slotIdx = commitmentSlots.value.findIndex((s) => s.sourceCommitmentId === sourceCommitmentId);
  if (slotIdx !== -1) {
    if (commitmentSlots.value.length > 1) {
      commitmentSlots.value.splice(slotIdx, 1);
    } else {
      commitmentSlots.value[0] = {
        description: '',
        referenceUrl: '',
        initialRisk: 'GREEN',
        knownBlocker: '',
        supportNeeded: '',
        sourceCommitmentId: undefined,
      };
    }
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

  const validCommitments: MorningCommitmentInput[] = commitmentSlots.value
    .filter((s) => s.description.trim())
    .map((s, index) => ({
      sequenceNo: index + 1,
      text: s.description.trim(),
      referenceLink: s.referenceUrl.trim() || undefined,
      initialRisk: s.initialRisk,
      knownBlockerNote: s.knownBlocker.trim() || undefined,
      supportNeeded: s.supportNeeded.trim() || undefined,
    }));

  try {
    await submitMorning({
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
const selectedBlockerCommitment = ref<Commitment | null>(null);

function openInstantBlocker() {
  selectedBlockerCommitment.value = null;
  showRaiseBlockerModal.value = true;
}

function openBlockerForCommitment(commitment: Commitment) {
  selectedBlockerCommitment.value = commitment;
  showRaiseBlockerModal.value = true;
}

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
:deep(.v-textarea textarea::placeholder) {
  font-style: italic;
  color: rgb(var(--v-theme-secondary, 92, 110, 104)) !important;
  opacity: 0.8;
}
</style>
