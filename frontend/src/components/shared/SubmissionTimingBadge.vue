<template>
  <span
    class="timing-badge"
    :class="[`timing-badge--${size}`]"
    :style="{
      color: config.text,
      borderColor: config.border,
    }"
  >
    <v-icon :icon="config.icon" class="timing-badge__icon" />
    <span class="timing-badge__label">{{ config.label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { tokens, type SubmissionTiming } from '../../styles/tokens.js';

interface Props {
  timing: SubmissionTiming | 'On-Time' | 'Late' | 'No Submission';
  size?: 'small' | 'default';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
});

const normalizedKey = computed<SubmissionTiming>(() => {
  if (props.timing === 'On-Time' || props.timing === 'ON_TIME') return 'ON_TIME';
  if (props.timing === 'Late' || props.timing === 'LATE') return 'LATE';
  return 'NO_SUBMISSION';
});

const config = computed(() => {
  return (
    tokens.colors.submissionTiming[normalizedKey.value] ||
    tokens.colors.submissionTiming.NO_SUBMISSION
  );
});
</script>

<style scoped>
.timing-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: transparent !important;
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  font-family: var(--wp-font-family, 'Plus Jakarta Sans', sans-serif);
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
}

.timing-badge--small {
  padding: 1px 8px;
  font-size: 0.6875rem;
}

.timing-badge--default {
  padding: 2px 10px;
  font-size: 0.75rem;
}

.timing-badge__icon {
  font-size: 14px !important;
}

.timing-badge--small .timing-badge__icon {
  font-size: 12px !important;
}
</style>
