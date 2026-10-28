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

    expect(wrapper.text()).toContain('Kelola Hari Libur & Pengecualian');
    expect(wrapper.text()).toContain('Daftarkan Dispensasi Baru');
    expect(wrapper.text()).toContain('Daftar Pengecualian Resmi Aktif');
    expect(wrapper.text()).toContain('Budi Staf');
    expect(wrapper.text()).toContain('Dinas Luar');
    expect(wrapper.text()).toContain('ST-042');
  });
});
