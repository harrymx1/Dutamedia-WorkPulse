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
    expect(wrapper.text()).toContain('Jam Kerja & Waktu Komitmen (Check-in Timing)');
    expect(wrapper.text()).toContain('Target Waktu Respon & Penanganan Kendala (Blocker SLA)');

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

    expect(wrapper.text()).toContain('Ambang Batas Pengingat & Notifikasi (Notification Reminder)');

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
});

