<script setup lang="ts">
import { onUnmounted, reactive, watch } from 'vue';
import { AlertCircle, CheckCircle2, X } from 'lucide-vue-next';
import { computeToastDurationMs, RESUME_GRACE_MS, type ToastVariant } from '../utils/toastDuration';

const props = defineProps<{
  toastMessage?: string | null;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'clear-toast'): void;
  (e: 'clear-error'): void;
}>();

interface ToastTimerState {
  timer: ReturnType<typeof setTimeout> | null;
  startedAt: number;
  remainingMs: number;
  isPaused: boolean;
}

const states: Record<ToastVariant, ToastTimerState> = reactive({
  success: {
    timer: null,
    startedAt: 0,
    remainingMs: 0,
    isPaused: false,
  },
  error: {
    timer: null,
    startedAt: 0,
    remainingMs: 0,
    isPaused: false,
  },
});

function clearTimer(variant: ToastVariant) {
  const state = states[variant];
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function dismiss(variant: ToastVariant) {
  clearTimer(variant);
  states[variant].isPaused = false;
  states[variant].remainingMs = 0;
  if (variant === 'success') {
    emit('clear-toast');
  } else {
    emit('clear-error');
  }
}

function scheduleTimer(variant: ToastVariant, durationMs: number) {
  clearTimer(variant);
  const state = states[variant];
  state.remainingMs = durationMs;
  state.startedAt = Date.now();
  state.isPaused = false;
  state.timer = setTimeout(() => {
    dismiss(variant);
  }, durationMs);
}

function pauseTimer(variant: ToastVariant) {
  const state = states[variant];
  if (state.timer === null || state.isPaused) return;
  clearTimer(variant);
  const elapsed = Date.now() - state.startedAt;
  state.remainingMs = Math.max(RESUME_GRACE_MS, state.remainingMs - elapsed);
  state.isPaused = true;
}

function resumeTimer(variant: ToastVariant) {
  const state = states[variant];
  const currentMessage = variant === 'success' ? props.toastMessage : props.errorMessage;
  if (!state.isPaused || !currentMessage || !currentMessage.trim()) return;
  scheduleTimer(variant, Math.max(RESUME_GRACE_MS, state.remainingMs));
}

watch(
  () => props.toastMessage,
  (val) => {
    clearTimer('success');
    states.success.isPaused = false;
    if (val && val.trim().length > 0) {
      scheduleTimer('success', computeToastDurationMs(val, 'success'));
    } else {
      states.success.remainingMs = 0;
    }
  },
  { immediate: true },
);

watch(
  () => props.errorMessage,
  (val) => {
    clearTimer('error');
    states.error.isPaused = false;
    if (val && val.trim().length > 0) {
      scheduleTimer('error', computeToastDurationMs(val, 'error'));
    } else {
      states.error.remainingMs = 0;
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearTimer('success');
  clearTimer('error');
});
</script>

<template>
  <div v-if="toastMessage || errorMessage" class="toast-stack">
    <div
      v-if="toastMessage"
      class="toast-popup success"
      role="status"
      aria-live="polite"
      tabindex="-1"
      @mouseenter="pauseTimer('success')"
      @mouseleave="resumeTimer('success')"
      @focusin="pauseTimer('success')"
      @focusout="resumeTimer('success')"
    >
      <CheckCircle2 :size="18" class="toast-icon" />
      <span class="toast-text">{{ toastMessage }}</span>
      <button
        type="button"
        class="toast-close-btn"
        aria-label="Tutup notifikasi"
        title="Tutup notifikasi"
        data-testid="toast-close-btn"
        @click="dismiss('success')"
      >
        <X :size="15" />
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="toast-popup error"
      role="alert"
      aria-live="assertive"
      tabindex="-1"
      @mouseenter="pauseTimer('error')"
      @mouseleave="resumeTimer('error')"
      @focusin="pauseTimer('error')"
      @focusout="resumeTimer('error')"
    >
      <AlertCircle :size="18" class="toast-icon" />
      <span class="toast-text">{{ errorMessage }}</span>
      <button
        type="button"
        class="toast-close-btn"
        aria-label="Tutup notifikasi"
        title="Tutup notifikasi"
        data-testid="toast-close-btn"
        @click="dismiss('error')"
      >
        <X :size="15" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: min(460px, calc(100vw - 32px));
  pointer-events: none;
}

.toast-popup {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px 12px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.45;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.08);
  outline: none;
}

.toast-popup.success {
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #6EE7B7;
  border-left: 4px solid #00674D;
}

.toast-popup.error {
  background: #FEF2F2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
  border-left: 4px solid #DC2626;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-text {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.toast-close-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: -2px -4px -2px 2px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

.toast-close-btn:hover {
  opacity: 1;
  background: rgba(15, 23, 42, 0.08);
}

.toast-close-btn:focus-visible {
  opacity: 1;
  outline: 2px solid currentColor;
  outline-offset: 1px;
}

@media (max-width: 640px) {
  .toast-stack {
    top: 12px;
    left: 12px;
    right: 12px;
    max-width: none;
  }
}

@media print {
  .toast-stack {
    display: none !important;
  }
}
</style>
