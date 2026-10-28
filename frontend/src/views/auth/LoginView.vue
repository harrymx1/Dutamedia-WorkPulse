<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const errorMessage = ref<string | null>(null);
const emailError = ref<string | null>(null);
const passwordError = ref<string | null>(null);

function validate(): boolean {
  let valid = true;
  emailError.value = null;
  passwordError.value = null;
  errorMessage.value = null;

  if (!email.value.trim()) {
    emailError.value = 'Alamat email wajib diisi.';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailError.value = 'Format alamat email tidak valid.';
    valid = false;
  }

  if (!password.value) {
    passwordError.value = 'Kata sandi wajib diisi.';
    valid = false;
  } else if (password.value.length < 8) {
    passwordError.value = 'Kata sandi minimal 8 karakter.';
    valid = false;
  }

  return valid;
}

async function handleLogin() {
  if (!validate()) return;

  try {
    const user = await authStore.login(email.value, password.value);
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'HRGA') {
      router.push('/admin/users');
    } else {
      router.push('/profile');
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Alamat email atau kata sandi tidak valid.';
  }
}
</script>

<template>
  <div class="app-container">
    <!-- Kolom Kiri: Brand Hero & Narasi Sistem -->
    <aside class="brand-story">
      <div class="brand-header">
        <div class="brand-mark">WP</div>
        <div>
          <div class="brand-title">WorkPulse</div>
          <div class="brand-tagline">Dutamedia Accountability</div>
        </div>
      </div>

      <div class="brand-content">
        <div class="badge-eyebrow">
          <span class="pulse-dot"></span>
          Sistem Akuntabilitas Harian
        </div>
        <h1>Fokus pada Hasil, Tuntaskan Kendala.</h1>
        <p>
          Platform transparansi kerja harian, penyelarasan komitmen pagi, dan eskalasi hambatan operasional tim secara objektif & terukur.
        </p>

        <div class="feature-pillars">
          <div class="pillar-item">
            <div class="pillar-icon">✓</div>
            <div class="pillar-text">
              <strong>Komitmen Pagi Tuntas</strong>
              <span>Sinkronisasi 1-3 target kerja utama sebelum batas jam cutoff kantor.</span>
            </div>
          </div>
          <div class="pillar-item">
            <div class="pillar-icon">⚡</div>
            <div class="pillar-text">
              <strong>Eskalasi Kendala Terukur</strong>
              <span>Tiket hambatan langsung dipetakan ke Project Authority atau Squad Lead.</span>
            </div>
          </div>
          <div class="pillar-item">
            <div class="pillar-icon">📊</div>
            <div class="pillar-text">
              <strong>Evaluasi Objektif Bebas Bias</strong>
              <span>Tinjauan berbasis bukti nyata transaksi harian tanpa manipulasi manual.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <span>WorkPulse v2.0 • Clean-Slate Architecture</span>
        <span>PT Dutamedia Mandiri Pratama</span>
      </div>
    </aside>

    <!-- Kolom Kanan: Interactive Form Area -->
    <main class="interactive-main">
      <div class="card-wrapper">
        <div class="form-card">
          <!-- Tab Switcher -->
          <div class="tab-switcher">
            <button class="tab-btn active" type="button">Masuk Sistem</button>
            <router-link to="/activate" class="tab-btn">Aktivasi Akun</router-link>
          </div>

          <span class="screen-tag">PORTAL AKUNTABILITAS</span>
          <h2>Masuk ke WorkPulse</h2>
          <p class="lead-text">Masukkan kredensial email Dutamedia dan kata sandi Anda.</p>

          <!-- Banner Galat Validasi/Autentikasi -->
          <div v-if="errorMessage" class="alert-banner error" role="alert">
            <AlertCircle :size="18" class="alert-icon" />
            <div>{{ errorMessage }}</div>
          </div>

          <form @submit.prevent="handleLogin" novalidate>
            <!-- Field Email -->
            <div class="field-group">
              <div class="field-label-row">
                <label for="login-email">Email Perusahaan</label>
              </div>
              <div class="input-container">
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  placeholder="nama@dutamedia.com"
                  autocomplete="username"
                  :aria-invalid="!!emailError"
                  required
                />
              </div>
              <p v-if="emailError" class="field-error-msg show">{{ emailError }}</p>
            </div>

            <!-- Field Password -->
            <div class="field-group">
              <div class="field-label-row">
                <label for="login-password">Kata Sandi</label>
              </div>
              <div class="input-container">
                <input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  :aria-invalid="!!passwordError"
                  required
                />
                <button
                  type="button"
                  class="input-icon-btn"
                  :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>
              <p v-if="passwordError" class="field-error-msg show">{{ passwordError }}</p>
            </div>

            <!-- Opsi Tambahan -->
            <div class="form-options-row">
              <label class="checkbox-label">
                <input v-model="rememberMe" type="checkbox" />
                <span>Ingat sesi saya</span>
              </label>
              <router-link to="/activate" class="forgot-link">Belum aktivasi akun?</router-link>
            </div>

            <!-- Tombol Submit -->
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="authStore.isLoading"
            >
              <ShieldCheck v-if="!authStore.isLoading" :size="18" />
              <span>{{ authStore.isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem' }}</span>
            </button>
          </form>

          <div class="divider-rule"></div>

          <div class="help-hint">
            <span>Perlindungan sesi via HttpOnly & CSRF Double-Submit</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(360px, 0.95fr) minmax(460px, 1.05fr);
}

.brand-story {
  background: linear-gradient(165deg, #0B3327 0%, #06221A 100%);
  color: #FFFFFF;
  padding: clamp(28px, 4vh, 48px) clamp(32px, 4.5vw, 64px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.brand-mark {
  width: 42px;
  height: 42px;
  background: var(--color-brand-tint);
  color: var(--color-brand-primary);
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 20px;
  flex-shrink: 0;
}

.brand-title {
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.brand-tagline {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #A9C9BC;
  margin-top: 2px;
  font-weight: 600;
}

.brand-content {
  position: relative;
  z-index: 2;
  padding: 24px 0;
  max-width: 480px;
}

.badge-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
  color: #BDE8D7;
  background: rgba(255, 255, 255, 0.08);
  padding: 5px 12px;
  border-radius: 999px;
  margin-bottom: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background: #52D8A1;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(82, 216, 161, 0.25);
}

.brand-content h1 {
  font-size: clamp(28px, 3.2vw, 40px);
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  font-weight: 800;
}

.brand-content p {
  color: #D0E4DC;
  line-height: 1.6;
  font-size: 14px;
  margin-bottom: 26px;
}

.feature-pillars {
  display: grid;
  gap: 14px;
}

.pillar-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 13px;
  color: #BFD9CE;
}

.pillar-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 7px;
  color: #BDE8D7;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
}

.pillar-text strong {
  display: block;
  color: #FFFFFF;
  font-size: 13.5px;
  margin-bottom: 2px;
}

.brand-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #A9C9BC;
  font-size: 12px;
}

.interactive-main {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-canvas);
  padding: 32px 20px;
}

.card-wrapper {
  width: 100%;
  max-width: 440px;
}

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  box-shadow: 0 4px 16px rgba(14, 33, 27, 0.04);
}

.tab-switcher {
  display: flex;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s;
}

.tab-btn.active, .tab-btn.router-link-exact-active {
  background: var(--color-surface);
  color: var(--color-brand-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.screen-tag {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-brand-primary);
  font-weight: 800;
  margin-bottom: 8px;
  display: inline-block;
}

h2 {
  font-size: 24px;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.lead-text {
  color: var(--color-text-secondary);
  font-size: 13.5px;
  margin-bottom: 22px;
  line-height: 1.5;
}

.field-group {
  margin-bottom: 18px;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.input-container {
  position: relative;
}

input:not([type="checkbox"]) {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: border-color 0.15s;
}

input:not([type="checkbox"]):focus {
  outline: none;
  border-color: var(--color-brand-focus);
  box-shadow: 0 0 0 3px rgba(11, 128, 97, 0.15);
}

input[aria-invalid="true"] {
  border-color: var(--color-status-red-fg) !important;
  background: #FFFDFD;
}

.input-icon-btn {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  color: var(--color-text-secondary);
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
}

.input-icon-btn:hover {
  color: var(--color-brand-primary);
}

.field-error-msg {
  color: var(--color-status-red-fg);
  font-size: 12px;
  margin-top: 4px;
  font-weight: 600;
}

.alert-banner {
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 18px;
}

.alert-banner.error {
  background: var(--color-status-red-bg);
  border: 1px solid var(--color-status-red-border);
  color: var(--color-status-red-fg);
}

.alert-icon {
  flex-shrink: 0;
}

.form-options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  font-size: 13px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.forgot-link {
  font-size: 12.5px;
  font-weight: 600;
}

.btn {
  width: 100%;
  height: 46px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  border: 0;
  transition: background 0.15s;
}

.btn-primary {
  background: var(--color-brand-primary);
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-brand-hover);
}

.divider-rule {
  height: 1px;
  background: var(--color-border-subtle);
  margin: 22px 0 16px;
}

.help-hint {
  text-align: center;
  font-size: 11.5px;
  color: var(--color-text-disabled);
}

@media (max-width: 900px) {
  .app-container {
    grid-template-columns: 1fr;
  }
  .brand-story {
    display: none;
  }
}
</style>

