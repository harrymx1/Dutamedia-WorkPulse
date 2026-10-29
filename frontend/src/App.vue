<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppNavShell from './components/AppNavShell.vue';

const route = useRoute();
const auth = useAuthStore();

// Menu global tampil hanya untuk pengguna login pada halaman yang bukan guest/error
const showNav = computed(() => auth.isAuthenticated && !route.meta.guestOnly && !route.meta.errorKind);
</script>

<template>
  <RouterView />
  <AppNavShell v-if="showNav" />
</template>
