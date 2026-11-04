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

  it('renders concise "Dutamedia" brand caption and consolidated "My Today" menu item (IMP-017)', async () => {
    const wrapper = mount(EnterpriseSidebar, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // 1. Brand caption must be "Dutamedia" (not "Dutamedia Intranet")
    const brandCaption = wrapper.find('.brand-caption');
    expect(brandCaption.exists()).toBe(true);
    expect(brandCaption.text()).toBe('Dutamedia');

    // 2. Workspace group must contain single consolidated "My Today"
    const navTextList = wrapper.findAll('.nav-text').map((n) => n.text());
    expect(navTextList).toContain('My Today');
    expect(navTextList).not.toContain('Morning Commitment');
    expect(navTextList).not.toContain('Additional Work');
    expect(navTextList).not.toContain('EOD Outcome');
  });
});

