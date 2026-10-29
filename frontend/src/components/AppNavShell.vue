<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { navForRole } from '../router/navigation';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const open = ref(false);

const groups = computed(() => navForRole(auth.user?.role));

// Tutup drawer otomatis setiap kali berpindah halaman
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);

async function handleLogout() {
  await auth.logout();
  open.value = false;
  router.push('/login');
}
</script>

<template>
  <div class="nav-shell" data-testid="nav-shell">
    <button class="nav-toggle" type="button" aria-label="Buka menu navigasi" data-testid="nav-toggle" @click="open = !open">
      ☰ Menu
    </button>

    <div v-if="open" class="nav-backdrop" @click="open = false"></div>

    <nav v-if="open" class="nav-drawer" aria-label="Navigasi utama" data-testid="nav-drawer">
      <button class="nav-close" type="button" aria-label="Tutup menu" data-testid="nav-close" @click="open = false">✕ Tutup</button>
      <div class="nav-user">
        <strong>{{ auth.user?.fullName }}</strong>
        <small>{{ auth.user?.email }}</small>
        <span class="nav-role" data-testid="nav-role">{{ auth.user?.role }}</span>
      </div>

      <div v-for="group in groups" :key="group.title" class="nav-group">
        <div class="nav-group-title">{{ group.title }}</div>
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="active"
          exact-active-class="active"
        >
          {{ item.label }}
        </router-link>
      </div>

      <button class="nav-logout" type="button" data-testid="nav-logout" @click="handleLogout">Keluar</button>
    </nav>
  </div>
</template>

<style scoped>
/* Gaya fungsional minimal. Penataan visual final dilakukan setelah E2E. */
.nav-toggle {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 1000;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #0b5d44;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
.nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
}
.nav-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
  width: 290px;
  max-width: 85vw;
  overflow-y: auto;
  padding: 16px;
  background: #fff;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}
.nav-close {
  float: right;
  padding: 4px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}
.nav-user {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}
.nav-user small {
  color: #6b7280;
}
.nav-role {
  align-self: flex-start;
  margin-top: 6px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #e6f4ee;
  color: #0b5d44;
  font-size: 11px;
  font-weight: 700;
}
.nav-group {
  margin-top: 12px;
}
.nav-group-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 4px;
}
.nav-link {
  display: block;
  padding: 7px 10px;
  border-radius: 6px;
  color: #111827;
  text-decoration: none;
  font-size: 14px;
}
.nav-link:hover {
  background: #f3f4f6;
}
.nav-link.active {
  background: #e6f4ee;
  color: #0b5d44;
  font-weight: 600;
}
.nav-logout {
  width: 100%;
  margin-top: 20px;
  padding: 9px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
</style>

