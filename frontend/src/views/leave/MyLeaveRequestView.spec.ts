import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MyLeaveRequestView from './MyLeaveRequestView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('MyLeaveRequestView.vue (Prototipe 20 / EP10 - Pengajuan Cuti Mandiri)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/my')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'lvr-1',
                startDate: '2026-10-20',
                endDate: '2026-10-21',
                reason: 'Urusan keluarga luar kota',
                status: 'PENDING',
                createdAt: '2026-10-12T14:10:00Z',
              },
              {
                id: 'lvr-2',
                startDate: '2026-10-09',
                endDate: '2026-10-09',
                reason: 'Cuti Sakit Mendadak',
                status: 'APPROVED',
                reconciled: true,
                reconciliationNote: 'Rekonsiliasi Otomatis: Status No Submission direkonsiliasi menjadi Approved Leave.',
                createdAt: '2026-10-09T09:50:00Z',
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 'lvr-new' } }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/leave/my', component: MyLeaveRequestView },
        { path: '/leave/queue', component: { template: '<div>Queue</div>' } },
      ],
    });
  });

  it('renders page header, form, and leave history correctly', async () => {
    const wrapper = mount(MyLeaveRequestView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Pengajuan & Riwayat Cuti');
    expect(wrapper.text()).toContain('Urusan keluarga luar kota');
    expect(wrapper.text()).toContain('Menunggu Review');
    expect(wrapper.text()).toContain('Cuti Disetujui');
  });

  it('validates date range when end date is earlier than start date', async () => {
    const wrapper = mount(MyLeaveRequestView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    const startInput = wrapper.find('#startDate');
    const endInput = wrapper.find('#endDate');

    await startInput.setValue('2026-10-25');
    await endInput.setValue('2026-10-20');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
  });

  it('marks reason field as required (not opsional) and enforces minimum 5 characters', async () => {
    const wrapper = mount(MyLeaveRequestView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    const reasonLabel = wrapper.find('label[for="reason"]');
    expect(reasonLabel.text()).toContain('Alasan *');
    expect(reasonLabel.text()).not.toContain('opsional');

    const reasonTextarea = wrapper.find('#reason');
    expect(reasonTextarea.attributes('required')).toBeDefined();
    expect(reasonTextarea.attributes('placeholder')).toContain('minimal 5 karakter');

    await wrapper.find('#startDate').setValue('2026-10-25');
    await wrapper.find('#endDate').setValue('2026-10-26');
    await reasonTextarea.setValue('Izin');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Alasan permohonan cuti minimal 5 karakter.');
  });

  it('restricts Intern users to only Izin (PERMIT) & Sakit (SICK) and hides annual quota box', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/quota')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              year: 2026,
              employmentStatus: 'INTERN',
              hasAnnualQuota: false,
              annualQuotaDays: 0,
              usedDays: 0,
              pendingDays: 0,
              remainingDays: 0,
              allowedLeaveTypes: ['PERMIT', 'SICK'],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('[data-testid="intern-leave-info"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="annual-leave-quota"]').exists()).toBe(false);
    const options = wrapper.findAll('#leaveType option').map((o) => o.element.getAttribute('value'));
    expect(options).toEqual(['PERMIT', 'SICK']);
  });

  it('shows 12-day annual quota box and all 6 leave/permit options for Non-Intern users', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/quota')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              year: 2026,
              employmentStatus: 'PERMANENT',
              hasAnnualQuota: true,
              annualQuotaDays: 12,
              usedDays: 2,
              pendingDays: 0,
              remainingDays: 10,
              allowedLeaveTypes: ['ANNUAL', 'SICK', 'PERMIT', 'SPECIAL_LEAVE', 'MATERNITY', 'UNPAID'],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('[data-testid="annual-leave-quota"]').text()).toContain('Tersisa 10 dari 12 hari kerja');
    const options = wrapper.findAll('#leaveType option').map((o) => o.element.getAttribute('value'));
    expect(options).toContain('ANNUAL');
    expect(options).toContain('PERMIT');
    expect(options).toContain('SICK');
  });

  it('calculates working days (Mon-Fri) excluding weekends for leave duration hint', async () => {
    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await wrapper.find('#startDate').setValue('2026-12-03');
    await wrapper.find('#endDate').setValue('2026-12-22');

    const hint = wrapper.find('.duration-hint');
    expect(hint.exists()).toBe(true);
    expect(hint.text()).toContain('14 hari kerja');
  });

  it('rejects weekend-only date range (0 working days) and shows warning', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: [] }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    const initialCalls = fetchSpy.mock.calls.length;

    await wrapper.find('#startDate').setValue('2026-11-28');
    await wrapper.find('#endDate').setValue('2026-11-29');
    await wrapper.find('#reason').setValue('Keperluan keluarga saat akhir pekan');

    const hint = wrapper.find('.duration-hint');
    expect(hint.exists()).toBe(true);
    expect(hint.text()).toContain('0 hari kerja');

    await wrapper.find('form').trigger('submit');
    expect(wrapper.text()).toContain('hanya mencakup akhir pekan (0 hari kerja)');
    expect(fetchSpy.mock.calls.length).toBe(initialCalls);
  });

  it('shows live reason character counter and over-quota warning for ANNUAL leave', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/quota')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              year: 2026,
              employmentStatus: 'PERMANENT',
              hasAnnualQuota: true,
              annualQuotaDays: 12,
              usedDays: 10,
              pendingDays: 0,
              remainingDays: 2,
              allowedLeaveTypes: ['ANNUAL', 'SICK', 'PERMIT', 'SPECIAL_LEAVE', 'MATERNITY', 'UNPAID'],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    await wrapper.find('#reason').setValue('Urusan');
    expect(wrapper.find('[data-testid="reason-char-counter"]').text()).toContain('6 / 5 karakter minimum');

    await wrapper.find('#startDate').setValue('2026-12-01');
    await wrapper.find('#endDate').setValue('2026-12-04'); // 4 hari kerja > sisa 2 hari
    expect(wrapper.find('[data-testid="quota-exceeded-hint"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="quota-exceeded-hint"]').text()).toContain('2 hari kerja tersisa');
  });

  it('opens in-app cancel confirmation modal without window.confirm and submits cancellation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/my')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: '3f8a92c1-aaaa-bbbb-cccc-1234567890ab',
                startDate: '2026-12-01',
                endDate: '2026-12-02',
                leaveType: 'ANNUAL',
                reason: 'Perjalanan keluarga ke luar kota',
                status: 'PENDING',
                createdAt: '2026-11-20T09:00:00Z',
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('#LVR-20261201-3F8A');
    expect(wrapper.text()).not.toContain('3f8a92c1-aaaa-bbbb-cccc-1234567890ab');

    await wrapper.find('.btn-cancel').trigger('click');
    expect(confirmSpy).not.toHaveBeenCalled();

    const modal = wrapper.find('[data-testid="cancel-confirm-modal"]');
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toContain('Perjalanan keluarga ke luar kota');

    await modal.find('[data-testid="confirm-cancel-btn"]').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 50));

    const cancelCall = fetchSpy.mock.calls.find(([url]) =>
      String(url).includes('/leave/3f8a92c1-aaaa-bbbb-cccc-1234567890ab/cancel'),
    );
    expect(cancelCall).toBeDefined();
    confirmSpy.mockRestore();
  });

  it('supports Dibatalkan filter, leave type & reviewer search, and Tampilkan Semua reset', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/my')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: [
              {
                id: 'lv-a1',
                startDate: '2026-12-01',
                endDate: '2026-12-01',
                leaveType: 'SICK',
                reason: 'Periksa ke klinik',
                status: 'APPROVED',
                reviewedBy: { id: 'mgr-1', fullName: 'Dharma Putra' },
                createdAt: '2026-11-18T08:00:00Z',
              },
              {
                id: 'lv-c1',
                startDate: '2026-12-10',
                endDate: '2026-12-11',
                leaveType: 'ANNUAL',
                reason: 'Jadwal batal berangkat',
                status: 'CANCELLED',
                createdAt: '2026-11-19T08:00:00Z',
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { hasAnnualQuota: true, annualQuotaDays: 12, usedDays: 0, pendingDays: 0, remainingDays: 12, year: 2026, employmentStatus: 'PERMANENT', allowedLeaveTypes: [] } }),
      });
    }));

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Filter Dibatalkan
    const cancelFilterBtn = wrapper.findAll('.filter-btn').find((b) => b.text().trim() === 'Dibatalkan');
    expect(cancelFilterBtn).toBeDefined();
    await cancelFilterBtn!.trigger('click');
    expect(wrapper.text()).toContain('Jadwal batal berangkat');
    expect(wrapper.text()).not.toContain('Periksa ke klinik');

    // Reset via Semua, search by reviewer name
    await wrapper.findAll('.filter-btn')[0].trigger('click');
    await wrapper.find('.search-input').setValue('Dharma Putra');
    expect(wrapper.text()).toContain('Periksa ke klinik');
    expect(wrapper.text()).not.toContain('Jadwal batal berangkat');

    // Empty search result shows Tampilkan Semua button
    await wrapper.find('.search-input').setValue('tidakadadata123');
    expect(wrapper.text()).toContain('Tidak ada permohonan yang cocok');
    await wrapper.find('[data-testid="reset-filters-btn"]').trigger('click');
    expect(wrapper.text()).toContain('Periksa ke klinik');
    expect(wrapper.text()).toContain('Jadwal batal berangkat');
  });

  it('uses consistent Izin / Sakit labels and avoids hardcoded 09:30 WIB for Intern users', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/leave/quota')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              year: 2026,
              employmentStatus: 'INTERN',
              hasAnnualQuota: false,
              annualQuotaDays: 0,
              usedDays: 0,
              pendingDays: 0,
              remainingDays: 0,
              allowedLeaveTypes: ['PERMIT', 'SICK'],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(MyLeaveRequestView, {
      global: { plugins: [router], stubs: { RouterLink: true } },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.find('h1').text()).toBe('Pengajuan & Riwayat Izin / Sakit');
    expect(wrapper.find('#history-title').text()).toBe('Riwayat Permohonan Izin / Sakit');
    expect(wrapper.find('.info-note').text()).toContain('batas waktu laporan pagi yang berlaku');
    expect(wrapper.find('.info-note').text()).not.toContain('09:30 WIB');
  });
});

