import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ComplianceQueueView from './ComplianceQueueView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ComplianceQueueView.vue (WP-EP08 / Prototipe 11 - Antrean Kepatuhan HRGA)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/compliance/summary')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              totalEvents: 3,
              openCount: 2,
              patternCount: 1,
              warningCount: 1,
              escalationCount: 1,
              noSubmissionCount: 0,
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
              id: 'ev-1',
              userId: 'u-1',
              eventDate: '2026-10-28',
              stage: 'PATTERN_FLAG_3X',
              followUpStatus: 'OPEN',
              user: { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
              followUpManagerNote: null,
            },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/compliance', component: ComplianceQueueView },
        { path: '/exemptions', component: { template: '<div>Exemptions</div>' } },
        { path: '/corrections/review', component: { template: '<div>Review</div>' } },
      ],
    });
  });

  it('renders compliance summary cards and event queue list in clean Indonesian without raw stage/status codes', async () => {
    const wrapper = mount(ComplianceQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Antrean Kepatuhan & Tindak Lanjut HRGA');
    expect(wrapper.text()).toContain('Pola 3x (Stage 1)');
    expect(wrapper.text()).toContain('Budi Staf');
    expect(wrapper.text()).toContain('Pola Terlambat 3x');
    expect(wrapper.text()).toContain('Belum Ditangani');
    expect(wrapper.text()).toContain('Tindak Lanjut');
    expect(wrapper.text()).not.toContain('PATTERN_FLAG_3X');
    expect(wrapper.text()).not.toContain('(OPEN)');
    expect(wrapper.text()).not.toContain('(ADDRESSED)');
  });

  it('opens address follow-up modal with clean Indonesian fields and enforces min 5 chars', async () => {
    const wrapper = mount(ComplianceQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const actionBtn = wrapper.find('.btn-action');
    expect(actionBtn.exists()).toBe(true);
    await actionBtn.trigger('click');

    expect(wrapper.text()).toContain('Tindak Lanjut Peristiwa Kepatuhan');
    expect(wrapper.text()).toContain('Catatan Tindak Lanjut / Pembinaan');
    expect(wrapper.text()).toContain('Simpan Tindak Lanjut');
    expect(wrapper.text()).not.toContain('UUID');
    expect(wrapper.text()).not.toContain('Tandai ADDRESSED');

    const submitBtn = wrapper.find('.modal-foot .btn-primary');
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true);

    const textarea = wrapper.find('#followUpNoteInput');
    await textarea.setValue('abc');
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true);

    await textarea.setValue('Sudah dibina bersama kepala divisi');
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false);
  });

  it('displays Ubah Catatan on ADDRESSED row and pre-fills note content instead of UUID', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/compliance/summary')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { totalEvents: 1, openCount: 0, patternCount: 0, warningCount: 0, escalationCount: 0, noSubmissionCount: 1 },
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
              id: 'ev-2',
              userId: 'u-2',
              eventDate: '2026-10-28',
              stage: 'NO_SUBMISSION',
              followUpStatus: 'ADDRESSED',
              followUpManagerNoteId: '99999999-aaaa-bbbb-cccc-111111111111',
              user: { id: 'u-2', fullName: 'Siti Rahma', email: 'siti@dutamedia.com' },
              followUpManagerNote: {
                id: '99999999-aaaa-bbbb-cccc-111111111111',
                content: 'Sudah diingatkan untuk melapor tepat waktu',
                authorUser: { fullName: 'Hendra Wijaya' },
              },
            },
          ],
        }),
      });
    }));

    const wrapper = mount(ComplianceQueueView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Tidak Check-in');
    expect(wrapper.text()).toContain('Sudah Ditangani');
    expect(wrapper.text()).toContain('Hendra Wijaya:');
    expect(wrapper.text()).toContain('Ubah Catatan');

    await wrapper.find('.btn-action').trigger('click');
    const textarea = wrapper.find('#followUpNoteInput');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Sudah diingatkan untuk melapor tepat waktu');
    expect((textarea.element as HTMLTextAreaElement).value).not.toContain('99999999-aaaa');
  });
});

