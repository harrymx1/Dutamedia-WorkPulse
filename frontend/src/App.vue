<script setup lang="ts">
import { ref } from 'vue';

const title = ref('WorkPulse');
const subtitle = ref('Daily Accountability & Blocker Log System');
</script>

<template>
  <main class="app-container">
    <header class="app-header">
      <div class="brand">
        <h1 class="brand-title">{{ title }}</h1>
        <p class="brand-subtitle">{{ subtitle }}</p>
      </div>
      <div class="system-status">
        <span class="status-indicator"></span>
        <span class="status-text">Sistem Siap (Clean-Slate P0)</span>
      </div>
    </header>
    <section class="welcome-card">
      <h2>Inisialisasi Monorepo Bersih Berhasil</h2>
      <p>Fondasi sistem WorkPulse telah terpasang dengan TypeScript Strict, Vue 3.5, dan NestJS.</p>
    </section>
  </main>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.brand-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}
.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
}
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
}
.welcome-card {
  margin-top: 2rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
.welcome-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin-top: 0;
}
.welcome-card p {
  color: #475569;
  line-height: 1.6;
}
</style>
