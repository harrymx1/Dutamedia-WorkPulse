import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivateView from './ActivateView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

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

  it('menampilkan kartu pratinjau akun, 3 syarat kata sandi, tolak sandi tanpa huruf+angka, tombol mata konfirmasi, & header mobile (Audit #2)', async () => {
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'previewInvitation').mockResolvedValueOnce({
      valid: true,
      status: 'PENDING',
      account: {
        fullName: 'Fajar Ramadhan',
        email: 'calon.karyawan@dutamedia.com',
        department: 'Engineering',
        jobTitle: 'Junior Developer',
      },
    });

    await router.push('/activate?token=wp_seed_invite_token_72h_demo_secret');
    await router.isReady();

    const wrapper = mount(ActivateView, {
      global: {
        plugins: [router],
      },
    });
    await new Promise((r) => setTimeout(r, 30));

    // 1. Mobile brand header tersedia untuk layar <= 900px
    expect(wrapper.find('[data-testid="mobile-brand-header"]').exists()).toBe(true);

    // 2. Kartu pratinjau akun tampil dengan inisial FR, nama, email, & status UNDANGAN AKTIF
    const previewCard = wrapper.find('[data-testid="account-preview-card"]');
    expect(previewCard.exists()).toBe(true);
    expect(previewCard.text()).toContain('FR');
    expect(previewCard.text()).toContain('Fajar Ramadhan');
    expect(previewCard.text()).toContain('calon.karyawan@dutamedia.com · Engineering');
    expect(previewCard.text()).toContain('UNDANGAN AKTIF');

    // 3. Kotak daftar periksa 3 syarat tampil & menolak kata sandi tanpa angka
    const checklist = wrapper.find('[data-testid="password-criteria-checklist"]');
    expect(checklist.exists()).toBe(true);
    expect(checklist.text()).toContain('Minimal 8 karakter');
    expect(checklist.text()).toContain('Kombinasi huruf & angka');
    expect(checklist.text()).toContain('Konfirmasi kata sandi cocok');

    await wrapper.find('#activate-password').setValue('hanyahuruf');
    await wrapper.find('#activate-confirm').setValue('hanyahuruf');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Kata sandi wajib minimal 8 karakter dengan kombinasi huruf dan angka.');

    // 4. Tombol ikon mata di kolom konfirmasi kata sandi mengubah tipe input text <-> password
    const confirmInput = wrapper.find('#activate-confirm');
    expect(confirmInput.attributes('type')).toBe('password');
    await wrapper.find('[data-testid="toggle-confirm-password"]').trigger('click');
    expect(confirmInput.attributes('type')).toBe('text');
  });
});

