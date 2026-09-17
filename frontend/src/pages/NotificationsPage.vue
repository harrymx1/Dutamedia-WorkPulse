<template>
  <v-container class="py-6 max-w-1000">
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-6">
      <div>
        <div class="d-flex align-center gap-2">
          <h1 class="text-h4 font-weight-bold">Notifikasi</h1>
          <v-chip
            v-if="unreadCount > 0"
            size="small"
            color="primary"
            variant="flat"
            class="font-weight-bold"
          >
            {{ unreadCount }} Belum Dibaca
          </v-chip>
        </div>
        <p class="text-body-1 text-medium-emphasis mt-1">
          Pusat pemberitahuan eskalasi, peringatan cutoff, dan pembaruan sistem (Web Notification Center)
        </p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-check-all"
          :disabled="unreadCount === 0 || isMarkingAll"
          :loading="isMarkingAll"
          @click="handleMarkAllRead"
        >
          Tandai Semua Dibaca
        </v-btn>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6 border-b">
      <v-tab value="all">
        Semua ({{ allItems.length }})
      </v-tab>
      <v-tab value="unread">
        Belum Dibaca ({{ unreadItems.length }})
      </v-tab>
      <v-tab value="alerts">
        Peringatan & Blocker ({{ alertItems.length }})
      </v-tab>
    </v-tabs>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="text-body-2 text-medium-emphasis mt-3">Memuat pemberitahuan...</p>
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="filteredItems.length === 0"
      variant="outlined"
      class="pa-10 text-center rounded-lg bg-surface"
    >
      <v-icon icon="mdi-bell-check-outline" size="56" color="medium-emphasis" class="mb-3" />
      <h3 class="text-h6 font-weight-medium">Tidak Ada Notifikasi</h3>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Semua pemberitahuan pada kategori ini sudah dibaca atau belum ada aktivitas baru.
      </p>
    </v-card>

    <!-- Notifications List -->
    <div v-else class="d-flex flex-column gap-3">
      <v-card
        v-for="item in filteredItems"
        :key="item.id"
        variant="outlined"
        :class="[
          'pa-4 rounded-lg border transition-all cursor-pointer',
          item.status === 'Sent' || item.status === 'Pending'
            ? 'bg-blue-lighten-5 border-primary'
            : 'bg-surface'
        ]"
        @click="handleClickNotification(item)"
      >
        <div class="d-flex align-start gap-3">
          <!-- Icon -->
          <v-avatar
            :color="getNotificationColor(item)"
            variant="tonal"
            size="40"
            class="rounded-lg"
          >
            <v-icon :icon="getNotificationIcon(item)" size="22" />
          </v-avatar>

          <!-- Content -->
          <div class="flex-grow-1">
            <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-1">
              <div class="text-subtitle-2 font-weight-bold">
                {{ item.payload?.title || 'Pemberitahuan Sistem' }}
              </div>
              <div class="d-flex align-center gap-2">
                <span class="text-caption text-medium-emphasis">
                  {{ formatRelativeTime(item.createdAt) }}
                </span>
                <v-badge
                  v-if="item.status === 'Sent' || item.status === 'Pending'"
                  dot
                  color="primary"
                  inline
                />
              </div>
            </div>

            <p class="text-body-2 text-medium-emphasis mb-2">
              {{ item.payload?.body }}
            </p>

            <div class="d-flex align-center justify-space-between">
              <v-chip size="x-small" variant="tonal" color="grey">
                {{ formatTriggerLabel(item.triggerType) }}
              </v-chip>

              <span v-if="item.payload?.linkPath" class="text-caption text-primary font-weight-medium d-flex align-center">
                Lihat detail <v-icon icon="mdi-arrow-right" size="x-small" class="ml-1" />
              </span>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../queries/useNotifications.js';
import type { NotificationItem } from '../types/notifications.js';

const router = useRouter();
const activeTab = ref<'all' | 'unread' | 'alerts'>('all');

const { data: notificationsData, isLoading } = useNotificationsQuery({ limit: 100 });
const { mutateAsync: markAsRead } = useMarkNotificationReadMutation();
const { mutateAsync: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsReadMutation();

const allItems = computed<NotificationItem[]>(() => notificationsData.value?.items || []);
const unreadCount = computed(() => notificationsData.value?.unreadCount || 0);

const unreadItems = computed(() =>
  allItems.value.filter((i) => i.status === 'Sent' || i.status === 'Pending'),
);

const alertItems = computed(() =>
  allItems.value.filter(
    (i) =>
      i.triggerType.includes('BLOCKER') ||
      i.triggerType.includes('CUTOFF') ||
      i.triggerType.includes('BACKUP') ||
      i.payload?.iconType === 'database-alert',
  ),
);

const filteredItems = computed(() => {
  if (activeTab.value === 'unread') return unreadItems.value;
  if (activeTab.value === 'alerts') return alertItems.value;
  return allItems.value;
});

async function handleClickNotification(item: NotificationItem) {
  if (item.status === 'Sent' || item.status === 'Pending') {
    try {
      await markAsRead(item.id);
    } catch {
      // Abaikan error background mark read
    }
  }

  if (item.payload?.linkPath) {
    router.push(item.payload.linkPath);
  }
}

async function handleMarkAllRead() {
  try {
    await markAllRead();
  } catch (err) {
    console.error('Gagal menandai semua dibaca:', err);
  }
}

function getNotificationIcon(item: NotificationItem): string {
  const trigger = item.triggerType;
  if (trigger.includes('BLOCKER')) return 'mdi-alert-octagon';
  if (trigger.includes('CUTOFF')) return 'mdi-clock-alert';
  if (trigger.includes('BACKUP')) return 'mdi-database-alert';
  if (trigger.includes('WEEKLY')) return 'mdi-chart-box';
  if (trigger.includes('LEAVE')) return 'mdi-calendar-clock';
  if (trigger.includes('CORRECTION')) return 'mdi-file-document-edit';
  return 'mdi-bell';
}

function getNotificationColor(item: NotificationItem): string {
  const trigger = item.triggerType;
  if (trigger.includes('BLOCKER') || trigger.includes('BACKUP')) return 'error';
  if (trigger.includes('CUTOFF')) return 'warning';
  if (trigger.includes('WEEKLY')) return 'primary';
  if (trigger.includes('LEAVE')) return 'secondary';
  return 'primary';
}

function formatTriggerLabel(trigger: string): string {
  return trigger.replace(/_/g, ' ').toLowerCase();
}

function formatRelativeTime(isoStr: string): string {
  if (!isoStr) return '-';
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
}
</script>

<style scoped>
.max-w-1000 {
  max-width: 1000px;
}
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
