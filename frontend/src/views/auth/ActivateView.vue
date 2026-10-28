<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const tokenError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const confirmError = ref<string | null>(null);

onMounted(() => {
  if (route.query.token && typeof route.query.token === 'string') {
    token.value = route.query.token;
  }
});

// Password strength calculation
const passwordScore = computed(() => {
  const p = password.value;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const strengthLabel = computed(() => {
  switch (passwordScore.value) {
    case 1:
      return 'Sangat Lemah';
    case 2:
      return 'Cukup';
    case 3:
      return 'Kuat';
    case 4:
      return 'Sangat Kuat';
    default:
      return 'Minimal 8 karakter';
  }
});

function validate(): boolean {
  let valid = true;
  tokenError.value = null;
  passwordError.value = null;
  confirmError.value = null;
  errorMessage.value = null;

  if (!token.value.trim()) {
    tokenError.value = 'Token aktivasi wajib diisi.';
    valid = false;
  }

  if (!password.value) {
    passwordError.value = 'Kata sandi baru wajib diisi.';
    valid = false;
  } else if (password.value.length < 8) {
    passwordError.value = 'Kata sandi minimal 8 karakter.';
    valid = false;
  }

  if (password.value !== confirmPassword.value) {
    confirmError.value = 'Konfirmasi kata sandi tidak cocok.';
    valid = false;
  }

  return valid;
}

async function handleActivate() {
  if (!validate()) return;

  try {
    const msg = await authStore.activate(token.value.trim(), password.value);
    successMessage.value = msg || 'Akun Anda berhasil diaktifkan!';
  } catch (err: any) {
    errorMessage.value = err.message || 'Gagal mengaktifkan akun. Periksa token Anda.';
  }
}
</script>

<template>
  <div class="app-container">
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
          Aktivasi Akun Karyawan
        </div>
        <h1>Mulai Perjalanan Akuntabilitas Anda.</h1>
        <p>
          Tautan aktivasi berlaku 72 jam sejak diterbitkan oleh Administrator. Buat kata sandi aman untuk memulai akses harian Anda.
        </p>

        <div class="feature-pillars">
          <div class="pillar-item">
            <div class="pillar-icon">🔒</div>
            <div class="pillar-text">
              <strong>Keamanan Berlapis Argon2id</strong>
              <span>Kata sandi dienkripsi dengan standar industri tertinggi tanpa penyimpanan teks biasa.</span>
            </div>
          </div>
          <div class="pillar-item">
            <div class="pillar-icon">⏱️</div>
            <div class="pillar-text">
              <strong>Batas Waktu Tautan 72 Jam</strong>
              <span>Token sekali pakai untuk menjamin integritas undangan akun baru.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <span>WorkPulse v2.0 • Clean-Slate Architecture</span>
        <span>PT Dutamedia Mandiri Pratama</span>
      </div>
    </aside>

    <main class="interactive-main">
      <div class="card-wrapper">
        <div class="form-card">
          <!-- Tab Switcher -->
          <div class="tab-switcher">
            <router-link to="/login" class="tab-btn">Masuk Sistem</router-link>
            <button class="tab-btn active" type="button">Aktivasi Akun</button>
          </div>

          <!-- Sukses State -->
          <div v-if="successMessage" class="result-state-card">
            <div class="result-circle-icon">
              <CheckCircle2 :size="32" />
            </div>
            <h3>Aktivasi Berhasil!</h3>
            <p>{{ successMessage }}</p>
            <router-link to="/login" class="btn btn-primary" style="margin-top: 20px;">
              Lanjut ke Halaman Masuk
            </router-link>
          </div>

          <!-- Form State -->
          <template v-else>
            <span class="screen-tag">UNDANGAN BARU</span>
            <h2>Aktivasi Akun</h2>
            <p class="lead-text">Masukkan token aktivasi dari email dan tentukan kata sandi baru Anda.</p>

            <div v-if="errorMessage" class="alert-banner error" role="alert">
              <AlertCircle :size="18" class="alert-icon" />
              <div>{{ errorMessage }}</div>
            </div>

            <form @submit.prevent="handleActivate" novalidate>
              <!-- Field Token -->
              <div class="field-group">
                <div class="field-label-row">
                  <label for="activate-token">Token Aktivasi (64 Karakter)</label>
                </div>
                <div class="input-container">
                  <input
                    id="activate-token"
                    v-model="token"
                    type="text"
                    placeholder="Tempel token aktivasi dari email"
                    class="mono-num"
                    :aria-invalid="!!tokenError"
                    required
                  />
                </div>
                <p v-if="tokenError" class="field-error-msg show">{{ tokenError }}</p>
              </div>

              <!-- Field Password Baru -->
              <div class="field-group">
                <div class="field-label-row">
                  <label for="activate-password">Kata Sandi Baru</label>
                </div>
                <div class="input-container">
                  <input
                    id="activate-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Minimal 8 karakter aman"
                    :aria-invalid="!!passwordError"
                    required
                  />
                  <button
                    type="button"
                    class="input-icon-btn"
                    @click="showPassword = !showPassword"
                  >
                    <EyeOff v-if="showPassword" :size="18" />
                    <Eye v-else :size="18" />
                  </button>
                </div>
                <p v-if="passwordError" class="field-error-msg show">{{ passwordError }}</p>

                <!-- Password Strength Meter -->
                <div v-if="password" class="strength-wrapper">
                  <div class="strength-bars">
                    <div
                      class="strength-bar"
                      :style="{ background: passwordScore >= 1 ? '#DE350B' : undefined }"
                    ></div>
                    <div
                      class="strength-bar"
                      :style="{ background: passwordScore >= 2 ? '#FFAB00' : undefined }"
                    ></div>
                    <div
                      class="strength-bar"
                      :style="{ background: passwordScore >= 3 ? '#00674D' : undefined }"
                    ></div>
                    <div
                      class="strength-bar"
                      :style="{ background: passwordScore >= 4 ? '#00875A' : undefined }"
                    ></div>
                  </div>
                  <span class="strength-text">{{ strengthLabel }}</span>
                </div>
              </div>

              <!-- Field Konfirmasi Password -->
              <div class="field-group">
                <div class="field-label-row">
                  <label for="activate-confirm">Konfirmasi Kata Sandi</label>
                </div>
                <div class="input-container">
                  <input
                    id="activate-confirm"
                    v-model="confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Ulangi kata sandi baru"
                    :aria-invalid="!!confirmError"
                    required
                  />
                </div>
                <p v-if="confirmError" class="field-error-msg show">{{ confirmError }}</p>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="authStore.isLoading"
              >
                <KeyRound v-if="!authStore.isLoading" :size="18" />
                <span>{{ authStore.isLoading ? 'Mengaktifkan Akun...' : 'Aktifkan Akun Saya' }}</span>
              </button>
            </form>

            <div class="divider-rule"></div>

            <div class="help-hint">
              <span>Token kedaluwarsa? Hubungi Administrator untuk mengirim ulang tautan.</span>
            </div>
          </template>
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

.strength-wrapper {
  margin-top: 8px;
}

.strength-bars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  height: 4px;
  margin-bottom: 4px;
}

.strength-bar {
  background: var(--color-border-subtle);
  border-radius: 2px;
  transition: background 0.2s;
}

.strength-text {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.result-state-card {
  text-align: center;
  padding: 20px 0;
}

.result-circle-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-status-green-bg);
  color: var(--color-status-green-fg);
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}

.result-state-card h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.result-state-card p {
  color: var(--color-text-secondary);
  font-size: 13.5px;
  line-height: 1.5;
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
