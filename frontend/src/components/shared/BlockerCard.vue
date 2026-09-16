<template>
  <div class="blocker-card border rounded-lg pa-4 mb-4 bg-surface">
    <!-- Header: Severity, Status Tag, Authority Tag -->
    <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-3">
      <div class="d-flex align-center gap-2">
        <!-- Blocker Severity Tag -->
        <span
          class="severity-tag"
          :style="{
            color: severityConfig.text,
            backgroundColor: severityConfig.background,
          }"
        >
          {{ blocker.severity }}
        </span>

        <!-- Blocker Status Tag -->
        <span
          class="status-tag"
          :style="{
            color: statusConfig.text,
            backgroundColor: statusConfig.background,
          }"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Authority Tag (Always visible next to owner info per Dok 04 §4) -->
      <AuthorityTag
        v-if="blocker.authorityType"
        :authority="blocker.authorityType"
        size="small"
      />
    </div>

    <!-- Title & Description (Zero v-html per SAD §16.8) -->
    <h3 class="text-subtitle-1 font-weight-bold mb-1">
      {{ blocker.title }}
    </h3>
    <p class="text-body-2 text-medium-emphasis mb-3">
      {{ blocker.description }}
    </p>

    <!-- Footer: Owner Needed & Action Panel -->
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 pt-3 border-t">
      <div class="text-caption text-medium-emphasis">
        <span v-if="blocker.ownerNeededName">
          Owner Needed: <strong class="text-high-emphasis">{{ blocker.ownerNeededName }}</strong>
        </span>
      </div>

      <!-- ActionPanel: Consumes availableActions from backend (SAD §7.12, §16.7) -->
      <ActionPanel
        :available-actions="blocker.availableActions"
        :loading-action="loadingAction"
        @action="emit('action', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AuthorityTag from './AuthorityTag.vue';
import ActionPanel from './ActionPanel.vue';
import { tokens, type BlockerSeverity } from '../../styles/tokens.js';

export interface BlockerData {
  id: string;
  title: string;
  description: string;
  severity: BlockerSeverity;
  status: 'Open' | 'Acknowledged' | 'InProgress' | 'Resolved' | 'Closed' | 'AcceptedRisk';
  ownerNeededName?: string | null;
  authorityType?: 'Org' | 'Project' | null;
  availableActions: string[];
}

interface Props {
  blocker: BlockerData;
  loadingAction?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loadingAction: null,
});

const emit = defineEmits<{
  (e: 'action', actionKey: string): void;
}>();

const severityConfig = computed(() => {
  return (
    tokens.colors.blockerSeverity[props.blocker.severity] ||
    tokens.colors.blockerSeverity.Low
  );
});

const statusConfig = computed(() => {
  return (
    tokens.colors.tags.blocker[props.blocker.status] ||
    tokens.colors.tags.blocker.Open
  );
});

const statusLabel = computed(() => {
  switch (props.blocker.status) {
    case 'Acknowledged':
      return 'Acknowledged';
    case 'InProgress':
      return 'In Progress';
    case 'AcceptedRisk':
      return 'Accepted Risk';
    case 'Resolved':
      return 'Resolved';
    case 'Closed':
      return 'Closed';
    default:
      return 'Open';
  }
});
</script>

<style scoped>
.blocker-card {
  border-color: #DCE7E2 !important;
  transition: border-color 180ms ease-out;
}

.blocker-card:hover {
  border-color: #A9C7BC !important; /* Calm hover, no lift per Dok 04 §4 */
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.severity-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  user-select: none;
}
</style>
