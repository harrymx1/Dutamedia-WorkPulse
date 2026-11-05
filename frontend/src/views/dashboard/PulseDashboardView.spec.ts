import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PulseDashboardView from './PulseDashboardView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('PulseDashboardView.vue (Prototipe 08 / EP12 - Pulse Dashboard & Exception Radar)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/dashboard/metrics')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              totalEmployees: 32,
              submittedCount: 28,
              noSubmissionCount: 4,
              amberCommitmentsCount: 5,
              redCommitmentsCount: 3,
              unacknowledgedBlockersCount: 2,
              completionRatePercent: 87.5,
            },
          }),
        });
      }
      if (url.includes('/dashboard/feed')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'feed-1',
                supporterName: 'Hendra Gunawan',
                blockerTitle: 'Redis Timeout di Staging',
                actionTaken: 'Membantu migrasi konfigurasi pool koneksi redis.',
                resultNote: 'Latency normal kembali di bawah 20ms.',
                createdAt: '2026-10-21T11:00:00Z',
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
        { path: '/dashboard', component: PulseDashboardView },
        { path: '/projects/risk', component: { template: '<div>Project Risk</div>' } },
        { path: '/blockers', component: { template: '<div>Blockers</div>' } },
        { path: '/coaching', component: { template: '<div>Coaching</div>' } },
      ],
    });
  });

  it('renders Team Pulse dashboard with 4 exception metric cards and feed', async () => {
    const wrapper = mount(PulseDashboardView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Team Pulse');
    expect(wrapper.text()).toContain('Belum Mengisi Komitmen');
    expect(wrapper.text()).toContain('Komitmen Waspada (Amber)');
    expect(wrapper.text()).toContain('Komitmen Kritis (Merah)');
    expect(wrapper.text()).toContain('Blocker Belum Direspon');
    expect(wrapper.text()).toContain('Hendra Gunawan');
    expect(wrapper.text()).toContain('Membantu: Redis Timeout di Staging');
  });

  it('switches scope tab to Function Pulse', async () => {
    const wrapper = mount(PulseDashboardView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const functionTab = wrapper.findAll('.scope-tab')[1];
    expect(functionTab.text()).toContain('Function Pulse');

    await functionTab.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Function Pulse');
  });

  it('restricts tabs for HEAD role: only Team and Function, omits Management Pulse and defaults to Function Pulse', async () => {
    const authStore = (await import('../../stores/auth')).useAuthStore();
    authStore.user = {
      id: 'head-id',
      email: 'head@dutamedia.com',
      fullName: 'Bambang Pratama',
      role: 'HEAD',
      function: 'Engineering',
      status: 'ACTIVE',
    } as any;

    const wrapper = mount(PulseDashboardView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Default pendaratan HEAD adalah Function Pulse
    expect(wrapper.find('h1').text()).toBe('Function Pulse');

    // Tab yang muncul hanya 2: Team Pulse & Function Pulse
    const tabs = wrapper.findAll('.scope-tab');
    expect(tabs.length).toBe(2);
    expect(tabs[0].text()).toContain('Team Pulse');
    expect(tabs[1].text()).toContain('Function Pulse');

    // Tab Management Pulse TIDAK ADA
    expect(wrapper.text()).not.toContain('Management Pulse');
  });

  it('restricts tabs for SUPERVISOR role: hides scope-tabs selector and defaults to Team Pulse', async () => {
    const authStore = (await import('../../stores/auth')).useAuthStore();
    authStore.user = {
      id: 'spv-id',
      email: 'spv@dutamedia.com',
      fullName: 'Supervisor Lead',
      role: 'SUPERVISOR',
      function: 'Engineering',
      status: 'ACTIVE',
    } as any;

    const wrapper = mount(PulseDashboardView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Team Pulse');
    // Karena hanya ada 1 cakupan yang diizinkan (AC-63), switcher disembunyikan
    expect(wrapper.find('.scope-tabs').exists()).toBe(false);
  });
});

