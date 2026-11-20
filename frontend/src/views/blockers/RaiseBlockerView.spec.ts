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
    await wrapper.find('[data-testid="impact-checkbox-TASK"]').setValue(true);
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
    const resolvedPill = wrapper.findAll('.pill').find((p) => p.text() === 'Solusi Diberikan');
    const closedPill = wrapper.findAll('.pill').find((p) => p.text() === 'Selesai Ditutup');
    expect(resolvedPill?.classes()).toContain('teal');
    expect(closedPill?.classes()).toContain('green');
    expect(closedPill?.classes()).not.toContain('neutral');
    expect(wrapper.findAll('[data-testid="reporter-confirm-label"]')).toHaveLength(2);
  });

  it('sorts myBlockers newest-first regardless of severity or status across All and filter pills', async () => {
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
              // Sengaja dikirim tidak urut (CRITICAL lama ditutup di depan, HIGH terbaru di belakang)
              data: [
                { id: 'old-crit', description: '[Tiket Lama Critical] Sudah ditutup', type: 'INFRA', severity: 'CRITICAL', impact: 'PRODUCTION', status: 'CLOSED', raisedAt: '2026-11-13T07:18:00Z' },
                { id: 'mid-open', description: '[Tiket Tengah Medium] Masih open', type: 'TECHNICAL', severity: 'MEDIUM', impact: 'TASK', status: 'OPEN', raisedAt: '2026-11-13T08:00:00Z' },
                { id: 'new-high', description: '[Tiket Baru High] Baru dilaporkan', type: 'APPROVAL', severity: 'HIGH', impact: 'MILESTONE', status: 'OPEN', raisedAt: '2026-11-13T09:20:00Z' },
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

    const allIds = wrapper.findAll('[data-ticket-id]').map((el) => el.attributes('data-ticket-id'));
    expect(allIds).toEqual(['new-high', 'mid-open', 'old-crit']);

    await wrapper.find('[data-testid="filter-open"]').trigger('click');
    const openIds = wrapper.findAll('[data-ticket-id]').map((el) => el.attributes('data-ticket-id'));
    expect(openIds).toEqual(['new-high', 'mid-open']);
  });

  it('displays contribution history in Blocker Saya and lets reporter resolve/close, accept progress, or reject support with reason (DEC-015)', async () => {
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
                id: 'blk-sup-flow',
                description: '[Token Vault 403] Endpoint staging gagal akses',
                type: 'APPROVAL',
                severity: 'HIGH',
                impact: 'MILESTONE',
                status: 'ACKNOWLEDGED',
                raisedAt: '2026-11-15T06:00:00Z',
                assignedOwner: { id: 'owner-1', fullName: 'Gunawan Setiawan', email: 'ops@dutamedia.com' },
                supportContributions: [
                  {
                    id: 'sup-pending-1',
                    supporter: { id: 'owner-1', fullName: 'Gunawan Setiawan', email: 'ops@dutamedia.com' },
                    actionTaken: 'Menambahkan role staging-reader ke token sementara',
                    resultNote: 'Role sudah aktif di cluster staging-01',
                    createdAt: '2026-11-15T06:20:00Z',
                  },
                  {
                    id: 'sup-accepted-1',
                    supporter: { id: 'rekan-2', fullName: 'Bambang Pratama', email: 'bambang@dutamedia.com' },
                    actionTaken: '[SUPPORT_ACCEPTED_PROGRESS] Buka port firewall staging',
                    resultNote:
                      'Port staging sudah terbuka\n[CATATAN_PROGRES_PELAPOR]: Koneksi host berhasil, namun query transaksi masih timeout.',
                    createdAt: '2026-11-15T06:05:00Z',
                  },
                  {
                    id: 'sup-rejected-1',
                    supporter: { id: 'rekan-1', fullName: 'Bambang Pratama', email: 'bambang@dutamedia.com' },
                    actionTaken: '[SUPPORT_REJECTED] Reset akun VPN',
                    resultNote: 'Akun VPN direset\n[CATATAN_PENOLAKAN_PELAPOR]: Kendala ada pada IAM policy vault, bukan akses VPN.',
                    createdAt: '2026-11-15T06:10:00Z',
                  },
                ],
              },
            ],
          }),
        });
      }
      if (url.includes('/support/sup-pending-1/respond')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { status: 'ACKNOWLEDGED' } }),
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
    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();

    const historyBox = wrapper.find('[data-testid="my-blocker-history-blk-sup-flow"]');
    expect(historyBox.exists()).toBe(true);
    expect(historyBox.text()).toContain('Riwayat Penanganan & Kontribusi (3)');
    expect(historyBox.text()).toContain('Gunawan Setiawan');
    expect(historyBox.text()).toContain('Menambahkan role staging-reader ke token sementara');
    expect(historyBox.text()).toContain('Bantuan Diterima (Membantu Sebagian)');
    expect(historyBox.text()).toContain('Catatan Progres & Sisa Kendala:');
    expect(historyBox.text()).toContain('Koneksi host berhasil, namun query transaksi masih timeout.');
    expect(historyBox.text()).toContain('Bantuan Belum Membantu');
    expect(historyBox.text()).toContain('Catatan / Kendala yang Masih Terjadi:');
    expect(historyBox.text()).toContain('Kendala ada pada IAM policy vault, bukan akses VPN.');

    const responsePanel = wrapper.find('[data-testid="support-response-panel-sup-pending-1"]');
    expect(responsePanel.exists()).toBe(true);
    expect(wrapper.find('[data-testid="support-resolve-close-sup-pending-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="support-accept-progress-sup-pending-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="support-reject-open-sup-pending-1"]').exists()).toBe(true);

    // Uji Terima Bantuan (Membantu Sebagian) -> ACCEPT_AS_SUPPORT (wajib isi catatan progres & sisa kendala)
    await wrapper.find('[data-testid="support-accept-progress-sup-pending-1"]').trigger('click');
    const acceptReasonTextarea = wrapper.find('[data-testid="support-response-panel-sup-pending-1"] textarea');
    await acceptReasonTextarea.setValue('Role reader sudah aktif untuk GET, namun submit POST multi-item masih 500.');
    await wrapper.find('[data-testid="support-accept-submit-sup-pending-1"]').trigger('click');
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/blockers/blk-sup-flow/support/sup-pending-1/respond'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          decision: 'ACCEPT_AS_SUPPORT',
          reason: 'Role reader sudah aktif untuk GET, namun submit POST multi-item masih 500.',
        }),
      }),
    );

    // Uji Tolak Bantuan (Belum Membantu) -> REJECT_SUPPORT
    await wrapper.find('[data-testid="support-reject-open-sup-pending-1"]').trigger('click');
    const reasonTextarea = wrapper.find('[data-testid="support-response-panel-sup-pending-1"] textarea');
    await reasonTextarea.setValue('Role sudah aktif namun policy staging masih menolak endpoint /secrets.');
    await wrapper.find('[data-testid="support-reject-submit-sup-pending-1"]').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/blockers/blk-sup-flow/support/sup-pending-1/respond'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          decision: 'REJECT_SUPPORT',
          reason: 'Role sudah aktif namun policy staging masih menolak endpoint /secrets.',
        }),
      }),
    );

    // Re-open or test RESOLVE_AND_CLOSE cleanly
    vi.unstubAllGlobals();
  });

  it('submits RESOLVE_AND_CLOSE decision when reporter accepts peer support as final resolution', async () => {
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
                id: 'blk-sup-close-ui',
                description: '[Token Vault 403] Endpoint staging gagal akses',
                type: 'APPROVAL',
                severity: 'HIGH',
                impact: 'MILESTONE',
                status: 'ACKNOWLEDGED',
                raisedAt: '2026-11-15T06:00:00Z',
                supportContributions: [
                  {
                    id: 'sup-fix-1',
                    supporter: { id: 'owner-1', fullName: 'Gunawan Setiawan', email: 'ops@dutamedia.com' },
                    actionTaken: 'Memperbarui token vault dan izin staging',
                    resultNote: 'Token aktif dan teruji 200 OK',
                    createdAt: '2026-11-15T06:20:00Z',
                  },
                ],
              },
            ],
          }),
        });
      }
      if (url.includes('/support/sup-fix-1/respond')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { status: 'CLOSED' } }),
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
    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();

    await wrapper.find('[data-testid="support-resolve-close-sup-fix-1"]').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/blockers/blk-sup-close-ui/support/sup-fix-1/respond'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ decision: 'RESOLVE_AND_CLOSE' }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it('shows Edit Tiket and Hapus Tiket only for active blockers and submits Edit and Delete (including OTHER reason) properly (DEC-016)', async () => {
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
                id: 'blk-active-1',
                description:
                  '[Endpoint Error 500] Transaksi Prisma gagal saat submit komitmen lebih dari satu item (Ekspektasi: Perbaiki query transaksi)',
                type: 'TECHNICAL',
                severity: 'HIGH',
                impact: 'MILESTONE',
                status: 'ACKNOWLEDGED',
                raisedAt: '2026-11-16T01:00:00Z',
                supportContributions: [],
              },
              {
                id: 'blk-resolved-1',
                description: '[Token 403] Sudah diberi solusi oleh PIC',
                type: 'APPROVAL',
                severity: 'MEDIUM',
                impact: 'TASK',
                status: 'RESOLVED',
                resolutionNote: 'Token sudah diaktifkan ulang pada environment staging.',
                raisedAt: '2026-11-15T06:00:00Z',
                supportContributions: [],
              },
            ],
          }),
        });
      }
      if (url.includes('/blockers/blk-active-1/update')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { id: 'blk-active-1' } }),
        });
      }
      if (url.includes('/blockers/blk-active-1/delete')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { deleted: true, id: 'blk-active-1' } }),
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
    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();

    // Active ticket shows Edit & Delete; RESOLVED ticket hides both
    expect(wrapper.find('[data-testid="edit-ticket-blk-active-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-ticket-blk-active-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-ticket-blk-resolved-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="delete-ticket-blk-resolved-1"]').exists()).toBe(false);

    // Uji Edit Tiket
    await wrapper.find('[data-testid="edit-ticket-blk-active-1"]').trigger('click');
    const editModal = wrapper.find('[data-testid="edit-blocker-modal"]');
    expect(editModal.exists()).toBe(true);
    await editModal.find('#editBlockerTitle').setValue('Endpoint Error 500 Revisi');
    await editModal.find('#editBlockerType').setValue('INFRA');
    await editModal.find('#editBlockerDescription').setValue(
      'Revisi detail: transaksi database timeout pada staging cluster saat beban tinggi.',
    );
    await wrapper.find('[data-testid="confirm-edit-blocker"]').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/blockers/blk-active-1/update'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'INFRA',
          severity: 'HIGH',
          impact: 'MILESTONE',
          impacts: ['MILESTONE'],
          description:
            '[Endpoint Error 500 Revisi] Revisi detail: transaksi database timeout pada staging cluster saat beban tinggi. (Ekspektasi: Perbaiki query transaksi)',
        }),
      }),
    );

    // Uji Hapus Tiket: kategori standar tidak memunculkan textarea; hanya OTHER yang mewajibkan input teks
    await wrapper.find('[data-testid="delete-ticket-blk-active-1"]').trigger('click');
    const deleteModal = wrapper.find('[data-testid="delete-blocker-modal"]');
    expect(deleteModal.exists()).toBe(true);
    expect(deleteModal.find('#deleteBlockerReason').exists()).toBe(false);

    await deleteModal.find('[data-testid="delete-reason-WRONG_INPUT_OR_DUPLICATE"]').setValue(true);
    expect(deleteModal.find('#deleteBlockerReason').exists()).toBe(false);

    await deleteModal.find('[data-testid="delete-reason-OTHER"]').setValue(true);
    expect(deleteModal.find('#deleteBlockerReason').exists()).toBe(true);
    await deleteModal.find('#deleteBlockerReason').setValue(
      'Tiket dibuat dengan akun uji yang salah dan akan dilaporkan ulang oleh pelapor asli.',
    );
    await wrapper.find('[data-testid="confirm-delete-blocker"]').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/blockers/blk-active-1/delete'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          reasonCategory: 'OTHER',
          reason:
            'Tiket dibuat dengan akun uji yang salah dan akan dilaporkan ulang oleh pelapor asli.',
        }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it('renders 16 categories in 5 optgroups, conditional waitingForFunction for CROSS_TEAM, 1-3 impact checkboxes with limit 3, and full taxonomy without raw code pill in Blocker Saya', async () => {
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
                id: 'blk-tax-1',
                type: 'NETWORK',
                severity: 'HIGH',
                impact: 'TASK',
                impacts: ['TASK', 'COMPANY_OPS'],
                description: '[WiFi Lantai 2 Mati] Koneksi kantor terputus sejak pagi',
                status: 'OPEN',
                raisedAt: '2026-11-18T08:00:00Z',
                assignedOwner: { id: 'usr-fk', fullName: 'Fakhrizal Asshiddiq', email: 'network.infra@dutamedia.com' },
              },
            ],
          }),
        });
      }
      if (url.includes('/blockers/routing-preview')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              suggestedOwner: {
                id: 'usr-dharma',
                fullName: 'Dharma Putra',
                jobTitle: 'Head of Delivery',
              },
              reason: 'DIVISION_HEAD',
              divisionLabel: 'Delivery & Project Management',
            },
          }),
        });
      }
      if (url.endsWith('/blockers')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { id: 'blk-new-cross', status: 'OPEN' },
          }),
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

    // 1. 16 kategori dalam 5 optgroup
    const optgroups = wrapper.findAll('#blockerType optgroup');
    expect(optgroups).toHaveLength(5);
    const options = wrapper.findAll('#blockerType optgroup option');
    expect(options).toHaveLength(16);

    // 2. CROSS_TEAM memunculkan pilihan waitingForFunction
    expect(wrapper.find('#waitingForFunction').exists()).toBe(false);
    await wrapper.find('#blockerType').setValue('CROSS_TEAM');
    expect(wrapper.find('#waitingForFunction').exists()).toBe(true);
    await wrapper.find('#waitingForFunction').setValue('Delivery');
    await flushPromises();

    // 3. Kotak centang 9 dampak dengan batas maksimal 3 dan peringatan inline jika dilepas ke 0
    expect(wrapper.text()).toContain('Pilih 1 sampai maksimal 3 dampak yang paling terasa.');
    expect(wrapper.findAll('input[data-testid^="impact-checkbox-"]')).toHaveLength(9);
    expect(wrapper.find('[data-testid="impact-min-warning"]').exists()).toBe(false);
    await wrapper.find('[data-testid="impact-checkbox-TASK"]').setValue(true);
    await wrapper.find('[data-testid="impact-checkbox-TASK"]').setValue(false);
    expect(wrapper.find('[data-testid="impact-selection-count"]').text()).toBe('0 / 3 dipilih');
    expect(wrapper.find('[data-testid="impact-min-warning"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="impact-min-warning"]').text()).toContain('Minimal pilih 1 dampak kendala.');

    await wrapper.find('[data-testid="impact-checkbox-TASK"]').setValue(true);
    expect(wrapper.find('[data-testid="impact-min-warning"]').exists()).toBe(false);
    await wrapper.find('[data-testid="impact-checkbox-TEAM"]').setValue(true);
    await wrapper.find('[data-testid="impact-checkbox-PROJECT"]').setValue(true);
    expect(wrapper.find('[data-testid="impact-selection-count"]').text()).toBe('3 / 3 dipilih');
    // Pilihan ke-4 otomatis disabled
    const fourthCheckbox = wrapper.find('[data-testid="impact-checkbox-MILESTONE"]').element as HTMLInputElement;
    expect(fourthCheckbox.disabled).toBe(true);

    await wrapper.find('#blockerTitle').setValue('Menunggu Hasil Pengujian Modul Navigasi');
    await wrapper.find('#blockerDesc').setValue('Fitur navigasi mobile sudah selesai dan menunggu konfirmasi tim QA Delivery.');
    await wrapper.find('form.blocker-form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/blockers$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'CROSS_TEAM',
          severity: 'HIGH',
          impact: 'TASK',
          impacts: ['TASK', 'TEAM', 'PROJECT'],
          waitingForFunction: 'Delivery',
          description: '[Menunggu Hasil Pengujian Modul Navigasi] Fitur navigasi mobile sudah selesai dan menunggu konfirmasi tim QA Delivery.',
          ownerNeededType: 'ORGANIZATIONAL_AUTHORITY',
        }),
      }),
    );

    // 4. Tab Blocker Saya tidak memiliki pill-neutral kode mentah & menampilkan kalimat lengkap kategori + multi-dampak
    await wrapper.find('[data-testid="btn-view-my-blockers"]').trigger('click');
    await flushPromises();

    const taxCard = wrapper.find('[data-ticket-id="blk-tax-1"]');
    expect(taxCard.find('.blocker-item-head .pill-neutral').exists()).toBe(false);
    const taxonomyBox = wrapper.find('[data-testid="my-blocker-taxonomy-blk-tax-1"]');
    expect(taxonomyBox.text()).toContain('Jaringan & Koneksi');
    expect(taxonomyBox.text()).toContain('Tugas Pribadi');
    expect(taxonomyBox.text()).toContain('Operasional Kantor');

    vi.unstubAllGlobals();
  });

  it('auto-dismisses success toast after 6s and resets Blocker Saya filter to Semua when clicking Lihat di Blocker Saya', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/blockers') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { id: 'blk-new-open', status: 'OPEN', severity: 'HIGH' },
          }),
        });
      }
      if (url.includes('/blockers?mine=raised')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'blk-new-open',
                type: 'APPROVAL',
                severity: 'HIGH',
                impact: 'MILESTONE',
                impacts: ['MILESTONE'],
                status: 'OPEN',
                description: '[Tiket Baru Uji Reset Filter] Deskripsi lengkap tiket baru yang masih menunggu respons.',
                raisedAt: '2026-11-18T08:00:00Z',
                assignedOwner: { id: 'owner-1', fullName: 'Arif Budiman' },
              },
              {
                id: 'blk-handling-1',
                type: 'TECHNICAL',
                severity: 'MEDIUM',
                impact: 'TASK',
                impacts: ['TASK'],
                status: 'ACKNOWLEDGED',
                description: '[Tiket Lama Sedang Ditangani] Deskripsi tiket yang sedang ditangani.',
                raisedAt: '2026-11-18T07:00:00Z',
                assignedOwner: { id: 'owner-1', fullName: 'Arif Budiman' },
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
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });
    await flushPromises();

    // 1. Pindah ke Blocker Saya dan pilih filter "Sedang Ditangani"
    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();
    const filterButtons = wrapper.findAll('.filter-pills button');
    const handlingFilterBtn = filterButtons.find((b) => b.text().includes('Sedang Ditangani'));
    expect(handlingFilterBtn).toBeTruthy();
    await handlingFilterBtn!.trigger('click');
    expect(wrapper.find('[data-ticket-id="blk-new-open"]').exists()).toBe(false);

    // 2. Kembali buat tiket baru & submit -> toast muncul lalu hilang otomatis setelah 6 detik
    await wrapper.find('[data-testid="tab-create-blocker"]').trigger('click');
    await wrapper.find('#blockerType').setValue('APPROVAL');
    await wrapper.find('[data-testid="impact-checkbox-MILESTONE"]').setValue(true);
    await wrapper.find('#blockerTitle').setValue('Tiket Baru Uji Reset Filter');
    await wrapper.find('#blockerDesc').setValue('Deskripsi lengkap tiket baru untuk menguji reset filter dan auto-dismiss toast.');
    await wrapper.find('form.blocker-form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.toast-popup.success').exists()).toBe(true);
    vi.advanceTimersByTime(6100);
    await flushPromises();
    expect(wrapper.find('.toast-popup.success').exists()).toBe(false);

    // 3. Klik "Lihat di Blocker Saya" -> filter otomatis kembali ke "Semua" sehingga tiket OPEN baru langsung tampil!
    await wrapper.find('[data-testid="btn-view-my-blockers"]').trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-ticket-id="blk-new-open"]').exists()).toBe(true);

    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('disables modal Edit & Delete submit buttons and marks counters invalid when below minimum length', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/blockers?mine=raised')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'blk-modal-val',
                type: 'APPROVAL',
                severity: 'LOW',
                impact: 'TASK',
                impacts: ['TASK'],
                status: 'OPEN',
                ownerNeededType: 'ORGANIZATIONAL_AUTHORITY',
                description: '[Salah Konfigurasi Variabel Environment] Pemanggilan API lokal gagal karena variabel base URL belum diperbarui.',
                raisedAt: '2026-11-18T09:00:00Z',
                assignedOwner: { id: 'owner-1', fullName: 'Arif Budiman' },
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
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(RaiseBlockerView, {
      global: { plugins: [pinia, router] },
    });
    await flushPromises();
    await wrapper.find('[data-testid="tab-my-blockers"]').trigger('click');
    await flushPromises();

    // 1. Uji Modal Edit: judul 5 karakter "Salah" -> counter merah (.invalid) & Simpan Perubahan disabled
    await wrapper.find('[data-testid="edit-ticket-blk-modal-val"]').trigger('click');
    const editTitleInput = wrapper.find('#editBlockerTitle');
    await editTitleInput.setValue('Salah');
    expect(wrapper.find('[data-testid="edit-title-counter"]').classes()).toContain('invalid');
    expect((wrapper.find('[data-testid="confirm-edit-blocker"]').element as HTMLButtonElement).disabled).toBe(true);

    await editTitleInput.setValue('Judul Edit Baru Valid Minimal Sepuluh');
    expect(wrapper.find('[data-testid="edit-title-counter"]').classes()).toContain('ok');
    expect((wrapper.find('[data-testid="confirm-edit-blocker"]').element as HTMLButtonElement).disabled).toBe(false);
    await wrapper.find('[data-testid="edit-blocker-modal"] .btn-close').trigger('click');

    // 2. Uji Modal Hapus: awalnya disabled -> preset aktif -> Alasan Lainnya < 10 char disabled & counter merah
    await wrapper.find('[data-testid="delete-ticket-blk-modal-val"]').trigger('click');
    const delBtn = () => wrapper.find('[data-testid="confirm-delete-blocker"]').element as HTMLButtonElement;
    expect(delBtn().disabled).toBe(true);

    await wrapper.find('[data-testid="delete-reason-SELF_RESOLVED"]').setValue(true);
    expect(delBtn().disabled).toBe(false);

    await wrapper.find('[data-testid="delete-reason-OTHER"]').setValue(true);
    expect(delBtn().disabled).toBe(true);
    await wrapper.find('#deleteBlockerReason').setValue('Batal.');
    expect(wrapper.find('[data-testid="delete-reason-counter"]').classes()).toContain('invalid');
    expect(delBtn().disabled).toBe(true);

    await wrapper.find('#deleteBlockerReason').setValue('Kendala sudah diselesaikan melalui koordinasi tim infra pagi ini.');
    expect(wrapper.find('[data-testid="delete-reason-counter"]').classes()).toContain('ok');
    expect(delBtn().disabled).toBe(false);

    vi.unstubAllGlobals();
  });

  it('excludes INTERN users from #assignedOwner dropdown including "── Lainnya ──" group (B3)', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.includes('/v1/organization/users')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              { id: 'usr-mgr', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com', role: 'HEAD', employmentStatus: 'PERMANENT' },
              { id: 'usr-peer', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com', role: 'HRGA', employmentStatus: 'PERMANENT' },
              { id: 'usr-intern-1', fullName: 'Raka Pratama', email: 'intern.frontend@dutamedia.com', role: 'EMPLOYEE', employmentStatus: 'INTERN' },
              { id: 'usr-intern-2', fullName: 'Nisa Amelia', email: 'intern.finance@dutamedia.com', role: 'EMPLOYEE', employmentStatus: 'INTERN' },
            ],
          }),
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

    const ownerSelectText = wrapper.find('#assignedOwner').text();
    expect(ownerSelectText).toContain('Arif Budiman');
    expect(ownerSelectText).toContain('Dewi Lestari');
    expect(ownerSelectText).not.toContain('Raka Pratama');
    expect(ownerSelectText).not.toContain('Nisa Amelia');

    vi.unstubAllGlobals();
  });
});
