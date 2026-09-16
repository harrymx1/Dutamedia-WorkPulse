<template>
  <v-menu v-if="format === 'all'" location="bottom end">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="tonal"
        color="secondary"
        size="small"
        prepend-icon="mdi-download-outline"
        append-icon="mdi-menu-down"
        :loading="loading"
        :disabled="disabled"
        class="text-none font-weight-medium"
      >
        {{ label }}
      </v-btn>
    </template>

    <v-list density="compact" min-width="140">
      <v-list-item
        prepend-icon="mdi-file-excel-outline"
        @click="emit('export', 'xlsx')"
      >
        <v-list-item-title>Excel (.xlsx)</v-list-item-title>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-file-pdf-box"
        @click="emit('export', 'pdf')"
      >
        <v-list-item-title>PDF Document</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-btn
    v-else
    variant="tonal"
    color="secondary"
    size="small"
    prepend-icon="mdi-download-outline"
    :loading="loading"
    :disabled="disabled"
    class="text-none font-weight-medium"
    @click="handleClick"
  >
    {{ label }}
  </v-btn>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
  format?: 'pdf' | 'xlsx' | 'all';
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Export',
  format: 'all',
  loading: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'export', format: 'pdf' | 'xlsx'): void;
}>();

function handleClick() {
  emit('click');
  if (props.format === 'pdf' || props.format === 'xlsx') {
    emit('export', props.format);
  }
}
</script>
