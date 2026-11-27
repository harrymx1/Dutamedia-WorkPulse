import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import MorningCorrectionRequestView from './MorningCorrectionRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MorningCorrectionRequestView.vue (WP-EP09 / Prototipe 16a - Koreksi Komitmen Pagi)', () => {
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
                    taskText: 'Menyelesaikan endpoint authenikasi',
                    initialRisk: 'GREEN',
                    referenceLink: null,
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
              id: 'cr-1',
              classification: 'MINOR',
              reason: 'Perbaikan typo kata autentikasi',
              status: 'AUTO_APPLIED',
              valueBefore: { taskText: 'Menyelesaikan endpoint authenikasi' },
              valueRequested: { taskText: 'Menyelesaikan endpoint autentikasi' },
              createdAt: '2026-10-28T10:00:00.000Z',
            },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/corrections/morning', component: MorningCorrectionRequestView },
        { path: '/corrections/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      ],
    });
  });

  it('renders comparative form with locked baseline snapshot and classification choices', async () => {
    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Permohonan Koreksi Komitmen Pagi');
    expect(wrapper.text()).toContain('Komitmen Awal Tersimpan (Terkunci)');
    expect(wrapper.text()).toContain('Menyelesaikan endpoint authenikasi');
    expect(wrapper.text()).toContain('Perubahan Minor');
    expect(wrapper.text()).toContain('Perubahan Material');
    expect(wrapper.text()).toContain('Diterapkan Otomatis');
    expect(wrapper.text()).not.toContain('AUTO_APPLIED');
    expect(wrapper.text()).not.toContain('Anti-Backdating');
    expect(wrapper.text()).not.toContain('append-only');

    const firstOption = wrapper.find('#comSelect option');
    expect(firstOption.text()).toContain('GREEN (Lancar)');
  });

  it('filters out EOD_OUTCOME entries from morning correction history', async () => {
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
                    taskText: 'Menyelesaikan endpoint authenikasi',
                    initialRisk: 'GREEN',
                    referenceLink: null,
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
              id: 'cr-morning',
              scopeType: 'MORNING_COMMITMENT',
              classification: 'MINOR',
              reason: 'Perbaikan typo kata autentikasi',
              status: 'AUTO_APPLIED',
              valueBefore: { taskText: 'Menyelesaikan endpoint authenikasi' },
              valueRequested: { taskText: 'Menyelesaikan endpoint autentikasi' },
              createdAt: '2026-11-19T08:00:00.000Z',
            },
            {
              id: 'cr-eod',
              scopeType: 'EOD_OUTCOME',
              classification: 'MATERIAL',
              reason: 'Lupa input EOD',
              status: 'REJECTED',
              valueBefore: { outcome: 'COMPLETED' },
              valueRequested: { outcome: 'DONE' },
              createdAt: '2026-11-19T08:10:00.000Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Perbaikan typo kata autentikasi');
    expect(wrapper.text()).not.toContain('Lupa input EOD');
    expect(wrapper.text()).not.toContain('"outcome"');
  });

  it('applies rejected styling class to reviewer note on REJECTED morning correction cards', async () => {
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
                    taskText: 'Menyelesaikan endpoint autentikasi',
                    initialRisk: 'GREEN',
                    referenceLink: null,
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
              id: 'cr-rej',
              scopeType: 'MORNING_COMMITMENT',
              classification: 'MATERIAL',
              reason: 'Naik risiko ke RED',
              status: 'REJECTED',
              reviewNote: 'Wajib lampirkan nomor tiket blocker aktif.',
              valueBefore: { taskText: 'Tugas Lama' },
              valueRequested: { taskText: 'Tugas Baru' },
              createdAt: '2026-11-19T08:00:00.000Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const reviewNoteBox = wrapper.find('.hist-review-note');
    expect(reviewNoteBox.exists()).toBe(true);
    expect(reviewNoteBox.classes()).toContain('rejected');
    expect(reviewNoteBox.text()).toContain('Wajib lampirkan nomor tiket blocker aktif.');
  });

  it('renders context switcher tabs, live reason counter, Reset Isian button, and blocks unchanged submissions', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
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
                    taskText: 'Menyelesaikan endpoint autentikasi',
                    initialRisk: 'GREEN',
                    referenceLink: 'https://github.com/dutamedia/pr/10',
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

    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Koreksi Komitmen Pagi');
    expect(wrapper.text()).toContain('Koreksi Evaluasi Sore (EOD)');
    expect(wrapper.find('.char-counter').text()).toContain('0 / 10 karakter minimum');

    await wrapper.find('#reasonInput').setValue('Mencoba kirim tanpa mengubah satu data pun');
    expect(wrapper.find('.char-counter').text()).toContain('Alasan memenuhi syarat');

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('.toast-popup.error').text()).toContain(
      'Perubahan yang diajukan masih sama dengan data komitmen saat ini.',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await wrapper.find('#newTaskInput').setValue('Teks sementara yang belum dikirim');
    await wrapper.find('.btn-reset').trigger('click');
    expect((wrapper.find('#newTaskInput').element as HTMLTextAreaElement).value).toBe(
      'Menyelesaikan endpoint autentikasi',
    );
    expect((wrapper.find('#reasonInput').element as HTMLTextAreaElement).value).toBe('');
  });

  it('displays in-flight banner for PENDING commitment and post-rejection prefill + extra diff details', async () => {
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
                    taskText: 'Tugas Pertama',
                    initialRisk: 'GREEN',
                    referenceLink: null,
                  },
                  {
                    id: 'com-2',
                    sequenceNo: 2,
                    taskText: 'Tugas Kedua',
                    initialRisk: 'GREEN',
                    referenceLink: null,
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
              id: 'cr-pending',
              targetCommitmentId: 'com-1',
              scopeType: 'MORNING_COMMITMENT',
              classification: 'MATERIAL',
              reason: 'Menyesuaikan prioritas insiden produksi',
              status: 'PENDING',
              objectionWindowEndsAt: '2026-11-23T09:00:00.000Z',
              valueBefore: { taskText: 'Tugas Pertama', initialRisk: 'GREEN', referenceLink: null },
              valueRequested: { taskText: 'Tugas Pertama Darurat', initialRisk: 'RED', referenceLink: 'https://github.com/pr/99' },
              createdAt: '2026-11-22T08:00:00.000Z',
            },
            {
              id: 'cr-rejected',
              targetCommitmentId: 'com-2',
              scopeType: 'MORNING_COMMITMENT',
              classification: 'MATERIAL',
              reason: 'Ganti target kedua menjadi riset UI',
              status: 'REJECTED',
              reviewNote: 'Lampirkan nomor tiket terlebih dahulu.',
              reviewedByUser: { fullName: 'Arif Budiman' },
              valueBefore: { taskText: 'Tugas Kedua', initialRisk: 'GREEN', referenceLink: null },
              valueRequested: { taskText: 'Tugas Kedua Revisi', initialRisk: 'AMBER', referenceLink: 'https://github.com/pr/55' },
              createdAt: '2026-11-22T07:30:00.000Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    // Slot 1 sedang PENDING -> banner in-flight tampil & tombol submit disabled
    expect(wrapper.find('.in-flight-banner').exists()).toBe(true);
    expect((wrapper.find('.btn-submit').element as HTMLButtonElement).disabled).toBe(true);
    expect(wrapper.text()).toContain('Komitmen #1');
    expect(wrapper.text()).toContain('Komitmen #2');
    expect(wrapper.text()).toContain('Tingkat Risiko:');
    expect(wrapper.text()).toContain('Tautan Referensi:');
    expect(wrapper.text()).toContain('Catatan Peninjau (Arif Budiman):');
    expect(wrapper.text()).toContain('Batas Waktu Tinjauan 24 Jam:');

    // Tombol revisi langsung tersedia di kartu REJECTED panel kanan meskipun dropdown kiri masih di Slot 1
    const rightCardPrefillBtn = wrapper.find('[data-testid="prefill-rejected-cr-rejected"]');
    expect(rightCardPrefillBtn.exists()).toBe(true);
    await rightCardPrefillBtn.trigger('click');

    // Otomatis pindah ke Slot 2 (com-2), menampilkan banner arahan, dan memuat draf sebelumnya
    expect((wrapper.find('#comSelect').element as HTMLSelectElement).value).toBe('com-2');
    expect(wrapper.find('.in-flight-banner').exists()).toBe(false);
    expect(wrapper.find('.post-objection-banner').exists()).toBe(true);
    expect((wrapper.find('#newTaskInput').element as HTMLTextAreaElement).value).toBe('Tugas Kedua Revisi');
    expect((wrapper.find('#newLinkInput').element as HTMLInputElement).value).toBe('https://github.com/pr/55');

    // Tombol duplikat berganti menjadi status konfirmasi bahwa draf sudah dimuat
    expect(wrapper.find('[data-testid="banner-prefill-rejected-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="banner-prefill-loaded-badge"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="prefill-rejected-cr-rejected"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="prefill-loaded-cr-rejected"]').exists()).toBe(true);

    // Reset Isian mengembalikan tombol Gunakan Draf Sebelumnya & Sesuaikan
    await wrapper.find('.btn-reset').trigger('click');
    expect(wrapper.find('[data-testid="banner-prefill-rejected-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="prefill-rejected-cr-rejected"]').exists()).toBe(true);
  });

  it('truncates long commitment titles inside dropdown options while preserving full text in the locked snapshot', async () => {
    const longTask =
      'Menyelesaikan implementasi komponen antarmuka navigasi mobile responsif lintas lima ukuran layar desktop dan seluler';
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
                    id: 'com-long-1',
                    sequenceNo: 1,
                    taskText: longTask,
                    initialRisk: 'GREEN',
                    referenceLink: null,
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

    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    const optText = wrapper.find('#comSelect option').text();
    expect(optText).toContain('…');
    expect(optText.length).toBeLessThan(85);
    expect(wrapper.find('.base-task').text()).toBe(longTask);
  });

  it('locks risk selection on MINOR and enforces DEC-020/021 blocker + risk note fields on MATERIAL RED/AMBER corrections', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: any) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              availableProjects: [
                { projectCode: 'WP-CORE', projectName: 'WorkPulse Platform Core' },
              ],
              activeBlockers: [
                {
                  id: 'blk-staging-1',
                  code: '#BLK-STG01',
                  description: 'Server staging Nginx error 502',
                  severity: 'HIGH',
                  status: 'OPEN',
                },
              ],
              record: {
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Implementasi modul laporan eksekutif',
                    projectCode: null,
                    initialRisk: 'GREEN',
                    referenceLink: null,
                  },
                ],
              },
            },
          }),
        });
      }
      if (url.includes('/correction-requests') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { id: 'cr-new', status: 'PENDING' },
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

    const wrapper = mount(MorningCorrectionRequestView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    // 1. Default MINOR locks risk radios
    const redRadio = wrapper.find('input[type="radio"][value="RED"]');
    const amberRadio = wrapper.find('input[type="radio"][value="AMBER"]');
    expect((redRadio.element as HTMLInputElement).disabled).toBe(true);
    expect((amberRadio.element as HTMLInputElement).disabled).toBe(true);

    // 2. Switch to MATERIAL -> unlocks risk radios
    await wrapper.find('input[type="radio"][value="MATERIAL"]').setValue(true);
    expect((redRadio.element as HTMLInputElement).disabled).toBe(false);

    // 3. Select AMBER without knownBlockerNote -> blocked client-side
    await amberRadio.setValue(true);
    expect(wrapper.find('[data-testid="correction-risk-details"]').exists()).toBe(true);
    await wrapper.find('#reasonInput').setValue('Ada kendala teknis pada lingkungan pengujian.');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(wrapper.find('.toast-popup.error').text()).toContain('AMBER wajib menyertakan uraian potensi kendala');

    // 4. Select RED without linkedBlockerId -> blocked client-side (DEC-020)
    await redRadio.setValue(true);
    await wrapper.find('#newKnownBlockerNoteInput').setValue('Server staging 502 sejak pagi.');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(wrapper.find('.toast-popup.error').text()).toContain('RED wajib menautkan tiket Blocker aktif');

    // 5. Fill active blocker, project, and support -> submits full payload cleanly
    await wrapper.find('#newProjectSelect').setValue('WP-CORE');
    await wrapper.find('[data-testid="correction-blocker-select"]').setValue('blk-staging-1');
    await wrapper.find('#newSupportNeededInput').setValue('Mohon restart container Nginx staging.');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const postCall = fetchMock.mock.calls.find(
      ([u, init]) => String(u).includes('/correction-requests') && init?.method === 'POST',
    );
    expect(postCall).toBeDefined();
    const sentBody = JSON.parse(postCall![1].body);
    expect(sentBody.requestedChange).toEqual(
      expect.objectContaining({
        projectCode: 'WP-CORE',
        initialRisk: 'RED',
        linkedBlockerId: 'blk-staging-1',
        knownBlockerNote: 'Server staging 502 sejak pagi.',
        supportNeeded: 'Mohon restart container Nginx staging.',
      }),
    );
  });
});

