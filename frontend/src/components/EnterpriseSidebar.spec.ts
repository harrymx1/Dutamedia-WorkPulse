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

  it('hides Workspace group completely when logged in as SYSTEM_ADMIN (IMP-026)', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-admin',
      fullName: 'Sistem Administrator',
      email: 'admin@dutamedia.com',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    };

    const wrapper = mount(EnterpriseSidebar, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // 1. Group headers must NOT contain 'Workspace', but MUST contain 'Administration' and 'Management'
    const sectionTitles = wrapper.findAll('.nav-label').map((s) => s.text());
    expect(sectionTitles).not.toContain('Workspace');
    expect(sectionTitles).toContain('Management');
    expect(sectionTitles).toContain('Administration');

    expect(wrapper.find('[data-testid="nav-group-workspace"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="nav-group-management"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="nav-group-administration"]').exists()).toBe(true);

    // 2. Nav text list must NOT contain any operational workspace items
    const navTextList = wrapper.findAll('.nav-text').map((n) => n.text());
    expect(navTextList).not.toContain('My Today');
    expect(navTextList).not.toContain('Lapor Blocker');
    expect(navTextList).not.toContain('Riwayat Saya');
    expect(navTextList).not.toContain('Cuti Saya');
    expect(navTextList).not.toContain('Koreksi Komitmen Pagi');
    expect(navTextList).not.toContain('Koreksi Evaluasi Sore');

    // 3. Nav text list must contain administrative items
    expect(navTextList).toContain('Struktur Organisasi');
    expect(navTextList).toContain('Kelola Pengguna');
    expect(navTextList).toContain('Kebijakan & Cut-off');
  });

  it('hides Management group completely when logged in as EMPLOYEE', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'emp-1',
      email: 'dev.frontend@dutamedia.com',
      fullName: 'Aditya Nugroho',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    const wrapper = mount(EnterpriseSidebar, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    const groupTitles = wrapper.findAll('.nav-label').map((l) => l.text());
    expect(groupTitles).toContain('Workspace');
    expect(groupTitles).not.toContain('Management');
    expect(wrapper.find('[data-testid="nav-group-management"]').exists()).toBe(false);
  });
});

