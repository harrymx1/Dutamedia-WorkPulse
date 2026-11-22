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
        { path: '/raise-blockers', component: { template: '<div>Raise</div>' } },
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
    expect(blockerBtn.attributes('href')).toBe('/raise-blockers');
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

  it('formats reason badge in business language and enforces required input when reason is OTHER (IMP-039)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/daily/today')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                workDate: '2026-10-30',
                record: {
                  id: 'rec-today-01',
                  additionalWorks: [
                    {
                      id: 'aw-1',
                      taskText: 'Menyusun dokumentasi API tambahan',
                      reason: 'NEWLY_ASSIGNED',
                      assignedByUser: { fullName: 'Bambang Sutrisno, M.Kom' },
                    },
                    {
                      id: 'aw-2',
                      taskText: 'Perbaikan crash server auth',
                      reason: 'OPERATIONAL_INCIDENT',
                      assignedByUser: null,
                    },
                    {
                      id: 'aw-3',
                      taskText: 'Merancang arsitektur cache',
                      reason: 'OTHER',
                      assignedByUser: null,
                    },
                  ],
                },
              },
            }),
          });
        }
        if (url.includes('/v1/organization/users')) {
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

    // Verify badges are rendered in human-friendly business language
    const worksList = wrapper.find('.works-list');
    expect(worksList.exists()).toBe(true);
    expect(worksList.text()).toContain('Penugasan Baru Atasan');
    expect(worksList.text()).toContain('Perbaikan Error / Bug Kritis');
    expect(worksList.text()).toContain('Lainnya');

    // No raw uppercase enum leaked into DOM
    expect(worksList.text()).not.toContain('NEWLY_ASSIGNED');
    expect(worksList.text()).not.toContain('OPERATIONAL_INCIDENT');

    // Test selection of OTHER dynamic input appearance
    const selectReason = wrapper.find('[data-testid="select-reason"]');
    await selectReason.setValue('OTHER');

    const formRow = wrapper.find('[data-testid="form-row-reason"]');
    // When OTHER, it should be 2 columns (Reason + Other Reason input), NOT single-col
    expect(formRow.classes()).not.toContain('single-col');

    const otherReasonGroup = wrapper.find('[data-testid="other-reason-group"]');
    expect(otherReasonGroup.exists()).toBe(true);
    expect(otherReasonGroup.text()).toContain('Keterangan Alasan Lainnya *');

    const inputOther = wrapper.find('[data-testid="input-other-reason"]');
    expect(inputOther.exists()).toBe(true);
  });

  it('enforces maximum 5 additional work items limit and disables form (TC-DLYA-003 / FR-20)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/daily/today')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                workDate: '2026-11-08',
                record: {
                  id: 'rec-123',
                  additionalWorks: [
                    { id: 'aw-1', taskText: 'Task 1', reason: 'NEWLY_ASSIGNED', createdAt: '2026-11-08T09:00:00Z' },
                    { id: 'aw-2', taskText: 'Task 2', reason: 'NEWLY_ASSIGNED', createdAt: '2026-11-08T10:00:00Z' },
                    { id: 'aw-3', taskText: 'Task 3', reason: 'NEWLY_ASSIGNED', createdAt: '2026-11-08T11:00:00Z' },
                    { id: 'aw-4', taskText: 'Task 4', reason: 'NEWLY_ASSIGNED', createdAt: '2026-11-08T12:00:00Z' },
                    { id: 'aw-5', taskText: 'Task 5', reason: 'NEWLY_ASSIGNED', createdAt: '2026-11-08T13:00:00Z' },
                  ],
                },
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }),
    );

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Verify limit banner is rendered
    const banner = wrapper.find('[data-testid="max-limit-banner"]');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Batas maksimum 5 tugas tambahan per hari telah tercapai');

    // Verify submit button is disabled
    const submitBtn = wrapper.find('[data-testid="btn-add-additional-work"]');
    expect(submitBtn.attributes('disabled')).toBeDefined();
    expect(submitBtn.text()).toContain('Batas 5 Tugas Tercapai');

    // Verify textarea is disabled
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('disabled')).toBeDefined();
  });

  it('shows approved leave banner and hides morning warning and form when activeLeave is present (DEC-008)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/daily/today')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                workDate: '2026-11-19',
                record: null,
                activeLeave: {
                  id: 'lv-1',
                  leaveType: 'SICK',
                  startDate: '2026-11-19',
                  endDate: '2026-11-19',
                  reason: 'Istirahat sesuai surat dokter klinik.',
                },
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }),
    );

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.find('[data-testid="leave-active-banner"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="leave-notice-box"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Masa Cuti Resmi Disetujui (Cuti Sakit):');
    expect(wrapper.text()).not.toContain('Belum Mengisi Morning Commitment');
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('locks form with empathetic overtime banner when EOD is already submitted while keeping recorded list visible (Paket #2)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/daily/today')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                workDate: '2026-11-20',
                cutoffTimings: { eodLockCutoff: '21:00', isEodLocked: false },
                record: {
                  id: 'rec-closed-eod',
                  eodSubmittedAt: '2026-11-20T10:15:00.000Z',
                  additionalWorks: [
                    { id: 'aw-1', taskText: 'Tugas siang tercatat sebelum EOD', reason: 'OPERATIONAL_INCIDENT', createdAt: '2026-11-20T06:00:00Z' },
                  ],
                },
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }),
    );

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const banner = wrapper.find('[data-testid="eod-locked-banner"]');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Evaluasi Sore (EOD) Hari Ini Telah Ditutup');
    expect(banner.text()).toContain('Lapor Blocker');

    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-testid="select-reason"]').attributes('disabled')).toBeDefined();
    const submitBtn = wrapper.find('[data-testid="btn-add-additional-work"]');
    expect(submitBtn.attributes('disabled')).toBeDefined();
    expect(submitBtn.text()).toContain('Terkunci Pasca-EOD');

    // Recorded list remains visible (read-only)
    expect(wrapper.text()).toContain('Tugas siang tercatat sebelum EOD');
  });

  it('locks form when EOD cutoff time has passed (isEodLocked = true) (Paket #2)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/daily/today')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                workDate: '2026-11-20',
                cutoffTimings: { eodLockCutoff: '21:00', isEodLocked: true },
                record: {
                  id: 'rec-cutoff-locked',
                  eodSubmittedAt: null,
                  additionalWorks: [],
                },
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }),
    );

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const banner = wrapper.find('[data-testid="eod-locked-banner"]');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Batas Waktu EOD (21:00 WIB) Telah Berakhir');
    expect(wrapper.find('[data-testid="btn-add-additional-work"]').attributes('disabled')).toBeDefined();
  });

  it('membuka formulir dengan opsi default "Komitmen Pagi Terlewat" saat jam pagi sudah terkunci dan belum ada record (Temuan 2 - Opsi A)', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (String(url).includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              workDate: '2026-11-22',
              cutoffTimings: {
                morningLockCutoff: '09:30',
                isMorningLocked: true,
                eodLockCutoff: '21:00',
                isEodLocked: false,
              },
              record: null,
            },
          }),
        });
      }
      if (String(url).includes('/daily/additional-work') && opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'aw-missed-1' },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.find('[data-testid="morning-missed-info-banner"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Belum Mengisi Morning Commitment:');

    const reasonSelect = wrapper.find('[data-testid="select-reason"]');
    expect(reasonSelect.exists()).toBe(true);
    expect((reasonSelect.element as HTMLSelectElement).value).toBe('MORNING_CUTOFF_MISSED');
    expect(reasonSelect.text()).toContain('Komitmen Pagi Terlewat');

    await wrapper.find('#input-task-text').setValue('Menyelesaikan laporan keuangan yang belum sempat dicatat pagi');
    await wrapper.find('form').trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/daily/additional-work'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"reason":"MORNING_CUTOFF_MISSED"'),
      }),
    );
  });

  it('menyembunyikan opsi "Komitmen Pagi Terlewat" jika Komitmen Pagi hari ini sudah diisi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              workDate: '2026-11-22',
              cutoffTimings: { morningLockCutoff: '09:30', isMorningLocked: true, isEodLocked: false },
              record: {
                id: 'rec-morning-ok',
                morningSubmittedAt: '2026-11-22T01:30:00.000Z',
                additionalWorks: [],
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
    }));

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const reasonSelect = wrapper.find('[data-testid="select-reason"]');
    expect(reasonSelect.exists()).toBe(true);
    expect(reasonSelect.text()).not.toContain('Komitmen Pagi Terlewat');
  });

  it('mendukung Edit dan Hapus terkontrol (alasan wajib) sebelum EOD ditutup dan menyembunyikan kedua tombol saat EOD terkunci (Temuan 3)', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              workDate: '2026-11-22',
              cutoffTimings: { morningLockCutoff: '09:30', isMorningLocked: true, isEodLocked: false },
              record: {
                id: 'rec-open-eod',
                morningSubmittedAt: '2026-11-22T01:30:00.000Z',
                eodSubmittedAt: null,
                additionalWorks: [
                  {
                    id: 'aw-10',
                    taskText: 'Perbaikan bug sesi login',
                    reason: 'NEWLY_ASSIGNED',
                    projectCode: 'WP-CORE',
                    assignedByUser: { id: 'mgr-1', fullName: 'Bambang Pratama' },
                    createdAt: '2026-11-22T04:00:00.000Z',
                  },
                ],
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
              { id: 'mgr-1', fullName: 'Bambang Pratama', email: 'lead.tech@dutamedia.com', employmentStatus: 'PERMANENT' },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Tombol Edit & Hapus tampil sebelum EOD terkunci
    const editBtn = wrapper.find('[data-testid="btn-edit-aw"]');
    const deleteBtn = wrapper.find('[data-testid="btn-delete-aw"]');
    expect(editBtn.exists()).toBe(true);
    expect(deleteBtn.exists()).toBe(true);

    // Uji Edit -> PATCH /daily/additional-work/aw-10
    await editBtn.trigger('click');
    expect(wrapper.find('[data-testid="btn-cancel-edit-aw"]').exists()).toBe(true);
    await wrapper.find('#input-task-text').setValue('Perbaikan bug sesi login + OTP');
    await wrapper.find('form').trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/daily/additional-work/aw-10'),
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('Perbaikan bug sesi login + OTP'),
      }),
    );

    // Uji Hapus Terkontrol -> buka panel konfirmasi, info notifikasi atasan penugas tampil, DELETE dengan alasan wajib
    await wrapper.find('[data-testid="btn-delete-aw"]').trigger('click');
    const delBox = wrapper.find('[data-testid="delete-confirm-box"]');
    expect(delBox.exists()).toBe(true);
    expect(delBox.text()).toContain('Bambang Pratama');

    await wrapper.find('[data-testid="input-delete-aw-reason"]').setValue('Tugas dibatalkan oleh atasan');
    await wrapper.find('[data-testid="btn-confirm-delete-aw"]').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/daily/additional-work/aw-10'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ reason: 'Tugas dibatalkan oleh atasan' }),
      }),
    );
  });

  it('menyembunyikan tombol Edit dan Hapus ketika Evaluasi Sore (EOD) sudah dikirim', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/daily/today')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              workDate: '2026-11-22',
              cutoffTimings: { eodLockCutoff: '21:00', isEodLocked: false },
              record: {
                id: 'rec-closed',
                eodSubmittedAt: '2026-11-22T10:15:00.000Z',
                additionalWorks: [
                  { id: 'aw-locked-1', taskText: 'Tugas selesai sebelum EOD', reason: 'OPERATIONAL_INCIDENT', createdAt: '2026-11-22T06:00:00Z' },
                ],
              },
            },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true, data: [] }) });
    }));

    const wrapper = mount(AdditionalWorkView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(wrapper.find('[data-testid="btn-edit-aw"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="btn-delete-aw"]').exists()).toBe(false);
  });
});
