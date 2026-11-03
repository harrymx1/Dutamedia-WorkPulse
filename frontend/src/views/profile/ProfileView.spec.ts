import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ProfileView from './ProfileView.vue';
import { useAuthStore } from '../../stores/auth';

describe('ProfileView.vue (Cycle 2 Group 3: SOL-PROF-LAYO — IMP-021, IMP-022 & IMP-018, IMP-019, IMP-020)', () => {
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

    // Negative assertions: NO WP badge, NO WorkPulse text on topbar
    expect(topbar.find('.brand-badge').exists()).toBe(false);
    expect(topbar.find('.brand-name').exists()).toBe(false);

    // Right items: notifications bell & avatar
    expect(topbar.find('[data-testid="topbar-notifications"]').exists()).toBe(true);
    expect(topbar.find('[data-testid="topbar-profile-avatar"]').exists()).toBe(true);
    expect(topbar.find('[data-testid="topbar-profile-avatar"]').text()).toBe('AN');
  });

  it('renders large avatar with 2-char initials consistent with sidebar (IMP-020)', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    const largeAvatar = wrapper.find('[data-testid="profile-hero-avatar"]');
    expect(largeAvatar.exists()).toBe(true);
    // Aditya Nugroho -> AN
    expect(largeAvatar.text()).toBe('AN');
  });

  it('separates full name and job title/role without parentheses in user profile view (IMP-021)', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // Full name in Hero card is its own element
    const heroName = wrapper.find('[data-testid="profile-hero-name"]');
    expect(heroName.exists()).toBe(true);
    expect(heroName.text()).toBe('Aditya Nugroho');

    // Job title and function in meta strip are separate elements
    const heroMeta = wrapper.find('[data-testid="profile-hero-meta"]');
    expect(heroMeta.exists()).toBe(true);
    expect(heroMeta.find('.hero-job-title').text()).toBe('Software Engineer');
    expect(heroMeta.find('.hero-department').text()).toBe('Engineering');

    // Negative assertion: NO parentheses concatenation like "Aditya Nugroho (Software Engineer)" or "Aditya Nugroho (EMPLOYEE)"
    const heroCardText = wrapper.find('[data-testid="profile-hero-card"]').text();
    expect(heroCardText).not.toContain('Aditya Nugroho (Software Engineer)');
    expect(heroCardText).not.toContain('Aditya Nugroho (EMPLOYEE)');
    expect(heroCardText).not.toContain('Aditya Nugroho (Frontend Engineer)');

    // In Section 1, Nama Lengkap and Jabatan Fungsional are distinct grid items
    const infoName = wrapper.find('[data-testid="info-fullname"]');
    const infoJob = wrapper.find('[data-testid="info-jobtitle"]');
    expect(infoName.text()).toBe('Aditya Nugroho');
    expect(infoJob.text()).toBe('Software Engineer');
    expect(infoName.text()).not.toContain('(');
  });

  it('renders the 3 canonical sections of Prototype 24 and eliminates prototype simulation bar (IMP-022)', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    // Page Heading & Eyebrow
    expect(wrapper.find('.eyebrow').text()).toBe('Identitas & Konteks Akun');
    expect(wrapper.find('[data-testid="profile-page-title"]').text()).toBe(
      'Profil Pengguna & Keamanan Akun',
    );

    // Section 1: Kartu Identitas & Penugasan Efektif (Read-Only)
    const panel1 = wrapper.find('[data-testid="panel-identity"]');
    expect(panel1.exists()).toBe(true);
    expect(panel1.text()).toContain('1. Kartu Identitas & Penugasan Efektif (Read-Only)');
    expect(panel1.text()).toContain('Master Data Organisasi (Read-Only)');
    expect(panel1.find('[data-testid="info-fullname"]').text()).toBe('Aditya Nugroho');
    expect(panel1.find('[data-testid="info-email"]').text()).toBe('dev.frontend@dutamedia.com');
    expect(panel1.find('[data-testid="prompt-hint-box"]').exists()).toBe(true);
    expect(panel1.find('[data-testid="prompt-hint-badge"]').text()).toContain('Engineering');

    // Section 2: Keamanan & Pembaruan Kata Sandi Mandiri
    const panel2 = wrapper.find('[data-testid="panel-security"]');
    expect(panel2.exists()).toBe(true);
    expect(panel2.text()).toContain('Keamanan & Kata Sandi');
    expect(panel2.text()).toContain('Pembaruan Mandiri');
    expect(panel2.find('#curr-pwd').exists()).toBe(true);
    expect(panel2.find('#new-pwd').exists()).toBe(true);
    expect(panel2.find('#confirm-pwd').exists()).toBe(true);
    expect(panel2.find('.pwd-meter-bars').exists()).toBe(true);
    expect(panel2.find('[data-testid="pwd-strength-label"]').exists()).toBe(true);
    expect(panel2.find('[data-testid="crit-length"]').exists()).toBe(true);
    expect(panel2.find('[data-testid="crit-alnum"]').exists()).toBe(true);
    expect(panel2.find('[data-testid="crit-diff"]').exists()).toBe(true);
    expect(panel2.find('[data-testid="btn-save-pwd"]').exists()).toBe(true);

    // Section 3: Ringkasan Kanal Notifikasi Perangkat Ini
    const panel3 = wrapper.find('[data-testid="panel-notifications"]');
    expect(panel3.exists()).toBe(true);
    expect(panel3.text()).toContain('3. Ringkasan Kanal Notifikasi Perangkat Ini');
    expect(panel3.find('[data-testid="card-push-pill"]').exists()).toBe(true);
    expect(panel3.text()).toContain('60 Menit Sebelum Deadline');
    expect(panel3.text()).toContain('Web Center & Email Resmi');
    expect(panel3.find('[data-testid="btn-goto-notifications"]').exists()).toBe(true);

    // Negative Assertion: Prototype dummy simulation bar MUST be excluded (IMP-022)
    expect(wrapper.find('.sim-bar').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('[Mode Simulasi Prototipe]');
  });
});
