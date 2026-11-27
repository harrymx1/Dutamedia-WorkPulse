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

  it('renders aging radar table and executive summary metrics in clean Indonesian without initial toast spam', async () => {
    const wrapper = mount(EscalationAgingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Keterlambatan Penanganan Blocker');
    expect(wrapper.text()).toContain('Lewat Batas Waktu');
    expect(wrapper.text()).toContain('Prioritas Kritis');
    expect(wrapper.text()).not.toContain('(Critical)');
    expect(wrapper.text()).not.toContain('SLA');
    expect(wrapper.text()).not.toContain('Metrik aging eskalasi berhasil diperbarui.');
    expect(wrapper.find('.toast-popup.success').exists()).toBe(false);
    expect(wrapper.text()).toContain('67%');
    expect(wrapper.text()).toContain('Sertifikat SSL expired');
    expect(wrapper.text()).toContain('Server & Rilis Sistem');
    expect(wrapper.text()).toContain('Layanan Langsung Pengguna');
    expect(wrapper.find('.type-pill').exists()).toBe(false);
    expect(wrapper.find('.sev-badge').text()).toBe('Kritis');
    expect(wrapper.text()).not.toContain('Belum Di-assign');
    expect(wrapper.text()).toContain('6 jam');
    expect(wrapper.text()).toContain('Terlewat (2j)');
    expect(wrapper.find('.btn-inspect').attributes('href')).toContain('/blockers?ticketId=blk-001');
  });

  it('shows refresh toast only when Segarkan Data is clicked and supports search + empty filter reset', async () => {
    const wrapper = mount(EscalationAgingView, {
      global: { plugins: [router] },
    });

    await flushPromises();
    expect(wrapper.find('.toast-popup.success').exists()).toBe(false);

    await wrapper.find('.btn-topbar').trigger('click');
    await flushPromises();
    expect(wrapper.find('.toast-popup.success').text()).toContain(
      'Data penuaan kendala berhasil diperbarui.',
    );

    await wrapper.find('#agingSearchInput').setValue('tidak-cocok');
    expect(wrapper.findAll('tbody tr')).toHaveLength(0);
    expect(wrapper.text()).toContain('Tidak Ada Kendala yang Cocok');
    const resetBtn = wrapper.find('.btn-reset-filter');
    expect(resetBtn.exists()).toBe(true);
    await resetBtn.trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });

  it('filters table cleanly via top KPI cards with zero extra API requests and keeps percentage card passive', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: {
          evaluatedAt: '2026-10-28T14:00:00.000Z',
          summary: {
            totalOpen: 3,
            breachedCount: 2,
            criticalCount: 1,
            highCount: 1,
            slaComplianceRate: 33,
          },
          blockers: [
            {
              id: 'blk-crit',
              description: '[Database Timeout] Pool exhausted',
              type: 'INFRA',
              severity: 'CRITICAL',
              impact: 'PRODUCTION',
              status: 'OPEN',
              raisedAt: '2026-10-28T06:00:00.000Z',
              targetResolutionAt: '2026-10-28T08:00:00.000Z',
              elapsedHours: 8,
              hoursRemaining: -6,
              isBreached: true,
              raisedBy: { id: 'u1', fullName: 'Siti Rahma' },
              assignedOwner: { id: 'u2', fullName: 'Reza Mahendra' },
              projectCodeReference: 'WP-CORE',
            },
            {
              id: 'blk-high',
              description: '[UAT Feedback Delay] Klien belum konfirmasi',
              type: 'CLIENT',
              severity: 'HIGH',
              impact: 'CLIENT',
              status: 'OPEN',
              raisedAt: '2026-10-28T06:00:00.000Z',
              targetResolutionAt: '2026-10-28T10:00:00.000Z',
              elapsedHours: 8,
              hoursRemaining: -4,
              isBreached: true,
              raisedBy: { id: 'u1', fullName: 'Siti Rahma' },
              assignedOwner: { id: 'u3', fullName: 'Dimas Prakoso' },
              projectCodeReference: 'PRJ-PORTAL',
            },
            {
              id: 'blk-med',
              description: '[Menunggu Firewall] Port staging belum dibuka',
              type: 'CROSS_TEAM',
              severity: 'MEDIUM',
              impact: 'TEAM',
              status: 'OPEN',
              raisedAt: '2026-10-28T08:00:00.000Z',
              targetResolutionAt: '2026-10-28T16:00:00.000Z',
              elapsedHours: 6,
              hoursRemaining: 2,
              isBreached: false,
              raisedBy: { id: 'u4', fullName: 'Aditya Nugroho' },
              assignedOwner: { id: 'u5', fullName: 'Gunawan Setiawan' },
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(EscalationAgingView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
    expect(wrapper.find('[data-testid="metric-card-total"]').classes()).toContain('active');
    expect(wrapper.find('[data-testid="metric-card-rate"]').element.tagName).toBe('DIV');

    // Click Lewat Batas Waktu -> 2 breached rows
    await wrapper.find('[data-testid="metric-card-breach"]').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.find('[data-testid="metric-card-breach"]').classes()).toContain('active');

    // Click again -> toggle back to all 3 rows
    await wrapper.find('[data-testid="metric-card-breach"]').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);

    // Click Prioritas Kritis -> 1 CRITICAL row & synced dropdown
    await wrapper.find('[data-testid="metric-card-critical"]').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect((wrapper.find('#agingSeverityFilter').element as HTMLSelectElement).value).toBe('CRITICAL');
    expect(wrapper.find('[data-testid="metric-card-critical"]').classes()).toContain('active');

    // Click Total Kendala Tertahan -> reset all filters back to 3 rows
    await wrapper.find('[data-testid="metric-card-total"]').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
    expect((wrapper.find('#agingSeverityFilter').element as HTMLSelectElement).value).toBe('ALL');

    // Confirm zero additional network requests were made
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
