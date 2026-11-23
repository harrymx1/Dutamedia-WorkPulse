import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AdminUserInvitationView from './AdminUserInvitationView.vue';
import AdminUsersView from './AdminUsersView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

describe('AdminUsersView & AdminUserInvitationView (Audit #25 - Kelola Pengguna & Undangan)', () => {
  let router: any;
  let fetchMock: ReturnType<typeof vi.fn>;

  const sampleUsers = [
    {
      id: 'admin-1',
      fullName: 'System Administrator',
      email: 'admin@dutamedia.com',
      status: 'ACTIVE',
      currentRole: 'SYSTEM_ADMIN',
      currentFunction: 'OperationsInfrastructure',
      currentJobTitle: 'System Admin',
      employmentStatus: 'PERMANENT',
      assignmentEndDate: null,
      isInternExpired: false,
      createdAt: '2026-01-01T00:00:00Z',
      invitation: null,
    },
    {
      id: 'usr-invited-1',
      fullName: 'Dewi Anjani',
      email: 'dewi@dutamedia.com',
      status: 'INVITED',
      currentRole: 'EMPLOYEE',
      currentFunction: 'OperationsInfrastructure',
      currentJobTitle: 'UI Designer',
      employmentStatus: 'PERMANENT',
      assignmentEndDate: null,
      isInternExpired: false,
      createdAt: '2026-10-21T10:00:00Z',
      invitation: {
        id: 'inv-1',
        status: 'EXPIRED',
        expiresAt: '2026-10-24T10:00:00Z',
        createdAt: '2026-10-21T10:00:00Z',
      },
    },
    {
      id: 'usr-active-2',
      fullName: 'Raka Pratama',
      email: 'raka@dutamedia.com',
      status: 'ACTIVE',
      currentRole: 'HEAD',
      currentFunction: 'RnD',
      currentJobTitle: 'Head of R&D',
      employmentStatus: 'PERMANENT',
      assignmentEndDate: null,
      isInternExpired: false,
      createdAt: '2026-06-01T00:00:00Z',
      invitation: null,
    },
  ];

  const sampleSummary = {
    total: 3,
    active: 2,
    invited: 1,
    invitedPending: 0,
    invitedExpired: 1,
    invitedRevoked: 0,
    inactive: 0,
    needsAttention: 1,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.user = {
      id: 'admin-1',
      fullName: 'System Administrator',
      email: 'admin@dutamedia.com',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    };

    fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/resend-invitation')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              token: 'new-token-72h-abc',
              expiresAt: '2026-11-26T10:00:00Z',
              user: { id: 'usr-invited-1', fullName: 'Dewi Anjani', email: 'dewi@dutamedia.com' },
            },
          }),
        });
      }
      if (url.includes('/status') && init?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              message: 'Akun pengguna berhasil dinonaktifkan dan seluruh sesi aktif telah dihentikan.',
              status: 'INACTIVE',
            },
          }),
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              data: sampleUsers,
              pagination: { totalRecords: sampleUsers.length },
              summary: sampleSummary,
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/admin/invitations', component: AdminUserInvitationView },
        { path: '/admin/users', component: AdminUsersView },
        { path: '/admin/organization', component: { template: '<div>Org</div>' } },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders AdminUserInvitationView with invitation focus and defaults request to status=INVITED', async () => {
    const wrapper = mount(AdminUserInvitationView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Undangan Karyawan & Aktivasi Akun');
    expect(wrapper.text()).toContain('Dewi Anjani');
    expect(wrapper.text()).toContain('dewi@dutamedia.com');
    const calledUrls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calledUrls.some((u) => u.includes('/v1/admin/users') && u.includes('status=INVITED'))).toBe(true);
  });

  it('renders 4 KPI cards, 2-letter initials, Indonesian labels, and protects current admin from self-deactivation', async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Kelola Pengguna & Undangan');
    expect(text).toContain('Total Akun');
    expect(text).toContain('Menunggu Aktivasi');
    expect(text).toContain('Nonaktif / Kedaluwarsa');
    expect(text).toContain('DA');
    expect(text).toContain('Operations & Infrastructure');
    expect(text).toContain('R&D');
    expect(text).toContain('Karyawan');
    expect(text).toContain('Kepala Divisi');
    expect(text).toContain('Kedaluwarsa');
    expect(text).toContain('Akun Anda');
  });

  it('uses valid Prisma CanonicalFunction enum value OperationsInfrastructure in invite modal', async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();
    await wrapper.find('.cta-invite-btn').trigger('click');

    const funcOptions = wrapper.find('#new-func').findAll('option').map((o) => ({
      value: o.attributes('value'),
      text: o.text(),
    }));
    expect(funcOptions).toContainEqual({
      value: 'OperationsInfrastructure',
      text: 'Operations & Infrastructure',
    });
    expect(funcOptions).toContainEqual({
      value: 'SalesEnablementPresales',
      text: 'Sales Enablement & Presales',
    });
  });

  it('opens in-app confirmation modal for Kirim Ulang (no window.confirm) and displays returned activation token', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const wrapper = mount(AdminUsersView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    const resendBtn = wrapper.find('button[aria-label="Kirim ulang undangan untuk Dewi Anjani"]');
    await resendBtn.trigger('click');

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Kirim Ulang Undangan Aktivasi');
    await wrapper.find('.modal-box-sm form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('/activate?token=new-token-72h-abc');
    expect(wrapper.text()).toContain('Salin Tautan Aktivasi');
    confirmSpy.mockRestore();
  });

  it('opens calm in-app confirmation modal with impact explanation before deactivating another active user', async () => {
    const wrapper = mount(AdminUsersView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    const deactivateBtn = wrapper.find('button.btn-status-toggle.deactivate');
    await deactivateBtn.trigger('click');

    expect(wrapper.text()).toContain('Nonaktifkan Akun Pengguna');
    expect(wrapper.text()).toContain('Sesi aktif langsung dihentikan & check-in berikutnya berhenti');
    await wrapper.find('#lifecycle-reason').setValue('Habis masa kontrak');
    await wrapper.find('.modal-box-sm form').trigger('submit.prevent');
    await flushPromises();

    const patchCall = fetchMock.mock.calls.find(
      (c) => String(c[0]).includes('/usr-active-2/status') && c[1]?.method === 'PATCH',
    );
    expect(patchCall).toBeDefined();
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({
      status: 'INACTIVE',
      reason: 'Habis masa kontrak',
    });
  });

  it('preserves full directory summary counts from meta.summary when view is filtered', async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: [sampleUsers[1]],
          meta: {
            pagination: { page: 1, limit: 200, totalRecords: 1, totalPages: 1 },
            summary: {
              total: 26,
              active: 24,
              invited: 2,
              invitedPending: 1,
              invitedExpired: 1,
              invitedRevoked: 0,
              inactive: 0,
              needsAttention: 1,
            },
          },
        }),
      }),
    );

    const wrapper = mount(AdminUsersView, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Menampilkan 1 dari 26 akun');
    expect(wrapper.text()).toContain('26');
    expect(wrapper.text()).toContain('24');
  });
});
