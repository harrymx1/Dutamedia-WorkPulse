import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EodOutcomeView from './EodOutcomeView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EodOutcomeView.vue (WP-EP05-TK007 / Prototipe 04)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '17:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-1',
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Selesaikan implementasi EOD outcome',
                initialRisk: 'GREEN',
                carryOverDaysCount: 0,
                outcome: 'COMPLETED',
                outcomeReason: '',
                continuation: 'DO_NOT_CONTINUE',
                continuationReason: '',
              },
            ],
            additionalWorks: [],
            finalDailyStatus: 'GREEN',
          },
        },
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/additional-work', component: { template: '<div>Add</div>' } },
        { path: '/daily/eod', component: EodOutcomeView },
        { path: '/daily/history', component: { template: '<div>History</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders EOD Outcome page and reflections panel with unconstrained GREEN option (DEC-003)', () => {
    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain('EOD Outcome & Daily Reflection');
    expect(wrapper.text()).toContain('Konteks Waktu EOD');
    expect(wrapper.text()).toContain('Refleksi Mandiri Karyawan (DEC-003)');
    expect(wrapper.text()).toContain('GREEN');
    expect(wrapper.text()).toContain('AMBER');
    expect(wrapper.text()).toContain('RED');

    // Pastikan radio GREEN tidak disabled
    const greenRadio = wrapper.find('input[type="radio"][value="GREEN"]');
    expect(greenRadio.exists()).toBe(true);
    expect(greenRadio.attributes('disabled')).toBeUndefined();
  });
});

