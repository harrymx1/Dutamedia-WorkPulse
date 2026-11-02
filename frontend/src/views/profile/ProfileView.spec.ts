import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ProfileView from './ProfileView.vue';
import { useAuthStore } from '../../stores/auth';

describe('ProfileView.vue (IMP-018, IMP-019, IMP-020)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-dev-1',
      fullName: 'Aditya Nugroho',
      email: 'dev.frontend@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/profile', component: ProfileView },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/notifications', component: { template: '<div>Notifications</div>' } },
      ],
    });
  });

  it('renders global topbar with breadcrumb "Profil Akun" and eliminates redundant branding (IMP-018, IMP-019)', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // Breadcrumb: Profil Akun
    const topbar = wrapper.find('[data-testid="global-topbar"]');
    expect(topbar.exists()).toBe(true);
    expect(topbar.text()).toContain('Profil Akun');

    // Negative assertions: NO WP badge, NO WorkPulse text on topbar, NO Kelola Pengguna in header
    expect(topbar.find('.brand-badge').exists()).toBe(false);
    expect(topbar.find('.brand-name').exists()).toBe(false);
    expect(topbar.text()).not.toContain('Kelola Pengguna');
    expect(topbar.text()).not.toContain('Keluar');

    // Right items: notifications bell & avatar
    expect(topbar.find('[data-testid="topbar-notifications"]').exists()).toBe(true);
    expect(topbar.find('[data-testid="topbar-profile-avatar"]').exists()).toBe(true);
    expect(topbar.find('[data-testid="topbar-profile-avatar"]').text()).toBe('AN');
  });

  it('renders large avatar card with 2-char initials consistent with sidebar (IMP-020)', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    const largeAvatar = wrapper.find('.avatar-large');
    expect(largeAvatar.exists()).toBe(true);
    // Aditya Nugroho -> AN (was previously bugged as single character 'A')
    expect(largeAvatar.text()).toBe('AN');
  });
});
