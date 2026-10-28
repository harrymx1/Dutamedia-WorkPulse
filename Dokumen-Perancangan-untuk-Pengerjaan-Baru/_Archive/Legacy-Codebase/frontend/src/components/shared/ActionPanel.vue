<template>
  <div v-if="filteredActions.length > 0" class="action-panel d-flex flex-wrap align-center gap-2">
    <v-btn
      v-for="action in filteredActions"
      :key="action.key"
      :variant="action.variant"
      :color="action.color"
      size="small"
      :prepend-icon="action.icon"
      :loading="loadingAction === action.key"
      class="text-none font-weight-medium"
      @click="emit('action', action.key)"
    >
      {{ action.label }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ActionConfig {
  key: string;
  label: string;
  icon?: string;
  variant: 'flat' | 'outlined' | 'tonal';
  color: string;
}

interface Props {
  availableActions: string[];
  loadingAction?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loadingAction: null,
});

const emit = defineEmits<{
  (e: 'action', actionKey: string): void;
}>();

// Kamus konfigurasi aksi standar sesuai SAD §7.12 dan Dok 04 §4
const ACTION_MAP: Record<string, Omit<ActionConfig, 'key'>> = {
  // Blocker Actions (SAD §9.4)
  ACKNOWLEDGE: {
    label: 'Acknowledge',
    icon: 'mdi-check',
    variant: 'flat',
    color: 'primary',
  },
  UPDATE: {
    label: 'Update Status',
    icon: 'mdi-pencil-outline',
    variant: 'outlined',
    color: 'secondary',
  },
  RESOLVE: {
    label: 'Resolve Blocker',
    icon: 'mdi-check-all',
    variant: 'flat',
    color: 'primary',
  },
  ACCEPT_RISK: {
    label: 'Accept Risk',
    icon: 'mdi-alert-outline',
    variant: 'tonal',
    color: 'warning',
  },
  CLOSE: {
    label: 'Close Blocker',
    icon: 'mdi-close-circle-outline',
    variant: 'tonal',
    color: 'secondary',
  },
  ADD_SUPPORT: {
    label: 'Support Needed',
    icon: 'mdi-account-plus-outline',
    variant: 'outlined',
    color: 'secondary',
  },

  // Correction Request Actions (SAD §9.6)
  OBJECT: {
    label: 'Ajukan Keberatan',
    icon: 'mdi-hand-back-right-outline',
    variant: 'tonal',
    color: 'error',
  },
  CONFIRM_APPLY: {
    label: 'Terapkan Koreksi',
    icon: 'mdi-check',
    variant: 'flat',
    color: 'primary',
  },
  REJECT: {
    label: 'Tolak',
    icon: 'mdi-close',
    variant: 'tonal',
    color: 'error',
  },

  // General Actions
  SUBMIT: {
    label: 'Submit',
    icon: 'mdi-send-outline',
    variant: 'flat',
    color: 'primary',
  },
  CANCEL: {
    label: 'Batal',
    variant: 'outlined',
    color: 'secondary',
  },
};

const filteredActions = computed<ActionConfig[]>(() => {
  if (!props.availableActions || props.availableActions.length === 0) {
    return [];
  }

  // Ambil maksimal 3 aksi sesuai constraint Dok 04
  return props.availableActions.slice(0, 3).map((key) => {
    const defaultMeta = ACTION_MAP[key] || {
      label: key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      variant: 'outlined' as const,
      color: 'secondary',
    };

    return {
      key,
      ...defaultMeta,
    };
  });
});
</script>

<style scoped>
.action-panel {
  gap: 8px;
}
</style>
