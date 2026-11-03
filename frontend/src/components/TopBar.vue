<script setup lang="ts">
import { computed } from 'vue';
import { getActivePinia } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { getUserInitials } from '../utils/initials';
import { Bell } from 'lucide-vue-next';

interface Props {
  breadcrumb?: string | string[];
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumb: '',
});

const user = computed(() => {
  try {
    if (getActivePinia()) {
      return useAuthStore().user;
    }
  } catch {
    // Abaikan jika Pinia belum aktif (mis. pengujian unit terisolasi)
  }
  return null;
});

const userInitials = computed(() => {
  return getUserInitials(user.value?.fullName, user.value?.email);
});

const userTitle = computed(() => {
  if (!user.value?.fullName) return 'Profil Pengguna';
  const clean = user.value.fullName.replace(/\s*\([^)]*\)/g, '').trim();
  return `Profil: ${clean || user.value.fullName}`;
});

const breadcrumbSegments = computed<string[]>(() => {
  if (!props.breadcrumb) return [];
  if (Array.isArray(props.breadcrumb)) {
    return props.breadcrumb.map((s) => s.trim()).filter(Boolean);
  }
  return props.breadcrumb
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
});
</script>

<template>
  <header class="topbar" data-testid="global-topbar">
    <div class="topbar-left">
      <slot name="breadcrumb">
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
          <template v-if="breadcrumbSegments.length > 1">
            <span
              v-for="(segment, idx) in breadcrumbSegments"
              :key="idx"
              class="breadcrumb-node"
            >
              <span v-if="idx > 0" class="breadcrumb-separator" aria-hidden="true">/</span>
              <strong v-if="idx === breadcrumbSegments.length - 1" class="breadcrumb-current">{{ segment }}</strong>
              <span v-else class="breadcrumb-ancestor">{{ segment }}</span>
            </span>
          </template>
          <template v-else-if="breadcrumbSegments.length === 1">
            <strong class="breadcrumb-current">{{ breadcrumbSegments[0] }}</strong>
          </template>
        </nav>
      </slot>
    </div>

    <div class="topbar-right">
      <slot name="actions" />

      <!-- Notification Bell (IMP-015 — DEC-008-UAT: Direct navigate ke /notifications) -->
      <router-link
        to="/notifications"
        class="topbar-btn notif-btn"
        title="Notifikasi"
        aria-label="Notifikasi"
        data-testid="topbar-notifications"
      >
        <Bell :size="17" />
      </router-link>

      <!-- Circular User Avatar (IMP-014 — Direct navigate ke /profile) -->
      <router-link
        to="/profile"
        class="topbar-avatar"
        :title="userTitle"
        aria-label="Profil Pengguna"
        data-testid="topbar-profile-avatar"
      >
        <span>{{ userInitials }}</span>
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 56px;
  background: var(--color-surface, #FFFFFF);
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 13px;
  line-height: 1.4;
}

.breadcrumb-node {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-separator {
  color: #94A3B8;
  margin: 0 6px;
  font-weight: 400;
  user-select: none;
}

.breadcrumb-ancestor {
  color: var(--color-text-secondary, #5C6E68);
  font-weight: 500;
}

.breadcrumb-current {
  color: var(--color-text-primary, #0E211B);
  font-weight: 700;
  font-size: 13.5px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.topbar-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  background: var(--color-surface, #FFFFFF);
  color: var(--color-text-secondary, #5C6E68);
  display: grid;
  place-items: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.topbar-btn:hover {
  background: var(--color-surface-subtle, #EFF5F2);
  color: var(--color-brand-primary, #00674D);
  border-color: #A7F3D0;
}

.topbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #CCFBF1;
  color: var(--color-brand-primary, #00674D);
  font-weight: 800;
  font-size: 13px;
  display: grid;
  place-items: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
  flex-shrink: 0;
}

.topbar-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 103, 77, 0.2);
}

@media (max-width: 640px) {
  .topbar {
    padding: 0 16px;
  }
}
</style>
