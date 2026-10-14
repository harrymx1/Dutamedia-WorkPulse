import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { vuetify } from '../src/plugins/vuetify.js';
import { apiClient } from '../src/api/client.js';
import { dailyRecordsApi } from '../src/api/daily-records.api.js';
import { notificationsApi } from '../src/api/notifications.api.js';
import CorrectionRequestModal from '../src/components/self-service/CorrectionRequestModal.vue';
import NotificationsPage from '../src/pages/NotificationsPage.vue';

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

describe('S3-T2 Remediation: DEF-01 (Correction Request Contract)', () => {
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

  it('DEF-01: dailyRecordsApi.requestCorrection mengirimkan POST ke /correction-requests dengan format backend', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 'corr-123', status: 'Pending' },
      meta: mockMeta,
    });

    const payload = {
      targetCommitmentId: '550e8400-e29b-41d4-a716-446655440000',
      requestedChange: { text: 'Perubahan deskripsi komitmen setelah cut-off' },
      reason: 'Koreksi penulisan scope tugas',
    };

    const res = await dailyRecordsApi.requestCorrection(payload);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('/correction-requests', {
      targetCommitmentId: '550e8400-e29b-41d4-a716-446655440000',
      requestedChange: { text: 'Perubahan deskripsi komitmen setelah cut-off' },
      reason: 'Koreksi penulisan scope tugas',
    });
    expect(res.data).toEqual({ id: 'corr-123', status: 'Pending' });
  });

  it('DEF-01: dailyRecordsApi.requestCorrection mendukung legacy fallback payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 'corr-legacy', status: 'Pending' },
      meta: mockMeta,
    });

    const legacyPayload = {
      commitmentId: '550e8400-e29b-41d4-a716-446655440001',
      proposedDescription: 'Legacy description format',
      reason: 'Legacy reason',
    } as any;

    await dailyRecordsApi.requestCorrection(legacyPayload);

    expect(postSpy).toHaveBeenCalledWith('/correction-requests', {
      targetCommitmentId: '550e8400-e29b-41d4-a716-446655440001',
      requestedChange: { text: 'Legacy description format' },
      reason: 'Legacy reason',
    });
  });

  it('DEF-01: CorrectionRequestModal mengirimkan targetCommitmentId dan requestedChange ke backend', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 'corr-modal-1', status: 'Pending' },
      meta: mockMeta,
    });

    const wrapper = mount(CorrectionRequestModal, {
      props: {
        modelValue: true,
        commitmentId: '550e8400-e29b-41d4-a716-446655440002',
        currentDescription: 'Deskripsi Awal',
      },
      global: {
        plugins: [vuetify, pinia, [VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    // Set model values secara programmatic
    (wrapper.vm as any).proposedDescription = 'Deskripsi Baru Yang Dikoreksi';
    (wrapper.vm as any).reason = 'Justifikasi perubahan target';
    if ((wrapper.vm as any).formRef) {
      (wrapper.vm as any).formRef.validate = vi.fn().mockResolvedValue({ valid: true });
    }

    await (wrapper.vm as any).handleSubmit();
    await flushPromises();

    expect(postSpy).toHaveBeenCalledWith('/correction-requests', {
      targetCommitmentId: '550e8400-e29b-41d4-a716-446655440002',
      requestedChange: { text: 'Deskripsi Baru Yang Dikoreksi' },
      reason: 'Justifikasi perubahan target',
    });
    expect(wrapper.emitted('success')).toBeTruthy();
  });

  it('DEF-01: CorrectionRequestModal menangkap error dan menampilkan errorMessage ke user', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new Error('Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini'),
    );

    const wrapper = mount(CorrectionRequestModal, {
      props: {
        modelValue: true,
        commitmentId: '550e8400-e29b-41d4-a716-446655440002',
        currentDescription: 'Deskripsi Awal',
      },
      global: {
        plugins: [vuetify, pinia, [VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    (wrapper.vm as any).proposedDescription = 'Deskripsi Baru';
    (wrapper.vm as any).reason = 'Alasan';
    if ((wrapper.vm as any).formRef) {
      (wrapper.vm as any).formRef.validate = vi.fn().mockResolvedValue({ valid: true });
    }

    await (wrapper.vm as any).handleSubmit();
    await flushPromises();

    expect((wrapper.vm as any).errorMessage).toContain(
      'Masih terdapat pengajuan koreksi yang berstatus Pending untuk komitmen ini',
    );
    expect(wrapper.emitted('success')).toBeFalsy();
  });
});

describe('S3-T2 Remediation: DEF-02 (Notification Mark-as-Read Contract)', () => {
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

  it('DEF-02: notificationsApi.markAsRead memanggil POST /notifications/:id/mark-read', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { id: 'notif-1', status: 'Read' },
      meta: mockMeta,
    });

    const res = await notificationsApi.markAsRead('550e8400-e29b-41d4-a716-446655440010');

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('/notifications/550e8400-e29b-41d4-a716-446655440010/mark-read');
    expect(res.data).toEqual({ id: 'notif-1', status: 'Read' });
  });

  it('DEF-02: notificationsApi.markAllAsRead memanggil POST /notifications/mark-all-read', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { count: 5 },
      meta: mockMeta,
    });

    const res = await notificationsApi.markAllAsRead();

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('/notifications/mark-all-read');
    expect(res.data).toEqual({ count: 5 });
  });

  it('DEF-02: NotificationsPage menampilkan pesan error ketika tandai semua dibaca gagal', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        items: [
          {
            id: 'notif-1',
            status: 'Sent',
            triggerType: 'CUTOFF_REMINDER',
            channel: 'Web',
            payload: { title: 'Peringatan Cutoff', body: 'Harap segera checkin' },
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        unreadCount: 1,
      },
      meta: mockMeta,
    });

    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Network error mark-all-read'));

    const wrapper = mount(NotificationsPage, {
      global: {
        plugins: [vuetify, pinia, [VueQueryPlugin, { queryClient }]],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await flushPromises();

    const markAllBtn = wrapper.findAll('button').find((b) => b.text().includes('Tandai Semua Dibaca'));
    expect(markAllBtn).toBeDefined();

    await markAllBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Network error mark-all-read');
  });
});
