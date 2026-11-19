import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CorrectionReviewView from './CorrectionReviewView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('CorrectionReviewView.vue (WP-EP09 / Prototipe 22 - Review Koreksi & Jendela Sanggahan)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: [
          {
            id: 'cr-material',
            scopeType: 'MORNING_COMMITMENT',
            classification: 'MATERIAL',
            reason: 'Perubahan prioritas tugas mendadak',
            valueBefore: { taskText: 'Tugas A' },
            valueRequested: { taskText: 'Tugas A Patch Darurat' },
            status: 'PENDING',
            objectionWindowEndsAt: '2026-10-29T10:00:00.000Z',
            createdAt: '2026-10-28T10:00:00.000Z',
            requestedByUser: { id: 'u-1', fullName: 'Alice Dev', email: 'alice@dutamedia.com' },
            targetCommitment: { sequenceNo: 1, taskText: 'Tugas A' },
          },
        ],
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/corrections/review', component: CorrectionReviewView },
        { path: '/compliance', component: { template: '<div>Compliance</div>' } },
        { path: '/exemptions', component: { template: '<div>Exemptions</div>' } },
      ],
    });
  });

  it('renders pending material correction requests with diff and approval actions', async () => {
    const wrapper = mount(CorrectionReviewView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Correction & Leave Review');
    expect(wrapper.text()).toContain('Permohonan Koreksi Material');
    expect(wrapper.text()).toContain('Alice Dev');
    expect(wrapper.text()).toContain('Tugas A');
    expect(wrapper.text()).toContain('Tugas A Patch Darurat');
    expect(wrapper.text()).toContain('Setujui');
    expect(wrapper.text()).toContain('Tolak');
  });

  it('opens review confirmation modal when Setujui is clicked', async () => {
    const wrapper = mount(CorrectionReviewView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const approveBtn = wrapper.find('.btn-decision.approve');
    expect(approveBtn.exists()).toBe(true);
    await approveBtn.trigger('click');

    expect(wrapper.text()).toContain('Setujui Permohonan Koreksi');
  });

  it('displays Belum diisi instead of raw JSON when EOD valueBefore outcome is null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: [
          {
            id: 'cr-eod-null',
            scopeType: 'EOD_OUTCOME',
            classification: 'MATERIAL',
            reason: 'Koreksi hasil akhir tugas pertama',
            valueBefore: { outcome: null, continuation: null, outcomeReason: null },
            valueRequested: { outcome: 'IN_PROGRESS' },
            status: 'PENDING',
            objectionWindowEndsAt: '2026-11-20T10:00:00.000Z',
            createdAt: '2026-11-19T10:00:00.000Z',
            requestedByUser: { id: 'u-1', fullName: 'Aditya Nugroho', email: 'dev.frontend@dutamedia.com' },
            targetCommitment: { sequenceNo: 1, taskText: 'Navigasi mobile' },
          },
        ],
      }),
    }));

    const wrapper = mount(CorrectionReviewView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Belum diisi');
    expect(wrapper.text()).toContain('IN_PROGRESS');
    expect(wrapper.text()).not.toContain('"outcome":null');
  });
});

