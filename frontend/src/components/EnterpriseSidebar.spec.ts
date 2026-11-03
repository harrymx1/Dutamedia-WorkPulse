import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import EnterpriseSidebar from './EnterpriseSidebar.vue';
import { useAuthStore } from '../stores/auth';

describe('EnterpriseSidebar.vue (IMP-020, IMP-021)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-1',
      fullName: 'Aditya Nugroho (Frontend Engineer)',
      email: 'dev.frontend@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders clean employee name in sidebar footer without parenthesized role (IMP-021)', async () => {
    const wrapper = mount(EnterpriseSidebar, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    const userName = wrapper.find('.user-name');
    expect(userName.exists()).toBe(true);
    // Verified: Name is cleanly "Aditya Nugroho", NOT "Aditya Nugroho (Frontend Engineer)"
    expect(userName.text()).toBe('Aditya Nugroho');
    expect(userName.text()).not.toContain('(');

    // Verified: Avatar is "AN", NOT "AE"
    const avatar = wrapper.find('.avatar');
    expect(avatar.text()).toBe('AN');

    // Role is separate element
    const role = wrapper.find('[data-testid="nav-role"]');
    expect(role.text()).toBe('Staff / Employee');
  });
});

