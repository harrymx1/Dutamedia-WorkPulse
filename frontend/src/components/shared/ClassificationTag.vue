<template>
  <span
    class="classification-tag"
    :class="[`classification-tag--${size}`]"
    :style="{
      backgroundColor: config.background,
      color: config.text,
    }"
  >
    <span class="classification-tag__text">{{ classification }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { tokens } from '../../styles/tokens.js';

interface Props {
  classification: 'Minor' | 'Material';
  size?: 'small' | 'default';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
});

const config = computed(() => {
  return props.classification === 'Material'
    ? tokens.colors.tags.correction.Material
    : tokens.colors.tags.correction.Minor;
});
</script>

<style scoped>
.classification-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-family: var(--wp-font-family, 'Plus Jakarta Sans', sans-serif);
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  user-select: none;
}

.classification-tag--small {
  padding: 1px 6px;
  font-size: 0.6875rem;
}

.classification-tag--default {
  padding: 2px 8px;
  font-size: 0.75rem;
}
</style>
