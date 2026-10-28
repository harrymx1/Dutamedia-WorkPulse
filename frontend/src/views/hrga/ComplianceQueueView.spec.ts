import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ComplianceQueueView from './ComplianceQueueView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ComplianceQueueView.vue (WP-EP08 / Prototipe 11 - Antrean Kepatuhan HRGA)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/compliance/summary')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              totalEvents: 3,
              openCount: 2,
              patternCount: 1,
              warningCount: 1,
              escalationCount: 1,
              noSubmissionCount: 0,
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
              id: 'ev-1',
              userId: 'u-1',
              eventDate: '2026-10-28',
              stage: 'PATTERN_FLAG_3X',
              followUpStatus: 'OPEN',
              user: { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
              followUpManagerNote: null,
            },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/compliance', component: ComplianceQueueView },
        { path: '/exemptions', component: { template: '<div>Exemptions</div>' } },
        { path: '/corrections/review', component: { template: '<div>Review</div>' } },
      ],
    });
  });

  it('renders compliance summary cards and event queue list', async () => {
    const wrapper = mount(ComplianceQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Antrean Kepatuhan & Tindak Lanjut HRGA');
    expect(wrapper.text()).toContain('Pola 3x (Stage 1)');
    expect(wrapper.text()).toContain('Budi Staf');
    expect(wrapper.text()).toContain('PATTERN_FLAG_3X');
    expect(wrapper.text()).toContain('Tindak Lanjut');
  });

  it('opens address follow-up modal when action button is clicked', async () => {
    const wrapper = mount(ComplianceQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const actionBtn = wrapper.find('.btn-action');
    expect(actionBtn.exists()).toBe(true);
    await actionBtn.trigger('click');

    expect(wrapper.text()).toContain('Tindak Lanjut Peristiwa Kepatuhan');
  });
});
