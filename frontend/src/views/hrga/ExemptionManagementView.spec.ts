import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ExemptionManagementView from './ExemptionManagementView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ExemptionManagementView.vue (WP-EP08 / Prototipe 12 - Kelola Pengecualian Akuntabilitas)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/compliance/exemptions')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'ex-1',
                userId: 'u-1',
                startDate: '2026-10-29',
                endDate: '2026-10-31',
                exemptionCategory: 'Dinas Luar',
                officialReferenceNumber: 'ST-042',
                reason: 'Kunjungan kerja klien di Bandung',
                user: { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
                createdByUser: { id: 'hrga-1', fullName: 'Siti HRGA' },
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
            { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
          ],
        }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/exemptions', component: ExemptionManagementView },
        { path: '/compliance', component: { template: '<div>Compliance</div>' } },
        { path: '/corrections/review', component: { template: '<div>Review</div>' } },
      ],
    });
  });

  it('renders registration form and existing exemptions table', async () => {
    const wrapper = mount(ExemptionManagementView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Manajemen Dispensasi & Pengecualian Akuntabilitas');
    expect(wrapper.text()).toContain('Daftarkan Dispensasi Baru');
    expect(wrapper.text()).toContain('Daftar Pengecualian Resmi Aktif');
    expect(wrapper.text()).toContain('Budi Staf');
    expect(wrapper.text()).toContain('Dinas Luar');
    expect(wrapper.text()).toContain('ST-042');
  });

  it('formats 1-day period as single date, supports search/category filter, and binds endDate min attribute', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/compliance/exemptions')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'ex-1',
                userId: 'u-1',
                startDate: '2026-10-29',
                endDate: '2026-10-29',
                exemptionCategory: 'Dinas Luar',
                officialReferenceNumber: 'ST-001',
                reason: 'Instalasi server klien Bandung',
                user: { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
                createdByUser: { id: 'hrga-1', fullName: 'Dewi Lestari' },
              },
              {
                id: 'ex-2',
                userId: 'u-2',
                startDate: '2026-11-01',
                endDate: '2026-11-03',
                exemptionCategory: 'Pelatihan Sertifikasi',
                officialReferenceNumber: 'ST-002',
                reason: 'Pelatihan cloud architecture',
                user: { id: 'u-2', fullName: 'Siti Rahma', email: 'siti@dutamedia.com' },
                createdByUser: { id: 'hrga-1', fullName: 'Dewi Lestari' },
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
            { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
            { id: 'u-2', fullName: 'Siti Rahma', email: 'siti@dutamedia.com' },
          ],
        }),
      });
    }));

    const wrapper = mount(ExemptionManagementView, {
      global: { plugins: [router] },
    });

    await flushPromises();

    const periodCells = wrapper.findAll('.period-text');
    expect(periodCells).toHaveLength(2);
    expect(periodCells[0].text()).not.toContain('s/d');
    expect(periodCells[1].text()).toContain('s/d');

    await wrapper.find('#startDateInput').setValue('2026-11-25');
    expect(wrapper.find('#endDateInput').attributes('min')).toBe('2026-11-25');

    await wrapper.find('#exemptionCategoryFilter').setValue('Pelatihan Sertifikasi');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Siti Rahma');

    await wrapper.find('#exemptionSearchInput').setValue('bandung');
    expect(wrapper.findAll('tbody tr')).toHaveLength(0);
    expect(wrapper.text()).toContain('Tidak Ada Dispensasi yang Cocok');
  });

  it('supports editing and deleting existing bounded exemptions (DEC-018)', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (url.includes('/compliance/exemptions/') && opts?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { id: 'ex-1' } }),
        });
      }
      if (url.includes('/compliance/exemptions/') && opts?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: { deleted: true } }),
        });
      }
      if (url.includes('/compliance/exemptions')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'ex-1',
                userId: 'u-1',
                startDate: '2026-10-29',
                endDate: '2026-10-31',
                exemptionCategory: 'Dinas Luar',
                officialReferenceNumber: 'ST-042',
                reason: 'Kunjungan kerja klien di Bandung',
                user: { id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' },
                createdByUser: { id: 'hrga-1', fullName: 'Siti HRGA' },
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
          data: [{ id: 'u-1', fullName: 'Budi Staf', email: 'budi@dutamedia.com' }],
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(ExemptionManagementView, {
      global: { plugins: [router] },
    });
    await flushPromises();

    // Edit exemption -> sends PATCH
    await wrapper.find('[data-testid="edit-exemption-ex-1"]').trigger('click');
    expect(wrapper.text()).toContain('Ubah Data Dispensasi');
    await wrapper.find('#reasonInput').setValue('Perubahan jadwal kunjungan klien');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/compliance/exemptions/ex-1'),
      expect.objectContaining({ method: 'PATCH' }),
    );

    // Delete exemption -> sends DELETE
    await wrapper.find('[data-testid="delete-exemption-ex-1"]').trigger('click');
    await wrapper.find('[data-testid="confirm-delete-exemption"]').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/compliance/exemptions/ex-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

