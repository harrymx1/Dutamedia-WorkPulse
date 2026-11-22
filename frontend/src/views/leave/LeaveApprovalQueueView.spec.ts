import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LeaveApprovalQueueView from './LeaveApprovalQueueView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('LeaveApprovalQueueView.vue (Prototipe 21 / EP10 - Antrean Approval Cuti HRGA)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/queue')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'lvr-queue-1',
                startDate: '2026-10-22',
                endDate: '2026-10-23',
                reason: 'Cuti tahunan keperluan keluarga',
                status: 'PENDING',
                createdAt: '2026-10-20T08:00:00Z',
                user: {
                  id: 'usr-1',
                  fullName: 'Siti Staff',
                  email: 'siti@dutamedia.com',
                  role: 'EMPLOYEE',
                },
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
          data: { status: 'APPROVED' },
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/leave/queue', component: LeaveApprovalQueueView },
        { path: '/leave/my', component: { template: '<div>My Leave</div>' } },
      ],
    });
  });

  it('renders queue metrics and pending leave items', async () => {
    const wrapper = mount(LeaveApprovalQueueView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Antrean Persetujuan Cuti');
    expect(wrapper.text()).toContain('Siti Staff');
    expect(wrapper.text()).toContain('Cuti tahunan keperluan keluarga');
    expect(wrapper.text()).toContain('Setujui');
    expect(wrapper.text()).toContain('Tolak');
  });

  it('opens review modal when clicking Setujui button', async () => {
    const wrapper = mount(LeaveApprovalQueueView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const approveBtn = wrapper.find('.btn-action.approve');
    expect(approveBtn.exists()).toBe(true);

    await approveBtn.trigger('click');

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Tinjau Permohonan Cuti');
    expect(wrapper.text()).toContain('Kebijakan Rekonsiliasi Kehadiran');
  });

  it('formats Indonesian role/division, 2-letter initials, clean ticket code, reviewer info, and avoids 09:30 WIB', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: [
          {
            id: 'a7c3d1e2-1111-2222-3333-444455556666',
            startDate: '2026-11-26',
            endDate: '2026-11-26',
            leaveType: 'SICK',
            reason: 'Pemeriksaan kesehatan rutin',
            status: 'APPROVED',
            reviewedAt: '2026-11-25T03:15:00Z',
            reviewNote: 'Semoga lekas pulih',
            reviewedBy: { id: 'mgr-1', fullName: 'Dharma Putra' },
            createdAt: '2026-11-24T08:00:00Z',
            user: {
              id: 'usr-1',
              fullName: 'Dio Bayu Bagaskara',
              email: 'product@dutamedia.com',
              role: 'PROJECT_MANAGER',
              function: 'Delivery',
              employmentStatus: 'PERMANENT',
            },
          },
        ],
      }),
    }));

    const wrapper = mount(LeaveApprovalQueueView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.avatar').text()).toBe('DB');
    expect(wrapper.text()).toContain('Manajer Proyek · Delivery');
    expect(wrapper.text()).not.toContain('PROJECT_MANAGER');
    expect(wrapper.text()).toContain('#LVR-20261126-A7C3');
    expect(wrapper.text()).not.toContain('a7c3d1e2-1111-2222-3333-444455556666');
    expect(wrapper.text()).toContain('Disetujui oleh');
    expect(wrapper.text()).toContain('Dharma Putra');
    expect(wrapper.text()).not.toContain('09:30 WIB');
  });

  it('filters by type and division and resets empty state via Tampilkan Semua', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: [
          {
            id: 'lv-1',
            startDate: '2026-12-01',
            endDate: '2026-12-01',
            leaveType: 'PERMIT',
            reason: 'Keperluan kampus',
            status: 'PENDING',
            createdAt: '2026-11-22T08:00:00Z',
            user: {
              id: 'u1',
              fullName: 'Raka Pratama',
              email: 'raka@dutamedia.com',
              role: 'EMPLOYEE',
              function: 'Engineering',
              employmentStatus: 'INTERN',
            },
          },
          {
            id: 'lv-2',
            startDate: '2026-12-02',
            endDate: '2026-12-03',
            leaveType: 'ANNUAL',
            reason: 'Cuti keluarga',
            status: 'PENDING',
            createdAt: '2026-11-22T09:00:00Z',
            user: {
              id: 'u2',
              fullName: 'Nadia Keuangan',
              email: 'nadia@dutamedia.com',
              role: 'EMPLOYEE',
              function: 'Finance',
              employmentStatus: 'PERMANENT',
            },
          },
        ],
      }),
    }));

    const wrapper = mount(LeaveApprovalQueueView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await wrapper.find('[data-testid="division-filter"]').setValue('Finance');
    expect(wrapper.text()).toContain('Nadia Keuangan');
    expect(wrapper.text()).not.toContain('Raka Pratama');

    await wrapper.find('[data-testid="type-filter"]').setValue('PERMIT');
    expect(wrapper.text()).toContain('Tidak ada pengajuan yang cocok');
    await wrapper.find('[data-testid="reset-queue-filters"]').trigger('click');

    expect(wrapper.text()).toContain('Raka Pratama');
    expect(wrapper.text()).toContain('Nadia Keuangan');
  });

  it('requires at least 5 characters in rejection note with inline error and submits valid rejection', async () => {
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/queue')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'lv-rej-1',
                startDate: '2026-12-01',
                endDate: '2026-12-01',
                leaveType: 'PERMIT',
                reason: 'Bimbingan skripsi di kampus',
                status: 'PENDING',
                createdAt: '2026-11-22T08:00:00Z',
                user: {
                  id: 'u-int',
                  fullName: 'Raka Pratama',
                  email: 'intern@dutamedia.com',
                  role: 'EMPLOYEE',
                  employmentStatus: 'INTERN',
                },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { status: 'REJECTED' } }),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    const wrapper = mount(LeaveApprovalQueueView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await wrapper.find('.btn-action.reject').trigger('click');

    expect(wrapper.find('.modal-card').text()).toContain('Tinjau Permohonan Izin / Sakit');
    expect(wrapper.find('.modal-card').text()).toContain('Alasan Izin / Pengajuan');
    expect(wrapper.find('[data-testid="review-note-counter"]').text()).toContain('0 / 5 karakter minimum');

    await wrapper.find('#reviewNotes').setValue('No');
    const callsBefore = fetchSpy.mock.calls.length;
    await wrapper.find('.modal-actions .btn-danger').trigger('click');

    expect(wrapper.find('[data-testid="modal-error"]').text()).toContain('minimal 5 karakter');
    expect(fetchSpy.mock.calls.length).toBe(callsBefore);

    await wrapper.find('#reviewNotes').setValue('Jadwal rilis produk utama membutuhkan seluruh tim');
    await wrapper.find('.modal-actions .btn-danger').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    const reviewCall = fetchSpy.mock.calls.find(([u]) => String(u).includes('/leave/lv-rej-1/review'));
    expect(reviewCall).toBeDefined();
  });
});

