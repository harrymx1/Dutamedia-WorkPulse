import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationChannelSetupView from './NotificationChannelSetupView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('NotificationChannelSetupView.vue (Prototipe 19 / EP11 - Pengaturan Kanal Notifikasi)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
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
        plugins: [router],
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
  });

  it('triggers test notification simulation successfully', async () => {
    const wrapper = mount(NotificationChannelSetupView, {
      global: {
        plugins: [router],
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
});
