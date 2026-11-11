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
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/blockers', component: { template: '<div>Blocker Queue</div>' } },
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

  it('renders structured policy update notification with before/after parameters and Buka Morning Commitment action button (IMP-063)', async () => {
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
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'notif-policy-1',
              title: 'Perubahan Kebijakan Jam Batas Pengisian (Cut-Off)',
              message: [
                'Mulai hari ini (Rabu, 11 November 2026, berlaku mulai sekarang), jam batas pengisian komitmen pagi dan evaluasi sore telah diperbarui.',
                'Kategori Kebijakan: Jam Kerja & Batas Pengiriman (Cut-Off)',
                'Mulai Berlaku: Rabu, 11 November 2026 (Berlaku Mulai Sekarang)',
                'Batas Tepat Waktu Pagi: 09:00 → 09:30 WIB',
                'Batas Kunci Formulir Pagi (Cut-Off): 23:59 → 10:00 WIB',
                'Artinya bagi Anda: Isi Morning Commitment sebelum pukul 09:30 WIB agar tercatat tepat waktu.',
                'Alasan Perubahan: "Penyesuaian jam kerja bulan Ramadhan 2026"',
                'Diubah Oleh: Sistem Administrator',
              ].join('\n'),
              type: 'POLICY_UPDATED',
              channel: 'IN_APP_CENTER',
              read: false,
              actionUrl: '/daily/morning',
              createdAt: '2026-11-11T09:05:00Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(NotificationCenterView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const card = wrapper.find('.notif-item');
    expect(card.exists()).toBe(true);
    await card.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Rincian Perubahan Kebijakan Operasional');
    expect(wrapper.text()).toContain('09:00 → 09:30 WIB');
    expect(wrapper.text()).toContain('23:59 → 10:00 WIB');
    expect(wrapper.text()).toContain('Buka Morning Commitment');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.modal-card').exists()).toBe(false);
  });

  it('normalizes legacy policy notification with "Tetap " and closes modal on backdrop click', async () => {
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
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'notif-policy-legacy',
              title: 'Perubahan Kebijakan Target Waktu Penanganan Kendala',
              message:
                'Mulai hari ini (Rabu, 11 November 2026, berlaku mulai sekarang), acuan Target Waktu Penanganan Kendala (Blocker) telah diperbarui. Kategori Kebijakan: Target Waktu Penanganan Kendala Batas Respon Atasan Langsung: Tetap 4 Jam Kerja Diubah Oleh: Sistem Administrator',
              type: 'POLICY_UPDATED',
              channel: 'IN_APP_CENTER',
              read: false,
              createdAt: '2026-11-11T10:50:00Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(NotificationCenterView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.find('.notif-item').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.delegation-note-callout').exists()).toBe(true);
    expect(wrapper.text()).toContain('Batas Respon Jenjang Pertama:');
    expect(wrapper.text()).toContain('4 Jam Kerja');
    expect(wrapper.text()).not.toContain('Tetap 4 Jam Kerja');

    await wrapper.find('.modal-backdrop').trigger('click');
    expect(wrapper.find('.modal-card').exists()).toBe(false);
  });

  it('renders "Buka Antrean Eskalasi Blocker" button inside modal for EMPLOYEE with active Temporary Reviewer delegation', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-siti',
      fullName: 'Siti Rahma',
      role: 'EMPLOYEE',
      hasSubordinates: false,
      isTemporaryReviewer: true,
    } as any;

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/notifications/unread-count')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { unreadCount: 1 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'notif-blocker-siti',
              title: 'Kendala Baru Dialokasikan: HIGH Impact TASK',
              message:
                '[Blocker #7c32ef7b] Aditya Nugroho melaporkan kendala TECHNICAL (Severity: HIGH): "[UAT-C2] Kendala Integrasi Redis Cache saat Atasan Cuti". Mohon segera lakukan peninjauan (Acknowledge) sesuai target waktu penanganan.',
              type: 'BLOCKER_RAISED',
              channel: 'IN_APP_CENTER',
              read: false,
              actionUrl: '/blockers',
              createdAt: '2026-11-11T07:36:00Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(NotificationCenterView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.find('.notif-item').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Buka Antrean Eskalasi Blocker');
  });
});

