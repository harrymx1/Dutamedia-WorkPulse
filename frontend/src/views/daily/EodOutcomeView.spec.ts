import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EodOutcomeView from './EodOutcomeView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EodOutcomeView.vue (WP-EP05-TK007 / Prototipe 04 & DEF-002 Verification)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/additional-work', component: { template: '<div>Add</div>' } },
        { path: '/daily/eod', component: EodOutcomeView },
        { path: '/daily/history', component: { template: '<div>History</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
        { path: '/corrections/eod', component: { template: '<div>EodCorrection</div>' } },
        { path: '/blockers/raise', component: { template: '<div>Raise</div>' } },
      ],
    });
  });

  it('renders EOD Outcome page and reflections panel with unconstrained GREEN option (DEC-003)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '17:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-1',
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Selesaikan implementasi EOD outcome',
                initialRisk: 'GREEN',
                carryOverDaysCount: 0,
                outcome: 'COMPLETED',
                outcomeReason: '',
                continuation: 'DO_NOT_CONTINUE',
                continuationReason: '',
              },
            ],
            additionalWorks: [],
            finalDailyStatus: 'GREEN',
            eodSubmittedAt: null, // Belum disubmit
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('EOD Outcome & Daily Reflection');
    expect(wrapper.text()).toContain('Konteks Waktu EOD');
    expect(wrapper.text()).toContain('Refleksi Mandiri Karyawan (DEC-003)');
    expect(wrapper.text()).toContain('GREEN');
    expect(wrapper.text()).toContain('AMBER');
    expect(wrapper.text()).toContain('RED');

    // Pastikan radio GREEN tidak disabled saat belum submit
    const greenRadio = wrapper.find('input[type="radio"][value="GREEN"]');
    expect(greenRadio.exists()).toBe(true);
    expect(greenRadio.attributes('disabled')).toBeUndefined();
  });

  // =========================================================================
  // PENGUJIAN TIGA KONDISI DEF-002 (Kondisi A, B, C)
  // =========================================================================

  it('Kondisi A — Belum Submit: timestamp null, sebelum cutoff, evaluasi dapat diisi dan submit tersedia', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '17:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-1',
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Menyusun dokumentasi arsitektur',
                initialRisk: 'GREEN',
                outcome: 'COMPLETED',
                continuation: 'DO_NOT_CONTINUE',
              },
            ],
            additionalWorks: [],
            eodSubmittedAt: null, // Belum submit EOD
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // 1. Kontrol outcome dan refleksi dapat diubah (tidak disabled)
    const outcomeRadio = wrapper.find('input[name="outcome-c-1"]');
    expect(outcomeRadio.exists()).toBe(true);
    expect(outcomeRadio.attributes('disabled')).toBeUndefined();

    const greenRadio = wrapper.find('input[type="radio"][value="GREEN"]');
    expect(greenRadio.attributes('disabled')).toBeUndefined();

    // 2. Tombol submit tersedia
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Kirim Evaluasi EOD'));
    expect(submitBtn).toBeDefined();

    // 3. Banner terkunci tidak ditampilkan
    expect(wrapper.find('.alert-banner.submitted').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('SUBMITTED (Terkunci)');
  });

  it('Kondisi B — Sudah Submit: timestamp tersedia, form terkunci dan submit tersembunyi (DEF-002)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '18:15',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-1',
            eodSubmittedAt: '2026-10-28T17:45:00.000Z', // Sudah submit
            finalDailyStatus: 'GREEN',
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Selesaikan implementasi EOD outcome',
                initialRisk: 'GREEN',
                outcome: 'COMPLETED',
                outcomeReason: '',
                continuation: 'DO_NOT_CONTINUE',
                continuationReason: '',
              },
            ],
            additionalWorks: [],
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    // 1. Banner status EOD Closed ditampilkan
    expect(wrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(wrapper.text()).toContain('Evaluasi EOD Telah Terkunci (EOD Closed)');
    expect(wrapper.text()).toContain('SUBMITTED (Terkunci)');

    // 2. Seluruh input outcome dan radio refleksi disabled
    const outcomeRadio = wrapper.find('input[name="outcome-c-1"]');
    expect(outcomeRadio.attributes('disabled')).toBeDefined();

    const greenRadio = wrapper.find('input[type="radio"][value="GREEN"]');
    expect(greenRadio.attributes('disabled')).toBeDefined();

    // 3. Action footer dan tombol submit disembunyikan
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Kirim Evaluasi EOD'));
    expect(submitBtn).toBeUndefined();

    // 4. Tautan permohonan koreksi EOD resmi tersedia
    const correctionLink = wrapper.findAllComponents({ name: 'AccessLink' }).find(c => c.props('to') === '/corrections/eod');
    expect(correctionLink).toBeDefined();
  });

  it('Kondisi C — Setelah Refresh: status dimuat dari backend dan form tetap terkunci persisten', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '18:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-eod-persisted',
            eodSubmittedAt: '2026-10-28T17:55:00.000Z', // Persisten dari backend
            finalDailyStatus: 'AMBER',
            commitments: [
              {
                id: 'c-persisted-1',
                sequenceNo: 1,
                taskText: 'Menyelesaikan integrasi gateway',
                initialRisk: 'AMBER',
                outcome: 'PARTIALLY_COMPLETED',
                continuation: 'CONTINUE',
                continuationReason: 'Lanjut esok pagi',
              },
            ],
            additionalWorks: [],
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(wrapper.find('input[name="outcome-c-persisted-1"]').attributes('disabled')).toBeDefined();
    expect(wrapper.findAll('button').find(b => b.text().includes('Kirim Evaluasi EOD'))).toBeUndefined();

    // Simulasikan reload halaman
    const refreshedWrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Form tetap terkunci persisten dari data database
    expect(fetchMock).toHaveBeenCalled();
    expect(refreshedWrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(refreshedWrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(refreshedWrapper.find('input[name="outcome-c-persisted-1"]').attributes('disabled')).toBeDefined();
    expect(refreshedWrapper.findAll('button').find(b => b.text().includes('Kirim Evaluasi EOD'))).toBeUndefined();
  });

  it('renders consistent "Laporkan Blocker" button linking to /blockers/raise on workflow bar (IMP-016)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '17:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-1',
            commitments: [],
            additionalWorks: [],
            eodSubmittedAt: null,
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const blockerBtn = wrapper.find('[data-testid="report-blocker-btn"]');
    expect(blockerBtn.exists()).toBe(true);
    expect(blockerBtn.text()).toContain('Laporkan Blocker');
    expect(blockerBtn.attributes('href')).toBe('/blockers/raise');
    // Verifikasi tombol blocker pop-up lama di heading sudah tidak ada
    expect(wrapper.find('.blocker-cta').exists()).toBe(false);
  });
});
