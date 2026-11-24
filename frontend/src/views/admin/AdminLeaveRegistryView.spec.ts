import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AdminLeaveRegistryView from './AdminLeaveRegistryView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('AdminLeaveRegistryView.vue (DEC-018 Pencatatan Cuti Resmi Ter-ACC)', () => {
  let router: any;
  let fetchMock: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    fetchMock = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (url.includes('/leave/registry/') && opts?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { id: 'lv-1' } }),
        });
      }
      if (url.includes('/leave/registry/') && opts?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { deleted: true, id: 'lv-1' } }),
        });
      }
      if (url.endsWith('/leave/registry') && opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { id: 'lv-new' } }),
        });
      }
      if (url.includes('/leave/registry')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'lv-1',
                userId: 'u-1',
                startDate: '2026-11-24',
                endDate: '2026-11-25',
                leaveType: 'ANNUAL',
                reason: 'Cuti tahunan keperluan keluarga',
                status: 'APPROVED',
                user: { id: 'u-1', fullName: 'Gilang Ramadhan', email: 'specialist.it@dutamedia.com' },
                reviewedBy: { id: 'hr-1', fullName: 'Dewi HRGA' },
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
            { id: 'u-1', fullName: 'Gilang Ramadhan', email: 'specialist.it@dutamedia.com' },
          ],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/admin/leaves', component: AdminLeaveRegistryView },
      ],
    });
  });

  it('renders approved leave registry and supports create, edit, and delete', async () => {
    const wrapper = mount(AdminLeaveRegistryView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Pencatatan Cuti Resmi');
    expect(wrapper.text()).toContain('Gilang Ramadhan');
    expect(wrapper.text()).toContain('Cuti Tahunan');
    expect(wrapper.text()).toContain('Dewi HRGA');

    // Create new leave record
    await wrapper.find('#leaveStartInput').setValue('2026-12-01');
    await wrapper.find('#leaveEndInput').setValue('2026-12-02');
    await wrapper.find('#leaveReasonInput').setValue('Cuti resmi disetujui pimpinan divisi');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/leave/registry'),
      expect.objectContaining({ method: 'POST' }),
    );

    // Edit existing row -> triggers PATCH
    await wrapper.find('[data-testid="edit-leave-lv-1"]').trigger('click');
    expect(wrapper.text()).toContain('Ubah Catatan Cuti Resmi');
    await wrapper.find('#leaveReasonInput').setValue('Cuti tahunan diperbarui oleh HRGA');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/leave/registry/lv-1'),
      expect.objectContaining({ method: 'PATCH' }),
    );

    // Delete existing row -> opens confirmation modal and sends DELETE
    await wrapper.find('[data-testid="delete-leave-lv-1"]').trigger('click');
    await wrapper.find('[data-testid="confirm-delete-leave"]').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/leave/registry/lv-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
