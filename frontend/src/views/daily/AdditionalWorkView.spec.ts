import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdditionalWorkView from './AdditionalWorkView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('AdditionalWorkView.vue (WP-EP05-TK007 / Prototipe 03 & IMP-016 Verification)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/daily/additional-work', component: AdditionalWorkView },
        { path: '/daily/eod', component: { template: '<div>EOD</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
        { path: '/blockers/raise', component: { template: '<div>Raise</div>' } },
      ],
    });
  });

  it('renders Additional Work page header and form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          additionalWorks: [],
          availableManagers: [],
        },
      }),
    }));

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.text()).toContain('Additional Work (Pekerjaan Tambahan)');
  });

  it('renders consistent "Laporkan Blocker" button linking to /blockers/raise on workflow bar (IMP-016)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          additionalWorks: [],
          availableManagers: [],
        },
      }),
    }));

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const blockerBtn = wrapper.find('[data-testid="report-blocker-btn"]');
    expect(blockerBtn.exists()).toBe(true);
    expect(blockerBtn.text()).toContain('Laporkan Blocker');
    expect(blockerBtn.attributes('href')).toBe('/blockers/raise');
  });

  it('eliminates internal design code (Prototipe 03) from page subtitle (IMP-031)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workDate: '2026-10-28',
          additionalWorks: [],
          availableManagers: [],
        },
      }),
    }));

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const subtitle = wrapper.find('[data-testid="additional-work-subtitle"]');
    expect(subtitle.exists()).toBe(true);
    expect(subtitle.text()).toBe(
      'Catat pekerjaan dadakan, penugasan baru dari atasan, atau insiden operasional yang muncul di siang hari secara transparan tanpa mengubah baseline komitmen pagi.',
    );
    expect(subtitle.text()).not.toContain('Prototipe 03');
    expect(wrapper.text()).not.toContain('Prototipe 03');
  });

  it('handles responsive layout and prevents horizontal grid overflow on assigned-by input (IMP-032)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (String(url).includes('/daily/today')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                workDate: '2026-10-28',
                record: {
                  id: 'rec-today-01',
                  additionalWorks: [],
                },
              },
            }),
          });
        }
        if (String(url).includes('/v1/organization/users')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [
                { id: 'mgr-1', fullName: 'Bambang Sutrisno, M.Kom', email: 'bambang.sutrisno@dutamedia.co.id' },
              ],
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      }),
    );

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const formRow = wrapper.find('[data-testid="form-row-reason"]');
    expect(formRow.exists()).toBe(true);
    // Default reason is NEWLY_ASSIGNED -> 2 columns, not single-col
    expect(formRow.classes()).not.toContain('single-col');

    const assignedByGroup = wrapper.find('[data-testid="assigned-by-group"]');
    expect(assignedByGroup.exists()).toBe(true);

    const selectAssigned = wrapper.find('[data-testid="select-assigned-by"]');
    expect(selectAssigned.exists()).toBe(true);
    expect(selectAssigned.classes()).toContain('input-control');

    // Change reason to MISSED_IN_PLANNING -> should apply single-col and hide assigned-by
    const selectReason = wrapper.find('[data-testid="select-reason"]');
    await selectReason.setValue('MISSED_IN_PLANNING');

    expect(formRow.classes()).toContain('single-col');
    expect(wrapper.find('[data-testid="assigned-by-group"]').exists()).toBe(false);
  });
});
