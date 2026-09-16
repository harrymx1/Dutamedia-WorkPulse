<template>
  <div class="filter-bar border rounded-lg pa-3 mb-6 bg-surface">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3">
      <!-- Left side: Filters (Dropdowns, date pickers, select) -->
      <div class="d-flex flex-wrap align-center gap-3 filter-bar__left">
        <slot name="filters" />
      </div>

      <!-- Right side: Search and secondary actions -->
      <div class="d-flex align-center gap-2 filter-bar__right">
        <slot name="search" />
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FilterBar component standar sesuai Dok 04 §4 dan SAD §16.5
</script>

<style scoped>
.filter-bar {
  border-color: #DCE7E2 !important;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.filter-bar__left {
  flex: 1 1 auto;
}

.filter-bar__right {
  flex: 0 0 auto;
}
</style>
