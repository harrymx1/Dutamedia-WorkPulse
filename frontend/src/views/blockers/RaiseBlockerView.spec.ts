import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RaiseBlockerView from './RaiseBlockerView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('RaiseBlockerView.vue (Cycle 2 / Group 4: SOL-BLKR-FORM - IMP-041, IMP-042, IMP-044)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  { id: 'com-1', taskText: 'Selesaikan API Gateway', sequenceNumber: 1 },
                ],
              },
            },
          }),
        });
      }
      if (url.includes('/blockers?mine=raised')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 'blk-1',
                type: 'TECHNICAL',
                severity: 'HIGH',
                impact: 'TASK',
                description: '[Bug Autentikasi] Sesi login tidak tersimpan di cookie',
                status: 'OPEN',
                raisedAt: '2026-11-03T08:00:00Z',
                assignedOwner: { id: 'usr-1', fullName: 'Budi Lead', email: 'budi@dutamedia.com' },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 'usr-1', fullName: 'Budi Lead', email: 'budi@dutamedia.com' },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/raise-blockers', component: RaiseBlockerView },
        { path: '/blockers/raise', redirect: '/raise-blockers' },
        { path: '/blockers', component: { template: '<div>Queue</div>' } },
        { path: '/blockers/aging', component: { template: '<div>Aging</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/notifications', component: { template: '<div>Notifications</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders headline, back link to /daily/morning, and does NOT render old kicker or queue button (IMP-041, IMP-042)', () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    // IMP-041: Back link to Morning Workspace
    const backLink = wrapper.find('[data-testid="back-nav-link"]');
    expect(backLink.exists()).toBe(true);
    expect(backLink.attributes('to') || backLink.attributes('href')).toContain('/daily/morning');
    expect(backLink.text()).toContain('Kembali ke Ruang Kerja My Today');

    // Heading verification
    expect(wrapper.text()).toContain('Laporkan & Pantau Blocker');
    expect(wrapper.text()).toContain('Workspace');
    expect(wrapper.text()).toContain('Blocker');

    // IMP-041: No kicker eyebrow
    expect(wrapper.text()).not.toContain('MANAJEMEN KENDALA & ESKALASI OTOMATIS');

    // IMP-042: No button link to management queue
    expect(wrapper.text()).not.toContain('Lihat Antrean Blocker Aktif');
  });

  it('provides 2 tabs: "Buat Laporan Blocker" and "Blocker Saya" with tab switching (IMP-041)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    const tabCreate = wrapper.find('[data-testid="tab-create-blocker"]');
    const tabMine = wrapper.find('[data-testid="tab-my-blockers"]');

    expect(tabCreate.exists()).toBe(true);
    expect(tabMine.exists()).toBe(true);
    expect(tabCreate.classes()).toContain('active');

    // Default tab shows form
    expect(wrapper.find('form.blocker-form').exists()).toBe(true);
    expect(wrapper.find('[data-testid="my-blockers-view"]').exists()).toBe(false);

    // Switch to Tab 2: Blocker Saya
    await tabMine.trigger('click');
    expect(tabMine.classes()).toContain('active');
    expect(tabCreate.classes()).not.toContain('active');
    expect(wrapper.find('[data-testid="my-blockers-view"]').exists()).toBe(true);
    expect(wrapper.find('form.blocker-form').exists()).toBe(false);

    // Filter pills exist
    expect(wrapper.find('[data-testid="filter-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-open"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-handling"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-resolved"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-closed"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-active"]').exists()).toBe(false);
  });

  it('provides clean business footer without internal audit code and reset button functionality (IMP-044)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    // IMP-044: Clean footer hint
    const footerHint = wrapper.find('[data-testid="footer-hint"]');
    expect(footerHint.exists()).toBe(true);
    expect(footerHint.text()).toBe('Pastikan fakta kendala akurat dan objektif untuk mempercepat penanganan oleh atasan.');
    expect(wrapper.text()).not.toContain('Audit Trail DEC-008');

    // IMP-044: Submit button label
    const submitBtn = wrapper.find('[data-testid="btn-submit-blocker"]');
    expect(submitBtn.exists()).toBe(true);
    expect(submitBtn.text()).toContain('Kirim Laporan Blocker');

    // Fill form title and test reset button
    const titleInput = wrapper.find('#blockerTitle');
    await titleInput.setValue('Testing Judul Blocker Baru');
    expect((titleInput.element as HTMLInputElement).value).toBe('Testing Judul Blocker Baru');

    const resetBtn = wrapper.find('[data-testid="btn-reset-form"]');
    expect(resetBtn.exists()).toBe(true);
    expect(resetBtn.text()).toContain('Bersihkan Formulir');

    await resetBtn.trigger('click');
    expect((titleInput.element as HTMLInputElement).value).toBe('');
  });

  it('displays project code input when Project Authority is selected (DEC-002)', async () => {
    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    // Default authority: Organizational
    expect(wrapper.find('#projectCodeSelect').exists()).toBe(false);

    // Switch to Project Authority
    const projectRadio = wrapper.findAll('input[type="radio"]').find(r => r.attributes('value') === 'PROJECT_AUTHORITY');
    expect(projectRadio).toBeDefined();
    await projectRadio!.setValue();

    expect(wrapper.find('#projectCodeSelect').exists()).toBe(true);
  });

  it('shows reporter confirmation and reopen actions for RESOLVED blockers in Blocker Saya without SLA terms', async () => {
    const fetchMock = vi.fn().mockImplementation((input: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/blockers?mine=raised')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'blk-awaiting-confirm',
                description: '[Gateway Timeout 504] Endpoint timeout saat hit staging (Ekspektasi: Pengecekan routing subnet)',
                type: 'INFRA',
                severity: 'CRITICAL',
                impact: 'PRODUCTION',
                status: 'RESOLVED',
                resolutionNote: 'Gateway network route telah di-reroute dan failover sukses.',
                raisedAt: '2026-11-13T04:52:00.000Z',
                assignedOwner: { fullName: 'Bambang Pratama' },
              },
            ],
          }),
        });
      }
      if (url.includes('/blockers/blk-awaiting-confirm/close')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { id: 'blk-awaiting-confirm', status: 'CLOSED' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    await flushPromises();
    expect(wrapper.text()).not.toContain('SLA');

    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Menunggu Konfirmasi (1)');
    expect(wrapper.find('.head-right [data-testid="reporter-confirm-label"]').text()).toBe('Menunggu Konfirmasi Anda');
    expect(wrapper.text()).toContain('Gateway Timeout 504');
    expect(wrapper.text()).toContain('Ekspektasi Bantuan:');
    expect(wrapper.text()).toContain('Pengecekan routing subnet');

    const closeBtn = wrapper.find('[data-testid="close-ticket-blk-awaiting-confirm"]');
    expect(closeBtn.exists()).toBe(true);
    expect(wrapper.find('[data-testid="reopen-ticket-blk-awaiting-confirm"]').exists()).toBe(true);

    await closeBtn.trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/blockers/blk-awaiting-confirm/close'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('separates Menunggu Respons (OPEN) and Sedang Ditangani (ACKNOWLEDGED) filter pills accurately', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: any) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.includes('/blockers?mine=raised')) {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              success: true,
              data: [
                {
                  id: 'blk-open-1',
                  description: '[Menunggu PIC] Kendala baru dilaporkan',
                  type: 'INFRA',
                  severity: 'HIGH',
                  impact: 'TASK',
                  status: 'OPEN',
                  raisedAt: '2026-11-13T04:52:00.000Z',
                },
                {
                  id: 'blk-ack-1',
                  description: '[Sedang Diproses] Kendala sedang ditangani PIC',
                  type: 'TECHNICAL',
                  severity: 'MEDIUM',
                  impact: 'TASK',
                  status: 'ACKNOWLEDGED',
                  raisedAt: '2026-11-13T05:00:00.000Z',
                },
              ],
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: [] }),
        });
      }),
    );

    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });

    await flushPromises();
    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="filter-open"]').text()).toContain('Menunggu Respons (1)');
    expect(wrapper.find('[data-testid="filter-handling"]').text()).toContain('Sedang Ditangani (1)');

    await wrapper.find('[data-testid="filter-open"]').trigger('click');
    expect(wrapper.text()).toContain('Menunggu PIC');
    expect(wrapper.text()).not.toContain('Sedang Diproses');

    await wrapper.find('[data-testid="filter-handling"]').trigger('click');
    expect(wrapper.text()).toContain('Sedang Diproses');
    expect(wrapper.text()).not.toContain('Menunggu PIC');
  });

  it('uses unified 5 Indonesian status labels on cards, closed pill, and creation success screen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: any) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.includes('/blockers?mine=raised')) {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              success: true,
              data: [
                { id: 't1', description: '[Tiket Open] Masalah DNS', type: 'INFRA', severity: 'HIGH', impact: 'TASK', status: 'OPEN', raisedAt: '2026-11-13T04:00:00Z' },
                { id: 't2', description: '[Tiket Ack] Masalah Cache', type: 'TECHNICAL', severity: 'MEDIUM', impact: 'TASK', status: 'ACKNOWLEDGED', raisedAt: '2026-11-13T04:10:00Z' },
                { id: 't3', description: '[Tiket Res] Masalah Queue', type: 'TECHNICAL', severity: 'LOW', impact: 'TASK', status: 'RESOLVED', raisedAt: '2026-11-13T04:20:00Z' },
                { id: 't4', description: '[Tiket Risk] Masalah Vendor', type: 'VENDOR', severity: 'HIGH', impact: 'TASK', status: 'ACCEPTED_RISK', raisedAt: '2026-11-13T04:30:00Z' },
                { id: 't5', description: '[Tiket Done] Masalah Login', type: 'TECHNICAL', severity: 'LOW', impact: 'TASK', status: 'CLOSED', raisedAt: '2026-11-13T04:40:00Z' },
              ],
            }),
          });
        }
        if (url.endsWith('/blockers')) {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              success: true,
              data: { id: 'new-blk-123', status: 'OPEN' },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: [] }),
        });
      }),
    );

    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });
    await flushPromises();

    // Uji layar sukses pembuatan tiket memakai label resmi (bukan raw OPEN)
    await wrapper.find('#blockerTitle').setValue('Kendala Gateway Timeout Staging');
    await wrapper.find('#blockerType').setValue('INFRA');
    await wrapper.find('#blockerImpact').setValue('TASK');
    await wrapper.find('#blockerDesc').setValue('Endpoint API gateway staging mengembalikan HTTP 504 setelah deploy.');
    await wrapper.find('form.blocker-form').trigger('submit');
    await flushPromises();

    const submittedCard = wrapper.find('[data-testid="submitted-ticket-card"]');
    expect(submittedCard.exists()).toBe(true);
    expect(submittedCard.text()).toContain('Menunggu Respons');
    expect(submittedCard.text()).not.toContain('status OPEN');

    // Uji 5 badge status seragam di tab Blocker Saya
    await wrapper.find('[data-testid="btn-view-my-blockers"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="filter-closed"]').text()).toContain('Selesai Ditutup (1)');
    const badgesText = wrapper.findAll('.pill').map((p) => p.text());
    expect(badgesText).toContain('Menunggu Respons');
    expect(badgesText).toContain('Sedang Ditangani');
    expect(badgesText).toContain('Solusi Diberikan');
    expect(badgesText).toContain('Risiko Diterima');
    expect(badgesText).toContain('Selesai Ditutup');
    expect(wrapper.findAll('[data-testid="reporter-confirm-label"]')).toHaveLength(2);
  });
});
