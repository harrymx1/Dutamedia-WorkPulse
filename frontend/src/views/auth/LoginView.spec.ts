import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginView from './LoginView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

describe('LoginView.vue (WP-EP02-TK005 / Prototipe 01)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: LoginView },
        { path: '/activate', component: { template: '<div>Activate</div>' } },
        { path: '/profile', component: { template: '<div>Profile</div>' } },
      ],
    });
  });

  it('renders login form with email and password inputs', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('#login-email').exists()).toBe(true);
    expect(wrapper.find('#login-password').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Masuk ke Sistem');
  });

  it('validates empty inputs on submit and displays error message', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.find('.field-error-msg').exists()).toBe(true);
    expect(wrapper.text()).toContain('Alamat email wajib diisi');
  });

  it('renders inclusive rhythm headline "Komitmen jelas, hambatan tuntas" without narrow text (IMP-007)', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    const headline = wrapper.find('h1');
    expect(headline.exists()).toBe(true);
    expect(headline.text()).toContain('Komitmen jelas,');
    expect(headline.text()).toContain('hambatan tuntas');
    expect(wrapper.text()).not.toContain('Fokus pada Hasil, Tuntaskan Kendala.');
  });

  it('renders dynamic brand version label "WorkPulse v1.5 · Dutamedia" without technical jargon (IMP-008)', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    const footer = wrapper.find('.brand-footer');
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain('WorkPulse v1.5 · Dutamedia');
    expect(wrapper.text()).not.toContain('Clean-Slate Architecture');
    expect(wrapper.text()).not.toContain('WorkPulse v2.0');
  });

  it('renders workspace environment indicator "Internal Workspace Environment" in hero footer (IMP-009)', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    const footer = wrapper.find('.brand-footer');
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain('Internal Workspace Environment');
    expect(footer.text()).not.toContain('PT Dutamedia Mandiri Pratama');
  });

  it('renders user-friendly access help hint instead of technical security jargon (IMP-010)', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    const helpHint = wrapper.find('.help-hint');
    expect(helpHint.exists()).toBe(true);
    expect(helpHint.text()).toContain('Kendala akses akun? Hubungi Admin System atau Tim HRGA.');
    expect(wrapper.text()).not.toContain('Tim IT Support');
    expect(wrapper.text()).not.toContain('HttpOnly & CSRF Double-Submit');
  });

  it('renders friendly error message for INACTIVE account status (IMP-013)', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    const authStore = useAuthStore();
    vi.spyOn(authStore, 'login').mockRejectedValueOnce({
      statusCode: 401,
      message: 'Akun Anda dinonaktifkan oleh administrator. Hubungi HRGA untuk informasi lebih lanjut.',
    });

    await wrapper.find('#login-email').setValue('inactive.user@dutamedia.com');
    await wrapper.find('#login-password').setValue('ValidPassword123!');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.find('.alert-banner.error').exists()).toBe(true);
    expect(wrapper.find('.alert-banner.error').text()).toContain(
      'Akun Anda dinonaktifkan oleh administrator. Hubungi HRGA untuk informasi lebih lanjut.',
    );
  });

  it('renders friendly Indonesian message without technical leakage when rate-limit 429 lockout occurs (IMP-013)', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    const authStore = useAuthStore();
    vi.spyOn(authStore, 'login').mockRejectedValueOnce({
      statusCode: 429,
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'ThrottlerException: Too Many Requests',
    });

    await wrapper.find('#login-email').setValue('user@dutamedia.com');
    await wrapper.find('#login-password').setValue('ValidPassword123!');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.find('.alert-banner.error').exists()).toBe(true);
    expect(wrapper.find('.alert-banner.error').text()).toContain(
      'Terlalu banyak percobaan masuk. Demi keamanan sistem, silakan tunggu 1 menit sebelum mencoba kembali.',
    );
    expect(wrapper.text()).not.toContain('ThrottlerException');
  });
});
