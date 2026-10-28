<template>
  <span
    class="authority-tag"
    :class="[`authority-tag--${size}`]"
    :style="{
      backgroundColor: config.background,
      color: config.text,
    }"
  >
    <v-icon :icon="iconName" class="authority-tag__icon" />
    <span class="authority-tag__text">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { tokens } from '../../styles/tokens.js';

interface Props {
  authority: 'Org' | 'Project';
  size?: 'small' | 'default';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
});

const isProject = computed(() => props.authority === 'Project');

const config = computed(() => {
  return isProject.value
    ? tokens.colors.tags.authority.Project
    : tokens.colors.tags.authority.Org;
});

const iconName = computed(() => {
  return isProject.value ? 'mdi-briefcase-outline' : 'mdi-office-building-outline';
});

const label = computed(() => {
  return isProject.value ? 'Project Authority' : 'Organizational Authority';
});
</script>

<style scoped>
.authority-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  font-family: var(--wp-font-family, 'Plus Jakarta Sans', sans-serif);
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
}

.authority-tag--small {
  padding: 1px 6px;
  font-size: 0.6875rem;
}

.authority-tag--default {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.authority-tag__icon {
  font-size: 13px !important;
}

.authority-tag--small .authority-tag__icon {
  font-size: 11px !important;
}
</style>
