import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { apiClient } from '../src/api/client.js';
import { reportingApi } from '../src/api/reporting.api.js';
import MyHistoryPage from '../src/pages/MyHistoryPage.vue';
import ProfilePage from '../src/pages/ProfilePage.vue';

// Polyfills for happy-dom
if (typeof window !== 'undefined') {
  const mockViewport = {
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  (window as any).visualViewport = mockViewport;
  (globalThis as any).visualViewport = mockViewport;

  if (!window.ResizeObserver) {
    const mockResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    (window as any).ResizeObserver = mockResizeObserver;
    (globalThis as any).ResizeObserver = mockResizeObserver;
  }
}

const mockMeta = { timestamp: new Date().toISOString() };

describe('S3-T2 Remediation: DEF-03 (Individual Evidence Path Parameter)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('DEF-03: reportingApi.getIndividualEvidence memanggil GET /reports/individual-evidence/:userId dengan path param', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        userId: 'user-uuid-1',
        records: [],
        managerNotes: [],
        complianceEvents: [],
      },
      meta: mockMeta,
    });

    const res = await reportingApi.getIndividualEvidence({
      userId: 'user-uuid-1',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(
      '/reports/individual-evidence/user-uuid-1?startDate=2026-10-01&endDate=2026-10-07',
    );
    expect(res.data.userId).toBe('user-uuid-1');
  });
});

describe('S3-T2 Remediation: DEF-04 (Report Export GET Endpoint)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('DEF-04: reportingApi.exportReport memanggil GET /reports/:reportType/export dengan format lowercase', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        downloadUrl: 'https://storage.local/exports/daily-exception.pdf',
        expiresIn: 3600,
        filename: 'WorkPulse_daily-exception.pdf',
        format: 'pdf',
        storagePath: 'exports/daily-exception.pdf',
      },
      meta: mockMeta,
    });

    const res = await reportingApi.exportReport({
      reportType: 'daily-exception',
      format: 'PDF',
      date: '2026-10-07',
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(
      '/reports/daily-exception/export?format=pdf&date=2026-10-07',
    );
    expect(res.data.downloadUrl).toBe('https://storage.local/exports/daily-exception.pdf');
  });

  it('DEF-04: reportingApi.exportReport memetakan weekStartDate ke weekStart untuk weekly-team-summary', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        downloadUrl: 'https://storage.local/exports/weekly.xlsx',
        expiresIn: 3600,
        filename: 'WorkPulse_weekly.xlsx',
        format: 'xlsx',
        storagePath: 'exports/weekly.xlsx',
      },
      meta: mockMeta,
    });

    await reportingApi.exportReport({
      reportType: 'weekly-team-summary',
      format: 'XLSX',
      weekStartDate: '2026-10-05',
    });

    expect(getSpy).toHaveBeenCalledWith(
      '/reports/weekly-team-summary/export?format=xlsx&weekStart=2026-10-05',
    );
  });

  it('DEF-04: reportingApi.exportReport memetakan year dan month ke format YYYY-MM untuk monthly-trend', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        downloadUrl: 'https://storage.local/exports/monthly.pdf',
        expiresIn: 3600,
        filename: 'WorkPulse_monthly.pdf',
        format: 'pdf',
        storagePath: 'exports/monthly.pdf',
      },
      meta: mockMeta,
    });

    await reportingApi.exportReport({
      reportType: 'monthly-trend',
      format: 'PDF',
      year: 2026,
      month: 10,
    });

    expect(getSpy).toHaveBeenCalledWith(
      '/reports/monthly-trend/export?format=pdf&month=2026-10',
    );
  });
});

describe('S3-T2 Remediation: DEF-05 (MyHistory Export Handling)', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('DEF-05: MyHistoryPage merender ExportButton dan mengeksekusi exportReport pada event export', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/daily-accountability-records')) {
        return {
          data: {
            items: [
              {
                id: 'rec-1',
                employeeUserId: 'user-1',
                workDate: '2026-10-07T00:00:00.000Z',
                workType: 'WFO',
                finalStatus: 'GREEN',
                commitments: [{ id: 'c-1', text: 'Task 1' }],
                additionalWorks: [],
                morningSubmittedAt: '2026-10-07T08:30:00.000Z',
                eodSubmittedAt: '2026-10-07T17:30:00.000Z',
              },
            ],
            total: 1,
          },
          meta: mockMeta,
        } as any;
      }
      if (url.includes('/reports/individual-evidence/export')) {
        return {
          data: {
            downloadUrl: 'https://storage.local/my-history-export.xlsx',
            expiresIn: 3600,
            filename: 'WorkPulse_individual-evidence_2026-10-07.xlsx',
            format: 'xlsx',
            storagePath: 'exports/my-history.xlsx',
          },
          meta: mockMeta,
        } as any;
      }
      return { data: {}, meta: mockMeta } as any;
    });

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const wrapper = mount(MyHistoryPage, {
      global: {
        plugins: [vuetify, pinia, [VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    // ExportButton harus ada
    const exportBtn = wrapper.findComponent({ name: 'ExportButton' });
    expect(exportBtn.exists()).toBe(true);

    // Emit event export dari ExportButton
    await exportBtn.vm.$emit('export', 'xlsx');
    await flushPromises();

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://storage.local/my-history-export.xlsx',
      '_blank',
    );
  });
});

describe('S3-T2 Remediation: GAP-01 (ProfilePage Dynamic Active Policy Display)', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('GAP-01: ProfilePage merender nilai kebijakan aktif secara dinamis dari API', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/auth/me')) {
        return {
          data: {
            userId: 'user-me-1',
            fullName: 'Budi Santoso',
            email: 'budi@dutamedia.com',
            role: 'Employee',
            function: 'Engineering',
            mustResetPassword: false,
          },
          meta: mockMeta,
        } as any;
      }
      if (url.includes('/policies')) {
        return {
          data: [
            {
              id: 'pol-cutoff',
              category: 'Cutoff',
              value: {
                morningOnTimeDeadline: '09:00',
                eodOnTimeDeadline: '17:30',
              },
            },
            {
              id: 'pol-objection',
              category: 'ObjectionWindowDuration',
              value: {
                durationHours: 48,
              },
            },
          ],
          meta: mockMeta,
        } as any;
      }
      return { data: {}, meta: mockMeta } as any;
    });

    const wrapper = mount(ProfilePage, {
      global: {
        plugins: [vuetify, pinia, [VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    // Cek apakah nilai kebijakan dinamis dirender
    const text = wrapper.text();
    expect(text).toContain('09:00 WIB');
    expect(text).toContain('17:30 WIB');
    expect(text).toContain('48 Jam');
  });

  it('GAP-01: ProfilePage menampilkan nilai default yang aman jika policies API kosong/gagal', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url.includes('/auth/me')) {
        return {
          data: {
            userId: 'user-me-1',
            fullName: 'Budi Santoso',
            email: 'budi@dutamedia.com',
            role: 'Employee',
            function: 'Engineering',
            mustResetPassword: false,
          },
          meta: mockMeta,
        } as any;
      }
      if (url.includes('/policies')) {
        return {
          data: [],
          meta: mockMeta,
        } as any;
      }
      return { data: {}, meta: mockMeta } as any;
    });

    const wrapper = mount(ProfilePage, {
      global: {
        plugins: [vuetify, pinia, [VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('09:30 WIB');
    expect(text).toContain('18:00 WIB');
    expect(text).toContain('24 Jam');
  });
});
