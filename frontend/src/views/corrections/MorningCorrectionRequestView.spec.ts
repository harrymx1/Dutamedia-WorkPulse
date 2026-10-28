import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import MorningCorrectionRequestView from './MorningCorrectionRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MorningCorrectionRequestView.vue (WP-EP09 / Prototipe 16a - Koreksi Komitmen Pagi)', () => {
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
                    taskText: 'Menyelesaikan endpoint authenikasi',
                    initialRisk: 'GREEN',
                    referenceLink: null,
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
          data: [
            {
              id: 'cr-1',
              classification: 'MINOR',
              reason: 'Perbaikan typo kata autentikasi',
              status: 'AUTO_APPLIED',
              valueBefore: { taskText: 'Menyelesaikan endpoint authenikasi' },
              valueRequested: { taskText: 'Menyelesaikan endpoint autentikasi' },
              createdAt: '2026-10-28T10:00:00.000Z',
            },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/corrections/morning', component: MorningCorrectionRequestView },
        { path: '/corrections/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      ],
    });
  });

  it('renders comparative form with locked baseline snapshot and classification choices', async () => {
    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Permohonan Koreksi Komitmen Pagi');
    expect(wrapper.text()).toContain('Baseline Tersimpan (Locked)');
    expect(wrapper.text()).toContain('Menyelesaikan endpoint authenikasi');
    expect(wrapper.text()).toContain('Perubahan Minor');
    expect(wrapper.text()).toContain('Perubahan Material');
    expect(wrapper.text()).toContain('AUTO_APPLIED');
  });
});

