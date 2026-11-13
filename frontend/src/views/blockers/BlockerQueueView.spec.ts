import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BlockerQueueView from './BlockerQueueView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('BlockerQueueView.vue (WP-EP06 / Prototipe 09 - Antrean Eskalasi Blocker & Support)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: [
          {
            id: 'blk-001',
            description: 'Database query timeout pada reporting query',
            type: 'TECHNICAL',
            severity: 'CRITICAL',
            impact: 'TASK',
            status: 'OPEN',
            raisedAt: '2026-10-28T09:00:00.000Z',
            targetResolutionAt: '2026-10-28T13:00:00.000Z',
            ownerNeededType: 'ORGANIZATIONAL_AUTHORITY',
            raisedBy: { id: 'u1', fullName: 'Alice Dev', email: 'alice@dutamedia.com' },
            assignedOwner: { id: 'u2', fullName: 'Bob Lead', email: 'bob@dutamedia.com' },
            supportContributions: [
              {
                id: 'sup-1',
                supporter: { id: 'u3', fullName: 'Charlie Ops', email: 'charlie@dutamedia.com' },
                actionTaken: 'Tambahkan indexing di tabel log',
                resultNote: 'Query time turun ke 120ms',
                createdAt: '2026-10-28T10:00:00.000Z',
              },
            ],
          },
        ],
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/blockers', component: BlockerQueueView },
        { path: '/blockers/aging', component: { template: '<div>Aging</div>' } },
        { path: '/raise-blockers', component: { template: '<div>Raise</div>' } },
        { path: '/blockers/raise', redirect: '/raise-blockers' },
      ],
    });
  });

  it('renders metric summary cards and blocker ticket card list with unified Indonesian status labels', async () => {
    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Antrean Eskalasi Blocker');
    expect(wrapper.text()).toContain('Management');
    expect(wrapper.text()).toContain('Kritis Belum Selesai');
    expect(wrapper.text()).toContain('Menunggu Respons');
    expect(wrapper.text()).toContain('Terima & Tangani');
    expect(wrapper.text()).toContain('Database query timeout');
    expect(wrapper.text()).toContain('Alice Dev');
    expect(wrapper.text()).toContain('Charlie Ops');

    // Pastikan istilah lama / kode teknis mentah sudah hilang dari UI
    expect(wrapper.text()).not.toContain('Menunggu Acknowledge');
    expect(wrapper.text()).not.toContain('Terbuka (OPEN)');
    expect(wrapper.text()).not.toContain('Ditangani (ACKNOWLEDGED)');
    expect(wrapper.text()).not.toContain('Ditutup Final (CLOSED)');

    const statusOptions = wrapper.findAll('select').at(0)!.findAll('option').map((o) => o.text());
    expect(statusOptions).toEqual([
      'Semua Status',
      'Menunggu Respons',
      'Sedang Ditangani',
      'Solusi Diberikan',
      'Risiko Diterima',
      'Selesai Ditutup',
    ]);
  });

  it('opens support contribution modal when Beri Bantuan is clicked', async () => {
    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const supportBtn = wrapper.findAll('button').find(b => b.text().includes('Beri Bantuan'));
    expect(supportBtn).toBeDefined();
    await supportBtn!.trigger('click');

    expect(wrapper.text()).toContain('Salurkan Kontribusi Bantuan (Peer Support)');
  });

  it('renders clean authority label without SLA wording and opens Terima Risiko modal', async () => {
    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).not.toContain('SLA');
    expect(wrapper.text()).toContain('Struktural Organisasi (Atasan Langsung / Divisi)');
    expect(wrapper.text()).toContain('Target Batas Penanganan');

    const acceptRiskBtn = wrapper.findAll('button').find(b => b.text().includes('Terima Risiko'));
    expect(acceptRiskBtn).toBeDefined();
    await acceptRiskBtn!.trigger('click');

    expect(wrapper.text()).toContain('Tetapkan Risiko Diterima');
  });

  it('auto-scrolls to detail panel on tablet/mobile card click and scrolls back to list', async () => {
    const scrollDetailSpy = vi.fn();
    const scrollListSpy = vi.fn();
    const matchMediaMock = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal('matchMedia', matchMediaMock);

    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    const detailPanel = wrapper.find('[data-testid="ticket-detail-panel"]').element as HTMLElement;
    const listPanel = wrapper.find('[data-testid="ticket-list-panel"]').element as HTMLElement;
    detailPanel.scrollIntoView = scrollDetailSpy;
    listPanel.scrollIntoView = scrollListSpy;

    await wrapper.find('[data-testid="ticket-card-blk-001"]').trigger('click');
    await flushPromises();

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 1024px)');
    expect(scrollDetailSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    await wrapper.find('[data-testid="btn-back-to-list"]').trigger('click');
    expect(scrollListSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    // Di desktop (> 1024px), tidak memicu auto-scroll
    scrollDetailSpy.mockClear();
    matchMediaMock.mockReturnValue({ matches: false });
    await wrapper.find('[data-testid="ticket-card-blk-001"]').trigger('click');
    await flushPromises();
    expect(scrollDetailSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
