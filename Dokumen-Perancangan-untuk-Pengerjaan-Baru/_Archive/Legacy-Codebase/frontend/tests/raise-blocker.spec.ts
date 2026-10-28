import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { useAuthStore } from '../src/stores/auth.store.js';
import { DAILY_RECORDS_KEYS } from '../src/queries/useDailyRecords.js';
import { dailyRecordsApi } from '../src/api/daily-records.api.js';
import { blockersApi } from '../src/api/blockers.api.js';
import MyTodayPage from '../src/pages/MyTodayPage.vue';
import RaiseBlockerModal from '../src/components/self-service/RaiseBlockerModal.vue';
import type { TodayRecordResponse, DailyAccountabilityRecord } from '../src/types/daily-records.js';

// Polyfills for happy-dom environment
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

describe('S2-FR-15-1 & S2-SEC-FR15-1: Blocker from Daily Record & Instant Blocker Flow', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    pinia = createPinia();
    setActivePinia(pinia);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const authStore = useAuthStore();
    authStore.user = {
      userId: 'user-emp-1',
      email: 'employee@dutamedia.com',
      role: 'Employee',
      function: 'Engineering',
      directManagerId: 'mgr-1',
      mustResetPassword: false,
    };

    vi.spyOn(blockersApi, 'getPotentialOwners').mockResolvedValue({
      data: {
        users: [
          {
            id: 'owner-user-1',
            fullName: 'Manager One',
            email: 'mgr1@dutamedia.com',
            role: 'Supervisor_TL',
            function: 'Engineering',
          },
        ],
      },
      meta: { timestamp: new Date().toISOString() },
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('A. RaiseBlockerModal.vue Component Unit Tests', () => {
    function mountModal(props: {
      modelValue: boolean;
      commitmentId?: string;
      commitmentDescription?: string;
    }) {
      return mount(RaiseBlockerModal, {
        props,
        attachTo: document.body,
        global: {
          plugins: [
            pinia,
            vuetify,
            [VueQueryPlugin, { queryClient }],
          ],
        },
      });
    }

    it('instant blocker: modal title menampilkan "Raise Instant Blocker" dan tidak ada alert konteks komitmen', async () => {
      mountModal({
        modelValue: true,
      });
      await flushPromises();

      const text = document.body.textContent;
      expect(text).toContain('Raise Instant Blocker');
      const alert = document.querySelector('[data-testid="commitment-context-alert"]');
      expect(alert).toBeNull();
    });

    it('contextual blocker: modal title menampilkan "Laporkan Blocker untuk Komitmen" dan menampilkan ringkasan komitmen', async () => {
      mountModal({
        modelValue: true,
        commitmentId: 'commit-456',
        commitmentDescription: 'Menyelesaikan modul migrasi database auth',
      });
      await flushPromises();

      const text = document.body.textContent;
      expect(text).toContain('Laporkan Blocker untuk Komitmen');
      const alert = document.querySelector('[data-testid="commitment-context-alert"]');
      expect(alert).not.toBeNull();
      expect(alert?.textContent).toContain('Menyelesaikan modul migrasi database auth');
    });

    it('contextual blocker: mengirim linkedCommitmentId dan payload sesuai CreateBlockerDto saat submit', async () => {
      const createSpy = vi.spyOn(blockersApi, 'createBlocker').mockResolvedValue({
        data: {
          id: 'new-blocker-1',
          type: 'Technical',
          severity: 'Critical',
          status: 'Open',
          linkedCommitmentId: 'commit-456',
        } as any,
        meta: { timestamp: new Date().toISOString() },
      });

      const wrapper = mountModal({
        modelValue: true,
        commitmentId: 'commit-456',
        commitmentDescription: 'Menyelesaikan modul migrasi database auth',
      });
      await flushPromises();

      // Form fields
      (wrapper.vm as any).impact = 'Database down di staging';

      // Bypass form validate mock if needed and call handleSubmit
      if ((wrapper.vm as any).formRef) {
        (wrapper.vm as any).formRef.validate = vi.fn().mockResolvedValue({ valid: true });
      }
      await (wrapper.vm as any).handleSubmit();
      await flushPromises();

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Technical',
          severity: 'Medium',
          ownerNeededType: 'OrganizationalAuthority',
          impact: 'Database down di staging',
          linkedCommitmentId: 'commit-456',
        }),
      );
    });

    it('instant blocker: mengirim linkedCommitmentId undefined ke blockersApi.createBlocker saat submit', async () => {
      const createSpy = vi.spyOn(blockersApi, 'createBlocker').mockResolvedValue({
        data: {
          id: 'instant-blocker-1',
          type: 'Technical',
          severity: 'Medium',
          status: 'Open',
        } as any,
        meta: { timestamp: new Date().toISOString() },
      });

      const wrapper = mountModal({
        modelValue: true,
      });
      await flushPromises();

      // Set form fields
      (wrapper.vm as any).impact = 'Internet kantor drop';

      if ((wrapper.vm as any).formRef) {
        (wrapper.vm as any).formRef.validate = vi.fn().mockResolvedValue({ valid: true });
      }
      await (wrapper.vm as any).handleSubmit();
      await flushPromises();

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Technical',
          severity: 'Medium',
          ownerNeededType: 'OrganizationalAuthority',
          impact: 'Internet kantor drop',
          linkedCommitmentId: undefined,
        }),
      );
    });

    it('project authority: menampilkan input scope reference dan mengirim relatedScopeReference ke backend', async () => {
      const createSpy = vi.spyOn(blockersApi, 'createBlocker').mockResolvedValue({
        data: {
          id: 'proj-blocker-1',
          type: 'ScopeOrRequirement',
          severity: 'High',
          status: 'Open',
        } as any,
        meta: { timestamp: new Date().toISOString() },
      });

      const wrapper = mountModal({
        modelValue: true,
      });
      await flushPromises();

      // Ubah ke ProjectAuthority
      (wrapper.vm as any).ownerNeededType = 'ProjectAuthority';
      (wrapper.vm as any).relatedScopeReference = 'PROJ-CORE-PAYMENT';
      (wrapper.vm as any).impact = 'Spesifikasi integrasi payment gateway belum final';

      if ((wrapper.vm as any).formRef) {
        (wrapper.vm as any).formRef.validate = vi.fn().mockResolvedValue({ valid: true });
      }
      await (wrapper.vm as any).handleSubmit();
      await flushPromises();

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Technical',
          severity: 'Medium',
          ownerNeededType: 'ProjectAuthority',
          relatedScopeReference: 'PROJ-CORE-PAYMENT',
          impact: 'Spesifikasi integrasi payment gateway belum final',
        }),
      );
    });

    it('penanganan error transparan: menampilkan pesan error di UI ketika createBlocker gagal', async () => {
      vi.spyOn(blockersApi, 'createBlocker').mockRejectedValue({
        response: {
          status: 400,
          data: {
            message: ['Dampak blocker minimal 5 karakter', 'Tipe blocker tidak valid'],
          },
        },
      });

      const wrapper = mountModal({
        modelValue: true,
      });
      await flushPromises();

      (wrapper.vm as any).impact = 'Valid';
      if ((wrapper.vm as any).formRef) {
        (wrapper.vm as any).formRef.validate = vi.fn().mockResolvedValue({ valid: true });
      }
      await (wrapper.vm as any).handleSubmit();
      await flushPromises();

      expect((wrapper.vm as any).errorMessage).toContain('Dampak blocker minimal 5 karakter');
      expect((wrapper.vm as any).errorMessage).toContain('Tipe blocker tidak valid');
    });
  });

  describe('B. MyTodayPage.vue Integration Tests (Contextual Blocker Proximity Action)', () => {
    const mockSubmittedRecord: DailyAccountabilityRecord = {
      id: 'record-today-1',
      employeeUserId: 'user-emp-1',
      workDate: '2026-10-04',
      workType: 'WFO',
      morningSubmittedAt: '2026-10-04T08:30:00Z',
      eodSubmittedAt: null,
      cutoffLockedAt: null,
      morningCutoffTiming: 'OnTime',
      eodCutoffTiming: null,
      finalStatus: null,
      status: null,
      statusSuggested: null,
      statusOverridden: false,
      statusOverrideReason: null,
      tomorrowPriority: null,
      commitments: [
        {
          id: 'commit-uuid-1',
          dailyRecordId: 'record-today-1',
          description: 'Implementasi API rate limiting',
          referenceUrl: 'https://github.com/issue/101',
          initialRisk: 'GREEN',
          knownBlocker: null,
          supportNeeded: null,
          continuation: null,
          continuationReason: null,
          createdAt: '2026-10-04T08:30:00Z',
          updatedAt: '2026-10-04T08:30:00Z',
        },
        {
          id: 'commit-uuid-2',
          dailyRecordId: 'record-today-1',
          description: 'Refactoring auth token revocation',
          referenceUrl: null,
          initialRisk: 'AMBER',
          knownBlocker: 'Menunggu review tim DevOps',
          supportNeeded: 'Approval access staging',
          continuation: null,
          continuationReason: null,
          createdAt: '2026-10-04T08:30:00Z',
          updatedAt: '2026-10-04T08:30:00Z',
        },
      ],
      additionalWorks: [],
      blockers: [],
      createdAt: '2026-10-04T08:00:00Z',
      updatedAt: '2026-10-04T08:30:00Z',
    };

    function mountMyTodayPage(recordData: DailyAccountabilityRecord | null) {
      const todayResponse: TodayRecordResponse = {
        record: recordData,
        carryOverDraft: [],
        availableActions: recordData ? ['add_additional_work', 'submit_eod'] : ['morning_checkin'],
      };

      vi.spyOn(dailyRecordsApi, 'getTodayRecord').mockResolvedValue({
        data: todayResponse,
        meta: { timestamp: new Date().toISOString() },
      });

      queryClient.setQueryData(DAILY_RECORDS_KEYS.today(), todayResponse);

      return mount(MyTodayPage, {
        attachTo: document.body,
        global: {
          plugins: [
            pinia,
            vuetify,
            [VueQueryPlugin, { queryClient }],
          ],
          stubs: {
            AdditionalWorkModal: true,
            ValidationPromptModal: true,
            CorrectionRequestModal: true,
          },
        },
      });
    }

    it('merender tombol "Laporkan Blocker" pada setiap kartu komitmen yang telah diserahkan', async () => {
      const wrapper = mountMyTodayPage(mockSubmittedRecord);
      await flushPromises();

      const btn1 = wrapper.find('[data-testid="btn-raise-blocker-commit-uuid-1"]');
      const btn2 = wrapper.find('[data-testid="btn-raise-blocker-commit-uuid-2"]');

      expect(btn1.exists()).toBe(true);
      expect(btn1.text()).toContain('Laporkan Blocker');
      expect(btn2.exists()).toBe(true);
      expect(btn2.text()).toContain('Laporkan Blocker');
    });

    it('merender tombol "Raise Instant Blocker" di header halaman', async () => {
      const wrapper = mountMyTodayPage(mockSubmittedRecord);
      await flushPromises();

      const instantBtn = wrapper.find('[data-testid="btn-raise-instant-blocker"]');
      expect(instantBtn.exists()).toBe(true);
      expect(instantBtn.text()).toContain('Raise Instant Blocker');
    });

    it('klik "Laporkan Blocker" pada komitmen 1 membuka modal dengan konteks komitmen 1', async () => {
      const wrapper = mountMyTodayPage(mockSubmittedRecord);
      await flushPromises();

      const btn1 = wrapper.find('[data-testid="btn-raise-blocker-commit-uuid-1"]');
      await btn1.trigger('click');
      await flushPromises();

      expect((wrapper.vm as any).showRaiseBlockerModal).toBe(true);
      expect((wrapper.vm as any).selectedBlockerCommitment?.id).toBe('commit-uuid-1');
      expect((wrapper.vm as any).selectedBlockerCommitment?.description).toBe(
        'Implementasi API rate limiting',
      );

      const modal = wrapper.findComponent(RaiseBlockerModal);
      expect(modal.exists()).toBe(true);
      expect(modal.props('commitmentId')).toBe('commit-uuid-1');
      expect(modal.props('commitmentDescription')).toBe('Implementasi API rate limiting');
    });

    it('klik "Raise Instant Blocker" di header membuka modal tanpa konteks komitmen', async () => {
      const wrapper = mountMyTodayPage(mockSubmittedRecord);
      await flushPromises();

      // Buka dulu dari commitment
      const btn1 = wrapper.find('[data-testid="btn-raise-blocker-commit-uuid-1"]');
      await btn1.trigger('click');
      await flushPromises();
      expect((wrapper.vm as any).selectedBlockerCommitment?.id).toBe('commit-uuid-1');

      // Sekarang klik Instant Blocker di header -> konteks harus di-reset
      const instantBtn = wrapper.find('[data-testid="btn-raise-instant-blocker"]');
      await instantBtn.trigger('click');
      await flushPromises();

      expect((wrapper.vm as any).showRaiseBlockerModal).toBe(true);
      expect((wrapper.vm as any).selectedBlockerCommitment).toBeNull();

      const modal = wrapper.findComponent(RaiseBlockerModal);
      expect(modal.props('commitmentId')).toBeUndefined();
      expect(modal.props('commitmentDescription')).toBeUndefined();
    });

    it('menutup modal me-reset selectedBlockerCommitment menjadi null', async () => {
      const wrapper = mountMyTodayPage(mockSubmittedRecord);
      await flushPromises();

      const btn1 = wrapper.find('[data-testid="btn-raise-blocker-commit-uuid-1"]');
      await btn1.trigger('click');
      await flushPromises();
      expect((wrapper.vm as any).selectedBlockerCommitment?.id).toBe('commit-uuid-1');

      // Tutup modal
      (wrapper.vm as any).showRaiseBlockerModal = false;
      await (wrapper.vm as any).$nextTick();

      const modal = wrapper.findComponent(RaiseBlockerModal);
      await modal.vm.$emit('update:modelValue', false);
      await flushPromises();

      expect((wrapper.vm as any).selectedBlockerCommitment).toBeNull();
    });
  });
});
