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
});
