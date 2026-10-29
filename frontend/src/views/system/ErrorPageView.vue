<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const auth = useAuthStore();

const kind = computed(() => (route.meta.errorKind as 'forbidden' | 'not-found') || 'not-found');
const blockedPath = computed(() => (route.query.from as string) || '');
</script>

<template>
  <main class="error-page" :data-testid="`error-${kind}`">
    <h1 v-if="kind === 'forbidden'">403 — Akses Dibatasi</h1>
    <h1 v-else>404 — Halaman Tidak Ditemukan</h1>

    <p v-if="kind === 'forbidden'">
      Peran Anda<span v-if="auth.user"> (<strong>{{ auth.user.role }}</strong>)</span> tidak memiliki hak akses ke halaman
      <code v-if="blockedPath">{{ blockedPath }}</code
      ><span v-else>ini</span>.
    </p>
    <p v-else>Alamat yang Anda tuju tidak tersedia.</p>

    <router-link :to="auth.isAuthenticated ? '/dashboard' : '/login'" class="back-link">
      {{ auth.isAuthenticated ? 'Kembali ke Dashboard' : 'Ke Halaman Login' }}
    </router-link>
  </main>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}
.back-link {
  padding: 10px 18px;
  border-radius: 8px;
  background: #0b5d44;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
</style>
