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

    expect(wrapper.find('h1').text()).toBe('Leave Approval Queue');
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
    expect(wrapper.text()).toContain('Kebijakan Rekonsiliasi DEC-007');
  });
});
