import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { apiClient } from '../src/api/client.js';
import { ApiError } from '../src/types/api.js';
import { useApiError } from '../src/composables/useApiError.js';
import { useUiStore } from '../src/stores/ui.store.js';
import { queryClient as appQueryClient } from '../src/plugins/vue-query.js';
import ExceptionSummaryWidget from '../src/components/management/ExceptionSummaryWidget.vue';
import TeamPulsePage from '../src/pages/TeamPulsePage.vue';

// Polyfills for happy-dom / browser env
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

describe('S3-T7 / NFR-04: Frontend Network Resilience & Fault Recovery', () => {
  let pinia: ReturnType<typeof createPinia>;
  let testQueryClient: QueryClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  // ---------------------------------------------------------------------------
  // 1. API Client Network Error Transformation
  // ---------------------------------------------------------------------------
  describe('1. API Request Failure & Network Error Handling', () => {
    it('harus menangkap TypeError pada fetch (koneksi terputus) dan mengonversi ke ApiError dengan statusCode 0 dan NETWORK_ERROR', async () => {
      // Mock global fetch to simulate connection dropped / DNS unreachable
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      let caughtError: any = null;
      try {
        await apiClient.get('/test-endpoint');
      } catch (err) {
        caughtError = err;
      }

      expect(fetchSpy).toHaveBeenCalled();
      expect(caughtError).toBeInstanceOf(ApiError);
      expect(caughtError.statusCode).toBe(0);
      expect(caughtError.code).toBe('NETWORK_ERROR');
      expect(caughtError.message).toBe('Failed to fetch');
    });

    it('harus membedakan error autentikasi HTTP 401 dari kegagalan jaringan', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: 'UNAUTHENTICATED', message: 'Token kedaluwarsa' },
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

      let caughtError: any = null;
      try {
        await apiClient.get('/auth/me');
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(ApiError);
      expect(caughtError.statusCode).toBe(401);
      expect(caughtError.code).toBe('UNAUTHENTICATED');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Informative Indonesian Toast Notifications (SAD §17.5)
  // ---------------------------------------------------------------------------
  describe('2. Toast Notifications & Localization for Network Failures', () => {
    it('harus menampilkan Toast "Koneksi jaringan terputus. Silakan periksa koneksi internet Anda." pada statusCode 0', () => {
      const uiStore = useUiStore();
      const { handleApiError } = useApiError();

      const networkError = new ApiError(0, 'NETWORK_ERROR', 'Failed to fetch');
      handleApiError(networkError);

      expect(uiStore.toasts.length).toBe(1);
      const toast = uiStore.toasts[0];
      expect(toast.type).toBe('error');
      expect(toast.message).toBe('Koneksi jaringan terputus. Silakan periksa koneksi internet Anda.');
    });

    it('harus menampilkan Toast server error generik yang aman tanpa membocorkan stack trace teknis pada HTTP 500', () => {
      const uiStore = useUiStore();
      const { handleApiError } = useApiError();

      const serverError = new ApiError(500, 'INTERNAL_ERROR', 'Database pool timeout at /var/app/backend');
      handleApiError(serverError);

      expect(uiStore.toasts.length).toBe(1);
      const toast = uiStore.toasts[0];
      expect(toast.type).toBe('error');
      expect(toast.message).toBe('Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.');
      expect(toast.message).not.toContain('/var/app/backend');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. TanStack Query Retry Policy Configuration
  // ---------------------------------------------------------------------------
  describe('3. Query Retry Policy Logic', () => {
    it('harus mengizinkan retry untuk Network Error (statusCode 0) sampai 2 kali', () => {
      const retryFn = appQueryClient.getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: any
      ) => boolean;

      expect(retryFn).toBeDefined();

      const networkErr = new ApiError(0, 'NETWORK_ERROR', 'Network connection drop');
      // Failure count 0 -> retry
      expect(retryFn(0, networkErr)).toBe(true);
      // Failure count 1 -> retry
      expect(retryFn(1, networkErr)).toBe(true);
      // Failure count 2 -> stop retry
      expect(retryFn(2, networkErr)).toBe(false);
    });

    it('TIDAK boleh mengulang (retry false) untuk error 401, 403, atau 404', () => {
      const retryFn = appQueryClient.getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: any
      ) => boolean;

      const authErr = new ApiError(401, 'UNAUTHENTICATED', 'No token');
      const forbiddenErr = new ApiError(403, 'FORBIDDEN', 'Access denied');
      const notFoundErr = new ApiError(404, 'NOT_FOUND', 'Record missing');

      expect(retryFn(0, authErr)).toBe(false);
      expect(retryFn(0, forbiddenErr)).toBe(false);
      expect(retryFn(0, notFoundErr)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. UI Error State, Retry Button & Data Recovery without False Data
  // ---------------------------------------------------------------------------
  describe('4. Component Resilience, Retry Mechanism & Data Recovery', () => {
    it('ExceptionSummaryWidget: menampilkan error alert informatif saat network gagal dan memulihkan data saat retry sukses', async () => {
      // 1. Awalnya jaringan mati (fetch melempar error)
      const getSpy = vi.spyOn(apiClient, 'get').mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'Failed to fetch'));

      const wrapper = mount(ExceptionSummaryWidget, {
        props: { scope: 'Team', date: '2026-10-10' },
        global: {
          plugins: [pinia, vuetify, [VueQueryPlugin, { queryClient: testQueryClient }]],
        },
      });

      await flushPromises();

      // Memastikan widget menampilkan alert error dan BUKAN metrics kartu kosong palsu
      expect(wrapper.text()).toContain('Gagal Memuat Ringkasan Pengecualian');
      expect(wrapper.text()).toContain('Terjadi kendala jaringan saat menghubungi server.');
      expect(wrapper.text()).toContain('Coba Lagi');
      expect(wrapper.text()).not.toContain('Check-in diharapkan hari ini');

      // 2. Sekarang koneksi pulih: API mengembalikan data valid
      getSpy.mockResolvedValueOnce({
        data: {
          date: '2026-10-10',
          metrics: {
            totalExpectedEmployees: 10,
            submittedCount: 8,
            noSubmissionCount: 2,
            redCount: 1,
            amberCount: 1,
            greenCount: 6,
            criticalBlockerCount: 0,
            overdueAcknowledgementCount: 0,
          },
          exceptions: [],
        },
        meta: { timestamp: new Date().toISOString() },
      } as any);

      // Klik tombol retry "Coba Lagi"
      const retryBtn = wrapper.find('[data-testid="retry-exception-summary-btn"]');
      expect(retryBtn.exists()).toBe(true);
      await retryBtn.trigger('click');
      await flushPromises();

      // Alert error hilang, data aktual muncul
      expect(wrapper.text()).not.toContain('Gagal Memuat Ringkasan Pengecualian');
      expect(wrapper.text()).toContain('Total Karyawan');
      expect(wrapper.text()).toContain('10');
      expect(wrapper.text()).toContain('8 mengisi');
    });

    it('TeamPulsePage: menampilkan error alert pada kegagalan query roster dan antrean blocker, tanpa menampilkan data palsu', async () => {
      // Simulasi kegagalan jaringan saat membuka TeamPulsePage
      const getSpy = vi.spyOn(apiClient, 'get').mockImplementation((endpoint: string) => {
        if (endpoint.includes('/daily-accountability-records')) {
          return Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Koneksi putus'));
        }
        if (endpoint.includes('/blockers')) {
          return Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Koneksi putus'));
        }
        if (endpoint.includes('/reports/exception-summary')) {
          return Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Koneksi putus'));
        }
        return Promise.resolve({ data: [], meta: { timestamp: new Date().toISOString() } } as any);
      });

      const wrapper = mount(TeamPulsePage, {
        global: {
          plugins: [pinia, vuetify, [VueQueryPlugin, { queryClient: testQueryClient }]],
          stubs: {
            ManagerNoteModal: true,
            BlockerActionModal: true,
          },
        },
      });

      await flushPromises();

      // Tab Roster: harus menampilkan error alert "Gagal Memuat Data Anggota Tim"
      // dan TIDAK menampilkan pesan palsu "Tidak ada data aktivitas anggota tim"
      expect(wrapper.text()).toContain('Gagal Memuat Data Anggota Tim');
      expect(wrapper.text()).not.toContain('Tidak ada data aktivitas anggota tim untuk tanggal yang dipilih.');
      expect(wrapper.find('[data-testid="retry-roster-btn"]').exists()).toBe(true);

      // Pindah ke tab Blocker
      const blockerTab = wrapper.find('[data-testid="tab-blockers"]');
      await blockerTab.trigger('click');
      await flushPromises();

      // Tab Blocker: harus menampilkan error alert "Gagal Memuat Antrean Blocker"
      // dan TIDAK menampilkan false success "Semua Blocker Selesai"
      expect(wrapper.text()).toContain('Gagal Memuat Antrean Blocker');
      expect(wrapper.text()).not.toContain('Semua Blocker Selesai');
      expect(wrapper.find('[data-testid="retry-blockers-btn"]').exists()).toBe(true);

      // Simulasi pemulihan jaringan pada tab Blocker
      getSpy.mockResolvedValueOnce({
        data: [
          {
            id: 'blocker-recovered-1',
            type: 'Technical Dependency',
            description: 'Database latency',
            severity: 'High',
            impact: 'Database latency',
            status: 'Open',
            raisedBy: { id: 'user-1', fullName: 'Alice' },
            ownerNeeded: { id: 'user-2', fullName: 'Bob' },
          },
        ],
        meta: { timestamp: new Date().toISOString() },
      } as any);

      // Klik tombol retry "Coba Lagi" khusus tab blocker
      const retryBlockerBtn = wrapper.find('[data-testid="retry-blockers-btn"]');
      expect(retryBlockerBtn.exists()).toBe(true);
      await retryBlockerBtn.trigger('click');
      await flushPromises();

      // Error alert hilang, blocker aktual dirender
      expect(wrapper.text()).not.toContain('Gagal Memuat Antrean Blocker');
      expect(wrapper.text()).toContain('Database latency');
      expect(wrapper.text()).toContain('High');
    });
  });
});
