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
        { path: '/admin/policies', component: { template: '<div>Admin Policies</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/additional-work', component: { template: '<div>Additional Work</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/corrections/morning', component: { template: '<div>Morning Correction</div>' } },
        { path: '/corrections/eod', component: { template: '<div>EOD Correction</div>' } },
        { path: '/corrections/review', component: { template: '<div>Correction Review</div>' } },
        { path: '/daily/history', component: { template: '<div>My History</div>' } },
        { path: '/raise-blockers', component: { template: '<div>Raise Blocker</div>' } },
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
    expect(wrapper.text()).toContain('Alokasi Kendala');
    expect(wrapper.text()).toContain('Pengingat Harian');
    expect(wrapper.text()).not.toContain('BLOCKER_RAISED');
    expect(wrapper.text()).not.toContain('EOD_REMINDER');
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

  it('renders multi-line Policy Owner reassignment notification cleanly in list preview and detail modal', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-dharma',
      fullName: 'Dharma Putra',
      role: 'EMPLOYEE',
      isPolicyOwner: true,
      ownedPolicyCategories: ['BLOCKER_SLA'],
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
              id: 'notif-po-1',
              title: 'Penugasan Baru sebagai Pemilik Kebijakan',
              message: [
                'Anda kini ditetapkan sebagai Pemilik Kebijakan menggantikan pejabat sebelumnya.',
                'Kategori Kebijakan: Target Waktu Respon & Penanganan Kendala',
                'Pejabat Sebelumnya: Arif Budiman (Head of Engineering)',
                'Status Wewenang Anda: Aktif (Dapat menerbitkan versi kebijakan baru pada kategori ini)',
                'Mulai Berlaku: 13 November 2026',
                'Diubah Oleh: Hendra Wijaya',
              ].join('\n'),
              type: 'POLICY_OWNER_UPDATED',
              channel: 'IN_APP_CENTER',
              read: false,
              actionUrl: '/admin/policies',
              createdAt: '2026-11-13T09:30:00Z',
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

    // Preview shows multiple lines separated by newlines
    const previewEl = wrapper.find('.item-desc');
    expect(previewEl.text()).toContain('Anda kini ditetapkan sebagai Pemilik Kebijakan menggantikan pejabat sebelumnya.');
    expect(previewEl.text()).toContain('Kategori Kebijakan: Target Waktu Respon & Penanganan Kendala');
    expect(previewEl.text()).not.toContain('SLA');
    expect(previewEl.text()).toContain('Pejabat Sebelumnya: Arif Budiman (Head of Engineering)');

    await wrapper.find('.notif-item').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Rincian Perubahan Pemilik Kebijakan');
    expect(wrapper.text()).toContain('Buka Pengaturan Kebijakan');
  });

  it('renders structured BLOCKER_RAISED notification concisely in list preview and full structured breakdown in detail modal', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-arif',
      fullName: 'Arif Budiman',
      role: 'HEAD',
      hasSubordinates: true,
    } as any;

    const fullBody =
      'Integrasi halaman komitmen pagi di frontend gagal menyimpan data karena endpoint POST /daily/commitments merespons HTTP 500 akibat deadlock query transaksi database.';
    const expectedHelp = 'Perbaikan query transaksi di endpoint backend dan deploy hotfix ke server staging Engineering';

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
              id: 'notif-blocker-structured',
              title: 'Kendala Baru Dialokasikan: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
              message: [
                'Aditya Nugroho melaporkan kendala baru yang ditugaskan kepada Anda sebagai Penanggung Jawab (PIC). Silakan tinjau rincian di bawah ini untuk segera ditindaklanjuti.',
                'Judul Kendala: Endpoint API Komitmen Harian Mengembalikan Error 500 Saat Submit Form',
                'Pelapor: Aditya Nugroho',
                'Kategori Kendala: TECHNICAL',
                'Tingkat Keparahan: HIGH',
                'Dampak Kendala: MILESTONE',
                'Target Respons: 4 jam',
                `Deskripsi Kendala: ${fullBody}`,
                `Ekspektasi Bantuan: ${expectedHelp}`,
              ].join('\n'),
              type: 'BLOCKER_RAISED',
              channel: 'IN_APP_CENTER',
              read: false,
              actionUrl: '/blockers',
              createdAt: '2026-11-15T13:08:00Z',
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

    // Pratinjau kartu daftar ringkas: hanya kalimat pengantar baris pertama tanpa menumpuk seluruh baris detail
    const previewEl = wrapper.find('.item-desc');
    expect(previewEl.text()).toContain(
      'Aditya Nugroho melaporkan kendala baru yang ditugaskan kepada Anda sebagai Penanggung Jawab (PIC). Silakan tinjau rincian di bawah ini untuk segera ditindaklanjuti.',
    );
    expect(previewEl.text()).not.toContain(fullBody);

    expect(wrapper.find('.notif-item .context-chip').text()).toBe('Alokasi Kendala');
    expect(wrapper.text()).not.toContain('BLOCKER_RAISED');

    // Klik notifikasi untuk membuka modal Rincian Pemberitahuan
    await wrapper.find('.notif-item').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Rincian Alokasi Tiket Kendala (Blocker)');
    expect(wrapper.text()).toContain('Pelapor:');
    expect(wrapper.text()).toContain('Aditya Nugroho');
    expect(wrapper.text()).toContain('Kategori Kendala:');
    expect(wrapper.text()).toContain('TECHNICAL');
    expect(wrapper.text()).toContain('Tingkat Keparahan:');
    expect(wrapper.text()).toContain('HIGH');
    expect(wrapper.text()).toContain('Dampak Kendala:');
    expect(wrapper.text()).toContain('MILESTONE');
    expect(wrapper.text()).toContain('Deskripsi Kendala:');
    expect(wrapper.text()).toContain(fullBody);
    expect(wrapper.text()).toContain('Ekspektasi Bantuan:');
    expect(wrapper.text()).toContain(expectedHelp);
    expect(wrapper.text()).toContain('Waktu Diterima:');
    expect(wrapper.text()).not.toContain('Tipe Event:');
    expect(wrapper.text()).not.toContain('BLOCKER_RAISED');
    expect(wrapper.text()).toContain('Buka Antrean Eskalasi Blocker');
  });

  it('omits any legacy "Tindak Lanjut Anda:" row and displays collaborative feedback with Pelapor row in BLOCKER_SUPPORT_REJECTED modal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          notifications: [
            {
              id: 'notif-rej-legacy',
              title: 'Bantuan Belum Membantu: Endpoint API Error 500',
              message: [
                'Aditya Nugroho menginformasikan bahwa bantuan yang diberikan belum membantu mengatasi kendala.',
                'Judul Kendala: Endpoint API Error 500',
                'Pelapor: Aditya Nugroho',
                'Status Tiket: Sedang Ditangani',
                'Bantuan yang Dicoba: Cek null-check',
                'Catatan / Kendala yang Masih Terjadi: Masih gagal',
                'Tindak Lanjut Anda: Tinjau alasan penolakan pelapor dan lanjutkan penanganan.',
              ].join('\n'),
              type: 'BLOCKER_SUPPORT_REJECTED',
              channel: 'IN_APP_CENTER',
              read: false,
              actionUrl: '/blockers',
              createdAt: '2026-11-16T02:55:00Z',
            },
          ],
        },
      }),
    })));

    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.notif-item .context-chip').text()).toBe('Umpan Balik Bantuan');
    await wrapper.find('.notif-item').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Rincian Umpan Balik Bantuan (Kendala Masih Berlanjut)');
    expect(wrapper.text()).toContain('Aditya Nugroho menginformasikan bahwa bantuan yang diberikan belum membantu mengatasi kendala.');
    expect(wrapper.text()).toContain('Pelapor:');
    expect(wrapper.text()).toContain('Aditya Nugroho');
    expect(wrapper.text()).toContain('Bantuan yang Dicoba:');
    expect(wrapper.text()).toContain('Catatan / Kendala yang Masih Terjadi:');
    expect(wrapper.text()).not.toContain('Tindak Lanjut Anda:');
  });

  it('switches from CHANNELS tab back to LIST tab with ALL or UNREAD filter when summary cards are clicked', async () => {
    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Switch to CHANNELS tab via 3rd summary card
    await wrapper.find('[data-testid="metric-card-push"]').trigger('click');
    expect(wrapper.find('[data-testid="push-permission-status"]').exists()).toBe(true);

    // Click "Belum Dibaca" card -> returns to LIST tab filtered to unread (1 item)
    await wrapper.find('[data-testid="metric-card-unread"]').trigger('click');
    expect(wrapper.find('[data-testid="push-permission-status"]').exists()).toBe(false);
    expect(wrapper.findAll('.notif-item')).toHaveLength(1);
    expect(wrapper.text()).toContain('Blocker Kritis Dieskalasi');

    // Back to CHANNELS, then click "Total Notifikasi" -> returns to LIST tab with all items (2 items)
    await wrapper.find('[data-testid="metric-card-push"]').trigger('click');
    await wrapper.find('[data-testid="metric-card-all"]').trigger('click');
    expect(wrapper.findAll('.notif-item')).toHaveLength(2);
  });

  it('labels ADDITIONAL_WORK types cleanly, includes daily lifecycle types in Komitmen & Pengingat filter, and renders specific action button labels', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-emp',
      fullName: 'Aditya Nugroho',
      role: 'EMPLOYEE',
      hasSubordinates: false,
    } as any;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          unreadCount: 3,
          notifications: [
            {
              id: 'n-aw',
              title: 'Pekerjaan Tambahan dari Anda Diubah',
              message: 'Aditya mengubah tugas tambahan sebelum EOD.',
              type: 'ADDITIONAL_WORK_UPDATED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/daily/additional-work',
              createdAt: '2026-11-22T01:10:00Z',
            },
            {
              id: 'n-corr',
              title: 'Permohonan Koreksi Disetujui',
              message: 'Atasan menyetujui koreksi komitmen Anda.',
              type: 'CORRECTION_APPROVED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/corrections/morning',
              createdAt: '2026-11-22T01:15:00Z',
            },
            {
              id: 'n-leave',
              title: 'Catatan Cuti Tahunan Resmi Didaftarkan',
              message: 'HRGA mencatat cuti tahunan Anda.',
              type: 'LEAVE_RECORDED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/daily/history',
              createdAt: '2026-11-22T01:20:00Z',
            },
            {
              id: 'n-blk',
              title: 'Kendala Baru',
              message: 'Tiket kendala baru.',
              type: 'BLOCKER_RAISED',
              channel: 'IN_APP',
              read: true,
              actionUrl: '/blockers',
              createdAt: '2026-11-22T01:00:00Z',
            },
          ],
        },
      }),
    }));

    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check chips before filtering
    const chips = wrapper.findAll('.context-chip').map((c) => c.text());
    expect(chips).toContain('Pekerjaan Tambahan');
    expect(chips).toContain('Koreksi Komitmen');
    expect(chips).toContain('Catatan Cuti Resmi');

    // Click "Komitmen & Pengingat" filter pill -> keeps n-aw, n-corr, n-leave (3 items), excludes BLOCKER_RAISED
    const dailyPill = wrapper.findAll('.filter-pill').find((b) => b.text().includes('Komitmen & Pengingat'));
    expect(dailyPill).toBeTruthy();
    await dailyPill!.trigger('click');

    const visibleItems = wrapper.findAll('.notif-item');
    expect(visibleItems).toHaveLength(3);
    expect(wrapper.text()).toContain('Pekerjaan Tambahan dari Anda Diubah');
    expect(wrapper.text()).toContain('Permohonan Koreksi Disetujui');
    expect(wrapper.text()).toContain('Catatan Cuti Tahunan Resmi Didaftarkan');
    expect(wrapper.text()).not.toContain('Kendala Baru');

    // Open modal on n-aw -> shows specific label "Buka Pekerjaan Tambahan"
    await visibleItems[0].trigger('click');
    expect(wrapper.text()).toContain('Buka Pekerjaan Tambahan');
    await wrapper.find('.close-btn').trigger('click');

    // Open modal on n-corr -> shows "Buka Koreksi Komitmen Pagi"
    await visibleItems[1].trigger('click');
    expect(wrapper.text()).toContain('Buka Koreksi Komitmen Pagi');
    await wrapper.find('.close-btn').trigger('click');

    // Open modal on n-leave -> shows "Lihat Riwayat Cuti & Dispensasi"
    await visibleItems[2].trigger('click');
    expect(wrapper.text()).toContain('Lihat Riwayat Cuti & Dispensasi');
  });

  it('disables Tandai semua dibaca when unreadCount is 0 and skips POST read-all', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          unreadCount: 0,
          notifications: [
            {
              id: 'n-read',
              title: 'Pengingat EOD',
              message: 'Sudah dibaca.',
              type: 'EOD_REMINDER',
              channel: 'IN_APP',
              read: true,
              createdAt: '2026-11-22T09:00:00Z',
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const btn = wrapper.find('[data-testid="mark-all-read-btn"]');
    expect(btn.attributes('disabled')).toBeDefined();
    await btn.trigger('click');
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes('/read-all'))).toBe(false);
  });

  it('displays Indonesian push permission labels across states and uses "Saluran Notifikasi" wording', async () => {
    vi.stubGlobal('Notification', {
      permission: 'denied',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    });

    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('[data-testid="push-permission-metric"]').text()).toBe('Ditolak Peramban');

    await wrapper.find('[data-testid="metric-card-push"]').trigger('click');
    expect(wrapper.find('[data-testid="push-permission-status"]').text()).toBe('Ditolak Peramban');
    expect(wrapper.find('[data-testid="push-permission-desc"]').text()).toContain('pengaturan situs pada peramban Anda');
    expect(wrapper.find('[data-testid="push-enable-btn"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-testid="push-enable-btn"]').text()).toContain('Ditolak di Peramban');
    expect(wrapper.text()).toContain('Saluran Notifikasi');
    expect(wrapper.text()).not.toContain('Admin Notification Setup');

    vi.unstubAllGlobals();
  });

  it('appends ticketId query param to blocker notification action link so clicking Lihat & Konfirmasi Tiket Saya scrolls to exact ticket', async () => {
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
          json: async () => ({ success: true, data: { unreadCount: 2 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'notif-support-1',
              title: 'Bantuan Kendala Diberikan: CI runner mengalami OOM',
              message: [
                'Arif Budiman telah memberikan kontribusi bantuan pada tiket kendala Anda.',
                'Judul Kendala: CI runner mengalami OOM',
              ].join('\n'),
              type: 'BLOCKER_SUPPORT_CONTRIBUTED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/raise-blockers?tab=mine',
              relatedEntityId: 'blk-oom-99',
              relatedEntityType: 'blocker_tickets',
              createdAt: '2026-11-27T08:56:00Z',
            },
            {
              id: 'notif-queue-1',
              title: 'Kendala Baru Dialokasikan',
              message: 'Tiket baru dialokasikan.\nJudul Kendala: Server Error 502',
              type: 'BLOCKER_RAISED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/blockers',
              relatedEntityId: 'blk-q-77',
              relatedEntityType: 'blocker_tickets',
              createdAt: '2026-11-27T08:55:00Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const items = wrapper.findAll('.notif-item');
    await items[0].trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 40));

    const link1 = wrapper.find('[data-testid="notification-action-link"]');
    expect(link1.exists()).toBe(true);
    expect(link1.text()).toContain('Lihat & Konfirmasi Tiket Saya');
    expect(link1.attributes('href')).toBe('/raise-blockers?tab=mine&ticketId=blk-oom-99');

    // Verify /blockers notification deep-links with ?ticketId=... as well (e.g. for HEAD role)
    authStore.user = {
      id: 'usr-arif',
      fullName: 'Arif Budiman',
      role: 'HEAD',
      hasSubordinates: true,
    } as any;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    await items[1].trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 40));

    const link2 = wrapper.find('[data-testid="notification-action-link"]');
    expect(link2.exists()).toBe(true);
    expect(link2.text()).toContain('Buka Antrean Eskalasi Blocker');
    expect(link2.attributes('href')).toBe('/blockers?ticketId=blk-q-77');

    vi.unstubAllGlobals();
  });

  it('renders structured multi-line coaching note notification cleanly without delegation card duplication', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-aditya',
      fullName: 'Aditya Nugroho',
      role: 'EMPLOYEE',
      hasSubordinates: false,
    } as any;

    const structuredNoteContent = [
      '[Fokus Pengembangan]: Peningkatan konsistensi pelaporan blocker sebelum batas waktu pagi.',
      '[Fakta Objektif]: Koordinasi kendala runner CI di pagi hari sudah berjalan baik dan terdokumentasi di tiket blocker.',
      '[Saran Perbaikan]: Pertahankan komunikasi proaktif lebih awal bila ada hambatan lingkungan staging.',
      '[Target Evaluasi]: Ditinjau kembali pada sesi 1-on-1 pekan depan.',
    ].join('\n');

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
                id: 'note-202',
                noteType: 'COACHING',
                content: structuredNoteContent,
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
              id: 'notif-coaching-structured',
              title: 'Catatan Bimbingan Baru dari Atasan',
              message: `Arif Budiman membagikan catatan bimbingan: "${structuredNoteContent}"`,
              type: 'MANAGER_NOTE_SHARED',
              channel: 'IN_APP',
              read: false,
              actionUrl: '/coaching',
              relatedEntityId: 'note-202',
              createdAt: '2026-11-27T16:35:00Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(NotificationCenterView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await wrapper.find('.notif-item').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(wrapper.find('.coaching-note-callout').exists()).toBe(true);
    expect(wrapper.find('[data-testid="coaching-structured-content"]').exists()).toBe(true);
    expect(wrapper.findAll('.coaching-structured-item')).toHaveLength(4);
    expect(wrapper.text()).toContain('Fokus Pengembangan');
    expect(wrapper.text()).toContain('Fakta Objektif');
    expect(wrapper.text()).toContain('Saran Perbaikan');
    expect(wrapper.text()).toContain('Target Evaluasi');

    expect(wrapper.find('.delegation-note-callout').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Mandat Wewenang & Tata Kelola Delegasi Reviewer');
    expect(wrapper.find('.modal-desc').exists()).toBe(false);

    vi.unstubAllGlobals();
  });
});

