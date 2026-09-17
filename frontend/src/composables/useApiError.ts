import { useUiStore } from '../stores/ui.store.js';
import { ApiError } from '../types/api.js';

export interface ApiErrorHandlingOptions {
  /**
   * Callback untuk memetakan error validasi inline ke field form (vee-validate).
   */
  setFieldError?: (field: string, message: string) => void;

  /**
   * Callback saat terjadi HTTP 409 Conflict (SAD §17.5 / §9.9).
   */
  onConflict?: () => void;

  /**
   * Callback saat terjadi HTTP 404 Not Found (SAD §17.5).
   */
  onNotFound?: () => void;

  /**
   * Override pesan Toast default.
   */
  customMessage?: string;
}

/**
 * Composable penanganan error API end-to-end sesuai matriks SAD §17.5.
 */
export function useApiError() {
  const uiStore = useUiStore();

  function handleApiError(err: unknown, options: ApiErrorHandlingOptions = {}): void {
    if (!(err instanceof ApiError)) {
      const fallbackMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      uiStore.showToast(fallbackMessage, 'error');
      return;
    }

    const { statusCode, message, details } = err;

    switch (statusCode) {
      case 400:
      case 422: {
        let fieldMapped = false;
        if (options.setFieldError && Array.isArray(details) && details.length > 0) {
          for (const detail of details) {
            if (detail.field) {
              const errorText =
                typeof detail.reason === 'string'
                  ? detail.reason
                  : typeof (detail as Record<string, unknown>).message === 'string'
                    ? ((detail as Record<string, unknown>).message as string)
                    : message;
              options.setFieldError(detail.field, errorText);
              fieldMapped = true;
            }
          }
        }

        // Jika tidak ada field form yang cocok atau tidak ada setFieldError, tampilkan Toast
        if (!fieldMapped) {
          uiStore.showToast(
            options.customMessage || message || 'Data yang dimasukkan tidak valid',
            'error',
          );
        }
        break;
      }

      case 403: {
        // SAD §17.5: Toast generik "Anda tidak berwenang melakukan aksi ini"
        uiStore.showToast('Anda tidak berwenang melakukan aksi ini', 'error');
        break;
      }

      case 404: {
        // SAD §17.5: Ditangani kontekstual
        if (options.onNotFound) {
          options.onNotFound();
        } else {
          uiStore.showToast(
            options.customMessage || 'Data tidak ditemukan atau berada di luar jangkauan akses Anda',
            'warning',
          );
        }
        break;
      }

      case 409: {
        // SAD §17.5: Toast "Data ini sudah diperbarui oleh proses lain, memuat ulang..." + otomatis refetch
        uiStore.showToast(
          'Data ini sudah diperbarui oleh proses lain, memuat ulang...',
          'warning',
        );
        if (options.onConflict) {
          options.onConflict();
        }
        break;
      }

      case 429: {
        // SAD §17.5: Toast "Terlalu banyak permintaan, coba lagi sebentar lagi"
        uiStore.showToast('Terlalu banyak permintaan, coba lagi sebentar lagi', 'warning');
        break;
      }

      case 500:
      case 502:
      case 503:
      case 504: {
        // SAD §17.5: Toast generik error, tidak menampilkan detail teknis ke user
        uiStore.showToast(
          'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
          'error',
        );
        break;
      }

      default: {
        if (statusCode === 0) {
          uiStore.showToast(
            'Koneksi jaringan terputus. Silakan periksa koneksi internet Anda.',
            'error',
          );
        } else {
          uiStore.showToast(
            options.customMessage || message || 'Terjadi kesalahan pada permintaan',
            'error',
          );
        }
        break;
      }
    }
  }

  return {
    handleApiError,
  };
}
