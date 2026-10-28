import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfileSettingsView from './ProfileSettingsView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

describe('ProfileSettingsView.vue (Prototipe 24 / EP14 - Pengaturan Profil & Keamanan Akun)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.user = {
      id: 'usr-1',
      fullName: 'Budi Pratama',
      email: 'budi@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/profile', component: ProfileSettingsView },
        { path: '/login', component: { template: '<div>Login</div>' } },
      ],
    });
  });

  it('renders user profile details and role-based reflection prompt', async () => {
    const wrapper = mount(ProfileSettingsView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.text()).toContain('Budi Pratama');
    expect(wrapper.text()).toContain('budi@dutamedia.com');
    expect(wrapper.text()).toContain('Role-Based Reflection Prompt');
    expect(wrapper.text()).toContain('Keamanan & Kata Sandi');
  });
});
