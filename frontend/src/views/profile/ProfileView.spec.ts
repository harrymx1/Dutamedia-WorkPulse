import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ProfileView from './ProfileView.vue';
import { useAuthStore } from '../../stores/auth';

describe('ProfileView.vue (Cycle 2 Group 3: SOL-PROF-LAYO + Audit #24)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: '299830d6-3d3a-4c10-b1e4-ff7d89d13ad4',
      fullName: 'Aditya Nugroho',
      email: 'dev.frontend@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      jobTitle: 'Frontend Engineer',
      function: 'Engineering',
      employmentStatus: 'PERMANENT',
      assignmentEffectiveDate: '2026-02-10',
      managerName: 'Arif Budiman',
      activeExemption: null,
      reminderSchedule: {
        leadMinutes: 60,
        morningReminderTime: '08:00',
        eodReminderTime: '16:00',
        morningOnTimeCutoff: '09:00',
        eodOnTimeCutoff: '17:00',
      },
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

    await flushPromises();

    const topbar = wrapper.find('[data-testid="global-topbar"]');
    expect(topbar.exists()).toBe(true);
    expect(topbar.text()).toContain('Profil Akun');

    expect(topbar.find('.brand-badge').exists()).toBe(false);
    expect(topbar.find('.brand-name').exists()).toBe(false);

    expect(topbar.find('[data-testid="topbar-notifications"]').exists()).toBe(true);
    expect(topbar.find('[data-testid="topbar-profile-avatar"]').exists()).toBe(true);
    expect(topbar.find('[data-testid="topbar-profile-avatar"]').text()).toBe('AN');
  });

  it('formats UUID into readable compact #USR code and displays real effective date and active exemption', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      ...authStore.user!,
      activeExemption: {
        type: 'BOUNDED',
        category: 'Dinas Luar Kota',
        startDate: '2026-11-20',
        endDate: '2026-11-24',
      },
    };

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="profile-hero-avatar"]').text()).toBe('AN');
    expect(wrapper.find('[data-testid="profile-hero-id"]').text()).toBe('#USR-299830D6');
    expect(wrapper.find('[data-testid="info-nik"]').text()).toBe('#USR-299830D6');
    expect(wrapper.find('[data-testid="info-effdate"]').text()).toBe('10 Feb 2026');
    expect(wrapper.find('[data-testid="info-role"]').text()).toBe('Karyawan');
    expect(wrapper.find('[data-testid="info-exemption"]').text()).toContain('Dispensasi Aktif: Dinas Luar Kota');
  });

  it('separates full name and job title/role without parentheses in user profile view (IMP-021)', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await flushPromises();

    const heroName = wrapper.find('[data-testid="profile-hero-name"]');
    expect(heroName.text()).toBe('Aditya Nugroho');

    const heroMeta = wrapper.find('[data-testid="profile-hero-meta"]');
    expect(heroMeta.find('.hero-job-title').text()).toBe('Frontend Engineer');
    expect(heroMeta.find('.hero-department').text()).toBe('Engineering');

    const heroCardText = wrapper.find('[data-testid="profile-hero-card"]').text();
    expect(heroCardText).not.toContain('Aditya Nugroho (Frontend Engineer)');
    expect(heroCardText).not.toContain('Aditya Nugroho (EMPLOYEE)');

    expect(wrapper.find('[data-testid="info-fullname"]').text()).toBe('Aditya Nugroho');
    expect(wrapper.find('[data-testid="info-jobtitle"]').text()).toBe('Frontend Engineer');
    expect(wrapper.find('[data-testid="info-manager"]').text()).toBe('Arif Budiman');
  });

  it('sanitizes legacy parenthesized role strings from backend fullName (IMP-021)', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-dev-1',
      fullName: 'Aditya Nugroho (Frontend Engineer)',
      email: 'dev.frontend@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="profile-hero-name"]').text()).toBe('Aditya Nugroho');
    expect(wrapper.find('[data-testid="info-fullname"]').text()).toBe('Aditya Nugroho');
    expect(wrapper.find('[data-testid="profile-hero-avatar"]').text()).toBe('AN');
  });

  it('renders the 3 Indonesian sections without prompt-hint box, technical cookie jargon, or prototype sim bar', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      ...authStore.user!,
      reminderSchedule: {
        leadMinutes: 60,
        morningReminderTime: '22:58',
        eodReminderTime: '16:30',
        morningOnTimeCutoff: '23:58',
        eodOnTimeCutoff: '17:30',
      },
    };

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await flushPromises();

    expect(wrapper.find('.eyebrow').text()).toBe('Identitas & Konteks Akun');
    expect(wrapper.find('[data-testid="profile-page-title"]').text()).toBe(
      'Profil Pengguna & Keamanan Akun',
    );
    expect(wrapper.text()).not.toContain('pratinjau panduan komitmen');
    expect(wrapper.text()).not.toContain('HttpOnly; Secure; SameSite=Strict');
    expect(wrapper.text()).toContain('Sesi masuk Anda terlindungi secara otomatis pada peramban ini.');

    const panel1 = wrapper.find('[data-testid="panel-identity"]');
    expect(panel1.text()).toContain('1. Kartu Identitas & Penugasan Aktif');
    expect(panel1.find('[data-testid="prompt-hint-box"]').exists()).toBe(false);

    const panel2 = wrapper.find('[data-testid="panel-security"]');
    expect(panel2.find('input[name="username"]').exists()).toBe(true);
    expect(panel2.find('#new-pwd').attributes('placeholder')).toBe('Min. 8 karakter (huruf & angka)');

    const panel3 = wrapper.find('[data-testid="panel-notifications"]');
    expect(panel3.find('[data-testid="card-reminder-desc"]').text()).toContain('22:58 WIB');
    expect(panel3.find('[data-testid="card-reminder-desc"]').text()).toContain('16:30 WIB');
    expect(panel3.text()).not.toContain('Unregister');
    expect(panel3.text()).not.toContain('[Mode Simulasi Prototipe]');
  });

  it('blocks identical new password client-side, clears error on input, and passes revokeOtherSessions checkbox on submit', async () => {
    const authStore = useAuthStore(pinia);
    const changeSpy = vi
      .spyOn(authStore, 'changePassword')
      .mockResolvedValue('Kata sandi berhasil diperbarui dan seluruh sesi aktif di perangkat/peramban lain telah diakhiri.');

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router, pinia],
      },
    });

    await flushPromises();

    // Same password -> blocked client-side without calling API
    await wrapper.find('#curr-pwd').setValue('Sama1234!');
    await wrapper.find('#new-pwd').setValue('Sama1234!');
    await wrapper.find('#confirm-pwd').setValue('Sama1234!');
    await wrapper.find('form').trigger('submit.prevent');

    expect(changeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="pwd-error-banner"]').text()).toBe(
      'Kata sandi baru harus berbeda dari kata sandi saat ini.',
    );

    // Typing clears error immediately
    await wrapper.find('#new-pwd').setValue('Baru1234!');
    expect(wrapper.find('[data-testid="pwd-error-banner"]').exists()).toBe(false);

    // Confirm and submit with default checked revokeOtherSessions=true
    await wrapper.find('#confirm-pwd').setValue('Baru1234!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(changeSpy).toHaveBeenCalledWith('Sama1234!', 'Baru1234!', true);
    expect(wrapper.find('[data-testid="pwd-success-banner"]').text()).toContain(
      'perangkat/peramban lain telah diakhiri',
    );

    // Submit again with unchecked revokeOtherSessions=false
    await wrapper.find('#curr-pwd').setValue('Baru1234!');
    await wrapper.find('#new-pwd').setValue('LebihBaru99!');
    await wrapper.find('#confirm-pwd').setValue('LebihBaru99!');
    await wrapper.find('[data-testid="chk-revoke-other-sessions"]').setValue(false);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(changeSpy).toHaveBeenLastCalledWith('Baru1234!', 'LebihBaru99!', false);
  });
});
