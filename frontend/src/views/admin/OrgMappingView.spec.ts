import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OrgMappingView from './OrgMappingView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('OrgMappingView.vue (WP-EP03-TK007 / Prototipe 15)', () => {
  let router: any;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v1/admin/organization/assignments')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              data: [
                {
                  id: 'asg-1',
                  userId: 'u-1',
                  jobTitle: 'Head of Engineering',
                  role: 'HEAD',
                  function: 'Engineering',
                  employmentStatus: 'PERMANENT',
                  directManagerId: null,
                  effectiveDate: '2026-01-01',
                  endDate: null,
                  assignmentReason: 'Penugasan awal',
                  user: { id: 'u-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
                  directManager: null,
                },
                {
                  id: 'asg-2',
                  userId: 'u-2',
                  jobTitle: 'Frontend Developer',
                  role: 'EMPLOYEE',
                  function: 'Delivery',
                  employmentStatus: 'CONTRACT',
                  directManagerId: 'u-1',
                  effectiveDate: '2026-01-01',
                  endDate: '2025-12-31',
                  assignmentReason: 'Riwayat penugasan lama',
                  user: { id: 'u-2', fullName: 'Aditya Nugroho', email: 'dev.frontend@dutamedia.com' },
                  directManager: { id: 'u-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
                },
              ],
            },
          }),
        });
      }
      if (url.includes('/v1/admin/project-authorities')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              data: [
                {
                  id: 'pa-1',
                  projectCode: 'PRJ-PORTAL',
                  projectName: 'Dutamedia Client Portal v2.4',
                  projectManagerId: 'u-3',
                  escalationReviewerId: 'u-1',
                  involvedFunction: 'Delivery',
                  effectiveDate: '2026-01-01',
                  endDate: null,
                  assignmentReason: 'Lead portal',
                  projectManager: { id: 'u-3', fullName: 'Dimas Prakoso', email: 'pm@dutamedia.com' },
                  escalationReviewer: { id: 'u-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com' },
                },
              ],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: {
            data: [
              { id: 'u-1', fullName: 'Arif Budiman', email: 'head.eng@dutamedia.com', employmentStatus: 'PERMANENT' },
              { id: 'u-3', fullName: 'Dimas Prakoso', email: 'pm@dutamedia.com', employmentStatus: 'PERMANENT' },
            ],
          },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/organization', component: OrgMappingView },
        { path: '/admin/users', component: { template: '<div>Users</div>' } },
        { path: '/admin/temporary-reviewers', component: { template: '<div>Reviewers</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders page header without technical path, requests limit=100, and formats Indonesian role labels', async () => {
    const wrapper = mount(OrgMappingView, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Struktur Organisasi & Kewenangan Proyek');
    expect(wrapper.text()).not.toContain('(/admin/organization)');
    expect(wrapper.text()).toContain('Struktur & Penugasan Karyawan');
    expect(wrapper.text()).toContain('Kewenangan Proyek (Project Authority)');
    expect(wrapper.text()).toContain('Kepala Divisi');
    expect(wrapper.text()).toContain('Karyawan');
    expect(wrapper.find('.role-badge').text()).toBe('Kepala Divisi');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/organization/assignments?limit=100'),
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/project-authorities?limit=100'),
      expect.anything(),
    );
  });

  it('filters assignments by search, division, and status, and opens in-app confirmation modal on Tutup Wewenang', async () => {
    const wrapper = mount(OrgMappingView, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    await wrapper.find('#orgStatusFilter').setValue('ACTIVE');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Arif Budiman');

    await wrapper.find('#orgStatusFilter').setValue('ALL');
    await wrapper.find('#orgSearchInput').setValue('tidak-ada');
    expect(wrapper.text()).toContain('Tidak Ada Penugasan yang Cocok');
    await wrapper.find('.btn-reset-filter').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    const tabButtons = wrapper.findAll('.tab-bar-btn');
    await tabButtons[1].trigger('click');
    expect(wrapper.text()).toContain('Tetapkan Wewenang Proyek');

    await wrapper.find('.btn-end-pa').trigger('click');
    expect(wrapper.find('.modal-confirm-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Konfirmasi Tutup Wewenang Proyek');
    expect(wrapper.text()).toContain('Dutamedia Client Portal v2.4 (PRJ-PORTAL)');
  });

  it('rejects Project Authority submission when Project Manager and Escalation Reviewer are identical', async () => {
    const wrapper = mount(OrgMappingView, {
      global: {
        plugins: [router],
      },
    });

    await flushPromises();

    await wrapper.findAll('.tab-bar-btn')[1].trigger('click');
    await wrapper.find('.header-actions .btn-primary').trigger('click');

    await wrapper.find('#pa-code').setValue('PRJ-DUP');
    await wrapper.find('#pa-name').setValue('Proyek Duplikat');
    await wrapper.find('#pa-pm').setValue('u-1');
    await wrapper.find('#pa-rev').setValue('u-1');
    await wrapper.find('#pa-reason').setValue('Uji validasi orang sama');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.find('.alert-banner.error').text()).toContain(
      'Project Manager dan Escalation Reviewer tidak boleh dijabat oleh orang yang sama.',
    );
  });
});
