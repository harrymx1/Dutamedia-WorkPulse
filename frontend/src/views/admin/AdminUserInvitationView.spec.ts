import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminUserInvitationView from './AdminUserInvitationView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

describe('AdminUserInvitationView.vue (Prototipe 25 / EP02, EP14 - User & Invitation Management)', () => {
  let router: any;

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

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: {
              data: [
                {
                  id: 'usr-invited-1',
                  fullName: 'Dewi Anjani',
                  email: 'dewi@dutamedia.com',
                  status: 'INVITED',
                  currentRole: 'EMPLOYEE',
                  currentFunction: 'Product',
                  currentJobTitle: 'UI Designer',
                  createdAt: '2026-10-21T10:00:00Z',
                  invitation: {
                    id: 'inv-1',
                    status: 'PENDING',
                    expiresAt: '2026-10-24T10:00:00Z',
                    createdAt: '2026-10-21T10:00:00Z',
                  },
                },
              ],
              pagination: { totalRecords: 1 },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    }));

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/admin/invitations', component: AdminUserInvitationView },
        { path: '/admin/users', component: AdminUserInvitationView },
      ],
    });
  });

  it('renders user management and invitation list correctly', async () => {
    const wrapper = mount(AdminUserInvitationView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Kelola Pengguna & Undangan');
    expect(wrapper.text()).toContain('Dewi Anjani');
    expect(wrapper.text()).toContain('dewi@dutamedia.com');
    expect(wrapper.text()).toContain('Undang Pengguna Baru');
  });
});
