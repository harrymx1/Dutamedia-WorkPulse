import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EodCorrectionRequestView from './EodCorrectionRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('EodCorrectionRequestView.vue (WP-EP09 / Prototipe 16b - Koreksi Evaluasi Sore EOD)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Deployment staging environment',
                    outcome: 'BLOCKED',
                    outcomeReason: 'Server memory penuh',
                    continuation: 'CONTINUE_TOMORROW',
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/corrections/eod', component: EodCorrectionRequestView },
        { path: '/corrections/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      ],
    });
  });

  it('renders EOD baseline and outcome selection choices without green lock (DEC-003)', async () => {
    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Permohonan Koreksi Evaluasi Sore (EOD)');
    expect(wrapper.text()).toContain('Baseline EOD Tersimpan');
    expect(wrapper.text()).toContain('Deployment staging environment');
    expect(wrapper.text()).toContain('DONE (Tuntas)');
    expect(wrapper.text()).toContain('IN_PROGRESS');
    expect(wrapper.text()).toContain('BLOCKED');
  });

  it('shows empty state card when user has no commitments today', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { record: null },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Tidak Ada Komitmen Hari Ini');
    expect(wrapper.text()).toContain('Buka Morning Commitment');
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('maps DB outcome/continuation enums to form controls and renders reviewer notes in history', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              record: {
                commitments: [
                  {
                    id: 'com-1',
                    sequenceNo: 1,
                    taskText: 'Perbaikan pipeline CI',
                    outcome: 'NOT_COMPLETED',
                    outcomeReason: 'Sertifikat runner kedaluwarsa',
                    continuation: 'CONTINUE',
                  },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [
            {
              id: 'cr-eod-rej',
              scopeType: 'EOD_OUTCOME',
              classification: 'MATERIAL',
              reason: 'Usul dibatalkan',
              status: 'REJECTED',
              reviewNote: 'Tugas tetap harus dikerjakan.',
              valueBefore: { outcome: 'NOT_COMPLETED' },
              valueRequested: { outcome: 'DROPPED' },
              createdAt: '2026-11-19T12:00:00.000Z',
            },
          ],
        }),
      });
    }));

    const wrapper = mount(EodCorrectionRequestView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const blockedRadio = wrapper.find('input[type="radio"][value="BLOCKED"]') as any;
    const continuationSelect = wrapper.find('#continuationSelect') as any;
    expect((blockedRadio.element as HTMLInputElement).checked).toBe(true);
    expect((continuationSelect.element as HTMLSelectElement).value).toBe('CONTINUE_TOMORROW');

    const reviewNoteBox = wrapper.find('.hist-review-note.rejected');
    expect(reviewNoteBox.exists()).toBe(true);
    expect(reviewNoteBox.text()).toContain('Tugas tetap harus dikerjakan.');
  });
});

