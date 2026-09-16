<template>
  <v-app>
    <!-- Top Navigation Bar jika pengguna terautentikasi dan bukan di rute login/reset -->
    <v-app-bar
      v-if="showNavigation"
      elevation="1"
      density="comfortable"
      color="surface"
      class="border-b"
    >
      <v-app-bar-title class="font-weight-bold text-primary">
        <router-link to="/today" class="text-decoration-none text-primary d-flex align-center">
          <v-icon icon="mdi-pulse" class="mr-2" color="primary" />
          WorkPulse
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <!-- Navigation Links -->
      <div class="d-none d-md-flex align-center gap-1">
        <v-btn to="/today" variant="text" size="small" prepend-icon="mdi-calendar-check">
          My Today
        </v-btn>
        <v-btn to="/history" variant="text" size="small" prepend-icon="mdi-history">
          History
        </v-btn>

        <!-- Management Links berbasis Role (SAD §16.4) -->
        <v-btn
          v-if="authStore.hasRole(['Supervisor_TL', 'Head_Dept', 'CEO_Director', 'SystemAdmin'])"
          to="/team"
          variant="text"
          size="small"
          prepend-icon="mdi-account-group"
        >
          Team
        </v-btn>

        <v-btn
          v-if="authStore.hasRole(['Head_Dept', 'CEO_Director', 'SystemAdmin'])"
          to="/function"
          variant="text"
          size="small"
          prepend-icon="mdi-domain"
        >
          Function
        </v-btn>

        <v-btn
          v-if="authStore.hasRole(['HRGA', 'CEO_Director', 'SystemAdmin'])"
          to="/compliance"
          variant="text"
          size="small"
          prepend-icon="mdi-shield-check"
        >
          Compliance
        </v-btn>

        <v-btn
          v-if="authStore.hasRole(['CEO_Director', 'SystemAdmin'])"
          to="/management"
          variant="text"
          size="small"
          prepend-icon="mdi-chart-line"
        >
          Management
        </v-btn>

        <v-btn
          v-if="authStore.hasRole(['Supervisor_TL', 'Head_Dept', 'HRGA', 'CEO_Director', 'SystemAdmin'])"
          to="/reports"
          variant="text"
          size="small"
          prepend-icon="mdi-file-chart-outline"
        >
          Reports
        </v-btn>

        <v-btn
          v-if="authStore.hasRole(['SystemAdmin'])"
          to="/admin/users"
          variant="text"
          size="small"
          prepend-icon="mdi-shield-account"
        >
          Admin
        </v-btn>
      </div>

      <v-spacer />

      <!-- Notification Bell (EPIC-18-T6) -->
      <NotificationBell class="mr-2" />

      <!-- User Menu -->
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-caption font-weight-bold text-white">
                {{ userInitial }}
              </span>
            </v-avatar>
            <div class="d-none d-sm-flex flex-column text-left">
              <span class="text-caption font-weight-medium">{{ authStore.user?.email }}</span>
              <span class="text-caption text-medium-emphasis">{{ authStore.user?.role || 'User' }}</span>
            </div>
          </v-btn>
        </template>

        <v-list density="compact" min-width="180">
          <v-list-item to="/profile" prepend-icon="mdi-account-outline">
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item to="/policy-settings" prepend-icon="mdi-cog-outline">
            <v-list-item-title>Policy Settings</v-list-item-title>
          </v-list-item>
          <v-divider class="my-1" />
          <v-list-item @click="handleLogout" prepend-icon="mdi-logout" color="error">
            <v-list-item-title>Keluar</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content Container -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Global Toast Notifications Container -->
    <v-snackbar
      v-for="toast in uiStore.toasts"
      :key="toast.id"
      :model-value="true"
      :color="toast.type"
      location="top right"
      :timeout="toast.timeout"
      @update:model-value="uiStore.dismissToast(toast.id)"
    >
      {{ toast.message }}
      <template #actions>
        <v-btn variant="text" @click="uiStore.dismissToast(toast.id)">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store.js';
import { useUiStore } from './stores/ui.store.js';
import NotificationBell from './components/shared/NotificationBell.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();

const showNavigation = computed(() => {
  return (
    authStore.isAuthenticated &&
    route.path !== '/login' &&
    route.path !== '/reset-password'
  );
});

const userInitial = computed(() => {
  if (!authStore.user?.email) return 'U';
  return authStore.user.email.charAt(0).toUpperCase();
});

async function handleLogout() {
  await authStore.logout();
  await router.push('/login');
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
</style>
