import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MyLeaveRequestView from './MyLeaveRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MyLeaveRequestView.vue (Prototipe 20 / EP10 - Pengajuan Cuti Mandiri)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/my')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'lvr-1',
                startDate: '2026-10-20',
                endDate: '2026-10-21',
                reason: 'Urusan keluarga luar kota',
                status: 'PENDING',
                createdAt: '2026-10-12T14:10:00Z',
              },
              {
                id: 'lvr-2',
                startDate: '2026-10-09',
                endDate: '2026-10-09',
                reason: 'Cuti Sakit Mendadak',
                status: 'APPROVED',
                reconciled: true,
                reconciliationNote: 'Rekonsiliasi Otomatis: Status No Submission direkonsiliasi menjadi Approved Leave.',
                createdAt: '2026-10-09T09:50:00Z',
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 'lvr-new' } }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/leave/my', component: MyLeaveRequestView },
        { path: '/leave/queue', component: { template: '<div>Queue</div>' } },
      ],
    });
  });

  it('renders page header, form, and leave history correctly', async () => {
    const wrapper = mount(MyLeaveRequestView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('My Leave Request');
    expect(wrapper.text()).toContain('Urusan keluarga luar kota');
    expect(wrapper.text()).toContain('Leave (Pending)');
    expect(wrapper.text()).toContain('Superseded by Approved Leave');
  });

  it('validates date range when end date is earlier than start date', async () => {
    const wrapper = mount(MyLeaveRequestView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    const startInput = wrapper.find('#startDate');
    const endInput = wrapper.find('#endDate');

    await startInput.setValue('2026-10-25');
    await endInput.setValue('2026-10-20');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
  });
});
