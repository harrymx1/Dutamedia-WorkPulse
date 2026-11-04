import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivateView from './ActivateView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

describe('ActivateView.vue (WP-EP02-TK005 / Prototipe 01 Tab Aktivasi)', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/activate', component: ActivateView },
        { path: '/login', component: { template: '<div>Login</div>' } },
      ],
    });
  });

  it('renders activation form with token and password inputs', () => {
    const wrapper = mount(ActivateView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('#activate-token').exists()).toBe(true);
    expect(wrapper.find('#activate-password').exists()).toBe(true);
    expect(wrapper.find('#activate-confirm').exists()).toBe(true);
  });

  it('calculates password strength when password is typed', async () => {
    const wrapper = mount(ActivateView, {
      global: {
        plugins: [router],
      },
    });

    const passwordInput = wrapper.find('#activate-password');
    await passwordInput.setValue('Short');
    expect(wrapper.text()).toContain('Sangat Lemah');

    await passwordInput.setValue('ValidSecurePass123!');
    expect(wrapper.text()).toContain('Sangat Kuat');
  });

  it('renders synchronized headline "Komitmen jelas, hambatan tuntas" (IMP-007, IMP-012)', () => {
    const wrapper = mount(ActivateView, {
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
    const wrapper = mount(ActivateView, {
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
    const wrapper = mount(ActivateView, {
      global: {
        plugins: [router],
      },
    });

    const footer = wrapper.find('.brand-footer');
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain('Internal Workspace Environment');
    expect(footer.text()).not.toContain('PT Dutamedia Mandiri Pratama');
  });
});

