import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TempReviewerView from './TempReviewerView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

describe('TempReviewerView.vue (WP-EP03-TK007 / Prototipe 17 & IMP-058)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'admin-1',
      fullName: 'System Administrator',
      email: 'admin@dutamedia.com',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/admin/temporary-reviewers')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'del-1',
                delegateUserId: 'usr-bambang',
                targetFunction: 'Engineering',
                delegationReason: '[Menggantikan Arif Budiman (Head of Engineering)] Cuti tahunan 2 minggu',
                effectiveDate: '2026-11-10',
                expiryDate: '2026-11-24',
                createdAt: '2026-11-10T00:00:00Z',
                delegateUser: {
                  id: 'usr-bambang',
                  fullName: 'Bambang Pratama',
                  email: 'lead.tech@dutamedia.com',
                  orgAssignments: [
                    { role: 'SUPERVISOR', function: 'Engineering', jobTitle: 'Technical Lead 1' },
                  ],
                },
                createdBy: { id: 'admin-1', fullName: 'System Administrator', email: 'admin@dutamedia.com' },
              },
            ],
          }),
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'usr-arif',
                fullName: 'Arif Budiman',
                email: 'head.eng@dutamedia.com',
                currentRole: 'HEAD',
                currentFunction: 'Engineering',
                currentJobTitle: 'Head of Engineering',
              },
              {
                id: 'usr-bambang',
                fullName: 'Bambang Pratama',
                email: 'lead.tech@dutamedia.com',
                currentRole: 'SUPERVISOR',
                currentFunction: 'Engineering',
                currentJobTitle: 'Technical Lead 1',
              },
              {
                id: 'admin-1',
                fullName: 'System Administrator',
                email: 'admin@dutamedia.com',
                currentRole: 'SYSTEM_ADMIN',
                currentFunction: 'OperationsInfrastructure',
                currentJobTitle: 'Infrastructure & System Administrator',
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/temporary-reviewers', component: TempReviewerView },
        { path: '/notifications', component: { template: '<div>Notifications</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders page title and delegate button', async () => {
    const wrapper = mount(TempReviewerView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(wrapper.text()).toContain('Pendelegasian Reviewer Sementara');
    expect(wrapper.text()).toContain('Delegasikan Reviewer Baru');
  });

  it('renders table columns showing PEJABAT PENGGANTI and MENGGANTIKAN SIAPA (IMP-058)', async () => {
    const wrapper = mount(TempReviewerView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(wrapper.text()).toContain('PEJABAT PENGGANTI');
    expect(wrapper.text()).toContain('MENGGANTIKAN SIAPA');
    expect(wrapper.text()).toContain('DIVISI / WEWENANG');
    expect(wrapper.text()).toContain('Bambang Pratama');
    expect(wrapper.text()).toContain('Arif Budiman (Head of Engineering)');
    expect(wrapper.text()).toContain('Technical Lead 1');
    expect(wrapper.text()).toContain('Aktif');
  });

  it('opens modal with Pejabat yang Berhalangan and Pejabat Pengganti fields', async () => {
    const wrapper = mount(TempReviewerView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    // Click button to open modal
    await wrapper.find('.page-header .btn-primary').trigger('click');

    expect(wrapper.find('.modal-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('1. Pejabat yang Berhalangan (Yang Digantikan)');
    expect(wrapper.text()).toContain('2. Divisi Wewenang Peninjauan (Otomatis)');
    expect(wrapper.text()).toContain('3. Pejabat Pengganti Sementara (Penerima Delegasi)');
    expect(wrapper.find('#del-replaced').exists()).toBe(true);
    expect(wrapper.find('#del-user').exists()).toBe(true);
  });

  it('excludes SYSTEM_ADMIN from both replaced and delegate dropdowns (Separation of Duties)', async () => {
    const wrapper = mount(TempReviewerView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((r) => setTimeout(r, 50));
    await wrapper.find('.page-header .btn-primary').trigger('click');

    const replacedHtml = wrapper.find('#del-replaced').html();
    const delegateHtml = wrapper.find('#del-user').html();

    // System Administrator must never appear in either dropdown
    expect(replacedHtml).not.toContain('admin-1');
    expect(replacedHtml).not.toContain('System Administrator');
    expect(delegateHtml).not.toContain('admin-1');
    expect(delegateHtml).not.toContain('System Administrator');

    // Operational roles must be present
    expect(replacedHtml).toContain('usr-arif');
    expect(delegateHtml).toContain('usr-bambang');
  });

  it('distinguishes Aktif, Terjadwal, Kedaluwarsa statuses, supports card/search filters, and formats 1-day period cleanly', async () => {
    const todayWib = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
    const addDays = (days: number) => {
      const [y, m, d] = todayWib.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/admin/temporary-reviewers')) {
        expect(url).toContain('limit=100');
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'del-active',
                delegateUserId: 'usr-bambang',
                targetFunction: 'Engineering',
                delegationReason: '[Menggantikan Arif Budiman (Head)] Delegasi aktif',
                effectiveDate: addDays(-1),
                expiryDate: addDays(3),
                createdAt: '2026-11-20T00:00:00Z',
                delegateUser: {
                  id: 'usr-bambang',
                  fullName: 'Bambang Pratama',
                  email: 'lead.tech@dutamedia.com',
                },
                createdBy: { id: 'admin-1', fullName: 'Admin', email: 'admin@dutamedia.com' },
              },
              {
                id: 'del-upcoming',
                delegateUserId: 'usr-rian',
                targetFunction: 'OperationsInfrastructure',
                delegationReason: '[Menggantikan Gunawan Setiawan (Head)] Delegasi jadwal 1 hari',
                effectiveDate: addDays(2),
                expiryDate: addDays(2),
                createdAt: '2026-11-20T00:00:00Z',
                delegateUser: {
                  id: 'usr-rian',
                  fullName: 'Rian Kurniawan',
                  email: 'lead.creative@dutamedia.com',
                },
                createdBy: { id: 'admin-1', fullName: 'Admin', email: 'admin@dutamedia.com' },
              },
              {
                id: 'del-expired',
                delegateUserId: 'usr-dio',
                targetFunction: 'Delivery',
                delegationReason: '[Menggantikan Dharma Putra (Head)] Delegasi lama berakhir',
                effectiveDate: addDays(-10),
                expiryDate: addDays(-3),
                createdAt: '2026-11-10T00:00:00Z',
                delegateUser: {
                  id: 'usr-dio',
                  fullName: 'Dio Bayu',
                  email: 'product@dutamedia.com',
                },
                createdBy: { id: 'admin-1', fullName: 'Admin', email: 'admin@dutamedia.com' },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(TempReviewerView, {
      global: { plugins: [router, pinia] },
    });
    await new Promise((r) => setTimeout(r, 50));

    expect(wrapper.text()).toContain('Review Koreksi & Eskalasi Blocker');
    expect(wrapper.text()).toContain('Terjadwal');
    expect(wrapper.text()).toContain('Kedaluwarsa');
    expect(wrapper.text()).toContain('3 hari tersisa');
    expect(wrapper.text()).toContain('Mulai dalam 2 hari');
    expect(wrapper.text()).toContain('Berakhir 3 hari lalu');
    expect(wrapper.text()).toContain('3 dari 3 delegasi');

    // Metric card filter: Terjadwal
    await wrapper.find('.metrics-grid .metric-card.accent-blue').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Rian Kurniawan');

    // Empty search + reset
    await wrapper.find('#trSearchInput').setValue('tidak-ada-nama');
    expect(wrapper.text()).toContain('Tidak Ada Delegasi yang Cocok');
    await wrapper.find('.btn-reset-filter').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
  });

  it('rejects backdated effectiveDate and short reasons in create, edit, and revoke forms', async () => {
    const todayWib = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
    const [y, m, d] = todayWib.split('-').map(Number);
    const yesterday = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);

    const wrapper = mount(TempReviewerView, {
      global: { plugins: [router, pinia] },
    });
    await new Promise((r) => setTimeout(r, 50));

    // Create modal: short reason & backdating
    await wrapper.find('.page-header .btn-primary').trigger('click');
    await wrapper.find('#del-reason').setValue('pendek');
    await wrapper.find('.modal-box form').trigger('submit.prevent');
    expect(wrapper.find('.alert-banner.error').text()).toContain('minimal 10 karakter');

    await wrapper.find('#del-reason').setValue('Cuti tahunan dan pelimpahan tugas');
    await wrapper.find('#del-eff').setValue(yesterday);
    await wrapper.find('.modal-box form').trigger('submit.prevent');
    expect(wrapper.find('.alert-banner.error').text()).toContain('tidak boleh di masa lalu');
    await wrapper.find('.modal-box .close-btn').trigger('click');

    // Edit modal: short reason
    await wrapper.find('.btn-edit').trigger('click');
    await wrapper.find('#edit-reason').setValue('abc');
    await wrapper.find('.modal-box form').trigger('submit.prevent');
    expect(wrapper.find('.alert-banner.error').text()).toContain('minimal 5 karakter');
    await wrapper.find('.modal-box .close-btn').trigger('click');

    // Revoke modal: short reason
    await wrapper.find('.btn-revoke').trigger('click');
    await wrapper.find('#revoke-reason').setValue('abc');
    await wrapper.find('.modal-box form').trigger('submit.prevent');
    expect(wrapper.find('.alert-banner.error').text()).toContain('minimal 5 karakter');
  });
});
