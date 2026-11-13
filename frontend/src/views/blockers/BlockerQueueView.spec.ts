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

  it('orders queue tickets newest-first across default and category-filtered views and selects newest first', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'blk-old-crit',
              description: '[Tiket Lama Critical] Sudah lama',
              type: 'INFRA',
              severity: 'CRITICAL',
              impact: 'PRODUCTION',
              status: 'CLOSED',
              raisedAt: '2026-11-13T07:00:00.000Z',
              targetResolutionAt: '2026-11-13T09:00:00.000Z',
              raisedBy: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              supportContributions: [],
            },
            {
              id: 'blk-newest-high',
              description: '[Tiket Baru High] Token vault 403',
              type: 'APPROVAL',
              severity: 'HIGH',
              impact: 'MILESTONE',
              status: 'OPEN',
              raisedAt: '2026-11-13T09:20:00.000Z',
              targetResolutionAt: '2026-11-13T13:20:00.000Z',
              raisedBy: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              supportContributions: [],
            },
            {
              id: 'blk-mid-high',
              description: '[Tiket Tengah Approval] Menunggu izin',
              type: 'APPROVAL',
              severity: 'MEDIUM',
              impact: 'TASK',
              status: 'OPEN',
              raisedAt: '2026-11-13T08:10:00.000Z',
              targetResolutionAt: '2026-11-13T16:10:00.000Z',
              raisedBy: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              supportContributions: [],
            },
          ],
        }),
      }),
    );

    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    const orderedCards = wrapper
      .findAll('[data-testid^="ticket-card-"]')
      .map((el) => el.attributes('data-testid'));
    expect(orderedCards).toEqual([
      'ticket-card-blk-newest-high',
      'ticket-card-blk-mid-high',
      'ticket-card-blk-old-crit',
    ]);
    expect(wrapper.find('[data-testid="ticket-detail-panel"]').text()).toContain('Token vault 403');

    // Filter kategori tetap terurut dari paling baru ke paling lama
    await wrapper.findAll('select').at(2)!.setValue('APPROVAL');
    const filteredCards = wrapper
      .findAll('[data-testid^="ticket-card-"]')
      .map((el) => el.attributes('data-testid'));
    expect(filteredCards).toEqual(['ticket-card-blk-newest-high', 'ticket-card-blk-mid-high']);

    vi.unstubAllGlobals();
  });

  it('renders flexible history cards distinguishing reporter reopen reasons from peer support contributions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'blk-reopened-only',
              description: '[Token Vault 403] Ditolak 403 saat start',
              type: 'APPROVAL',
              severity: 'HIGH',
              impact: 'MILESTONE',
              status: 'ACKNOWLEDGED',
              raisedAt: '2026-11-13T09:18:00.000Z',
              targetResolutionAt: '2026-11-13T13:18:00.000Z',
              raisedBy: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              supportContributions: [
                {
                  id: 'sup-reopen-1',
                  entryType: 'REPORTER_REOPEN',
                  supporter: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
                  actionTaken: 'Dikembalikan oleh Pelapor (Belum Memadai)',
                  resultNote: 'Token baru masih merespons 403 karena role policy belum aktif.',
                  createdAt: '2026-11-13T09:37:00.000Z',
                },
              ],
            },
            {
              id: 'blk-mixed',
              description: '[Timeout Staging] Masih error setelah support',
              type: 'INFRA',
              severity: 'CRITICAL',
              impact: 'PRODUCTION',
              status: 'ACKNOWLEDGED',
              raisedAt: '2026-11-13T08:00:00.000Z',
              targetResolutionAt: '2026-11-13T10:00:00.000Z',
              raisedBy: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
              supportContributions: [
                {
                  id: 'sup-peer-1',
                  supporter: { id: 'u2', fullName: 'Bambang Pratama', email: 'bambang@dutamedia.com' },
                  actionTaken: 'Pengecekan routing subnet staging',
                  resultNote: 'Rute subnet node-02 diperbaiki',
                  createdAt: '2026-11-13T08:30:00.000Z',
                },
                {
                  id: 'sup-reopen-2',
                  supporter: { id: 'u1', fullName: 'Aditya Nugroho', email: 'adit@dutamedia.com' },
                  actionTaken: 'Dikembalikan oleh Pelapor (Belum Memadai)',
                  resultNote: 'Healthcheck masih timeout di endpoint /payments',
                  createdAt: '2026-11-13T08:45:00.000Z',
                },
              ],
            },
          ],
        }),
      }),
    );

    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    // Tiket pertama hanya punya reopen tanpa bantuan rekan -> badge X Bantuan tidak boleh muncul palsu
    const firstCard = wrapper.find('[data-testid="ticket-card-blk-reopened-only"]');
    expect(firstCard.find('[data-testid="card-support-count"]').exists()).toBe(false);

    // Tiket kedua punya 1 bantuan rekan + 1 reopen -> hanya menghitung 1 Bantuan
    const secondCard = wrapper.find('[data-testid="ticket-card-blk-mixed"]');
    expect(secondCard.find('[data-testid="card-support-count"]').text()).toContain('1 Bantuan');

    // Detail tiket pertama memakai judul & label alasan pengembalian yang tepat
    expect(wrapper.text()).toContain('Riwayat Penanganan & Kontribusi (1)');
    const reopenCard = wrapper.find('[data-testid="history-item-sup-reopen-1"]');
    expect(reopenCard.classes()).toContain('variant-reopen');
    expect(reopenCard.text()).toContain('Dikembalikan Pelapor (Belum Memadai)');
    expect(reopenCard.text()).toContain('Alasan Pengembalian:');
    expect(reopenCard.text()).toContain('Token baru masih merespons 403');
    expect(reopenCard.text()).not.toContain('Tindakan:');
    expect(reopenCard.text()).not.toContain('Hasil / Solusi:');

    // Pilih tiket kedua dan pastikan format peer support vs reopen berdampingan rapi
    await secondCard.trigger('click');
    await flushPromises();

    const peerItem = wrapper.find('[data-testid="history-item-sup-peer-1"]');
    expect(peerItem.classes()).toContain('variant-support');
    expect(peerItem.text()).toContain('Kontribusi Bantuan');
    expect(peerItem.text()).toContain('Tindakan:');
    expect(peerItem.text()).toContain('Hasil / Solusi:');

    const mixedReopenItem = wrapper.find('[data-testid="history-item-sup-reopen-2"]');
    expect(mixedReopenItem.classes()).toContain('variant-reopen');
    expect(mixedReopenItem.text()).toContain('Alasan Pengembalian:');

    vi.unstubAllGlobals();
  });
});
