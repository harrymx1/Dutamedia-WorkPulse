import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RaiseBlockerView from './RaiseBlockerView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('RaiseBlockerView.vue (WP-EP06 / Prototipe 05 - Laporkan Kendala Cepat)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  { id: 'com-1', taskText: 'Selesaikan API Gateway', sequenceNumber: 1 },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 'usr-1', fullName: 'Budi Lead', email: 'budi@dutamedia.com' },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/blockers/raise', component: RaiseBlockerView },
        { path: '/blockers', component: { template: '<div>Queue</div>' } },
        { path: '/blockers/aging', component: { template: '<div>Aging</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      ],
    });
  });

  it('renders headline, 10 blocker categories, and 4 severity cards', () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain('Laporkan & Pantau Blocker');
    expect(wrapper.text()).toContain('Detail Kendala, Taksonomi & Dampak');
    expect(wrapper.text()).toContain('Technical');
    expect(wrapper.text()).toContain('Infra');
    expect(wrapper.text()).toContain('Critical');
    expect(wrapper.text()).toContain('High');
  });

  it('displays project code input when Project Authority is selected (DEC-002)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [router] },
    });

    // Default authority: Organizational
    expect(wrapper.find('#projectCodeSelect').exists()).toBe(false);

    // Switch to Project Authority
    const projectRadio = wrapper.findAll('input[type="radio"]').find(r => r.attributes('value') === 'PROJECT_AUTHORITY');
    expect(projectRadio).toBeDefined();
    await projectRadio!.setValue();

    expect(wrapper.find('#projectCodeSelect').exists()).toBe(true);
  });
});
