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

  it('applies recognition quick template in clean Indonesian without SLA or production jargon', async () => {
    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const recognitionBtn = wrapper.findAll('.btn-template').find(b => b.text().includes('Apresiasi'));
    expect(recognitionBtn).toBeDefined();
    await recognitionBtn!.trigger('click');

    const val = wrapper.find('textarea').element.value;
    expect(val).toContain('[Apresiasi Prestasi]: Penanganan cepat kendala kritis layanan aktif (waktu respon < 45 menit).');
    expect(val).not.toContain('SLA');
    expect(val).not.toContain('production');
  });

  it('uses getUserInitials for avatar and directs employees to Notifikasi page', async () => {
    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.find('.member-avatar').text()).toBe('BS');
    expect(wrapper.text()).toContain('Karyawan menerima notifikasi dan dapat membaca isi catatan ini di halaman Notifikasi.');
    expect(wrapper.text()).not.toContain('laman profil');
  });

  it('asks confirmation before overwriting existing note content with a quick template', async () => {
    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Catatan custom atasan yang sedang diketik');

    const coachingBtn = wrapper.findAll('.btn-template').find((b) => b.text().includes('Bimbingan 1-on-1'));
    await coachingBtn!.trigger('click');

    // Confirmation shown and existing custom note preserved
    expect(wrapper.find('.template-confirm-box').exists()).toBe(true);
    expect(textarea.element.value).toBe('Catatan custom atasan yang sedang diketik');

    // Cancel keeps custom note
    await wrapper.find('.btn-confirm-cancel').trigger('click');
    expect(wrapper.find('.template-confirm-box').exists()).toBe(false);
    expect(textarea.element.value).toBe('Catatan custom atasan yang sedang diketik');

    // Trigger again and confirm replacement
    await coachingBtn!.trigger('click');
    await wrapper.find('.btn-confirm-replace').trigger('click');
    expect(wrapper.find('.template-confirm-box').exists()).toBe(false);
    expect(textarea.element.value).toContain('[Fokus Pengembangan]');
  });

  it('syncs right-hand history panel when form subject selection changes', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
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
                totalNotes: 1,
                lastNote: null,
                lastComplianceStage: 'CLEAN',
              },
              {
                user: { id: 'usr-2', fullName: 'Siti Rahma', email: 'siti@dutamedia.com' },
                jobTitle: 'Backend Developer',
                function: 'ENGINEERING',
                totalNotes: 2,
                lastNote: null,
                lastComplianceStage: 'CLEAN',
              },
            ],
          }),
        });
      }
      if (url.includes('/coaching/users/usr-2')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'note-2',
                noteType: 'RECOGNITION',
                visibility: 'SHARED_WITH_EMPLOYEE',
                content: 'Riwayat catatan khusus Siti Rahma',
                createdAt: '2026-10-28T10:00:00.000Z',
                authorUser: { id: 'mgr-1', fullName: 'Rina Lead', email: 'rina@dutamedia.com' },
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
              content: 'Riwayat catatan Budi Staf',
              createdAt: '2026-10-28T10:00:00.000Z',
              authorUser: { id: 'mgr-1', fullName: 'Rina Lead', email: 'rina@dutamedia.com' },
            },
          ],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(ManagerNoteCoachingView, {
      global: { plugins: [router] },
    });

    await flushPromises();
    expect(wrapper.text()).toContain('Riwayat catatan Budi Staf');

    const subjectSelect = wrapper.find('#subjectSelect');
    await subjectSelect.setValue('usr-2');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/coaching/users/usr-2'),
      expect.anything(),
    );
    expect((wrapper.find('.filter-subject select').element as HTMLSelectElement).value).toBe('usr-2');
    expect(wrapper.text()).toContain('Riwayat catatan khusus Siti Rahma');
  });
});
