import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

describe('App.vue', () => {
  it('renders router-view container successfully', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div class="test-home">Home View</div>' },
        },
      ],
    });

    router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('.test-home').exists()).toBe(true);
  });
});
