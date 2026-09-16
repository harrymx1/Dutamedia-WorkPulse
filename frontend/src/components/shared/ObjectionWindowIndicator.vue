<template>
  <span
    class="objection-indicator"
    :class="{
      'objection-indicator--urgent': isNearDeadline,
      'objection-indicator--expired': isExpired,
    }"
  >
    <v-icon
      :icon="isExpired ? 'mdi-clock-alert-outline' : 'mdi-timer-outline'"
      class="objection-indicator__icon"
    />
    <span class="objection-indicator__label">
      {{ formattedTime }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  targetDate: string | Date;
  warningThresholdMinutes?: number;
}

const props = withDefaults(defineProps<Props>(), {
  warningThresholdMinutes: 120, // 2 jam (SAD §17.3)
});

const remainingSeconds = ref<number>(0);
let timer: ReturnType<typeof setInterval> | null = null;

function calculateRemaining() {
  const targetTime = new Date(props.targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
  remainingSeconds.value = diff;
}

const isExpired = computed(() => remainingSeconds.value <= 0);
const isNearDeadline = computed(() => {
  return (
    !isExpired.value &&
    remainingSeconds.value <= props.warningThresholdMinutes * 60
  );
});

const formattedTime = computed(() => {
  if (isExpired.value) {
    return 'Window Expired';
  }

  const hours = Math.floor(remainingSeconds.value / 3600);
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60);
  const seconds = remainingSeconds.value % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${pad(remHours)}h ${pad(minutes)}m`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
});

onMounted(() => {
  calculateRemaining();
  timer = setInterval(calculateRemaining, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.objection-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: var(--wp-font-mono, 'JetBrains Mono', monospace);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: rgba(100, 116, 139, 0.1);
  color: #475569;
  user-select: none;
}

.objection-indicator--urgent {
  background-color: rgba(245, 158, 11, 0.14) !important;
  color: #B45309 !important;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.objection-indicator--expired {
  background-color: rgba(220, 38, 38, 0.1) !important;
  color: #B91C1C !important;
}

.objection-indicator__icon {
  font-size: 13px !important;
}
</style>
