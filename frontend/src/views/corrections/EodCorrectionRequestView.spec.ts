import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EodCorrectionRequestView from './EodCorrectionRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EodCorrectionRequestView.vue (WP-EP09 / Prototipe 16b - Koreksi Evaluasi Sore EOD)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Deployment staging environment',
                    outcome: 'BLOCKED',
                    outcomeReason: 'Server memory penuh',
                    continuation: 'CONTINUE_TOMORROW',
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/corrections/eod', component: EodCorrectionRequestView },
        { path: '/corrections/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
      ],
    });
  });

  it('renders EOD baseline and outcome selection choices without green lock (DEC-003)', async () => {
    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Permohonan Koreksi Evaluasi Sore (EOD)');
    expect(wrapper.text()).toContain('Baseline EOD Tersimpan');
    expect(wrapper.text()).toContain('Deployment staging environment');
    expect(wrapper.text()).toContain('DONE (Tuntas)');
    expect(wrapper.text()).toContain('IN_PROGRESS');
    expect(wrapper.text()).toContain('BLOCKED');
  });
});
