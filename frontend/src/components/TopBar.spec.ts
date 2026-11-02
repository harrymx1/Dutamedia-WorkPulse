import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import TopBar from './TopBar.vue';
import { useAuthStore } from '../stores/auth';

describe('TopBar.vue (IMP-014, IMP-015, IMP-018, IMP-019, IMP-020)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-1',
      fullName: 'Harry Aditya Phalosa',
      email: 'harry@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/notifications', component: { template: '<div>Notifications</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders breadcrumb hierarchy accurately with last segment highlighted', () => {
    const wrapper = mount(TopBar, {
      props: {
        breadcrumb: 'Workspace / My Today / Morning Commitment',
      },
      global: {
        plugins: [router, pinia],
      },
    });

    const text = wrapper.text();
    expect(text).toContain('Workspace');
    expect(text).toContain('My Today');
    expect(text).toContain('Morning Commitment');
    expect(wrapper.find('.breadcrumb-current').text()).toBe('Morning Commitment');

    // Negative assertions: NO WP badge, NO WorkPulse brand text, NO text buttons
    expect(wrapper.find('.brand-badge').exists()).toBe(false);
    expect(wrapper.find('.brand-title').exists()).toBe(false);
    expect(text).not.toContain('Riwayat Saya');
    expect(text).not.toContain('Profil Saya');
    expect(text).not.toContain('Kelola Pengguna');
    expect(text).not.toContain('Keluar');
  });

  it('renders single breadcrumb for Profile (Profil Akun)', () => {
    const wrapper = mount(TopBar, {
      props: {
        breadcrumb: 'Profil Akun',
      },
      global: {
        plugins: [router, pinia],
      },
    });

    expect(wrapper.find('.breadcrumb-current').text()).toBe('Profil Akun');
    expect(wrapper.find('.breadcrumb-ancestor').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Workspace');
  });

  it('renders notification bell linking directly to /notifications (IMP-015, DEC-008-UAT)', () => {
    const wrapper = mount(TopBar, {
      props: {
        breadcrumb: 'Workspace / Notifications',
      },
      global: {
        plugins: [router, pinia],
      },
    });

    const notifLink = wrapper.find('[data-testid="topbar-notifications"]');
    expect(notifLink.exists()).toBe(true);
    expect(notifLink.attributes('href')).toBe('/notifications');

    // Negative assertions: No badge, no red dot, no unread counter
    expect(wrapper.find('.badge').exists()).toBe(false);
    expect(wrapper.find('.red-dot').exists()).toBe(false);
    expect(wrapper.find('.unread-count').exists()).toBe(false);
  });

  it('renders circular user avatar with 2-char initials linking to /profile (IMP-014, IMP-020)', () => {
    const wrapper = mount(TopBar, {
      props: {
        breadcrumb: 'Workspace / Blocker',
      },
      global: {
        plugins: [router, pinia],
      },
    });

    const avatarLink = wrapper.find('[data-testid="topbar-profile-avatar"]');
    expect(avatarLink.exists()).toBe(true);
    expect(avatarLink.attributes('href')).toBe('/profile');
    // Harry Aditya Phalosa -> HP
    expect(avatarLink.text()).toBe('HP');
  });

  it('renders custom actions slot when provided', () => {
    const wrapper = mount(TopBar, {
      props: {
        breadcrumb: 'Management / Laporan Eksekutif',
      },
      slots: {
        actions: '<button class="export-btn">Export</button>',
      },
      global: {
        plugins: [router, pinia],
      },
    });

    expect(wrapper.find('.export-btn').exists()).toBe(true);
    expect(wrapper.find('[data-testid="topbar-notifications"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="topbar-profile-avatar"]').exists()).toBe(true);
  });
});
