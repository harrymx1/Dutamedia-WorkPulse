import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EodCorrectionRequestView from './EodCorrectionRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EodCorrectionRequestView.vue (WP-EP09 / Prototipe 16b - Koreksi Evaluasi Sore EOD)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Deployment staging environment',
                    outcome: 'BLOCKED',
                    outcomeReason: 'Server memory penuh',
                    continuation: 'CONTINUE_TOMORROW',
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/corrections/eod', component: EodCorrectionRequestView },
        { path: '/corrections/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      ],
    });
  });

  it('renders EOD baseline and outcome selection choices without green lock (DEC-003)', async () => {
    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Permohonan Koreksi Evaluasi Sore (EOD)');
    expect(wrapper.text()).toContain('Baseline EOD Tersimpan');
    expect(wrapper.text()).toContain('Deployment staging environment');
    expect(wrapper.text()).toContain('DONE (Tuntas)');
    expect(wrapper.text()).toContain('IN_PROGRESS');
    expect(wrapper.text()).toContain('BLOCKED');
  });

  it('shows empty state card when user has no commitments today', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { record: null },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Tidak Ada Komitmen Hari Ini');
    expect(wrapper.text()).toContain('Buka Morning Commitment');
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('maps DB outcome/continuation enums to form controls and renders reviewer notes in history', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Perbaikan pipeline CI',
                    outcome: 'NOT_COMPLETED',
                    outcomeReason: 'Sertifikat runner kedaluwarsa',
                    continuation: 'CONTINUE',
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'cr-eod-rej',
              scopeType: 'EOD_OUTCOME',
              classification: 'MATERIAL',
              reason: 'Usul dibatalkan',
              status: 'REJECTED',
              reviewNote: 'Tugas tetap harus dikerjakan.',
              valueBefore: { outcome: 'NOT_COMPLETED' },
              valueRequested: { outcome: 'DROPPED' },
              createdAt: '2026-11-19T12:00:00.000Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const blockedRadio = wrapper.find('input[type="radio"][value="BLOCKED"]') as any;
    const continuationSelect = wrapper.find('#continuationSelect') as any;
    expect((blockedRadio.element as HTMLInputElement).checked).toBe(true);
    expect((continuationSelect.element as HTMLSelectElement).value).toBe('CONTINUE_TOMORROW');

    const reviewNoteBox = wrapper.find('.hist-review-note.rejected');
    expect(reviewNoteBox.exists()).toBe(true);
    expect(reviewNoteBox.text()).toContain('Tugas tetap harus dikerjakan.');
  });

  it('shows Belum Ada Evaluasi Sore Hari Ini guard when morning exists without submitted EOD', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              cutoffTimings: { eodLockCutoff: '20:30' },
              record: {
                eodSubmittedAt: null,
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Menyelesaikan API autentikasi',
                    outcome: null,
                    continuation: null,
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Belum Ada Evaluasi Sore Hari Ini');
    expect(wrapper.text()).toContain('Buka Evaluasi Sore (EOD)');
    expect(wrapper.text()).toContain('20:30 WIB');
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('renders context tabs, live reason counter, Reset Isian, and blocks unchanged EOD submission', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              cutoffTimings: { eodLockCutoff: '21:15' },
              record: {
                eodSubmittedAt: '2026-11-22T10:15:00.000Z',
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Integrasi halaman EOD',
                    outcome: 'PARTIALLY_COMPLETED',
                    outcomeReason: 'Menunggu review akhir.',
                    continuation: 'CONTINUE',
                  },
                ],
              },
            },
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

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Koreksi Komitmen Pagi');
    expect(wrapper.text()).toContain('Koreksi Evaluasi Sore (EOD)');
    expect(wrapper.text()).toContain('21:15 WIB');
    expect(wrapper.text()).toContain('IN_PROGRESS (Sebagian)');
    expect(wrapper.find('.char-counter').text()).toContain('0 / 10 karakter minimum');

    await wrapper.find('#eodReasonInput').setValue('Mencoba kirim tanpa mengubah hasil EOD.');
    expect(wrapper.find('.char-counter').text()).toContain('Alasan memenuhi syarat');

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('.toast-popup.error').text()).toContain(
      'Perubahan yang diajukan masih sama dengan data evaluasi sore saat ini.',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await wrapper.find('#outcomeReasonInput').setValue('Ubah catatan sementara');
    await wrapper.find('.btn-reset').trigger('click');
    expect((wrapper.find('#outcomeReasonInput').element as HTMLTextAreaElement).value).toBe(
      'Menunggu review akhir.',
    );
    expect((wrapper.find('#eodReasonInput').element as HTMLTextAreaElement).value).toBe('');
  });

  it('displays in-flight banner for PENDING task, post-rejection prefill, and enriched history diffs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              cutoffTimings: { eodLockCutoff: '21:00' },
              record: {
                eodSubmittedAt: '2026-11-22T10:15:00.000Z',
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Tugas EOD Pertama',
                    outcome: 'NOT_COMPLETED',
                    outcomeReason: 'Server masih restart',
                    continuation: 'CONTINUE',
                  },
                  {
                    id: 'com-2',
                    sequenceNo: 2,
                    taskText: 'Tugas EOD Kedua',
                    outcome: 'PARTIALLY_COMPLETED',
                    outcomeReason: 'Kurang test integrasi',
                    continuation: 'CONTINUE',
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'cr-eod-pending',
              targetCommitmentId: 'com-1',
              scopeType: 'EOD_OUTCOME',
              classification: 'MATERIAL',
              reason: 'Update ke selesai setelah server pulih',
              status: 'PENDING',
              objectionWindowEndsAt: '2026-11-23T10:00:00.000Z',
              valueBefore: {
                outcome: 'NOT_COMPLETED',
                outcomeReason: 'Server masih restart',
                continuation: 'CONTINUE',
              },
              valueRequested: {
                outcome: 'DONE',
                outcomeReason: 'Server pulih dan deploy sukses.',
                continuation: 'ARCHIVE',
              },
              createdAt: '2026-11-22T10:30:00.000Z',
            },
            {
              id: 'cr-eod-rejected',
              targetCommitmentId: 'com-2',
              scopeType: 'EOD_OUTCOME',
              classification: 'MATERIAL',
              reason: 'Ajukan ulang status tuntas',
              status: 'REJECTED',
              reviewNote: 'Lampirkan tautan hasil pengujian integrasi.',
              reviewedByUser: { fullName: 'Arif Budiman' },
              valueBefore: {
                outcome: 'PARTIALLY_COMPLETED',
                outcomeReason: 'Kurang test integrasi',
                continuation: 'CONTINUE',
              },
              valueRequested: {
                outcome: 'DONE',
                outcomeReason: 'Semua test lulus',
                continuation: 'ARCHIVE',
              },
              createdAt: '2026-11-22T09:30:00.000Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.find('.in-flight-banner').exists()).toBe(true);
    expect((wrapper.find('.btn-submit').element as HTMLButtonElement).disabled).toBe(true);
    expect(wrapper.text()).toContain('Tugas #1');
    expect(wrapper.text()).toContain('Tugas #2');
    expect(wrapper.text()).toContain('BLOCKED (Terhambat)');
    expect(wrapper.text()).toContain('DONE (Tuntas)');
    expect(wrapper.text()).toContain('Kelanjutan Tugas:');
    expect(wrapper.text()).toContain('Keterangan Hasil:');
    expect(wrapper.text()).toContain('Batas Waktu Tinjauan 24 Jam:');
    expect(wrapper.text()).toContain('Catatan Peninjau (Arif Budiman):');

    await wrapper.find('#eodSelect').setValue('com-2');
    expect(wrapper.find('.in-flight-banner').exists()).toBe(false);
    expect(wrapper.find('.post-objection-banner').exists()).toBe(true);

    await wrapper.find('.btn-prefill-revision').trigger('click');
    expect((wrapper.find('input[type="radio"][value="DONE"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.find('#outcomeReasonInput').element as HTMLTextAreaElement).value).toBe('Semua test lulus');
    expect((wrapper.find('#continuationSelect').element as HTMLSelectElement).value).toBe('ARCHIVE');
  });
});

