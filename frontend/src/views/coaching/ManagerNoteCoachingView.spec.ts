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

    // Indonesian business terminology verifications (IMP-056)
    expect(wrapper.text()).toContain('Jenis Catatan');
    expect(wrapper.text()).not.toContain('Jenis Catatan (Type)');
    expect(wrapper.text()).toContain('Bimbingan');
    expect(wrapper.text()).toContain('Apresiasi');
    expect(wrapper.text()).toContain('Tindakan Korektif');
    expect(wrapper.text()).not.toContain('(Manager Only)');
    expect(wrapper.text()).not.toContain('notifikasi in-app');
    expect(wrapper.text()).not.toContain('Thread pembinaan');
  });

  it('formats compliance stage and note type into business Indonesian', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/coaching/team')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                user: { id: 'usr-2', fullName: 'Siti Rahma', email: 'siti@dutamedia.com' },
                jobTitle: 'Backend Developer',
                function: 'ENGINEERING',
                totalNotes: 1,
                lastNote: null,
                lastComplianceStage: 'PATTERN_FLAG_3X',
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
              id: 'note-2',
              noteType: 'COACHING',
              visibility: 'CONFIDENTIAL_MANAGER_ONLY',
              content: 'Catatan bimbingan evaluasi kepatuhan',
              createdAt: '2026-10-28T10:00:00.000Z',
              authorUser: { id: 'mgr-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
            },
          ],
        }),
      });
    }));

    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    // Verify stage PATTERN_FLAG_3X is formatted into Pola Terlambat 3x
    expect(wrapper.text()).toContain('Pola Terlambat 3x');
    expect(wrapper.text()).not.toContain('PATTERN_FLAG_3X');

    // Verify note type COACHING is formatted into Bimbingan and visibility is Rahasia Manajemen
    expect(wrapper.text()).toContain('Bimbingan');
    expect(wrapper.text()).toContain('Rahasia Manajemen');
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
