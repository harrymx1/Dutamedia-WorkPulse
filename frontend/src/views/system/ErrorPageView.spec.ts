import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ErrorPageView from './ErrorPageView.vue';
import { useAuthStore } from '../../stores/auth';

describe('ErrorPageView.vue (IMP-023 / TC-AUTH-005 - Role-Based Error Recovery Route)', () => {
  let router: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/forbidden',
          component: ErrorPageView,
          meta: { errorKind: 'forbidden' },
        },
        {
          path: '/not-found',
          component: ErrorPageView,
          meta: { errorKind: 'not-found' },
        },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/daily/morning', component: { template: '<div>Morning</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/compliance', component: { template: '<div>Compliance</div>' } },
        { path: '/admin/organization', component: { template: '<div>Org</div>' } },
      ],
    });
  });

  it('renders "Ke Halaman Login" pointing to /login when unauthenticated', async () => {
    router.push('/forbidden');
    await router.isReady();

    const wrapper = mount(ErrorPageView, {
      global: { plugins: [router, pinia] },
    });

    const btn = wrapper.find('[data-testid="error-home-btn"]');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toBe('Ke Halaman Login');
    expect(btn.attributes('href')).toBe('/login');
  });

  it('renders "Kembali ke Beranda" pointing to /daily/morning for EMPLOYEE (IMP-023)', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-emp',
      fullName: 'Budi Santoso',
      email: 'budi@dutamedia.com',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    };

    router.push('/forbidden?from=/admin/organization');
    await router.isReady();

    const wrapper = mount(ErrorPageView, {
      global: { plugins: [router, pinia] },
    });

    expect(wrapper.text()).toContain('403 — Akses Dibatasi');
    expect(wrapper.text()).toContain('EMPLOYEE');
    expect(wrapper.text()).toContain('/admin/organization');

    const btn = wrapper.find('[data-testid="error-home-btn"]');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toBe('Kembali ke Beranda');
    expect(btn.attributes('href')).toBe('/daily/morning');
  });

  it('renders "Kembali ke Beranda" pointing to /dashboard for managerial roles (SUPERVISOR, HEAD, CEO, PM)', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-spv',
      fullName: 'Siti Rahma',
      email: 'siti@dutamedia.com',
      role: 'SUPERVISOR',
      status: 'ACTIVE',
    };

    router.push('/forbidden');
    await router.isReady();

    const wrapper = mount(ErrorPageView, {
      global: { plugins: [router, pinia] },
    });

    const btn = wrapper.find('[data-testid="error-home-btn"]');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toBe('Kembali ke Beranda');
    expect(btn.attributes('href')).toBe('/dashboard');
  });

  it('renders "Kembali ke Beranda" pointing to /compliance for HRGA', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-hr',
      fullName: 'Dewi Lestari',
      email: 'dewi@dutamedia.com',
      role: 'HRGA',
      status: 'ACTIVE',
    };

    router.push('/forbidden');
    await router.isReady();

    const wrapper = mount(ErrorPageView, {
      global: { plugins: [router, pinia] },
    });

    const btn = wrapper.find('[data-testid="error-home-btn"]');
    expect(btn.attributes('href')).toBe('/compliance');
  });

  it('renders "Kembali ke Beranda" pointing to /admin/organization for SYSTEM_ADMIN', async () => {
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 'usr-admin',
      fullName: 'Admin System',
      email: 'admin@dutamedia.com',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
    };

    router.push('/forbidden');
    await router.isReady();

    const wrapper = mount(ErrorPageView, {
      global: { plugins: [router, pinia] },
    });

    const btn = wrapper.find('[data-testid="error-home-btn"]');
    expect(btn.attributes('href')).toBe('/admin/organization');
  });
});

