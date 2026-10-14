import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { useAuthStore } from '../src/stores/auth.store.js';
import { DAILY_RECORDS_KEYS } from '../src/queries/useDailyRecords.js';
import MyTodayPage from '../src/pages/MyTodayPage.vue';
import {
  ROLE_BASED_PROMPT_HINTS,
  DEFAULT_PROMPT_HINT,
  getRoleBasedPrompt,
} from '../src/constants/daily-records.constants.js';
import type { Role, AuthUser } from '../src/types/auth.js';

// Polyfills for happy-dom environment (Vuetify overlay and observer requirements)
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

describe('S2-FR-12-1 / ADR-016: Role-Based Output Prompt Hints', () => {
  describe('A. Static Dictionary & Helper Unit Tests', () => {
    it('harus memuat tepat 7 fungsi kanonikal sesuai ADR-016 Decision 1 & 6', () => {
      const canonicalFunctions = [
        'Engineering',
        'Ops & Infra',
        'Finance',
        'Sales Enablement',
        'Delivery',
        'HRGA',
        'Management',
      ];
      expect(Object.keys(ROLE_BASED_PROMPT_HINTS).sort()).toEqual(canonicalFunctions.sort());
    });

    it('harus memiliki copy baku persis sesuai ADR-016 Decision 6', () => {
      expect(ROLE_BASED_PROMPT_HINTS['Engineering']).toBe(
        'Contoh: Menyelesaikan implementasi fitur dan memastikan perubahan siap diuji',
      );
      expect(ROLE_BASED_PROMPT_HINTS['Ops & Infra']).toBe(
        'Contoh: Menyelesaikan konfigurasi atau pekerjaan infrastruktur yang direncanakan hari ini',
      );
      expect(ROLE_BASED_PROMPT_HINTS['Finance']).toBe(
        'Contoh: Menyelesaikan rekonsiliasi atau proses administrasi keuangan yang menjadi prioritas hari ini',
      );
      expect(ROLE_BASED_PROMPT_HINTS['Sales Enablement']).toBe(
        'Contoh: Menyelesaikan materi atau kebutuhan pendukung aktivitas penjualan hari ini',
      );
      expect(ROLE_BASED_PROMPT_HINTS['Delivery']).toBe(
        'Contoh: Menyelesaikan koordinasi atau pekerjaan yang mendukung delivery proyek hari ini',
      );
      expect(ROLE_BASED_PROMPT_HINTS['HRGA']).toBe(
        'Contoh: Menyelesaikan proses administrasi atau kebutuhan operasional karyawan hari ini',
      );
      expect(ROLE_BASED_PROMPT_HINTS['Management']).toBe(
        'Contoh: Menyelesaikan prioritas koordinasi atau keputusan yang perlu ditindaklanjuti hari ini',
      );
    });

    it('harus memiliki teks fallback baku persis sesuai ADR-016 Decision 7', () => {
      expect(DEFAULT_PROMPT_HINT).toBe(
        'Contoh: Tuliskan rencana pekerjaan yang ingin Anda selesaikan hari ini',
      );
    });

    it('getRoleBasedPrompt harus melakukan trim pada nama fungsi', () => {
      expect(getRoleBasedPrompt('  Engineering  ')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);
      expect(getRoleBasedPrompt(' Finance ')).toBe(ROLE_BASED_PROMPT_HINTS['Finance']);
    });

    it('getRoleBasedPrompt harus mengembalikan fallback untuk fungsi null, undefined, kosong, whitespace, atau unmapped', () => {
      expect(getRoleBasedPrompt(null)).toBe(DEFAULT_PROMPT_HINT);
      expect(getRoleBasedPrompt(undefined)).toBe(DEFAULT_PROMPT_HINT);
      expect(getRoleBasedPrompt('')).toBe(DEFAULT_PROMPT_HINT);
      expect(getRoleBasedPrompt('   ')).toBe(DEFAULT_PROMPT_HINT);
      expect(getRoleBasedPrompt('UnknownDepartment')).toBe(DEFAULT_PROMPT_HINT);
      expect(getRoleBasedPrompt('Developer')).toBe(DEFAULT_PROMPT_HINT); // Developer is not a function key in ADR-016
      expect(getRoleBasedPrompt('PM')).toBe(DEFAULT_PROMPT_HINT); // PM is a role, not a function
    });
  });

  describe('B. MyTodayPage.vue Component-Level Integration Tests', () => {
    let queryClient: QueryClient;
    let pinia: ReturnType<typeof createPinia>;
    let authStore: ReturnType<typeof useAuthStore>;

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      pinia = createPinia();
      setActivePinia(pinia);
      authStore = useAuthStore();

      // Seed query client with today record state before check-in submission
      queryClient.setQueryData(DAILY_RECORDS_KEYS.today(), {
        id: 'rec-test-01',
        date: '2026-10-04',
        morningSubmittedAt: null,
        cutoffLockedAt: null,
        eodSubmittedAt: null,
        commitments: [],
      });

      vi.clearAllMocks();
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    function mountMyTodayPage() {
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

    function createAuthUser(userFunction: string | null, role: Role = 'Employee'): AuthUser {
      return {
        userId: 'user-001',
        email: 'user@dutamedia.com',
        role,
        function: userFunction,
        directManagerId: 'mgr-001',
        mustResetPassword: false,
      };
    }

    describe('1. 7 Canonical Functions Verification on Actual Component DOM', () => {
      const canonicalCases: Array<[string, string]> = [
        ['Engineering', ROLE_BASED_PROMPT_HINTS['Engineering']],
        ['Ops & Infra', ROLE_BASED_PROMPT_HINTS['Ops & Infra']],
        ['Finance', ROLE_BASED_PROMPT_HINTS['Finance']],
        ['Sales Enablement', ROLE_BASED_PROMPT_HINTS['Sales Enablement']],
        ['Delivery', ROLE_BASED_PROMPT_HINTS['Delivery']],
        ['HRGA', ROLE_BASED_PROMPT_HINTS['HRGA']],
        ['Management', ROLE_BASED_PROMPT_HINTS['Management']],
      ];

      it.each(canonicalCases)(
        'harus me-render prompt %s pada textarea komitmen MyTodayPage',
        async (fnName, expectedPrompt) => {
          authStore.setUser(createAuthUser(fnName));
          const wrapper = mountMyTodayPage();
          await flushPromises();

          const textarea = wrapper.find('textarea');
          expect(textarea.exists()).toBe(true);
          expect(textarea.attributes('placeholder')).toBe(expectedPrompt);
          wrapper.unmount();
        },
      );
    });

    describe('2. Fallback Scenarios on Actual Component DOM', () => {
      it('harus me-render fallback jika authStore.user.function bernilai null', async () => {
        authStore.setUser(createAuthUser(null));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(DEFAULT_PROMPT_HINT);
        wrapper.unmount();
      });

      it('harus me-render fallback jika authStore.user.function adalah string kosong', async () => {
        authStore.setUser(createAuthUser(''));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(DEFAULT_PROMPT_HINT);
        wrapper.unmount();
      });

      it('harus me-render fallback jika authStore.user.function hanya berisi whitespace', async () => {
        authStore.setUser(createAuthUser('   '));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(DEFAULT_PROMPT_HINT);
        wrapper.unmount();
      });

      it('harus me-render fallback jika authStore.user.function tidak dikenal (unmapped)', async () => {
        authStore.setUser(createAuthUser('QualityAssurance'));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(DEFAULT_PROMPT_HINT);
        wrapper.unmount();
      });

      it('harus me-render fallback jika authStore.user adalah null (sesi unauthenticated/uninitialized)', async () => {
        authStore.setUser(null);
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(DEFAULT_PROMPT_HINT);
        wrapper.unmount();
      });
    });

    describe('3. Slot Invariance (#1, #2, #3) on Actual Component DOM', () => {
      it('harus menampilkan prompt yang persis sama di slot #1, #2, dan #3 (idx bukan selector)', async () => {
        authStore.setUser(createAuthUser('Engineering'));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        // Initial state: 1 slot
        let textareas = wrapper.findAll('textarea');
        expect(textareas).toHaveLength(1);
        expect(textareas[0].attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);

        // Tambah slot #2 dengan mengklik tombol "Tambah Slot Komitmen"
        const addButtons = wrapper.findAll('button');
        const addSlotBtn = addButtons.find((btn) => btn.text().includes('Tambah Slot Komitmen'));
        expect(addSlotBtn?.exists()).toBe(true);

        await addSlotBtn!.trigger('click');
        await flushPromises();

        textareas = wrapper.findAll('textarea');
        expect(textareas).toHaveLength(2);
        expect(textareas[0].attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);
        expect(textareas[1].attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);

        // Tambah slot #3
        const addSlotBtn2 = wrapper.findAll('button').find((btn) => btn.text().includes('Tambah Slot Komitmen'));
        await addSlotBtn2!.trigger('click');
        await flushPromises();

        textareas = wrapper.findAll('textarea');
        expect(textareas).toHaveLength(3);
        expect(textareas[0].attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);
        expect(textareas[1].attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);
        expect(textareas[2].attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);

        wrapper.unmount();
      });
    });

    describe('4. Role Independence on Actual Component Production Wiring', () => {
      const allRoles: Role[] = [
        'Employee',
        'Supervisor_TL',
        'Head',
        'Head_Dept',
        'PM',
        'HRGA',
        'CEO_Management',
        'CEO_Director',
        'SystemAdmin',
      ];

      it.each(allRoles)(
        'komponen MyTodayPage harus konsisten merender prompt Finance ketika role=%s dan function=Finance',
        async (role) => {
          authStore.setUser(createAuthUser('Finance', role));
          const wrapper = mountMyTodayPage();
          await flushPromises();

          const textarea = wrapper.find('textarea');
          expect(textarea.attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Finance']);
          wrapper.unmount();
        },
      );

      it('memastikan selector komponen tidak terikat pada role PM ketika function=Delivery', async () => {
        authStore.setUser(createAuthUser('Delivery', 'PM'));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        // Harus menggunakan fungsi Delivery, bukan peran PM
        expect(textarea.attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Delivery']);
        wrapper.unmount();
      });
    });

    describe('5. Dynamic Reactivity on Function Change', () => {
      it('harus secara reaktif memperbarui placeholder saat authStore.user.function berubah tanpa reload', async () => {
        authStore.setUser(createAuthUser('Engineering'));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);

        // Ubah fungsi pada store aktif
        authStore.setUser(createAuthUser('HRGA'));
        await flushPromises();

        expect(textarea.attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['HRGA']);

        // Ubah ke fungsi yang unmapped -> fallback
        authStore.setUser(createAuthUser('NonExistentDepartment'));
        await flushPromises();

        expect(textarea.attributes('placeholder')).toBe(DEFAULT_PROMPT_HINT);

        wrapper.unmount();
      });
    });

    describe('6. Non-persistence & Non-contamination of User Input Value', () => {
      it('placeholder tidak mengontaminasi nilai input dan slot.description tetap kosong pada initial render', async () => {
        authStore.setUser(createAuthUser('Engineering'));
        const wrapper = mountMyTodayPage();
        await flushPromises();

        const textarea = wrapper.find('textarea');
        expect(textarea.attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);
        // Nilai aktual input textarea harus kosong
        expect((textarea.element as HTMLTextAreaElement).value).toBe('');

        // Pengguna mengetik teks komitmen aktual
        await textarea.setValue('Menyelesaikan implementasi modul integrasi');
        expect((textarea.element as HTMLTextAreaElement).value).toBe(
          'Menyelesaikan implementasi modul integrasi',
        );

        // Setelah dihapus kembali, textarea kosong dan placeholder tetap utuh
        await textarea.setValue('');
        expect((textarea.element as HTMLTextAreaElement).value).toBe('');
        expect(textarea.attributes('placeholder')).toBe(ROLE_BASED_PROMPT_HINTS['Engineering']);

        wrapper.unmount();
      });
    });
  });
});
