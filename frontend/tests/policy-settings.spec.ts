import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises, DOMWrapper } from '@vue/test-utils';
import { policiesApi } from '../src/api/policies.api.js';
import { apiClient } from '../src/api/client.js';
import {
  POLICY_KEYS,
  usePoliciesQuery,
  usePolicyHistoryQuery,
  useCreatePolicyMutation,
} from '../src/queries/usePolicies.js';
import type { PolicyCategory, CreatePolicyPayload, PolicyItem } from '../src/types/management.js';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, type App } from 'vue';
import { vuetify } from '../src/plugins/vuetify.js';
import PolicySettingsPage from '../src/pages/PolicySettingsPage.vue';
import PolicyVersionHistory from '../src/components/management/PolicyVersionHistory.vue';

// Polyfill window.visualViewport & ResizeObserver for Vuetify VOverlay in happy-dom
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

describe('Policy Settings & PolicyModule Alignment (SAD §5.9, §10.9, ADR-005, ADR-006, ADR-008)', () => {
  let queryClient: QueryClient;
  let app: App;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    app = createApp({});
    app.use(VueQueryPlugin, { queryClient });
    vi.clearAllMocks();
  });

  describe('policiesApi client (SAD §10.9)', () => {
    it('getPolicies harus memanggil GET /policies tanpa query param jika category tidak disediakan', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [],
      } as any);

      const res = await policiesApi.getPolicies();

      expect(getSpy).toHaveBeenCalledWith('/policies');
      expect(res.data).toEqual([]);
    });

    it('getPolicies harus memanggil GET /policies?category=... dengan kategori yang benar', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [
          {
            id: 'pol-1',
            category: 'Cutoff',
            value: { morningOnTimeDeadline: '09:00', eodOnTimeDeadline: '18:00' },
            effectiveDate: '2026-01-01',
            status: 'Active',
            createdByUserId: 'u-1',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      } as any);

      const res = await policiesApi.getPolicies('Cutoff');

      expect(getSpy).toHaveBeenCalledWith('/policies?category=Cutoff');
      expect(res.data).toHaveLength(1);
      expect(res.data[0].category).toBe('Cutoff');
    });

    it('getPolicyHistory harus memanggil GET /policies/:category/history', async () => {
      const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
        data: [
          {
            id: 'pol-hist-1',
            category: 'CoachingFollowUpPeriod',
            value: { coachingWindowDays: 14 },
            effectiveDate: '2026-01-01',
            status: 'Active',
            createdByUserId: 'u-1',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      } as any);

      const res = await policiesApi.getPolicyHistory('CoachingFollowUpPeriod');

      expect(getSpy).toHaveBeenCalledWith('/policies/CoachingFollowUpPeriod/history');
      expect(res.data).toHaveLength(1);
    });

    it('createPolicy harus memanggil POST /policies dengan payload value (bukan parameters)', async () => {
      const payload: CreatePolicyPayload = {
        category: 'EscalationThreshold',
        effectiveDate: '2026-10-01',
        value: { unacknowledgedThresholdHours: 4 },
      };

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
        data: {
          id: 'pol-new-1',
          ...payload,
          status: 'Active',
          createdByUserId: 'u-admin',
          createdAt: '2026-10-01T00:00:00Z',
        },
      } as any);

      const res = await policiesApi.createPolicy(payload);

      expect(postSpy).toHaveBeenCalledWith('/policies', payload);
      expect(res.data.value).toEqual({ unacknowledgedThresholdHours: 4 });
      // Verifikasi eksplisit bahwa field 'parameters' lama tidak dikirim
      expect((res.data as any).parameters).toBeUndefined();
    });
  });

  describe('TanStack Query Hooks (usePolicies.ts)', () => {
    it('POLICY_KEYS harus konsisten untuk cache invalidation', () => {
      expect(POLICY_KEYS.all).toEqual(['policies']);
      expect(POLICY_KEYS.list()).toEqual(['policies', 'list', undefined]);
      expect(POLICY_KEYS.list('Cutoff')).toEqual(['policies', 'list', 'Cutoff']);
      expect(POLICY_KEYS.history('Cutoff')).toEqual(['policies', 'history', 'Cutoff']);
    });

    it('usePoliciesQuery harus mengembalikan array PolicyItem langsung dari res.data', async () => {
      const mockPolicies: PolicyItem[] = [
        {
          id: 'pol-1',
          category: 'Cutoff',
          value: { morningOnTimeDeadline: '09:00', eodOnTimeDeadline: '18:00' },
          effectiveDate: '2026-01-01',
          status: 'Active',
          createdByUserId: 'u-1',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      vi.spyOn(policiesApi, 'getPolicies').mockResolvedValue({
        data: mockPolicies,
        meta: { timestamp: '2026-10-01T00:00:00Z' },
      });

      const query = app.runWithContext(() => usePoliciesQuery());
      const result = await query.refetch();

      expect(result.data).toEqual(mockPolicies);
    });

    it('usePolicyHistoryQuery harus mengembalikan riwayat kebijakan dari res.data', async () => {
      const mockHistory: PolicyItem[] = [
        {
          id: 'pol-h1',
          category: 'ObjectionWindowDuration',
          value: { durationHours: 24 },
          effectiveDate: '2026-01-01',
          status: 'Active',
          createdByUserId: 'u-1',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      vi.spyOn(policiesApi, 'getPolicyHistory').mockResolvedValue({
        data: mockHistory,
        meta: { timestamp: '2026-10-01T00:00:00Z' },
      });

      const query = app.runWithContext(() => usePolicyHistoryQuery('ObjectionWindowDuration'));
      const result = await query.refetch();

      expect(result.data).toEqual(mockHistory);
    });

    it('useCreatePolicyMutation harus memanggil createPolicy dan meng-invalidsi POLICY_KEYS.all', async () => {
      const payload: CreatePolicyPayload = {
        category: 'GracePeriod',
        effectiveDate: '2026-10-01',
        value: { morningGraceMinutes: 15, eodGraceMinutes: 15 },
      };

      vi.spyOn(policiesApi, 'createPolicy').mockResolvedValue({
        data: {
          id: 'p-new',
          ...payload,
          status: 'Active',
          createdByUserId: 'admin-1',
          createdAt: '2026-10-01T00:00:00Z',
        },
        meta: { timestamp: '2026-10-01T00:00:00Z' },
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const mutation = app.runWithContext(() => useCreatePolicyMutation());
      await mutation.mutateAsync(payload);

      expect(policiesApi.createPolicy).toHaveBeenCalledWith(payload);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: POLICY_KEYS.all });
    });
  });

  describe('PolicySettingsPage.vue Component Testing', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    function mountPage(initialPolicies: PolicyItem[] = []) {
      queryClient.setQueryData(POLICY_KEYS.list(), initialPolicies);
      return mount(PolicySettingsPage, {
        attachTo: document.body,
        global: {
          plugins: [
            vuetify,
            [VueQueryPlugin, { queryClient }],
          ],
        },
      });
    }

    describe('A. Initial Render', () => {
      it('harus me-render judul halaman h1 dan deskripsi subtitle', () => {
        const wrapper = mountPage([]);
        const h1 = wrapper.find('h1');
        expect(h1.exists()).toBe(true);
        expect(h1.text()).toBe('Policy Settings');
        expect(wrapper.text()).toContain('Pengaturan Parameter Kebijakan Tata Tertib Kerja & Batasan Sistem (SAD §5.9, §10.9)');
      });

      it('harus me-render tepat 11 kartu kategori kebijakan resmi di DOM', () => {
        const wrapper = mountPage([]);
        const cards = wrapper.findAll('[data-testid^="policy-card-"]');
        expect(cards).toHaveLength(11);

        const expectedCategories: PolicyCategory[] = [
          'Cutoff',
          'GracePeriod',
          'WorkdayCalendar',
          'EscalationThreshold',
          'CoachingFollowUpPeriod',
          'RetentionPeriod',
          'ExemptionRule',
          'ObjectionWindowDuration',
          'MinorMaterialThreshold',
          'ParticipationRule',
          'ReminderThreshold',
        ];

        for (const cat of expectedCategories) {
          const card = wrapper.find(`[data-testid="policy-card-${cat}"]`);
          expect(card.exists()).toBe(true);
        }
      });
    });

    describe('B. Category UI Contract & Value Preview', () => {
      it('harus menampilkan chip "Default" dan nilai bawaan sistem saat belum ada kebijakan aktif', () => {
        const wrapper = mountPage([]);
        const cutoffCard = wrapper.find('[data-testid="policy-card-Cutoff"]');
        expect(cutoffCard.exists()).toBe(true);
        expect(cutoffCard.text()).toContain('Default');
        expect(cutoffCard.text()).toContain('morningOnTimeDeadline');
        expect(cutoffCard.text()).toContain('"09:00"');
        expect(cutoffCard.text()).toContain('eodOnTimeDeadline');
        expect(cutoffCard.text()).toContain('"18:00"');
        expect(cutoffCard.text()).toContain('Menggunakan Default Konfigurasi Awal');
      });

      it('harus menampilkan chip "Aktif" dan nilai database saat data kebijakan aktif tersedia', () => {
        const activePolicies: PolicyItem[] = [
          {
            id: 'pol-esc-1',
            category: 'EscalationThreshold',
            value: { unacknowledgedThresholdHours: 6 },
            effectiveDate: '2026-09-01T00:00:00Z',
            status: 'Active',
            createdByUserId: 'u-admin',
            createdAt: '2026-09-01T00:00:00Z',
          },
        ];

        const wrapper = mountPage(activePolicies);
        const escCard = wrapper.find('[data-testid="policy-card-EscalationThreshold"]');
        expect(escCard.text()).toContain('Aktif');
        expect(escCard.text()).toContain('unacknowledgedThresholdHours');
        expect(escCard.text()).toContain('6');
        expect(escCard.text()).toContain('Berlaku Sejak:');
      });

      it('harus membedakan 9 kategori editable vs 2 kategori read-only pada DOM', () => {
        const wrapper = mountPage([]);

        const editableCategories: PolicyCategory[] = [
          'Cutoff',
          'GracePeriod',
          'WorkdayCalendar',
          'EscalationThreshold',
          'CoachingFollowUpPeriod',
          'RetentionPeriod',
          'ObjectionWindowDuration',
          'MinorMaterialThreshold',
          'ReminderThreshold',
        ];

        for (const cat of editableCategories) {
          const editBtn = wrapper.find(`[data-testid="btn-edit-${cat}"]`);
          expect(editBtn.exists()).toBe(true);
          expect(editBtn.text()).toContain('Perbarui Kebijakan');
        }

        const readOnlyCategories: PolicyCategory[] = ['ExemptionRule', 'ParticipationRule'];
        for (const cat of readOnlyCategories) {
          const editBtn = wrapper.find(`[data-testid="btn-edit-${cat}"]`);
          expect(editBtn.exists()).toBe(false);
        }
      });
    });

    describe('C & D. Edit Interaction & Submission Payload', () => {
      it('harus membuka modal edit, mengisi form, dan mengirim payload { category, effectiveDate, value } ke API', async () => {
        const wrapper = mountPage([]);

        const createSpy = vi.spyOn(policiesApi, 'createPolicy').mockResolvedValue({
          data: {
            id: 'pol-new-1',
            category: 'EscalationThreshold',
            effectiveDate: '2026-10-15',
            value: { unacknowledgedThresholdHours: 4 },
            status: 'Active',
            createdByUserId: 'u-admin',
            createdAt: '2026-10-01T00:00:00Z',
          },
          meta: { timestamp: '2026-10-01T00:00:00Z' },
        });

        // 1. Klik tombol edit pada kartu EscalationThreshold
        const editBtn = wrapper.find('[data-testid="btn-edit-EscalationThreshold"]');
        await editBtn.trigger('click');
        await flushPromises();

        // 2. Verifikasi dialog edit terbuka di document.body
        expect(document.body.textContent).toContain('Perbarui Kebijakan: Ambang Eskalasi Blocker');

        // 3. Modifikasi nilai JSON pada textarea
        const textareaEl = document.querySelector('textarea') as HTMLTextAreaElement;
        expect(textareaEl).not.toBeNull();
        const textarea = new DOMWrapper(textareaEl);
        await textarea.setValue(JSON.stringify({ unacknowledgedThresholdHours: 4 }, null, 2));

        // 4. Modifikasi tanggal efektif jika ada
        const dateInputEl = document.querySelector('input[type="date"]') as HTMLInputElement;
        if (dateInputEl) {
          const dateInput = new DOMWrapper(dateInputEl);
          await dateInput.setValue('2026-10-15');
        }

        // 5. Submit form
        const submitBtnEl = document.querySelector('[data-testid="btn-submit-policy"]') as HTMLElement;
        expect(submitBtnEl).not.toBeNull();
        const submitBtn = new DOMWrapper(submitBtnEl);
        await submitBtn.trigger('click');
        await flushPromises();

        // 6. Verifikasi payload yang dikirim ke policiesApi.createPolicy
        expect(createSpy).toHaveBeenCalledWith({
          category: 'EscalationThreshold',
          effectiveDate: expect.any(String),
          value: { unacknowledgedThresholdHours: 4 },
        });
        // Pastikan tidak ada field 'parameters' lama atau field tambahan
        expect(createSpy.mock.calls[0][0]).not.toHaveProperty('parameters');
      });
    });

    describe('E. Read-Only Categories (ExemptionRule & ParticipationRule)', () => {
      it('ExemptionRule harus menampilkan banner read-only ADR-005 dan tombol terkunci disabled', () => {
        const wrapper = mountPage([]);
        const card = wrapper.find('[data-testid="policy-card-ExemptionRule"]');
        expect(card.exists()).toBe(true);

        // Tidak ada tombol edit
        expect(card.find('[data-testid="btn-edit-ExemptionRule"]').exists()).toBe(false);

        // Banner read-only
        expect(card.text()).toContain('Aturan pengecualian dikelola otomatis melalui modul pengajuan cuti dan kalender libur (ADR-005).');

        // Tombol disabled
        const lockedBtn = card.find('button[disabled]');
        expect(lockedBtn.exists()).toBe(true);
        expect(lockedBtn.text()).toContain('Terkunci (ADR)');
      });

      it('ParticipationRule harus menampilkan banner read-only ADR-006 dan tombol terkunci disabled', () => {
        const wrapper = mountPage([]);
        const card = wrapper.find('[data-testid="policy-card-ParticipationRule"]');
        expect(card.exists()).toBe(true);

        // Tidak ada tombol edit
        expect(card.find('[data-testid="btn-edit-ParticipationRule"]').exists()).toBe(false);

        // Banner read-only
        expect(card.text()).toContain('Batasan kuota 1-3 komitmen harian dikunci sebagai konstanta produk (ADR-006, BR-01).');

        // Tombol disabled
        const lockedBtn = card.find('button[disabled]');
        expect(lockedBtn.exists()).toBe(true);
        expect(lockedBtn.text()).toContain('Terkunci (ADR)');
      });
    });

    describe('F. Frontend JSON Validation', () => {
      it('harus menolak submit dan menampilkan pesan error jika format JSON tidak valid', async () => {
        const wrapper = mountPage([]);
        const createSpy = vi.spyOn(policiesApi, 'createPolicy');

        // Buka edit Cutoff
        await wrapper.find('[data-testid="btn-edit-Cutoff"]').trigger('click');
        await flushPromises();

        // Masukkan JSON rusak (syntax error)
        const textareaEl = document.querySelector('textarea') as HTMLTextAreaElement;
        expect(textareaEl).not.toBeNull();
        const textarea = new DOMWrapper(textareaEl);
        await textarea.setValue('{ invalid_json: ');

        // Klik submit
        const submitBtnEl = document.querySelector('[data-testid="btn-submit-policy"]') as HTMLElement;
        expect(submitBtnEl).not.toBeNull();
        const submitBtn = new DOMWrapper(submitBtnEl);
        await submitBtn.trigger('click');
        await flushPromises();

        // API tidak boleh dipanggil
        expect(createSpy).not.toHaveBeenCalled();

        // Pesan error harus muncul di dialog
        expect(document.body.textContent).toContain('JSON');
      });
    });

    describe('G. Error Handling (Mutation Rejection)', () => {
      it('harus menampilkan pesan error jika API backend menolak permohonan perubahan policy', async () => {
        const wrapper = mountPage([]);

        vi.spyOn(policiesApi, 'createPolicy').mockRejectedValue(
          new Error('Nilai kebijakan tidak valid untuk kategori EscalationThreshold'),
        );

        // Buka edit dialog
        await wrapper.find('[data-testid="btn-edit-EscalationThreshold"]').trigger('click');
        await flushPromises();

        // Submit
        const submitBtnEl = document.querySelector('[data-testid="btn-submit-policy"]') as HTMLElement;
        expect(submitBtnEl).not.toBeNull();
        const submitBtn = new DOMWrapper(submitBtnEl);
        await submitBtn.trigger('click');
        await flushPromises();

        // Dialog harus menampilkan pesan error dari backend
        expect(document.body.textContent).toContain('Nilai kebijakan tidak valid untuk kategori EscalationThreshold');
      });
    });

    describe('H. Success & Refresh Behavior', () => {
      it('harus menutup modal dan memanggil refetch setelah submit berhasil', async () => {
        const wrapper = mountPage([]);

        vi.spyOn(policiesApi, 'createPolicy').mockResolvedValue({
          data: {
            id: 'pol-new-2',
            category: 'GracePeriod',
            effectiveDate: '2026-10-01',
            value: { morningGraceMinutes: 30, eodGraceMinutes: 30 },
            status: 'Active',
            createdByUserId: 'u-1',
            createdAt: '2026-10-01T00:00:00Z',
          },
          meta: { timestamp: '2026-10-01T00:00:00Z' },
        });

        const getSpy = vi.spyOn(policiesApi, 'getPolicies').mockResolvedValue({
          data: [],
          meta: { timestamp: '2026-10-01T00:00:00Z' },
        });

        // Buka edit GracePeriod
        await wrapper.find('[data-testid="btn-edit-GracePeriod"]').trigger('click');
        await flushPromises();
        expect(document.body.textContent).toContain('Perbarui Kebijakan: Toleransi Keterlambatan');

        // Submit
        const submitBtnEl = document.querySelector('[data-testid="btn-submit-policy"]') as HTMLElement;
        expect(submitBtnEl).not.toBeNull();
        const submitBtn = new DOMWrapper(submitBtnEl);
        await submitBtn.trigger('click');
        await flushPromises();

        // 1. getPolicies harus dipanggil kembali (refetch)
        expect(getSpy).toHaveBeenCalled();

        // 2. Modal edit harus ditutup
        expect((wrapper.vm as any).showEditModal).toBe(false);
      });
    });

    describe('I. Policy Version History Parent-Child Integration', () => {
      it('harus membuka dialog PolicyVersionHistory dengan kategori yang dipilih saat tombol Riwayat Versi diklik', async () => {
        const wrapper = mountPage([]);

        // 1. Temukan tombol 'Riwayat Versi' pada kartu Cutoff
        const cutoffCard = wrapper.find('[data-testid="policy-card-Cutoff"]');
        expect(cutoffCard.exists()).toBe(true);
        const historyBtn = cutoffCard.findAll('button').find((btn) => btn.text().includes('Riwayat Versi'));
        expect(historyBtn).toBeDefined();
        expect(historyBtn!.exists()).toBe(true);

        // 2. Klik tombol riwayat versi
        await historyBtn!.trigger('click');
        await flushPromises();

        // 3. Verifikasi dialog PolicyVersionHistory ter-mount dengan prop category yang benar
        const historyComponent = wrapper.findComponent(PolicyVersionHistory);
        expect(historyComponent.exists()).toBe(true);
        expect(historyComponent.props('category')).toBe('Cutoff');
      });
    });
  });
});
