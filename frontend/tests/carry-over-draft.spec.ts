import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { useAuthStore } from '../src/stores/auth.store.js';
import { DAILY_RECORDS_KEYS } from '../src/queries/useDailyRecords.js';
import { dailyRecordsApi } from '../src/api/daily-records.api.js';
import MyTodayPage from '../src/pages/MyTodayPage.vue';
import type { CarryOverDraftItem, TodayRecordResponse } from '../src/types/daily-records.js';

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

describe('S2-FR-11-1 / ADR-017: Carry-Over Draft Component Integration Tests', () => {
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

    vi.spyOn(dailyRecordsApi, 'getTodayRecord').mockResolvedValue({
      data: {
        record: null,
        carryOverDraft: [],
        availableActions: ['morning_checkin'],
      },
      meta: { timestamp: new Date().toISOString() },
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function setTodayData(data: TodayRecordResponse) {
    queryClient.setQueryData(DAILY_RECORDS_KEYS.today(), data);
  }

  function mountComponent() {
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
          RaiseBlockerModal: true,
          ValidationPromptModal: true,
          CorrectionRequestModal: true,
        },
      },
    });
  }

  describe('1. Draft Banner Rendering & Visibility', () => {
    it('tidak boleh merender banner jika carryOverDraft kosong', async () => {
      setTodayData({
        record: null,
        carryOverDraft: [],
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find('[data-testid="draft-banner"]').exists()).toBe(false);
    });

    it('harus merender banner dengan detail draft jika carryOverDraft tersedia', async () => {
      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-prev-1',
          sourceType: 'Commitment',
          text: 'Penyelesaian integrasi payment gateway',
          referenceLink: 'https://jira.dutamedia.com/PROJ-101',
          continuationReason: 'Menunggu review code lead',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      const banner = wrapper.find('[data-testid="draft-banner"]');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Draft Komitmen Lanjutan dari Hari Kemarin (1)');
      expect(banner.text()).toContain('Penyelesaian integrasi payment gateway');
      expect(banner.text()).toContain('Menunggu review code lead');
      expect(banner.text()).toContain('https://jira.dutamedia.com/PROJ-101');
    });

    it('tidak boleh merender banner jika morning checkin sudah diserahkan', async () => {
      setTodayData({
        record: {
          id: 'rec-today-01',
          employeeUserId: 'user-emp-1',
          workDate: '2026-10-04',
          morningSubmittedAt: '2026-10-04T08:30:00Z',
          cutoffLockedAt: null,
          eodSubmittedAt: null,
          statusOverridden: false,
          commitments: [],
          createdAt: '2026-10-04T08:30:00Z',
          updatedAt: '2026-10-04T08:30:00Z',
        },
        carryOverDraft: [
          {
            sourceCommitmentId: 'c-prev-1',
            sourceType: 'Commitment',
            text: 'Should not show',
          },
        ],
        availableActions: ['eod_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.find('[data-testid="draft-banner"]').exists()).toBe(false);
    });

    it('wajib mendeteksi contract violation jika draft tidak memiliki sourceCommitmentId', async () => {
      const invalidDrafts = [
        {
          sourceType: 'Commitment',
          text: 'Draft invalid tanpa ID',
        } as any,
      ];

      setTodayData({
        record: null,
        carryOverDraft: invalidDrafts,
        availableActions: ['morning_checkin'],
      });

      // Vue component should throw on computed evaluation
      expect(() => {
        mountComponent();
      }).toThrow('API Contract Violation: CarryOverDraftItem missing sourceCommitmentId');
    });
  });

  describe('2. Confirm as-is and Edit Actions (Non-submitting)', () => {
    it('Confirm as-is: harus memasukkan draft ke slot form tanpa melakukan submit API', async () => {
      const submitSpy = vi.spyOn(dailyRecordsApi, 'submitMorningCheckin');

      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-101',
          sourceType: 'Commitment',
          text: 'Implementasi fitur copy forward',
          referenceLink: 'https://jira/PROJ-55',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      const confirmBtn = wrapper.find('[data-testid="btn-confirm-c-101"]');
      expect(confirmBtn.exists()).toBe(true);

      await confirmBtn.trigger('click');
      await flushPromises();

      // Form slot #1 harus terisi
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Implementasi fitur copy forward');

      // Tombol submit API tidak boleh terpanggil (Zero auto-submit)
      expect(submitSpy).not.toHaveBeenCalled();

      // Card draft ditandai sebagai sudah dimasukkan
      expect(wrapper.find('[data-testid="badge-applied"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-remove-c-101"]').exists()).toBe(true);
    });

    it('Edit: harus memasukkan draft ke slot form dan memungkinkan user mengedit', async () => {
      const submitSpy = vi.spyOn(dailyRecordsApi, 'submitMorningCheckin');

      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-102',
          sourceType: 'Commitment',
          text: 'Review dokumentasi teknis',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      const editBtn = wrapper.find('[data-testid="btn-edit-c-102"]');
      await editBtn.trigger('click');
      await flushPromises();

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Review dokumentasi teknis');

      // User menyunting teks secara manual
      await textarea.setValue('Review dokumentasi teknis v2 (revisi)');
      expect(textarea.element.value).toBe('Review dokumentasi teknis v2 (revisi)');

      // Zero submit
      expect(submitSpy).not.toHaveBeenCalled();
    });
  });

  describe('3. Draft Identity & Multiple Drafts with Identical Text (D2)', () => {
    it('harus membedakan dua draft dengan teks identik berdasarkan sourceCommitmentId', async () => {
      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-identical-1',
          sourceType: 'Commitment',
          text: 'Pekerjaan review kode PR',
        },
        {
          sourceCommitmentId: 'c-identical-2',
          sourceType: 'Commitment',
          text: 'Pekerjaan review kode PR',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      const btn1 = wrapper.find('[data-testid="btn-confirm-c-identical-1"]');
      const btn2 = wrapper.find('[data-testid="btn-confirm-c-identical-2"]');
      expect(btn1.exists()).toBe(true);
      expect(btn2.exists()).toBe(true);

      // Gunakan draft 1
      await btn1.trigger('click');
      await flushPromises();

      // Draft 1 sudah terpakai
      expect(wrapper.find('[data-testid="btn-remove-c-identical-1"]').exists()).toBe(true);

      // Draft 2 dengan teks identik HARUS TETAP DAPAT DIGUNAKAN
      expect(wrapper.find('[data-testid="btn-confirm-c-identical-2"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-confirm-c-identical-2"]').attributes('disabled')).toBeUndefined();

      // Gunakan draft 2 ke slot berikutnya
      await wrapper.find('[data-testid="btn-confirm-c-identical-2"]').trigger('click');
      await flushPromises();

      // Keduanya sekarang berstatus terpakai
      expect(wrapper.find('[data-testid="btn-remove-c-identical-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-remove-c-identical-2"]').exists()).toBe(true);

      const allTextareas = wrapper.findAll('textarea');
      expect(allTextareas.length).toBe(2);
      expect(allTextareas[0].element.value).toBe('Pekerjaan review kode PR');
      expect(allTextareas[1].element.value).toBe('Pekerjaan review kode PR');
    });

    it('harus melepaskan draft saat tombol Lepas dari Slot diklik', async () => {
      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-release-1',
          sourceType: 'Commitment',
          text: 'Task yang akan dilepas',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      // Gunakan draft
      await wrapper.find('[data-testid="btn-confirm-c-release-1"]').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="btn-remove-c-release-1"]').exists()).toBe(true);

      // Lepas draft
      await wrapper.find('[data-testid="btn-remove-c-release-1"]').trigger('click');
      await flushPromises();

      // Tombol Gunakan harus kembali aktif
      expect(wrapper.find('[data-testid="btn-confirm-c-release-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="badge-applied"]').exists()).toBe(false);
    });
  });

  describe('4. Max-3 Filled-Capacity Guard', () => {
    it('form dengan 3 slot kosong tetap memungkinkan user memasukkan 3 draft', async () => {
      const drafts: CarryOverDraftItem[] = [
        { sourceCommitmentId: 'c-d1', sourceType: 'Commitment', text: 'Draft Satu' },
        { sourceCommitmentId: 'c-d2', sourceType: 'Commitment', text: 'Draft Dua' },
        { sourceCommitmentId: 'c-d3', sourceType: 'Commitment', text: 'Draft Tiga' },
        { sourceCommitmentId: 'c-d4', sourceType: 'Commitment', text: 'Draft Empat' },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      // User menekan Tambah Slot Komitmen 2 kali sehingga ada 3 slot form kosong
      const addSlotBtn = wrapper.findAll('button').find((b) => b.text().includes('Tambah Slot Komitmen'));
      expect(addSlotBtn).toBeDefined();
      await addSlotBtn!.trigger('click'); // slot length: 2
      await addSlotBtn!.trigger('click'); // slot length: 3

      expect(wrapper.findAll('textarea').length).toBe(3);

      // Masukkan draft 1 -> masuk ke slot 1 kosong
      await wrapper.find('[data-testid="btn-confirm-c-d1"]').trigger('click');
      await flushPromises();
      expect(wrapper.findAll('textarea')[0].element.value).toBe('Draft Satu');

      // Masukkan draft 2 -> masuk ke slot 2 kosong
      await wrapper.find('[data-testid="btn-confirm-c-d2"]').trigger('click');
      await flushPromises();
      expect(wrapper.findAll('textarea')[1].element.value).toBe('Draft Dua');

      // Masukkan draft 3 -> masuk ke slot 3 kosong
      await wrapper.find('[data-testid="btn-confirm-c-d3"]').trigger('click');
      await flushPromises();
      expect(wrapper.findAll('textarea')[2].element.value).toBe('Draft Tiga');

      // Kapasitas terisi sekarang 3/3 -> isMaxCapacityReached = true
      expect(wrapper.find('[data-testid="max-capacity-alert"]').exists()).toBe(true);

      // Draft 4 tombolnya harus disabled
      const btn4 = wrapper.find('[data-testid="btn-confirm-c-d4"]');
      expect(btn4.attributes('disabled')).toBeDefined();

      // Total slot tidak pernah menjadi 4
      expect(wrapper.findAll('textarea').length).toBe(3);
    });

    it('kombinasi entri manual dan draft tidak boleh melebihi batas 3 komitmen', async () => {
      const drafts: CarryOverDraftItem[] = [
        { sourceCommitmentId: 'c-combo-1', sourceType: 'Commitment', text: 'Draft Combo 1' },
        { sourceCommitmentId: 'c-combo-2', sourceType: 'Commitment', text: 'Draft Combo 2' },
        { sourceCommitmentId: 'c-combo-3', sourceType: 'Commitment', text: 'Draft Combo 3' },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      // Isi slot #1 secara manual
      const textarea1 = wrapper.find('textarea');
      await textarea1.setValue('Tugas manual saya');

      // Gunakan draft combo 1 -> membuat slot #2
      await wrapper.find('[data-testid="btn-confirm-c-combo-1"]').trigger('click');
      await flushPromises();
      expect(wrapper.findAll('textarea').length).toBe(2);

      // Gunakan draft combo 2 -> membuat slot #3
      await wrapper.find('[data-testid="btn-confirm-c-combo-2"]').trigger('click');
      await flushPromises();
      expect(wrapper.findAll('textarea').length).toBe(3);

      // Sekarang 3 komitmen terisi, draft combo 3 harus terkunci (disabled)
      expect(wrapper.find('[data-testid="max-capacity-alert"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-confirm-c-combo-3"]').attributes('disabled')).toBeDefined();
    });
  });

  describe('5. Clean Payload Guarantee & Submission Validation', () => {
    it('sourceCommitmentId tidak boleh masuk ke payload MorningCheckinPayload saat submit', async () => {
      let sentPayload: any = null;
      vi.spyOn(dailyRecordsApi, 'submitMorningCheckin').mockImplementation(async (payload) => {
        sentPayload = payload;
        return { data: {} as any, meta: { timestamp: new Date().toISOString() } };
      });

      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-secret-id-999',
          sourceType: 'Commitment',
          text: 'Pekerjaan rahasia id',
          referenceLink: 'https://jira/ref-1',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      // Masukkan draft ke slot 1
      await wrapper.find('[data-testid="btn-confirm-c-secret-id-999"]').trigger('click');
      await flushPromises();

      // Tekan tombol Serahkan Morning Commitment
      const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Serahkan Morning Commitment'));
      expect(submitBtn).toBeDefined();
      await submitBtn!.trigger('click');
      await flushPromises();

      expect(sentPayload).not.toBeNull();
      expect(sentPayload.commitments).toHaveLength(1);

      const submittedCommitment = sentPayload.commitments[0];
      expect(submittedCommitment.sequenceNo).toBe(1);
      expect(submittedCommitment.text).toBe('Pekerjaan rahasia id');
      expect(submittedCommitment.referenceLink).toBe('https://jira/ref-1');
      expect(submittedCommitment.initialRisk).toBe('GREEN');

      // WAJIB: sourceCommitmentId TIDAK ADA di payload
      expect(submittedCommitment.sourceCommitmentId).toBeUndefined();
      expect(sentPayload.sourceCommitmentId).toBeUndefined();
    });

    it('tetap memvalidasi Known Blocker & Support Needed saat draft diubah ke AMBER/RED', async () => {
      const drafts: CarryOverDraftItem[] = [
        {
          sourceCommitmentId: 'c-risk-1',
          sourceType: 'Commitment',
          text: 'Pekerjaan berisiko tinggi',
        },
      ];

      setTodayData({
        record: null,
        carryOverDraft: drafts,
        availableActions: ['morning_checkin'],
      });

      const wrapper = mountComponent();
      await flushPromises();

      // Masukkan draft
      await wrapper.find('[data-testid="btn-confirm-c-risk-1"]').trigger('click');
      await flushPromises();

      // Akses vm untuk mengubah initialRisk menjadi AMBER tanpa mengisi blocker
      (wrapper.vm as any).commitmentSlots[0].initialRisk = 'AMBER';
      await flushPromises();

      // Tekan tombol Serahkan
      const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Serahkan Morning Commitment'));
      await submitBtn!.trigger('click');
      await flushPromises();

      // Harus menampilkan pesan error validasi
      expect((wrapper.vm as any).morningError).toContain('mewajibkan pengisian Known Blocker & Support Needed');
    });
  });
});
