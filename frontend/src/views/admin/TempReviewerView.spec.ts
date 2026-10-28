import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TempReviewerView from './TempReviewerView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('TempReviewerView.vue (WP-EP03-TK007 / Prototipe 17)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/temporary-reviewers', component: TempReviewerView },
        { path: '/admin/organization', component: { template: '<div>Org</div>' } },
        { path: '/admin/users', component: { template: '<div>Users</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders page title and delegate button', () => {
    const wrapper = mount(TempReviewerView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Pendelegasian Reviewer Sementara');
    expect(wrapper.text()).toContain('Delegasikan Reviewer Baru');
  });
});
