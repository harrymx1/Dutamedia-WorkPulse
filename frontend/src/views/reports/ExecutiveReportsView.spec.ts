import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ExecutiveReportsView from './ExecutiveReportsView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

function makeOkResponse(data: any) {
  return Promise.resolve({
    ok: true,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({ success: true, data }),
  });
}

describe('ExecutiveReportsView.vue (Prototipe 23 / EP13 - Laporan Eksekutif & Analitik)', () => {
  let router: any;
  let fetchMock: any;

  const baseCompanyPayload = {
    period: 'today',
    scope: 'COMPANY',
    lockedFunction: null,
    functionFilter: 'ALL',
    availableFunctions: [
      { value: 'Delivery', label: 'Delivery' },
      { value: 'Engineering', label: 'Engineering' },
    ],
    periodRange: {
      startDate: '2026-11-23',
      endDate: '2026-11-23',
      workingDaysCount: 1,
    },
    policyTiming: {
      morningOnTimeCutoff: '09:00',
      morningLockCutoff: '09:30',
      eodOnTimeCutoff: '17:00',
      eodLockCutoff: '21:00',
    },
    summary: {
      totalEmployees: 24,
      participationRate: 87.5,
      onTimePercent: 75.0,
      latePercent: 12.5,
      noSubmissionPercent: 12.5,
      openBlockersCount: 3,
      resolvedBlockersCount: 2,
      avgBlockerMttrHours: 3.8,
      excludedSlotsCount: 1,
    },
    departmentBreakdown: [
      {
        functionCode: 'Engineering',
        department: 'Engineering',
        employmentStatus: 'Semua Status',
        totalMembers: 14,
        participationRate: 92.0,
        onTimePercent: 80.0,
        latePercent: 12.0,
        noSubmissionPercent: 8.0,
        openBlockersCount: 2,
        resolvedBlockersCount: 2,
        mttrHours: 3.8,
      },
    ],
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/reports/executive')) {
        return makeOkResponse(baseCompanyPayload);
      }
      return makeOkResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/reports', component: ExecutiveReportsView },
      ],
    });
  });

  it('renders Laporan Eksekutif heading, canonical timing badges, policy cutoffs, real MTTR, and header actions', async () => {
    const wrapper = mount(ExecutiveReportsView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Laporan Eksekutif');
    expect(wrapper.find('[data-testid="reports-scope-badge"]').text()).toBe('Seluruh Perusahaan');
    expect(wrapper.find('[data-testid="cutoff-badge-ontime"]').text()).toContain('≤ 09:00 WIB');
    expect(wrapper.find('[data-testid="cutoff-badge-late"]').text()).toContain('09:00–09:30 WIB');
    expect(wrapper.find('[data-testid="cutoff-badge-nosub"]').text()).toContain('Lewat 09:30 WIB');
    expect(wrapper.find('[data-testid="cutoff-badge-ontime"]').classes()).toContain('timing-ontime');
    expect(wrapper.find('[data-testid="cutoff-badge-nosub"]').classes()).toContain('timing-nosub');
    expect(wrapper.find('[data-testid="metric-mttr"]').text()).toBe('3.8 Jam');
    expect(wrapper.text()).toContain('1 cuti/dispensasi dikecualikan');
    expect(wrapper.text()).toContain('Prinsip Non-Hukuman');
    expect(wrapper.find('[data-testid="btn-export-csv"]').text()).toContain('Unduh Laporan (CSV)');
    expect(wrapper.find('[data-testid="btn-print-report"]').text()).toContain('Cetak / PDF');
  });

  it('updates query params on period preset, division filter, and employment status filter changes', async () => {
    const wrapper = mount(ExecutiveReportsView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    await wrapper.findAll('.preset-btn')[1].trigger('click');
    await flushPromises();
    expect(fetchMock.mock.calls.some(([u]: [string]) => u.includes('period=week'))).toBe(true);

    const divSelect = wrapper.find('[data-testid="reports-division-filter"]');
    await divSelect.setValue('Engineering');
    await flushPromises();
    expect(fetchMock.mock.calls.some(([u]: [string]) => u.includes('function=Engineering'))).toBe(true);

    const empSelect = wrapper.find('[data-testid="reports-employment-status-filter"]');
    await empSelect.setValue('INTERN');
    await flushPromises();
    expect(fetchMock.mock.calls.some(([u]: [string]) => u.includes('employmentStatus=INTERN'))).toBe(true);
  });

  it('hides division filter dropdown and locks badge when scope is DIVISION (HEAD)', async () => {
    fetchMock.mockImplementationOnce(() =>
      makeOkResponse({
        ...baseCompanyPayload,
        scope: 'DIVISION',
        lockedFunction: 'Engineering',
        functionFilter: 'Engineering',
        summary: {
          ...baseCompanyPayload.summary,
          resolvedBlockersCount: 0,
          avgBlockerMttrHours: 0,
        },
        departmentBreakdown: [
          {
            ...baseCompanyPayload.departmentBreakdown[0],
            resolvedBlockersCount: 0,
            mttrHours: 0,
          },
        ],
      }),
    );

    const wrapper = mount(ExecutiveReportsView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="reports-scope-badge"]').text()).toBe('Khusus Divisi Engineering');
    expect(wrapper.find('[data-testid="reports-division-filter"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="reports-division-locked"]').text()).toContain('Engineering');
    expect(wrapper.find('[data-testid="metric-mttr"]').text()).toBe('—');
  });

  it('disables export & print buttons when table is empty and resets filters via Tampilkan Semua', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('employmentStatus=CONTRACT')) {
        return makeOkResponse({
          ...baseCompanyPayload,
          summary: {
            ...baseCompanyPayload.summary,
            totalEmployees: 0,
            participationRate: 0,
            onTimePercent: 0,
            latePercent: 0,
            noSubmissionPercent: 0,
            resolvedBlockersCount: 0,
            avgBlockerMttrHours: 0,
          },
          departmentBreakdown: [],
        });
      }
      return makeOkResponse(baseCompanyPayload);
    });

    const wrapper = mount(ExecutiveReportsView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    await wrapper.find('[data-testid="reports-employment-status-filter"]').setValue('CONTRACT');
    await flushPromises();

    const exportBtn = wrapper.find('[data-testid="btn-export-csv"]');
    expect((exportBtn.element as HTMLButtonElement).disabled).toBe(true);
    expect(wrapper.text()).toContain('Belum ada data karyawan untuk penyaring yang dipilih.');

    await wrapper.find('[data-testid="empty-reset-filters"]').trigger('click');
    await flushPromises();

    expect((wrapper.find('[data-testid="btn-export-csv"]').element as HTMLButtonElement).disabled).toBe(false);
    expect(wrapper.text()).toContain('Engineering');
  });
});

