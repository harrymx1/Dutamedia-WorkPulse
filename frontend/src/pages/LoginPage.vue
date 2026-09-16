<template>
  <v-container class="fill-height justify-center" fluid>
    <v-card class="pa-6" max-width="440" width="100%" elevation="3" rounded="lg">
      <v-card-item class="text-center pb-4">
        <v-card-title class="text-h5 font-weight-bold text-primary">
          WorkPulse
        </v-card-title>
        <v-card-subtitle class="mt-1">
          Daily Accountability & Blocker Log System
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
          density="compact"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Email Kantor"
            placeholder="nama@dutamedia.com"
            type="email"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            required
            :disabled="authStore.isLoading"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            required
            :disabled="authStore.isLoading"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            class="mt-4 font-weight-bold"
            :loading="authStore.isLoading"
          >
            Masuk
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center pt-0">
        <span class="text-caption text-medium-emphasis">
          Dutamedia Internal System v1.0
        </span>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store.js';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan password wajib diisi';
    return;
  }

  errorMessage.value = '';
  try {
    const user = await authStore.login({
      email: email.value,
      password: password.value,
    });

    if (user.mustResetPassword) {
      await router.push('/reset-password');
      return;
    }

    const redirectPath = (route.query.redirect as string) || '/today';
    await router.push(redirectPath);
  } catch (err: any) {
    errorMessage.value =
      err.message || 'Login gagal. Periksa kembali email dan password Anda.';
  }
}
</script>
