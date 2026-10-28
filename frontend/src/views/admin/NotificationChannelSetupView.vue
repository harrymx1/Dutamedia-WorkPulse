<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-vue-next';

interface ChannelStatus {
  email: { provider: string; status: string; enabled: boolean };
  push: { provider: string; status: string; enabled: boolean };
  inApp: { status: string; enabled: boolean };
}

const loading = ref(false);
const channels = ref<ChannelStatus>({
  email: { provider: 'Brevo SMTP / API', status: 'READY', enabled: true },
  push: { provider: 'Web Push (VAPID RFC 8292)', status: 'READY', enabled: true },
  inApp: { status: 'ACTIVE', enabled: true },
});

// Test delivery modal / state
const testChannel = ref<'EMAIL' | 'PUSH' | 'IN_APP'>('EMAIL');
const testRecipient = ref('harry@dutamedia.com');
const testEventType = ref('BLOCKER_CRITICAL_ALERT');
const testSending = ref(false);
const testResult = ref<{ success: boolean; message: string; channel: string } | null>(null);

// Toasts
const toastMessage = ref('');
const errorMessage = ref('');

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
    setTimeout(() => {
      errorMessage.value = '';
    }, 4000);
  } else {
    toastMessage.value = msg;
    setTimeout(() => {
      toastMessage.value = '';
    }, 4000);
  }
}

async function loadChannels() {
  loading.value = true;
  try {
    const res = await apiClient<ChannelStatus>('/notifications/channels');
    const data = res?.data || res;
    if (data && data.email) {
      channels.value = data;
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat status kanal.', true);
  } finally {
    loading.value = false;
  }
}

async function handleTestDelivery() {
  testSending.value = true;
  testResult.value = null;
  try {
    const res = await apiClient<{ success: boolean; message: string; channel: string }>(
      '/notifications/test-delivery',
      {
        method: 'POST',
        body: JSON.stringify({
          channel: testChannel.value,
          recipient: testRecipient.value.trim(),
          eventType: testEventType.value,
        }),
      },
    );
    testResult.value = res?.data || res;
    showToast('Simulasi pengiriman uji coba berhasil dikirim.');
  } catch (err: any) {
    testResult.value = {
      success: false,
      message: err.message || 'Gagal melakukan uji coba pengiriman.',
      channel: testChannel.value,
    };
    showToast(err.message || 'Gagal mengirimkan notifikasi uji coba.', true);
  } finally {
    testSending.value = false;
  }
}

onMounted(() => {
  loadChannels();
});
</script>

<template>
  <div class="channel-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Admin / <strong>Notification Setup</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/notifications" class="btn-topbar">
          <Bell :size="16" />
          <span>Notification Center</span>
        </router-link>
      </div>
    </header>

    <!-- Toasts -->
    <div v-if="toastMessage" class="toast-popup success" role="status">
      <CheckCircle2 :size="18" />
      <span>{{ toastMessage }}</span>
    </div>
    <div v-if="errorMessage" class="toast-popup error" role="alert">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <main class="main-content">
      <!-- Page Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Konfigurasi Sistem &amp; Keandalan Pengiriman</span>
          <h1>Pengaturan Kanal Notifikasi</h1>
          <p class="subtitle">
            Konfigurasi provider, status kesiapan teknis, matriks routing saluran notifikasi, serta instrumen uji pengiriman langsung untuk memastikan keandalan penyampaian pesan ke pengguna.
          </p>
        </div>
      </div>

      <!-- Metrics Summary -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Kanal Tersedia</span>
          <div class="metric-row">
            <span class="metric-value">3 Kanal</span>
            <span class="pill green">Semua Aktif</span>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-label">Matriks Routing Event</span>
          <div class="metric-row">
            <span class="metric-value">5 Skenario</span>
            <span class="pill blue">Auto-Route</span>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-label">Status Kesiapan Sistem</span>
          <div class="metric-row">
            <span class="metric-value">Siap 100%</span>
            <span class="pill green">Operational</span>
          </div>
        </div>
      </div>

      <!-- Channel Grid -->
      <div class="channel-grid">
        <!-- In-App Web Notification Center -->
        <div class="channel-card">
          <div class="channel-head">
            <div class="channel-icon-wrap in-app">
              <Bell :size="20" />
            </div>
            <div>
              <h3>In-App Notification Center</h3>
              <p>Pusat notifikasi langsung di dalam antarmuka web WorkPulse.</p>
            </div>
            <span class="pill green">Aktif</span>
          </div>
          <div class="channel-body">
            <div class="detail-row">
              <span>Mekanisme:</span>
              <strong>Real-time Polling &amp; SSE</strong>
            </div>
            <div class="detail-row">
              <span>Retensi Riwayat:</span>
              <strong>30 Hari</strong>
            </div>
          </div>
        </div>

        <!-- Brevo Email -->
        <div class="channel-card">
          <div class="channel-head">
            <div class="channel-icon-wrap email">
              <Mail :size="20" />
            </div>
            <div>
              <h3>Email Transaksional (Brevo)</h3>
              <p>Pengiriman email untuk eskalasi kendala kritis &amp; laporan mingguan.</p>
            </div>
            <span class="pill green">Siap</span>
          </div>
          <div class="channel-body">
            <div class="detail-row">
              <span>Provider:</span>
              <strong>{{ channels.email.provider }}</strong>
            </div>
            <div class="detail-row">
              <span>Status Kunci API:</span>
              <strong class="text-green">Tervalidasi</strong>
            </div>
          </div>
        </div>

        <!-- Web Push VAPID -->
        <div class="channel-card">
          <div class="channel-head">
            <div class="channel-icon-wrap push">
              <Smartphone :size="20" />
            </div>
            <div>
              <h3>Browser Push (VAPID RFC 8292)</h3>
              <p>Pemberitahuan push langsung ke peramban tanpa membuka tab aplikasi.</p>
            </div>
            <span class="pill green">Siap</span>
          </div>
          <div class="channel-body">
            <div class="detail-row">
              <span>Protokol:</span>
              <strong>{{ channels.push.provider }}</strong>
            </div>
            <div class="detail-row">
              <span>Status Sertifikat:</span>
              <strong class="text-green">Aktif &amp; Sah</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Matriks Routing Kanal -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Matriks Routing Kanal Per Trigger Event</h2>
            <p class="panel-subtitle">Pemetaan saluran transmisi notifikasi berdasarkan urgensi setiap skenario.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th scope="col">Trigger Event</th>
                <th scope="col">Peran Penerima</th>
                <th scope="col" class="text-center">In-App</th>
                <th scope="col" class="text-center">Browser Push</th>
                <th scope="col" class="text-center">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Pengingat Morning Check-in</strong>
                  <div class="event-desc">Pukul 09:00 WIB menjelang batas cut-off</div>
                </td>
                <td>Seluruh Karyawan Aktif</td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="mute-pill">-</span></td>
              </tr>
              <tr>
                <td>
                  <strong>Eskalasi Blocker Kritis (P0)</strong>
                  <div class="event-desc">Tiket kendala dengan severitas CRITICAL</div>
                </td>
                <td>Supervisor, PM, Lead Terkait</td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
              </tr>
              <tr>
                <td>
                  <strong>Pengajuan Koreksi Material</strong>
                  <div class="event-desc">Jendela sanggahan 24 jam terbuka</div>
                </td>
                <td>Supervisor &amp; Reviewer</td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="mute-pill">-</span></td>
              </tr>
              <tr>
                <td>
                  <strong>Persetujuan &amp; Rekonsiliasi Cuti</strong>
                  <div class="event-desc">Status cuti disetujui (DEC-007)</div>
                </td>
                <td>Pemohon Cuti &amp; HRGA</td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="mute-pill">-</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
              </tr>
              <tr>
                <td>
                  <strong>Peringatan Pola Kepatuhan 3x</strong>
                  <div class="event-desc">Eskalasi pola ketidakpatuhan beruntun</div>
                </td>
                <td>Karyawan &amp; HRGA</td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
                <td class="text-center"><span class="check-pill">Aktif</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Testing Simulator Section -->
      <section class="panel test-panel">
        <div class="panel-head">
          <div>
            <h2>Instrumen Uji Pengiriman Kanal Notifikasi</h2>
            <p class="panel-subtitle">Simulasikan pengiriman langsung untuk memastikan kesiapan rute transmisi.</p>
          </div>
        </div>
        <div class="panel-body">
          <form class="test-form" @submit.prevent="handleTestDelivery">
            <div class="form-grid">
              <div class="field">
                <label for="testChannel">Pilih Kanal Uji</label>
                <select id="testChannel" v-model="testChannel" class="select">
                  <option value="EMAIL">Email (Brevo)</option>
                  <option value="PUSH">Browser Web Push (VAPID)</option>
                  <option value="IN_APP">In-App Web Center</option>
                </select>
              </div>

              <div class="field">
                <label for="testEventType">Skenario Event</label>
                <select id="testEventType" v-model="testEventType" class="select">
                  <option value="BLOCKER_CRITICAL_ALERT">Eskalasi Blocker Kritis</option>
                  <option value="MORNING_REMINDER">Pengingat Komitmen Pagi</option>
                  <option value="LEAVE_RECONCILED">Rekonsiliasi Cuti Pasca-Cut-Off</option>
                </select>
              </div>

              <div class="field">
                <label for="testRecipient">Target Penerima (Email / Identitas)</label>
                <input
                  id="testRecipient"
                  v-model="testRecipient"
                  type="text"
                  class="input"
                  required
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="testSending">
                <Send :size="15" />
                <span>{{ testSending ? 'Mengirim Uji Coba...' : 'Kirim Notifikasi Uji Coba' }}</span>
              </button>
            </div>
          </form>

          <div v-if="testResult" class="result-box" :class="{ success: testResult.success, error: !testResult.success }">
            <CheckCircle2 v-if="testResult.success" :size="20" />
            <AlertCircle v-else :size="20" />
            <div>
              <strong>{{ testResult.success ? 'Hasil Pengujian: BERHASIL' : 'Hasil Pengujian: GAGAL' }}</strong>
              <p>{{ testResult.message }} (Kanal: {{ testResult.channel }})</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.channel-layout {
  min-height: 100vh;
  background: var(--color-canvas, #F7FAF9);
  color: var(--color-text-primary, #0E211B);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #FFFFFF;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.brand-title {
  font-weight: 800;
  font-size: 16px;
}

.breadcrumb {
  font-size: 13.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-left: 8px;
}

.btn-topbar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-border-strong, #A9C7BC);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #0E211B);
  text-decoration: none;
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-brand-primary, #00674D);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 4px 0 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary, #5C6E68);
  max-width: 780px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 16px 18px;
}

.metric-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.metric-value {
  font-size: 22px;
  font-weight: 800;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .channel-grid {
    grid-template-columns: 1fr;
  }
}

.channel-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 18px;
}

.channel-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.channel-head h3 {
  font-size: 14.5px;
  font-weight: 800;
}

.channel-head p {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.channel-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.channel-icon-wrap.in-app { background: #E0F2FE; color: #075985; }
.channel-icon-wrap.email { background: #FEF3C7; color: #92400E; }
.channel-icon-wrap.push { background: #DCFCE7; color: #166534; }

.channel-body {
  border-top: 1px solid var(--color-border-subtle, #DCE7E2);
  padding-top: 12px;
  font-size: 12.5px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row span {
  color: var(--color-text-secondary, #5C6E68);
}

.text-green {
  color: #166534;
}

.panel {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.panel-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.panel-head h2 {
  font-size: 16px;
  font-weight: 800;
}

.panel-subtitle {
  font-size: 12.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.panel-body {
  padding: 20px;
}

.table-wrap {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-table th {
  text-align: left;
  padding: 10px 18px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #5C6E68);
  background: #F8FAF9;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.matrix-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  font-size: 13px;
}

.text-center {
  text-align: center;
}

.event-desc {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
}

.check-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: #DCFCE7;
  color: #166534;
  font-size: 11px;
  font-weight: 700;
}

.mute-pill {
  color: var(--color-text-secondary, #5C6E68);
  font-weight: 700;
}

.test-form .form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .test-form .form-grid {
    grid-template-columns: 1fr;
  }
}

.field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 6px;
}

.select,
.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 6px;
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.result-box {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 13px;
}

.result-box.success {
  background: #DCFCE7;
  border: 1px solid #86EFAC;
  color: #166534;
}

.result-box.error {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}

.result-box p {
  margin: 2px 0 0;
  font-size: 12.5px;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.pill.blue {
  background: #E0F2FE;
  color: #075985;
  border: 1px solid #7DD3FC;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast-popup.success {
  background: #DCFCE7;
  border: 1px solid #86EFAC;
  color: #166534;
}

.toast-popup.error {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
}
</style>
