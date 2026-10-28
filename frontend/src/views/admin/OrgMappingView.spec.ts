import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import OrgMappingView from './OrgMappingView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('OrgMappingView.vue (WP-EP03-TK007 / Prototipe 15)', () => {
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
        { path: '/admin/organization', component: OrgMappingView },
        { path: '/admin/users', component: { template: '<div>Users</div>' } },
        { path: '/admin/temporary-reviewers', component: { template: '<div>Reviewers</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders page header and tabs for organization structure & project authority', () => {
    const wrapper = mount(OrgMappingView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Struktur Organisasi & Kewenangan Proyek');
    expect(wrapper.text()).toContain('Struktur & Penugasan Karyawan');
    expect(wrapper.text()).toContain('Kewenangan Proyek (Project Authority)');
  });

  it('switches between Org tab and Project Authority tab on click', async () => {
    const wrapper = mount(OrgMappingView, {
      global: {
        plugins: [router],
      },
    });

    const tabButtons = wrapper.findAll('.tab-bar-btn');
    expect(tabButtons).toHaveLength(2);

    // Klik tab Kewenangan Proyek
    await tabButtons[1].trigger('click');
    expect(wrapper.text()).toContain('Tetapkan Wewenang Proyek');

    // Klik tab Struktur Organisasi
    await tabButtons[0].trigger('click');
    expect(wrapper.text()).toContain('Atur Penugasan Baru');
  });
});
