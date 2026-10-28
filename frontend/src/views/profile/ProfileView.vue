<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import {
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Laptop,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);

onMounted(async () => {
  if (!authStore.user) {
    const u = await authStore.fetchMe();
    if (!u) {
      router.push('/login');
    }
  }
});

const passwordScore = computed(() => {
  const p = newPassword.value;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

async function handleChangePassword() {
  errorMessage.value = null;
  successMessage.value = null;

  if (!currentPassword.value) {
    errorMessage.value = 'Kata sandi saat ini wajib diisi.';
    return;
  }
  if (!newPassword.value || newPassword.value.length < 8) {
    errorMessage.value = 'Kata sandi baru minimal 8 karakter.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi kata sandi baru tidak cocok.';
    return;
  }

  isLoading.value = true;
  try {
    const msg = await authStore.changePassword(
      currentPassword.value,
      newPassword.value,
    );
    successMessage.value = msg || 'Kata sandi berhasil diperbarui.';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal memperbarui kata sandi.';
  } finally {
    isLoading.value = false;
  }
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="profile-layout">
    <!-- Navbar Atas -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="brand-badge">WP</div>
        <span class="brand-name">WorkPulse</span>
        <span class="system-tag">Profil Akun</span>
      </div>
      <div class="nav-right">
        <router-link
          v-if="authStore.isSuperAdmin || authStore.isHRGA"
          to="/admin/users"
          class="nav-link"
        >
          Kelola Pengguna
        </router-link>
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="16" />
          <span>Keluar</span>
        </button>
      </div>
    </header>

    <!-- Konten Utama -->
    <main class="main-content">
      <div class="profile-grid">
        <!-- Kolom Kiri: Kartu Identitas Pengguna -->
        <section class="card identity-card">
          <div class="avatar-large">
            {{ authStore.user?.fullName?.charAt(0) || 'U' }}
          </div>
          <h2 class="user-fullname">{{ authStore.user?.fullName || 'Pengguna' }}</h2>
          <p class="user-email mono-num">{{ authStore.user?.email || '-' }}</p>

          <div class="badge-row">
            <span class="role-pill">{{ authStore.user?.role || 'EMPLOYEE' }}</span>
            <span class="status-pill active">{{ authStore.user?.status || 'ACTIVE' }}</span>
          </div>

          <div class="divider"></div>

          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">User ID:</span>
              <span class="meta-value mono-num">{{ authStore.user?.id || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Hak Otoritas:</span>
              <span class="meta-value">Role-Based & Scope Resolver</span>
            </div>
          </div>
        </section>

        <!-- Kolom Kanan: Pengaturan Keamanan & Ubah Password -->
        <section class="card security-card">
          <div class="card-header">
            <div class="header-icon">
              <Shield :size="20" />
            </div>
            <div>
              <h3>Keamanan & Kata Sandi</h3>
              <p class="card-desc">Kelola kata sandi akun dan verifikasi sesi aktif Anda.</p>
            </div>
          </div>

          <!-- Alert Feedback -->
          <div v-if="successMessage" class="alert-banner success">
            <CheckCircle2 :size="18" />
            <span>{{ successMessage }}</span>
          </div>
          <div v-if="errorMessage" class="alert-banner error">
            <AlertCircle :size="18" />
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleChangePassword">
            <div class="form-group">
              <label for="current-pwd">Kata Sandi Saat Ini</label>
              <input
                id="current-pwd"
                v-model="currentPassword"
                type="password"
                placeholder="Masukkan kata sandi lama Anda"
                required
              />
            </div>

            <div class="form-group">
              <label for="new-pwd">Kata Sandi Baru</label>
              <input
                id="new-pwd"
                v-model="newPassword"
                type="password"
                placeholder="Minimal 8 karakter kombinasi"
                required
              />

              <!-- Strength Bar -->
              <div v-if="newPassword" class="strength-bar-row">
                <div
                  class="bar-seg"
                  :style="{ background: passwordScore >= 1 ? '#DE350B' : undefined }"
                ></div>
                <div
                  class="bar-seg"
                  :style="{ background: passwordScore >= 2 ? '#FFAB00' : undefined }"
                ></div>
                <div
                  class="bar-seg"
                  :style="{ background: passwordScore >= 3 ? '#00674D' : undefined }"
                ></div>
                <div
                  class="bar-seg"
                  :style="{ background: passwordScore >= 4 ? '#00875A' : undefined }"
                ></div>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-pwd">Konfirmasi Kata Sandi Baru</label>
              <input
                id="confirm-pwd"
                v-model="confirmPassword"
                type="password"
                placeholder="Ulangi kata sandi baru"
                required
              />
            </div>

            <button
              type="submit"
              class="btn-save"
              :disabled="isLoading"
            >
              <KeyRound :size="16" />
              <span>{{ isLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi' }}</span>
            </button>
          </form>

          <div class="divider"></div>

          <!-- Sesi Aktif -->
          <div class="session-box">
            <div class="session-header">
              <Laptop :size="18" class="session-icon" />
              <div>
                <strong>Sesi Peramban Ini</strong>
                <p>Dilindungi dengan cookie HttpOnly; Secure; SameSite=Strict</p>
              </div>
            </div>
            <button class="btn-revoke" type="button" @click="handleLogout">
              Keluar Sesi
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.profile-layout {
  min-height: 100vh;
  background: var(--color-canvas);
}

.top-nav {
  height: 60px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 32px;
  height: 32px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
}

.brand-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-brand-primary);
}

.system-tag {
  font-size: 11px;
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-brand-primary);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.15s;
}

.logout-btn:hover {
  background: #FEE2E2;
  color: #991B1B;
  border-color: #FCA5A5;
}

.main-content {
  max-width: 960px;
  margin: 36px auto;
  padding: 0 20px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
}

.identity-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-large {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
}

.user-fullname {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.user-email {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 14px;
}

.badge-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.role-pill {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-strong);
  color: var(--color-brand-primary);
  padding: 3px 8px;
  border-radius: 6px;
}

.status-pill.active {
  font-size: 11px;
  font-weight: 800;
  background: var(--color-status-green-bg);
  border: 1px solid var(--color-status-green-border);
  color: var(--color-status-green-fg);
  padding: 3px 8px;
  border-radius: 6px;
}

.divider {
  width: 100%;
  height: 1px;
  background: var(--color-border-subtle);
  margin: 18px 0;
}

.meta-list {
  width: 100%;
  text-align: left;
  display: grid;
  gap: 8px;
  font-size: 12.5px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
}

.meta-label {
  color: var(--color-text-secondary);
}

.meta-value {
  color: var(--color-text-primary);
  font-weight: 600;
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.card-desc {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 18px;
}

.alert-banner.success {
  background: var(--color-status-green-bg);
  border: 1px solid var(--color-status-green-border);
  color: var(--color-status-green-fg);
}

.alert-banner.error {
  background: var(--color-status-red-bg);
  border: 1px solid var(--color-status-red-border);
  color: var(--color-status-red-fg);
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: var(--color-brand-focus);
  box-shadow: 0 0 0 3px rgba(11, 128, 97, 0.15);
}

.strength-bar-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  height: 4px;
  margin-top: 6px;
}

.bar-seg {
  background: var(--color-border-subtle);
  border-radius: 2px;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-brand-primary);
  color: #FFFFFF;
  border: 0;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 700;
  margin-top: 6px;
  transition: background 0.15s;
}

.btn-save:hover:not(:disabled) {
  background: var(--color-brand-hover);
}

.session-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 14px;
}

.session-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.session-icon {
  color: var(--color-brand-primary);
}

.session-header strong {
  display: block;
  font-size: 13px;
}

.session-header p {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.btn-revoke {
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
}

.btn-revoke:hover {
  background: #FEE2E2;
  color: #991B1B;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
