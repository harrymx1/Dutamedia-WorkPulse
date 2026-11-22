import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationChannelSetupView from './NotificationChannelSetupView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('NotificationChannelSetupView.vue (Prototipe 19 / EP11 - Pengaturan Kanal Notifikasi)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/notifications/channels')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              email: { provider: 'Brevo SMTP / API', status: 'READY', enabled: true },
              push: { provider: 'Web Push (VAPID RFC 8292)', status: 'READY', enabled: true },
              inApp: { status: 'ACTIVE', enabled: true },
            },
          }),
        });
      }
      if (url.includes('/notifications/test-delivery')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              success: true,
              message: 'Notifikasi simulasi sukses dikirim ke antrean.',
              channel: 'EMAIL',
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/admin/notifications', component: NotificationChannelSetupView },
        { path: '/notifications', component: { template: '<div>Notifications</div>' } },
      ],
    });
  });

  it('renders channel cards and routing matrix table', async () => {
    const wrapper = mount(NotificationChannelSetupView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Pengaturan Kanal Notifikasi');
    expect(wrapper.text()).toContain('In-App Notification Center');
    expect(wrapper.text()).toContain('Email Transaksional (Brevo)');
    expect(wrapper.text()).toContain('Browser Push (VAPID RFC 8292)');
    expect(wrapper.text()).toContain('Matriks Routing Kanal Per Trigger Event');
    expect(wrapper.text()).toContain('Rute Otomatis');
    expect(wrapper.text()).toContain('Operasional');
  });

  it('triggers test notification simulation successfully', async () => {
    const wrapper = mount(NotificationChannelSetupView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitBtn = wrapper.find('.test-form button[type="submit"]');
    expect(submitBtn.exists()).toBe(true);

    await wrapper.find('.test-form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Hasil Pengujian: BERHASIL');
  });

  it('parses server channel readiness honestly, renders all 9 canonical triggers, and filters by channel tabs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/notifications/channels')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              channels: [
                {
                  id: 'IN_APP_CENTER',
                  name: 'In-App Notification Center',
                  provider: 'Pusat Notifikasi Basis Data WorkPulse',
                  status: 'ACTIVE',
                  mode: 'LIVE',
                  statusLabel: 'Aktif',
                  detailLabel: 'Tersimpan di Basis Data · Retensi 30 Hari',
                  isConfigured: true,
                },
                {
                  id: 'EMAIL_BREVO',
                  name: 'Email Transaksional (Brevo)',
                  provider: 'Brevo SMTP / API',
                  status: 'SIMULATION',
                  mode: 'SIMULATION',
                  statusLabel: 'Mode Simulasi Aktif',
                  detailLabel: 'Mode Simulasi (Kunci Brevo Belum Diatur)',
                  isConfigured: false,
                },
                {
                  id: 'BROWSER_PUSH',
                  name: 'Browser Push (VAPID RFC 8292)',
                  provider: 'Web Push (VAPID RFC 8292)',
                  status: 'SIMULATION',
                  mode: 'SIMULATION',
                  statusLabel: 'Mode Simulasi Aktif',
                  detailLabel: 'Mode Simulasi (Kunci VAPID Belum Diatur)',
                  isConfigured: false,
                },
              ],
              triggerMatrix: [
                { trigger: 'MORNING_REMINDER', label: 'Pengingat Komitmen Pagi', inApp: true, browserPush: true, email: true },
                { trigger: 'EOD_REMINDER', label: 'Pengingat Evaluasi Sore (EOD)', inApp: true, browserPush: true, email: true },
                { trigger: 'BLOCKER_RAISED', label: 'Kendala Baru Dilaporkan / Ditugaskan', inApp: true, browserPush: true, email: true },
                { trigger: 'BLOCKER_ESCALATED', label: 'Eskalasi Kendala Otomatis', inApp: true, browserPush: true, email: true },
                { trigger: 'BLOCKER_RESOLVED_REOPENED', label: 'Kendala Tuntas / Dibuka Kembali', inApp: true, browserPush: true, email: true },
                { trigger: 'CORRECTION_MATERIAL_SUBMITTED', label: 'Pengajuan Koreksi Material', inApp: true, browserPush: false, email: true },
                { trigger: 'CORRECTION_DECIDED', label: 'Keputusan Koreksi (Disetujui / Ditolak)', inApp: true, browserPush: false, email: false },
                { trigger: 'LEAVE_WORKFLOW', label: 'Permohonan & Keputusan Cuti', inApp: true, browserPush: true, email: true },
                { trigger: 'ACCOUNT_INVITATION', label: 'Undangan & Aktivasi Akun Karyawan', inApp: true, browserPush: false, email: true },
              ],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    }));

    const wrapper = mount(NotificationChannelSetupView, {
      global: {
        plugins: [router, pinia],
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('1 Aktif · 2 Simulasi');
    expect(wrapper.text()).toContain('Mode Simulasi Aktif');
    expect(wrapper.text()).toContain('9 Skenario');
    expect(wrapper.find('#matrixCountBadge').text()).toBe('9 pemicu resmi');

    await wrapper.find('#matrixTabPush').trigger('click');
    expect(wrapper.find('#matrixCountBadge').text()).toBe('6 pemicu resmi');
    expect(wrapper.find('.matrix-table').text()).not.toContain('Pengajuan Koreksi Material');

    await wrapper.find('#matrixTabEmail').trigger('click');
    expect(wrapper.find('#matrixCountBadge').text()).toBe('8 pemicu resmi');
    expect(wrapper.find('.matrix-table').text()).toContain('Pengajuan Koreksi Material');
    expect(wrapper.find('.matrix-table').text()).not.toContain('Keputusan Koreksi (Disetujui / Ditolak)');

    await wrapper.find('#matrixTabAll').trigger('click');
    expect(wrapper.find('#matrixCountBadge').text()).toBe('9 pemicu resmi');
  });

  it('validates recipient client-side, logs test deliveries in table, and clears session logs on click', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/notifications/channels')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { channels: [], triggerMatrix: [] },
          }),
        });
      }
      if (url.includes('/notifications/test-delivery')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              success: true,
              channel: 'BROWSER_PUSH',
              deliveryMode: 'SIMULATION',
              statusLabel: 'Mode Simulasi Aktif',
              recipient: 'admin@dutamedia.com',
              deliveredAt: '2026-11-22T14:00:00.000Z',
              message: 'Mode simulasi aktif untuk Browser Push.',
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(NotificationChannelSetupView, {
      global: {
        plugins: [router, pinia],
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Client-side validation rejects empty & invalid email without calling POST
    await wrapper.find('#testRecipient').setValue('   ');
    await wrapper.find('.test-form').trigger('submit');
    expect(wrapper.text()).toContain('Target penerima uji wajib diisi.');

    await wrapper.find('#testRecipient').setValue('bukan-email');
    await wrapper.find('.test-form').trigger('submit');
    expect(wrapper.text()).toContain('alamat email tujuan yang valid');
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).includes('test-delivery'))).toHaveLength(0);

    // Quick-select Push card and send valid test
    const pushTestBtn = wrapper.find('[data-channel-card="BROWSER_PUSH"] .card-test-btn');
    await pushTestBtn.trigger('click');
    expect((wrapper.find('#testChannel').element as HTMLSelectElement).value).toBe('PUSH');

    await wrapper.find('#testRecipient').setValue('admin@dutamedia.com');
    await wrapper.find('.test-form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Log Pengiriman Uji Coba Terbaru');
    expect(wrapper.findAll('.log-table tbody tr')).toHaveLength(1);
    expect(wrapper.find('.log-table').text()).toContain('Mode Simulasi Aktif');

    await wrapper.find('#btnClearDeliveryLogs').trigger('click');
    expect(wrapper.find('.log-table').text()).toContain('Belum ada catatan pengujian pengiriman');
  });
});

