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
});

