import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NotificationCenterView from './NotificationCenterView.vue';
import { useAuthStore } from '../../stores/auth';
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

  it('hides forbidden actionUrl and displays coaching note callout when viewing shared coaching notification (IMP-057)', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-aditya',
      fullName: 'Aditya Nugroho',
      role: 'EMPLOYEE',
      hasSubordinates: false,
    } as any;

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { unreadCount: 1 } }),
        });
      }
      if (url.includes('/coaching/users/usr-aditya')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'note-101',
                noteType: 'COACHING',
                content: 'Pertahankan efisiensi query database pada modul baru.',
                authorUser: { fullName: 'Arif Budiman' },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'notif-coaching-1',
              title: 'Catatan Bimbingan Baru dari Atasan',
              message: 'Arif Budiman membagikan catatan bimbingan.',
              type: 'MANAGER_NOTE_SHARED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/coaching',
              relatedEntityId: 'note-101',
              createdAt: '2026-11-10T09:43:00Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(NotificationCenterView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Open detail of notification
    const card = wrapper.find('.notif-item');
    expect(card.exists()).toBe(true);
    await card.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Modal should be open
    expect(wrapper.find('.modal-card').exists()).toBe(true);
    // Callout box should display the actual note content
    expect(wrapper.text()).toContain('Pertahankan efisiensi query database pada modul baru.');
    expect(wrapper.text()).toContain('Arif Budiman');

    // Forbidden button "Buka Halaman Terkait" to /coaching MUST NOT exist for employee without subordinates
    expect(wrapper.text()).not.toContain('Buka Halaman Terkait');
  });
});

