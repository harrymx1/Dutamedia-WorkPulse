import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MorningCommitmentView from './MorningCommitmentView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MorningCommitmentView.vue (WP-EP05-TK006 / Prototipe 02 & DEF-001 Verification)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/daily/morning', component: MorningCommitmentView },
        { path: '/daily/additional-work', component: { template: '<div>Add</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/history', component: { template: '<div>History</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
        { path: '/corrections/morning', component: { template: '<div>MorningCorrection</div>' } },
        { path: '/blockers/raise', component: { template: '<div>Raise</div>' } },
      ],
    });
  });

  it('renders Morning Commitment header and context panels', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('Morning Commitment');
    expect(wrapper.text()).toContain('Konteks Hari Ini');
    expect(wrapper.text()).toContain('Batas On-Time');
    expect(wrapper.text()).toContain('Initial Daily Status');
  });

  it('toggles zero commitment mode on checkbox check (DEC-004)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);

    await checkbox.setValue(true);
    expect(wrapper.text()).toContain('Alasan Tidak Menetapkan Komitmen');
    expect(wrapper.text()).toContain('NOT_APPLICABLE — NO_COMMITMENT');
  });

  it('allows adding commitment slots up to 3 (DEC-004)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('Daftar Komitmen Hari Ini (1/3)');

    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Slot'));
    expect(addBtn).toBeDefined();

    await addBtn?.trigger('click');
    expect(wrapper.text()).toContain('Daftar Komitmen Hari Ini (2/3)');
  });

  // =========================================================================
  // PENGUJIAN TIGA KONDISI DEF-001 (Kondisi A, B, C)
  // =========================================================================

  it('Kondisi A — Belum Submit: timestamp null, sebelum cutoff, form aktif dan submit tersedia', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null, // Belum ada record submission
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // 1. Form dapat diisi (tidak disabled)
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('disabled')).toBeUndefined();

    // 2. Tombol submit tersedia di action footer
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'));
    expect(submitBtn).toBeDefined();

    // 3. Banner terkunci tidak ditampilkan
    expect(wrapper.find('.alert-banner.submitted').exists()).toBe(false);
    expect(wrapper.text()).toContain('ON-TIME');
    expect(wrapper.text()).not.toContain('SUBMITTED (Terkunci)');
  });

  it('Kondisi B — Sudah Submit: timestamp tersedia, form terkunci dan submit tersembunyi (DEF-001)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:50',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: {
            id: 'rec-1',
            morningSubmittedAt: '2026-10-28T08:45:00.000Z', // Sudah disubmit
            initialDailyStatus: 'GREEN',
            commitments: [
              {
                taskText: 'Selesaikan sprint delivery',
                initialRisk: 'GREEN',
                referenceLink: null,
                carryOverDaysCount: 0,
              },
            ],
          },
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // 1. Banner status terkunci ditampilkan dengan benar
    expect(wrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(wrapper.text()).toContain('Morning Commitment Telah Terkunci (Baseline Locked)');
    expect(wrapper.text()).toContain('SUBMITTED (Terkunci)');

    // 2. Seluruh input tidak dapat diubah (disabled)
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('disabled')).toBeDefined();

    // 3. Tombol submit tidak tersedia (action footer disembunyikan)
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'));
    expect(submitBtn).toBeUndefined();

    // 4. Tombol tambah slot juga disembunyikan
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Slot'));
    expect(addBtn).toBeUndefined();

    // 5. Tautan ke rute koreksi resmi tersedia
    const correctionLink = wrapper.findAllComponents({ name: 'AccessLink' }).find(c => c.props('to') === '/corrections/morning');
    expect(correctionLink).toBeDefined();
  });

  it('Kondisi C — Setelah Refresh: status dimuat dari backend dan form tetap terkunci persisten', async () => {
    // Tahap 1: Memuat halaman pertama kali saat sudah disubmit
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '09:10',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: {
            id: 'rec-today-persisted',
            morningSubmittedAt: '2026-10-28T08:40:00.000Z',
            initialDailyStatus: 'AMBER',
            commitments: [
              {
                taskText: 'Investigasi blocker infrastruktur',
                initialRisk: 'AMBER',
                knownBlockerNote: 'Menunggu kredensial staging',
                carryOverDaysCount: 0,
              },
            ],
          },
          availableCarryOvers: [],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // Verifikasi kondisi awal terkunci
    expect(wrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined();
    expect(wrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'))).toBeUndefined();

    // Tahap 2: Simulasikan refresh halaman (komponen dimuat ulang dan fetch dipanggil kembali)
    const refreshedWrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Form harus tetap terkunci persisten dari data database
    expect(fetchMock).toHaveBeenCalled();
    expect(refreshedWrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(refreshedWrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(refreshedWrapper.find('textarea').attributes('disabled')).toBeDefined();
    expect(refreshedWrapper.findAll('button').find(b => b.text().includes('Kirim Morning Commitment'))).toBeUndefined();
  });

  it('renders consistent "Laporkan Blocker" button linking to /blockers/raise on workflow bar (IMP-016)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [],
        },
      }),
    }));

    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const blockerBtn = wrapper.find('[data-testid="report-blocker-btn"]');
    expect(blockerBtn.exists()).toBe(true);
    expect(blockerBtn.text()).toContain('Laporkan Blocker');
    expect(blockerBtn.attributes('href')).toBe('/blockers/raise');
  });
});
