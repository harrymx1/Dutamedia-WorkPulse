import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EscalationAgingView from './EscalationAgingView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EscalationAgingView.vue (WP-EP06 / Prototipe 14 - Keterlambatan Penanganan Blocker)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: {
          evaluatedAt: '2026-10-28T14:00:00.000Z',
          summary: {
            totalOpen: 3,
            breachedCount: 1,
            criticalCount: 1,
            highCount: 1,
            slaComplianceRate: 67,
          },
          blockers: [
            {
              id: 'blk-001',
              description: 'Sertifikat SSL expired di domain staging',
              type: 'INFRA',
              severity: 'CRITICAL',
              impact: 'PRODUCTION',
              status: 'OPEN',
              raisedAt: '2026-10-28T08:00:00.000Z',
              targetResolutionAt: '2026-10-28T12:00:00.000Z',
              elapsedHours: 6,
              hoursRemaining: -2,
              isBreached: true,
              raisedBy: { id: 'u1', fullName: 'Budi Dev' },
              assignedOwner: { id: 'u2', fullName: 'Siti Infra Lead' },
              projectCodeReference: 'PRJ-PORTAL',
            },
          ],
        },
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/blockers/aging', component: EscalationAgingView },
        { path: '/blockers', component: { template: '<div>Queue</div>' } },
      ],
    });
  });

  it('renders aging radar table and executive summary metrics', async () => {
    const wrapper = mount(EscalationAgingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Keterlambatan Penanganan Blocker');
    expect(wrapper.text()).toContain('Terlewat SLA (Breached)');
    expect(wrapper.text()).toContain('67%');
    expect(wrapper.text()).toContain('Sertifikat SSL expired');
    expect(wrapper.text()).toContain('6 jam');
    expect(wrapper.text()).toContain('Terlewat (2j)');
  });
});
