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
        { path: '/raise-blockers', component: { template: '<div>Raise</div>' } },
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
    expect(wrapper.text()).toContain('Refleksi Mandiri Akhir Hari');
    expect(wrapper.text()).toContain('GREEN');
    expect(wrapper.text()).toContain('AMBER');
    expect(wrapper.text()).toContain('RED');

    // Pastikan radio GREEN tidak disabled saat belum submit
    const greenRadio = wrapper.find('input[type="radio"][value="GREEN"]');
    expect(greenRadio.exists()).toBe(true);
    expect(greenRadio.attributes('disabled')).toBeUndefined();
  });

  it('renders restructured and decluttered context metric cards with dynamic date badge (IMP-033)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-30',
          currentTime: '16:45',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-context-test',
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Menyelesaikan modul reporting',
                initialRisk: 'GREEN',
              },
              {
                id: 'c-2',
                sequenceNo: 2,
                taskText: 'Review PR frontend',
                initialRisk: 'GREEN',
              },
            ],
            additionalWorks: [
              {
                id: 'aw-1',
                taskText: 'Investigasi insiden production bug',
              },
            ],
            finalDailyStatus: 'GREEN',
            eodSubmittedAt: null,
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Dynamic date badge in panel head
    const dateBadge = wrapper.find('[data-testid="context-date-badge"]');
    expect(dateBadge.exists()).toBe(true);
    expect(dateBadge.text()).toContain('Oktober 2026');

    // Context Card 1: On-Time Cut-off
    const onTimeCard = wrapper.find('[data-testid="context-item-ontime"]');
    expect(onTimeCard.exists()).toBe(true);
    expect(onTimeCard.text()).toContain('Batas On-Time');
    expect(onTimeCard.text()).toContain('17:00 WIB');

    // Context Card 2: Lock Cut-off
    const cutOffCard = wrapper.find('[data-testid="context-item-cutoff"]');
    expect(cutOffCard.exists()).toBe(true);
    expect(cutOffCard.text()).toContain('Batas Cut-Off');
    expect(cutOffCard.text()).toContain('21:00 WIB');

    // Context Card 3: Time status
    const timeStatusCard = wrapper.find('[data-testid="context-item-time-status"]');
    expect(timeStatusCard.exists()).toBe(true);
    expect(timeStatusCard.text()).toContain('Status Waktu');
    expect(timeStatusCard.text()).toContain('ON-TIME');

    // Context Card 4: Evaluation total items (2 commitments + 1 additional work = 3)
    const evalCountCard = wrapper.find('[data-testid="context-item-eval-count"]');
    expect(evalCountCard.exists()).toBe(true);
    expect(evalCountCard.text()).toContain('Total Item Evaluasi');
    expect(evalCountCard.text()).toContain('3 Tugas');

    // Redundant text 'Tanggal Kerja' should not exist in the context grid
    const contextGrid = wrapper.find('.context-grid');
    expect(contextGrid.text()).not.toContain('Tanggal Kerja');
  });

  it('eliminates internal design code (Prototipe 04) from page subtitle (IMP-034)', async () => {
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

    const subtitle = wrapper.find('[data-testid="eod-subtitle"]');
    expect(subtitle.exists()).toBe(true);
    expect(subtitle.text()).toBe(
      'Evaluasi capaian nyata komitmen harian Anda di akhir jam kerja. Lakukan refleksi mandiri secara transparan dan tentukan tindak lanjut tugas secara akuntabel.',
    );
    expect(subtitle.text()).not.toContain('Prototipe 04');
    expect(wrapper.text()).not.toContain('Prototipe 04');
  });

  it('eliminates architecture code DEC-003 and legalistic jargon from self-reflection section (IMP-035)', async () => {
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

    // Kicker & Badge checks
    expect(wrapper.text()).toContain('Refleksi Mandiri Akhir Hari');
    expect(wrapper.text()).toContain('Penilaian Otonom Karyawan');

    // Reflection description check
    const reflectionDesc = wrapper.find('.reflection-desc');
    expect(reflectionDesc.exists()).toBe(true);
    expect(reflectionDesc.text()).toBe(
      'Bagaimana penilaian mandiri Anda terhadap pencapaian kerja secara keseluruhan hari ini? Anda memiliki hak penuh untuk menentukan status refleksi hari ini secara jujur dan transparan demi pembelajaran bersama tim.',
    );

    // Absolute elimination of internal architecture code and punitive wording
    expect(wrapper.text()).not.toContain('DEC-003');
    expect(wrapper.text()).not.toContain('secara punitif');
    expect(wrapper.text()).not.toContain('Proteksi Hak Opsi GREEN');
  });

  it('eliminates raw database enum codes from evaluation options and labels (IMP-036)', async () => {
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
              { id: 'c-1', taskText: 'Task 1', outcome: 'NOT_COMPLETED', outcomeReason: '', continuation: 'CONTINUE', continuationReason: '' },
            ],
            additionalWorks: [
              { id: 'w-1', taskText: 'Add Work 1', reason: 'NEWLY_ASSIGNED', outcome: 'COMPLETED' },
            ],
            eodSubmittedAt: null,
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Outcome options for commitment
    const outcomeOptions = wrapper.find('.outcome-options');
    expect(outcomeOptions.text()).toContain('Selesai');
    expect(outcomeOptions.text()).toContain('Sebagian');
    expect(outcomeOptions.text()).toContain('Belum Selesai');
    expect(outcomeOptions.text()).toContain('Dibatalkan');

    // No raw enum text in outcome options
    expect(outcomeOptions.text()).not.toContain('(COMPLETED)');
    expect(outcomeOptions.text()).not.toContain('(PARTIALLY)');
    expect(outcomeOptions.text()).not.toContain('(NOT_COMPLETED)');
    expect(outcomeOptions.text()).not.toContain('(CANCELLED)');

    // Continuation options for not completed commitment
    const continuationOptions = wrapper.find('.continuation-options');
    expect(continuationOptions.exists()).toBe(true);
    expect(continuationOptions.text()).toContain('Lanjutkan Besok (Tugas Berlanjut)');
    expect(continuationOptions.text()).toContain('Tidak Dilanjutkan');

    // No raw enum text in continuation options
    expect(continuationOptions.text()).not.toContain('CONTINUE');
    expect(continuationOptions.text()).not.toContain('Carry-Over');
    expect(continuationOptions.text()).not.toContain('DO_NOT_CONTINUE');

    // Clean headings without english parenthesized descriptions
    expect(wrapper.text()).not.toContain('(Continuation Decision)');
    expect(wrapper.text()).not.toContain('(Continuation Reason)');
  });

  it('renders continuation reason textarea with full-width layout container (IMP-037)', async () => {
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
              { id: 'c-1', taskText: 'Task 1', outcome: 'NOT_COMPLETED', outcomeReason: '', continuation: 'CONTINUE', continuationReason: 'Rencana tindak lanjut besok pagi' },
            ],
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

    const reasonGroup = wrapper.find('.continuation-reason-group');
    expect(reasonGroup.exists()).toBe(true);

    const label = reasonGroup.find('label.form-label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('Catatan Kelanjutan *');

    const textarea = reasonGroup.find('textarea.input-control');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes('placeholder')).toBe('Jelaskan progres sisa dan rencana penuntasan besok...');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Rencana tindak lanjut besok pagi');
  });

  it('provides complete evaluation capabilities for additional work including cancellation and continuation (IMP-038)', async () => {
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
            additionalWorks: [
              {
                id: 'w-1',
                taskText: 'Perbaikan bug login',
                reason: 'OPERATIONAL_INCIDENT',
                outcome: 'PARTIALLY_COMPLETED',
                outcomeReason: '',
                continuation: 'CONTINUE',
                continuationReason: 'Lanjut selesaikan hotfix besok',
              },
              {
                id: 'w-2',
                taskText: 'Riset library PDF',
                reason: 'NEWLY_ASSIGNED',
                outcome: 'CANCELLED',
                outcomeReason: 'Dibatalkan karena prioritas berubah',
                continuation: 'DO_NOT_CONTINUE',
                continuationReason: '',
              },
            ],
            eodSubmittedAt: null,
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Check additional works eval list exists
    const evalList = wrapper.find('.eval-list');
    expect(evalList.exists()).toBe(true);

    // w-1 checks (PARTIALLY_COMPLETED with CONTINUE)
    expect(evalList.text()).toContain('Perbaikan bug login');
    expect(evalList.text()).toContain('Lanjutkan Besok (Tugas Berlanjut)');
    expect(evalList.text()).toContain('Catatan Kelanjutan *');
    const contTextarea = evalList.find('textarea[placeholder="Jelaskan progres sisa dan rencana penuntasan besok..."]');
    expect(contTextarea.exists()).toBe(true);
    expect((contTextarea.element as HTMLTextAreaElement).value).toBe('Lanjut selesaikan hotfix besok');

    // w-2 checks (CANCELLED)
    expect(evalList.text()).toContain('Riset library PDF');
    expect(evalList.text()).toContain('Alasan Pembatalan Pekerjaan Tambahan *');
    const cancelTextarea = evalList.find('textarea[placeholder="Jelaskan alasan mengapa pekerjaan tambahan ini dibatalkan hari ini..."]');
    expect(cancelTextarea.exists()).toBe(true);
    expect((cancelTextarea.element as HTMLTextAreaElement).value).toBe('Dibatalkan karena prioritas berubah');

    // Radio inputs exist
    const cancelledRadio = wrapper.find('input[name="w-outcome-w-2"][value="CANCELLED"]');
    expect(cancelledRadio.exists()).toBe(true);

    // Verify reason badges are formatted to human-friendly business language (IMP-039)
    expect(evalList.text()).toContain('Perbaikan Error / Bug Kritis');
    expect(evalList.text()).toContain('Penugasan Baru Atasan');
    expect(evalList.text()).not.toContain('OPERATIONAL_INCIDENT');
    expect(evalList.text()).not.toContain('NEWLY_ASSIGNED');
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
    expect(blockerBtn.attributes('href')).toBe('/raise-blockers');
    // Verifikasi tombol blocker pop-up lama di heading sudah tidak ada
    expect(wrapper.find('.blocker-cta').exists()).toBe(false);
  });

  it('eliminates dead instant blocker modal markup and directs to dedicated /raise-blockers page (IMP-040)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-04',
          currentTime: '16:45',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-test-imp040',
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

    // Navigasi blocker terpusat ke halaman dedicated /raise-blockers
    const blockerBtn = wrapper.find('[data-testid="report-blocker-btn"]');
    expect(blockerBtn.exists()).toBe(true);
    expect(blockerBtn.attributes('href')).toBe('/raise-blockers');

    // Modal backdrop instan yang redundan sudah sepenuhnya dieliminasi
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
    expect(wrapper.find('.modal-box').exists()).toBe(false);
    expect(wrapper.find('form.modal-form').exists()).toBe(false);
  });
});
