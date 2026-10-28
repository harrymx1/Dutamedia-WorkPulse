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
});

