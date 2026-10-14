import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { apiClient } from '../src/api/client.js';
import { reportingApi } from '../src/api/reporting.api.js';
import { blockersApi } from '../src/api/blockers.api.js';
import { useBlockerOwnersQuery } from '../src/queries/useBlockers.js';
import { useAuthStore } from '../src/stores/auth.store.js';
import { setupRouterGuards } from '../src/router/guards.js';
import { createApp, type App } from 'vue';
import ReportsPage from '../src/pages/ReportsPage.vue';
import RaiseBlockerModal from '../src/components/self-service/RaiseBlockerModal.vue';

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

describe('S3-T4 Remediation: FIND-01 (Vuetify dense Prop Modernization)', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  it('FIND-01: RaiseBlockerModal merender komponen formulir dengan density="compact" tanpa error', async () => {
    vi.spyOn(blockersApi, 'getPotentialOwners').mockResolvedValue({
      data: {
        items: [{ id: 'user-1', fullName: 'Budi Santoso', email: 'budi@test.com' }],
      },
      meta: { timestamp: new Date().toISOString() },
    });

    const wrapper = mount(RaiseBlockerModal, {
      props: { modelValue: true },
      global: {
        plugins: [pinia, vuetify, [VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    // Verifikasi atribut density compact terpasang pada grid row
    const rows = wrapper.findAllComponents({ name: 'VRow' });
    expect(rows.length).toBeGreaterThan(0);
    const compactRows = rows.filter((r) => r.props('density') === 'compact');
    expect(compactRows.length).toBeGreaterThan(0);
  });
});

describe('S3-T4 Remediation: FIND-02 (Vue Router Return-Based Guards)', () => {
  let pinia: ReturnType<typeof createPinia>;
  let mockRouter: any;
  let registeredGuard: ((to: any, from: any) => Promise<any>) | null = null;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);

    registeredGuard = null;
    mockRouter = {
      currentRoute: { value: { path: '/today', fullPath: '/today' } },
      push: vi.fn(),
      beforeEach: vi.fn((guard) => {
        registeredGuard = guard;
      }),
    };

    setupRouterGuards(mockRouter);
  });

  it('FIND-02: Guard mengembalikan redirect ke /login untuk pengguna belum terautentikasi', async () => {
    const authStore = useAuthStore();
    authStore.user = null;
    authStore.isInitialized = true;

    expect(registeredGuard).toBeTypeOf('function');
    const to = { path: '/team', fullPath: '/team', meta: { requiresAuth: true } };
    const result = await registeredGuard!(to, { path: '/' });

    expect(result).toEqual({
      path: '/login',
      query: { redirect: '/team' },
    });
  });

  it('FIND-02: Guard mengembalikan redirect ke /reset-password jika mustResetPassword aktif', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'user-1',
      fullName: 'Alice',
      email: 'alice@test.com',
      role: 'Employee',
      function: 'Engineering',
      mustResetPassword: true,
    } as any;
    authStore.isInitialized = true;

    const to = { path: '/today', fullPath: '/today', meta: { requiresAuth: true } };
    const result = await registeredGuard!(to, { path: '/login' });

    expect(result).toEqual({ path: '/reset-password' });
  });

  it('FIND-02: Guard mengembalikan redirect ke /today jika user bukan role yang diizinkan', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'user-1',
      fullName: 'Alice',
      email: 'alice@test.com',
      role: 'Employee',
      function: 'Engineering',
      mustResetPassword: false,
    } as any;
    authStore.isInitialized = true;

    const to = {
      path: '/admin/users',
      fullPath: '/admin/users',
      meta: { requiresAuth: true, roles: ['SystemAdmin'] },
    };
    const result = await registeredGuard!(to, { path: '/today' });

    expect(result).toEqual({ path: '/today' });
  });

  it('FIND-02: Guard mengembalikan true ketika user memiliki otorisasi penuh (tanpa memanggil next callback)', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'admin-1',
      fullName: 'Admin',
      email: 'admin@test.com',
      role: 'SystemAdmin',
      function: 'Governance',
      mustResetPassword: false,
    } as any;
    authStore.isInitialized = true;

    const to = {
      path: '/admin/users',
      fullPath: '/admin/users',
      meta: { requiresAuth: true, roles: ['SystemAdmin'] },
    };
    const result = await registeredGuard!(to, { path: '/today' });

    expect(result).toBe(true);
  });
});

describe('S3-T4 Remediation: FIND-03 & TRIAGE-OBS-01 (Reporting API Contract & Resilient Empty State)', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  it('FIND-03: reportingApi.getMonthlyTrend memformat year dan month menjadi query string ?month=YYYY-MM sesuai backend DTO', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        month: '2026-10',
        summary: { totalRecords: 10, totalBlockers: 2, totalComplianceEvents: 0 },
      },
      meta: { timestamp: new Date().toISOString() },
    });

    await reportingApi.getMonthlyTrend({ year: 2026, month: 10 });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('/reports/monthly-trend?month=2026-10');
  });

  it('TRIAGE-OBS-01: reportingApi.getWeeklyTeamSummary mengirim parameter weekStart (ISO) sesuai backend WeeklyTeamSummaryQueryDto', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        weekStart: '2026-10-05',
        totalSubmissions: 5,
        greenCount: 4,
        amberCount: 1,
        redCount: 0,
        continuationRate: 100,
      },
      meta: { timestamp: new Date().toISOString() },
    });

    await reportingApi.getWeeklyTeamSummary({ weekStartDate: '2026-10-05' });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('/reports/weekly-team-summary?weekStart=2026-10-05');
  });

  it('FIND-03: ReportsPage merender tab Monthly Trend dengan aman tanpa crash saat data kosong (empty state)', async () => {
    vi.spyOn(reportingApi, 'getDailyException').mockResolvedValue({
      data: { date: '2026-10-08', totalItems: 0, items: [] } as any,
      meta: { timestamp: new Date().toISOString() },
    });
    vi.spyOn(reportingApi, 'getWeeklyTeamSummary').mockResolvedValue({
      data: null as any,
      meta: { timestamp: new Date().toISOString() },
    });
    vi.spyOn(reportingApi, 'getMonthlyTrend').mockResolvedValue({
      data: null as any, // Data kosong / null
      meta: { timestamp: new Date().toISOString() },
    });

    const wrapper = mount(ReportsPage, {
      global: {
        plugins: [pinia, vuetify, [VueQueryPlugin, { queryClient }]],
        stubs: {
          ExportButton: true,
          StatusBadge: true,
          SubmissionTimingBadge: true,
        },
      },
    });

    await flushPromises();

    // Berpindah ke tab Monthly Trend
    const vm = wrapper.vm as any;
    vm.activeReportTab = 'monthly-trend';
    await flushPromises();

    // Pastikan tidak melempar TypeError dan merender status kosong
    expect(wrapper.text()).toContain('Belum Ada Data Tren Historis');
    expect(wrapper.find('.mdi-chart-line').exists()).toBe(true);
  });
});

describe('S3-T4 Remediation: FIND-04 (TanStack Query ["blockers", "owners"] Contract Alignment)', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;
  let app: App;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    app = createApp({});
    app.use(pinia);
    app.use(VueQueryPlugin, { queryClient });
  });

  it('FIND-04: useBlockerOwnersQuery mengembalikan array dari items ketika data berformat paginasi backend', async () => {
    const mockUsers = [
      { id: 'u1', fullName: 'Alice Employee', email: 'alice@test.com' },
      { id: 'u2', fullName: 'Bob Manager', email: 'bob@test.com' },
    ];
    vi.spyOn(blockersApi, 'getPotentialOwners').mockResolvedValue({
      data: { items: mockUsers } as any,
      meta: { timestamp: new Date().toISOString() },
    });

    const query = app.runWithContext(() => useBlockerOwnersQuery());
    await query.refetch();

    expect(query.data.value).toBeDefined();
    expect(Array.isArray(query.data.value)).toBe(true);
    expect(query.data.value).toEqual(mockUsers);
  });

  it('FIND-04: useBlockerOwnersQuery mempropagasi error secara transparan (tidak menyamarkan HTTP 403 menjadi array kosong)', async () => {
    const errorResponse = { response: { status: 403, data: { message: 'Forbidden' } } };
    vi.spyOn(blockersApi, 'getPotentialOwners').mockRejectedValue(errorResponse);

    const query = app.runWithContext(() => useBlockerOwnersQuery());
    const res = await query.refetch();

    // Membuktikan error terpropagasi secara transparan, bukan disamarkan sebagai sukses dengan data kosong []
    expect(res.status).toBe('error');
    expect(query.isError.value).toBe(true);
    expect(query.error.value).toEqual(errorResponse);
  });
});
