import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EodOutcomeView from './EodOutcomeView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EodOutcomeView.vue (WP-EP05-TK007 / Prototipe 04 & DEF-002 Verification)', () => {
  let router: any;

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
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
    expect(label.text()).toBe('Catatan Kelanjutan (Opsional)');

    const textarea = reasonGroup.find('textarea.input-control');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes('placeholder')).toBe('Opsional: catatan progres sisa atau rencana penuntasan untuk pengingat besok pagi...');
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
    expect(evalList.text()).toContain('Catatan Kelanjutan (Opsional)');
    const contTextarea = evalList.find('textarea[placeholder="Opsional: catatan progres sisa atau rencana penuntasan untuk pengingat besok pagi..."]');
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

    // 2. Tampilan berubah menjadi Read-Only Summary View (input radio/textarea form tidak lagi dirender)
    expect(wrapper.find('input[name="outcome-c-1"]').exists()).toBe(false);
    expect(wrapper.find('input[type="radio"][value="GREEN"]').exists()).toBe(false);
    expect(wrapper.find('#tomorrow-priority-input').exists()).toBe(false);
    expect(wrapper.findAll('.eod-summary-card').length).toBe(1);
    expect(wrapper.find('.final-status-summary-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Selesai Penuh');

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
    expect(wrapper.find('input[name="outcome-c-persisted-1"]').exists()).toBe(false);
    expect(wrapper.findAll('.eod-summary-card').length).toBe(1);
    expect(wrapper.findAll('button').find(b => b.text().includes('Kirim Evaluasi EOD'))).toBeUndefined();

    // Simulasikan reload halaman
    const refreshedWrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Form tetap terkunci persisten dari data database dalam bentuk Read-Only Summary View
    expect(fetchMock).toHaveBeenCalled();
    expect(refreshedWrapper.text()).toContain('SUBMITTED (Terkunci)');
    expect(refreshedWrapper.find('.alert-banner.submitted').exists()).toBe(true);
    expect(refreshedWrapper.find('input[name="outcome-c-persisted-1"]').exists()).toBe(false);
    expect(refreshedWrapper.findAll('.eod-summary-card').length).toBe(1);
    expect(refreshedWrapper.find('.final-status-summary-card').exists()).toBe(true);
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

  it('IMP-045: merender Read-Only Summary View lengkap (commitments, additional works, alasan CANCELLED, final status, dan tomorrowPriority) saat terkunci', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-13',
          currentTime: '17:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
            isLate: true,
          },
          record: {
            id: 'rec-imp-045',
            eodSubmittedAt: '2026-11-13T17:15:00+07:00',
            finalDailyStatus: 'AMBER',
            orgContextSnapshot: {
              tomorrowPriority: 'Fokus selesaikan integrasi webhook pagi hari.',
            },
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Slicing prototype UI',
                initialRisk: 'GREEN',
                carryOverDaysCount: 0,
                outcome: 'COMPLETED',
                outcomeReason: '',
                continuation: 'DO_NOT_CONTINUE',
                continuationReason: '',
              },
              {
                id: 'c-2',
                sequenceNo: 2,
                taskText: 'Refactor modul legacy',
                initialRisk: 'AMBER',
                carryOverDaysCount: 1,
                outcome: 'CANCELLED',
                outcomeReason: 'Dialihkan ke sprint berikutnya',
                continuation: 'DO_NOT_CONTINUE',
                continuationReason: '',
              },
            ],
            additionalWorks: [
              {
                id: 'w-1',
                taskText: 'Hotfix webhook payment',
                reason: 'OPERATIONAL_INCIDENT',
                outcome: 'NOT_COMPLETED',
                outcomeReason: '',
                continuation: 'CONTINUE',
                continuationReason: 'Menunggu kredensial sandbox',
              },
            ],
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Tidak ada kontrol input interaktif (radio/textarea) pada state terkunci
    expect(wrapper.find('input[type="radio"]').exists()).toBe(false);
    expect(wrapper.find('textarea').exists()).toBe(false);
    expect(wrapper.findAll('.eod-summary-card').length).toBe(3);

    const text = wrapper.text();
    expect(text).toContain('Selesai Penuh');
    expect(text).toContain('Dibatalkan');
    expect(text).toContain('Dialihkan ke sprint berikutnya');
    expect(text).toContain('Belum Selesai');
    expect(text).toContain('Lanjutkan Besok (Carry-Over)');
    expect(text).toContain('Menunggu kredensial sandbox');
    expect(text).toContain('AMBER — Terkendala Sebagian / Butuh Penyesuaian');
    expect(text).toContain('Fokus selesaikan integrasi webhook pagi hari.');
  });

  it('shows approved leave banner, CUTI RESMI status, and hides EOD form when activeLeave is present (DEC-008)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-19',
          currentTime: '20:15',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: null,
          activeLeave: {
            id: 'lv-1',
            leaveType: 'SICK',
            startDate: '2026-11-19',
            endDate: '2026-11-19',
            reason: 'Istirahat sesuai surat dokter klinik.',
          },
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.find('[data-testid="leave-active-banner"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="leave-notice-box"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('CUTI RESMI (TERCATAT)');
    expect(wrapper.text()).toContain('CUTI (DIKECUALIKAN)');
    expect(wrapper.text()).toContain('Masa Cuti Resmi (Cuti Sakit):');
    expect(wrapper.text()).not.toContain('Di Luar Jam Normal (Lembur Fleksibel)');
    expect(wrapper.text()).not.toContain('LATE (Lembur Fleksibel)');
    expect(wrapper.text()).not.toContain('Kirim Evaluasi EOD');
  });

  it('displays empathetic overtime label without punitive LATE prefix during flexible overtime window (Paket #2)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-20',
          currentTime: '19:30',
          cutoffTimings: {
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-overtime',
            commitments: [],
            additionalWorks: [],
            eodSubmittedAt: null,
          },
          activeLeave: null,
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('Di Luar Jam Normal (Lembur Fleksibel)');
    expect(wrapper.text()).not.toContain('LATE (Lembur Fleksibel)');
  });

  // =========================================================================
  // PENGUJIAN AUDIT #4 — 4 TEMUAN KRUSIAL EOD OUTCOME
  // =========================================================================

  it('Audit #4 (Temuan 1): menampilkan kolom wajib penjelasan risiko saat AMBER/RED, menolak < 10 karakter, dan tampil di Read-Only Summary', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-22',
          currentTime: '17:15',
          cutoffTimings: {
            isMorningLocked: false,
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: {
            id: 'rec-risk-1',
            commitments: [
              {
                id: 'c-1',
                sequenceNo: 1,
                taskText: 'Rilis modul pembayaran',
                initialRisk: 'GREEN',
                carryOverDaysCount: 0,
                outcome: 'COMPLETED',
              },
            ],
            additionalWorks: [],
            finalDailyStatus: 'GREEN',
            eodSubmittedAt: null,
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Saat GREEN: kolom risiko tidak muncul
    expect(wrapper.find('[data-testid="daily-risk-explanation-group"]').exists()).toBe(false);

    // Pilih AMBER: kolom risiko muncul & wajib min 10 karakter
    await wrapper.find('input[type="radio"][value="AMBER"]').setValue(true);
    expect(wrapper.find('[data-testid="daily-risk-explanation-group"]').exists()).toBe(true);

    const riskTextarea = wrapper.find('#daily-risk-explanation');
    await riskTextarea.setValue('Singkat');
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Kirim Evaluasi EOD'));
    await submitBtn!.trigger('click');

    expect(wrapper.text()).toContain('minimal 10 karakter');
    expect(fetchMock).toHaveBeenCalledTimes(1); // Hanya GET /daily/today

    // Isi >= 10 karakter lalu submit berhasil & muncul di Read-Only Summary View
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { eodSubmittedAt: '2026-11-22T10:20:00.000Z' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            workDate: '2026-11-22',
            currentTime: '17:20',
            cutoffTimings: {
              isMorningLocked: false,
              eodOnTimeCutoff: '17:00',
              eodLockCutoff: '21:00',
              isEodLocked: false,
            },
            record: {
              id: 'rec-risk-1',
              eodSubmittedAt: '2026-11-22T10:20:00.000Z',
              finalDailyStatus: 'AMBER',
              orgContextSnapshot: {
                dailyRiskExplanation: 'Menunggu approval gateway vendor untuk sandbox klien',
              },
              commitments: [
                {
                  id: 'c-1',
                  sequenceNo: 1,
                  taskText: 'Rilis modul pembayaran',
                  initialRisk: 'GREEN',
                  outcome: 'COMPLETED',
                },
              ],
              additionalWorks: [],
            },
          },
        }),
      });

    await riskTextarea.setValue('Menunggu approval gateway vendor untuk sandbox klien');
    await submitBtn!.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(wrapper.find('[data-testid="daily-risk-readonly"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Menunggu approval gateway vendor untuk sandbox klien');
  });

  it('Audit #4 (Temuan 2 Pra Cut-Off): menahan form EOD bila belum mengisi Morning Commitment sebelum batas pagi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-22',
          currentTime: '08:45',
          cutoffTimings: {
            isMorningLocked: false,
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: null,
          activeLeave: null,
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.find('[data-testid="eod-morning-required-alert"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Belum Mengisi Morning Commitment');
    expect(wrapper.findAll('button').find((b) => b.text().includes('Kirim Evaluasi EOD'))).toBeUndefined();
  });

  it('Audit #4 (Temuan 2 Pasca Cut-Off / Opsi A): membuka form EOD dengan info Komitmen Pagi Terlewat setelah batas pagi lewat', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-11-22',
          currentTime: '17:10',
          cutoffTimings: {
            isMorningLocked: true,
            eodOnTimeCutoff: '17:00',
            eodLockCutoff: '21:00',
            isEodLocked: false,
          },
          record: null,
          activeLeave: null,
        },
      }),
    }));

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.find('[data-testid="eod-morning-required-alert"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="eod-morning-missed-banner"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Komitmen pagi hari ini terlewat dari batas waktu pengisian.');
    expect(wrapper.text()).not.toContain('(0 Komitmen)');
    expect(wrapper.findAll('button').find((b) => b.text().includes('Kirim Evaluasi EOD'))).toBeDefined();
  });

  it('Audit #4 (Temuan 3): mengubah hasil dari Sebagian (Lanjutkan Besok tanpa alasan) menjadi Selesai tetap dapat disubmit tanpa error palsu', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            workDate: '2026-11-22',
            currentTime: '17:00',
            cutoffTimings: {
              isMorningLocked: true,
              eodOnTimeCutoff: '17:00',
              eodLockCutoff: '21:00',
              isEodLocked: false,
            },
            record: {
              id: 'rec-switch',
              commitments: [
                {
                  id: 'c-switch-1',
                  sequenceNo: 1,
                  taskText: 'Review integrasi layanan API',
                  initialRisk: 'GREEN',
                  carryOverDaysCount: 0,
                  outcome: 'COMPLETED',
                  continuation: 'DO_NOT_CONTINUE',
                  continuationReason: '',
                },
              ],
              additionalWorks: [],
              finalDailyStatus: 'GREEN',
              eodSubmittedAt: null,
            },
          },
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { eodSubmittedAt: '2026-11-22T10:05:00.000Z' },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Simulasikan sempat pilih Sebagian + Lanjutkan Besok (tanpa mengisi alasan), lalu pindah ke Selesai
    await wrapper.find('input[name="outcome-c-switch-1"][value="PARTIALLY_COMPLETED"]').setValue(true);
    await wrapper.find('input[name="cont-c-switch-1"][value="CONTINUE"]').setValue(true);
    await wrapper.find('input[name="outcome-c-switch-1"][value="COMPLETED"]').setValue(true);

    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Kirim Evaluasi EOD'));
    await submitBtn!.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).not.toContain('Alasan kelanjutan (Continuation) wajib diisi');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/daily/eod'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('Audit #4 (Temuan 4): menampilkan Saran Status RED/AMBER & konfirmasi inline saat memilih GREEN tanpa mengunci hak GREEN (DEC-003)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            workDate: '2026-11-22',
            currentTime: '17:00',
            cutoffTimings: {
              isMorningLocked: true,
              eodOnTimeCutoff: '17:00',
              eodLockCutoff: '21:00',
              isEodLocked: false,
            },
            myActiveBlockers: [
              {
                id: 'blk-crit-1',
                code: '#BLK-112233',
                description: 'Server gateway mati',
                severity: 'CRITICAL',
                type: 'INFRA',
                status: 'OPEN',
              },
            ],
            record: {
              id: 'rec-suggest',
              commitments: [
                {
                  id: 'c-1',
                  sequenceNo: 1,
                  taskText: 'Deploy gateway',
                  initialRisk: 'AMBER',
                  carryOverDaysCount: 0,
                  outcome: 'COMPLETED',
                },
              ],
              additionalWorks: [],
              finalDailyStatus: 'GREEN',
              eodSubmittedAt: null,
            },
          },
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { eodSubmittedAt: '2026-11-22T10:10:00.000Z' },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Saran status RED muncul & radio GREEN tetap aktif
    const suggestionBox = wrapper.find('[data-testid="status-suggestion-box"]');
    expect(suggestionBox.exists()).toBe(true);
    expect(suggestionBox.text()).toContain('RED');
    expect(wrapper.find('input[type="radio"][value="GREEN"]').attributes('disabled')).toBeUndefined();

    // Klik Kirim dengan pilihan GREEN -> muncul konfirmasi inline tanpa memblokir permanen
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Kirim Evaluasi EOD'));
    await submitBtn!.trigger('click');

    const confirmBox = wrapper.find('[data-testid="status-mismatch-confirm"]');
    expect(confirmBox.exists()).toBe(true);
    expect(confirmBox.text()).toContain('Tetap Kirim sebagai GREEN');
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false); // Pastikan tetap bukan modal (IMP-040)

    // Klik "Tetap Kirim sebagai GREEN" -> POST /daily/eod terkirim dengan GREEN
    await wrapper.find('[data-testid="btn-confirm-keep-status"]').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/daily/eod'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"finalDailyStatus":"GREEN"'),
      }),
    );
  });

  it('menyimpan draf EOD ke localStorage, memulihkannya saat reload, mereset lewat Reset Draf, dan menghapus otomatis saat submit', async () => {
    const todayPayload = {
      success: true,
      data: {
        workDate: '2026-11-27',
        currentTime: '16:15',
        cutoffTimings: {
          eodOnTimeCutoff: '23:50',
          eodLockCutoff: '23:59',
          isEodLocked: false,
        },
        myActiveBlockers: [],
        record: {
          id: 'rec-eod-draft-1',
          commitments: [
            {
              id: 'c-draft-1',
              sequenceNo: 1,
              taskText: 'Finalisasi API modul laporan',
              initialRisk: 'GREEN',
              carryOverDaysCount: 0,
            },
          ],
          additionalWorks: [
            {
              id: 'w-draft-1',
              taskText: 'Revisi hak akses portal klien',
              reason: 'NEWLY_ASSIGNED',
            },
          ],
          eodSubmittedAt: null,
        },
      },
    };

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/daily/eod')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { eodSubmittedAt: '2026-11-27T09:30:00.000Z' },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => todayPayload,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    // 1. Isi form EOD & klik Simpan Draf
    const wrapper1 = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 25));

    await wrapper1.find('input[name="outcome-c-draft-1"][value="NOT_COMPLETED"]').setValue();
    await wrapper1.find('input[name="cont-c-draft-1"][value="DO_NOT_CONTINUE"]').setValue();
    const textareas1 = wrapper1.findAll('textarea');
    await textareas1[0].setValue('Diambil alih oleh tim Finance');

    await wrapper1.find('input[name="w-outcome-w-draft-1"][value="CANCELLED"]').setValue();
    await wrapper1.findAll('textarea')[1].setValue('Ditunda oleh klien');

    await wrapper1.find('input[type="radio"][value="AMBER"]').setValue();
    await wrapper1.find('#daily-risk-explanation').setValue('Penjelasan draf EOD yang disimpan lokal oleh karyawan');
    await wrapper1.find('#tomorrow-priority-input').setValue('Lanjutkan uji integrasi besok pagi');

    await wrapper1.find('[data-testid="btn-save-eod-draft"]').trigger('click');

    expect(wrapper1.find('[data-testid="eod-draft-saved-status"]').exists()).toBe(true);
    expect(wrapper1.text()).toContain('Draf tersimpan pukul');
    const storageKey = 'wp_eod_draft_default_2026-11-27';
    expect(window.localStorage.getItem(storageKey)).toBeTruthy();

    // 2. Simulasikan F5 (remount komponen) -> semua isian draf pulih otomatis
    wrapper1.unmount();
    const wrapper2 = mount(EodOutcomeView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 25));

    expect((wrapper2.find('input[name="outcome-c-draft-1"][value="NOT_COMPLETED"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper2.find('input[name="cont-c-draft-1"][value="DO_NOT_CONTINUE"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper2.find('input[name="w-outcome-w-draft-1"][value="CANCELLED"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper2.find('input[type="radio"][value="AMBER"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper2.find('#daily-risk-explanation').element as HTMLTextAreaElement).value).toBe('Penjelasan draf EOD yang disimpan lokal oleh karyawan');
    expect((wrapper2.find('#tomorrow-priority-input').element as HTMLTextAreaElement).value).toBe('Lanjutkan uji integrasi besok pagi');
    expect(wrapper2.find('[data-testid="eod-draft-saved-status"]').exists()).toBe(true);

    // 3. Klik Reset Draf -> hapus localStorage & kembalikan nilai form ke default
    await wrapper2.find('[data-testid="btn-clear-eod-draft"]').trigger('click');
    expect(window.localStorage.getItem(storageKey)).toBeNull();
    expect(wrapper2.find('[data-testid="eod-draft-saved-status"]').exists()).toBe(false);
    expect((wrapper2.find('input[type="radio"][value="GREEN"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper2.find('#tomorrow-priority-input').element as HTMLTextAreaElement).value).toBe('');

    // 4. Simpan draf ulang lalu Kirim Evaluasi EOD -> draf lokal otomatis terhapus saat submit sukses
    await wrapper2.find('[data-testid="btn-save-eod-draft"]').trigger('click');
    expect(window.localStorage.getItem(storageKey)).toBeTruthy();

    await wrapper2.find('[data-testid="btn-submit-eod"]').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/daily/eod'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
