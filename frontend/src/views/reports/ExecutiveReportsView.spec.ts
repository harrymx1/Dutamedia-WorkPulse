import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExecutiveReportsView from './ExecutiveReportsView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ExecutiveReportsView.vue (Prototipe 23 / EP13 - Laporan Eksekutif & Analitik)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/reports/executive')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              period: 'today',
              summary: {
                totalEmployees: 32,
                participationRate: 96.2,
                onTimePercent: 88.5,
                latePercent: 7.7,
                noSubmissionPercent: 3.8,
                avgBlockerMttrHours: 4.2,
              },
              departmentBreakdown: [
                {
                  department: 'Engineering & Tech',
                  totalMembers: 14,
                  participationRate: 98.0,
                  onTimePercent: 92.0,
                  latePercent: 6.0,
                  noSubmissionPercent: 2.0,
                  openBlockersCount: 2,
                  mttrHours: 3.8,
                },
              ],
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
        { path: '/reports', component: ExecutiveReportsView },
      ],
    });
  });

  it('renders report metrics, non-punitive guardrail, and departmental table', async () => {
    const wrapper = mount(ExecutiveReportsView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Reports');
    expect(wrapper.text()).toContain('96.2%');
    expect(wrapper.text()).toContain('Prinsip Non-Punitive');
    expect(wrapper.text()).toContain('Engineering & Tech');
    expect(wrapper.text()).toContain('Export Data (CSV)');
  });

  it('changes active period when clicking preset buttons', async () => {
    const wrapper = mount(ExecutiveReportsView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const weekBtn = wrapper.findAll('.preset-btn')[1];
    expect(weekBtn.text()).toBe('Pekan Ini');

    await weekBtn.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(weekBtn.classes()).toContain('active');
  });
});
