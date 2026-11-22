import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PolicySettingsView from './PolicySettingsView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

describe('PolicySettingsView.vue (WP-EP04-TK006 / Prototipe 18)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [
            {
              id: 'pol-1',
              category: 'CHECKIN_TIMING',
              configurationValues: {
                morningOnTimeCutoff: '09:00',
                morningLockCutoff: '09:30',
                eodOnTimeCutoff: '17:00',
                eodLockCutoff: '21:00',
              },
              isIllustrative: true,
              isFallback: false,
              effectiveDate: '2026-10-01',
              endDate: null,
              createdBy: { id: 'u1', fullName: 'Direktur', email: 'dir@test.com' },
              createdAt: '2026-10-01',
            },
          ],
          owners: [],
        },
      }),
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/policies', component: PolicySettingsView },
        { path: '/admin/organization', component: { template: '<div>Org</div>' } },
        { path: '/admin/temporary-reviewers', component: { template: '<div>Reviewers</div>' } },
        { path: '/admin/users', component: { template: '<div>Users</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders page header, kicker, and metrics summary', () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Pengaturan Kebijakan Sistem (Policy Settings)');
    expect(wrapper.text()).toContain('Administration · Policy Governance & Versioned Audit');
    expect(wrapper.text()).toContain('Morning Cut-Off');
    expect(wrapper.text()).toContain('EOD Cut-Off');
    expect(wrapper.text()).toContain('Target Waktu Penanganan Kendala');
    expect(wrapper.text()).toContain('+ Buat Versi Kebijakan Baru');
  });

  it('renders 5 canonical policy sections with clean business wording without internal DEC codes or confusing SLA jargon (IMP-062, IMP-064)', () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('1. Jam Kerja, Batas Pengiriman & Penguncian Cut-Off');
    expect(wrapper.text()).toContain('2. Target Waktu Respon & Eskalasi Berjenjang Kendala');
    expect(wrapper.text()).toContain('Batas Respon Jenjang Pertama');
    expect(wrapper.text()).toContain('Batas Penanganan Jenjang Lanjutan');
    expect(wrapper.text()).toContain('Batas Waktu Naik ke Atasan Berikutnya');
    expect(wrapper.text()).toContain('Jam Kerja Perhitungan Waktu');
    expect(wrapper.text()).toContain('3. Ambang Batas Carry-Over Berulang & Larangan Kunci GREEN');
    expect(wrapper.text()).toContain('4. Kebijakan Hari Bebas Komitmen (Zero-Commitment)');
    expect(wrapper.text()).toContain('5. Penegakan Tanggal Efektif & Larangan Ubah Surut (Anti-Backdating)');
    expect(wrapper.text()).not.toContain('DEC-002');
    expect(wrapper.text()).not.toContain('DEC-003');
    expect(wrapper.text()).not.toContain('DEC-004');
    expect(wrapper.text()).not.toContain('DEC-008');
  });

  it('opens and closes modal on button click and escape key', async () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    // Modal is initially closed
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);

    // Click open button
    const openBtn = wrapper.findAll('button').find(b => b.text().includes('Buat Versi Kebijakan Baru'));
    expect(openBtn).toBeDefined();
    await openBtn?.trigger('click');

    expect(wrapper.find('.modal-backdrop').exists()).toBe(true);

    // Escape closes modal
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });

  it('renders Policy Owners panel and opens owner assignment dialog (TC-CEO-001 / IMP-069)', async () => {
    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Penugasan Pemilik Kebijakan (Policy Owners)');
    expect(wrapper.text()).toContain('Jam Kerja & Waktu Komitmen');
    expect(wrapper.text()).toContain('Target Waktu Respon & Penanganan Kendala');
    expect(wrapper.text()).not.toContain('SLA');
    expect(wrapper.text()).not.toContain('(Check-in Timing)');

    const ownerBtn = wrapper.findAll('button').find(b => b.text().includes('Tetapkan Pemilik'));
    expect(ownerBtn).toBeDefined();
    await ownerBtn?.trigger('click');

    expect(wrapper.find('#ownerModalTitle').exists()).toBe(true);
    expect(wrapper.find('#ownerModalTitle').text()).toContain('Tetapkan Pemilik Kebijakan (Policy Owner)');
  });

  it('renders multiple active policy owners for the same category and opens revoke modal on click', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [],
          owners: [
            {
              id: 'poa-1',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
            },
            {
              id: 'poa-2',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u2', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
            },
          ],
        },
      }),
    }));

    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Dewi Lestari');
    expect(wrapper.text()).toContain('Hendra Wijaya');
    expect(wrapper.text()).toContain('2 Pemilik Aktif');

    const revokeButtons = wrapper.findAll('.btn-revoke-owner');
    expect(revokeButtons.length).toBeGreaterThanOrEqual(2);

    await revokeButtons[0].trigger('click');
    expect(wrapper.find('#revokeModalTitle').exists()).toBe(true);
    expect(wrapper.find('#revokeModalTitle').text()).toContain('Cabut Wewenang Pemilik Kebijakan');
  });

  it('renders all 5 policy categories in Policy Owners table and opens edit modal via Ubah button', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'u2',
      email: 'direktur@dutamedia.com',
      fullName: 'Hendra Wijaya',
      role: 'CEO_MANAGEMENT',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [],
          owners: [
            {
              id: 'poa-1',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
            },
          ],
          availableUsers: [
            { id: 'u1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com', role: 'HRGA', jobTitle: 'HRGA Lead' },
            { id: 'u2', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com', role: 'CEO_MANAGEMENT', jobTitle: 'CEO / Direktur Utama' },
          ],
        },
      }),
    }));

    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Ambang Batas Pengingat & Notifikasi');
    expect(wrapper.text()).not.toContain('(Notification Reminder)');

    const editButtons = wrapper.findAll('.btn-edit-owner');
    expect(editButtons.length).toBe(1);

    await editButtons[0].trigger('click');
    expect(wrapper.find('#ownerModalTitle').exists()).toBe(true);
    expect(wrapper.find('#ownerModalTitle').text()).toContain('Ubah Penugasan Pemilik Kebijakan');
  });

  it('hides Policy Owner CRUD buttons for HRGA/non-CEO roles and enforces strict table-based category edit lock', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'u-hrga',
      email: 'hrga@dutamedia.com',
      fullName: 'Dewi Lestari',
      role: 'HRGA',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [],
          owners: [
            {
              id: 'poa-1',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u-hrga', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
            },
          ],
        },
      }),
    }));

    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // HRGA cannot add, edit, or revoke Policy Owners (only Direktur & Admin)
    expect(wrapper.find('.btn-edit-owner').exists()).toBe(false);
    expect(wrapper.find('.btn-revoke-owner').exists()).toBe(false);
    expect(wrapper.text()).toContain('Dikelola Direktur & Admin');

    // Open Create Policy Version modal and check strict authority per category
    const openBtn = wrapper.findAll('button').find((b) => b.text().includes('Buat Versi Kebijakan Baru'));
    await openBtn?.trigger('click');

    const selectCat = wrapper.find('#select-cat');
    const options = selectCat.findAll('option');
    expect(options[0].text()).toContain('[Wewenang Anda Aktif]');
    expect(options[1].text()).toContain('[Terkunci: Bukan Pemilik]');

    // Switch to locked category BLOCKER_SLA and verify clean warning wording (no BR-15 / FR-34)
    await selectCat.setValue('BLOCKER_SLA');
    expect(wrapper.find('.category-wewenang-alert').exists()).toBe(true);
    expect(wrapper.find('.category-wewenang-alert').text()).toContain('Perhatian: Anda tidak terdaftar sebagai Pemilik Kebijakan aktif');
    expect(wrapper.text()).not.toContain('BR-15');
    expect(wrapper.text()).not.toContain('FR-34');
  });

  it('shows clean revoke confirmation wording without BR-15 or FR-34 codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [],
          owners: [
            {
              id: 'poa-1',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u1', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
            },
            {
              id: 'poa-2',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u2', fullName: 'Sistem Administrator', email: 'admin@dutamedia.com' },
            },
          ],
        },
      }),
    }));

    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.find('.btn-revoke-owner').trigger('click');
    expect(wrapper.find('#revokeModalTitle').exists()).toBe(true);
    expect(wrapper.text()).toContain('Pencabutan ini akan menonaktifkan hak akses personil tersebut untuk menerbitkan versi baru pada kategori kebijakan ini. Tindakan ini akan dicatat dalam Jejak Audit resmi.');
    expect(wrapper.text()).not.toContain('BR-15');
    expect(wrapper.text()).not.toContain('FR-34');
  });

  it('prevents revoking the last active owner of a category and disables confirm button', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'u-admin',
      email: 'admin@dutamedia.com',
      fullName: 'Sistem Administrator',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [],
          owners: [
            {
              id: 'poa-only',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u1', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
            },
          ],
        },
      }),
    }));

    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.find('.btn-revoke-owner').trigger('click');
    expect(wrapper.find('.last-owner-warning-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Tidak Dapat Mencabut Pemilik Terakhir');
    expect(wrapper.text()).toContain('pemilik kebijakan pengganti terlebih dahulu');
    expect((wrapper.find('.btn-danger').element as HTMLButtonElement).disabled).toBe(true);
  });

  it('requires extra confirmation checkbox when revoking own policy ownership', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'u1',
      email: 'direktur@dutamedia.com',
      fullName: 'Hendra Wijaya',
      role: 'CEO_MANAGEMENT',
      status: 'ACTIVE',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          policies: [],
          owners: [
            {
              id: 'poa-1',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u1', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
            },
            {
              id: 'poa-2',
              policyCategory: 'CHECKIN_TIMING',
              effectiveDate: '2026-10-01',
              user: { id: 'u2', fullName: 'Sistem Administrator', email: 'admin@dutamedia.com' },
            },
          ],
        },
      }),
    }));

    const wrapper = mount(PolicySettingsView, {
      global: {
        plugins: [router],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.find('.btn-revoke-owner').trigger('click');

    expect(wrapper.find('.self-revoke-warning-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Peringatan: Anda Mencabut Wewenang Akun Anda Sendiri');

    const confirmBtn = wrapper.find('.btn-danger').element as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    const checkbox = wrapper.find('#confirm-self-revoke-checkbox');
    await checkbox.setValue(true);
    expect(confirmBtn.disabled).toBe(false);
  });

  it('renders Section 6 with dynamic correction window & reminder values, plus Section 1 & Section 3 dynamic descriptions without SLA text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/policies/audit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            policies: [
              {
                id: 'pol-comp',
                category: 'COMPLIANCE_THRESHOLD',
                configurationValues: { carryOverAmberDays: 4, allowGreenWithCarryOver: true },
                isIllustrative: false,
                isFallback: false,
                effectiveDate: '2026-10-01',
                endDate: null,
                createdBy: { id: 'u1', fullName: 'Direktur', email: 'dir@test.com' },
                createdAt: '2026-10-01',
              },
              {
                id: 'pol-corr',
                category: 'CORRECTION_WINDOW',
                configurationValues: { maxCorrectionDays: 10 },
                isIllustrative: false,
                isFallback: false,
                effectiveDate: '2026-10-01',
                endDate: null,
                createdBy: { id: 'u1', fullName: 'Direktur', email: 'dir@test.com' },
                createdAt: '2026-10-01',
              },
              {
                id: 'pol-notif',
                category: 'NOTIFICATION_REMINDER_THRESHOLD',
                configurationValues: {
                  morningReminderMinutesBefore: 45,
                  eodReminderMinutesBefore: 30,
                  slaWarningPercent: 80,
                },
                isIllustrative: false,
                isFallback: false,
                effectiveDate: '2026-10-01',
                endDate: null,
                createdBy: { id: 'u1', fullName: 'Direktur', email: 'dir@test.com' },
                createdAt: '2026-10-01',
              },
            ],
            owners: [],
          },
        }),
      });
    }));

    const wrapper = mount(PolicySettingsView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('6. Jendela Pengajuan Koreksi & Ambang Pengingat Otomatis');
    expect(wrapper.text()).toContain('Batas Jendela Pengajuan Koreksi');
    expect(wrapper.text()).toContain('Pengingat Komitmen Pagi');
    expect(wrapper.text()).toContain('Pengingat Evaluasi Sore (EOD)');
    expect(wrapper.text()).toContain('Ambang Peringatan Batas Waktu Kendala');
    expect(wrapper.text()).toContain('45 menit sebelumnya');
    expect(wrapper.text()).toContain('Hari ke-4+');
    expect(wrapper.text()).toContain('sebanyak 4 hari berturut-turut');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('80');
    expect(wrapper.text()).not.toContain('SLA');
  });

  it('formats before/after audit diffs for CORRECTION_WINDOW & NOTIFICATION_REMINDER_THRESHOLD and supports audit search/filter reset', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/policies/audit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 'aud-corr',
                timestamp: '2026-10-28T03:00:00.000Z',
                actor: { fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com' },
                actionCode: 'POLICY_VERSION_CREATED',
                category: 'CORRECTION_WINDOW',
                effectiveDate: '2026-10-29',
                changeJustification: 'Perpanjang batas koreksi akhir bulan',
                valueBefore: { maxCorrectionDays: 7 },
                valueAfter: { maxCorrectionDays: 10 },
              },
              {
                id: 'aud-notif',
                timestamp: '2026-10-28T02:00:00.000Z',
                actor: { fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
                actionCode: 'POLICY_VERSION_CREATED',
                category: 'NOTIFICATION_REMINDER_THRESHOLD',
                effectiveDate: '2026-10-29',
                changeJustification: 'Majukan pengingat pagi dan batas kendala',
                valueBefore: {
                  morningReminderMinutesBefore: 60,
                  eodReminderMinutesBefore: 60,
                  slaWarningPercent: 75,
                },
                valueAfter: {
                  morningReminderMinutesBefore: 45,
                  eodReminderMinutesBefore: 30,
                  slaWarningPercent: 80,
                },
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: { policies: [], owners: [] },
        }),
      });
    }));

    const wrapper = mount(PolicySettingsView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Batas Koreksi: 7 → 10 Hari Kerja');
    expect(wrapper.text()).toContain('Pengingat Pagi: 60 → 45 menit');
    expect(wrapper.text()).toContain('Pengingat Sore: 60 → 30 menit');
    expect(wrapper.text()).toContain('Peringatan Batas Kendala: 75% → 80%');
    expect(wrapper.text()).toContain('Menampilkan 2 dari 2 catatan');
    expect(wrapper.text()).not.toContain('SLA');

    await wrapper.find('#auditCategoryFilter').setValue('CORRECTION_WINDOW');
    expect(wrapper.text()).toContain('Menampilkan 1 dari 2 catatan');
    expect(wrapper.text()).toContain('Perpanjang batas koreksi akhir bulan');
    expect(wrapper.text()).not.toContain('Majukan pengingat pagi dan batas kendala');

    await wrapper.find('#auditSearchInput').setValue('tidak-ditemukan-xyz');
    expect(wrapper.text()).toContain('Tidak ada catatan jejak audit yang cocok');
    await wrapper.find('.btn-reset-audit-filter').trigger('click');
    expect(wrapper.text()).toContain('Menampilkan 2 dari 2 catatan');
  });

  it('shows live reason char counter, disables submit on locked category, and validates cutoff chronology & endDate in modal', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'u-hrga',
      email: 'hrga@dutamedia.com',
      fullName: 'Dewi Lestari',
      role: 'HRGA',
      status: 'ACTIVE',
    };

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (String(url).includes('/policies/audit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            policies: [],
            owners: [
              {
                id: 'poa-hrga',
                policyCategory: 'CHECKIN_TIMING',
                effectiveDate: '2026-10-01',
                user: { id: 'u-hrga', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
              },
            ],
          },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(PolicySettingsView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const openBtn = wrapper.findAll('button').find((b) => b.text().includes('Buat Versi Kebijakan Baru'));
    await openBtn?.trigger('click');

    // Counter starts at 0 / 15
    expect(wrapper.find('.char-counter').text()).toContain('0 / 15 karakter minimum');

    const submitBtn = wrapper.find('.modal-form button[type="submit"]').element as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    // Locked category disables submit
    await wrapper.find('#select-cat').setValue('BLOCKER_SLA');
    expect(submitBtn.disabled).toBe(true);

    // Switch back to owned CHECKIN_TIMING and test endDate < effectiveDate & inverted cutoffs
    await wrapper.find('#select-cat').setValue('CHECKIN_TIMING');
    expect(submitBtn.disabled).toBe(false);

    await wrapper.find('#input-reason').setValue('Penyesuaian batas waktu operasional pagi untuk uji validasi');
    expect(wrapper.find('.char-counter').text()).toContain('Alasan memenuhi syarat');

    await wrapper.find('#input-end-date').setValue('2026-01-01');
    await wrapper.find('.modal-form').trigger('submit');
    expect(wrapper.find('.modal-error-alert').text()).toContain(
      'Tanggal berakhir kebijakan tidak boleh mendahului tanggal mulai berlaku',
    );

    await wrapper.find('#input-end-date').setValue('');
    await wrapper.find('#input-morning-ontime').setValue('09:30');
    await wrapper.find('#input-morning-cutoff').setValue('09:00');
    await wrapper.find('.modal-form').trigger('submit');
    expect(wrapper.find('.modal-error-alert').text()).toContain(
      'Batas Kunci Pengisian Pagi (Cut-Off) harus lebih lambat daripada Batas Tepat Waktu Pagi',
    );
  });

  it('allows editing an existing Policy Owner while preserving an earlier effectiveDate, and rejects changing to a different past date', async () => {
    const authStore = useAuthStore();
    authStore.user = {
      id: 'u-dir',
      email: 'direktur@dutamedia.com',
      fullName: 'Hendra Wijaya',
      role: 'CEO_MANAGEMENT',
      status: 'ACTIVE',
    };

    const fetchMock = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 'poa-old' } }),
        });
      }
      if (String(url).includes('/policies/audit')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            policies: [],
            owners: [
              {
                id: 'poa-old',
                policyCategory: 'CHECKIN_TIMING',
                effectiveDate: '2026-10-01',
                user: { id: 'u1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com' },
              },
            ],
            availableUsers: [
              { id: 'u1', fullName: 'Dewi Lestari', email: 'hrga@dutamedia.com', role: 'HRGA' },
              { id: 'u2', fullName: 'Hendra Wijaya', email: 'direktur@dutamedia.com', role: 'CEO_MANAGEMENT' },
            ],
          },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(PolicySettingsView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    await wrapper.find('.btn-edit-owner').trigger('click');
    const effInput = wrapper.find('#owner-effective');
    expect((effInput.element as HTMLInputElement).value).toBe('2026-10-01');
    expect(effInput.attributes('min')).toBe('2026-10-01');

    // Change user while preserving original past effectiveDate -> allowed!
    await wrapper.find('#owner-user').setValue('u2');
    await wrapper.find('.modal-form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/policies/owners/poa-old'),
      expect.objectContaining({ method: 'PUT' }),
    );

    // Re-open edit and change to a DIFFERENT past date -> blocked client-side!
    await wrapper.find('.btn-edit-owner').trigger('click');
    await wrapper.find('#owner-effective').setValue('2026-09-15');
    await wrapper.find('.modal-form').trigger('submit');
    expect(wrapper.find('.modal-error-alert').text()).toContain(
      'Tanggal mulai berlaku penugasan tidak boleh di masa lampau',
    );
  });
});

