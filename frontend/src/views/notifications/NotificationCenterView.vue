<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '../../api/client';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Settings,
  ShieldAlert,
  Smartphone,
  Info,
  ExternalLink,
} from 'lucide-vue-next';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

const loading = ref(false);
const notifications = ref<NotificationItem[]>([]);
const unreadCount = ref(0);

// Active Tab: 'LIST' | 'CHANNELS'
const activeMainTab = ref<'LIST' | 'CHANNELS'>('LIST');

// Filter & Search
const activeFilter = ref<'ALL' | 'UNREAD' | 'BLOCKER' | 'DAILY'>('ALL');
const searchQuery = ref('');

// Web Push State
const pushPermission = ref<string>('default');
const pushRegistering = ref(false);

// Detail Modal
const selectedNotification = ref<NotificationItem | null>(null);

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

async function loadNotifications() {
  loading.value = true;
  try {
    const [listRes, countRes] = await Promise.all([
      apiClient<NotificationItem[]>('/notifications'),
      apiClient<{ unreadCount: number }>('/notifications/unread-count'),
    ]);
    notifications.value = Array.isArray(listRes?.data) ? listRes.data : (Array.isArray(listRes) ? listRes : []);
    unreadCount.value = countRes?.data?.unreadCount ?? (countRes as any)?.unreadCount ?? 0;
  } catch (err: any) {
    showToast(err.message || 'Gagal memuat notifikasi.', true);
  } finally {
    loading.value = false;
  }
}

async function handleMarkAllAsRead() {
  try {
    await apiClient('/notifications/mark-all-read', { method: 'POST' });
    notifications.value.forEach((n) => {
      n.read = true;
    });
    unreadCount.value = 0;
    showToast('Seluruh notifikasi telah ditandai dibaca.');
  } catch (err: any) {
    showToast(err.message || 'Gagal menandai notifikasi.', true);
  }
}

async function handleMarkAsRead(notif: NotificationItem) {
  if (notif.read) return;
  try {
    await apiClient(`/notifications/${notif.id}/read`, { method: 'PATCH' });
    notif.read = true;
    if (unreadCount.value > 0) unreadCount.value--;
  } catch (err: any) {
    // silently fail
  }
}

function openDetail(notif: NotificationItem) {
  selectedNotification.value = notif;
  handleMarkAsRead(notif);
}

function closeDetail() {
  selectedNotification.value = null;
}

const filteredNotifications = computed(() => {
  return notifications.value.filter((n) => {
    if (activeFilter.value === 'UNREAD' && n.read) return false;
    if (activeFilter.value === 'BLOCKER' && !n.type.includes('BLOCKER')) return false;
    if (activeFilter.value === 'DAILY' && !(n.type.includes('COMMITMENT') || n.type.includes('REMINDER'))) return false;

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });
});

async function requestPushPermission() {
  pushRegistering.value = true;
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      pushPermission.value = permission;
      if (permission === 'granted') {
        await apiClient('/notifications/push-subscription', {
          method: 'POST',
          body: JSON.stringify({
            endpoint: 'https://fcm.googleapis.com/simulated-push-token',
            p256dh: 'simulated-key-p256dh',
            auth: 'simulated-auth-secret',
          }),
        });
        showToast('Izin Browser Push berhasil diaktifkan.');
      } else {
        showToast('Izin Browser Push tidak diizinkan oleh browser.', true);
      }
    } else {
      pushPermission.value = 'unsupported';
      showToast('Peramban web ini tidak mendukung push notification API.', true);
    }
  } catch (err: any) {
    showToast(err.message || 'Gagal mendaftarkan browser push.', true);
  } finally {
    pushRegistering.value = false;
  }
}

function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

onMounted(() => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    pushPermission.value = Notification.permission;
  }
  loadNotifications();
});
</script>

<template>
  <div class="notif-layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="brand-badge">WP</div>
        <span class="brand-title">WorkPulse</span>
        <span class="breadcrumb">Workspace / <strong>Notifications</strong></span>
      </div>
      <div class="topbar-right">
        <router-link to="/admin/notifications" class="btn-topbar">
          <Settings :size="16" />
          <span>Pengaturan Kanal</span>
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
          <span class="eyebrow">Pusat Komunikasi &amp; Pembaruan</span>
          <h1>Web Notification Center</h1>
          <p class="subtitle">
            Pusat pemantauan pemberitahuan komitmen kerja, eskalasi kendala, status pengajuan koreksi/cuti, serta pengingat aktivitas harian.
          </p>
        </div>
        <div class="heading-actions">
          <span class="pill amber">
            <span class="dot-sm"></span>
            {{ unreadCount }} belum dibaca
          </span>
          <button type="button" class="btn btn-secondary" @click="handleMarkAllAsRead">
            <CheckCheck :size="15" />
            <span>Tandai semua dibaca</span>
          </button>
        </div>
      </div>

      <!-- Metric Summary Cards -->
      <div class="summary-strip">
        <div class="metric-card" @click="activeFilter = 'ALL'">
          <div class="metric-head">
            <span class="metric-label">Total Notifikasi</span>
            <Bell :size="18" class="metric-icon" />
          </div>
          <div class="metric-value">{{ notifications.length }}</div>
          <div class="metric-note">Tercatat dalam in-system</div>
        </div>

        <div class="metric-card" @click="activeFilter = 'UNREAD'">
          <div class="metric-head">
            <span class="metric-label">Belum Dibaca</span>
            <AlertCircle :size="18" class="metric-icon text-amber" />
          </div>
          <div class="metric-value text-amber">{{ unreadCount }}</div>
          <div class="metric-note">Perlu peninjauan Anda</div>
        </div>

        <div class="metric-card" @click="activeMainTab = 'CHANNELS'">
          <div class="metric-head">
            <span class="metric-label">Browser Push Perangkat</span>
            <Smartphone :size="18" class="metric-icon" />
          </div>
          <div class="metric-value capitalize">{{ pushPermission }}</div>
          <div class="metric-note">Status izin peramban</div>
        </div>
      </div>

      <!-- Main Tabs -->
      <div class="view-tabs" role="tablist">
        <button
          type="button"
          class="view-tab"
          :class="{ active: activeMainTab === 'LIST' }"
          @click="activeMainTab = 'LIST'"
        >
          <Bell :size="16" />
          <span>Daftar Notifikasi</span>
          <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
        </button>
        <button
          type="button"
          class="view-tab"
          :class="{ active: activeMainTab === 'CHANNELS' }"
          @click="activeMainTab = 'CHANNELS'"
        >
          <Settings :size="16" />
          <span>Pengaturan Kanal &amp; Perangkat</span>
        </button>
      </div>

      <!-- TAB 1: DAFTAR NOTIFIKASI -->
      <div v-if="activeMainTab === 'LIST'" class="tab-panel">
        <section class="panel">
          <div class="filter-row">
            <div class="tabs">
              <button
                type="button"
                class="filter-pill"
                :class="{ active: activeFilter === 'ALL' }"
                @click="activeFilter = 'ALL'"
              >
                Semua
              </button>
              <button
                type="button"
                class="filter-pill"
                :class="{ active: activeFilter === 'UNREAD' }"
                @click="activeFilter = 'UNREAD'"
              >
                Belum Dibaca ({{ unreadCount }})
              </button>
              <button
                type="button"
                class="filter-pill"
                :class="{ active: activeFilter === 'BLOCKER' }"
                @click="activeFilter = 'BLOCKER'"
              >
                Blocker &amp; Eskalasi
              </button>
              <button
                type="button"
                class="filter-pill"
                :class="{ active: activeFilter === 'DAILY' }"
                @click="activeFilter = 'DAILY'"
              >
                Komitmen &amp; Pengingat
              </button>
            </div>

            <div class="search-wrap">
              <Search :size="15" class="search-icon" />
              <input
                v-model="searchQuery"
                type="search"
                class="search-input"
                placeholder="Cari notifikasi..."
              />
            </div>
          </div>

          <div v-if="loading" class="empty-state">
            <Clock :size="24" class="spin" />
            <p>Memuat notifikasi...</p>
          </div>

          <div v-else-if="filteredNotifications.length === 0" class="empty-state">
            <Bell :size="32" />
            <p>Tidak ada notifikasi yang sesuai filter.</p>
          </div>

          <div v-else class="notif-list">
            <div
              v-for="item in filteredNotifications"
              :key="item.id"
              class="notif-item"
              :class="{ unread: !item.read }"
              @click="openDetail(item)"
            >
              <div
                class="item-icon-box"
                :class="{
                  red: item.type.includes('BLOCKER'),
                  amber: item.type.includes('REMINDER'),
                  blue: item.type.includes('LEAVE') || item.type.includes('CORRECTION'),
                  green: item.type.includes('APPROVAL') || item.type.includes('RESOLVED'),
                }"
              >
                <AlertTriangle v-if="item.type.includes('BLOCKER')" :size="18" />
                <Clock v-else-if="item.type.includes('REMINDER')" :size="18" />
                <ShieldAlert v-else-if="item.type.includes('COMPLIANCE')" :size="18" />
                <Bell v-else :size="18" />
              </div>

              <div class="item-content">
                <div class="item-title-row">
                  <span v-if="!item.read" class="unread-dot"></span>
                  <strong class="item-title">{{ item.title }}</strong>
                </div>
                <p class="item-desc">{{ item.message }}</p>
                <div class="item-meta">
                  <span class="context-chip">{{ item.type }}</span>
                  <span class="item-time">{{ formatTime(item.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 2: PENGATURAN KANAL & PERANGKAT -->
      <div v-else class="tab-panel">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Izin Notifikasi Web Push Perangkat</h2>
              <p class="panel-subtitle">Aktifkan notifikasi peramban agar Anda tidak melewatkan eskalasi blocker mendesak.</p>
            </div>
          </div>

          <div class="panel-body">
            <div class="push-status-card">
              <div class="push-status-icon">
                <Smartphone :size="24" />
              </div>
              <div>
                <h3>Status Izin Peramban: <strong>{{ pushPermission.toUpperCase() }}</strong></h3>
                <p class="panel-subtitle">
                  {{ pushPermission === 'granted' ? 'Perangkat ini telah terdaftar menerima push notification.' : 'Klik tombol di bawah untuk meminta izin push notification pada peramban Anda.' }}
                </p>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                :disabled="pushRegistering || pushPermission === 'granted'"
                @click="requestPushPermission"
              >
                <Bell :size="15" />
                <span>{{ pushRegistering ? 'Memproses...' : (pushPermission === 'granted' ? 'Izin Aktif' : 'Aktifkan Browser Push') }}</span>
              </button>
            </div>

            <div class="info-note">
              <Info :size="18" class="info-icon" />
              <div>
                <strong>Konfigurasi Pengiriman:</strong> Notifikasi sistem akan dikirimkan secara serentak ke Web Notification Center (In-App) dan Browser Push Web (bila diizinkan). Pengaturan kanal tingkat lanjut tersedia di menu <strong>Admin Notification Setup</strong>.
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Detail Modal -->
      <div v-if="selectedNotification" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Rincian Pemberitahuan</h3>
            <button type="button" class="close-btn" @click="closeDetail">✕</button>
          </div>
          <div class="modal-body">
            <h4 class="modal-title">{{ selectedNotification.title }}</h4>
            <p class="modal-desc">{{ selectedNotification.message }}</p>
            <div class="modal-detail-box">
              <div class="detail-row">
                <span>Tipe Event:</span>
                <strong>{{ selectedNotification.type }}</strong>
              </div>
              <div class="detail-row">
                <span>Waktu Diterima:</span>
                <span>{{ formatTime(selectedNotification.createdAt) }} ({{ new Date(selectedNotification.createdAt).toLocaleDateString('id-ID') }})</span>
              </div>
            </div>

            <div v-if="selectedNotification.actionUrl" class="action-link-wrap">
              <router-link :to="selectedNotification.actionUrl" class="btn btn-primary">
                <ExternalLink :size="15" />
                <span>Buka Halaman Terkait</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.notif-layout {
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
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
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
  max-width: 720px;
}

.heading-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.metric-card:hover {
  border-color: var(--color-brand-primary, #00674D);
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #5C6E68);
}

.metric-icon {
  color: var(--color-brand-primary, #00674D);
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  margin: 6px 0 2px;
}

.capitalize {
  text-transform: capitalize;
}

.text-amber {
  color: #92400E;
}

.metric-note {
  font-size: 12px;
  color: var(--color-text-secondary, #5C6E68);
}

.view-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.view-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: #FFFFFF;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.view-tab.active {
  background: #E6F4EE;
  color: var(--color-brand-primary, #00674D);
  border-color: #86EFAC;
}

.tab-badge {
  background: #DC2626;
  color: #FFFFFF;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
}

.panel {
  background: #FFFFFF;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 12px;
  overflow: hidden;
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

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
  gap: 12px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-secondary, #5C6E68);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.filter-pill.active {
  background: #E6F4EE;
  color: var(--color-brand-primary, #00674D);
  border-color: #86EFAC;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary, #5C6E68);
}

.search-input {
  width: 100%;
  padding: 6px 10px 6px 30px;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 6px;
  font-size: 12.5px;
}

.notif-list {
  display: flex;
  flex-direction: column;
}

.notif-item {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #EBF1EE;
  border-left: 3.5px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notif-item:hover {
  background: #F8FAF9;
}

.notif-item.unread {
  background: #F8FCFA;
  border-left-color: var(--color-brand-primary, #00674D);
}

.item-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.item-icon-box.red { background: #FEE2E2; color: #991B1B; }
.item-icon-box.amber { background: #FEF3C7; color: #92400E; }
.item-icon-box.blue { background: #E0F2FE; color: #075985; }
.item-icon-box.green { background: #DCFCE7; color: #166534; }

.item-content {
  flex: 1;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-brand-primary, #00674D);
}

.item-title {
  font-size: 14px;
  font-weight: 700;
}

.item-desc {
  font-size: 13px;
  color: #3F524A;
  margin: 0;
  line-height: 1.45;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.context-chip {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: var(--color-text-secondary, #5C6E68);
}

.item-time {
  font-size: 11.5px;
  color: var(--color-text-secondary, #5C6E68);
}

.push-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #F8FAF9;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.push-status-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #E6F4EE;
  color: #00674D;
  display: grid;
  place-items: center;
}

.info-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #E0F2FE;
  border: 1px solid #7DD3FC;
  border-radius: 8px;
  padding: 12px;
  font-size: 12.5px;
  color: #075985;
  line-height: 1.45;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 27, 0.45);
  display: grid;
  place-items: center;
  z-index: 999;
  padding: 16px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 16px 36px rgba(14, 33, 27, 0.16);
  overflow: hidden;
}

.modal-header {
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle, #DCE7E2);
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 800;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.modal-body {
  padding: 20px;
}

.modal-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 13.5px;
  color: #3F524A;
  line-height: 1.5;
  margin-bottom: 14px;
}

.modal-detail-box {
  background: #F8FAF9;
  border: 1px solid var(--color-border-subtle, #DCE7E2);
  border-radius: 8px;
  padding: 12px;
  font-size: 12.5px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.action-link-wrap {
  display: flex;
  justify-content: flex-end;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.pill.amber {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

.dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #92400E;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
}

.btn-secondary {
  background: #FFFFFF;
  border-color: var(--color-border-strong, #A9C7BC);
  color: var(--color-text-primary, #0E211B);
}

.btn-primary {
  background: var(--color-brand-primary, #00674D);
  color: #FFFFFF;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--color-text-secondary, #5C6E68);
  gap: 12px;
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

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
