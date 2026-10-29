import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationCenterView from './NotificationCenterView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('NotificationCenterView.vue (Prototipe 07 / EP11 - Web Notification Center)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { unreadCount: 2 } }),
        });
      }
      if (url.includes('/notifications/mark-all-read')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { markedCount: 2 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'notif-1',
              title: 'Blocker Kritis Dieskalasi',
              message: 'Tiket kendala payment gateway membutuhkan tanggapan segera.',
              type: 'BLOCKER_RAISED',
              channel: 'IN_APP',
              read: false,
              createdAt: '2026-10-21T09:35:00Z',
            },
            {
              id: 'notif-2',
              title: 'Pengingat EOD Check-out',
              message: 'Jangan lupa mengisi refleksi harian sebelum cut-off.',
              type: 'EOD_REMINDER',
              channel: 'IN_APP',
              read: true,
              createdAt: '2026-10-21T17:00:00Z',
            },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/notifications', component: NotificationCenterView },
        { path: '/admin/notifications', component: { template: '<div>Admin Notif</div>' } },
      ],
    });
  });

  it('renders notification items and unread count', async () => {
    const wrapper = mount(NotificationCenterView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Web Notification Center');
    expect(wrapper.text()).toContain('Blocker Kritis Dieskalasi');
    expect(wrapper.text()).toContain('Pengingat EOD Check-out');
    expect(wrapper.text()).toContain('2 belum dibaca');
  });

  it('marks all as read when button is clicked', async () => {
    const wrapper = mount(NotificationCenterView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const markAllBtn = wrapper.find('.heading-actions .btn-secondary');
    expect(markAllBtn.exists()).toBe(true);

    await markAllBtn.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('0 belum dibaca');
  });
});

