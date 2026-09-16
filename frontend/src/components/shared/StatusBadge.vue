<template>
  <span
    class="status-badge"
    :class="[`status-badge--${size}`]"
    :style="{
      backgroundColor: config.background,
      color: config.text,
      borderColor: config.border,
    }"
  >
    <span
      class="status-badge__dot"
      :style="{ backgroundColor: config.dot }"
      aria-hidden="true"
    />
    <span class="status-badge__label">{{ status }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { tokens, type DailyStatus } from '../../styles/tokens.js';

interface Props {
  status: DailyStatus;
  size?: 'small' | 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
});

const config = computed(() => {
  return (
    tokens.colors.dailyStatus[props.status] ||
    tokens.colors.dailyStatus.GREEN
  );
});
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  font-family: var(--wp-font-mono, 'JetBrains Mono', monospace);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  user-select: none;
}

.status-badge--small {
  padding: 2px 8px;
  font-size: 0.6875rem;
}

.status-badge--default {
  padding: 3px 10px;
  font-size: 0.75rem;
}

.status-badge--large {
  padding: 5px 14px;
  font-size: 0.875rem;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge--large .status-badge__dot {
  width: 8px;
  height: 8px;
}
</style>
