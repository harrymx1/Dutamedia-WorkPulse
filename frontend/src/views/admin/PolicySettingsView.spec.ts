import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PolicySettingsView from './PolicySettingsView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('PolicySettingsView.vue (WP-EP04-TK006 / Prototipe 18)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [
            {
              id: 'pol-1',
              category: 'CHECKIN_TIMING',
              configurationValues: {
                morningOnTimeCutoff: '09:00',
                morningLockCutoff: '09:30',
                eodOnTimeCutoff: '17:00',
                eodLockCutoff: '21:00',
              },
              isIllustrative: true,
              isFallback: false,
              effectiveDate: '2026-10-01',
              endDate: null,
              createdBy: { id: 'u1', fullName: 'Direktur', email: 'dir@test.com' },
              createdAt: '2026-10-01',
            },
          ],
          owners: [],
        },
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/policies', component: PolicySettingsView },
        { path: '/admin/organization', component: { template: '<div>Org</div>' } },
        { path: '/admin/temporary-reviewers', component: { template: '<div>Reviewers</div>' } },
        { path: '/admin/users', component: { template: '<div>Users</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders page header, kicker, and metrics summary', () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Pengaturan Kebijakan Sistem (Policy Settings)');
    expect(wrapper.text()).toContain('Administration · Policy Governance & Versioned Audit');
    expect(wrapper.text()).toContain('Morning Cut-Off');
    expect(wrapper.text()).toContain('EOD Cut-Off');
    expect(wrapper.text()).toContain('SLA Blocker L1 / L2');
    expect(wrapper.text()).toContain('+ Buat Versi Kebijakan Baru');
  });

  it('renders 5 canonical policy sections (DEC-002, Blocker SLA, DEC-003, DEC-004, DEC-008)', () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('1. Jam Kerja, Batas Pengiriman & Penguncian Cut-Off (DEC-002)');
    expect(wrapper.text()).toContain('2. SLA Penanganan Kendala (Blocker SLA & Auto-Escalation)');
    expect(wrapper.text()).toContain('3. Ambang Batas Carry-Over Berulang & Larangan Lock GREEN (DEC-003)');
    expect(wrapper.text()).toContain('4. Kebijakan Komitmen Nol / Zero-Commitment (DEC-004)');
    expect(wrapper.text()).toContain('5. Penegakan Tanggal Efektif & Larangan Backdating (DEC-008)');
  });

  it('opens and closes modal on button click and escape key', async () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    // Modal is initially closed
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);

    // Click open button
    const openBtn = wrapper.findAll('button').find(b => b.text().includes('Buat Versi Kebijakan Baru'));
    expect(openBtn).toBeDefined();
    await openBtn?.trigger('click');

    expect(wrapper.find('.modal-backdrop').exists()).toBe(true);

    // Escape closes modal
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });
});
