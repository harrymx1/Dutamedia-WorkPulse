import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';

describe('App.vue', () => {
  it('renders brand title and subtitle properly', () => {
    const wrapper = mount(App);
    expect(wrapper.find('.brand-title').text()).toBe('WorkPulse');
    expect(wrapper.find('.brand-subtitle').text()).toBe('Daily Accountability & Blocker Log System');
    expect(wrapper.find('.system-status').text()).toContain('Sistem Siap (Clean-Slate P0)');
  });
});

