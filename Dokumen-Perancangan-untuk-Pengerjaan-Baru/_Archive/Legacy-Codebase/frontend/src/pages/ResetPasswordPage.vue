<template>
  <v-container class="fill-height justify-center" fluid>
    <v-card class="pa-6" max-width="460" width="100%" elevation="3" rounded="lg">
      <v-card-item class="text-center pb-4">
        <v-card-title class="text-h5 font-weight-bold text-primary">
          Perbarui Password
        </v-card-title>
        <v-card-subtitle class="mt-1">
          Demi keamanan akun, Anda diwajibkan memperbarui password sebelum melanjutkan.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
          density="compact"
        >
          {{ errorMessage }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
          density="compact"
        >
          {{ successMessage }}
        </v-alert>

        <v-form @submit.prevent="handleResetPassword">
          <v-text-field
            v-model="newPassword"
            label="Password Baru"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            hint="Minimal 8 karakter"
            persistent-hint
            required
            :disabled="isLoading"
          />

          <v-text-field
            v-model="confirmPassword"
            label="Konfirmasi Password Baru"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-check-outline"
            class="mt-3"
            required
            :disabled="isLoading"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            class="mt-6 font-weight-bold"
            :loading="isLoading"
          >
            Simpan Password Baru
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../api/auth.api.js';
import { useAuthStore } from '../stores/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

async function handleResetPassword() {
  if (!newPassword.value) {
    errorMessage.value = 'Password baru wajib diisi';
    return;
  }
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password minimal 8 karakter';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi password tidak cocok';
    return;
  }

  errorMessage.value = '';
  isLoading.value = true;

  try {
    await authApi.resetPassword({ newPassword: newPassword.value });
    successMessage.value = 'Password berhasil diperbarui, memuat ulang profil...';
    await authStore.fetchMe();
    await router.push('/today');
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mereset password.';
  } finally {
    isLoading.value = false;
  }
}
</script>
