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
            ownerNeededType: 'ORGANIZATIONAL_HIERARCHY',
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
        { path: '/blockers/raise', component: { template: '<div>Raise</div>' } },
      ],
    });
  });

  it('renders metric summary cards and blocker ticket card list', async () => {
    const wrapper = mount(BlockerQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Antrean Eskalasi Blocker');
    expect(wrapper.text()).toContain('Kritis Belum Selesai');
    expect(wrapper.text()).toContain('Menunggu Acknowledge');
    expect(wrapper.text()).toContain('Database query timeout');
    expect(wrapper.text()).toContain('Alice Dev');
    expect(wrapper.text()).toContain('Charlie Ops');
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
});
