import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectRiskView from './ProjectRiskView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ProjectRiskView.vue (Prototipe 13 / EP12 - Project Risk Radar)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/dashboard/projects')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'prj-1',
                code: 'CPE-01',
                name: 'Core Payment Engine',
                clientName: 'Bank ABC',
                leadName: 'Hendra Gunawan',
                activeCommitmentsCount: 8,
                openBlockersCount: 2,
                riskLevel: 'HIGH',
                healthScore: 68,
                topBlockerTitle: 'Timeout koneksi Redis staging',
              },
              {
                id: 'prj-2',
                code: 'MP-02',
                name: 'Merchant Portal Web',
                leadName: 'Siti Aminah',
                activeCommitmentsCount: 5,
                openBlockersCount: 0,
                riskLevel: 'LOW',
                healthScore: 95,
              },
            ],
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
        { path: '/projects/risk', component: ProjectRiskView },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/blockers', component: { template: '<div>Blockers</div>' } },
      ],
    });
  });

  it('renders portfolio projects and risk metric cards', async () => {
    const wrapper = mount(ProjectRiskView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Project Risk Radar');
    expect(wrapper.text()).toContain('Core Payment Engine');
    expect(wrapper.text()).toContain('Merchant Portal Web');
    expect(wrapper.text()).toContain('HIGH (68%)');
    expect(wrapper.text()).toContain('LOW (95%)');
  });

  it('opens project detail modal when Rincian button is clicked', async () => {
    const wrapper = mount(ProjectRiskView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const rincianBtns = wrapper.findAll('button');
    const rincianBtn = rincianBtns.find((b) => b.text().includes('Rincian'));
    expect(rincianBtn).toBeDefined();

    await rincianBtn!.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('.modal-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Rincian Risiko Proyek');
    expect(wrapper.text()).toContain('Timeout koneksi Redis staging');
  });
});

