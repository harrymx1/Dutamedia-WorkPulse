import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { apiClient } from '../src/api/client.js';
import { blockersApi } from '../src/api/blockers.api.js';
import { useAuthStore } from '../src/stores/auth.store.js';
import TeamPulsePage from '../src/pages/TeamPulsePage.vue';
import type { BlockerItem } from '../src/types/management.js';

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

describe('S3-T3: TeamPulsePage Blocker Binding & Actions Verification', () => {
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

    const authStore = useAuthStore();
    authStore.user = {
      userId: 'user-bob-id',
      email: 'bob@dutamedia.test',
      fullName: 'Bob Supervisor',
      role: 'Supervisor_TL',
      function: 'Engineering',
    } as any;
    authStore.isInitialized = true;
  });

  it('merender blocker dari useBlockersListQuery pada tab Blockers beserta tombol acknowledge', async () => {
    const mockBlockers: BlockerItem[] = [
      {
        id: 'blocker-uuid-1',
        description: 'Database replication throughput terhambat',
        severity: 'Critical',
        status: 'Open',
        authorityType: 'Organizational',
        raisedByUserId: 'user-alice-id',
        raisedByName: 'Alice Employee',
        ownerNeededUserId: 'user-bob-id',
        ownerNeededName: 'Bob Supervisor',
        createdAt: new Date().toISOString(),
      },
    ];

    // Mock API client get yang dipanggil oleh useBlockersListQuery
    vi.spyOn(blockersApi, 'getBlockers').mockResolvedValue({
      data: mockBlockers,
      meta: mockMeta,
    });

    // Mock query lainnya agar tidak error
    vi.spyOn(apiClient, 'get').mockImplementation(async (endpoint: string) => {
      if (endpoint.includes('/blockers')) {
        return { data: mockBlockers, meta: mockMeta };
      }
      return { data: [], meta: mockMeta };
    });

    const wrapper = mount(TeamPulsePage, {
      global: {
        plugins: [pinia, vuetify, [VueQueryPlugin, { queryClient }]],
        stubs: {
          ExceptionSummaryWidget: true,
          ManagerNoteModal: true,
          BlockerActionModal: true,
          StatusBadge: true,
          SubmissionTimingBadge: true,
          ClassificationTag: true,
          ObjectionWindowIndicator: true,
        },
      },
    });

    await flushPromises();

    // Berpindah ke tab blockers
    const vm = wrapper.vm as any;
    vm.activeTab = 'blockers';
    await flushPromises();

    // Pastikan openBlockers membaca array dari blockersData
    expect(vm.openBlockers).toHaveLength(1);
    expect(vm.openBlockers[0].description).toBe('Database replication throughput terhambat');

    // Verifikasi elemen kartu blocker muncul di UI
    const blockerCard = wrapper.find('[data-testid="blocker-card-Open"]');
    expect(blockerCard.exists()).toBe(true);
    expect(blockerCard.text()).toContain('Database replication throughput terhambat');
    expect(blockerCard.text()).toContain('Alice Employee');

    // Verifikasi tombol acknowledge muncul untuk status Open
    const ackBtn = wrapper.find('[data-testid="blocker-acknowledge-button"]');
    expect(ackBtn.exists()).toBe(true);

    // Verifikasi tombol resolve muncul
    const resolveBtn = wrapper.find('[data-testid="blocker-resolve-button"]');
    expect(resolveBtn.exists()).toBe(true);
  });
});
