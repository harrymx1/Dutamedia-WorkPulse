import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ToastPopup from './ToastPopup.vue';
import { computeToastDurationMs } from '../utils/toastDuration';

describe('ToastPopup & computeToastDurationMs', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('computes adaptive duration for success (4s-5.5s) and error (6s-10s)', () => {
    expect(computeToastDurationMs('Perubahan disimpan.', 'success')).toBe(4000);
    expect(
      computeToastDurationMs(
        'Catatan cuti resmi berhasil diperbarui dan seluruh notifikasi ke atasan langsung serta karyawan sudah dikirim otomatis.',
        'success',
      ),
    ).toBe(5500);

    expect(computeToastDurationMs('Gagal menyimpan.', 'error')).toBe(6000);
    expect(
      computeToastDurationMs(
        'Komitmen #1 wajib diisi judulnya minimal 5 karakter dan pilih minimal satu dampak kendala sebelum mengirim laporan harian pagi Anda.',
        'error',
      ),
    ).toBeLessThanOrEqual(10000);
    expect(
      computeToastDurationMs(
        'Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh sebelas dua belas tiga belas empat belas lima belas enam belas tujuh belas delapan belas sembilan belas dua puluh dua satu dua dua dua tiga dua empat dua lima.',
        'error',
      ),
    ).toBe(10000);
  });

  it('auto-dismisses short success toast after 4000ms', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ToastPopup, {
      props: {
        toastMessage: 'Perubahan disimpan.',
        errorMessage: null,
      },
    });

    const el = wrapper.find('.toast-popup.success');
    expect(el.exists()).toBe(true);
    expect(el.attributes('role')).toBe('status');
    expect(el.attributes('aria-live')).toBe('polite');

    await vi.advanceTimersByTimeAsync(3900);
    expect(wrapper.emitted('clear-toast')).toBeUndefined();

    await vi.advanceTimersByTimeAsync(150);
    expect(wrapper.emitted('clear-toast')).toHaveLength(1);
  });

  it('auto-dismisses error toast after its adaptive 6s-10s duration', async () => {
    vi.useFakeTimers();
    const msg = 'Komitmen #1 wajib diisi minimal 5 karakter sebelum mengirim check-in pagi hari ini.';
    const expectedMs = computeToastDurationMs(msg, 'error');
    expect(expectedMs).toBeGreaterThanOrEqual(6000);
    expect(expectedMs).toBeLessThanOrEqual(10000);

    const wrapper = mount(ToastPopup, {
      props: {
        toastMessage: null,
        errorMessage: msg,
      },
    });

    const el = wrapper.find('.toast-popup.error');
    expect(el.exists()).toBe(true);
    expect(el.attributes('role')).toBe('alert');
    expect(el.attributes('aria-live')).toBe('assertive');

    await vi.advanceTimersByTimeAsync(expectedMs - 200);
    expect(wrapper.emitted('clear-error')).toBeUndefined();

    await vi.advanceTimersByTimeAsync(250);
    expect(wrapper.emitted('clear-error')).toHaveLength(1);
  });

  it('pauses countdown on hover and resumes remaining time on mouseleave', async () => {
    vi.useFakeTimers();
    const msg = 'Data gagal dikirim ke server karena koneksi terputus sementara.';
    const expectedMs = computeToastDurationMs(msg, 'error');

    const wrapper = mount(ToastPopup, {
      props: {
        toastMessage: null,
        errorMessage: msg,
      },
    });

    const toastEl = wrapper.find('.toast-popup.error');
    await vi.advanceTimersByTimeAsync(2000);
    await toastEl.trigger('mouseenter');

    // Even after 20s while hovered, toast remains open and clear-error is not emitted
    await vi.advanceTimersByTimeAsync(20000);
    expect(wrapper.emitted('clear-error')).toBeUndefined();

    // After mouseleave, remaining time resumes
    await toastEl.trigger('mouseleave');
    const remaining = expectedMs - 2000;
    await vi.advanceTimersByTimeAsync(remaining - 200);
    expect(wrapper.emitted('clear-error')).toBeUndefined();

    await vi.advanceTimersByTimeAsync(300);
    expect(wrapper.emitted('clear-error')).toHaveLength(1);
  });

  it('dismisses immediately when clicking the manual close button', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ToastPopup, {
      props: {
        toastMessage: 'Berhasil disimpan.',
        errorMessage: 'Terjadi kesalahan validasi.',
      },
    });

    const closeBtns = wrapper.findAll('[data-testid="toast-close-btn"]');
    expect(closeBtns).toHaveLength(2);
    expect(closeBtns[0].attributes('aria-label')).toBe('Tutup notifikasi');

    await closeBtns[0].trigger('click');
    expect(wrapper.emitted('clear-toast')).toHaveLength(1);
    expect(wrapper.emitted('clear-error')).toBeUndefined();

    await closeBtns[1].trigger('click');
    expect(wrapper.emitted('clear-error')).toHaveLength(1);

    // Ensure cancelled timers do not emit duplicate events later
    await vi.advanceTimersByTimeAsync(15000);
    expect(wrapper.emitted('clear-toast')).toHaveLength(1);
    expect(wrapper.emitted('clear-error')).toHaveLength(1);
  });

  it('resets the countdown cleanly when a message is replaced', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ToastPopup, {
      props: {
        toastMessage: 'Simpan pertama.',
        errorMessage: null,
      },
    });

    await vi.advanceTimersByTimeAsync(3000);
    await wrapper.setProps({ toastMessage: 'Simpan kedua.' });

    // Old timer would have fired at 4000ms (in 1000ms), new timer needs full 4000ms
    await vi.advanceTimersByTimeAsync(1500);
    expect(wrapper.emitted('clear-toast')).toBeUndefined();

    await vi.advanceTimersByTimeAsync(2600);
    expect(wrapper.emitted('clear-toast')).toHaveLength(1);
  });
});
