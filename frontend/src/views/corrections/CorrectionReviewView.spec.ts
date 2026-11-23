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
        { path: '/leave/queue', component: { template: '<div>Leave Queue</div>' } },
        { path: '/compliance', component: { template: '<div>Compliance</div>' } },
        { path: '/exemptions', component: { template: '<div>Exemptions</div>' } },
      ],
    });
  });

  it('renders pending material correction requests with Indonesian labels, 2-letter initials, and leave link', async () => {
    const wrapper = mount(CorrectionReviewView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Review Koreksi & Cuti');
    expect(wrapper.text()).not.toContain('SAD 2.4');
    expect(wrapper.text()).toContain('Permohonan Koreksi Material');
    expect(wrapper.find('.user-avatar').text()).toBe('AD');
    expect(wrapper.text()).toContain('Koreksi Komitmen Pagi');
    expect(wrapper.text()).not.toContain('MORNING_COMMITMENT');
    expect(wrapper.find('[data-testid="link-leave-queue"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Alice Dev');
    expect(wrapper.text()).toContain('Tugas A');
    expect(wrapper.text()).toContain('Tugas A Patch Darurat');
    expect(wrapper.text()).toContain('Setujui');
    expect(wrapper.text()).toContain('Tolak');
  });

  it('opens review confirmation modal with diff summary, requester reason, and validates >= 5 trimmed chars', async () => {
    const wrapper = mount(CorrectionReviewView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const approveBtn = wrapper.find('.btn-decision.approve');
    expect(approveBtn.exists()).toBe(true);
    await approveBtn.trigger('click');

    expect(wrapper.text()).toContain('Setujui Permohonan Koreksi');
    expect(wrapper.find('[data-testid="modal-diff-summary"]').text()).toContain('Tugas A Patch Darurat');
    expect(wrapper.find('[data-testid="modal-diff-summary"]').text()).toContain('Perubahan prioritas tugas mendadak');

    // Clear with whitespace only -> inline error without POST
    await wrapper.find('#reviewNoteInput').setValue('     ');
    expect(wrapper.find('[data-testid="review-note-counter"]').text()).toContain('0 / 5 karakter minimum');
    await wrapper.find('.modal-foot .btn-primary').trigger('click');
    expect(wrapper.find('[data-testid="modal-error"]').text()).toContain('minimal 5 karakter');
  });

  it('displays Belum diisi and structured labels without raw JSON for EOD, Morning risk/link, and filters', async () => {
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
            valueRequested: { outcome: 'IN_PROGRESS', continuation: 'CONTINUE_TOMORROW', outcomeReason: 'Lanjut uji integrasi besok' },
            status: 'PENDING',
            objectionWindowEndsAt: '2026-11-20T10:00:00.000Z',
            createdAt: '2026-11-19T10:00:00.000Z',
            requestedByUser: {
              id: 'u-1',
              fullName: 'Aditya Nugroho',
              email: 'dev.frontend@dutamedia.com',
              role: 'EMPLOYEE',
              function: 'Engineering',
            },
            targetCommitment: { sequenceNo: 1, taskText: 'Navigasi mobile' },
          },
          {
            id: 'cr-morning-risk',
            scopeType: 'MORNING_COMMITMENT',
            classification: 'MATERIAL',
            reason: 'Eskalasi risiko API eksternal',
            valueBefore: { taskText: 'Integrasi gateway', initialRisk: 'GREEN', referenceLink: null },
            valueRequested: { taskText: 'Integrasi gateway', initialRisk: 'RED', referenceLink: 'https://github.com/dutamedia/pr/99' },
            status: 'APPROVED',
            reviewedAt: '2026-11-20T04:00:00.000Z',
            reviewNote: 'Disahkan oleh Head Delivery',
            reviewedByUser: { id: 'mgr-1', fullName: 'Dharma Putra' },
            createdAt: '2026-11-19T11:00:00.000Z',
            requestedByUser: {
              id: 'u-2',
              fullName: 'Dimas Prakoso',
              email: 'pm@dutamedia.com',
              role: 'PROJECT_MANAGER',
              function: 'Delivery',
            },
            targetCommitment: { sequenceNo: 2, taskText: 'Integrasi gateway' },
          },
        ],
      }),
    }));

    const wrapper = mount(CorrectionReviewView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    // Default PENDING shows Aditya EOD row cleanly
    expect(wrapper.find('tbody').text()).toContain('Belum diisi');
    expect(wrapper.find('tbody').text()).toContain('IN_PROGRESS (Sebagian)');
    expect(wrapper.find('tbody').text()).toContain('Lanjutkan Besok');
    expect(wrapper.find('tbody').text()).toContain('Karyawan · Engineering');
    expect(wrapper.find('tbody').text()).not.toContain('"outcome":null');

    // Switch metric card to Disetujui -> Dimas Morning risk & link diff + reviewer info
    const approvedCard = wrapper.findAll('.metric-card')[1];
    await approvedCard.trigger('click');
    expect(wrapper.find('tbody').text()).toContain('Dimas Prakoso');
    expect(wrapper.find('tbody').text()).toContain('Aman (GREEN)');
    expect(wrapper.find('tbody').text()).toContain('Kritis (RED)');
    expect(wrapper.find('tbody').text()).toContain('https://github.com/dutamedia/pr/99');
    expect(wrapper.find('tbody').text()).toContain('Disetujui oleh');
    expect(wrapper.find('tbody').text()).toContain('Dharma Putra');

    // Filter search yielding empty -> click Tampilkan Semua restores rows
    await wrapper.find('.search-input').setValue('tidakadadata999');
    expect(wrapper.text()).toContain('Tidak Ada Permohonan yang Cocok');
    await wrapper.find('[data-testid="reset-review-filters"]').trigger('click');
    expect(wrapper.find('tbody').text()).toContain('Aditya Nugroho');
    expect(wrapper.find('tbody').text()).toContain('Dimas Prakoso');
  });
});

