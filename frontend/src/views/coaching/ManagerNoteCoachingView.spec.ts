import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ManagerNoteCoachingView from './ManagerNoteCoachingView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ManagerNoteCoachingView.vue (WP-EP07 / Prototipe 10 - Catatan Evaluasi Kerja & Pembinaan Tim)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/coaching/team')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                user: { id: 'usr-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
                jobTitle: 'Frontend Engineer',
                function: 'ENGINEERING',
                totalNotes: 2,
                lastNote: null,
                lastComplianceStage: 'CLEAN',
              },
            ],
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
              id: 'note-1',
              noteType: 'COACHING',
              visibility: 'SHARED_WITH_EMPLOYEE',
              content: 'Peningkatan akurasi estimasi komitmen harian',
              createdAt: '2026-10-28T10:00:00.000Z',
              authorUser: { id: 'mgr-1', fullName: 'Rina Lead', email: 'rina@dutamedia.com' },
            },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/coaching', component: ManagerNoteCoachingView },
        { path: '/blockers', component: { template: '<div>Queue</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
      ],
    });
  });

  it('renders team overview, creation form, and note history feed', async () => {
    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Catatan Evaluasi Kerja & Pembinaan Tim');
    expect(wrapper.text()).toContain('Buat Catatan Pembinaan Baru');
    expect(wrapper.text()).toContain('Budi Staf');
    expect(wrapper.text()).toContain('Riwayat Catatan Evaluasi & Pembinaan');
    expect(wrapper.text()).toContain('Peningkatan akurasi estimasi komitmen harian');
    expect(wrapper.text()).toContain('Rina Lead');
  });

  it('applies coaching quick template when template button is clicked', async () => {
    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const templateBtn = wrapper.findAll('.btn-template').find(b => b.text().includes('Bimbingan 1-on-1'));
    expect(templateBtn).toBeDefined();
    await templateBtn!.trigger('click');

    expect(wrapper.find('textarea').element.value).toContain('[Fokus Pengembangan]');
  });
});
