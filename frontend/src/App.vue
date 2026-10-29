<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import EnterpriseSidebar from './components/EnterpriseSidebar.vue';
import { useLayout } from './composables/useLayout';
import { Menu } from 'lucide-vue-next';

const route = useRoute();
const auth = useAuthStore();
const { openSidebar } = useLayout();

// Tampilkan Enterprise Shell 2-kolom hanya untuk pengguna login pada halaman aplikasi non-guest & non-error
const showAppShell = computed(() => {
  return auth.isAuthenticated && !route.meta.guestOnly && !route.meta.errorKind;
});
</script>

<template>
  <!-- Halaman Tanpa Shell (Guest / Login, Aktivasi, Error Pages) -->
  <div v-if="!showAppShell" class="standalone-layout">
    <RouterView />
  </div>

  <!-- Enterprise Application Shell (2-Kolom: Sidebar 232px Permanen Desktop + Viewport) -->
  <div v-else class="app" data-testid="app-layout">
    <EnterpriseSidebar />
    <main class="main-viewport" data-testid="main-viewport">
      <!-- Mobile Bar (Hanya muncul di viewport <= 992px) -->
      <header class="mobile-top-header">
        <button
          type="button"
          class="mobile-hamburger-btn"
          data-testid="nav-toggle"
          aria-label="Buka navigasi menu"
          @click="openSidebar"
        >
          <Menu :size="20" />
        </button>
        <div class="mobile-brand-wrap">
          <div class="mobile-brand-mark">WP</div>
          <span class="mobile-brand-title">WorkPulse</span>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<style>
/* Reset & Enterprise Grid Shell */
.standalone-layout {
  min-height: 100vh;
  width: 100%;
}

.app {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  background: var(--color-canvas, #F7FAF9);
}

.main-viewport {
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
}

.mobile-top-header {
  display: none;
}

/* Pada Desktop (>= 993px), sembunyikan brand-badge dan brand-title duplikat di topbar view karena sudah ada di sidebar */
@media (min-width: 993px) {
  .app .topbar .brand-badge,
  .app .topbar .brand-title {
    display: none !important;
  }
}

@media (max-width: 992px) {
  .app {
    grid-template-columns: 1fr;
  }

  .mobile-top-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #FFFFFF;
    border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
    position: sticky;
    top: 0;
    z-index: 40;
  }

  .mobile-hamburger-btn {
    background: transparent;
    border: 1px solid var(--color-border-subtle, #DCE7E2);
    border-radius: 6px;
    padding: 6px;
    color: var(--color-text-primary, #0E211B);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .mobile-brand-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-brand-mark {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--color-brand-primary, #00674D);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    display: grid;
    place-items: center;
  }

  .mobile-brand-title {
    font-weight: 800;
    font-size: 15px;
    color: var(--color-brand-primary, #00674D);
  }
}
</style>
