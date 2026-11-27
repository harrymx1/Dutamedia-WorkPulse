<script setup lang="ts">
import ToastPopup from '../../components/ToastPopup.vue';
import TopBar from '../../components/TopBar.vue';
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import { formatDateTimeWib } from '../../utils/dateTime';
import {
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  Trash2,
  FlaskConical,
} from 'lucide-vue-next';

type DeliveryMode = 'LIVE' | 'SIMULATION';

interface ChannelCardState {
  id: 'IN_APP_CENTER' | 'EMAIL_BREVO' | 'BROWSER_PUSH';
  name: string;
  provider: string;
  status: string;
  mode: DeliveryMode;
  statusLabel: string;
  detailLabel: string;
  description: string;
  isConfigured: boolean;
  enabled: boolean;
}

interface TriggerMatrixRow {
  trigger: string;
  label: string;
  description: string;
  recipient: string;
  inApp: boolean;
  browserPush: boolean;
  email: boolean;
}

interface DeliveryLogItem {
  id: string;
  timestamp: string;
  channel: string;
  channelLabel: string;
  eventLabel: string;
  recipient: string;
  deliveryMode: DeliveryMode | 'ERROR';
  statusLabel: string;
  success: boolean;
  message: string;
  latencyMs?: number;
}

const DEFAULT_TRIGGER_MATRIX: TriggerMatrixRow[] = [
  {
    trigger: 'MORNING_REMINDER',
    label: 'Pengingat Komitmen Pagi',
    description: '60 menit sebelum batas tepat waktu pagi',
    recipient: 'Karyawan wajib check-in yang belum mengirim Komitmen Pagi',
    inApp: true,
    browserPush: true,
    email: true,
  },
  {
    trigger: 'EOD_REMINDER',
    label: 'Pengingat Evaluasi Sore (EOD)',
    description: '60 menit sebelum batas tepat waktu sore',
    recipient: 'Karyawan wajib check-in yang belum mengirim Evaluasi Sore',
    inApp: true,
    browserPush: true,
    email: true,
  },
  {
    trigger: 'BLOCKER_RAISED',
    label: 'Kendala Baru Dilaporkan / Ditugaskan',
    description: 'Tiket kendala baru atau kendala darurat kritis',
    recipient: 'Penanggung Jawab Kendala & Atasan / Pemimpin Proyek terkait',
    inApp: true,
    browserPush: true,
    email: true,
  },
  {
    trigger: 'BLOCKER_ESCALATED',
    label: 'Eskalasi Kendala Otomatis',
    description: 'Kendala belum ditanggapi melewati batas waktu respon',
    recipient: 'Pimpinan pada jenjang eskalasi berikutnya hingga Direksi',
    inApp: true,
    browserPush: true,
    email: true,
  },
  {
    trigger: 'BLOCKER_RESOLVED_REOPENED',
    label: 'Kendala Tuntas / Dibuka Kembali',
    description: 'Pembaruan penyelesaian atau pengembalian tiket kendala',
    recipient: 'Karyawan pelapor & Penanggung Jawab Kendala',
    inApp: true,
    browserPush: true,
    email: true,
  },
  {
    trigger: 'CORRECTION_MATERIAL_SUBMITTED',
    label: 'Pengajuan Koreksi Material',
    description: 'Jendela sanggahan 24 jam terbuka untuk ditinjau',
    recipient: 'Peninjau Berwenang dalam cakupan kewenangan',
    inApp: true,
    browserPush: false,
    email: true,
  },
  {
    trigger: 'CORRECTION_DECIDED',
    label: 'Keputusan Koreksi (Disetujui / Ditolak)',
    description: 'Hasil tinjauan atau persetujuan otomatis koreksi',
    recipient: 'Karyawan pemohon koreksi',
    inApp: true,
    browserPush: false,
    email: false,
  },
  {
    trigger: 'LEAVE_WORKFLOW',
    label: 'Permohonan & Keputusan Cuti',
    description: 'Pengajuan cuti baru, persetujuan, atau penolakan cuti',
    recipient: 'Penyetuju Cuti & Karyawan pemohon',
    inApp: true,
    browserPush: true,
    email: true,
  },
  {
    trigger: 'ACCOUNT_INVITATION',
    label: 'Undangan & Aktivasi Akun Karyawan',
    description: 'Tautan aktivasi sekali pakai berlaku 72 jam',
    recipient: 'Karyawan pemilik akun yang diundang',
    inApp: true,
    browserPush: false,
    email: true,
  },
];

const auth = useAuthStore();
const loading = ref(false);

const inAppChannel = ref<ChannelCardState>({
  id: 'IN_APP_CENTER',
  name: 'In-App Notification Center',
  provider: 'Pusat Notifikasi Basis Data WorkPulse',
  status: 'ACTIVE',
  mode: 'LIVE',
  statusLabel: 'Aktif',
  detailLabel: 'Tersimpan di Basis Data · Retensi 30 Hari',
  description: 'Pusat notifikasi langsung di dalam antarmuka web WorkPulse.',
  isConfigured: true,
  enabled: true,
});

const emailChannel = ref<ChannelCardState>({
  id: 'EMAIL_BREVO',
  name: 'Email Transaksional (Brevo)',
  provider: 'Brevo SMTP / API',
  status: 'SIMULATION',
  mode: 'SIMULATION',
  statusLabel: 'Mode Simulasi Aktif',
  detailLabel: 'Mode Simulasi (Kunci Brevo Belum Diatur)',
  description: 'Pengiriman email untuk pengingat, eskalasi kendala kritis, cuti, dan tautan undangan.',
  isConfigured: false,
  enabled: true,
});

const pushChannel = ref<ChannelCardState>({
  id: 'BROWSER_PUSH',
  name: 'Browser Push (VAPID RFC 8292)',
  provider: 'Web Push (VAPID RFC 8292)',
  status: 'SIMULATION',
  mode: 'SIMULATION',
  statusLabel: 'Mode Simulasi Aktif',
  detailLabel: 'Mode Simulasi (Kunci VAPID Belum Diatur)',
  description: 'Pemberitahuan push ke peramban perangkat yang telah memberikan izin.',
  isConfigured: false,
  enabled: true,
});

const triggerMatrix = ref<TriggerMatrixRow[]>([...DEFAULT_TRIGGER_MATRIX]);
const activeMatrixFilter = ref<'ALL' | 'EMAIL' | 'PUSH' | 'IN_APP'>('ALL');

const filteredTriggers = computed(() => {
  if (activeMatrixFilter.value === 'EMAIL') {
    return triggerMatrix.value.filter((t) => t.email);
  }
  if (activeMatrixFilter.value === 'PUSH') {
    return triggerMatrix.value.filter((t) => t.browserPush);
  }
  if (activeMatrixFilter.value === 'IN_APP') {
    return triggerMatrix.value.filter((t) => t.inApp);
  }
  return triggerMatrix.value;
});

const liveChannelsCount = computed(() => {
  return [inAppChannel.value, emailChannel.value, pushChannel.value].filter(
    (c) => c.mode === 'LIVE',
  ).length;
});

const simChannelsCount = computed(() => 3 - liveChannelsCount.value);
const allChannelsLive = computed(() => liveChannelsCount.value === 3);

// Test delivery state
const testChannel = ref<'EMAIL' | 'PUSH' | 'IN_APP'>('EMAIL');
const testRecipient = ref(auth.user?.email || 'admin@dutamedia.com');
const testEventType = ref('MORNING_REMINDER');
const testSending = ref(false);
const testResult = ref<{
  success: boolean;
  message: string;
  channel: string;
  statusLabel?: string;
} | null>(null);
const deliveryLogs = ref<DeliveryLogItem[]>([]);

const testEventOptions = [
  { value: 'MORNING_REMINDER', label: 'Pengingat Komitmen Pagi' },
  { value: 'EOD_REMINDER', label: 'Pengingat Evaluasi Sore (EOD)' },
  { value: 'BLOCKER_RAISED', label: 'Kendala Baru / Eskalasi Darurat' },
  { value: 'CORRECTION_MATERIAL_SUBMITTED', label: 'Pengajuan Koreksi Material' },
  { value: 'LEAVE_WORKFLOW', label: 'Permohonan & Keputusan Cuti' },
  { value: 'ACCOUNT_INVITATION', label: 'Undangan & Aktivasi Akun Karyawan' },
];

// Toasts
const toastMessage = ref('');
const errorMessage = ref('');

function showToast(msg: string, isError = false) {
  if (isError) {
    errorMessage.value = msg;
  } else {
    toastMessage.value = msg;
  }
}

function formatChannelLabel(raw: string): string {
  const up = String(raw || '').toUpperCase();
  if (up === 'EMAIL') return 'Email (Brevo)';
  if (up === 'PUSH' || up === 'BROWSER_PUSH') return 'Browser Push (VAPID)';
  if (up === 'IN_APP' || up === 'IN_APP_CENTER') return 'In-App Notification Center';
  return raw;
}

function resolveEventLabel(eventCode: string): string {
  const foundOpt = testEventOptions.find((o) => o.value === eventCode);
  if (foundOpt) return foundOpt.label;
  const foundRow = triggerMatrix.value.find((t) => t.trigger === eventCode);
  return foundRow ? foundRow.label : eventCode;
}

function normalizeServerChannel(
  item: any,
  fallback: ChannelCardState,
): ChannelCardState {
  if (!item) return fallback;
  const isConfigured =
    typeof item.isConfigured === 'boolean'
      ? item.isConfigured
      : item.status === 'ACTIVE' || item.status === 'READY';
  const mode: DeliveryMode =
    item.mode === 'LIVE' || item.mode === 'SIMULATION'
      ? item.mode
      : isConfigured
        ? 'LIVE'
        : 'SIMULATION';

  return {
    id: item.id || fallback.id,
    name: item.name || fallback.name,
    provider: item.provider || fallback.provider,
    status: item.status || (mode === 'LIVE' ? 'READY' : 'SIMULATION'),
    mode,
    statusLabel:
      item.statusLabel ||
      (mode === 'LIVE'
        ? fallback.id === 'IN_APP_CENTER'
          ? 'Aktif'
          : 'Siap (Terkonfigurasi)'
        : 'Mode Simulasi Aktif'),
    detailLabel: item.detailLabel || fallback.detailLabel,
    description: item.description || fallback.description,
    isConfigured,
    enabled: item.enabled ?? true,
  };
}

async function loadChannels() {
  loading.value = true;
  try {
    const res = await apiClient<any>('/notifications/channels');
    const data = res?.data || res;

    if (Array.isArray(data?.channels)) {
      const serverInApp = data.channels.find((c: any) => c.id === 'IN_APP_CENTER');
      const serverEmail = data.channels.find((c: any) => c.id === 'EMAIL_BREVO');
      const serverPush = data.channels.find((c: any) => c.id === 'BROWSER_PUSH');

      inAppChannel.value = normalizeServerChannel(serverInApp, inAppChannel.value);
      emailChannel.value = normalizeServerChannel(serverEmail, emailChannel.value);
      pushChannel.value = normalizeServerChannel(serverPush, pushChannel.value);
    } else if (data?.email || data?.push || data?.inApp) {
      if (data.inApp) {
        const live = data.inApp.status === 'ACTIVE' || data.inApp.enabled === true;
        inAppChannel.value = {
          ...inAppChannel.value,
          status: data.inApp.status || 'ACTIVE',
          mode: live ? 'LIVE' : 'SIMULATION',
          statusLabel: live ? 'Aktif' : 'Nonaktif',
        };
      }
      if (data.email) {
        const emailLive = Boolean(data.email.isConfigured);
        emailChannel.value = {
          ...emailChannel.value,
          provider: data.email.provider || emailChannel.value.provider,
          status: data.email.status || (emailLive ? 'READY' : 'SIMULATION'),
          mode: emailLive ? 'LIVE' : 'SIMULATION',
          statusLabel: emailLive ? 'Siap (Terkonfigurasi)' : 'Mode Simulasi Aktif',
          detailLabel: emailLive
            ? 'Kunci Layanan Terpasang'
            : 'Mode Simulasi (Kunci Brevo Belum Diatur)',
          isConfigured: emailLive,
        };
      }
      if (data.push) {
        const pushLive = Boolean(data.push.isConfigured);
        pushChannel.value = {
          ...pushChannel.value,
          provider: data.push.provider || pushChannel.value.provider,
          status: data.push.status || (pushLive ? 'READY' : 'SIMULATION'),
          mode: pushLive ? 'LIVE' : 'SIMULATION',
          statusLabel: pushLive ? 'Siap (Terkonfigurasi)' : 'Mode Simulasi Aktif',
          detailLabel: pushLive
            ? 'Kunci VAPID Terpasang'
            : 'Mode Simulasi (Kunci VAPID Belum Diatur)',
          isConfigured: pushLive,
        };
      }
    }

    if (Array.isArray(data?.triggerMatrix) && data.triggerMatrix.length > 0) {
      triggerMatrix.value = data.triggerMatrix.map((row: any) => {
        const matched = DEFAULT_TRIGGER_MATRIX.find((d) => d.trigger === row.trigger);
        return {
          trigger: row.trigger,
          label: row.label || matched?.label || row.trigger,
          description: row.description || matched?.description || '',
          recipient: row.recipient || matched?.recipient || 'Pengguna Terkait',
          inApp: Boolean(row.inApp),
          browserPush: Boolean(row.browserPush),
          email: Boolean(row.email),
        };
      });
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat status saluran notifikasi.', true);
  } finally {
    loading.value = false;
  }
}

function quickSelectChannel(channelKey: 'EMAIL' | 'PUSH' | 'IN_APP') {
  testChannel.value = channelKey;
  if (!testRecipient.value.trim()) {
    testRecipient.value = auth.user?.email || 'admin@dutamedia.com';
  }
  const el = document.getElementById('testPanelSection');
  el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}

function clearDeliveryLogs() {
  deliveryLogs.value = [];
  showToast('Log pengujian sesi berhasil dibersihkan.');
}

async function handleTestDelivery() {
  testResult.value = null;
  const recipientValue = testRecipient.value.trim();

  if (!recipientValue) {
    testResult.value = {
      success: false,
      message: 'Target penerima uji wajib diisi.',
      channel: formatChannelLabel(testChannel.value),
      statusLabel: 'Gagal Validasi',
    };
    showToast('Target penerima uji wajib diisi.', true);
    return;
  }

  if (
    testChannel.value === 'EMAIL' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientValue)
  ) {
    testResult.value = {
      success: false,
      message: 'Masukkan alamat email tujuan yang valid untuk pengujian saluran Email.',
      channel: formatChannelLabel(testChannel.value),
      statusLabel: 'Gagal Validasi',
    };
    showToast('Alamat email penerima uji tidak valid.', true);
    return;
  }

  testSending.value = true;
  try {
    const res = await apiClient<{
      success: boolean;
      message?: string;
      channel: string;
      deliveryMode?: DeliveryMode;
      statusLabel?: string;
      recipient?: string;
      deliveredAt?: string;
      latencyMs?: number;
    }>('/notifications/test-delivery', {
      method: 'POST',
      body: JSON.stringify({
        channel: testChannel.value,
        recipient: recipientValue,
        eventType: testEventType.value,
      }),
    });

    const data = res?.data || (res as any);
    const channelName = formatChannelLabel(data?.channel || testChannel.value);
    const deliveryMode: DeliveryMode =
      data?.deliveryMode === 'LIVE' || data?.deliveryMode === 'SIMULATION'
        ? data.deliveryMode
        : testChannel.value === 'IN_APP'
          ? 'LIVE'
          : testChannel.value === 'EMAIL'
            ? emailChannel.value.mode
            : pushChannel.value.mode;
    const statusLabel =
      data?.statusLabel ||
      (deliveryMode === 'LIVE' ? 'Terkirim' : 'Mode Simulasi Aktif');
    const resultMsg =
      data?.message ||
      `Simulasi pengiriman notifikasi ke saluran ${channelName} (${data?.recipient || recipientValue}) selesai diproses.`;

    testResult.value = {
      success: data?.success ?? true,
      message: resultMsg,
      channel: channelName,
      statusLabel,
    };

    deliveryLogs.value.unshift({
      id: `${Date.now()}-${deliveryLogs.value.length}`,
      timestamp: formatDateTimeWib(data?.deliveredAt || new Date().toISOString()),
      channel: data?.channel || testChannel.value,
      channelLabel: channelName,
      eventLabel: resolveEventLabel(testEventType.value),
      recipient: data?.recipient || recipientValue,
      deliveryMode,
      statusLabel,
      success: true,
      message: resultMsg,
      latencyMs: data?.latencyMs,
    });

    showToast(
      deliveryMode === 'LIVE'
        ? 'Uji coba pengiriman berhasil diproses.'
        : 'Uji coba diproses dalam Mode Simulasi Aktif.',
    );
  } catch (err: any) {
    const channelName = formatChannelLabel(testChannel.value);
    const errMsg = err.message || 'Gagal melakukan uji coba pengiriman.';
    testResult.value = {
      success: false,
      message: errMsg,
      channel: channelName,
      statusLabel: 'Gagal',
    };

    deliveryLogs.value.unshift({
      id: `${Date.now()}-${deliveryLogs.value.length}`,
      timestamp: formatDateTimeWib(new Date().toISOString()),
      channel: testChannel.value,
      channelLabel: channelName,
      eventLabel: resolveEventLabel(testEventType.value),
      recipient: recipientValue,
      deliveryMode: 'ERROR',
      statusLabel: 'Gagal',
      success: false,
      message: errMsg,
    });

    showToast(errMsg, true);
  } finally {
    testSending.value = false;
  }
}

onMounted(() => {
  if (auth.user?.email) {
    testRecipient.value = auth.user.email;
  }
  loadChannels();
});
</script>

<template>
  <div class="channel-layout">
    <!-- Topbar -->
    <TopBar breadcrumb="Administration / Saluran Notifikasi" />

    <!-- Toasts -->
    <ToastPopup
      :toast-message="toastMessage"
      :error-message="errorMessage"
      @clear-toast="toastMessage = ''"
      @clear-error="errorMessage = ''"
    />

    <main class="main-content">
      <!-- Page Heading -->
      <div class="page-heading">
        <div>
          <span class="eyebrow">Konfigurasi Sistem &amp; Keandalan Pengiriman</span>
          <h1>Pengaturan Kanal Notifikasi</h1>
          <p class="subtitle">
            Pantau kesiapan nyata saluran Email (Brevo), Browser Push (Web Push VAPID), dan Pusat Notifikasi Dalam Aplikasi, tinjau matriks 9 pemicu resmi, serta uji pengiriman secara jujur tanpa memalsukan status terkirim.
          </p>
        </div>
        <div class="heading-actions">
          <button
            id="btnRefreshChannels"
            type="button"
            class="btn btn-secondary"
            :disabled="loading"
            @click="loadChannels"
          >
            <RefreshCw :size="15" :class="{ spinning: loading }" />
            <span>{{ loading ? 'Memuat...' : 'Segarkan Status' }}</span>
          </button>
        </div>
      </div>

      <!-- Metrics Summary -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Kanal Tersedia</span>
          <div class="metric-row">
            <span class="metric-value">3 Kanal</span>
            <span class="pill" :class="allChannelsLive ? 'green' : 'amber'">
              {{
                allChannelsLive
                  ? 'Semua Aktif'
                  : `${liveChannelsCount} Aktif · ${simChannelsCount} Simulasi`
              }}
            </span>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-label">Matriks Routing Event</span>
          <div class="metric-row">
            <span class="metric-value">{{ triggerMatrix.length }} Skenario</span>
            <span class="pill blue">Rute Otomatis</span>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-label">Status Kesiapan Sistem</span>
          <div class="metric-row">
            <span class="metric-value">
              {{ allChannelsLive ? 'Siap 100%' : 'Mode Simulasi' }}
            </span>
            <span class="pill green">Operasional</span>
          </div>
        </div>
      </div>

      <!-- Channel Grid -->
      <div class="channel-grid">
        <!-- In-App Web Notification Center -->
        <div class="channel-card" data-channel-card="IN_APP_CENTER">
          <div class="channel-head">
            <div class="channel-icon-wrap in-app">
              <Bell :size="20" />
            </div>
            <div class="channel-title-wrap">
              <h3>{{ inAppChannel.name }}</h3>
              <p>{{ inAppChannel.description }}</p>
            </div>
            <span class="pill" :class="inAppChannel.mode === 'LIVE' ? 'green' : 'amber'">
              {{ inAppChannel.statusLabel }}
            </span>
          </div>
          <div class="channel-body">
            <div class="detail-row">
              <span>Mekanisme:</span>
              <strong>{{ inAppChannel.provider }}</strong>
            </div>
            <div class="detail-row">
              <span>Kesiapan:</span>
              <strong :class="inAppChannel.mode === 'LIVE' ? 'text-green' : 'text-amber'">
                {{ inAppChannel.detailLabel }}
              </strong>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm card-test-btn"
              @click="quickSelectChannel('IN_APP')"
            >
              <FlaskConical :size="14" />
              <span>Uji Saluran Ini</span>
            </button>
          </div>
        </div>

        <!-- Brevo Email -->
        <div class="channel-card" data-channel-card="EMAIL_BREVO">
          <div class="channel-head">
            <div class="channel-icon-wrap email">
              <Mail :size="20" />
            </div>
            <div class="channel-title-wrap">
              <h3>{{ emailChannel.name }}</h3>
              <p>{{ emailChannel.description }}</p>
            </div>
            <span class="pill" :class="emailChannel.mode === 'LIVE' ? 'green' : 'amber'">
              {{ emailChannel.statusLabel }}
            </span>
          </div>
          <div class="channel-body">
            <div class="detail-row">
              <span>Penyedia:</span>
              <strong>{{ emailChannel.provider }}</strong>
            </div>
            <div class="detail-row">
              <span>Status Layanan:</span>
              <strong :class="emailChannel.mode === 'LIVE' ? 'text-green' : 'text-amber'">
                {{ emailChannel.detailLabel }}
              </strong>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm card-test-btn"
              @click="quickSelectChannel('EMAIL')"
            >
              <FlaskConical :size="14" />
              <span>Uji Saluran Ini</span>
            </button>
          </div>
        </div>

        <!-- Web Push VAPID -->
        <div class="channel-card" data-channel-card="BROWSER_PUSH">
          <div class="channel-head">
            <div class="channel-icon-wrap push">
              <Smartphone :size="20" />
            </div>
            <div class="channel-title-wrap">
              <h3>{{ pushChannel.name }}</h3>
              <p>{{ pushChannel.description }}</p>
            </div>
            <span class="pill" :class="pushChannel.mode === 'LIVE' ? 'green' : 'amber'">
              {{ pushChannel.statusLabel }}
            </span>
          </div>
          <div class="channel-body">
            <div class="detail-row">
              <span>Protokol:</span>
              <strong>{{ pushChannel.provider }}</strong>
            </div>
            <div class="detail-row">
              <span>Status Layanan:</span>
              <strong :class="pushChannel.mode === 'LIVE' ? 'text-green' : 'text-amber'">
                {{ pushChannel.detailLabel }}
              </strong>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm card-test-btn"
              @click="quickSelectChannel('PUSH')"
            >
              <FlaskConical :size="14" />
              <span>Uji Saluran Ini</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Matriks Routing Kanal -->
      <section class="panel" aria-label="Matriks Routing Kanal Per Trigger Event">
        <div class="panel-head">
          <div>
            <h2>Matriks Routing Kanal Per Trigger Event</h2>
            <p class="panel-subtitle">
              Pemetaan saluran resmi untuk ke-9 pemicu sistem tanpa memperluas Browser Push di luar ketentuan.
            </p>
          </div>
          <span class="pill blue" id="matrixCountBadge">
            {{ filteredTriggers.length }} pemicu resmi
          </span>
        </div>

        <div class="matrix-tabs" role="tablist" aria-label="Filter Saluran Matriks">
          <button
            id="matrixTabAll"
            type="button"
            role="tab"
            :aria-selected="activeMatrixFilter === 'ALL'"
            class="matrix-tab"
            :class="{ active: activeMatrixFilter === 'ALL' }"
            @click="activeMatrixFilter = 'ALL'"
          >
            Semua Pemicu ({{ triggerMatrix.length }})
          </button>
          <button
            id="matrixTabEmail"
            type="button"
            role="tab"
            :aria-selected="activeMatrixFilter === 'EMAIL'"
            class="matrix-tab"
            :class="{ active: activeMatrixFilter === 'EMAIL' }"
            @click="activeMatrixFilter = 'EMAIL'"
          >
            Email
          </button>
          <button
            id="matrixTabPush"
            type="button"
            role="tab"
            :aria-selected="activeMatrixFilter === 'PUSH'"
            class="matrix-tab"
            :class="{ active: activeMatrixFilter === 'PUSH' }"
            @click="activeMatrixFilter = 'PUSH'"
          >
            Browser Push
          </button>
          <button
            id="matrixTabInApp"
            type="button"
            role="tab"
            :aria-selected="activeMatrixFilter === 'IN_APP'"
            class="matrix-tab"
            :class="{ active: activeMatrixFilter === 'IN_APP' }"
            @click="activeMatrixFilter = 'IN_APP'"
          >
            Pusat Notifikasi In-App
          </button>
        </div>

        <div class="table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th scope="col">Peristiwa Pemicu</th>
                <th scope="col">Peran Penerima</th>
                <th scope="col" class="text-center">In-App</th>
                <th scope="col" class="text-center">Browser Push</th>
                <th scope="col" class="text-center">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredTriggers" :key="row.trigger">
                <td>
                  <strong>{{ row.label }}</strong>
                  <div v-if="row.description" class="event-desc">{{ row.description }}</div>
                </td>
                <td>{{ row.recipient }}</td>
                <td class="text-center">
                  <span v-if="row.inApp" class="check-pill">Aktif</span>
                  <span v-else class="mute-pill">Tidak Aktif</span>
                </td>
                <td class="text-center">
                  <span v-if="row.browserPush" class="check-pill">Aktif</span>
                  <span v-else class="mute-pill">Tidak Aktif</span>
                </td>
                <td class="text-center">
                  <span v-if="row.email" class="check-pill">Aktif</span>
                  <span v-else class="mute-pill">Tidak Aktif</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Testing Simulator Section -->
      <section id="testPanelSection" class="panel test-panel">
        <div class="panel-head">
          <div>
            <h2>Instrumen Uji Pengiriman Kanal Notifikasi</h2>
            <p class="panel-subtitle">
              Jalankan uji coba pengiriman untuk melihat apakah saluran bekerja langsung atau masih berada pada Mode Simulasi Aktif.
            </p>
          </div>
        </div>
        <div class="panel-body">
          <form class="test-form" novalidate @submit.prevent="handleTestDelivery">
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
                  <option
                    v-for="opt in testEventOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label for="testRecipient">Target Penerima (Email / Identitas)</label>
                <input
                  id="testRecipient"
                  v-model="testRecipient"
                  type="text"
                  class="input"
                  placeholder="admin@dutamedia.com"
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

          <div
            v-if="testResult"
            class="result-box"
            :class="{ success: testResult.success, error: !testResult.success }"
            role="status"
          >
            <CheckCircle2 v-if="testResult.success" :size="20" class="result-icon" />
            <AlertCircle v-else :size="20" class="result-icon" />
            <div>
              <div class="result-head-line">
                <strong>{{ testResult.success ? 'Hasil Pengujian: BERHASIL' : 'Hasil Pengujian: GAGAL' }}</strong>
                <span
                  v-if="testResult.statusLabel"
                  class="pill"
                  :class="
                    !testResult.success
                      ? 'red'
                      : testResult.statusLabel.includes('Simulasi')
                        ? 'amber'
                        : 'green'
                  "
                >
                  {{ testResult.statusLabel }}
                </span>
              </div>
              <p>{{ testResult.message }} (Kanal: {{ testResult.channel }})</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Delivery Logs Section -->
      <section class="panel" aria-label="Log Pengiriman Uji Coba Terbaru">
        <div class="panel-head">
          <div>
            <h2>Log Pengiriman Uji Coba Terbaru</h2>
            <p class="panel-subtitle">
              Catatan setiap percobaan pengiriman uji coba pada sesi ini beserta status nyata salurannya.
            </p>
          </div>
          <button
            v-if="deliveryLogs.length > 0"
            id="btnClearDeliveryLogs"
            type="button"
            class="btn btn-secondary btn-sm"
            @click="clearDeliveryLogs"
          >
            <Trash2 :size="14" />
            <span>Bersihkan Log Sesi</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="matrix-table log-table">
            <thead>
              <tr>
                <th scope="col">Waktu (WIB)</th>
                <th scope="col">Saluran</th>
                <th scope="col">Skenario</th>
                <th scope="col">Penerima</th>
                <th scope="col">Status</th>
                <th scope="col">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="deliveryLogs.length === 0">
                <td colspan="6" class="empty-log-cell">
                  <span class="empty-log-text">
                    Belum ada catatan pengujian pengiriman pada sesi ini. Jalankan uji coba di atas untuk mencatat hasilnya.
                  </span>
                </td>
              </tr>
              <tr v-for="item in deliveryLogs" :key="item.id">
                <td class="mono-cell">{{ item.timestamp }}</td>
                <td><strong>{{ item.channelLabel }}</strong></td>
                <td>{{ item.eventLabel }}</td>
                <td>{{ item.recipient }}</td>
                <td>
                  <span
                    class="pill"
                    :class="
                      item.deliveryMode === 'LIVE'
                        ? 'green'
                        : item.deliveryMode === 'SIMULATION'
                          ? 'amber'
                          : 'red'
                    "
                  >
                    {{ item.statusLabel }}
                  </span>
                </td>
                <td class="log-message-cell">{{ item.message }}</td>
              </tr>
            </tbody>
          </table>
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

.main-content {
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.heading-actions {
  flex-shrink: 0;
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
  line-height: 1.55;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
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
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.metric-value {
  font-size: 21px;
  font-weight: 800;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.channel-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.channel-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.channel-title-wrap {
  flex: 1;
  min-width: 0;
}

.channel-head h3 {
  font-size: 14.5px;
  font-weight: 800;
}

.channel-head p {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
  margin-top: 2px;
  line-height: 1.45;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.detail-row span {
  color: var(--color-text-secondary, #5C6E68);
}

.detail-row strong {
  text-align: right;
}

.card-test-btn {
  margin-top: 6px;
  align-self: flex-start;
}

.text-green {
  color: #166534;
}

.text-amber {
  color: #92400E;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
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

.matrix-tabs {
  display: flex;
  gap: 6px;
  padding: 0 20px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  overflow-x: auto;
}

.matrix-tab {
  border: none;
  border-bottom: 2.5px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12.5px;
  font-weight: 700;
  padding: 11px 10px;
  white-space: nowrap;
  cursor: pointer;
}

.matrix-tab:hover {
  color: var(--color-text-primary, #0E211B);
}

.matrix-tab.active {
  color: var(--color-brand-primary, #00674D);
  border-bottom-color: var(--color-brand-primary, #00674D);
}

.table-wrap {
  overflow-x: auto;
  max-width: 100%;
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
  white-space: nowrap;
}

.matrix-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  font-size: 13px;
  vertical-align: middle;
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
  padding: 2px 9px;
  border-radius: 999px;
  background: #DCFCE7;
  color: #166534;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.mute-pill {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  background: #F1F5F9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.test-form .form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.field {
  min-width: 0;
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
  background: #FFFFFF;
  color: var(--color-text-primary, #0E211B);
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

.result-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.result-head-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
}

.empty-log-cell {
  text-align: center;
  padding: 26px 18px !important;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 13px;
}

.mono-cell {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  white-space: nowrap;
}

.log-message-cell {
  min-width: 240px;
  color: var(--color-text-secondary, #5C6E68);
  line-height: 1.45;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.pill.green {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #86EFAC;
}

.pill.amber {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.pill.red {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.btn-secondary {
  background: #FFFFFF;
  color: var(--color-text-primary, #0E211B);
  border: 1px solid var(--color-border-subtle, #DCE7E2);
}

.btn-secondary:hover {
  background: #F8FAF9;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

@media (max-width: 1180px) {
  .channel-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .metrics-grid,
  .test-form .form-grid {
    grid-template-columns: 1fr;
  }

  .main-content {
    padding: 16px 14px 48px;
  }

  .page-heading {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .heading-actions {
    width: 100%;
  }

  .heading-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .channel-head {
    flex-wrap: wrap;
  }

  .channel-head .channel-title-wrap {
    flex: 1 1 calc(100% - 54px);
  }

  .channel-head > .pill {
    margin-left: 50px;
  }

  .detail-row {
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .detail-row strong {
    text-align: left;
  }

  .card-test-btn {
    width: 100%;
    justify-content: center;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
  }

  .panel-head .btn {
    width: 100%;
    justify-content: center;
  }

  .panel-body {
    padding: 16px;
  }

  .matrix-tabs {
    flex-wrap: wrap;
    overflow-x: visible;
    padding: 6px 14px;
    gap: 4px 12px;
  }

  .matrix-tab {
    padding: 8px 4px;
  }

  .empty-log-cell {
    text-align: left;
  }

  .empty-log-text {
    display: block;
    max-width: calc(100vw - 68px);
    white-space: normal;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
