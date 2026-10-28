import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MorningCommitmentView from './MorningCommitmentView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MorningCommitmentView.vue (WP-EP05-TK006 / Prototipe 02)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          currentTime: '08:30',
          cutoffTimings: {
            morningOnTimeCutoff: '09:00',
            morningLockCutoff: '09:30',
            isMorningLocked: false,
          },
          record: null,
          availableCarryOvers: [
            {
              originCommitmentId: 'prev-1',
              taskText: 'Selesaikan pengujian unit scope resolver',
              referenceLink: null,
              carryOverDaysCount: 1,
              suggestedRisk: 'GREEN',
              isAmberWarningAdvised: false,
            },
          ],
        },
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/daily/morning', component: MorningCommitmentView },
        { path: '/daily/additional-work', component: { template: '<div>Add</div>' } },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/daily/history', component: { template: '<div>History</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders Morning Commitment header and context panels', () => {
    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain('Morning Commitment');
    expect(wrapper.text()).toContain('Konteks Hari Ini');
    expect(wrapper.text()).toContain('Batas On-Time');
    expect(wrapper.text()).toContain('Initial Daily Status');
  });

  it('toggles zero commitment mode on checkbox check (DEC-004)', async () => {
    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);

    await checkbox.setValue(true);
    expect(wrapper.text()).toContain('Alasan Tidak Menetapkan Komitmen');
    expect(wrapper.text()).toContain('NOT_APPLICABLE — NO_COMMITMENT');
  });

  it('allows adding commitment slots up to 3 (DEC-004)', async () => {
    const wrapper = mount(MorningCommitmentView, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain('Daftar Komitmen Hari Ini (1/3)');

    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Tambah Slot'));
    expect(addBtn).toBeDefined();

    await addBtn?.trigger('click');
    expect(wrapper.text()).toContain('Daftar Komitmen Hari Ini (2/3)');
  });
});
