<template>
  <v-menu location="bottom end" :close-on-content-click="false" max-width="360" width="100%">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        density="comfortable"
        class="notification-bell"
        aria-label="Lihat Notifikasi"
      >
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount > 99 ? '99+' : unreadCount"
          color="#12915F"
          location="top end"
          offset-x="2"
          offset-y="2"
        >
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
        <v-icon v-else icon="mdi-bell-outline" />
      </v-btn>
    </template>

    <v-card class="elevation-4 border rounded-lg">
      <v-card-item class="py-3 px-4 border-b">
        <div class="d-flex align-center justify-space-between">
          <span class="text-subtitle-2 font-weight-bold">Notifikasi</span>
          <span v-if="unreadCount > 0" class="text-caption text-primary font-weight-medium">
            {{ unreadCount }} baru
          </span>
        </div>
      </v-card-item>

      <v-list density="comfortable" class="pa-0 notification-list">
        <template v-if="notifications.length > 0">
          <v-list-item
            v-for="item in notifications.slice(0, 5)"
            :key="item.id"
            :class="{ 'notification-item--unread': item.status === 'Sent' }"
            class="py-2 px-4 border-b"
            @click="handleNotificationClick(item)"
          >
            <template #prepend>
              <v-icon
                :icon="getNotificationIcon(item)"
                :color="item.status === 'Sent' ? 'primary' : 'secondary'"
                size="small"
                class="mr-3"
              />
            </template>
            <v-list-item-title class="text-caption font-weight-medium text-wrap">
              {{ item.payload?.title || 'Notifikasi Baru' }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-medium-emphasis text-wrap mt-1">
              {{ item.payload?.body || '' }}
            </v-list-item-subtitle>
          </v-list-item>
        </template>

        <div v-else class="text-center py-6 text-medium-emphasis text-caption">
          Tidak ada notifikasi
        </div>
      </v-list>

      <v-card-actions class="pa-2 justify-center border-t">
        <v-btn
          to="/notifications"
          variant="text"
          size="small"
          color="primary"
          class="text-none font-weight-bold"
        >
          Lihat Semua Notifikasi
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { apiClient } from '../../api/client.js';

const router = useRouter();

interface NotificationPayload {
  title: string;
  body: string;
  linkPath?: string;
  iconType?: string;
}

interface NotificationItem {
  id: string;
  triggerType: string;
  channel: string;
  status: 'Sent' | 'Read' | 'Failed';
  payload: NotificationPayload;
  createdAt: string;
}

interface NotificationsApiResponse {
  data: NotificationItem[];
  meta: {
    unreadCount: number;
  };
}

// Polling TanStack Query setiap 60 detik per SAD §17.3
const { data: response } = useQuery<NotificationsApiResponse>({
  queryKey: ['notifications-bell'],
  queryFn: async () => {
    const res = await apiClient.get<NotificationItem[]>('notifications?pageSize=5');
    return {
      data: res.data,
      meta: {
        unreadCount: (res.meta.unreadCount as number) ?? 0,
      },
    };
  },
  refetchInterval: 60_000,
  refetchOnWindowFocus: true,
});

const notifications = computed(() => response.value?.data || []);
const unreadCount = computed(() => response.value?.meta.unreadCount || 0);

function getNotificationIcon(item: NotificationItem): string {
  if (item.payload?.iconType?.includes('critical')) return 'mdi-alert-octagon-outline';
  if (item.payload?.iconType?.includes('blocker')) return 'mdi-alert-circle-outline';
  return 'mdi-bell-outline';
}

async function handleNotificationClick(item: NotificationItem) {
  if (item.status === 'Sent') {
    try {
      await apiClient.post(`notifications/${item.id}/mark-read`);
    } catch {
      // Abaikan jika network error saat mark-read
    }
  }

  if (item.payload?.linkPath) {
    await router.push(item.payload.linkPath);
  }
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.notification-item--unread {
  background-color: #EFF5F2 !important; /* Surface elevated tint per Dok 04 §4 */
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}
</style>
