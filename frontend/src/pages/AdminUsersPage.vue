<template>
  <v-container fluid class="py-6 px-4 px-md-8 max-w-7xl">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">System Administration</h1>
      <p class="text-body-1 text-medium-emphasis mt-1">
        Pengaturan Master Data, Role, Organisasi, Wewenang Sementara, dan Notifikasi (Scope SystemAdmin)
      </p>
    </div>

    <v-card variant="outlined" class="rounded-lg border-subtle">
      <v-tabs v-model="activeTab" color="primary" class="border-b">
        <v-tab value="users" class="text-none font-weight-bold">
          <v-icon icon="mdi-account-group" class="mr-2" />
          User & Role Management
        </v-tab>
        <v-tab value="organization" class="text-none font-weight-bold">
          <v-icon icon="mdi-sitemap" class="mr-2" />
          Organization Mapping
        </v-tab>
        <v-tab value="temporary" class="text-none font-weight-bold">
          <v-icon icon="mdi-account-clock" class="mr-2" />
          Temporary Reviewer
        </v-tab>
        <v-tab value="notifications" class="text-none font-weight-bold">
          <v-icon icon="mdi-bell-cog" class="mr-2" />
          Notification Setup
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4 pa-md-6 bg-surface">
        <v-window v-model="activeTab">
          <v-window-item value="users">
            <AdminUserManagementTab />
          </v-window-item>
          
          <v-window-item value="organization">
            <AdminOrganizationTab />
          </v-window-item>
          
          <v-window-item value="temporary">
            <AdminTemporaryReviewerTab />
          </v-window-item>

          <v-window-item value="notifications">
            <AdminNotificationSetupTab />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminUserManagementTab from '../components/admin/AdminUserManagementTab.vue';
import AdminOrganizationTab from '../components/admin/AdminOrganizationTab.vue';
import AdminTemporaryReviewerTab from '../components/admin/AdminTemporaryReviewerTab.vue';
import AdminNotificationSetupTab from '../components/admin/AdminNotificationSetupTab.vue';

const activeTab = ref('users');
</script>

<style scoped>
.border-subtle { border-color: #dce7e2 !important; }
.max-w-7xl { max-width: 1280px; margin: 0 auto; }
</style>
