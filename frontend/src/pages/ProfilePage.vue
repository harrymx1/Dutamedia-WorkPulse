<template>
  <v-container class="py-6">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Profile</h1>
      <p class="text-body-1 text-medium-emphasis mt-1">
        Informasi Akun dan Pengaturan Sesi
      </p>
    </div>

    <v-card variant="outlined" class="pa-6 rounded-lg" max-width="600">
      <v-card-text>
        <v-list density="comfortable">
          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-account" color="primary" />
            </template>
            <v-list-item-title class="font-weight-medium">User ID</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.userId || '-' }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-email" color="primary" />
            </template>
            <v-list-item-title class="font-weight-medium">Email</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.email || '-' }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-badge-account" color="primary" />
            </template>
            <v-list-item-title class="font-weight-medium">Role Aktif</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.role || 'Tanpa Role' }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-domain" color="primary" />
            </template>
            <v-list-item-title class="font-weight-medium">Function / Department</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.function || '-' }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store.js';

const authStore = useAuthStore();
</script>
