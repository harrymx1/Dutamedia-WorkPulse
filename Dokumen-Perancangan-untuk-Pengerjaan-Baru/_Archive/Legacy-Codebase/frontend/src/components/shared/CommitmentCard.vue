<template>
  <div class="commitment-card border rounded-lg pa-4 mb-4 bg-surface">
    <!-- Header: Sequence / Tag & Initial Risk -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center gap-2">
        <span v-if="commitment.isAdditionalWork" class="additional-work-tag">
          Additional Work
        </span>
        <span v-else-if="index !== undefined" class="commitment-index text-caption font-weight-bold text-medium-emphasis">
          Commitment #{{ index + 1 }}
        </span>

        <a
          v-if="commitment.referenceLink"
          :href="commitment.referenceLink"
          target="_blank"
          rel="noopener noreferrer"
          class="text-caption text-primary text-decoration-none d-flex align-center ml-1"
        >
          <v-icon icon="mdi-link-variant" size="13" class="mr-1" />
          Task Link
        </a>
      </div>

      <StatusBadge :status="commitment.initialRisk" size="small" />
    </div>

    <!-- Commitment Text (Plain interpolation, zero v-html per SAD §16.8) -->
    <div class="commitment-text text-body-1 font-weight-regular mb-4">
      {{ commitment.text }}
    </div>

    <!-- EOD Controls: Outcome & Continuation sebagai segmented controls terpisah (Dok 04 §4) -->
    <div v-if="showEodControls" class="eod-controls-container pt-3 border-t d-flex flex-wrap gap-4">
      <!-- 1. Outcome Control -->
      <div class="control-group">
        <div class="text-caption font-weight-medium text-medium-emphasis mb-1">
          Outcome
        </div>
        <v-btn-toggle
          :model-value="commitment.outcome"
          density="compact"
          mandatory
          divided
          variant="outlined"
          :disabled="readOnly"
          @update:model-value="emit('update:outcome', $event)"
        >
          <v-btn value="ACHIEVED" size="small" class="text-none">
            Achieved
          </v-btn>
          <v-btn value="PARTIAL" size="small" class="text-none">
            Partial
          </v-btn>
          <v-btn value="MISSED" size="small" class="text-none">
            Missed
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- 2. Continuation Control -->
      <div class="control-group">
        <div class="text-caption font-weight-medium text-medium-emphasis mb-1">
          Continuation
        </div>
        <v-btn-toggle
          :model-value="commitment.continuation"
          density="compact"
          mandatory
          divided
          variant="outlined"
          :disabled="readOnly"
          @update:model-value="emit('update:continuation', $event)"
        >
          <v-btn value="DONE" size="small" class="text-none">
            Done
          </v-btn>
          <v-btn value="CONTINUES" size="small" class="text-none">
            Continues
          </v-btn>
          <v-btn value="DROPPED" size="small" class="text-none">
            Dropped
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from './StatusBadge.vue';
import type { DailyStatus } from '../../styles/tokens.js';

export interface CommitmentData {
  id: string;
  text: string;
  referenceLink?: string | null;
  initialRisk: DailyStatus;
  isAdditionalWork?: boolean;
  outcome?: string | null;
  continuation?: string | null;
}

interface Props {
  commitment: CommitmentData;
  index?: number;
  showEodControls?: boolean;
  readOnly?: boolean;
}

withDefaults(defineProps<Props>(), {
  index: undefined,
  showEodControls: false,
  readOnly: false,
});

const emit = defineEmits<{
  (e: 'update:outcome', outcome: string): void;
  (e: 'update:continuation', continuation: string): void;
}>();
</script>

<style scoped>
.commitment-card {
  border-color: #DCE7E2 !important;
  transition: border-color 180ms ease-out;
}

.commitment-card:hover {
  border-color: #A9C7BC !important; /* Calm hover, no lift per Dok 04 §4 */
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.additional-work-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: rgba(71, 85, 105, 0.1);
  color: #475569;
  font-size: 0.6875rem;
  font-weight: 600;
  user-select: none;
}
</style>
