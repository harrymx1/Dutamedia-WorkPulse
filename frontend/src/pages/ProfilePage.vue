<template>
  <v-container class="py-6 max-w-1000">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Profil Pengguna</h1>
      <p class="text-body-1 text-medium-emphasis mt-1">
        Informasi identitas, konteks organisasi, dan keamanan akun Anda
      </p>
    </div>

    <!-- Alert jika wajib ganti password -->
    <v-alert
      v-if="profile?.mustResetPassword"
      type="warning"
      variant="tonal"
      class="mb-6 border"
    >
      <template #title>
        <span class="font-weight-bold">Wajib Perbarui Password</span>
      </template>
      Akun Anda menggunakan password sementara yang di-generate oleh administrator. Demi keamanan akun, segera ganti password Anda di bawah ini.
    </v-alert>

    <v-row>
      <!-- Kolom Kiri: Kartu Identitas & Organisasi -->
      <v-col cols="12" md="6">
        <!-- 1. Identitas Akun -->
        <v-card variant="outlined" class="rounded-lg mb-6 border bg-surface">
          <v-card-item class="bg-surface-variant border-b py-3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-account-circle" color="primary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                Identitas Pengguna
              </v-card-title>
            </div>
          </v-card-item>

          <v-card-text class="pt-4">
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" size="64" class="mr-4 text-h5 text-white font-weight-bold">
                {{ userInitials }}
              </v-avatar>
              <div>
                <h2 class="text-h6 font-weight-bold">{{ profile?.fullName || '-' }}</h2>
                <div class="text-body-2 text-medium-emphasis">{{ profile?.email || '-' }}</div>
                <div class="mt-2 d-flex gap-2">
                  <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">
                    {{ profile?.role || 'Employee' }}
                  </v-chip>
                  <v-chip size="small" color="success" variant="tonal">
                    Active
                  </v-chip>
                </div>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex flex-column gap-2 text-body-2">
              <div class="d-flex justify-space-between py-1">
                <span class="text-medium-emphasis">User ID:</span>
                <span class="font-mono text-caption">{{ profile?.userId || '-' }}</span>
              </div>
              <div class="d-flex justify-space-between py-1">
                <span class="text-medium-emphasis">Fungsi / Departemen:</span>
                <span class="font-weight-medium">{{ profile?.function || 'General' }}</span>
              </div>
              <div class="d-flex justify-space-between py-1">
                <span class="text-medium-emphasis">Atasan Langsung (Direct Manager):</span>
                <span class="font-weight-medium">{{ profile?.directManagerId ? 'Tercatat' : '-' }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 2. Snapshot Kebijakan Aktif -->
        <v-card variant="outlined" class="rounded-lg border bg-surface">
          <v-card-item class="bg-surface-variant border-b py-3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-shield-check" color="secondary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                Kebijakan Kerja Berlaku
              </v-card-title>
            </div>
          </v-card-item>

          <v-card-text class="pt-4">
            <p class="text-caption text-medium-emphasis mb-3">
              Parameter cutoff dan toleransi yang diterapkan oleh Policy Owner sistem:
            </p>

            <v-sheet rounded="md" class="pa-3 mb-2 border bg-surface-variant d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-weather-sunset-up" color="primary" size="small" class="mr-2" />
                <span class="text-body-2 font-weight-medium">Cutoff Morning Check-in</span>
              </div>
              <v-chip size="small" variant="flat" color="primary">
                09:30 WIB
              </v-chip>
            </v-sheet>

            <v-sheet rounded="md" class="pa-3 mb-2 border bg-surface-variant d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-weather-sunset-down" color="secondary" size="small" class="mr-2" />
                <span class="text-body-2 font-weight-medium">Cutoff EOD Check-in</span>
              </div>
              <v-chip size="small" variant="flat" color="secondary">
                18:00 WIB
              </v-chip>
            </v-sheet>

            <v-sheet rounded="md" class="pa-3 border bg-surface-variant d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-timer-sand" color="warning" size="small" class="mr-2" />
                <span class="text-body-2 font-weight-medium">Objection Window Koreksi</span>
              </div>
              <v-chip size="small" variant="flat" color="warning">
                24 Jam
              </v-chip>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Kolom Kanan: Pengaturan Keamanan & Password -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="rounded-lg border bg-surface">
          <v-card-item class="bg-surface-variant border-b py-3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-lock-reset" color="primary" class="mr-2" />
              <v-card-title class="text-subtitle-1 font-weight-bold">
                Ubah Password
              </v-card-title>
            </div>
          </v-card-item>

          <v-card-text class="pt-4">
            <p class="text-body-2 text-medium-emphasis mb-4">
              Gunakan password yang kuat dengan minimal 8 karakter yang memadukan huruf dan angka.
            </p>

            <v-alert
              v-if="passwordSuccess"
              type="success"
              variant="tonal"
              density="compact"
              class="mb-4"
              closable
              @click:close="passwordSuccess = ''"
            >
              {{ passwordSuccess }}
            </v-alert>

            <v-alert
              v-if="passwordError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              closable
              @click:close="passwordError = ''"
            >
              {{ passwordError }}
            </v-alert>

            <v-form ref="formRef" @submit.prevent="handlePasswordSubmit">
              <v-text-field
                v-model="currentPassword"
                label="Password Saat Ini *"
                :type="showOld ? 'text' : 'password'"
                :append-inner-icon="showOld ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                class="mb-3"
                @click:append-inner="showOld = !showOld"
              />

              <v-text-field
                v-model="newPassword"
                label="Password Baru *"
                :type="showNew ? 'text' : 'password'"
                :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.minLength]"
                class="mb-3"
                @click:append-inner="showNew = !showNew"
              />

              <v-text-field
                v-model="confirmPassword"
                label="Konfirmasi Password Baru *"
                :type="showConfirm ? 'text' : 'password'"
                :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.matchPassword]"
                class="mb-4"
                @click:append-inner="showConfirm = !showConfirm"
              />

              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                block
                size="large"
                prepend-icon="mdi-check"
                :loading="isChangingPassword"
              >
                Simpan Password Baru
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMyProfileQuery, useChangePasswordMutation } from '../queries/useProfile.js';

const { data: profile } = useMyProfileQuery();
const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePasswordMutation();

const formRef = ref<any>(null);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const passwordSuccess = ref('');

const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const userInitials = computed(() => {
  const name = profile.value?.fullName || 'User';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const rules = {
  required: (v: string) => !!v || 'Field ini wajib diisi',
  minLength: (v: string) => (v && v.length >= 8) || 'Password minimal 8 karakter',
  matchPassword: (v: string) => v === newPassword.value || 'Konfirmasi password tidak cocok',
};

async function handlePasswordSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  passwordError.value = '';
  passwordSuccess.value = '';

  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    passwordSuccess.value = 'Password Anda berhasil diperbarui!';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    formRef.value.resetValidation();
  } catch (err: any) {
    passwordError.value = err?.message || 'Gagal mengubah password. Pastikan password saat ini benar.';
  }
}
</script>

<style scoped>
.max-w-1000 {
  max-width: 1000px;
}
.font-mono {
  font-family: monospace;
}
</style>
