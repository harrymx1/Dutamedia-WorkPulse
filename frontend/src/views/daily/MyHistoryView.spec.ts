import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MyHistoryView from './MyHistoryView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Dashboard</div>' } },
      { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      { path: '/daily/additional-work', component: { template: '<div>Additional</div>' } },
      { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
      { path: '/daily/history', component: MyHistoryView },
      { path: '/notifications', component: { template: '<div>Notif</div>' } },
      { path: '/profile', component: { template: '<div>Profile</div>' } },
    ],
  });
}

describe('MyHistoryView.vue (Audit #6 Verification)', () => {
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createTestRouter();
  });

  it('removes internal "(Prototipe 06)" text and renders Indonesian labels with semantic outcome badge colors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dateRange: { startDate: '2026-11-16', endDate: '2026-11-22' },
            kpi: {
              totalDays: 2,
              onTimeSubmissions: 1,
              onTimeRate: 50,
              greenDays: 0,
              amberDays: 1,
              redDays: 1,
            },
            records: [
              {
                id: 'rec-1',
                workDate: '2026-11-22T00:00:00.000Z',
                morningTiming: 'ON_TIME',
                eodTiming: 'LATE',
                initialDailyStatus: 'GREEN',
                finalDailyStatus: 'AMBER',
                orgContextSnapshot: {
                  dailyRiskExplanation: 'Menunggu review arsitektur dari tim backend untuk modul laporan.',
                  tomorrowPriority: 'Selesaikan integrasi API laporan bulanan sebelum pukul 14:00.',
                },
                commitments: [
                  {
                    id: 'c-1',
                    sequenceNo: 1,
                    taskText: 'Implementasi tabel riwayat pengguna',
                    initialRisk: 'GREEN',
                    outcome: 'COMPLETED',
                  },
                  {
                    id: 'c-2',
                    sequenceNo: 2,
                    taskText: 'Perbaikan ekspor PDF mingguan',
                    initialRisk: 'AMBER',
                    outcome: 'PARTIALLY_COMPLETED',
                    continuation: 'CONTINUE',
                    continuationReason: 'Menunggu approval desain format ekspor',
                  },
                  {
                    id: 'c-3',
                    sequenceNo: 3,
                    taskText: 'Sinkronisasi data arsip lama',
                    initialRisk: 'RED',
                    outcome: 'NOT_COMPLETED',
                    continuation: 'DO_NOT_CONTINUE',
                  },
                  {
                    id: 'c-4',
                    sequenceNo: 4,
                    taskText: 'Rapat evaluasi kuartal',
                    initialRisk: 'GREEN',
                    outcome: 'CANCELLED',
                    outcomeReason: 'Jadwal rapat digeser ke minggu depan atas instruksi atasan',
                  },
                ],
                additionalWorks: [
                  {
                    id: 'aw-1',
                    taskText: 'Hotfix bug halaman login',
                    reason: 'OPERATIONAL_INCIDENT',
                    outcome: 'COMPLETED',
                  },
                  {
                    id: 'aw-2',
                    taskText: 'Bantu dokumentasi SOP darurat',
                    reason: 'NEWLY_ASSIGNED',
                    outcome: 'CANCELLED',
                    outcomeReason: 'Dialihkan ke tim dokumentasi',
                  },
                ],
              },
              {
                id: 'rec-2',
                workDate: '2026-11-21T00:00:00.000Z',
                morningTiming: 'LATE',
                eodTiming: 'NO_SUBMISSION',
                initialDailyStatus: 'NOT_APPLICABLE_NO_COMMITMENT',
                finalDailyStatus: null,
                commitments: [],
                additionalWorks: [],
              },
            ],
          },
        }),
      }),
    );

    const wrapper = mount(MyHistoryView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const htmlText = wrapper.text();
    expect(htmlText).not.toContain('(Prototipe 06)');
    expect(htmlText).not.toContain('Prototipe 06');

    // Main table Indonesian labels (no raw underscores)
    expect(htmlText).toContain('Tepat Waktu');
    expect(htmlText).toContain('Di Luar Jam Normal');
    expect(htmlText).toContain('Terlambat');
    expect(htmlText).toContain('Belum Mengisi');
    expect(htmlText).toContain('Hijau (Terkendali)');
    expect(htmlText).toContain('Kuning (Waspada)');
    expect(htmlText).toContain('Tidak Ada Komitmen');
    expect(htmlText).not.toContain('ON_TIME');
    expect(htmlText).not.toContain('NO_SUBMISSION');
    expect(htmlText).not.toContain('NOT_APPLICABLE_NO_COMMITMENT');

    // Expand first row and inspect details
    const expandBtns = wrapper.findAll('.expand-btn');
    expect(expandBtns.length).toBeGreaterThanOrEqual(1);
    await expandBtns[0].trigger('click');

    const detailSection = wrapper.find('.detail-row');
    expect(detailSection.exists()).toBe(true);
    const detailText = detailSection.text();

    // Risk explanation, tomorrow priority, and cancellation reason visible
    expect(wrapper.find('[data-testid="detail-risk-explanation"]').text()).toContain(
      'Menunggu review arsitektur dari tim backend untuk modul laporan.',
    );
    expect(wrapper.find('[data-testid="detail-tomorrow-priority"]').text()).toContain(
      'Selesaikan integrasi API laporan bulanan sebelum pukul 14:00.',
    );
    const cancelReasons = wrapper.findAll('[data-testid="detail-cancel-reason"]');
    expect(cancelReasons.length).toBe(2);
    expect(cancelReasons[0].text()).toContain('Jadwal rapat digeser ke minggu depan atas instruksi atasan');
    expect(cancelReasons[1].text()).toContain('Dialihkan ke tim dokumentasi');

    // Outcome & AdditionalWork Indonesian labels (no raw enums)
    expect(detailText).toContain('Risiko Rendah');
    expect(detailText).toContain('Risiko Sedang');
    expect(detailText).toContain('Risiko Tinggi');
    expect(detailText).toContain('Selesai');
    expect(detailText).toContain('Selesai Sebagian');
    expect(detailText).toContain('Belum Selesai');
    expect(detailText).toContain('Dibatalkan');
    expect(detailText).toContain('Perbaikan Error / Bug Kritis');
    expect(detailText).toContain('Penugasan Baru Atasan');
    expect(detailText).not.toContain('PARTIALLY_COMPLETED');
    expect(detailText).not.toContain('NOT_COMPLETED');
    expect(detailText).not.toContain('OPERATIONAL_INCIDENT');
    expect(detailText).not.toContain('NEWLY_ASSIGNED');

    // Verify semantic badge classes for each outcome (not all green!)
    const badges = detailSection.findAll('.badge');
    const findBadgeByText = (txt: string) => badges.find((b) => b.text() === txt);
    expect(findBadgeByText('Selesai')?.classes()).toContain('badge-active');
    expect(findBadgeByText('Selesai Sebagian')?.classes()).toContain('badge-warning');
    expect(findBadgeByText('Belum Selesai')?.classes()).toContain('badge-danger');
    expect(findBadgeByText('Dibatalkan')?.classes()).toContain('badge-neutral');
  });

  it('shows validation warning and does not call API when Dari Tanggal is later than Sampai Tanggal', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          dateRange: { startDate: '2026-11-16', endDate: '2026-11-22' },
          kpi: {
            totalDays: 0,
            onTimeSubmissions: 0,
            onTimeRate: 0,
            greenDays: 0,
            amberDays: 0,
            redDays: 0,
          },
          records: [],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(MyHistoryView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await wrapper.find('#start-date').setValue('2026-11-25');
    await wrapper.find('#end-date').setValue('2026-11-20');
    await wrapper.find('.filter-btn').trigger('click');

    // Still 1 call — invalid date range must NOT trigger fetch
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const errEl = wrapper.find('[data-testid="date-range-error"]');
    expect(errEl.exists()).toBe(true);
    expect(errEl.text()).toContain('Dari Tanggal tidak boleh lebih akhir daripada Sampai Tanggal');

    // Fixing the date range clears the error and triggers fetch
    await wrapper.find('#start-date').setValue('2026-11-18');
    await wrapper.find('.filter-btn').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-testid="date-range-error"]').exists()).toBe(false);
  });

  it('renders read-only recordedLeaves and recordedExemptions panel cleanly (DEC-018)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            dateRange: { startDate: '2026-11-18', endDate: '2026-11-24' },
            kpi: {
              totalDays: 0,
              onTimeSubmissions: 0,
              onTimeRate: 0,
              greenDays: 0,
              amberDays: 0,
              redDays: 0,
            },
            records: [],
            recordedLeaves: [
              {
                id: 'lv-ro-1',
                leaveType: 'ANNUAL',
                startDate: '2026-11-24',
                endDate: '2026-11-25',
                reason: 'Cuti tahunan resmi disetujui',
                reviewedBy: { id: 'hr-1', fullName: 'Dewi HRGA' },
              },
            ],
            recordedExemptions: [
              {
                id: 'ex-ro-1',
                exemptionCategory: 'Dinas Luar',
                officialReferenceNumber: 'ST/HRGA/104',
                startDate: '2026-11-26',
                endDate: '2026-11-26',
                reason: 'Presentasi proyek ke klien Surabaya',
                createdByUser: { id: 'hr-1', fullName: 'Dewi HRGA' },
              },
            ],
          },
        }),
      }),
    );

    const wrapper = mount(MyHistoryView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 25));

    const panel = wrapper.find('[data-testid="readonly-leave-exemption-panel"]');
    expect(panel.exists()).toBe(true);
    expect(panel.text()).toContain('Read-Only');
    expect(panel.text()).toContain('Cuti Tahunan');
    expect(panel.text()).toContain('Dinas Luar');
    expect(panel.text()).toContain('ST/HRGA/104');
    expect(panel.text()).toContain('Dewi HRGA');
  });
});
